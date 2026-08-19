(function(){
  "use strict";
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  /* ---------- sign in / sign up switching ---------- */
  function switchForm(name){
    var si = $('#signinForm'), su = $('#signupForm');
    if(si) si.classList.toggle('active', name==='signin');
    if(su) su.classList.toggle('active', name==='signup');
  }
  $$('[data-show]').forEach(btn=>{
    btn.addEventListener('click', ()=> switchForm(btn.dataset.show));
  });

  /* ---------- role toggle (parent / admin) ---------- */
  let currentRole = 'user';
  const roleLabel = $('#signinBtnLabel');
  $$('.role-pill').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.role-pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentRole = btn.dataset.role;
      if(roleLabel){ roleLabel.textContent = currentRole === 'admin' ? 'Sign in as Admin' : 'Sign in as Parent'; }
    });
  });

  /* ---------- password eye toggle ---------- */
  $$('.pw-toggle').forEach(btn=>{
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if(!input) return;
    btn.addEventListener('click', ()=>{
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      const icon = $('i', btn);
      icon.classList.toggle('fa-eye', showing);
      icon.classList.toggle('fa-eye-slash', !showing);
      const val = input.value;
      input.focus();
      input.setSelectionRange && input.setSelectionRange(val.length, val.length);
    });
  });

  /* ---------- name fields: alphabets only ---------- */
  function setupAlphaOnly(inputId, errorId){
    var input = document.getElementById(inputId);
    var err = document.getElementById(errorId);
    if(!input || !err) return;
    input.addEventListener('input', function(){
      var val = this.value;
      if(/[^a-zA-Z\s]/.test(val)){
        err.textContent = 'Only alphabets are allowed';
        this.closest('.input-wrap').classList.add('error');
      }else{
        err.textContent = '';
        this.closest('.input-wrap').classList.remove('error');
      }
    });
  }
  setupAlphaOnly('suFirst', 'suFirstErr');
  setupAlphaOnly('suLast', 'suLastErr');

  /* ---------- email fields: gmail only ---------- */
  function setupGmailOnly(inputId, errorId){
    var input = document.getElementById(inputId);
    var err = document.getElementById(errorId);
    if(!input || !err) return;
    input.addEventListener('input', function(){
      var val = this.value.trim();
      if(val && !/@gmail\.com$/i.test(val)){
        err.textContent = 'Only Gmail addresses are allowed';
        this.closest('.input-wrap').classList.add('error');
      }else{
        err.textContent = '';
        this.closest('.input-wrap').classList.remove('error');
      }
    });
  }
  setupGmailOnly('siEmail', 'siEmailErr');
  setupGmailOnly('suEmail', 'suEmailErr');

  /* ---------- strong password validation ---------- */
  function setupStrongPass(inputId, errorId){
    var input = document.getElementById(inputId);
    var err = document.getElementById(errorId);
    if(!input || !err) return;
    input.addEventListener('input', function(){
      var val = this.value;
      var wrap = this.closest('.input-wrap');
      if(!val){ err.textContent=''; wrap.classList.remove('error'); return; }
      var msgs=[];
      if(val.length < 8) msgs.push('at least 8 characters');
      if(!/[A-Z]/.test(val)) msgs.push('one uppercase letter');
      if(!/[a-z]/.test(val)) msgs.push('one lowercase letter');
      if(!/[0-9]/.test(val)) msgs.push('one number');
      if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) msgs.push('one special character');
      if(msgs.length){
        err.textContent = 'Password must have ' + msgs.join(', ');
        wrap.classList.add('error');
      }else{
        err.textContent = '';
        wrap.classList.remove('error');
      }
    });
  }
  setupStrongPass('suPassword', 'suPassErr');
  setupStrongPass('suConfirm', 'suConfirmErr');

  /* ---------- terms checkbox validation ---------- */
  var termsBox = document.getElementById('suTerms');
  var termsErr = document.getElementById('suTermsErr');
  if(termsBox && termsErr){
    termsBox.addEventListener('change', function(){
      termsErr.textContent = this.checked ? '' : 'You must agree to the Terms & Privacy Policy';
    });
  }

  /* ---------- sign in submit ---------- */
  const formSignin = $('#formSignin');
  formSignin && formSignin.addEventListener('submit', e=>{
    e.preventDefault();
    if(!formSignin.checkValidity()){ formSignin.reportValidity(); return; }
    try{ sessionStorage.setItem('bw_role', currentRole); }catch(err){}
    const emailVal = ($('#siEmail') || {}).value || '';
    const emailPart = emailVal.split('@')[0] || 'User';
    const displayName = emailPart.replace(/[._\-]+/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
    try{ sessionStorage.setItem('bw_user_name', displayName); }catch(err){}
    window.bwToast(currentRole === 'admin' ? 'Welcome back, Admin' : 'Welcome back!', 'fa-circle-check');
    setTimeout(()=>{
      location.href = currentRole === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
    }, 550);
  });

  /* ---------- sign up submit ---------- */
  const formSignup = $('#formSignup');
  formSignup && formSignup.addEventListener('submit', e=>{
    e.preventDefault();
    if(!formSignup.checkValidity()){ formSignup.reportValidity(); return; }
    if(termsBox && !termsBox.checked){
      termsErr.textContent = 'You must agree to the Terms & Privacy Policy';
      return;
    }
    const p1 = $('#suPassword').value, p2 = $('#suConfirm').value;
    if(p1 !== p2){
      window.bwToast('Passwords do not match', 'fa-triangle-exclamation');
      return;
    }
    window.bwToast('Account created — please sign in', 'fa-circle-check');
    setTimeout(()=>{
      location.href = '404.html';
    }, 550);
  });
})();