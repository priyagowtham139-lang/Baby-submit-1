(function(){
  "use strict";
  var btn = document.getElementById('goBackBtn');
  if(!btn) return;

  btn.addEventListener('click', function(){
    if(window.history.length > 1){
      history.back();
    }else{
      location.href = 'index.html';
    }
  });
})();
