
/* ---------- pedestrians: loop the sidewalks, wait for the walk signal, cross, window-shop ---------- */
var IN=1.7;
function rectPath(b){var x0=b.x-BW/2+IN,x1=b.x+BW/2-IN,z0=b.z-BD/2+IN,z1=b.z+BD/2-IN;return {c:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],L:[x1-x0,z1-z0,x1-x0,z1-z0],tot:2*(x1-x0)+2*(z1-z0)};}
function rectPos(b,t){var R=b.rp||(b.rp=rectPath(b));t=((t%R.tot)+R.tot)%R.tot;for(var i=0;i<4;i++){if(t<=R.L[i]){var a=R.c[i],c=R.c[(i+1)%4],k=t/R.L[i];return {x:a[0]+(c[0]-a[0])*k,z:a[1]+(c[1]-a[1])*k,seg:i};}t-=R.L[i];}return {x:R.c[0][0],z:R.c[0][1],seg:0};}
function cornerT(b,i){var R=b.rp||(b.rp=rectPath(b)),t=0;for(var k=0;k<i;k++)t+=R.L[k];return t;}
function nbBlock(b,dc,dr){for(var i=0;i<plan.blocks.length;i++){var q=plan.blocks[i];if(q.c===b.c+dc&&q.r===b.r+dr)return q;}return null;}
function newPed(near){
  var bs=plan.blocks.filter(function(b){return !near||Math.hypot(b.x-P.x,b.z-P.z)<95;});if(!bs.length)bs=plan.blocks;var b=pick(bs);
  var me=poolGet(),p={me:me,b:b,t:rnd(0,(b.rp||(b.rp=rectPath(b))).tot),dir:Math.random()<.5?-1:1,v:rnd(1.05,1.55),mode:'loop',wait:0,stop:0,x:0,z:0};
  if(Math.random()<Math.min(.4,.06+G.fame/2500))me.cup.visible=true;
  if(b.D&&b.D.win==='park'&&Math.random()<.4){p.v=rnd(2.4,3.1);p.jog=1;}
  var q=rectPos(b,p.t);p.x=q.x;p.z=q.z;p.seg=q.seg;return p;
}
function initPeds(){peds.forEach(function(p){poolPut(p.me);});peds=[];var n=lowEnd()?14:28;for(var i=0;i<n;i++)peds.push(newPed(false));}
function updPeds(dt,tl){
  var ph=phase(tl),nP=lowEnd()?14:28,want=Math.round(nP*(rain.on?.6:1)*(clockH<6||clockH>22?.35:1));
  for(var i=peds.length-1;i>=0;i--){var p=peds[i],me=p.me,mv=false;
    if(p.mode==='loop'){
      if(p.stop>0){p.stop-=dt;}
      else{var t0=p.t;p.t+=p.dir*p.v*dt;var q=rectPos(p.b,p.t);
        if(q.seg!==p.seg){ // reached a corner
          var R=p.b.rp,ci=p.dir>0?q.seg:p.seg,cx=R.c[ci][0],cz=R.c[ci][1],sx=cx>p.b.x?1:-1,sz=cz>p.b.z?1:-1;
          if(Math.random()<.35){var dc=Math.random()<.5,nb=dc?nbBlock(p.b,sx,0):nbBlock(p.b,0,sz);
            if(nb){var tc=dc?{x:cx+sx*(2*IN+2*RH),z:cz}:{x:cx,z:cz+sz*(2*IN+2*RH)};p.mode='wait';p.cx=cx;p.cz=cz;p.to=tc;p.nb=nb;p.ax=dc?'z':'x';p.x=cx;p.z=cz;}}
          p.seg=q.seg;}
        if(p.mode==='loop'){p.x=q.x;p.z=q.z;mv=true;if(!p.jog&&Math.random()<dt*.025)p.stop=rnd(1.5,4);}}
    }
    if(p.mode==='wait'){ // wait for the walk signal: cross the road while its traffic has red
      if(ph[p.ax]==='r'&&(tl%CYC)%11<7.5)p.mode='cross';}
    if(p.mode==='cross'){var dx=p.to.x-p.x,dz=p.to.z-p.z,d=Math.hypot(dx,dz),stp=p.v*1.15*dt;
      if(d<=stp){p.x=p.to.x;p.z=p.to.z;p.b=p.nb;var R2=p.b.rp||(p.b.rp=rectPath(p.b)),best=0,bd=1e9;for(var k=0;k<4;k++){var dd=Math.hypot(R2.c[k][0]-p.x,R2.c[k][1]-p.z);if(dd<bd){bd=dd;best=k;}}p.t=cornerT(p.b,best)+(p.dir>0?.01:-.01);p.seg=rectPos(p.b,p.t).seg;p.mode='loop';}
      else{p.x+=dx/d*stp;p.z+=dz/d*stp;}mv=true;}
    var ny=me.root.position;var tx=p.x-ny.x,tz=p.z-ny.z;if(mv&&(Math.abs(tx)+Math.abs(tz))>1e-4)me.root.rotation.y=Math.atan2(tx,tz);
    me.root.position.set(p.x,p.mode==='cross'?0:.2,p.z);animLite(me,dt,mv,p.v);me.umb.visible=rain.on&&!p.jog;
    if(O.on&&P.area==='city'&&Math.hypot(p.x-P.x,p.z-P.z)>90){poolPut(me);peds.splice(i,1);if(peds.length<want)peds.push(newPed(true));}
    else if(peds.length>want&&Math.random()<dt*.2){poolPut(me);peds.splice(i,1);}
  }
  while(peds.length<want&&Math.random()<.2)peds.push(newPed(O.on));
}

/* ---------- customers: the people walking into your shop are the ones who show up at the counter ---------- */
function shopVOf(loc){for(var i=0;i<shopV.length;i++)if(shopV[i].loc===loc&&!shopV[i].rival)return shopV[i];return null;}
function walker(path,o){o=o||{};var me=poolGet();me.cup.visible=!!o.cup;me.umb.visible=rain.on&&!o.noUmb;var w={me:me,path:path.slice(1),x:path[0].x,z:path[0].z,v:o.v||rnd(1.2,1.6),end:o.end,shop:o.shop,fade:o.fade};
  me.root.position.set(w.x,.2,w.z);walkers.push(w);return w;}
function spawnIn(v,far){if(!v||!dyn)return;var side=Math.random()<.5?-1:1,lot=v.lot,dx=v.super?0:DOORX;
  var start=far?L2W(lot,dx+side*rnd(7,12),rnd(1.4,2.6)):L2W(lot,dx+side*rnd(1.6,2.6),1.6);
  walker([start,L2W(lot,dx,1.3),v.door],{shop:v,end:'in'});}
function spawnOut(v,happy){if(!v||!dyn)return;var side=Math.random()<.5?-1:1,lot=v.lot,dx=v.super?0:DOORX;
  walker([v.door,L2W(lot,dx,1.3),L2W(lot,dx+side*rnd(9,14),rnd(1.4,2.6))],{shop:v,end:'fade',cup:happy!==false&&!v.rival});swing(v);}
function swing(v){v.doorT=1.2;if(O.on&&P.area==='city'&&Math.hypot(v.door.x-P.x,v.door.z-P.z)<14){try{tone(1318,.25,'sine',.02);tone(1760,.3,'sine',.015,.08);}catch(e){}}}
O.custIn=function(loc){if(!O.scene||loc.city!==O.city)return;spawnIn(shopVOf(loc),O.on&&P.area==='city');};
O.custOut=function(loc,c){if(!O.scene||loc.city!==O.city)return;var happy=c&&c.v&&c.v.mood!=='angry';spawnOut(shopVOf(loc),happy);};
function updWalkers(dt){
  for(var i=walkers.length-1;i>=0;i--){var w=walkers[i],me=w.me;
    if(w.fadeT!=null){w.fadeT-=dt;me.root.scale.setScalar(Math.max(.01,w.fadeT/.5));if(w.fadeT<=0){poolPut(me);walkers.splice(i,1);}continue;}
    if(w.wait>0){w.wait-=dt;animLite(me,dt,false);continue;}
    if(!w.path.length){if(w.end==='in'){if(w.shop)swing(w.shop);poolPut(me);walkers.splice(i,1);}else if(w.end==='queue'){animLite(me,dt,false);}else{w.fadeT=.5;}continue;}
    var tg=w.path[0],dx=tg.x-w.x,dz=tg.z-w.z,d=Math.hypot(dx,dz),stp=w.v*dt;
    if(d<=stp){w.x=tg.x;w.z=tg.z;w.path.shift();}else{w.x+=dx/d*stp;w.z+=dz/d*stp;me.root.rotation.y=Math.atan2(dx,dz);}
    me.root.position.set(w.x,.2,w.z);animLite(me,dt,true,w.v);
  }
}
/* the street side of every shop follows what is happening inside */
function updShops(dt){
  shopV.forEach(function(v){
    if(v.piv){v.doorT=Math.max(0,(v.doorT||0)-dt);var ta=v.doorT>0?-1.25:0;v.doorA+=(ta-v.doorA)*Math.min(1,dt*7);v.piv.rotation.y=v.doorA;}
    if(v.rival){var cs=v.loc.comp?v.loc.comp.S:0;v.q.forEach(function(p,i){p.root.visible=cs>12+i*12;animLite(p,dt,false);});
      v.flow+=dt*Math.min(6,cs/12)/60;if(v.flow>=1&&O.on){v.flow=0;if(Math.random()<.5)spawnIn(v,true);else spawnOut(v,true);}return;}
    if(v.super){v.flow+=dt*Math.min(10,superIncome()/40)/60;if(v.flow>=1){v.flow=0;if(Math.random()<.5)spawnIn(v,true);else spawnOut(v,true);}return;}
    var loc=v.loc,open=shopOpen(loc),act=SH&&SH.loc===loc&&SH.phase!=='done';
    if(open!==v.open){var first=v.open===null;v.open=open;v.flipTo=open?0:Math.PI;if(first)v.flip.rotation.y=v.flipTo;else if(O.on&&loc===curLoc()&&!open&&act&&SH.phase==='open'&&!hasMgr(loc))note(loc.name+' is closed','No manager on duty, so the sign flipped to CLOSED while you\'re out. Hire a manager to keep it running.','bad',{label:'Hire a manager',fn:function(){openShop(G.locs.indexOf(loc),'staff');}});}
    if(v.flipTo!=null)v.flip.rotation.y+=(v.flipTo-v.flip.rotation.y)*Math.min(1,dt*6);
    var waiting=act?SH.cust.filter(function(c){return c.state==='wait'||c.state==='in';}).length:open?Math.min(3,Math.round(locEcon(loc).util*2)):0;
    v.q.forEach(function(p,i){p.root.visible=i<waiting;animLite(p,dt,false);});
    var stN=open||act?Math.min(2,(loc.staff.barista||0)+(loc.staff.server||0)+(act&&!O.on?1:0)):0;
    v.staff.forEach(function(s,i){s.root.visible=i<stN;s.root.position.x=.2+i*1.6+Math.sin(now()/900+i*2)*.5;animLite(s,dt,false);});
    // shops you are not working: their regulars come and go on their own
    if(!act&&open){var e=locEcon(loc);v.flow+=dt*Math.min(8,e.items/1.5)/60;if(v.flow>=1){v.flow=0;spawnIn(v,O.on);var vv=v;setTimeout(function(){if(shopV.indexOf(vv)>=0)spawnOut(vv,true);},rnd(6000,14000));}}
    // people try the door of a closed shop and walk off
    if(!open&&O.on&&Math.random()<dt*.04){var side=Math.random()<.5?-1:1,w=walker([L2W(v.lot,DOORX+side*8,1.8),L2W(v.lot,DOORX,1.1)],{end:'fade'});w.path.push(L2W(v.lot,DOORX-side*9,1.9));w.wait=0;w.peek=v;}
  });
  walkers.forEach(function(w){if(w.peek&&w.path.length===1&&!w.said){w.said=1;w.wait=1.2;bubble(w.x,2.4,w.z,pick(['Closed?','Aw, closed.','Huh, no one\'s here.']),'');}});
}

/* ---------- speech bubbles and floating labels ---------- */
function bubble(x,y,z,text,kind){var el=document.createElement('div');el.className='ob '+(kind||'');el.textContent=text;$('#o-lbls').appendChild(el);LBL.push({el:el,p:V3(x,y,z),t:2.2});}
function updLabels(dt){var cam=O.cam;LBL=LBL.filter(function(l){l.t-=dt;if(l.t<=0){l.el.remove();return false;}var q=l.p.clone().project(cam);if(q.z>1||Math.abs(q.x)>1.1||Math.abs(q.y)>1.1){l.el.style.display='none';return true;}
  l.el.style.display='';l.el.style.transform='translate('+((q.x*.5+.5)*W)+'px,'+((-q.y*.5+.5)*H)+'px) translate(-50%,-100%)';l.el.style.opacity=Math.min(1,l.t*2);return true;});}

/* ---------- weather, time of day ---------- */
var rainG=null;
function initRain(){var n=lowEnd()?250:600,pos=new Float32Array(n*6);for(var i=0;i<n;i++){var x=rnd(-25,25),y=rnd(0,18),z=rnd(-25,25);pos.set([x,y,z,x+.05,y-.6,z],i*6);}
  var gm=new T.BufferGeometry();gm.setAttribute('position',new T.BufferAttribute(pos,3));rainG=new T.LineSegments(gm,MAT.rain);rainG.frustumCulled=false;rainG.visible=false;O.scene.add(rainG);}
function updWeather(dt){
  rain.next-=dt;if(rain.next<=0){rain.on=!rain.on;rain.next=rain.on?rnd(70,150):rnd(260,520);if(rain.on&&O.on&&P.area==='city')note('Rain','Grab an umbrella. Fewer people out walking, more ducking into cafés.','info');}
  rain.k+=((rain.on?1:0)-rain.k)*Math.min(1,dt*.5);
  if(rainG){rainG.visible=rain.k>.05&&P.area==='city';if(rainG.visible){var a=rainG.geometry.attributes.position,arr=a.array;rainG.position.set(O.cam.position.x,0,O.cam.position.z);
    for(var i=0;i<arr.length;i+=6){arr[i+1]-=dt*22;arr[i+4]-=dt*22;if(arr[i+4]<0){var y=rnd(14,18);arr[i+1]=y;arr[i+4]=y-.6;}}a.needsUpdate=true;MAT.rain.opacity=.45*rain.k;}}
}
var SKY={day:new T.Color(0x8fd0f4),dusk:new T.Color(0xf6b98a),night:new T.Color(0x1c2350),rain:new T.Color(0x9aa6b4)},_c=new T.Color(),lastLit=-1;
function updDaylight(){
  if(!lights.hemi)return;var h=clockH,day=h>=6.5&&h<18.5?1:h>=5.5&&h<6.5?h-5.5:h>=18.5&&h<19.5?19.5-h:0,dusk=Math.max(0,1-Math.abs(h-18.7)/1.3);
  if(P.area!=='city'){O.scene.background=AREAS[P.area].bgC;O.scene.fog.color.copy(AREAS[P.area].bgC);O.scene.fog.near=60;O.scene.fog.far=200;lights.hemi.intensity=.75;lights.sun.intensity=.45;return;}
  _c.copy(SKY.night).lerp(SKY.day,day).lerp(SKY.dusk,dusk*.55).lerp(SKY.rain,rain.k*.6*day);O.scene.background=_c.clone();O.scene.fog.color.copy(_c);O.scene.fog.near=50;O.scene.fog.far=lowEnd()?140:190;
  lights.hemi.intensity=.32+.36*day-rain.k*.08;lights.sun.intensity=.12+.58*day*(1-rain.k*.5);lights.sun.color.setHex(dusk>.3?0xffc89a:0xffffff);
  var lit=day<.5?1:0;MAT.lamp.emissiveIntensity=lit?1.1:.12;MAT.head.color.setHex(lit?0xfff2b0:0xe8e8e0);MAT.glow.opacity=lit?.6:.3;
  if(lit!==lastLit){lastLit=lit;winMats.forEach(function(w){w.m.map=lit?w.night:w.day;w.m.needsUpdate=true;});}
}
function updClock(dt){
  if(SH&&SH.phase!=='done'){clockH=7+12*clamp(SH.t/SH.len,0,1);clockSrc='shift';}
  else{if(clockSrc==='shift'){clockSrc='world';}clockH+=dt*(12/150);if(clockH>=24)clockH-=24;}
}
O.clock=function(){return clockStrH(clockH);};

/* ---------- small animations (flags, fountains, ducks, swings, buskers) ---------- */
function updAnim(dt,tl){
  anim.forEach(function(a){
    if(a.flag){a.flag.rotation.y=Math.sin(tl*2.2+a.flag.id)*.25;a.flag.scale.x=1+Math.sin(tl*3.1)*.04;}
    else if(a.jet){a.jet.scale.y=1+Math.sin(tl*6+a.ph)*.15;}
    else if(a.fount){a.fount.scale.y=1+Math.sin(tl*5)*.2;}
    else if(a.duck){var t=tl*.25+a.ph;a.duck.position.set(a.cx+Math.cos(t)*3,.2+Math.sin(tl*3+a.ph)*.03,a.cz+Math.sin(t*1.3)*1.6);a.duck.rotation.y=Math.atan2(-Math.sin(t)*3,Math.cos(t*1.3)*2);}
    else if(a.swing){a.swing.rotation.x=Math.sin(tl*1.8)*.5;}
    else if(a.spin){a.spin.rotation.y+=dt*4;}
    else if(a.fork){a.t+=dt*.25;var k=(Math.sin(a.t)+1)/2;a.fork.position.x=a.x0+(a.x1-a.x0)*k;a.fork.rotation.y=Math.cos(a.t)>0?Math.PI/2:-Math.PI/2;}
    else if(a.slide){var d=Math.hypot(P.x-a.x,P.z-a.z),o=d<5&&P.area==='city'?.9:0;a.o=(a.o||0)+(o-(a.o||0))*Math.min(1,dt*6);a.slide[0].position.z=a.z-.8-a.o*1.5;a.slide[1].position.z=a.z+.8+a.o*1.5;}
    else if(a.me){if(a.strum){a.me.arms[1].rotation.x=-1+Math.sin(tl*12)*.25;a.me.arms[0].rotation.x=-1.1;}animLite(a.me,dt,false);}
  });
  planes.forEach(function(p){p.t+=dt;var c=p.t%60,x=plan.AX+80,z,y=0,h=Math.PI;
    if(c<14){z=plan.AZ+250-c*c*1.6;y=c>9?(c-9)*(c-9)*.9:0;}else if(c<30){z=plan.AZ+250-14*14*1.6-(c-14)*70;y=22+(c-14)*8;}
    else if(c<46){var k=(c-30)/16;z=plan.AZ-900+k*700;y=140*(1-k)+3*k;h=0;x+=0;}else{var k2=(c-46)/14;z=plan.AZ-200+k2*300;y=Math.max(0,3-k2*20);h=0;}
    p.g.position.set(x,y,z);p.g.rotation.y=h;p.g.rotation.x=c<30&&c>9?-.12:c>30&&c<46?.04:0;p.g.visible=z>plan.AZ-700||c<30;});
}
