
/* ---------- supplies ---------- */
var SUP={
  beans:{name:'Coffee beans',inds:['coffee'],u:40,price:14,col:0x6b3a1f},
  milk:{name:'Milk crate',inds:['coffee','icecream'],u:30,price:9,col:0xf4f4f4},
  cups:{name:'Cups & lids',inds:['coffee','bakery','juice','icecream'],u:28,price:7,col:0x8fd3ff},
  flour:{name:'Flour sacks',inds:['bakery'],u:40,price:12,col:0xeadcc0},
  fruit:{name:'Fruit crate',inds:['juice'],u:36,price:16,col:0xff8a3d},
  cream:{name:'Cream & cones',inds:['icecream'],u:36,price:15,col:0xffc8d8}
};
var SUP_ORDER=['beans','milk','cups','flour','fruit','cream'];
function supPrice(k){var m=(civ().policy==='supply'?.75:1)*((W4().biz['supco:'+O.city]||{}).own?.6:1);return Math.round(SUP[k].price*(1+G.lvl*.05)*Math.pow(1.8,O.city)*m);}
O.costMult=function(loc){var w=G.w4;return (w&&w.stock&&w.stock[loc.ind]>0&&SH&&SH.loc===loc?.5:1)*ingredientMult(loc);};
var outWarned={};
O.use=function(loc,n){var w=G.w4;if(!w||!w.stock||!(w.stock[loc.ind]>0))return;(w.f=w.f||{}).stockShift=1;w.stock[loc.ind]=Math.max(0,w.stock[loc.ind]-n);
  if(w.stock[loc.ind]===0&&!outWarned[loc.ind]){outWarned[loc.ind]=1;setTimeout(function(){outWarned[loc.ind]=0;},60000);
    var msg='Ingredient costs are back to full price. Pick up crates at Crema Supply Co., or call them for a delivery.';
    if(O.on)note('Out of '+IND[loc.ind].name.toLowerCase()+' supplies',msg,'bad',{label:'Directions',fn:function(){navTo(placeById('supply'));}});else{toast('Storeroom is out of supplies. Costs are back to full price.','bad');note('Out of supplies',msg,'bad');}}};
function unload(list,loc){var w=W4(),add={};list.forEach(function(k){var s=SUP[k];s.inds.forEach(function(ik){var u=Math.round(s.u/s.inds.length*(s.inds.length>1?1.5:1));w.stock[ik]=(w.stock[ik]||0)+u;add[ik]=(add[ik]||0)+u;});});
  var txt=Object.keys(add).map(function(ik){return '+'+add[ik]+' '+IND[ik].name.toLowerCase();}).join(', ');
  W4().f.stocked=1;note('Storeroom stocked',txt+'. Ingredient costs are half price while it lasts.','good');addXP(list.length*6);try{sfx.load();}catch(e){}save();}
function loadTrunk(){var w=W4();var n=0;while(P.carry.length&&w.trunk.length<w.tcap){w.trunk.push(P.carry.shift());n++;}carryView();trunkView();if(P.carry.length)popup('The bed is full','Your pickup holds '+w.tcap+' crates. Drive these to a shop and unload, then come back.',[{t:'OK'}],'bad');else if(n)toast('Loaded '+n+' crate'+(n>1?'s':'')+'.','good');save();}

/* ---------- construction: Bob's Builders ---------- */
function jobsFor(key){
  var w=W4(),own=w.land[key],out=[],lien=liened();
  if(key.indexOf('shop:')===0){var loc=G.locs.filter(function(l){return 'shop:'+l.id===key;})[0];if(!loc)return out;
    var nx=loc.size+1;if(SIZES[nx])out.push({t:'Expand to a '+SIZES[nx].name+' · '+fmt(sizeCost(loc)),s:'More counter spots and stations. About '+mmssS(45+nx*30)+'.',fn:function(){startBuild('shop:'+loc.id,null,{kind:'size',loc:loc.id,cost:sizeCost(loc),sec:45+nx*30});}});
    if((loc.decor||0)<5)out.push({t:'New storefront & sign · '+fmt(decorCost(loc)),s:'+1 decor (same as the Shop tab). 30 seconds.',fn:function(){startBuild('shop:'+loc.id,null,{kind:'decor',loc:loc.id,cost:decorCost(loc),sec:30});}});
    return out;}
  if(!own)return out;var D=district(cityOfLot(key),own.d),mine=G.locs.filter(function(l){return l.city===cityOfLot(key)&&l.did===own.d;})[0],lp=landPrice(D);
  if(!own.use)out.push({t:'Build anything you can imagine',s:'A water park? A race track? HQ? Describe it and Bob quotes it',fn:function(){devPrompt(key);}});
  if(own.use){out.push({t:'Demolish and clear the lot · '+fmt(lp*.1),s:'Back to an empty lot. 20 seconds.',fn:function(){startBuild(key,D,{kind:'clear',cost:lp*.1,sec:20});}});return out;}
  if(!mine)IND_ORDER.forEach(function(ik){var I=IND[ik];if(G.lvl<I.lvl||G.lvl<D.lvl)return;var c=Math.round(locCost(cityOfLot(key),D.id,ik)*.65),t=Math.min(600,Math.round(60+c/400));
    out.push({t:'A new Crema '+I.name+' · '+fmt(c),s:'Opens as a new location in '+D.name+'. About '+mmssS(t)+'.',fn:function(){startBuild(key,D,{kind:'shop',ind:ik,cost:c,sec:t});}});});
  else out.push({t:'A patio for '+mine.name+' · '+fmt(1500+G.lvl*400),s:'+3 decor at your shop here. About 1 minute.',fn:function(){startBuild(key,D,{kind:'patio',loc:mine.id,cost:1500+G.lvl*400,sec:60});}});
  out.push({t:'Retail space to lease out · '+fmt(lp*1.6),s:'Dana finds a tenant who pays '+fmt(leaseRate(D))+'/min. 90 seconds to build.',fn:function(){startBuild(key,D,{kind:'lease',cost:lp*1.6,sec:90});}});
  out.push({t:'A billboard · '+fmt(lp*.5),s:'+8% customers for your shops in '+D.name+'. 45 seconds.',fn:function(){startBuild(key,D,{kind:'billboard',cost:lp*.5,sec:45});}});
  out.push({t:'A parking lot · '+fmt(lp*.7),s:'+6% customers in '+D.name+'. 1 minute.',fn:function(){startBuild(key,D,{kind:'parking',cost:lp*.7,sec:60});}});
  return out;
}
function liened(){return (W4().tax.bills||[]).filter(function(b){return !b.paid;}).length>=3;}
function startBuild(key,D,o){
  if(liened()){popup('Permits on hold','City Hall won\'t issue building permits while you have 3 or more unpaid tax bills. Pay them at City Hall (or on your phone if you\'ve registered).',[{t:'Directions to City Hall',fn:function(){navTo(placeById('hall'));}},{t:'OK',cls:'sec'}],'bad');return;}
  if(!pay(o.cost,'This job'))return;
  var fast=civ(cityOfLot(key.indexOf('shop:')===0?(G.locs.filter(function(l){return 'shop:'+l.id===key;})[0]||{city:O.city}).city:key)).policy==='permits'?.6:1,sec=Math.round(o.sec*fast);
  var travel=O.on&&P.area==='city'?clamp(routeLen(route({x:plan.xs[0]-30,z:plan.AZ},crewTarget(key)))/9,10,30):12;
  if(o.kind==='dept'||o.kind==='decor'||o.kind==='size')travel=Math.min(travel,8);
  var b={key:key,d:D?D.id:null,kind:o.kind,ind:o.ind,loc:o.loc,dept:o.dept,sec:sec,arrive:now()+travel*1000,t0:now()+travel*1000};
  W4().builds.push(b);if(['shop','patio','lease','billboard','parking'].indexOf(o.kind)>=0)W4().f.built=1;save();note('Bob\'s Builders','"On our way! About '+Math.round(travel)+' seconds out." Then '+mmssS(sec)+' of work.','good');
  if(O.on&&P.area==='city'&&o.kind!=='decor'&&o.kind!=='size'&&o.kind!=='dept'){crewTruck(crewTarget(key),travel);rebuild();}else if(O.on&&o.kind==='dept')rebuildArea();
}
function crewTarget(key){var s=null;ACTS.city.forEach(function(a){if(a.dn&&a.dn.key===key&&!s)s={x:a.x,z:a.z};});if(!s){var p=placeById(key.indexOf('shop:')===0?key:'land:'+key)||placeById('site:'+key);if(p)s={x:p.x,z:p.z};}return s||{x:P.x,z:P.z};}
function finishBuilds(){var w=W4(),changed=false,cityChanged=false;
  w.builds.forEach(function(b){if(b.done||b.arrive>now()||prog(b)<1)return;b.done=true;changed=true;if(cityOfLot(b.key)===O.city||b.key.indexOf('shop:')===0)cityChanged=true;
    var land=w.land[b.key],D=b.d?district(cityOfLot(b.key),b.d):null;
    if(b.kind==='shop'){var loc=newLoc(cityOfLot(b.key),b.d,b.ind);loc.w4lot=b.key;G.locs.push(loc);delete w.land[b.key];banner('Grand opening!','Crema '+IND[b.ind].name+' · '+loc.name,'good');
      note('Grand opening','Your new '+IND[b.ind].name.toLowerCase()+' in '+loc.name+' is open. Hire a manager, barista and server so it runs without you.','good',{label:'Hire staff',fn:function(){openShop(G.locs.indexOf(loc),'staff');}});addXP(200+G.lvl*20);}
    else if(b.kind==='patio'){var l=G.locs.filter(function(x){return x.id===b.loc;})[0];if(l)l.decor=Math.min(10,(l.decor||0)+3);if(land){land.use='patio';land.loc=b.loc;}note('Patio finished','+3 decor. Every table filled within minutes.','good');}
    else if(b.kind==='size'){var l2=G.locs.filter(function(x){return x.id===b.loc;})[0];if(l2&&SIZES[l2.size+1]){l2.size++;G.rebuild=true;note(SIZES[l2.size].name+' finished',l2.name+' has more room behind the counter.','good');}}
    else if(b.kind==='decor'){var l3=G.locs.filter(function(x){return x.id===b.loc;})[0];if(l3){l3.decor=Math.min(5,(l3.decor||0)+1);G.rebuild=true;note('Storefront done',l3.name+' looks sharp. +1 decor.','good');}}
    else if(b.kind==='dev'){if(land&&land.pendingDev){land.use='dev';land.dev=land.pendingDev;delete land.pendingDev;note(land.dev.label+' is open!','Earning about '+fmt(land.dev.rev)+'/min.','good');addXP(150);}}
    else if(b.kind==='lease'){if(land){land.use='lease';land.tenant=null;land.vac=now();}note('Retail space ready','Dana is already showing it to tenants.','good');}
    else if(b.kind==='billboard'){if(land)land.use='billboard';note('Billboard is up','Your ad is lit up over '+(D?D.name:'town')+'.','good');}
    else if(b.kind==='parking'){if(land)land.use='parking';note('Parking lot open','Customers can park right outside now.','good');}
    else if(b.kind==='clear'){if(land){land.use=null;land.tenant=null;}note('Lot cleared','Ready for whatever you build next.','good');}
    else if(b.kind==='super'){var c=cityOfLot(b.key);w.supers[c]={depts:{},garage:0,at:now()};banner('Superstore built!','Walk in and add departments','good');note('Crema Superstore','The building is up. Walk in and pick your first departments.','good',{label:'Directions',fn:function(){navTo(placeById('super'));}});addXP(800);}
    else if(b.kind==='expand'){var Sx=w.supers[cityOfLot(b.key)];if(Sx){Sx.exp=(Sx.exp||0)+1;note('Superstore floor '+(Sx.exp+1)+' open','Now '+fmt(superIncome(cityOfLot(b.key)))+'/min.','good');}}
    else if(b.kind==='garage'){var S=w.supers[cityOfLot(b.key)];if(S){S.garage=(S.garage||0)+1;note('Garage level '+S.garage,'+25% superstore sales per level.','good');}}
    else if(b.kind==='dept'){var S2=w.supers[cityOfLot(b.key)];if(S2){S2.depts[b.dept]=(S2.depts[b.dept]||0)+1;note(DEPTS[b.dept].n+(S2.depts[b.dept]>1?' level '+S2.depts[b.dept]:' is open'),'Superstore now makes '+fmt(superIncome(cityOfLot(b.key)))+'/min.','good');}}
    try{sfx.bell();}catch(e){}});
  w.builds=w.builds.filter(function(b){return !b.done;});if(changed){save();if(O.scene&&cityChanged)O.dirty=true;if(O.on&&cityChanged)rebuild();}}
O.finishBuilds=finishBuilds;

/* ---------- superstore ---------- */
var DEPTS={coffee:{n:'Coffee counter',ind:'coffee',base:55,lvl:1},bakery:{n:'Bakery',ind:'bakery',base:80,lvl:10},juice:{n:'Juice bar',ind:'juice',base:120,lvl:16},icecream:{n:'Ice cream parlor',ind:'icecream',base:180,lvl:22},
  kitchen:{n:'Kitchen & dining',base:150,lvl:14},grocery:{n:'Grocery aisles',base:45,lvl:12},rest:{n:'Restrooms',bonus:.1,base:0,lvl:12},kids:{n:'Kids play area',bonus:.08,base:0,lvl:13}};
var DEPT_ORDER=['coffee','bakery','juice','icecream','kitchen','grocery','rest','kids'];
function superOf(c){return W4().supers[c==null?O.city:c]||null;}
function superCost(){return Math.round(55000*tierM()*TM(O.city).cm/TM(O.city).pm);}
function garageCost(l){return Math.round(14000*Math.pow(1.9,l-1)*tierM());}
function deptCost(k,lvl){var d=DEPTS[k];return Math.round((d.base||70)*30*Math.pow(1.75,lvl)*tierM());}
function deptInc(k,lvl){var d=DEPTS[k];return d.base?d.base*Math.pow(1.45,lvl-1):0;}
function superIncome(c){c=c==null?O.city:c;var S=superOf(c);if(!S)return 0;var base=0,bon=0;Object.keys(S.depts).forEach(function(k){var l=S.depts[k];if(!l)return;base+=deptInc(k,l);if(DEPTS[k].bonus)bon+=DEPTS[k].bonus*Math.min(3,l);});
  return base*(1+.25*(S.garage||0))*(1+.4*(S.exp||0))*(1+bon)*TM(c).pm*(civ(c).policy==='tourism'?1.15:1);}
function superExpCost(S){return Math.round(superCost()*.6*Math.pow(1.9,S.exp||0));}
function startExpand(lot){var S=superOf(),c=superExpCost(S);popup('Add floor '+((S.exp||0)+2)+'?','+40% to everything the superstore sells. There\'s no height limit, but every floor costs more.\n'+fmt(c)+' · about '+mmssS(120+(S.exp||0)*30),[{t:'Call Bob · '+fmt(c),fn:function(){startBuild(O.city+':market:super',null,{kind:'expand',cost:c,sec:120+(S.exp||0)*30});}},{t:'Not now',cls:'sec'}]);}
function startSuper(lot){
  if(G.lvl<12){popup('Not yet','A superstore needs level 12. You are level '+G.lvl+'.',[{t:'OK'}],'bad');return;}
  if(!hasPermit('comm')){popup('You need a commercial permit','The city zoned this lot for big retail. Apply for a commercial zoning permit at City Hall first.',[{t:'Directions to City Hall',fn:function(){navTo(placeById('hall'));}},{t:'OK',cls:'sec'}],'bad');return;}
  popup('Build a Crema Superstore?','A big hall with room for coffee, a bakery, a juice bar, ice cream, a kitchen, grocery aisles, restrooms and a kids area. You add departments one at a time, and each can be upgraded forever.\n\nBuilding: '+fmt(superCost())+' · about 6 minutes',[
    {t:'Call Bob · '+fmt(superCost()),fn:function(){startBuild(lot.key,{id:'market',name:'Market Square'},{kind:'super',cost:superCost(),sec:360});}},{t:'Not now',cls:'sec'}]);
}
function startGarage(lot){var S=superOf(),l=(S.garage||0)+1;if(l>5){popup('Garage is full height','Five levels is the zoning limit.',[{t:'OK'}]);return;}
  popup(l===1?'Build a parking garage?':'Add garage level '+l+'?','+25% superstore sales per level. '+fmt(garageCost(l))+' · about '+mmssS(60+l*30),[{t:'Call Bob · '+fmt(garageCost(l)),fn:function(){startBuild(lot.key,null,{kind:'garage',cost:garageCost(l),sec:60+l*30});}},{t:'Not now',cls:'sec'}]);}

/* ---------- food trucks (Food Truck Wars lives here now) ---------- */
function truckCost(ik){return Math.round((6000+IND[ik].cm*1800)*tierM());}
function truckCap(t){return 60*(1+(t.up.fridge||0));}
function truckRate(t,z){var I=IND[t.ind],base=(6+4*Math.log(1+I.pm*4))*I.pm*TM(t.city).pm;var hr=clockH,tod=hr<7||hr>21?.25:1+.5*Math.exp(-Math.pow((hr-12.5)/1.6,2))+.3*Math.exp(-Math.pow((hr-18)/1.5,2));
  var riv=rtrucks.some(function(r){return r.zone===z;})&&!lawOn('rivals',t.city)?.55:1;return base*z.dem*tod*riv*warMult(z)*lawMult('truck',t.city)*(t.dmg>60?.8:1)*(1+.15*(t.up.wrap||0))*(1+.12*(t.up.speaker||0))*(1+.25*(t.up.window||0))*(rain.on?.7:1);}
function truckZone(v){var p=v.g.position;for(var i=0;i<zones.length;i++){var z=zones[i];if(Math.hypot(z.x-p.x,z.z-p.z)<4)return z;}return null;}
function nearestZone(x,z){var b=null,bd=1e9;zones.forEach(function(q){var d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;b=q;}});return b?{x:b.x,z:b.z+(b.z>0?-1:1)*0,name:'Food truck zone · '+b.name}:null;}
function buyTruck(ik){var I=IND[ik];
  if(G.lvl<I.lvl){popup('Not yet','The '+I.name.toLowerCase()+' truck unlocks at level '+I.lvl+'.',[{t:'OK'}],'bad');return;}
  if(!hasPermit('vend')){popup('You need a street vending permit','Food trucks can only sell with a city vending permit. City Hall issues them at the Permits window.',[{t:'Directions to City Hall',fn:function(){navTo(placeById('hall'));}},{t:'OK',cls:'sec'}],'bad');return;}
  var c=truckCost(ik);popup('Crema '+I.name+' truck','"She\'s a beauty. Generator, fridge, serving window, and that '+(ik==='coffee'?'giant cup':ik==='bakery'?'giant donut':ik==='juice'?'giant smoothie':'giant cone')+' on the roof turns heads."\n\nPark it in a striped FOOD TRUCK zone and it sells on its own while it has stock. Load it with crates from Crema Supply Co.',[
    {t:'Buy it · '+fmt(c),fn:function(){if(!pay(c,'The truck'))return;var b=blockOf('motors'),n=W4().trucks.length;var t={id:now(),ind:ik,city:O.city,x:b.x-BW/2+4+n*7.5,z:b.z+BD/2+1.15,ry:Math.PI/2,stock:20,up:{},name:'Crema '+I.name+(n?' #'+(n+1):''),earned:0};W4().trucks.push(t);save();
      note('Truck purchased','It\'s parked at the curb outside Crema Motors with 20 servings on board. Drive it to a food truck zone.','good');initVehicles();}},{t:'Just looking',cls:'sec'}],'',{who:'Vince',role:'Crema Motors',col:'#e2553f'});}
function loadTruck(v){var t=v.truck,n=0;P.carry=P.carry.filter(function(k){if(SUP[k].inds.indexOf(t.ind)<0)return true;if(t.stock>=truckCap(t))return true;t.stock=Math.min(truckCap(t),t.stock+SUP[k].u*.75);n++;return false;});carryView();
  if(n)toast('Loaded '+n+' crate'+(n>1?'s':'')+'. Stock '+Math.round(t.stock)+'/'+truckCap(t),'good');else popup('Wrong crates','A '+IND[t.ind].name.toLowerCase()+' truck needs '+SUP_ORDER.filter(function(k){return SUP[k].inds.indexOf(t.ind)>=0;}).map(function(k){return SUP[k].name.toLowerCase();}).join(' or ')+'.',[{t:'OK'}],'bad');save();}
var TRUCK_UP={fridge:{n:'Bigger fridge',s:'+60 servings capacity',c:2500},wrap:{n:'Custom wrap',s:'+15% sales',c:3000},speaker:{n:'Speaker & music',s:'+12% sales',c:2200},window:{n:'Second window',s:'+25% sales',c:6000}};
function truckMenu(v){var t=v.truck,opts=[];if(truckZone(v))opts.push({t:'Work the window yourself',s:'60 seconds of serving. Match the orders, earn tips',fn:function(){workWindow(v);}});if(FEST&&FEST.until>now()&&truckZone(v)&&truckZone(v).park)opts.push({t:'Enter the cook-off',s:'Describe your dish to the judges',fn:function(){cookOff(v);}});
  var nearSup=Math.hypot(placeById('supply').x-v.g.position.x,placeById('supply').z-v.g.position.z)<16,refill=Math.round((truckCap(t)-t.stock)*supPrice(SUP_ORDER.filter(function(k){return SUP[k].inds.indexOf(t.ind)>=0;})[0])/24);
  if(t.stock<truckCap(t))opts.push({t:nearSup?'Restock here · '+fmt(refill):'Restock at Crema Supply Co.',s:nearSup?'Fill to '+truckCap(t)+' servings':'Drive the truck to Market Square, or load crates by hand',off:!nearSup,why:'Park within a few meters of Crema Supply Co.',fn:function(){if(!pay(refill,'Restocking'))return;t.stock=truckCap(t);save();toast('Truck restocked.','good');}});
  Object.keys(TRUCK_UP).forEach(function(k){var u=TRUCK_UP[k],l=t.up[k]||0,c=Math.round(u.c*Math.pow(2.2,l)*tierM());opts.push({t:u.n+(l?' '+(l+1):'')+' · '+fmt(c),s:u.s,fn:function(){if(!pay(c,u.n))return;t.up[k]=l+1;save();note('Truck upgraded',u.n+' installed on '+t.name+'.','good');}});});
  popup(t.name,'Stock '+Math.round(t.stock)+'/'+truckCap(t)+' · earned '+fmt(t.earned||0)+' so far'+(truckZone(v)?'\nSelling about '+fmt(truckRate(t,truckZone(v)))+'/min right now':''),opts);}
var RIVAL_TRUCKS=['Taco Tornado','Bao Wow','The Rolling Scone','Wok This Way','Grill Seeker','Brew-ha-ha Van'];
function initRivalTrucks(){rtrucks.forEach(function(r){dyn.remove(r.g);});rtrucks=[];if(G.lvl<8)return;var n=Math.min(3,1+Math.floor(G.lvl/10));
  for(var i=0;i<n;i++){var nm=RIVAL_TRUCKS[(O.city*3+i)%RIVAL_TRUCKS.length],g=truckModel(pick(IND_ORDER),nm),r={g:g,name:nm,zone:null,t:0};dyn.add(g);rtrucks.push(r);moveRival(r);}}
function moveRival(r){var free=zones.filter(function(z){return !rtrucks.some(function(o){return o!==r&&o.zone===z;});});var z=pick(free);r.zone=z;r.t=rnd(150,320);r.g.position.set(z.x,0,z.z);r.g.rotation.y=z.ry;}
function updRivalTrucks(dt){rtrucks.forEach(function(r){r.t-=dt;if(r.t<=0){var d=Math.hypot(r.g.position.x-P.x,r.g.position.z-P.z);if(!O.on||d>45)moveRival(r);else r.t=20;}});}
function rivalTruckActs(){return rtrucks.map(function(r){var p=r.g.position;return {x:p.x,z:p.z,r:3.4,label:'Talk to '+r.name,sub:'Rival truck · halves sales for anyone sharing this zone',fn:function(){var c=Math.round(600*tierM()*(1+G.lvl*.05));
  popup(r.name,'"This is our spot, friend. Been parking here since the spring."',[{t:'Pay them to move on · '+fmt(c),s:'They leave this zone for a while',fn:function(){if(!pay(c,'The payoff'))return;bubble(p.x,3,p.z,'Pleasure doing business!','good');r.zone=null;r.t=0;r.g.position.set(-9999,0,-9999);setTimeout(function(){moveRival(r);},240000);}},{t:'Start a price war',s:'Undercut them hard. Someone blinks first',off:!r.zone||!veh.some(function(v){return v.kind==='truck'&&truckZone(v)===r.zone;}),why:'Park one of your trucks in this zone first.',fn:function(){priceWar(r);}},{t:'Buy their truck',s:'Every truck has a price',fn:function(){rivalBuyout(r);}},{t:'Buy a taco ($4)',s:'Know your enemy',fn:function(){if(pay(4,'A taco'))toast(pick(['Honestly? Pretty good.','Too much cilantro.','You see why people line up.']));}},{t:'Leave',cls:'sec'}],'',{who:r.name,role:'Rival food truck',col:'#e2553f'});}};});}

/* ---------- money on a timer: tenants, trucks, superstores, taxes, the bank ---------- */
var econT=0,PERIOD=480;
function kioskAll(){var w=W4(),t=0;Object.keys(w.kiosk||{}).forEach(function(c){t+=60*TM(+c).pm*w.kiosk[c];});return t;}
function ventureIncomeCity(c){var w=W4(),inc=superIncome(c)+bizIncome(c);Object.keys(w.land).forEach(function(k){var l=w.land[k];if(cityOfLot(k)===c&&l.use==='dev'&&l.dev)inc+=l.dev.rev*devLive(l.dev.type);});Object.keys(w.land).forEach(function(k){var l=w.land[k];if(cityOfLot(k)!==c||l.use!=='lease'||!l.tenant)return;inc+=leaseRate(district(c,l.d))*(1+.1*(l.bump||0))*(l.tower?2:1)*(c===O.city?1:1);});return inc;}
function econTick(dt){
  if(!G||!G.w4)return;var w=W4(),inc=0;if((w.led||0)>G.cash)w.led=Math.max(0,G.cash);
  for(var c=0;c<Math.max(1,G.cities||1);c++){var v=ventureIncomeCity(c);inc+=v;}inc+=bizIncome(-1)+kioskAll()+extraIncome();
  w.trucks.forEach(function(t){if(t.city!==O.city)return;var v=veh.filter(function(x){return x.truck===t;})[0];if(!v||(drv&&drv.v===v))return;var z=truckZone(v);if(!z||t.stock<=0)return;
    var r=truckRate(t,z),sold=r*dt/60/Math.max(1,IND[t.ind].pm*TM(t.city).pm*4);t.stock=Math.max(0,t.stock-sold);var m=r*dt/60;inc+=m;t.earned=(t.earned||0)+m;
    if(t.stock<=0)note(t.name+' sold out','Load crates or restock at Crema Supply Co.','bad',{label:'Directions',fn:function(){navTo(placeById('supply'));}});
    t.vis=(t.vis||0)+dt*Math.min(10,r/8)/60;if(t.vis>=1&&O.on){t.vis=0;truckCustomer(v);}});
  if(inc){G.cash+=inc/60*dt;G.stats.passive+=inc/60*dt;if(SH&&SH.phase!=='done')SH.s.passive+=inc/60*dt;}
  // tenants come and go
  Object.keys(w.land).forEach(function(k){var l=w.land[k];if(l.use==='lease'&&!l.tenant&&l.vac&&now()-l.vac>rnd(40000,90000)&&!l.dana){l.tenant=pick(TENANTS);l.vac=0;note('New tenant','Dana signed '+l.tenant.n+'. Rent starts now.','good');if(O.on&&cityOfLot(k)===O.city)O.dirty=true;}});
  homeTick(dt);apTick(dt);caterTick(dt);projTick();textTick(dt);civicTick(dt);festTick(dt);crashTick();mktTick(dt);courtTick();synTick();loanTick();crewTick(dt);econTick2(dt);chaiTick(dt);clubTick(dt);incTick(dt);chimeTick();celebTick(dt);victorTick(dt);
  econT+=dt;if(econT>=PERIOD){econT=0;periodEnd();}
}
O.econTick=econTick;
function cityTax(c){var t=0;G.locs.forEach(function(l){if(l.city!==c)return;var e=locEcon(l);t+=e.rev*.035+(30+20*l.size)*TM(c).pm/8;});
  Object.keys(W4().land).forEach(function(k){if(cityOfLot(k)===c)t+=landPrice(district(c,W4().land[k].d))*.002;});t+=ventureIncomeCity(c)*.05;
  var cr=taxCredits(c);return t*(1-cr.total)*lawMult('tax',c)*PERIOD/60;}
function taxCredits(c){var v=civ(c),staff=0,dec=0,l=[];G.locs.forEach(function(x){if(x.city!==c)return;ROLE_ORDER.forEach(function(r){staff+=x.staff[r]||0;});dec=Math.max(dec,x.decor||0);});
  var patio=Object.keys(W4().land).some(function(k){return cityOfLot(k)===c&&W4().land[k].use==='patio';});
  if(staff>=6)l.push(['Hire-local credit',.15]);if(patio||dec>=3)l.push(['Main Street revival credit',.1]);if(v.council)l.push(['Council member',.15]);if(v.policy==='holiday')l.push(['Small business tax holiday',.4]);
  var tot=Math.min(.75,l.reduce(function(s,q){return s+q[1];},0));return {list:l,total:tot,staff:staff};}
function periodEnd(){
  var w=W4(),amt=0;for(var c=0;c<Math.max(1,G.cities||1);c++)amt+=cityTax(c);amt=Math.round(amt);
  if(amt>0){var bill={id:now(),amt:amt,due:now()+PERIOD*1000,paid:false,late:false};w.tax.bills.push(bill);
    if(w.tax.auto&&G.cash>=amt){G.cash-=amt;bill.paid=true;w.tax.paid+=amt;}
    else if(!w.tax.auto)note('Tax bill: '+fmt(amt),'Due in '+mmssS(PERIOD)+'. Pay at City Hall'+(w.tax.visited?' or on your phone':'')+'.','info',{label:w.tax.visited?'Pay now':'Directions',fn:function(){if(w.tax.visited)payTaxes();else navTo(placeById('hall'));}});}
  w.tax.bills.forEach(function(b){if(!b.paid&&!b.late&&b.due<now()){b.late=true;b.amt=Math.round(b.amt*1.1);note('Late fee','A tax bill is overdue: +10%. Three unpaid bills and the city stops issuing building permits.','bad');}});
  w.tax.bills=w.tax.bills.filter(function(b){return !b.paid||now()-b.id<PERIOD*3000;});
  var b=w.bank,lines=[],took=0;if(amt>0){var pd=w.tax.auto&&bill&&bill.paid;lines.push('City taxes: '+fmt(amt)+(pd?' (autopay)':' (bill, not paid yet)'));if(pd)took+=amt;}
  if(b.loan>0){var i=Math.round(b.loan*bankRate());if(G.cash>=i){G.cash-=i;took+=i;lines.push('Bank loan interest ('+(bankRate()*100).toFixed(1)+'%): '+fmt(i));}else{b.loan+=i;lines.push('Loan interest added to your balance: '+fmt(i));}b.intPaid=(b.intPaid||0)+i;}
  if(b.sav>0){var si=Math.min(25000*TM(Math.max(0,(G.cities||1)-1)).pm,Math.round(b.sav*.006));b.sav+=si;lines.push('Savings interest earned: +'+fmt(si));}
  if(b.ins){var pr=insPremium();G.cash-=pr;took+=pr;lines.push('Insurance premium: '+fmt(pr));}
  w.stmt={t:now(),lines:lines,took:took};w.stmts=(w.stmts||[]);w.stmts.unshift(w.stmt);if(w.stmts.length>12)w.stmts.length=12;
  if(lines.length)note('Statement'+(took?': −'+fmt(took):''),lines.join(' · '),'info',{label:'Details',fn:showStatements});
  save();
}
function showStatements(){var w=W4(),s=w.stmts||[];popup('Your statements',s.length?s.slice(0,6).map(function(q){return new Date(q.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+(q.took?'  −'+fmt(q.took):'')+'\n  '+q.lines.join('\n  ');}).join('\n\n'):'Nothing yet. Every 8 minutes the city bills taxes, and the bank charges loan interest and insurance.',[{t:'OK'}]);}
function allTax(){var t=0;for(var c=0;c<Math.max(1,G.cities||1);c++)t+=cityTax(c);return Math.round(t);}
function unpaid(){return W4().tax.bills.filter(function(b){return !b.paid;});}
function payTaxes(){var u=unpaid(),tot=u.reduce(function(s,b){return s+b.amt;},0);if(!tot){toast('You\'re all paid up.','good');return;}if(!pay(tot,'Your tax bills'))return;u.forEach(function(b){b.paid=true;});W4().tax.paid+=tot;note('Taxes paid',fmt(tot)+' to the city. Thank you for your business!','good');save();}
function netWorth(){var n=G.cash+W4().bank.sav-W4().bank.loan;G.locs.forEach(function(l){n+=locCost(l.city,l.did,l.ind)*.6;});return Math.max(0,n);}
function loanLimit(){return Math.round(Math.max(20000,netWorth()*.4));}
function insPremium(){return Math.round(Math.max(150,netWorth()*.003));}
O.insured=function(loc){return G&&G.w4&&G.w4.bank&&G.w4.bank.ins&&Math.random()<.6;};
O.demMult=function(loc){if(!G||!G.w4||!G.w4.land)return 1;var w=G.w4,m=1,c=loc.city;
  Object.keys(w.land).forEach(function(k){var l=w.land[k];if(cityOfLot(k)!==c||l.d!==loc.did)return;if(l.use==='billboard')m+=.08;if(l.use==='parking')m+=.06;});
  var v=w.civ&&w.civ[c];if(v&&v.policy==='tourism')m*=1.15;if(distOf(loc).win==='campus')m*=1.1+(w.kiosk&&w.kiosk[c]?.02*w.kiosk[c]:0);if(v&&v.party&&v.party.until>now()&&v.party.d===loc.did)m*=1.4;if(w.party>now()&&loc.city===O.city)m*=1.08;m*=lawMult('dem',loc.city)*(hasClass('mkt')?1.04:1)*(w.celeb>now()?1.15:1)*(w.dog&&w.dog.own?1.02:1)*brickMult(loc)*(w.recipe?1.08:1);return m;};
function truckCustomer(v){var g=v.g;g.updateMatrixWorld(true);var w=g.localToWorld(V3(-2.6,0,-.9)),a=g.localToWorld(V3(-3.4,0,-9)),b=g.localToWorld(V3(-3.4,0,8));
  var from=Math.random()<.5?a:b,to=from===a?b:a;var wk=walker([{x:from.x,z:from.z},{x:w.x,z:w.z}],{end:'fade'});wk.path.push({x:to.x,z:to.z});wk.atTruck=1;
  var aw=v.g.userData.awning;if(aw)aw.rotation.z=-1.1;}
