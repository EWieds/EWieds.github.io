
/* ---------- the rules of the road: speed limits, red lights, speed cameras, traffic stops, tickets and license points ---------- */
var LIMIT=13,MPH=1.9,TSTOP=null,LAWT={spd:0,cool:0,lastInt:null,flash:0},SPDCAM=[];
function lic(){var w=W4();w.lic=w.lic||{pts:0,tickets:0,susp:0,clean:now()};return w.lic;}
function mph(v){return Math.round(Math.abs(v)*MPH);}
function suspended(){return lic().susp>now();}
function initLaw(){SPDCAM=[];var p=plan,k=0;for(var i=1;i<p.xs.length-1&&k<3;i++)for(var j=1;j<p.zs.length-1&&k<3;j++){if((i*7+j*3+p.city)%5!==1)continue;var x=p.xs[i]+RH+3.2,z=(p.zs[j]+p.zs[j+1>=p.zs.length?j:j+1])/2;if(!(z>p.zs[j]+8))z=p.zs[j]+14;
    var g=new T.Group();g.position.set(x,0,z);dyn.add(g);cyB(.07,3,toon(0x3a3f4b),0,0,0,g,6);rb(.5,.45,.6,.05,toon(0xe8ecef),0,3.1,0,g);var lens=sp(.12,toon(0x111111),-.27,3.1,0,g,8);plane(.9,.3,flat(0xffffff,{map:signT('SPEED CAMERA',{bg:'#ffd24a',fg:'#111',w:256,h:84})}),0,2.4,.08,g);
    SPDCAM.push({x:p.xs[i],z:z,g:g,cool:0});k++;}
  for(var q=0;q<2;q++){spawnCar('police',false);}var cps=cars.filter(function(c){return c.kind==='police';});cps.forEach(function(c){if(c.bar)return;var bar=new T.Group();bar.position.set(0,1.62,0);c.g.add(bar);c.bar=[bx(.42,.16,.32,new T.MeshBasicMaterial({color:0x661111}),-.3,0,0,bar),bx(.42,.16,.32,new T.MeshBasicMaterial({color:0x112266}),.3,0,0,bar)];});}
function sirenOn(c,on){if(!c||!c.bar)return;c.siren=on;if(!on){c.bar[0].material.color.setHex(0x661111);c.bar[1].material.color.setHex(0x112266);}}
function intAt(x,z){var p=plan;for(var i=0;i<p.xs.length;i++){if(Math.abs(x-p.xs[i])>RH)continue;for(var j=0;j<p.zs.length;j++)if(Math.abs(z-p.zs[j])<RH)return {i:i,j:j,x:p.xs[i],z:p.zs[j]};}return null;}
function lawTick(dt,tl){LAWT.tl=tl;if(!O.on||P.area!=='city')return;LAWT.cool-=dt;
  cars.forEach(function(c){if(c.siren){var on=Math.floor(tl*6)%2===0;c.bar[0].material.color.setHex(on?0xff2a2a:0x661111);c.bar[1].material.color.setHex(on?0x112266:0x2a6aff);}});
  var hud=$('#o-spd');if(!drv){if(hud)hud.hidden=true;LAWT.lastInt=null;if(TSTOP)stopOnFoot();return;}
  var v=drv.v,g=v.g,sp=Math.abs(drv.speed),h=g.rotation.y,ax=Math.abs(Math.sin(h))>Math.abs(Math.cos(h))?'x':'z';
  if(!hud){hud=document.createElement('div');hud.id='o-spd';document.body.appendChild(hud);}hud.hidden=false;var over=sp>LIMIT+1;hud.className=over?'over':'';hud.innerHTML='<b>'+mph(sp)+'</b><small>mph</small><i>'+mph(LIMIT)+'</i>'+(lic().pts?'<em>'+lic().pts+' pts</em>':'');
  if(drv.auto){var gx=g.position.x,gz=g.position.z,fx=Math.sin(h),fz=Math.cos(h),ti=intAt(gx,gz);if(drv.speed>LIMIT)drv.speed=LIMIT;for(var dd=2;dd<10;dd+=1){var ai=intAt(gx+fx*dd,gz+fz*dd);if(ai&&!ti&&phase(tl)[ax]!=='g'){drv.speed=Math.min(drv.speed,Math.max(0,(dd-2.5)*1.4));break;}}return;}
  if(TSTOP){stopTick(dt);return;}
  if(drv.v&&drv.v.ticketed){drv.v.ticketed=0;}
  // speeding: sustained, and only if someone sees it
  if(sp>LIMIT*1.18){LAWT.spd+=dt;}else LAWT.spd=Math.max(0,LAWT.spd-dt*2);
  SPDCAM.forEach(function(s){s.cool-=dt;if(s.cool<=0&&sp>LIMIT*1.25&&Math.hypot(g.position.x-s.x,g.position.z-s.z)<7){s.cool=20;camFlash();mailTicket('Speeding (camera)',mph(sp),Math.round((120+(mph(sp)-mph(LIMIT))*12)*tierM()),2);}});
  if(suspended()&&LAWT.cool<=0){var cs=copSees(g.position);if(cs){LAWT.cool=25;startStop(cs,'Driving on a suspended license',mph(sp));return;}}
  if(LAWT.spd>1.4&&LAWT.cool<=0){var cop=copSees(g.position);if(cop){LAWT.cool=25;startStop(cop,'Speeding',mph(sp));}}
  // red lights: entering the box on red
  var it=intAt(g.position.x,g.position.z),ph=phase(tl);if(it&&(!LAWT.lastInt||LAWT.lastInt.i!==it.i||LAWT.lastInt.j!==it.j)){LAWT.lastInt=it;if(ph[ax]==='r'&&sp>3&&LAWT.cool<=0){var cop2=copSees(g.position);bubble(g.position.x,3,g.position.z,'Red light!','bad');if(cop2){LAWT.cool=25;startStop(cop2,'Ran a red light',mph(sp));}else if(Math.random()<.25){LAWT.cool=10;camFlash();mailTicket('Ran a red light (camera)',0,Math.round(250*tierM()),3);}}}else if(!it)LAWT.lastInt=null;}
function copSees(p){return cars.filter(function(c){return c.kind==='police'&&!c.siren&&Math.hypot(c.x-p.x,c.z-p.z)<34;})[0]||null;}
function camFlash(){var f=$('#o-flash');if(!f){f=document.createElement('div');f.id='o-flash';document.body.appendChild(f);}f.classList.remove('go');void f.offsetWidth;f.classList.add('go');try{tone(2400,.05,'square',.04);}catch(e){}}
function mailTicket(why,m,fine,pts){var L=lic();L.pts+=pts;L.tickets++;citySpend(fine);note('Ticket in the mail: '+why,(m?m+' mph in a '+mph(LIMIT)+' zone. ':'')+fmt(fine)+' paid automatically · +'+pts+' points ('+L.pts+'/12).','bad');ptsCheck();save();}
function ptsCheck(){var L=lic();if(L.pts>=12&&!suspended()){L.susp=now()+600000;L.pts=6;note('License suspended','12 points. You can\'t legally drive for 10 minutes. Traffic school at the police station takes points off.','bad');}}
/* the stop */
function startStop(cop,why,m){var w=W4();TSTOP={cop:cop,why:why,m:m,t:0,stopT:0,fleeT:0,phase:'chase'};cop.chase=1;sirenOn(cop,true);note('Lights behind you','A patrol car wants you to pull over ('+why.toLowerCase()+'). Stop the car.','bad');}
function stopTick(dt){var S=TSTOP,c=S.cop,g=drv.v.g;S.t+=dt;var tx=g.position.x-Math.sin(g.rotation.y)*7,tz=g.position.z-Math.cos(g.rotation.y)*7,dx=tx-c.x,dz=tz-c.z,d=Math.hypot(dx,dz),want=Math.min(24,d*1.6);
  c.x+=dx/(d||1)*Math.min(d,want*dt);c.z+=dz/(d||1)*Math.min(d,want*dt);if(d>.3)c.h=Math.atan2(dx,dz);c.g.position.set(c.x,0,c.z);c.g.rotation.y=c.h;
  S.sir=(S.sir||0)-dt;if(S.sir<=0){S.sir=.45;var vol=Math.max(.005,.05*(1-Math.hypot(c.x-P.x,c.z-P.z)/60));try{tone(S.hi?960:720,.4,'sine',vol);}catch(e){}S.hi=!S.hi;}
  var dist=Math.hypot(c.x-g.position.x,c.z-g.position.z);
  if(Math.abs(drv.speed)<1.2&&dist<12){S.stopT+=dt;if(S.stopT>1.2)officerWalk();}else S.stopT=0;
  if(dist>45){S.fleeT+=dt;if(S.fleeT>12){escaped();}}else S.fleeT=Math.max(0,S.fleeT-dt*.5);
  if(S.phase==='talk'){if(!popOpen()){if(!S.idle)S.idle=now();if(now()-S.idle>1500&&S.take){S.take();return;}}else S.idle=0;return;}
  if(S.t>45&&dist<45&&Math.abs(drv.speed)>4){arrestChase();}}
/* you got out of the car mid-stop: the officer writes it up and mails it, no drama */
function stopOnFoot(){var S=TSTOP;if(S.take){S.take();return;}var pts=S.why==='Speeding'?2:3,fine=Math.round((S.why==='Speeding'?120+Math.max(0,(S.m||0)-mph(LIMIT))*12:250)*tierM());endStop();mailTicket(S.why,S.why==='Speeding'?S.m:0,fine,pts);}
function endStop(){if(!TSTOP)return;var c=TSTOP.cop;TSTOP=null;var i=cars.indexOf(c);if(i>=0){cars.splice(i,1);dyn.remove(c.g);}spawnCar('police',true);cars.filter(function(q){return q.kind==='police'&&!q.bar;}).forEach(function(q){var bar=new T.Group();bar.position.set(0,1.62,0);q.g.add(bar);q.bar=[bx(.42,.16,.32,new T.MeshBasicMaterial({color:0x661111}),-.3,0,0,bar),bx(.42,.16,.32,new T.MeshBasicMaterial({color:0x112266}),.3,0,0,bar)];});}
function escaped(){var w=W4();lic().pts+=6;w.wanted=now()+300000;if(syn().rank)syn().heat=Math.min(10,syn().heat+2);endStop();note('You lost them','For now. Your plate is on file: +6 points, and a summons is coming.','bad');setTimeout(function(){summon('Fleeing the police','You ran from a traffic stop on '+(drv?'':'')+'Main Street.',Math.round(4000*tierM()));},20000);ptsCheck();save();}
function arrestChase(){endStop();if(drv)exitVeh();var w=W4();lic().pts+=6;summon('Fleeing the police','You were boxed in after a chase.',Math.round(6000*tierM()));note('Boxed in','Two more cruisers cut you off. You\'re cited and your court date is set.','bad');ptsCheck();save();}
var OFFICERS=['Officer Diaz','Officer Park','Officer McBride','Officer Okoye','Officer Lindqvist'];
function officerWalk(){var S=TSTOP;if(S.phase!=='chase')return;S.phase='talk';drv.speed=0;var who=OFFICERS[hashS(String(S.cop.g.id))%OFFICERS.length],L=lic(),fine=Math.round((S.why==='Speeding'?120+(S.m-mph(LIMIT))*12:250)*tierM()),pts=S.why==='Speeding'?(S.m-mph(LIMIT)>12?4:2):3,w=W4(),carry=w.carry||(drv&&drv.v===BBT),susp=suspended();
  if(susp){fine*=3;pts+=2;}S.take=function(){take();};var o={who:who,role:'City Police',col:'#1f2f5a'};
  var take=function(){if(!TSTOP||TSTOP.took)return;TSTOP.took=1;L.pts+=pts;L.tickets++;if(!pay(fine,'The ticket')){w.tax.bills.push({id:now(),amt:fine,due:now()+PERIOD*1000,paid:false,late:false});note('Ticket added to your bills','Pay it at City Hall.','info');}ptsCheck();endStop();toast('"Drive safe."','');save();};
  var line='"License and registration. '+(S.why==='Speeding'?'I clocked you at '+S.m+' in a '+mph(LIMIT)+'.':'You went right through that red light.')+(susp?' And your license is suspended.':'')+(carry?' …What\'s in the case?':'')+'"';
  popup('Traffic stop',line+'\nTicket: '+fmt(fine)+' and '+pts+' points. You have '+L.pts+'/12.',[{t:'Take the ticket · '+fmt(fine),fn:take},
    {t:'I\'ll see you in court',s:'Fight it before a judge',fn:function(){summon(S.why,'Traffic citation from '+who+'.',fine);endStop();save();}},
    {t:'Offer a "donation"',s:'Risky',fn:function(){var ok=Math.random()<(syn().rank>=2?.6:.2);if(ok){var b=Math.round(fine*.6);if(!pay(b,'The donation'))return;endStop();popup(who,'"…I didn\'t see anything. Drive slower."',[{t:'Thank you, officer'}],'',o);}else{endStop();summon('Attempted bribery','You tried to pay off '+who+'.',fine*4);popup(who,'"Step out of the car."',[{t:'…'}],'',o);}save();}},
    {t:'Floor it',s:'They will chase you',fn:function(){S.phase='chase';S.t=0;S.stopT=-6;bubble(P.x,3,P.z,'!!','bad');toast('You hit the gas.','bad');}}],'',
    {who:who,role:'City Police',col:'#1f2f5a',say:{ph:'Talk your way out of it…',fn:function(t){talkCop(t,who,fine,pts,take);}}});
  if(carry&&Math.random()<.5){w.carry=0;if(w.synJob)w.synJob.done=true;syn().heat=Math.min(10,syn().heat+2);note('The briefcase','The officer took the case "for safekeeping". The Don won\'t be happy. Heat +2.','bad');}}
function talkCop(t,who,fine,pts,take){var L=lic(),clean=L.tickets<2&&L.pts<4,o={who:who,role:'City Police',col:'#1f2f5a',you:t};
  var decide=function(warn,say){if(warn){endStop();L.warned=(L.warned||0)+1;popup(who,'"'+say+'"\nJust a warning this time.',[{t:'Thank you, officer'}],'',o);save();}else popup(who,'"'+say+'"',[{t:'Take the ticket · '+fmt(fine),fn:take},{t:'See you in court',fn:function(){summon(TSTOP?TSTOP.why:'Traffic violation','Traffic citation from '+who+'.',fine);endStop();save();}}],'',o);};
  if(!aiOk()){var n=norm(t),nice=/sorry|apolog|my fault|won.t happen|emergency|hospital|wife|baby|labor/.test(n);decide(nice&&clean&&Math.random()<.6,nice?'Okay. I hear you.':'Uh huh. Everybody\'s got a story.');return;}
  thinking(who,t,o);aiCall('You are '+who+', a fair, slightly tired traffic cop in a family-friendly city game. You pulled the player over. The driver\'s record: '+L.tickets+' tickets, '+L.pts+' points'+(L.warned?', already got '+L.warned+' warning(s)':'')+'. The player says something. Decide if they get a warning (only if they are polite AND their record is clean-ish) or the ticket. '+SAFE+'\nReturn only JSON: {"say": one short line, "warning": true|false}.',[],t.slice(0,200)).then(function(r){var warn=!!(r&&r.warning)&&clean;decide(warn,r&&r.say?clean2(r.say):'Uh huh.');});}
function clean2(s){return clean(s).replace(/^"|"$/g,'');}
function trafficSchool(){var L=lic(),c=Math.round(500*tierM());popup('Traffic school','Two hours of videos about stopping distances. Takes 4 points off'+(suspended()?' and ends your suspension':'')+'.\nYou have '+L.pts+' points.',[{t:'Sign up · '+fmt(c),off:!L.pts&&!suspended(),why:'Your record is clean.',fn:function(){if(!pay(c,'Traffic school'))return;fade(function(){L.pts=Math.max(0,L.pts-4);L.susp=0;clockH=(clockH+2)%24;banner('Graduated','Traffic school · −4 points','good');save();});}},{t:'No thanks',cls:'sec'}],'',{who:'Officer Diaz',role:'City Police',col:'#1f2f5a'});}
var parkT=0;function lawSlow(dt){parkT+=dt;if(parkT>5){parkT=0;if(O.on&&P.area==='city'){parkCheck();if(cars.filter(function(c){return c.kind==='police';}).length<2){spawnCar('police',true);copBars();}}}}
function copBars(){cars.filter(function(q){return q.kind==='police'&&!q.bar;}).forEach(function(q){var bar=new T.Group();bar.position.set(0,1.62,0);q.g.add(bar);q.bar=[bx(.42,.16,.32,new T.MeshBasicMaterial({color:0x661111}),-.3,0,0,bar),bx(.42,.16,.32,new T.MeshBasicMaterial({color:0x112266}),.3,0,0,bar)];});}
/* cabs and buses follow the same rules: they stop on red and don't rear-end people */
function ridePos(R,s){var pts=R.pts,acc=0;for(var k=0;k<pts.length-1;k++){var l=Math.hypot(pts[k+1].x-pts[k].x,pts[k+1].z-pts[k].z);if(acc+l>=s){var p=laneOff(pts,k,(s-acc)/Math.max(.01,l));return p;}acc+=l;}return null;}
function rideTarget(R){var tgt=R.bus?11:LIMIT,cur=ridePos(R,R.s),tl=LAWT.tl||0;if(!cur)return tgt;var inNow=intAt(cur.x,cur.z);
  for(var d=1.5;d<11;d+=1){var p=ridePos(R,R.s+d);if(!p)break;var it=intAt(p.x,p.z);if(it&&!inNow){var ax=Math.abs(Math.sin(p.h))>Math.abs(Math.cos(p.h))?'x':'z',ph=phase(tl)[ax];if(ph==='r'||(ph==='y'&&d>4)){tgt=Math.min(tgt,Math.max(0,(d-2)*1.5));}break;}}
  var hx=Math.sin(cur.h),hz=Math.cos(cur.h);cars.forEach(function(c){if(c===R.car)return;var dx=c.x-cur.x,dz=c.z-cur.z,f=dx*hx+dz*hz,lat=Math.abs(dx*hz-dz*hx);if(f>0&&f<9&&lat<1.6)tgt=Math.min(tgt,Math.max(0,(f-4.5)*1.3));});
  if(R.s>R.L-8)tgt=Math.min(tgt,Math.max(2,(R.L-R.s)*1.2));
  // never gridlock: if the ride hasn't moved for 6 seconds, the driver honks and squeezes past
  var t=now();if(R.lastS==null||R.s-R.lastS>.5){R.lastS=R.s;R.lastT=t;}else if(t-R.lastT>6000&&R.s<R.L-1){if(!R.honk){R.honk=1;try{tone(330,.25,'square',.04);}catch(e){}}tgt=Math.max(tgt,LIMIT*.55);if(t-R.lastT>9000){R.lastT=t;R.honk=0;}}
  return tgt;}
/* parking: curbside is fine, the middle of the road, crosswalks, intersections and sidewalks are not */
function parkSpot(x,z){var p=plan,dx=1e9,dz=1e9;p.xs.forEach(function(v){dx=Math.min(dx,Math.abs(x-v));});p.zs.forEach(function(v){dz=Math.min(dz,Math.abs(z-v));});
  if(dx<RH+1.5&&dz<RH+1.5)return 'an intersection';var lat=dx<RH?dx:dz<RH?dz:null;if(lat!=null){if(lat<RH-2.4)return 'a traffic lane';var near=dx<RH?dz:dx;if(near<RH+4)return 'a crosswalk';return null;}
  var sw=(dx>=RH&&dx<RH+WALK)||(dz>=RH&&dz<RH+WALK);return sw?'the sidewalk':null;}
function parkTicketPaper(v){if(v.paper)return;var pp=plane(.35,.25,toon(0xfff3a0),0,1.25,1.1,v.g);pp.rotation.x=-1.1;v.paper=pp;}
function parkCheck(){var w=W4();veh.forEach(function(v){if(drv&&drv.v===v){if(v.paper){v.g.remove(v.paper);v.paper=null;note('A ticket on your windshield',v.tkWhy||'Parking ticket.','bad');}v.parkT=0;return;}if(!v.mine)return;var p=v.g.position,bad=parkSpot(p.x,p.z);
  if(!bad){v.parkT=0;return;}v.parkT=(v.parkT||0)+5;if(v.parkT>=40&&!v.ticketed){v.ticketed=1;var f=Math.round((bad==='an intersection'?150:bad==='the sidewalk'?90:70)*tierM());citySpend(f);v.tkWhy='Parked in '+bad+'. '+fmt(f)+'.';parkTicketPaper(v);try{w.lic.tickets=(lic().tickets||0)+1;}catch(e){}if(Math.hypot(p.x-P.x,p.z-P.z)<40)bubble(p.x,2.6,p.z,'Ticket!','bad');save();}
  if(v.parkT>=200&&!v.towed&&(bad==='an intersection'||bad==='a traffic lane')){v.towed=1;var cop=placeById('off:police'),spot=cop?towSpot(cop):null;if(spot){v.g.position.set(spot.x,0,spot.z);v.g.rotation.y=spot.ry;if(v.sv){v.sv.x=spot.x;v.sv.z=spot.z;v.sv.ry=spot.ry;}v.parkT=0;v.ticketed=0;}var tf=Math.round(250*tierM());citySpend(tf);note('Towed','Your '+(v.kind==='truck'?'truck':'car')+' was blocking traffic. Impound fee '+fmt(tf)+'. It\'s outside the police station.','bad',{label:'Directions',fn:function(){navTo(cop);}});save();}});}

function towSpot(c){for(var r=4;r<30;r+=1.5)for(var a=0;a<16;a++){var x=c.x+Math.cos(a/16*Math.PI*2)*r,z=c.z+Math.sin(a/16*Math.PI*2)*r,ps=parkSpot(x,z);if(ps===null&&!blocked(x,z,1.6)&&inBounds(x,z)){var p=plan,dx=1e9,dz=1e9;p.xs.forEach(function(v){dx=Math.min(dx,Math.abs(x-v));});p.zs.forEach(function(v){dz=Math.min(dz,Math.abs(z-v));});if(dx<RH||dz<RH)return {x:x,z:z,ry:dx<RH?0:Math.PI/2};}}return {x:c.x,z:c.z+5,ry:0};}
