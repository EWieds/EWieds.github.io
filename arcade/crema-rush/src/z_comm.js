
/* ---------- community games: real Lazer Arcade community games, playable on cabinets in the Play Zone and from your phone ---------- */
var COMM={list:null,t:0,g:null};
function commList(cb){if(COMM.list&&now()-COMM.t<120000){cb(COMM.list);return;}
  import('/arcade/community/cloud.js').then(function(C){var b=Object.keys(C.BUILTIN).map(function(k){return C.BUILTIN[k];});return C.listGames('plays',30).catch(function(){return [];}).then(function(gs){COMM.list=b.concat(gs.filter(function(g){return g.engine!=='heist';}));COMM.t=now();cb(COMM.list);});})
    .catch(function(e){try{console.warn('community list',e&&e.message);}catch(x){}cb(COMM.list||[{id:'harborclassic',title:'Harbor Rush Classic',ownerName:'LazerYudel'}]);});}
function commMenu(where){thinking('Community games');
  commList(function(list){if(!list){popup('Community games','"The cabinet can\'t reach the arcade network right now. Check your connection and try again."',[{t:'Try again',fn:function(){COMM.t=0;commMenu(where);}},{t:'OK',cls:'sec'}]);return;}
    popup('Community games','Games made by real players in Lazer Studio. Your scores count on each game\'s own leaderboard'+(where==='cab'?'. $1 a play.':'.'),list.slice(0,14).map(function(g){return {t:g.title,s:'by '+(g.ownerName||'a player')+(g.plays?' · '+commN(g.plays)+' plays':'')+(g.likes?' · ♥ '+g.likes:''),fn:function(){if(where==='cab'&&!pay(1,'A token'))return;commPlay(g);}};})
      .concat([{t:'Browse all on Lazer Arcade',s:'Opens the community page',fn:function(){commPlay({id:'',title:'Community',all:1});}},{t:'Not now',cls:'sec'}]));});}
function commN(n){return n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':String(n);}
function commPlay(g){var el=$('#o-comm');if(!el){el=document.createElement('div');el.id='o-comm';document.body.appendChild(el);}
  var src=g.all?'/arcade/community/?embed=1':'/arcade/community/play/?id='+encodeURIComponent(g.id)+'&embed=1';
  el.innerHTML='<div class="cm-top"><b>'+esc(g.title)+'</b><span>'+(g.all?'Lazer Arcade':'by '+esc(g.ownerName||'a player'))+'</span><button type="button" class="cm-x">Back to '+esc(plan.name)+'</button></div><iframe title="'+esc(g.title)+'" src="'+src+'" allow="fullscreen; autoplay; gamepad"></iframe>';
  el.hidden=false;COMM.g=g;document.body.classList.add('window','mini');el.querySelector('.cm-x').onclick=commClose;try{el.querySelector('iframe').focus();}catch(e){}
  var w=W4();w.stats.comm=(w.stats.comm||0)+1;addXP(3);save();}
function commClose(){var el=$('#o-comm');if(el){el.hidden=true;el.innerHTML='';}COMM.g=null;document.body.classList.remove('window','mini');try{window.focus();}catch(e){}bubble(P.x,2.6,P.z,pick(['That was fun.','One more?','Good game.']),'good');}
function commCabs(g,ox){var dg=new T.Group();dg.position.x=ox;dyn.add(dg);
  [15,17.4,19.8].forEach(function(cx,i){var cab=new T.Group();cab.position.set(cx,0,-13.6);dg.add(cab);rb(1.4,2.4,1,.06,toon([0xff3d8a,0x31a8ff,0x8affd2][i]),0,1.2,0,cab);var scr=plane(1.05,.8,toon(0xffffff,{e:[0xff3d8a,0x31e0ff,0x8affd2][i],ei:.9}),0,1.65,.51,cab);
    bx(1.2,.12,.5,toon(0x1a1a1a),0,1.12,.6,cab);plane(1.3,.32,flat(0xffffff,{map:signT('COMMUNITY',{bg:'#07051a',fg:'#ff3d8a',w:256,h:64})}),0,2.2,.51,cab);
    (function(s,k){anim.push({fn:function(dt,tl){s.material.emissiveIntensity=.6+Math.sin(tl*3+k)*.3;},obj:s});})(scr,i);addCol(ox+cx-.8,ox+cx+.8,-14.2,-13,'fun');
    ACTS.fun.push({x:ox+cx,z:-12.2,r:1.1,label:'Community games',sub:'Real games made by Lazer Arcade players · $1',fn:function(){commMenu('cab');}});});
  plane(7,.6,flat(0xffffff,{map:signT('COMMUNITY CORNER',{bg:'#07051a',fg:'#8affd2',w:768,h:66})}),17.4,3.6,-15.8,dg);}
/* ---------- early access notice: expect bugs, report them, they get fixed ---------- */
function bugReport(){if(window.LZ&&LZ.openFeedback){try{LZ.openFeedback('crema');return;}catch(e){}}popup('Report a bug','Feedback isn\'t reachable right now. Try again in a minute.',[{t:'OK'}]);}
function eaNotice(force){var w=W4();w.f=w.f||{};if(!force&&(w.f.eaNote||!w.f.tut||popOpen()||CUT||EAT||MOV||SLIDE||COMM.g))return;w.f.eaNote=1;save();
  popup('Early access','Crema City is brand new and still in early access, so you\'ll probably run into bugs: something that doesn\'t open, a person who says something odd, a car that gets stuck.\n\nWhen you find one, send a feedback ticket (phone → Report a bug, or the button below). Say what you were doing and what went wrong. Every ticket gets read and fixed.',
    [{t:'Report a bug now',fn:bugReport},{t:'Got it, let\'s play',cls:'sec'}]);}
