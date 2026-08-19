(function(){
  "use strict";
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  function showPanel(name){
    $$('.dash-nav [data-panel]').forEach(b=> b.classList.toggle('active', b.dataset.panel===name));
    $$('.dash-panel').forEach(p=> p.classList.toggle('active', p.id === 'panel-'+name));
    const title = $('#dashPanelTitle');
    const active = $(`.dash-nav [data-panel="${name}"]`);
    if(title && active){ title.textContent = active.dataset.title || active.textContent.trim(); }
    try{ sessionStorage.setItem('bw_dash_panel', name); }catch(err){}
  }

  $$('.dash-nav [data-panel]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      showPanel(btn.dataset.panel);
      closeDrawer();
    });
  });

  /* mobile drawer */
  const burger = $('#dashHamburger');
  const drawer = $('#dashDrawer');
  const scrim = $('#dashScrim');

  let savedScroll = 0;
  function openDrawer(){
    if(!burger || !drawer) return;
    savedScroll = window.scrollY;
    drawer.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    document.body.style.position='fixed';
    document.body.style.top = -savedScroll+'px';
    document.body.style.width='100%';
  }
  function closeDrawer(){
    if(!burger || !drawer) return;
    drawer.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    document.body.style.position='';
    document.body.style.top='';
    document.body.style.width='';
    window.scrollTo(0, savedScroll);
  }

  burger && burger.addEventListener('click', ()=>{
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  scrim && scrim.addEventListener('click', closeDrawer);
  window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeDrawer(); });
  window.addEventListener('resize', ()=>{ if(window.innerWidth>900) closeDrawer(); });

  document.addEventListener('DOMContentLoaded', ()=>{
    let start = 'overview';
    try{
      const saved = sessionStorage.getItem('bw_dash_panel');
      if(saved && $('#panel-'+saved)) start = saved;
    }catch(err){}
    showPanel(start);

    try{
      var uname = sessionStorage.getItem('bw_user_name');
      if(uname){
        var initials = uname.split(' ').map(function(w){ return w.charAt(0); }).join('').toUpperCase();
        $$('.dash-avatar').forEach(function(el){ el.textContent = initials; });
        $$('.dash-profile h5').forEach(function(el){ el.textContent = uname; });
        var welcome = $('.dash-topbar p');
        if(welcome && welcome.textContent.indexOf('Welcome back') !== -1){
          var firstName = uname.split(' ')[0];
          welcome.textContent = 'Welcome back, ' + firstName + ' \u2014 here\'s what\'s happening with your account.';
        }
        var dName = $('#dName');
        if(dName) dName.value = uname;
        var addressPs = $$('.address-card p');
        addressPs.forEach(function(p){
          if(p.querySelector && p.querySelector('br') && p.childNodes.length){
            var first = p.childNodes[0];
            if(first && first.nodeType === 3){
              var oldName = first.textContent.trim();
              if(oldName && oldName !== uname){
                first.textContent = uname + '\n';
              }
            }
          }
        });
      }
    }catch(err){}
  });

  /* logout demo */
  $$('[data-logout]').forEach(el=>{
    el.addEventListener('click', e=>{
      e.preventDefault();
      window.bwToast('You have been signed out', 'fa-right-from-bracket');
      setTimeout(()=> location.href='login.html', 500);
    });
  });
})();
