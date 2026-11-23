
/* ---------- Crema Metro, the place: a skyline, a second airport, an elevated train around the city, and a subway under it ---------- */
var RAIL=null,TRAIN=null,SUBS=[],SUBRIDE=null;
function metroBuild(){RAIL=null;SUBS=[];if(!isMP())return;var p=plan;metroSkyline();metroAirfield();metroRail();metroSubway();
  if(!W4().f.mpHello){W4().f.mpHello=1;setTimeout(function(){if(isMP()&&O.on)popup('Welcome to Crema Metro','This is the shared city. Everyone who flies here is in the same world.\n• You\'ll see other players walking and driving around. Walk up to one to talk.\n• Whatever you buy here is yours for everyone: other players can\'t buy it unless you sell it to them.\n• Set prices at your places. When players shop there, the money comes to you.\n• Whoever owns the airport sets a fee everyone else pays to fly.\n• City Hall has one ballot for the whole city.\n• Ride the Metro Rail (elevated, around the city) or the subway (stairs marked M).\n• Every other city is still yours alone.',[{t:'Let\'s go'}],'',{who:'Crema Metro',role:'Welcome',col:'#7a5ad8'});},2500);save();}}
/* a real skyline around the edges: towers you can see from anywhere */
function metroSkyline(){var p=plan,g=new T.Group(),r=seeded(2027),x0=p.xs[0]-RH-30,x1=p.xs[p.C]+RH+18,z0=p.zs[0]-RH-30,z1=p.zs[p.R]+RH+30;var cols=[0x9fb4c8,0xb8c4d0,0x8aa0b8,0xc8d0d8,0x6a7a90,0xd8c8b0];
  function tower(x,z,w,d,h){var c=cols[Math.floor(r()*cols.length)],m=toon(c);bx(w,h,d,m,x,h/2,z,g);var wm=toon(0x2a3a4a,{e:0x3a4a5a,ei:.15});for(var y=3;y<h-2;y+=3.2)bx(w+.05,.9,d+.05,wm,x,y,z,g);if(r()<.4){bx(w*.6,h*.12,d*.6,m,x,h+h*.06,z,g);cyB(.15,6,toon(0xc8ccd2),x,h+h*.12,z,g,5);}}
  for(var x=x0;x<x1;x+=14+r()*10){tower(x,z0-r()*20,8+r()*8,8+r()*8,30+r()*70);tower(x,z1+r()*20,8+r()*8,8+r()*8,25+r()*55);}
  for(var z=z0;z<z1;z+=14+r()*10){tower(x0-10-r()*20,z,8+r()*8,8+r()*8,25+r()*60);}
  stat.add(mergeGroup(g));}
/* Metro West Airfield: a second airport on the west side */
function metroAirfield(){var p=plan,ax=p.xs[0]-RH-75,az=(p.zs[0]+p.zs[p.R])/2,g=new T.Group();
  var rw=plane(26,200,toon(0x3a3f4b),ax-20,.05,az,g);rw.rotation.x=-Math.PI/2;for(var i=-90;i<90;i+=12){var st=plane(.8,6,toon(0xffffff),ax-20,.07,az+i,g);st.rotation.x=-Math.PI/2;}var ap=plane(30,60,toon(0x5a5f6a),ax+8,.06,az,g);ap.rotation.x=-Math.PI/2;
  rb(14,7,24,.2,glass(0x9fd2f2,.5),ax+18,3.5,az,g);bx(15,.6,25,toon(0xe8ecef),ax+18,7.3,az,g);bx(4,14,4,toon(0xe8ecef),ax+18,7,az-16,g);rb(5,3,5,.2,glass(0x9fd2f2,.6),ax+18,15.5,az-16,g);
  wallSign(g,'METRO WEST AIRFIELD',ax+25.1,6,az,{bg:'#2f8fd0',fg:'#fff',w:10,h:1.2,ry:Math.PI/2});for(var j=0;j<2;j++){var pl=planeModel();if(pl){pl.position.set(ax+2,0,az-10+j*20);pl.rotation.y=Math.PI/2;g.add(pl);}}
  var road=plane(ax+60-(p.xs[0]-RH),10,toon(0x4a4f58),(ax+25+p.xs[0]-RH)/2,.04,az,g);road.rotation.x=-Math.PI/2;
  stat.add(mergeGroup(g));addCol(ax+11,ax+25,az-12,az+12);
  ACTS.city.push({x:ax+26,z:az,r:3,label:'Metro West Airfield',sub:function(){var l=MP.lots['airport:'+MPC];return 'Flights out of Crema Metro'+(l&&l.o!==MP.uid?' · airport fee to '+l.on:'');},fn:function(){flightsDesk(false);}});
  places.push({id:'airfield',name:'Metro West Airfield',kind:'civic',x:ax+26,z:az});}
/* the Metro Rail: an elevated loop around the whole city with four stations */
function metroRail(){var p=plan,x0=p.xs[0]-RH-9,x1=p.xs[p.C]+RH+9,z0=p.zs[0]-RH-9,z1=p.zs[p.R]+RH+9,Y=7,g=new T.Group();
  var pts=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]],L=0,seg=[];for(var i=0;i<4;i++){var a=pts[i],b=pts[(i+1)%4],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push({a:a,b:b,l:l,s0:L});L+=l;
    var mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,along=Math.abs(b[0]-a[0])>1;bx(along?l+2:2.4,.6,along?2.4:l+2,toon(0x9aa3ad),mx,Y,mz,g);[-.7,.7].forEach(function(o){bx(along?l+2:.1,.12,along?.1:l+2,toon(0x5a5f6a),along?mx:mx+o,Y+.36,along?mz+o:mz,g);});
    for(var t=0;t<l;t+=16){var px=a[0]+(b[0]-a[0])*t/l,pz=a[1]+(b[1]-a[1])*t/l;cyB(.45,Y,toon(0xb8c0ca),px,0,pz,g,8);addCol(px-.5,px+.5,pz-.5,pz+.5);}}
  var names=['North Station','Harbor Station','South Station','Airport Station'],st=[];
  for(var k=0;k<4;k++){var s=seg[k],sx=(s.a[0]+s.b[0])/2,sz=(s.a[1]+s.b[1])/2,along=Math.abs(s.b[0]-s.a[0])>1,ox2=along?0:(k===1?-3.4:3.4),oz2=along?(k===0?3.4:-3.4):0;
    bx(along?16:3,.4,along?3:16,toon(0xe8ecef),sx+ox2,Y-.1,sz+oz2,g);bx(along?16:.2,2.6,along?.2:16,glass(0x9fd2f2,.4),sx+ox2*1.45,Y+1.4,sz+oz2*1.45,g);bx(along?16:3.6,.2,along?3.6:16,toon(0x7a5ad8),sx+ox2,Y+3,sz+oz2,g);
    for(var q=0;q<10;q++)bx(along?2:.9,.25,along?.9:2,toon(0xc8ccd2),sx+ox2*2+(along?-6:0)+(along?0:0),q*.7,sz+oz2*2+(along?0:-6)+q*(along?0:0),g);
    var gx=sx+ox2*2.2,gz=sz+oz2*2.2;wallSign(g,'M · '+names[k].toUpperCase(),gx,3.2,gz,{bg:'#7a5ad8',fg:'#fff',w:4.6,h:.8,ry:along?(k===0?0:Math.PI):(k===1?-Math.PI/2:Math.PI/2)});st.push({n:names[k],s:s.s0+s.l/2,x:gx,z:gz});}
  stat.add(mergeGroup(g));
  var tg=new T.Group();dyn.add(tg);var cars=[];for(var c=0;c<3;c++){var car=new T.Group();tg.add(car);rb(2.6,2.4,7,.4,toon(0xf4f4f4),0,1.4,0,car);bx(2.62,.6,6.6,toon(0x7a5ad8),0,.7,0,car);bx(2.64,.7,6,glass(0x2a3a5a,.75),0,1.9,0,car);cars.push(car);}
  RAIL={seg:seg,L:L,Y:Y,st:st,train:cars,s:Math.random()*L};
  st.forEach(function(S){ACTS.city.push({x:S.x,z:S.z,r:3,label:'Metro Rail · '+S.n,sub:'Elevated train around the city · $3',fn:function(){railMenu(S);}});places.push({id:'rail:'+S.n,name:'Metro Rail · '+S.n,kind:'civic',x:S.x,z:S.z});});}
function railAt(s){var R=RAIL;s=((s%R.L)+R.L)%R.L;for(var i=0;i<R.seg.length;i++){var g=R.seg[i];if(s<=g.s0+g.l){var t=(s-g.s0)/g.l;return {x:g.a[0]+(g.b[0]-g.a[0])*t,z:g.a[1]+(g.b[1]-g.a[1])*t,h:Math.atan2(g.b[0]-g.a[0],g.b[1]-g.a[1])};}}return {x:R.seg[0].a[0],z:R.seg[0].a[1],h:0};}
function updRail(dt){if(!RAIL||!isMP()||P.area!=='city')return;var R=RAIL;if(TRAIN){TRAIN.t+=dt;var k=Math.min(1,TRAIN.t/TRAIN.dur),e=k*k*(3-2*k);R.s=TRAIN.s0+(TRAIN.s1-TRAIN.s0)*e;if(k>=1){var to=TRAIN.to;TRAIN=null;fade(function(){P.x=to.x;P.z=to.z+1;P.me.root.visible=true;O.snap=true;},function(){note('Arrived',to.n,'good');});}}else R.s+=dt*9;
  R.train.forEach(function(c,i){var p=railAt(R.s-i*7.4);c.position.set(p.x,R.Y+.4,p.z);c.rotation.y=p.h;});}
function railMenu(S){popup('Metro Rail','"Next train in about a minute. Where to?"',RAIL.st.filter(function(q){return q!==S;}).map(function(q){return {t:q.n,s:'$3',fn:function(){if(!pay(3,'The fare'))return;rideRail(S,q);}};}).concat([{t:'Not now',cls:'sec'}]),'',{who:'Metro Rail',col:'#7a5ad8'});}
function rideRail(a,b){var s1=b.s;while(s1<a.s)s1+=RAIL.L;if(s1-a.s>RAIL.L*.75){}fade(function(){P.me.root.visible=false;RAIL.s=a.s;TRAIN={s0:a.s,s1:s1,t:0,dur:Math.max(6,(s1-a.s)/30),to:b};});}
function railCam(dt){if(!TRAIN||!RAIL)return false;var p=railAt(RAIL.s),bk=railAt(RAIL.s-34),cp=V3(bk.x+Math.cos(p.h)*12,RAIL.Y+13,bk.z-Math.sin(p.h)*12),ct=V3(p.x,RAIL.Y+1,p.z);O.cam.position.lerp(cp,Math.min(1,dt*3));camL.lerp(ct,Math.min(1,dt*4));O.cam.lookAt(camL);P.x=p.x;P.z=p.z;return true;}
/* the subway: stairs down at four corners, a real platform, a train that pulls in */
function metroSubway(){var p=plan,spots=[[1,1],[p.C-1,1],[1,p.R-1],[p.C-1,p.R-1],[Math.floor(p.C/2),Math.floor(p.R/2)]],nm=['Uptown','East Side','Old Town','Waterfront','Metro Center'];var g=new T.Group();
  spots.forEach(function(s,i){var x=p.xs[s[0]]+RH+2.2,z=p.zs[s[1]]+RH+2.2;bx(2.4,.9,.15,toon(0x3a3f4b),x,.6,z-1.6,g);bx(.15,.9,3.2,toon(0x3a3f4b),x-1.2,.6,z,g);bx(.15,.9,3.2,toon(0x3a3f4b),x+1.2,.6,z,g);var hole=plane(2.2,3,toon(0x111111),x,.24,z,g);hole.rotation.x=-Math.PI/2;
    cyB(.06,3,toon(0x3a3f4b),x-1.6,0,z-1.6,g,6);var sg=new T.Group();sg.position.set(x-1.6,3.2,z-1.6);g.add(sg);sp(.45,toon(0x2fa860),0,0,0,sg,12);plane(.7,.7,flat(0xffffff,{map:signT('M',{bg:'#2fa860',fg:'#fff',w:128,h:128})}),0,0,.46,sg);
    SUBS.push({n:nm[i]+' station',x:x,z:z});addCol(x-1.3,x+1.3,z-1.7,z+1.7);});stat.add(mergeGroup(g));
  SUBS.forEach(function(S){ACTS.city.push({x:S.x,z:S.z+2.4,r:2.2,label:'Subway · '+S.n,sub:'Down the stairs · $2',fn:function(){subMenu(S);}});places.push({id:'sub:'+S.n,name:'Subway · '+S.n,kind:'civic',x:S.x,z:S.z+2.4});});}
function subMenu(S){popup('Metro Subway','A rumble under your feet. Where to?',SUBS.filter(function(q){return q!==S;}).map(function(q){return {t:q.n,s:'$2',fn:function(){if(!pay(2,'The fare'))return;rideSub(S,q);}};}).concat([{t:'Stay up here',cls:'sec'}]),'',{who:'Metro Subway',col:'#2fa860'});}
function subwayRoom(){var g=room('subway',{name:'Metro Subway',w:30,d:10,floor:floorT(0xd8d2c6,0xc8c2b6,3),wall:0xe8f0ea,trim:0x2fa860,bg:0x0a0c0a,h:4.2,cam:{dist:7,pitch:.4}}),ox=IOX.subway;
  var pit=plane(30,3.4,toon(0x2a2a2a),0,-.3,-3.2,g);pit.rotation.x=-Math.PI/2;bx(30,.12,.3,toon(0xffd24a),0,.06,-1.4,g);[-3.8,-2.6].forEach(function(z){bx(30,.08,.1,toon(0x8a8f96),0,-.25,z,g);});
  for(var t=0;t<6;t++){wallSign(g,'METRO',-12+t*5,2.6,-4.85,{bg:'#2fa860',fg:'#fff',w:2,h:.5});}for(var b=0;b<4;b++)bx(2,.12,.5,toon(0x8a5a3a),-9+b*6,.5,3,g);
  var tr=new T.Group();tr.position.set(ox-60,0,-3.2);dyn.add(tr);for(var c=0;c<4;c++){rb(7.6,2.8,2.8,.3,toon(0xe8ecef),-c*7.8,1.1,0,tr);bx(7.62,.5,2.82,toon(0x2fa860),-c*7.8,.4,0,tr);bx(6.8,.8,2.84,glass(0x2a3a4a,.7),-c*7.8,1.5,0,tr);}
  ACTS.subway[0].label='Back up the stairs';SUBRIDE={tr:tr,x0:ox-60};}
function rideSub(a,b){fade(function(){P.area='subway';var A=AREAS.subway;P.x=A.ox+rnd(-6,6);P.z=0;P.ry=Math.PI;O.snap=true;updDaylight();SUBRIDE.go={t:0,to:b};SUBRIDE.tr.position.x=SUBRIDE.x0;try{tone(80,1.5,'sawtooth',.03);}catch(e){}});}
function updSub(dt){var S=SUBRIDE;if(!S||!S.go||P.area!=='subway')return;S.go.t+=dt;var t=S.go.t,ox=IOX.subway;S.tr.position.x=t<3?S.x0+(ox+14-S.x0)*Math.min(1,t/3)*(2-Math.min(1,t/3)):t<5?ox+14:ox+14+(t-5)*(t-5)*6;
  if(t>3.4&&!S.go.board){S.go.board=1;bubble(P.x,2.5,P.z,'Doors opening','');}if(t>5.6&&!S.go.done){S.go.done=1;var to=S.go.to;fade(function(){P.area='city';P.x=to.x;P.z=to.z+2.6;O.snap=true;updDaylight();S.go=null;},function(){note('Arrived',to.n,'good');});}}
