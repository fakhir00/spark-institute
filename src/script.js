/* SPARK site interactions */
(function(){
  var header=document.querySelector('header.site');
  if(header){addEventListener('scroll',function(){header.classList.toggle('scrolled',scrollY>10)},{passive:true});}

  var burger=document.querySelector('.hamburger'),links=document.querySelector('.nav-links');
  if(burger){burger.addEventListener('click',function(){links.classList.toggle('open')});
  links.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){links.classList.remove('open')})});}

  /* active nav */
  var page=(location.pathname.split('/').pop()||'index.html').replace('.html','')||'index';
  document.querySelectorAll('[data-nav]').forEach(function(a){
    if(a.getAttribute('data-nav')===page){a.classList.add('active')}
  });

  /* animated counters */
  function countUp(el){
    var target=parseInt(el.getAttribute('data-count'),10)||0,dur=1400,t0=null;
    function fmt(n){return n>=1000?(n/1000).toFixed(1).replace('.0','')+'K':String(n)}
    function tick(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);
      el.textContent=fmt(Math.round(target*e));if(p<1)requestAnimationFrame(tick)}
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);cio.unobserve(e.target)}})},{threshold:.4});
    document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el)});
  }else{document.querySelectorAll('[data-count]').forEach(countUp);}

  /* reveal on scroll (robust: content visible without JS) */
  var reveal=function(){document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')})};
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  }else{reveal();}

  /* course preselect: ?course= param (contact.html) */
  var select=document.getElementById('f-course');
  function pickCourse(name){
    if(!select||!name)return;
    for(var i=0;i<select.options.length;i++){
      if(select.options[i].value.toLowerCase()===String(name).toLowerCase()){select.selectedIndex=i;break}
    }
  }
  try{
    var q=new URLSearchParams(location.search).get('course');
    if(q){pickCourse(q);}
  }catch(e){}

  /* Enroll buttons: stay in-page when the form exists, else go to contact.html?course= */
  document.querySelectorAll('[data-course]').forEach(function(btn){
    btn.addEventListener('click',function(ev){
      var c=btn.getAttribute('data-course');
      if(document.getElementById('enroll-form')){
        ev.preventDefault();
        pickCourse(c);
        document.getElementById('enroll').scrollIntoView({behavior:'smooth'});
      }else{
        btn.setAttribute('href','contact.html?course='+encodeURIComponent(c));
      }
    });
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null});
      if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px'}
    });
  });

  /* enrollment form: front-end success state */
  var form=document.getElementById('enroll-form');
  if(form){form.addEventListener('submit',function(ev){
    ev.preventDefault();
    var name=(document.getElementById('f-name').value.trim().split(' ')[0])||'there';
    document.getElementById('ok-name').textContent=name;
    form.style.display='none';
    var ok=document.getElementById('form-ok');
    ok.style.display='block';
    ok.scrollIntoView({behavior:'smooth',block:'center'});
  });}
})();
