
/* ---------- every door opens: restaurants, stores, offices, a mall, and the sewers under it all ---------- */
var RESTS=[['Luigi\'s Trattoria','italian'],['Golden Dragon','chinese'],['Taco Loco','mexican'],['Smokehouse BBQ','bbq'],['Sakura Sushi','sushi'],['The Burger Joint','burger'],['Curry House','indian'],['Blue Plate Diner','diner'],['Le Petit Bistro','french'],['Pho Real','viet'],['Prime Steak & Co.','steak'],['Bella Napoli','pizza'],['Seoul Kitchen','korean'],['The Waffle Shack','diner'],['Falafel King','mideast'],['Lobster Pot','seafood']];
var MENUS={italian:[['Spaghetti carbonara',18],['Lasagna',16],['Tiramisu',8]],chinese:[['General Tso\'s chicken',14],['Dumplings (8)',9],['Fried rice',10]],mexican:[['Three tacos al pastor',11],['Loaded burrito',13],['Churros',6]],
  bbq:[['Brisket plate',22],['Pulled pork sandwich',14],['Mac and cheese',7]],sushi:[['Salmon roll',12],['Omakase (chef\'s choice)',55],['Miso soup',4]],burger:[['Double cheeseburger',13],['Fries',5],['Milkshake',7]],indian:[['Butter chicken',17],['Garlic naan',4],['Mango lassi',5]],
  diner:[['Stack of pancakes',10],['Patty melt',12],['Slice of pie',6]],french:[['Croque monsieur',14],['Onion soup',11],['Crème brûlée',9]],viet:[['Beef pho',14],['Banh mi',10],['Spring rolls',7]],steak:[['Ribeye',48],['Wedge salad',12],['Creamed spinach',9]],
  pizza:[['Slice of pepperoni',4],['Whole margherita pie',18],['Garlic knots',6]],korean:[['Bibimbap',15],['Korean fried chicken',16],['Kimchi pancake',9]],mideast:[['Falafel wrap',9],['Shawarma plate',15],['Baklava',5]],seafood:[['Lobster roll',29],['Clam chowder',9],['Fish and chips',18]],
  deli:[['Pastrami on rye',15],['Matzo ball soup',8],['Black and white cookie',4]],court:[['Noodle bowl',11],['Burger combo',12],['Soft pretzel',5]]};
var CUISINE_OF={pizza:'pizza',deli:'deli',diner:'diner',ramen:'ramen',tacos:'mexican',tea:'tea'};MENUS.ramen=[['Tonkotsu ramen',15],['Gyoza',7],['Matcha soft serve',5]];MENUS.tea=[['Pot of oolong',6],['Scones with jam',7],['Hot cocoa',4]];
var SOUV={books:['A paperback mystery',14],florist:['A bunch of tulips',18],toys:['A rubber duck',6],records:['A vintage vinyl',32],barber:['A fresh haircut',22],nails:['A manicure',30],laundry:['A wash and fold',12],phones:['A phone case',19],bikes:['A bike bell',9],gym:['A day pass',15],surf:['Surf wax',7],ski:['Wool socks',16],hardware:['A pry bar',25],shop:['A souvenir mug',12]};
var CUR_B=null,ROOMNPC={},MH=[],dynSign={};
function roomSign(id,w,h,x,y,z,g,ry){var c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;var p=plane(w,h,flat(0xffffff,{map:t}),x,y,z,dyn);p.position.x+=IOX[id];if(ry)p.rotation.y=ry;dynSign[id]={c:c,t:t};return p;}
function drawSign(id,title,sub,bg,fg){var s=dynSign[id];if(!s)return;var g=s.c.getContext('2d'),W2=s.c.width,H2=s.c.height;g.fillStyle=bg||'#2a1a12';g.fillRect(0,0,W2,H2);g.fillStyle=fg||'#ffc63d';g.textAlign='center';g.textBaseline='middle';
  var fs=Math.min(H2*.5,W2*1.6/Math.max(6,title.length));g.font='800 '+fs+'px '+(typeof FD!=='undefined'?FD:'system-ui');g.fillText(title,W2/2,sub?H2*.42:H2/2);if(sub){g.font='600 '+Math.round(H2*.18)+'px system-ui';g.globalAlpha=.8;g.fillText(sub,W2/2,H2*.78);g.globalAlpha=1;}s.t.needsUpdate=true;}
function isEatery(b){return ['restaurant','pizza','deli','diner','ramen','tacos','tea'].indexOf(b.type)>=0;}
function cuisine(b){return b.cuisine||CUISINE_OF[b.type]||'diner';}
/* the owner waits behind the counter: the same face you met at the door */
function placeRoomNpc(room,b,x,z,ry){var o=ROOMNPC[room];if(o&&o.me.root.parent)o.me.root.parent.remove(o.me.root);var me=talkerModel(b?b.key:'clerk:'+room);me.root.position.set(IOX[room]+x,0,z);me.root.rotation.y=ry||0;me.root.visible=true;dyn.add(me.root);ROOMNPC[room]={me:me,key:b?b.key:null,x:IOX[room]+x,z:z};}
function enterBiz(b){CUR_B=b;var room=isEatery(b)?'eatery':'store';if(!AREAS[room]){bizTalk(b,false);return;}
  AREAS[room].name=b.name;ENTRANCE[room]='biz:'+b.key;var s=W4().biz[b.key]||{};
  drawSign(room,b.name.toUpperCase(),s.own?'A CREMA COMPANY':room==='eatery'?'NOW SERVING':'EST. '+(1950+hashS(b.key)%70),room==='eatery'?'#7a2a22':'#2a1a12','#ffe3a8');
  placeRoomNpc(room,b,room==='eatery'?4:3.4,room==='eatery'?-3.6:-3.1,0);enterArea(room);}
function enterOffice(kind,name,who){CUR_B={office:kind,name:name,owner:who||'Clerk',key:'office:'+kind};AREAS.office.name=name;ENTRANCE.office=kind==='realty'?'realty':kind==='police'||kind==='post'||kind==='library'||kind==='fire'?'off:'+kind:'hall';
  drawSign('office',name.toUpperCase(),{police:'TO PROTECT AND SERVE',post:'U.S. MAIL',library:'SILENCE PLEASE',fire:'STATION 1',realty:'HOMES · LAND · LEASES'}[kind]||'',{police:'#1f2f5a',post:'#2f5f90',library:'#5a3a28',fire:'#a8322a',realty:'#2fa860'}[kind]||'#2a1a12','#fff');
  placeRoomNpc('office',{key:'office:'+kind},0,-2.2,0);enterArea('office');}
function storeRoom(){var g=room('store',{name:'Shop',w:14,d:11,floor:floorT(0xd8c3a0,0xcbb48e,5),wall:0xf2e6d2,trim:0x8a5a3a,bg:0x3a2a22,h:4.4,cam:{dist:9,pitch:.62}}),ox=IOX.store;
  roomSign('store',5,.9,0,3.6,-5.3,g);
  for(var a=0;a<3;a++){var x=-5+a*3.2;bx(.9,1.9,4.6,toon(0x8a5a3a),x,.95,.6,g);for(var sh=0;sh<3;sh++)for(var k=0;k<7;k++)for(var sd=-1;sd<=1;sd+=2)bx(.3,.3+((k+sh)%3)*.06,.5,toon([0xe2553f,0xffc63d,0x46a9e6,0x6cc76a,0xb39ddb,0xffffff,0xff8a3d][(a*3+k+sh+(sd>0?2:0))%7]),x+sd*.42,.45+sh*.6,-1.3+k*.62,g);addCol(ox+x-.5,ox+x+.5,-1.7,2.9,'store');}
  counterTop(g,3.4,-2.2,3.6,0x8a5a3a,0xf4efe6);addCol(ox+1.5,ox+5.3,-2.7,-1.7,'store');bx(.5,.4,.4,toon(0x3a3f4b),2.4,1.3,-2.2,g);
  sp(.3,toon(0x4f9a4a),-6.2,.9,-4.6,g,7);cy(.24,.2,.5,toon(0xc8743a),-6.2,.25,-4.6,g,8);
  ACTS.store.push({x:ox+3.4,z:-.9,r:1.8,label:function(){return CUR_B?'Talk to '+CUR_B.owner:'Counter';},sub:function(){var s=CUR_B&&W4().biz[CUR_B.key]||{};return s.own?'Your manager':CUR_B?'The owner':'';},fn:function(){if(CUR_B)bizTalk(CUR_B,false);}});
  ACTS.store.push({x:ox-1.8,z:.6,r:1.7,label:'Browse the shelves',sub:function(){var it=SOUV[CUR_B&&CUR_B.type]||SOUV.shop;return it[0]+' · '+fmt(it[1]);},fn:function(){var t=CUR_B&&CUR_B.type;if(t==='antiques'){antiques(CUR_B);return;}var it=SOUV[t]||SOUV.shop;buyItem(it[0],it[1],t);}});}
function buyItem(name,price,type){popup(name,'"'+pick(['Good choice.','That one\'s popular.','You\'ll love it.'])+'" · '+fmt(price),[{t:'Buy it · '+fmt(price),fn:function(){if(!pay(price,name))return;var w=W4();w.items=w.items||{};w.items[name]=(w.items[name]||0)+1;
  if(type==='hardware'){note('You have a pry bar','Heavy, rusty, useful. Somebody said the city crews open manholes with these…','good');}else if(type==='barber'){bubble(P.x,2.7,P.z,'Looking sharp','good');addFame(1);}else toast('Bought: '+name,'good');try{sfx.buy();}catch(e){}save();}},{t:'Just looking',cls:'sec'}],'',{who:CUR_B?CUR_B.owner:'Clerk',role:CUR_B?CUR_B.name:'',col:'#8a5a3a'});}
function eateryRoom(){var g=room('eatery',{name:'Restaurant',w:16,d:12,floor:floorT(0x8a3a32,0x2a1a12,8),wall:0xf4e2c8,trim:0x7a2a22,bg:0x2a1a12,h:4.4,cam:{dist:9.5,pitch:.6}}),ox=IOX.eatery;
  roomSign('eatery',5.5,1,0,3.5,-5.8,g);
  counterTop(g,4,-4.4,5,0x7a2a22,0xf4efe6);bx(5,1.2,.2,toon(0x9aa3ad),4,2.2,-5.85,g);for(var i=0;i<3;i++){cy(.25,.25,.2,toon(0x3a3f4b),2.4+i*1.6,1.2,-5.3,g,10);}addCol(ox+1.4,ox+6.6,-5,-3.9,'eatery');
  for(var tz=0;tz<2;tz++)for(var tx=0;tx<3;tx++){var x=-6+tx*3.2,z=-1+tz*3.4;cy(.65,.65,.06,toon(0xf4efe6),x,.95,z,g,14);cyB(.06,.95,toon(0x3a3f4b),x,0,z,g,6);
    [[-.95,0],[.95,0]].forEach(function(o){bx(.5,.08,.5,toon(0x7a2a22),x+o[0],.55,z,g);bx(.08,.6,.5,toon(0x7a2a22),x+o[0]*1.25,.85,z,g);});sp(.07,toon(0xff8a3d,{e:0xff8a3d,ei:.6}),x,1.05,z,g,6);
    if((tx+tz)%2===0){var d=liteMe();d.sit=true;d.root.position.set(ox+x-.95,.12,z);d.root.rotation.y=Math.PI/2;g.add(d.root);d.root.position.x-=ox;}addCol(ox+x-.7,ox+x+.7,z-.7,z+.7,'eatery');}
  [-7.9,7.9].forEach(function(x){for(var k=0;k<3;k++){var p=plane(1,.7,toon([0xe2553f,0x2f7a4a,0xffc63d][k]),x,2.4,-3+k*3,g);p.rotation.y=x<0?Math.PI/2:-Math.PI/2;}});
  ACTS.eatery.push({x:ox+4,z:-3,r:2,label:'Order at the counter',sub:function(){var m=MENUS[cuisine(CUR_B||{})]||MENUS.diner;return m.map(function(q){return q[0];}).slice(0,2).join(' · ');},fn:function(){orderFood(CUR_B?cuisine(CUR_B):'diner',CUR_B?CUR_B.owner:'Cook',CUR_B?CUR_B.name:'');}});
  bx(1.3,2.3,.12,toon(0x5a3a28),-6,1.15,-5.85,g);ACTS.eatery.push({x:ox-6,z:-4.8,r:1.4,label:function(){return CUR_B&&CUR_B.cuisine==='italian'?'A door marked PRIVATE':'Kitchen door';},sub:function(){return CUR_B&&CUR_B.cuisine==='italian'?'Voices, cigar smoke, espresso':'Staff only';},fn:function(){if(CUR_B&&CUR_B.cuisine==='italian')roasteryDoor();else toast('Staff only, hon.','');}});
  ACTS.eatery.push({x:ox-2.8,z:1,r:1.4,label:'Talk to the owner',sub:function(){return CUR_B?CUR_B.owner:'';},fn:function(){if(CUR_B)bizTalk(CUR_B,false);}});}
var fullUntil=0;
function orderFood(cu,who,where){var m=MENUS[cu]||MENUS.diner,k=tierM()>3?1+Math.log(tierM())*.3:1;
  popup(where||'Order','"What can I get you?"',m.map(function(q){var pr=Math.round(q[1]*k);return {t:q[0]+' · '+fmt(pr),fn:function(){if(now()<fullUntil){toast('You\'re stuffed. Maybe later.','bad');return;}if(!pay(pr,q[0]))return;eat(q[0]);}};}).concat([{t:'Nothing, thanks',cls:'sec'}]),'',{who:who,role:where,col:'#7a2a22',
    say:{ph:'Order anything… or ask about the secret menu',fn:function(t){var n=norm(t);if(cu==='italian'&&/the usual|back room|the family|vinnie|roastery|don arabica/.test(n)){W4().f.roastInv=1;save();popup(where,'...Of course. Through the door marked PRIVATE. They are expecting you.',[{t:'Grazie'}],'',{who:who,role:where,col:'#7a2a22',you:t});return;}
      if(/secret|off.?menu|special|chef/.test(n)&&!W4().f['sec'+cu]){W4().f['sec'+cu]=1;popup(where,'"...You know about that? Okay. One house special, on the house. Don\'t tell anyone."',[{t:'Thank you',fn:function(){eat('The secret house special');addFame(2);addXP(30);}}],'',{who:who,role:where,col:'#7a2a22',you:t});return;}
      var best=null,bs=0,qt=toks(t);m.forEach(function(q){var sc=overlap(qt,q[0]);if(sc>bs){bs=sc;best=q;}});if(best&&bs>=1){var pr=Math.round(best[1]*k);if(pay(pr,best[0]))eat(best[0]);return;}aiGeneric(t,where||'Order','What can I get you?',m.map(function(q){var pr=Math.round(q[1]*k);return {t:q[0]+' · '+fmt(pr),fn:function(){if(pay(pr,q[0]))eat(q[0]);}};}),'',{who:who,role:where,col:'#7a2a22'});}}});}
function eat(what){fullUntil=now()+120000;fade(function(){addXP(8);bubble(P.x,2.7,P.z,pick(['Mmm.','So good.','Worth it.','Chef\'s kiss.']),'good');var w=W4();w.stats.meals=(w.stats.meals||0)+1;if(w.stats.meals===10)note('Regular','You\'ve eaten at 10 restaurants. Locals are starting to know your face.','good');save();});}
function officeRoom(){var g=room('office',{name:'Office',w:14,d:10,floor:floorT(0xe6e2da,0xd6d0c4,4),wall:0xeef0f2,trim:0x3a3f4b,bg:0x2a2e36,h:4.4,cam:{dist:9,pitch:.62}}),ox=IOX.office;
  roomSign('office',5,.8,0,3.5,-4.8,g);counterTop(g,0,-1.4,4.4,0x3a3f4b,0xf4efe6);addCol(ox-2.3,ox+2.3,-1.9,-.9,'office');
  for(var i=0;i<2;i++){bx(1.8,.08,1,toon(0x8a5a3a),-5+i*10,.9,-3.4,g);bx(.5,.4,.05,toon(0x111111),-5+i*10,1.15,-3.7,g);}for(var s=0;s<4;s++){bx(.8,.08,.7,toon(0x2f5f90),-4.5+s*1.2,.5,3,g);bx(.8,.7,.08,toon(0x2f5f90),-4.5+s*1.2,.85,3.33,g);}
  bx(2.4,3,.4,toon(0x8a5a3a),5.6,1.5,-4.6,g);for(var b=0;b<14;b++)bx(.16,.42,.28,toon([0xe2553f,0x2f5f90,0xffc63d,0x2f7a4a][b%4]),4.6+(b%7)*.28,.6+Math.floor(b/7)*.9,-4.45,g);
  ACTS.office.push({x:ox,z:0,r:2,label:function(){return CUR_B&&CUR_B.office==='realty'?'Talk to Dana':'Front desk';},sub:function(){return CUR_B?CUR_B.name:'';},fn:officeDesk});
  ACTS.office.push({x:ox+5.4,z:-3.4,r:1.6,label:function(){return CUR_B&&CUR_B.office==='library'?'Read the town history':'Bulletin board';},sub:'',fn:function(){if(CUR_B&&CUR_B.office==='library')townHistory();else popup('Bulletin board','LOST: orange cat, answers to "Espresso".\nBAND SEEKS DRUMMER.\nFREE PIANO (you carry).\nCITY NOTICE: unauthorized sewer access is prohibited. Seriously, Gary.',[{t:'Ha',cls:'sec'}]);}});}
function officeDesk(){var k=CUR_B&&CUR_B.office,who={who:CUR_B?CUR_B.owner:'Clerk',role:CUR_B?CUR_B.name:'',col:'#3a3f4b'};
  if(k==='realty'){callDana(null,null,true);return;}
  if(k==='police')popup('Police','"Officer Diaz. What seems to be the problem?"',[{t:'Report a rival\'s dirty trick',fn:function(){var l=G.locs.filter(function(q){return q.comp;})[0];popup('Police',l?'"'+l.comp.name+', huh? We\'ll pay them a visit." (They\'ll think twice before trying anything.)':'"Nobody\'s bothering you right now. Lucky you."',[{t:'Thanks'}],'',who);if(l&&l.cd){l.cd.nocomp=now()+600000;}}},
    {t:'Ask about the manholes',fn:function(){popup('Police','"Off limits. City crews only. They pry \'em open with a bar, but you didn\'t hear that from me."',[{t:'Got it'}],'',who);var w=W4();w.f=w.f||{};w.f.sewerHint=1;save();}},{t:'Never mind',cls:'sec'}],'',who);
  else if(k==='post')popup('Post office','"Next! What are we mailing?"',[{t:'Send Mom a postcard · $1',fn:function(){if(!pay(1,'Postage'))return;setTimeout(function(){textIn('Mom','Got your postcard!! It\'s on the fridge. Call your mother more. ❤️');},40000);toast('Mailed.','good');}},{t:'Never mind',cls:'sec'}],'',who);
  else if(k==='library')townHistory();
  else if(k==='fire')popup('Fire station','"Captain Bell. Don\'t touch the pole."',[{t:'Ring the bell',fn:function(){try{tone(1568,.6,'triangle',.06);tone(1175,.8,'triangle',.05,.15);}catch(e){}bubble(P.x,2.8,P.z,'DING DING DING','good');addXP(2);}},{t:'Slide down the pole',fn:function(){fade(function(){toast('Wheeee. The captain is not amused.','');addFame(1);});}},{t:'Bye',cls:'sec'}],'',who);
  else popup(CUR_B?CUR_B.name:'Office','"How can I help?"',[{t:'Just looking',cls:'sec'}],'',who);}
function townHistory(){var w=W4();w.f=w.f||{};w.f.sewerHint=1;save();popup('A History of '+plan.name,'Founded in 1871 by Josiah Crema, a coffee merchant who arrived with one sack of beans and a mule named Doppio.\nThe old storm tunnels under the streets still connect half the town. City crews open the manholes with a pry bar; hardware stores still sell them.\nLegend says Josiah hid his first profits somewhere below Main Street.',[{t:'Close the book',cls:'sec'}]);}
/* the mall: stores, a food court, an arcade, a fountain that takes wishes, and a kiosk with your name on it */
function mallRoom(){var g=room('mall',{name:plan.name+' Galleria',w:64,d:30,floor:floorT(0xe6d6bc,0xc9b48f,3),tile:3,wall:0xf3e7d3,trim:0x2a1a12,bg:0x2a2a30,h:9,cam:{dist:12,pitch:.58}}),ox=IOX.mall;
  wallSign(g,plan.name.toUpperCase()+' GALLERIA',0,7.6,-14.8,{bg:'#2a1a12',fg:'#ffc63d',w:14,h:1.2});
  bx(64,.3,3,toon(0xe8e2d6),0,4.6,-13.5,g);for(var x=-31;x<=31;x+=2)bx(.08,1,.08,toon(0xc8c8c8),x,5.2,-12,g);bx(64,.08,.08,toon(0xc8c8c8),0,5.7,-12,g);
  var esc_=prism(2,4.4,6,toon(0xc8ccd2),26,0,-9,g);esc_.rotation.y=Math.PI/2;
  var shops=[['THREADS','#e2553f','Clothing'],['GADGET HUB','#2f5f90','Electronics'],['TOY PLANET','#ffc63d','Toys'],['PLAY ZONE','#7a5ad8','Arcade'],['CINEMA 6','#1a1a1a','Movies']];
  shops.forEach(function(s,i){var x=-26+i*11;bx(9,4.2,.4,toon(0x3a3f4b),x,2.1,-14.6,g);bx(7,3,.1,glass(0xbfe6ff,.35),x,1.6,-14.35,g);wallSign(g,s[0],x,3.75,-14.3,{bg:s[1],fg:'#fff',w:5,h:.8});});
  ACTS.mall.push({x:ox-26,z:-12.8,r:2.2,label:'Threads · clothing',sub:'Pick out a hat',fn:hatShop});
  ACTS.mall.push({x:ox-15,z:-12.8,r:2.2,label:'Gadget Hub',sub:'Phone cases, earbuds, cables',fn:function(){CUR_B={owner:'Kai',name:'Gadget Hub',type:'phones',key:'mall:gadget'};buyItem('Wireless earbuds',59,'phones');}});
  ACTS.mall.push({x:ox-4,z:-12.8,r:2.2,label:'Toy Planet',sub:'Plushies and puzzles',fn:function(){CUR_B={owner:'Bea',name:'Toy Planet',type:'toys',key:'mall:toys'};buyItem('A giant plush coffee bean',24,'toys');}});
  ACTS.mall.push({x:ox+7,z:-12.8,r:2.2,label:'Play Zone arcade',sub:'Claw machine · a strange old cabinet',fn:arcadeZone});
  ACTS.mall.push({x:ox+18,z:-12.8,r:2.2,label:'Cinema 6',sub:'Catch a movie · $12',fn:function(){if(!pay(12,'The ticket'))return;fade(function(){addXP(15);toast(pick(['That twist! Did not see it coming.','Two hours of explosions. Great.','A rom-com. You cried a little.']),'good');});}});
  // food court
  [['NOODLE BAR','#e2553f',-26],['BURGER BARN','#ffc63d',-18],['PRETZEL TWIST','#2fa860',-10]].forEach(function(f){counterTop(g,f[2],10,5,0xffffff,0xf4efe6);wallSign(g,f[0],f[2],3,11.8,{bg:f[1],fg:'#fff',w:4.4,h:.7,ry:Math.PI});npc(g,f[2],11,Math.PI,{shirt:0x3a3f4b});addCol(ox+f[2]-2.6,ox+f[2]+2.6,9.5,10.6,'mall');
    ACTS.mall.push({x:ox+f[2],z:8.6,r:2,label:f[0].charAt(0)+f[0].slice(1).toLowerCase(),sub:'Food court',fn:function(){orderFood('court','Food court',f[0]);}});});
  for(var t=0;t<6;t++){var tx=-27+t*3.6,tz=5;cy(.6,.6,.06,toon(0xffffff),tx,.9,tz,g,12);cyB(.06,.9,toon(0x3a3f4b),tx,0,tz,g,6);addCol(ox+tx-.6,ox+tx+.6,tz-.6,tz+.6,'mall');}
  // fountain, planters, skylight
  cy(3,3.2,.7,toon(0xc8ccd2),7,.35,6,g,24);cy(2.7,2.7,.05,toon(0x6ab8e8,{e:0x2a6a9a,ei:.2}),7,.68,6,g,24);cy(.3,.4,2.2,toon(0xc8ccd2),7,1.1,6,g,10);sp(.5,toon(0x6ab8e8,{e:0x2a6a9a,ei:.3}),7,2.4,6,g,10);addCol(ox+4,ox+10,3,9,'mall');
  for(var bn=0;bn<8;bn++){var bp=plane(1.2,3,toon([0xe2553f,0xffc63d,0x2f8fd0,0x2fa860][bn%4],{ds:1}),-28+bn*8,6.2,-4,g);}
  ACTS.mall.push({x:ox+7,z:9.6,r:2,label:'Toss a coin in the fountain',sub:'Make a wish · 25¢',fn:wishCoin});
  [[-30,-2],[30,-2],[-30,8],[30,8]].forEach(function(q){cy(.9,.8,.9,toon(0xc8743a),q[0],.45,q[1],g,10);sp(1,toon(0x4f9a4a),q[0],1.6,q[1],g,8);});
  bx(40,.2,14,glass(0xcfeaff,.5),0,8.9,0,g);
  // your kiosk
  var w=W4(),kc=w.mallK&&w.mallK[O.city];var kx=20,kz=4;rb(3.4,1.05,1.6,.1,toon(kc?0x2a1a12:0xd8d2c6),kx,.52,kz,g);if(kc){wallSign(g,'CREMA',kx,2.4,kz,{bg:'#2a1a12',fg:'#ffc63d',w:2.4,h:.6});npc(g,kx,kz-1,0,{shirt:0xffc63d});}else wallSign(g,'KIOSK FOR LEASE',kx,2.2,kz,{bg:'#ffffff',fg:'#2a1a12',w:2.6,h:.5});addCol(ox+kx-1.8,ox+kx+1.8,kz-.9,kz+.9,'mall');
  ACTS.mall.push({x:ox+kx,z:kz+1.8,r:1.8,label:function(){return mallKiosk()?'Your Crema kiosk':'Kiosk for lease';},sub:function(){var c=Math.round(9000*tierM());return mallKiosk()?'Earning '+fmt(mallKioskRev())+'/min':'Lease it for Crema · '+fmt(c)+' to set up';},fn:function(){var c=Math.round(9000*tierM());if(mallKiosk()){popup('Crema · '+plan.name+' Galleria','"Shoppers love us. The pretzel guy is jealous."',[{t:'Great',cls:'sec'}],'',{who:'Kiosk barista',col:'#ffc63d'});return;}
    popup('Lease the kiosk','Set up a Crema kiosk in the busiest spot in the mall. About '+fmt(mallKioskRev())+'/min.',[{t:'Lease it · '+fmt(c),fn:function(){if(!pay(c,'The kiosk'))return;var w2=W4();w2.mallK=w2.mallK||{};w2.mallK[O.city]=1;var k='mall:'+O.city;w2.biz[k]={own:true,name:'Crema kiosk · '+plan.name+' Galleria',rev:mallKioskRev(),city:O.city,paid:c};O.dirty=true;save();note('Kiosk open','Mall shoppers are lining up.','good');}},{t:'Not now',cls:'sec'}]);}});
  for(var s2=0;s2<8;s2++){var sh=liteMe();sh.root.position.set(ox-20+s2*5,0,0);dyn.add(sh.root);shoppers.push({me:sh,x:ox-20+s2*5,z:0,tx:ox-20+s2*5,tz:0,w:rnd(0,3),area:'mall'});}}
function mallKiosk(){var w=W4();return !!(w.mallK&&w.mallK[O.city]);}
function mallKioskRev(){return Math.round(420*tierM());}
function hatShop(){var cols=[['Red beanie',0xe2553f],['Navy cap',0x2a3a6a],['Sunny yellow',0xffc63d],['Black fedora',0x1a1a1a],['Mint bucket hat',0x8fe3c0]];
  popup('Threads','"Hats are 20% off. Everything looks good on you, by the way."',cols.map(function(c){return {t:c[0]+' · $25',fn:function(){if(!pay(25,'The hat'))return;W4().hat=c[1];hatView();save();bubble(P.x,2.8,P.z,'Nice hat','good');}};}).concat([W4().hat?{t:'Take the hat off',fn:function(){W4().hat=null;hatView();save();}}:null,{t:'Just browsing',cls:'sec'}]).filter(Boolean),'',{who:'Jo',role:'Threads',col:'#e2553f'});}
var hatM=null;function hatView(){if(!P.me)return;var c=W4().hat;if(hatM&&hatM.parent)hatM.parent.remove(hatM);hatM=null;if(!c)return;hatM=new T.Group();hatM.position.set(0,1.78,0);P.me.root.add(hatM);cy(.34,.36,.22,toon(c),0,.11,0,hatM,14);cy(.48,.48,.04,toon(c),0,0,.04,hatM,16);}
function arcadeZone(){popup('Play Zone','The machines blink and chirp. One old cabinet in the corner is unplugged… or is it?',[{t:'Claw machine · $2',fn:function(){if(!pay(2,'The claw'))return;if(Math.random()<.14){var w=W4();w.items=w.items||{};w.items['Claw-machine plush']=(w.items['Claw-machine plush']||0)+1;banner('You won!','A plush donut','good');save();}else toast('So close. The claw is rigged. Everyone knows.','');}},
  {t:'The old cabinet',fn:function(){popup('CREMA RUSH (1987)','INSERT COIN… HIGH SCORE: '+fmt(Math.max(G.stats.best||0,(G.stats.served||0)))+' BY YOU\nPRESS START',[{t:'Kick it',fn:function(){if(!W4().f.cabinet){W4().f.cabinet=1;var c=Math.round(200*tierM());G.cash+=c;banner('Clunk… jingle','The cabinet coughs up '+fmt(c)+' in old quarters','good');save();}else toast('It\'s empty. You already got it.','');}},{t:'Leave it',cls:'sec'}]);}},{t:'Leave',cls:'sec'}]);}
function wishCoin(){if(!pay(.25,'A quarter'))return;var w=W4();w.wish=(w.wish||0)+1;try{tone(880,.08,'sine',.03);}catch(e){}
  if(w.wish%25===0){var c=Math.round(500*tierM());G.cash+=c;banner('A wish comes true','Someone pays you back '+fmt(c)+' they owed you, out of nowhere','good');}else if(Math.random()<.05){rain.next=9999;bubble(P.x,2.7,P.z,'Clear skies ahead','good');}else bubble(P.x,2.7,P.z,'plink','');save();}
/* the mall and restaurant row on the street */
function mallBlock(b,r){var g=new T.Group();g.position.set(b.x,0,b.z);stat.add(g);var W2=BW-7,D2=BD-8,h=10;
  rb(W2,h,D2,.2,toon(0xece6dc),0,h/2,0,g);rb(W2+.4,.5,D2+.4,.1,toon(0x2a1a12),0,h,0,g);bx(W2*.5,h-1.5,.2,glass(0x9fd2f2,.4),0,(h-1.5)/2+.3,D2/2+.05,g);bx(W2*.5,h-1.5,.2,glass(0x9fd2f2,.4),0,(h-1.5)/2+.3,-D2/2-.05,g);
  [1,-1].forEach(function(s){var z=s*(D2/2+.15);plane(W2*.45,1.4,flat(0xffffff,{map:signT(plan.name.toUpperCase()+' GALLERIA',{bg:'#2a1a12',fg:'#ffc63d',w:1024,h:150})}),0,h-.8,z+s*.06,g).rotation.y=s>0?0:Math.PI;
    rb(8,.3,3,.1,toon(0x2a1a12),0,3.4,z+s*1.4,g);[-3.6,3.6].forEach(function(x){cyB(.1,3.2,toon(0x3a3f4b),x,.2,z+s*2.7,g,6);});
    for(var k=0;k<6;k++)plane(1,2.4,toon([0xe2553f,0xffc63d,0x2f5f90][k%3],{ds:1}),-W2/2+3+k*(W2-6)/5,6,z+s*.1,g).rotation.y=s>0?0:Math.PI;
    var dw={x:b.x,z:b.z+s*(D2/2+1.6)};ACTS.city.push({x:dw.x,z:dw.z,r:2.4,door:true,label:'Enter the mall',sub:plan.name+' Galleria · shops, food court, arcade, cinema',fn:function(){enterArea('mall');}});
    if(s>0)places.push({id:'mall',name:plan.name+' Galleria (mall)',kind:'civic',x:dw.x,z:dw.z});});
  addCol(b.x-W2/2,b.x+W2/2,b.z-D2/2,b.z+D2/2).h=h;
  for(var c=0;c<8;c++){var car=carModel(pick(['sedan','hatch','van']),pick(CARC)),x=b.x-W2/2+2+c*(W2/7.5);car.position.set(x+(r()-.5),0,b.z+(c%2?1:-1)*(BD/2-1.6));car.rotation.y=Math.PI/2;stat.add(car);}}
function diningBlock(b,r){var used={};lotsOf(b).forEach(function(lot){var rr=seeded(b.seed*29+lot.s*5+lot.i);var k=Math.floor(rr()*RESTS.length),n=0;while(used[k]&&n++<20)k=(k+1)%RESTS.length;used[k]=1;var R2=RESTS[k];
    genBuilding(lot,b,rr,{name:R2[0],type:'restaurant',cuisine:R2[1],arch:rr()<.5?'diner':'classic'});});
  var bulbs=new T.Group();stat.add(bulbs);[1,-1].forEach(function(s){for(var x=b.x-BW/2+1;x<b.x+BW/2-1;x+=1.1)sp(.07,MAT.lamp,x,3.3+Math.sin(x*.7)*.2,b.z+s*(BD/2-1.6),bulbs,6);});}
/* civic buildings get a real door */
function officeDoor(lot,kind,name,who){var dw=L2W(lot,DOORX,.9);ACTS.city.push({x:dw.x,z:dw.z,r:1.8,door:true,dn:lot,label:'Go into '+name,sub:who?who+' is in':'Open to the public',fn:function(){enterOffice(kind,name,who);}});places.push({id:'off:'+kind,name:name,kind:'civic',x:dw.x,z:dw.z});}
/* manholes, and the tunnels under them */
function buildManholes(){MH=[];var p=plan,g=new T.Group(),k=0;stat.add(g);
  for(var i=0;i<p.xs.length;i++)for(var j=0;j<p.zs.length;j++){if((i*3+j*5+p.city)%4!==0)continue;var x=p.xs[i]+RH*.55,z=p.zs[j]+RH+3.4;if(k>=9)break;
    cy(.55,.55,.05,toon(0x4a4a4a),x,.04,z,g,16);tor(.48,.04,toon(0x3a3a3a),x,.07,z,g,null,16).rotation.x=Math.PI/2;MH.push({x:x,z:z,name:(segStreet({x:p.xs[i],z:p.zs[j]},{x:p.xs[i],z:p.zs[j]+1})||'')+' & '+(p.hn[j]||''),i:k});k++;}
  MH.forEach(function(m){ACTS.city.push({x:m.x,z:m.z,r:1.3,label:function(){return hasBar()?'Pry open the manhole':'A heavy manhole cover';},sub:function(){return hasBar()?'Into the old storm tunnels':W4().f&&W4().f.sewerHint?'You\'d need a pry bar':'It won\'t budge';},
    fn:function(){if(!hasBar()){toast(W4().f&&W4().f.sewerHint?'You need a pry bar. Hardware stores sell them.':'It won\'t budge.','bad');return;}var w=W4();w.f.sewer=1;save();enterArea('sewer');setTimeout(function(){P.x=AREAS.sewer.ox+ladderX(m.i);P.z=-2.6;},420);}});});}
function hasBar(){var it=W4().items||{};return !!(it['A pry bar']||it['Pry bar']);}
function ladderX(i){return -AREAS.sewer.w/2+5+i*9;}
function sewerRoom(){var n=Math.max(2,MH.length),w=10+n*9,g=room('sewer',{name:'Storm tunnels',w:w,d:9,floor:floorT(0x4a5048,0x3e443c,3),wall:0x5a6258,trim:0x3a3f3a,bg:0x0e1210,h:4,outside:0x2a2e2a,cam:{dist:8,pitch:.6}}),ox=IOX.sewer;
  var wt=plane(w-1,1.6,toon(0x4a6a52,{e:0x1a3a22,ei:.25}),0,.03,.4,g);wt.rotation.x=-Math.PI/2;
  for(var x=-w/2+2;x<w/2-1;x+=3){cy(.25,.25,8.6,toon(0x6a5a48),x,3.5,0,g,8).rotation.x=Math.PI/2;sp(.12,toon(0xffd98a,{e:0xffc040,ei:.8}),x+1.5,3.4,-4.2,g,6);}
  wallSign(g,'J.C. WAS HERE · 1871',-w/2+12,1.8,-4.3,{bg:'#3e443c',fg:'#c8d0c0',w:3,h:.5});wallSign(g,'CREMA 4 EVER',w/2-10,2.1,-4.3,{bg:'#3e443c',fg:'#ffc63d',w:2.4,h:.5});
  for(var i=0;i<n;i++){var lx=ladderX(i);if(!MH[i])continue;for(var r=0;r<8;r++)bx(.9,.06,.06,toon(0x8a8f96),lx,.3+r*.45,-4.25,g);bx(.06,3.8,.06,toon(0x8a8f96),lx-.45,1.9,-4.25,g);bx(.06,3.8,.06,toon(0x8a8f96),lx+.45,1.9,-4.25,g);
    wallSign(g,MH[i].name.toUpperCase(),lx,3.6,-4.3,{bg:'#1e2420',fg:'#e8eee8',w:2.6,h:.45});
    (function(m){ACTS.sewer.push({x:ox+ladderX(m.i),z:-3.3,r:1.3,label:'Climb out at '+m.name,sub:'Shortcut',fn:function(){fade(function(){P.area='city';P.x=m.x+1.2;P.z=m.z;O.snap=true;doorCD=1;updDaylight();try{tone(220,.2,'square',.03);}catch(e){}});}});})(MH[i]);}
  // Josiah's lockbox, under Main Street
  var bxx=-w/2+3.2;rb(.7,.45,.5,.05,toon(0x5a4030),bxx,.25,3.6,g);ACTS.sewer.push({x:ox+bxx,z:3.6,r:1.3,label:function(){return W4().f.lockbox?'An empty old lockbox':'A rusty lockbox';},sub:'Initials on the lid: J.C.',fn:function(){var w2=W4();if(w2.f.lockbox){toast('Empty. You already found Josiah\'s stash.','');return;}w2.f.lockbox=1;var c=Math.round(5000*tierM());G.cash+=c;addFame(10);banner('Josiah Crema\'s stash!','+'+fmt(c)+' in antique coins','good');save();}});
  for(var rt=0;rt<4;rt++){var rat=new T.Group();rat.position.set(ox-w/2+6+rt*(w/4),0,-3.6+rt%2*7);dyn.add(rat);sp(.12,toon(0x5a5048),0,.1,0,rat,6).scale.set(1.6,1,1);cy(.01,.02,.3,toon(0xc89a8a),-.25,.08,0,rat,4).rotation.z=Math.PI/2;anim.push({roll:rat,x0:rat.position.x,x1:rat.position.x+6,t:rt*.3,v:.08});}
  // the supply store keeps a pry bar in the back, if you look
  var sA=AREAS.supply;if(sA){ACTS.supply.push({x:sA.ox-sA.w/2+1.6,z:-sA.d/2+1.6,r:1.4,label:function(){return hasBar()?'An empty hook':'A pry bar on a hook';},sub:function(){return hasBar()?'':'Sewer crews use these · $25';},fn:function(){if(hasBar())return;CUR_B={owner:'Hank',name:'Crema Supply Co.',type:'hardware',key:'supco'};buyItem('A pry bar',25,'hardware');}});}}
/* wave down a cab on the street, or anywhere */
function taxiActs(){if(drv||RIDE||P.area!=='city')return [];var best=null,bd=7;cars.forEach(function(c){if(c.kind!=='taxi')return;var d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;best=c;}});if(!best)return [];
  return [{x:P.x,z:P.z,r:9,label:'Hail the taxi',sub:'Wave it down · it\'ll take you anywhere',fn:hailBox}];}
function hailBox(){var ps=placesSorted().slice(0,5);popup('City Cab','"Where to?"',ps.map(function(p){return {t:p.name,fn:function(){callCab(p);}};}).concat([{t:'Never mind',cls:'sec'}]),'',{who:'Cabbie',role:'City Cab',col:'#ffc63d',say:{ph:'Anywhere… "the beach", "my house", "Paper Moon"',fn:cabTo}});}
function cabTo(t){var n=norm(t);if(/home|my house/.test(n)&&W4().home){var hp=placeById('home:'+W4().home);if(hp){callCab(hp);return;}}
  var cs=[];for(var c=0;c<Math.max(4,(G.cities||1)+2);c++)if(c!==O.city&&n.indexOf(cityName(c).toLowerCase())>=0)cs.push(c);
  if(cs.length){popup('City Cab','"'+cityName(cs[0])+'? That\'s a flight, friend. Airport?"',[{t:'Yes, the airport',fn:function(){callCab(placeById('airport'));}},{t:'Never mind',cls:'sec'}],'',{who:'Cabbie',col:'#ffc63d'});return;}
  var p=findPlace(t);if(p){callCab(p);return;}popup('City Cab','"Never heard of it. Try a street or a shop name?"',[{t:'OK',cls:'sec'}],'',{who:'Cabbie',col:'#ffc63d',you:t});}
