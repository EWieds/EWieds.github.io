
/* ---------- homes: every house and apartment building is a real property with real people in it ---------- */
var HOMEC=[0xf2d7b6,0xe9b8a0,0xc9d8c0,0xd8cde6,0xf4e6c8,0xbfd6e6,0xf3f1ea,0xe6c9a8,0xa9c7b8],ROOFC=[0x9a5a4a,0x5a5f6a,0x6b4a3a,0x3f5f7a,0x7a3a3a,0x4f6b4a],DOORC=[0xc8443a,0x2f5f90,0x2f7a4a,0x6b4a30,0xf2b632,0x3a3f4b];
var HWIN=null,TOUR=null,HOMES=[];
var RENTERS=['a nurse and her cat','two grad students','a young couple','a retired teacher','a family of four','a jazz drummer','a software developer','a firefighter','a pair of artists','a dentist'];
function hwin(){if(!HWIN)HWIN=toon(0xa8d6f2);return HWIN;}
function homeBase(){return Math.round(Math.max(600,2500*.45+G.lvl*120)*(O.city>0?TM(O.city).cm*.25+.75:1));}
function homeAddr(lot,b,dw){var st=streetAt(dw.x,dw.z)||districtName(dw.x,dw.z),n=10+((Math.abs(Math.round(dw.x*3))+Math.abs(Math.round(dw.z*7)))%88)*2+(lot.s>0?1:0);return n+' '+st;}
function homeState(h){return W4().biz[h.key]||{};}

/* a detached house: yard, porch, picket fence, mailbox, garden, sometimes a driveway and a car */
function houseModel(lot,b,r,h){
  var st0=homeState(h);if((st0.proj||[]).some(function(p){return p.k==='floor2'&&p.done;}))h.big=true;var g=lotGroup(lot),dg=dynGroup(lot),w=lot.w-.3,big=h.big,hw=big?7.6:6.6,hd=big?5.4:4.6,hh=big?5.8:3.2,f=-2.6,cx=(r()-.5)*.6,
    wallM=toon((function(){var c0=HOMEC[Math.floor(r()*HOMEC.length)],pp=(st0.proj||[]).filter(function(p){return p.k==='paint'&&p.done&&p.color;}).pop();return pp?pp.color:c0;})()),roofM=toon(ROOFC[Math.floor(r()*ROOFC.length)]),trim=toon(0xffffff),st=homeState(h);
  var gr=planeR(lot.w-.2,BDEP-.2,4,4,toon(0xffffff,{map:grassT()}),0,.215,-BDEP/2,g);gr.rotation.x=-Math.PI/2;
  bx(hw+.25,.4,hd+.25,toon(0x9a948a),cx,.2,f-hd/2,g);rb(hw,hh,hd,.05,wallM,cx,hh/2+.3,f-hd/2,g);
  var top=hh+.3;if(r()<.5){prism(hw+.6,big?2.6:2.1,hd+.7,roofM,cx,top,f-hd/2,g);}else{var pr=prism(hd+.7,big?2.3:1.9,hw+.6,roofM,cx,top,f-hd/2,g);pr.rotation.y=Math.PI/2;}
  bx(.6,2.3,.6,toon(0xa05a48),cx+hw/2-1.1,top+.7,f-hd/2-.9,g);
  var dx=r()<.5?cx-hw/2+1.5:cx,dc=toon(DOORC[Math.floor(r()*DOORC.length)]);h.dx=dx;h.f=f;
  bx(1.05,2.05,.12,dc,dx,1.35,f+.06,g);sp(.06,toon(0xffd24a),dx+.36,1.35,f+.14,g,6);bx(1.3,.12,.14,trim,dx,2.42,f+.07,g);
  bx(2.3,.2,1.4,toon(0xd8cfbe),dx,.4,f+.7,g);bx(2.5,.12,1.6,roofM,dx,2.95,f+.75,g);[-1.05,1.05].forEach(function(o){cyB(.06,2.5,trim,dx+o,.45,f+1.4,g,6);});
  var wy=[1.65].concat(big?[4.3]:[]),sc=toon([0x2f5f90,0x3a3f4b,0x2f7a4a,0x8a3a3a,0xffffff][Math.floor(r()*5)]);
  wy.forEach(function(y,fl){for(var x=cx-hw/2+1.1;x<cx+hw/2-.6;x+=1.85){if(fl===0&&Math.abs(x-dx)<1.2)continue;bx(1.25,1.05,.08,trim,x,y,f+.05,g);plane(1.05,.85,hwin(),x,y,f+.1,g);bx(.08,.85,.04,trim,x,y,f+.12,g);bx(.28,1.05,.05,sc,x-.78,y,f+.07,g);bx(.28,1.05,.05,sc,x+.78,y,f+.07,g);bx(1.3,.12,.3,trim,x,y-.58,f+.15,g);}});
  // walkway, fence with a gate, mailbox, garden
  var wk=plane(1.2,-f,toon(0xcfc6b6),dx,.225,f/2,g);wk.rotation.x=-Math.PI/2;
  var pk=toon(0xfafafa);[[-w/2,dx-.75],[dx+.75,w/2]].forEach(function(s){var L=s[1]-s[0];if(L<.3)return;bx(L,.07,.05,pk,(s[0]+s[1])/2,.62,-.3,g);bx(L,.07,.05,pk,(s[0]+s[1])/2,.34,-.3,g);for(var x=s[0]+.15;x<s[1];x+=.34)bx(.1,.8,.04,pk,x,.62,-.3,g);rectCol(lot,s[0],s[1],-.4,-.2);});
  var mb=new T.Group();mb.position.set(dx+1.1,0,-.55);g.add(mb);cyB(.05,1.05,toon(0x6b4a30),0,.2,0,mb,5);rb(.34,.32,.5,.12,toon(st.own?0x2fa860:0x3a3f4b),0,1.35,0,mb);
  plane(.3,.12,flat(0xffffff,{map:signT(String(h.num),{bg:'#ffffff',fg:'#2a1a12',w:128,h:48})}),.18,1.36,0,mb).rotation.y=Math.PI/2;
  var flag=bx(.04,.22,.12,toon(0xe2553f),-.2,1.5,.1,dg);flag.position.set(dx+.9,1.5,-.5);flag.visible=!!st.own;
  for(var i=0;i<5;i++){var bxp=cx-hw/2+.6+i*(hw-1.2)/4;if(Math.abs(bxp-dx)<1.3)continue;sp(.45+r()*.15,toon(r()<.5?0x5fb35a:0x4f9a4a),bxp,.55,f+.45,g,7);if(r()<.6)sp(.13,toon(pick([0xef8fb0,0xffd24a,0xe2553f,0xb39ddb])),bxp+.2,.95,f+.7,g,6);}
  if(r()<.55){tree(g,cx+hw/2-.4+(r()-.5),-BDEP+1.2,r()<.5?0x5fb35a:0x4f9a4a,'leaf',r);}
  // the sign in the yard says what's going on here
  var sg=null;if(!st.own&&h.sale)sg=['FOR SALE','BY OWNER','#c8443a'];else if(st.own&&st.home===1&&W4().home===h.key)sg=['HOME','SWEET HOME','#2fa860'];else if(st.own&&!st.tenant&&st.rentOut)sg=['FOR RENT','ASK THE OWNER','#2f8fd0'];
  if(sg){var sgp=new T.Group();sgp.position.set(dx-1.3>-w/2+.6?dx-1.4:dx+1.9,0,-1.1);g.add(sgp);cyB(.04,1.4,toon(0x6b4a30),-.45,.2,0,sgp,4);cyB(.04,1.4,toon(0x6b4a30),.45,.2,0,sgp,4);
    plane(1.2,.75,flat(0xffffff,{map:signT(sg[0],{bg:'#ffffff',fg:sg[2],w:256,h:160,sub:sg[1]})}),0,1.25,.03,sgp);}
  projDecor(g,h,st,cx,hw,hd,hh,f,dx,lot.w);
  rectCol(lot,cx-hw/2-.1,cx+hw/2+.1,f-hd-.1,f+.05).h=top+2;
  return g;
}
/* apartment buildings already exist; this gives them a landlord, a buzzer and a rent roll */
function regHome(lot,b,kind,opt){
  opt=opt||{};var key=lot.key,rr=seeded(hashS(key+'home')),dw=kind==='apt'?L2W(lot,0,.9):L2W(lot,opt.dx,opt.f+1.25),st=homeState({key:key});
  var units=opt.units||1,base=homeBase(),val=Math.round(base*(kind==='apt'?units*.75:(opt.big?2.8:2.1))*(.9+rr()*.3)),h=BUS.filter(function(q){return q.key===key;})[0];
  if(!h){h={key:key};BUS.push(h);}
  h.name=opt.addr;h.home=1;h.kind=kind;h.type=kind==='apt'?'apt':'home';h.city=O.city;h.lot=lot;h.val=val;h.units=units;h.big=!!opt.big;h.sale=!!opt.sale;h.num=opt.num;
  h.owner=OWNERS[Math.floor(rr()*OWNERS.length)];h.pers=h.sale?(rr()<.6?'tired':'practical'):Object.keys(PERS)[Math.floor(rr()*6)];h.phone='555-0'+(100+Math.floor(rr()*899));
  val+=st.valAdd||0;h.revv=Math.round((val/80+(st.rentAdd||0))*Math.pow(1.12,st.rb||0));h.door=dw;h.dx=opt.dx;h.f=opt.f;HOMES.push(h);
  if(h.sale){var ds=dState(h);ds.known=1;}
  ACTS[curArea].push({x:dw.x,z:dw.z,r:1.6,door:true,dn:lot,label:function(){var s=homeState(h);if(s.own)return W4().home===key?'Go inside · home':kind==='apt'?'Your building · '+h.name:'Your house · '+h.name;if(s.ban>now())return h.owner+' won\'t answer';return kind==='apt'?'Buzz the landlord':h.sale?'Knock · for sale':'Knock on the door';},
    sub:function(){var s=homeState(h);if(s.own)return s.tenant?(kind==='apt'?units+' units rented':'Rented to '+s.tenant)+' · '+fmt(bizRev(h))+'/min':W4().home===key?'You live here':'Empty · rent it out or move in';return h.name+' · '+(kind==='apt'?units+' apartments':h.big?'two-story house':'house')+(h.sale?' · '+fmt(dState(h).ask):'');},
    fn:function(){var s=homeState(h);if(s.own){homeTalk(h);return;}knock(h);}});
  places.push({id:'home:'+key,name:h.name+(kind==='apt'?' (apartments)':''),kind:homeState(h).own?'myhome':h.sale?'homesale':'house',x:dw.x,z:dw.z});
  return h;
}
function knock(h){try{tone(660,.08,'sine',.03);setTimeout(function(){try{tone(520,.12,'sine',.03);}catch(e){}},140);}catch(e){}
  bubble(h.door.x,2.6,h.door.z,h.kind==='apt'?'bzzzt':'knock knock','');
  setTimeout(function(){if(P.area!=='city')return;bizTalk(h,false);},450);}
function homeTalk(h){var s=homeState(h),w=W4(),mine=w.home===h.key,who={who:'You',role:h.name,col:'#2fa860'},opts=[],rent=bizRev(h);
  var sellP=Math.round((h.val||1)*.9*(1+.25*(s.ren||0)));
  if(h.kind==='apt'){
    opts.push({t:'Raise the rent 12%',s:'Some tenants may leave for a while',fn:function(){s.rb=(s.rb||0)+1;h.revv=Math.round(h.revv*1.12);syncBizRev();if(Math.random()<.2+.1*s.rb){s.tenant=null;s.vac=now();note('Tenants moved out','A few units at '+h.name+' are empty. New tenants will show up soon.','bad');}else note('Rent raised',h.name+' now brings in '+fmt(bizRev(h))+'/min.','good');save();}});
  }else{
    if(!mine&&!s.tenant)opts.push({t:'Move in here',s:'Your home base. Sleep, watch the news, throw parties',fn:function(){var old=w.home;w.home=h.key;s.lived=1;if(old&&old!==h.key){var o=w.biz[old];if(o)o.lived=0;}note('You moved in',h.name+' is home now. "Go home" works from anywhere.','good');O.dirty=true;save();}});
    if(mine){opts.unshift({t:'Go inside',fn:function(){enterHome(h,false);}});opts.push({t:'Move out',s:'Then you can rent it out',fn:function(){w.home=null;s.lived=0;O.dirty=true;save();note('Moved out',h.name+' is empty.','info');}});}
    if(!mine&&!s.tenant)opts.push({t:'Rent it out',s:'A tenant moves in soon · about '+fmt(rent)+'/min',fn:function(){s.rentOut=1;s.vac=now();s.lived=0;note('Listed for rent',h.name+'. Someone will move in shortly.','info');O.dirty=true;save();}});
    if(s.tenant){opts.push({t:'Raise the rent 12%',s:'They might move out',fn:function(){s.rb=(s.rb||0)+1;h.revv=Math.round(h.revv*1.12);syncBizRev();if(Math.random()<.25+.12*s.rb){var t=s.tenant;s.tenant=null;s.vac=now();note('Tenant moved out',t+' left '+h.name+' over the rent.','bad');O.dirty=true;}else note('Rent raised',s.tenant+' grumbled but signed. '+fmt(bizRev(h))+'/min.','good');save();}});
      opts.push({t:'End the lease',s:'Then you can move in yourself',fn:function(){s.tenant=null;s.rentOut=0;O.dirty=true;save();note('Lease ended',h.name+' is empty.','info');}});}
    if(!mine&&!s.tenant)opts.push({t:'Look around inside',fn:function(){enterHome(h,false);}});
  }
  opts.push({t:'Hire Bob for a project',s:'Pool, deck, solar, a second story… or anything you can describe',fn:function(){bobProject(h);}});
  var rc=Math.round((h.val||1)*.35*Math.pow(1.6,s.ren||0));
  opts.push({t:'Renovate · '+fmt(rc),s:'+30% rent and resale value. You can keep going',fn:function(){if(!pay(rc,'The renovation'))return;s.ren=(s.ren||0)+1;note(h.name+' renovated','Worth more, rents for more.','good');save();}});
  opts.push({t:'Sell it · '+fmt(sellP),s:'Or wait: buyers sometimes make offers by mail',fn:function(){popup('Sell '+h.name+'?','You\'d get '+fmt(sellP)+'.',[{t:'Sell',fn:function(){sellHome(h.key,sellP);}},{t:'Keep it',cls:'sec'}]);}});
  opts.push({t:'Done',cls:'sec'});
  var status=h.kind==='apt'?(s.tenant?h.units+' units rented · '+fmt(rent)+'/min':'Some units empty, tenants coming'):mine?'You live here.':s.tenant?'Rented to '+s.tenant+' · '+fmt(rent)+'/min':s.rentOut?'Listed for rent. Waiting on a tenant.':'Empty.';
  popup(h.name,status+(s.ren?'\nRenovated '+s.ren+'×.':''),opts,'',who);}
function sellHome(key,price){var w=W4(),s=w.biz[key];if(!s)return;G.cash+=price;if(w.home===key)w.home=null;delete w.biz[key];note('Sold',(s.name||'Property')+' · +'+fmt(price),'good');try{sfx.buy();}catch(e){}O.dirty=true;save();}
function ownedHomes(){var w=W4();return Object.keys(w.biz).filter(function(k){return w.biz[k].own&&w.biz[k].home;});}

/* tenants arrive, buyers send letters */
var homeT=0;
function homeTick(dt){var w=W4();homeT+=dt;if(homeT<3)return;homeT=0;
  Object.keys(w.biz).forEach(function(k){var s=w.biz[k];if(!s.own||!s.home)return;
    if(!s.tenant&&(s.rentOut||s.kind==='apt')&&w.home!==k){s.vac=s.vac||now();if(now()-s.vac>(s.kind==='apt'?90000:35000+((hashS(k)%40)*1000))){s.tenant=s.kind==='apt'?'units':pick(RENTERS);s.vac=0;note('New tenant',(s.kind==='apt'?'The empty units at '+s.name+' are full again.':(s.tenant.charAt(0).toUpperCase()+s.tenant.slice(1))+' moved into '+s.name+'. Rent starts now.'),'good');if(O.on&&cityOfLot(k)===O.city)O.dirty=true;save();}}});
  var hk=ownedHomes();w.hoff=w.hoff||now()+300000;
  if(hk.length&&now()>w.hoff){w.hoff=now()+rnd(420000,780000);var k=pick(hk),s=w.biz[k],b=bizOf(k),v=Math.max((b&&b.val)||0,s.paid||1000),offer=Math.round(v*(1.05+Math.random()*.25)*(1+.2*(s.ren||0)));
    note('A letter about '+(s.name||'your property'),'"We love the place. Would you sell for '+fmt(offer)+'?" ('+Math.round(offer/Math.max(1,s.paid||v)*100-100)+'% over what you paid)','good',{label:'Read it',fn:function(){popup('An offer for '+s.name,'A buyer offers '+fmt(offer)+'. You paid '+fmt(s.paid||0)+'.',[{t:'Accept · '+fmt(offer),fn:function(){if(!w.biz[k])return;sellHome(k,offer);}},{t:'Counter at '+fmt(Math.round(offer*1.15)),s:'They might walk away',fn:function(){if(!w.biz[k])return;if(Math.random()<.45){sellHome(k,Math.round(offer*1.15));}else note('The buyer walked','"Too rich for us. Good luck!"','info');}},{t:'Not selling',cls:'sec'}]);}});save();}
  if(HWIN){var night=clockH<6.5||clockH>18.3;HWIN.color.setHex(night?0xffd98a:0xa8d6f2);if(HWIN.emissive)HWIN.emissive.setHex(night?0x6a4a10:0x000000);}
}

/* inside a house: yours, or one you're touring */
function enterHome(h,tour){TOUR=tour?h:null;if(!AREAS.home)return;AREAS.home.name=tour?'Touring '+h.name:h.name;AREAS.home.h=h;enterArea('home');}
function homeRoom(){
  var g=room('home',{name:'Home',w:16,d:12,floor:floorT(0xc99a6a,0xbb8c5e,6),wall:0xf4ead8,trim:0xffffff,bg:0x2a2420,h:4.4,outside:0x5fb35a}),ox=IOX.home;
  var rug=plane(5,3.4,toon(0x8a3a4a),-3,.02,0,g);rug.rotation.x=-Math.PI/2;
  rb(3.6,.9,1.1,.15,toon(0x46708a),-3,.45,-1.6,g);rb(3.6,.7,.3,.1,toon(0x46708a),-3,1,-2.05,g);[-4.9,-1.1].forEach(function(x){rb(.3,.8,1.1,.1,toon(0x46708a),x,.75,-1.6,g);});
  sp(.22,toon(0xffc63d),-4.2,1.05,-1.7,g,6);sp(.22,toon(0xef8fb0),-1.9,1.05,-1.7,g,6);
  rb(1.8,.45,.9,.06,toon(0x6b4a30),-3,.23,.3,g);cy(.12,.12,.2,toon(0xffffff),-2.6,.55,.3,g,8);
  bx(3.4,.6,.5,toon(0x3a3f4b),-3,.3,4.6,g);var tv=bx(3,1.7,.1,toon(0x111111),-3,1.6,4.6,g);plane(2.8,1.5,flat(0xffffff,{map:signT('CREMA NEWS',{bg:'#1a3a5a',fg:'#ffc63d',w:512,h:280,sub:'Channel 4 · live'})}),-3,1.6,4.53,g).rotation.y=Math.PI;
  addCol(ox-5,ox-1,-2.3,-1,'home');addCol(ox-4.7,ox-1.3,4.3,4.9,'home');
  // kitchen
  counterTop(g,4,-5.2,5,0xffffff,0x3a3f4b);bx(1.1,2.3,.9,toon(0xe8ecef),7,1.15,-5.2,g);bx(.06,.6,.05,toon(0x8a8f96),6.6,1.6,-4.74,g);bx(.8,.06,.6,toon(0x111111),3,1.12,-5.2,g);
  for(var i=0;i<4;i++)bx(.9,.7,.4,toon(0xffffff),2.2+i*1.1,3,-5.75,g);addCol(ox+1.4,ox+7.6,-5.9,-4.7,'home');
  rb(2.2,.12,1.3,.04,toon(0x8a5a3a),4.2,1,-1.6,g);[[-.9,-.5],[.9,-.5],[-.9,.5],[.9,.5]].forEach(function(o){cyB(.05,1,toon(0x6b4a30),4.2+o[0],0,-1.6+o[1],g,5);});
  [[3.2,-2.6],[5.2,-2.6],[3.2,-.6],[5.2,-.6]].forEach(function(o){bx(.55,.08,.55,toon(0xd8a45a),o[0],.6,o[1],g);bx(.55,.7,.07,toon(0xd8a45a),o[0],.95,o[1]+(o[1]<-1.6?-.25:.25),g);});
  sp(.18,toon(0xe2553f),4,1.2,-1.6,g,6);sp(.15,toon(0xffd24a),4.4,1.18,-1.5,g,6);addCol(ox+3,ox+5.4,-2.4,-.8,'home');
  // bed, bookshelf, desk with a laptop
  rb(2.4,.55,3.2,.1,toon(0xffffff),6.4,.3,3.6,g);plane(2.3,2.2,toon(0x46a9e6),6.4,.6,3.95,g).rotation.x=-Math.PI/2;bx(2.4,1.2,.2,toon(0x6b4a30),6.4,.6,2,g);sp(.35,toon(0xffffff),5.8,.75,2.4,g,6);sp(.35,toon(0xffffff),7,.75,2.4,g,6);addCol(ox+5.1,ox+7.7,1.9,5.3,'home');
  bx(2.6,3,.45,toon(0x8a5a3a),-7.5+1.4,1.5,-5.6,g);for(var sh=0;sh<4;sh++)for(var k=0;k<9;k++)bx(.18,.5+((k*3+sh)%3)*.08,.3,toon([0xe2553f,0x2f5f90,0xffc63d,0x2f7a4a,0xb39ddb,0xffffff][(k+sh*2)%6]),-7.1+k*.24,.55+sh*.72,-5.5,g);addCol(ox-7.6,ox-4.8,-5.9,-5.2,'home');
  bx(2,.08,.9,toon(0x6b4a30),-7,1,2.6,g);[-.85,.85].forEach(function(o){bx(.08,1,.8,toon(0x6b4a30),-7+o,.5,2.6,g);});bx(.8,.04,.55,toon(0x8a8f96),-7,1.06,2.6,g);var scr=bx(.78,.5,.03,toon(0x111111),-7,1.32,2.36,g);scr.rotation.x=-.2;addCol(ox-8,ox-6,2.1,3.1,'home');
  // windows on the back wall, frames, plants, a lamp
  [-4.5,0,4.5].forEach(function(x){if(x===4.5)return;bx(2,1.6,.08,toon(0xffffff),x,2.4,-5.82,g);plane(1.8,1.4,toon(0x9fd2f2),x,2.4,-5.76,g);bx(2,.08,.1,toon(0xffffff),x,2.4,-5.74,g);});
  [[-7.83,2.6,-2,0x2fa860],[-7.83,2.4,0,0xe2553f],[7.83,2.5,0,0xffc63d]].forEach(function(f){var p=plane(1.1,.8,toon(f[3]),f[0],f[1],f[2],g);p.rotation.y=f[0]<0?Math.PI/2:-Math.PI/2;});
  [[-7.2,-3.6],[1.2,4.6],[7.2,-3]].forEach(function(o){cy(.28,.22,.5,toon(0xc8743a),o[0],.25,o[1],g,8);sp(.45,toon(0x4f9a4a),o[0],.85,o[1],g,7);sp(.3,toon(0x5fb35a),o[0]+.15,1.2,o[1]+.1,g,6);});
  cyB(.04,1.8,toon(0x3a3f4b),-5.6,0,-2.5,g,5);cy(.25,.35,.4,toon(0xfff3d6),-5.6,1.9,-2.5,g,8);
  // trophy shelf: one cup per business you own (counted when the city loads)
  bx(3,.1,.4,toon(0x6b4a30),1.5,2.4,-5.8,g);var nb=Math.min(9,ownedBiz().length);for(var t=0;t<nb;t++){cy(.1,.06,.25,toon(0xffd24a),.3+t*.3,2.6,-5.75,g,8);}
  ACTS.home.push({x:ox-3,z:3.4,r:1.6,label:'Watch the news',sub:'Channel 4',fn:function(){var n=(G.news||[]).slice(0,4).map(function(x){return '· '+x.text;}).join('\n');popup('Crema News',n||'Slow news day. A cat got stuck in a tree on Main St. It\'s fine now.',[{t:'Turn it off',cls:'sec'}]);}});
  ACTS.home.push({x:ox-7,z:3.4,r:1.4,label:'Open the laptop',sub:'Your holdings',fn:function(){openPhone('hold');}});
  ACTS.home.push({x:ox+5,z:-4.2,r:1.5,label:'Raid the fridge',sub:'Kitchen',fn:function(){bubble(P.x,2.6,P.z,pick(['Leftover pizza. Perfect.','Just oat milk. Of course.','Cold brew. Your own.']),'');try{sfx.pick();}catch(e){}}});
  ACTS.home.push({x:ox+6.4,z:1.2,r:1.5,label:function(){return TOUR?'Check out the bedroom':'Take a nap';},sub:function(){return TOUR?'Nice light in here':'You wake up rested';},fn:function(){if(TOUR){bubble(P.x,2.6,P.z,'Big closet. Nice.','');return;}fade(function(){addXP(10);toast('You feel rested. +10 XP','good');});}});
  ACTS.home.push({x:ox-.5,z:2,r:1.6,label:function(){var h=AREAS.home.h;if(TOUR&&h)return 'Make '+h.owner+' an offer';var w=W4();return w.home&&AREAS.home.h&&w.home===AREAS.home.h.key?'Throw a house party':'Look around';},
    sub:function(){var h=AREAS.home.h;return TOUR&&h?'Asking '+fmt(dState(h).ask):'Neighbors come over · fame';},fn:function(){var h=AREAS.home.h;if(!h)return;if(TOUR){bizTalk(h,false);return;}var w=W4();if(w.home===h.key)houseParty(h);}});
  AREAS.home.h=null;
}
function houseParty(h){var w=W4(),c=Math.round(150*tierM());if(w.party&&w.party>now()){toast('The party is still going!');return;}if(!pay(c,'The party'))return;w.party=now()+180000;addFame(6);addXP(25);try{sfx.ding();}catch(e){}
  banner('House party!','+6 fame · word gets around','good');note('Party at '+h.name,'Half the street showed up. Your shops in '+plan.name+' get a bump for 3 minutes.','good');save();}
O.homeParty=function(){var w=W4();return w.party&&w.party>now()?1.08:1;};

/* listings, for Dana and the phone */
function homesForSale(){return HOMES.filter(function(h){return h.sale&&!homeState(h).own;}).sort(function(a,b){return Math.hypot(a.door.x-P.x,a.door.z-P.z)-Math.hypot(b.door.x-P.x,b.door.z-P.z);});}
function homesListing(){var hs=homesForSale();if(!hs.length){popup('Homes for sale','"Nothing listed right now. But between us: everybody has a price. Knock on doors."',[{t:'OK'}],'',{who:'Dana',role:'Crema Realty',col:'#2fa860'});return;}
  popup('Homes for sale','"These owners want out. Go see them in person, they like that."',hs.slice(0,6).map(function(h){return {t:h.name+' · '+fmt(dState(h).ask),s:(h.big?'Two-story house':'House')+' · '+Math.round(Math.hypot(h.door.x-P.x,h.door.z-P.z))+' m away · tap for directions',fn:function(){navTo(placeById('home:'+h.key));}};}).concat([{t:'Thanks, Dana',cls:'sec'}]),'',{who:'Dana',role:'Crema Realty',col:'#2fa860'});}
