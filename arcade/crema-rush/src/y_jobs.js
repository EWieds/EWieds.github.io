
/* ---------- catering: the town orders coffee by the tray. Brew it at your shop, carry or drive it over, get tipped for speed ---------- */
var caterT=40,trayM=null;
function myShopHere(){return G.locs.filter(function(l){return l.city===O.city&&placeById('shop:'+l.id);})[0]||null;}
function caterDests(){var out=[];BUS.forEach(function(b){if(!b.door||(W4().biz[b.key]||{}).own&&!b.home)return;out.push({key:(b.home?'home:':'biz:')+b.key,name:b.home?(b.owner+' at '+b.name):b.name,who:b.home?b.owner:b.owner+' at '+b.name});});
  ['hall','bank','realty','uni','airport','supply'].forEach(function(id){var p=placeById(id);if(p)out.push({key:id,name:p.name,who:p.name});});return out;}
function caterTick(dt){var w=W4();if(!O.on)return;var c=w.cater;if(c&&c.city!==O.city&&c.state!=='offer')return;
  if(c&&c.state==='carry'&&now()>c.due+90000){note('Order cancelled',c.who+' gave up waiting. No charge, no tip.','bad');w.cater=null;trayView();save();return;}
  if(c&&c.state==='offer'&&now()>c.exp){w.cater=null;return;}
  if(c)return;caterT-=dt;if(caterT>0)return;caterT=rnd(200,380);
  var loc=myShopHere();if(!loc||!plan)return;var ds=caterDests();if(!ds.length)return;var d=pick(ds),pl=placeById(d.key);if(!pl)return;
  var n=pick([6,8,10,12,16,20,24]),each=Math.round(7*tierM()*(1+(loc.rep||3)/10)),pay_=n*each,shop=placeById('shop:'+loc.id),L=routeLen(walkify(route({x:shop.x,z:shop.z},{x:pl.x,z:pl.z})));
  w.cater={state:'offer',city:O.city,key:d.key,who:d.who,name:pl.name,n:n,pay:pay_,loc:loc.id,exp:now()+120000,secs:Math.round(70+L/3.2)};save();
  note('Catering order · '+fmt(pay_),d.who+' wants '+n+' coffees. Brew them at '+loc.name+' and deliver. Tip for speed.','good',{label:'Take the order',fn:takeOrder});
  try{sfx.ding();}catch(e){}}
function takeOrder(){var c=W4().cater;if(!c||c.state!=='offer'){toast('That order is gone.','bad');return;}c.state='make';save();var p=placeById('shop:'+c.loc);if(p)navTo(p,true);toast('Head to your shop to brew it.','good');}
function caterActs(){var c=W4().cater;if(!c||P.area!=='city'||c.city!==O.city)return [];
  if(c.state==='make'){var p=placeById('shop:'+c.loc);if(!p)return [];return [{x:p.x,z:p.z,r:2.6,label:'Brew the catering order ('+c.n+' coffees)',sub:'For '+c.who+' · '+fmt(c.pay),fn:function(){var cost=Math.round(c.pay*.22);if(!pay(cost,'Ingredients'))return;
    fade(function(){c.state='carry';c.due=now()+c.secs*1000;trayView();save();var d=placeById(c.key);if(d)navTo(d,true);note('Order ready','You have '+mmssS(c.secs)+' for the full tip. Walk it over, or grab your car.','good');});}}];}
  if(c.state==='carry'){var d=placeById(c.key);if(!d)return [];return [{x:d.x,z:d.z,r:2.6,label:'Deliver '+c.n+' coffees',sub:function(){var l=(c.due-now())/1000;return c.who+' · '+(l>0?mmssS(l)+' for the full tip':'late, no tip');},fn:deliverOrder}];}
  return [];}
function deliverOrder(){var w=W4(),c=w.cater;if(!c)return;var left=(c.due-now())/1000,tip=left>0?Math.round(c.pay*(.15+.35*Math.min(1,left/c.secs))):0,tot=c.pay+tip;
  G.cash+=tot;G.stats.passive=(G.stats.passive||0);addXP(20+c.n);addFame(left>0?3:1);w.stats.cater=(w.stats.cater||0)+1;w.f=w.f||{};w.f.catered=1;w.cater=null;trayView();save();
  try{sfx.buy();}catch(e){}banner(tip?'Delivered! +'+fmt(tot):'Delivered',tip?'Tip: '+fmt(tip):'No tip, it took too long','good');
  bubble(P.x,2.8,P.z,pick(['"Perfect, thank you!"','"Still hot! Amazing."','"The whole office says thanks."']),'');}
function trayView(){if(!P.me||!P.me.arms)return;if(!trayM){trayM=new T.Group();trayM.position.set(0,-.42,.18);bx(.46,.04,.34,toon(0x8a5a3a),0,0,0,trayM);for(var i=0;i<6;i++){var c=cy(.05,.04,.14,toon(0xffffff),-.15+(i%3)*.15,.09,i<3?-.08:.08,trayM,8);cy(.052,.052,.025,toon(0xa0663f),0,.07,0,c,8);}}
  if(trayM.parent!==P.me.arms[1])P.me.arms[1].add(trayM);var c=W4().cater;trayM.visible=!!(c&&c.state==='carry');}
