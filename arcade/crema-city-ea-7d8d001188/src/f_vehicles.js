
/* ---------- vehicles ---------- */
var CARC=[0xe2553f,0x2f8fd0,0xf4f4f4,0x2a2a30,0xffc63d,0x6cc76a,0x9a7ae0,0xff8a3d,0xc8ccd2,0x7fcdf7,0x8a2a3a,0x2f5a46];
var VEHC={};
function wheels(g,xs,zs,r){var dk=toon(0x222228),hub=toon(0xd8dde4);xs.forEach(function(x){zs.forEach(function(z){var w=cy(r,r,.3,dk,x,r,z,g,12);w.rotation.z=Math.PI/2;var h=cy(r*.45,r*.45,.32,hub,x,r,z,g,8);h.rotation.z=Math.PI/2;});});}
function carModel(kind,col){
  var key=kind+'|'+(col==null?'':col);
  var g=new T.Group(),c=col!=null?col:pick(CARC);
  if(kind==='taxi')c=0xffc63d;if(kind==='police')c=0xf4f4f4;if(kind==='fire')c=0xd23a2a;if(kind==='crew')c=0xf2b632;if(kind==='delivery')c=0xffffff;if(kind==='bus')c=0x2f8fd0;
  var body=toon(c),gl=glass(0x5f8fb0,.85),dk=toon(0x25262b);
  if(kind==='bus'){rb(2.5,2.6,11,.3,body,0,1.75,0,g);bx(2.56,1.1,10,gl,0,2.3,.2,g);bx(2.56,.25,10.6,toon(0xffffff),0,1.1,0,g);wheels(g,[-1.1,1.1],[-3.6,3.6],.5);bx(2.3,.6,.1,MAT.head,0,1,5.52,g);bx(2.3,.4,.1,MAT.tail,0,1.2,-5.52,g);
    plane(1.8,.5,flat(0xffffff,{map:signT('12 · CROSSTOWN',{bg:'#111',fg:'#ffc63d',w:512,h:128})}),0,2.95,5.52,g);blob(3,11.6,g);return mergeGroup(g);}
  if(kind==='fire'){rb(2.4,1.6,7,.2,body,0,1.35,0,g);rb(2.3,1.3,2,.2,body,0,2.4,2.4,g);bx(2.35,.8,1.6,gl,0,2.55,2.5,g);for(var i=0;i<4;i++)bx(.08,.08,4.6,toon(0xd8dde4),i*.3-.45,2.4,-1,g);bx(.9,.1,4.6,toon(0xd8dde4),0,2.3,-1,g);
    wheels(g,[-1.05,1.05],[-2.4,2.4],.5);bx(.8,.18,.3,toon(0x2f8fd0),0,3.1,2.4,g);bx(2,.3,.1,MAT.head,0,1,3.52,g);blob(3,7.6,g);return mergeGroup(g);}
  var L=4.3,Wd=1.86,H=.62,cl=2.2,ch=.6,cz=-.25;
  if(kind==='van'||kind==='delivery'){L=4.9;cl=3.6;ch=1.15;cz=-.5;}if(kind==='hatch'){L=3.8;cl=2.1;cz=-.4;}if(kind==='crew'){L=4.8;}
  rb(Wd,H,L,.2,body,0,.62,0,g);
  if(kind==='crew'||kind==='pickupC'){rb(Wd-.1,ch+.1,1.7,.2,body,0,1.25,.9,g);bx(Wd-.05,.45,1.5,gl,0,1.32,.95,g);[-1,1].forEach(function(s){bx(.1,.45,2,body,s*(Wd/2-.06),1.1,-1.15,g);});bx(Wd,.45,.1,body,0,1.1,-2.15,g);
    rb(.7,.4,.5,.05,toon(0x8a8f99),0,1.2,-1.4,g);bx(1.5,.1,.1,toon(0xe2553f),0,1.72,1,g);}
  else{rb(Wd-.18,ch,cl,.22,body,0,.62+H/2+ch/2-.04,cz,g);bx(Wd-.12,ch*.62,cl-.25,gl,0,.62+H/2+ch*.55-.04,cz,g);}
  wheels(g,[-.9,.9],[-L*.32,L*.32],.36);
  bx(.36,.14,.06,MAT.head,-.6,.72,L/2+.01,g);bx(.36,.14,.06,MAT.head,.6,.72,L/2+.01,g);bx(.3,.12,.06,MAT.tail,-.65,.78,-L/2-.01,g);bx(.3,.12,.06,MAT.tail,.65,.78,-L/2-.01,g);
  bx(Wd+.04,.16,.18,dk,0,.42,L/2-.05,g);bx(Wd+.04,.16,.18,dk,0,.42,-L/2+.05,g);
  if(kind==='taxi'){rb(.7,.25,.35,.05,toon(0xffffff),0,1.62,cz,g);for(var k=0;k<6;k++)bx(.12,.12,.04,toon(0x111111),-.9+.03,.75,-1.4+k*.5,g);}
  if(kind==='police'){bx(Wd+.02,.18,L-.8,toon(0x2f5a8a),0,.75,0,g);bx(.4,.14,.3,toon(0xe2553f),-.3,1.6,cz,g);bx(.4,.14,.3,toon(0x2f8fd0),.3,1.6,cz,g);}
  if(kind==='delivery'){plane(2.6,.8,flat(0xffffff,{map:signT('Crema Supply Co.',{bg:'#ffffff',fg:'#2f5f90',w:512,h:128})}),-Wd/2-.01,1.55,-.5,g).rotation.y=-Math.PI/2;var p2=plane(2.6,.8,flat(0xffffff,{map:signT('Crema Supply Co.',{bg:'#ffffff',fg:'#2f5f90',w:512,h:128})}),Wd/2+.01,1.55,-.5,g);p2.rotation.y=Math.PI/2;}
  if(kind==='crew'){var lb=plane(1.4,.4,flat(0xffffff,{map:signT('BOB\'S BUILDERS',{bg:'#2a1a12',fg:'#f2b632',w:512,h:128})}),Wd/2+.01,.75,.6,g);lb.rotation.y=Math.PI/2;}
  blob(Wd+.5,L+.6,g);
  return mergeGroup(g);
}
/* your pickup keeps a live bed so you can see the crates you bought */
function pickupModel(col,plate){
  var g=new T.Group(),body=toon(col),dark=toon(0x2a2a30),gl=glass(0x5f8fb0,.85);
  rb(1.9,.55,4.2,.12,body,0,.72,0,g);rb(1.8,.85,1.7,.22,body,0,1.38,.95,g);bx(1.84,.5,1.45,gl,0,1.5,1.0,g);
  [-1,1].forEach(function(s){rb(.14,.42,2.1,.05,body,s*.88,1.2,-1.0,g);});rb(1.9,.42,.14,.05,body,0,1.2,-2.05,g);
  wheels(g,[-.88],[1.35,-1.3],.34);wheels(g,[.88],[1.35,-1.3],.34);
  bx(.36,.14,.06,MAT.head,-.6,.82,2.11,g);bx(.36,.14,.06,MAT.head,.6,.82,2.11,g);bx(.3,.12,.06,MAT.tail,-.7,1.05,-2.13,g);bx(.3,.12,.06,MAT.tail,.7,1.05,-2.13,g);
  plane(.7,.2,flat(0xffffff,{map:signT(plate||'CREMA 1',{bg:'#ffffff',fg:'#2a3a6a',w:256,h:72,r:6})}),0,.62,-2.13,g).rotation.y=Math.PI;
  blob(2.4,4.8,g);
  var m=mergeGroup(g),bed=new T.Group();bed.position.set(0,1.0,-1.0);m.add(bed);m.userData.bed=bed;return m;
}
function truckModel(ind,name){
  var I=IND[ind],th=I.theme,g=new T.Group(),body=toon(th.accent),wall=toon(th.wall),gl=glass(0x5f8fb0,.85);
  rb(2.1,.6,6.2,.15,toon(0x3a3f4b),0,.7,0,g);rb(2,1.4,1.7,.25,body,0,1.6,2.15,g);bx(2.02,.6,1.3,gl,0,1.9,2.3,g);
  rb(2.2,2.5,4.2,.2,wall,0,2.2,-.9,g);bx(2.24,.3,4.24,toon(0xffffff,{map:stripeT(th.accent,0xffffff)}),0,3.35,-.9,g);
  bx(.06,1.1,2.6,toon(0x2a1a12),-1.12,2.2,-.9,g);bx(.08,.12,2.8,toon(0xd8dde4),-1.15,1.6,-.9,g);
  wheels(g,[-1,1],[2.1,-2.1],.42);bx(.4,.14,.06,MAT.head,-.6,.9,3.06,g);bx(.4,.14,.06,MAT.head,.6,.9,3.06,g);
  var sg=plane(3.6,.7,flat(0xffffff,{map:signT(name||'Crema '+I.name,{bg:'#2a1a12',fg:'#ffc63d',w:768,h:150})}),1.13,2.6,-.9,g);sg.rotation.y=Math.PI/2;
  var s2=plane(3.6,.7,sg.material,-1.13,3.0,-.9,g);s2.rotation.y=-Math.PI/2;
  // the giant thing on the roof
  var top=new T.Group();top.position.set(0,3.55,-.9);g.add(top);
  if(ind==='coffee'){cy(.55,.42,1.1,toon(0xffffff),0,.55,0,top,14);cy(.57,.55,.35,toon(0xa0663f),0,.5,0,top,14);cy(.6,.6,.12,toon(0x3a2317),0,1.12,0,top,14);}
  else if(ind==='bakery'){var dn=tor(.55,.25,toon(0xe2a24a),0,.5,0,top,null,18);dn.rotation.x=Math.PI/2;var gz=tor(.55,.2,toon(0xff8fc4),0,.62,0,top,null,18);gz.rotation.x=Math.PI/2;gz.scale.set(1,1,.6);}
  else if(ind==='juice'){cy(.45,.35,1.2,toon(0xff8a3d),0,.6,0,top,12);var st=cy(.05,.05,.9,toon(0xffffff),.15,1.4,0,top,6);st.rotation.z=-.3;}
  else{cone(.45,1.1,toon(0xe3aa5e),0,.4,0,top,12).rotation.x=Math.PI;sp(.5,toon(0xffc8d8),0,1.1,0,top,12);sp(.12,toon(0xe2553f),0,1.6,0,top,8);}
  blob(2.6,6.6,g);
  var m=mergeGroup(g),aw=new T.Group();aw.position.set(-1.12,2.95,-.9);m.add(aw);var awm=bx(.06,1.4,3,toon(0xffffff,{map:stripeT(th.accent,0xffffff)}),0,-.7,0,aw);awm.position.set(-.0,-.7,0);aw.rotation.z=0;m.userData.awning=aw;
  return m;
}
function planeModel(col){
  var g=new T.Group(),w=toon(0xf4f6f8),c=toon(col),gl=toon(0x2a3a5a);
  var fu=cy(1.9,1.9,26,w,0,3.2,0,g,16);fu.rotation.x=Math.PI/2;var nose=sp(1.9,w,0,3.2,13,g,14);nose.scale.z=1.6;var tl=cone(1.9,6,w,0,3.4,-16,g,14);tl.rotation.x=-Math.PI/2;
  bx(28,.35,4.2,w,0,2.6,1,g);bx(10,.25,2.4,w,0,4,-17,g);var fin=bx(.35,5,3.6,c,0,6.4,-16.5,g);fin.rotation.x=.3;
  [-6,6].forEach(function(x){var e=cy(.8,.8,3.2,toon(0xd8dde4),x,1.7,2.4,g,12);e.rotation.x=Math.PI/2;});
  for(var i=-9;i<11;i++){bx(.05,.3,.4,gl,-1.86,3.8,i*1.1,g);bx(.05,.3,.4,gl,1.86,3.8,i*1.1,g);}
  bx(3.82,.3,26,c,0,2.7,0,g);bx(2.4,.6,1.4,gl,0,4.2,12.4,g);
  [[0,0,10],[-2.4,0,0],[2.4,0,0]].forEach(function(q){cyB(.12,1.6,toon(0x555555),q[0],0,q[2],g,6);cy(.5,.5,.4,toon(0x222228),q[0],.5,q[2],g,10).rotation.z=Math.PI/2;});
  return mergeGroup(g);
}

/* ---------- traffic: cars stop at red lights, queue, turn, and honk at people in the road ---------- */
function edgeGeo(a,b){var dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),fx=dx/l,fz=dz/l,rx=-fz,rz=fx,inset=RH+1.4;
  return {fx:fx,fz:fz,sx:a.x+fx*inset+rx*LANE,sz:a.z+fz*inset+rz*LANE,len:l-2*inset,ax:fx!==0&&Math.abs(fx)>.5?'x':'z'};}
function gridNode(id){return /^\d/.test(id);}
function initTraffic(){cars.forEach(function(c){dyn.remove(c.g);});cars=[];var n=lowEnd()?8:15;
  for(var i=0;i<n;i++)spawnCar(i===0?'bus':i<3?'taxi':i===3?'delivery':null,false);}
function spawnCar(kind,near){
  var E=GR.E.filter(function(e){return gridNode(e[0])&&gridNode(e[1]);}),e;
  if(near){var c2=E.filter(function(q){var a=GR.N[q[0]],b=GR.N[q[1]],mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,d=Math.hypot(mx-P.x,mz-P.z);return d>45&&d<110;});if(c2.length)E=c2;}
  e=pick(E);var fl=Math.random()<.5,a=GR.N[fl?e[1]:e[0]],b=GR.N[fl?e[0]:e[1]];
  var k=kind||pick(['sedan','sedan','hatch','van','sedan','hatch']);
  var car={g:carModel(k),kind:k,a:a,b:b,G:edgeGeo(a,b),s:0,v:6,vmax:k==='bus'?7:rnd(8.5,11),st:'edge',honk:0,blk:0,stop:0};
  car.s=rnd(0,Math.max(1,car.G.len*.8));dyn.add(car.g);cars.push(car);placeCar(car);return car;
}
function placeCar(c){var x,z,h;if(c.st==='edge'){x=c.G.sx+c.G.fx*c.s;z=c.G.sz+c.G.fz*c.s;h=Math.atan2(c.G.fx,c.G.fz);}
  else{var t=c.tu,u=1-t,T0=c.tn;x=u*u*T0[0].x+2*u*t*T0[1].x+t*t*T0[2].x;z=u*u*T0[0].z+2*u*t*T0[1].z+t*t*T0[2].z;var dx=2*u*(T0[1].x-T0[0].x)+2*t*(T0[2].x-T0[1].x),dz=2*u*(T0[1].z-T0[0].z)+2*t*(T0[2].z-T0[1].z);h=Math.atan2(dx,dz);}
  c.x=x;c.z=z;c.h=h;c.g.position.set(x,0,z);c.g.rotation.y=h;}
function nextNode(c){var nb=c.b.nb.filter(function(id){return gridNode(id)&&id!==c.a.id;});if(!nb.length)nb=[c.a.id];
  // prefer going straight
  var st=nb.filter(function(id){var n=GR.N[id];return Math.abs((n.x-c.b.x)*c.G.fz-(n.z-c.b.z)*c.G.fx)<1;});
  return GR.N[st.length&&Math.random()<.55?st[0]:pick(nb)];}
function aheadBlock(c,x,z,rad){var dx=x-c.x,dz=z-c.z,fx=Math.sin(c.h),fz=Math.cos(c.h),d=dx*fx+dz*fz,lat=dx*fz-dz*fx;return d>0&&d<(rad||11)&&Math.abs(lat)<1.5?d:-1;}
function updTraffic(dt,tl){
  var ph=phase(tl),pv=drv?drv.v.g.position:null;
  cars.forEach(function(c){
    if(c.chase)return;var lim=c.vmax,hit=false;
    if(c.stop>0){c.stop-=dt;lim=0;}
    if(c.st==='edge'){
      var rem=c.G.len-c.s,lt=ph[c.G.ax];
      if(lt!=='g'&&rem>1.2&&rem<14&&!(lt==='y'&&rem<5))lim=Math.min(lim,Math.max(0,rem-.6)*1.3);
      cars.forEach(function(o){if(o===c)return;if(o.st==='edge'&&o.a===c.a&&o.b===c.b&&o.s>c.s){lim=Math.min(lim,Math.max(0,o.s-c.s-6)*1.2);}
        else{var d=aheadBlock(c,o.x,o.z,9);if(d>0&&Math.abs(angD(c.h,o.h))<1.2)lim=Math.min(lim,Math.max(0,d-5.5)*1.2);}});
      if(c.kind==='bus'&&c.s<c.G.len*.5&&c.s+c.v*dt>=c.G.len*.5&&Math.random()<.5)c.stop=3.5;
    }else{cars.forEach(function(o){if(o===c)return;var d=aheadBlock(c,o.x,o.z,7);if(d>0)lim=Math.min(lim,Math.max(0,d-4.5)*1.4);});lim=Math.min(lim,c.vmax*.65);}
    // people and your vehicles in the road
    if(O.on&&P.area==='city'){var px=pv?pv.x:P.x,pz=pv?pv.z:P.z,d2=aheadBlock(c,px,pz,12);if(d2>0&&(pv||!onBlockSlab(px,pz))){lim=Math.min(lim,Math.max(0,d2-(pv?5.5:3))*1.1);hit=true;}}
    veh.forEach(function(v){if(drv&&drv.v===v)return;var d3=aheadBlock(c,v.g.position.x,v.g.position.z,10);if(d3>0){lim=Math.min(lim,Math.max(0,d3-5.5));hit=true;}});
    peds.forEach(function(p){if(p.mode!=='cross')return;var d4=aheadBlock(c,p.x,p.z,8);if(d4>0)lim=Math.min(lim,Math.max(0,d4-3));});
    if(hit&&lim<.5){c.blk+=dt;if(c.blk>1.4&&c.honk<=0){c.honk=4;honk(c);}}else c.blk=0;c.honk-=dt;
    if(c.v<lim)c.v=Math.min(lim,c.v+6*dt);else c.v=Math.max(lim,c.v-16*dt);
    if(c.st==='edge'){c.s+=c.v*dt;if(c.s>=c.G.len){var nx=nextNode(c),ng=edgeGeo(c.b,nx),p0={x:c.G.sx+c.G.fx*c.G.len,z:c.G.sz+c.G.fz*c.G.len},p2={x:ng.sx,z:ng.sz};
      var dot=c.G.fx*ng.fx+c.G.fz*ng.fz,p1=dot>.9?{x:(p0.x+p2.x)/2,z:(p0.z+p2.z)/2}:dot<-.9?{x:c.b.x+c.G.fx*3,z:c.b.z+c.G.fz*3}:{x:Math.abs(c.G.fx)>.5?p2.x:p0.x,z:Math.abs(c.G.fz)>.5?p2.z:p0.z};
      c.tn=[p0,p1,p2];c.tl=Math.hypot(p1.x-p0.x,p1.z-p0.z)+Math.hypot(p2.x-p1.x,p2.z-p1.z);c.tu=0;c.st='turn';c.nx=nx;c.ng=ng;}}
    else{c.tu+=c.v*dt/Math.max(1,c.tl);if(c.tu>=1){c.st='edge';c.a=c.b;c.b=c.nx;c.G=c.ng;c.s=0;}}
    placeCar(c);
    if(O.on&&P.area==='city'&&Math.hypot(c.x-P.x,c.z-P.z)>170&&Math.random()<dt){dyn.remove(c.g);cars.splice(cars.indexOf(c),1);spawnCar(c.kind==='bus'?'bus':null,true);}
  });
}
function honk(c){if(!O.on||P.area!=='city')return;var d=Math.hypot(c.x-P.x,c.z-P.z);if(d>30)return;var v=.05*(1-d/30)+.01;try{tone(392,.18,'square',v);tone(330,.22,'square',v,.05);}catch(e){}
  bubble(c.x,2.4,c.z,pick(['Beep beep!','Hey, move!','Out of the road!','HONK!']),'bad');}

/* ---------- your vehicles ---------- */
function myVeh(){for(var i=0;i<veh.length;i++)if(veh[i].kind==='pickup'||veh[i].kind==='rental')return veh[i];return null;}
function pickupCost(){return Math.round(4000*tierM());}
function initVehicles(){
  veh.forEach(function(v){dyn.remove(v.g);});veh=[];var w=W4(),c=O.city;starterTruck();
  var own=w.cars[c];
  if(c===0||own){var col=curLoc()&&IND[curLoc().ind]?IND[curLoc().ind].theme.accent:0xffb83d;
    if(!own){var b0=blockOf('dist');own=w.cars[c]={x:b0.x-BW/2+6,z:b0.z+BD/2+1.15,ry:Math.PI/2};}
    addVeh('pickup',pickupModel(own.rental?0xf4f4f4:col,own.rental?'RENTAL':'CREMA '+(c+1)),own);}
  w.trucks.filter(function(t){return t.city===c;}).forEach(function(t){var m=truckModel(t.ind,t.name);addVeh('truck',m,t).truck=t;});
  trunkView();
}
function addVeh(kind,g,sv){g.position.set(sv.x,0,sv.z);g.rotation.y=sv.ry||0;dyn.add(g);var v={kind:kind,g:g,sv:sv};veh.push(v);return v;}
function vehAct(){ // actions for vehicles are computed live (they move)
  var out=[];veh.forEach(function(v){var p=v.g.position,lab,sub;
    if(v.kind==='truck'){var t=v.truck,z=truckZone(v);
      out.push({x:p.x,z:p.z,r:3.4,label:function(){return P.carry.length?'Load '+P.carry.length+' crate'+(P.carry.length>1?'s':'')+' into the truck':'Drive '+(t.name||'your food truck');},sub:function(){return 'Stock '+Math.round(t.stock)+'/'+truckCap(t)+' · '+(truckZone(v)?'selling at '+truckZone(v).name:'park in a food truck zone to sell');},
        fn:function(){if(P.carry.length){loadTruck(v);return;}enterVeh(v);},alt:function(){return {label:'Truck options',fn:function(){truckMenu(v);}};}});return;}
    out.push({x:p.x,z:p.z,r:3.4,label:function(){return P.carry.length?'Load crates into the bed':'Drive your '+(v.sv.rental?'rental':'pickup');},sub:function(){return W4().trunk.length+'/'+W4().tcap+' crates in the bed';},
      fn:function(){if(P.carry.length){loadTrunk();return;}enterVeh(v);},alt:function(){return W4().trunk.length&&P.carry.length<2?{label:'Take a crate out',fn:function(){P.carry.push(W4().trunk.pop());carryView();trunkView();save();}}:null;}});});
  return out;
}
function trunkView(){var v=myVeh();if(!v||!v.g.userData.bed)return;var b=v.g.userData.bed;while(b.children.length)b.remove(b.children[0]);W4().trunk.forEach(function(k,i){crate(k,b,(i%2?.38:-.38),.25+Math.floor(i/4)*.52,(Math.floor(i/2)%2?.45:-.45));});}
function crate(k,p,x,y,z){var s=SUP[k],m=rb(.7,.5,.55,.06,toon(s.col),x||0,y||0,z||0,p);rb(.72,.08,.57,.03,toon(0x8a5a3a),0,.14,0,m);return m;}
function carryView(){var h=P.hand;if(!h)return;while(h.children.length)h.remove(h.children[0]);P.carry.forEach(function(k,i){crate(k,h,0,i*.52,0);});}
function enterVeh(v){if(P.carry.length){toast('Put the crates down first (load them into the bed).','bad');return;}drv={v:v,speed:0};P.me.root.visible=false;yaw=v.g.rotation.y+Math.PI;try{tone(180,.2,'sawtooth',.03,0,320);}catch(e){}
  if(v.kind==='truck'){var aw=v.g.userData.awning;if(aw)aw.rotation.z=0;}}
function exitVeh(){
  if(!drv)return true;var v=drv.v,g=v.g,h=g.rotation.y,c=Math.cos(h),s=Math.sin(h),cand=[[-1.9,0],[1.9,0],[0,-3.6],[0,3.6],[-1.9,1.5],[1.9,-1.5]];
  for(var i=0;i<cand.length;i++){var lx=cand[i][0],lz=cand[i][1],x=g.position.x+lx*c+lz*s,z=g.position.z-lx*s+lz*c;
    if(!blocked(x,z,.35)&&inBounds(x,z)){P.x=x;P.z=z;P.me.root.visible=true;drv=null;yaw=h+Math.PI;v.sv.x=g.position.x;v.sv.z=g.position.z;v.sv.ry=h;save();
      if(v.kind==='truck'){var z2=truckZone(v);if(z2){W4().f.zoned=1;note('Open for business',(v.truck.name||'Your truck')+' is selling at '+z2.name+'.','good');}else if(v.truck.stock>0)note('Not a vending zone','Park at a striped FOOD TRUCK zone to sell. Central Park has three.','info',{label:'Directions',fn:function(){navTo(nearestZone(g.position.x,g.position.z));}});}
      return true;}}
  popup('Can\'t get out here','There is no room to open the door. Pull over next to a sidewalk first.',[{t:'OK'}],'bad');return false;
}
function driveStep(dt){
  var v=drv.v,g=v.g,fw=clamp((keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joy.y,-1,1),st=clamp((keys.a||keys.arrowleft?1:0)-(keys.d||keys.arrowright?1:0)-joy.x,-1,1);
  if(drv.auto){if(Math.abs(st)>.3||fw<-.3){drv.auto=false;toast('Autopilot off','');}else{var ad=autoDrive(dt);if(ad){fw=ad.fw;st=ad.st;}}}
  var dm=(v.truck?v.truck.dmg:(W4().cars[O.city]||{}).dmg)||0,mx=(v.kind==='truck'?16:20)*(1-dm/250);
  drv.speed+=fw*dt*(fw*drv.speed<0?26:11);drv.speed*=Math.pow(fw?.97:.3,dt);if(keys[' '])drv.speed*=Math.pow(.02,dt);drv.speed=clamp(drv.speed,-6,mx);
  g.rotation.y+=st*dt*1.9*clamp(drv.speed/5,-1,1)*(Math.abs(drv.speed)>14?.8:1);steerAssist(g,st,dt);
  var h=g.rotation.y,nx=g.position.x+Math.sin(h)*drv.speed*dt,nz=g.position.z+Math.cos(h)*drv.speed*dt,fx=nx+Math.sin(h)*2.1*Math.sign(drv.speed||1),fz=nz+Math.cos(h)*2.1*Math.sign(drv.speed||1);
  var ok=onRoad(nx,nz,.6)&&onRoad(fx,fz,.3)&&!carHit(fx,fz,v);
  if(ok){g.position.x=nx;g.position.z=nz;}else{var hitCar=null;for(var ci=0;ci<cars.length;ci++){if(Math.hypot(cars[ci].x-fx,cars[ci].z-fz)<2.3){hitCar=cars[ci];break;}}
    if(Math.abs(drv.speed)>9){crash(v,hitCar,Math.abs(drv.speed));drv.speed*=-.2;}
    else{var sx2=g.position.x+Math.sin(h)*drv.speed*dt,sz2=g.position.z+Math.cos(h)*drv.speed*dt;if(!hitCar&&onRoad(sx2,g.position.z,.6)&&!carHit(sx2+Math.sin(h)*2.1,g.position.z,v)){g.position.x=sx2;drv.speed*=.9;}else if(!hitCar&&onRoad(g.position.x,sz2,.6)&&!carHit(g.position.x,sz2+Math.cos(h)*2.1,v)){g.position.z=sz2;drv.speed*=.9;}else{if(Math.abs(drv.speed)>5){try{tone(90,.15,'square',.05);}catch(e){}shakeO=.25;}drv.speed*=-.25;}}}
  P.x=g.position.x;P.z=g.position.z;
}
var shakeO=0;
function carHit(x,z,self){for(var i=0;i<cars.length;i++){var c=cars[i];if(Math.hypot(c.x-x,c.z-z)<2.1){c.blk=2;if(c.honk<=0){c.honk=3;honk(c);}return true;}}
  for(i=0;i<veh.length;i++){var v=veh[i];if(v===self)continue;if(Math.hypot(v.g.position.x-x,v.g.position.z-z)<2.4)return true;}
  for(i=0;i<cols.length;i++){var r=cols[i];if(r.car&&x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)return true;}return false;}
