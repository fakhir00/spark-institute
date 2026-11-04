/* SPARK site interactions */
(function(){
  var header=document.querySelector('header.site');
  addEventListener('scroll',function(){header.classList.toggle('scrolled',scrollY>10)},{passive:true});

  var burger=document.querySelector('.hamburger'),links=document.querySelector('.nav-links');
  burger.addEventListener('click',function(){links.classList.toggle('open')});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open')})});

  var io;
  if('IntersectionObserver' in window){
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  }else{
    document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')});
  }

  // Enroll buttons preselect the course in the form
  var select=document.getElementById('f-course');
  document.querySelectorAll('[data-course]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var c=btn.getAttribute('data-course');
      for(var i=0;i<select.options.length;i++){if(select.options[i].value===c){select.selectedIndex=i;break}}
    });
  });

  // Fake-submit the enrollment form with a success state
  var form=document.getElementById('enroll-form');
  form.addEventListener('submit',function(ev){
    ev.preventDefault();
    var name=document.getElementById('f-name').value.trim().split(' ')[0]||'there';
    document.getElementById('ok-name').textContent=name;
    form.style.display='none';
    document.getElementById('form-ok').style.display='block';
    document.getElementById('form-ok').scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
