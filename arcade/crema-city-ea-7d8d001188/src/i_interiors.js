
/* ---------- interiors: real rooms you walk through ---------- */
var IOX={supply:-3000,hall:-3200,bank:-3400,terminal:-3700,super:-4000};
function floorT(a,b,s){return tx('fl'+a+b+s,128,128,function(g,w,h){var n=s||4,c=w/n;for(var y=0;y<n;y++)for(var x=0;x<n;x++){g.fillStyle=(x+y)%2?hexCss(a):hexCss(b);g.fillRect(x*c,y*c,c,c);}speck(g,w,h,200,.04);});}
function room(id,o){
  var ox=IOX[id],w=o.w,d=o.d,g=new T.Group();g.position.set(ox,0,0);stat.add(g);curArea=id;ACTS[id]=[];
  var f=planeR(w,d,w/(o.tile||4),d/(o.tile||4),toon(0xffffff,{map:o.floor}),0,0,0,g);f.rotation.x=-Math.PI/2;var mat=plane(w+8,14,toon(o.outside||0x6b5a4a),0,-.02,d/2+7,g);mat.rotation.x=-Math.PI/2;var rug=plane(3.2,2.2,toon(0x8a2a3a),o.doorX||0,.01,d/2-1.4,g);rug.rotation.x=-Math.PI/2;
  var wm=toon(o.wall),hgt=o.h||5.2;bx(w,hgt,.3,wm,0,hgt/2,-d/2,g);bx(.3,hgt,d,wm,-w/2,hgt/2,0,g);bx(.3,hgt,d,o.eastGlass?glass(0x9fd2f2,.3):wm,w/2,hgt/2,0,g);
  bx(w,.4,.32,toon(o.trim||0xffffff),0,hgt,-d/2,g);
  var dx=o.doorX||0;bx((w/2+dx)-1.6,1.1,.3,wm,(-w/2+dx-1.6)/2,.55,d/2,g);bx((w/2-dx)-1.6,1.1,.3,wm,(w/2+dx+1.6)/2,.55,d/2,g);
  bx(.3,3,.3,toon(o.trim||0xffffff),dx-1.6,1.5,d/2,g);bx(.3,3,.3,toon(o.trim||0xffffff),dx+1.6,1.5,d/2,g);bx(3.5,.35,.35,toon(o.trim||0xffffff),dx,3,d/2,g);
  addCol(ox-w/2-1,ox-w/2+.25,-d/2,d/2);addCol(ox+w/2-.25,ox+w/2+1,-d/2,d/2);addCol(ox-w/2,ox+w/2,-d/2-1,-d/2+.25);addCol(ox-w/2,ox+dx-1.5,d/2-.2,d/2+1);addCol(ox+dx+1.5,ox+w/2,d/2-.2,d/2+1);
  AREAS[id]={id:id,name:o.name,ox:ox,w:w,d:d,bgC:new T.Color(o.bg||0x3a2a22),spawn:{x:ox+dx,z:d/2-1.6},b:{x0:ox-w/2+.5,x1:ox+w/2-.5,z0:-d/2+.5,z1:d/2+.4},cam:o.cam||{dist:10,pitch:.66}};
  ACTS[id].push({x:ox+dx,z:d/2-.3,r:1.6,door:true,out:true,label:'Go back outside',sub:o.name,fn:function(){leaveArea();}});
  return g;
}
function npc(g,x,z,ry,o){var m=liteMe(o||{});m.root.position.set(x,0,z);m.root.rotation.y=ry||0;g.add(m.root);return m;}
function counterTop(g,x,z,w,col,top){rb(w,1.05,.8,.06,toon(col),x,.52,z,g);bx(w+.1,.08,.9,toon(top||0xf4efe6),x,1.08,z,g);}
function wallSign(g,text,x,y,z,o){o=o||{};var p=plane(o.w||4,o.h||.8,flat(0xffffff,{map:signT(text,{bg:o.bg||'#2a1a12',fg:o.fg||'#ffc63d',w:768,h:Math.round(768*(o.h||.8)/(o.w||4)),sub:o.sub})}),x,y,z,g);if(o.ry)p.rotation.y=o.ry;return p;}

function buildInteriors(){
  var keep=stat;stat=new T.Group();
  supplyRoom();hallRoom();bankRoom();terminalRoom();if(superOf())superRoom();
  curArea='city';O.scene.add(mergeGroup(stat));stat=keep;
}
function supplyRoom(){
  var g=room('supply',{name:'Crema Supply Co.',w:18,d:13,floor:floorT(0xe6ddcc,0xdcd2c0,4),wall:0x4f7fb0,bg:0x2a3a4e});
  wallSign(g,'Crema Supply Co.',0,4,-6.3,{bg:'#ffffff',fg:'#2f5f90',w:6,h:1.1});
  var ox=IOX.supply;O.shelves=[];
  SUP_ORDER.forEach(function(k,i){var sx=-6+(i%3)*6,sz=i<3?-3.6:.8;var sh=new T.Group();sh.position.set(sx,0,sz);g.add(sh);
    rb(4,.15,1.2,.04,toon(0xb88a5a),0,.6,0,sh);rb(4,.15,1.2,.04,toon(0xb88a5a),0,1.5,0,sh);[-1.9,1.9].forEach(function(px){bx(.12,2.2,1.2,toon(0x8a5a3a),px,1.1,0,sh);});
    for(var j=0;j<4;j++){crate(k,sh,-1.4+j*.95,.95,0);crate(k,sh,-1.4+j*.95,1.85,0);}
    plane(3,.6,flat(0xffffff,{map:signT(SUP[k].name,{bg:'#ffffff',fg:'#2a1a12',w:512,h:100})}),0,2.5,.62,sh);
    addCol(ox+sx-2,ox+sx+2,sz-.6,sz+.6,'supply');
    ACTS.supply.push({x:ox+sx,z:sz+1.2,r:1.5,label:function(){return P.carry.length>=2?'Your hands are full':'Grab '+SUP[k].name+' · '+fmt(supPrice(k));},sub:'+'+SUP[k].u+' supplies for '+SUP[k].inds.map(function(q){return IND[q].name.toLowerCase();}).join(', '),
      fn:function(){if(P.carry.length>=2){popup('Two crates at a time','Carry these out to your pickup (or straight to a shop or truck) first.',[{t:'OK'}]);return;}var c=supPrice(k);if(!pay(c,SUP[k].name))return;P.carry.push(k);carryView();save();}});});
  counterTop(g,5.5,4.3,3,0xe2553f);bx(.5,.35,.4,toon(0x3a3f4b),6,1.3,4.3,g);var ck=npc(g,5.5,3.6,0,{shirt:0x4f7fb0});addCol(ox+4,ox+7,3.8,4.8,'supply');
  ACTS.supply.push({x:ox+5.5,z:5.4,r:1.6,label:'Talk to the clerk',sub:'Order a delivery to any shop',fn:function(){orderDelivery(null,true);}});
  for(var i=0;i<5;i++){var pl=bx(1.1,.15,1.1,toon(0xb88a5a),-7.5,.08,4.8-i*1.4,g);rb(.9,.9,.9,.05,toon(0xd9c39a),-7.5,.6,4.8-i*1.4,g);}addCol(ox-8.2,ox-6.8,-1,5.5,'supply');
}
function hallRoom(){
  var g=room('hall',{name:'City Hall',w:24,d:17,floor:floorT(0xf4efe6,0xd8cfbe,4),wall:0xece4d6,trim:0xc8b89a,bg:0x4a3c30,h:6});
  var ox=IOX.hall;wallSign(g,'CITY OF '+plan.name.toUpperCase(),0,4.8,-8.3,{bg:'#f1ebdf',fg:'#5a4a38',w:8,h:1});
  var seal=new T.Mesh(new T.CircleGeometry(1.1,28),toon(0xffffff,{map:flagTex()}));seal.position.set(0,3.2,-8.33);g.add(seal);
  [['PERMITS',-7,'#2f8fd0'],['TAXES',0,'#2fa860'],['ELECTIONS',7,'#7a5ad8']].forEach(function(q,i){var x=q[1];counterTop(g,x,-6,4.4,0xc8b89a,0xf4efe6);bx(4.4,1.4,.06,glass(0xdff2ff,.4),x,1.8,-5.9,g);
    wallSign(g,q[0],x,3.4,-8.3,{bg:q[2],fg:'#fff',w:3.6,h:.7});npc(g,x,-7,0,{shirt:[0x2f8fd0,0x2fa860,0x7a5ad8][i]});addCol(ox+x-2.3,ox+x+2.3,-8.5,-5.5,'hall');});
  for(var r=0;r<2;r++)for(var c=0;c<6;c++){var sx=-7.5+c*3,sz=1+r*2.6;bx(.9,.08,.8,toon(0x8a5a3a),sx,.5,sz,g);bx(.9,.7,.08,toon(0x8a5a3a),sx,.85,sz+.38,g);if((r*6+c)%3===0){var s=liteMe();s.sit=true;s.root.position.set(ox+sx,.12,sz);s.root.rotation.y=Math.PI;dyn.add(s.root);anim.push({me:s,sit:1});}}
  addCol(ox-8.2,ox+8.2,.5,1.4,'hall');addCol(ox-8.2,ox+8.2,3.1,4,'hall');
  var nb=canvasTex(256,96,function(){},null);hallBoard={t:nb,n:20+Math.floor(Math.random()*30),last:0};var bp=plane(2.6,1,flat(0xffffff,{map:nb}),9.5,3.6,-8.3,dyn);bp.position.x+=ox;drawBoard();
  [-11,11].forEach(function(x){cyB(.05,4.2,toon(0xc8c8c8),x,0,-7.5,g,6);var fl=plane(1.3,.85,toon(0xffffff,{map:flagTex(),ds:1}),x+.7,3.7,-7.5,g);});
  var mayor=civ().mayor;var por=plane(1.4,1.8,toon(0xffffff,{map:canvasTex(160,200,function(cx,w2,h2){cx.fillStyle='#e6d4b0';cx.fillRect(0,0,w2,h2);cx.fillStyle='#8a5a3a';cx.fillRect(6,6,w2-12,h2-12);cx.fillStyle='#ffdcc0';cx.beginPath();cx.arc(w2/2,80,38,0,7);cx.fill();cx.fillStyle='#2a1a12';cx.fillRect(w2/2-50,120,100,70);cx.fillStyle='#fff';cx.font='700 16px '+FD;cx.textAlign='center';cx.fillText(mayor?'MAYOR (YOU)':'MAYOR ROWE',w2/2,190);},null,'mayor'+O.city+(mayor?1:0))}),-11.6,3,-4,g);por.rotation.y=Math.PI/2;
  ACTS.hall.push({x:ox-7,z:-4.6,r:1.8,label:'Permits window',sub:'Street vending · commercial zoning · block parties · regional offices',fn:permitsWindow});
  ACTS.hall.push({x:ox,z:-4.6,r:1.8,label:'Taxes window',sub:function(){var u=unpaid();return u.length?plural(u.length,'unpaid bill')+' · '+fmt(u.reduce(function(s,b){return s+b.amt;},0)):'All paid up';},fn:taxWindow});
  ACTS.hall.push({x:ox+7,z:-4.6,r:1.8,label:'Elections office',sub:function(){var v=civ();return v.mayor?'You are the mayor':v.council?'You hold a council seat':'Run for city council';},fn:electionsWindow});
  if(mayor){bx(1.4,2.6,.15,toon(0x6b4a30),11.85,1.3,2,g).rotation.y=Math.PI/2;ACTS.hall.push({x:ox+10.8,z:2,r:1.6,label:'Mayor\'s office',sub:'Set city policy',fn:policyDesk});}
}
var hallBoard=null;
function drawBoard(){if(!hallBoard)return;var c=hallBoard.t.userData.canvas,g=c.getContext('2d');g.fillStyle='#1a1a1e';g.fillRect(0,0,256,96);g.fillStyle='#ff5a3a';g.font='700 22px '+FB;g.textAlign='center';g.fillText('NOW SERVING',128,32);g.font='700 44px '+FD;g.fillText('A-'+hallBoard.n,128,80);hallBoard.t.needsUpdate=true;}
function bankRoom(){
  var g=room('bank',{name:'Crema Savings & Loan',w:20,d:15,floor:floorT(0xe8e2d6,0xc8bfae,4),wall:0xe6e1d6,trim:0x2f5a46,bg:0x2e3a34,h:6});
  var ox=IOX.bank;wallSign(g,'CREMA SAVINGS & LOAN',0,4.8,-7.3,{bg:'#2f5a46',fg:'#fff6e6',w:7,h:.8});
  for(var i=0;i<3;i++){var x=-6+i*4;counterTop(g,x,-4.4,3.4,0x6b4a30,0xe8e2d6);bx(3.4,1.6,.06,glass(0xdff2ff,.45),x,1.9,-4.3,g);npc(g,x,-5.3,0,{shirt:0x2f5a46});}addCol(ox-7.8,ox+.2,-5.6,-3.9,'bank');
  var vt=new T.Group();vt.position.set(6,2.4,-7.3);g.add(vt);var vd=cy(1.9,1.9,.5,toon(0xb8bcc2),0,0,.2,vt,28);vd.rotation.x=Math.PI/2;var hub=cy(.4,.4,.3,toon(0x8a8f99),0,0,.55,vt,16);hub.rotation.x=Math.PI/2;
  for(var k=0;k<4;k++){var sp2=bx(2.4,.12,.12,toon(0x8a8f99),0,0,.6,vt);sp2.rotation.z=k*Math.PI/4;}
  bx(2.6,1,1.3,toon(0x6b4a30),6,.5,1.5,g);npc(g,6,.4,Math.PI*0,{shirt:0x3a3f4b});bx(.6,.4,.5,toon(0x2a2a30),6,1.2,1.4,g);addCol(ox+4.7,ox+7.3,.8,2.2,'bank');
  for(k=0;k<5;k++){cyB(.06,1,toon(0xd4af37),-7+k*1.6,0,-1,g,8);sp(.09,toon(0xd4af37),-7+k*1.6,1,-1,g,8);}bx(6.4,.06,.06,toon(0xa82a3a),-3.8,.85,-1,g);
  ACTS.bank.push({x:ox-2,z:-3.2,r:2.4,label:'Teller',sub:'Savings account',fn:function(){W4().bank.visited=true;bankWindow('sav');}});
  ACTS.bank.push({x:ox+6,z:2.8,r:1.8,label:'Loan officer',sub:function(){return 'Borrow up to '+fmt(loanLimit());},fn:function(){W4().bank.visited=true;bankWindow('loan');}});
  ACTS.bank.push({x:ox+8,z:-5,r:1.8,label:'Look at the vault',sub:'Insurance desk is next to it',fn:function(){bankWindow('ins');}});
}
/* the terminal: check-in, security, concourse shops, the gate, and a real jet out the window */
function terminalRoom(){
  var g=room('terminal',{name:plan.name+' International · Terminal',w:66,d:34,floor:floorT(0xdfe4ea,0xc9d1da,2),tile:3,outside:0x6b6f78,wall:0xe8eef2,trim:0x2f8fd0,bg:0x23384a,h:7,doorX:-14,eastGlass:1,cam:{dist:12,pitch:.6}});
  var ox=IOX.terminal;
  for(var mu=-3;mu<=3;mu++)bx(.3,7,.3,toon(0xc8d0d8),33,3.5,mu*5,g);
  var jet=planeModel(0xe2553f);jet.position.set(ox+46,0,-2);jet.rotation.y=0;stat.add(jet);var ap=planeR(40,60,4,6,toon(0xffffff,{map:asphaltT()}),46,-.02,0,g);ap.rotation.x=-Math.PI/2;
  bx(10,2.6,2.6,toon(0xd8dee6),38,4.4,4,g);
  // check-in
  for(var i=0;i<3;i++){var x=-27+i*4.2;counterTop(g,x,4,3,0xffffff,0x2f8fd0);npc(g,x,5,Math.PI,{shirt:0x2f8fd0});bx(.8,.3,.8,toon(0x3a3f4b),x+1.6,.15,3.3,g);}
  wallSign(g,'AIR CREMA · CHECK-IN',-23,3.2,5.6,{bg:'#2f8fd0',fg:'#fff',w:9,h:.9,ry:Math.PI});addCol(ox-29,ox-16.5,3.5,4.5,'terminal');
  ACTS.terminal.push({x:ox-23,z:2.4,r:3.2,label:'Air Crema ticket counter',sub:function(){var t=myTicket();return t?'Your boarding pass: '+cityName(t.to):'Buy a ticket to another city';},fn:function(){flightsDesk(true);}});
  // departures board
  var db=canvasTex(512,256,function(){},null);depBoard={t:db,last:0};var dbp=plane(7,3.5,flat(0xffffff,{map:db}),-2+ox,4.4,-16.8,dyn);drawDepartures();
  // rental cars
  counterTop(g,-28,11,3.2,0xffc63d,0xffffff);npc(g,-28,12,Math.PI,{shirt:0xffc63d});wallSign(g,'RENT-A-CAR',-28,2.8,12.5,{bg:'#ffc63d',fg:'#2a1a12',w:3.2,h:.7,ry:Math.PI});addCol(ox-29.8,ox-26.2,10.4,11.6,'terminal');
  ACTS.terminal.push({x:ox-28,z:9.6,r:1.8,label:'Rent-a-car',sub:function(){return myVeh()?'You already have a car in '+plan.name:'A car for this city · '+fmt(rentalCost());},fn:rentCar});
  // security splits landside and airside
  addCol(ox+2.6,ox+3.4,-17,-5,'terminal');addCol(ox+2.6,ox+3.4,-1,1,'terminal');addCol(ox+2.6,ox+3.4,5,17,'terminal');
  bx(.8,3.2,12,toon(0xd8dee6),3,1.6,-11,g);bx(.8,3.2,2,toon(0xd8dee6),3,1.6,0,g);bx(.8,3.2,12,toon(0xd8dee6),3,1.6,11,g);
  [-3,3].forEach(function(z){var ar=new T.Group();ar.position.set(3,0,z);g.add(ar);bx(.25,2.4,.25,toon(0x9aa2ac),0,1.2,-1,ar);bx(.25,2.4,.25,toon(0x9aa2ac),0,1.2,1,ar);bx(.25,.3,2.25,toon(0x9aa2ac),0,2.4,0,ar);
    var cv=bx(3,.8,.9,toon(0x5a5f6a),-.5,.4,z>0?2.3:-2.3,g);});
  var bag=bx(.7,.4,.5,toon(0x2f5a46),2,1.05,-5.3,dyn);bag.position.x+=ox;anim.push({bag:bag,x0:ox+.5,x1:ox+4});
  npc(g,4.5,-4.2,-Math.PI/2,{shirt:0x2a3a6a});npc(g,4.5,4.2,-Math.PI/2,{shirt:0x2a3a6a});
  wallSign(g,'SECURITY',3,3.9,-5.4,{bg:'#2a3a6a',fg:'#fff',w:3,h:.6});
  secGates=[{x:ox+3,z:-3},{x:ox+3,z:3}];
  // gate area
  for(var r=0;r<3;r++)for(var c=0;c<5;c++){var sx=10+c*3.6,sz=-1+r*3.2;bx(3,.1,.7,toon(0x2f8fd0),sx,.48,sz,g);bx(3,.6,.1,toon(0x2f8fd0),sx,.8,sz+.33,g);if((r+c)%2===0){var sitter=liteMe();sitter.sit=true;sitter.root.position.set(sx+rnd(-1,1),.1,sz);sitter.root.rotation.y=Math.PI;g.add(sitter.root);}}
  for(r=0;r<3;r++)addCol(ox+8.4,ox+27.8,-1.4+r*3.2,-.5+r*3.2,'terminal');
  counterTop(g,28,12,3.4,0x2f8fd0,0xffffff);npc(g,28,13,Math.PI,{shirt:0x2f8fd0});wallSign(g,'GATE B4 · AIR CREMA',32.7,4,9,{bg:'#2f8fd0',fg:'#fff',w:5,h:.9,ry:-Math.PI/2});addCol(ox+26.2,ox+29.8,11.4,12.6,'terminal');
  ACTS.terminal.push({x:ox+28,z:10.4,r:2,label:function(){var t=myTicket();return t?'Board your flight to '+cityName(t.to):'Gate B4';},sub:function(){var t=myTicket();return t?'Air Crema · Gate B4 · now boarding':'You need a ticket from the counter';},fn:function(){var t=myTicket();if(!t){popup('No boarding pass','"Sorry, I can only board passengers with a ticket. The Air Crema counter is by the entrance."',[{t:'OK'}],'',{who:'Gate agent',col:'#2f8fd0'});return;}board(t);}});
  // concourse shops (the Airport Terminal district)
  if(plan.air){var D=plan.air,keepA=ACTS.city;ACTS.city=ACTS.terminal;var mine=myLocIn(D),xs=[-24,-12.5,13,24.5],w=W4();
    xs.forEach(function(x,i){var lot={s:1,i:i,x:ox+x,z:-17+BDEP,ry:0,b:{D:D,id:D.id,x:ox,z:0},w:LOTW,key:O.city+':'+D.id+':1:'+i};
      var mineKey=mine?(mine.w4lot||O.city+':'+D.id+':1:1'):null;
      if(mine&&lot.key===mineKey){addShopAct(shopFront(lot,mine,D));return;}
      if(mine&&mine.comp&&lot.key===O.city+':'+D.id+':1:'+(mineKey.slice(-1)==='2'?1:2)){rivalFront(lot,mine,D);return;}
      var site=w.builds.filter(function(q){return q.key===lot.key;})[0];if(site){siteLot(lot,site,D);return;}
      var own=w.land[lot.key];if(own&&own.use){landUse(lot,lot.b,D,lot.key,own);return;}
      forSaleLot(lot,D,lot.key);});
    ACTS.city=keepA;}
  for(i=0;i<6;i++){var px=-6+i*1.5;cyB(.4,.8,toon(0x8a5a3a),px,0,15,g,10);sp(.6,toon(0x5fb35a),px,1.2,15,g,10);}
  var cp=plane(24,14,toon(0x2f6f9f),18,.01,4,g);cp.rotation.x=-Math.PI/2;
  [-20,-8,8,20].forEach(function(cx){[-4,8].forEach(function(cz){cyB(.45,7,toon(0xffffff),cx,0,cz,g,12);addCol(ox+cx-.5,ox+cx+.5,cz-.5,cz+.5,'terminal');});});
  for(var lx2=-28;lx2<=28;lx2+=8){bx(5,.12,.6,MAT.lamp,lx2,6.8,-2,g);bx(5,.12,.6,MAT.lamp,lx2,6.8,9,g);}
  [['GATES B1–B8 ›',10,-4.6],['‹ EXIT · TAXIS',-14,14],['CHECK-IN',-23,6]].forEach(function(q){var sg=plane(4,.7,flat(0xffffff,{map:signT(q[0],{bg:'#ffc63d',fg:'#2a1a12',w:512,h:90})}),q[1],4.8,q[2],g);if(q[2]>10)sg.rotation.y=Math.PI;cyB(.03,1.2,toon(0x333333),q[1],5.2,q[2],g,4);});
}
var depBoard=null,secGates=[];
function drawDepartures(){if(!depBoard)return;var c=depBoard.t.userData.canvas,g=c.getContext('2d');g.fillStyle='#14161c';g.fillRect(0,0,512,256);g.fillStyle='#ffc63d';g.font='700 26px '+FD;g.textAlign='left';g.fillText('DEPARTURES',18,34);
  g.font='700 18px '+FB;var row=0,base=Math.floor(clockH*60/20);
  flightList().slice(0,6).forEach(function(f,i){var y=70+i*30,t=(base+i*2)*20/60;g.fillStyle='#e8eef2';g.fillText(clockStrH(t+1),18,y);g.fillText(f.name.toUpperCase(),120,y);g.fillStyle=f.ok?'#7fe3a2':'#ff8a7a';g.fillText(f.ok?(i===0?'BOARDING':'ON TIME'):'LVL '+f.req,370,y);g.fillStyle='#9fb4c8';g.fillText('B'+(4+i),470,y);});
  depBoard.t.needsUpdate=true;}
function superRoom(){
  var S=superOf(),g=room('super',{name:'Crema Superstore',w:42,d:28,floor:floorT(0xead9bd,0xdcc4a0,4),wall:0xf4e4c8,trim:0x2a1a12,bg:0x3a2a22,h:6.5,cam:{dist:11,pitch:.62}}),ox=IOX.super;
  bx(42,1.2,.1,toon(0x8a5a3a),0,.6,-13.8,g);bx(.1,1.2,28,toon(0x8a5a3a),-20.8,.6,0,g);bx(.1,1.2,28,toon(0x8a5a3a),20.8,.6,0,g);
  [[-8,-3],[8,-3],[-8,5],[8,5]].forEach(function(q){cyB(.35,6.5,toon(0xffffff),q[0],0,q[1],g,12);addCol(ox+q[0]-.4,ox+q[0]+.4,q[1]-.4,q[1]+.4,'super');});
  for(var bn=0;bn<6;bn++){var bp=plane(1.4,2.2,toon([0xe2553f,0xffc63d,0x2f8fd0,0x6cc76a,0xff79b4,0x7a5ad8][bn],{ds:1}),-12.5+bn*5,4.6,2,g);cy(.03,.03,1.6,toon(0x333333),-12.5+bn*5,5.75,2,g,6).rotation.z=Math.PI/2;}
  for(var lx=-15;lx<=15;lx+=7.5)for(var lz=-6;lz<=8;lz+=7){sp(.3,MAT.lamp,lx,6,lz,g,10);cyB(.02,.6,toon(0x333333),lx,6,lz,g,4);}
  var fs=new T.Group();fs.position.set(-12,0,10.5);g.add(fs);rb(2.6,.8,1.2,.06,toon(0x6b4a30),0,.4,0,fs);for(var fl2=0;fl2<10;fl2++)sp(.22,toon([0xff6b8f,0xffc63d,0xffffff,0xb39ddb,0xe2553f][fl2%5]),-1.1+fl2*.25,1,(fl2%2)*.3-.15,fs,8);addCol(ox-13.4,ox-10.6,9.8,11.2,'super');
  for(var ct=0;ct<5;ct++){var cg=new T.Group();cg.position.set(13+ct*.45,0,11);g.add(cg);bx(.6,.45,.8,toon(0xc8ccd2),0,.75,0,cg);}
  wallSign(g,'CREMA SUPERSTORE',0,5.4,-13.8,{bg:'#2a1a12',fg:'#ffc63d',w:10,h:1.1});
  var bays=[[-15,-11,0],[-5,-11,0],[5,-11,0],[15,-11,0],[-18,0,Math.PI/2],[-18,7,Math.PI/2],[18,0,-Math.PI/2],[18,7,-Math.PI/2]];
  DEPT_ORDER.forEach(function(k,i){var b=bays[i],d=DEPTS[k],lv=S.depts[k]||0,bg=new T.Group();bg.position.set(b[0],0,b[1]);bg.rotation.y=b[2];g.add(bg);
    var col=d.ind?IND[d.ind].theme.wall:k==='kitchen'?0xe2553f:k==='grocery'?0x6cc76a:k==='rest'?0x9cc0de:0xffc63d,bldg=W4().builds.some(function(q){return q.kind==='dept'&&q.dept===k&&cityOfLot(q.key)===O.city;});
    var fl=plane(8,5,toon(lv?col:0xe8e2d6),0,.01,0,bg);fl.rotation.x=-Math.PI/2;
    if(lv){
      if(d.ind){var th=IND[d.ind].theme;counterTop(bg,0,-.5,6,th.counter,th.top);rb(.9,.6,.5,.05,toon(th.stn),-1.6,1.4,-.7,bg);bx(6.6,2.6,.2,toon(th.wall2),0,2.4,-2.4,bg);npc(bg,-1,-1.4,0,{apron:th.accent});if(lv>1)npc(bg,1.4,-1.4,0,{apron:th.accent});}
      else if(k==='kitchen'){for(var t=0;t<3;t++){cyB(.6,.75,toon(0xffffff),-2.4+t*2.4,0,.6,bg,14);var s=liteMe();s.sit=true;s.root.position.set(-2.4+t*2.4+.8,.1,.6);s.root.rotation.y=-Math.PI/2;bg.add(s.root);anim.push({me:s,sit:1});}counterTop(bg,0,-1.8,6,0x3a3f4b,0xd8dde4);npc(bg,0,-2.6,0,{apron:0xffffff});}
      else if(k==='grocery'){for(var a=0;a<3;a++){rb(1,1.6,4,.05,toon(0xd8dde4),-2.6+a*2.6,.8,0,bg);for(var q=0;q<6;q++)bx(.8,.3,.5,toon(pick(SHIRTC)),-2.6+a*2.6,.5+(q%3)*.5,-1.2+Math.floor(q/3)*2,bg);}}
      else if(k==='rest'){bx(6.6,2.8,.2,toon(0x9cc0de),0,1.4,-2.4,bg);[-1.4,1.4].forEach(function(x){bx(1.1,2.2,.1,toon(0x6b4a30),x,1.1,-2.25,bg);plane(.6,.6,flat(0xffffff,{map:signT(x<0?'M':'W',{bg:'#2a3a6a',fg:'#fff',w:128,h:128})}),x,2.5,-2.2,bg);});}
      else{for(var bl=0;bl<40;bl++)sp(.18,toon([0xe2553f,0xffc63d,0x46a9e6,0x6cc76a][bl%4]),rnd(-2.6,2.6),.2+rnd(0,.25),rnd(-1.6,1.6),bg,8);bx(6,.5,.12,toon(0xff79b4),0,.25,2,bg);}
      wallSign(bg,d.n+(lv>1?' · Lv '+lv:''),0,3.6,-2.3,{bg:'#2a1a12',fg:'#ffc63d',w:4.6,h:.75});
    }else{for(var e=-1;e<=1;e+=2){bx(8,.02,.12,toon(0xffc63d),0,.02,e*2.4,bg);bx(.12,.02,4.8,toon(0xffc63d),e*4,.02,0,bg);}
      wallSign(bg,bldg?'Under construction':'Coming soon: '+d.n,0,2.2,-2.3,{bg:bldg?'#ffc63d':'#2a1a12',fg:bldg?'#2a1a12':'#ffc63d',w:4.6,h:.75});bx(6.6,2.8,.15,toon(0xe8d6b8),0,1.4,-2.45,bg);if(bldg){for(var sc=-1;sc<=1;sc+=2){cyB(.05,2.6,toon(0xf2b632),sc*2.6,0,-1.6,bg,6);}bx(5.4,.08,.5,toon(0x9a7a4a),0,1.6,-1.6,bg);var wk=liteMe({shirt:0xff9b3d,hat:0xffc63d});wk.root.position.set(.5,0,-.5);bg.add(wk.root);}}
    var wp=new T.Vector3(0,0,1.6).applyAxisAngle(V3(0,1,0),b[2]);
    if(lv||!bldg)ACTS.super.push({x:ox+b[0]+wp.x,z:b[1]+wp.z,r:2.2,label:function(){var l=S.depts[k]||0;return l?d.n+' · Lv '+l:'Build the '+d.n.toLowerCase();},
      sub:function(){var l=S.depts[k]||0;if(G.lvl<d.lvl)return 'Unlocks at level '+d.lvl;return l?(d.bonus?'+'+Math.round(d.bonus*100*Math.min(3,l))+'% store sales':fmt(deptInc(k,l)*TM(O.city).pm)+'/min')+' · upgrade '+fmt(deptCost(k,l)):fmt(deptCost(k,0))+' · Bob builds it in '+mmssS(90);},
      fn:function(){var l=S.depts[k]||0;if(G.lvl<d.lvl){popup('Not yet','The '+d.n.toLowerCase()+' unlocks at level '+d.lvl+'.',[{t:'OK'}],'bad');return;}if(W4().builds.some(function(q){return q.kind==='dept'&&q.dept===k;})){toast('The crew is already on it.');return;}
        popup(l?'Upgrade the '+d.n.toLowerCase()+'?':'Build the '+d.n.toLowerCase()+'?',(d.bonus?'+'+Math.round(d.bonus*100)+'% to everything the superstore sells (up to 3 levels).':'Adds '+fmt(deptInc(k,l+1)*TM(O.city).pm-(l?deptInc(k,l)*TM(O.city).pm:0))+'/min.')+'\nThere is no top level. Every upgrade costs more than the last.',[
          {t:(l?'Upgrade':'Build')+' · '+fmt(deptCost(k,l)),fn:function(){startBuild(O.city+':market:super',null,{kind:'dept',dept:k,cost:deptCost(k,l),sec:l?60+l*20:90});}},{t:'Not now',cls:'sec'}]);}});});
  for(var r2=0;r2<3;r2++){var cx=-6+r2*6;counterTop(g,cx,9,2.4,0x2a1a12,0xffc63d);npc(g,cx-.8,9.8,Math.PI,{shirt:0xffc63d});addCol(ox+cx-1.3,ox+cx+1.3,8.5,9.5,'super');}
  wallSign(g,'CHECKOUT',0,3.8,13.8,{bg:'#2a1a12',fg:'#ffc63d',w:4,h:.7,ry:Math.PI});
  ACTS.super.push({x:ox,z:6,r:2,label:'Store report',sub:function(){return fmt(superIncome())+'/min · garage level '+(S.garage||0);},fn:function(){var ls=DEPT_ORDER.filter(function(k){return S.depts[k];}).map(function(k){return DEPTS[k].n+' Lv '+S.depts[k];});popup('Crema Superstore',(ls.length?ls.join('\n'):'No departments yet. Walk up to an empty bay to build one.')+'\n\nTotal: '+fmt(superIncome())+'/min'+(S.garage?'\nParking garage: +'+(25*S.garage)+'%':'\nA parking garage next door adds +25% per level.'),[{t:'OK'}]);}});
  for(var k2=0;k2<Math.min(12,2+Object.keys(S.depts).length*2);k2++)superShopper();
}
var shoppers=[];
function superShopper(){var A=AREAS.super;if(!A)return;var me=poolGet();var s={me:me,x:A.ox+rnd(-12,12),z:rnd(-6,6),tx:0,tz:0,w:0};s.tx=s.x;s.tz=s.z;me.root.position.set(s.x,0,s.z);shoppers.push(s);}
function updShoppers(dt){shoppers.forEach(function(s){if(s.w>0){s.w-=dt;animLite(s.me,dt,false);return;}var dx=s.tx-s.x,dz=s.tz-s.z,d=Math.hypot(dx,dz);if(d<.2){s.w=rnd(1,4);var A=AREAS.super;s.tx=A.ox+rnd(-15,15);s.tz=rnd(-7,6);return;}
  s.x+=dx/d*1.2*dt;s.z+=dz/d*1.2*dt;s.me.root.position.set(s.x,0,s.z);s.me.root.rotation.y=Math.atan2(dx,dz);animLite(s.me,dt,true);});}
