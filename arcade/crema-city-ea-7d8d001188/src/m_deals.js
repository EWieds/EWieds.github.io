
/* ---------- deals: owners who remember you, never sell too cheap, and can be talked around ---------- */
var LINES={
  hi:{tired:['"Long week. Long year, honestly. What can I do for you?"','"Oh, hi. Don\'t mind the boxes."'],practical:['"Afternoon. What brings you in?"','"Hey there. Looking for something?"'],shrewd:['"Ah, the coffee mogul. I wondered when you\'d stop by."','"I know who you are. Sit down."'],
    proud:['"Thirty years I\'ve run this place. Thirty. What do you want?"','"Welcome. Everything here, I built myself."'],sentimental:['"My father opened this shop, you know. Come in, come in."','"Hello, dear. Have you met my staff? They\'re family."'],greedy:['"Everything has a price. What\'s yours?"','"Ah, a customer with deep pockets. I can always tell."']},
  accept:['"Deal. You\'ve got yourself a {what}."','"...Alright. Shake on it before I change my mind."','"Fine. Fair is fair. The keys are yours."'],
  over:['"Deal! (I should have asked for more, shouldn\'t I.)"','"Sold! Pleasure doing business with you."'],
  counter:['"Meet me in the middle. {n} and it\'s yours."','"Closer. I could do {n}."','"Hmm. {n}. Final-ish offer."'],
  firm:['"Not even close. I\'d need {n}."','"For that? No. {n} is my number."'],
  insult:['"Is that a joke? Get serious."','"You\'re insulting me in my own shop."','"Wow. Now the price went up."'],
  ban:['"We\'re done here. Out."','"Get out of my store. Come back when you\'ve learned some manners."'],
  phone:['"I don\'t do business over the phone. Come see me in person."'],
  heart:['"It\'s not about the money. Who\'ll look after my people? Who keeps the name on the door?"'],
  broke:['"You don\'t have that kind of money. Come back when you do."'],
  block:['"I\'ve seen you buying up this block. The price just went up."'],
  hih:{tired:['"Yes? ...Sorry, long day. Can I help you?"'],practical:['"Hi. Can I help you with something?"'],shrewd:['"I know who you are. You\'re not selling cookies."'],proud:['"We built this house with our own hands. What do you want?"'],sentimental:['"Oh, hello! The kids grew up in this house, you know. Come in."'],greedy:['"Well, well. Money, standing on my porch."']},
  hisale:['"You saw the sign? Come in, come in. Mind the boxes."','"Here about the house? Good. We\'re moving to be near the grandkids."']};
function line(k,b,vars){var L=LINES[k];if(!Array.isArray(L))L=L[b.pers]||L.practical;var s=pick(L);Object.keys(vars||{}).forEach(function(q){s=s.replace('{'+q+'}',vars[q]);});return s.replace('{what}',BT[b.type]?BT[b.type].what.replace(/^an? /,''):'business');}
function dState(b){var w=W4(),s=w.biz[b.key]=w.biz[b.key]||{};if(s.ask==null){var p=PERS[b.pers],v=b.val||bizValue(b),r=seeded(hashS(b.key)+7);s.ask=Math.round(v*p.ask*(.95+r()*.15));s.floor=Math.round(v*p.floor*(.97+r()*.08));s.pat=p.pat;s.mood=0;s.offers=0;s.ver=2;}
  if(s.ver!==2&&!s.own&&!b.revv&&!b.home){s.ask*=3;s.floor*=3;if(s.last)s.last*=3;}s.ver=2;return s;}
function caseAmt(){return W4().case||0;}
function canAfford(n){return G.cash+caseAmt()>=n;}
function payDeal(n){var c=Math.min(caseAmt(),n);W4().case=caseAmt()-c;n-=c;G.cash-=n;caseView();try{sfx.buy();}catch(e){}save();}
var YOU=null;
function bizTalk(b,phone,msg){
  if(!phone&&P.area==='city'&&b.lot&&(!TALK||TALK.key!==b.key))startTalk(b);
  var you=YOU;YOU=null;var s=dState(b),who={who:b.owner,role:s.own?'Your manager at '+b.name:b.airport?'Director, Airport Authority':b.home?(b.kind==='apt'?'Landlord, ':'Lives at ')+b.name:'Owner, '+b.name,col:s.own?'#2fa860':'#8a5a3a'};
  if(s.own){ownedTalk(b);return;}
  if(s.ban>now()){popup(b.name,'"I told you. Out."\n('+b.owner+' will talk to you again in '+mmssS((s.ban-now())/1000)+'.)',[{t:'Leave',cls:'sec'}],'bad',who);return;}
  if(phone&&b.pers==='proud'){popup(b.name,line('phone',b),[{t:'Directions',fn:function(){navTo(placeById('biz:'+b.key)||{x:b.door.x,z:b.door.z,name:b.name});}},{t:'OK',cls:'sec'}],'',who);return;}
  var mine=BUS.filter(function(q){return q!==b&&q.lot&&b.lot&&q.lot.b===b.lot.b&&(W4().biz[q.key]||{}).own;}).length;
  if(mine>=2&&!s.block&&(b.pers==='shrewd'||b.pers==='greedy'||b.pers==='proud')){s.block=1;s.ask=Math.round(s.ask*1.08);s.floor=Math.round(s.floor*1.06);msg=line('block',b);}
  var v=b.val||bizValue(b),max=Math.round(Math.max(s.ask*1.3,v*2.6)),step=Math.max(10,Math.round(v/200)*1),def=s.last||Math.round(v);
  var txt=(msg||(s.mood<0?'"Oh. You again."':b.home&&b.kind!=='apt'?(b.sale?pick(LINES.hisale):line('hih',b)):line('hi',b)))+(s.known?'\nThey want '+fmt(s.ask)+'.':'');
  var html='<div class="deal"><div class="deal-v"><small>Your offer</small><b id="dl-v">'+fmt(def)+'</b>'+(caseAmt()?'<span>Briefcase: '+fmt(caseAmt())+'</span>':'')+'</div><input id="dl-r" type="range" min="0" max="'+max+'" step="'+step+'" value="'+def+'" aria-label="Offer amount"></div>';
  var cur=def;
  var btns=[{t:'Make the offer',s:'Buy '+b.name+' outright',fn:function(){offer(b,cur,phone,false);}},
    caseAmt()?{t:'Open the briefcase and offer',s:'Cash on the table talks',fn:function(){offer(b,cur,phone,true);}}:null,
    {t:'What would you sell for?',fn:function(){s.known=1;bizTalk(b,phone,'"For you? '+fmt(s.ask)+'. And that\'s a fair price."');}},
    b.home?{t:b.kind==='apt'?'What do the units rent for?':'What would it rent for?',fn:function(){bizTalk(b,phone,'"Around here? '+fmt(bizRev(b))+' a minute'+(b.kind==='apt'?' for all '+b.units+' units.':', easy.')+'"');}}:null,
    b.home&&b.kind!=='apt'&&!phone?{t:'Can I look around inside?',fn:function(){if(b.sale||b.pers==='tired'||b.pers==='sentimental'||s.mood>0)enterHome(b,true);else bizTalk(b,phone,'"Inside? I don\'t even know you."');}}:null,
    b.home?null:{t:'Can I see the books?',fn:function(){var tr=bizRev(b);if(b.pers==='proud'||b.pers==='greedy')bizTalk(b,phone,'"The books stay private until we have a deal. It makes good money, trust me."');else bizTalk(b,phone,'"Here. About '+fmt(tr)+' a minute after costs, give or take."'+(b.pers==='tired'?' "I\'m tired, not broke."':''));}},
    b.pers==='sentimental'&&!s.promise?{t:b.home?'Promise to look after the place':'Promise to keep the name and the staff',fn:function(){s.promise=1;s.floor=Math.round(s.floor*.92);bizTalk(b,phone,'"You\'d do that? ...That means a lot. Let\'s talk numbers."');}}:null,
    {t:'Leave',cls:'sec'}].filter(Boolean);
  popup(b.name,txt,btns,'',{who:who.who,role:who.role,col:who.col,html:html,you:you,say:{ph:pick(['Say anything… "why sell?"','Say anything… "50k cash"','Say anything… "too much"']),fn:function(t){aiDeal(b,phone,t);}},after:function(el){var r=el.querySelector('#dl-r');r.oninput=function(){cur=+r.value;el.querySelector('#dl-v').textContent=fmt(cur);s.last=cur;};}});
}
function offer(b,o,phone,cash){var s=dState(b);s.offers++;s.last=o;
  if(!canAfford(o)){bizTalk(b,phone,line('broke',b));return;}
  var eff=o*(cash&&caseAmt()>=o?(b.pers==='greedy'?1.12:1.06):1)*(phone?.96:1)*(hasClass('neg')?1.05:1);
  if(b.pers==='sentimental'&&!s.promise&&eff>=s.floor){bizTalk(b,phone,line('heart',b));return;}
  if(eff>=s.ask||(eff>=s.floor&&Math.random()<.25+.6*(eff-s.floor)/Math.max(1,s.ask-s.floor))){closeDeal(b,o,eff>s.ask*1.2);return;}
  if(eff>=s.floor){var c=Math.round((o+s.ask)/2/10)*10;s.ask=Math.max(s.floor,c);s.known=1;bizTalk(b,phone,line('counter',b,{n:fmt(s.ask)}));return;}
  if(eff>=s.floor*.8){s.pat--;s.known=1;}else{s.pat-=2;s.mood--;s.ask=Math.round(s.ask*1.05);s.floor=Math.round(s.floor*1.03);}
  if(s.pat<=0){s.ban=now()+240000;s.pat=Math.max(1,PERS[b.pers].pat-1);s.mood--;save();popup(b.name,line('ban',b),[{t:'Leave',cls:'sec'}],'bad',{who:b.owner,role:(b.home?'Lives at ':'Owner, ')+b.name,col:'#8a5a3a',you:YOU});YOU=null;return;}
  save();bizTalk(b,phone,eff>=s.floor*.8?line('firm',b,{n:fmt(s.ask)}):line('insult',b));}
function closeDeal(b,o,over){var s=dState(b);payDeal(o);s.own=true;s.paid=o;s.at=now();s.grocery=!!b.grocery;s.city=b.city;s.name=b.name;s.rev=b.revv||Math.round(bizRev(b));W4().stats.deals=(W4().stats.deals||0)+1;addFame(8);
  if(b.home){s.home=1;s.kind=b.kind;s.tenant=b.kind==='apt'?'units':null;}
  if(b.rtruck){var r0=b.rtruck,w0=W4(),zz=r0.zone||zones[0];w0.trucks.push({id:now(),ind:'coffee',city:O.city,x:zz.x,z:zz.z,ry:zz.ry,stock:30,up:{},name:b.name+' (Crema)',earned:0});rtrucks.splice(rtrucks.indexOf(r0),1);dyn.remove(r0.g);delete w0.biz[b.key];O.dirty=true;note('Truck acquired',b.name+' is part of the Crema fleet now. One less rival.','good');}
  popup(b.name,line(over?'over':'accept',b),[{t:'Shake hands',fn:function(){if(b.home)setTimeout(function(){homeTalk(b);},300);}}],'',{who:b.owner,role:(b.home?'Sold you ':'Owner, ')+b.name,col:'#2fa860'});
  news('You bought '+b.name+' for '+fmt(o)+'.','good');banner('Acquired!',b.name,'good');
  if(b.grocery)note('Cheaper ingredients','Owning '+b.name+' makes ingredients 8% cheaper at your shops in '+cityName(b.city)+'.','good');
  if(b.key==='valley')note('Valley Farms is yours','Ingredients are 20% cheaper at every shop you own, in every city.','good');
  if(b.supco)note('Crema Supply Co. is yours','Crates cost 40% less here, and the store pays you.','good');
  if(b.lot||b.airport)O.dirty=true;if(b.airport){apSync();note(apName()+' is yours','Walk into the terminal: the Operations office is on the west wall. You fly free from here now.','good');}save();}
function ownedTalk(b){if(b.home){homeTalk(b);return;}var s=dState(b),rc=Math.round((b.val||bizValue(b))*.5*Math.pow(1.7,s.ren||0)),back=Math.round((b.val||bizValue(b))*.85*(1+.25*(s.ren||0)));
  popup(b.name,'"Morning, boss! We\'re doing about '+fmt(bizRev(b))+' a minute."',[{t:'Renovate · '+fmt(rc),s:'+30% revenue. You can keep renovating; it gets pricier each time',fn:function(){if(!pay(rc,'The renovation'))return;s.ren=(s.ren||0)+1;note(b.name+' renovated','Now '+fmt(bizRev(b))+'/min.','good');save();}},
    {t:'Sell it · '+fmt(back),s:'Back on the market',fn:function(){popup('Sell '+b.name+'?','You\'d get '+fmt(back)+'.',[{t:'Sell',fn:function(){G.cash+=back;delete W4().biz[b.key];note('Sold',b.name+' · +'+fmt(back),'info');if(b.lot)O.dirty=true;save();}},{t:'Keep it',cls:'sec'}]);}},{t:'Keep it up',cls:'sec'}],'',{who:b.owner,role:'Runs '+b.name+' for you',col:'#2fa860'});}
function ownedBiz(){var w=W4(),out=[];Object.keys(w.biz).forEach(function(k){if(w.biz[k].own&&!w.biz[k].home)out.push(k);});return out;}
function bizIncome(c){var w=W4(),inc=0;Object.keys(w.biz).forEach(function(k){var s=w.biz[k];if(!s.own||s.rev==null&&!s.paid)return;if(s.home&&!s.tenant)return;if(s.home&&s.city!=null&&lawOn('rent',s.city))inc-=(s.rev||0)*(1+.3*(s.ren||0))*.15;var cc=s.city!=null?s.city:cityOfLot(k);if(c!=null&&cc!==c)return;inc+=(s.rev||0)*(1+.3*(s.ren||0));});return inc;}
/* remember each owned business's earnings so they pay even when you're in another city */
function syncBizRev(){apSync();BUS.forEach(function(b){var s=W4().biz[b.key];if(s&&s.own){s.rev=Math.round(bizRev(b)/(1+.3*(s.ren||0)));s.city=b.city;s.name=b.name;}});['valley','supco:'+O.city].forEach(function(k){var s=W4().biz[k],b=k==='valley'?VALLEY():SUPCO();if(s&&s.own){s.rev=b.revv;s.city=k==='valley'?-1:O.city;s.name=b.name;}});}
function ingredientMult(loc){var w=G.w4;if(!w||!w.biz)return 1;var m=1,c=loc.city;
  Object.keys(w.biz).forEach(function(k){var s=w.biz[k];if(!s.own)return;if(s.grocery&&s.city===c)m*=.92;if(k==='valley')m*=.8;if(k==='supco:'+c)m*=.95;});m*=lawMult('ing',c);
  if(!(w.biz.valley&&w.biz.valley.own)&&w.contract&&w.contract.until>now())m*=1-w.contract.pct;return m;}
/* the supplier behind the grocery store, and Crema Supply Co. itself */
function VALLEY(){var t=TM(Math.max(0,(G.cities||1)-1)).pm;return {key:'valley',name:'Valley Farms Distribution',owner:'Earl',pers:'shrewd',type:'office',city:-1,val:Math.round(160000*t),revv:Math.round(320*t),door:{x:0,z:0}};}
function SUPCO(){var t=TM(O.city).pm;return {key:'supco:'+O.city,name:'Crema Supply Co.',owner:'Hank',pers:'practical',type:'office',city:O.city,val:Math.round(70000*t),revv:Math.round(150*t),supco:1,door:placeById('supply')||{x:0,z:0}};}
function callValley(){var w=W4(),b=VALLEY(),s=dState(b),who={who:'Earl',role:'Valley Farms Distribution',col:'#6b8a3a'};
  if(s.own){popup('Valley Farms','"Trucks are rolling, boss. Every shop of yours gets ingredients 20% cheaper."',[{t:'Great',cls:'sec'}],'',who);return;}
  var ct=w.contract&&w.contract.until>now(),fee=Math.round(9000*TM(Math.max(0,(G.cities||1)-1)).pm*(w.haggled?.88:1));
  popup('Valley Farms','"Earl speaking. Who gave you this number? ...FreshMart\'s invoices, huh. Smart. What do you want?"',[
    {t:ct?'Contract active · '+mmssS((w.contract.until-now())/1000)+' left':'Supply contract · '+fmt(fee),s:'12% cheaper ingredients at all your shops for 30 minutes',off:ct,why:'Your contract is still running.',fn:function(){if(!pay(fee,'The contract'))return;w.contract={pct:.12,until:now()+1800000};note('Supply contract signed','Ingredients 12% cheaper everywhere for 30 minutes.','good');save();}},
    {t:'Can you do better on the contract?',off:!!w.haggled,why:'Earl already gave you his best price.',fn:function(){w.haggled=1;if(Math.random()<.6)popup('Valley Farms','"For a regular? Fine. 12% off the fee."',[{t:'OK'}],'',who);else{w.haggled=2;popup('Valley Farms','"That IS the better price, friend."',[{t:'OK'}],'',who);}save();}},
    {t:'I want to buy Valley Farms',s:'The whole company',fn:function(){bizTalk(b,true);}},{t:'Bye',cls:'sec'}],'',who);}
O.callValley=callValley;
/* the briefcase: walk into a negotiation with the cash in your hand */
function caseView(){if(!P.me)return;if(!P.caseM){P.caseM=new T.Group();P.caseM.position.set(0,-.45,.06);P.me.arms[0].add(P.caseM);rb(.55,.4,.14,.05,toon(0x2a2018),0,-.1,0,P.caseM);bx(.2,.05,.05,toon(0xd4af37),0,.13,0,P.caseM);}P.caseM.visible=caseAmt()>0;}
function caseMenu(){var amts=[10000,50000,250000,1000000].map(function(a){return Math.round(a*tierM());}).filter(function(a){return a<=G.cash;});
  popup('Cash briefcase','Walk into a negotiation with cash in hand and owners take you more seriously (+6% on your offer; greedy owners like it even more).\nIn the briefcase: '+fmt(caseAmt()),
    amts.map(function(a){return {t:'Fill it with '+fmt(a),fn:function(){G.cash-=a;W4().case=caseAmt()+a;caseView();note('Briefcase packed',fmt(caseAmt())+' in cash. Go make someone an offer.','good');save();}};}).concat(caseAmt()?[{t:'Deposit the briefcase · '+fmt(caseAmt()),fn:function(){G.cash+=caseAmt();W4().case=0;caseView();toast('Deposited.','good');save();}}]:[]).concat([{t:'Done',cls:'sec'}]),'',{who:'Teller',role:'Crema Savings & Loan',col:'#2f5a46'});}
/* FreshMart: a grocery store you can walk around, with the supplier's invoices in the back office */
function groceryRoom(){
  var gb=BUS.filter(function(q){return q.grocery;})[0];if(!gb)return;
  var g=room('grocery',{name:gb.name,w:22,d:16,floor:floorT(0xf2f2ec,0xe0e4dc,4),wall:0xeef2e4,trim:0x2fa860,bg:0x2a3a2e,h:5.4}),ox=IOX.grocery;
  wallSign(g,gb.name.toUpperCase(),0,4.4,-7.8,{bg:'#2fa860',fg:'#fff',w:7,h:.9});
  for(var a=0;a<4;a++){var x=-7.5+a*4;bx(.16,2.3,7,toon(0x9aa3ad),x,1.15,-1.5,g);bx(1.2,.22,7,toon(0x7d8690),x,.11,-1.5,g);bx(1.25,.12,7.1,toon(0x2fa860),x,2.36,-1.5,g);
    for(var sh=0;sh<3;sh++){bx(1.15,.05,7,toon(0xe8ecef),x,.42+sh*.62,-1.5,g);for(var sd=-1;sd<=1;sd+=2)for(var k=0;k<11;k++){var pc=[0xe2553f,0xffc63d,0x46a9e6,0x6cc76a,0xff8a3d,0xb39ddb,0x8a5a3a,0xf06292][(a*5+sh*3+k+(sd>0?4:0))%8],ph=.22+((k*7+sh*3+a)%4)*.06;
      if((k+sh+a)%5===0)cy(.11,.11,ph+.05,toon(pc),x+sd*.36,.45+sh*.62+(ph+.05)/2,-4.7+k*.58,g,8);else bx(.36,ph,.42,toon(pc),x+sd*.36,.45+sh*.62+ph/2,-4.7+k*.58,g);}}addCol(ox+x-.6,ox+x+.6,-5,2,'grocery');
    plane(1.6,.5,flat(0xffffff,{map:signT(['Pantry','Dairy','Bakery','Snacks'][a],{bg:'#2fa860',fg:'#fff',w:256,h:80})}),x,3,2.1,g);}
  for(var p=0;p<4;p++){var st=new T.Group();st.position.set(8.5,0,-5+p*2.4);g.add(st);rb(1.8,.8,1.4,.04,toon(0x8a5a3a),0,.4,0,st);for(var j=0;j<12;j++)sp(.14,toon([0xe2553f,0xffc63d,0x6cc76a,0xff8a3d][p]),-.6+(j%4)*.4,.85,-.4+Math.floor(j/4)*.4,st,6);}addCol(ox+7.5,ox+9.5,-6,3,'grocery');
  for(var c=0;c<2;c++){counterTop(g,-6+c*4,5,2.2,0x2fa860,0xffffff);npc(g,-6.7+c*4,5.7,Math.PI,{shirt:0x2fa860});addCol(ox-7.1+c*4,ox-4.9+c*4,4.5,5.5,'grocery');}
  // back office with the invoices
  bx(4,3,.15,toon(0xd8d2c6),-8.8,1.5,-4,g);bx(.15,3,3.8,toon(0xd8d2c6),-6.8,1.5,-5.9,g);bx(1.8,.9,.9,toon(0x6b4a30),-9,.45,-6.2,g);plane(.6,.4,toon(0xffffff),-9.2,.92,-6.2,g).rotation.x=-Math.PI/2;
  addCol(ox-11,ox-6.7,-4.1,-3.9,'grocery');
  var own=npc(g,-5.5,-2,Math.PI/2,{shirt:0x8a5a3a});
  ACTS.grocery.push({x:ox-4.4,z:-2,r:1.8,label:function(){var s=W4().biz[gb.key];return s&&s.own?'Talk to '+gb.owner+' (your manager)':'Talk to '+gb.owner+' (owner)';},sub:function(){var s=W4().biz[gb.key];return s&&s.own?'Earning '+fmt(bizRev(gb))+'/min · ingredients 8% cheaper':'Ask about buying the store';},fn:function(){bizTalk(gb,false);}});
  ACTS.grocery.push({x:ox-8.6,z:-5,r:1.6,label:function(){return W4().found&&W4().found.valley?'Invoices (Valley Farms · 555-0199)':'Peek at the invoices on the desk';},sub:'Back office',fn:function(){var w=W4();w.found=w.found||{};var first=!w.found.valley;w.found.valley=1;save();
    popup('Invoice','VALLEY FARMS DISTRIBUTION\n"Your farm-to-shelf partner since 1971"\nMilk 120 cs · Flour 80 sacks · Fruit 64 cs · Cream 40 cs\nQuestions? Call Earl: 555-0199',[{t:'Call Earl now',fn:callValley},{t:'Put it back',cls:'sec'}]);if(first)note('New contact: Valley Farms','Earl supplies FreshMart, and probably half the town. He\'s in your phone now.','good');}});
  for(var s2=0;s2<5;s2++){var sh2=liteMe();sh2.root.position.set(ox-8+s2*4,0,3);dyn.add(sh2.root);shoppers.push({me:sh2,x:ox-8+s2*4,z:3,tx:ox-8+s2*4,tz:3,w:rnd(0,3),area:'grocery'});}
}
