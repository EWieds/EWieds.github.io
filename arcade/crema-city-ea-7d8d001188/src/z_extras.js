
/* ---------- more ways to make money, and a city full of secrets ---------- */

/* golden beans: twelve hidden around every city */
var GBEANS=[],gbM=null;
function goldBeans(){GBEANS=[];var p=plan,r=seeded(p.city*977+5),spots=[];
  plan.blocks.forEach(function(b){spots.push({x:b.x+(r()-.5)*(BW-10),z:b.z+(r()<.5?-1:1)*(BD/2-1.4)});});
  ['pier','lift','uni','park','mall','airport'].forEach(function(id){var q=placeById(id);if(q)spots.push({x:q.x+rnd(-4,4),z:q.z+rnd(-3,3)});});
  spots.push({x:p.xs[0]-30,z:p.zs[1]});spots.push({x:p.xs[p.C]+8,z:p.zs[p.R]+6});
  spots.sort(function(){return r()-.5;});spots=spots.slice(0,12);var got=(W4().beans||{})[p.city]||[];
  if(!gbM)gbM=toon(0xffd24a,{e:0xffb000,ei:.8});
  spots.forEach(function(s,i){if(got.indexOf(i)>=0)return;var g=new T.Group();g.position.set(s.x,.6,s.z);dyn.add(g);var b=sp(.16,gbM,0,0,0,g,8);b.scale.set(1,1.35,.8);bx(.02,.2,.1,toon(0x8a5a14),0,0,.13,g);anim.push({spin:g});
    GBEANS.push({i:i,x:s.x,z:s.z,g:g});});}
function beanActs(){if(P.area!=='city'||drv)return [];var out=[];GBEANS.forEach(function(b){if(Math.hypot(b.x-P.x,b.z-P.z)<2.2)out.push({x:b.x,z:b.z,r:2.2,label:'A golden coffee bean?!',sub:'Pick it up',fn:function(){grabBean(b);}});});return out;}
function grabBean(b){var w=W4();w.beans=w.beans||{};var got=w.beans[O.city]=w.beans[O.city]||[];if(got.indexOf(b.i)>=0)return;got.push(b.i);dyn.remove(b.g);GBEANS=GBEANS.filter(function(q){return q!==b;});
  try{tone(1046,.08,'sine',.04);tone(1318,.08,'sine',.04,.08);tone(1568,.14,'sine',.04,.16);}catch(e){}var c=Math.round(250*tierM());G.cash+=c;
  if(got.length===12){var big=Math.round(25000*tierM());G.cash+=big;addFame(25);banner('All 12 golden beans!','+'+fmt(big)+' · the Golden Bean trophy is yours','good');w.items=w.items||{};w.items['Golden Bean trophy']=1;}
  else banner('Golden bean '+got.length+'/12','+'+fmt(c),'good');save();}

/* Espresso the lost cat */
var CAT=null;
function lostCat(){CAT=null;var w=W4();if(w.f&&w.f.cat)return;var hb=plan.blocks.filter(function(b){return b.t==='homes';}),b=hb[(plan.city+1)%Math.max(1,hb.length)]||plan.blocks[plan.blocks.length-1];if(!b)return;
  var g=new T.Group();g.position.set(b.x+BW/2-2.2,.22,b.z+1.5);dyn.add(g);var o=toon(0xff8a3d);sp(.22,o,0,.22,0,g,8).scale.set(1.5,1,1);sp(.14,o,.28,.38,0,g,8);cone(.05,.1,o,.32,.52,.06,g,4);cone(.05,.1,o,.32,.52,-.06,g,4);cyB(.03,.35,o,-.32,.2,0,g,4).rotation.z=.8;CAT={g:g,x:g.position.x,z:g.position.z,held:false};}
function catActs(){if(!CAT||P.area!=='city')return [];if(CAT.held){var po=placeById('off:post');return po?[{x:po.x,z:po.z,r:2.4,label:'Return Espresso the cat',sub:'The poster at the library said…',fn:function(){var c=Math.round(1200*tierM());G.cash+=c;addFame(6);W4().f.cat=1;CAT.g.parent&&CAT.g.parent.remove(CAT.g);CAT=null;banner('Espresso is home!','The owner cried. +'+fmt(c)+' reward','good');save();}}]:[];}
  if(Math.hypot(CAT.x-P.x,CAT.z-P.z)<2)return [{x:CAT.x,z:CAT.z,r:2,label:'An orange cat',sub:'Collar says "ESPRESSO"',fn:function(){CAT.held=true;P.me.arms[0].add(CAT.g);CAT.g.position.set(0,-.4,.25);CAT.g.scale.setScalar(.7);toast('Mrow. (The post office is collecting lost pets.)','good');}}];return [];}

/* the do-box knows a few words that aren't in any manual */
function secretCmd(n){var w=W4();w.f=w.f||{};
  if(/^(xyzzy|plugh)$/.test(n)){toast('A hollow voice says "Fool."','');return true;}
  if(/up ?up ?down ?down ?left ?right ?left ?right ?b ?a/.test(n)){if(!w.f.konami){w.f.konami=1;var c=Math.round(3000*tierM());G.cash+=c;banner('30 lives!','Just kidding. +'+fmt(c),'good');save();}else toast('Nice try.','');return true;}
  if(/^\/?dance$/.test(n)){var t0=now();var iv=setInterval(function(){if(!P.me)return;P.me.root.rotation.y+=.35;P.me.root.position.y=Math.abs(Math.sin((now()-t0)/120))*.25;if(now()-t0>3000){clearInterval(iv);P.me.root.position.y=0;}},30);bubble(P.x,2.8,P.z,'♪ ♫ ♪','good');return true;}
  if(/^(where is josiah|josiah crema|who is josiah)/.test(n)){toast('The library knows. The tunnels remember.','');return true;}
  if(/^(the roastery|roastery)$/.test(n)){toast('Nobody talks about the Roastery.','');return true;}
  if(/^(money|give me money|rich|motherlode)$/.test(n)){toast('Money doesn\'t grow on trees. It grows on coffee.','');return true;}
  if(/^(hello|hi) (claude|ai)/.test(n)){toast('Hi! Go sell some coffee.','good');return true;}
  return false;}

/* night lights over the mountains, Josiah's statue, the pier fortune teller */
function oddities(){var u=placeById('uni');if(u)ACTS.city.push({x:u.x,z:u.z-4,r:2.2,label:'Josiah Crema\'s statue',sub:'His left shoe is polished from all the rubbing',fn:function(){var w=W4();if(w.rub&&now()-w.rub<300000){toast('You already rubbed it. Don\'t be weird.','');return;}w.rub=now();if(Math.random()<.25){var c=Math.round(400*tierM());G.cash+=c;banner('Lucky!','A tourist drops '+fmt(c)+' and runs. Finders keepers?','good');}else bubble(P.x,2.7,P.z,'You feel a little luckier','good');rain.next=Math.max(rain.next,300);save();}});
  var pr=placeById('pier');if(pr)ACTS.city.push({x:pr.x+3,z:pr.z,r:2,label:'Madame Zuzu · fortunes',sub:'$5',fn:fortune});
  if(plan.mtn)ACTS.city.push({x:(plan.xs[0]+plan.xs[plan.C])/2,z:plan.zs[0]-RH-4,r:6,label:'Look at the mountains',sub:function(){return clockH>20||clockH<5?'Something is blinking up there':'Pretty view';},fn:function(){if(clockH>20||clockH<5){var w=W4();if(!w.f.ufo){w.f.ufo=1;addFame(10);banner('You saw it.','Three lights. No sound. The Courier won\'t believe you.','good');save();}else toast('The lights blink twice. Like they recognize you.','');}else toast('Snow on the peaks. Ski Lodge business must be good.','');}});}
function fortune(){if(!pay(5,'Madame Zuzu'))return;var f=['"You will make a deal with a proud person. Do not lowball them."','"Something golden hides where the coffee shops can\'t see."','"Round doors lead to old money."','"A cat is waiting for you. An orange one."','"The old men in the back room are watching you."','"Buy low. Sell high. That one is free advice."','"The tallest building is not the richest one. Ask an analyst."'];
  popup('Madame Zuzu','She stares into a cup of espresso grounds.\n'+pick(f),[{t:'Spooky',cls:'sec'}],'',{who:'Madame Zuzu',role:'Fortunes',col:'#7a5ad8'});}

/* new money: vending machines, the Crema Club app, franchises, taxi medallions, lottery, flipping antiques, gig deliveries */
function vendActs(){if(P.area!=='city'||drv)return [];var w=W4(),vm=(w.vend||{})[O.city]||[],out=[];
  (VENDSPOTS||[]).forEach(function(s,i){var have=vm.indexOf(i)>=0;if(Math.hypot(s.x-P.x,s.z-P.z)<2.6)out.push({x:s.x,z:s.z,r:2.6,label:have?'Your Crema vending machine':'A good spot for a vending machine',sub:have?'Earning '+fmt(vendRev())+'/min':'Install one · '+fmt(vendCost()),fn:function(){if(have){toast('It\'s humming along. Restocked by Crema Supply.','');return;}if(!pay(vendCost(),'The machine'))return;w.vend=w.vend||{};(w.vend[O.city]=w.vend[O.city]||[]).push(i);O.dirty=true;note('Vending machine installed','Cold brew in a can, 24/7.','good');save();}});});return out;}
var VENDSPOTS=[];
function vendCost(){return Math.round(1800*tierM());}function vendRev(){return Math.round(22*tierM());}
function placeVendSpots(){VENDSPOTS=[];var w=W4(),vm=(w.vend||{})[O.city]||[],g=new T.Group();stat.add(g);plan.blocks.forEach(function(b,i){if(i%2===0||b.t==='park')return;var s={x:b.x+BW/2-2.4,z:b.z-BD/2+1};VENDSPOTS.push(s);
  if(vm.indexOf(VENDSPOTS.length-1)>=0){rb(.9,1.9,.7,.06,toon(0x2a1a12),s.x,.95+.2,s.z,g);plane(.7,1.1,toon(0xffc63d,{e:0xffa000,ei:.3}),s.x,1.35,s.z+.36,g);}});}
function vendIncome(){var w=W4(),n=0;Object.keys(w.vend||{}).forEach(function(c){n+=(w.vend[c]||[]).length*Math.round(22*TM(+c).pm);});return n;}
function clubApp(){var w=W4(),c=w.club;return phTop('Crema Club')+(c?'<div class="ph-card"><small>Members</small><b>'+fmt0(c.m)+'</b><small>Monthly plan</small><b>'+fmt(c.price)+'</b></div><div class="ph-list"><button type="button" class="ph-row" data-club="price"><div><b>Change the price</b><small>Higher price, fewer members</small></div></button><button type="button" class="ph-row" data-club="promo"><div><b>Run a promo · '+fmt(Math.round(3000*tierM()))+'</b><small>A burst of sign-ups</small></div></button></div>':
  '<p class="ph-empty">Launch a coffee subscription app. Members pay monthly for unlimited drip. More fame and more shops means more members.</p><div class="ph-list"><button type="button" class="ph-row" data-club="launch"><div><b>Launch Crema Club · '+fmt(Math.round(15000*tierM()))+'</b><small>Developers, servers, a cute logo</small></div></button></div>');}
function fmt0(n){return Math.round(n).toLocaleString();}
function clubAct(k){var w=W4();if(k==='launch'){var c=Math.round(15000*tierM());if(!pay(c,'The app'))return;w.club={m:50,price:Math.round(9*tierM()),t:now()};note('Crema Club is live','Members pay every month. Grow it with fame and promos.','good');}
  else if(k==='price'){var ps=[5,9,15,25].map(function(p){return Math.round(p*tierM());});popup('Crema Club price','Members now: '+fmt0(w.club.m),ps.map(function(p){return {t:fmt(p)+'/month',fn:function(){w.club.price=p;save();renderPhone();}};}));return;}
  else if(k==='promo'){var c2=Math.round(3000*tierM());if(!pay(c2,'The promo'))return;w.club.m+=Math.round(40+G.fame/10);toast('Sign-ups are pouring in.','good');}save();renderPhone();}
function clubTick(dt){var c=W4().club;if(!c)return;var target=(80+G.fame*1.2+G.locs.length*60)*Math.pow(9*tierM()/c.price,1.2);c.m+=(target-c.m)*dt/600;}
function clubIncome(){var c=W4().club;return c?c.m*c.price/30:0;}
function franchiseDesk(){var w=W4(),n=(w.fr||[]).length,c=Math.round(40000*tierM()*(1+n*.3));popup('Franchising','"Entrepreneurs want to open their own Crema. You sell the license and take a royalty forever."\nFranchises: '+n,[{t:'Sell a franchise license',s:'They pay '+fmt(c)+' now and '+fmt(Math.round(c/300))+'/min royalty',off:G.fame<300||G.locs.length<3,why:'You need 3 shops and 300 fame first.',fn:function(){G.cash+=c;w.fr=w.fr||[];w.fr.push({t:now(),roy:Math.round(c/300),name:pick(['Gina','Omar','The Lees','Bart','Sofia','Ken'])+'\'s Crema'});addFame(5);note('Franchise sold','+'+fmt(c)+' and a royalty every minute.','good');save();}},{t:'Not now',cls:'sec'}],'',{who:'Franchise office',col:'#e2553f'});}
function frIncome(){return (W4().fr||[]).reduce(function(a,f){return a+f.roy;},0);}
function medallion(){var w=W4(),n=w.taxi||0,c=Math.round(25000*tierM()*(1+n*.25));popup('Taxi medallions','"Own a medallion and a cab drives for you all day. You get the fares."\nYour cabs: '+n,[{t:'Buy a medallion · '+fmt(c),s:'About '+fmt(Math.round(60*tierM()))+'/min',fn:function(){if(!pay(c,'The medallion'))return;w.taxi=n+1;note('Your cab is on the road','Look for "CREMA CAB" on the doors.','good');save();}},{t:'Not now',cls:'sec'}],'',{who:'City Cab dispatch',col:'#ffc63d'});}
function lottery(){if(!pay(2,'A scratch ticket'))return;var r=Math.random(),w=W4();if(r<.002){var j=Math.round(100000*tierM());G.cash+=j;banner('JACKPOT!!!','+'+fmt(j),'good');addFame(20);}else if(r<.05){var s=Math.round(50*tierM());G.cash+=s;toast('Winner! +'+fmt(s),'good');}else toast(pick(['Nothing.','So close.','Not a winner.','Two out of three cherries.']),'');w.stats.lotto=(w.stats.lotto||0)+1;save();}
function antiques(b){var w=W4();w.flip=w.flip||[];var it=pick(['A brass espresso tamper','An 1890s coffee grinder','A mystery painting','A Josiah Crema bean sack','A vintage cash register','A ship\'s bell']),buy=Math.round(rnd(200,1200)*tierM());
  popup(b?b.name:'Antiques','"'+it+'. '+fmt(buy)+'. Could be worth a fortune. Could be junk."',[{t:'Buy it · '+fmt(buy),fn:function(){if(!pay(buy,it))return;w.flip.push({n:it,paid:buy,val:Math.round(buy*(Math.random()<.15?rnd(4,10):rnd(.4,1.9)))});save();toast('Get it appraised at the pawn counter (Holdings app, or any antiques store).','good');}},
    w.flip.length?{t:'Get my things appraised',fn:function(){popup('Appraisal',w.flip.map(function(f){return f.n+': worth '+fmt(f.val)+' (paid '+fmt(f.paid)+')';}).join('\n'),[{t:'Sell everything · '+fmt(w.flip.reduce(function(a,f){return a+f.val;},0)),fn:function(){var t=w.flip.reduce(function(a,f){return a+f.val;},0),p=w.flip.reduce(function(a,f){return a+f.paid;},0);G.cash+=t;w.flip=[];banner(t>=p?'Profit!':'Ouch','Sold for '+fmt(t)+' (paid '+fmt(p)+')',t>=p?'good':'bad');save();}},{t:'Keep them',cls:'sec'}]);}}:null,{t:'Just looking',cls:'sec'}].filter(Boolean),'',{who:b?b.owner:'Dealer',role:'Antiques',col:'#8a5a3a'});}
function gigApp(){var w=W4(),g=w.gig;return phTop('CremaDash')+(g&&g.state?'<div class="ph-card gl"><small>Current gig</small><b>'+esc(g.what)+'</b><small>'+esc(g.state==='pick'?'Pick up at '+g.fromN:'Drop off at '+g.toN)+'</small></div>':'<p class="ph-empty">Deliver food for other restaurants when you\'re out and about. Fast drops earn tips.</p><div class="ph-list"><button type="button" class="ph-row" data-gig="1"><div><b>Find a gig</b><small>Usually '+fmt(Math.round(25*tierM()))+'–'+fmt(Math.round(70*tierM()))+'</small></div></button></div>');}
function takeGig(){var rs=BUS.filter(function(b){return isEatery(b)&&b.door;}),hs=HOMES.filter(function(h){return h.door;});if(!rs.length||!hs.length){toast('No gigs nearby.','');return;}var a=pick(rs),b=pick(hs),pa=placeById('biz:'+a.key),pb=placeById('home:'+b.key);
  W4().gig={state:'pick',what:pick(['2 burritos','A family pizza','Sushi for 4','Pad thai','A brisket plate']),from:{x:pa.x,z:pa.z},fromN:a.name,to:{x:pb.x,z:pb.z},toN:b.name,t:now(),pay:Math.round(rnd(25,70)*tierM())};closePhone();navTo({x:pa.x,z:pa.z,name:a.name});note('Gig accepted','Pick up at '+a.name+'.','good');save();}
function gigActs(){var g=W4().gig;if(!g||!g.state||P.area!=='city')return [];var p=g.state==='pick'?g.from:g.to;return [{x:p.x,z:p.z,r:2.6,label:g.state==='pick'?'Pick up '+g.what:'Deliver '+g.what,sub:'CremaDash · '+fmt(g.pay),fn:function(){if(g.state==='pick'){g.state='drop';g.t2=now();navTo({x:g.to.x,z:g.to.z,name:g.toN});toast('Picked up. Go!','good');}else{var fast=(now()-g.t2)<60000,tip=fast?Math.round(g.pay*.4):0;G.cash+=g.pay+tip;W4().gig=null;banner('Delivered',fmt(g.pay)+(tip?' + '+fmt(tip)+' tip':''),'good');addXP(10);}save();}}];}
function extraIncome(){var w=W4();return vendIncome()+clubIncome()+frIncome()+(w.taxi||0)*Math.round(60*tierM());}
