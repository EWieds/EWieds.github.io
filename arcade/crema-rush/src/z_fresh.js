
/* ---------- Mg1's Fresh Market: Fresh Market Rush (a Lazer Arcade community game by Mg1) as the town's grocery store.
   Shop there as a customer. Buy it, and you run it exactly like Fresh Market Rush: load shelves, hire stockers, collect the cash pile,
   upgrade, open more locations, and fight off Big Box Bros. Mg1 stays on at the register. ---------- */
var FM_BASEP=[3,4,5,7,9,12,15,25],FM_BASEC=[0,0,60,180,450,1000,2200,4500];
var FM_MAIN=[['Apples','🍎',0xe2553f,'s'],['Bananas','🍌',0xffd24a,'c'],['Bread','🍞',0xd8a45a,'b'],['Milk','🥛',0xf6f6f6,'b'],['Eggs','🥚',0xf4efe6,'s'],['Cheese','🧀',0xffc63d,'b'],['Cookies','🍪',0xb8845a,'c'],['Mg1\'s Apple Pie','🥧',0xc8743a,'c']];
var FM_TYPES=[['Fruit & Veggies','🍎',['Apples','Bananas','Carrots','Tomatoes','Broccoli','Grapes','Strawberries','Watermelon']],['Bakery','🥐',['Bread','Croissants','Baguettes','Bagels','Cookies','Donuts','Cupcakes','Cakes']],['Dairy & Deli','🧀',['Milk','Eggs','Butter','Cheese','Ice Cream','Bacon','Chicken','Steak']],['Candy Shop','🍭',['Candy','Lollipops','Chocolate','Popcorn','Juice Boxes','Soda','Pudding','Cake Slices']],
  ['Food Court','🍔',['Salads','Tacos','Pizza','Burgers','Pasta','Ramen','Sushi','Bento']],['Flower Shop','🌸',['Daisies','Tulips','Sunflowers','Roses','Blossoms','Cactus','Potted Plants','Bouquets']],['Toy Store','🧸',['Balloons','Yo-yos','Dice Games','Puzzles','Kites','Toy Cars','Teddy Bears','Robots']],['Pet Shop','🐾',['Dog Bones','Yarn Toys','Goldfish','Hamsters','Turtles','Birds','Bunnies','Puppies']]];
var FM_UP=[{id:'worker',n:'Hire Stocker',d:'Loads & restocks shelves',base:40,mult:2.3,max:6},{id:'wspeed',n:'Faster Stockers',d:'Faster loading, carry more',base:75,mult:1.85,max:8},{id:'reg',n:'Faster Register',d:'Mg1 rings people up quicker',base:60,mult:1.8,max:8},{id:'shelf',n:'Bigger Shelves',d:'+4 items per shelf',base:90,mult:1.9,max:4},
  {id:'ads',n:'Advertising',d:'More shoppers come in',base:70,mult:1.9,max:10},{id:'price',n:'Premium Quality',d:'+15% on every sale',base:150,mult:2.1,max:8},{id:'loyalty',n:'Loyalty Cards',d:'Fewer shoppers go to Big Box Bros',base:400,mult:2.2,max:5,comp:true},{id:'manager',n:'Hire Manager',d:'Collects the cash pile for you',base:2500,mult:1,max:1}];
var FMS=null,FMV=null;
function fmGB(){return BUS.filter(function(q){return q.grocery;})[0]||null;}
function fmOwned(){var gb=fmGB();return !!(gb&&W4().biz[gb.key]&&W4().biz[gb.key].own);}
function fmState(){var w=W4();if(!w.fm)w.fm={lv:{worker:0,wspeed:0,reg:0,shelf:0,ads:0,price:0,loyalty:0,manager:0},unlocked:2,stock:[8,8,0,0,0,0,0,0],pile:0,sale:0,rival:0,locs:{},served:0,earned:0,names:[]};return w.fm;}
function fmLv(){return fmOwned()?fmState().lv:{worker:2,wspeed:2,reg:3,shelf:1,ads:3,price:0,loyalty:2,manager:1};}
function fmUnlocked(){return fmOwned()?fmState().unlocked:8;}
function fmK(){return Math.max(1,tierM());}
function fmPrice(i){return Math.round(FM_BASEP[i]*fmK()*(1+.15*fmLv().price)*100)/100;}
function fmShelfMax(){return 8+4*fmLv().shelf;}
function fmRegTime(){return 2.2*Math.pow(.8,fmLv().reg);}
function fmWSpeed(){return 2.1*Math.pow(1.15,fmLv().wspeed);}
function fmCarry(){return 4+fmLv().wspeed;}
function fmWMul(){return Math.pow(.86,fmLv().wspeed);}
function fmSpawnInt(){var s=fmState();return 4.6*Math.pow(.86,fmLv().ads)*(fmOwned()&&s.sale>now()?.55:1)/(fmOwned()?1-s.rival*.8:1);}
function fmMaxCust(){return 6+2*fmLv().ads;}
function fmUpCost(u){return Math.floor(u.base*Math.pow(u.mult,fmState().lv[u.id])*fmK()*4);}
function fmOwnedLocs(){return Object.keys(fmState().locs).length;}
function fmLocCost(k){return Math.round(1200*Math.pow(2.6,k)/100)*100*fmK();}
function fmIncome(){if(!fmOwned())return 0;var s=fmState(),t=0;Object.keys(s.locs).forEach(function(d,i){var l=s.locs[d],k=i+1,avg=0;for(var q=0;q<(l.un||3);q++)avg+=FM_BASEP[q];avg/=(l.un||3);t+=avg*Math.pow(2.6,Math.min(k,8))*2/4.6*.5*60*fmK()*(1-s.rival*.8);});return Math.round(t);}
/* the building */
function freshRoom(){var gb=fmGB();if(!gb)return;
  var g=room('grocery',{name:gb.name,w:24,d:18,floor:floorT(0xf4f1e8,0xe3ecdf,4),wall:0xe8f3e6,trim:0x2f9e57,bg:0x2a3a2e,h:5.4,cam:{dist:10,pitch:.62}}),ox=IOX.grocery;
  wallSign(g,'MG1\'S FRESH MARKET',0,4.4,-8.8,{bg:'#2f9e57',fg:'#fff',w:8,h:1,sub:'FRESH FOOD · FRIENDLY PRICES · SINCE FRESH MARKET RUSH'});
  for(var aw=0;aw<12;aw++)bx(2,.5,.6,toon(aw%2?0xef6f6c:0xffffff),-11+aw*2,3.6,-8.6,g);
  FMV={sh:[],shop:[],stk:[],q:[],pile:null,ox:ox,cust:[],t:0,spawn:1,reg:0,inc:[0,0,0,0,0,0,0,0],load:[0,0,0,0,0,0,0,0],ldur:[1,1,1,1,1,1,1,1],sound:0};
  var dg=new T.Group();dg.position.x=ox;dyn.add(dg);FMV.dg=dg;
  for(var i=0;i<8;i++){var row=i>>2,c=i%4,x=-8.5+c*4.6,z=row?0:-4.6;var u=new T.Group();u.position.set(x,0,z);g.add(u);
    bx(3.2,.25,.95,toon(0x7d8690),0,.12,0,u);bx(3.2,1.9,.12,toon(0x9aa3ad),0,1.05,-.42,u);for(var t2=0;t2<2;t2++)bx(3.1,.05,.85,toon(0xf4f4f4),0,.62+t2*.62,0,u);bx(3.3,.16,1,toon(0x2f9e57),0,2.04,0,u);
    addCol(ox+x-1.65,ox+x+1.65,z-.55,z+.5,'grocery');
    var lab=document.createElement('canvas');lab.width=256;lab.height=72;var lt=new T.CanvasTexture(lab);lt.encoding=T.sRGBEncoding;var lp=plane(1.6,.45,flat(0xffffff,{map:lt}),x,2.45,z+.1,dg);
    var items=new T.Group();items.position.set(x,0,z);dg.add(items);var ms=[];for(var k=0;k<12;k++){var m=fmItemMesh(i,items,-1.25+(k%6)*.5,.72+Math.floor(k/6)*.62,.05);ms.push(m);}
    var crate=bx(.6,.4,.5,toon(0xb8845a),x+1,.45,z+.75,dg);crate.visible=false;
    FMV.sh.push({x:ox+x,z:z,ax:ox+x,az:z+1.1,lab:{c:lab,t:lt},ms:ms,crate:crate,i:i});}
  // the register, Mg1, the cash pile, the queue rail
  counterTop(g,9,4.5,3,0x2f9e57,0xffffff);addCol(ox+7.4,ox+10.6,4,5,'grocery');bx(.5,.35,.4,toon(0x3a3f4b),8.4,1.28,4.4,g);plane(.42,.26,toon(0x31e0ff,{e:0x1a8aa8,ei:.6}),8.4,1.36,4.61,g);
  for(var rl=0;rl<6;rl++)cyB(.04,1,toon(0xc8ccd2),7.6-rl*1,0,7.1,g,5);bx(5,.05,.05,toon(0xc8ccd2),5.1,.95,7.1,g);
  FMV.pileG=new T.Group();FMV.pileG.position.set(ox+9.9,1.12,4.5);dyn.add(FMV.pileG);
  // the stock room at the back
  bx(4,3,.2,toon(0xd8d2c6),-1,1.5,-7.4,g);bx(1.4,2.3,.1,toon(0x8a6a4a),-1,1.15,-7.28,g);for(var cr=0;cr<6;cr++)bx(.7,.5,.6,toon(0xb8845a),-3.6+(cr%3)*.75,.25+Math.floor(cr/3)*.5,-7,g);
  plane(1.6,.4,flat(0xffffff,{map:signT('STOCK ROOM',{bg:'#24352a',fg:'#fff',w:256,h:64})}),-1,2.6,-7.28,g);
  // Mg1's office (with the supplier's invoices) in the back corner
  bx(1.8,.9,.9,toon(0x6b4a30),-10.4,.45,-7.4,g);plane(.6,.4,toon(0xffffff),-10.4,.92,-7.4,g).rotation.x=-Math.PI/2;bx(.15,2.6,3,toon(0xd8d2c6),-8.6,1.3,-7.5,g);addCol(ox-11.6,ox-9.4,-8,-6.9,'grocery');
  // produce bins by the door, a credits plaque, the upgrades board
  for(var pb=0;pb<3;pb++){var st=new T.Group();st.position.set(-9.5+pb*2.4,0,5.4);g.add(st);rb(1.8,.8,1.2,.04,toon(0x8a5a3a),0,.4,0,st);for(var j=0;j<12;j++)sp(.14,toon([0xe2553f,0x6cc76a,0xff8a3d][pb]),-.6+(j%4)*.4,.86,-.3+Math.floor(j/4)*.3,st,6);addCol(ox-10.5+pb*2.4,ox-8.5+pb*2.4,4.8,6,'grocery');}
  var pq=wallSign(g,'FRESH MARKET RUSH',-11.8,2.4,2.4,{bg:'#fff8dc',fg:'#1f7a41',w:2.4,h:1.1,sub:'A LAZER ARCADE COMMUNITY GAME BY MG1',ry:Math.PI/2});
  wallSign(g,'UPGRADES & LOCATIONS',11.85,2.4,0,{bg:'#ff6f91',fg:'#fff',w:2.6,h:.9,ry:-Math.PI/2});
  var gbk=gb.key;placeRoomNpc('grocery',gb,9,3.6,0);
  // acts
  FMV.sh.forEach(function(S){ACTS.grocery.push({x:S.ax,z:S.az,r:1.5,label:function(){return fmShelfLabel(S.i);},sub:function(){return fmShelfSub(S.i);},fn:function(){fmShelfAct(S.i);}});});
  ACTS.grocery.push({x:ox+9,z:6,r:1.8,label:function(){return fmOwned()?(fmState().pile>=1?'Collect the cash · '+fmt(fmState().pile):'The register'):(fmBasketTotal()?'Check out with Mg1 · '+fmt(fmBasketTotal()):'Talk to Mg1');},sub:function(){return fmOwned()?(fmState().lv.manager?'Your manager collects it':'Mg1 rings them up. You collect it.'):(fmBasketTotal()?fmBasketList():'Mg1 runs the register (and the store)');},fn:fmRegister,alt:function(){return {label:'Talk to Mg1',fn:function(){bizTalk(fmGB(),false);}};}});
  ACTS.grocery.push({x:ox+11,z:0,r:1.6,label:function(){return fmOwned()?'Upgrades & Locations':'Store notices';},sub:function(){return fmOwned()?fmt(fmIncome())+'/min from other locations':'Help wanted · Coupons';},fn:fmBoard});
  ACTS.grocery.push({x:ox-11,z:2.4,r:1.4,label:'Read the plaque',sub:'',fn:function(){popup('Fresh Market Rush','"This store is built on Fresh Market Rush, a game Mg1 made for the Lazer Arcade community. Load the shelves, hire stockers, open 25 locations, and beat Big Box Bros." Mg1 still works the register.',[{t:'Cool'}]);}});
  ACTS.grocery.push({x:ox-10.4,z:-6.4,r:1.6,label:function(){return W4().found&&W4().found.valley?'Invoices (Valley Farms · 555-0199)':'Peek at the invoices on the desk';},sub:'Mg1\'s office',fn:function(){var w=W4();w.found=w.found||{};var first=!w.found.valley;w.found.valley=1;save();
    popup('Invoice','VALLEY FARMS DISTRIBUTION\n"Your farm-to-shelf partner since 1971"\nApples 64 cs · Milk 120 cs · Flour 80 sacks · Eggs 40 cs\nQuestions? Call Earl: 555-0199',[{t:'Call Earl now',fn:callValley},{t:'Put it back',cls:'sec'}]);if(first)note('New contact: Valley Farms','Earl supplies Mg1\'s Fresh Market, and probably half the town. He\'s in your phone now.','good');}});
  ACTS.grocery.push({x:ox-1,z:-6.6,r:1.4,label:'Stock room',sub:function(){return fmOwned()?'Crates for the shelves':'Employees only';},fn:function(){toast(fmOwned()?'Walk up to a shelf to load it. Stockers fetch from here.':'"Employees only, friend." (Mg1)','');}});
  fmDrawLabels();}
function fmItemMesh(i,par,x,y,z){var it=FM_MAIN[i],m,mat=toon(it[2]);if(it[3]==='s')m=sp(.16,mat,x,y+.16,z,par,8);else if(it[3]==='c'){m=cy(.17,.17,.22,mat,x,y+.11,z,par,10);}else m=bx(.3,.36,.3,mat,x,y+.18,z,par);if(i===3){bx(.31,.08,.31,toon(0x46a9e6),0,.22,0,m);}if(i===1)m.rotation.z=1.2;return m;}
function fmDrawLabels(){if(!FMV)return;var un=fmUnlocked();FMV.sh.forEach(function(S){var g=S.lab.c.getContext('2d'),i=S.i,lock=i>=un;g.fillStyle=lock?'#9aa3ad':'#2f9e57';g.fillRect(0,0,256,72);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font='bold 26px system-ui';g.fillText((lock?'🔒 ':FM_MAIN[i][1]+' ')+FM_MAIN[i][0],128,26);g.font='bold 20px system-ui';g.fillStyle='#fff8dc';g.fillText(lock?'Unlock · '+fmt(FM_BASEC[i]*fmK()*4):fmt(fmPrice(i))+' each',128,56);S.lab.t.needsUpdate=true;});}
function fmStock(){if(fmOwned())return fmState().stock;var w=W4();if(!w.fmShop||w.fmShop.length!==8)w.fmShop=[10,10,10,10,10,10,10,10];return w.fmShop;}
function fmShelfLabel(i){var un=fmUnlocked(),st=fmStock(),own=fmOwned();if(i>=un)return 'Sell '+FM_MAIN[i][0]+' '+FM_MAIN[i][1];if(own){if(FMV.load[i]>0)return 'Loading '+FM_MAIN[i][0]+'…';var miss=fmShelfMax()-st[i];return miss>0?'Load '+FM_MAIN[i][0]+' ('+miss+' missing)':FM_MAIN[i][0]+' (full)';}return 'Grab '+FM_MAIN[i][0]+' · '+fmt(fmPrice(i));}
function fmShelfSub(i){var st=fmStock();if(i>=fmUnlocked())return 'Costs '+fmt(FM_BASEC[i]*fmK()*4)+' to start selling';if(FMV.load[i]>0)return Math.round((1-FMV.load[i]/FMV.ldur[i])*100)+'%';return st[i]+'/'+fmShelfMax()+' on the shelf'+(fmOwned()?'':' · '+(W4().basket&&W4().basket[i]?W4().basket[i]+' in your basket':''));}
function fmShelfAct(i){var st=fmStock(),s=fmState();if(!fmOwned()){if(st[i]<1){toast('Sold out. A stocker is on the way.','bad');return;}st[i]--;var w=W4();w.basket=w.basket||{};w.basket[i]=(w.basket[i]||0)+1;bubble(P.x,2.4,P.z,'+1 '+FM_MAIN[i][1],'good');try{tone(620,.06,'sine',.04);}catch(e){}return;}
  if(i>=s.unlocked){var c=FM_BASEC[i]*fmK()*4;if(i>s.unlocked){toast('Unlock '+FM_MAIN[s.unlocked][0]+' first.','');return;}if(!pay(c,'New shelf'))return;s.stock[i]=fmShelfMax();s.unlocked++;banner('Now selling '+FM_MAIN[i][0],FM_MAIN[i][1],'good');fmDrawLabels();save();return;}
  if(FMV.load[i]>0){toast('Already loading…','');return;}var miss=fmShelfMax()-st[i];if(miss<=0){toast('That shelf is already full!','');return;}FMV.load[i]=FMV.ldur[i]=.4+.16*miss;FMV.sh[i].crate.visible=true;try{tone(330,.06,'square',.03);}catch(e){}}
function fmBasketTotal(){var b=W4().basket||{},t=0;Object.keys(b).forEach(function(i){t+=b[i]*fmPrice(+i);});return Math.round(t*100)/100;}
function fmBasketList(){var b=W4().basket||{};return Object.keys(b).map(function(i){return b[i]+' '+FM_MAIN[i][0];}).join(', ');}
function fmRegister(){var w=W4(),s=fmState(),gb=fmGB();if(fmOwned()){if(s.pile>=1){var a=Math.round(s.pile);s.pile=0;G.cash+=a;s.earned+=a;banner('+'+fmt(a),'Fresh Market cash','good');try{tone(1046,.12,'triangle',.08);tone(1568,.3,'triangle',.06,.08);}catch(e){}fmPile();save();}else bizTalk(gb,false);return;}
  var t=fmBasketTotal();if(!t){bizTalk(gb,false);return;}if(!pay(t,'Groceries'))return;w.pantry=w.pantry||{};Object.keys(w.basket).forEach(function(i){var n=FM_MAIN[i][0];w.pantry[n]=(w.pantry[n]||0)+w.basket[i];});w.basket={};
  popup('Mg1','"'+pick(['Thanks for shopping at Fresh Market! Come back soon.','Paper or plastic? Kidding. It\'s all paper.','Good choice on the apple pie. My recipe.','That\'ll keep you going. Have a good one!'])+'"\nYour groceries are in your kitchen at home.',[{t:'Thanks, Mg1'}],'',{who:'Mg1',role:'Mg1\'s Fresh Market',col:'#2f9e57',say:{ph:'Say something to Mg1…',fn:function(t2){aiGeneric(t2,'Mg1','You are Mg1, the cheerful founder and cashier of Mg1\'s Fresh Market (the grocery store) in '+plan.name+'. You made the store famous with the Fresh Market Rush idea. Friendly, a little proud of your apple pie.',[{t:'OK'}],'',{who:'Mg1',col:'#2f9e57'});}}});save();}
function fmBoard(){var s=fmState();if(!fmOwned()){popup('Store notices','• HELP WANTED: stockers. Ask Mg1.\n• Fresh Market Rush: try it in the Lazer Arcade community games!\n• This week: Mg1\'s Apple Pie, '+fmt(fmPrice(7))+'.\n• Lost cat? Check with the post office.',[{t:'OK'}]);return;}
  var opts=FM_UP.filter(function(u){return !u.comp||s.rival>0;}).map(function(u){var lv=s.lv[u.id],mx=lv>=u.max,c=fmUpCost(u);return {t:u.n+(mx?' · MAX':' · '+fmt(c)),s:u.d+' · level '+lv+'/'+u.max,off:mx,why:'Maxed out.',fn:function(){if(!pay(c,u.n))return;s.lv[u.id]++;if(u.id==='worker'){var nm=pick(['Sam','Maya','Leo','Zoe','Omar','Ruby','Jake','Lily','Max','Nina','Theo','Ivy']);s.names.push(nm);toast(nm+' joined the team!','good');fmSpawnStockers();}if(u.id==='loyalty')s.rival=Math.min(s.rival,fmRivalCap());if(u.id==='shelf')fmDrawLabels();if(u.id==='price')fmDrawLabels();save();setTimeout(fmBoard,60);}};});
  opts.push({t:'📍 Locations ('+fmOwnedLocs()+'/24)',s:'Open more Fresh Markets around town',fn:fmLocations});if(s.rival>0)opts.push({t:'📣 Run a Sale · '+fmt(Math.round(400*fmK()*4)),s:s.sale>now()?'On now':'Win shoppers back from Big Box Bros for 45 seconds',off:s.sale>now(),why:'A sale is already running.',fn:function(){if(!pay(Math.round(400*fmK()*4),'The sale'))return;s.sale=now()+45000;s.rival=Math.max(0,s.rival-.2);banner('SALE!','Shoppers are flooding back','good');save();}});
  opts.push({t:'Done',cls:'sec'});popup('Upgrades & Locations','Served '+s.served+' shoppers · earned '+fmt(s.earned)+' here'+(s.rival>0?'\n⚔️ Big Box Bros steals '+Math.round(s.rival*100)+'% of shoppers':''),opts);}
function fmLocations(){var s=fmState(),ds=plan.blocks.filter(function(b){return b.D;}).map(function(b){return b.D;}),seen={};ds=ds.filter(function(D){if(seen[D.id])return false;seen[D.id]=1;return true;});var k=fmOwnedLocs()+1,c=fmLocCost(k);
  popup('Locations','Each new Fresh Market costs more and earns a lot more. Pick a neighborhood, then pick what it sells.',ds.slice(0,10).map(function(D){var have=s.locs[D.id];return {t:(have?'✓ ':'')+D.name,s:have?FM_TYPES[have.type][1]+' '+FM_TYPES[have.type][0]:'Open for '+fmt(c),off:!!have,why:'Already open.',fn:function(){fmPickType(D,c);}};}).concat([{t:'Back',cls:'sec',fn:fmBoard}]));}
function fmPickType(D,c){var s=fmState();popup('What does it sell?',D.name,FM_TYPES.map(function(T2,i){return {t:T2[1]+' '+T2[0],s:T2[2].slice(0,4).join(' · '),fn:function(){if(!pay(c,'New location'))return;s.locs[D.id]={type:i,un:3,at:now()};banner('Fresh Market · '+D.name,T2[0]+' is open','good');if(fmOwnedLocs()===3&&!s.rivalSeen){s.rivalSeen=1;s.rival=.15;popup('A rival chain appeared!','Big Box Bros just opened stores all over town. Some shoppers walk past with red BB bags.\n• Run a Sale to win shoppers back\n• Buy Loyalty Cards so fewer leave\n• Keep growing',[{t:'Bring it on!'}]);}save();}};}));}
function fmRivalCap(){return Math.max(.1,.6-.1*fmState().lv.loyalty);}
/* the simulation: runs while you're in the store */
function fmPile(){var g=FMV&&FMV.pileG;if(!g)return;while(g.children.length)g.remove(g.children[0]);var p=fmOwned()?fmState().pile:0;if(p<1)return;var n=Math.min(14,1+Math.floor(Math.log(p+1)*1.6));for(var i=0;i<n;i++){var b=bx(.34,.04,.18,toon(0x6cc76a),((i%3)-1)*.12,Math.floor(i/3)*.045,(i%2)*.05,g);b.rotation.y=i*.6;}}
function fmSpawnStockers(){if(!FMV)return;FMV.stk.forEach(function(w2){if(w2.me.root.parent)w2.me.root.parent.remove(w2.me.root);});FMV.stk=[];var n=fmLv().worker;for(var i=0;i<n;i++){var me=liteMe({shirt:0x2f9e57,apron:0x1f7a41});me.root.position.set(FMV.ox-1+i*.6,0,-6.4);dyn.add(me.root);FMV.stk.push({me:me,x:FMV.ox-1+i*.6,z:-6.4,path:[],st:'idle',t:Math.random(),tg:-1,res:0,carry:0});}}
function fmRoute(ax,az,bx2,bz){if(Math.abs(az-bz)<.3)return [[bx2,bz]];var cx=FMV.ox+7.4;return [[cx,az],[cx,bz],[bx2,bz]];}
function fmMove(e,dt,sp){var moving=false;while(e.path.length){var t=e.path[0],dx=t[0]-e.x,dz=t[1]-e.z,d=Math.hypot(dx,dz),step=sp*dt;if(d<=step){e.x=t[0];e.z=t[1];e.path.shift();continue;}e.x+=dx/d*step;e.z+=dz/d*step;e.me.root.rotation.y=Math.atan2(dx,dz);moving=true;break;}
  e.me.root.position.set(e.x,0,e.z);animLite(e.me,Math.min(dt,.05),moving);return !e.path.length;}
function fmEnter(){if(!FMV)return;FMV.cust.forEach(function(c){if(c.me.root.parent)c.me.root.parent.remove(c.me.root);});FMV.cust=[];FMV.q=[];fmSpawnStockers();fmDrawLabels();fmPile();fmShowStock();}
function fmShowStock(){var st=fmStock(),mx=fmShelfMax(),un=fmUnlocked();FMV.sh.forEach(function(S){var n=S.i>=un?0:Math.ceil(st[S.i]/mx*12);S.ms.forEach(function(m,k){m.visible=k<n;});});}
function fmSpawnCust(){var un=fmUnlocked(),av=[];for(var i=0;i<un;i++)av.push(i);av.sort(function(){return Math.random()-.5;});var k=1+Math.floor(Math.random()*Math.min(3,av.length)),list=av.slice(0,k).sort(function(a,b){return b-a;});
  var me=liteMe();var c={me:me,x:FMV.ox,z:8.2,path:[[FMV.ox,2.8]],st:'enter',list:list,li:0,cart:0,tot:0,t:0,want:1};me.root.position.set(c.x,0,c.z);dyn.add(me.root);FMV.cust.push(c);
  if(fmOwned()&&fmState().rival>0&&Math.random()<fmState().rival*.6){c.rivalBag=1;c.list=[];c.path=[[FMV.ox,6],[FMV.ox+1.5,8.6]];c.st='leave';var bag=bx(.3,.35,.15,toon(0xe2553f),.3,.6,.1,me.root);}}
function fmGoShelf(c){var S=FMV.sh[c.list[c.li]];c.want=1+Math.floor(Math.random()*3);c.path=fmRoute(c.x,c.z,S.ax+rnd(-1.1,1.1),S.az+.1);c.st='toShelf';}
function fmNext(c){c.li++;if(c.li<c.list.length){fmGoShelf(c);return;}if(c.cart){FMV.q.push(c);var p=fmQPos(FMV.q.length-1);c.path=fmRoute(c.x,c.z,p[0],p[1]);c.st='toQ';}else fmLeave(c,'😠');}
function fmQPos(i){return [FMV.ox+8.6-i*.9,6.2];}
function fmLeave(c,mood){c.st='leave';if(mood)bubble(c.x,2.4,c.z,mood,mood==='😠'?'bad':'');c.path=fmRoute(c.x,c.z,FMV.ox+1.4,6.6).concat([[FMV.ox+1.4,8.8]]);}
function updFresh(dt){if(P.area!=='grocery'||!FMV||!O.on)return;var V=FMV,own=fmOwned(),s=fmState(),st=fmStock(),mx=fmShelfMax();dt=Math.min(dt,.1);V.t+=dt;
  if(own&&s.rival>0&&s.sale<now())s.rival=Math.min(fmRivalCap(),s.rival+dt*.002);
  V.spawn-=dt;if(V.spawn<=0){V.spawn=fmSpawnInt()*rnd(.7,1.3);if(V.cust.length<fmMaxCust())fmSpawnCust();}
  for(var i=0;i<8;i++){if(V.load[i]>0){V.load[i]-=dt;if(V.load[i]<=0){V.load[i]=0;st[i]=mx;V.sh[i].crate.visible=false;try{tone(620,.07,'sine',.05);}catch(e){}bubble(V.sh[i].ax,2.2,V.sh[i].az,'Full!','good');}}}
  V.cust.forEach(function(c){var arrived;switch(c.st){case 'enter':if(fmMove(c,dt,2.3))fmGoShelf(c);break;
    case 'toShelf':if(fmMove(c,dt,2.3)){c.st='pick';c.t=.5;c.me.root.rotation.y=Math.PI;}break;
    case 'pick':c.t-=dt;animLite(c.me,dt,false);if(c.t<=0){var k=c.list[c.li];if(st[k]>0){var n=Math.min(c.want,st[k]);st[k]-=n;c.cart+=n;c.tot+=n*fmPrice(k);fmNext(c);}else{c.st='wait';c.t=6;bubble(c.x,2.4,c.z,FM_MAIN[k][1]+'?','');}}break;
    case 'wait':c.t-=dt;animLite(c.me,dt,false);var k2=c.list[c.li];if(st[k2]>0){var n2=Math.min(c.want,st[k2]);st[k2]-=n2;c.cart+=n2;c.tot+=n2*fmPrice(k2);fmNext(c);}else if(c.t<=0){bubble(c.x,2.4,c.z,'😕','');fmNext(c);}break;
    case 'toQ':if(fmMove(c,dt,2.3))c.st='q';break;
    case 'q':var qi=V.q.indexOf(c),p=fmQPos(qi);if(Math.abs(c.x-p[0])>.05){c.path=[p];fmMove(c,dt,2);}else{animLite(c.me,dt,false);c.me.root.rotation.y=Math.PI/2;}break;
    case 'leave':if(fmMove(c,dt,2.4))c.dead=1;break;}});
  if(V.q.length){V.reg+=dt;var head=V.q[0];if(Math.abs(head.x-fmQPos(0)[0])<.1&&V.reg>=fmRegTime()){V.reg=0;V.q.shift();s.served+=own?1:0;if(own){s.pile+=head.tot;if(s.lv.manager){var a=Math.round(s.pile);if(a>=1){s.pile-=a;G.cash+=a;s.earned+=a;}}fmPile();}try{tone(1320,.08,'sine',.03);}catch(e){}bubble(head.x,2.5,head.z,own?'+'+fmt(head.tot):'🛍️','good');fmLeave(head,null);}}else V.reg=0;
  V.cust=V.cust.filter(function(c){if(c.dead){if(c.me.root.parent)c.me.root.parent.remove(c.me.root);return false;}return true;});
  V.stk.forEach(function(w2){var S=w2.tg>=0?V.sh[w2.tg]:null;switch(w2.st){case 'idle':var best=-1,br=.75,un=fmUnlocked();for(var i2=0;i2<un;i2++){if(V.load[i2]>0)continue;var r=(st[i2]+V.inc[i2])/mx;if(r<br){br=r;best=i2;}}
      if(best>=0){w2.tg=best;w2.res=fmCarry();V.inc[best]+=w2.res;w2.path=fmRoute(w2.x,w2.z,V.ox-1+rnd(-.8,.8),-6.4);w2.st='toStock';}else{animLite(w2.me,dt,false);}break;
    case 'toStock':if(fmMove(w2,dt,fmWSpeed())){w2.st='load';w2.t=(.3+.13*w2.res)*fmWMul();}break;
    case 'load':w2.t-=dt;animLite(w2.me,dt,false);if(w2.t<=0){w2.carry=w2.res;if(!w2.box){w2.box=bx(.5,.35,.4,toon(0xb8845a),0,.9,.4,w2.me.root);}w2.box.visible=true;w2.path=fmRoute(w2.x,w2.z,S.ax+rnd(-1,1),S.az);w2.st='toShelf';}break;
    case 'toShelf':if(fmMove(w2,dt,fmWSpeed())){w2.st='stock';w2.t=(.2+.11*Math.max(1,Math.min(w2.carry,mx-st[w2.tg])))*fmWMul();w2.me.root.rotation.y=Math.PI;}break;
    case 'stock':w2.t-=dt;animLite(w2.me,dt,false);if(w2.t<=0){var add=Math.max(0,Math.min(w2.carry,mx-st[w2.tg]));st[w2.tg]+=add;V.inc[w2.tg]=Math.max(0,V.inc[w2.tg]-w2.res);if(add)bubble(w2.x,2.3,w2.z,'+'+add+' '+FM_MAIN[w2.tg][1],'good');w2.carry=0;w2.res=0;if(w2.box)w2.box.visible=false;w2.st='idle';w2.tg=-1;}break;}});
  V.sound-=dt;if(V.sound<=0){V.sound=.5;fmShowStock();}}
