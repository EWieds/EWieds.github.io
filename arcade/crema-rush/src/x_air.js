
/* ---------- buy the airport: the biggest money-maker in town, and you run it on foot ---------- */
var AP_UP={gate:{n:'Open another gate',s:'More flights, more landing fees',base:60000,max:6,inc:.14},
  bar:{n:'Crema coffee bar at the gates',s:'Travelers pay airport prices. Your coffee, your margins',base:45000,max:4,inc:.18},
  lounge:{n:'Crema Lounge',s:'Members pay for quiet and espresso',base:150000,max:1,inc:.25},
  park:{n:'Parking garage',s:'Everybody parks. Everybody pays',base:90000,max:1,inc:.15},
  sec:{n:'More security lanes',s:'Shorter lines, happier travelers',base:40000,max:3,inc:.05,sat:6},
  shops:{n:'Duty-free expansion',s:'Perfume, candy, neck pillows',base:70000,max:2,inc:.1}};
function apKey(c){return 'airport:'+(c==null?O.city:c);}
function apState(c){return W4().biz[apKey(c)]||null;}
function apOwned(c){var s=apState(c);return !!(s&&s.own);}
function apName(c){var w=W4(),n=w.apName&&w.apName[c==null?O.city:c];return n||(cityName(c==null?O.city:c)+' International');}
function AIRPORT(){var t=TM(O.city).pm,s=apState()||{},up=s.up||{},m=1;Object.keys(up).forEach(function(k){m+=AP_UP[k].inc*up[k];});var fee=s.fee||1,boost=s.boost&&s.boost>now()?1.5:1;
  return {key:apKey(),name:apName(),owner:'Gloria Vance',pers:'shrewd',type:'office',city:O.city,val:Math.round(900000*t),revv:Math.round(7200*t*m*(fee===1?1:fee>1?1.22:.82)*boost),airport:1,door:placeById('airport')||{x:0,z:0}};}
function apRevBase(){var a=AIRPORT();return a.revv;}
function apSync(){var s=apState();if(s&&s.own){s.rev=AIRPORT().revv;s.city=O.city;s.name=apName();}}
function apCost(k){var s=apState(),n=(s.up&&s.up[k])||0;return Math.round(AP_UP[k].base*TM(O.city).pm*Math.pow(1.6,n));}
function apSat(){var s=apState()||{},up=s.up||{};return Math.max(10,Math.min(100,62+(up.sec||0)*AP_UP.sec.sat+(up.lounge?8:0)+(up.bar||0)*3-(s.fee===2?14:s.fee===0?-8:0)));}
function directorTalk(){var s=apState();if(s&&s.own){apOffice();return;}
  var b=AIRPORT();if(G.lvl<12){popup('Airport Authority','"The airport isn\'t for sale to just anyone. Come back when you\'re a real player in this town."\n(Level 12.)',[{t:'OK'}],'',{who:'Gloria Vance',role:'Director, Airport Authority',col:'#2f5f90'});return;}
  bizTalk(b,false,'"Gloria Vance, Airport Authority. Word is you want to buy my airport. It earns about '+fmt(b.revv)+' a minute. It is not cheap."');}
function apOffice(){var s=apState(),b=AIRPORT(),up=s.up||(s.up={}),opts=[];
  Object.keys(AP_UP).forEach(function(k){var u=AP_UP[k],n=up[k]||0,c=apCost(k);opts.push({t:u.n+(u.max>1?' ('+n+'/'+u.max+')':n?' ✓':'')+(n>=u.max?'':' · '+fmt(c)),s:u.s,off:n>=u.max,why:'Already maxed out.',fn:function(){if(!pay(c,u.n))return;up[k]=n+1;apSync();O.dirty=true;note(u.n,'Done. '+apName()+' now earns '+fmt(AIRPORT().revv)+'/min.','good');try{sfx.buy();}catch(e){}save();}});});
  var fees=['Low','Standard','High'];opts.unshift({t:'Landing fees: '+fees[s.fee==null?1:s.fee]+' → '+fees[((s.fee==null?1:s.fee)+1)%3],s:'High fees earn more but annoy airlines and travelers',fn:function(){s.fee=((s.fee==null?1:s.fee)+1)%3;apSync();save();apOffice();}});
  opts.push({t:'Rename the airport',s:'Type a new name',fn:function(){popup('Rename '+apName(),'What should it be called?',[{t:'Cancel',cls:'sec'}],'',{say:{ph:'e.g. "Crema International"',fn:function(t){var n=t.replace(/[^\w '&.-]/g,'').trim().slice(0,32);if(n.length<3){toast('Too short.','bad');return;}var w=W4();w.apName=w.apName||{};w.apName[O.city]=n;apSync();note('Renamed',n+'. The signs go up overnight.','good');O.dirty=true;save();}}});}});
  opts.push({t:'Sell the airport · '+fmt(Math.round(b.val*.85)),s:'Back to the city',fn:function(){popup('Sell '+apName()+'?','You\'d get '+fmt(Math.round(b.val*.85))+'.',[{t:'Sell',fn:function(){G.cash+=Math.round(b.val*.85);delete W4().biz[apKey()];O.dirty=true;save();note('Sold',apName(),'info');}},{t:'Keep it',cls:'sec'}]);}});
  opts.push({t:'Done',cls:'sec'});
  popup(apName(),'Income '+fmt(b.revv)+'/min · traveler satisfaction '+apSat()+'%'+(s.boost&&s.boost>now()?' · RUSH: delays have the terminal packed':'')+'\nYou fly free from here.',opts,'',{who:'Ops office',role:'Your airport',col:'#2f5f90'});}
/* the office, the staff, and your coffee bars, all in the terminal */
function airportRoomExtra(){var A=AREAS.terminal;if(!A)return;var ox=IOX.terminal,g=new T.Group();g.position.set(ox,0,0);stat.add(g);curArea='terminal';var own=apOwned();
  bx(.2,3,2.2,toon(0x2f5f90),-32.8,1.5,-4,g);bx(.12,2.4,1.4,toon(0x6b4a30),-32.65,1.2,-4,g);
  wallSign(g,own?'OPERATIONS · '+apName().toUpperCase():'AIRPORT AUTHORITY',-32.7,3.6,-4,{bg:'#2f5f90',fg:'#fff',w:5,h:.7,ry:Math.PI/2});
  ACTS.terminal.push({x:ox-31.4,z:-4,r:1.9,label:function(){return apOwned()?'Operations office':'Airport Authority';},sub:function(){return apOwned()?fmt(AIRPORT().revv)+'/min · '+apSat()+'% happy':'Ask about buying the airport';},fn:directorTalk});
  var s=apState()||{},up=s.up||{},nb=own?(up.bar||0):0;apInterior(g,ox);
  for(var i=0;i<nb;i++){var x=11+i*6,z=-12.5,k=new T.Group();k.position.set(x,0,z);g.add(k);rb(3.6,1.05,1.3,.08,toon(0x2a1a12),0,.52,0,k);bx(3.7,.08,1.4,toon(0xf4efe6),0,1.08,0,k);rb(3.8,.25,1.6,.06,toon(0xffc63d),0,3.1,0,k);
    cyB(.06,2,toon(0x2a1a12),-1.75,1.1,0,k,6);cyB(.06,2,toon(0x2a1a12),1.75,1.1,0,k,6);plane(2.8,.55,flat(0xffffff,{map:signT('CREMA · GATE '+String.fromCharCode(66+i)+(4+i),{bg:'#2a1a12',fg:'#ffc63d',w:512,h:100})}),0,3.55,.02,k);
    bx(.5,.6,.4,toon(0x8a8f96),-1,1.4,-.2,k);npc(k,.4,-.9,0,{shirt:0xffc63d});addCol(ox+x-1.9,ox+x+1.9,z-.7,z+.7,'terminal');
    for(var q=0;q<2+i%2;q++){var c=liteMe();c.root.position.set(x-.6+q*.7,0,z+1.4+q*.8);c.root.rotation.y=Math.PI;c.cup.visible=q===0;g.add(c.root);}
    (function(i,x){ACTS.terminal.push({x:ox+x,z:z+1.6,r:1.8,label:'Crema Gate '+String.fromCharCode(66+i)+(4+i)+' (yours)',sub:function(){return 'About '+fmt(AIRPORT().revv*AP_UP.bar.inc/(1+0))+'/min of the airport\'s take';},fn:function(){popup('Crema Gate '+String.fromCharCode(66+i)+(4+i),'"Line\'s been out the door since the 6 a.m. to '+cityName(Math.min((G.cities||1),O.city+1))+'. Need more cups, boss."',[{t:'Great work',cls:'sec'}],'',{who:'Barista',role:'Your coffee bar',col:'#ffc63d'});}});})(i,x);}
  if(own&&up.lounge){var lg=new T.Group();lg.position.set(22,0,7.6);g.add(lg);bx(10,.1,4,toon(0x3a2a22),0,.05,0,lg);[-3,0,3].forEach(function(x){rb(2,.7,.9,.1,toon(0x8a3a4a),x,.35,-.8,lg);rb(2,.5,.25,.1,toon(0x8a3a4a),x,.75,-1.25,lg);});plane(4,.6,flat(0xffffff,{map:signT('CREMA LOUNGE',{bg:'#2a1a12',fg:'#ffc63d',w:512,h:80})}),0,3,-1.9,lg);}
  if(own){var sc=npc(g,5.6,-7.5,-Math.PI/2,{shirt:0x2a3a6a});ACTS.terminal.push({x:ox+5,z:-7.5,r:1.6,label:'Talk to your security chief',sub:function(){return apSat()+'% traveler satisfaction';},fn:function(){var u=(apState().up||{}).sec||0;popup('Security','"'+(u>=3?'Lines are under five minutes. Best in the region.':u?'Better, but the morning rush still backs up. Another lane would help.':'We\'re short-staffed, boss. Morning lines go out the door.')+'"',[{t:u>=3?'Keep it up':'Open a lane · '+fmt(apCost('sec')),off:u>=3,fn:function(){if(!pay(apCost('sec'),'Security lane'))return;var st=apState();st.up.sec=(st.up.sec||0)+1;apSync();O.dirty=true;save();toast('New lane open.','good');}},{t:'OK',cls:'sec'}],'',{who:'Chief Ramos',role:'Airport security',col:'#2a3a6a'});}});}
  curArea='city';}
/* delays, rushes, airlines asking for deals */
var apT=0;
function apTick(dt){apT+=dt;if(apT<5)return;apT=0;var w=W4();Object.keys(w.biz).forEach(function(k){if(k.indexOf('airport:')!==0)return;var s=w.biz[k];if(!s.own)return;s.nextEv=s.nextEv||now()+360000;
  if(now()>s.nextEv){s.nextEv=now()+rnd(480000,900000);var c=+k.split(':')[1],ev=pick(['storm','charter','strike']);
    if(ev==='storm'){s.boost=now()+180000;note('Storm delays at '+(w.apName&&w.apName[c]||cityName(c)+' International'),'Hundreds of travelers stuck in your terminal. Your coffee bars are slammed: airport income +50% for 3 minutes.','good');}
    else if(ev==='charter'){var pay_=Math.round(20000*TM(c).pm);G.cash+=pay_;note('Charter landing fee','A private jet full of celebrities landed at your airport. +'+fmt(pay_)+'.','good');}
    else{note('Baggage handlers want a raise','"Pay us or the bags slow down." Ops office has the details.','bad',{label:'Pay '+fmt(Math.round(15000*TM(c).pm)),fn:function(){if(pay(Math.round(15000*TM(c).pm),'The raise'))note('Handled','Bags are flying again.','good');}});}
    if(c===O.city)apSync();save();}
  if(s.boost&&s.boost<now()){s.boost=0;if(+k.split(':')[1]===O.city)apSync();}});}
