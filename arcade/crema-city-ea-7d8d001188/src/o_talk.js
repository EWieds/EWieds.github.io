
/* ---------- talking to people on the street: opinions, rumors that are true, job seekers, coupons ---------- */
function pedActs(){
  if(drv||P.area!=='city')return [];var best=null,bd=1.9;
  peds.forEach(function(p){if(p.mode==='cross')return;var d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;best=p;}});
  if(!best)return [];var p=best;if(!p.name){var r=seeded(hashS(String(p.me.root.id)));p.name=FIRST[Math.floor(r()*FIRST.length)];p.job=r()<.12;p.said={};p.likes=r();}
  return [{x:p.x,z:p.z,r:2,label:'Talk to '+p.name,sub:p.job?'Looks like they\'re job hunting':p.me.cup.visible?'Holding a Crema cup':'Passer-by',fn:function(){talkPed(p);}}];
}
function talkPed(p){
  W4().f.talked=1;p.stop=999;p.me.root.rotation.y=Math.atan2(P.x-p.x,P.z-p.z);var loc=nearestMine(p.x,p.z),opts=[];
  opts.push({t:'What do you think of Crema?',fn:function(){say(p,opinion(p,loc));}});
  opts.push({t:'Heard anything interesting?',fn:function(){say(p,rumor(p));}});
  if(p.job)opts.push({t:'Are you looking for work?',fn:function(){hirePed(p);}});
  if(loc)opts.push({t:'Here, a coupon for a free coffee',s:'$3 · they head to '+loc.name,fn:function(){if(!pay(3,'The coupon'))return;addFame(1);p.done=1;say(p,pick(['"Oh, nice! I\'ll go right now."','"Free coffee? You don\'t have to ask twice."']),function(){p.coupon=loc;});}});
  opts.push({t:'Bye!',cls:'sec',fn:function(){p.stop=rnd(.5,1.5);}});
  popup(p.name,greet(p),opts,'',{who:p.name,role:p.me.cup.visible?'One of your regulars':'Local',col:'#46a9e6'});
  setTimeout(function(){if(!popOpen()&&p.stop>100)p.stop=1;},50);
}
function say(p,t,after){popup(p.name,t,[{t:'Thanks!',fn:function(){p.stop=rnd(.5,1.2);if(after)after();}}],'',{who:p.name,role:'Local',col:'#46a9e6'});bubble(p.x,2.4,p.z,t.replace(/"/g,'').slice(0,28)+(t.length>30?'…':''),'');}
function nearestMine(x,z){var best=null,bd=1e9;shopV.forEach(function(v){if(v.rival||v.super)return;var d=Math.hypot(v.door.x-x,v.door.z-z);if(d<bd){bd=d;best=v.loc;}});return best;}
function greet(p){var h=clockH;return pick([h<11?'"Morning!"':h<17?'"Hi there!"':'"Evening!"','"Hey! You\'re the coffee person, right?"','"Oh, hello."'])+(rain.on?' "Can you believe this rain?"':'');}
function opinion(p,loc){if(!loc)return '"Crema? Never been. Is there one around here?"';var rep=loc.rep||3,pm=loc.price||1,c=loc.comp;
  if(p.me.cup.visible&&rep>=4)return '"'+loc.name+' is the best coffee in town. I\'m there every morning."';
  if(pm>1.25)return '"Good coffee at '+loc.name+', but pricey. I go when I\'m treating myself."';
  if(c&&c.S>30&&p.likes<.4)return '"Honestly I usually go to '+c.name+'. It\'s right there and they\'re fine."';
  if(rep<3)return '"I tried '+loc.name+' once. The line was long and my drink was cold."';
  if(!locEcon(loc).open&&!(SH&&SH.loc===loc))return '"'+loc.name+'? It always seems to be closed when I walk by."';
  return pick(['"'+loc.name+' is solid. Friendly staff."','"I like it! The pastries are great."','"Pretty good. I\'d go more if it was open later."']);}
function rumor(p){
  var said=p.said||(p.said={}),list=[];
  BUS.forEach(function(b){var s=W4().biz[b.key];if(s&&s.own)return;if(b.pers==='tired')list.push(['tired'+b.key,'"I heard '+b.owner+' at '+b.name+' wants to retire. Says they\'re exhausted."']);if(b.pers==='sentimental')list.push(['sent'+b.key,'"'+b.owner+' at '+b.name+' would only sell to someone who keeps the staff on. Family business."']);
    if(b.pers==='proud')list.push(['proud'+b.key,'"Don\'t lowball '+b.owner+' at '+b.name+'. They\'ll throw you out."']);});
  if(!(W4().found&&W4().found.valley))list.push(['valley','"See those Valley Farms trucks at FreshMart every morning? They supply half the town."']);
  var sale=places.filter(function(q){return q.kind==='sale';});if(sale.length)list.push(['sale','"There\'s an empty lot over in '+sale[0].name.replace('Lot for sale · ','')+'. Somebody should build there."']);
  G.locs.forEach(function(l){if(l.city===O.city&&l.comp&&l.comp.S<15)list.push(['weak'+l.id,'"'+l.comp.name+' looks like it\'s struggling. Half empty every time I pass."']);});
  if(!civ().council&&G.fame>=200)list.push(['council','"There\'s a council seat open. Someone like you could win it."']);
  if(rain.next<60&&!rain.on)list.push(['rain','"Looks like rain soon. My knee always knows."']);
  var fresh=list.filter(function(q){return !said[q[0]];});if(!fresh.length)return '"Nothing new, sorry. Quiet week."';var q=fresh[Math.floor(Math.random()*fresh.length)];said[q[0]]=1;return q[1];}
function hirePed(p){var shops=G.locs.filter(function(l){return l.city===O.city;}),roles=['barista','server','finisher','host'].filter(function(r){return G.lvl>=ROLES[r].lvl;}),role=roles[Math.floor(p.likes*roles.length)]||'barista';
  if(!shops.length){say(p,'"I am! But you don\'t have a shop around here, do you?"');return;}
  popup(p.name,'"I am! I\'ve worked as a '+ROLES[role].name.toLowerCase()+' for two years. I can start tomorrow."',shops.map(function(l){var c=Math.round(hireCost(l,role)*.7),full=(l.staff[role]||0)>=ROLES[role].cap[l.size];
    return {t:'Hire for '+l.name+' · '+fmt(c),s:full?'No room for another '+ROLES[role].name.toLowerCase()+' there':'30% less than a recruiter',off:full,why:'That shop is full for this role. Expand it first.',fn:function(){if(!pay(c,'Hiring'))return;l.staff[role]=(l.staff[role]||0)+1;if(inShiftAt(l))resetBots();p.job=false;p.done=1;note('Hired '+p.name,ROLES[role].name+' at '+l.name+'.','good');say(p,'"Thank you! See you at '+l.name+'!"',function(){p.coupon=l;});save();}};}).concat([{t:'Not right now',cls:'sec'}]),'',{who:p.name,role:'Job seeker',col:'#46a9e6'});}
/* people you send to your shop actually walk there */
function updPedErrands(){peds.forEach(function(p){if(!p.coupon||p.mode!=='loop'||p.stop>0)return;var loc=p.coupon;p.coupon=null;var v=shopVOf(loc);if(!v)return;var i=peds.indexOf(p);peds.splice(i,1);
  var pts=walkify(route({x:p.x,z:p.z},v.out));pts.push(v.door);var w={me:p.me,path:pts.slice(1),x:p.x,z:p.z,v:1.5,end:'in',shop:v};walkers.push(w);});}
function readCourier(){var ns=(G.news||[]).slice(0,5);popup('The Crema Courier','"'+plan.name.toUpperCase()+'\'S FAVORITE NEWSPAPER · 50¢"\n\n'+(ns.length?ns.map(function(n){return '• '+n.text;}).join('\n'):'Slow news day. Somebody should do something newsworthy.'),[{t:'Fold it up',cls:'sec'}]);}
