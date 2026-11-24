
/* ---------- moving around ---------- */
function inBounds(x,z){if(P.area!=='city'){var b=AREAS[P.area].b;return x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1;}return x>plan.minX&&x<plan.maxX&&z>plan.minZ&&z<plan.maxZ;}
function blocked(x,z,r){for(var i=0;i<cols.length;i++){var c=cols[i];if(c.area!==P.area)continue;if(x+r>c.x0&&x-r<c.x1&&z+r>c.z0&&z-r<c.z1)return true;}return false;}
function moveWalk(dt){
  var fx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joy.x,fz=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+joy.y,l=Math.hypot(fx,fz);
  var moving=l>.12&&!popOpen()&&!CUT&&!WIN&&!ARC&&!EAT&&!MOV&&!ESC&&!BOWL&&!CLAW3&&!TRAIN&&!COMM.g&&!SLIDE&&!DVS.riding&&!(RIDE&&!RIDE.wait);P.moving=moving;
  if(moving){if(l>1){fx/=l;fz/=l;}var sp=(keys.shift||l>.95?5.4:3.2)*(phoneOpen()?.5:1)*(buffOn('fast')?1.2:1)*(W4().shoes?1.08:1),s=Math.sin(yaw),c=Math.cos(yaw);P.spd=Math.min(1,(P.spd||0)+dt*5);
    var mx=(fx*c+fz*s)*sp*dt*P.spd,mz=(-fx*s+fz*c)*sp*dt*P.spd,r=.32;
    var nx=P.x+mx,nz=P.z+mz;
    if(!blocked(nx,P.z,r)&&inBounds(nx,P.z))P.x=nx;
    if(!blocked(P.x,nz,r)&&inBounds(P.x,nz))P.z=nz;
    P.mvx=mx/dt;P.mvz=mz/dt;P.ry=Math.atan2(mx,mz);doorCheck(mx,mz);}else P.spd=0;
  var y=ESC?(ESC.y||0):P.area==='city'&&onBlockSlab(P.x,P.z)?.2:((AREAS[P.area]&&AREAS[P.area].y)||0);
  P.me.root.position.set(P.x,y,P.z);P.me.root.rotation.y+=angD(P.me.root.rotation.y,P.ry)*Math.min(1,dt*12);animCust(P.me,dt,0,moving);
  if(P.phone)P.phone.visible=phoneOpen();if(phoneOpen()){P.me.arms[1].rotation.x=-1.6;P.me.head.rotation.x=.25;}else P.me.head.rotation.x*=.8;
  if(P.carry.length){P.me.arms[0].rotation.x=P.me.arms[1].rotation.x=-1.3;}
}
/* walking into a door takes you through it */
var doorCD=0;
function doorCheck(mx,mz){
  if(doorCD>0)return;var list=ACTS[P.area]||[];
  for(var i=0;i<list.length;i++){var a=list[i];if(!a.door)continue;var d=Math.hypot(a.x-P.x,a.z-P.z);if(d>1.1)continue;
    var nx=a.x-P.x,nz=a.z-P.z;if(a.dn){var ins=L2W(a.dn,DOORX,-2),o2=L2W(a.dn,DOORX,0);nx=ins.x-o2.x;nz=ins.z-o2.z;}else if(a.dnX){nx=1;nz=0;}else if(a.out){nx=0;nz=1;}
    var nl=Math.hypot(nx,nz)||1,ml=Math.hypot(mx,mz)||1;if((mx*nx+mz*nz)/(nl*ml)>.55){doorCD=1.2;if(a.shop&&P.carry.length){a.fn();return;}a.fn();return;}}
}
/* ---------- areas (inside buildings) ---------- */
var retPos=null;
function fade(fn,cb){var f=$('#o-fade');f.classList.add('on');setTimeout(function(){try{fn();}catch(e){console.error(e);}setTimeout(function(){f.classList.remove('on');if(cb)cb();},60);},230);}
function enterArea(id){if(!AREAS[id]){popup('Closed','This building isn\'t open yet.',[{t:'OK'}]);return;}
  fade(function(){retPos={x:P.x,z:P.z,yaw:yaw};P.area=id;var A=AREAS[id];P.x=A.spawn.x;P.z=A.spawn.z;P.ry=Math.PI;yaw=0;pitch=A.cam.pitch;O.snap=true;doorCD=1;
    if(id==='hall'){W4().tax.visited=true;}if(id==='grocery')fmEnter();try{tone(1318,.25,'sine',.02);}catch(e){}updDaylight();});}
function leaveArea(){if(jailLocked()){toast('The door is locked. Wait it out or post bail.','bad');return;}if(P.carry.length&&P.area==='supply'){/* fine: you carry crates out */}
  fade(function(){var r=retPos||placeById('hall')||{x:0,z:0};P.area='city';var back=outward(r);P.x=back.x;P.z=back.z;yaw=Math.atan2(back.x-r.x,back.z-r.z);P.ry=yaw;pitch=.44;O.snap=true;doorCD=1;updDaylight();});}
function outward(r){var b=blockAt(r.x,r.z);if(!b)return {x:r.x-1.2,z:r.z};var dz=r.z>b.z?1:-1;return {x:r.x,z:r.z+dz*1.2};}
/* ---------- going into your shop: the counter view picks up from here ---------- */
function goInside(loc){
  if(SH&&SH.phase!=='done'&&SH.loc!==loc){popup('You\'re mid-shift at '+SH.loc.name,'Day '+(SH.loc.days+1)+' is still running there ('+clockStrH(clockH)+'). Close it early and come work here?',[
    {t:'Close '+SH.loc.name+' early',s:'The day ends now and you get the report',fn:function(){SH.len=SH.t;SH.phase='closing';SH.cust.forEach(function(c){if(c.state==='wait')walkout(c);});endShift();setTimeout(function(){goInside(loc);},50);}},{t:'Stay out',cls:'sec'}]);return;}
  fade(function(){var i=G.locs.indexOf(loc);O.exit(true);if(i>=0)G.act=i;
    if(pendSum){var s=pendSum;pendSum=null;if(SH&&SH.loc!==loc)previewShop();showSummary(s);return;}
    if(SH&&SH.loc===loc&&SH.phase!=='done'){paused=true;unpause();fitCamera();return;}
    startShift();});
}
var pendSum=null;
O.deferSum=function(s){if(!O.on)return false;pendSum=s;note('Day '+s.day+' at '+s.locName+' is done',(s.sales+s.tips>0?fmt(s.sales+s.tips)+' in sales. ':'')+'Walk back in to see the report.','good',{label:'Directions',fn:function(){var l=G.locs.filter(function(x){return x.name===s.locName;})[0];if(l)navTo(placeById('shop:'+l.id));}});return true;};

/* ---------- camera ---------- */
var camT=V3(0,0,0),camL=V3(0,0,0);
function updCamera(dt){
  updTalk(dt);if(slideCam(dt)||eatCamera(dt)||movieCamera(dt)||bowlCam(dt)||clawCam(dt)||railCam(dt))return;if(talkCamera(dt))return;
  var f,dd,pt;
  if(RIDE&&!RIDE.wait){f=RIDE.car.g.position;dd=12;pt=.4;yaw+=angD(yaw,RIDE.car.h+Math.PI)*Math.min(1,dt*2);}
  else if(drv){f=drv.v.g.position;dd=drv.v.kind==='truck'?15:13;pt=.4;yaw+=angD(yaw,drv.v.g.rotation.y+Math.PI)*Math.min(1,dt*2.2);}
  else{f=P.me.root.position;dd=P.area==='city'?dist:AREAS[P.area].cam.dist;pt=P.area==='city'?pitch:AREAS[P.area].cam.pitch;
    if(P.area==='city'&&P.moving&&!drag&&now()-lastDrag>1500){var want=Math.atan2(P.mvx,P.mvz)+Math.PI,fw=Math.abs(angD(yaw,want));if(fw<2.4)yaw+=angD(yaw,want)*Math.min(1,dt*(fw<1.2?1.6:.7));}}
  if(W/H<.9)dd*=1.22;
  camT.set(f.x,f.y+1.3,f.z);
  var cp=V3(f.x+Math.sin(yaw)*Math.cos(pt)*dd,f.y+1.4+Math.sin(pt)*dd,f.z+Math.cos(yaw)*Math.cos(pt)*dd);
  var ceilA=AREAS[P.area];if(ceilA&&ceilA.ceil&&cp.y>ceilA.ceil)cp.y=ceilA.ceil;
  // keep the camera out of walls
  if(P.area==='city'&&!BIRD){var hit=null;for(var k=0;k<16&&(hit=camInside(cp.x,cp.z,cp.y));k++){if(pt<1.15)pt=Math.min(1.15,pt+.12);else if(dd>1.8)dd*=.85;else break;cp.set(f.x+Math.sin(yaw)*Math.cos(pt)*dd,f.y+1.4+Math.sin(pt)*dd,f.z+Math.cos(yaw)*Math.cos(pt)*dd);}
    if(hit&&!drag){var fy=Math.atan2(f.x-(hit.x0+hit.x1)/2,f.z-(hit.z0+hit.z1)/2);yaw+=angD(yaw,fy)*Math.min(1,dt*2.5);}}
  else{var b=AREAS[P.area].b;cp.x=clamp(cp.x,b.x0+.2,b.x1-.2);cp.z=clamp(cp.z,b.z0+.2,b.z1+4);}
  if(shakeO>0){cp.x+=rnd(-1,1)*shakeO*.3;cp.y+=rnd(-1,1)*shakeO*.3;shakeO=Math.max(0,shakeO-dt*1.5);}
  if(O.snap){O.cam.position.copy(cp);camL.copy(camT);O.snap=false;}else{O.cam.position.lerp(cp,Math.min(1,dt*(drv?5:6)));camL.lerp(camT,Math.min(1,dt*10));}O.cam.lookAt(camL);
}
function camInside(x,z,y){for(var i=0;i<cols.length;i++){var c=cols[i];if(c.area!=='city'||c.car)continue;if(y>(c.h||13)+.8)continue;if(x>c.x0-.3&&x<c.x1+.3&&z>c.z0-.3&&z<c.z1+.3&&(c.x1-c.x0)>2)return c;}return null;}

/* ---------- the action buttons (stable DOM: built once per change, never every frame) ---------- */
function updActs(){
  var list=caterActs().concat(mhActs(),crashActs(),synActs(),gigActs(),catActs(),celebActs(),ghostActs(),dogActs(),clockActs(),homeActs(),brickActs(),mpActs(),devActs(),rsActs(),(ACTS[P.area]||[]).filter(home2When),P.area==='city'?vehAct().concat(rivalTruckActs(),pedActs(),repairActs(),taxiActs(),beanActs(),vendActs()):[]),best=null,bd=1e9;
  if(!drv&&!(RIDE&&!RIDE.coming)&&!CUT)list.forEach(function(a){var d=Math.hypot(a.x-P.x,a.z-P.z);if(d<a.r&&d<bd){bd=d;best=a;}});
  curAct=best;var el=$('#o-act'),el2=$('#o-alt'),k1='',k2='';
  if(drv){k1='Get out|'+(drv.v.kind==='truck'?(truckZone(drv.v)?'Park here and open the window':'Not a vending zone'):districtName(P.x,P.z));curAlt=null;}
  else if(RIDE&&!RIDE.coming){k1=RIDE.wait?'Get in the cab|It\'s waiting at the curb':'Skip ahead|Arrive now';curAlt=null;}
  else if(best){var lab=typeof best.label==='function'?best.label():best.label,sub=best.sub?(typeof best.sub==='function'?best.sub():best.sub):'';k1=lab+'|'+sub;curAlt=best.alt?(typeof best.alt==='function'?best.alt():best.alt):null;if(curAlt)k2=curAlt.label;}
  else curAlt=null;
  if(k1!==actKey){actKey=k1;if(!k1)el.hidden=true;else{var p=k1.split('|');el.hidden=false;el.innerHTML='<b>'+esc(p[0])+'</b>'+(p[1]?'<small>'+esc(p[1])+'</small>':'');}}
  if(k2!==altKey){altKey=k2;el2.hidden=!k2;if(k2)el2.innerHTML='<b>'+esc(k2)+'</b>';}
}
function doAct(alt){
  if(popOpen()||CUT)return;audioOn();
  if(RIDE&&!RIDE.coming){if(RIDE.wait)RIDE.board=true;else RIDE.skip=true;actKey='';return;}
  if(drv){exitVeh();actKey='';return;}
  if(alt){if(curAlt)curAlt.fn();actKey='';return;}
  if(curAct){curAct.fn();actKey='';}
}

/* ---------- places, GPS directions and the minimap ---------- */
/* GPS lives in q_nav.js */
var mini=null;
function drawMini(){
  var cv=$('#o-mini');if(!cv||!plan)return;if(!mini){mini=cv.getContext('2d');}var s=cv.width,g=mini,sc=s/150;g.clearRect(0,0,s,s);
  g.save();g.beginPath();g.arc(s/2,s/2,s/2-2,0,7);g.clip();g.fillStyle='#9fd47f';g.fillRect(0,0,s,s);
  var cx=P.area==='city'?P.x:(placeById(ENTRANCE[P.area])||{x:0}).x,cz=P.area==='city'?P.z:(placeById(ENTRANCE[P.area])||{z:0}).z;
  g.translate(s/2,s/2);g.rotate(yaw+Math.PI);g.scale(sc,sc);g.translate(-cx,-cz);
  g.fillStyle='#6b6f78';roads.forEach(function(r){g.fillRect(r.x0,r.z0,r.x1-r.x0,r.z1-r.z0);});
  plan.blocks.forEach(function(b){g.fillStyle=b.t==='park'?'#7cc864':b.t==='dist'?(myLocIn(b.D)?'#ffd98a':'#efe6d6'):b.t==='homes'?'#e6dccd':'#d8e6f0';g.fillRect(b.x-BW/2,b.z-BD/2,BW,BD);});
  g.fillStyle='#d8dee6';g.fillRect(plan.AX-22,plan.AZ-40,44,80);
  if(NAV&&NAV.pts){g.strokeStyle='#18c8f0';g.lineWidth=3/sc;g.beginPath();NAV.pts.forEach(function(p,i){if(i)g.lineTo(p.x,p.z);else g.moveTo(p.x,p.z);});g.stroke();g.fillStyle='#18c8f0';g.beginPath();g.arc(NAV.to.x,NAV.to.z,4/sc,0,7);g.fill();}
  places.forEach(function(p){if(p.kind==='shop'||p.kind==='supply'||p.kind==='civic'||p.kind==='airport'||p.kind==='motors'){g.fillStyle=p.kind==='shop'?'#e2553f':p.kind==='supply'?'#2f5f90':p.kind==='airport'?'#7a5ad8':'#2a1a12';g.beginPath();g.arc(p.x,p.z,3.2/sc,0,7);g.fill();}});
  if(hasBar()&&MH){g.strokeStyle='#2a2a2a';g.lineWidth=2/sc;MH.forEach(function(m){g.beginPath();g.arc(m.x,m.z,3/sc,0,7);g.stroke();});}
  g.fillStyle='rgba(42,26,18,.5)';cars.forEach(function(c){g.fillRect(c.x-1,c.z-1,2,2);});
  g.restore();
  g.save();g.translate(s/2,s/2);g.fillStyle='#2f8fd0';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(0,-8);g.lineTo(6,6);g.lineTo(0,3);g.lineTo(-6,6);g.closePath();
  var pr=(drv?drv.v.g.rotation.y:P.me.root.rotation.y)-(yaw+Math.PI);g.rotate(-pr);g.fill();g.stroke();g.restore();
  g.strokeStyle='rgba(42,26,18,.6)';g.lineWidth=3;g.beginPath();g.arc(s/2,s/2,s/2-2,0,7);g.stroke();
  var na=-(yaw+Math.PI);g.fillStyle='#2a1a12';g.font='800 11px '+FB;g.textAlign='center';g.fillText('N',s/2+Math.sin(na)*(s/2-10),s/2-Math.cos(na)*(s/2-10)+4);
}

/* ---------- taxi rides, crew trucks and deliveries actually drive the streets ---------- */
function crewTruck(to,sec){if(!O.on||P.area!=='city')return;var start={x:plan.xs[0]-20,z:plan.zs[plan.jm]},pts=route(start,to),L=routeLen(pts);
  var g=carModel('crew');dyn.add(g);var c={g:g,pts:pts,L:L,s:0,v:L/Math.max(4,sec),x:start.x,z:start.z,h:0,end:function(){dyn.remove(g);}};movers.push(c);}
function deliveryVan(to,sec,done){if(!O.on||P.area!=='city'){return;}var start={x:plan.xs[0]-20,z:plan.zs[plan.jm]},pts=route(start,to),L=routeLen(pts),g=carModel('delivery');dyn.add(g);movers.push({g:g,pts:pts,L:L,s:0,v:L/Math.max(4,sec),end:function(){setTimeout(function(){dyn.remove(g);},4000);}});}
var movers=[];
function laneOff(pts,i,t){var a=pts[i],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;return {x:a.x+dx*t+(-dz/l)*LANE,z:a.z+dz*t+(dx/l)*LANE,h:Math.atan2(dx,dz)};}
function updMovers(dt){for(var i=movers.length-1;i>=0;i--){var m=movers[i];m.s+=m.v*dt;if(m.s>=m.L){m.end&&m.end();movers.splice(i,1);continue;}
  var acc=0;for(var k=0;k<m.pts.length-1;k++){var l=Math.hypot(m.pts[k+1].x-m.pts[k].x,m.pts[k+1].z-m.pts[k].z);if(acc+l>=m.s){var p=laneOff(m.pts,k,(m.s-acc)/Math.max(.01,l));m.g.position.set(p.x,0,p.z);m.g.rotation.y+=angD(m.g.rotation.y,p.h)*Math.min(1,dt*6);m.x=p.x;m.z=p.z;break;}acc+=l;}}}
function callCab(dest){
  if(P.area!=='city'){popup('Step outside first','Cabs pick up at the curb.',[{t:'OK'}]);return;}
  if(RIDE){toast('Your cab is already on the way.');return;}
  var to=dest,pts=route({x:P.x,z:P.z},to),L=routeLen(pts),fare=Math.round((5+L*.03)*tierM());
  popup('City Cab','"Where to? '+to.name+'? That\'s about '+fmt(fare)+'."',[{t:'Book it · '+fmt(fare),s:'About '+Math.max(1,Math.round(L/17))+' sec ride',fn:function(){if(!pay(fare,'The cab'))return;W4().stats.taxis++;
    var e=nearestEdge(P.x,P.z),pk={x:e.q.x,z:e.q.z},g=carModel('taxi');dyn.add(g);var car={g:g,h:0},from={x:pk.x+(Math.random()<.5?60:-60),z:pk.z+(Math.random()<.5?40:-40)};
    var app=route(from,pk);RIDE={car:car,wait:true,coming:true,to:to};movers.push({g:g,pts:app,L:routeLen(app),s:0,v:15,end:function(){if(RIDE&&RIDE.car===car)RIDE.coming=false;}});
    note('Your cab is coming','Yellow car with a checkered stripe. Walk up to it when it pulls over.','info');}},{t:'Never mind',cls:'sec'}],'',{who:'City Cab',role:'Dispatch',col:'#ffc63d'});}
function updRide(dt){if(!RIDE)return;var c=RIDE.car;
  if(RIDE.wait){if(RIDE.coming)return;var d=Math.hypot(c.g.position.x-P.x,c.g.position.z-P.z);
    if(!RIDE.honked){RIDE.honked=1;try{tone(392,.15,'square',.03);tone(392,.15,'square',.03,.25);}catch(e){}bubble(c.g.position.x,2.3,c.g.position.z,'Taxi for you!','');}
    if(d<3.5||(RIDE.board&&d<25)){RIDE.wait=false;P.me.root.visible=false;NAV=null;var pts=route({x:c.g.position.x,z:c.g.position.z},RIDE.to);RIDE.pts=pts;RIDE.L=routeLen(pts);RIDE.s=0;yaw=c.g.rotation.y+Math.PI;}
    RIDE.board=false;c.h=c.g.rotation.y;return;}
  RIDE.v=RIDE.v||0;var tgt=rideTarget(RIDE);RIDE.v=RIDE.v<tgt?Math.min(tgt,RIDE.v+6*dt):Math.max(tgt,RIDE.v-18*dt);RIDE.s+=RIDE.v*dt;if(RIDE.skip)RIDE.s=RIDE.L;
  if(RIDE.s>=RIDE.L&&!RIDE.done){RIDE.done=1;var to=RIDE.to;fade(function(){P.x=to.x;P.z=to.z;P.me.root.visible=true;dyn.remove(c.g);RIDE=null;O.snap=true;},function(){note('You\'re here',to.name,'good');});return;}
  if(RIDE.done)return;
  var acc=0,pts=RIDE.pts;for(var k=0;k<pts.length-1;k++){var l=Math.hypot(pts[k+1].x-pts[k].x,pts[k+1].z-pts[k].z);if(acc+l>=RIDE.s){var p=laneOff(pts,k,(RIDE.s-acc)/Math.max(.01,l));c.g.position.set(p.x,0,p.z);c.g.rotation.y+=angD(c.g.rotation.y,p.h)*Math.min(1,dt*6);c.h=c.g.rotation.y;P.x=p.x;P.z=p.z;break;}acc+=l;}
}
/* ---------- flights ---------- */
function flightList(){var out=[],n=Math.min(CITY_NAMES.length,Math.max(4,(G.cities||1)+2));if(O.city!==MPC)out.push({to:MPC,name:'Crema Metro · the shared city',req:5,ok:G.lvl>=5,cost:flightCost(MPC),mp:1});for(var c=0;c<n;c++){if(c===O.city)continue;out.push({to:c,name:cityName(c),req:0,ok:true,cost:flightCost(c),scout:c>=(G.cities||1)});}return out;}
function flightCost(to){if(to===MPC||O.city===MPC)return (apOwned()&&O.city!==MPC?0:Math.round(900*tierM(Math.min(O.city,2))))+mpFare();if(apOwned())return 0;return Math.round(350*Math.pow(2.1,Math.max(to,O.city))*(1+.25*Math.abs(to-O.city)));}
function myTicket(){return W4().tickets.filter(function(t){return t.from===O.city;})[0]||null;}
function flightsDesk(atCounter){
  var fl=flightList();if(!fl.length){popup('Air Crema','No routes yet.',[{t:'OK'}]);return;}
  popup('Air Crema','"Where are we flying today?"'+(atCounter?'':'\nTickets bought here are waiting at the counter; your gate is B4.'),fl.map(function(f){return {t:f.name+' · '+fmt(f.cost),s:f.mp?'Other players are there. Everything is shared'+(mpFare()?' · includes '+fmt(mpFare())+' airport fee':''):f.ok?(f.scout?'Scouting trip · open a regional office at their City Hall':'You have shops there')+'':'Needs level '+f.req,off:!f.ok,why:'Reach level '+f.req+' first.',fn:function(){
    flyClass(f,function(cost,cls){if(!pay(cost,'The flight'))return;W4().flyCls=cls;if(f.to===MPC||O.city===MPC)mpPayFare();if(f.to===MPC)W4().mpVisited=1;W4().tickets=W4().tickets.filter(function(t){return t.from!==O.city;});W4().tickets.push({from:O.city,to:f.to,at:now()});save();
    note('Boarding pass: '+f.name,'Gate B4 at '+plan.name+' International. Go through security and board.','good',{label:'Directions',fn:function(){navTo(placeById('airport'));}});});}};}).concat([{t:'Not today',cls:'sec'}]),'',{who:'Air Crema',role:'Ticketing',col:'#2f8fd0'});
}
function rentalCost(){return Math.round(600*tierM());}
function rentCar(){if(myVeh()){toast('You already have a car here.');return;}var c=rentalCost();popup('Rent-a-car','"A clean pickup with a full tank. Keep it as long as you\'re in '+plan.name+'. It\'ll be at the curb out front."',[{t:'Rent it · '+fmt(c),fn:function(){if(!pay(c,'The rental'))return;W4().cars[O.city]={x:plan.CX+RH-1.2,z:plan.AZ-12,ry:Math.PI,rental:1};initVehicles();note('Rental ready','At the curb outside the terminal.','good');}},{t:'No thanks',cls:'sec'}],'',{who:'Rent-a-car',col:'#ffc63d'});}
function buyPickup(){if(myVeh()&&!myVeh().sv.rental){toast('You already have a pickup in '+plan.name+'.');return;}var c=pickupCost();popup('Crema Motors','"A pickup for '+plan.name+'. Six-crate bed, plates already on."',[{t:'Buy it · '+fmt(c),fn:function(){if(!pay(c,'The pickup'))return;var b=blockOf('motors');W4().cars[O.city]={x:b.x+BW/2-5,z:b.z+BD/2+1.15,ry:-Math.PI/2};initVehicles();note('New pickup','Parked outside Crema Motors.','good');}},{t:'Not now',cls:'sec'}],'',{who:'Vince',role:'Crema Motors',col:'#e2553f'});}
/* boarding: you walk on, the jet takes off, and you land in the next city */
function board(t){document.body.classList.add('incut');CUT={t:0,to:t.to,from:O.city,st:'out'};W4().tickets=W4().tickets.filter(function(q){return q!==t;});W4().stats.flights++;save();closePhone();
  fade(function(){P.me.root.visible=false;cutPlane=planeModel(0xffc63d);O.scene.add(cutPlane);},null);$('#o-cut').hidden=false;}
var cutPlane=null;
function updCut(dt){if(!CUT||!cutPlane)return;CUT.t+=dt;var c=CUT;
  if(c.st==='out'){var k=c.t,x=plan.AX+80,z=plan.AZ+200-k*k*7,y=k>3?(k-3)*(k-3)*1.6:0;cutPlane.position.set(x,y,z);cutPlane.rotation.y=Math.PI;cutPlane.rotation.x=k>3?-.15:0;
    O.cam.position.set(x-36,6+y*.6,plan.AZ+80);O.cam.lookAt(x,y+3,z);if(c.t>6.5||c.skip){c.st='swap';c.skip=false;fade(function(){buildCabin(c.to);c.t=0;c.st='cabin';$('#o-look').hidden=false;});}}
  else if(c.st==='cabin'){if(CAB.t>40||c.skip){c.st='swap';c.skip=false;cabinEnd();$('#o-look').hidden=true;fade(function(){CAB=null;O.scene.remove(cutPlane);build(c.to);P.area='terminal';cutPlane=planeModel(0x2f8fd0);O.scene.add(cutPlane);c.t=0;c.st='in';});}}
  else if(c.st==='in'){var k2=c.t,x2=plan.AX+80,z2=plan.AZ-260+k2*60,y2=Math.max(0,30-k2*8);cutPlane.position.set(x2,y2,z2);cutPlane.rotation.y=0;cutPlane.rotation.x=y2>0?.06:0;
    O.cam.position.set(x2-40,8,plan.AZ-60);O.cam.lookAt(x2,y2+3,z2);if(c.t>5||c.skip){c.st='done';fade(function(){O.scene.remove(cutPlane);cutPlane=null;var A=AREAS.terminal;P.area='terminal';P.x=A.ox+26;P.z=6;yaw=Math.PI/2;P.me.root.visible=true;O.snap=true;CUT=null;$('#o-cut').hidden=true;document.body.classList.remove('incut');
      banner('Welcome to '+plan.name,'Air Crema flight complete','good');note('Landed in '+plan.name,(G.locs.some(function(l){return l.city===O.city;})?'Your shops here are on the map.':'Scout it out. Open a regional office at City Hall to build here.'),'good',{label:'City Hall',fn:function(){navTo(placeById('hall'));}});});}}
}
