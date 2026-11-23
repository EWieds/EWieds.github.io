
/* ---------- people (light version for crowds; full version for staff and you) ---------- */
function liteMe(o){o=o||{};
  var root=new T.Group(),body=new T.Group();root.add(body);blob(.7,.5,root);
  var skin=toon(pick(SKIN)),shirt=toon(o.shirt!=null?o.shirt:pick(SHIRTC)),pant=toon(o.pant!=null?o.pant:pick(PANTC)),hair=toon(pick(HAIRC));
  var legs=[-1,1].map(function(s){var p=new T.Group();p.position.set(s*.1,.5,0);body.add(p);cy(.075,.065,.48,pant,0,-.24,0,p,8);return p;});
  la('torso',[[0,0],[.22,0],[.27,.1],[.28,.36],[.22,.56],[.08,.62],[0,.62]],shirt,0,.46,0,body,18);
  var head=new T.Group();head.position.set(0,1.33,0);body.add(head);var hd=sp(.33,skin,0,0,0,head,16);hd.scale.set(1,.94,.96);
  if(Math.random()<.9){var cap=mk(capG(),hair,0,.03,-.015,head);cap.rotation.x=-.28;}
  var eyeM=toon(0x1e1410);[-1,1].forEach(function(s){var e=sp(.045,eyeM,s*.115,.02,.29,head,8);e.scale.set(.9,1.2,.6);});
  var arms=[-1,1].map(function(s){var p=new T.Group();p.position.set(s*.29,1.0,0);body.add(p);cy(.06,.055,.36,shirt,0,-.16,0,p,8);sp(.06,skin,0,-.37,0,p,8);p.rotation.z=s*.12;return p;});
  if(o.apron!=null){bx(.46,.52,.04,toon(o.apron),0,.78,.27,body);var sc2=mk(capG(),toon(o.apron),0,.07,0,head);sc2.scale.set(1.03,.7,1.03);}
  if(o.hat!=null){cy(.36,.4,.2,toon(o.hat),0,.26,0,head,12);}
  var cup=new T.Group();cup.position.set(0,-.42,.06);arms[1].add(cup);cy(.07,.055,.2,toon(0xffffff),0,0,0,cup,10);cy(.072,.07,.07,toon(0xa0663f),0,0,0,cup,10);cy(.074,.074,.03,toon(0x3a2317),0,.1,0,cup,10);cup.visible=false;
  var umb=new T.Group();umb.position.set(0,2.1,0);body.add(umb);cone(.75,.35,toon(pick([0xe2553f,0x2f8fd0,0xffc63d,0x3a3f4b])),0,0,0,umb,10);cyB(.02,.9,toon(0x333333),0,-.9,0,umb,6);umb.visible=false;
  var me={root:root,body:body,head:head,legs:legs,arms:arms,cup:cup,umb:umb,ph:Math.random()*6,lite:true};
  return me;
}
function animLite(me,dt,moving,sp){
  me.ph+=dt*(moving?(sp||1.3)*7:2);var s=Math.sin(me.ph);
  if(me.sit){me.legs[0].rotation.x=me.legs[1].rotation.x=-1.45;me.body.position.y=-.1;me.arms[0].rotation.x=me.arms[1].rotation.x=-.6;return;}
  if(moving){me.legs[0].rotation.x=s*.6;me.legs[1].rotation.x=-s*.6;me.arms[0].rotation.x=-s*.45;me.arms[1].rotation.x=me.cup.visible?-.9:s*.45;me.body.position.y=Math.abs(Math.cos(me.ph))*.05;}
  else{me.legs[0].rotation.x*=.8;me.legs[1].rotation.x*=.8;me.arms[0].rotation.x*=.8;me.arms[1].rotation.x=me.cup.visible?-.9:me.arms[1].rotation.x*.8;me.body.position.y=Math.sin(me.ph)*.01;}
}
function poolGet(){var me=POOL.pop()||liteMe();me.root.visible=true;me.cup.visible=false;me.umb.visible=rain.on;me.sit=false;me.root.scale.setScalar(1);dyn.add(me.root);return me;}
function poolPut(me){dyn.remove(me.root);if(POOL.length<70)POOL.push(me);}

/* a building with a real ground floor you can see into: rear block, upper floors, piers, sill and header */
function storefrontShell(g,w,h,d,wm,trim){
  rb(w,h,d-3.3,.15,wm,0,h/2,-3.3-(d-3.3)/2,g);rb(w,h-3.6,3.4,.12,wm,0,3.6+(h-3.6)/2,-1.65,g);
  bx(.5,3.6,3.3,wm,-w/2+.25,1.8,-1.65,g);bx(.5,3.6,3.3,wm,w/2-.25,1.8,-1.65,g);
  bx(w,.5,.3,trim,0,3.35,0,g);bx(7.4,.6,.3,trim,.9,.3,0,g);bx(.4,3.1,.3,trim,-2.85,1.55,0,g);
}
/* ---------- your shop on the street: sign, door, the open/closed card, and a live view inside ---------- */
function shopFront(lot,loc,D){
  var th=IND[loc.ind].theme,g=lotGroup(lot),dg=dynGroup(lot),w=lot.w-.3,d=BDEP-.4,h=7.4;
  storefrontShell(g,w,h,d,toon(th.wall),toon(th.wall2));rb(w+.3,.45,d+.3,.08,toon(th.trim),0,h+.15,-d/2,g);
  planeR(w-1,3.2,2,1,facadeMat(th.wall,'std'),0,5.4,.02,g);
  // live interior behind the glass
  var fl=plane(w-1,3.2,toon(th.flA),0,.22,-1.6,g);fl.rotation.x=-Math.PI/2;
  bx(w-1,3.4,.1,toon(th.wall2),0,1.9,-3.2,g);bx(w-1,.06,3.2,MAT.glow,0,3.55,-1.6,g);
  rb(5.2,1,.7,.06,toon(th.counter),1,.7,-2.2,g);bx(5.3,.08,.8,toon(th.top),1,1.22,-2.2,g);rb(.8,.55,.5,.06,toon(th.stn),-.4,1.55,-2.3,g);rb(.6,.45,.4,.06,toon(0xd8d8d8),.8,1.5,-2.3,g);
  plane(2.2,1.1,toon(0xffffff,{map:chalkMenu(loc)}),1.5,2.6,-3.13,g);
  [-1.2,1,3].forEach(function(x){cyB(.01,.6,toon(0x333333),x,2.95,-1.6,g,4);sp(.16,MAT.lamp,x,2.9,-1.6,g,10);});
  bx(7.1,2.4,.08,glass(0xffe9c0,.28),.9,1.8,.12,g);
  // door, frame, and the flip sign
  bx(1.5,2.8,.2,toon(th.trim),DOORX,1.4,.24,g);
  var piv=new T.Group();piv.position.set(DOORX-.6,.2,.3);dg.add(piv);bx(1.18,2.4,.08,glass(0xdff2ff,.45),.59,1.2,0,piv);bx(.06,.5,.06,toon(0xffd23d),1.02,1.15,.08,piv);
  var flip=new T.Group();flip.position.set(.6,1.75,.06);piv.add(flip);
  var so=plane(.62,.3,flat(0xffffff,{map:signT('OPEN',{bg:'#2fa860',fg:'#fff',w:256,h:120})}),0,0,.01,flip),sc=plane(.62,.3,flat(0xffffff,{map:signT('CLOSED',{bg:'#e2553f',fg:'#fff',w:256,h:120})}),0,0,-.01,flip);sc.rotation.y=Math.PI;
  cyB(.004,.25,toon(0x333333),0,.15,0,flip,4);
  sp(.06,toon(0xffd23d),DOORX+.5,2.75,.4,g,8);
  // awning and sign
  var aw=cy(.75,.75,w-.8,toon(0xffffff,{map:stripeT(th.accent,0xffffff)}),0,3.9,.65,g,18);aw.rotation.z=Math.PI/2;aw.scale.set(1,1,.6);
  var sg=plane(w-1.6,1.25,flat(0xffffff,{map:signT('Crema '+IND[loc.ind].name,{bg:'#2a1a12',fg:'#ffc63d',w:768,h:160,sub:loc.name})}),0,5.15+.6,.12,dg);
  // sidewalk chalkboard with today's special
  var rec=pick(IND[loc.ind].R.filter(function(r){return menuOf(loc).some(function(m){return m.key===r.key;});}))||IND[loc.ind].R[0];
  var ab=new T.Group();ab.position.set(2.6,.2,1.3);ab.rotation.y=-.25;g.add(ab);
  var bt=canvasTex(256,320,function(c,W2,H2){c.fillStyle='#2b3a33';c.fillRect(0,0,W2,H2);c.fillStyle='#fff';c.textAlign='center';c.font='700 40px '+FD;c.fillText('TODAY',W2/2,64);c.font='700 34px '+FD;c.fillStyle='#ffe08a';
    var words=rec.name.split(' ');c.fillText(words.slice(0,2).join(' '),W2/2,140);if(words.length>2)c.fillText(words.slice(2).join(' '),W2/2,184);c.fillStyle='#fff';c.font='800 46px '+FB;c.fillText('$'+(rec.price*priceMult(loc)).toFixed(2),W2/2,262);},null,'ab|'+loc.id+'|'+rec.key);
  var p1=plane(.7,.95,toon(0xffffff,{map:bt}),0,.55,.13,ab);p1.rotation.x=-.18;bx(.76,1.02,.04,toon(0x6b4a30),0,.55,.1,ab).rotation.x=-.18;
  [-3.9,3.9].forEach(function(x){if(x<0&&Math.abs(x-DOORX)<1.2)return;rb(1.1,.5,.5,.1,toon(0x7a4a2a),x,.45,.6,g);sp(.42,toon(0x5fb35a),x,.95,.6,g,10);});
  rectCol(lot,-w/2,w/2,-d,.15).h=h;
  // people you can see through the window
  var st=[],q=[];for(var i=0;i<2;i++){var s=liteMe({apron:th.accent});s.root.position.set(.2+i*1.6,.2,-2.85);dg.add(s.root);st.push(s);}
  for(i=0;i<3;i++){var c=liteMe();c.root.position.set(3.3-i*1.2,.2,-1.15);c.root.rotation.y=Math.PI;dg.add(c.root);c.root.visible=false;q.push(c);}
  var v={loc:loc,lot:lot,piv:piv,flip:flip,flipT:0,staff:st,q:q,door:L2W(lot,DOORX,-.3),out:L2W(lot,DOORX,1.3),doorA:0,doorT:0,flow:0,sign:sg,open:null};
  shopV.push(v);
  return v;
}
function rivalFront(lot,loc,D){
  var c=loc.comp,g=lotGroup(lot),dg=dynGroup(lot),w=lot.w-.3,d=BDEP-.4,h=6.6;
  storefrontShell(g,w,h,d,toon(0x707684),toon(0x5a5f6a));planeR(w-1,2.8,2,1,facadeMat(0x707684,'std'),0,4.9,.02,g);rb(w+.3,.4,d+.3,.08,toon(0x4a4f5a),0,h+.1,-d/2,g);
  bx(7.1,2.4,.08,glass(0xd8ecff,.35),.9,1.8,.12,g);bx(1.3,2.5,.16,toon(0x3a3f4b),DOORX,1.25,.14,g);
  var fl=plane(w-1,3,toon(0xe8e4dc),0,.22,-1.5,g);fl.rotation.x=-Math.PI/2;bx(w-1,3.2,.1,toon(0x9aa2ac),0,1.8,-3,g);rb(4.4,1,.6,.05,toon(0x4a4f5a),1,.7,-2.1,g);
  plane(w-1.8,1.05,flat(0xffffff,{map:signT(c.name,{bg:'#ffffff',fg:'#3a3f4b',w:768,h:150,sub:'COFFEE · SINCE 2009'})}),0,4.75-1.4,.14,g);
  var aw=cy(.6,.6,w-2.6,toon(0xffffff,{map:stripeT(0x3a3f4b,0xd8dee6)}),1,2.95,.5,g,14);aw.rotation.z=Math.PI/2;aw.scale.set(1,1,.55);
  rectCol(lot,-w/2,w/2,-d,.15);
  var q=[];for(var i=0;i<3;i++){var p=liteMe();p.root.position.set(3.2-i*1.2,.2,-1.1);p.root.rotation.y=Math.PI;dg.add(p.root);q.push(p);}
  var s=liteMe({apron:0x3a3f4b});s.root.position.set(1,.2,-2.7);dg.add(s.root);
  var v={rival:true,loc:loc,lot:lot,q:q,door:L2W(lot,DOORX,-.3),out:L2W(lot,DOORX,1.3),flow:0};shopV.push(v);
  var dw=L2W(lot,DOORX,.8);
  ACTS.city.push({x:dw.x,z:dw.z,r:1.8,door:true,dn:lot,label:'Walk into '+c.name,sub:function(){return 'Rival · strength '+Math.round(c.S)+(c.S>c.prev+.5?' and rising':'');},fn:function(){rivalTalk(loc);}});
}
function landPrice(D){return Math.round((hasClass('re')?.92:1)*Math.max(600,(D.cost||1500)*.45+G.lvl*120)*(O.city>0?TM(O.city).cm*.25+.75:1));}
function forSaleLot(lot,D,key){
  var w=W4(),own=w.land[key],g=lotGroup(lot),pr=landPrice(D);
  if(curArea==='terminal'){var wl=lot.w-.3;bx(wl,5,BDEP-.6,toon(0xd8dee6),0,2.5,-BDEP/2,g);bx(wl-1,3.2,.1,toon(own?0x9ad6b0:0xb8c0ca),0,1.8,.05,g);for(var k=0;k<8;k++)bx(wl-1,.04,.04,toon(0x9aa2ac),0,.4+k*.4,.12,g);
    plane(wl-1.6,.9,flat(0xffffff,{map:own?signT('YOUR CONCESSION SPACE',{bg:'#2fa860',fg:'#fff',w:768,h:110}):signT('CONCESSION SPACE · '+fmt(pr),{bg:'#2a1a12',fg:'#ffc63d',w:768,h:110})}),0,4,.12,g);rectCol(lot,-wl/2,wl/2,-BDEP,.1);
    var pq=L2W(lot,0,1.2);ACTS.city.push({x:pq.x,z:pq.z,r:3.2,label:function(){return W4().land[key]?'Build in your concession space':'Lease this concession · '+fmt(pr);},sub:D.name+(G.lvl<D.lvl?' · opens at level '+D.lvl:' · airport foot traffic all day'),fn:function(){if(W4().land[key]){callBob(key);return;}buyLand(key,D,pr);}});return;}
  var lawn=planeR(lot.w-.2,BDEP,4,4,toon(own?0x9ed68a:0xb9d98e,{map:grassT()}),0,.22,-BDEP/2,g);lawn.rotation.x=-Math.PI/2;
  for(var i=-2;i<=2;i++)cyB(.05,.9,toon(0xffffff),i*(lot.w-.6)/4,.2,-.1,g,6);bx(lot.w-.6,.06,.05,toon(0xffffff),0,.95,-.1,g);bx(lot.w-.6,.06,.05,toon(0xffffff),0,.6,-.1,g);
  cyB(.07,2.4,toon(0x7a4a2a),2.6,.2,-.4,g,6);
  var tx2=own?signT('YOUR LAND',{bg:'#2fa860',fg:'#ffffff',w:512,h:220,sub:'Call Bob to build'}):signT('FOR SALE',{bg:'#ffffff',fg:'#c0392b',w:512,h:220,sub:fmt(pr)+' · Dana 555-0142'});
  plane(2.4,1.1,flat(0xffffff,{map:tx2}),2.6,2.2,-.34,g);
  var p=L2W(lot,0,1.2);
  ACTS.city.push({x:p.x,z:p.z,r:3.2,label:function(){return W4().land[key]?'Build on your land':'Buy this lot · '+fmt(pr);},sub:D.name+(G.lvl<D.lvl?' · opens at level '+D.lvl:' · '+lot.w.toFixed(0)+' m frontage'),
    fn:function(){if(W4().land[key]){callBob(key);return;}buyLand(key,D,pr);},alt:function(){return W4().land[key]?null:{label:'Ask Dana about it',fn:function(){callDana();}};}});
  places.push({id:'land:'+key,name:(own?'Your land':'Lot for sale')+' · '+D.name,kind:own?'land':'sale',x:p.x,z:p.z});
}
function buyLand(key,D,pr){
  if(mpOther(key)){mpOwnedTalk(key);return;}
  if(G.lvl<D.lvl){popup(D.name+' opens at level '+D.lvl,'You are level '+G.lvl+'. Keep serving to unlock this district.',[{t:'OK'}],'bad');return;}
  popup('Buy this lot?',D.name+'\nPrice '+fmt(pr)+'\n\nOnce it is yours, call Bob\'s Builders to put up a shop, a patio, a building to lease out, a billboard or a parking lot.',[
    {t:'Buy it · '+fmt(pr),fn:function(){if(!pay(pr,'This lot'))return;W4().land[key]={d:D.id,at:now(),use:null};if(isMP())mpClaim(key,function(){delete W4().land[key];G.cash+=pr;note('Someone beat you to it','Another player bought that lot first. Refunded.','bad');save();rebuild();});W4().stats.lots=(W4().stats.lots||0)+1;note('Land purchased',D.name+'. Call Bob when you know what to build.','good',{label:'Call Bob',fn:function(){callBob(key);}});rebuild();}},
    {t:'Not now',cls:'sec'}]);
}
function siteLot(lot,b,D){
  var g=lotGroup(lot),dg=dynGroup(lot),d=BDEP-.4,w=lot.w;
  var dirt=plane(w-.2,d,toon(0xb08a5a),0,.22,-d/2,g);dirt.rotation.x=-Math.PI/2;
  for(var i=-2;i<=2;i++){var fp=bx(w/5-.1,1.9,.06,toon(0xf2f2f2),i*w/5,1.15,-.05,g);}
  var what=b.kind==='shop'?'Crema '+IND[b.ind].name:b.kind==='lease'?'Retail space':b.kind==='billboard'?'Billboard':b.kind==='parking'?'Parking':b.kind==='patio'?'Patio':b.kind==='super'?'Crema Superstore':b.kind==='garage'?'Parking garage':b.kind==='size'?'Expansion':'Renovation';
  plane(Math.min(w-1,6.5),1.3,flat(0xffffff,{map:signT('COMING SOON: '+what,{bg:'#ffc63d',fg:'#2a1a12',w:768,h:160,sub:'Bob\'s Builders · Since 1988'})}),0,1.3,.02,g);
  var col=b.kind==='shop'?IND[b.ind].theme.wall:0xd8c8a8,shell=rb(w-1.2,7,d-1,.2,toon(col),0,3.5,-d/2,dg);shell.scale.y=.02;
  for(i=-2;i<=2;i++){cyB(.05,7.6,toon(0xf2b632),i*(w-1.6)/4,.2,-.5,g,6);}for(var k=1;k<4;k++)bx(w-.6,.08,.6,toon(0x9a7a4a),0,k*2.3,-.5,g);
  var crane=new T.Group();crane.position.set(-w/2+.8,0,-d+1.2);dg.add(crane);cyB(.12,12,toon(0xf2b632),0,0,0,crane,6);bx(9,.22,.22,toon(0xf2b632),3.8,11.8,0,crane);bx(2,.22,.22,toon(0xf2b632),-1,11.8,0,crane);rb(1,.8,.8,.1,toon(0x8a8f99),-1.6,11.3,0,crane);
  var hook=new T.Group();hook.position.set(6.4,9,0);crane.add(hook);cyB(.015,3,toon(0x333333),0,0,0,hook,4);rb(1.4,.4,.5,.06,toon(0x9a7a4a),0,-.2,0,hook);
  var ws=[0,1,2].map(function(i){var m=liteMe({shirt:0xff9b3d,hat:0xffc63d});m.root.position.set(-2.5+i*2.4,.2,-1.6-(i%2)*2);dg.add(m.root);return m;});
  var arr=b.arrive&&b.arrive>now();
  var wait=plane(3.2,.8,flat(0xffffff,{map:signT('Crew on the way',{bg:'#2a1a12',fg:'#ffc63d',w:512,h:128})}),0,2.6,.05,dg);
  var p=L2W(lot,0,1.4);
  sites.push({b:b,shell:shell,crane:crane,hook:hook,ws:ws,wait:wait,lot:lot});
  ACTS.city.push({x:p.x,z:p.z,r:3.2,label:function(){return b.arrive>now()?'Crew arrives in '+mmssS((b.arrive-now())/1000):'Construction · '+Math.round(prog(b)*100)+'%';},sub:function(){return what+' · '+(b.arrive>now()?'Bob is driving over':mmssS(left(b))+' left');},
    fn:function(){var c=rushCost(b);popup('Site foreman','"We\'re '+Math.round(prog(b)*100)+'% there, boss. Pay the crew overtime and we finish today."',[{t:'Pay overtime · '+fmt(c),s:'Finishes right now',fn:function(){if(!pay(c,'Overtime'))return;b.arrive=Math.min(b.arrive||0,now());b.t0=now()-b.sec*1000;finishBuilds();}},{t:'Keep going',cls:'sec'}],'',{who:'Sal',role:'Foreman, Bob\'s Builders',col:'#f2b632'});}});
  rectCol(lot,-w/2,w/2,-d,-.2);
  places.push({id:'site:'+b.key,name:what+' (construction)',kind:'site',x:p.x,z:p.z});
}
function prog(b){if(b.arrive&&b.arrive>now())return 0;return clamp((now()-(b.t0||now()))/1000/b.sec,0,1);}
function left(b){return Math.max(0,b.sec-(now()-(b.t0||now()))/1000);}
function rushCost(b){return Math.round((400+G.lvl*220)*(1+left(b)/120)*tierM());}
function patioLot(lot,b,own,D){
  var g=lotGroup(lot),dg=dynGroup(lot);bx(lot.w-.3,.2,BDEP,toon(0xc9925a),0,.3,-BDEP/2,g);
  var cols2=[0xe2553f,0x46a9e6,0xffc63d,0x21a98d];
  for(var i=0;i<4;i++){var tx3=-2.6+(i%2)*5.2,tz=-2.2-Math.floor(i/2)*3.6;cyB(.45,.72,toon(0xffffff),tx3,.4,tz,g,14);cyB(.05,2.2,toon(0xdddddd),tx3,.4,tz,g,6);cone(1.3,.6,toon(cols2[i]),tx3,2.55,tz,g,12);
    [-1,1].forEach(function(s2){cyB(.2,.42,toon(0x2f3a56),tx3+s2*.85,.4,tz,g,10);});
    if(i<3){var c=liteMe();c.sit=true;c.root.position.set(tx3+.85,.42,tz);c.root.rotation.y=-Math.PI/2;dg.add(c.root);c.cup.visible=true;anim.push({me:c,sit:1});}}
  for(i=-2;i<=2;i++)cyB(.04,.8,toon(0x3a3f4b),i*(lot.w-.6)/4,.4,-.05,g,6);bx(lot.w-.6,.05,.05,toon(0x3a3f4b),0,1.1,-.05,g);
  var lp=[];for(var x=-lot.w/2+.5;x<lot.w/2;x+=.5)lp.push(x);lp.forEach(function(x){sp(.05,MAT.lamp,x,2.9+Math.sin(x)*.12,-.2,g,6);});
  var p=L2W(lot,0,1.3);ACTS.city.push({x:p.x,z:p.z,r:3,label:'Your patio',sub:'+3 decor for the shop next door',fn:function(){toast('Every table is taken. Customers love sitting outside.','good');}});
}
var TENANTS=[{n:'Pixel Books',c:0x46a9e6},{n:'Bloom Florist',c:0xef8fb0},{n:'Slice Pizza',c:0xe2553f},{n:'Fresh Cuts Barber',c:0x3a3f4b},{n:'Yoga Loft',c:0xb39ddb},{n:'Corner Pharmacy',c:0x2fa860},{n:'Sunny Laundry',c:0xf6d26b},{n:'Vinyl Vault',c:0x7a5ad8},{n:'Paws Pet Shop',c:0xff9b3d},{n:'Little Gym',c:0x21a98d}];
function leaseLot(lot,b,own,D,key){
  var r=seeded(key.length*97+(own.tenant?own.tenant.n.length:3)),tn=own.tenant;
  var bld=genBuilding(lot,b,r,{name:tn?tn.n:'For lease',floors:2,nobiz:1});
  var p=L2W(lot,0,1.3);
  if(!tn)plane(4,1,flat(0xffffff,{map:signT('FOR LEASE · YOURS',{bg:'#2fa860',fg:'#fff',w:512,h:128})}),0,1.6,.3,bld.g);
  ACTS.city.push({x:p.x,z:p.z,r:3,label:tn?tn.n+' (your tenant)':'Your empty retail space',sub:tn?'Pays you '+fmt(leaseRate(D))+'/min':'Dana can find a tenant',fn:function(){if(!tn){callDana('lease',key);return;}popup(tn.n,'"Business is good! Rent goes out every minute, like clockwork."\n\nRent: '+fmt(leaseRate(D))+'/min',[{t:'Raise the rent 10%',s:'They might move out',fn:function(){if(Math.random()<.4){own.tenant=null;note('Tenant moved out',tn.n+' left over the rent hike. Call Dana to find someone new.','bad');rebuild();}else{own.bump=(own.bump||0)+1;toast('They grumbled, but they signed.','good');}save();}},{t:'Leave it',cls:'sec'}],'',{who:tn.n,role:'Tenant'});}});
}
function leaseRate(D){return Math.round((landPrice(D)*1.6)/40);}
function billboardLot(lot,b,own,D){
  var g=lotGroup(lot),dg=dynGroup(lot);var gr=planeR(lot.w-.2,BDEP,4,4,toon(0xffffff,{map:grassT()}),0,.22,-BDEP/2,g);gr.rotation.x=-Math.PI/2;
  [-3,3].forEach(function(x){cyB(.22,7,toon(0x5a5f6a),x,.2,-3,g,8);});bx(lot.w-1,4.4,.3,toon(0x3a3f4b),0,8.4,-3,g);
  var ad=plane(lot.w-1.6,3.8,flat(0xffffff,{map:adTex()}),0,8.4,-2.82,dg);billboards.push(ad);
  for(var i=-2;i<=2;i++){var lm=bx(.4,.12,.5,MAT.lamp,i*1.9,10.8,-2.5,g);}
  var p=L2W(lot,0,1.3);ACTS.city.push({x:p.x,z:p.z,r:3,label:'Your billboard',sub:'+8% customers for your shops in '+D.name,fn:function(){toast('Big, bright, impossible to miss.','good');}});
}
var billboards=[];
function adTex(){var loc=G.locs.filter(function(l){return l.city===O.city;})[0]||curLoc(),m=null;G.locs.forEach(function(l){if(l.mk&&l.mk.length)m=l;});
  var key='ad|'+(m?m.id+m.mk[0].k:'x')+'|'+(loc?loc.id:0);
  return canvasTex(512,256,function(g,w,h){var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#2a1a12');gr.addColorStop(1,'#5b3a25');g.fillStyle=gr;g.fillRect(0,0,w,h);
    g.fillStyle='#ffc63d';g.textAlign='center';g.font='700 76px '+FD;g.fillText('CREMA',w/2,100);g.fillStyle='#fff6e6';g.font='700 34px '+FD;
    g.fillText(m?(m.mk[0].k==='tv'?'As seen on TV':'Happy hour at '+m.name):'Your daily ritual',w/2,160);g.font='800 24px '+FB;g.fillStyle='#ffd890';g.fillText(loc?loc.name.toUpperCase()+' · OPEN 7 AM':'OPEN 7 AM',w/2,212);},null,key);}
function parkingLot(lot,b,own,D){
  var g=lotGroup(lot);var a=planeR(lot.w-.2,BDEP,2,2,toon(0xffffff,{map:asphaltT()}),0,.22,-BDEP/2,g);a.rotation.x=-Math.PI/2;
  for(var i=0;i<4;i++){var ln=plane(.12,4,toon(0xffffff),-lot.w/2+1+i*2.8,.23,-BDEP+2.2,g);ln.rotation.x=-Math.PI/2;}
  var r=seeded(lot.x*7+lot.z);for(i=0;i<3;i++)if(r()<.7){var c=carModel(pick(['sedan','hatch','van']),pick(CARC));c.position.set(-lot.w/2+2.4+i*2.8,.2,-BDEP+2.2);c.rotation.y=0;g.add(c);}
  plane(2.2,1,flat(0xffffff,{map:signT('P',{bg:'#2f8fd0',fg:'#fff',w:256,h:128,sub:'CREMA CUSTOMERS'})}),lot.w/2-1.4,2.4,-.2,g);cyB(.05,2,toon(0x3a3f4b),lot.w/2-1.4,.2,-.25,g,6);
  var p=L2W(lot,0,1.3);ACTS.city.push({x:p.x,z:p.z,r:3,label:'Your parking lot',sub:'+6% customers in '+D.name,fn:function(){toast('Easy parking keeps the regulars coming.','good');}});
}
