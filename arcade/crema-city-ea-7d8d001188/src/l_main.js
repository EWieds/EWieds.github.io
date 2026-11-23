
/* ---------- build a city ---------- */
function build(city){
  city=city==null?curLoc().city:city;
  LBL.forEach(function(l){l.el.remove();});LBL=[];POOL=[];
  var sc=new T.Scene();O.scene=sc;sc.environment=scene.environment;sc.fog=new T.Fog(0xdff3ff,50,190);sc.background=new T.Color(0x8fd0f4);
  lights.hemi=new T.HemisphereLight(0xfff6ea,0x9a8a7a,.66);sc.add(lights.hemi);lights.sun=new T.DirectionalLight(0xffffff,.65);lights.sun.position.set(-30,60,35);sc.add(lights.sun);
  var fill=new T.DirectionalLight(0xffe2c0,.22);fill.position.set(40,15,-20);sc.add(fill);
  O.cam=O.cam||new T.PerspectiveCamera(50,W/H,.1,340);resizeO();
  if(!MAT.lamp)initMats();
  plan=mkPlan(city);O.city=city;W4().at=city;
  dyn=new T.Group();sc.add(dyn);stat=new T.Group();
  if(O.city!==city){NAV=null;}RIDE=null;drv=null;
  BUS=[];HOMES=[];TOUR=null;travelers=[];CAB=null;if(BIRD)birdOff();
  ACTS={city:[]};AREAS={};cols=[];places=[];sites=[];shopV=[];zones=[];anim=[];walkers=[];peds=[];cars=[];movers=[];shoppers=[];billboards=[];planes=[];veh=[];rtrucks=[];
  curArea='city';clockFace=null;hallBoard=null;depBoard=null;routeM=null;beam=null;rainG=null;lastPh='';lastLit=-1;actKey='';altKey='';$('#o-act').hidden=true;$('#o-alt').hidden=true;
  mkRoads();mkGraph();buildGround();buildSignals();
  plan.blocks.forEach(buildBlock);buildAirport();airportDetail();buildNorth();buildSouth();buildWest();buildInteriors();initTravelers();
  sc.add(stat);
  var loc=curLoc(),acc=loc&&IND[loc.ind]?IND[loc.ind].theme.accent:0xffb83d;
  P.me=makeCustomer(district(city,plan.blocks[0].D.id),{staff:acc});P.me.root.scale.setScalar(1.05);sc.add(P.me.root);
  P.hand=new T.Group();P.hand.position.set(0,.72,.5);P.me.root.add(P.hand);carryView();
  P.phone=new T.Group();P.phone.position.set(0,-.42,.1);P.me.arms[1].add(P.phone);rb(.12,.22,.03,.02,toon(0x1a1a1e),0,0,0,P.phone);plane(.1,.18,flat(0x8fd3ff),0,0,.017,P.phone);P.phone.visible=false;
  initTraffic();initPeds();initVehicles();initRivalTrucks();initRain();P.caseM=null;caseView();trayM=null;trayView();hatView();WIN=null;CRASH=null;goldBeans();lostCat();initDog();initGhost();brickDecor();CELEB=null;endTalk(true);TALKERS={};syncBizRev();
  O.dirty=false;
  if(lowEnd()){sc.fog.far=140;}
}
function rebuild(){if(!O.scene)return;var st={x:P.x,z:P.z,ry:P.ry,area:P.area,dv:drv?drv.v.sv:null,yaw:yaw},nav=NAV;
  veh.forEach(function(v){v.sv.x=v.g.position.x;v.sv.z=v.g.position.z;v.sv.ry=v.g.rotation.y;});
  build(O.city);P.x=st.x;P.z=st.z;P.ry=st.ry;P.area=st.area;yaw=st.yaw;
  if(st.dv){var v=veh.filter(function(q){return q.sv===st.dv;})[0];if(v){drv={v:v,speed:0};P.me.root.visible=false;}}
  NAV=nav;if(NAV)recalcNav();P.me.root.position.set(P.x,0,P.z);O.snap=true;}
function rebuildArea(){O.dirty=true;}
O.rebuild=function(){O.dirty=true;};

/* ---------- stepping out of the shop, and back in ---------- */
O.enter=function(){
  if(O.on||!G)return;W4();finishBuilds();var loc=curLoc();
  if(!O.scene||O.city!==loc.city||O.dirty)build(loc.city);
  pauseFor();O.on=true;document.body.classList.add('outside');$('#o-ui').hidden=false;
  var v=shopVOf(loc);P.area='city';drv=null;
  if(v){var o=L2W(v.lot,DOORX,.5);P.x=o.x;P.z=o.z;P.ry=v.lot.ry;yaw=v.lot.ry;var ar=areaOfX(v.lot.x);if(ar)P.area=ar;swing(v);P.auto=.5;}
  else{var b=blockOf('dist');P.x=b.x;P.z=b.z+BD/2-1.5;yaw=0;}
  pitch=.38;O.snap=true;P.me.root.visible=true;actKey='';altKey='';resizeO();updDaylight();awayReport();if(!(W4().f&&W4().f.tut))tutWhenReady(0);
  if(SH&&SH.phase==='open'&&!hasMgr(loc))setTimeout(function(){if(O.on)note('Counter unattended',loc.name+' has no manager, so it\'s CLOSED until you walk back in. The shift clock is paused.','bad');},700);
  else if(SH&&SH.phase==='open')note(staffName(loc,'manager',0)+' has the counter','The shift keeps running while you\'re out. Watch the door: every customer you see go in is real.','good');
  if(!W4().seen2&&W4().f&&W4().f.tut){W4().seen2=1;setTimeout(function(){popup('Welcome to '+plan.name,'This is your town. Everything here is real:\n• The people walking into your shop are the customers at your counter.\n• Walk into any door to go inside. Walk into your shop\'s door to get back behind the counter.\n• Crema Supply Co. sells crates. Haul them back and ingredients cost half.\n• Buy land, then call Bob\'s Builders from your phone.\n• City Hall, the bank, Crema Motors and the airport are all open.\n\nMove: WASD or the stick · Use: E or the yellow button · Look: drag · Phone: P',[{t:'Let\'s go'}]);},500);}
};
O.exit=function(noUnpause){if(!O.on)return;if(G&&G.w4)G.w4.ledOut=G.w4.led||0;if(drv)exitVeh();if(RIDE){if(RIDE.car)dyn.remove(RIDE.car.g);RIDE=null;}O.on=false;document.body.classList.remove('outside','photo');$('#o-ui').hidden=true;$('#o-photo').hidden=true;closePhone();closePop();save();
  if(!noUnpause){paused=true;unpause();if(SH&&SH.phase!=='done')fitCamera();}};
O.walkOut=function(){if(O.on||!G)return;audioOn();if(!$('#modal').hidden||SHEET)return;fade(function(){O.enter();});};
function goBackIn(){var loc=curLoc();if(loc.city===O.city){if(P.area==='city'){var v=shopVOf(loc);if(v&&Math.hypot(v.out.x-P.x,v.out.z-P.z)>30){popup('Head back to '+loc.name+'?','It\'s '+Math.round(Math.hypot(v.out.x-P.x,v.out.z-P.z))+' m away.',[{t:'Directions',fn:function(){navTo(placeById('shop:'+loc.id));}},{t:'Take a shortcut',s:'Skip the walk',fn:function(){goInside(loc);}},{t:'Stay out',cls:'sec'}]);return;}}goInside(loc);return;}
  var mine=G.locs.filter(function(l){return l.city===O.city;});if(mine.length){goInside(mine[0]);return;}
  popup('Your counter is in '+cityName(loc.city),'Fly back to '+cityName(loc.city)+' from the airport, or charter a jet right now.',[{t:'Directions to the airport',fn:function(){navTo(placeById('airport'));}},{t:'Charter a jet · '+fmt(flightCost(loc.city)*3),s:'Straight back to your counter',fn:function(){if(!pay(flightCost(loc.city)*3,'The charter'))return;fade(function(){O.exit(true);build(loc.city);startShift();});}},{t:'Stay',cls:'sec'}]);}

/* ---------- the window behind the counter shows the real street ---------- */
var winRT=null,winCam=null,winMat=null,inDoor=null,doorHits=[];
O.winPlane=function(g,ww,wh,wy,zB){
  if(!winRT){winRT=new T.WebGLRenderTarget(lowEnd()?384:640,lowEnd()?168:280);winRT.texture.encoding=T.sRGBEncoding;winCam=new T.PerspectiveCamera(44,ww/wh,.1,140);winMat=new T.MeshBasicMaterial({map:winRT.texture});}
  winCam.aspect=ww/wh;winCam.updateProjectionMatrix();var p=plane(ww,wh,winMat,0,wy,zB+.08,g);plane(ww,wh,flat(0xffffff,{op:.07}),0,wy,zB+.085,g);winFresh=0;return p;};
var winFresh=0;
function renderWin(loc,dt){if(!winRT||!O.scene)return;var v=shopVOf(loc);if(!v)return;var a=L2W(v.lot,.6,-.5),b=L2W(v.lot,.6,24);var ar=areaOfX(v.lot.x);
  winCam.position.set(a.x,1.75,a.z);winCam.lookAt(b.x,1.5,b.z);var keepBg=O.scene.background;
  if(ar){var A=AREAS[ar];O.scene.background=A.bgC;}
  renderer.setRenderTarget(winRT);renderer.render(O.scene,winCam);renderer.setRenderTarget(null);O.scene.background=keepBg;}
O.shopDoor=function(g,L,loc,o){
  var dX=Math.min(L.rx-.95,Math.max(o.hw+.9,o.ww/2+.15+o.sw+.8)),zB=o.zB,th=o.th;L.door={x:dX,z:zB};
  bx(.16,2.7,.25,toon(th.trim),dX-.72,1.35,zB+.08,g);bx(.16,2.7,.25,toon(th.trim),dX+.72,1.35,zB+.08,g);bx(1.6,.18,.25,toon(th.trim),dX,2.75,zB+.08,g);
  var piv=new T.Group();piv.position.set(dX-.64,0,zB+.12);g.add(piv);bx(1.26,2.6,.06,glass(0xdff2ff,.45),.63,1.3,0,piv);bx(.06,.5,.06,toon(0xffd23d),1.12,1.15,.06,piv);
  var sgn=plane(.5,.24,flat(0xffffff,{map:signT('OPEN',{bg:'#2fa860',fg:'#fff',w:256,h:120})}),.63,1.75,.05,piv);
  plane(.9,.32,flat(0xffffff,{map:signT('EXIT · STREET',{bg:'#2fa860',fg:'#fff',w:384,h:128})}),dX,3.05,zB+.12,g);
  sp(.06,toon(0xffd23d),dX+.5,2.62,zB+.2,g,8);
  var hb=hitBox(1.5,2.8,.6,dX,1.4,zB+.3,g,{door:1});doorHits=[hb];inDoor={piv:piv,t:0,a:0};
};
O.inSwing=function(){if(inDoor)inDoor.t=1.1;};
O.tapDoor=function(x,y){if(O.on||!doorHits.length||!SH)return false;var r=cvs.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);
  if(ray.intersectObjects(doorHits,false).length){if(inDoor)inDoor.t=1;O.walkOut();return true;}return false;};

/* ---------- every frame ---------- */
var slowT=0,inAcc=0,callT=0;
O.frame=function(dt){
  if(!G||!G.locs||!G.locs.length)return false;var tl=(O.tl=(O.tl||0)+dt);W4();
  econTick(dt);slowT+=dt;if(slowT>1){slowT=0;finishBuilds();campaignTick();syncBizRev();if(hallBoard&&Math.random()<.06){hallBoard.n++;drawBoard();}if(depBoard&&tl-depBoard.last>15){depBoard.last=tl;drawDepartures();}}
  if(O.on){
    if(bgShift()){simT+=dt;updShift(dt,simT);updTW(dt);}
    if(O.dirty&&!CUT)rebuild();
    doorCD=Math.max(0,doorCD-dt);updClock(dt);updSignals(tl);
    if(CUT&&CUT.st==='cabin'){updCut(dt);if(CAB)cabinFrame(dt);renderHud();return true;}
    if(TUT){updTraffic(dt,tl);updPeds(dt,tl);updWalkers(dt);updShops(dt);updAnim(dt,tl);updGeo(dt,tl);updDaylight();tutFrame(dt);renderHud();renderer.render(O.scene,O.cam);return true;}
    if(BIRD){updTraffic(dt,tl);updPeds(dt,tl);updWalkers(dt);updShops(dt);updAnim(dt,tl);updGeo(dt,tl);updDaylight();birdFrame(dt);renderHud();renderer.render(O.scene,O.cam);return true;}
    if(CUT)updCut(dt);else{if(P.auto>0){P.auto-=dt;var o=V3(Math.sin(P.ry),0,Math.cos(P.ry));P.x+=o.x*dt*2.2;P.z+=o.z*dt*2.2;P.moving=true;animCust(P.me,dt,0,true);P.me.root.position.set(P.x,.2,P.z);P.me.root.rotation.y=P.ry;}
      else if(drv)driveStep(dt);else if(!(RIDE&&!RIDE.wait))moveWalk(dt);updRide(dt);}
    if(P.area==='city'){updTraffic(dt,tl);updPeds(dt,tl);updMovers(dt);updRivalTrucks(dt);}
    updWalkers(dt);updShops(dt);updShoppers(dt);updTravelers(dt);updAnim(dt,tl);updGeo(dt,tl);updWeather(dt);updDaylight();drawClock();updSecurity(dt);updMission(dt);updPedErrands();updWindow(dt);updArcade(dt);updEat(dt);updMovie(dt);jobTick(dt);updDog(dt);updGhost(dt);updCeleb(dt);peds.forEach(function(p){if(p.stop>100&&!popOpen())p.stop=1;});
    if(!CUT)updCamera(dt);
    updActs();updNav(dt);updLabels(dt);if(frameN++%3===0)drawMini();
    var stn=P.area==='city'?streetAt(P.x,P.z):null,wk=districtName(P.x,P.z)+(stn?' · '+stn:'')+' · '+clockStrH(clockH)+(rain.on?' · rain':'')+(P.carry.length?' · carrying '+P.carry.length:'');if($('#o-where').textContent!==wk)$('#o-where').textContent=wk;
    callT+=dt;if(callT>12){callT=0;eventCalls();}
    renderHud();renderer.render(O.scene,O.cam);return true;
  }
  // behind the counter: keep the street alive and render it into the window
  if(SH&&SH.loc){if(!O.scene||O.city!==SH.loc.city){build(SH.loc.city);}inAcc+=dt;
    if(inDoor){inDoor.t=Math.max(0,inDoor.t-dt);var ta=inDoor.t>0?-1.2:0;inDoor.a+=(ta-inDoor.a)*Math.min(1,dt*7);inDoor.piv.rotation.y=-inDoor.a;}
    var every=lowEnd()?8:4;if(frameN++%every===0){var d2=inAcc;inAcc=0;updClock(d2);updSignals(tl);updTraffic(d2,tl);updPeds(d2,tl);updWalkers(d2);updShops(d2);updWeather(d2);updDaylight();renderWin(SH.loc,d2);}}
  return false;
};
var lastMom=0,lastTaxCall=0,lastSupCall=0;
function eventCalls(){var w=W4();if(w.momL==null)w.momL=Math.floor(G.lvl/5)*5;
  if(G.lvl>=w.momL+5){w.momL=Math.floor(G.lvl/5)*5;incoming('Mom','Mom','#ff79b4','"Level '+G.lvl+'! Your father showed the whole street your shop on his phone. I\'m so proud of you."',[{t:'Thanks, Mom',fn:function(){addFame(5);}}]);return;}
  if(unpaid().length>=2&&now()-lastTaxCall>180000){lastTaxCall=now();incoming('City Hall','Tax office','#5a4a38','"This is a courtesy call: you have '+unpaid().length+' unpaid tax bills. At three, we pause your building permits."',[{t:w.tax.visited?'Pay now':'Directions',fn:function(){if(w.tax.visited)payTaxes();else navTo(placeById('hall'));}},{t:'I\'ll handle it',cls:'sec'}]);return;}
  var dry=G.locs.filter(function(l){return l.city===O.city&&hasMgr(l)&&w.stock[l.ind]===0&&locEcon(l).open;})[0];
  if(dry&&now()-lastSupCall>300000){lastSupCall=now();var nm=staffName(dry,'manager',0);incoming(nm,'Manager · '+dry.name,'#7a5ad8','"Boss, the storeroom is empty. We\'re paying full price for ingredients. Want me to order a delivery?"',[{t:'Order a delivery',fn:function(){orderDelivery(dry);}},{t:'I\'ll pick some up',cls:'sec',fn:function(){navTo(placeById('supply'));}}]);}
}

/* ---------- input ---------- */
function resizeO(){if(!O.cam)return;O.cam.far=lowEnd()?180:260;O.cam.aspect=W/H;O.cam.fov=W/H<.9?62:52;O.cam.updateProjectionMatrix();}
window.addEventListener('resize',function(){setTimeout(resizeO,60);});
window.addEventListener('keydown',function(e){if(!O.on)return;var k=e.key.toLowerCase();if(e.target&&/input|textarea/i.test(e.target.tagName))return;if(arcKey(k,true)){e.preventDefault();return;}keys[k]=true;
  if(k==='e'||k==='enter'){e.preventDefault();doAct(false);}if(k==='f')doAct(true);if(k==='p'||k==='tab'){e.preventDefault();if(PH.open)closePhone();else openPhone();}if(k==='m'){openPhone('maps');}
  if(k==='b'){if(BIRD)birdOff();else birdOn();}
  if((k==='t'||k==='/')&&!popOpen()&&!CUT){e.preventDefault();keys[k]=false;doBox();}
  if(k==='escape'){if(BIRD){birdOff();return;}if(popOpen())closePop();else if(PH.open)closePhone();else if(document.body.classList.contains('photo'))photoMode(false);}
  if(k===' '&&drv)e.preventDefault();});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false;arcKey(e.key.toLowerCase(),false);});
window.addEventListener('blur',function(){keys={};});
function bindUI(){
  var cv=renderer.domElement;
  cv.addEventListener('pointerdown',function(e){if(!O.on)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};});
  cv.addEventListener('pointermove',function(e){if(!O.on||!drag||drag.id!==e.pointerId)return;lastDrag=now();if(BIRD){BIRD.x-=(e.clientX-drag.x)*BIRD.h/H*1.1;BIRD.z-=(e.clientY-drag.y)*BIRD.h/H*1.1;drag.x=e.clientX;drag.y=e.clientY;return;}if(CAB){CAB.yaw-=(e.clientX-drag.x)*.005;CAB.pitch=clamp(CAB.pitch-(e.clientY-drag.y)*.004,-.6,.6);drag.x=e.clientX;drag.y=e.clientY;return;}yaw-=(e.clientX-drag.x)*.006;pitch=clamp(pitch+(e.clientY-drag.y)*.004,.12,1.2);drag.x=e.clientX;drag.y=e.clientY;});
  window.addEventListener('pointerup',function(){drag=null;});
  cv.addEventListener('wheel',function(e){if(!O.on)return;if(BIRD)BIRD.h=clamp(BIRD.h+e.deltaY*.15,40,320);else dist=clamp(dist+e.deltaY*.006,4.5,20);},{passive:true});
  var js=$('#o-joy'),kn=js.querySelector('i'),jid=null,jc=null;
  js.addEventListener('pointerdown',function(e){jid=e.pointerId;var r=js.getBoundingClientRect();jc={x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2};js.setPointerCapture(e.pointerId);jm(e);});
  js.addEventListener('pointermove',function(e){if(e.pointerId===jid)jm(e);});
  function jm(e){var dx=(e.clientX-jc.x)/jc.r,dy=(e.clientY-jc.y)/jc.r,l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}joy.x=dx;joy.y=dy;kn.style.transform='translate('+dx*32+'px,'+dy*32+'px)';}
  function je(){jid=null;joy.x=joy.y=0;kn.style.transform='';}
  js.addEventListener('pointerup',je);js.addEventListener('pointercancel',je);
  $('#o-act').addEventListener('click',function(){doAct(false);});$('#o-alt').addEventListener('click',function(){doAct(true);});
  $('#o-in').onclick=function(){goBackIn();};$('#o-phb').onclick=function(){if(PH.open)closePhone();else openPhone();};
  $('#o-mini').onclick=function(){openPhone('maps');};$('#o-cut').onclick=function(){if(CUT)CUT.skip=true;};
  $('#ph-home').onclick=function(){if(PH.app==='home')closePhone();else{PH.app='home';renderPhone();}};
  $('#o-photo').querySelector('.save').onclick=savePhoto;$('#o-photo').querySelector('.done').onclick=function(){photoMode(false);};
  $('#bOut').onclick=function(){if(O.on)goBackIn();else O.walkOut();};
  $('#o-do').onclick=function(){if(popOpen())closePop();doBox();};
  $('#o-birdb').onclick=function(){if(BIRD)birdOff();else birdOn();};$('#o-bird').querySelector('.bx').onclick=birdOff;$('#o-bird').querySelector('.zi').onclick=function(){BIRD.h=clamp(BIRD.h*.75,40,320);};$('#o-bird').querySelector('.zo').onclick=function(){BIRD.h=clamp(BIRD.h*1.33,40,320);};
  $('#o-look').onclick=function(){if(CAB){CAB.look=CAB.look?0:1;$('#o-look').textContent=CAB.look?'Sit back':'Look out the window';}};
}
O.firstRun=function(){var w=W4();if(w.f&&w.f.tut)return;setTimeout(function(){if(!O.on&&$('#modal').hidden)O.walkOut();else if(!O.on)setTimeout(O.firstRun,800);},700);};
function FADE_ON(){var f=$('#o-fade');return !!(f&&f.classList.contains('on'));}
function tutWhenReady(n){setTimeout(function(){var w=W4();if((w.f&&w.f.tut)||TUT||!O.on)return;if(FADE_ON()&&n<12){tutWhenReady(n+1);return;}playTutorial(true);},n?500:900);}
O.bind=function(){bindUI();window.__OUT=O.hooks;};
O.hooks={ev:function(s){return eval(s);},ray:function(x,y){var rc=new T.Raycaster();rc.setFromCamera({x:x,y:y},O.cam);var h=rc.intersectObjects(O.scene.children,true).slice(0,4);return h.map(function(i){var o=i.object,path=[];while(o){path.push((o.name||o.type)+(o.geometry&&o.geometry.type?':'+o.geometry.type:''));o=o.parent;}return i.distance.toFixed(2)+' '+path.slice(0,4).join('<')+' vis:'+i.object.visible+' mat:'+(i.object.material&&i.object.material.type);});},talkInfo:function(){return TALK?{t:[TALK.x,TALK.z,TALK.y],p:[P.x,P.z],cam:O.cam.position.toArray(),vis:TALK.me.root.visible,par:!!TALK.me.root.parent}:null;},doBox:function(){doBox();},ped:function(){var b=null,bd=1e9;peds.forEach(function(q){var d=Math.hypot(q.x-P.x,q.z-P.z);if(d<bd){bd=d;b=q;}});if(b)talkPed(b);return !!b;},bird:function(on){if(on)birdOn();else birdOff();},mis:function(){return W4().mis;},cabin:function(){return CAB?{t:CAB.t,look:CAB.look}:null;},skip:function(){if(CUT)CUT.skip=true;},look:function(){if(CAB)CAB.look=1;},shift:function(){return {bg:bgShift(),mgr:SH&&hasMgr(SH.loc),staff:SH&&JSON.stringify(SH.loc.staff),ph:SH&&SH.phase,t:SH&&Math.round(SH.t),len:SH&&SH.len,paused:paused,on:O.on,cust:SH?SH.cust.length:0,modal:!$('#modal').hidden&&$('#modal').innerText.slice(0,60)};},endDay:function(){if(SH)SH.t=SH.len-1;},prof:function(){var r={};function c(){renderer.render(O.scene,O.cam);return renderer.info.render.calls;}r.all=c();dyn.visible=false;r.noDyn=c();dyn.visible=true;peds.forEach(function(p){p.me.root.visible=false;});r.noPeds=c();peds.forEach(function(p){p.me.root.visible=true;});cars.forEach(function(q){q.g.visible=false;});r.noCars=c();cars.forEach(function(q){q.g.visible=true;});r.children=O.scene.children.length;return r;},state:function(){var w=W4();return {on:O.on,city:O.city,area:P.area,P:{x:+P.x.toFixed(1),z:+P.z.toFixed(1)},act:curAct&&(typeof curAct.label==='function'?curAct.label():curAct.label),drv:!!drv,carry:P.carry.slice(),trunk:w.trunk.slice(),stock:w.stock,builds:w.builds.length,land:Object.keys(w.land).length,locs:G.locs.length,cash:Math.round(G.cash),cars:cars.length,peds:peds.length,walkers:walkers.length,nav:NAV?Math.round(NAV.len):null,ride:!!RIDE,cut:!!CUT,pop:popOpen()?$('#o-pop .pp-t').textContent:null,phone:PH.open?PH.app:null,calls:renderer.info.render.calls,trucks:w.trucks.length,supers:Object.keys(w.supers).length,clock:clockStrH(clockH)};},
  act:function(a){doAct(a);},tp:function(x,z){P.x=x;P.z=z;P.auto=0;O.snap=true;},acts:function(){return (ACTS[P.area]||[]).filter(home2When).concat(homeActs(),brickActs(),synActs(),P.area==='city'?vehAct():[]).map(function(a){return {x:+a.x.toFixed(2),z:+a.z.toFixed(2),l:typeof a.label==='function'?a.label():a.label};});},key:function(k,v){keys[k]=v;},
  place:function(id){var p=placeById(id);return p?{x:p.x,z:p.z,name:p.name}:null;},places:function(){return places.map(function(p){return p.id;});},nav:function(id){navTo(placeById(id));},go:function(id){enterArea(id);},phone:function(a){openPhone(a);},
  pop:function(i){var b=document.querySelectorAll('#o-pop .pp-b')[i];if(b)b.click();return !!b;},popText:function(){return popOpen()?$('#o-pop').innerText:null;},walk:function(dx,dz,sec){joy.x=dx;joy.y=dz;setTimeout(function(){joy.x=joy.y=0;},sec*1000);},
  yaw:function(v){if(v!=null)yaw=v;return yaw;},tick:function(s){econT=s;},cab:function(id){callCab(placeById(id));},board:function(){var t=myTicket();if(t)board(t);},rain:function(on){rain.on=!!on;rain.next=999;},clock:function(h){clockH=h;clockSrc='world';},
  fly:function(c){build(c);P.area='city';var b=blockOf('civic');P.x=b.x;P.z=b.z+BD/2-1.5;O.snap=true;}};
return O;
})();
