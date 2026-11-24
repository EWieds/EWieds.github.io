
/* ---------- earnings you can trust: one breakdown that is exactly what gets paid, a real 10-minute log, and the city keeps earning while you're away ---------- */
var EB={init:0,minT:0};
function earnCities(){var w=W4(),cs=[];for(var c=0;c<Math.max(1,G.cities||1);c++)cs.push(c);if(w.mpVisited)cs.push(MPC);return cs;}
function earnBreak(){var w=W4(),out=[],cs=earnCities(),add=function(k,n,cat,c,r,sub){if(r&&isFinite(r))out.push({k:k,n:n,cat:cat,c:c,r:r,sub:sub||''});};
  cs.forEach(function(c){add('super:'+c,'Superstore','Superstore',c,superIncome(c));});
  Object.keys(w.biz).forEach(function(k){var s=w.biz[k];if(!s.own||s.rev==null&&!s.paid)return;if(s.home&&!s.tenant)return;var cc=s.city!=null?s.city:cityOfLot(k);if(cs.indexOf(cc)<0&&cc!==-1)return;
    var base=(s.rev||0)*(1+.3*(s.ren||0)),m=cc===MPC?mpComp(k):mpSab(k),r=base*m,sub=[];if(m<.995)sub.push((cc===MPC?'rivals & sabotage':'sabotage')+' −'+Math.round((1-m)*100)+'%');if(s.ren)sub.push('renovated '+s.ren+'×');
    if(s.home&&s.city!=null&&lawOn('rent',s.city)){r-=base*.15;sub.push('rent control −15%');}add('biz:'+k,s.name||'Business',s.home?'Rent from homes':'Businesses you bought',cc,r,sub.join(' · '));});
  Object.keys(w.land).forEach(function(k){var l=w.land[k],c=cityOfLot(k);if(cs.indexOf(c)<0)return;
    if(l.use==='dev'&&l.dev){var lv=devLive(l.dev.type);add('land:'+k,l.dev.label||'Your building','Things Bob built',c,l.dev.rev*lv,(lv>1.05?'busy right now ×':lv<.95?'quiet right now ×':'×')+lv.toFixed(2)+' · daily average '+fmt(l.dev.rev)+'/min');}
    else if(l.use==='lease'&&l.tenant)add('land:'+k,l.tenant.n,'Tenants on your lots',c,leaseRate(district(c,l.d))*(1+.1*(l.bump||0))*(l.tower?2:1),l.bump?'rent raised '+l.bump+'×':'');});
  add('kiosk','Kiosks','Everything else',null,kioskAll());add('vend','Vending machines','Everything else',null,vendIncome());add('club','Club memberships','Everything else',null,clubIncome());add('fr','Franchise royalties','Everything else',null,frIncome());
  add('taxi','Your taxi fleet','Everything else',null,(w.taxi||0)*Math.round(60*tierM()));if(w.bigbean)add('bb','Big Bean Bros','Everything else',null,bbRev());add('turf','Roastery territory','Everything else',null,turfIncome());add('fm','Fresh Market (by Mg1)','Everything else',null,fmIncome());
  return out;}
function earnSum(list){var t=0;(list||earnBreak()).forEach(function(e){t+=e.r;});return t;}
function earnLog(list,extra,dt){var w=W4();w.earnLog=w.earnLog||{};list.forEach(function(e){w.earnLog[e.k]=(w.earnLog[e.k]||0)+e.r/60*dt;});Object.keys(extra).forEach(function(k){w.earnLog[k]=(w.earnLog[k]||0)+extra[k];});
  // minute buckets of what was actually credited (all passive money: city, shops, holdings)
  EB.minT+=dt;if(EB.minT>=60){EB.minT=0;var p=G.stats.passive||0;w.earnMin=w.earnMin||[];if(w.earnP!=null)w.earnMin.push({t:now(),v:Math.max(-1e12,p-w.earnP)});w.earnP=p;if(w.earnMin.length>15)w.earnMin.shift();}
  w.lastT=now();}
function earnOffline(){var w=W4();if(EB.init)return;EB.init=1;var el=(now()-(w.lastT||now()))/1000;w.lastT=now();if(w.earnP==null)w.earnP=G.stats.passive||0;if(el<90)return;
  var capH=4+(G.hq.offline||0),eff=.3+.08*(G.hq.offline||0),sec=Math.min(el,capH*3600),r=earnSum(),gain=r/60*sec*eff;if(gain<1)return;cityGain(gain);G.stats.passive=(G.stats.passive||0)+gain;w.earnP=G.stats.passive;
  setTimeout(function(){note('While you were away',plan.name+' kept earning: +'+fmt(gain)+' over '+(sec>=3600?(sec/3600).toFixed(1)+' hours':Math.round(sec/60)+' minutes')+' ('+Math.round(eff*100)+'% of the '+fmt(r)+'/min rate while you\'re gone'+(el>sec?', capped at '+capH+' hours':'')+').','good');},2500);save();}
function shopLines(){return G.locs.map(function(l){var e=locEcon(l);return {n:l.name,c:l.city,r:inShiftAt(l)?0:e.net,sub:inShiftAt(l)?'You\'re working here now (counts in the shift report)':e.open?'Open · staff running it':'Closed right now'};});}
function holdApp(){var w=W4(),list=earnBreak(),city=earnSum(list),sh=shopLines(),shT=0,hi=holdIncome(),tr=0;sh.forEach(function(s){shT+=s.r;});
  w.trucks.forEach(function(t){if(t.city!==O.city||t.stock<=0)return;var v=veh.filter(function(x){return x.truck===t;})[0];if(!v||(drv&&drv.v===v))return;var z=truckZone(v);if(z)tr+=truckRate(t,z);});
  var tot=city+shT+hi+tr,mins=(w.earnMin||[]).filter(function(m){return now()-m.t<10*60000+5000;}),last10=mins.reduce(function(a,m){return a+m.v;},0);
  var row=function(n,r,sub,life){return '<div class="ph-msg '+(r>=0?'good':'bad')+'"><b>'+esc(n)+' · '+(r>=0?'':'−')+fmt(Math.abs(r))+'/min</b><span>'+esc(sub||'')+(life?(sub?' · ':'')+'earned so far '+fmt(life):'')+'</span></div>';};
  var cats={};list.forEach(function(e){(cats[e.cat]=cats[e.cat]||[]).push(e);});
  var h=phTop('Holdings')+'<div class="ph-card"><small>Earning right now</small><b>'+fmt(tot)+'/min</b><small>Actually paid, last '+(mins.length?mins.length:10)+' min</small><b>'+(mins.length?fmt(last10):'measuring…')+'</b></div>'+
    '<div class="ph-card"><small>City money</small><b>'+fmt(w.led||0)+'</b><small>Shared with legacy</small><b>'+fmt(Math.max(0,G.cash-(w.led||0)))+'</b></div>'+
    '<p class="ph-note">Every line below is exactly what gets paid each minute. Some places earn more at certain hours, so the total moves during the day. Taxes come out at the end of each period (see Bank → Statements).</p>';
  Object.keys(cats).forEach(function(c){var s=0;cats[c].forEach(function(e){s+=e.r;});h+='<div class="ph-h">'+esc(c)+' · '+fmt(s)+'/min</div><div class="ph-list">'+cats[c].sort(function(a,b){return b.r-a.r;}).map(function(e){return row(e.n+(e.c!=null&&e.c!==O.city?' ('+cityName(e.c)+')':''),e.r,e.sub,(w.earnLog||{})[e.k]);}).join('')+'</div>';});
  if(sh.length)h+='<div class="ph-h">Your Crema shops · '+fmt(shT)+'/min</div><div class="ph-list">'+sh.map(function(s){return row(s.n,s.r,s.sub);}).join('')+'</div>';
  if(hi)h+='<div class="ph-h">Legacy holdings · '+fmt(hi)+'/min</div>';if(tr)h+='<div class="ph-h">Food trucks selling now · '+fmt(tr)+'/min</div>';
  var oh=ownedHomes().filter(function(k){var s=w.biz[k];return !s.tenant;});if(oh.length)h+='<div class="ph-h">Homes with no tenant</div><div class="ph-list">'+oh.map(function(k){var s=w.biz[k];return '<div class="ph-msg"><b>'+esc(s.name||k)+(w.home===k?' · you live here':'')+'</b><span>'+(w.home===k?'Your home':'Empty. Find a tenant to earn rent')+'</span></div>';}).join('')+'</div>';
  if(!list.length&&!sh.length)h+='<p class="ph-empty">Nothing earning yet. Buy a business, a lot, or a house and it shows up here.</p>';
  return h;}
