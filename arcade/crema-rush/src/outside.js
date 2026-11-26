/* ================= CREMA CITY: OUTSIDE (v4) =================
   Step out of your shop into the street: walk, drive your pickup between districts,
   shop for supplies at Crema Supply Co. and haul them back, buy land and call a
   construction crew. Built from the same toon materials, palettes and people as the shop. */
var OUT=(function(){
var O={on:false,scene:null,cam:null,built:-1};
var SEG=46,ROAD=4.6,WALK=3.6,FRONT=ROAD+WALK; // street layout (meters)
var LOTW=10.2,LOTS=4;
var keys={},joy={x:0,y:0},drag=null,yaw=0,pitch=.5,dist=9,curAct=null,curAlt=null;
var P={x:0,z:0,ry:0,me:null,carry:[]};
var car=null,drv=null,peds=[],acts=[],sites=[],storeG=null,inStore=false,storeBack=null,lastT=0;

var SUP={
  beans:{name:'Coffee beans',inds:['coffee'],u:40,price:14,col:0x6b3a1f},
  milk:{name:'Milk crate',inds:['coffee','icecream'],u:30,price:9,col:0xf4f4f4},
  cups:{name:'Cups & lids',inds:['coffee','bakery','juice','icecream'],u:28,price:7,col:0x8fd3ff},
  flour:{name:'Flour sacks',inds:['bakery'],u:40,price:12,col:0xeadcc0},
  fruit:{name:'Fruit crate',inds:['juice'],u:36,price:16,col:0xff8a3d},
  cream:{name:'Cream & cones',inds:['icecream'],u:36,price:15,col:0xffc8d8}
};
var SUP_ORDER=['beans','milk','cups','flour','fruit','cream'];

function W4(){G.w4=G.w4||{};var w=G.w4;w.stock=w.stock||{};w.land=w.land||{};w.builds=w.builds||[];w.trunk=w.trunk||[];w.tcap=w.tcap||6;return w;}
O.W4=W4;
function city(){return curLoc().city;}
function dists(){return cityDistricts(city());}
function supPrice(k){return Math.round(SUP[k].price*(1+G.lvl*.05)*Math.pow(1.8,city()));}
// stocked supplies halve ingredient costs, but only while you work a shift there
O.costMult=function(loc){var w=G.w4;return w&&w.stock&&w.stock[loc.ind]>0&&SH&&SH.loc===loc?.5:1;};
O.use=function(loc,n){var w=G.w4;if(!w||!w.stock||!(w.stock[loc.ind]>0))return;w.stock[loc.ind]=Math.max(0,w.stock[loc.ind]-n);if(w.stock[loc.ind]===0)toast('Storeroom is out of '+IND[loc.ind].name.toLowerCase()+' supplies. Restock at Crema Supply Co.','bad');};

/* ---------- textures ---------- */
var TX={};
function skyTex(D){var k='sky'+(D.win||'street');if(TX[k])return TX[k];var night=D.win==='night';
  return TX[k]=canvasTex(16,256,function(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,night?'#1c2350':'#6ec3f2');gr.addColorStop(.62,night?'#40357a':'#cdeefe');gr.addColorStop(1,night?'#5a4a8a':'#fff6e6');g.fillStyle=gr;g.fillRect(0,0,w,h);});}
function roadTex(){return TX.road||(TX.road=(function(){var t=canvasTex(256,256,function(g,w,h){g.fillStyle='#5d6068';g.fillRect(0,0,w,h);for(var i=0;i<900;i++){g.fillStyle='rgba(255,255,255,'+(Math.random()*.05)+')';g.fillRect(Math.random()*w,Math.random()*h,2,2);}g.fillStyle='#f6d26b';g.fillRect(0,h/2-5,w*.55,10);});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
function walkTex(){return TX.walk||(TX.walk=(function(){var t=canvasTex(128,128,function(g,w,h){g.fillStyle='#e9e1d4';g.fillRect(0,0,w,h);g.strokeStyle='#d3c9b8';g.lineWidth=3;for(var i=0;i<=4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,h);g.stroke();g.beginPath();g.moveTo(0,i*32);g.lineTo(w,i*32);g.stroke();}});t.wrapS=t.wrapT=T.RepeatWrapping;return t;})());}
function winTex4(col,lit){var k='w4'+col+lit;if(TX[k])return TX[k];var t=canvasTex(128,128,function(g,w,h){g.fillStyle=hexCss(col);g.fillRect(0,0,w,h);for(var y=0;y<2;y++)for(var x=0;x<2;x++){var X=x*64+14,Y=y*64+12;g.fillStyle='rgba(255,255,255,.85)';g.fillRect(X-4,Y-4,44,46);g.fillStyle=lit?'#ffe1a0':'#7fb6d8';g.fillRect(X,Y,36,38);g.fillStyle='rgba(255,255,255,.45)';g.fillRect(X+3,Y+3,10,30);}});t.wrapS=t.wrapT=T.RepeatWrapping;return TX[k]=t;}
function stripeTex(a,b){var k='st'+a+b;if(TX[k])return TX[k];return TX[k]=canvasTex(128,32,function(g,w,h){for(var i=0;i<8;i++){g.fillStyle=hexCss(i%2?b:a);g.fillRect(i*16,0,16,h);}});}

/* ---------- people & vehicles ---------- */
function person(D,opt){var me=makeCustomer(D,opt||{});return me;}
function pickup(col){
  var g=new T.Group(),body=toon(col),dark=toon(0x2a2a30),gl=glass(0xbfe6ff,.55);
  rb(1.9,.55,4.2,.12,body,0,.72,0,g);            // chassis
  rb(1.8,.85,1.7,.22,body,0,1.38,.95,g);         // cab
  rb(1.6,.6,1.2,.16,gl,0,1.5,1.05,g);            // windows
  [-1,1].forEach(function(s){rb(.14,.42,2.1,.05,body,s*.88,1.2,-1.0,g);});rb(1.9,.42,.14,.05,body,0,1.2,-2.05,g); // bed walls
  [[-.85,1.35],[.85,1.35],[-.85,-1.3],[.85,-1.3]].forEach(function(p){var w=cy(.34,.34,.26,dark,p[0],.36,p[1],g,14);w.rotation.z=Math.PI/2;cy(.15,.15,.28,toon(0xd8d8d8),p[0],.36,p[1],g,10).rotation.z=Math.PI/2;});
  sp(.1,flat(0xfff6c8),.6,.85,2.1,g,8);sp(.1,flat(0xfff6c8),-.6,.85,2.1,g,8);
  sp(.08,flat(0xff5a4a),.75,.95,-2.1,g,8);sp(.08,flat(0xff5a4a),-.75,.95,-2.1,g,8);
  var bed=new T.Group();bed.position.set(0,1.0,-1.0);g.add(bed);g.userData.bed=bed;
  blob(2.4,4.8,g);
  return g;
}
function crate(k,p,x,y,z){var s=SUP[k],m=rb(.7,.5,.55,.06,toon(s.col),x||0,y||0,z||0,p);rb(.72,.08,.57,.03,toon(0x8a5a3a),0,.14,0,m);return m;}
function trunkView(){if(!car)return;var b=car.userData.bed;while(b.children.length)b.remove(b.children[0]);W4().trunk.forEach(function(k,i){crate(k,b,(i%2?.38:-.38),.25+Math.floor(i/4)*.52,(Math.floor(i/2)%2?.45:-.45));});}
function carryView(){var h=P.hand;while(h.children.length)h.remove(h.children[0]);P.carry.forEach(function(k,i){crate(k,h,0,i*.52,0);});}

/* ---------- world build ---------- */
function lotX(k,i){return k*SEG+LOTW/2+1+i*(LOTW+1.1);}
function landKey(D,side,i){return city()+':'+D.id+':'+side+':'+i;}
function myLocIn(D){for(var i=0;i<G.locs.length;i++){var l=G.locs[i];if(l.city===city()&&l.did===D.id)return l;}return null;}
function build(){
  var sc=new T.Scene();O.scene=sc;sc.environment=scene.environment;
  var D0=distOf(curLoc());sc.background=skyTex(D0);sc.fog=new T.Fog(D0.win==='night'?0x3a3070:0xdff3ff,45,150);
  sc.add(new T.HemisphereLight(0xfff6ea,0x9a8a7a,.62));
  var sun=new T.DirectionalLight(0xffffff,.65);sun.position.set(-20,40,25);sc.add(sun);
  var fill=new T.DirectionalLight(0xffe2c0,.25);fill.position.set(30,12,-10);sc.add(fill);
  O.cam=O.cam||new T.PerspectiveCamera(50,W/H,.1,260);
  acts=[];sites=[];peds=[];
  var ds=dists(),len=ds.length*SEG;O.len=len;
  // ground, road, sidewalks
  var rt=roadTex().clone();rt.needsUpdate=true;rt.repeat.set(len/9,1);
  var road=plane(len+60,ROAD*2,toon(0xffffff,{map:rt}),len/2,0,0,sc);road.rotation.x=-Math.PI/2;
  var wt=walkTex().clone();wt.needsUpdate=true;wt.repeat.set((len+60)/2.4,WALK/2.4);
  [-1,1].forEach(function(s){var w=bx(len+60,.2,WALK,toon(0xffffff,{map:wt}),len/2,.1,s*(ROAD+WALK/2),sc);bx(len+60,.24,.25,toon(0xcfc6b8),len/2,.12,s*(ROAD+.1),sc);});
  var grass=plane(len+400,300,toon(0x8ccf72),len/2,-.02,0,sc);grass.rotation.x=-Math.PI/2;
  ds.forEach(function(D,k){buildDistrict(sc,D,k);});
  // pickup
  var w=W4();car=pickup(IND[curLoc().ind].theme.accent||0xffb83d);sc.add(car);
  var c0=w.car&&w.car.city===city()?w.car:{x:lotX(distIndex(curLoc().did),1)+5.5,z:ROAD-1.4,ry:Math.PI/2};
  car.position.set(c0.x,0,c0.z);car.rotation.y=c0.ry;trunkView();
  acts.push({car:true,get x(){return car.position.x;},get z(){return car.position.z;},r:3.2,label:function(){return drv?'':'Drive your pickup';},sub:function(){return W4().trunk.length+'/'+W4().tcap+' crates in the bed';},fn:function(){if(P.carry.length){loadTrunk();return;}enterCar();},
    alt:function(){return P.carry.length?null:W4().trunk.length?{label:'Take a crate out',fn:function(){if(P.carry.length>=2)return;P.carry.push(W4().trunk.pop());carryView();trunkView();save();}}:null;}});
  // player
  P.me=person(D0,{staff:IND[curLoc().ind].theme.accent});P.me.root.scale.setScalar(1.05);sc.add(P.me.root);
  P.hand=new T.Group();P.hand.position.set(0,1.05,.42);P.me.root.add(P.hand);carryView();
  // pedestrians
  for(var i=0;i<26;i++){var D=ds[i%ds.length],me=person(D);me.root.scale.setScalar(.98);sc.add(me.root);var side=Math.random()<.5?-1:1;
    peds.push({me:me,x:rnd(0,len),z:side*(ROAD+WALK*(.3+Math.random()*.4)),dir:Math.random()<.5?-1:1,v:rnd(.9,1.5),stop:0});}
  buildStore();
  O.built=city();
}
function distIndex(did){var ds=dists();for(var i=0;i<ds.length;i++)if(ds[i].id===did)return i;return 0;}
function buildDistrict(sc,D,k){
  var x0=k*SEG,mine=myLocIn(D),r=mulberry(k*977+city()*31+7),pal=districtPal(D);
  // district gateway sign
  var gs=new T.Group();gs.position.set(x0+.3,0,-(ROAD+WALK)+.4);sc.add(gs);cyB(.08,3.2,toon(0x3a3f4b),0,0,0,gs,8);
  var sg=plane(3.2,.8,flat(0xffffff,{map:labelTex(D.name,{bg:'#2f6f5a',fg:'#ffffff',w:512,h:128})}),0,3.1,0,gs);sg.rotation.y=Math.PI/2;var sg2=sg.clone();sg2.rotation.y=-Math.PI/2;gs.add(sg2);
  if(G.lvl<D.lvl){var lk=plane(3,.6,flat(0xffffff,{map:labelTex('Opens at level '+D.lvl,{bg:'#fff6e6',fg:'#8a5a3a',w:512,h:100})}),0,2.4,0,gs);lk.rotation.y=Math.PI/2;}
  // crosswalk
  for(var s=-3;s<=3;s++){var cw=plane(.6,ROAD*2-.4,flat(0xffffff,{op:.85}),x0+1.5+s*.0,0.012,0,sc);cw.rotation.x=-Math.PI/2;cw.position.x=x0+.2;cw.scale.x=1;cw.position.z=s*1.25;cw.scale.y=.12;cw.rotation.z=Math.PI/2;}
  for(var side=-1;side<=1;side+=2)for(var i=0;i<LOTS;i++){
    var x=lotX(k,i),key=landKey(D,side,i),w=W4();
    var mineHere=mine&&((mine.w4lot&&mine.w4lot===key)||(!mine.w4lot&&side===1&&i===1));
    var rivalHere=mine&&mine.comp&&side===1&&i===2;
    var site=w.builds.filter(function(b){return b.key===key&&!b.done;})[0];
    var builtLoc=G.locs.filter(function(l){return l.w4lot===key;})[0];
    if(builtLoc&&builtLoc!==mine)mineHere=false;
    if(mineHere||builtLoc){shopFront(sc,x,side,builtLoc||mine,D);continue;}
    if(rivalHere){rivalFront(sc,x,side,mine,D);continue;}
    if(k===0&&side===-1&&i===1){supplyFront(sc,x,side);continue;}
    if(site){constructionSite(sc,x,side,site,D);continue;}
    var forSale=w.land[key]||r()<.34;
    if(forSale){landLot(sc,x,side,key,D);continue;}
    plainBuilding(sc,x,side,D,pal,r);
  }
  // street dressing
  for(var j=0;j<4;j++){var tx=x0+5+j*11.5;tree4(sc,tx,ROAD+WALK-.6,pal.tree);tree4(sc,tx+5.7,-(ROAD+WALK-.6),pal.tree);lamp4(sc,tx+2.8,ROAD+.5);lamp4(sc,tx+8.5,-(ROAD+.5));}
}
function districtPal(D){
  var P2={street:[0xf2a65a,0xe86a5c,0x7cc7bd,0xf6d26b,0xb39ddb,0xef8fb0],campus:[0xc4573e,0xd9775a,0xe9e2d3,0xb84a36],towers:[0x5b7fa6,0x7aa3c9,0x46698f,0x9cc0de],ocean:[0xf5dca0,0x7fcdf7,0xffffff,0xef5a4c],
    old:[0xf4c0a0,0xf6e2a0,0xb8dcc8,0xf0b4c4,0xc9c0ea],runway:[0xc7ced4,0x9aa2ac,0xe8eef2],snow:[0xe8f2ff,0xc94a3a,0x3f7a5a],park:[0xa8d98a,0xf6e2a0,0xe9d6a8],night:[0x3a2a50,0xef5a4c,0xffc63d,0x21a98d],harbor:[0x9cc4dc,0xe8eef2,0xef5a4c]}[D.win]||[0xf2a65a,0xe86a5c,0x7cc7bd];
  return {cols:P2,tree:D.win==='snow'?0x3f7a5a:D.win==='ocean'?0x7fbf5a:0x5fb35a,tall:D.win==='towers'?2.2:D.win==='old'?.9:1};
}
function facing(g,side){g.rotation.y=side>0?Math.PI:0;}
function plainBuilding(sc,x,side,D,pal,r){
  var col=pal.cols[Math.floor(r()*pal.cols.length)],h=(5.5+r()*5)*pal.tall,d=8,g=new T.Group();g.position.set(x,0,side*(FRONT+d/2));facing(g,side);sc.add(g);
  rb(LOTW,h,d,.18,toon(col),0,h/2,0,g);
  var wt=winTex4(col,D.win==='night');var wm=toon(0xffffff,{map:wt});
  var wp=plane(LOTW-1.2,h-3.4,wm,0,(h-3.4)/2+2.9,d/2+.02,g);wp.material=toon(0xffffff,{map:(function(){var t=wt.clone();t.needsUpdate=true;t.repeat.set(Math.round((LOTW-1.2)/2.3),Math.max(1,Math.round((h-3.4)/2.4)));return t;})()});
  rb(LOTW+.3,.35,d+.3,.08,toon(0xffffff),0,h+.15,0,g);
  // ground floor shop window + little awning
  rb(LOTW-1.4,2.1,.18,.05,glass(0xbfe6ff,.6),0,1.35,d/2+.05,g);
  var aw=cy(.55,.55,LOTW-1.2,toon(0xffffff,{map:stripeTex(pal.cols[(Math.floor(r()*9))%pal.cols.length],0xffffff)}),0,2.75,d/2+.35,g,16);aw.rotation.z=Math.PI/2;aw.scale.set(1,1,.6);
  if(r()<.5)rb(1.6,.5,.5,.1,toon(0x7fbf5a),-2.6,.25,d/2+.6,g);
}
function shopFront(sc,x,side,loc,D){
  var th=IND[loc.ind].theme,g=new T.Group(),d=8,h=7.2;g.position.set(x,0,side*(FRONT+d/2));facing(g,side);sc.add(g);
  rb(LOTW,h,d,.2,toon(th.wall),0,h/2,0,g);rb(LOTW+.2,.5,d+.2,.1,toon(th.trim),0,h+.2,0,g);
  rb(LOTW-1,3.2,.2,.08,glass(0xffe9c0,.5),-1.2,1.8,d/2+.06,g);
  var glow=plane(LOTW-2,2.6,flat(0xffd890,{op:.55}),-1.2,1.7,d/2-.1,g);
  rb(1.4,2.6,.2,.08,toon(th.trim),LOTW/2-1.5,1.3,d/2+.08,g);sp(.06,toon(0xffd23d),LOTW/2-2.0,1.3,d/2+.22,g,8);
  var aw=cy(.75,.75,LOTW-.8,toon(0xffffff,{map:stripeTex(th.accent,0xffffff)}),0,3.75,d/2+.55,g,18);aw.rotation.z=Math.PI/2;aw.scale.set(1,1,.62);
  var sign=plane(LOTW-1.6,1.3,flat(0xffffff,{map:labelTex('Crema '+IND[loc.ind].name,{bg:'#2a1a12',fg:'#ffc63d',w:768,h:160,sub:loc.name})}),0,5.4,d/2+.12,g);
  [[-3.6,0],[3.6,0]].forEach(function(p){rb(1.1,.5,.5,.1,toon(0x7a4a2a),p[0],.25,d/2+1.2,g);sp(.42,toon(0x5fb35a),p[0],.75,d/2+1.2,g,12);});
  var door={x:x+(side>0?-1:1)*(LOTW/2-1.5)*(side>0?1:1),z:side*(FRONT-.2)};door.x=x+(side>0?-(LOTW/2-1.5):(LOTW/2-1.5));
  var here=SH&&SH.loc===loc;
  acts.push({x:door.x,z:door.z,r:2.3,label:function(){return P.carry.length?'Unload '+P.carry.length+' crate'+(P.carry.length>1?'s':'')+' to the storeroom':here?'Back to the counter':'Work a shift here';},
    sub:function(){var s=W4().stock[loc.ind]||0;return loc.name+' · storeroom: '+s+' '+IND[loc.ind].name.toLowerCase()+' supplies';},
    fn:function(){if(P.carry.length){unload(P.carry);P.carry=[];carryView();return;}if(here)O.exit();else{O.exit(true);var i=G.locs.indexOf(loc);if(i>=0){G.act=i;startShift();}}},
    alt:function(){return W4().trunk.length&&car.position.distanceTo(V3(door.x,0,door.z))<14&&!drv?{label:'Unload the pickup ('+W4().trunk.length+')',fn:function(){unload(W4().trunk);W4().trunk=[];trunkView();}}:{label:'Call a construction crew',fn:function(){crewForShop(loc,x,side);}};}});
}
function rivalFront(sc,x,side,mine,D){
  var c=mine.comp,g=new T.Group(),d=8,h=6.4;g.position.set(x,0,side*(FRONT+d/2));facing(g,side);sc.add(g);
  rb(LOTW,h,d,.2,toon(0x6a6f7a),0,h/2,0,g);rb(LOTW-1.4,2.8,.2,.06,glass(0xbfe6ff,.6),0,1.6,d/2+.05,g);
  plane(LOTW-1.6,1.1,flat(0xffffff,{map:labelTex(c.name,{bg:'#ffffff',fg:'#3a3f4b',w:768,h:150,sub:'Rival · strength '+Math.round(c.S)})}),0,4.6,d/2+.12,g);
  acts.push({x:x,z:side*(FRONT-.2),r:2.4,label:'Peek into '+c.name,sub:'Strength '+Math.round(c.S)+' · deal with rivals from the Empire tab',fn:function(){toast(c.name+' is packed today. Strength '+Math.round(c.S)+'. Outsell them, or squeeze them from the Empire tab.');}});
}
function supplyFront(sc,x,side){
  var g=new T.Group(),d=9,h=6.8;g.position.set(x,0,side*(FRONT+d/2));facing(g,side);sc.add(g);
  rb(LOTW,h,d,.22,toon(0x4f7fb0),0,h/2,0,g);rb(LOTW+.2,.5,d+.2,.1,toon(0xf2f2f2),0,h+.2,0,g);
  for(var i=-1;i<=1;i+=2){var rd=rb(3.4,3.2,.15,.05,toon(0xd8dee6),i*2.3,1.6,d/2+.06,g);for(var j=0;j<6;j++)bx(3.3,.05,.03,toon(0xb8c0ca),i*2.3,.4+j*.5,d/2+.15,g);}
  plane(LOTW-1,1.4,flat(0xffffff,{map:labelTex('Crema Supply Co.',{bg:'#ffffff',fg:'#2f5f90',w:768,h:160,sub:'Beans · milk · flour · fruit · cups'})}),0,5.2,d/2+.12,g);
  acts.push({x:x,z:side*(FRONT-.2),r:2.6,label:'Go into Crema Supply Co.',sub:'Buy crates, haul them back, halve your ingredient costs',fn:function(){enterStore(x,side);}});
}
function landLot(sc,x,side,key,D){
  var w=W4(),own=w.land[key],g=new T.Group();g.position.set(x,0,side*(FRONT+4));facing(g,side);sc.add(g);
  var lawn=plane(LOTW,8,toon(own?0x9ed68a:0xb7d88c),0,.03,0,g);lawn.rotation.x=-Math.PI/2;
  for(var i=-2;i<=2;i++){cyB(.05,.9,toon(0xffffff),i*2.4,0,3.9,g,6);}bx(LOTW-.6,.08,.05,toon(0xffffff),0,.75,3.9,g);
  var post=cyB(.07,2.2,toon(0x7a4a2a),2.6,0,3.6,g,6);
  var price=landPrice(D);
  plane(2.4,1.1,flat(0xffffff,{map:labelTex(own?'YOUR LAND':'FOR SALE',{bg:own?'#3fa65a':'#ffffff',fg:own?'#ffffff':'#c0392b',w:512,h:220,sub:own?'Call a construction crew':'$'+price.toLocaleString()})}),2.6,2.0,3.66,g);
  acts.push({x:x,z:side*(FRONT-.2),r:3,label:function(){return W4().land[key]?'Call a construction crew':'Buy this land · '+fmt(price);},sub:D.name+(G.lvl<D.lvl?' · opens at level '+D.lvl:''),
    fn:function(){if(!W4().land[key]){if(G.lvl<D.lvl){toast(D.name+' opens at level '+D.lvl+'.','bad');return;}if(!spend(price)){toast('You need '+fmt(price)+'.','bad');return;}W4().land[key]={d:D.id,at:now()};news('You bought land in '+D.name+'.','good');save();rebuild();return;}crewForLand(key,D);}});
}
function landPrice(D){return Math.round(Math.max(600,(D.cost||1500)*.45+G.lvl*120));}

/* ---------- construction ---------- */
function crewForLand(key,D){
  var mine=myLocIn(D),opts=[];
  if(!mine){IND_ORDER.forEach(function(ik){var I=IND[ik];if(G.lvl<I.lvl)return;var c=Math.round(locCost(city(),D.id,ik)*.65),t=Math.round(60+c/400);opts.push({t:'Build a Crema '+I.name+' · '+fmt(c),s:'Crew needs about '+mmss(Math.min(600,t))+'. It opens as a new location.',fn:function(){startBuild(key,D,{kind:'shop',ind:ik,cost:c,sec:Math.min(600,t)});}});});}
  else opts.push({t:'Patio & parking for '+mine.name+' · '+fmt(1500+G.lvl*400),s:'+3 decor at that shop. About 1 minute.',fn:function(){startBuild(key,D,{kind:'patio',loc:mine.id,cost:1500+G.lvl*400,sec:60});}});
  choose('Construction crew','"What are we building, boss?"',opts);
}
function crewForShop(loc,x,side){
  var opts=[];var nx=loc.size+1;
  if(SIZES[nx])opts.push({t:'Expand to a '+SIZES[nx].name+' · '+fmt(sizeCost(loc)),s:'More counter spots and stations. The crew works outside while you keep selling. About '+mmss(45+nx*30)+'.',fn:function(){if(!spend(sizeCost(loc))){toast('Not enough cash.','bad');return;}W4().builds.push({key:'shop:'+loc.id,kind:'size',loc:loc.id,t0:now(),sec:45+nx*30,cost:0});save();toast('Crew is on the way.','good');rebuild();}});
  opts.push({t:'New storefront & sign · '+fmt(800+G.lvl*200),s:'+1 decor.',fn:function(){if(!spend(800+G.lvl*200))return;loc.decor=Math.min(10,(loc.decor||0)+1);save();toast('Looking sharp.','good');}});
  choose('Construction crew','Work on '+loc.name+'.',opts);
}
function startBuild(key,D,o){if(!spend(o.cost)){toast('You need '+fmt(o.cost)+'.','bad');return;}W4().builds.push({key:key,d:D.id,kind:o.kind,ind:o.ind,loc:o.loc,t0:now(),sec:o.sec});save();toast('The crew is on the way!','good');rebuild();}
function constructionSite(sc,x,side,b,D){
  var g=new T.Group(),d=8;g.position.set(x,0,side*(FRONT+d/2));facing(g,side);sc.add(g);
  var dirt=plane(LOTW,d,toon(0xb08a5a),0,.03,0,g);dirt.rotation.x=-Math.PI/2;
  var col=b.kind==='shop'?IND[b.ind].theme.wall:0xd8c8a8,shell=rb(LOTW-1,7,d-1,.2,toon(col),0,3.5,0,g);shell.scale.y=.02;
  for(var i=-2;i<=2;i++)for(var j=0;j<3;j++){cyB(.05,7.4,toon(0xf2b632),i*2.3,0,d/2-.3-j*.01,g,6);}
  for(var k=1;k<4;k++)bx(LOTW-.4,.08,.6,toon(0x9a7a4a),0,k*2.2,d/2-.2,g);
  var crane=new T.Group();crane.position.set(-LOTW/2+.6,0,-d/2+1);g.add(crane);cyB(.12,11,toon(0xf2b632),0,0,0,crane,6);var arm=bx(8,.22,.22,toon(0xf2b632),3.6,10.8,0,crane);
  var hook=bx(.6,.4,.6,toon(0x8a8f99),6,8.5,0,crane);
  var workers=[0,1].map(function(i){var w=person(D,{staff:0xf2b632});w.root.position.set(-2+i*3.5,0,d/2+1.1);g.add(w.root);cy(.36,.4,.18,toon(0xffc63d),0,.25,0,w.head,14);return w;});
  var truck=pickup(0xf2b632);truck.position.set(LOTW/2+2,0,d/2+1.4);truck.rotation.y=Math.PI/2;g.add(truck);
  var lab=plane(3.4,.9,flat(0xffffff,{map:labelTex('Under construction',{bg:'#ffc63d',fg:'#2a1a12',w:512,h:130})}),0,1.3,d/2+1.6,g);
  sites.push({b:b,shell:shell,crane:crane,hook:hook,workers:workers,lab:lab});
  acts.push({x:x,z:side*(FRONT-.2),r:3,label:function(){return 'Construction · '+Math.round(prog(b)*100)+'%';},sub:function(){return mmss(Math.max(0,b.sec-(now()-b.t0)/1000))+' to go';},fn:function(){var c=Math.round(500+G.lvl*250);choose('Site foreman','"We\'re '+Math.round(prog(b)*100)+'% there."',[{t:'Pay overtime to finish now · '+fmt(c),fn:function(){if(!spend(c))return;b.t0=now()-b.sec*1000;}}]);}});
}
function prog(b){return clamp((now()-b.t0)/1000/b.sec,0,1);}
function finishBuilds(){var w=W4(),changed=false;w.builds.forEach(function(b){if(b.done||prog(b)<1)return;b.done=true;changed=true;
  if(b.kind==='shop'){var loc=newLoc(city(),b.d,b.ind);loc.w4lot=b.key;G.locs.push(loc);delete w.land[b.key];banner('Grand opening!','Crema '+IND[b.ind].name+' · '+loc.name,'good');news('Your new '+IND[b.ind].name.toLowerCase()+' in '+loc.name+' is open. Hire staff from the Shop tab.','good',loc);addXP(200+G.lvl*20);}
  else if(b.kind==='patio'){var l=G.locs.filter(function(x){return x.id===b.loc;})[0];if(l)l.decor=Math.min(10,(l.decor||0)+3);delete w.land[b.key];banner('Patio finished','+3 decor','good');}
  else if(b.kind==='size'){var l2=G.locs.filter(function(x){return x.id===b.loc;})[0];if(l2&&SIZES[l2.size+1]){l2.size++;G.rebuild=true;banner(SIZES[l2.size].name+' finished','More room behind the counter','good');}}
  try{sfx.bell();}catch(e){}});
  w.builds=w.builds.filter(function(b){return !b.done;});if(changed){save();if(O.on)rebuild();}}
O.finishBuilds=finishBuilds;

/* ---------- supply store ---------- */
function buildStore(){
  storeG=new T.Group();storeG.position.set(-400,0,0);O.scene.add(storeG);
  var w=16,d=12,fl=plane(w,d,toon(0xece3d2),0,0,0,storeG);fl.rotation.x=-Math.PI/2;
  rb(w,5,.3,.05,toon(0x4f7fb0),0,2.5,-d/2,storeG);rb(.3,5,d,.05,toon(0x4f7fb0),-w/2,2.5,0,storeG);rb(.3,5,d,.05,toon(0x4f7fb0),w/2,2.5,0,storeG);
  plane(6,1.2,flat(0xffffff,{map:labelTex('Crema Supply Co.',{bg:'#ffffff',fg:'#2f5f90',w:768,h:160})}),0,4,-d/2+.2,storeG);
  O.shelves=[];
  SUP_ORDER.forEach(function(k,i){var sx=-6+(i%3)*6,sz=i<3?-3.2:1;var sh=new T.Group();sh.position.set(sx,0,sz);storeG.add(sh);
    rb(4,.15,1.2,.04,toon(0xb88a5a),0,.6,0,sh);rb(4,.15,1.2,.04,toon(0xb88a5a),0,1.5,0,sh);[-1.9,1.9].forEach(function(px){bx(.12,2.2,1.2,toon(0x8a5a3a),px,1.1,0,sh);});
    for(var j=0;j<4;j++){crate(k,sh,-1.4+j*.95,.95,0);crate(k,sh,-1.4+j*.95,1.85,0);}
    plane(3,.6,flat(0xffffff,{map:labelTex(SUP[k].name,{bg:'#ffffff',fg:'#2a1a12',w:512,h:100})}),0,2.5,.62,sh);
    O.shelves.push({k:k,x:-400+sx,z:sz+1.1});});
  var reg=rb(2.6,1,1,.1,toon(0xe2553f),5,0.5,4.4,storeG);var clerk=person(distOf(curLoc()),{staff:0x4f7fb0});clerk.root.position.set(5,0,3.6);storeG.add(clerk.root);O.clerk=clerk;
}
function enterStore(x,side){inStore=true;storeBack={x:x,z:side*(FRONT-1.2)};P.x=-400;P.z=5;P.ry=Math.PI;yaw=0;toast('Grab what you need. Each crate is paid as you take it. Carry up to 2.');}
function storeActs(){
  var a=O.shelves.map(function(s){return {x:s.x,z:s.z,r:1.6,label:function(){return P.carry.length>=2?'Your hands are full':'Grab '+SUP[s.k].name+' · '+fmt(supPrice(s.k));},sub:function(){return '+'+SUP[s.k].u+' supplies for '+SUP[s.k].inds.map(function(i){return IND[i].name.toLowerCase();}).join(', ');},
    fn:function(){if(P.carry.length>=2){toast('Carry them to your pickup first (2 at a time).');return;}var c=supPrice(s.k);if(!spend(c)){toast('Not enough cash.','bad');return;}P.carry.push(s.k);carryView();try{sfx.coin&&sfx.coin();}catch(e){}save();}};});
  a.push({x:-400,z:5.6,r:2,label:'Leave the store',fn:function(){inStore=false;P.x=storeBack.x;P.z=storeBack.z;P.ry=0;}});
  return a;
}
function loadTrunk(){var w=W4();while(P.carry.length&&w.trunk.length<w.tcap)w.trunk.push(P.carry.shift());carryView();trunkView();if(P.carry.length)toast('The pickup bed is full ('+w.tcap+').','bad');save();}
function unload(list){var w=W4(),add={};list.forEach(function(k){var s=SUP[k];s.inds.forEach(function(ik){var u=Math.round(s.u/s.inds.length*(s.inds.length>1?1.5:1));w.stock[ik]=(w.stock[ik]||0)+u;add[ik]=(add[ik]||0)+u;});});
  var txt=Object.keys(add).map(function(ik){return '+'+add[ik]+' '+IND[ik].name.toLowerCase();}).join(', ');toast('Storeroom stocked: '+txt+'. Ingredient costs are halved while it lasts.','good');addXP(list.length*6);save();}

/* ---------- driving ---------- */
function enterCar(){drv={v:0};P.me.root.visible=false;yaw=car.rotation.y+Math.PI;}
function exitCar(){var s=V3(1.6,0,0).applyAxisAngle(V3(0,1,0),car.rotation.y);P.x=car.position.x+s.x;P.z=clamp(car.position.z+s.z,-(FRONT-.3),FRONT-.3);P.me.root.visible=true;drv=null;var w=W4();w.car={x:car.position.x,z:car.position.z,ry:car.rotation.y,city:city()};save();}
function driveStep(dt){
  var fw=clamp((keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joy.y,-1,1),st=clamp((keys.a||keys.arrowleft?1:0)-(keys.d||keys.arrowright?1:0)-joy.x,-1,1);
  drv.v+=fw*dt*(fw*drv.v<0?28:12);drv.v*=Math.pow(fw?.97:.25,dt);drv.v=clamp(drv.v,-6,22);
  car.rotation.y+=st*dt*1.8*clamp(drv.v/6,-1,1);
  var nx=car.position.x+Math.sin(car.rotation.y)*drv.v*dt,nz=car.position.z+Math.cos(car.rotation.y)*drv.v*dt;
  if(Math.abs(nz)<ROAD+WALK-1&&nx>-12&&nx<O.len+12){car.position.x=nx;car.position.z=nz;}else drv.v*=-.3;
  P.x=car.position.x;P.z=car.position.z;
}

/* ---------- enter / exit ---------- */
O.enter=function(){
  if(O.on)return;W4();finishBuilds();pauseFor();O.on=true;document.body.classList.add('outside');
  if(!O.scene||O.built!==city()||O.dirty)build();O.dirty=false;
  var k=distIndex(curLoc().did),mine=curLoc();var key=mine.w4lot,x=lotX(k,1),side=1;
  if(key){var pp=key.split(':');side=+pp[2];x=lotX(k,+pp[3]);}
  P.x=x+(side>0?-(LOTW/2-1.5):(LOTW/2-1.5));P.z=side*(FRONT-1.4);P.ry=side>0?Math.PI:0;yaw=P.ry+Math.PI;inStore=false;
  $('#o-ui').hidden=false;
  if(!W4().seen){W4().seen=1;setTimeout(function(){toast('This is your street. Walk with WASD or the stick. Buy supplies across the road, buy land, call a crew, and drive your pickup to other districts.');},400);}
  resizeO();
};
O.exit=function(noUnpause){if(!O.on)return;O.on=false;if(drv)exitCar();document.body.classList.remove('outside');$('#o-ui').hidden=true;save();if(G.rebuild&&SH){startShift();return;}if(!noUnpause){paused=true;unpause();if(SH&&SH.phase!=='done')fitCamera();}};
function rebuild(){var px=P.x,pz=P.z,ry=P.ry,st=inStore,cp=car?{x:car.position.x,z:car.position.z,ry:car.rotation.y}:null,dv=drv;build();P.x=px;P.z=pz;P.ry=ry;inStore=st;if(cp){car.position.set(cp.x,0,cp.z);car.rotation.y=cp.ry;}if(dv){drv=dv;P.me.root.visible=false;}}
O.rebuild=function(){O.dirty=true;};

/* ---------- choices panel (small, contextual) ---------- */
function choose(title,sub,opts){
  var el=$('#o-pick');el.hidden=false;
  el.innerHTML='<div class="op-card"><button class="op-x" type="button">✕</button><b>'+esc(title)+'</b><p>'+esc(sub)+'</p>'+opts.map(function(o,i){return '<button class="op-o" type="button" data-i="'+i+'"><b>'+esc(o.t)+'</b>'+(o.s?'<small>'+esc(o.s)+'</small>':'')+'</button>';}).join('')+(opts.length?'':'<p>Nothing to build here right now.</p>')+'</div>';
  el.querySelector('.op-x').onclick=function(){el.hidden=true;};
  el.querySelectorAll('.op-o').forEach(function(b){b.onclick=function(){el.hidden=true;opts[+b.dataset.i].fn();};});
}

/* ---------- update ---------- */
function moveWalk(dt){
  var fx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,fz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joy.y,l=Math.hypot(fx,fz);
  var moving=l>.12&&$('#o-pick').hidden;
  if(moving){if(l>1){fx/=l;fz/=l;}var sp=(keys.shift||l>.95?5.2:3.2),s=Math.sin(yaw),c=Math.cos(yaw);
    var mx=(fx*c+fz*s)*sp*dt,mz=(-fx*s+fz*c)*sp*dt,nx=P.x+mx,nz=P.z+mz;
    if(inStore){nx=clamp(nx,-407.4,-392.6);nz=clamp(nz,-5.4,5.6);if(Math.abs(nx+400-5)<1.6&&Math.abs(nz-4.4)<.8)nz=P.z;O.shelves.forEach(function(s){if(Math.abs(nx-s.x)<2.1&&Math.abs(nz-(s.z-1.1))<.8){nx=P.x;nz=P.z;}});}
    else{nz=clamp(nz,-(FRONT-.35),FRONT-.35);nx=clamp(nx,-10,O.len+10);}
    P.x=nx;P.z=nz;P.ry=Math.atan2(mx,mz);}
  P.me.root.position.set(P.x,inStore?0:(Math.abs(P.z)>ROAD?.2:0),P.z);P.me.root.rotation.y=P.ry;animCust(P.me,dt,0,moving);
}
O.update=function(dt){
  if(!O.on)return;
  if(drv)driveStep(dt);else moveWalk(dt);
  // pedestrians stroll the sidewalks and pause at shop windows
  peds.forEach(function(p){if(p.stop>0){p.stop-=dt;animCust(p.me,dt,0,false);return;}p.x+=p.dir*p.v*dt;if(p.x<-8||p.x>O.len+8){p.dir*=-1;}if(Math.random()<dt*.04)p.stop=rnd(1,3);
    p.me.root.position.set(p.x,.2,p.z);p.me.root.rotation.y=p.dir>0?Math.PI/2:-Math.PI/2;animCust(p.me,dt,0,true);});
  // construction animates and finishes on its own (even while you're inside)
  sites.forEach(function(s){var k=prog(s.b);s.shell.scale.y=Math.max(.02,k);s.shell.position.y=3.5*k;s.crane.rotation.y=Math.sin(now()/1400)*.6;s.hook.position.y=6+Math.sin(now()/700)*2;
    s.workers.forEach(function(w,i){w.arms[0].rotation.x=-1.2+Math.sin(now()/150+i)*.6;animCust(w,dt,0,false);});});
  if(Math.random()<dt*.5)finishBuilds();
  // camera
  var f=drv?car.position:P.me.root.position,dd=drv?13:inStore?7:dist,pt=drv?.42:inStore?.75:pitch;
  if(drv)yaw+=angD(yaw,car.rotation.y+Math.PI)*Math.min(1,dt*2.2);
  if(W/H<.9)dd*=1.25;
  var cp=V3(f.x+Math.sin(yaw)*Math.cos(pt)*dd,f.y+1.4+Math.sin(pt)*dd,f.z+Math.cos(yaw)*Math.cos(pt)*dd);
  if(inStore){cp.x=clamp(cp.x,-407,-393);cp.z=clamp(cp.z,-5,7);}
  else if(!drv)cp.z=clamp(cp.z,-(FRONT+.5),FRONT+.5);
  O.cam.position.lerp(cp,Math.min(1,dt*8));O.cam.lookAt(f.x,f.y+1.2,f.z);
  // contextual actions
  var list=inStore?storeActs():acts,best=null,bd=1e9;
  if(!drv)list.forEach(function(a){var d=Math.hypot(a.x-P.x,a.z-P.z);if(d<a.r&&d<bd){bd=d;best=a;}});
  curAct=best;var el=$('#o-act'),el2=$('#o-alt');
  if(drv){el.hidden=false;el.innerHTML='<b>Get out</b><small>'+esc(districtAt(P.x).name)+'</small>';el2.hidden=true;}
  else if(best){var lab=typeof best.label==='function'?best.label():best.label;el.hidden=!lab;el.innerHTML='<b>'+esc(lab)+'</b>'+(best.sub?'<small>'+esc(typeof best.sub==='function'?best.sub():best.sub)+'</small>':'');
    curAlt=best.alt?(typeof best.alt==='function'?best.alt():best.alt):null;el2.hidden=!curAlt;if(curAlt)el2.innerHTML='<b>'+esc(curAlt.label)+'</b>';}
  else{el.hidden=true;el2.hidden=true;curAlt=null;}
  $('#o-where').textContent=(inStore?'Crema Supply Co.':districtAt(P.x).name)+(P.carry.length?' · carrying '+P.carry.length:'')+' · pickup '+W4().trunk.length+'/'+W4().tcap;
};
function districtAt(x){var ds=dists();return ds[clamp(Math.floor(x/SEG),0,ds.length-1)];}
function angD(a,b){var d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
function doAct(alt){if(!$('#o-pick').hidden)return;if(drv){exitCar();return;}if(alt){if(curAlt)curAlt.fn();return;}if(curAct)curAct.fn();}
function tree4(sc,x,z,c){cyB(.13,1.5,toon(0x7a4a2a),x,0,z,sc,8);var m=toon(c);sp(.95,m,x,2.1,z,sc,14);sp(.7,m,x-.55,1.8,z+.2,sc,12);sp(.7,m,x+.55,1.85,z-.15,sc,12);blob(1.6,1.6,sc,x,0.2,z);}
function lamp4(sc,x,z){cyB(.06,3.6,toon(0x3a3f4b),x,0,z,sc,8);sp(.2,flat(0xfff3c8),x,3.7,z,sc,10);}

/* ---------- input & ui ---------- */
function resizeO(){if(!O.cam)return;O.cam.aspect=W/H;O.cam.fov=W/H<.9?62:50;O.cam.updateProjectionMatrix();}
window.addEventListener('resize',function(){setTimeout(resizeO,50);});
window.addEventListener('keydown',function(e){if(!O.on)return;var k=e.key.toLowerCase();keys[k]=true;if(k==='e'||k==='enter')doAct(false);if(k==='f')doAct(true);if(k==='escape'){if(!$('#o-pick').hidden)$('#o-pick').hidden=true;}});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false;});
function bindUI(){
  var cv=renderer.domElement;
  cv.addEventListener('pointerdown',function(e){if(!O.on)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};});
  cv.addEventListener('pointermove',function(e){if(!O.on||!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.006;pitch=clamp(pitch+(e.clientY-drag.y)*.004,.15,1.2);drag.x=e.clientX;drag.y=e.clientY;});
  window.addEventListener('pointerup',function(){drag=null;});
  cv.addEventListener('wheel',function(e){if(O.on)dist=clamp(dist+e.deltaY*.006,4.5,18);},{passive:true});
  var js=$('#o-joy'),kn=js.querySelector('i'),jid=null,jc=null;
  js.addEventListener('pointerdown',function(e){jid=e.pointerId;var r=js.getBoundingClientRect();jc={x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2};js.setPointerCapture(e.pointerId);jm(e);});
  js.addEventListener('pointermove',function(e){if(e.pointerId===jid)jm(e);});
  function jm(e){var dx=(e.clientX-jc.x)/jc.r,dy=(e.clientY-jc.y)/jc.r,l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}joy.x=dx;joy.y=dy;kn.style.transform='translate('+dx*30+'px,'+dy*30+'px)';}
  function je(){jid=null;joy.x=joy.y=0;kn.style.transform='';}
  js.addEventListener('pointerup',je);js.addEventListener('pointercancel',je);
  $('#o-act').onclick=function(){doAct(false);};$('#o-alt').onclick=function(){doAct(true);};
  $('#o-in').onclick=function(){if(drv)exitCar();var mine=curLoc();O.exit();};
  $('#bOut').onclick=function(){if(O.on)O.exit();else O.enter();};
}
O.bind=bindUI;
O.hooks={state:function(){return {on:O.on,P:{x:P.x,z:P.z},act:curAct&&(typeof curAct.label==='function'?curAct.label():curAct.label),drv:!!drv,store:inStore,carry:P.carry.slice(),trunk:W4().trunk.slice(),stock:W4().stock,builds:W4().builds.length,land:Object.keys(W4().land).length,locs:G.locs.length,cash:Math.round(G.cash)};},
  act:function(a){doAct(a);},tp:function(x,z){P.x=x;P.z=z;},acts:function(){return (inStore?storeActs():acts).map(function(a){return {x:a.x,z:a.z,l:typeof a.label==='function'?a.label():a.label};});},key:function(k,v){keys[k]=v;}};
return O;
})();
