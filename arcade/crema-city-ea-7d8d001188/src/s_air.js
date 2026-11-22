
/* ---------- the airport, in detail ---------- */
function airportDetail(){
  var p=plan,AX=p.AX,AZ=p.AZ,fx=AX-22,keep=stat;stat=new T.Group();var g=stat;
  // a curved roof over the terminal, and the airline's name on top
  var roof=cy(26,26,82,toon(0xd8dee6),AX,-12,AZ,g,28);roof.rotation.x=Math.PI/2;roof.scale.set(1,1,1);
  plane(18,3,flat(0xffffff,{map:signT('AIR CREMA',{bg:'#2f8fd0',fg:'#ffffff',w:768,h:128})}),fx-.6,15.6,AZ-24,g).rotation.y=-Math.PI/2;
  // runway markings: numbers, threshold stripes, taxiway lines, approach lights
  var rx=AX+80;[['36',AZ+240,0],['18',AZ-240,Math.PI]].forEach(function(q){var n=plane(10,7,flat(0xffffff,{map:signT(q[0],{bg:'rgba(0,0,0,0)',fg:'#ffffff',w:256,h:180})}),rx,.05,q[1],g);n.rotation.x=-Math.PI/2;n.rotation.z=q[2];
    for(var k=-6;k<=6;k++){if(k===0)continue;var st=plane(1,12,toon(0xffffff),rx+k*2.4,.045,q[1]+(q[2]?-14:14),g);st.rotation.x=-Math.PI/2;}
    for(var a=1;a<6;a++){sp(.35,MAT.lamp,rx,.3,q[1]+(q[2]?-1:1)*(14+a*8),g,6);}});
  for(var t=-12;t<=12;t++){var tl=plane(.35,6,toon(0xf2c94c),AX+55,.03,AZ+t*9,g);tl.rotation.x=-Math.PI/2;}
  for(t=0;t<3;t++){var cn=plane(.35,26,toon(0xf2c94c),AX+42+t*.1,.03,AZ-22+t*22,g);cn.rotation.x=-Math.PI/2;cn.rotation.z=Math.PI/2;}
  // a shuttle bus at the curb, a hotel shuttle sign, bollards, benches
  var sb=carModel('bus');sb.position.set(p.CX+RH-1.4,0,AZ-26);sb.rotation.y=Math.PI;g.add(sb);
  for(var b=-6;b<=6;b++)cyB(.16,.9,toon(0x3a3f4b),fx-6.5,.2,AZ+b*5,g,8);
  for(b=-2;b<=2;b++)bench(g,fx-3.2,AZ+b*12+6,-Math.PI/2);
  O.scene.add(mergeGroup(stat));stat=keep;
  // things that move: radar, windsock, baggage tugs, a fuel truck
  var tw=new T.Group();tw.position.set(AX+30,32,AZ-56);dyn.add(tw);var rd=new T.Group();tw.add(rd);bx(4,.6,.2,toon(0xffffff),0,0,0,rd);cyB(.15,1,toon(0x8a8f99),0,-1,0,tw,6);anim.push({radar:rd});
  var ws=new T.Group();ws.position.set(rx+22,0,AZ+60);dyn.add(ws);cyB(.08,6,toon(0xd8d8d8),0,0,0,ws,6);var sock=new T.Group();sock.position.y=6;ws.add(sock);var sk=cone(.5,2.6,toon(0xffffff,{map:stripeT(0xff6b2b,0xffffff)}),0,0,1.3,sock,10);sk.rotation.x=-Math.PI/2;anim.push({sock:sock});
  for(var k2=0;k2<3;k2++){var tg=new T.Group();dyn.add(tg);rb(1.6,1,2.2,.15,toon(0xffc63d),0,.7,0,tg);for(var c=1;c<4;c++){rb(1.4,.9,1.8,.1,toon(0x8a8f99),0,.7,-c*2.3,tg);rb(1,.6,1.2,.1,toon(pick([0x2f5a46,0x8a2a3a,0x2a3a6a,0x3a3f4b])),0,1.4,-c*2.3,tg);}tg.position.set(AX+34+k2*6,0,AZ);anim.push({tug:tg,z0:AZ-40,z1:AZ+40,t:k2*2.1});}
  var ft=carModel('delivery',0xffffff);ft.position.set(AX+50,0,AZ+18);dyn.add(ft);
}
function terminalDetail(g,ox){
  // queue lines (posts and belts) in front of check-in
  for(var r=0;r<3;r++){for(var k=0;k<6;k++){cyB(.05,1,toon(0xd4af37),-28+k*2,0,.4-r*1.4,g,6);}bx(10,.08,.04,toon(0x2a3a6a),-23,.9,.4-r*1.4,g);}
  // a baggage belt behind the counters, and the screens above them
  bx(14,.5,1,toon(0x3a3f4b),-23,.6,6.2,g);for(var b=0;b<6;b++)rb(.6,.4,.4,.05,toon(pick([0x2f5a46,0x8a2a3a,0x2a3a6a,0xffc63d])),-28+b*2.2,1.05,6.2,g);
  for(var s=0;s<3;s++){plane(2,.8,flat(0xffffff,{map:signT('AIR CREMA · ALL FLIGHTS',{bg:'#14161c',fg:'#7fe3a2',w:512,h:160})}),-27+s*4.2,3,5.9,g).rotation.y=Math.PI;}
  // duty free
  var df=new T.Group();df.position.set(18,0,14);g.add(df);bx(10,3.4,.2,toon(0xffffff),0,1.7,2.6,df);for(var i=0;i<3;i++){rb(2.4,1.6,.7,.04,toon(0x2a2a30),-3.5+i*3.5,.8,1.6,df);for(var j=0;j<8;j++)bx(.22,.4,.22,toon([0xd4af37,0xe2553f,0x46a9e6,0xff79b4][j%4]),-4.3+i*3.5+j*.24,1.8,1.6,df);}
  plane(4,.8,flat(0xffffff,{map:signT('DUTY FREE',{bg:'#2a2a30',fg:'#d4af37',w:512,h:100})}),0,3.6,1.4,df).rotation.y=Math.PI;addCol(ox+12.5,ox+23.5,15.2,17,'terminal');
  // restrooms, charging stations, a coffee cart that isn't yours (yet)
  plane(2.6,.7,flat(0xffffff,{map:signT('RESTROOMS ›',{bg:'#2a3a6a',fg:'#fff',w:384,h:100})}),31,3.6,-1,g).rotation.y=-Math.PI/2;
  for(i=0;i<4;i++){rb(.4,1.1,.4,.05,toon(0x3a3f4b),9+i*4.6,.55,-2.8,g);plane(.25,.3,flat(0x7fe3a2),9+i*4.6,.85,-2.59,g);}
}
var travelers=[];
function initTravelers(){var A=AREAS.terminal;if(!A)return;for(var i=0;i<6;i++){var me=liteMe({shirt:pick(SHIRTC)}),bag=new T.Group();bag.position.set(.35,0,-.35);me.root.add(bag);rb(.4,.6,.25,.05,toon(pick([0x2f5a46,0x8a2a3a,0x2a3a6a,0x3a3f4b])),0,.35,0,bag);cyB(.02,.5,toon(0x8a8f99),0,.65,0,bag,4);
  dyn.add(me.root);var t={me:me,x:A.ox+rnd(-28,0),z:rnd(-6,12),tx:0,tz:0,w:0};t.tx=t.x;t.tz=t.z;travelers.push(t);}}
function updTravelers(dt){travelers.forEach(function(s){if(s.w>0){s.w-=dt;animLite(s.me,dt,false);return;}var dx=s.tx-s.x,dz=s.tz-s.z,d=Math.hypot(dx,dz);if(d<.3){s.w=rnd(1,5);var A=AREAS.terminal;s.tx=A.ox+pick([-24,-20,-14,-8,-2,-6])+rnd(-1,1);s.tz=rnd(-6,12);return;}
  s.x+=dx/d*1.3*dt;s.z+=dz/d*1.3*dt;s.me.root.position.set(s.x,0,s.z);s.me.root.rotation.y=Math.atan2(dx,dz);animLite(s.me,dt,true);});}
/* security: no boarding pass, no gate */
var secPrevX=0,annT=20;
function updSecurity(dt){if(P.area!=='terminal'){secPrevX=0;return;}var A=AREAS.terminal,gx=A.ox+3;
  if(secPrevX&&secPrevX<gx&&P.x>=gx-.1){if(!myTicket()){P.x=gx-1.2;popup('Security','"Boarding pass, please." ... "Sorry, without a ticket you can\'t go through to the gates. The Air Crema counter is by the entrance."',[{t:'OK'}],'',{who:'TSA officer',role:'Security',col:'#2a3a6a'});try{tone(220,.3,'square',.04);}catch(e){}}
    else{try{tone(880,.12,'sine',.03);}catch(e){}bubble(gx,2.6,P.z,'Have a nice flight!','good');}}
  secPrevX=P.x;annT-=dt;if(annT<=0){annT=rnd(25,40);var t=myTicket(),c=t?cityName(t.to):pick(['Bayside','Summit City','Port Royale']);note('Announcement','"Air Crema flight '+(10+(t?t.to:2)*7)+' to '+c+' is now boarding at gate B4."','info');}}
