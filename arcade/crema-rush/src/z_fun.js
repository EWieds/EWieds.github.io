
/* ---------- the Play Zone: six-lane bowling, real claw machines, an arcade full of kids, a ball pit, a party room, tickets and a prize wall ---------- */
var ARC_X=[{id:'hockey',n:'Air Hockey',d:'Beat the kid. First to 5',col:0x2f5f90,scr:0x31e0ff,table:1},{id:'whack',n:'Whack-a-Bean',d:'Bonk the beans',col:0x8a5a3a,scr:0xffd24a},{id:'hockey2',n:'Air Hockey Pro',d:'Faster puck',col:0xe2553f,scr:0xff8a3d,table:1}];
var KIDS=[],LANES=[],CLAWS=[],BOWL=null,CLAW3=null,FUNSCR=null;
function tix(){var w=W4();w.arc=w.arc||{tix:0,hi:{}};return w.arc;}
function addTix(n,why){var a=tix();a.tix=(a.tix||0)+Math.max(0,Math.round(n));var el=$('#o-tix');if(el){el.innerHTML='🎟️ <b>'+a.tix+'</b>';el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');}if(n>0)bubble(P.x,2.8,P.z,'+'+Math.round(n)+' 🎟️','good');save();}
function funRoom(){var g=room('fun',{name:'Play Zone',w:46,d:32,floor:floorT(0x1a1430,0x221a3e,3),tile:3,wall:0x2a1a3a,trim:0xff3d8a,bg:0x0a0612,h:7,cam:{dist:10,pitch:.72},outside:0x1a1430}),ox=IOX.fun;
  var out=ACTS.fun[0];out.label='Back to the mall';out.sub='Level 2';out.fn=function(){goArea('mall2',IOX.mall+25,-11.4,0);};
  var dg=new T.Group();dg.position.x=ox;dyn.add(dg);
  // carpet stars and neon strips
  for(var st=0;st<60;st++){var s=plane(.18,.18,toon([0xff3d8a,0x31e0ff,0xffd24a,0x8affd2][st%4],{e:[0xff3d8a,0x31e0ff,0xffd24a,0x8affd2][st%4],ei:.6}),-22+((st*37)%44),.03,-15+((st*53)%30),g);s.rotation.x=-Math.PI/2;s.rotation.z=st;}
  [[-16,0xff3d8a],[16,0x31e0ff]].forEach(function(q){bx(30,.1,.1,toon(q[1],{e:q[1],ei:1}),0,6.4,q[0]===-16?-15.8:15.8,g);});
  wallSign(g,'PLAY ZONE',0,5.4,-15.8,{bg:'#7a5ad8',fg:'#fff',w:9,h:1.4,sub:'BOWL · PLAY · WIN'});
  // ===== bowling: six lanes on the west side
  LANES=[];for(var i=0;i<6;i++){var lx=-20.5+i*2.5,L={i:i,x:ox+lx,lx:lx};var lane=plane(1.3,18,toon(0xd8b48a),lx,.035,-5,g);lane.rotation.x=-Math.PI/2;
    [-.8,.8].forEach(function(o){var gt=plane(.3,18,toon(0x3a3f4b),lx+o,.03,-5,g);gt.rotation.x=-Math.PI/2;});for(var ar=0;ar<7;ar++){var a1=plane(.06,.25,toon(0x8a5a3a),lx-.45+ar*.15,.04,-1.6,g);a1.rotation.x=-Math.PI/2;}
    bx(1.6,.5,.5,toon(0x3a3f4b),lx+1.25,.25,3.2,g);if(i<5)bx(.24,.12,18,toon(0x2a1a3a),lx+1.25,.06,-5,g);
    var pg=new T.Group();pg.position.set(lx,0,-13.4);dg.add(pg);L.pins=pinSet(pg);L.pg=pg;bx(1.9,1.6,.6,toon(0x111111),lx,2.2,-14.6,g);
    var ball=sp(.2,toon([0x2a3a6a,0xe2553f,0x6a2a8a,0x2fa860,0xffc63d,0x111111][i]),0,.2,2,dg,12);ball.position.x=lx;L.ball=ball;
    var mon=document.createElement('canvas');mon.width=256;mon.height=128;var mt=new T.CanvasTexture(mon);mt.encoding=T.sRGBEncoding;var mp=plane(1.8,.9,new T.MeshBasicMaterial({map:mt}),lx,3.6,3.4,dg);mp.rotation.x=.25;L.mon={c:mon,t:mt};drawMon(L,i===0?'LANE 1':'LANE '+(i+1),i===0?'Your lane':pick(['The Parks','Birthday crew','League night','Team Pinheads','Grandpa Lou']));
    if(i>0){var bw=liteMe();bw.root.position.set(lx,0,3.6);bw.root.rotation.y=Math.PI;dg.add(bw.root);L.bowler=bw;L.t=rnd(0,6);anim.push({fn:laneAI(L),obj:pg});}
    addCol(ox+lx-.9,ox+lx+.9,-14.4,1.2,'fun');LANES.push(L);}
  bx(16,.5,3,toon(0x3a1a4a),-13,.25,6.4,g);for(var bs=0;bs<6;bs++){bx(1.6,.5,.7,toon(0xff3d8a),-20.5+bs*2.5,.6,7,g);}
  ACTS.fun.push({x:LANES[0].x,z:2.6,r:1.6,label:'Bowl a game · lane 1',sub:function(){return '$5 · 5 frames · high score '+(tix().hi.bowl||0);},fn:function(){startBowl(false);}});
  ACTS.fun.push({x:ox-13,z:8.2,r:2,label:'Shoe rental',sub:'You\'ll need these',fn:function(){bubble(P.x,2.6,P.z,'Size 10, please.','');try{tone(520,.06,'sine',.03);}catch(e){}}});
  // ===== claw machines along the north wall
  CLAWS=[];[[3,0xff79b4],[6,0x46a9e6],[9,0xffd24a],[12,0x6cc76a]].forEach(function(q,k){var c=clawModel(dg,q[0],-13.6,q[1],k);CLAWS.push(c);addCol(ox+q[0]-.9,ox+q[0]+.9,-14.6,-12.6,'fun');
    ACTS.fun.push({x:ox+q[0],z:-11.8,r:1.1,label:['Plush Party','Mega Claw','Bean Grabber','Lucky Claw'][k],sub:'$2 a try · '+c.n+' prizes inside',fn:function(){startClaw(c);}});});
  commCabs(g,ox);
  // ===== the arcade: the original cabinets plus new ones
  var cabs=ARC_CAB.concat(ARC_X);
  cabs.forEach(function(c,i){var col=i%6,row=Math.floor(i/6),cx=4+col*2.8,cz=-6.5+row*5,face=row===0?Math.PI:0,cab=new T.Group();cab.position.set(cx,0,cz);cab.rotation.y=face;g.add(cab);
    if(c.table){rb(2,.85,1.3,.06,toon(c.col),0,.43,0,cab);bx(1.9,.04,1.2,toon(0xffffff),0,.88,0,cab);bx(.04,.05,1.2,toon(0xe2553f),0,.9,0,cab);}else{rb(1.3,2.2,1,.06,toon(c.col),0,1.1,0,cab);plane(1,.75,toon(c.scr,{e:c.scr,ei:.9}),0,1.55,.51,cab);bx(1.1,.12,.5,toon(0x1a1a1a),0,1.05,.6,cab);plane(1.2,.3,flat(0xffffff,{map:signT(c.n.toUpperCase(),{bg:'#000',fg:'#ffd24a',w:256,h:64})}),0,2.05,.51,cab);}
    addCol(ox+cx-.8,ox+cx+.8,cz-.7,cz+.7,'fun');ACTS.fun.push({x:ox+cx,z:cz+(row===0?-1.3:1.3),r:1.1,label:c.n,sub:c.d+(c.id==='broken'?'':' · $1'),fn:function(){startArcade(c.id);}});});
  // skee-ball row
  for(var sk=0;sk<4;sk++){var sg=new T.Group();sg.position.set(4+sk*2,0,5.6);g.add(sg);bx(1.4,.6,4,toon(0x7a5ad8),0,.3,-1.4,sg);var ramp=bx(1.2,.1,3,toon(0xd8b48a),0,.75,-1,sg);ramp.rotation.x=-.25;bx(1.4,2.2,.4,toon(0xffd24a),0,1.4,-3.4,sg);for(var h=0;h<4;h++)cy(.15+h*.05,.15+h*.05,.06,toon(0x1a1a1a),0,1.5+h*.25,-3.18,sg,10).rotation.x=Math.PI/2;
    addCol(ox+4+sk*2-.7,ox+4+sk*2+.7,1.6,5.8,'fun');}
  ACTS.fun.push({x:ox+7,z:7,r:2.4,label:'Skee-ball',sub:'Roll for the 100',fn:function(){startArcade(pick(['skee','skee2']));}});
  // ===== prize counter and prize wall (east)
  counterTop(g,19,-3,5,0x7a5ad8,0xf4efe6);npc(g,19,-3.8,0,{shirt:0x7a5ad8});addCol(ox+16.4,ox+21.6,-3.5,-2.5,'fun');
  for(var pr=0;pr<30;pr++){var px=17+(pr%10)*.5,py=1+Math.floor(pr/10)*.8;if(pr%3===0)sp(.2,toon([0xff79b4,0x46a9e6,0xffd24a,0x6cc76a,0xb39ddb][pr%5]),px,py+.2,-5.6,g,8);else if(pr%3===1)bx(.3,.4,.2,toon([0xe2553f,0x2f5f90,0xffc63d][pr%3]),px,py+.2,-5.6,g);else cy(.12,.15,.4,toon(0xffd24a,{e:0x8a6a10,ei:.4}),px,py+.2,-5.6,g,8);}
  bx(5.6,3,.3,toon(0xffffff),19,1.6,-5.9,g);wallSign(g,'PRIZES',19,3.6,-5.7,{bg:'#ff3d8a',fg:'#fff',w:3,h:.7});
  ACTS.fun.push({x:ox+19,z:-1.6,r:2,label:'Prize counter',sub:function(){return tix().tix+' tickets';},fn:prizeWall});
  ACTS.fun.push({x:ox+15,z:-.2,r:1.2,label:'Ticket muncher',sub:'Feeds your tickets into your card',fn:function(){bubble(P.x,2.6,P.z,'*munch munch*','');try{for(var m=0;m<5;m++)tone(300+m*80,.05,'square',.02,m*.06);}catch(e){}toast(tix().tix+' tickets on your card.','good');}});
  // ===== ball pit and soft play (south-east)
  var pitM=[0xff3d8a,0x31e0ff,0xffd24a,0x6cc76a,0xff8a3d].map(function(c){return toon(c);});bx(10,.6,.3,toon(0xff8a3d),15,.3,8.2,g);bx(10,.6,.3,toon(0xff8a3d),15,.3,14.4,g);bx(.3,.6,6.2,toon(0xff8a3d),10,.3,11.3,g);bx(.3,.6,6.2,toon(0xff8a3d),20,.3,11.3,g);
  for(var bp=0;bp<260;bp++)sp(.16,pitM[bp%5],10.3+Math.random()*9.4,.18+Math.random()*.35,8.5+Math.random()*5.6,g,6);
  bx(2,3,2,toon(0x46a9e6),18.6,1.5,13,g);var sl=bx(1,.12,4,toon(0xffd24a),16.6,1.5,13,g);sl.rotation.x=.6;sl.rotation.y=Math.PI/2;addCol(ox+10,ox+20,8,14.6,'fun');
  ACTS.fun.push({x:ox+15,z:7.2,r:2,label:'The ball pit',sub:'Grown-ups allowed (barely)',fn:function(){fade(function(){var w=W4();w.f=w.f||{};w.f.pit=(w.f.pit||0)+1;bubble(P.x,2.6,P.z,'WHEEE','good');if(w.f.pit===3&&!w.f.pitFind){w.f.pitFind=1;var c=Math.round(150*tierM());G.cash+=c;note('Something at the bottom','Under a few thousand plastic balls: a wallet. No ID. '+fmt(c)+' and a Play Zone VIP card.','good');addTix(100);}save();});}});
  // ===== party room (south-west)
  bx(.3,3,6,toon(0x3a1a4a),-9.5,1.5,11.5,g);bx(10,3,.3,toon(0x3a1a4a),-15,1.5,8.6,g);var pt=new T.Group();pt.position.set(-15,0,12);g.add(pt);bx(5,.1,1.6,toon(0xffffff),0,.85,0,pt);for(var pk=0;pk<6;pk++){var kd=kidModel();kd.sit=true;kd.root.position.set(-2+pk*.8,.05,pk%2?1:-1);kd.root.rotation.y=pk%2?Math.PI:0;pt.add(kd.root);cy(.08,.06,.12,toon([0xff3d8a,0x31e0ff,0xffd24a][pk%3]),-2+pk*.8,.97,pk%2?.5:-.5,pt,6);}
  cy(.35,.35,.3,toon(0xffffff),0,1.05,0,pt,12);cy(.36,.36,.06,toon(0xff79b4),0,1.22,0,pt,12);for(var cd=0;cd<5;cd++)cy(.015,.015,.15,toon(0xffd24a),-.2+cd*.1,1.32,0,pt,4);
  for(var bl=0;bl<10;bl++){var bln=sp(.25,toon([0xff3d8a,0x31e0ff,0xffd24a,0x6cc76a,0xb39ddb][bl%5]),-19+bl*.9,2.6+Math.sin(bl)*.3,14.2,g,10);bln.scale.y=1.2;}
  wallSign(g,'HAPPY BIRTHDAY MAYA!',-15,2.6,15.6,{bg:'#ffd24a',fg:'#e2553f',w:6,h:.7,ry:Math.PI});addCol(ox-17.6,ox-12.4,11.2,12.8,'fun');
  ACTS.fun.push({x:ox-15,z:10,r:2.2,label:'The birthday party',sub:'Maya is turning 8',fn:partyRoom});
  // ===== snack bar (south middle)
  counterTop(g,0,13,5,0xff3d8a,0xffffff);npc(g,0,13.8,Math.PI,{shirt:0xff3d8a});wallSign(g,'SNACK ATTACK',0,3.2,15.6,{bg:'#ff3d8a',fg:'#fff',w:4,h:.8,ry:Math.PI});cy(.35,.35,1,toon(0x31e0ff,{e:0x1a6a8a,ei:.4}),2,1.5,13.4,g,10);cy(.35,.35,1,toon(0xff3d8a,{e:0x8a1a4a,ei:.4}),2.8,1.5,13.4,g,10);addCol(ox-2.6,ox+2.6,12.5,13.5,'fun');
  ACTS.fun.push({x:ox,z:11.4,r:2,label:'Snack Attack',sub:'Pizza, slushies, nachos',fn:function(){orderFood('fun','Snack Attack','Play Zone');}});
  for(var tb=0;tb<4;tb++){var tx=-6+tb*3.2;cy(.6,.6,.06,toon(0xffffff),tx,.85,9.4,g,12);cyB(.05,.85,toon(0x3a3f4b),tx,0,9.4,g,6);addCol(ox+tx-.6,ox+tx+.6,8.8,10,'fun');SEATS.fun=SEATS.fun||[];SEATS.fun.push({x:ox+tx-.9,z:9.4,tx:ox+tx,tz:9.4,busy:false});}
  // ===== the kids
  KIDS=[];var spots=[[4,-5],[6.8,-5],[9.6,-5],[12.4,-5],[4,-.2],[9.6,-.2],[15.2,-.2],[3,-12],[9,-12],[15,11],[12,10],[17,12],[-6,5],[0,4],[6,5.6],[19,-1]];
  for(var k=0;k<14;k++){var kd2=kidModel();var sp0=spots[k%spots.length];var kid={me:kd2,x:ox+sp0[0],z:sp0[1],tx:ox+sp0[0],tz:sp0[1],w:rnd(0,4),play:0,y:0,pit:sp0[0]>11&&sp0[1]>8};kd2.root.position.set(kid.x,0,kid.z);dyn.add(kd2.root);KIDS.push(kid);}
  // ticket chip shows while you're here
  FUNSCR=spots;}
function kidModel(){var me=liteMe({shirt:pick([0xff3d8a,0x31e0ff,0xffd24a,0x6cc76a,0xff8a3d,0xb39ddb])});me.root.scale.setScalar(.66);return me;}
var kidT=0;
function updKids(dt){if(P.area!=='fun'||!KIDS.length)return;kidT-=dt;var chat=kidT<=0;if(chat)kidT=rnd(3,6);var talker=chat?pick(KIDS):null;
  KIDS.forEach(function(k){if(k.pit){k.y=Math.abs(Math.sin(now()/260+k.x))*.5;k.me.root.position.y=k.y;animLite(k.me,dt,false);if(k===talker)bubble(k.x,1.8,k.z,pick(['WHEEE!','Look at me!','I\'m swimming!','Ball fight!']),'');return;}
    if(k.w>0){k.w-=dt;k.play+=dt;animLite(k.me,dt,false);var ph=Math.sin(k.play*9);k.me.arms[0].rotation.x=-1.1+ph*.3;k.me.arms[1].rotation.x=-1.1-ph*.3;if(Math.random()<dt*.15){k.me.root.position.y=.25;}else k.me.root.position.y=Math.max(0,k.me.root.position.y-dt*2);
      if(k===talker)bubble(k.x,1.8,k.z,pick(['YES! Jackpot!','Mom! More tokens!','I got 40 tickets!','No fair!','Watch this!','Can we bowl next?','I want the giant bear!']),'');
      if(k.w<=0){var s=pick(FUNSCR);k.tx=IOX.fun+s[0]+rnd(-.5,.5);k.tz=s[1]+(s[1]<-8?1.4:s[1]<0?1.4:0);}return;}
    var dx=k.tx-k.x,dz=k.tz-k.z,d=Math.hypot(dx,dz);if(d<.2){k.w=rnd(4,12);k.play=0;k.me.root.rotation.y=k.tz<-8?Math.PI:k.tz<1?Math.PI:0;return;}var v=Math.min(d,dt*3.2);k.x+=dx/d*v;k.z+=dz/d*v;k.me.root.position.set(k.x,0,k.z);k.me.root.rotation.y=Math.atan2(dx,dz);animLite(k.me,dt,true,1.8);});}
function funEnter(){var el=$('#o-tix');if(!el){el=document.createElement('div');el.id='o-tix';document.body.appendChild(el);}el.innerHTML='🎟️ <b>'+tix().tix+'</b>';}
function funHud(){var el=$('#o-tix');if(el)el.hidden=P.area!=='fun';document.body.classList.toggle('mini',!!(BOWL||CLAW3||EAT||MOV));}
function partyRoom(){var w=W4();if(w.f&&w.f.party8){popup('The party','The kids are deep into a game of freeze tag. Maya waves at you.',[{t:'Wave back'}]);return;}popup('Maya\'s 8th birthday','A mom with a clipboard looks at you. "Are you… one of the parents?"',[{t:'Sing happy birthday',s:'Loudly',fn:function(){w.f=w.f||{};w.f.party8=1;try{[262,262,294,262,349,330].forEach(function(f,i){tone(f,.3,'triangle',.04,i*.35);});}catch(e){}setTimeout(function(){addFame(3);addTix(50);popup('Maya','"That was SO embarrassing. Thank you." She hands you a slice of cake and 50 tickets from her goodie bag.',[{t:'Happy birthday, Maya'}]);var b=W4();b.buff=b.buff||{};b.buff.fast=now()+120000;save();},2200);}},{t:'Back away slowly',cls:'sec'}],'',{who:'Party mom',role:'Play Zone',col:'#ff3d8a'});}
var PRIZES=[['Sticker sheet',10],['Bouncy ball',25],['Plush coffee bean',50],['Dog bandana',80],['Glow-in-the-dark hat',120],['Kazoo',60],['Mystery box',200],['Remote-control car',350],['Giant teddy bear',500],['Golden joystick trophy',800],['Crema City snow globe',1200],['The Play Zone crown',2500]];
function prizeWall(){var a=tix(),t=a.tix||0;popup('Prize counter','You have '+t+' tickets.\nHigh scores: '+(Object.keys(a.hi).map(function(k){return k+' '+a.hi[k];}).join(' · ')||'none yet'),PRIZES.map(function(p){return {t:p[0]+' · '+p[1]+' 🎟️',off:t<p[1],why:'Not enough tickets.',fn:function(){a.tix-=p[1];funEnter();if(p[0]==='Glow-in-the-dark hat'){W4().hat=0x8affd2;hatView();}if(p[0]==='The Play Zone crown'){W4().hat=0xffd24a;hatView();addFame(10);}if(p[0]==='Mystery box'){var c=Math.round(rnd(50,900)*tierM());G.cash+=c;toast('The box had '+fmt(c)+' in it!','good');}else gotItem(p[0]);if(p[0]==='Giant teddy bear'){var w=W4();w.bear=1;}save();setTimeout(prizeWall,60);}};}).concat([{t:'Done',cls:'sec'}]),'',{who:'Zed',role:'Prize counter',col:'#7a5ad8'});}
/* ===== bowling ===== */
var PINPOS=(function(){var o=[];for(var r=0;r<4;r++)for(var k=0;k<=r;k++)o.push({x:(k-r/2)*.3,z:-r*.26});return o;})();
function pinSet(pg){return PINPOS.map(function(p){var m=new T.Group();m.position.set(p.x,0,p.z);pg.add(m);cy(.05,.08,.32,toon(0xffffff),0,.18,0,m,8);sp(.06,toon(0xffffff),0,.38,0,m,8);cy(.052,.052,.04,toon(0xe2553f),0,.3,0,m,8);return {m:m,x:p.x,z:p.z,vx:0,vz:0,down:false,x0:p.x,z0:p.z};});}
function resetPins(L,keepDown){L.pins.forEach(function(p){if(keepDown&&p.down){p.m.visible=false;return;}p.x=p.x0;p.z=p.z0;p.vx=p.vz=0;p.down=false;p.m.visible=true;p.m.position.set(p.x,0,p.z);p.m.rotation.set(0,0,0);});}
function drawMon(L,title,sub,frames){var g=L.mon.c.getContext('2d');g.fillStyle='#0a0a2a';g.fillRect(0,0,256,128);g.fillStyle='#ffd24a';g.font='bold 22px system-ui';g.textAlign='left';g.fillText(title,10,28);g.fillStyle='#8affd2';g.font='16px system-ui';g.fillText(sub||'',10,52);
  if(frames){for(var f=0;f<5;f++){g.strokeStyle='#fff';g.strokeRect(8+f*48,64,46,54);g.fillStyle='#fff';g.font='13px system-ui';var fr=frames[f];if(fr){g.fillText(fr.mark||'',12+f*48,80);g.font='bold 16px system-ui';g.fillText(fr.cum!=null?String(fr.cum):'',14+f*48,110);}}}L.mon.t.needsUpdate=true;}
function rollPhysics(L,ball,dt,bv){ball.z+=bv.z*dt;ball.x+=bv.x*dt;bv.x+=(bv.hook||0)*dt;if(Math.abs(ball.x)>.62){ball.x=Math.sign(ball.x)*.75;bv.x=0;bv.hook=0;bv.gutter=1;}
  L.pins.forEach(function(p){if(p.down&&!p.vx&&!p.vz)return;if(!p.down&&!bv.gutter&&Math.hypot(p.x-ball.x,p.z-ball.z)<.27){var dx=p.x-ball.x,dz=p.z-ball.z,d=Math.hypot(dx,dz)||1;p.down=true;p.vx=dx/d*3+bv.x*.4;p.vz=Math.min(-1.5,dz/d*3+bv.z*.35);try{tone(260+Math.random()*200,.06,'square',.03);}catch(e){}}});
  L.pins.forEach(function(p){if(!p.down||(!p.vx&&!p.vz))return;p.x+=p.vx*dt;p.z+=p.vz*dt;p.vx*=Math.pow(.2,dt);p.vz*=Math.pow(.2,dt);if(Math.hypot(p.vx,p.vz)<.15){p.vx=p.vz=0;}
    L.pins.forEach(function(q){if(q===p||q.down)return;if(Math.hypot(q.x-p.x,q.z-p.z)<.17&&Math.hypot(p.vx,p.vz)>.6){q.down=true;q.vx=p.vx*.7+(q.x-p.x)*2;q.vz=p.vz*.7+(q.z-p.z)*2;try{tone(300+Math.random()*200,.05,'square',.025);}catch(e){}}});
    p.m.position.set(p.x,0,p.z);var a=Math.min(1.45,(p.m.userData.fall||0)+dt*6);p.m.userData.fall=a;p.m.rotation.set(-a*Math.sign(p.vz||-1)*.9,0,a*Math.sign(p.vx||1)*.6);});}
function laneAI(L){var st='wait',bz=2,bv={x:0,z:0},t=rnd(1,6);return function(dt){if(P.area!=='fun')return;t-=dt;var arm=L.bowler.arms[1];
  if(st==='wait'){arm.rotation.x=0;if(t<=0){st='swing';t=.7;}}else if(st==='swing'){arm.rotation.x=Math.sin((.7-t)/.7*Math.PI)*-1.6;if(t<=0){st='roll';var aim=rnd(-.25,.25);bz=1.6;L.ball.position.set(L.lx+aim,.2,bz);bv={x:rnd(-.05,.05),z:-rnd(8,11),hook:rnd(-.25,.25)};L.rb={x:aim,z:15};}}
  else if(st==='roll'){var b=L.rb;rollPhysics(L,b,dt,bv);L.ball.position.set(L.lx+b.x,.2,b.z-13.4);if(b.z<-1.4){st='settle';t=1.8;L.ball.visible=false;}}
  else if(st==='settle'){if(t<=0){var n=L.pins.filter(function(p){return p.down;}).length;if(n===10&&L.bowler)bubble(L.x,2.6,3.6,pick(['STRIKE!','Yesss!','Woooo!']),'good');resetPins(L);L.ball.visible=true;L.ball.position.set(L.lx,.2,2);st='wait';t=rnd(3,8);}}};}
function startBowl(home){if(home){toast('Strike! (Your home lane keeps score in your heart.)','good');return;}if(BOWL||!pay(5,'A game'))return;var L=LANES[0];resetPins(L);BOWL={L:L,frame:0,roll:0,frames:[],rolls:[],ph:'aim',aim:0,pow:0,t:0,bv:null,b:{x:0,z:15}};L.ball.visible=true;L.ball.position.set(L.lx,.2,1.6);bowlUI();drawMon(L,'LANE 1','Frame 1 · Ball 1',BOWL.frames);}
function bowlUI(){var el=$('#o-bowl');if(!el){el=document.createElement('div');el.id='o-bowl';document.body.appendChild(el);}el.hidden=false;el.innerHTML='<div class="bw-t"></div><div class="bw-m"><i></i></div><div class="bw-b"><button type="button" data-k="l">◀</button><button type="button" data-k="a">●</button><button type="button" data-k="r">▶</button><button type="button" data-k="x">Quit</button></div>';
  el.querySelectorAll('[data-k]').forEach(function(b){var k=b.dataset.k;b.addEventListener('pointerdown',function(e){e.preventDefault();if(k==='x'){endBowl(true);return;}if(k==='a')bowlPress();else bowlIn[k]=1;});['pointerup','pointerleave'].forEach(function(ev){b.addEventListener(ev,function(){bowlIn[k]=0;});});});}
var bowlIn={l:0,r:0};
function bowlKey(k,down){if(!BOWL&&!CLAW3)return false;if(CLAW3)return clawKey(k,down);if(k==='arrowleft'||k==='a')bowlIn.l=down?1:0;else if(k==='arrowright'||k==='d')bowlIn.r=down?1:0;else if((k===' '||k==='enter'||k==='e')&&down)bowlPress();else if(k==='escape'&&down)endBowl(true);else return false;return true;}
function bowlPress(){var B=BOWL;if(!B)return;if(B.ph==='aim'){B.ph='power';B.t=0;}else if(B.ph==='power'){B.ph='roll';var L=B.L;B.b={x:B.aim,z:15};B.bv={x:0,z:-(6+B.pow*7),hook:0};try{tone(180,.3,'sawtooth',.02);}catch(e){}}}
function updBowl(dt){var B=BOWL;if(!B)return;var L=B.L,el=$('#o-bowl');B.t+=dt;var tt=el&&el.querySelector('.bw-t'),mt=el&&el.querySelector('.bw-m i');
  if(B.ph==='aim'){B.aim=Math.max(-.55,Math.min(.55,B.aim+(bowlIn.r-bowlIn.l)*dt*.8));L.ball.position.set(L.lx+B.aim,.2,1.6);if(tt)tt.textContent='Frame '+(B.frame+1)+'/5 · Ball '+(B.roll+1)+' · line up with ◀ ▶, then ●';if(mt)mt.style.width='0%';}
  else if(B.ph==='power'){B.pow=(Math.sin(B.t*3.2-Math.PI/2)+1)/2;if(tt)tt.textContent='Power… press ● to throw';if(mt)mt.style.width=Math.round(B.pow*100)+'%';}
  else if(B.ph==='roll'){B.bv.hook=(bowlIn.l-bowlIn.r)*-.9;rollPhysics(L,B.b,dt,B.bv);L.ball.position.set(L.lx+B.b.x,.2,B.b.z-13.4);if(tt)tt.textContent=B.bv.gutter?'Gutter…':'Hold ◀ or ▶ to curve it';if(B.b.z<-1.4){L.ball.visible=false;B.ph='settle';B.t=0;}}
  else if(B.ph==='settle'&&B.t>1.6){var down=L.pins.filter(function(p){return p.down;}).length,prev=B.roll?B.rolls[B.rolls.length-1]:0,n=down-(B.roll?prev:0);B.rolls.push(down);
    var fr=B.frames[B.frame]=B.frames[B.frame]||{r:[]};fr.r.push(n);var strike=B.roll===0&&n===10,spare=B.roll===1&&down===10;fr.mark=fr.r.map(function(v,i){return i===0&&v===10?'X':i===1&&fr.r[0]+v===10?'/':v===0?'-':String(v);}).join(' ');
    if(strike||spare)banner(strike?'STRIKE!':'Spare!',strike?'All ten':'Cleaned it up','good');try{if(strike)[523,659,784,1046].forEach(function(f,i){tone(f,.15,'triangle',.05,i*.1);});}catch(e){}
    scoreBowl(B);var last=B.frame===4;
    if(strike&&!last||B.roll===1&&!last){B.frame++;B.roll=0;resetPins(L);}else if(last){if(strike||spare){if(fr.r.length<3){B.roll=fr.r.length;resetPins(L);}else return endBowl(false);}else if(B.roll===1)return endBowl(false);else{B.roll=1;resetPins(L,true);}}
    else{B.roll=1;resetPins(L,true);}
    L.ball.visible=true;L.ball.position.set(L.lx,.2,1.6);B.aim=0;B.ph='aim';drawMon(L,'LANE 1','Frame '+(B.frame+1)+' · Ball '+(B.roll+1),B.frames);}}
function scoreBowl(B){var flat=[];B.frames.forEach(function(f){f.r.forEach(function(v){flat.push(v);});});var cum=0,i=0;B.frames.forEach(function(f,fi){if(fi<4){if(f.r[0]===10){var a=flat[i+1],b=flat[i+2];if(a==null||b==null){f.cum=null;return;}cum+=10+a+b;i+=1;}else if(f.r.length<2){f.cum=null;return;}else if(f.r[0]+f.r[1]===10){var c=flat[i+2];if(c==null){f.cum=null;return;}cum+=10+c;i+=2;}else{cum+=f.r[0]+f.r[1];i+=2;}}else{cum+=f.r.reduce(function(s,v){return s+v;},0);}f.cum=cum;});B.score=cum;}
function endBowl(quit){var B=BOWL;if(!B)return;BOWL=null;var el=$('#o-bowl');if(el)el.hidden=true;resetPins(B.L);B.L.ball.visible=true;B.L.ball.position.set(B.L.lx,.2,2);if(quit)return;
  var s=B.score||0,a=tix(),best=s>(a.hi.bowl||0);if(best)a.hi.bowl=s;addTix(Math.round(s/6)+(s>=100?40:0));addXP(10);W4().stats.bowl=(W4().stats.bowl||0)+1;
  popup(best?'New lane record!':'Game over','Final score: '+s+(s>=150?'\nThe kids on lane 3 are chanting your name.':s<30?'\nThe bumpers are available upon request.':''),[{t:'Bowl again · $5',fn:function(){startBowl(false);}},{t:'Done',cls:'sec'}]);}
function bowlCam(dt){if(!BOWL||P.area!=='fun')return false;var L=BOWL.L,b=BOWL.ph==='roll'||BOWL.ph==='settle'?BOWL.b:{x:BOWL.aim,z:15},bz=Math.max(-10,b.z-13.4),cp=V3(L.x+b.x*.5,1.8,bz+3.4),ct=V3(L.x,.3,Math.min(bz-6,-13));if(BOWL.ph==='settle'){cp=V3(L.x,1.4,-9.5);ct=V3(L.x,.2,-13.4);}
  O.cam.position.lerp(cp,Math.min(1,dt*3));camL.lerp(ct,Math.min(1,dt*3));O.cam.lookAt(camL);return true;}
/* ===== a real claw machine ===== */
function clawModel(dg,x,z,col,k){var c={x:x,z:z,g:new T.Group(),n:9};c.g.position.set(x,0,z);dg.add(c.g);var G2=c.g;
  rb(1.6,1,1.6,.05,toon(col),0,.5,0,G2);rb(1.6,.4,1.6,.05,toon(col),0,2.6,0,G2);[[-.78,-.78],[.78,-.78],[-.78,.78],[.78,.78]].forEach(function(o){bx(.06,1.7,.06,toon(0xffffff),o[0],1.85,o[1],G2);});
  [[0,-.79,0],[0,.79,0],[-.79,0,1],[.79,0,1]].forEach(function(o){var p2=plane(1.56,1.6,glass(0xcfeaff,.25),o[0],1.82,o[1],G2);if(o[2])p2.rotation.y=Math.PI/2;});
  plane(1.4,.32,flat(0xffffff,{map:signT(['PLUSH PARTY','MEGA CLAW','BEAN GRABBER','LUCKY CLAW'][k],{bg:'#111',fg:'#ffd24a',w:256,h:58})}),0,2.62,.81,G2);bx(.4,.4,.3,toon(0x111111),.55,.75,.81,G2);
  c.toys=[];for(var t=0;t<c.n;t++){var ty=new T.Group();var tx=-.55+(t%3)*.45+rnd(-.08,.08),tz=-.5+Math.floor(t/3)*.4+rnd(-.08,.08);ty.position.set(tx,1.12+(t%2)*.08,tz);G2.add(ty);var tc=[0xff79b4,0x46a9e6,0xffd24a,0x6cc76a,0xb39ddb,0xff8a3d][t%6];sp(.13,toon(tc),0,0,0,ty,8);sp(.05,toon(tc),-.08,.11,0,ty,6);sp(.05,toon(tc),.08,.11,0,ty,6);c.toys.push({g:ty,x:tx,z:tz,y:ty.position.y,got:false});}
  var cl=new T.Group();cl.position.set(0,2.3,0);G2.add(cl);cy(.012,.012,.4,toon(0x888888),0,.2,0,cl,4);var hub=cy(.08,.06,.08,toon(0xc8ccd2),0,0,0,cl,8);c.prongs=[0,1,2].map(function(i){var pr=new T.Group();pr.rotation.y=i*2.1;cl.add(pr);var arm=bx(.03,.22,.03,toon(0xc8ccd2),.07,-.1,0,pr);pr.userData.arm=arm;return pr;});c.claw=cl;
  bx(.3,.06,.3,toon(0x111111),-.55,1.02,.55,G2);return c;}
function startClaw(c){if(CLAW3)return;if(c.toys.every(function(t){return t.got;})){toast('Empty. An employee is restocking it.','');c.toys.forEach(function(t){t.got=false;t.g.visible=true;t.g.position.set(t.x,t.y,t.z);});return;}if(!pay(2,'A try'))return;CLAW3={c:c,x:0,z:0,y:2.3,ph:'move',t:20,open:1,grab:null};c.claw.position.set(0,2.3,0);clawUI();}
function clawUI(){var el=$('#o-bowl');if(!el){el=document.createElement('div');el.id='o-bowl';document.body.appendChild(el);}el.hidden=false;el.innerHTML='<div class="bw-t">Move the claw, then drop</div><div class="bw-b cl"><button type="button" data-k="l">◀</button><button type="button" data-k="u">▲</button><button type="button" data-k="d">▼</button><button type="button" data-k="r">▶</button><button type="button" data-k="a">DROP</button></div>';
  el.querySelectorAll('[data-k]').forEach(function(b){var k=b.dataset.k;b.addEventListener('pointerdown',function(e){e.preventDefault();if(k==='a')clawDrop();else clawIn[k]=1;});['pointerup','pointerleave'].forEach(function(ev){b.addEventListener(ev,function(){clawIn[k]=0;});});});}
var clawIn={l:0,r:0,u:0,d:0};
function clawKey(k,down){var m={arrowleft:'l',a:'l',arrowright:'r',d:'r',arrowup:'u',w:'u',arrowdown:'d',s:'d'};if(m[k]){clawIn[m[k]]=down?1:0;return true;}if((k===' '||k==='enter'||k==='e')&&down){clawDrop();return true;}return false;}
function clawDrop(){if(CLAW3&&CLAW3.ph==='move'){CLAW3.ph='down';try{tone(200,.5,'sawtooth',.02);}catch(e){}}}
function updClaw(dt){var C=CLAW3;if(!C)return;var c=C.c,el=$('#o-bowl .bw-t');
  if(C.ph==='move'){C.t-=dt;C.x=Math.max(-.6,Math.min(.6,C.x+(clawIn.r-clawIn.l)*dt*.6));C.z=Math.max(-.6,Math.min(.6,C.z+(clawIn.d-clawIn.u)*dt*.6));if(el)el.textContent='Move the claw · DROP · '+Math.ceil(C.t)+'s';if(C.t<=0)clawDrop();}
  else if(C.ph==='down'){C.y-=dt*.7;if(C.y<=1.3){C.ph='close';C.t=.6;}}
  else if(C.ph==='close'){C.t-=dt;C.open=Math.max(0,C.t/.6);if(C.t<=0){var best=null,bd=1;c.toys.forEach(function(t){if(t.got)return;var d=Math.hypot(t.x-C.x,t.z-C.z);if(d<bd){bd=d;best=t;}});var luck=W4().buff&&W4().buff.lucky>now()?.2:0;C.grab=best&&bd<.16&&Math.random()<(bd<.08?.7:.45)+luck?best:null;C.ph='up';}}
  else if(C.ph==='up'){C.y+=dt*.6;if(C.grab&&C.y>1.9&&Math.random()<dt*.25){C.grab=null;bubble(P.x,2.6,P.z,'Nooo!','bad');}if(C.y>=2.3){C.ph='home';}}
  else if(C.ph==='home'){var dx=-.55-C.x,dz=.55-C.z,d=Math.hypot(dx,dz);if(d>.02){C.x+=dx/d*Math.min(d,dt*.5);C.z+=dz/d*Math.min(d,dt*.5);}else{C.ph='release';C.t=.8;C.open=1;}}
  else if(C.ph==='release'){C.t-=dt;if(C.grab){C.grab.g.position.y-=dt*1.5;}if(C.t<=0){var won=C.grab;CLAW3=null;var e2=$('#o-bowl');if(e2)e2.hidden=true;if(won){won.got=true;won.g.visible=false;banner('You got one!','A claw-machine plush','good');gotItem('Claw-machine plush');addTix(5);W4().stats.claws=(W4().stats.claws||0)+1;}else toast(pick(['So close.','It slipped.','Rigged. Probably.','The claw is weak today.']),'');c.claw.position.set(0,2.3,0);return;}}
  c.claw.position.set(C.x,C.y,C.z);c.prongs.forEach(function(p){p.rotation.z=-.2-C.open*.5;});if(C.grab&&C.ph!=='release'){C.grab.g.position.set(C.x,C.y-.25,C.z);}}
function clawCam(dt){if(!CLAW3||P.area!=='fun')return false;var c=CLAW3.c,cx=IOX.fun+c.x,cp=V3(cx+.3,2.6,c.z+2.6),ct=V3(cx,1.5,c.z);O.cam.position.lerp(cp,Math.min(1,dt*3));camL.lerp(ct,Math.min(1,dt*3));O.cam.lookAt(camL);return true;}
/* ===== new cabinet games: air hockey and whack-a-bean (they plug into the arcade engine) ===== */
function arcExtra(A,g,dt){var W2=300,H2=380;
  if(A.id==='hockey'){if(!A.pk){A.pk={x:150,y:190,vx:0,vy:0};A.me={x:150,y:330};A.ai={x:150,y:50};A.sc=[0,0];A.cv.onpointermove=function(e){var r=A.cv.getBoundingClientRect();A.tgt={x:(e.clientX-r.left)/r.width*W2,y:(e.clientY-r.top)/r.height*H2};};}
    var pk=A.pk,me=A.me,ai=A.ai;if(A.tgt){me.x+=(A.tgt.x-me.x)*Math.min(1,dt*14);me.y+=(Math.max(200,A.tgt.y)-me.y)*Math.min(1,dt*14);}me.x=Math.max(22,Math.min(278,me.x+(A.in.r-A.in.l)*dt*300));
    var aisp=180+A.hard*120;ai.x+=Math.max(-aisp*dt,Math.min(aisp*dt,pk.x-ai.x));ai.y+=((pk.y<190?pk.y-20:50)-ai.y)*Math.min(1,dt*3);
    pk.x+=pk.vx*dt;pk.y+=pk.vy*dt;pk.vx*=Math.pow(.6,dt);pk.vy*=Math.pow(.6,dt);if(pk.x<12||pk.x>288){pk.vx*=-1;pk.x=Math.max(12,Math.min(288,pk.x));try{tone(600,.03,'sine',.02);}catch(e){}}
    [me,ai].forEach(function(p){var dx=pk.x-p.x,dy=pk.y-p.y,d=Math.hypot(dx,dy);if(d<34){var s=Math.max(260,Math.hypot(pk.vx,pk.vy)+80);pk.vx=dx/d*s;pk.vy=dy/d*s;pk.x=p.x+dx/d*34;pk.y=p.y+dy/d*34;try{tone(900,.03,'square',.03);}catch(e){}}});
    var goal=Math.abs(pk.x-150)<50;if(pk.y<8){if(goal){A.sc[0]++;A.score=A.sc[0];pk.x=150;pk.y=190;pk.vx=pk.vy=0;try{tone(1046,.2,'triangle',.05);}catch(e){}}else{pk.vy=Math.abs(pk.vy);pk.y=8;}}if(pk.y>372){if(goal){A.sc[1]++;pk.x=150;pk.y=190;pk.vx=pk.vy=0;try{tone(150,.2,'square',.04);}catch(e){}}else{pk.vy=-Math.abs(pk.vy);pk.y=372;}}
    g.fillStyle='#e8f4ff';g.fillRect(0,0,W2,H2);g.strokeStyle='#e2553f';g.lineWidth=3;g.beginPath();g.moveTo(0,190);g.lineTo(300,190);g.stroke();g.beginPath();g.arc(150,190,40,0,7);g.stroke();g.fillStyle='#111';g.fillRect(100,0,100,6);g.fillRect(100,374,100,6);
    g.fillStyle='#111';g.beginPath();g.arc(pk.x,pk.y,12,0,7);g.fill();g.fillStyle='#2f5f90';g.beginPath();g.arc(me.x,me.y,22,0,7);g.fill();g.fillStyle='#e2553f';g.beginPath();g.arc(ai.x,ai.y,22,0,7);g.fill();g.lineWidth=1;
    g.fillStyle='#2a1a12';g.font='bold 16px system-ui';g.fillText('YOU '+A.sc[0]+'  ·  KID '+A.sc[1],80,214);g.font='11px system-ui';g.fillText('Drag or ◀ ▶',112,234);
    if(A.sc[0]>=5||A.sc[1]>=5){var win=A.sc[0]>=5;arcDone(A.sc[0]*2+(win?10:0),win?'You beat the kid!':'The kid wins. He does a little dance.');}return true;}
  if(A.id==='whack'){if(!A.holes){A.holes=[];for(var i=0;i<9;i++)A.holes.push({x:60+(i%3)*90,y:110+Math.floor(i/3)*90,up:0,t:0,k:'bean'});A.cur=4;A.cv.onpointerdown=function(e){var r=A.cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W2,y=(e.clientY-r.top)/r.height*H2;A.holes.forEach(function(h,i){if(Math.hypot(h.x-x,h.y-y)<36){A.cur=i;whack(A,h);}});};A.lk=0;}
    var dur=30;A.spawn-=dt;if(A.spawn<=0&&A.t<dur){A.spawn=rnd(.35,.8)-A.hard*.15;var h0=pick(A.holes);if(!h0.up){h0.up=1;h0.t=rnd(.6,1.1)-A.hard*.2;h0.k=Math.random()<.15?'burnt':Math.random()<.1?'gold':'bean';}}
    A.holes.forEach(function(h){if(h.up){h.t-=dt;if(h.t<=0)h.up=0;}});A.lk-=dt;if(A.lk<=0&&(A.in.l||A.in.r)){A.cur=(A.cur+(A.in.r?1:8))%9;A.lk=.18;}if(A.press){A.press=0;whack(A,A.holes[A.cur]);}
    g.fillStyle='#2f7a4a';g.fillRect(0,0,W2,H2);A.holes.forEach(function(h,i){g.fillStyle='#1a3a22';g.beginPath();g.ellipse(h.x,h.y+18,34,12,0,0,7);g.fill();if(h.up){g.fillStyle=h.k==='gold'?'#ffd24a':h.k==='burnt'?'#2a2a2a':'#8a5a3a';g.beginPath();g.ellipse(h.x,h.y,20,26,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(h.x-8,h.y-6,4,4);g.fillRect(h.x+4,h.y-6,4,4);}if(i===A.cur){g.strokeStyle='#ffd24a';g.lineWidth=3;g.strokeRect(h.x-38,h.y-34,76,70);g.lineWidth=1;}});
    g.fillStyle='#ffd24a';g.font='bold 14px system-ui';g.fillText('TIME '+Math.max(0,Math.ceil(dur-A.t)),10,20);if(A.t>dur+.5)arcDone(A.score*2);return true;}
  return false;}
function whack(A,h){if(!h.up){try{tone(120,.05,'square',.02);}catch(e){}return;}h.up=0;A.score+=h.k==='gold'?5:h.k==='burnt'?-3:1;try{tone(h.k==='burnt'?120:880,.06,'square',.04);}catch(e){}}
