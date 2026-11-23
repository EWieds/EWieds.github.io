
/* ---------- GPS: a glowing path on the ground, an arrow over your head, and turn-by-turn with street names ---------- */
var routeM=null,beam=null,navArrow=null,ribT=null,lastSay='';
var ENTRANCE={supply:'supply',hall:'hall',bank:'bank',terminal:'airport',super:'super',grocery:'biz:grocery'};
function placeById(id){if(id==='biz:grocery'){var gb=BUS.filter(function(q){return q.grocery;})[0];return gb?placeById('biz:'+gb.key):null;}for(var i=0;i<places.length;i++)if(places[i].id===id)return places[i];return null;}
function areaOfX(x){var k=null;Object.keys(AREAS).forEach(function(id){var A=AREAS[id];if(Math.abs(x-A.ox)<A.w/2+2)k=id;});return k;}
function navTo(p,quiet){if(!p){toast('Can\'t find that place.','bad');return;}
  var ar=areaOfX(p.x),name=p.name;if(ar){var e=placeById(ENTRANCE[ar]);if(e)p={x:e.x,z:e.z};name=name+' (inside '+AREAS[ar].name+')';}
  NAV={to:{x:p.x,z:p.z},name:name,t:0,rr:0};recalcNav();lastSay='';if(!quiet)try{sfx.sel();}catch(e){}
  if(!drv&&!(RIDE&&!RIDE.wait)&&NAV.len>140){var v=nearVeh(),dv=v?Math.hypot(v.g.position.x-P.x,v.g.position.z-P.z):1e9;
    if(v&&dv<NAV.len*.45){NAV.fin={to:NAV.to,name:name,len:NAV.len};NAV.car=v;NAV.to={x:v.g.position.x,z:v.g.position.z};recalcNav();}else if(!v&&NAV.len>260)NAV.cab=true;}
  if(P.area!=='city')note('Directions set',name+'. Head outside and follow the blue path.','info');}
O.navTo=navTo;
function nearVeh(){var best=null,bd=1e9;veh.forEach(function(v){if(v.kind!=='pickup'&&v.kind!=='rental'&&v.kind!=='truck')return;var d=Math.hypot(v.g.position.x-P.x,v.g.position.z-P.z);if(d<bd){bd=d;best=v;}});return best;}
function vehName(v){return v.kind==='truck'?(v.truck&&v.truck.name)||'food truck':v.sv&&v.sv.rental?'rental car':'pickup';}
function navFrom(){return P.area==='city'?{x:P.x,z:P.z}:(placeById(ENTRANCE[P.area])||{x:P.x,z:P.z});}
function recalcNav(){if(!NAV)return;var f=navFrom(),road=route(f,NAV.to);NAV.road=road;NAV.pts=drv?road:walkify(road);NAV.len=routeLen(NAV.pts);NAV.rib=0;}
function ribbonTex(){if(ribT)return ribT;var c=document.createElement('canvas');c.width=64;c.height=128;var g=c.getContext('2d');g.fillStyle='rgba(49,224,255,.35)';g.fillRect(4,0,56,128);
  g.fillStyle='#ffffff';g.beginPath();g.moveTo(32,22);g.lineTo(56,62);g.lineTo(44,62);g.lineTo(32,42);g.lineTo(20,62);g.lineTo(8,62);g.closePath();g.fill();
  ribT=new T.CanvasTexture(c);ribT.wrapS=ribT.wrapT=T.RepeatWrapping;ribT.encoding=T.sRGBEncoding;return ribT;}
function projPath(pts,x,z){var best={d:1e9,i:0,t:0,x:x,z:z};for(var i=0;i<pts.length-1;i++){var q=projSeg(x,z,pts[i],pts[i+1]);if(q.d<best.d)best={d:q.d,i:i,t:q.t,x:q.x,z:q.z};}return best;}
function buildRibbon(pts,from){
  var seq=[{x:from.x,z:from.z}].concat(pts.slice(from.i+1)),pos=[],uv=[],v=0,w=.75;if(seq.length>1){var d0=Math.hypot(seq[1].x-seq[0].x,seq[1].z-seq[0].z);if(d0>1.6){var k0=1.6/d0;seq[0]={x:seq[0].x+(seq[1].x-seq[0].x)*k0,z:seq[0].z+(seq[1].z-seq[0].z)*k0};}}
  for(var i=0;i<seq.length-1;i++){var a=seq[i],b=seq[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);if(l<.05)continue;var nx=-dz/l*w,nz=dx/l*w,ya=onBlockSlab(a.x,a.z)?.24:.06,yb=onBlockSlab(b.x,b.z)?.24:.06,v2=v+l/2.2;
    pos.push(a.x+nx,ya,a.z+nz, a.x-nx,ya,a.z-nz, b.x+nx,yb,b.z+nz, a.x-nx,ya,a.z-nz, b.x-nx,yb,b.z-nz, b.x+nx,yb,b.z+nz);uv.push(1,v, 0,v, 1,v2, 0,v, 0,v2, 1,v2);v=v2;}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  if(!routeM){routeM=new T.Mesh(g,new T.MeshBasicMaterial({map:ribbonTex(),transparent:true,depthWrite:false,side:T.DoubleSide}));routeM.frustumCulled=false;routeM.renderOrder=2;}else{routeM.geometry.dispose();routeM.geometry=g;}
}
function turnInfo(){var road=NAV.road,pp=projPath(road,P.x,P.z),acc=Math.hypot(road[pp.i+1].x-pp.x,road[pp.i+1].z-pp.z);
  for(var k=pp.i+1;k<road.length-1;k++){var a=road[k-1],b=road[k],c=road[k+1],d1x=b.x-a.x,d1z=b.z-a.z,d2x=c.x-b.x,d2z=c.z-b.z,l1=Math.hypot(d1x,d1z)||1,l2=Math.hypot(d2x,d2z)||1;
    var cos=(d1x*d2x+d1z*d2z)/(l1*l2);if(cos<.8&&l2>3&&k<road.length-2){var right=(d2x*(-d1z)+d2z*d1x)>0;return {dist:acc,dir:cos<-.7?'u':right?'r':'l',street:segStreet(b,c)};}acc+=l2;}
  var L=road[road.length-1],P2=road[road.length-2]||L,dx=L.x-P2.x,dz=L.z-P2.z,tx=NAV.to.x-P2.x,tz=NAV.to.z-P2.z,side=(tx*(-dz)+tz*dx)>0?'right':'left';return {dist:acc,dir:'f',side:side};}
function updNav(dt){
  var el=$('#o-nav');document.body.classList.toggle('navon',!!NAV);
  if(!NAV){el.hidden=true;if(routeM)routeM.visible=false;if(beam)beam.visible=false;if(navArrow)navArrow.visible=false;return;}
  if(NAV.car&&drv){NAV.to=NAV.fin.to;NAV.name=NAV.fin.name;NAV.car=null;recalcNav();el.dataset.k='';speak('Drive to '+NAV.name.split(' (')[0]+'.');}
  NAV.t+=dt;NAV.rib-=dt;NAV.rr-=dt;var dTo=Math.hypot(NAV.to.x-P.x,NAV.to.z-P.z);
  if(NAV.car&&!drv){NAV.to={x:NAV.car.g.position.x,z:NAV.car.g.position.z};}
  if(P.area==='city'&&!NAV.car&&dTo<(drv?9:3.5)){note('You have arrived',NAV.name,'good');speak('You have arrived.');NAV=null;try{sfx.ding();}catch(e){}return;}
  if(!beam){beam=new T.Mesh(new T.CylinderGeometry(1.1,1.1,60,16,1,true),MAT.beam);navArrow=new T.Group();var sh=new T.Shape();sh.moveTo(0,.75);sh.lineTo(.5,.1);sh.lineTo(.18,.1);sh.lineTo(.18,-.45);sh.lineTo(-.18,-.45);sh.lineTo(-.18,.1);sh.lineTo(-.5,.1);sh.lineTo(0,.75);var ag=new T.ShapeGeometry(sh);ag.rotateX(-Math.PI/2);ag.rotateY(Math.PI);var am=new T.Mesh(ag,new T.MeshBasicMaterial({color:0x31e0ff,transparent:true,opacity:.95,depthWrite:false}));am.position.z=1.25;am.renderOrder=3;navArrow.add(am);var rg=new T.Mesh(new T.RingGeometry(.95,1.08,32),new T.MeshBasicMaterial({color:0x31e0ff,transparent:true,opacity:.6,depthWrite:false}));rg.rotation.x=-Math.PI/2;rg.renderOrder=3;navArrow.add(rg);}
  [beam,navArrow].forEach(function(o){if(o.parent!==O.scene)O.scene.add(o);});if(routeM&&routeM.parent!==O.scene)O.scene.add(routeM);
  var inCity=P.area==='city';
  if(inCity){var pp=projPath(NAV.pts,P.x,P.z);if(pp.d>(drv?10:7)&&NAV.rr<=0){NAV.rr=1.5;recalcNav();pp=projPath(NAV.pts,P.x,P.z);el.dataset.k='';}
    if(NAV.rib<=0){NAV.rib=.2;buildRibbon(NAV.pts,pp);}
    routeM.visible=true;ribT.offset.y-=dt*(drv?2.2:1.1);
    var nxp=NAV.pts[Math.min(NAV.pts.length-1,pp.i+1)],look=pp.i+1<NAV.pts.length-1&&Math.hypot(nxp.x-P.x,nxp.z-P.z)<2.5?NAV.pts[pp.i+2]:nxp;
    var base=drv?drv.v.g.position:P.me.root.position;navArrow.visible=true;navArrow.scale.setScalar(drv?2.2:1);navArrow.position.set(base.x,(onBlockSlab(base.x,base.z)?.25:.08),base.z);navArrow.rotation.y+=angD(navArrow.rotation.y,Math.atan2(look.x-base.x,look.z-base.z))*Math.min(1,dt*8);}
  else{if(routeM)routeM.visible=false;navArrow.visible=false;}
  beam.visible=inCity;beam.position.set(NAV.to.x,30,NAV.to.z);
  var rem=inCity?routeLen([{x:P.x,z:P.z}].concat(NAV.pts.slice(projPath(NAV.pts,P.x,P.z).i+1))):NAV.len,ti=inCity?turnInfo():{dir:'out'},ic,big;
  if(!inCity){ic='⤴';big='Head outside';}
  else if(NAV.car){ic='🚗';big=dTo<4.5?'Get in your '+vehName(NAV.car):'Walk to your '+vehName(NAV.car)+' · '+Math.round(dTo)+' m';}
  else if(ti.dir==='f'){ic='⬆';big=ti.dist<25?NAV.name.split(' (')[0]+' is on your '+ti.side:'Continue to '+NAV.name.split(' (')[0];}
  else{ic=ti.dir==='l'?'↰':ti.dir==='r'?'↱':'⮌';big=(ti.dir==='u'?'Turn around':(ti.dist<12?'Turn ':'In '+Math.round(ti.dist/5)*5+' m, turn ')+(ti.dir==='l'?'left':'right')+(ti.street?' onto '+ti.street:''));}
  if(inCity&&ti.dir!=='f'&&ti.dist<(drv?60:25))speak(big.replace(/^In (\d+) m/,'In $1 meters'));
  var sub=NAV.car?'Then drive to '+NAV.fin.name.split(' (')[0]+' · about '+Math.max(1,Math.round(NAV.fin.len/700))+' min by car, '+Math.max(1,Math.round(NAV.fin.len/80))+' on foot':NAV.name+' · '+Math.round(rem)+' m'+(drv||!inCity?'':' · '+Math.max(1,Math.round(rem/80))+' min walk');
  var k=ic+big+Math.round(rem/5)+(W4().voice?1:0)+(drv?(drv.auto?'A':'d'):'');
  if(el.dataset.k!==k){el.dataset.k=k;el.hidden=false;el.innerHTML='<i>'+ic+'</i><div><b>'+esc(big)+'</b><small>'+esc(sub)+'</small></div>'+(drv&&!NAV.car?'<button type="button" class="nv-a">'+(drv.auto?'Autopilot on':'Autopilot')+'</button>':'')+(NAV.car?'<button type="button" class="nv-w">Walk</button>':NAV.cab&&inCity&&!drv&&!RIDE&&rem>200?'<button type="button" class="nv-w">🚕 Cab</button>':'')+'<button type="button" class="nv-v" aria-label="Voice directions">'+(W4().voice?'🔊':'🔇')+'</button><button type="button" class="nv-x" aria-label="Stop directions">✕</button>';
    el.querySelector('.nv-x').onclick=function(){NAV=null;};var na=el.querySelector('.nv-a');if(na)na.onclick=function(){if(drv){drv.auto=!drv.auto;el.dataset.k='';toast(drv.auto?'Autopilot on. Steer to take over.':'Autopilot off','good');}};var nw=el.querySelector('.nv-w');if(nw)nw.onclick=function(){if(NAV.car){NAV.to=NAV.fin.to;NAV.name=NAV.fin.name;NAV.car=null;recalcNav();el.dataset.k='';}else{var d=NAV.to,nm=NAV.name;NAV=null;callCab({x:d.x,z:d.z,name:nm});}};el.querySelector('.nv-v').onclick=function(){W4().voice=!W4().voice;el.dataset.k='';if(W4().voice)speak(big,true);};}
}
function speak(t,force){if(!W4().voice&&!force)return;if(t===lastSay)return;lastSay=t;try{var u=new SpeechSynthesisUtterance(t);u.rate=1.05;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}

/* ---------- bird's-eye view of the whole city ---------- */
var BIRD=null,birdLbl=[];
function birdOn(){if(BIRD)return;if(plan.mtn&&(clockH>21||clockH<4)){var wu=W4();if(!wu.f.ufo)setTimeout(function(){if(!BIRD)return;wu.f.ufo=1;addFame(10);banner('What was that?','Three lights over the mountains. No sound. Then nothing.','good');save();},2500);}closePhone();O.cam.far=3000;O.cam.updateProjectionMatrix();BIRD={x:P.area==='city'?P.x:(placeById(ENTRANCE[P.area])||P).x,z:P.area==='city'?P.z:(placeById(ENTRANCE[P.area])||P).z,h:150,area:P.area,tx:0,tz:0};
  if(P.area!=='city'){P.area='city';}document.body.classList.add('bird');$('#o-bird').hidden=false;
  var box=$('#o-blbl');box.innerHTML='';birdLbl=[];
  plan.blocks.forEach(function(b){addBL(blockName(b),b.x,b.z,'dist',null);});
  places.forEach(function(p){if(areaOfX(p.x))return;if(['shop','supply','civic','airport','motors','biz','site','land','myhome','homesale'].indexOf(p.kind)<0)return;if(p.kind==='biz'&&!(W4().biz[p.id.slice(4)]||{}).own)return;addBL(p.kind==='myhome'?(W4().home&&p.id==='home:'+W4().home?'🏠 Home':'🏠 '+p.name):p.kind==='homesale'?'🏠 For sale':p.name.replace(/^Crema /,''),p.x,p.z,p.kind,p);});
  zones.forEach(function(z){addBL('🚚',z.x,z.z,'zone',{x:z.x,z:z.z,name:'Food truck zone · '+z.name});});
  addBL(apName(),plan.AX,plan.AZ,'airport',placeById('airport'));if(plan.mtn)addBL('Mountains',(plan.xs[0]+plan.xs[plan.C])/2,plan.zs[0]-110,'dist',null);if(plan.sea)addBL('Ocean',(plan.xs[0]+plan.xs[plan.C])/2,plan.zs[plan.R]+80,'dist',null);
  O.scene.fog.far=2000;O.scene.fog.near=1500;}
function addBL(t,x,z,k,p){var el=document.createElement('button');el.type='button';el.className='bl '+k;el.textContent=t;if(p)el.onclick=function(){birdOff();navTo(p);};else el.disabled=true;$('#o-blbl').appendChild(el);birdLbl.push({el:el,v:V3(x,k==='dist'?2:6,z)});}
function birdOff(){if(!BIRD)return;P.area=BIRD.area;BIRD=null;resizeO();document.body.classList.remove('bird');$('#o-bird').hidden=true;$('#o-blbl').innerHTML='';birdLbl=[];O.snap=true;updDaylight();}
O.birdOn=birdOn;
function birdFrame(dt){var b=BIRD;b.x+=(joy.x+((keys.d||keys.arrowright)?1:0)-((keys.a||keys.arrowleft)?1:0))*dt*b.h*.8;b.z+=(joy.y+((keys.s||keys.arrowdown)?1:0)-((keys.w||keys.arrowup)?1:0))*dt*b.h*.8;
  b.x=clamp(b.x,plan.xs[0]-120,plan.AX+200);b.z=clamp(b.z,plan.zs[0]-200,plan.zs[plan.R]+200);
  O.cam.position.lerp(V3(b.x,b.h,b.z+b.h*.42),Math.min(1,dt*6));O.cam.lookAt(b.x,0,b.z-b.h*.04);
  birdLbl.forEach(function(l){var q=l.v.clone().project(O.cam);var vis=q.z<1&&Math.abs(q.x)<1.05&&Math.abs(q.y)<1.05;l.el.style.display=vis?'':'none';if(vis)l.el.style.transform='translate('+((q.x*.5+.5)*W)+'px,'+((-q.y*.5+.5)*H)+'px) translate(-50%,-50%)';});
  var me=P.me.root.position;if(!birdLbl.me){var el=document.createElement('div');el.className='bl me';el.textContent='You';$('#o-blbl').appendChild(el);birdLbl.me=el;}
  var q2=V3(drv?drv.v.g.position.x:me.x,4,drv?drv.v.g.position.z:me.z).project(O.cam);birdLbl.me.style.transform='translate('+((q2.x*.5+.5)*W)+'px,'+((-q2.y*.5+.5)*H)+'px) translate(-50%,-50%)';}

/* ---------- goals: a story to follow, so you always know what to do next ---------- */
var MIS=[
  {ch:'Street smarts',t:'Buy supplies at Crema Supply Co.',h:'Walk in, grab a crate or two off the shelves.',p:'supply',ok:function(w){return P.carry.length||w.trunk.length||w.f.stocked;}},
  {ch:'Street smarts',t:'Stock your storeroom',h:'Carry the crates into your shop door, or load them in the pickup and drive.',p:function(){return placeById('shop:'+curLoc().id);},ok:function(w){return w.f.stocked;}},
  {ch:'Street smarts',t:'Talk to someone on the street',h:'Walk up to anyone and type anything. Locals hear things.',ok:function(w){return w.f.talked;}},
  {ch:'Street smarts',t:'Work a shift with stocked supplies',h:'Ingredients cost half while the storeroom has stock.',p:function(){return placeById('shop:'+curLoc().id);},ok:function(w){return w.f.stockShift;}},
  {ch:'Street smarts',t:'Deliver a catering order',h:'Orders pop up on your phone while you\'re out. Brew at your shop, deliver fast for a big tip.',ok:function(w){return w.f.catered;}},
  {ch:'Putting down roots',t:'Buy a lot',h:'Look for a FOR SALE sign, or call Dana.',p:function(){var s=places.filter(function(q){return q.kind==='sale';}).sort(function(a,b){return Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z);});return s[0];},ok:function(w){return Object.keys(w.land).length||w.f.built;}},
  {ch:'Putting down roots',t:'Have Bob build on your land',h:'Walk to your lot or call Bob from your phone.',p:function(){var k=Object.keys(W4().land)[0];return k?placeById('land:'+k):null;},ok:function(w){return w.f.built;}},
  {ch:'Putting down roots',t:'Register at City Hall',h:'Visit the Taxes window so you can pay by phone.',p:'hall',ok:function(w){return w.tax.visited;}},
  {ch:'Putting down roots',t:'Buy a house',h:'Knock on any door in a residential block. FOR SALE signs mean they\'re ready; everyone else can be talked into it.',p:function(){var h=homesForSale()[0];return h?placeById('home:'+h.key):null;},ok:function(){return ownedHomes().length>0;}},
  {ch:'Putting down roots',t:'Move in, or rent it out',h:'Walk up to your house: live there, or find a tenant and collect rent.',p:function(){var k=ownedHomes()[0];return k?placeById('home:'+k):null;},ok:function(w){return !!w.home||ownedHomes().some(function(k){return w.biz[k].tenant||w.biz[k].rentOut;});}},
  {ch:'Hit the road',t:'Get a street vending permit',h:'Permits window, City Hall.',p:'hall',ok:function(w){return Object.keys(w.civ).some(function(c){return w.civ[c].permits.vend;});}},
  {ch:'Hit the road',t:'Buy a food truck',h:'Crema Motors on Motor Row.',p:'motors',ok:function(w){return w.trucks.length;}},
  {ch:'Hit the road',t:'Sell from a food truck zone',h:'Drive your truck to a striped zone and get out. Central Park has three.',p:function(){return nearestZone(P.x,P.z);},ok:function(w){return w.f.zoned;}},
  {ch:'Taking over',t:'Find out who supplies the Fresh Market',h:'The invoices are on the desk in Mg1\'s Fresh Market\'s back office.',p:'biz:grocery',ok:function(w){return w.found.valley;}},
  {ch:'Taking over',t:'Buy a business',h:'Walk into any shop and make the owner an offer. Type what you\'d say, haggle, bring the briefcase from the bank for better deals.',ok:function(w){return ownedBiz().length;}},
  {ch:'Taking over',t:'Buy the Fresh Market',h:'Owning the grocery store makes your ingredients 8% cheaper.',p:'biz:grocery',ok:function(w){return Object.keys(w.biz).some(function(k){return w.biz[k].own&&w.biz[k].grocery;});}},
  {ch:'Taking over',t:'Make a deal with Valley Farms',h:'Call Earl: a supply contract, or buy the company.',ok:function(w){return w.contract||(w.biz.valley||{}).own;}},
  {ch:'Big time',t:'Build the Crema Superstore',h:'Get a commercial permit at City Hall, then build on Market Square.',p:'supersite',ok:function(w){return Object.keys(w.supers).length;}},
  {ch:'Big time',t:'Open 3 superstore departments',h:'Walk up to the empty bays inside.',p:'super',ok:function(w){return Object.keys(w.supers).some(function(c){return Object.keys(w.supers[c].depts).length>=3;});}},
  {ch:'Big time',t:'Win a seat on the city council',h:'Elections office, City Hall. You need 250 fame.',p:'hall',ok:function(w){return Object.keys(w.civ).some(function(c){return w.civ[c].council;});}},
  {ch:'Big time',t:'Fly to another city',h:'Buy a ticket at the airport, go through security, board at gate B4.',p:'airport',ok:function(w){return w.stats.flights;}},
  {ch:'Tycoon',t:'Become mayor',h:'Elections office, City Hall. You need 900 fame.',p:'hall',ok:function(w){return Object.keys(w.civ).some(function(c){return w.civ[c].mayor;});}},
  {ch:'Tycoon',t:'Buy Valley Farms',h:'Earl won\'t sell cheap. Bring a briefcase and patience.',ok:function(w){return (w.biz.valley||{}).own;}},
  {ch:'Tycoon',t:'Buy the airport',h:'Airport Authority office, west wall of the terminal. Gloria Vance drives a hard bargain.',p:'airport',ok:function(){return Object.keys(W4().biz).some(function(k){return k.indexOf('airport:')===0&&W4().biz[k].own;});}},
  {ch:'Living large',t:'Eat at a restaurant',h:'Restaurant Row. Ask about the secret menu.',ok:function(w){return (w.stats.meals||0)>0;}},
  {ch:'Living large',t:'Work your truck\'s window',h:'Park your truck in a striped zone, open Truck options, serve customers yourself.',ok:function(w){return w.f.window;}},
  {ch:'Living large',t:'Pass a university class',h:'Admissions office at the university.',p:'uni',ok:function(w){return w.cls&&Object.keys(w.cls).length>0;}},
  {ch:'Living large',t:'Buy a stock',h:'Phone → Stocks.',ok:function(w){return w.mkt&&Object.keys(w.mkt.own).some(function(k){return w.mkt.own[k]>0;});}},
  {ch:'Living large',t:'Build something on your own land',h:'Buy a lot, then ask Bob for anything. A water park? A race track?',ok:function(w){return Object.keys(w.land).some(function(k){return w.land[k].use==='dev';});}}];
function misCur(){var w=W4();w.f=w.f||{};w.mis=w.mis||0;if(w.mis>=MIS.length){var n=ownedBiz().length;if(w.endless==null)w.endless=Math.floor(n/3)*3;var goal=w.endless+3;return {ch:'Endless',t:'Own '+goal+' businesses',h:'You own '+n+'. Every one makes money forever.',ok:function(){return ownedBiz().length>=goal;},endless:goal};}return MIS[w.mis];}
var misT=0;
function updMission(dt){var w=W4();w.f=w.f||{};misT-=dt;if(misT>0)return;misT=.5;var m=misCur();
  if(m.ok(w)){var i=w.mis,cash=Math.round((400+i*450)*tierM());G.cash+=cash;addXP(60+i*30);if(!m.endless)w.mis++;else w.endless=m.endless;banner('Goal complete!',m.t+' · +'+fmt(cash),'good');try{sfx.ding();}catch(e){}save();misT=1.5;el2=null;}
  var el=$('#o-goal'),cur=misCur(),k=cur.t;if(el.dataset.k===k)return;el.dataset.k=k;
  var pl=typeof cur.p==='function'?cur.p():cur.p?placeById(cur.p):null;
  el.innerHTML='<small>'+esc(cur.ch.toUpperCase())+(cur.endless?'':' · '+(W4().mis+1)+'/'+MIS.length)+'</small><b>'+esc(cur.t)+'</b><span>'+esc(cur.h)+'</span>'+(pl||cur.p?'<button type="button">Show me</button>':'');
  var bt=el.querySelector('button');if(bt)bt.onclick=function(){var p2=typeof cur.p==='function'?cur.p():placeById(cur.p);if(p2)navTo(p2);else toast('Not on the map yet.');};}
var el2=null;
