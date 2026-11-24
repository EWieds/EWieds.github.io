
/* ---------- work a shift in a restaurant you own: seat guests, take orders, cook, serve, get paid ---------- */
var RS=null;
function rsOwned(b){var s=b&&b.key&&W4().biz[b.key];return !!(s&&s.own&&!s.home&&isEatery(b)&&String(b.key).indexOf('speak')!==0);}
function rsSeats(id){var A=AREAS[id],st=ESTYLES[id];if(!st)return [];var ox=IOX[id],out=[];st.tables.forEach(function(t,i){if(i%2===0)return;[-1,1].forEach(function(sd){out.push({x:ox+t[0]+sd,z:t[1],tx:ox+t[0],tz:t[1],ry:sd<0?Math.PI/2:-Math.PI/2,n:out.length+1,c:null});});});return out;}
function rsStart(){var b=CUR_B,id=P.area;if(!rsOwned(b)||RS)return;var seats=rsSeats(id);if(!seats.length){toast('No tables to run here.','');return;}
  var g=new T.Group();dyn.add(g);var m=MENUS[cuisine(b)]||MENUS.diner,s=W4().biz[b.key];
  RS={b:b,id:id,g:g,seats:seats,menu:m,t:0,len:180,spawn:3,cust:[],carry:null,cooking:null,rev:0,tips:0,served:0,walk:0,stars:[],lvl:(s.shifts||0)};
  document.body.classList.add('rs-on');rsHud();popup(b.name+' · shift','You\'re running the floor for 3 minutes.\n1. Greet a guest at their table and take the order.\n2. Go to the kitchen pass (the counter) and cook it. Stop the timer in the green.\n3. Bring it to the table. Fast, good food means bigger tips.\nIf a guest waits too long, they walk out.',[{t:'Open the doors',fn:function(){RS.t=0;}}],'',{});}
function rsHud(){var el=$('#o-rs');if(!el){el=document.createElement('div');el.id='o-rs';document.body.appendChild(el);}if(!RS){el.hidden=true;return;}el.hidden=false;var R=RS,left=Math.max(0,Math.ceil(R.len-R.t));
  el.innerHTML='<div class="rs-top"><b>'+esc(R.b.name)+'</b><span>'+Math.floor(left/60)+':'+('0'+left%60).slice(-2)+'</span><span>'+fmt(R.rev+R.tips)+'</span><button type="button" class="rs-end">End shift</button></div><div class="rs-tk">'+
    R.cust.filter(function(c){return c.st!=='in'&&c.st!=='out';}).map(function(c){var w=c.st==='order'?'wants to order':c.st==='wait'?(R.carry&&R.carry.c===c?'carrying: ':R.cooking&&R.cooking.c===c?'cooking: ':'ordered: ')+c.dish[0]:c.st==='eat'?'eating':'';var p=Math.max(0,c.pat/c.pat0);
    return '<div class="rs-t'+(p<.3?' hot':'')+'"><b>T'+c.seat.n+'</b><span>'+esc(w)+'</span><i style="width:'+Math.round(p*100)+'%"></i></div>';}).join('')+(R.carry?'<div class="rs-carry">🍽 '+esc(R.carry.d[0])+' → table '+R.carry.c.seat.n+'</div>':'')+'</div>';
  el.querySelector('.rs-end').onclick=function(){rsEnd(false);};}
function rsSpawn(){var R=RS,free=R.seats.filter(function(s){return !s.c;});if(!free.length)return;var s=pick(free),A=AREAS[R.id],m=liteMe();m.root.position.set(A.spawn.x,0,A.spawn.z);R.g.add(m.root);
  var c={m:m,seat:s,st:'in',pat0:Math.max(22,40-R.lvl*.5),pat:0,dish:pick(R.menu),mark:null,party:2+Math.floor(Math.random()*3)};c.pat=c.pat0;s.c=c;R.cust.push(c);
  var mk=sp(.16,toon(0xffd24a,{e:0xffd24a,ei:.7}),0,2.2,0,m.root,8);c.mark=mk;mk.visible=false;try{tone(1046,.08,'sine',.02);}catch(e){}}
function rsWalk(c,tx,tz,dt){var p=c.m.root.position,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d<.08)return true;var k=Math.min(d,dt*2.4);p.x+=dx/d*k;p.z+=dz/d*k;c.m.root.rotation.y=Math.atan2(dx,dz);animLite(c.m,dt,true,1.6);return false;}
function updRS(dt){var R=RS;if(!R)return;if(P.area!==R.id){rsEnd(true);return;}if(popOpen()&&R.t===0)return;dt=Math.min(dt,.1);R.t+=dt;R.spawn-=dt;
  if(R.spawn<=0&&R.t<R.len-15){R.spawn=rnd(7,12)*Math.max(.6,1-R.lvl*.02);rsSpawn();}
  R.cust.forEach(function(c){var s=c.seat;
    if(c.st==='in'){if(rsWalk(c,s.x,s.z,dt)){c.st='order';seatLite(c.m);c.m.root.rotation.y=s.ry;c.mark.visible=true;c.mark.material=toon(0xffd24a,{e:0xffd24a,ei:.7});}}
    else if(c.st==='order'||c.st==='wait'){if(!(R.cooking&&R.cooking.c===c))c.pat-=dt;if(c.pat<=0){c.st='out';c.mark.visible=false;c.m.legs[0].rotation.x=c.m.legs[1].rotation.x=0;c.m.body.position.y=0;R.walk++;R.stars.push(1);s.c=null;bubble(c.m.root.position.x,2.4,c.m.root.position.z,pick(['Forget it.','Took too long!','We\'re leaving.']),'bad');if(R.carry&&R.carry.c===c)R.carry=null;}}
    else if(c.st==='eat'){c.eat-=dt;if(c.eat<=0){c.st='out';c.m.legs[0].rotation.x=c.m.legs[1].rotation.x=0;c.m.body.position.y=0;s.c=null;if(c.plate&&c.plate.parent)c.plate.parent.remove(c.plate);var pay=c.dish[1]*c.party*tierM()*(.85+c.q*.3),tip=pay*(.05+c.q*.12+Math.max(0,c.left)*.12);R.rev+=pay;R.tips+=tip;R.served++;var st=Math.max(1,Math.min(5,Math.round(2+c.q*2+c.left*1.5)));R.stars.push(st);bubble(c.m.root.position.x,2.4,c.m.root.position.z,'+'+fmt(pay+tip)+' · '+'★'.repeat(st),'good');try{tone(1318,.1,'sine',.03);}catch(e){}}}
    else if(c.st==='out'){var A=AREAS[R.id];if(rsWalk(c,A.spawn.x,A.spawn.z+1,dt)){c.gone=1;if(c.m.root.parent)c.m.root.parent.remove(c.m.root);}}
    if(c.mark&&c.st!=='out')c.mark.position.y=2.2+Math.sin(R.t*4)*.08;});
  R.cust=R.cust.filter(function(c){return !c.gone;});R.hud=(R.hud||0)-dt;if(R.hud<=0){R.hud=.3;rsHud();}
  if(R.t>=R.len&&!R.cust.some(function(c){return c.st==='eat';}))rsEnd(false);}
function rsActs(){var R=RS;if(!R||P.area!==R.id)return [];var out=[],ox=IOX[R.id];
  R.cust.forEach(function(c){var s=c.seat;if(c.st==='order')out.push({x:s.tx,z:s.tz,r:1.9,label:'Take the order · table '+s.n,sub:'Patience '+Math.ceil(c.pat)+'s',fn:function(){c.st='wait';c.mark.material=toon(0xff8a3d,{e:0xff8a3d,ei:.7});bubble(s.x,2.4,s.z,'"'+c.dish[0]+' for '+c.party+', please."','');try{tone(880,.06,'sine',.02);}catch(e){}rsHud();}});
    if(c.st==='wait'&&R.carry&&R.carry.c===c)out.push({x:s.tx,z:s.tz,r:1.9,label:'Serve '+c.dish[0]+' · table '+s.n,sub:'Quality '+Math.round(R.carry.q*100)+'%',fn:function(){var q=R.carry.q;R.carry=null;c.q=q;c.left=c.pat/c.pat0;c.st='eat';c.eat=rnd(6,9);c.mark.visible=false;c.plate=foodModel(c.dish[0],R.g,s.tx+(s.x<s.tx?-.35:.35),.98,s.tz);rsHud();}});});
  var pend=R.cust.filter(function(c){return c.st==='wait'&&!(R.carry&&R.carry.c===c);});
  if(pend.length&&!R.carry&&!R.cooking)out.push({x:ox+4.2,z:-3.2,r:2.2,label:'Cook '+pend[0].dish[0]+' (table '+pend[0].seat.n+')',sub:pend.length>1?pend.length+' orders in':'Kitchen pass',fn:function(){rsCook(pend[0]);}});
  return out;}
function rsCook(c){var R=RS;R.cooking={c:c};var el=$('#o-rscook');if(!el){el=document.createElement('div');el.id='o-rscook';document.body.appendChild(el);}el.hidden=false;
  var zone=.45+Math.random()*.3,zw=Math.max(.1,.2-R.lvl*.004),t0=performance.now(),spd=.55+Math.random()*.2+R.lvl*.01,done=false;
  el.innerHTML='<div class="rc"><b>Cooking: '+esc(c.dish[0])+'</b><small>Stop it in the green</small><div class="rc-bar"><i class="rc-z" style="left:'+((zone-zw/2)*100)+'%;width:'+(zw*100)+'%"></i><i class="rc-n"></i></div><button type="button">Plate it!</button></div>';
  var n=el.querySelector('.rc-n'),pos=0,raf=function(){if(done)return;var t=(performance.now()-t0)/1000;pos=Math.abs(((t*spd)%2)-1);pos=1-pos;n.style.left=(pos*100)+'%';requestAnimationFrame(raf);};requestAnimationFrame(raf);
  var stop=function(){if(done)return;done=true;var d=Math.abs(pos-zone),q=d<zw/2?1-d/(zw/2)*.25:Math.max(.15,.75-(d-zw/2)*2.2);el.hidden=true;document.removeEventListener('keydown',kd,true);if(!RS)return;R.cooking=null;R.carry={c:c,d:c.dish,q:q};
    bubble(P.x,2.5,P.z,q>.9?'Perfect!':q>.7?'Nice.':q>.45?'Good enough.':'Bit burnt…',q>.7?'good':'');try{tone(q>.7?1318:440,.1,'sine',.03);}catch(e){}rsHud();};
  var kd=function(e){if(e.key===' '||e.key==='Enter'||e.key==='e'){e.preventDefault();e.stopPropagation();stop();}};document.addEventListener('keydown',kd,true);el.querySelector('button').onclick=stop;}
function rsEnd(silent){var R=RS;if(!R)return;RS=null;document.body.classList.remove('rs-on');rsHud();var ck=$('#o-rscook');if(ck)ck.hidden=true;R.seats.forEach(function(s){s.c=null;});if(R.g.parent)R.g.parent.remove(R.g);
  var w=W4(),s=w.biz[R.b.key]||{},tot=R.rev+R.tips,avg=R.stars.length?R.stars.reduce(function(a,b){return a+b;},0)/R.stars.length:0;if(tot>0)cityGain(tot);
  s.shifts=(s.shifts||0)+1;s.best=Math.max(s.best||0,tot);if(avg>=4)s.svc=Math.min(.25,(s.svc||0)+.02);else if(avg&&avg<2.5)s.svc=Math.max(0,(s.svc||0)-.02);addXP(Math.round(10+R.served*3));if(avg>=4.5)addFame(2);syncBizRev();save();
  if(silent)return;popup('Shift report · '+R.b.name,'Guests served: '+R.served+(R.walk?' · walked out: '+R.walk:'')+'\nSales '+fmt(R.rev)+' · tips '+fmt(R.tips)+'\nTotal '+fmt(tot)+(avg?' · '+avg.toFixed(1)+'★ average':'')+'\n'+(avg>=4?'Great service. Word gets around: this place now earns '+Math.round((s.svc||0)*100)+'% more while you\'re away.':avg&&avg<2.5?'Rough night. Reviews dipped a little.':'Solid shift.')+'\nShifts worked here: '+s.shifts+' · best '+fmt(s.best),
    [{t:'Work another shift',fn:rsStart},{t:'Done',cls:'sec'}]);}
