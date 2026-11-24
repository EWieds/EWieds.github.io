
/* ---------- blocks ---------- */
function myLocIn(D){for(var i=0;i<G.locs.length;i++){var l=G.locs[i];if(l.city===O.city&&l.did===D.id)return l;}return null;}
function buildBlock(b){
  var keep=stat;stat=new T.Group();var r=seeded(b.seed);
  blockSlab(b,stat);if(b.t!=='park'&&b.t!=='mall')furnish(b,stat,r);
  ({dist:distBlock,civic:civicBlock,market:marketBlock,park:parkBlock,motors:motorsBlock,homes:homesBlock,uni:uniBlock,mall:mallBlock,dining:diningBlock,justice:justiceBlock})[b.t](b,r);
  O.scene.add(mergeGroup(stat));stat=keep;
}
function landUse(lot,b,D,key,own){
  if(own.use==='dev')devLot(lot,b,own,D);else if(own.use==='patio')patioLot(lot,b,own,D);else if(own.use==='lease')leaseLot(lot,b,own,D,key);else if(own.use==='billboard')billboardLot(lot,b,own,D);else if(own.use==='parking')parkingLot(lot,b,own,D);else forSaleLot(lot,D,key);
  if(own.use)places.push({id:'land:'+key,name:(own.use==='dev'?'Your '+((own.dev||{}).label||'building'):({patio:'Your patio',lease:'Your rental',billboard:'Your billboard',parking:'Your parking lot'})[own.use])+' · '+D.name,kind:'land',x:L2W(lot,0,1.2).x,z:L2W(lot,0,1.2).z});
}
function distBlock(b,r){
  var D=b.D,mine=myLocIn(D),lots=lotsOf(b),w=W4();
  var mineKey=mine?(mine.w4lot||lots[1].key):null,rivalKey=mine&&mine.comp?(mineKey===lots[2].key?lots[1].key:lots[2].key):null;
  lots.forEach(function(lot){var rr=seeded(b.seed*31+lot.s*7+lot.i*3+1),key=lot.key;
    if(mine&&key===mineKey){addShopAct(shopFront(lot,mine,D));return;}
    if(rivalKey===key){rivalFront(lot,mine,D);return;}
    var site=w.builds.filter(function(x){return x.key===key;})[0];if(site){siteLot(lot,site,D);return;}
    if(mpOther(key)){mpLot(lot,b,D,key);return;}var own=w.land[key];if(own){landUse(lot,b,D,key,own);return;}
    if(rr()<(cityOfLot(key)===MPC?.42:.24)){forSaleLot(lot,D,key);return;}
    genBuilding(lot,b,rr);});
  dressing(b,r);
  var zx=b.x+BW/2-6,zz=b.z+BD/2+1.1;zones.push({id:'z:'+b.id,name:D.name,x:zx,z:zz,ry:-Math.PI/2,dem:(D.demand||1)*(D.lunch||1),D:D});
  if(G.lvl<D.lvl){var sg=new T.Group();sg.position.set(b.x,0,b.z+BD/2-1.4);stat.add(sg);cyB(.08,2.8,toon(0x3a3f4b),-1.6,.2,0,sg,6);cyB(.08,2.8,toon(0x3a3f4b),1.6,.2,0,sg,6);
    plane(3.8,1,flat(0xffffff,{map:signT(D.name+' · opens at level '+D.lvl,{bg:'#fff6e6',fg:'#8a5a3a',w:768,h:150})}),0,2.6,.05,sg);}
}
function addShopAct(v){
  var loc=v.loc,dw=L2W(v.lot,DOORX,.9);
  ACTS.city.push({x:dw.x,z:dw.z,r:1.9,door:true,dn:v.lot,shop:loc,
    label:function(){return P.carry.length?'Stock the storeroom ('+P.carry.length+' crate'+(P.carry.length>1?'s':'')+')':inShiftAt(loc)?'Back behind the counter':'Go inside & open up';},
    sub:function(){var s=W4().stock[loc.ind]||0;return loc.name+' · '+(shopOpen(loc)?'OPEN':'CLOSED')+' · storeroom '+s;},
    fn:function(){if(P.carry.length){unload(P.carry,loc);P.carry=[];carryView();return;}goInside(loc);},
    alt:function(){var pv=myVeh(),tk=W4().trunk;if(pv&&tk.length&&Math.hypot(pv.g.position.x-dw.x,pv.g.position.z-dw.z)<16)return {label:'Unload the pickup ('+tk.length+')',fn:function(){unload(tk.slice(),loc);W4().trunk=[];trunkView();}};
      return {label:'Call '+(hasMgr(loc)?staffName(loc,'manager',0):'Bob'),fn:function(){if(hasMgr(loc))callManager(loc);else callBob('shop:'+loc.id);}};}});
  places.push({id:'shop:'+loc.id,name:'Crema '+IND[loc.ind].name+' · '+loc.name,kind:'shop',x:dw.x,z:dw.z,loc:loc});
}
function dressing(b,r){
  var w=b.D.win,g=stat;
  if(w==='campus'){[1,-1].forEach(function(s){for(var i=0;i<=NL;i++){var x=b.x-INW/2-LGAP/2+i*(LOTW+LGAP),z=b.z+s*(BD/2-.6);var bn=plane(.6,1.2,toon(i%2?0xc4573e:0xffc63d,{ds:1}),x+(s>0?.25:-.25),3.2,z,g);bn.rotation.y=Math.PI/2;}});
    for(var k=0;k<5;k++){var bk=new T.Group();bk.position.set(b.x-BW/2+1.4,.2,b.z-3+k*1.4);g.add(bk);[-.5,.5].forEach(function(q){tor(.32,.04,toon(0x3a3f4b),q,.35,0,bk,null,12).rotation.y=Math.PI/2;});bx(.05,.05,1,toon(pick(SHIRTC)),0,.55,0,bk).rotation.x=Math.PI/2;}}
  if(w==='ocean'){[-1,1].forEach(function(e){var x=b.x+e*(BW/2-1.6);for(var k=0;k<3;k++){var u=new T.Group();u.position.set(x,.2,b.z-7+k*7);g.add(u);cyB(.04,2.2,toon(0xffffff),0,0,0,u,6);cone(1.2,.5,toon([0xe2553f,0x46a9e6,0xffc63d][k]),0,2.3,0,u,10);}
      var sb=rb(.5,2,.12,.2,toon(pick([0x46a9e6,0xff79b4,0xffc63d])),b.x+e*(BW/2-.6),1.2,b.z+8,g);sb.rotation.z=.15;});
    var lg=new T.Group();lg.position.set(b.x+BW/2-2,.2,b.z-9);g.add(lg);[-.6,.6].forEach(function(q){bx(.12,2.4,.12,toon(0xffffff),q,1.2,-.6,lg);bx(.12,2.4,.12,toon(0xffffff),q,1.2,.6,lg);});rb(1.8,1,1.8,.1,toon(0xe2553f),0,2.9,0,lg);}
  if(w==='snow'){[-1,1].forEach(function(e){var x=b.x+e*(BW/2-1.8),m=toon(0xffffff);sp(.55,m,x,.65,b.z+8,g,12);sp(.4,m,x,1.45,b.z+8,g,12);sp(.3,m,x,2.05,b.z+8,g,12);cone(.06,.3,toon(0xff8a3d),x,2.05,b.z+8+.3*e*0+.3,g,6).rotation.x=Math.PI/2;
      sp(1.1,m,x,.2,b.z-8,g,10).scale.set(1.4,.5,1);});}
  if(w==='night'){var bulbs=[];[1,-1].forEach(function(s){for(var x=b.x-BW/2+1;x<b.x+BW/2-1;x+=.9){bulbs.push([x,3.4+Math.sin((x-b.x)*.6)*.3,b.z+s*(BD/2-1.8)]);}});
    bulbs.forEach(function(q,i){sp(.07,i%3?MAT.lamp:toon(0xff5a8a,{e:0xff5a8a,ei:.6}),q[0],q[1],q[2],g,6);});
    [-1,1].forEach(function(e){for(var k=0;k<3;k++){var lt=sp(.3,toon(0xef3a2a,{e:0xef3a2a,ei:.35}),b.x+e*(BW/2-1.2),3.2,b.z-6+k*6,g,10);lt.scale.y=1.3;}});}
  if(w==='harbor'){[-1,1].forEach(function(e){for(var k=0;k<2;k++)for(var h=0;h<2;h++)rb(1.4,1.3,3.2,.04,toon([0xe2553f,0x2f8fd0,0x2fa860,0xffc63d][(k+h*2)%4]),b.x+e*(BW/2-1.5),.85+h*1.3,b.z-4+k*3.4,g);});}
  if(w==='park'){[-1,1].forEach(function(e){var x=b.x+e*(BW/2-1.6);bx(.08,2.2,.08,toon(0x3a3f4b),x,1.3,b.z+7,g);bx(.08,2.2,.08,toon(0x3a3f4b),x,1.3,b.z+8.6,g);cy(.04,.04,1.6,toon(0xc8ccd2),x,2.35,b.z+7.8,g,6).rotation.x=Math.PI/2;});}
  if(w==='old'){[1,-1].forEach(function(s){for(var i=0;i<NL;i++){var x=b.x-INW/2+LOTW/2+i*(LOTW+LGAP)+2.6;rb(1.6,.4,.4,.06,toon(0x8a5a3a),x,3.6,b.z+s*(BD/2-WALK)+s*.3,g);for(var k=0;k<4;k++)sp(.12,toon([0xff6b8f,0xffc63d,0xffffff,0xb39ddb][k]),x-.6+k*.4,3.85,b.z+s*(BD/2-WALK)+s*.3,g,6);}});}
}
function homesBlock(b,r){
  var firstSale=true;lotsOf(b).forEach(function(lot){var r2=seeded(b.seed*13+lot.s*5+lot.i),hr=seeded(hashS(lot.key+'kind'));
    if(hr()<.6){var dw=L2W(lot,0,.9),h={key:lot.key,big:hr()<.35,sale:hr()<.18};if(firstSale&&!(W4().biz[lot.key]||{}).own){h.sale=true;firstSale=false;}h.num=homeAddr(lot,b,dw).split(' ')[0];houseModel(lot,b,r2,h);regHome(lot,b,'house',{dx:h.dx,f:h.f,big:h.big,sale:h.sale,num:h.num,addr:homeAddr(lot,b,dw)});}
    else{var fl=apartment(lot,b,r2);regHome(lot,b,'apt',{units:fl*2,addr:homeAddr(lot,b,L2W(lot,0,.9))});}});
  [1,-1].forEach(function(s){for(var i=0;i<3;i++)if(r()<.7){var c=carModel(pick(['sedan','hatch','van']),pick(CARC));c.position.set(b.x-BW/2+9+i*14+r()*4,0,b.z+s*(BD/2+1.15));c.rotation.y=s>0?-Math.PI/2:Math.PI/2;stat.add(c);
    cols.push({x0:c.position.x-2.2,x1:c.position.x+2.2,z0:c.position.z-1,z1:c.position.z+1,area:curArea,car:1});}});
}
function civicBlock(b,r){
  var L=lotsOf(b);
  genBuilding(L[0],b,r,{name:'Crema Realty · Dana',floors:2,arch:'classic',nobiz:1});
  var rd=L2W(L[0],DOORX,.9);ACTS.city.push({x:rd.x,z:rd.z,r:1.8,door:true,dn:L[0],label:'Visit Crema Realty',sub:'Dana sells land, homes, and finds tenants',fn:function(){enterOffice('realty','Crema Realty','Dana');}});
  places.push({id:'realty',name:'Crema Realty',kind:'civic',x:rd.x,z:rd.z});
  hallFront(wideLot(b,1,1,2));bankFront(L[3]);
  var police=genBuilding(L[4],b,r,{name:'City Police',floors:2,arch:'classic',nobiz:1}),post=genBuilding(L[5],b,r,{name:'Post Office',floors:2,arch:'brick',nobiz:1}),lib=genBuilding(L[6],b,r,{name:'Public Library',floors:3,arch:'brick',nobiz:1});
  fireStation(L[7]);officeDoor(L[4],'police','City Police','Officer Diaz');officeDoor(L[5],'post','Post Office','Wendell');officeDoor(L[6],'library','Public Library','Mrs. Okafor');var fd=L2W(L[7],3.2,1.2);ACTS.city.push({x:fd.x,z:fd.z,r:2,label:'Fire Station 1',sub:'Captain Bell is in',fn:function(){enterOffice('fire','Fire Station 1','Captain Bell');}});places.push({id:'off:fire',name:'Fire Station 1',kind:'civic',x:fd.x,z:fd.z});
  var pc=carModel('police');pc.position.set(L[4].x,0,b.z-BD/2-1.15);pc.rotation.y=Math.PI/2;stat.add(pc);cols.push({x0:pc.position.x-2.2,x1:pc.position.x+2.2,z0:pc.position.z-1,z1:pc.position.z+1,area:curArea,car:1});
}
function fireStation(lot){
  var g=lotGroup(lot),w=lot.w-.3,d=BDEP-.4;rb(w,7,d,.12,toon(0xc8443a),0,3.5,-d/2,g);rb(w+.3,.4,d+.3,.08,toon(0xffffff),0,7.1,-d/2,g);
  [-2.2,2.2].forEach(function(x){bx(3.6,3.8,.1,toon(0xe8e8e8),x,2,.05,g);for(var k=0;k<6;k++)bx(3.5,.04,.03,toon(0xbfc4cc),x,.5+k*.6,.12,g);});
  plane(5,.9,flat(0xffffff,{map:signT('FIRE STATION 1',{bg:'#ffffff',fg:'#c8443a',w:512,h:100})}),0,4.9,.12,g);
  var ft=carModel('fire');ft.position.set(-2.2,.2,2.4);g.add(ft);rectCol(lot,-w/2,w/2,-d,.1);rectCol(lot,-3.4,-1,1,3.6);
}
function hallFront(lot){
  var g=lotGroup(lot),dg=dynGroup(lot),w=lot.w-.4,d=BDEP-1.4,stone=toon(0xf1ebdf),trim=toon(0xd8cfbe);
  rb(w,9,d,.15,stone,0,4.5,-d/2-1,g);
  for(var s=0;s<3;s++)bx(w*.62-s*.6,.25,.9,trim,0,.32+s*.25,.4-s*.45,g);
  for(var i=0;i<6;i++){var x=-w*.3+i*(w*.6/5);cyB(.34,6.6,stone,x,1.05,-.6,g,14);cy(.5,.5,.3,trim,x,7.75,-.6,g,12);}
  bx(w*.72,.6,2.2,trim,0,8.1,-.9,g);var pd=prism(w*.74,2,2.2,stone,0,8.4,-.9,g);
  var dome=sp(3.2,toon(0x8fc1b8),0,9.4,-d/2-1,g,20);dome.scale.y=.75;cyB(3.3,1.2,stone,0,8.9,-d/2-1,g,20);cyB(.12,1.6,toon(0xffd23d),0,11.6,-d/2-1,g,6);
  bx(2.4,3.6,.2,toon(0x6b4a30),0,2.25,-1.85,g);
  plane(w*.5,.8,flat(0xffffff,{map:signT('CITY HALL',{bg:'#f1ebdf',fg:'#5a4a38',w:768,h:120})}),0,7.0,-.42,g);
  // the clock on the pediment shows the time in town
  var ck=canvasTex(128,128,function(){},null);var cm=new T.MeshBasicMaterial({map:ck});var face=new T.Mesh(new T.CircleGeometry(.85,24),cm);face.position.set(0,9.2,.25);dg.add(face);clockFace={m:cm,t:ck,last:-1};
  var fp=new T.Group();fp.position.set(w/2-1,.2,1.2);dg.add(fp);cyB(.06,9,toon(0xd8d8d8),0,0,0,fp,8);var flag=plane(1.8,1.1,toon(0xffffff,{map:flagTex(),ds:1}),.95,8.3,0,fp);anim.push({flag:flag});
  [-1,1].forEach(function(e){var fx=e*(w/2-2.4);cyB(1.4,.5,stone,fx,.2,1.6,g,18);var wt=cyB(1.2,.1,toon(0x7fcdf7),fx,.62,1.6,g,18);anim.push({fount:cy(.08,.12,1.2,glass(0xcfeeff,.5),fx,1.2,1.6,dg,8)});});
  rectCol(lot,-w/2,w/2,-d-1.2,-1.2);rectCol(lot,-w/2+1.2,-w*.31-.4,-1.2,0);rectCol(lot,w*.31+.4,w/2-1.2,-1.2,0);
  [-1,1].forEach(function(e){rectCol(lot,e*(w/2-2.4)-1.4,e*(w/2-2.4)+1.4,.2,3);});
  var dw=L2W(lot,0,-.4);ACTS.city.push({x:dw.x,z:dw.z,r:2,door:true,dn:lot,label:'Enter City Hall',sub:'Taxes, permits and elections',fn:function(){enterArea('hall');}});
  places.push({id:'hall',name:'City Hall',kind:'civic',x:dw.x,z:dw.z});
}
var clockFace=null;
function flagTex(){return tx('flag'+O.city,128,80,function(g,w,h){g.fillStyle='#2f8fd0';g.fillRect(0,0,w,h);g.fillStyle='#ffc63d';g.beginPath();g.arc(w/2,h/2,18,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.fillRect(0,h-12,w,6);});}
function drawClock(){if(!clockFace)return;var hm=Math.floor(clockH*12);if(hm===clockFace.last)return;clockFace.last=hm;var c=clockFace.t.userData.canvas,g=c.getContext('2d');
  g.fillStyle='#fffaf0';g.beginPath();g.arc(64,64,62,0,Math.PI*2);g.fill();g.strokeStyle='#5a4a38';g.lineWidth=6;g.stroke();for(var i=0;i<12;i++){var a=i/12*Math.PI*2;g.fillStyle='#5a4a38';g.fillRect(64+Math.sin(a)*50-2,64-Math.cos(a)*50-2,4,4);}
  var h=clockH%12,m=(clockH%1)*60;function hand(a,l,wd){g.strokeStyle='#2a1a12';g.lineWidth=wd;g.lineCap='round';g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.sin(a)*l,64-Math.cos(a)*l);g.stroke();}
  hand((h+m/60)/12*Math.PI*2,30,6);hand(m/60*Math.PI*2,46,4);clockFace.t.needsUpdate=true;}
function bankFront(lot){
  var g=lotGroup(lot),w=lot.w-.3,d=BDEP-.4,stone=toon(0xe6e1d6);
  rb(w,8,d,.12,stone,0,4,-d/2,g);for(var i=0;i<4;i++)cyB(.28,5.6,toon(0xf4f0e8),-3.3+i*2.2,.2,.5,g,12);bx(w,1,1.4,toon(0xd8d0c0),0,6.2,.4,g);
  plane(w-1.2,.8,flat(0xffffff,{map:signT('CREMA SAVINGS & LOAN',{bg:'#e6e1d6',fg:'#2f5a46',w:768,h:110})}),0,6.25,1.12,g);
  bx(1.6,3,.15,toon(0x2f5a46),DOORX+.4,1.7,.08,g);
  var atm=new T.Group();atm.position.set(2.8,.2,.12);g.add(atm);rb(1,1.9,.4,.06,toon(0x3a3f4b),0,.95,0,atm);bx(.6,.4,.02,toon(0x7fe3a2),0,1.4,.21,atm);bx(.5,.06,.05,toon(0x111111),0,1.05,.22,atm);
  rectCol(lot,-w/2,w/2,-d,1.2);
  var dw=L2W(lot,DOORX+.4,1.7);ACTS.city.push({x:dw.x,z:dw.z,r:1.6,door:true,dn:lot,label:'Enter the bank',sub:'Loans, savings and insurance',fn:function(){enterArea('bank');}});
  var aw=L2W(lot,2.8,1.8);ACTS.city.push({x:aw.x,z:aw.z,r:1.2,label:'Use the ATM',sub:function(){var b=W4().bank;return 'Savings '+fmt(b.sav)+(b.loan?' · loan '+fmt(b.loan):'')+(caseAmt()?' · briefcase '+fmt(caseAmt()):'');},fn:function(){popup('ATM','Balance '+fmt(G.cash)+(caseAmt()?'\nBriefcase '+fmt(caseAmt()):''),[{t:'Fill a cash briefcase',fn:caseMenu},{t:'Bank app',fn:function(){openPhone('bank');}},{t:'Done',cls:'sec'}]);}});
  places.push({id:'bank',name:'Crema Savings & Loan',kind:'civic',x:dw.x,z:dw.z});
}
function marketBlock(b,r){
  var L=lotsOf(b);supplyFront(L[0]);superFront(wideLot(b,1,1,2));garageFront(L[3]);
  genBuilding(L[4],b,r,{name:'Mg1\'s Fresh Market',grocery:true,arch:'market'});genBuilding(L[5],b,r,{name:'Bolt & Nut Hardware'});genBuilding(L[6],b,r,{name:'Suds Laundromat'});genBuilding(L[7],b,r,{name:'Paws Pet Shop'});
}
function supplyFront(lot){
  var g=lotGroup(lot),dg=dynGroup(lot),w=lot.w-.3,d=BDEP-.4,h=7;
  rb(w,h,d,.2,toon(0x4f7fb0),0,h/2,-d/2,g);rb(w+.3,.45,d+.3,.08,toon(0xf2f2f2),0,h+.15,-d/2,g);
  [1.8].forEach(function(x){bx(3.6,3.3,.15,toon(0xd8dee6),x,1.85,.06,g);for(var j=0;j<6;j++)bx(3.5,.05,.03,toon(0xb8c0ca),x,.5+j*.55,.15,g);});
  bx(1.4,2.6,.18,glass(0xdff2ff,.5),DOORX,1.5,.1,g);bx(1.6,.2,.4,toon(0xf2f2f2),DOORX,2.9,.25,g);
  plane(w-1,1.4,flat(0xffffff,{map:signT('Crema Supply Co.',{bg:'#ffffff',fg:'#2f5f90',w:768,h:160,sub:'Beans · milk · flour · fruit · cups'})}),0,5.1,.12,g);
  for(var k=0;k<3;k++){var pl=bx(1.1,.15,1.1,toon(0xb88a5a),.8+k*1.2,.28,1.1,g);rb(.9,.8,.9,.05,toon(0xd9c39a),.8+k*1.2,.75,1.1,g);}
  var fk=new T.Group();fk.position.set(2,.2,2.2);dg.add(fk);rb(1.1,.9,1.6,.1,toon(0xffc63d),0,.7,0,fk);bx(.9,.1,1,toon(0x3a3f4b),0,1.6,-.3,fk);[-.4,.4].forEach(function(q){bx(.06,1.6,.06,toon(0x3a3f4b),q,1.1,-.65,fk);});bx(.9,.06,.9,toon(0x777777),0,.2,.9,fk);var drv2=liteMe({shirt:0x4f7fb0});drv2.sit=true;drv2.root.position.set(0,.55,-.2);drv2.root.scale.setScalar(.85);fk.add(drv2.root);
  anim.push({fork:fk,x0:-3,x1:3.2,t:0});
  rectCol(lot,-w/2,w/2,-d,.15);
  var dw=L2W(lot,DOORX,.9);ACTS.city.push({x:dw.x,z:dw.z,r:1.8,door:true,dn:lot,label:'Enter Crema Supply Co.',sub:'Crates for your storeroom · halves ingredient costs',fn:function(){enterArea('supply');}});
  places.push({id:'supply',name:'Crema Supply Co.',kind:'supply',x:dw.x,z:dw.z});
}
function superFront(lot){
  var S=superOf(),bd=W4().builds.filter(function(x){return x.kind==='super'&&cityOfLot(x.key)===O.city;})[0];
  if(bd){siteLot(lot,bd,{name:'Market Square'});return;}
  if(!S){var g=lotGroup(lot);var a=planeR(lot.w-.2,BDEP,3,3,toon(0xffffff,{map:asphaltT()}),0,.22,-BDEP/2,g);a.rotation.x=-Math.PI/2;
    for(var i=-4;i<=4;i++)cyB(.05,1,toon(0xff9b3d),i*(lot.w-1)/8,.2,-.1,g,6);
    plane(5.5,1.5,flat(0xffffff,{map:signT('COMMERCIAL SITE',{bg:'#ffffff',fg:'#2f5f90',w:768,h:190,sub:'Zoned for a superstore · '+fmt(superCost())})}),0,2.2,-.4,g);cyB(.07,1.6,toon(0x3a3f4b),-2,.2,-.45,g,6);cyB(.07,1.6,toon(0x3a3f4b),2,.2,-.45,g,6);
    var p=L2W(lot,0,1.3);ACTS.city.push({x:p.x,z:p.z,r:4,label:'Build a Crema Superstore',sub:function(){return fmt(superCost())+' · needs a commercial permit from City Hall';},fn:function(){startSuper(lot);}});
    places.push({id:'supersite',name:'Superstore site',kind:'site',x:p.x,z:p.z});return;}
  var ex=S.exp||0,g2=lotGroup(lot),w=lot.w-.3,d=BDEP-.2,h=10+Math.min(ex,8)*3.2;
  for(var fl3=1;fl3<=Math.min(ex,8);fl3++)planeR(w-1,3,6,1,facadeMat(0xfff6e6,'glass'),0,10+fl3*3.2-1.5,.03,g2);
  rb(w,h,d,.2,toon(0xfff6e6),0,h/2,-d/2,g2);rb(w+.3,.6,d+.3,.1,toon(0x2a1a12),0,h+.2,-d/2,g2);
  bx(w-2,4.2,.15,glass(0xbfe6ff,.5),0,2.3,.1,g2);for(var k=-3;k<=3;k++)bx(.12,4.2,.2,toon(0x2a1a12),k*(w-2)/6,2.3,.12,g2);
  plane(w-3,2,flat(0xffffff,{map:signT('CREMA SUPERSTORE',{bg:'#2a1a12',fg:'#ffc63d',w:1024,h:200,sub:ex?'NOW '+(ex+1)+' FLOORS':'COFFEE · BAKERY · JUICE · ICE CREAM · KITCHEN'})}),0,7,.12,g2);
  var cv=bx(w-4,.25,3,toon(0x2a1a12),0,4.6,1.5,g2);[-1,1].forEach(function(e){cyB(.1,4.4,toon(0x2a1a12),e*(w/2-2.5),.2,2.8,g2,8);});
  for(var j=0;j<6;j++){var cart=new T.Group();cart.position.set(w/2-1.6,.2,.8+j*.35);g2.add(cart);bx(.6,.4,.8,toon(0xc8ccd2),0,.7,0,cart);}
  rectCol(lot,-w/2,w/2,-d,.15).h=h;
  var xp=L2W(lot,w/2-1.2,1.6);ACTS.city.push({x:xp.x,z:xp.z,r:1.8,label:function(){return 'Expand the superstore · '+fmt(superExpCost(S));},sub:function(){return 'Floor '+((S.exp||0)+2)+' · +40% to the whole store · no limit';},fn:function(){startExpand(lot);}});
  var dw=L2W(lot,0,.9);ACTS.city.push({x:dw.x,z:dw.z,r:2.4,door:true,dn:lot,label:'Enter the Crema Superstore',sub:function(){return fmt(superIncome())+'/min · '+Object.keys(S.depts).length+' departments';},fn:function(){enterArea('super');}});
  places.push({id:'super',name:'Crema Superstore',kind:'shop',x:dw.x,z:dw.z});
  var sv={super:true,lot:lot,door:L2W(lot,0,-.3),out:L2W(lot,0,1.4),flow:0};shopV.push(sv);
}
function garageFront(lot){
  var S=superOf(),gl=S&&S.garage,bd=W4().builds.filter(function(x){return x.kind==='garage'&&cityOfLot(x.key)===O.city;})[0];
  if(bd){siteLot(lot,bd,{name:'Market Square'});return;}
  var g=lotGroup(lot);
  if(!gl){var a=planeR(lot.w-.2,BDEP,2,2,toon(0xffffff,{map:asphaltT()}),0,.22,-BDEP/2,g);a.rotation.x=-Math.PI/2;
    plane(3.6,1,flat(0xffffff,{map:signT(S?'Garage site':'Reserved',{bg:'#ffffff',fg:'#2f5f90',w:512,h:128,sub:S?'Call Bob to build':'Superstore parking'})}),0,1.8,-.4,g);
    var p=L2W(lot,0,1.3);ACTS.city.push({x:p.x,z:p.z,r:3,label:S?'Build a parking garage':'Reserved for superstore parking',sub:S?fmt(garageCost(1))+' · +25% superstore sales':'Build the superstore first',fn:function(){if(!S){popup('Not yet','This lot is reserved for the superstore\'s parking garage. Build the superstore next door first.',[{t:'OK'}]);return;}startGarage(lot);}});return;}
  var w=lot.w-.3,d=BDEP-.4,lv=Math.min(5,1+gl);
  for(var f=0;f<lv;f++){bx(w,.3,d,toon(0xc8ccd2),0,.4+f*2.6,-d/2,g);if(f>0)[-1,1].forEach(function(e){[-1,1].forEach(function(e2){bx(.4,2.6,.4,toon(0xb8bcc2),e*(w/2-.4),f*2.6-.9,-d/2+e2*(d/2-.4),g);});});
    bx(w,.9,.15,toon(0xe8ecf0),0,.95+f*2.6,0,g);var rr=seeded(f*7+lot.x);for(var c=0;c<3;c++)if(rr()<.65){var cm=carModel('sedan',pick(CARC));cm.position.set(-w/2+1.8+c*3,.55+f*2.6,-d/2);cm.rotation.y=0;g.add(cm);}}
  plane(1.6,1.6,flat(0xffffff,{map:signT('P',{bg:'#2f8fd0',fg:'#fff',w:128,h:128})}),w/2-1,lv*2.6+1,.1,g);
  rectCol(lot,-w/2,w/2,-d,.1);
  var p2=L2W(lot,0,1.3);ACTS.city.push({x:p2.x,z:p2.z,r:3,label:'Parking garage · level '+gl,sub:'+'+(25*gl)+'% superstore sales · add a floor '+fmt(garageCost(gl+1)),fn:function(){startGarage(lot);}});
}
function motorsBlock(b,r){
  var L=lotsOf(b);dealer(L[0],L[1]);gasStation(wideLot(b,1,2,3));
  carWash(L[4]);genBuilding(L[5],b,r,{name:'Tire Town'});genBuilding(L[6],b,r,{name:'Auto Parts'});genBuilding(L[7],b,r,{name:'Driving School'});
}
function dealer(lot,lot2){
  var g=lotGroup(lot),w=lot.w-.3,d=BDEP-.4;rb(w,5.5,d,.12,toon(0xf4f4f4),0,2.75,-d/2,g);bx(w-1,4,.15,glass(0xbfe6ff,.45),0,2.3,.06,g);
  plane(w-1,1,flat(0xffffff,{map:signT('CREMA MOTORS',{bg:'#e2553f',fg:'#ffffff',w:768,h:120,sub:'FOOD TRUCKS · PICKUPS'})}),0,4.9,.15,g);
  var pc=carModel('pickup',0xe8eef2);pc.position.set(1.5,.25,-3.5);pc.rotation.y=.6;g.add(pc);
  rectCol(lot,-w/2,w/2,-d,.1);
  var g2=lotGroup(lot2),a=planeR(lot2.w-.2,BDEP,2,2,toon(0xffffff,{map:asphaltT()}),0,.22,-BDEP/2,g2);a.rotation.x=-Math.PI/2;
  for(var k=0;k<14;k++)sp(.12,toon([0xe2553f,0xffc63d,0x46a9e6][k%3]),-lot2.w/2+.5+k*.72,3.4+Math.sin(k)*.2,-.3,g2,6);
  var sm=liteMe({shirt:0xe2553f});sm.root.position.set(lot.x+(lot.ry?-1:1)*-3,0,lot.z+(lot.ry?-1:1)*1.6);dyn.add(sm.root);anim.push({me:sm,idle:1});
  IND_ORDER.forEach(function(ik,i){var t=truckModel(ik);t.position.set(-3.6+i*2.4,.2,-4.2);t.rotation.y=.2;g2.add(t);
    var p=L2W(lot2,-3.6+i*2.4,-.6);var I=IND[ik];
    ACTS.city.push({x:p.x,z:p.z,r:1.3,label:function(){return I.name+' truck · '+fmt(truckCost(ik));},sub:function(){return G.lvl<I.lvl?'Unlocks at level '+I.lvl:'Sells from any food truck zone · needs a vending permit';},fn:function(){buyTruck(ik);}});});
  places.push({id:'motors',name:'Crema Motors',kind:'motors',x:L2W(lot2,0,1.2).x,z:L2W(lot2,0,1.2).z});
  var pk=L2W(lot,0,1.4);ACTS.city.push({x:pk.x,z:pk.z,r:2,label:function(){return myVeh()?'Buy another pickup':'Buy a pickup · '+fmt(pickupCost());},sub:'Hauls 6 crates · parks anywhere in '+plan.name,fn:function(){buyPickup();}});
}
function gasStation(lot){
  var g=lotGroup(lot),w=lot.w;bx(w-2,.4,6,toon(0xffffff),0,5,-3.2,g);bx(w-2,.5,.1,toon(0xe2553f),0,5,-.2,g);
  [-4,4].forEach(function(x){cyB(.25,4.8,toon(0xd8dee6),x,.2,-3.2,g,10);[-1.6,1.6].forEach(function(z){rb(.6,1.5,.4,.05,toon(0xe2553f),x+z*.5,.95,-3.2+z,g);});});
  var sh=new T.Group();sh.position.set(-w/2+3.4,0,-6.2);g.add(sh);rb(5.2,3.4,3,.1,toon(0xf4f4f4),0,1.9,0,sh);bx(3.6,1.8,.1,glass(0xbfe6ff,.5),0,1.5,1.52,sh);plane(3.4,.6,flat(0xffffff,{map:signT('GAS & GO',{bg:'#e2553f',fg:'#fff',w:512,h:100})}),0,3.1,1.56,sh);var gw=L2W(lot,-w/2+3.4,-4.2);places.push({id:'gas',name:'Gas & Go',kind:'motors',x:gw.x,z:gw.z});ACTS.city.push({x:gw.x,z:gw.z,r:1.8,label:'Gas & Go',sub:'Scratch tickets · snacks · taxi medallions',fn:function(){popup('Gas & Go','Pump 3 is broken. What can I get ya?',[{t:'Scratch ticket · $2',fn:lottery},{t:'Taxi medallions',fn:medallion},{t:'A gas-station hot dog · $3',fn:function(){if(pay(3,'The hot dog'))eat('A gas-station hot dog');}},{t:'Bye',cls:'sec'}],'',{who:'Dale',role:'Gas & Go',col:'#e2553f'});}});
  var pr=new T.Group();pr.position.set(w/2-1.5,0,-.6);g.add(pr);cyB(.12,5,toon(0x3a3f4b),0,.2,0,pr,8);plane(1.6,2,flat(0xffffff,{map:canvasTex(128,160,function(c,W2,H2){c.fillStyle='#e2553f';c.fillRect(0,0,W2,H2);c.fillStyle='#fff';c.font='700 26px '+FD;c.textAlign='center';c.fillText('REG',W2/2,40);c.fillText('3.29',W2/2,72);c.fillText('PREM',W2/2,112);c.fillText('3.79',W2/2,144);},null,'gasp')}),0,4.6,.15,pr);
  [-4,4].forEach(function(x){rectCol(lot,x-.4,x+.4,-4.2,-2.2);});rectCol(lot,-w/2+.8,-w/2+6,-BDEP,-4.6);
}
function carWash(lot){
  var g=lotGroup(lot),dg=dynGroup(lot),w=lot.w-.3,d=BDEP-.4;rb(w,4.6,d,.12,toon(0x7fcdf7),0,2.3,-d/2,g);bx(5,3.6,.2,toon(0x1d3a52),0,1.8,.02,g);
  plane(w-1,.9,flat(0xffffff,{map:signT('SPARKLE CAR WASH',{bg:'#ffffff',fg:'#2f8fd0',w:768,h:120})}),0,4.0,.15,g);
  [-1.2,1.2].forEach(function(x){var br=cy(.6,.6,3,toon(0x46a9e6),x,1.7,-.6,dg,10);anim.push({spin:br});});rectCol(lot,-w/2,w/2,-d,.1);
}
function parkBlock(b,r){
  var g=stat,gt=grassT(),gr=planeR(BW-2*WALK,BD-2*WALK,12,6,toon(0xffffff,{map:gt}),b.x,.21,b.z,g);gr.rotation.x=-Math.PI/2;
  var path=toon(0xe8dcc4);var p1=plane(BW-2*WALK,2.2,path,b.x,.215,b.z,g);p1.rotation.x=-Math.PI/2;var p2=plane(2.2,BD-2*WALK,path,b.x,.215,b.z,g);p2.rotation.x=-Math.PI/2;
  var fr=toon(0x9aa2ac);cyB(3,.6,fr,b.x,.2,b.z,g,24);cyB(2.7,.12,toon(0x7fcdf7,{map:waterT()}),b.x,.72,b.z,g,24);cyB(.5,1.6,fr,b.x,.2,b.z,g,12);cyB(1,.2,fr,b.x,1.6,b.z,g,16);
  for(var k=0;k<6;k++){var a=k/6*Math.PI*2,jet=cy(.04,.08,1.4,glass(0xd8f2ff,.55),b.x+Math.cos(a)*.7,2.2,b.z+Math.sin(a)*.7,dyn,6);jet.rotation.z=Math.cos(a)*.5;jet.rotation.x=-Math.sin(a)*.5;anim.push({jet:jet,ph:k});}
  addCol(b.x-3,b.x+3,b.z-3,b.z+3);
  for(var i=0;i<14;i++){var tx3=b.x+rnd(-BW/2+5,BW/2-5),tz=b.z+rnd(-BD/2+5,BD/2-5);if(Math.abs(tx3-b.x)<4.5||Math.abs(tz-b.z)<2.6)continue;tree(g,tx3,tz,i%3?0x5fb35a:0x7fc66a,'leaf',r);addCol(tx3-.35,tx3+.35,tz-.35,tz+.35);}
  [[-8,1.8,0],[8,1.8,0],[-8,-1.8,Math.PI],[8,-1.8,Math.PI],[1.8,6,-Math.PI/2],[-1.8,-6,Math.PI/2]].forEach(function(q,i){bench(g,b.x+q[0],b.z+q[1],q[2]);if(i%2===0){var s=liteMe();s.sit=true;s.root.position.set(b.x+q[0],.62,b.z+q[1]);s.root.rotation.y=q[2];s.root.position.z+=Math.cos(q[2])*.05;dyn.add(s.root);if(Math.random()<.5)s.cup.visible=true;anim.push({me:s,sit:1});}});
  // playground
  var pg=new T.Group();pg.position.set(b.x+15,.2,b.z-6);g.add(pg);var sand=plane(7,6,toon(0xf2dca4,{map:sandT()}),0,.02,0,pg);sand.rotation.x=-Math.PI/2;
  bx(.15,2.4,.15,toon(0xe2553f),-2,1.2,-1,pg);bx(.15,2.4,.15,toon(0xe2553f),-2,1.2,1,pg);bx(1.2,.12,2.2,toon(0xffc63d),-1.4,2.4,0,pg);var sl=bx(.9,.08,3,toon(0x46a9e6),-.2,1.3,0,pg);sl.rotation.z=-.7;sl.rotation.y=Math.PI/2;sl.rotation.x=0;
  [1.5,3].forEach(function(x){bx(.1,2.6,.1,toon(0x3a3f4b),x,1.3,-1.4,pg);bx(.1,2.6,.1,toon(0x3a3f4b),x,1.3,1.4,pg);});bx(.1,.1,2.9,toon(0x3a3f4b),2.25,2.6,0,pg);
  var sw=new T.Group();sw.position.set(b.x+17.25,2.8,b.z-6);dyn.add(sw);cyB(.01,1.7,toon(0x333333),0,-1.7,-.25,sw,4);cyB(.01,1.7,toon(0x333333),0,-1.7,.25,sw,4);bx(.5,.06,.6,toon(0xe2553f),0,-1.7,0,sw);anim.push({swing:sw});
  addCol(b.x+11.5,b.x+18.5,b.z-9,b.z-3);
  // pond with ducks
  var pond=plane(9,5,toon(0x6cc6ea,{map:waterT()}),b.x-15,.23,b.z+5.5,g);pond.rotation.x=-Math.PI/2;addCol(b.x-19.5,b.x-10.5,b.z+3,b.z+8);
  for(i=0;i<4;i++){var dk=new T.Group();dyn.add(dk);sp(.18,toon(i?0xf4f4f4:0x5a8a4a),0,.3,0,dk,8);sp(.11,toon(i?0xf4f4f4:0x2f6e4a),0,.48,.14,dk,8);cone(.05,.12,toon(0xff9b3d),0,.47,.27,dk,6).rotation.x=Math.PI/2;anim.push({duck:dk,cx:b.x-15,cz:b.z+5.5,ph:i*1.6});}
  // a guitarist busking by the fountain
  var mu=liteMe({shirt:0x7a5ad8});mu.root.position.set(b.x+4.6,.2,b.z+3);mu.root.rotation.y=-.6;dyn.add(mu.root);var gt2=new T.Group();gt2.position.set(0,.95,.25);mu.body.add(gt2);var gb=sp(.2,toon(0xc98a3a),0,0,0,gt2,10);gb.scale.set(1,1.2,.4);bx(.05,.6,.04,toon(0x6b4a30),.05,.4,0,gt2).rotation.z=-.4;
  cyB(.25,.12,toon(0x3a2317),b.x+5.2,.2,b.z+2.4,g,10);anim.push({me:mu,strum:1});
  places.push({id:'park',name:'Central Park',kind:'park',x:b.x,z:b.z+BD/2-2});
  [-12,0,12].forEach(function(dx,i){zones.push({id:'zp'+i,name:'Central Park',x:b.x+dx,z:b.z+BD/2+1.1,ry:-Math.PI/2,dem:1.5,park:1});});
  [-10,10].forEach(function(dx,i){zones.push({id:'zq'+i,name:'Central Park north',x:b.x+dx,z:b.z-BD/2-1.1,ry:Math.PI/2,dem:1.2,park:1});});
}
/* ---------- the airport (outside) ---------- */
function buildAirport(){
  var p=plan,AX=p.AX,AZ=p.AZ,CX=p.CX,keep=stat;stat=new T.Group();var g=stat,r=seeded(p.city*7+3);
  // curb sidewalk + terminal
  var cw=bx(6,.22,96,toon(0xd8d2c6),CX+RH+3,.11,AZ,g);
  var tw=44,tdp=80,fx=AX-22;
  rb(tdp-36,12,tdp,.3,toon(0xe8eef2),AX,6,AZ,g);
  var ti=planeR(tdp-6,8.6,6,1,toon(0xffffff,{map:termInT()}),fx-.04,4.5,AZ,g);ti.rotation.y=-Math.PI/2;bx(.2,9,tdp-6,glass(0x9fd2f2,.35),fx-.3,5,AZ,g);for(var k=-6;k<=6;k++)bx(.3,9.4,.3,toon(0xc8d0d8),fx,4.9,AZ+k*6.4,g);
  bx(9,.6,tdp+6,toon(0xffffff),fx-3.5,9.8,AZ,g);bx(10,.3,tdp+4,toon(0xd8dee6),fx-4,10.15,AZ,g);
  for(k=-5;k<=5;k+=2)cyB(.22,9.6,toon(0xd8dee6),fx-7.5,.2,AZ+k*7,g,10);
  plane(28,3,flat(0xffffff,{map:signT(apName().toUpperCase(),{bg:'#2a1a12',fg:'#ffffff',w:1024,h:110})}),fx-.2,13.6,AZ,g).rotation.y=-Math.PI/2;
  [['DEPARTURES',-18],['ARRIVALS',18]].forEach(function(q){var s=plane(8,1.2,flat(0xffffff,{map:signT(q[0],{bg:'#2f8fd0',fg:'#fff',w:512,h:80})}),fx-7.4,8,AZ+q[1],g);s.rotation.y=-Math.PI/2;});
  // sliding doors that open as you walk up
  var dg=new T.Group();dyn.add(dg);var dl=bx(1.6,3.2,.12,glass(0xdff2ff,.55),fx-.3,1.8,AZ-.8,dg),dr=bx(1.6,3.2,.12,glass(0xdff2ff,.55),fx-.3,1.8,AZ+.8,dg);dl.rotation.y=dr.rotation.y=Math.PI/2;anim.push({slide:[dl,dr],x:fx,z:AZ});
  // taxis waiting, luggage carts, flags
  for(k=0;k<3;k++){var tx4=carModel('taxi');tx4.position.set(CX+RH-1.2,0,AZ+22+k*6);tx4.rotation.y=Math.PI;g.add(tx4);addCol(CX+RH-2.2,CX+RH-.2,AZ+20+k*6,AZ+24+k*6);}
  plane(2,.9,flat(0xffffff,{map:signT('TAXI',{bg:'#ffc63d',fg:'#2a1a12',w:256,h:110})}),CX+RH+1.5,2.6,AZ+20,g).rotation.y=-Math.PI/2;cyB(.05,2.4,toon(0x3a3f4b),CX+RH+1.5,.2,AZ+20,g,6);
  for(k=0;k<3;k++){var fp=new T.Group();fp.position.set(CX+RH+5,.2,AZ-14-k*3);dyn.add(fp);cyB(.06,8,toon(0xd8d8d8),0,0,0,fp,6);var fl=plane(1.6,1,toon(0xffffff,{map:flagTex(),ds:1}),.85,7.3,0,fp);fl.rotation.y=Math.PI/2;anim.push({flag:fl});}
  for(k=0;k<4;k++){var lc=new T.Group();lc.position.set(fx-2.2,.2,AZ-30+k*1.2);g.add(lc);bx(.8,.06,1,toon(0xc8ccd2),0,.4,0,lc);bx(.06,.9,.06,toon(0xc8ccd2),0,.85,-.5,lc);}
  // parking lot cars + booth
  for(k=0;k<12;k++){if(r()<.4)continue;var pc=carModel(pick(['sedan','hatch','van']),pick(CARC));pc.position.set(CX-RH-7.3-(k%5)*6.5,0,AZ-41.5+Math.floor(k/5)*9);pc.rotation.y=r()<.5?0:Math.PI;g.add(pc);}
  // control tower, runway, apron, jets
  var tw2=new T.Group();tw2.position.set(AX+30,0,AZ-56);g.add(tw2);cyB(2.2,26,toon(0xe8eef2),0,0,0,tw2,16);cyB(3.6,4,glass(0x7fbfe6,.6),0,26,0,tw2,16);cyB(3.9,.5,toon(0xffffff),0,30,0,tw2,16);cyB(.08,4,toon(0xe2553f),0,30.5,0,tw2,6);
  var rw=planeR(36,520,2,40,toon(0xffffff,{map:asphaltT()}),AX+80,.02,AZ,g);rw.rotation.x=-Math.PI/2;
  for(k=-25;k<25;k++){var cl=plane(.6,6,toon(0xffffff),AX+80,.04,AZ+k*10.4,g);cl.rotation.x=-Math.PI/2;}
  for(k=-12;k<=12;k++){[-17.5,17.5].forEach(function(q){sp(.18,MAT.lamp,AX+80+q,.25,AZ+k*21,g,6);});}
  var ap=planeR(40,120,4,10,toon(0xffffff,{map:asphaltT()}),AX+42,.015,AZ,g);ap.rotation.x=-Math.PI/2;
  for(k=0;k<2;k++){var jt=planeModel(k?0x2f8fd0:0xe2553f);jt.position.set(AX+42,0,AZ-22+k*44);jt.rotation.y=-Math.PI/2;g.add(jt);bx(14,2.6,2.6,toon(0xd8dee6),AX+30,4.6,AZ-22+k*44+(k?-4:4),g);}
  O.scene.add(mergeGroup(stat));stat=keep;
  var pl=planeModel(0xffc63d);dyn.add(pl);planes.push({g:pl,t:rnd(0,40)});
  addCol(fx,AX+400,AZ-60,AZ+60);
  var dw={x:fx-1.2,z:AZ};ACTS.city.push({x:dw.x,z:dw.z,r:2.6,door:true,dnX:1,label:'Enter the terminal',sub:'Flights · rental cars · shops',fn:function(){enterArea('terminal');}});
  places.push({id:'airport',name:apName()+' Airport',kind:'airport',x:dw.x,z:dw.z});
}
var planes=[];
function termInT(){return tx('termin',256,128,function(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#cfe2ee');gr.addColorStop(1,'#8aa6b8');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(var i=0;i<8;i++){g.fillStyle='rgba(255,250,220,.8)';g.fillRect(8+i*32,6,18,4);}g.fillStyle='#2f8fd0';g.fillRect(20,40,90,16);g.fillStyle='#fff';g.font='700 11px sans-serif';g.fillText('AIR CREMA',34,52);
  g.fillStyle='#e8eef2';g.fillRect(12,84,110,22);g.fillStyle='#1a1a1e';g.fillRect(150,30,90,40);g.fillStyle='#ffc63d';for(var r=0;r<4;r++)g.fillRect(156,36+r*8,60,3);
  for(i=0;i<14;i++){g.fillStyle=['#e2553f','#2f8fd0','#3a3f4b','#ffc63d','#6cc76a'][i%5];var x=10+i*17+(i%3)*3;g.beginPath();g.arc(x,98,5,0,7);g.fill();g.fillRect(x-5,102,10,18);}});}
function buildOutskirts(){
  var p=plan,keep=stat;stat=new T.Group();var g=stat,r=seeded(p.city*11+5);
  for(var i=0;i<70;i++){var a=r()*Math.PI*2,rad=r();var x,z;
    var side=Math.floor(r()*3);if(side===0){x=p.xs[0]-12-r()*60;z=p.zs[0]-30+r()*(p.zs[p.R]-p.zs[0]+60);}else if(side===1){x=p.xs[0]-20+r()*(p.xs[p.C]-p.xs[0]+40);z=p.zs[0]-12-r()*60;}else{x=p.xs[0]-20+r()*(p.xs[p.C]-p.xs[0]+40);z=p.zs[p.R]+12+r()*60;}
    if(r()<.55)tree(g,x,z,r()<.5?0x5fb35a:0x4f9a4a,p.city%3===1?'pine':'leaf',r);
    else{var h=6+r()*22,w=8+r()*10;bx(w,h,w,toon([0xd8cdbf,0xc8c0b8,0xe0d4c4,0xb8c4cc][Math.floor(r()*4)]),x,h/2,z,g);}}
  for(i=0;i<6;i++){var hx=p.xs[0]-160+i*120,hl=sp(60+r()*40,toon(0x8cc47a),hx,-30,p.zs[0]-190,g,14);hl.scale.y=.6;}
  for(i=0;i<5;i++){var hx2=p.xs[0]-120+i*130,hl2=sp(50+r()*40,toon(0x86bf74),hx2,-28,p.zs[p.R]+190,g,14);hl2.scale.y=.6;}
  O.scene.add(mergeGroup(stat));stat=keep;
}

function uniBlock(b,r){
  var g=stat,gr=planeR(BW-2*WALK,BD-2*WALK,12,6,toon(0xffffff,{map:grassT()}),b.x,.21,b.z,g);gr.rotation.x=-Math.PI/2;var brick=toon(0xb8573e),stone=toon(0xece4d6);
  var pth=plane(BW-2*WALK,2,toon(0xd8c8a8),b.x,.215,b.z,g);pth.rotation.x=-Math.PI/2;var p2=plane(2,BD-2*WALK,toon(0xd8c8a8),b.x,.215,b.z,g);p2.rotation.x=-Math.PI/2;
  // lecture hall (north) and library (south) face the quad
  [[-1,'LECTURE HALL'],[1,'LIBRARY']].forEach(function(q){var hg=new T.Group();hg.position.set(b.x-12,0,b.z+q[0]*7.2);hg.rotation.y=q[0]>0?Math.PI:0;g.add(hg);rb(20,9,5,.1,brick,0,4.5,0,hg);
    for(var i=0;i<6;i++){cyB(.3,6,stone,-6.5+i*2.6,.2,2.8,hg,10);}bx(17,1,1.2,stone,0,6.7,2.8,hg);var pd=prism(17.4,2,1.3,stone,0,7.2,2.8,hg);
    plane(6,.7,flat(0xffffff,{map:signT(q[1],{bg:'#ece4d6',fg:'#6a3a2a',w:768,h:90})}),0,6.7,3.42,hg);for(var k=0;k<5;k++)bx(1.2,1.8,.1,toon(0x7fb4d8),-7+k*3.5,6.8,2.55,hg);
    if(q[0]>0){var dm=sp(2.6,toon(0x8fc1b8),0,9.3,0,hg,16);dm.scale.y=.6;}
    addCol(b.x-22,b.x-2,b.z+q[0]*7.2-2.5,b.z+q[0]*7.2+2.5).h=10;});
  // clock tower and the statue of the founder
  var tw=new T.Group();tw.position.set(b.x+12,0,b.z-5);g.add(tw);rb(3.4,15,3.4,.06,brick,0,7.5,0,tw);rb(3.8,.5,3.8,.05,stone,0,15.2,0,tw);var tp=cone(2.7,4,toon(0x4f6f5a),0,17.4,0,tw,4);tp.rotation.y=Math.PI/4;
  [0,1,2,3].forEach(function(k){var f=new T.Mesh(new T.CircleGeometry(1,20),toon(0xfffaf0));f.position.set(Math.sin(k*Math.PI/2)*1.72,12.5,Math.cos(k*Math.PI/2)*1.72);f.rotation.y=k*Math.PI/2;tw.add(f);var hd=bx(.1,.75,.05,toon(0x2a1a12),Math.sin(k*Math.PI/2)*1.76,12.75,Math.cos(k*Math.PI/2)*1.76,tw);hd.rotation.y=k*Math.PI/2;});
  addCol(b.x+10.3,b.x+13.7,b.z-6.7,b.z-3.3).h=20;
  var stt=new T.Group();stt.position.set(b.x,0,b.z);g.add(stt);rb(1.6,1.6,1.6,.1,stone,0,1,0,stt);var fd=liteMe({shirt:0x8a9aa8,pant:0x8a9aa8});fd.root.position.set(0,1.8,0);fd.root.scale.setScalar(1.3);stt.add(fd.root);addCol(b.x-1,b.x+1,b.z-1,b.z+1);
  plane(.9,.3,flat(0xffffff,{map:signT('Founder, 1891',{bg:'#ece4d6',fg:'#5a4a38',w:256,h:84})}),b.x,1.1,b.z+.81,g);
  // students: on the grass, with backpacks, throwing a frisbee
  for(var i=0;i<6;i++){var s=liteMe({shirt:pick(SHIRTC)});s.sit=true;s.root.position.set(b.x+rnd(-18,18),.25,b.z+rnd(-3,3)+(i%2?2.8:-2.8));s.root.rotation.y=rnd(0,6);bx(.35,.45,.2,toon(pick([0x2f5a46,0x2a3a6a,0xe2553f])),0,1,-.28,s.body);dyn.add(s.root);anim.push({me:s,sit:1});}
  var f1=liteMe({shirt:0xffc63d}),f2=liteMe({shirt:0x46a9e6});f1.root.position.set(b.x+4,.2,b.z+2.5);f2.root.position.set(b.x+15,.2,b.z+2.5);f1.root.rotation.y=Math.PI/2;f2.root.rotation.y=-Math.PI/2;dyn.add(f1.root);dyn.add(f2.root);
  var disc=cy(.22,.22,.04,toon(0xff79b4),b.x+4,1.4,b.z+2.5,dyn,14);anim.push({frisbee:disc,a:f1,b:f2,x0:b.x+4.6,x1:b.x+14.4,z:b.z+2.5});
  for(var k2=0;k2<6;k2++){var bk=new T.Group();bk.position.set(b.x+BW/2-5-k2*1.1,.2,b.z+BD/2-WALK-.8);g.add(bk);[-.45,.45].forEach(function(q){tor(.3,.035,toon(0x2a2a30),0,.32,q,bk,null,10).rotation.y=Math.PI/2;});bx(.05,.05,.9,toon(pick(SHIRTC)),0,.55,0,bk);}
  var sg=new T.Group();sg.position.set(b.x+BW/2-8,0,b.z+BD/2-WALK+.6);g.add(sg);rb(5,1.6,.5,.1,brick,0,.8,0,sg);plane(4.4,.9,flat(0xffffff,{map:signT(plan.name.toUpperCase()+' UNIVERSITY',{bg:'#6a2a2a',fg:'#ffe6b0',w:768,h:150,sub:'EST. 1891'})}),0,.95,.26,sg);
  places.push({id:'uni',name:plan.name+' University',kind:'park',x:b.x,z:b.z+BD/2-2});
  ACTS.city.push({x:b.x+.5,z:b.z+2.2,r:2.2,label:'Read the statue plaque',sub:'"Knowledge, and good coffee"',fn:function(){popup('The Founder','"Knowledge, and good coffee, are the only two things worth staying up for." — Founder, 1891\n\nStudents nearby keep Campus Corner busy: +10% customers there, and exam weeks bring late-night rushes.',[{t:'Inspiring',cls:'sec'}]);}});
  var kp=L2W({x:b.x+BW/2-8,z:b.z+BD/2-WALK+.6,ry:0},0,1.4);var kw=W4();
  ACTS.city.push({x:kp.x,z:kp.z,r:2.4,label:function(){return kw.kiosk&&kw.kiosk[O.city]?'Your campus coffee kiosks':'Pitch the university a coffee contract';},sub:function(){return kw.kiosk&&kw.kiosk[O.city]?fmt(kioskRate())+'/min from the campus':'Dean Okafor decides';},fn:deanTalk});
}
function kioskRate(){return Math.round(60*TM(O.city).pm*((W4().kiosk||{})[O.city]||0));}
function deanTalk(){var w=W4();w.kiosk=w.kiosk||{};var lv=w.kiosk[O.city]||0,camp=G.locs.filter(function(l){return l.city===O.city&&distOf(l).win==='campus';})[0],cost=Math.round(15000*Math.pow(2,lv)*tierM()),who={who:'Dean Okafor',role:plan.name+' University',col:'#6a2a2a'};
  if(!camp){popup('Dean Okafor','"The students are loyal to coffee they can see on the way to class. Open a shop on Campus Corner first, then we\'ll talk about kiosks."',[{t:'Fair enough',cls:'sec'}],'',who);return;}
  var rep=camp.rep||3;if(rep<3.5&&!lv){popup('Dean Okafor','"Your Campus Corner shop has '+rep.toFixed(1)+' stars. Our students deserve 3.5 or better. Come back when the reviews improve."',[{t:'I\'ll fix it',cls:'sec'}],'',who);return;}
  popup('Dean Okafor',lv?'"The kiosks are a hit. The library wants one too."':'"A coffee kiosk in every building? The students would riot with joy. The contract isn\'t cheap."',[{t:(lv?'Add kiosk #'+(lv+1):'Sign the contract')+' · '+fmt(cost),s:'+'+fmt(Math.round(60*TM(O.city).pm))+'/min · no limit on kiosks',fn:function(){if(!pay(cost,'The contract'))return;w.kiosk[O.city]=lv+1;note('Campus contract','Kiosk #'+(lv+1)+' is open. '+fmt(kioskRate())+'/min.','good');save();}},{t:'Not yet',cls:'sec'}],'',who);}
