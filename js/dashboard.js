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
