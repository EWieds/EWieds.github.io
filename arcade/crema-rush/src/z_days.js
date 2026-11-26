
/* ---------- 4.1: days pass in the city, and every day pays Lazer Points for what your empire earned ---------- */
var DAYS={lastIn:now(),prevH:null,pend:0};
var LP_PER_DOLLAR=.0015,LP_DAY_CAP=500,MIN_PER_DAY=5,DAY_SEC=300;
function cityDay(){var w=W4();if(!w.cday)w.cday=1;return w.cday;}
['keydown','pointerdown','touchstart','wheel'].forEach(function(ev){try{addEventListener(ev,function(){DAYS.lastIn=now();},{passive:true,capture:true});}catch(e){}});
function dayTick(dt){var w=W4();cityDay();if(w.dayT==null)w.dayT=Math.max(0,((clockH-7+24)%24)/24*DAY_SEC);w.dayT+=Math.min(dt,1);if(w.dayT>=DAY_SEC){w.dayT=0;newDay(false);}}
function dayEarn(amt){var w=W4();if(amt>0)w.dayEarn=(w.dayEarn||0)+amt;}
function newDay(slept){var w=W4(),earned=Math.max(0,w.dayEarn||0),d=cityDay(),active=now()-DAYS.lastIn<150000;w.dayEarn=0;w.cday=d+1;
  var lp=Math.min(LP_DAY_CAP,Math.round(earned*LP_PER_DOLLAR));if(earned>0&&lp<1)lp=1;w.dayLog=w.dayLog||[];w.dayLog.unshift({d:d,earned:Math.round(earned),lp:active?lp:0,t:now()});if(w.dayLog.length>30)w.dayLog.length=30;
  banner('Day '+(d+1),plan.name+(slept?' · good morning':''),'good');
  var txt='Your empire made '+fmt(earned)+' while you played.';
  if(lp&&active&&window.LZ_GAME&&window.LZ){try{LZ.endSession(LZ_GAME,lp/(.04*.6),{passive:true,label:'from Day '+d+' in '+plan.name,day:d});}catch(e){}w.lpCity=(w.lpCity||0)+lp;txt+=' That\'s worth '+lp+' Lazer Points.';}
  else if(lp&&!active)txt+=' No Lazer Points this time: you were away from the keyboard.';
  else if(!earned)txt+=' Own something that earns and every day pays Lazer Points.';
  note('Day '+d+' is over',txt,earned?'good':'info');save();}
function sleepTillMorning(){fade(function(){var w=W4();w.dayT=0;clockH=7;newDay(true);w4Buff('fast',300000);});}
function w4Buff(k,ms){var w=W4();w.buff=w.buff||{};w.buff[k]=now()+ms;}
function daysApp(){var w=W4(),L=w.dayLog||[],rate=empireRate(),perDay=Math.min(LP_DAY_CAP,Math.round(rate*MIN_PER_DAY*LP_PER_DOLLAR));
  return phTop('Days & Lazer Points')+'<div class="ph-card"><small>Today</small><b>Day '+cityDay()+' · '+clockStrH(clockH)+'</b><small>Earned so far today</small><b>'+fmt(w.dayEarn||0)+'</b></div>'+
    '<p class="ph-note">A day in the city lasts about 5 minutes. When a day ends, you get 1 Lazer Point for every '+fmt(Math.round(1/LP_PER_DOLLAR))+' your city earned that day (up to '+LP_DAY_CAP+' a day). You need to be playing, not away from the keyboard. At '+fmt(rate)+'/min right now, a full day is worth about '+perDay+' LP. Sleeping at home skips to morning but doesn\'t earn extra.</p>'+
    '<div class="ph-h">Recent days · '+fmt(w.lpCity||0)+' LP from the city so far</div><div class="ph-list">'+(L.length?L.map(function(x){return '<div class="ph-msg '+(x.lp?'good':'')+'"><b>Day '+x.d+' · '+fmt(x.earned)+'</b><span>'+(x.lp?'+'+x.lp+' Lazer Points':'No LP')+'</span></div>';}).join(''):'<p class="ph-empty">Your first day ends at 7:00 AM tomorrow.</p>')+'</div>';}
O.cityDay=function(){return O.on&&G&&G.w4?cityDay():null;};
function v41Note(){var w=W4();w.f=w.f||{};if(w.f.v41||!w.f.tut||popOpen())return;w.f.v41=1;save();
  popup('New in 4.1: days pay Lazer Points','Days now pass in the city (about 5 minutes each). When a day ends, everything your empire earned that day turns into Lazer Points: 1 LP for every '+fmt(Math.round(1/LP_PER_DOLLAR))+', up to '+LP_DAY_CAP+' a day, as long as you\'re playing.\n\nSee today\'s progress in the new Days & LP app on your phone. At night, sleep at home to skip to morning.',[{t:'Nice'}]);}
