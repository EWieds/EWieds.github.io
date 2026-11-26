
/* ---------- an economy that behaves: stock prices follow the companies' real fundamentals, earnings season, and buildings that earn on a real schedule ---------- */
function stat2(k){var s=W4().stats||{};return s[k]||0;}
function fundOf(k){var w=W4(),rate=Math.max(1,empireRate()),tm=Math.max(1,tierM()),shops=G.locs.length,ob=ownedBiz().length;
  switch(k){case 'CRMA':return .6+.4*Math.sqrt(rate/(300*tm))+.03*shops;
    case 'BEAN':return .8+.04*(shops+ob)+(w.biz.valley&&w.biz.valley.own?.2:0);
    case 'TACO':return Math.max(.3,.7+.15*(rtrucks?rtrucks.length:0)-.08*(w.truckWins||0));
    case 'AIR':return .8+(typeof apOwned==='function'&&apOwned()?.3:0)+.06*Math.max(0,(G.cities||1)-1)+Math.min(.2,stat2('flights')*.01);
    case 'MALL':return .8+(w.mallK?Object.keys(w.mallK).length*.12:0)+Math.min(.35,(stat2('bowl')+stat2('claws')+stat2('movies')+stat2('meals'))*.006);
    case 'GOLD':return 1.25-.25*Math.min(1,rate/(2500*tm))+.08*Math.sin(now()/600000);
    case 'NWND':var m=mkt();m.nw=m.nw||1;return m.nw;
    case 'SODA':return .8+Math.min(.4,stat2('meals')*.008)+(typeof fmOwned==='function'&&fmOwned()?.1:0);
    case 'BIGB':var share=shops/(shops+6);return Math.max(.3,1.25-.7*share-(w.recipe?.3:0));}
  return 1;}
function fairPx(k){var m=mkt(),raw=STK[k][1]*fundOf(k);m.cal=m.cal||{};if(m.cal[k]==null)m.cal[k]=Math.max(.5,Math.min(2,m.px[k]/raw));return raw*m.cal[k];}
function mktTick(dt){mktT+=dt;if(mktT<6)return;mktT=0;var m=mkt();m.last=m.last||{};m.nw=Math.max(.4,Math.min(3,(m.nw||1)*Math.exp((Math.random()-.5)*.03)));
  Object.keys(STK).forEach(function(k){var v=STK[k][2],fair=fairPx(k);m.cal[k]+=(1-m.cal[k])*.002;if(m.last[k]==null)m.last[k]=fair;
    var px=m.px[k];px=px*Math.exp(.05*Math.log(fair/px)+v*(Math.random()*2-1)*.55);
    if(Math.random()<.012){var surprise=fair/m.last[k]-1,jump=Math.max(-.25,Math.min(.25,surprise*.8+(Math.random()-.5)*.03));px*=1+jump;m.last[k]=fair;var beat=jump>=0;
      if(O.on&&(m.own[k]||Math.abs(jump)>.05))note(k+(beat?' beats':' misses')+' earnings · '+(beat?'+':'')+Math.round(jump*100)+'%',earnWhy(k,beat),beat?'good':'bad');
      if(m.own[k]&&DIVS[k]){var dv=Math.round(m.own[k]*px*DIVS[k]);if(dv>0){G.cash+=dv;toast(k+' dividend: '+fmt(dv),'good');}}}
    m.px[k]=Math.max(.5,px);var h=m.hist[k];h.push(+m.px[k].toFixed(2));if(h.length>60)h.shift();});}
var DIVS={BEAN:.012,MALL:.015,SODA:.01,AIR:.008,CRMA:.006};
function earnWhy(k,beat){var t={CRMA:beat?'Crema\'s stores are packed. (That\'s you.)':'Same-store sales were soft this quarter.',BEAN:beat?'More coffee shops in town means more bean orders.':'Coffee orders slowed down.',TACO:beat?'Taco trucks are everywhere.':'Losing the truck wars is expensive.',AIR:beat?'Flights are full.':'Empty seats this quarter.',
  MALL:beat?'Foot traffic at the Galleria is up: bowling, movies, the food court.':'Quiet quarter at the mall.',GOLD:beat?'Nervous investors buy gold.':'The economy is booming. Nobody wants gold.',NWND:beat?'Northwind\'s new gadget is a hit.':'Northwind delayed its launch again.',SODA:beat?'Snack bars and food courts are selling a lot of soda.':'Soda sales went flat.',BIGB:beat?'Big Bean is holding its ground.':'Big Bean is losing customers to independent shops.'}[k];return t||'';}
/* Sal's tip is real: the company whose numbers have improved the most since its last report */
function salStocks(){var w=W4(),m=mkt(),s=syn();if(w.salTip&&now()-w.salTip<300000){popup('Sal the Ledger','"One tip every five minutes. Greed gets people caught."',[{t:'OK'}],'',{who:'Sal the Ledger',col:'#3a3a3a'});return;}
  m.last=m.last||{};var best=null,bs=-9,worst=null,ws=9;Object.keys(STK).forEach(function(k){if(k==='BIGB')return;var f=fairPx(k),r=f/(m.last[k]||f)-1+(f/m.px[k]-1)*.5;if(r>bs){bs=r;best=k;}if(r<ws){ws=r;worst=k;}});
  w.salTip=now();w.tip={k:best,t:now()};save();
  popup('Sal the Ledger',bs>.03?'"'+STK[best][0]+'. Their numbers are better than anybody knows. Buy before they report."'+(ws<-.03?'\n"And get out of '+worst+' if you\'re in it."':''):'"Honestly? Nothing\'s mispriced right now. Sit on your hands."',[{t:'Open Stocks',fn:function(){openPhone('stk');}},{t:'Got it',cls:'sec'}],'',{who:'Sal the Ledger',col:'#3a3a3a'});}
function researchNote(){var m=mkt(),c=Math.round(300*tierM());popup('Research desk','Priya Shah, CFA will write you a note on every company: fair value vs price. '+fmt(c)+'.',[{t:'Buy the report · '+fmt(c),fn:function(){if(!pay(c,'The report'))return;var rows=Object.keys(STK).map(function(k){var f=fairPx(k),g=f/m.px[k]-1;return {k:k,g:g,t:k+'  '+fmt(m.px[k])+' → fair '+fmt(f)+'  ('+(g>=0?'+':'')+Math.round(g*100)+'%) '+(g>.08?'BUY':g<-.08?'SELL':'HOLD')};}).sort(function(a,b){return b.g-a.g;});
  popup('Research note',rows.map(function(r){return r.t;}).join('\n')+'\n\nFair value comes from each company\'s business: your empire for CRMA, mall traffic for MALL, flights for AIR, the truck wars for TACO.',[{t:'Thanks, Priya'}],'',{who:'Priya Shah',role:'Financial analyst',col:'#2a3a6a'});}},{t:'No thanks',cls:'sec'}]);}
/* buildings earn on a real schedule: nightclubs at night, water parks in the sun, stadiums on game days. The analyst's number is the daily average. */
var GAMEDAY=0;
function devLive(type){var h=clockH,night=h>=21||h<3,day=h>=10&&h<18,wet=(typeof rain!=='undefined'&&rain.k)||0;
  switch(type){case 'nightclub':return night?2.3:h>=18||h<5?1.1:.3;case 'waterpark':return (day?1.8:.25)*(1-wet*.8)+.1;case 'stadium':return GAMEDAY>now()?4:.55;case 'restaurant':return (h>=11&&h<14)||(h>=17&&h<21)?1.7:.55;
    case 'office':return h>=8&&h<18?1.6:.35;case 'cinema':return h>=17?1.7:.6;case 'hotel':return 1;case 'arcade':return h>=15&&h<23?1.6:.5;case 'retail':return h>=10&&h<20?1.5:.25;case 'marina':return (day?1.5:.4)*(1-wet*.6)+.1;case 'racetrack':return (day?1.6:.3)*(1-wet*.7)+.1;default:return 1;}}
var gameT=500;
function econTick2(dt){gameT-=dt;if(gameT<=0){gameT=rnd(500,800);var w=W4(),has=Object.keys(w.land).some(function(k){var l=w.land[k];return l.use==='dev'&&l.dev&&l.dev.type==='stadium';});if(has){GAMEDAY=now()+90000;note('Game day!','Your stadium is sold out. Tickets, hot dogs, parking: about 4× normal for the next 90 seconds.','good');}}}
