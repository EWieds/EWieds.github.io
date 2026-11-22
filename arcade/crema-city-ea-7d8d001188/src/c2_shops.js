
/* ---------- every business is its own building, and every business has an owner you can deal with ---------- */
var BT={
  grocery:{base:6,arch:'market',prop:'produce',what:'a grocery store'},books:{base:1,arch:'brick',prop:'cart',what:'a bookshop'},florist:{base:.9,arch:'cottage',prop:'flowers',what:'a flower shop'},
  pizza:{base:1.3,arch:'classic',prop:'bench',what:'a pizza place'},deli:{base:1.2,arch:'classic',prop:'bench',what:'a deli'},records:{base:.8,arch:'brick',prop:'cart',what:'a record store'},
  toys:{base:.9,arch:'classic',prop:'balloons',what:'a toy shop'},barber:{base:.8,arch:'brick',prop:'pole',what:'a barbershop'},nails:{base:.8,arch:'modern',prop:'plant',what:'a nail salon'},
  laundry:{base:.9,arch:'modern',prop:'washers',what:'a laundromat'},phones:{base:1.2,arch:'modern',prop:'plant',what:'a phone shop'},copy:{base:.8,arch:'classic',prop:'cart',what:'a print shop'},
  ramen:{base:1.3,arch:'diner',prop:'lantern',what:'a noodle bar'},bikes:{base:.9,arch:'warehouse',prop:'bikes',what:'a bike shop'},gym:{base:1.1,arch:'warehouse',prop:'weights',what:'a gym'},
  yoga:{base:.8,arch:'modern',prop:'plant',what:'a yoga studio'},surf:{base:1,arch:'cottage',prop:'boards',what:'a surf shop'},tacos:{base:1.2,arch:'diner',prop:'bench',what:'a taco joint'},
  gifts:{base:.9,arch:'cottage',prop:'balloons',what:'a gift shop'},antiques:{base:.8,arch:'brick',prop:'cart',what:'an antiques store'},tea:{base:.9,arch:'cottage',prop:'flowers',what:'a tea house'},
  ski:{base:1.2,arch:'cottage',prop:'skis',what:'a ski shop'},inn:{base:1.6,arch:'cottage',prop:'lantern',what:'an inn'},karaoke:{base:1.2,arch:'diner',prop:'lantern',what:'a karaoke bar'},
  arcade:{base:1.3,arch:'modern',prop:'balloons',what:'an arcade'},fish:{base:1.3,arch:'warehouse',prop:'ice',what:'a fish market'},hardware:{base:1.4,arch:'warehouse',prop:'cart',what:'a hardware store'},
  pets:{base:1,arch:'classic',prop:'dog',what:'a pet shop'},auto:{base:1.4,arch:'warehouse',prop:'tires',what:'an auto shop'},shop:{base:1,arch:'classic',prop:'plant',what:'a shop'},
  office:{base:3,arch:'tower',nosale:1,what:'an office'}};
var BT_RX=[[/FreshMart|Grocery/,'grocery'],[/Book/,'books'],[/Florist|Bloom|Lace|Linen/,'florist'],[/Pizza|Slice/,'pizza'],[/Deli|Diner/,'deli'],[/Vinyl|Record/,'records'],[/Toy/,'toys'],[/Cuts|Barber/,'barber'],
  [/Nails/,'nails'],[/Laundr|Suds/,'laundry'],[/Phone/,'phones'],[/Copy|Print|Paper|Post$/,'copy'],[/Ramen|Noodle|Dumpling|Bao/,'ramen'],[/Bike/,'bikes'],[/Gym|Iron|Spin|Climb/,'gym'],[/Yoga/,'yoga'],
  [/Surf|Board|Sun & Sand/,'surf'],[/Taco|Fish Tacos/,'tacos'],[/Gift|Shell|Kite/,'gifts'],[/Antique|Clock|Apothecary|Old Post/,'antiques'],[/Tea|Cocoa/,'tea'],[/Ski|Snow|Gear|Wool/,'ski'],[/Inn|Fireside/,'inn'],
  [/Karaoke/,'karaoke'],[/Arcade|Lucky Cat/,'arcade'],[/Fish|Dock|Ship|Rope|Ferry/,'fish'],[/Hardware|Bolt/,'hardware'],[/Pet|Paws/,'pets'],[/Tire|Auto|Driving/,'auto'],
  [/Capital|Bank|Law|Labs|Media|Partners|Northwind/,'office']];
function bizType(n){for(var i=0;i<BT_RX.length;i++)if(BT_RX[i][0].test(n))return BT_RX[i][1];return 'shop';}
var OWNERS=['Sal','Rosa','Marty','Dee','Hank','Priya','Gus','Lorraine','Tomás','Bev','Ike','Nadia','Walt','Mei','Frank','Ines','Ray','Odette','Vic','Sunny'];
var PERS={tired:{ask:1.3,floor:1.08,pat:5},practical:{ask:1.5,floor:1.2,pat:4},shrewd:{ask:1.8,floor:1.38,pat:3},proud:{ask:2,floor:1.5,pat:2},sentimental:{ask:1.7,floor:1.35,pat:4},greedy:{ask:2.2,floor:1.55,pat:3}};
var BUS=[];
function hashS(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function bizOf(key){for(var i=0;i<BUS.length;i++)if(BUS[i].key===key)return BUS[i];return null;}
function bizRev(b){if(b.revv)return Math.round(b.revv*(1+.3*((W4().biz[b.key]||{}).ren||0)));var D=b.D||{cost:1500};return Math.round((18+Math.sqrt(D.cost||0)/4)*BT[b.type].base*TM(b.city).pm*(1+.3*((W4().biz[b.key]||{}).ren||0)));}
function bizValue(b){var D=b.D||{cost:1500};return Math.round((18+Math.sqrt(D.cost||0)/4)*BT[b.type].base*TM(b.city).pm*95);}

/* building styles: classic, brick, modern, cottage, diner, warehouse/market, tower */
function genBuilding(lot,b,r,opt){
  opt=opt||{};var pal=palette(b),biz=opt.name||pick(BIZ[b.D?b.D.win:'street']||BIZ.street),type=opt.type||bizType(biz),T0=BT[type];
  var arch=opt.arch||(pal.style==='glass'?'tower':pal.style==='old'&&r()<.6?'cottage':b.D&&b.D.win==='snow'?'cottage':b.D&&b.D.win==='campus'&&r()<.6?'brick':T0.arch);
  var g=lotGroup(lot),w=lot.w-.3,d=BDEP-.4,col=pal.cols[Math.floor(r()*pal.cols.length)],acc=pal.cols[(Math.floor(r()*7)+1)%pal.cols.length];if(acc===col)acc=0x2a1a12;
  var h=3.6,fl=1,fh=3.2;
  function front(){plane(w-3.2,2.3,toon(0xffffff,{map:shopInT(type)}),.9,1.55,.13,g);bx(w-3.2,2.3,.06,glass(0xbfe6ff,.35),.9,1.55,.2,g);bx(1.2,2.4,.14,toon(0x5a3a28),DOORX,1.2,.18,g);bx(1.5,.15,.3,toon(0xffffff),DOORX,2.5,.2,g);}
  function sign(y,bg,fg,ww){plane(Math.min(ww||w-1.5,6.4),.9,flat(0xffffff,{map:signT(biz,{bg:bg||'#fffaf0',fg:fg||'#3a2317',w:512,h:128})}),.6,y,.2,g);}
  if(arch==='tower'){fl=opt.floors||Math.round(4+r()*6);h=3.6+fl*fh;rb(w,h,d,.12,toon(col),0,h/2,-d/2,g);planeR(w-.6,fl*fh,Math.round(w/4.2),fl,facadeMat(col,'glass'),0,3.6+fl*fh/2,.02,g);
    rb(w+.3,.4,d+.3,.08,toon(0xe8eef2),0,h+.1,-d/2,g);bx(w-1,3,.1,glass(0x9fd2f2,.5),0,1.6,.15,g);bx(w,.3,1.6,toon(0xe8eef2),0,3.3,.7,g);sign(3.7,'#2a3a4a','#ffffff');
    if(r()<.4){cyB(.06,4,toon(0xd8d8d8),w/4,h,-d/2,g,6);sp(.12,toon(0xe2553f),w/4,h+4,-d/2,g,6);}}
  else if(arch==='brick'){fl=opt.floors||Math.round(2+r()*2);h=3.6+fl*fh;var bc=pick([0xb8573e,0xa84a36,0xc4673e,0x9a4a3a]);rb(w,h,d,.08,toon(bc),0,h/2,-d/2,g);
    planeR(w-1,fl*fh,Math.round(w/3.4),fl,facadeMat(bc,'old'),0,3.6+fl*fh/2,.02,g);bx(w+.4,.5,.6,toon(0xe8dcc8),0,h-.1,.15,g);for(var k=0;k<Math.round(w/.7);k++)bx(.25,.25,.2,toon(0xe8dcc8),-w/2+.35+k*.7,h-.5,.35,g);
    bx(w,.25,.3,toon(0xe8dcc8),0,3.5,.1,g);front();sign(3.0,'#2a2018','#f2d8a8');
    var bl=new T.Group();bl.position.set(w/2-.4,3.9,.6);g.add(bl);bx(.06,.06,.9,toon(0x2a2a2a),0,.4,0,bl);var bs=plane(.9,.9,flat(0xffffff,{map:signT(biz.split(' ')[0],{bg:'#2a2018',fg:'#f2d8a8',w:256,h:256}),ds:1}),0,0,.45,bl);bs.rotation.y=Math.PI/2;}
  else if(arch==='modern'){fl=opt.floors||Math.round(1+r()*2);h=3.8+fl*fh;rb(w,h,d,.05,toon(0xf2f2f0),0,h/2,-d/2,g);
    planeR(w-.4,fl*fh,Math.round(w/1.2),1,toon(0xffffff,{map:stripeT(0x9a6a44,0x7a5434)}),0,3.8+fl*fh/2,.02,g);bx(w-.8,3.2,.08,glass(0xcfe8f4,.45),0,1.8,.16,g);plane(w-.9,3.1,toon(0xffffff,{map:shopInT(type)}),0,1.8,.11,g);
    bx(w+.2,.25,2.4,toon(0x2a2a30),0,3.75,.7,g);bx(1.2,2.6,.1,toon(0x2a2a30),DOORX,1.3,.2,g);
    plane(Math.min(w-2,5),.7,flat(0xffffff,{map:signT(biz,{bg:'#1a1a22',fg:pick(['#ff79b4','#31e0ff','#ffc63d','#7fe3a2']),w:512,h:110})}),.6,3.35,.3,g);}
  else if(arch==='cottage'){h=4.2;rb(w,h,d,.1,toon(col),0,h/2,-d/2,g);var rf=prism(w+.6,3,d+.6,toon(pick([0x9a5a4a,0x5a6a7a,0x7a4a3a,0x4f6f5a])),0,h,-d/2,g);rf.rotation.y=Math.PI/2;
    if(b.D&&b.D.win==='snow'){var sc=prism(w+.7,.7,d+.7,toon(0xffffff),0,h+2.35,-d/2,g);sc.rotation.y=Math.PI/2;}
    var dm=new T.Group();dm.position.set(1.5,h+.7,-.9);g.add(dm);rb(1.6,1.3,1.4,.06,toon(col),0,.6,0,dm);bx(1,.8,.05,toon(0x7fb4d8),0,.6,.71,dm);var dr=prism(1.9,.9,1.6,toon(0x9a5a4a),0,1.25,0,dm);dr.rotation.y=Math.PI/2;
    front();for(var k2=-1;k2<=1;k2+=2){bx(.35,1.6,.08,toon(acc),.9+k2*(w/2-1.4),1.7,.22,g);}
    rb(w-3.4,.3,.35,.05,toon(0x8a5a3a),.9,.55,.35,g);for(var f=0;f<6;f++)sp(.13,toon([0xff6b8f,0xffc63d,0xffffff,0xb39ddb][f%4]),.9-(w-3.6)/2+f*(w-3.6)/5,.78,.35,g,6);
    sign(3.3,'#fff6e6','#5a3a28',w-2);h+=3;}
  else if(arch==='diner'){h=4.4;rb(w,h,d,.9,toon(col),0,h/2,-d/2,g);bx(w+.05,.18,.1,toon(0xe8ecf0),0,1.05,.02,g);bx(w+.05,.18,.1,toon(0xe8ecf0),0,3.2,.02,g);
    bx(w-1.6,1.8,.06,glass(0xcfe8f4,.4),.6,2.1,.08,g);plane(w-1.7,1.7,toon(0xffffff,{map:shopInT(type)}),.6,2.1,.04,g);bx(1.2,2.4,.14,toon(0xe8ecf0),DOORX,1.2,.1,g);
    var rs=new T.Group();rs.position.set(0,h+.2,-1.2);g.add(rs);cyB(.05,.8,toon(0x3a3f4b),-1.5,0,0,rs,6);cyB(.05,.8,toon(0x3a3f4b),1.5,0,0,rs,6);
    plane(4.8,1.3,flat(0xffffff,{map:signT(biz,{bg:'#e2553f',fg:'#fff6e6',w:768,h:200})}),0,1.4,0,rs);sp(.08,MAT.lamp,-2.3,1.4,.05,rs,6);sp(.08,MAT.lamp,2.3,1.4,.05,rs,6);h+=2;}
  else if(arch==='warehouse'||arch==='market'){h=arch==='market'?6:5.2;var wc=arch==='market'?0xeef2e4:pick([0xc8ccd2,0xb8c4cc,0xd8cdbf]);
    rb(w,h,d,.06,toon(wc),0,h/2,-d/2,g);planeR(w,h-3.6,Math.round(w),1,toon(0xffffff,{map:stripeT(wc,0xa8b0b8)}),0,3.6+(h-3.6)/2,.02,g);
    for(var t=0;t<3;t++){var sw=prism(w/3,1.2,d-.4,toon(0x9aa2ac),-w/3+t*w/3,h,-d/2,g);sw.rotation.y=Math.PI/2;}
    if(arch==='market'){bx(w-.8,3,.08,glass(0xcfe8f4,.4),0,1.7,.14,g);plane(w-.9,2.9,toon(0xffffff,{map:shopInT('grocery')}),0,1.7,.09,g);bx(w,.5,2.2,toon(0x2fa860),0,3.55,.9,g);
      plane(w-1,1.1,flat(0xffffff,{map:signT(biz,{bg:'#2fa860',fg:'#ffffff',w:768,h:140})}),0,4.6,.12,g);}
    else{bx(4.2,3.2,.12,toon(0xd8dee6),1.4,1.7,.08,g);for(var k3=0;k3<7;k3++)bx(4.1,.04,.03,toon(0xa8b0b8),1.4,.3+k3*.45,.16,g);bx(1.2,2.4,.14,toon(0x3a3f4b),DOORX,1.2,.12,g);sign(3.9,'#ffffff','#2a3a4a');}}
  else{fl=opt.floors||Math.max(1,Math.round((1.6+r()*2.2)*pal.tall));h=3.6+fl*fh;rb(w,h,d,.12,toon(col),0,h/2,-d/2,g);
    planeR(w-1,fl*fh,Math.max(1,Math.round(w/4.2)),fl,facadeMat(col,pal.style==='apt'?'apt':'std'),0,3.6+fl*fh/2,.02,g);rb(w+.3,.4,d+.3,.08,toon(0xffffff),0,h+.1,-d/2,g);
    if(r()<.5){rb(1.6,.9,1.2,.1,toon(0xc8ccd2),-w/4,h+.75,-d/2,g);if(r()<.35){cyB(.9,1.6,toon(0x9a6a44),w/4,h+.3,-d/2-1,g,12);cone(1,.7,toon(0x7a5434),w/4,h+2.25,-d/2-1,g,12);}}
    rb(w,3.5,.25,.05,toon(col),0,1.75,.02,g);front();sign(3.05);var aw=cy(.5,.5,w-2.6,toon(0xffffff,{map:stripeT(acc,0xffffff)}),.9,2.85,.55,g,14);aw.rotation.z=Math.PI/2;aw.scale.set(1,1,.55);}
  propFor(g,T0.prop,w,r);
  rectCol(lot,-w/2,w/2,-d,.1).h=h;
  if(!opt.nobiz&&!T0.nosale)regBiz(lot,b,biz,type,g,opt);
  return {g:g,h:h,name:biz};
}
function propFor(g,k,w,r){var x=2.8,z=1.2;
  if(k==='produce'){for(var i=0;i<3;i++){var st=new T.Group();st.position.set(-1+i*1.6,.2,1.3);g.add(st);rb(1.3,.7,.8,.04,toon(0x8a5a3a),0,.35,0,st);for(var j=0;j<8;j++)sp(.13,toon([0xe2553f,0xffc63d,0x6cc76a,0xff8a3d][i+j&3]),-.45+(j%4)*.3,.78,-.15+Math.floor(j/4)*.3,st,6);}}
  else if(k==='cart'){var c=new T.Group();c.position.set(x,.2,z);g.add(c);rb(1.4,.8,.6,.04,toon(0x6b4a30),0,.5,0,c);for(var i2=0;i2<8;i2++)bx(.12,.4,.4,toon(pick(SHIRTC)),-.55+i2*.15,1.05,0,c);}
  else if(k==='flowers'){for(var f=0;f<4;f++){cyB(.22,.45,toon(0x3a5a7a),x-.6+f*.5,.2,z,g,8);sp(.3,toon([0xff6b8f,0xffc63d,0xffffff,0xb39ddb][f]),x-.6+f*.5,.85,z,g,8);}}
  else if(k==='bench'){bench(g,x,z,Math.PI);}
  else if(k==='balloons'){for(var bb=0;bb<5;bb++){cyB(.005,1.6,toon(0xffffff),x+bb*.15,.8,z,g,3);sp(.22,toon([0xe2553f,0xffc63d,0x46a9e6,0x6cc76a,0xff79b4][bb]),x+bb*.15,2.5+(bb%2)*.2,z,g,8);}}
  else if(k==='pole'){var p=cyB(.15,1.4,toon(0xffffff,{map:stripeT(0xe2553f,0xffffff)}),DOORX+1,1.2,.35,g,10);sp(.17,toon(0xd8dde4),DOORX+1,2.65,.35,g,8);}
  else if(k==='washers'){for(var wa=0;wa<3;wa++){rb(.8,.9,.7,.06,toon(0xf4f4f4),-.5+wa*1.1,.65,-.6,g);cy(.25,.25,.04,toon(0x5f8fb0),-.5+wa*1.1,.7,-.24,g,12).rotation.x=Math.PI/2;}}
  else if(k==='bikes'){for(var bk=0;bk<3;bk++){var bi=new T.Group();bi.position.set(x-1+bk*.8,.2,z);bi.rotation.y=Math.PI/2;g.add(bi);[-.45,.45].forEach(function(q){tor(.3,.035,toon(0x2a2a30),q,.32,0,bi,null,10);});bx(.9,.05,.05,toon(pick([0xe2553f,0x2f8fd0,0x6cc76a])),0,.55,0,bi);}}
  else if(k==='weights'){bx(1.6,.08,.08,toon(0x3a3f4b),x,.6,z,g);cy(.3,.3,.1,toon(0x2a2a30),x-.8,.6,z,g,10).rotation.z=Math.PI/2;cy(.3,.3,.1,toon(0x2a2a30),x+.8,.6,z,g,10).rotation.z=Math.PI/2;}
  else if(k==='boards'||k==='skis'){for(var sb=0;sb<4;sb++){var bd=rb(k==='skis'?.14:.5,k==='skis'?1.8:2,.08,.06,toon(pick([0x46a9e6,0xff79b4,0xffc63d,0xe2553f])),x-.6+sb*.45,1.1,.3,g);bd.rotation.z=.12;}}
  else if(k==='lantern'){for(var l=0;l<4;l++){var lt=sp(.22,toon(0xef3a2a,{e:0xef3a2a,ei:.4}),-w/2+1.2+l*(w-2.4)/3,3.3,.6,g,8);lt.scale.y=1.3;}}
  else if(k==='ice'){rb(2,.8,.9,.04,toon(0xd8e8f0),x-.5,.6,z,g);for(var fi=0;fi<5;fi++){var fsh=sp(.18,toon(0x8aa0b8),x-1.2+fi*.35,1.05,z,g,8);fsh.scale.set(2,.6,.8);}}
  else if(k==='tires'){for(var ti=0;ti<4;ti++){var tr2=tor(.32,.13,toon(0x2a2a30),x-.6+(ti%2)*.7,.35+Math.floor(ti/2)*.26,z,g,null,10);tr2.rotation.x=Math.PI/2;}}
  else if(k==='dog'){var dg=new T.Group();dg.position.set(DOORX+1.2,.2,.9);g.add(dg);var bd2=sp(.28,toon(0xc98a3a),0,.38,0,dg,10);bd2.scale.set(1,.8,1.5);sp(.2,toon(0xc98a3a),0,.6,.38,dg,10);sp(.08,toon(0x2a1a12),0,.58,.58,dg,6);}
  else if(k==='plant'){rb(1,.6,.5,.1,toon(0x3a3f4b),x,.5,z-.4,g);sp(.45,toon(0x5fb35a),x,1.1,z-.4,g,10);}
}
function regBiz(lot,b,name,type,g,opt){
  var key=lot.key,city=O.city,D=b.D||null,bz={key:key,name:name,type:type,city:city,D:D,lot:lot,grocery:!!opt.grocery};BUS.push(bz);
  var r=seeded(hashS(key+name));bz.owner=OWNERS[Math.floor(r()*OWNERS.length)];bz.pers=Object.keys(PERS)[Math.floor(r()*6)];bz.phone='555-0'+(100+Math.floor(r()*899));
  var st=W4().biz[key];if(st&&st.own){plane(.9,.45,flat(0xffffff,{map:signT('A CREMA COMPANY',{bg:'#2a1a12',fg:'#ffc63d',w:256,h:120})}),DOORX+1.15,1.9,.26,g);var fp=new T.Group();fp.position.set(-lot.w/2+.6,3.8,.3);g.add(fp);cyB(.03,1.4,toon(0xd8d8d8),0,0,0,fp,4);plane(.7,.45,toon(0xffffff,{map:flagTex(),ds:1}),.38,1.15,0,fp);}
  var dw=L2W(lot,DOORX,.9);bz.door=dw;
  ACTS[curArea].push({x:dw.x,z:dw.z,r:1.7,door:true,dn:lot,label:function(){var s=W4().biz[key];return s&&s.own?'Check on '+name+' (yours)':'Step into '+name;},
    sub:function(){var s=W4().biz[key];if(s&&s.own)return 'Earning '+fmt(bizRev(bz))+'/min for you';if(s&&s.ban>now())return bz.owner+' isn\'t speaking to you for a while';return BT[type].what.charAt(0).toUpperCase()+BT[type].what.slice(1)+' · owner: '+bz.owner;},
    fn:function(){if(opt.grocery&&AREAS.grocery){enterArea('grocery');return;}bizTalk(bz,false);}});
  places.push({id:'biz:'+key,name:name,kind:'biz',x:dw.x,z:dw.z});
}
