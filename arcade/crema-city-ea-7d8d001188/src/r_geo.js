
/* ---------- geography: mountains to the north (the ski lodge sits at their feet), the ocean to the south ---------- */
function placeEdges(p){
  var B=p.blocks,home=B[0];
  function swap(a,b){['c','r','x','z'].forEach(function(k){var t=a[k];a[k]=b[k];b[k]=t;});}
  function moveTo(b,row){if(!b||b.r===row)return;var c=B.filter(function(q){return q.r===row&&q!==home&&q!==b&&(q.t==='homes'||q.t==='motors'||(q.t==='dist'&&['ocean','harbor','snow','campus'].indexOf(q.D.win)<0));}).sort(function(a,q){return Math.abs(a.c-b.c)-Math.abs(q.c-b.c);})[0];if(c)swap(b,c);}
  B.filter(function(q){return q.D&&q.D.win==='snow';}).forEach(function(b){moveTo(b,0);});
  B.filter(function(q){return q.D&&(q.D.win==='ocean'||q.D.win==='harbor');}).forEach(function(b){moveTo(b,p.R-1);});
  if(home.r===0||home.r===p.R-1){}
}
function buildNorth(){var p=plan,keep=stat;stat=new T.Group();var g=stat,r=seeded(p.city*29+1),z0=p.zs[0]-RH,snowB=p.blocks.filter(function(q){return q.D&&q.D.win==='snow';})[0];
  var rock=toon(0x8a8f99),rock2=toon(0x7a7f8a),snow=toon(0xffffff),pine=toon(0x2f6e4a);
  var fh=planeR(p.xs[p.C]-p.xs[0]+400,70,30,6,toon(0xffffff,{map:grassT()}),(p.xs[0]+p.xs[p.C])/2+60,-.02,z0-36,g);fh.rotation.x=-Math.PI/2;
  for(var i=0;i<16;i++){var x=p.xs[0]-160+i*((p.xs[p.C]-p.xs[0]+380)/15)+rnd(-15,15),z=z0-70-r()*90,rad=40+r()*40,h=55+r()*80;
    var m=cone(rad,h,i%2?rock:rock2,x,h/2-2,z,g,7);m.rotation.y=r()*3;var cap=cone(rad*.42,h*.42,snow,x,h-h*.21-1.5,z,g,7);cap.rotation.y=m.rotation.y;}
  for(i=0;i<70;i++){var tx2=p.xs[0]-60+r()*(p.xs[p.C]-p.xs[0]+180),tz=z0-8-r()*60;if(snowB&&Math.abs(tx2-snowB.x)<6&&tz>z0-60)continue;cyB(.2,1,toon(0x7a4a2a),tx2,0,tz,g,6);var s2=.8+r()*.8;cone(1.6*s2,3*s2,pine,tx2,1+1.5*s2,tz,g,7);cone(1.1*s2,2.4*s2,pine,tx2,2.4+1.6*s2,tz,g,7);cone(.6*s2,.8*s2,snow,tx2,3.4+2.2*s2,tz,g,7);}
  O.scene.add(mergeGroup(stat));stat=keep;
  if(snowB){ // a chairlift climbs from the ski lodge up the mountain
    var lx=snowB.x+6,a=V3(lx,0,z0-6),b=V3(lx+30,62,z0-150),tw=[];for(var k=0;k<=5;k++){var t=k/5,px=a.x+(b.x-a.x)*t,py=a.y+(b.y-a.y)*t,pz=a.z+(b.z-a.z)*t;cyB(.35,9,toon(0x5a5f6a),px,py-.5,pz,dyn,8);bx(4,.3,.3,toon(0x5a5f6a),px,py+8.5,pz,dyn);}
    var cab=[];[-1.7,1.7].forEach(function(off){var c1=new T.Mesh(new T.BufferGeometry().setFromPoints([V3(a.x+off,8.5,a.z),V3(b.x+off,b.y+8.5,b.z)]),new T.LineBasicMaterial({color:0x2a2a30}));dyn.add(c1);});
    for(k=0;k<14;k++){var ch=new T.Group();dyn.add(ch);cyB(.03,1.6,toon(0x2a2a30),0,-1.6,0,ch,4);bx(1.2,.12,.6,toon(0xe2553f),0,-1.6,0,ch);bx(1.2,.6,.1,toon(0xe2553f),0,-1.3,-.28,ch);if(k%3===0){var sk=liteMe({shirt:pick([0xe2553f,0x2f8fd0,0xffc63d])});sk.sit=true;sk.root.position.set(0,-1.75,0);sk.root.scale.setScalar(.9);ch.add(sk.root);animLite(sk,0,false);}cab.push(ch);}
    anim.push({lift:cab,a:a,b:b});
    var base=new T.Group();base.position.set(lx,0,z0-10);dyn.add(base);rb(6,3.5,4,.1,toon(0x8a5a3a),0,1.75,0,base);var rf=prism(6.6,1.8,4.6,toon(0x7a4a3a),0,3.5,0,base);rf.rotation.y=Math.PI/2;
    plane(3.6,.7,flat(0xffffff,{map:signT('SUMMIT LIFT',{bg:'#2a1a12',fg:'#ffffff',w:512,h:100})}),0,2.8,2.02,base);addCol(lx-3,lx+3,z0-12,z0-8);
    ACTS.city.push({x:lx,z:z0-6.5,r:2.4,label:'Ride the Summit Lift · '+fmt(Math.round(12*tierM())),sub:'The best view in '+plan.name,fn:function(){if(!pay(Math.round(12*tierM()),'A lift ticket'))return;W4().f.lift=1;birdOn();BIRD.x=lx+20;BIRD.z=z0-100;BIRD.h=90;note('From the top of the lift','You can see the whole city from up here. Drag to look around, tap a place for directions.','good');}});
    places.push({id:'lift',name:'Summit Lift',kind:'park',x:lx,z:z0-6.5});}
  p.mtn=1;
}
function buildSouth(){var p=plan,keep=stat;stat=new T.Group();var g=stat,r=seeded(p.city*31+7),z0=p.zs[p.R]+RH,W2=p.xs[p.C]-p.xs[0]+500,cx=(p.xs[0]+p.xs[p.C])/2+80;
  var sand=planeR(W2,26,W2/8,4,toon(0xffffff,{map:sandT()}),cx,-.01,z0+13,g);sand.rotation.x=-Math.PI/2;
  var sea=planeR(W2+400,900,60,60,toon(0xffffff,{map:waterT()}),cx,-.4,z0+26+450,g);sea.rotation.x=-Math.PI/2;var foam=plane(W2,1.2,toon(0xf4fbff),cx,-.3,z0+26,g);foam.rotation.x=-Math.PI/2;
  for(var i=0;i<26;i++){var ux=p.xs[0]-40+r()*(W2-120),uz=z0+6+r()*14;var u=new T.Group();u.position.set(ux,0,uz);g.add(u);cyB(.04,2.2,toon(0xffffff),0,0,0,u,5);cone(1.2,.5,toon(pick([0xe2553f,0x46a9e6,0xffc63d,0xff79b4])),0,2.3,0,u,10);
    var tw=plane(1,2,toon(pick([0xe2553f,0x46a9e6,0xffc63d,0x6cc76a])),.8,.02,.4,u);tw.rotation.x=-Math.PI/2;if(r()<.6){var sb=liteMe();sb.sit=true;sb.root.position.set(.8,.05,.2);sb.root.rotation.y=Math.PI;u.add(sb.root);}}
  var lt=new T.Group();lt.position.set(p.xs[p.C]+60,0,z0+40);g.add(lt);cyB(3,2,toon(0x8a8f99),0,-1,0,lt,12);cy(1.6,2.4,16,toon(0xffffff,{map:stripeT(0xe2553f,0xffffff)}),0,9,0,lt,14).rotation.y=0;cyB(1.9,2.4,glass(0xfff3c8,.6),0,17,0,lt,12);cone(2.2,1.8,toon(0xe2553f),0,20.3,0,lt,12);
  O.scene.add(mergeGroup(stat));stat=keep;
  var lamp=new T.Mesh(new T.ConeGeometry(4,40,16,1,true),new T.MeshBasicMaterial({color:0xfff3c8,transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide}));lamp.position.set(p.xs[p.C]+60,18,z0+40);lamp.rotation.z=Math.PI/2;dyn.add(lamp);anim.push({beacon:lamp});
  // boats out on the water
  for(i=0;i<5;i++){var bt=new T.Group();bt.position.set(cx+rnd(-200,200),-.3,z0+60+i*40);dyn.add(bt);var hl=rb(2,1,6,.4,toon(0xffffff),0,.5,0,bt);var ms=cyB(.08,7,toon(0x8a5a3a),0,1,0,bt,5);var sl=prism(4.5,6,.05,toon(pick([0xfff6e6,0xe2553f,0x46a9e6])),0,1.6,0,bt);sl.rotation.y=Math.PI/2;sl.position.z=-1.2;anim.push({boat:bt,v:rnd(2,5)*(i%2?1:-1),cx:cx});}
  var oc=p.blocks.filter(function(q){return q.D&&q.D.win==='ocean';})[0];
  if(oc){ // a pier and a Ferris wheel off the boardwalk
    var pr=new T.Group();pr.position.set(oc.x,0,z0+2);dyn.add(pr);bx(5,.3,60,toon(0xc99a62),0,1.2,30,pr);for(var k=0;k<12;k++){cyB(.2,2,toon(0x8a5a3a),-2.2,-.8,k*5+2,pr,6);cyB(.2,2,toon(0x8a5a3a),2.2,-.8,k*5+2,pr,6);}bx(.08,.9,60,toon(0xffffff),-2.45,1.8,30,pr);bx(.08,.9,60,toon(0xffffff),2.45,1.8,30,pr);
    var fw=new T.Group();fw.position.set(oc.x+12,13,z0+12);dyn.add(fw);var rim=tor(11,.3,toon(0xffffff),0,0,0,fw,null,32);for(var s=0;s<12;s++){var a2=s/12*Math.PI*2;var sp2=bx(.15,22,.15,toon(0xffffff),0,0,0,fw);sp2.rotation.z=a2;var gd=new T.Group();gd.position.set(Math.cos(a2)*11,Math.sin(a2)*11,0);fw.add(gd);rb(1.4,1.2,1.4,.2,toon([0xe2553f,0xffc63d,0x46a9e6,0x6cc76a][s%4]),0,-.9,0,gd);}
    var fl=new T.Group();fl.position.set(oc.x+12,0,z0+12);dyn.add(fl);[-1,1].forEach(function(e){var leg=bx(.4,15,.4,toon(0xd8dee6),e*3,6.5,-.6,fl);leg.rotation.z=-e*.2;});anim.push({wheel:fw});
    places.push({id:'pier',name:'The Pier',kind:'park',x:oc.x,z:z0+4});}
  var hb=p.blocks.filter(function(q){return q.D&&q.D.win==='harbor';})[0];
  if(hb){var dk=new T.Group();dk.position.set(hb.x,0,z0+2);dyn.add(dk);bx(40,.6,14,toon(0x8a7a6a),0,.2,30,dk);for(var c2=0;c2<2;c2++){var cr=new T.Group();cr.position.set(-10+c2*20,0,26);dk.add(cr);[-2,2].forEach(function(q){bx(.6,18,.6,toon(0xe2553f),q,9,-2,cr);bx(.6,18,.6,toon(0xe2553f),q,9,2,cr);});bx(5,1,22,toon(0xe2553f),0,18,6,cr);}
    var ship=new T.Group();ship.position.set(hb.x,-.3,z0+46);dyn.add(ship);rb(50,6,11,.6,toon(0x2a3a5a),0,3,0,ship);rb(8,8,10,.2,toon(0xffffff),-19,9,0,ship);for(var q2=0;q2<16;q2++)rb(5.5,2.4,2.4,.04,toon([0xe2553f,0x2f8fd0,0x2fa860,0xffc63d][q2%4]),-12+Math.floor(q2/4)*6,7.2+(q2%2)*2.4,-2.4+((q2>>1)%2)*4.8,ship);anim.push({ship:ship,x0:hb.x});}
  p.sea=1;
}
function buildWest(){var p=plan,keep=stat;stat=new T.Group();var g=stat,r=seeded(p.city*37+11),x0=p.xs[0]-RH;
  for(var i=0;i<40;i++){var x=x0-14-r()*90,z=p.zs[0]-20+r()*(p.zs[p.R]-p.zs[0]+40);if(r()<.5){tree(g,x,z,r()<.5?0x5fb35a:0x4f9a4a,'leaf',r);}else{var c=pick([0xf2d7b6,0xe9b8a0,0xc9d8c0,0xd8cde6]),hh=new T.Group();hh.position.set(x,0,z);hh.rotation.y=r()*6;g.add(hh);rb(6,3.4,5,.1,toon(c),0,1.7,0,hh);var rf=prism(6.6,2.2,5.6,toon(0x9a5a4a),0,3.4,0,hh);rf.rotation.y=Math.PI/2;bx(1,2,.1,toon(0x6b4a30),0,1,2.55,hh);}}
  for(i=0;i<6;i++){var hl=sp(60+r()*40,toon(0x8cc47a),x0-180-r()*60,-30,p.zs[0]+i*40,g,14);hl.scale.y=.5;}
  O.scene.add(mergeGroup(stat));stat=keep;}
function updGeo(dt,tl){anim.forEach(function(a){
  if(a.lift){var L=a.lift.length;a.lift.forEach(function(ch,i){var t=((tl*.02+i/L)%1),up=t<.5,k=up?t*2:2-t*2,off=up?1.7:-1.7;ch.position.set(a.a.x+off+(a.b.x-a.a.x)*k,8.5+(a.b.y-a.a.y)*k,a.a.z+(a.b.z-a.a.z)*k);});}
  else if(a.wheel){a.wheel.rotation.z+=dt*.12;a.wheel.children.forEach(function(c){if(c.isGroup)c.rotation.z=-a.wheel.rotation.z;});}
  else if(a.boat){a.boat.position.x+=a.v*dt;if(a.boat.position.x>a.cx+260)a.boat.position.x=a.cx-260;if(a.boat.position.x<a.cx-260)a.boat.position.x=a.cx+260;a.boat.rotation.y=a.v>0?Math.PI/2:-Math.PI/2;a.boat.rotation.z=Math.sin(tl*1.3+a.v)*.06;}
  else if(a.ship){a.ship.position.x=a.x0+Math.sin(tl*.01)*30;}
  else if(a.beacon){a.beacon.rotation.y=tl*.8;a.beacon.material.opacity=clockH<6.5||clockH>18.5?.25:.06;}
  else if(a.radar){a.radar.rotation.y+=dt*1.5;}
  else if(a.sock){a.sock.rotation.y=Math.sin(tl*.3)*.6+1;a.sock.rotation.z=-.2+Math.sin(tl*2)*.08;}
  else if(a.tug){a.t+=dt*.06;var k2=(Math.sin(a.t)+1)/2;a.tug.position.z=a.z0+(a.z1-a.z0)*k2;a.tug.rotation.y=Math.cos(a.t)>0?0:Math.PI;}
  else if(a.roll){a.t+=dt*a.v;var k3=(a.t%1);a.roll.position.x=a.x0+(a.x1-a.x0)*k3;}});}
