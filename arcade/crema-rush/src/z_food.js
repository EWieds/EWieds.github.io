
/* ---------- restaurants that each feel like a place, food you sit down and eat, and secret menus ---------- */
var STYLE_OF={italian:'e_it',pizza:'e_it',chinese:'e_asia',korean:'e_asia',viet:'e_asia',ramen:'e_asia',sushi:'e_sushi',mexican:'e_mex',bbq:'e_steak',steak:'e_steak',burger:'e_diner',diner:'e_diner',
  french:'e_bistro',indian:'e_bistro',mideast:'e_bistro',seafood:'e_bistro',deli:'e_diner',tea:'e_bistro',speak:'e_speak',court:null};
var SEATS={},EAT=null;
var SECRET={italian:[['The Godfather\'s ziti',28,'charm','Baked ziti the way Nonna made it for the bosses. You feel very persuasive.'],['Nonna\'s midnight meatballs',19,'full','A plate that keeps you going for hours.']],
  pizza:[['The upside-down pie',21,'lucky','Cheese on the bottom. Somebody here knows where the shiny things are.']],
  chinese:[['Dragon\'s breath noodles',22,'spicy','You will walk faster. You will also cry.']],korean:[['Kimchi volcano',20,'spicy','Breathe fire, move fast.']],viet:[['Grandma\'s secret pho',18,'full','Twelve-hour broth. Pure comfort.']],ramen:[['The 3 a.m. bowl',17,'full','Only regulars know.']],
  sushi:[['Golden bean roll',44,'lucky','Gold leaf on top. The chef winks: "Gold finds gold."']],mexican:[['El Diablo burrito',17,'spicy','The diablo is not a metaphor.']],
  bbq:[['The whole hog',65,'feast','Feeds a block party. Everyone hears about it.']],steak:[['The mayor\'s cut',90,'politic','Councilman Pruitt eats here every Thursday. Order what he orders.']],
  burger:[['The mayor',24,'politic','Rumor has it the council votes better after one of these.']],diner:[['Midnight pancake tower',18,'full','Twelve pancakes. A sparkler.']],deli:[['The founder\'s pastrami',23,'history','The recipe Josiah Crema ate every Sunday. The owner tells a story.']],
  french:[['Le secret',30,'charm','Owners find you more charming afterward.']],indian:[['The maharaja thali',34,'feast','Fourteen tiny dishes.']],mideast:[['The sultan platter',29,'feast','Big enough to share.']],seafood:[['The captain\'s catch',52,'lucky','Comes with a sea story about a lighthouse.']],tea:[['The founder\'s blend',12,'history','Josiah\'s own tea. The label has a map on it.']],
  speak:[['The Inkwell old-fashioned (zero proof)',14,'charm','Smoke and vanilla. Lou knows everybody.'],['The house riddle',1,'history','Written on a napkin.']]};
/* ---- the rooms ---- */
function eatRoom(id,st){var g=room(id,{name:'Restaurant',w:16,d:12,floor:st.floor,wall:st.wall,trim:st.trim,bg:st.bg,h:4.6,cam:{dist:8,pitch:.52}}),ox=IOX[id];SEATS[id]=[];
  ACTS[id].push({x:ox+6.2,z:-3.1,r:1.3,when:function(){return rsOwned(CUR_B)&&!RS;},label:'Work a shift here',sub:'You own this place. Run the floor for 3 minutes',fn:rsStart});
  roomSign(id,5.5,1,0,3.6,-5.8,g);counterTop(g,4.2,-4.4,5,st.counter,st.top);npcCounterCol(ox,4.2,-4.4);
  st.tables.forEach(function(t,i){st.table(g,t[0],t[1]);addCol(ox+t[0]-.8,ox+t[0]+.8,t[1]-.8,t[1]+.8,id);SEATS[id].push({x:ox+t[0]-1,z:t[1],ry:Math.PI/2,tx:ox+t[0],tz:t[1],busy:i%2===0});
    if(i%2===0){var d=liteMe();d.sit=true;d.root.position.set(t[0]+1,.1,t[1]);d.root.rotation.y=-Math.PI/2;g.add(d.root);foodModel(pick(['pasta','burger','soup','steak','sushi','cake']),g,t[0]+.35,st.th||.98,t[1]);}});
  st.decor(g,ox);
  ACTS[id].push({x:ox+4.2,z:-3.1,r:2,label:'Order at the counter',sub:function(){var m=MENUS[cuisine(CUR_B||{})]||MENUS.diner;return m.map(function(q){return q[0];}).slice(0,2).join(' · ');},fn:function(){orderFood(CUR_B?cuisine(CUR_B):'diner',CUR_B?CUR_B.owner:'Cook',CUR_B?CUR_B.name:'');}});
  ACTS[id].push({x:ox+2,z:-3.1,r:1.2,label:function(){return 'Talk to '+(CUR_B?CUR_B.owner:'the owner');},sub:function(){return CUR_B?CUR_B.name:'';},fn:function(){if(CUR_B&&CUR_B.key&&CUR_B.key.indexOf('speak')!==0)bizTalk(CUR_B,false);else popup('Lou','"Keep your voice down. What\'ll it be?"',[{t:'Order',fn:function(){orderFood('speak','Lou','The Inkwell');}},{t:'Nothing',cls:'sec'}],'',{who:'Lou',role:'The Inkwell',col:'#d4af37'});}});
  return g;}
function npcCounterCol(ox,x,z){addCol(ox+x-2.6,ox+x+2.6,z-.5,z+.5);}
function chairs(g,x,z,c,n){var pts=n===4?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,0],[-1,0]];pts.forEach(function(p){bx(.45,.08,.45,toon(c),x+p[0],.52,z+p[1],g);bx(p[0]?.07:.45,.55,p[0]?.45:.07,toon(c),x+p[0]*1.22,.82,z+p[1]*1.22,g);});}
function lanternR(g,x,y,z,c){var l=sp(.28,toon(c,{e:c,ei:.55}),x,y,z,g,10);l.scale.y=1.3;cy(.12,.12,.06,toon(0x2a1a12),x,y+.38,z,g,8);cy(.12,.12,.06,toon(0x2a1a12),x,y-.38,z,g,8);}
var ESTYLES={
  e_it:{floor:floorT(0x8a5a3a,0x7a4e32,6),wall:0xf2dcc0,trim:0x2f7a4a,bg:0x2a1a12,counter:0x6b4a30,top:0xf4efe6,tables:[[-5,-1],[-1.5,-1],[-5,2.6],[-1.5,2.6]],
    table:function(g,x,z){bx(1.6,.06,1.6,toon(0xffffff,{map:checkT('#e2553f','#ffffff')}),x,.97,z,g);cyB(.07,.95,toon(0x3a2418),x,0,z,g,6);chairs(g,x,z,0x6b4a30,2);cy(.06,.08,.3,toon(0x2f7a4a),x,1.15,z,g,6);sp(.05,toon(0xffd24a,{e:0xff9a20,ei:1}),x,1.35,z,g,5);},
    decor:function(g){for(var i=0;i<14;i++)sp(.22,toon(i%2?0x4f9a4a:0x6cc76a),-7.6+i*1.1,4.2,-5.7,g,6);bx(2.4,2.2,1.2,toon(0xb8573e),-6,1.1,-5.2,g);var ov=cy(.6,.6,.1,toon(0xff6a20,{e:0xff5a10,ei:.9}),-6,1.1,-4.55,g,12);ov.rotation.x=Math.PI/2;
      [[-7.85,1.8,-1,0x2f7a4a],[-7.85,2.2,2,0xe2553f]].forEach(function(f){var p=plane(1.3,.9,toon(f[3]),f[0],f[1],f[2],g);p.rotation.y=Math.PI/2;});}},
  e_asia:{floor:floorT(0x7a2a22,0x6a2018,4),wall:0xf3e2c4,trim:0xd4af37,bg:0x2a0a0a,counter:0x7a2a22,top:0x2a1a12,tables:[[-5,-1.2],[-1.4,-1.2],[-5,2.6],[-1.4,2.6]],
    table:function(g,x,z){cy(.95,.95,.08,toon(0x7a2a22),x,.95,z,g,18);cy(.5,.5,.05,toon(0xd4af37),x,1.02,z,g,16);cyB(.08,.95,toon(0x2a1a12),x,0,z,g,6);chairs(g,x,z,0x2a1a12,4);},
    decor:function(g){for(var i=0;i<6;i++)lanternR(g,-7+i*2.6,3.6,-1+((i%2)*3),0xe2553f);var p=plane(5,2.2,flat(0xffffff,{map:signT('福',{bg:'#7a2a22',fg:'#d4af37',w:512,h:220})}),-3,2.6,-5.8,g);bx(1.4,1.6,.6,toon(0x7a2a22),7,.8,3,g);}},
  e_sushi:{floor:floorT(0xd8c3a0,0xcbb48e,8),wall:0xf4efe6,trim:0x2a1a12,bg:0x1a1a1a,counter:0xd8c3a0,top:0xf4efe6,tables:[[-5,1.5],[-1.6,1.5]],
    table:function(g,x,z){bx(1.8,.08,1,toon(0xb8a07a),x,.6,z,g);[-.6,.6].forEach(function(o){bx(.5,.1,.5,toon(0x2f5f90),x+o,.15,z+.75,g);bx(.5,.1,.5,toon(0x2f5f90),x+o,.15,z-.75,g);});},th:.64,
    decor:function(g,ox){bx(11,1,1,toon(0xd8c3a0),-2,.5,-2.2,g);var belt=bx(10.6,.08,.5,toon(0x3a3f4b),-2,1.04,-2.2,g);for(var i=0;i<12;i++){var pl=new T.Group();pl.position.set(ox-7+i*.9,1.1,-2.2);dyn.add(pl);pl.position.x+=ox;cy(.18,.18,.03,toon([0xe2553f,0x2f5f90,0xffc63d][i%3]),0,0,0,pl,10);sushiBits(pl);anim.push({belt:pl,x0:ox-7.2,x1:ox+3.2,v:.6});}
      addCol(ox-7.5,ox+3.5,-2.8,-1.6,'e_sushi');for(var b=0;b<6;b++){cyB(.04,1.6,toon(0x8a9a5a),-7.6,0,-5+b*.4,g,4);}for(var k=0;k<5;k++)lanternR(g,-6+k*3,3.7,0,0xfff3d6);}},
  e_mex:{floor:floorT(0xc8743a,0xb8642a,4),wall:0xffe0a0,trim:0x2fa860,bg:0x3a1a0a,counter:0x2fa860,top:0xffe0a0,tables:[[-5,-1],[-1.5,-1],[-5,2.6],[-1.5,2.6]],
    table:function(g,x,z){bx(1.5,.08,1.5,toon(0x46a9e6,{map:checkT('#46a9e6','#ffe38a')}),x,.97,z,g);cyB(.07,.95,toon(0x6b4a30),x,0,z,g,6);chairs(g,x,z,0xe2553f,2);},
    decor:function(g){for(var r=0;r<3;r++)for(var i=0;i<14;i++){var f=plane(.45,.55,toon([0xe2553f,0xffc63d,0x2fa860,0xff79b4,0x46a9e6][(i+r)%5],{ds:1}),-7+i*1.1,3.8-r*.05,-4+r*3,g);f.rotation.x=.1;}
      [[-7.3,4.5],[7.3,4.5],[-7.3,-4.8]].forEach(function(q){cy(.35,.28,.5,toon(0xc8743a),q[0],.25,q[1],g,8);cyB(.16,1.2,toon(0x4f9a4a),q[0],.5,q[1],g,8);cyB(.09,.5,toon(0x4f9a4a),q[0]+.25,1.1,q[1],g,6).rotation.z=-.6;});}},
  e_steak:{floor:floorT(0x3a2418,0x2e1c12,6),wall:0x5a3a28,trim:0xd4af37,bg:0x140a06,counter:0x2a1a12,top:0x8a5a3a,tables:[[-5,-1.4],[-1.4,-1.4],[-5,2.6],[-1.4,2.6]],
    table:function(g,x,z){bx(1.7,.08,1.2,toon(0x2a1a12),x,.97,z,g);cyB(.08,.95,toon(0x1a1008),x,0,z,g,6);[-1,1].forEach(function(s){rb(1.8,1.1,.5,.1,toon(0x7a2a22),x,.55,z+s*1,g);});sp(.06,toon(0xffd24a,{e:0xffa020,ei:.9}),x,1.1,z,g,6);},
    decor:function(g){for(var i=0;i<6;i++){cyB(.01,1,toon(0x2a2a2a),-6+i*2.4,3.4,0,g,3);sp(.12,toon(0xffd98a,{e:0xffa040,ei:1}),-6+i*2.4,3.35,0,g,6);}bx(1.6,2.4,1.4,toon(0x2a2a2a),-6.6,1.2,-5,g);cyB(.15,1.5,toon(0x3a3a3a),-6.6,2.4,-5,g,8);
      var wh=tor(.7,.07,toon(0x8a5a3a),7.85,2.2,0,g,null,16);wh.rotation.y=Math.PI/2;}},
  e_diner:{floor:floorT(0x1a1a1a,0xf4f4f4,8),wall:0xe9f6f2,trim:0xe2553f,bg:0x1a2a2a,counter:0xe2553f,top:0xc8ccd2,tables:[[-5.5,-1.2],[-5.5,2.4]],
    table:function(g,x,z){bx(1.4,.06,1,toon(0xf4f4f4),x,.97,z,g);cyB(.06,.95,toon(0xc8ccd2),x,0,z,g,6);[-1,1].forEach(function(s){rb(1.5,1.1,.55,.15,toon(0xe2553f),x+s*1,.55,z,g).rotation.y=Math.PI/2;});},
    decor:function(g,ox){for(var i=0;i<5;i++){cyB(.05,.75,toon(0xc8ccd2),1.5+i*1.1,0,-2.9,g,6);cy(.22,.22,.1,toon(0xe2553f),1.5+i*1.1,.8,-2.9,g,10);}addCol(ox+1,ox+6.5,-3.2,-2.6,'e_diner');
      bx(16,.12,.12,toon(0xff3d8a,{e:0xff3d8a,ei:1}),0,3.9,-5.85,g);rb(1.2,1.9,.7,.25,toon(0xff8a3d,{e:0x8a3a10,ei:.4}),7,.95,3.5,g);sp(.2,toon(0x46a9e6,{e:0x46a9e6,ei:.8}),7,1.6,3.9,g,8);}},
  e_bistro:{floor:floorT(0xe8e0d0,0x9aa3ad,6),wall:0xf6efe2,trim:0x2a3a6a,bg:0x1a1e2a,counter:0x2a3a6a,top:0xf4efe6,tables:[[-5,-1.4],[-2,-1.4],[-5,1.8],[-2,1.8],[1,3]],
    table:function(g,x,z){cy(.45,.45,.04,toon(0xf4f4f4),x,.97,z,g,14);cyB(.04,.95,toon(0x2a2a2a),x,0,z,g,6);chairs(g,x,z,0x2a2a2a,2);sp(.08,toon(0xef8fb0),x,1.08,z,g,6);},
    decor:function(g){bx(2.6,1.6,.08,toon(0x1a1a1a),-5,2.4,-5.85,g);for(var i=0;i<4;i++)bx(1.8,.03,.02,toon(0xffffff),-5,2.9-i*.3,-5.8,g);for(var k=0;k<16;k++)sp(.05,MAT.lamp,-7.5+k,3.9+Math.sin(k)*.15,0,g,5);[[-7.3,-4.5],[7.3,4.5]].forEach(function(q){cy(.3,.25,.5,toon(0xc8743a),q[0],.25,q[1],g,8);sp(.5,toon(0x4f9a4a),q[0],.9,q[1],g,7);});}},
  e_speak:{floor:floorT(0x2a1a12,0x1a1008,4),wall:0x2a1a22,trim:0xd4af37,bg:0x080406,counter:0x1a1008,top:0xd4af37,tables:[[-5,-1],[-1.5,-1],[-5,2.6]],
    table:function(g,x,z){cy(.5,.5,.05,toon(0x1a1a1a),x,.97,z,g,14);cyB(.05,.95,toon(0xd4af37),x,0,z,g,6);chairs(g,x,z,0x5a1a2a,2);sp(.06,toon(0xffd24a,{e:0xffa020,ei:1}),x,1.08,z,g,6);},
    decor:function(g){rb(2.2,1,1.4,.1,toon(0x111111),5.6,.5,3.6,g);bx(2,.1,.5,toon(0xffffff),5.6,1.02,3.1,g);var pianist=liteMe({shirt:0x111111});pianist.sit=true;pianist.root.position.set(5.6,.1,2.4);g.add(pianist.root);
      for(var i=0;i<12;i++)cy(.06,.06,.3,toon([0x8a3a10,0x2f7a4a,0xd4af37][i%3]),2+i*.4,1.25,-5.6,g,6);wallSign(g,'THE INKWELL · 1923',-3,3.4,-5.85,{bg:'#1a1008',fg:'#d4af37',w:4,h:.6});}}};
function checkT(a,b){return tx('chk'+a+b,64,64,function(g,w,h){for(var y=0;y<8;y++)for(var x=0;x<8;x++){g.fillStyle=(x+y)%2?a:b;g.fillRect(x*8,y*8,8,8);}});}
function sushiBits(pl){for(var i=0;i<2;i++){cy(.07,.07,.07,toon(0x1a2a1a),-.06+i*.12,.06,0,pl,8);cy(.055,.055,.08,toon(0xff8a6a),-.06+i*.12,.07,0,pl,8);}}
function buildEateries(){Object.keys(ESTYLES).forEach(function(id){var g=eatRoom(id,ESTYLES[id]),ox=IOX[id];bx(1.3,2.3,.12,toon(0x5a3a28),-6.6,1.15,-5.85,g);
    ACTS[id].push({x:ox-6.6,z:-4.9,r:1.3,label:function(){return CUR_B&&cuisine(CUR_B)==='italian'?'A door marked PRIVATE':'Kitchen door';},sub:function(){return CUR_B&&cuisine(CUR_B)==='italian'?'Voices, cigar smoke, espresso':'Staff only';},
      fn:function(){if(CUR_B&&cuisine(CUR_B)==='italian')roasteryDoor();else popup('The kitchen','Through the round window: a cook flipping three pans at once, a dishwasher singing, a sign that says "EMPLOYEES MUST WASH HANDS. ALSO THE DUCK."',[{t:'Leave them to it',cls:'sec'}]);}});});}
/* ---- food you can see ---- */
function foodModel(name,g,x,y,z){var n=String(name).toLowerCase(),f=new T.Group();f.position.set(x,y,z);g.add(f);cy(.32,.28,.03,toon(0xffffff),0,.015,0,f,16);
  if(/pizza|pie\b|slice|margherita|upside/.test(n)){cy(.27,.27,.03,toon(0xe8b060),0,.05,0,f,14);cy(.24,.24,.02,toon(0xd8402a),0,.07,0,f,14);for(var i=0;i<6;i++)cy(.04,.04,.02,toon(0x8a1a1a),Math.cos(i)*.14,.085,Math.sin(i)*.14,f,8);}
  else if(/pasta|spaghetti|lasagna|carbonara|ziti|noodle|ramen|pho|meatball/.test(n)){cy(.22,.16,.12,toon(0xffffff),0,.08,0,f,14);for(var j=0;j<5;j++){var t=tor(.09,.022,toon(0xf2d080),(j%3-1)*.06,.15,(Math.floor(j/3)-.5)*.06,f,null,10);t.rotation.x=Math.PI/2+j*.3;}if(/meatball|ziti/.test(n))for(var m=0;m<3;m++)sp(.05,toon(0x8a3a20),-.06+m*.06,.2,0,f,6);}
  else if(/burger|sandwich|melt|banh|lobster roll|pastrami|reuben/.test(n)){cy(.13,.14,.05,toon(0xe8a860),0,.06,0,f,12);cy(.15,.15,.04,toon(0x5a2a18),0,.1,0,f,12);cy(.15,.15,.015,toon(0xffd24a),0,.125,0,f,12);cy(.14,.14,.015,toon(0x4f9a4a),0,.14,0,f,12);var bn=sp(.14,toon(0xe8a860),0,.16,0,f,10);bn.scale.y=.6;}
  else if(/sushi|roll|omakase|sashimi|gold/.test(n)){bx(.5,.04,.2,toon(0xb8a07a),0,.04,0,f);for(var s=0;s<5;s++){cy(.04,.04,.05,toon(0x1a2a1a),-.18+s*.09,.085,0,f,8);cy(.032,.032,.06,toon(/gold/.test(n)?0xffd24a:0xff8a6a),-.18+s*.09,.09,0,f,8);}}
  else if(/taco|burrito|wrap|diablo|falafel|shawarma/.test(n)){for(var c=0;c<2;c++){var tc=cy(.1,.1,.24,toon(0xf2d080),-.07+c*.14,.1,0,f,10,null);tc.rotation.z=Math.PI/2;}}
  else if(/steak|ribeye|brisket|pork|hog|chicken|cut|bulgogi/.test(n)){var sk=sp(.16,toon(0x6a2a18),0,.07,0,f,10);sk.scale.set(1.3,.35,1);for(var v=0;v<4;v++)sp(.035,toon(0x4f9a4a),.18,.06,-.06+v*.04,f,5);}
  else if(/soup|chowder|curry|stew|bibimbap|rice|bowl|thali|lassi/.test(n)){cy(.2,.14,.12,toon(0xffffff),0,.08,0,f,14);cy(.18,.18,.01,toon(/curry|thali/.test(n)?0xd8902a:/chowder/.test(n)?0xf4efe0:0xc8602a),0,.14,0,f,14);}
  else if(/cake|tiramisu|brulee|churro|cookie|baklava|pancake|waffle|scone|pie|soft serve/.test(n)){if(/pancake|waffle/.test(n)){for(var p=0;p<5;p++)cy(.13,.13,.03,toon(0xe8b060),0,.05+p*.032,0,f,12);sp(.04,toon(0xff3d3d),0,.23,0,f,6);}else{var ck=prism(.22,.14,.18,toon(0xf4e0c0),0,.03,0,f);sp(.03,toon(0xe2553f),0,.19,0,f,6);}}
  else if(/fries|knots|dumpling|gyoza|naan|spring|pretzel|hot dog/.test(n)){for(var q=0;q<7;q++){var fr=bx(.03,.12,.03,toon(0xf2c060),-.08+q*.025,.09,(q%2)*.04,f);fr.rotation.z=(q-3)*.12;}}
  else if(/shake|lassi|cocoa|tea|oolong|espresso|tonic|cold brew|soda|juice|old-fashioned|oj|latte/.test(n)){cy(.06,.05,.2,glass(0xdff2ff,.4),0,.12,0,f,10);cy(.055,.045,.15,toon(/cocoa|brew|espresso|old/.test(n)?0x5a3018:/shake/.test(n)?0xef8fb0:0xffd24a),0,.1,0,f,10);}
  else{var md=sp(.17,toon(0xd8a060),0,.05,0,f,10);md.scale.y=.45;}
  return f;}
/* ---- ordering, now with the secret menu once you've asked ---- */
function orderFood(cu,who,where){var m=MENUS[cu]||MENUS.diner,k=tierM()>3?1+Math.log(tierM())*.3:1,w=W4(),sec=w.f&&w.f['sec'+cu]?SECRET[cu]||[]:[];
  var item=function(q,secret){var pr=Math.round(q[1]*k);return {t:(secret?'★ ':'')+q[0]+' · '+fmt(pr),s:secret?q[3]:null,fn:function(){if(now()<fullUntil&&!secret){toast('You\'re stuffed. Maybe later.','bad');return;}if(!pay(pr,q[0]))return;sitAndEat(q[0],secret?q[2]:null,cu);}};};
  popup(where||'Order','"'+pick(['What can I get you?','You look hungry.','Kitchen\'s open.'])+'"'+(sec.length?'\n(The owner slides a second menu across the counter.)':''),m.map(function(q){return item(q,false);}).concat(sec.map(function(q){return item(q,true);})).concat([{t:'Nothing, thanks',cls:'sec'}]),'',{who:who,role:where,col:'#7a2a22',
    say:{ph:'Order anything… or ask what\'s not on the menu',fn:function(t){var n=norm(t);
      if(cu==='italian'&&/\bthe regular\b|\bil solito\b/.test(n)){theRegular(who,where,t);return;}
      if(cu==='italian'&&/the usual|back room|the family|vinnie|roastery|don arabica|private/.test(n)){popup(where,'"'+pick(['I don\'t know what you\'re talking about. You gonna order or what?','Back room? That\'s the walk-in fridge, my friend.','Never heard of them. Can I get you some bread?'])+'"',[{t:'OK',cls:'sec'}],'',{who:who,col:'#7a2a22',you:t});return;}
      if(false){popup(where,'',[{t:'Grazie'}],'',{who:who,role:where,col:'#7a2a22',you:t});return;}
      if(/secret|off.?menu|not on the menu|special|chef|regulars|hidden/.test(n)){if(!SECRET[cu]){popup(where,'"Secret menu? Honey, this is the whole menu."',[{t:'Fair'}],'',{who:who,col:'#7a2a22',you:t});return;}var first=!w.f['sec'+cu];w.f['sec'+cu]=1;if(first){addFame(2);w.stats.secrets=(w.stats.secrets||0)+1;}save();popup(where,'"'+(first?'…You heard about that? Okay. Here.':'The usual secret?')+'"',[{t:'See it',fn:function(){orderFood(cu,who,where);}}],'',{who:who,col:'#7a2a22',you:t});return;}
      var all=m.concat(sec),best=null,bs=0,qt=toks(t);all.forEach(function(q){var sc=overlap(qt,q[0]);if(sc>bs){bs=sc;best=q;}});if(best&&bs>=1){var pr=Math.round(best[1]*k);if(pay(pr,best[0]))sitAndEat(best[0],sec.indexOf(best)>=0?best[2]:null,cu);return;}
      aiGeneric(t,where||'Order','What can I get you?',all.map(function(q){return item(q,sec.indexOf(q)>=0);}),'',{who:who,role:where,col:'#7a2a22'});}}});}
function sitAndEat(name,perk,cu){var id=P.area,seats=SEATS[id]||[],s=seats.filter(function(q){return !q.busy;}).sort(function(a,b){return Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z);})[0];
  if(!s){eatQuick(name,perk);return;}fade(function(){P.x=s.x;P.z=s.z;P.ry=Math.atan2(s.tx-s.x,s.tz-s.z);if(P.me)P.me.root.rotation.y=P.ry;var g=new T.Group();g.position.set(0,(AREAS[id]&&AREAS[id].y)||0,0);dyn.add(g);var y=(ESTYLES[id]&&ESTYLES[id].th)||.98;var food=foodModel(name,g,s.tx-.45,y,s.tz);
    var drink=foodModel(pick(['soda','tea','juice']),g,s.tx-.3,y,s.tz+.35);EAT={g:g,food:food,t:0,t0:now(),dur:7,seat:s,name:name,perk:perk,cu:cu,bites:0};s.busy=true;O.snap=true;});}
function updEat(dt){if(!EAT)return;var e=EAT;e.t=(now()-e.t0)/1000;var k=Math.max(.05,1-e.t/e.dur);e.food.scale.set(k*.7+.3,k,k*.7+.3);var b=Math.floor(e.t/1.2);if(b>e.bites){e.bites=b;try{tone(320+Math.random()*80,.05,'sine',.025);}catch(er){}if(Math.random()<.35)bubble(P.x,2.2,P.z,pick(['nom','mmm','*munch*','so good']),'');}
  if(P.me)P.me.root.position.y=Math.sin(e.t*9)*.015;if(e.t>=e.dur)finishEat();}
function eatCamera(dt){if(!EAT)return false;var s=EAT.seat,yo=(AREAS[P.area]&&AREAS[P.area].y)||0,cp=V3(s.x-1.6,2.3+yo,s.z+1.4),ct=V3(s.tx-.2,1+yo,s.tz);O.cam.position.lerp(cp,Math.min(1,dt*3));camL.lerp(ct,Math.min(1,dt*4));O.cam.lookAt(camL);return true;}
function finishEat(){var e=EAT;EAT=null;e.seat.busy=false;setTimeout(function(){if(e.g.parent)e.g.parent.remove(e.g);},2500);fullUntil=now()+90000;addXP(8);var w=W4();w.stats.meals=(w.stats.meals||0)+1;w.ate=w.ate||{};w.ate[e.cu]=1;if(Object.keys(w.ate).length===10)note('Food critic','You\'ve eaten 10 different cuisines. The Courier wants you to write a column.','good');
  bubble(P.x,2.6,P.z,pick(['That was great.','Chef\'s kiss.','I need a nap.','Worth every penny.']),'good');if(e.perk)perk(e.perk);save();}
function eatQuick(name,perk){fade(function(){addXP(8);bubble(P.x,2.7,P.z,pick(['Mmm.','So good.','Worth it.']),'good');var w=W4();w.stats.meals=(w.stats.meals||0)+1;if(perk)perk(perk);save();});}
function perk(k){var w=W4();w.buff=w.buff||{};
  if(k==='roast'){w.f.roastInv=1;note('Something was written under the plate','"The family will see you now." The door marked PRIVATE is unlocked.','good');}
  else if(k==='lucky'){var b=GBEANS.slice().sort(function(a,c){return Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(c.x-P.x,c.z-P.z);})[0];if(b){w.buff.lucky=now()+300000;note('A feeling','You feel like something shiny is somewhere '+dirWord(b.x-P.x,b.z-P.z)+' of here.','good');}else toast('You feel lucky. Nothing shiny left in this city, though.','');}
  else if(k==='spicy'){w.buff.fast=now()+180000;toast('Your mouth is on fire. You walk faster for 3 minutes.','good');}
  else if(k==='full'){w.buff.full=now()+900000;toast('Stuffed. You won\'t need to eat for a long time.','good');}
  else if(k==='feast'){addFame(5);toast('The whole street heard about your feast. +5 fame','good');}
  else if(k==='politic'){w.buff.politic=now()+600000;toast('Your next bill at City Hall has a better shot.','good');}
  else if(k==='charm'){w.buff.charm=now()+600000;toast('You feel charming. Owners like you more for 10 minutes.','good');}
  else if(k==='history'){popup('A napkin note','"Josiah never trusted banks. He kept his money where the rain goes, under the street he loved most."',[{t:'Hm.'}]);}
  save();}
function dirWord(dx,dz){var a=Math.atan2(dx,-dz)*180/Math.PI;a=(a+360)%360;return ['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(a/45)%8];}
function buffOn(k){var b=W4().buff;return !!(b&&b[k]&&b[k]>now());}
