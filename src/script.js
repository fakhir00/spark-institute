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

/* ============ TECH LAYER ============ */
(function(){
  "use strict";
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll progress bar */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  addEventListener('scroll', function(){
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    bar.style.width = (p * 100).toFixed(2) + '%';
  }, {passive:true});

  /* neural particle network in hero */
  var cv = document.getElementById('net');
  if (cv && !reduced) {
    var ctx = cv.getContext('2d'), W, H, pts = [], mouse = {x:-9999, y:-9999};
    function size(){
      var r = cv.parentElement.getBoundingClientRect();
      W = cv.width = r.width; H = cv.height = r.height;
      var n = W < 768 ? 28 : 64;
      pts = [];
      for (var i = 0; i < n; i++) pts.push({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-.5)*.45, vy: (Math.random()-.5)*.45,
        r: Math.random()*1.8+.7
      });
    }
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('mousemove', function(e){
      var r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    cv.parentElement.addEventListener('mouseleave', function(){ mouse.x = -9999; });
    (function draw(){
      ctx.clearRect(0,0,W,H);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        dx = p.x - mouse.x; dy = p.y - mouse.y; d = Math.hypot(dx,dy);
        if (d < 130 && d > 1) { p.x += dx/d*.9; p.y += dy/d*.9; }
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        for (j = i+1; j < pts.length; j++) {
          q = pts[j]; dx = p.x-q.x; dy = p.y-q.y; d = dx*dx+dy*dy;
          if (d < 150*150) {
            ctx.strokeStyle = 'rgba(124,58,237,'+(0.16*(1-d/22500)).toFixed(3)+')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(90,45,190,.5)';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* terminal typer */
  var typer = document.getElementById('typer');
  if (typer && !reduced) {
    var cmds = [
      'master --skill="AI Automation"',
      'launch --campaign="Meta Ads"',
      'deploy --store="Shopify"',
      'rank --keyword="SEO"',
      'build --site="WordPress"',
      'backtest --strategy="Trading"'
    ], ci = 0, pos = 0, del = false;
    (function tick(){
      var c = cmds[ci];
      typer.textContent = c.slice(0, pos);
      var wait = del ? 28 : 62;
      if (!del && pos === c.length) { wait = 1600; del = true; }
      else if (del && pos === 0) { del = false; ci = (ci+1)%cmds.length; wait = 350; }
      else pos += del ? -1 : 1;
      setTimeout(tick, wait);
    })();
  } else if (typer) { typer.textContent = 'master --skill="AI Automation"'; }

  /* course category filter */
  var fbar = document.querySelector('.filter-bar');
  if (fbar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.ccard'));
    fbar.addEventListener('click', function(e){
      var b = e.target.closest('button'); if (!b) return;
      fbar.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      var f = b.getAttribute('data-filter');
      cards.forEach(function(c){
        c.classList.toggle('hide', f !== 'all' && c.getAttribute('data-cat') !== f);
      });
    });
  }
})();

/* ============ 3D TILT + STAGGER ============ */
(function(){
  "use strict";
  var fine = matchMedia('(pointer:fine)').matches;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* stagger reveal delays inside grids */
  document.querySelectorAll('.course-grid,.pillar-grid,.who-grid,.testi-grid,.eb-grid,.hero-cards,.steps,.why-art').forEach(function(grid){
    grid.querySelectorAll('.rv').forEach(function(el,i){ el.style.transitionDelay = ((i%4)*70)+'ms'; });
  });

  if (!fine || reduced) return;

  /* 3D tilt on cards and art (mouse-driven, desktop only) */
  var targets = [
    ['.ccard', 6], ['.pillar', 4], ['.who-card', 4], ['.testi', 4],
    ['.eb-card', 4], ['.hcard', 4], ['.why-tile', 4], ['.duo-card', 3],
    ['.hero-art', 4], ['.about-art', 4]
  ];
  targets.forEach(function(pair){
    document.querySelectorAll(pair[0]).forEach(function(el){
      var max = pair[1];
      el.classList.add('tilt');
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - .5;
        var py = (e.clientY - r.top)/r.height - .5;
        el.style.transform = 'translateY(-6px) rotateX('+(-py*max).toFixed(2)+'deg) rotateY('+(px*max).toFixed(2)+'deg)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  });
})();
