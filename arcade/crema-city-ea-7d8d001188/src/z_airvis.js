
/* ---------- your airport upgrades are things you can see: gates with planes at the jet bridges, lanes, shops, a garage, your name on the roof ---------- */
function apGates(){var s=apState()||{};return 2+(s.own?((s.up||{}).gate||0):0);}
function apInterior(g,ox){var own=apOwned(),s=apState()||{},up=s.up||{},N=apGates();
  for(var gi=0;gi<N;gi++){var z=-15+gi*(30/Math.max(1,N-1)),k=new T.Group();k.position.set(29,0,z);g.add(k);
    plane(2.2,.6,flat(0xffffff,{map:signT('GATE '+(gi+1),{bg:'#14161c',fg:'#ffd24a',w:256,h:70,sub:gi%2?cityName((O.city+1+gi)%Math.max(2,G.cities||2)).toUpperCase():'ON TIME'})}),2.6,3.4,0,k).rotation.y=-Math.PI/2;
    for(var r=0;r<2;r++)for(var c=0;c<4;c++)rb(.55,.45,.55,.08,toon(0x2f5f90),-2.6-r*1.3,.4,-1.2+c*.8,k);rb(.8,1.1,.6,.06,toon(0x3a3f4b),1.6,.55,1.4,k);
    if(gi>0){var pl=planeModel([0xe2553f,0x2f8fd0,0x2fa860,0xffc63d][gi%4]);pl.scale.setScalar(.55);pl.position.set(ox+44+(gi%2)*12,0,z);pl.rotation.y=-Math.PI/2;stat.add(pl);bx(8,2.2,2,toon(0xd8dee6),37,3.4,z,g);}}
  if(!own)return;
  for(var l=0;l<(up.sec||0);l++){var zz=[-9,9,-13][l],sl=new T.Group();sl.position.set(0,0,zz);g.add(sl);rb(1.2,1.1,2.6,.08,toon(0x8a8f96),0,.55,0,sl);bx(1.3,.6,.3,toon(0x2a2a30),0,1.1,0,sl);npc(sl,1.2,.8,-Math.PI/2,{shirt:0x2a3a6a});plane(1.4,.4,flat(0xffffff,{map:signT('LANE '+(l+3),{bg:'#2a3a6a',fg:'#fff',w:200,h:56})}),0,2.4,-1.35,sl);}
  var shops=[['TRAVEL ESSENTIALS','#2fa860'],['CANDY PORT','#ff79b4']];for(var sh=0;sh<(up.shops||0);sh++){var sf=new T.Group();sf.position.set(sh?28:7,0,14);g.add(sf);bx(7,3.2,.2,toon(0xffffff),0,1.6,2.6,sf);for(var i=0;i<2;i++){rb(2.2,1.5,.7,.04,toon(0x2a2a30),-1.6+i*3.2,.75,1.6,sf);for(var j=0;j<6;j++)bx(.24,.36,.24,toon([0xffd24a,0xff79b4,0x46a9e6,0x6cc76a][j%4]),-2.3+i*3.2+j*.28,1.7,1.6,sf);}
    plane(3.6,.7,flat(0xffffff,{map:signT(shops[sh][0],{bg:shops[sh][1],fg:'#fff',w:512,h:100})}),0,3.4,1.4,sf).rotation.y=Math.PI;npc(sf,0,1,Math.PI,{shirt:0xffffff});}
  if(up.park){wallSign(g,'P · PARKING GARAGE →',-14,3.4,16.6,{bg:'#2f5f90',fg:'#fff',w:6,h:.8,ry:Math.PI});}
  wallSign(g,apName().toUpperCase(),-8,5.6,-16.6,{bg:'#2f8fd0',fg:'#fff',w:14,h:1.1});}
function apExterior(){var p=plan;if(!p.AX)return;var AX=p.AX,AZ=p.AZ,own=apOwned(),s=apState()||{},up=s.up||{},N=apGates(),keep=stat;stat=new T.Group();var g=stat;
  for(var gi=0;gi<N;gi++){var z=AZ-36+gi*(72/Math.max(1,N-1)),x0=AX+25;bx(12,2.6,2.4,toon(0xd8dee6),x0+6,4.2,z,g);cyB(.25,3,toon(0x8a8f96),x0+10,0,z,g,8);
    var pl=planeModel([0xe2553f,0x2f8fd0,0x2fa860,0xffc63d][gi%4]);pl.scale.setScalar(.7);pl.position.set(x0+24+(gi%2)*14,0,z);pl.rotation.y=-Math.PI/2;g.add(pl);
    var gs=plane(3,1,flat(0xffffff,{map:signT('GATE '+(gi+1),{bg:'#14161c',fg:'#ffd24a',w:256,h:84})}),x0+12.2,4.2,z,g);gs.rotation.y=Math.PI/2;}
  if(own&&up.park){var gx=p.CX-RH-20,gz=AZ-37;for(var f=0;f<3;f++){bx(32,.35,14,toon(0xc8c2b6),gx,2.4+f*2.4,gz,g);}for(var c=0;c<6;c++)bx(.6,9.6,.6,toon(0xb8b2a6),gx-15+c*6,4.8,gz-6.6,g);
    var ps=plane(10,1.4,flat(0xffffff,{map:signT('P · '+apName().toUpperCase(),{bg:'#2f5f90',fg:'#fff',w:768,h:110})}),gx,10.2,gz+7.1,g);ps.rotation.y=Math.PI;}
  O.scene.add(mergeGroup(stat));stat=keep;}
