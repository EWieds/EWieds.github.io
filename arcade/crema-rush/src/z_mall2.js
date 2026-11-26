
/* ---------- the Galleria, now two floors: escalators, a glass elevator, an open atrium, a food court and the cinema upstairs, and the Play Zone ---------- */
var MALL2Y=9,ESC=null,ATR={x0:-14,x1:18,z0:-4.5,z1:8.5};
function goArea(id,x,z,ry){fade(function(){P.area=id;P.x=x;P.z=z;P.ry=ry||0;yaw=(ry||0)+Math.PI;O.snap=true;doorCd();updDaylight();});}
function doorCd(){try{doorCD=1;}catch(e){}}
/* level 1 additions where the old arcade and food court were */
function mallLevel1(g,ox){
  // escalators (up and down) on the west side, a glass elevator on the east
  escalatorModel(g,ox);
  var el=new T.Group();el.position.set(ox+27,0,-2);dyn.add(el);bx(2.6,.2,2.6,toon(0xc8ccd2),0,.1,0,el);[[-1.25,-1.25],[1.25,-1.25],[-1.25,1.25],[1.25,1.25]].forEach(function(c){cyB(.06,MALL2Y+4,toon(0xc8ccd2),c[0],0,c[1],el,5);});
  var cab=new T.Group();el.add(cab);rb(2.2,2.6,2.2,.05,glass(0xbfe6ff,.35),0,1.4,0,cab);bx(2.2,.15,2.2,toon(0x8a8f96),0,.1,0,cab);bx(2.2,.15,2.2,toon(0x8a8f96),0,2.75,0,cab);ELEV={g:cab,y:0};addCol(ox+25.6,ox+28.4,-3.4,-.6,'mall');
  ACTS.mall.push({x:ox+27,z:.2,r:1.8,label:'Glass elevator',sub:'Up to the food court, the cinema and the Play Zone',fn:function(){rideElevator(true);}});
  ACTS.mall.push({x:ox-29,z:-.2,r:1.8,label:'Escalator up',sub:'Food court · Cinema 6 · Play Zone',fn:function(){escRide(true);}});
  ACTS.mall.push({x:ox-11,z:-6.4,r:1.6,label:'Mall directory',sub:'You are here',fn:function(){popup('Galleria directory','LEVEL 1\n• Threads · Gadget Hub · Toy Planet · Pages\n• Sneaker Street · Pet Pals\n• The fountain · Crema kiosk\n\nLEVEL 2\n• Food court: Noodle Bar, Burger Barn, Pretzel Twist, Mg1\'s Juice Bar\n• Cinema 6\n• PLAY ZONE: bowling, claw machines, arcade, ball pit, prize counter\n• Jewel Box · Snip Salon',[{t:'Take the escalator',fn:function(){escRide(true);}},{t:'OK',cls:'sec'}]);}});
  bx(1.4,2.2,.2,toon(0x2a1a12),-11,1.1,-7.4,g);plane(1.2,1.8,flat(0xffffff,{map:signT('DIRECTORY',{bg:'#ffc63d',fg:'#2a1a12',w:256,h:384,sub:'L1 SHOPS · L2 FOOD · CINEMA · PLAY'})}),-11,1.2,-7.28,g);
  // two new stores in the old arcade space
  var u=mallUnit(g,ox,22.5,7,7,'SNEAKER STREET','#ff8a3d',0xf4f4f4);for(var s=0;s<12;s++){var sx=19.6+(s%6)*1,sz=u.z0+.5;bx(.6,.06,.4,toon(0xffffff),sx,.6+Math.floor(s/6)*.6,sz,g);bx(.5,.18,.3,toon([0xe2553f,0x46a9e6,0xffd24a,0x1a1a1a,0x6cc76a,0xff79b4][s%6]),sx,.72+Math.floor(s/6)*.6,sz,g);}
  ACTS.mall.push({x:ox+22.5,z:u.z0+4.6,r:2,label:'Sneaker Street',sub:function(){return W4().shoes?'Your runners are holding up':'Running shoes: walk faster for good';},fn:function(){var c=Math.round(120*tierM());if(W4().shoes){popup('Sneaker Street','"How are those running? Come back when they wear out. They won\'t."',[{t:'Ha'}]);return;}popup('Sneaker Street','"These are the fastest shoes in '+plan.name+'. Try them."',[{t:'Buy runners · '+fmt(c),s:'You walk 8% faster, forever',fn:function(){if(!pay(c,'The runners'))return;W4().shoes=1;gotItem('Running shoes');}},{t:'Just looking',cls:'sec'}],'',{who:'Dez',role:'Sneaker Street',col:'#ff8a3d'});}});
  u=mallUnit(g,ox,29.5,6.5,7,'PET PALS','#2a9d8f',0xe8f6f2);for(var pp=0;pp<3;pp++){rb(1.2,.8,1,.05,glass(0xbfe8e8,.4),27.6+pp*1.4,1,u.z0+.8,g);sp(.18,toon([0xffc63d,0xff8a3d,0xb39ddb][pp]),27.6+pp*1.4,.85,u.z0+.8,g,8);}
  ACTS.mall.push({x:ox+29.5,z:u.z0+4.6,r:2,label:'Pet Pals',sub:'Treats, toys, a bed for a good dog',fn:function(){var w=W4(),d=w.dog&&w.dog.own;popup('Pet Pals','"'+(d?'How\'s '+(w.dog.name||'your dog')+'?':'No pet yet? Plenty of strays in the park need a friend.')+'"',[{t:'Dog treats · '+fmt(Math.round(8*tierM())),fn:function(){if(!pay(Math.round(8*tierM()),'Treats'))return;w.pantry=w.pantry||{};w.pantry['Dog treats']=(w.pantry['Dog treats']||0)+3;gotItem('Dog treats');}},{t:'A squeaky toy · '+fmt(Math.round(12*tierM())),fn:function(){if(pay(Math.round(12*tierM()),'The toy')){gotItem('Squeaky toy');if(d)w.dog.happy=(w.dog.happy||0)+1;}}},{t:'Leave',cls:'sec'}],'',{who:'Priya',role:'Pet Pals',col:'#2a9d8f'});}});
}
function escalatorModel(g,ox){var run=14,x0=-30,x1=-16;[[-.7,true],[.9,false]].forEach(function(e){var z=e[0],up=e[1],len=Math.hypot(run,MALL2Y),ang=Math.atan2(MALL2Y,run);
    var side=bx(len,.9,.12,toon(0xc8ccd2),(x0+x1)/2,MALL2Y/2+.45,z-.55,g);side.rotation.z=ang;var side2=bx(len,.9,.12,toon(0xc8ccd2),(x0+x1)/2,MALL2Y/2+.45,z+.55,g);side2.rotation.z=ang;
    var bed=bx(len,.3,1,toon(0x3a3f4b),(x0+x1)/2,MALL2Y/2-.2,z,g);bed.rotation.z=ang;var rail=bx(len,.08,.1,toon(0x1a1a1a),(x0+x1)/2,MALL2Y/2+.95,z-.55,g);rail.rotation.z=ang;var rail2=bx(len,.08,.1,toon(0x1a1a1a),(x0+x1)/2,MALL2Y/2+.95,z+.55,g);rail2.rotation.z=ang;
    var steps=new T.Group();steps.position.x=IOX.mall;dyn.add(steps);var st=[];for(var i=0;i<18;i++){var s=bx(.55,.08,.9,toon(0x9aa3ad),0,0,z,steps);st.push(s);}
    anim.push({fn:function(dt,tl){for(var k=0;k<st.length;k++){var f=((tl*.12*(up?1:-1)+k/st.length)%1+1)%1;st[k].position.set(x0+f*run,f*MALL2Y,z);}},obj:steps});});
  addCol(IOX.mall+x0+1,IOX.mall+x1,-1.4,1.6,'mall');}
function escRide(up){if(ESC)return;var ox=IOX.mall;ESC={t:0,up:up,dur:3.2,a:up?{x:ox-30.5,y:0}:{x:ox-15.2,y:MALL2Y},b:up?{x:ox-15.2,y:MALL2Y}:{x:ox-30.5,y:0},z:up?-.7:.9};P.x=ESC.a.x;P.z=ESC.z;P.ry=up?Math.PI/2:-Math.PI/2;}
function updEsc(dt){if(!ESC)return;var E=ESC;E.t+=dt;var k=Math.min(1,E.t/E.dur),s=k*k*(3-2*k);P.x=E.a.x+(E.b.x-E.a.x)*s;P.z=E.z;E.y=E.a.y+(E.b.y-E.a.y)*s;P.me.root.position.set(P.x,E.y,P.z);P.me.root.rotation.y=P.ry;
  if(k>=1){ESC=null;if(E.up){P.area='mall2';P.x=IOX.mall-13.4;P.z=-1.2;}else{P.area='mall';P.x=IOX.mall-31;P.z=1.8;}updDaylight();}}
var ELEV=null;
function rideElevator(up){if(ESC)return;var ox=IOX.mall;P.x=ox+27;P.z=-2;ESC={t:0,up:up,dur:3.6,a:{x:ox+27,y:up?0:MALL2Y},b:{x:ox+27,y:up?MALL2Y:0},z:-2,elev:1};}
function updElev(){if(!ELEV)return;if(ESC&&ESC.elev){ELEV.g.position.y=ESC.y||0;}else ELEV.g.position.y=P.area==='mall2'&&Math.abs(P.x-(IOX.mall+27))<6?MALL2Y:(ELEV.g.position.y>MALL2Y/2&&P.area!=='mall'?MALL2Y:0);}
/* level 2 */
var SEATS2=[];
function mall2Room(){var ox=IOX.mall,w=64,d=30,Y=MALL2Y,g=new T.Group();g.position.set(ox,Y,0);stat.add(g);curArea='mall2';ACTS.mall2=[];
  var fm=toon(0xffffff,{map:floorT(0xe8dcc6,0xd4c4a4,3)});
  var pieces=[[-32,ATR.x0,-15,15],[ATR.x1,32,-15,15],[ATR.x0,ATR.x1,-15,ATR.z0],[ATR.x0,ATR.x1,ATR.z1,15]];pieces.forEach(function(q){var pw=q[1]-q[0],pd=q[3]-q[2],f=planeR(pw,pd,pw/3,pd/3,fm,(q[0]+q[1])/2,0,(q[2]+q[3])/2,g);f.rotation.x=-Math.PI/2;var under=plane(pw,pd,toon(0xf3e7d3),(q[0]+q[1])/2,-.25,(q[2]+q[3])/2,g);under.rotation.x=Math.PI/2;});
  // atrium edge: glass rail and a lip
  var rl=glass(0xbfe6ff,.35);[[ATR.x0,ATR.x1,ATR.z0,'x'],[ATR.x0,ATR.x1,ATR.z1,'x'],[ATR.x0,ATR.z0,ATR.z1,'z'],[ATR.x1,ATR.z0,ATR.z1,'z']].forEach(function(e){if(e[3]==='x'){bx(e[1]-e[0],1,.06,rl,(e[0]+e[1])/2,.55,e[2],g);bx(e[1]-e[0],.08,.14,toon(0xc8ccd2),(e[0]+e[1])/2,1.05,e[2],g);bx(e[1]-e[0],.3,.3,toon(0xe8e2d6),(e[0]+e[1])/2,-.15,e[2],g);}
    else{bx(.06,1,e[2]-e[1],rl,e[0],.55,(e[1]+e[2])/2,g);bx(.14,.08,e[2]-e[1],toon(0xc8ccd2),e[0],1.05,(e[1]+e[2])/2,g);bx(.3,.3,e[2]-e[1],toon(0xe8e2d6),e[0],-.15,(e[1]+e[2])/2,g);}});
  addCol(ox+ATR.x0,ox+ATR.x1,ATR.z0,ATR.z1,'mall2');
  // walls, ceiling skylight
  var wm=toon(0xf3e7d3);bx(w,6,.3,wm,0,3,-15,g);bx(w,6,.3,wm,0,3,15,g);bx(.3,6,d,wm,-32,3,0,g);bx(.3,6,d,wm,32,3,0,g);addCol(ox-33,ox+33,-16,-14.8,'mall2');addCol(ox-33,ox+33,14.8,16,'mall2');addCol(ox-33,ox-31.8,-15,15,'mall2');addCol(ox+31.8,ox+33,-15,15,'mall2');
  bx(w,.3,.32,toon(0x2a1a12),0,6,-15,g);for(var sk=-28;sk<=28;sk+=8)bx(.3,.3,30,toon(0xe8e2d6),sk,6,0,g);
  // escalator top landing + elevator landing
  bx(3,.1,3,toon(0xc8ccd2),-14.8,.03,.1,g);ACTS.mall2.push({x:ox-13.6,z:.9,r:1.6,label:'Escalator down',sub:'Shops on level 1',fn:function(){escRide(false);}});
  ACTS.mall2.push({x:ox+27,z:.2,r:1.8,label:'Glass elevator',sub:'Down to level 1',fn:function(){rideElevator(false);}});addCol(ox+25.6,ox+28.4,-3.4,-.6,'mall2');
  // FOOD COURT (back left)
  [['NOODLE BAR','#e2553f',-28,'noodle'],['BURGER BARN','#ffc63d',-21,'burger'],['PRETZEL TWIST','#2fa860',-14,'pretzel'],['MG1\'S JUICE BAR','#2f9e57',-7,'juice']].forEach(function(f){counterTop(g,f[2],-12.6,5,0xffffff,0xf4efe6);bx(6,4.6,.3,toon(0xe8e2d6),f[2],2.3,-14.7,g);wallSign(g,f[0],f[2],4.2,-14.5,{bg:f[1],fg:'#fff',w:4.6,h:.8});
    var cook=liteMe({shirt:0xffffff,apron:0x3a3f4b});cook.root.position.set(f[2],0,-13.4);g.add(cook.root);for(var mi=0;mi<3;mi++)plane(1.2,.7,toon([0xffd24a,0xffffff,0xe2553f][mi]),f[2]-1.4+mi*1.4,3,-14.5,g);addCol(ox+f[2]-2.6,ox+f[2]+2.6,-13.1,-12.1,'mall2');
    ACTS.mall2.push({x:ox+f[2],z:-11.2,r:1.8,label:f[0].charAt(0)+f[0].slice(1).toLowerCase().replace('mg1\'s','Mg1\'s'),sub:'Food court',fn:function(){orderFood(f[3],f[0].charAt(0)+f[0].slice(1).toLowerCase(),'Food court');}});});
  SEATS2=[];for(var tb=0;tb<8;tb++){var tx=-28+(tb%4)*5,tz=-6.5-Math.floor(tb/4)*0+(tb<4?0:4)+ (tb<4?-1.5:0);tz=tb<4?-8:-6.2+0;if(tb>=4){tx=-28+(tb-4)*5;tz=10.5;}
    cy(.7,.7,.06,toon(0xffffff),tx,.9,tz,g,14);cyB(.06,.9,toon(0x3a3f4b),tx,0,tz,g,6);[[-1,0],[1,0]].forEach(function(c){bx(.5,.08,.5,toon(0xffc63d),tx+c[0],.55,tz,g);});addCol(ox+tx-.7,ox+tx+.7,tz-.7,tz+.7,'mall2');SEATS2.push({x:ox+tx-1,z:tz,tx:ox+tx,tz:tz,busy:tb%3===0});
    if(tb%3===0){var dn=liteMe();dn.sit=true;dn.root.position.set(tx+1,.1,tz);dn.root.rotation.y=-Math.PI/2;g.add(dn.root);}}
  // CINEMA 6 (back middle-right)
  bx(14,6,.3,toon(0x2a1018),6,3,-14.7,g);wallSign(g,'CINEMA 6',6,4.6,-14.5,{bg:'#1a1a1a',fg:'#ffd24a',w:6,h:1.1,sub:'NOW SHOWING'});for(var ps=0;ps<4;ps++){bx(1.4,2,.08,toon(0xffd24a),1+ps*3.3,2.2,-14.5,g);plane(1.2,1.8,flat(0xffffff,{map:posterT(ps)}),1+ps*3.3,2.2,-14.44,g);}
  counterTop(g,6,-11.6,4,0x7a2a22,0xf4efe6);cy(.4,.4,1.2,toon(0xffd24a,{e:0x8a6a10,ei:.3}),8.4,1.6,-11.6,g,10);npc(g,6,-12.4,0,{shirt:0x7a2a22});addCol(ox+3.9,ox+8.8,-12.1,-11.1,'mall2');
  ACTS.mall2.push({x:ox+6,z:-10.2,r:2,label:'Cinema 6',sub:'Tickets $12 · popcorn',fn:cinema});
  // PLAY ZONE gate (back right)
  bx(12,6,.3,toon(0x1a1430),25,3,-14.7,g);var arch=new T.Group();arch.position.set(ox+25,Y,-14.2);dyn.add(arch);[[-3,0xff3d8a],[3,0x31e0ff]].forEach(function(q){bx(.5,4.4,.5,toon(q[1],{e:q[1],ei:.9}),q[0],2.2,0,arch);});bx(6.5,.6,.5,toon(0xffd24a,{e:0xffd24a,ei:.9}),0,4.6,0,arch);
  plane(6,1,flat(0xffffff,{map:signT('PLAY ZONE',{bg:'#7a5ad8',fg:'#fff',w:768,h:128,sub:'BOWLING · ARCADE · CLAWS · PRIZES'})}),0,5.4,.3,arch);var bulbs=[];for(var b=0;b<14;b++){var bl=sp(.09,toon(0xffffff,{e:0xffffff,ei:1}),-3.2+b*.5,5,.3,arch,6);bulbs.push(bl);}
  anim.push({fn:function(dt,tl){bulbs.forEach(function(bl,i){bl.visible=(Math.floor(tl*4)+i)%3!==0;});},obj:arch});
  ACTS.mall2.push({x:ox+25,z:-12.4,r:2.4,label:'Enter the Play Zone',sub:'Bowling, claw machines, arcade, ball pit',fn:function(){goArea('fun',IOX.fun,13.6,Math.PI);setTimeout(funEnter,260);}});
  // front side: Jewel Box, Snip Salon, benches, plants
  [[18,'JEWEL BOX','#b39ddb'],[26,'SNIP SALON','#ff79b4']].forEach(function(s){bx(6,4.6,.3,toon(0xe8e2d6),s[0],2.3,14.7,g);wallSign(g,s[1],s[0],4.2,14.5,{bg:s[2],fg:'#fff',w:4.6,h:.8,ry:Math.PI});counterTop(g,s[0],12.4,4,0xffffff,0x2a1a12);npc(g,s[0],13.2,Math.PI,{shirt:0x3a3f4b});addCol(ox+s[0]-2,ox+s[0]+2,11.9,12.9,'mall2');});
  for(var jw=0;jw<5;jw++)sp(.07,toon(0xffd24a,{e:0x8a6a10,ei:.6}),16.6+jw*.7,1.15,12.4,g,6);
  ACTS.mall2.push({x:ox+18,z:11,r:2,label:'Jewel Box',sub:'Rings, watches, a very large diamond',fn:function(){var c1=Math.round(800*tierM()),c2=Math.round(20000*tierM());popup('Jewel Box','"Something special?"',[{t:'A gold watch · '+fmt(c1),s:'People notice. Fame +5',fn:function(){if(!pay(c1,'The watch'))return;gotItem('Gold watch');addFame(5);}},{t:'The Crema Diamond · '+fmt(c2),s:'Fame +40. Owners take you more seriously',fn:function(){if(!pay(c2,'The diamond'))return;gotItem('The Crema Diamond');addFame(40);W4().diamond=1;}},{t:'Just looking',cls:'sec'}],'',{who:'Marguerite',role:'Jewel Box',col:'#b39ddb'});}});
  ACTS.mall2.push({x:ox+26,z:11,r:2,label:'Snip Salon',sub:'New look',fn:function(){var c=Math.round(30*tierM());popup('Snip Salon','"Sit, sit. What are we doing today?"',[{t:'The usual trim · '+fmt(c),fn:function(){if(pay(c,'The trim')){addFame(1);bubble(P.x,2.7,P.z,'Fresh.','good');}}},{t:'Something bold · '+fmt(c*2),fn:function(){if(!pay(c*2,'The new look'))return;W4().hat=pick([0xff79b4,0x31e0ff,0x8affd2,0xffd24a]);hatView();addFame(2);save();}},{t:'Not today',cls:'sec'}],'',{who:'Jo',role:'Snip Salon',col:'#ff79b4'});}});
  [[-31,13],[31,13],[-31,-4],[13,13]].forEach(function(q){cy(.9,.8,.9,toon(0xc8743a),q[0],.45,q[1],g,10);sp(1,toon(0x4f9a4a),q[0],1.6,q[1],g,8);});
  for(var bn=0;bn<4;bn++)bx(2,.15,.6,toon(0x8a5a3a),-2+bn*3.2,.5,11.4,g);
  AREAS.mall2={id:'mall2',name:plan.name+' Galleria · Level 2',ox:ox,w:w,d:d,y:Y,bgC:new T.Color(0x2a2a30),spawn:{x:ox-13.4,z:-1.2},b:{x0:ox-31.5,x1:ox+31.5,z0:-14.5,z1:14.5},cam:{dist:10,pitch:.78}};
  for(var s2=0;s2<8;s2++){var shp=liteMe();shp.root.position.set(ox-24+s2*6,Y,4+(s2%2)*6);dyn.add(shp.root);shoppers.push({me:shp,x:ox-24+s2*6,z:4,tx:ox-24+s2*6,tz:4,w:rnd(0,3),area:'mall2',y:Y});}
  SEATS.mall2=SEATS2;curArea='city';}
MENUS.noodle=[['Spicy dan dan noodles',11],['Pork ramen',13],['Scallion pancake',6]];MENUS.burger=[['Double smash burger',12],['Chili cheese fries',7],['Chocolate shake',6]];MENUS.pretzel=[['Giant salted pretzel',5],['Cinnamon sugar bites',6],['Pretzel dog',7]];MENUS.juice=[['Mg1\'s green machine',8],['Apple-ginger zinger',7],['Strawberry banana smoothie',8]];MENUS.fun=[['Pepperoni pizza slice',4],['Blue raspberry slushie',3],['Nachos with cheese',5],['Birthday cupcake',3]];MENUS.court=MENUS.burger;
function posterT(i){return canvasTex(128,192,function(c,w,h){var f=FILMS[i%FILMS.length],cols=[['#ff8a3d','#2a1a12'],['#ff79b4','#ffe3ec'],['#14161c','#ffd24a'],['#0a0a14','#8fa88a']][i%4];c.fillStyle=cols[0];c.fillRect(0,0,w,h);c.fillStyle=cols[1];c.beginPath();c.arc(w/2,h*.45,34,0,7);c.fill();c.fillStyle='#fff';c.font='bold 13px system-ui';c.textAlign='center';var ws=f.n.split(' ');c.fillText(ws.slice(0,2).join(' '),w/2,h-36);c.fillText(ws.slice(2).join(' '),w/2,h-20);},null,'poster'+i);}
