
/* ---------- say anything: no AI, just a lot of listening. Every person reads what you typed and reacts in character ---------- */
var STOP={i:1,im:1,me:1,my:1,a:1,an:1,the:1,to:1,of:1,and:1,or:1,for:1,on:1,at:1,in:1,is:1,it:1,its:1,be:1,can:1,could:1,would:1,will:1,you:1,your:1,please:1,want:1,wanna:1,like:1,lets:1,let:1,do:1,does:1,just:1,some:1,that:1,this:1,there:1,go:1,get:1,take:1,show:1,where:1,whats:1,what:1,how:1,find:1,navigate:1,directions:1,direction:1,way:1,us:1,we:1,our:1,are:1,was:1,with:1,from:1,need:1,ill:1,id:1,hey:1,ok:1,okay:1,now:1,right:1,here:1,so:1,up:1,head:1,going:1,walk:1,drive:1,bring:1};
function norm(t){return String(t).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9$.,\- ]/g,' ').replace(/\s+/g,' ').trim();}
function toks(t){return norm(t).replace(/[$.,\-]/g,' ').split(' ').filter(function(w){return w&&!STOP[w];});}
function has(t,re){return re.test(norm(t));}
function stemEq(a,b){if(a===b)return true;if(a.length<3||b.length<3)return false;var n=Math.min(a.length,b.length,5);return a.slice(0,n)===b.slice(0,n)&&Math.abs(a.length-b.length)<=4;}
function overlap(qt,name){var nt=toks(name),sc=0;qt.forEach(function(q){if(nt.some(function(n){return stemEq(q,n);}))sc+=q.length>3?1.2:.8;});return sc;}
/* "$80k", "80,000", "eighty thousand", "half a million", "a hundred grand" */
var NUMW={a:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,fifteen:15,twenty:20,twentyfive:25,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
function parseAmt(t){var s=norm(t).replace(/twenty five/g,'twentyfive'),m=s.replace(/,(?=\d{3})/g,'').match(/\$?\s?(\d+(?:\.\d+)?)\s?(k\b|m\b|mil\b|million|thousand|grand|hundred|bucks|dollars)?/);
  if(m){var n=parseFloat(m[1]),u=m[2]||'';if(/^(k|thousand|grand)/.test(u))n*=1e3;else if(/^(m|mil|million)/.test(u))n*=1e6;else if(u==='hundred')n*=100;if(/^555/.test(m[1])||/\d{3}-\d{4}/.test(s))return null;return n;}
  m=s.match(/\b(half a|a|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|twentyfive|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+(hundred thousand|hundred grand|hundred|thousand|grand|million|mil)\b/);
  if(m){var b=m[1]==='half a'?.5:NUMW[m[1]],u2=m[2];return b*(u2.indexOf('hundred ')===0?1e5:u2==='hundred'?100:/thousand|grand/.test(u2)?1e3:1e6);}
  return null;}

/* ----- the deal table ----- */
var R={
  why:{tired:'"Honestly? I\'m worn out. Twelve-hour days. A fair offer and I\'m on a beach."',practical:'"If the number makes sense, I sell. If it doesn\'t, I don\'t. Simple."',shrewd:'"Everything\'s for sale. The question is whether you can afford it."',
    proud:'"I\'m not looking to sell. You\'d have to make it worth my while. Very worth my while."',sentimental:'"Money isn\'t the hard part. I need to know it\'s in good hands."',greedy:'"Why sell? Money. Lots of it. Yours, ideally."'},
  how:{tired:'"Busy. Too busy. My feet hurt."',practical:'"Steady. Can\'t complain."',shrewd:'"Better than my competitors."',proud:'"Best on the street. Ask anyone."',sentimental:'"Oh, we get by. The regulars are like family."',greedy:'"Could always be better."'},
  comp:{tired:'"Thanks. Some days I forget it\'s nice."',practical:'"Thanks. We work hard."',shrewd:'"Flattery. Cute. The price is the same."',proud:'"Finally, someone with taste."',sentimental:'"Oh, that\'s so kind. My mother picked the colors."',greedy:'"Nice, right? Which is why it costs what it costs."'},
  ins:{tired:'"Wow. Okay. I don\'t need this today."',practical:'"Let\'s keep it civil, or let\'s not talk."',shrewd:'"Insulting the merchandise. Classic. Doesn\'t work on me."',proud:'"Excuse me? Watch your mouth in my place."',sentimental:'"...That was unkind."',greedy:'"Insult me all you want. Price went up."'},
  thr:{tired:'"Please, I don\'t need trouble. ...Fine, I\'ll come down a little. A little."',practical:'"Threats? Now I don\'t want to sell to you."',shrewd:'"Cute. Try it. Meanwhile the price is up five percent."',proud:'"Get out. Now."',sentimental:'"I\'ll call the police if you keep talking like that."',greedy:'"Big talk. Bring big money instead."'},
  joke:['"Ha! Okay, you\'re funny. Still not lowering the price."','"Heh. A coffee guy walks into a shop... and pays full price."','"Good one. My kid would like you."'],
  part:'"Partners? No. All or nothing."',
  job:'"We\'re not hiring, sorry. Unless you\'re buying, then you\'re the boss."',
  rent:'"Rent? Talk to Dana at Crema Realty about leases. I\'m selling, not renting."',
  hm:{tired:'"Sorry, what? I\'m half asleep."',practical:'"Not sure what you mean. Do you want to make an offer?"',shrewd:'"Say what you mean. Numbers, preferably."',proud:'"I don\'t follow. Get to the point."',sentimental:'"I\'m not sure I understand, dear."',greedy:'"Is there money in that sentence? No? Then I\'m lost."'}};
function dealSay(b,phone,t){try{dealSay0(b,phone,t);}finally{YOU=null;}}
function dealSay0(b,phone,t){var s=dState(b),n=norm(t),p=b.pers,amt=parseAmt(t),cash=/cash|briefcase|suitcase|bills|on the table|right now|today/.test(n),known=s.known;YOU=t;
  var said=function(m){bizTalk(b,phone,m);};
  if(/^(bye|goodbye|see ya|see you|later|nevermind|never mind|forget it|no thanks|leave)\b/.test(n)){YOU=null;popup(b.name,pick(['"Take care."','"Door\'s always open. Well, during business hours."','"Bye now."']),[{t:'Leave',cls:'sec'}],'',{who:b.owner,role:b.name,col:'#8a5a3a',you:t});return;}
  // relative offers: "double it", "your asking price", "half"
  if(amt==null&&known&&/(full|asking|your) price|what you (asked|want|said)|^(deal|ok|okay|fine|sure|yes|agreed|done|you got it|sold)\b/.test(n))amt=s.ask;
  if(amt==null&&/\b(double|twice)\b/.test(n))amt=(known?s.ask:(b.val||bizValue(b)))*2;
  if(amt==null&&/\bhalf\b/.test(n)&&/pay|give|offer|do/.test(n))amt=(known?s.ask:(b.val||bizValue(b)))/2;
  if(amt!=null&&amt>=20&&(amt>=1000||/\$|\dk\b| k\b|grand|thousand|million|offer|give|pay|cash|bucks|dollars|how about|what about|do you take|would you take|ill do/.test(n))){var o=Math.round(amt);if(/\b(per|a|each) (min|minute|month|year)|rent|lease/.test(n)){said(R.rent);return;}offer(b,o,phone,cash&&caseAmt()>=o,t);return;}
  if(/how much|price|what do you want|what would you (sell|take)|your number|name (a|your) price|asking|cost|worth|sell (it|this|the place|to me|me)|for sale/.test(n)){s.known=1;said('"'+pick(['For you? ','Since you asked: ','Honestly? '])+fmt(s.ask)+'. And that\'s fair."');return;}
  if(/books|revenue|profit|earn|income|numbers|make (a|per|in a)|how much (do|does) (it|this|the place) make|rent for|what.*rent/.test(n)){if(b.home){said('"Around here? '+fmt(bizRev(b))+' a minute, easy."');return;}if(p==='proud'||p==='greedy'){said('"The books stay private until we have a deal. It makes good money, trust me."');return;}said('"About '+fmt(bizRev(b))+' a minute after costs, give or take."');return;}
  if(/look (around|inside)|tour|see (the|inside|it)|come in|show me around|bedroom/.test(n)&&b.home&&b.kind!=='apt'&&!phone){if(b.sale||p==='tired'||p==='sentimental'||s.mood>0){YOU=null;enterHome(b,true);}else said('"Inside? I don\'t even know you."');return;}
  if(/keep|look after|take care|wont (fire|change|tear)|promise|staff|employees|the name|family|garden|wont knock/.test(n)){if(p==='sentimental'&&!s.promise){s.promise=1;s.floor=Math.round(s.floor*.92);said('"You\'d do that? ...That means a lot. Let\'s talk numbers."');return;}s.mood=Math.min(2,s.mood+1);said(p==='shrewd'||p==='greedy'?'"Nice of you. Doesn\'t change the price."':'"Good. I\'d want that."');return;}
  if(/too (much|high|expensive|steep)|lower|discount|cheaper|come on|best price|knock (it |some )?(off|down)|bring it down|negotiable|budge|meet me|work with me|wiggle|deal with me|flexible|can you do better|any better/.test(n)){
    if(!known){s.known=1;said('"You haven\'t even heard my price. It\'s '+fmt(s.ask)+'."');return;}
    s.hag=(s.hag||0)+1;if(s.hag<=2&&s.mood>=0&&s.pat>1&&s.ask>s.floor*1.03&&p!=='proud'){var drop=p==='tired'?.08:p==='practical'?.05:.03;s.ask=Math.max(s.floor,Math.round(s.ask*(1-drop)/10)*10);s.pat--;save();said('"'+pick(['Fine. ','Alright, alright. ','For you? '])+fmt(s.ask)+'. Don\'t push it."');return;}
    s.pat--;if(s.pat<=0){offer(b,0,phone,false,t);return;}said(p==='proud'?'"No. That\'s my price."':'"I\'ve come down enough. '+fmt(s.ask)+'."');return;}
  if(/\b(ugly|dump|trash|garbage|stupid|idiot|suck|sucks|terrible|awful|worthless|crap|loser|dumb|hate|gross|dirty|smells|shithole|dive)\b/.test(n)){s.mood--;s.pat-=p==='proud'?2:1;if(p==='greedy'){s.ask=Math.round(s.ask*1.03);}if(s.pat<=0){offer(b,0,phone,false,t);return;}save();said(R.ins[p]);return;}
  if(/or else|regret|destroy|crush|put you out|out of business|bankrupt|ruin|sue|lawyer|threat|whether you like|youll be sorry|burn|wreck/.test(n)){
    if(p==='proud'){s.ban=now()+240000;s.mood-=2;save();popup(b.name,R.thr.proud,[{t:'Leave',cls:'sec'}],'bad',{who:b.owner,role:b.name,col:'#8a5a3a',you:t});YOU=null;return;}
    if(p==='tired'&&!s.thr){s.thr=1;s.floor=Math.round(s.floor*.96);s.ask=Math.max(s.floor,Math.round(s.ask*.95));}else if(p==='shrewd'||p==='greedy'){s.ask=Math.round(s.ask*1.05);s.floor=Math.round(s.floor*1.03);}else{s.pat-=2;s.mood--;}
    if(s.pat<=0){offer(b,0,phone,false,t);return;}save();said(R.thr[p]);return;}
  if(/\b(love|beautiful|great|amazing|best|nice|wonderful|impressive|admire|respect|charming|cozy|gorgeous|lovely|cute|cool)\b/.test(n)){if(!s.compd){s.compd=1;s.mood=Math.min(2,s.mood+1);if(p==='proud'||p==='sentimental')s.floor=Math.round(s.floor*.97);}save();said(R.comp[p]);return;}
  if(/why|retire|selling|leaving|moving|plans|future|tired of/.test(n)){said(R.why[p]);return;}
  if(/partner|stake|percent|share|half of/.test(n)){said(R.part);return;}
  if(/job|hiring|work (for|here)|apply/.test(n)){said(R.job);return;}
  if(/\b(rent|lease)\b/.test(n)&&!b.home){said(R.rent);return;}
  if(/cash|briefcase|suitcase/.test(n)){said(caseAmt()?'"Let\'s see it, then. Name a number."':'"Cash? I don\'t see any cash."');return;}
  if(/how are you|hows (it going|business|things)|how is business|hows life|you ok/.test(n)){said(R.how[p]);return;}
  if(/your name|who are you|whos this/.test(n)){said('"'+b.owner+'. '+(b.home?'I live here.':'I own this place.')+'"');return;}
  if(/joke|funny|laugh/.test(n)){said(pick(R.joke));return;}
  if(/rain|weather|sunny|cold|hot/.test(n)){said(rain.on?'"Terrible weather. Business is slow when it rains."':'"Nice day, isn\'t it?"');return;}
  if(/coffee|crema|espresso|latte/.test(n)){var lc=nearestMine(P.x,P.z);said(lc?'"Your '+lc.name+'? '+((lc.rep||3)>=4?'Good stuff. My whole family goes.':'It\'s alright.')+'"':'"Coffee? I drink tea."');return;}
  if(/^(hi|hello|hey|yo|howdy|good (morning|afternoon|evening)|sup|whats up)\b/.test(n)){said(b.home&&b.kind!=='apt'?line('hih',b):line('hi',b));return;}
  if(/^(no|nope|nah|pass|never)\b/.test(n)){said('"Suit yourself."');return;}
  said(R.hm[p]+'\n(Try a number, "why are you selling?", "too much", or a promise.)');}

/* ----- people on the street ----- */
function pedSay(p,t){try{pedSay0(p,t);}finally{YOU=null;}}
function pedSay0(p,t){var n=norm(t),loc=nearestMine(p.x,p.z);YOU=t;
  var reply=function(m,after){say(p,m,after);};
  if(/^(bye|goodbye|see ya|see you|later|thanks|thank you|cheers)\b/.test(n)){YOU=null;p.stop=rnd(.5,1.2);bubble(p.x,2.4,p.z,'Bye!','');return;}
  var pl=findPlace(t);if(pl&&(/where|how (do|can) i get|directions|way to|take me|find|looking for|know where|which way/.test(n)||pl.sc>=2)){reply('"'+pl.name+'? '+pick(['That way. Here, I\'ll show you.','Sure, it\'s not far. Follow the arrows.','Oh, easy. This way.'])+'"',function(){navTo(pl);});return;}
  if(/\b(job|work|hire|hiring|employ|staff)\b/.test(n)){if(p.job&&!p.done){YOU=null;hirePed(p);}else reply(pick(['"I\'ve got a job, thanks. But it\'s nice of you."','"Me? Nah, I\'m retired."','"I\'m a student, no time."']));return;}
  if(/coupon|free coffee|come (to|by|over)|visit|try (my|our)|stop by/.test(n)){if(!loc){reply('"Where? I don\'t see one of yours around here."');return;}if(p.done){reply('"I\'m already headed there!"');return;}if(!pay(3,'The coupon'))return;addFame(1);p.done=1;reply(pick(['"Oh, nice! I\'ll go right now."','"Free coffee? You don\'t have to ask twice."']),function(){p.coupon=loc;});return;}
  if(/news|heard|gossip|rumou?r|whats new|anything interesting|secret|tip|tell me something|whats going on|happening/.test(n)){reply(rumor(p));return;}
  if(/coffee|crema|my (shop|cafe|place|store)|think (of|about)|opinion|rate|review/.test(n)){reply(opinion(p,loc));return;}
  if(/house|home|where do you live|sell (me )?your|apartment|rent/.test(n)){var hs=homesForSale()[0];reply(hs?'"I rent. But '+hs.owner+' at '+hs.name+' is selling. Want me to point the way?"':'"My place? Not for sale. Knock on doors, though. People sell for the right price."',hs?function(){navTo(placeById('home:'+hs.key));}:null);return;}
  if(/give me|lend|money|spare|cash/.test(n)){reply(pick(['"Ha! You\'re the rich one."','"I was going to ask YOU that."']));return;}
  if(/your name|who are you/.test(n)){reply('"I\'m '+p.name+'."');return;}
  if(/how are you|hows it going|hows your day|you ok/.test(n)){reply(pick(['"Not bad! Long line at the bank though."','"Good, good. Busy day."','"Tired. Need coffee, honestly."']));return;}
  if(/rain|weather|sunny|cold|hot/.test(n)){reply(rain.on?'"I forgot my umbrella. Of course."':'"Beautiful day for a walk."');return;}
  if(/joke|funny/.test(n)){reply(pick(['"Why did the coffee file a police report? It got mugged."','"Decaf? Depresso."','"I only know one joke and it\'s about decaf. It\'s not worth it."']));return;}
  if(/\b(ugly|stupid|idiot|loser|dumb|hate|shut up|go away|weirdo)\b/.test(n)){YOU=null;p.stop=0;bubble(p.x,2.4,p.z,'Rude!','bad');return;}
  if(/\b(love|nice|cool|great|beautiful|awesome)\b/.test(n)){reply(pick(['"Aw, thanks! You too."','"Ha, that\'s sweet."']));return;}
  if(/^(hi|hello|hey|yo|howdy|good (morning|afternoon|evening))\b/.test(n)){reply(greet(p));return;}
  reply(pick(['"Sorry, what?"','"Huh?"','"I\'m not sure I follow."'])+'\n(Ask for directions, news, a job, or what they think of your coffee.)');}

/* ----- anyone else you talk to: match what you typed to what they can do ----- */
function genericSay(t,title,text,btns,kind,opt){var n=norm(t),qt=toks(t),best=null,bs=0,second=0;
  if(/^(bye|goodbye|see ya|later|never ?mind|no thanks|cancel|nothing)\b/.test(n)){var c=btns.filter(function(b){return b.cls==='sec';})[0];if(c&&c.fn)c.fn();return;}
  btns.forEach(function(b){var sc=overlap(qt,(b.t||'')+' '+(b.s||''));if(b.cls==='sec')sc*=.6;if(sc>bs){second=bs;bs=sc;best=b;}else if(sc>second)second=sc;});
  if(best&&bs>=1&&bs>second){if(best.off){if(best.why)toast(best.why,'bad');popup(title,'"'+(best.why||'Can\'t do that right now.')+'"',btns,kind,Object.assign({},opt,{you:t,say:null}));return;}if(best.fn)best.fn();return;}
  if(doCmd(t,true))return;
  popup(title,pick(['"Sorry, I didn\'t catch that."','"Hm? Say that another way?"','"Not sure I can help with that."']),btns,kind,Object.assign({},opt,{you:t,say:null}));}

/* ----- places by name: "the bank", "freshmart", "campus", "Paper Moon", "home" ----- */
var ALIAS=[[/airport|plane|flight|fly/,'airport'],[/city hall|town hall|taxes|permit|mayor/,'hall'],[/\bbank|loan|atm/,'bank'],[/realt|dana|real estate/,'realty'],[/supply|crates|ingredients|supplies|wholesale/,'supply'],[/grocery|freshmart|groceries|supermarket/,'biz:grocery'],[/central park|\bpark\b/,'park'],[/universit|campus|college/,'uni'],[/motors|car dealer|dealership|buy a car|pickup/,'motors'],[/ski|lift|mountain|slope|snow/,'lift'],[/pier|ferris|beach|ocean|boardwalk/,'pier'],[/superstore/,'super']];
function findPlace(t){var n=norm(t),w=W4();
  if(/\b(go home|my home|my house|home)\b/.test(n)&&w.home){var hp=placeById('home:'+w.home);if(hp)return {x:hp.x,z:hp.z,name:'Home',id:hp.id,sc:3};}
  if(/my (shop|cafe|store|coffee)|back to (work|the shop)|the counter/.test(n)){var lc=G.locs.filter(function(l){return l.city===O.city;})[0];var sp2=lc&&placeById('shop:'+lc.id);if(sp2)return Object.assign({sc:3},sp2);}
  for(var i=0;i<ALIAS.length;i++)if(ALIAS[i][0].test(n)){var a=placeById(ALIAS[i][1])||(ALIAS[i][1]==='super'?placeById('supersite'):null);if(a)return Object.assign({sc:2.5},a);}
  var qt=toks(t);if(!qt.length)return null;var best=null,bs=0;
  places.forEach(function(p){var sc=overlap(qt,p.name);if(sc>bs){bs=sc;best=p;}});
  if(plan&&plan.blocks)plan.blocks.forEach(function(b){var sc=overlap(qt,blockName(b));if(sc>bs){bs=sc;best={x:b.x,z:b.z+BD/2+1,name:blockName(b),id:'blk'};}});
  return bs>=1?Object.assign({sc:bs},best):null;}

/* ----- the "do anything" box ----- */
var DO_EX=['take me to the airport','buy a house','call Earl','find FreshMart','show me the whole city','I want to build something','call a cab to the pier','go home','get a loan','fly somewhere','order supplies'];
function doBox(){var ex=DO_EX.slice().sort(function(){return Math.random()-.5;}).slice(0,4);
  popup('What do you want to do?','Type anything. Places, people, things to buy, things to build.',ex.map(function(e){return {t:'"'+e+'"',fn:function(){doCmd(e);}};}).concat([{t:'Close',cls:'sec'}]),'',{say:{ph:'e.g. "buy the bakery" or "where is city hall"',fn:function(t){if(!doCmd(t))popup('Hmm','I couldn\'t work out "'+t+'". Try a place ("the bank"), a person ("call Dana"), or an action ("buy a house", "build", "fly", "go home").',[{t:'Try again',fn:doBox},{t:'OK',cls:'sec'}]);}}});
  if(!matchMedia('(pointer:coarse)').matches)setTimeout(function(){var i=document.querySelector('#o-pop .pp-say input');if(i)i.focus();},30);}
function goTo(p,msg){if(P.area!=='city'){toast('Head outside first.');return true;}navTo(p);toast(msg||('Heading to '+p.name),'good');return true;}
function doCmd(t,quiet){var n=norm(t),w=W4();if(!n)return false;
  if(/^(help|what can i do|\?)/.test(n)){popup('Ideas','Walk into any shop and buy it · knock on any door · type offers like "80k cash" · "call Earl" · "go home" · "build on my land" · "buy a house" · "fly to another city" · "bird\'s-eye view"',[{t:'OK'}]);return true;}
  // phone numbers and people
  var num=n.match(/555\D?0?(\d{3})/);if(num||/^(call|phone|ring|dial|text)\b/.test(n)){
    var who=n.replace(/^(call|phone|ring|dial|text)\s+(up\s+)?/,'');
    if(num){var digits='555-0'+num[1];if(digits==='555-0199'){w.found=w.found||{};w.found.valley=1;callValley();return true;}if(digits==='555-0142'){callDana();return true;}
      var bz=BUS.filter(function(b){return b.phone===digits;})[0];if(bz){bizTalk(bz,true);return true;}popup('Calling '+digits+'…','"The number you have dialed is not in service."',[{t:'Hang up'}]);return true;}
    if(/earl|valley|farm/.test(who)){if(w.found&&w.found.valley){callValley();}else popup('Who?','You don\'t have that number. Somebody in town must deal with them… maybe check the paperwork behind a grocery counter.',[{t:'OK'}]);return true;}
    if(/dana|realt/.test(who)){callDana();return true;}if(/bob|build|construct/.test(who)){callBob();return true;}if(/mom|mother|mum/.test(who)){callMom();return true;}
    if(/cab|taxi|uber|ride/.test(who)){var dp=findPlace(n.replace(/.*\bto\b/,''));if(dp&&/\bto\b/.test(n))callCab(dp);else openPhone('cab');return true;}
    if(/city hall|mayor|tax/.test(who)){cityHallCall();return true;}if(/supply|deliver/.test(who)){orderDelivery();return true;}if(/air|flight/.test(who)){flightsDesk(false);return true;}
    var cq=toks(who),bb=null,bsc=0;BUS.forEach(function(b){var sc=Math.max(overlap(cq,b.name),overlap(cq,b.owner)*1.1);if(sc>bsc){bsc=sc;bb=b;}});if(bb&&bsc>=1){bizTalk(bb,true);return true;}
    var mg=G.locs.filter(function(l){return hasMgr(l)&&overlap(cq,staffName(l,'manager',0)+' '+l.name)>=1;})[0];if(mg){callManager(mg);return true;}
    openPhone('calls');return true;}
  if(/\b(fly|flight|plane|travel to|visit another|another city|other city|book a)\b/.test(n)){flightsDesk(false);return true;}
  if(/\b(cab|taxi|uber|lyft|ride)\b/.test(n)){var cp=findPlace(n.replace(/.*\bto\b/,''));if(cp&&/\bto\b/.test(n)){callCab(cp);}else openPhone('cab');return true;}
  if(/bird|whole city|city view|overview|from above|map view|see everything|zoom out/.test(n)){if(P.area==='city')birdOn();else toast('Step outside first.');return true;}
  if(/\b(loan|borrow|bank account|deposit|withdraw|briefcase)\b/.test(n)){bankWindow();return true;}
  if(/\b(tax|taxes|permit|election|council)\b/.test(n)){cityHallCall();return true;}
  if(/order (supplies|crates|delivery)|deliver/.test(n)){orderDelivery();return true;}
  if(/\b(hire|staff|employee|manager)\b/.test(n)&&!/talk/.test(n)){openPhone('emp');return true;}
  if(/\b(go home|my home|my house)\b|^home$/.test(n)&&!w.home){popup('No home yet','You don\'t live anywhere in '+plan.name+' yet. Buy a house and move in.',[{t:'Find a house for sale',fn:function(){doCmd('buy a house');}},{t:'OK',cls:'sec'}]);return true;}
  if(/\bparty\b/.test(n)){var hh=w.home&&bizOf(w.home);if(hh){houseParty(hh);}else popup('No place to party','You need a home first. Buy a house and move in.',[{t:'Find a house',fn:function(){doCmd('buy a house');}},{t:'OK',cls:'sec'}]);return true;}
  if(/\b(build|construct|develop|expand)\b/.test(n)){if(/superstore/.test(n)){var su=placeById('super')||placeById('supersite');if(su)return goTo(su);}callBob();return true;}
  if(/\b(sell|list)\b/.test(n)&&/\b(house|home|apartment|property|building)\b/.test(n)){var oh=ownedHomes();if(!oh.length){popup('Nothing to sell','You don\'t own any homes yet.',[{t:'OK'}]);return true;}var hb=bizOf(oh[0]);if(hb)homeTalk(hb);return true;}
  if(/\b(buy|purchase|acquire|own|get)\b/.test(n)||/for sale/.test(n)){
    if(/\b(house|home|place to live|real estate|property)\b/.test(n)){var hs=homesForSale();if(hs.length)return goTo(placeById('home:'+hs[0].key),hs[0].name+' is for sale. Knock when you get there.');var any=HOMES.filter(function(h){return !homeState(h).own&&h.kind!=='apt';}).sort(function(a,b){return Math.hypot(a.door.x-P.x,a.door.z-P.z)-Math.hypot(b.door.x-P.x,b.door.z-P.z);})[0];if(any)return goTo(placeById('home:'+any.key),'No signs up. Knock anyway, everyone has a price.');}
    if(/apartment|building|units/.test(n)){var ap=HOMES.filter(function(h){return h.kind==='apt'&&!homeState(h).own;}).sort(function(a,b){return Math.hypot(a.door.x-P.x,a.door.z-P.z)-Math.hypot(b.door.x-P.x,b.door.z-P.z);})[0];if(ap)return goTo(placeById('home:'+ap.key),'Buzz the landlord at '+ap.name+'.');}
    if(/\b(land|lot|plot)\b/.test(n)){callDana();return true;}
    if(/\b(car|pickup|truck|vehicle|van)\b/.test(n)){var m=placeById('motors');if(m)return goTo(m);}
    if(/supplies|crates|ingredients|stock|beans|milk/.test(n)){var sp=placeById('supply');if(sp)return goTo(sp);}
    if(/valley|farm|supplier/.test(n)){if(w.found&&w.found.valley){bizTalk(VALLEY(),true);}else popup('Who supplies who?','Somebody supplies FreshMart. The paperwork is probably in their back office.',[{t:'Directions to FreshMart',fn:function(){var g=placeById('biz:grocery');if(g)navTo(g);}},{t:'OK',cls:'sec'}]);return true;}
    var q=toks(n.replace(/\b(buy|purchase|acquire|own|get|out|the|whole)\b/g,'')),bb2=null,bs2=0;BUS.forEach(function(b){var sc=overlap(q,b.name);if(sc>bs2){bs2=sc;bb2=b;}});
    if(bb2&&bs2>=1){var bp=placeById((bb2.home?'home:':'biz:')+bb2.key);if(bp)return goTo(bp,'Go talk to '+bb2.owner+' at '+bb2.name+'.');}
    if(/\b(business|shop|store|company|restaurant)\b/.test(n)){var cand=BUS.filter(function(b){return !b.home&&!(w.biz[b.key]||{}).own&&b.pers==='tired';})[0]||BUS.filter(function(b){return !b.home&&!(w.biz[b.key]||{}).own;})[0];if(cand)return goTo(placeById('biz:'+cand.key),cand.owner+' at '+cand.name+' might sell. Go make an offer.');}
  }
  var pl=findPlace(t);if(pl&&(pl.sc>=1.2||/\b(go|take|where|find|directions|navigate|head|walk|drive|show)\b/.test(n)))return goTo(pl);
  return false;}
O.doBox=doBox;
