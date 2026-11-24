
/* ---------- a council seat (or the mayor's office) actually changes your life ---------- */
function councilOn(c){var v=civ(c);return !!(v.council||v.mayor);}
function councilStipend(){var w=W4(),t=0;Object.keys(w.civ||{}).forEach(function(c){var v=w.civ[c];if(v.mayor)t+=1500*TM(+c).pm;else if(v.council)t+=450*TM(+c).pm;});return Math.round(t);}
var CREQ=[
  {t:'A bakery owner wants a sidewalk café permit.',a:[['Approve it','+1 favor · +5 fame',function(v){v.favors++;addFame(5);}],['Deny it','',function(){}]]},
  {t:function(){return 'Residents on '+(streetAt(P.x,P.z)||'Main St')+' want a crosswalk after a near-miss.';},a:[['Fund it from discretionary · $C2','+12 fame · +1 favor',function(v,c){if(!pay(c,'The crosswalk'))return false;addFame(12);v.favors++;}],['Table it','−3 fame',function(){addFame(-3);}]]},
  {t:'A developer offers a "campaign donation" if you back rezoning the dog park.',a:[['Take the money · +$C15','−10 fame · it might come out',function(v,c){cityGain(c);addFame(-10);if(Math.random()<.3)setTimeout(function(){summon('Ethics violation','The Courier found the donation from the developer.',Math.round(c*1.5));},30000);}],['Refuse, loudly','+8 fame',function(){addFame(8);}]]},
  {t:'The fire chief says Station 1 needs a new ladder truck.',a:[['Push it through the budget','+15 fame',function(){addFame(15);}],['Not this year','−5 fame',function(){addFame(-5);}]]},
  {t:'A food truck vendor wants a new vending zone near the park.',a:[['Approve it','+1 favor · +4 fame',function(v){v.favors++;addFame(4);}],['Deny it','',function(){}]]},
  {t:'The school board asks you to speak at graduation.',a:[['Give a speech','+20 fame · +40 XP',function(){addFame(20);addXP(40);}],['Send a video','+5 fame',function(){addFame(5);}]]},
  {t:'Councilman Pruitt wants your vote on his parking-meter bill. He\'ll owe you.',a:[['Vote with him','+2 favors · −4 fame',function(v){v.favors+=2;addFame(-4);}],['Vote against','+6 fame',function(){addFame(6);}]]}];
function councilOffice(){var v=civ(),who={who:'You',role:(v.mayor?'Mayor':'Councilmember')+' · '+plan.name,col:'#7a5ad8'};v.favors=v.favors||0;
  if(!councilOn()){popup('Council offices','"Members only. Win a council seat at the Elections office and this office is yours."',[{t:'Elections office',fn:electionsWindow},{t:'OK',cls:'sec'}]);return;}
  popup(v.mayor?'The mayor\'s desk':'Your council office',
    'What your seat does for you here:\n• '+fmt(councilStipend())+'/min salary (in Holdings)\n• −15% city taxes on your businesses\n• Your vote decides close council votes\n• Council plates: no parking tickets, and police usually let you off with a warning\n• Zoning variances for Bob\'s builds are free\nFavors banked: '+v.favors,
    [{t:'Hold office hours',s:'Hear a constituent out. Fame, favors, money',fn:officeHours},{t:'Call in a favor',s:v.favors?v.favors+' available':'Earn favors in office hours',off:!v.favors,why:'You have no favors banked.',fn:favorMenu},{t:'Propose a law',s:'Council chamber vote',fn:councilChamber},{t:'Done',cls:'sec'}],'',who);}
function officeHours(){var v=civ();v.hrsT=v.hrsT||0;if(v.hrsT>now()){popup('Office hours','"That\'s everyone for now. More people will line up in '+mmssS((v.hrsT-now())/1000)+'."',[{t:'OK'}]);return;}
  var r=pick(CREQ),c2=Math.round(2000*tierM()),c15=Math.round(15000*tierM()),t=typeof r.t==='function'?r.t():r.t;
  popup('Office hours',t,r.a.map(function(a){var lbl=a[0].replace('$C2',fmt(c2)).replace('$C15',fmt(c15));return {t:lbl,s:a[1],fn:function(){if(a[2](v,/\$C15/.test(a[0])?c15:c2)===false)return;v.hrsT=now()+150000;save();toast('Done. Your constituents noticed.','good');}};}),'',{who:'Constituent',role:'Office hours',col:'#7a5ad8'});}
function favorMenu(){var v=civ(),w=W4(),b=w.builds.filter(function(q){return cityOfLot(q.key)===O.city||q.key.indexOf('shop:')===0;})[0],L=lic();
  var use=function(fn){return function(){if(v.favors<1)return;v.favors--;fn();save();};};
  popup('Call in a favor','You have '+v.favors+' favor'+(v.favors===1?'':'s')+'. Each one is good for one of these:',[
    {t:'Fast-track a permit',s:b?'Finishes your build in progress right now':'Nothing under construction',off:!b,why:'Nothing under construction.',fn:use(function(){b.arrive=Math.min(b.arrive||0,now());b.t0=now()-b.sec*1000-1000;finishBuilds();toast('The inspector signed off this morning.','good');})},
    {t:'Make some tickets disappear',s:'−4 points on your license ('+L.pts+' now)',off:!L.pts,why:'Your record is clean.',fn:use(function(){L.pts=Math.max(0,L.pts-4);toast('Paperwork… misplaced.','good');})},
    {t:'Line up votes for your next bill',s:'Your next proposal is a lock for 5 minutes',fn:use(function(){v.bribed=now()+300000;toast('The votes are there. Propose it now.','good');})},
    {t:'Rezone all your land here',s:'Build anything anywhere in '+plan.name,fn:use(function(){Object.keys(w.land).forEach(function(k){if(cityOfLot(k)===O.city)w.land[k].variance=1;});toast('Rezoned. Bob can build anything on your lots here.','good');})},
    {t:'Never mind',cls:'sec'}]);}
function councilRoom(g,ox){bx(1.4,2.6,.15,toon(0x6b4a30),-11.85,1.3,-1.8,g).rotation.y=Math.PI/2;wallSign(g,'COUNCIL OFFICES',-11.8,3.1,-1.8,{bg:'#7a5ad8',fg:'#fff',w:3,h:.5,ry:Math.PI/2});
  ACTS.hall.push({x:ox-10.8,z:-1.8,r:1.4,label:function(){return councilOn()?'Your council office':'Council offices';},sub:function(){var v=civ();return councilOn()?(v.favors||0)+' favors · '+fmt(councilStipend())+'/min salary':'Members only';},fn:councilOffice});}
