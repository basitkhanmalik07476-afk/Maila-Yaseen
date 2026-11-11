(function(){
  var root=document.documentElement;

  // theme toggle
  document.getElementById('theme').addEventListener('click',function(){
    var dark=root.getAttribute('data-theme')==='dark' ||
      (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme',dark?'light':'dark');
  });

  // mobile menu
  var mbtn=document.getElementById('menu-btn'),panel=document.getElementById('mobile-menu');
  function setMenu(open){
    panel.hidden=!open;
    mbtn.setAttribute('aria-expanded',open?'true':'false');
    mbtn.setAttribute('aria-label',open?'Close menu':'Open menu');
    mbtn.classList.toggle('open',open);
  }
  mbtn.addEventListener('click',function(){setMenu(panel.hidden)});
  panel.querySelectorAll('a.m-link,a.btn').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  document.addEventListener('click',function(e){if(!panel.hidden&&!e.target.closest('nav'))setMenu(false)});
  window.addEventListener('resize',function(){if(window.innerWidth>980)setMenu(false)});

  // marquee: duplicate content for a seamless loop
  var track=document.getElementById('track');
  track.innerHTML+=track.innerHTML;

  // rotating hero word
  (function(){
    var clip=document.getElementById('rot-clip'),word=document.getElementById('rot-word'),line=document.querySelector('#rot-line path');
    if(!clip||!word||!word.animate||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var words=['customers','sales','fans','buyers','leads'],i=0;
    function fit(){clip.style.width=word.getBoundingClientRect().width+'px'}
    function redraw(){
      if(!line)return;
      line.style.animation='none';
      void line.getBoundingClientRect();
      line.style.animation='draw .9s ease forwards';
    }
    fit();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
    window.addEventListener('resize',fit);
    function next(){
      if(document.hidden)return;
      var out=word.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-60%)',opacity:0}],{duration:300,easing:'ease-in',fill:'forwards'});
      out.finished.then(function(){
        i=(i+1)%words.length;
        word.textContent=words[i];
        fit();
        redraw();
        word.animate([{transform:'translateY(60%)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'});
        out.cancel();
      });
    }
    setTimeout(function(){next();setInterval(next,2600)},2600);
  })();

  document.getElementById('yr').textContent=new Date().getFullYear();

  // reveal on scroll, counters
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(el){
    var end=parseFloat(el.dataset.count),suf=el.dataset.suffix||'';
    if(reduce){el.textContent=end+suf;return;}
    var t0=null,dur=1400;
    function tick(t){
      if(!t0)t0=t;
      var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);
      el.textContent=Math.round(end*e)+suf;
      if(p<1)requestAnimationFrame(tick);else el.textContent=end+suf;
    }
    requestAnimationFrame(tick);
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      });
    },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
  }else{
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')});
  }

  // faq accordion
  (function(){
    var items=document.querySelectorAll('.qa');
    items.forEach(function(item){
      var btn=item.querySelector('.q');
      btn.addEventListener('click',function(){
        var wasOpen=item.classList.contains('open');
        items.forEach(function(o){o.classList.remove('open');o.querySelector('.q').setAttribute('aria-expanded','false')});
        if(!wasOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
      });
    });
  })();

  // contact brief
  (function(){
    var form=document.getElementById('brief');
    if(!form)return;
    var start=document.getElementById('c-start'),done=document.getElementById('c-done'),out=document.getElementById('f-out');
    var nameEl=document.getElementById('f-name'),mailEl=document.getElementById('f-email'),siteEl=document.getElementById('f-site'),msgEl=document.getElementById('f-msg');
    var EMAIL=document.getElementById('v-email').textContent.trim();
    document.getElementById('d-mail').textContent=EMAIL;
    function setErr(el,id,text){
      document.getElementById(id).textContent=text||'';
      if(text)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');
    }
    nameEl.addEventListener('input',function(){setErr(nameEl,'e-name','')});
    mailEl.addEventListener('input',function(){setErr(mailEl,'e-email','')});
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var n=nameEl.value.trim(),m=mailEl.value.trim();
      var nameOk=n.length>0,mailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);
      setErr(nameEl,'e-name',nameOk?'':'Please enter your name.');
      setErr(mailEl,'e-email',mailOk?'':'Please enter a valid email address.');
      if(!nameOk){nameEl.focus();return}
      if(!mailOk){mailEl.focus();return}
      var svc=[].map.call(form.querySelectorAll('input[name="svc"]:checked'),function(c){return c.value});
      var lines=['Hi Maila,','','I am '+n+' ('+m+').'];
      if(siteEl.value.trim())lines.push('Brand or website: '+siteEl.value.trim());
      lines.push('I would like help with: '+(svc.length?svc.join(', '):'not sure yet')+'.','');
      lines.push(msgEl.value.trim()||'I would love to talk about growing my brand.');
      lines.push('','Thank you,',n);
      var text=lines.join('\n');
      out.value=text;
      document.getElementById('f-open').href='mailto:'+EMAIL+'?subject='+encodeURIComponent('Project enquiry from '+n)+'&body='+encodeURIComponent(text);
      start.hidden=true;done.hidden=false;
      done.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
    document.getElementById('f-edit').addEventListener('click',function(){
      done.hidden=true;start.hidden=false;nameEl.focus();
    });
    var cp=document.getElementById('f-copy');
    cp.addEventListener('click',function(){
      function ok(){var o=cp.textContent;cp.textContent='Copied';setTimeout(function(){cp.textContent=o},1500)}
      function fb(){out.focus();out.select()}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(out.value).then(ok,fb)}else{fb()}
    });
  })();

  // every email, phone and handle is linked from the text shown on the page
  (function(){
    function txt(id){var el=document.getElementById(id);return el?el.textContent.trim():''}
    var email=txt('ft-email')||txt('v-email'),phone=txt('f-phone')||txt('v-phone');
    var digits=phone.replace(/[^\d]/g,'');
    var mail='mailto:'+email,tel='tel:+'+digits;
    var wa='https://wa.me/'+digits+'?text='+encodeURIComponent('Hi Maila, I found your portfolio and would like to talk about a project.');
    function set(id,href){var el=document.getElementById(id);if(el)el.setAttribute('href',href)}
    set('rr-email',mail);set('f-mail',mail);set('d-mail',mail);
    set('rr-call',tel);set('f-call',tel);
    set('rr-wa',wa);set('f-wa',wa);
    document.querySelectorAll('[data-wa]').forEach(function(a){a.setAttribute('href','https://wa.me/'+digits+'?text='+encodeURIComponent(a.getAttribute('data-wa')))});
    ['f-wa-num','v-wa-num','v-phone'].forEach(function(id){var el=document.getElementById(id);if(el&&phone)el.textContent=phone});
    var ig=txt('v-ig').replace(/^@/,'');if(ig)set('rr-ig','https://www.instagram.com/'+ig);
  })();

  // cursor trail: soft, colourful bubbles
  (function(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    var c=document.createElement('canvas');c.id='trail';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    var ctx=c.getContext('2d'),dpr=Math.min(window.devicePixelRatio||1,2),W=0,H=0;
    function size(){
      W=window.innerWidth;H=window.innerHeight;
      c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    size();window.addEventListener('resize',size);
    var colors=['#E8508A','#D32D6B','#F58FB2','#FFB6CE','#A24FA0','#C58BD6','#8E5BB8','#D9A55B','#F2C879','#FFD966','#FF9A8B','#F7B7C9'];
    var ps=[],running=false,last=0,lx=null,ly=null,acc=0,MAX=140;
    function rnd(a,b){return a+Math.random()*(b-a)}
    function spawn(x,y){
      if(ps.length>=MAX)ps.shift();
      var big=Math.random()<.18;
      ps.push({
        x:x+rnd(-8,8),y:y+rnd(-8,8),
        vx:rnd(-.35,.35),vy:rnd(-.5,.15),
        r:big?rnd(7,12):rnd(2.5,7),
        col:colors[(Math.random()*colors.length)|0],
        a:rnd(.55,.95),
        life:rnd(800,1500),age:0,
        wob:rnd(0,6.28),ws:rnd(.002,.006)
      });
    }
    function frame(t){
      var dt=Math.min(t-last,40);last=t;
      ctx.clearRect(0,0,W,H);
      for(var i=ps.length-1;i>=0;i--){
        var p=ps[i];
        p.age+=dt;
        var k=p.age/p.life;
        if(k>=1){ps.splice(i,1);continue}
        p.wob+=p.ws*dt;
        p.x+=p.vx*dt/16+Math.sin(p.wob)*.25;
        p.y+=p.vy*dt/16;
        p.vy-=.0012*dt/16;
        var fade=k<.15?k/.15:1-(k-.15)/.85;
        ctx.globalAlpha=p.a*fade;
        ctx.fillStyle=p.col;
        ctx.beginPath();
        ctx.arc(p.x,p.y,Math.max(.4,p.r*(1-k*.45)),0,6.2832);
        ctx.fill();
      }
      ctx.globalAlpha=1;
      if(ps.length)requestAnimationFrame(frame);else{running=false;ctx.clearRect(0,0,W,H)}
    }
    document.addEventListener('pointermove',function(e){
      if(e.pointerType==='touch')return;
      if(lx===null){lx=e.clientX;ly=e.clientY}
      acc+=Math.hypot(e.clientX-lx,e.clientY-ly);
      lx=e.clientX;ly=e.clientY;
      while(acc>16){acc-=16;spawn(lx,ly)}
      if(!running){running=true;last=performance.now();requestAnimationFrame(frame)}
    },{passive:true});
    document.addEventListener('pointerleave',function(){lx=null;ly=null;acc=0});
    document.addEventListener('visibilitychange',function(){if(document.hidden){ps.length=0}});
  })();

  // copy buttons
  document.querySelectorAll('.copy').forEach(function(btn){
    btn.addEventListener('click',function(){
      var el=document.getElementById(btn.dataset.target),txt=el.textContent;
      function done(){var o=btn.textContent;btn.textContent='Copied';setTimeout(function(){btn.textContent=o},1400)}
      function fallback(){
        var r=document.createRange();r.selectNodeContents(el);
        var s=window.getSelection();s.removeAllRanges();s.addRange(r);
      }
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(done,fallback);
      }else{fallback()}
    });
  });
})();
