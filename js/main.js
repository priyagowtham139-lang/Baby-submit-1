/* =========================================================
   BLOOMWICK — shared site behaviour
   ========================================================= */
(function(){
  "use strict";

  /* ---------- helpers ---------- */
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  /* ---------- active nav link highlight ---------- */
  function markActive(){
    const file = (location.pathname.split('/').pop() || 'index.html');
    $$('.main-nav a, .mobile-nav a').forEach(a=>{
      const href = (a.getAttribute('href')||'').split('/').pop();
      if(href === file){ a.classList.add('active'); }
    });
  }

  /* ---------- mobile nav drawer ---------- */
  function initMobileNav(){
    const burger = $('#hamburger');
    const drawer = $('#mobileNav');
    if(!burger || !drawer) return;
    const closeBtn = $('#mobileNavClose', drawer);
    const scrim = $('.scrim', drawer);

    let scrollY = 0;
    function open(){
      scrollY = window.scrollY;
      drawer.classList.add('open');
      burger.classList.add('open');
      burger.setAttribute('aria-expanded','true');
      document.body.style.overflow='hidden';
      document.body.style.position='fixed';
      document.body.style.top = -scrollY+'px';
      document.body.style.width='100%';
    }
    function close(){
      drawer.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
      document.body.style.position='';
      document.body.style.top='';
      document.body.style.width='';
      window.scrollTo(0, scrollY);
    }
    burger.addEventListener('click', ()=> drawer.classList.contains('open') ? close() : open());
    closeBtn && closeBtn.addEventListener('click', close);
    scrim && scrim.addEventListener('click', close);
    $$('.mobile-nav a').forEach(a=>a.addEventListener('click', close));
    window.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
    window.addEventListener('resize', ()=>{ if(window.innerWidth>1080) close(); });
  }

  /* ---------- header shrink/shadow on scroll ---------- */
  function initHeaderScroll(){
    const header = $('.site-header');
    if(!header) return;
    let ticking=false;
    function onScroll(){
      if(!ticking){
        window.requestAnimationFrame(()=>{
          header.style.boxShadow = window.scrollY > 12 ? '0 12px 30px -20px rgba(43,43,40,.35)' : 'none';
          ticking=false;
        });
        ticking=true;
      }
    }
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ---------- scroll reveal ---------- */
  function initReveal(){
    const items = $$('.reveal, .reveal-scale, .stagger');
    if(!items.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },{threshold:.15, rootMargin:'0px 0px -60px 0px'});
    items.forEach(el=>io.observe(el));
    $$('.stagger').forEach(group=>{
      Array.from(group.children).forEach((child,i)=> child.style.setProperty('--i', i));
    });
  }

  /* ---------- spotlight cursor tracking ---------- */
  function initSpotlight(){
    $$('.spotlight-card').forEach(card=>{
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX-r.left)+'px');
        card.style.setProperty('--my', (e.clientY-r.top)+'px');
      });
    });
  }

  /* ---------- 3D tilt ---------- */
  function initTilt(){
    $$('.tilt-card').forEach(card=>{
      const inner = $('.tilt-inner', card) || card;
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - .5;
        const py = (e.clientY - r.top)/r.height - .5;
        inner.style.transform = `rotateY(${px*14}deg) rotateX(${py*-14}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', ()=>{ inner.style.transform='rotateY(0) rotateX(0)'; });
    });
  }

  /* ---------- footer accordion (mobile) ---------- */
  function initFooterAccordion(){
    $$('.footer-col h5').forEach(h=>{
      h.addEventListener('click', ()=>{
        if(window.innerWidth>900) return;
        h.parentElement.classList.toggle('open');
      });
    });
  }

  /* ---------- footer social -> 404, remembering exact origin section ---------- */
  function initSocialTo404(){
    $$('[data-social-404]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        rememberPosition();
        location.href = getRootPath()+'404.html';
      });
    });
  }

  function getRootPath(){
    // works whether pages sit at root or in a subfolder
    return './';
  }

  function rememberPosition(){
    try{
      sessionStorage.setItem('bw_prev_url', location.pathname + location.search);
      sessionStorage.setItem('bw_prev_title', document.title);
    }catch(err){}
  }

  /* Catch ANY outbound link click site-wide so a 404 opened from
     anywhere always knows exactly where to return to. */
  function initGlobalPositionMemory(){
    document.addEventListener('click', (e)=>{
      const a = e.target.closest('a[href]');
      if(!a) return;
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      rememberPosition();
    }, true);
  }

  /* ---------- back to top ---------- */
  function initBackToTop(){
    const btn = $('.to-top');
    if(!btn) return;
    window.addEventListener('scroll', ()=>{
      btn.classList.toggle('show', window.scrollY > 600);
    }, {passive:true});
    btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
  }

  /* ---------- toast ---------- */
  window.bwToast = function(msg, icon){
    let toast = $('#bwToast');
    if(!toast){
      toast = document.createElement('div');
      toast.id='bwToast'; toast.className='toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid ${icon||'fa-circle-check'}"></i><span>${msg}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=> toast.classList.remove('show'), 2400);
  };

  /* ---------- cart / wishlist with localStorage ---------- */
  function getCart(){ try { return JSON.parse(localStorage.getItem('bw_cart')) || []; } catch(e){ return []; } }
  function setCart(arr){ localStorage.setItem('bw_cart', JSON.stringify(arr)); }
  function getWish(){ try { return JSON.parse(localStorage.getItem('bw_wish')) || []; } catch(e){ return []; } }
  function setWish(arr){ localStorage.setItem('bw_wish', JSON.stringify(arr)); }

  function updateBadges(){
    const cartBadge = $('#cartBadge');
    const wishBadge = $('#wishBadge');
    const cartBadgeMob = $('#cartBadgeMob');
    const wishBadgeMob = $('#wishBadgeMob');
    if(cartBadge) cartBadge.textContent = getCart().length;
    if(wishBadge) wishBadge.textContent = getWish().length;
    if(cartBadgeMob) cartBadgeMob.textContent = getCart().length;
    if(wishBadgeMob) wishBadgeMob.textContent = getWish().length;
  }

  function getProductData(card){
    const img = $('img', card);
    const title = $('h4', card);
    const price = $('.now', card);
    return {
      name: title ? title.textContent.trim() : '',
      price: price ? price.textContent.trim() : '',
      image: img ? img.getAttribute('src') : ''
    };
  }

  function initCounters(){
    updateBadges();
    $$('.product-actions [data-cart]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const card = btn.closest('.product-card');
        if(!card) return;
        const data = getProductData(card);
        const cart = getCart();
        const existing = cart.find(i => i.name === data.name);
        if(existing){ existing.qty = (existing.qty || 1) + 1; }
        else { data.qty = 1; cart.push(data); }
        setCart(cart);
        updateBadges();
        window.bwToast('Added to your bag', 'fa-bag-shopping');
      });
    });
    $$('.product-actions [data-wish]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const card = btn.closest('.product-card');
        if(!card) return;
        const data = getProductData(card);
        const wish = getWish();
        const idx = wish.findIndex(i => i.name === data.name);
        if(idx > -1){
          wish.splice(idx, 1);
          btn.classList.remove('active-wish');
          window.bwToast('Removed from wishlist', 'fa-heart');
        } else {
          wish.push(data);
          btn.classList.add('active-wish');
          window.bwToast('Saved to wishlist', 'fa-heart');
        }
        setWish(wish);
        updateBadges();
      });
    });
    $$('.product-actions [data-wish]').forEach(btn=>{
      const card = btn.closest('.product-card');
      if(!card) return;
      const data = getProductData(card);
      const wish = getWish();
      if(wish.find(i => i.name === data.name)){ btn.classList.add('active-wish'); }
    });
  }

  function initCartPage(){
    const grid = $('#cartGrid');
    const summary = $('#cartSummary');
    if(!grid) return;
    const cart = getCart();
    if(cart.length === 0){
      grid.innerHTML = '<p style="text-align:center; color:var(--ink-soft); grid-column:1/-1; padding:60px 0;">Your bag is empty. <a href="shop.html" style="color:var(--pink);">Start shopping</a></p>';
      if(summary) summary.style.display='none';
      return;
    }
    grid.innerHTML = cart.map((item, i) => `
      <article class="product-card" style="position:relative;">
        <div class="product-media">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="product-info">
          <h4>${item.name}</h4>
          <div class="product-price"><span class="now">${item.price}</span></div>
          <div style="display:flex; align-items:center; gap:10px; margin-top:10px;">
            <button class="btn btn-outline" style="padding:6px 12px; font-size:12px;" onclick="bwChangeQty(${i},-1)"><i class="fa-solid fa-minus"></i></button>
            <span style="font-weight:600;">${item.qty || 1}</span>
            <button class="btn btn-outline" style="padding:6px 12px; font-size:12px;" onclick="bwChangeQty(${i},1)"><i class="fa-solid fa-plus"></i></button>
          </div>
          <button class="btn btn-outline" style="margin-top:10px; padding:6px 12px; font-size:12px; color:#e74c3c; border-color:#e74c3c;" onclick="bwRemoveFromCart(${i})"><i class="fa-solid fa-trash"></i> Remove</button>
        </div>
      </article>
    `).join('');
    const total = cart.reduce((s, i) => s + parseFloat(i.price.replace('$','')) * (i.qty || 1), 0);
    const totalEl = $('#cartTotal');
    if(totalEl) totalEl.textContent = '$' + total.toFixed(2);
    if(summary) summary.style.display='';
  }
  window.bwChangeQty = function(idx, dir){
    const cart = getCart();
    if(!cart[idx]) return;
    cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + dir);
    setCart(cart);
    initCartPage();
    updateBadges();
  };
  window.bwRemoveFromCart = function(idx){
    const cart = getCart();
    cart.splice(idx, 1);
    setCart(cart);
    initCartPage();
    updateBadges();
  };

  function initWishPage(){
    const grid = $('#wishGrid');
    if(!grid) return;
    const wish = getWish();
    if(wish.length === 0){
      grid.innerHTML = '<p style="text-align:center; color:var(--ink-soft); grid-column:1/-1; padding:60px 0;">Your wishlist is empty. <a href="shop.html" style="color:var(--pink);">Discover products</a></p>';
      return;
    }
    grid.innerHTML = wish.map((item, i) => `
      <article class="product-card" style="position:relative;">
        <div class="product-media">
          <div class="product-actions" style="opacity:1; transform:none;">
            <button data-wish-remove="${i}" aria-label="Remove from wishlist" class="active-wish"><i class="fa-solid fa-heart"></i></button>
          </div>
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="product-info">
          <h4>${item.name}</h4>
          <div class="product-price"><span class="now">${item.price}</span></div>
          <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" style="padding:8px 16px; font-size:13px;" onclick="bwMoveToCart(${i})"><i class="fa-solid fa-bag-shopping"></i> Move to bag</button>
            <button class="btn btn-outline" style="padding:8px 16px; font-size:13px; color:#e74c3c; border-color:#e74c3c;" onclick="bwRemoveFromWish(${i})"><i class="fa-solid fa-trash"></i> Remove</button>
          </div>
        </div>
      </article>
    `).join('');
    grid.querySelectorAll('[data-wish-remove]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-wish-remove'), 10);
        bwRemoveFromWish(idx);
      });
    });
  }
  window.bwMoveToCart = function(idx){
    const wish = getWish();
    const item = wish.splice(idx, 1)[0];
    setWish(wish);
    const cart = getCart();
    const existing = cart.find(i => i.name === item.name);
    if(existing){ existing.qty = (existing.qty || 1) + 1; }
    else { item.qty = 1; cart.push(item); }
    setCart(cart);
    initWishPage();
    updateBadges();
    window.bwToast('Moved to bag', 'fa-bag-shopping');
  };
  window.bwRemoveFromWish = function(idx){
    const wish = getWish();
    wish.splice(idx, 1);
    setWish(wish);
    initWishPage();
    updateBadges();
  };

  /* ---------- inline video play ---------- */
  function initVideoFrames(){
    $$('.video-frame').forEach(frame=>{
      const btn = $('.play-btn', frame);
      const vid = $('video', frame);
      if(!btn || !vid) return;
      btn.addEventListener('click', ()=>{
        vid.play();
        frame.classList.add('playing');
      });
      vid.addEventListener('pause', ()=> frame.classList.remove('playing'));
      vid.addEventListener('click', ()=>{ if(!vid.paused){ vid.pause(); } });
    });
  }

  /* ---------- newsletter demo ---------- */
  function initNewsletter(){
    $$('form[data-newsletter]').forEach(f=>{
      const input = $('input[type="email"]', f);
      const err = f.parentElement.querySelector('[data-newsletter-error]');
      if(input && err){
        input.addEventListener('input', ()=>{
          if(input.value && !/^[^\s@]+@gmail\.com$/i.test(input.value)){
            err.style.display='block';
            input.style.borderColor='#e74c3c';
          } else {
            err.style.display='none';
            input.style.borderColor='';
          }
        });
      }
      f.addEventListener('submit', e=>{
        e.preventDefault();
        if(input && !/^[^\s@]+@gmail\.com$/i.test(input.value)){
          err.style.display='block';
          input.style.borderColor='#e74c3c';
          return;
        }
        window.location.href = '404.html';
      });
    });
  }

  /* ---------- faq accordion ---------- */
  function initFaq(){
    $$('.faq-item').forEach(item=>{
      const q = $('.faq-q', item);
      q && q.addEventListener('click', ()=> item.classList.toggle('open'));
    });
  }

  /* ---------- filter chip toggling (visual only) ---------- */
  function initFilterChips(){
    $$('.filter-chips').forEach(group=>{
      $$('button', group).forEach(btn=>{
        btn.addEventListener('click', ()=>{
          $$('button', group).forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.textContent.trim().toLowerCase();
          const grid = group.closest('.filter-bar').parentElement.querySelector('.product-grid');
          if(!grid) return;
          $$('.product-card', grid).forEach(card=>{
            const cat = ($('.p-cat', card)?.textContent||'').trim().toLowerCase();
            if(filter === 'all' || cat === filter){
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
          if(filter === 'all'){
            grid.style.display = '';
            grid.style.flexWrap = '';
            grid.style.justifyContent = '';
            grid.style.gap = '';
          } else {
            grid.style.display = 'flex';
            grid.style.flexWrap = 'wrap';
            grid.style.justifyContent = 'center';
            grid.style.gap = '22px';
          }
          window.bwToast(`Filtering: ${btn.textContent.trim()}`, 'fa-filter');
        });
      });
    });
  }

  /* ---------- generic contact/demo form submit ---------- */
  function initDemoForms(){
    const cf = $('#contactForm');
    if(cf){
      const nameInput = $('#cName', cf);
      const nameErr = $('#cNameError');
      if(nameInput && nameErr){
        nameInput.addEventListener('input', ()=>{
          const val = nameInput.value;
          if(/[^a-zA-Z\s]/.test(val)){
            nameErr.style.display='block';
            nameInput.style.borderColor='#e74c3c';
            nameInput.value = val.replace(/[^a-zA-Z\s]/g, '');
          } else {
            nameErr.style.display='none';
            nameInput.style.borderColor='';
          }
        });
      }
      const emailInput = $('#cEmail', cf);
      const emailErr = $('#cEmailError');
      if(emailInput && emailErr){
        emailInput.addEventListener('input', ()=>{
          if(emailInput.value && !/^[^\s@]+@gmail\.com$/i.test(emailInput.value)){
            emailErr.style.display='block';
            emailInput.style.borderColor='#e74c3c';
          } else {
            emailErr.style.display='none';
            emailInput.style.borderColor='';
          }
        });
      }
      cf.addEventListener('submit', e=>{
        e.preventDefault();
        if(nameInput && /[^a-zA-Z\s]/.test(nameInput.value)){
          nameErr.style.display='block';
          nameInput.style.borderColor='#e74c3c';
          return;
        }
        if(emailInput && !/^[^\s@]+@gmail\.com$/i.test(emailInput.value)){
          emailErr.style.display='block';
          emailInput.style.borderColor='#e74c3c';
          return;
        }
        window.location.href = '404.html';
      });
    }
  }

  function initHeroSlideshow(){
    const slides = document.querySelectorAll('.hero-slide');
    if(slides.length < 2) return;
    let current = 0;
    setInterval(()=>{
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 2000);
  }

  function initStatsAnimation(){
    const nums = $$('.stat .num[data-target]');
    if(!nums.length) return;
    const animate = (el)=>{
      const target = parseInt(el.dataset.target,10);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();
      const step = (now)=>{
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if(progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(n => observer.observe(n));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    markActive();
    initMobileNav();
    initHeaderScroll();
    initReveal();
    initSpotlight();
    initTilt();
    initFooterAccordion();
    initSocialTo404();
    initGlobalPositionMemory();
    initBackToTop();
    initCounters();
    initCartPage();
    initWishPage();
    initVideoFrames();
    initNewsletter();
    initFaq();
    initFilterChips();
    initDemoForms();
    initHeroSlideshow();
    initStatsAnimation();
  });
})();
