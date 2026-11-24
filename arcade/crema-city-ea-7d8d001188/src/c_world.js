
/* ---------- textures ---------- */
var TX={};
function tx(k,w,h,fn){if(TX[k])return TX[k];var t=canvasTex(w,h,fn,[1,1]);return TX[k]=t;}
function asphaltT(){return tx('asph',256,256,function(g,w,h){g.fillStyle='#5a5d65';g.fillRect(0,0,w,h);speck(g,w,h,2600,.08);for(var i=0;i<6;i++){g.strokeStyle='rgba(30,30,35,.18)';g.lineWidth=2;g.beginPath();var x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);g.lineTo(x+rnd(-40,40),y+rnd(-40,40));g.stroke();}});}
function paveT(st){return tx('pave'+st,128,128,function(g,w,h){
  if(st==='wood'){g.fillStyle='#c99a62';g.fillRect(0,0,w,h);for(var i=0;i<8;i++){g.fillStyle=i%2?'#bf8f58':'#d2a46c';g.fillRect(0,i*16,w,15);g.fillStyle='rgba(80,50,20,.35)';g.fillRect(0,i*16+15,w,1);g.fillRect((i*37)%w,i*16,2,15);}return;}
  if(st==='cobble'){g.fillStyle='#b9aa96';g.fillRect(0,0,w,h);for(var y=0;y<8;y++)for(var x=0;x<8;x++){g.fillStyle=['#cbbca6','#bfae98','#d3c4ae'][(x*7+y*3)%3];rr(g,x*16+(y%2)*8-6,y*16+1,14,14,4);g.fill();}speck(g,w,h,200,.06);return;}
  if(st==='snow'){g.fillStyle='#f4f8fc';g.fillRect(0,0,w,h);speck(g,w,h,300,.05);g.strokeStyle='#e2eaf2';g.lineWidth=2;for(i=0;i<=4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,h);g.stroke();}return;}
  if(st==='brick'){g.fillStyle='#c98b6b';g.fillRect(0,0,w,h);for(y=0;y<8;y++)for(x=0;x<4;x++){g.fillStyle=['#d39878','#c4815f','#cf9070'][(x+y)%3];g.fillRect(x*32+(y%2)*16+1,y*16+1,30,14);}return;}
  g.fillStyle='#e9e2d6';g.fillRect(0,0,w,h);speck(g,w,h,260,.05);g.strokeStyle='#d4cbbb';g.lineWidth=3;for(i=0;i<=4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32,h);g.stroke();g.beginPath();g.moveTo(0,i*32);g.lineTo(w,i*32);g.stroke();}});}
function grassT(){return tx('grass',128,128,function(g,w,h){g.fillStyle='#8fcf74';g.fillRect(0,0,w,h);for(var i=0;i<700;i++){g.fillStyle=Math.random()<.5?'rgba(60,140,50,.18)':'rgba(220,255,190,.18)';g.fillRect(Math.random()*w,Math.random()*h,2,3);}});}
function sandT(){return tx('sand',128,128,function(g,w,h){g.fillStyle='#f2dca4';g.fillRect(0,0,w,h);speck(g,w,h,800,.08);});}
function waterT(){return tx('water',128,128,function(g,w,h){g.fillStyle='#57b7e0';g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;for(var i=0;i<14;i++){var x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+8,y-4,x+16,y);g.stroke();}});}
/* facade tiles: one tile = two windows wide, one floor tall */
function facadeT(col,st,lit){var k='fa'+col+st+(lit?1:0);return tx(k,128,128,function(g,w,h){
  g.fillStyle=hexCss(col);g.fillRect(0,0,w,h);
  if(st==='glass'){g.fillStyle=lit?'#ffe3a6':'#8fc3e6';g.fillRect(4,6,w-8,h-14);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(10,10,18,h-24);g.fillStyle=hexCss(col);g.fillRect(w/2-2,6,4,h-14);g.fillRect(4,h/2,w-8,3);return;}
  if(st==='brick'){for(var y=0;y<16;y++)for(var x=0;x<8;x++){g.fillStyle='rgba(0,0,0,'+(((x+y)%3)*.04)+')';g.fillRect(x*16+(y%2)*8,y*8,15,7);}}
  for(var i=0;i<2;i++){var X=i*64+14,Y=st==='apt'?20:16,wd=36,ht=st==='old'?52:44;
    g.fillStyle='rgba(255,255,255,.9)';g.fillRect(X-4,Y-4,wd+8,ht+8);
    g.fillStyle=lit?(Math.random()<.75?'#ffdf9a':'#6f8aa6'):'#7fb4d8';g.fillRect(X,Y,wd,ht);
    if(!lit){g.fillStyle='rgba(255,255,255,.45)';g.fillRect(X+3,Y+3,9,ht-6);}
    g.fillStyle='rgba(255,255,255,.9)';g.fillRect(X+wd/2-1.5,Y,3,ht);
    if(st==='apt'){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X-6,Y+ht+4,wd+12,6);}
    if(st==='old'){g.fillStyle='rgba(90,60,40,.5)';g.fillRect(X-8,Y+ht+4,wd+16,5);}}
});}
function facadeMat(col,st){var day=facadeT(col,st,0),night=facadeT(col,st,1),m=toon(0xffffff,{map:day});if(!m.userData.fa){m.userData.fa=1;winMats.push({m:m,day:day,night:night});}return m;}
function stripeT(a,b){return tx('st'+a+'_'+b,128,32,function(g,w,h){for(var i=0;i<8;i++){g.fillStyle=hexCss(i%2?b:a);g.fillRect(i*16,0,16,h);}g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,h-5,w,5);});}
function signT(text,o){return labelTex(text,o);}
/* what you see through a shop window: warm light, shelves, a counter */
function shopInT(k){return tx('shin'+k,256,128,function(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#6a4a34');gr.addColorStop(1,'#3a2618');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(var i=0;i<5;i++){g.fillStyle='rgba(255,220,150,.55)';g.beginPath();g.arc(28+i*50,14,7,0,7);g.fill();g.fillStyle='rgba(255,220,150,.12)';g.beginPath();g.arc(28+i*50,30,26,0,7);g.fill();}
  for(var r=0;r<3;r++){g.fillStyle='#8a6448';g.fillRect(8,40+r*24,110,4);for(var j=0;j<9;j++){g.fillStyle=['#e2553f','#ffc63d','#46a9e6','#6cc76a','#f4f4f4','#b39ddb'][(j*7+r*3+k.length)%6];g.fillRect(12+j*12,26+r*24,9,14);}}
  g.fillStyle='#a0663f';g.fillRect(140,78,100,30);g.fillStyle='#d8c0a0';g.fillRect(136,74,108,6);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,0,w,h);});}

/* shared dynamic materials (they change with the time of day) */
var MAT={};
function initMats(){
  MAT.lamp=new T.MeshToonMaterial({color:0xfff3c8,gradientMap:grad,emissive:new T.Color(0xffd98a),emissiveIntensity:.15});
  MAT.head=new T.MeshBasicMaterial({color:0xfff6dc});MAT.tail=new T.MeshBasicMaterial({color:0xd8443a});
  MAT.glow=new T.MeshBasicMaterial({color:0xffd890,transparent:true,opacity:.35,depthWrite:false});
  MAT.tl={x:[0,1,2].map(function(){return new T.MeshBasicMaterial({color:0x333333});}),z:[0,1,2].map(function(){return new T.MeshBasicMaterial({color:0x333333});})};
  MAT.route=new T.MeshBasicMaterial({color:0x31e0ff,transparent:true,opacity:.85,depthWrite:false});
  MAT.beam=new T.MeshBasicMaterial({color:0x31e0ff,transparent:true,opacity:.22,depthWrite:false,side:T.DoubleSide});
  MAT.rain=new T.LineBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.45});
  lampMats=[MAT.lamp];
}

/* ---------- ground, roads and markings ---------- */
function buildGround(){
  var p=plan,g=new T.Group(),gt=grassT();
  var gr=planeR(1600,1600,160,160,toon(0xffffff,{map:gt}),p.xs[0]+400,-.05,p.zs[0]+300,g);gr.rotation.x=-Math.PI/2;
  var at=asphaltT(),aw=p.xs[p.C]-p.xs[0]+2*RH,ah=p.zs[p.R]-p.zs[0]+2*RH;
  var a=planeR(aw,ah,aw/9,ah/9,toon(0xffffff,{map:at}),(p.xs[0]+p.xs[p.C])/2,0,(p.zs[0]+p.zs[p.R])/2,g);a.rotation.x=-Math.PI/2;
  roads.filter(function(r){return r.air;}).forEach(function(r){var w=r.x1-r.x0,h=r.z1-r.z0,m=planeR(w,h,w/9,h/9,toon(0xffffff,{map:at}),(r.x0+r.x1)/2,.005,(r.z0+r.z1)/2,g);m.rotation.x=-Math.PI/2;});
  var Y=toon(0xf6d26b),Wt=toon(0xf7f7f2);
  // center lines + stop lines + crosswalks
  for(var i=0;i<=p.C;i++)for(var j=0;j<p.R;j++){var x=p.xs[i],z0=p.zs[j]+RH+1.5,z1=p.zs[j+1]-RH-1.5;for(var z=z0;z<z1-1;z+=4.4){var d=plane(.16,2.2,Y,x,.012,z+1.1,g);d.rotation.x=-Math.PI/2;}}
  for(j=0;j<=p.R;j++)for(i=0;i<p.C;i++){var zz=p.zs[j],x0=p.xs[i]+RH+1.5,x1=p.xs[i+1]-RH-1.5;for(x=x0;x<x1-1;x+=4.4){d=plane(2.2,.16,Y,x+1.1,.012,zz,g);d.rotation.x=-Math.PI/2;}}
  for(i=0;i<=p.C;i++)for(j=0;j<=p.R;j++){var cx=p.xs[i],cz=p.zs[j];
    for(var k=-3;k<=3;k++){[-1,1].forEach(function(s){var c1=plane(.55,2.6,Wt,cx+k*1.25,.013,cz+s*(RH+1.6),g);c1.rotation.x=-Math.PI/2;var c2=plane(2.6,.55,Wt,cx+s*(RH+1.6),.013,cz+k*1.25,g);c2.rotation.x=-Math.PI/2;});}
    [-1,1].forEach(function(s){var sl=plane(.3,RH,Wt,cx+s*(RH+3.2),.013,cz+s*RH/2,g);sl.rotation.x=-Math.PI/2;var sl2=plane(RH,.3,Wt,cx-s*RH/2,.013,cz+s*(RH+3.2),g);sl2.rotation.x=-Math.PI/2;});}
  // airport road arrows
  var A=p.AZ;for(x=p.xs[p.C]+RH+2;x<p.CX-RH-2;x+=4.4){d=plane(2.2,.16,Y,x+1.1,.012,A,g);d.rotation.x=-Math.PI/2;}
  for(z=A-44;z<A+44;z+=4.4){d=plane(.16,2.2,Y,p.CX,.012,z+1.1,g);d.rotation.x=-Math.PI/2;}
  // parking stalls in the airport lot
  for(var r2=0;r2<4;r2++)for(var c2=0;c2<5;c2++){var sx=p.CX-RH-4-c2*6.5,sz=A-44+r2*9;var ln=plane(.14,5,Wt,sx-3.2,.013,sz+2.5,g);ln.rotation.x=-Math.PI/2;}
  stat.add(mergeGroup(g));
}
/* traffic lights: every head of one axis shares one material, so the whole city switches at once */
function buildSignals(){
  var p=plan,g=new T.Group(),pole=toon(0x3a3f4b),box=toon(0x26292f);
  for(var i=0;i<=p.C;i++)for(var j=0;j<=p.R;j++){var cx=p.xs[i],cz=p.zs[j];
    [[1,1,'x',-1,0],[-1,-1,'x',1,0],[-1,1,'z',0,-1],[1,-1,'z',0,1]].forEach(function(q){
      var px=cx+q[0]*(RH+.7),pz=cz+q[1]*(RH+.7);
      var ax=q[2],fx=q[3],fz=q[4],hg=new T.Group();hg.position.set(px,.2,pz);hg.rotation.y=Math.atan2(fx,fz);g.add(hg);
      cyB(.09,4.6,pole,0,0,0,hg,8);bx(2.6,.12,.12,pole,-1.3,4.5,0,hg);
      var hd=new T.Group();hd.position.set(-2.5,4.05,0);hg.add(hd);rb(.42,1.15,.32,.06,box,0,0,0,hd);
      [0,1,2].forEach(function(n){sp(.13,MAT.tl[ax][n],0,.36-n*.36,.17,hd,10);});
      cols.push({x0:px-.2,x1:px+.2,z0:pz-.2,z1:pz+.2,area:curArea});});
    var sx=cx+(RH+.7),sz=cz+(RH+.7),hn=plan.hn[j],vn=plan.vn[i];
    var s1=plane(1.5,.32,flat(0xffffff,{map:signT(hn,{bg:'#1f6a45',fg:'#ffffff',w:384,h:84}),ds:1}),sx,3.55,sz,g);var s2=plane(1.5,.32,flat(0xffffff,{map:signT(vn,{bg:'#1f6a45',fg:'#ffffff',w:384,h:84}),ds:1}),sx,3.9,sz,g);s2.rotation.y=Math.PI/2;}
  stat.add(mergeGroup(g));
}
var CYC=22;
function phase(t){var u=t%CYC;return u<9?{x:'g',z:'r'}:u<11?{x:'y',z:'r'}:u<20?{x:'r',z:'g'}:{x:'r',z:'y'};}
var lastPh='';
function updSignals(t){var ph=phase(t),k=ph.x+ph.z;if(k===lastPh)return;lastPh=k;
  ['x','z'].forEach(function(a){var s=ph[a];MAT.tl[a][0].color.setHex(s==='r'?0xff4a3a:0x40231f);MAT.tl[a][1].color.setHex(s==='y'?0xffc23a:0x3f3520);MAT.tl[a][2].color.setHex(s==='g'?0x46e07a:0x1f3a28);});}

/* ---------- block slabs and street furniture ---------- */
function paveStyle(b){var w=b.D?b.D.win:'';return w==='ocean'?'wood':w==='old'?'cobble':w==='snow'?'snow':w==='campus'?'brick':'walk';}
function blockSlab(b,g){
  var st=paveStyle(b),pt=paveT(st),top=planeR(BW,BD,BW/3.2,BD/3.2,toon(0xffffff,{map:pt}),b.x,.2,b.z,g);top.rotation.x=-Math.PI/2;
  var curb=toon(st==='snow'?0xdfe7ef:0xcfc6b8);
  bx(BW,.2,.3,curb,b.x,.1,b.z-BD/2+.15,g);bx(BW,.2,.3,curb,b.x,.1,b.z+BD/2-.15,g);bx(.3,.2,BD,curb,b.x-BW/2+.15,.1,b.z,g);bx(.3,.2,BD,curb,b.x+BW/2-.15,.1,b.z,g);
}
function tree(g,x,z,c,kind,r){
  var tr=toon(0x7a4a2a);
  if(kind==='palm'){var h=4.6+r()*1.4;for(var i=0;i<5;i++){var s=cy(.14-i*.012,.16-i*.012,h/5,tr,x+Math.sin(i*.5)*.12*i,h/10+i*h/5,z,g,8);}
    for(i=0;i<6;i++){var lf=bx(.5,.06,2.4,toon(0x4fae4a),x,h+.1,z,g);lf.rotation.y=i/6*Math.PI*2;lf.rotation.x=.35;lf.translateZ(1.1);}return;}
  if(kind==='pine'){cyB(.14,1,tr,x,.2,z,g,8);var m=toon(0x2f6e4a);cone(1.3,2.2,m,x,2.1,z,g,9);cone(1,1.9,m,x,3.2,z,g,9);cone(.65,1.5,m,x,4.2,z,g,9);cone(.42,.45,toon(0xffffff),x,4.8,z,g,9);return;}
  bx(1.1,.05,1.1,toon(0x6b5440),x,.22,z,g);cyB(.13,1.6,tr,x,.2,z,g,8);var mm=toon(c);sp(.95,mm,x,2.3,z,g,10);sp(.7,mm,x-.55,2.0,z+.2,g,9);sp(.7,mm,x+.55,2.05,z-.15,g,9);blob(1.8,1.8,g,x,.2,z);
}
function lampPost(g,x,z,ry){var pole=toon(0x3a3f4b);cyB(.07,4.2,pole,x,.2,z,g,8);var a=new T.Group();a.position.set(x,4.3,z);a.rotation.y=ry;g.add(a);bx(.08,.08,1.2,pole,0,0,.55,a);rb(.42,.18,.62,.06,pole,0,-.05,1.15,a);bx(.34,.04,.5,MAT.lamp,0,-.15,1.15,a);}
function hydrant(g,x,z){var m=toon(0xe2553f);cyB(.16,.55,m,x,.2,z,g,10);sp(.16,m,x,.78,z,g,10);cy(.06,.06,.42,m,x,.6,z,g,8).rotation.z=Math.PI/2;}
function bin(g,x,z){cyB(.25,.85,toon(0x2f5a46),x,.2,z,g,12);cy(.27,.27,.06,toon(0x24453a),x,1.06,z,g,12);}
function bench(g,x,z,ry){var b=new T.Group();b.position.set(x,.2,z);b.rotation.y=ry;g.add(b);var w=toon(0xb07a4a),ir=toon(0x3a3f4b);bx(1.8,.08,.45,w,0,.45,0,b);bx(1.8,.4,.06,w,0,.75,-.22,b);[-.75,.75].forEach(function(q){bx(.06,.45,.45,ir,q,.22,0,b);});}
function newsBox(g,x,z,ry){var b=new T.Group();b.position.set(x,.2,z);b.rotation.y=ry;g.add(b);rb(.55,1.0,.45,.04,toon(0x2f8fd0),0,.5,0,b);bx(.42,.3,.02,toon(0xf4f4f4),0,.75,.23,b);}
function busStop(g,x,z,ry){var b=new T.Group();b.position.set(x,.2,z);b.rotation.y=ry;g.add(b);var fr=toon(0x3a3f4b);[-1.6,1.6].forEach(function(q){bx(.1,2.5,.1,fr,q,1.25,-.5,b);bx(.1,2.5,.1,fr,q,1.25,.5,b);});bx(3.5,.1,1.3,fr,0,2.55,0,b);bx(3.2,2,.05,glass(0xbfe6ff,.4),0,1.3,-.55,b);bx(2.6,.08,.4,toon(0xb07a4a),0,.5,-.3,b);
  plane(.9,.5,flat(0xffffff,{map:signT('BUS',{bg:'#2f8fd0',fg:'#fff',w:256,h:128})}),1.6,2.9,0,b);}
function furnish(b,g,r){
  var st=paveStyle(b),pal=palette(b),kind=st==='wood'?'palm':st==='snow'?'pine':'leaf';
  [1,-1].forEach(function(s){var zc=b.z+s*(BD/2-.6),ry=s>0?0:Math.PI;
    for(var i=0;i<=NL;i++){var gx=b.x-INW/2-LGAP/2+i*(LOTW+LGAP);lampPost(g,gx,zc,ry);cols.push({x0:gx-.15,x1:gx+.15,z0:zc-.15,z1:zc+.15,area:curArea});}
    for(i=0;i<NL;i++){var lx=b.x-INW/2+LOTW/2+i*(LOTW+LGAP)+(s>0?2.6:-2.6);if(b.t==='park')continue;tree(g,lx,zc-s*.2,pal.tree,kind,r);cols.push({x0:lx-.35,x1:lx+.35,z0:zc-.35,z1:zc+.35,area:curArea});
      if(r()<.25)hydrant(g,lx+(s>0?1.6:-1.6),zc+s*.1);else if(r()<.3)bin(g,lx+(s>0?1.6:-1.6),zc);}
    if(b.t!=='park'&&r()<.5){var nx=b.x+(s>0?-1:1)*(BW/2-2.2),nz=b.z+s*(BD/2-1.3);newsBox(g,nx,nz,ry);ACTS.city.push({x:nx,z:nz+s*.8,r:1.2,label:'Read the Crema Courier',sub:'50¢ · today\'s headlines',fn:function(){if(pay(.5,'The paper'))readCourier();}});}});
  // short ends of the block
  [-1,1].forEach(function(e){var x=b.x+e*(BW/2-.7);tree(g,x,b.z-4,pal.tree,kind,r);tree(g,x,b.z+4,pal.tree,kind,r);bench(g,b.x+e*(BW/2-1.9),b.z,e>0?-Math.PI/2:Math.PI/2);
    cols.push({x0:x-.35,x1:x+.35,z0:b.z-4.35,z1:b.z-3.65,area:curArea},{x0:x-.35,x1:x+.35,z0:b.z+3.65,z1:b.z+4.35,area:curArea});});
  if(b.r===0&&b.c===1)busStop(g,b.x+6,b.z-BD/2+1.2,Math.PI);
  if(b.t==='homes'&&b.c===2)busStop(g,b.x-6,b.z+BD/2-1.2,0);
}
function palette(b){
  var w=b.D?b.D.win:b.t;
  var P2={street:[0xf2a65a,0xe86a5c,0x7cc7bd,0xf6d26b,0xb39ddb,0xef8fb0],campus:[0xc4573e,0xb84a36,0xd9775a,0xe9e2d3],towers:[0x5b7fa6,0x7aa3c9,0x46698f,0x9cc0de,0xd8dee6],ocean:[0xf5dca0,0x7fcdf7,0xffffff,0xef8a7c,0xffd0a0],
    old:[0xf4c0a0,0xf6e2a0,0xb8dcc8,0xf0b4c4,0xc9c0ea],snow:[0x8a5a3a,0xa86a42,0x6e4630],park:[0xa8d98a,0xf6e2a0,0xe9d6a8,0x9cc8e0],night:[0x3a2a50,0x4a3466,0x2a2440,0x523c6e],harbor:[0x9cc4dc,0xc8d0d8,0x8a9aa8,0xb8a890],
    homes:[0xf2d7b6,0xe9b8a0,0xc9d8c0,0xd8cde6,0xf4e2a8],civic:[0xece4d6],market:[0xf2a65a,0x7cc7bd],motors:[0xd8dee6],park2:[0]}[w]||[0xf2a65a,0xe86a5c,0x7cc7bd];
  return {cols:P2,tree:w==='snow'?0x3f7a5a:w==='ocean'?0x7fbf5a:w==='night'?0x4f9a5a:0x5fb35a,tall:w==='towers'?2.6:w==='old'?.85:w==='homes'?1.4:1,style:w==='towers'?'glass':w==='campus'?'brick':w==='old'?'old':w==='homes'?'apt':'std'};
}
var BIZ={street:['Pixel Books','Bloom Florist','Slice Pizza','Thread & Co','Sunny Laundry','Corner Deli','Vinyl Vault','Tiny Toys','Fresh Cuts','Lucky Nails','Paper Moon','Hello Phones'],
  campus:['Campus Books','Copy Center','Ramen Lab','Bike Hub','Tutor Spot','Dorm Depot','Print Shop','Noodle U'],
  towers:['Atlas Capital','Lumen Bank','Meridian Law','Vertex Labs','Orbit Media','Summit Partners','Northwind'],
  ocean:['Surf Shack','Tiki Tacos','Shell Gifts','Kite World','Sun & Sand','Board Rentals','Fish Tacos'],
  old:['Antiques','Clockmaker','Bookbinder','Lace & Linen','Tea House','Old Post','Apothecary'],
  snow:['Ski Rental','Cocoa Hut','Gear Up','Fireside Inn','Snow Sports','Wool & Co'],
  park:['Iron Gym','Yoga Loft','Run Shop','Spin Studio','Climb Wall','Smoothie Stop'],
  night:['Neon Noodles','Lucky Cat','Karaoke 88','Dumpling Den','Arcade','Bao Bar'],
  harbor:['Fish Market','Ship Supply','Dockside Diner','Rope & Anchor','Ferry Tickets']};

/* ---------- generic buildings ---------- */
function genBuildingV1(lot,b,r,opt){
  opt=opt||{};var pal=palette(b),g=lotGroup(lot),w=lot.w-.3,d=BDEP-.4,col=pal.cols[Math.floor(r()*pal.cols.length)],st=opt.style||pal.style;
  var fl=opt.floors||Math.max(1,Math.round((1.6+r()*2.2)*pal.tall)),fh=3.2,h=3.6+fl*fh;
  rb(w,h,d,.12,toon(col),0,h/2,-d/2,g);
  var fm=facadeMat(col,st),cols2=Math.max(1,Math.round(w/4.2));planeR(w-1,fl*fh,cols2,fl,fm,0,3.6+fl*fh/2,.02,g);
  rb(w+.3,.4,d+.3,.08,toon(st==='glass'?0xe8eef2:0xffffff),0,h+.1,-d/2,g);
  if(st==='old'||st==='snow'){var roof=prism(w+.6,2.4,d+.6,toon(st==='snow'?0x7a4a3a:0x9a5a4a),0,h+.2,-d/2,g);roof.rotation.y=Math.PI/2;roof.scale.set(1,1,1);if(b.D&&b.D.win==='snow'){var sc=prism(w+.7,.6,d+.7,toon(0xffffff),0,h+2.05,-d/2,g);sc.rotation.y=Math.PI/2;}}
  else if(r()<.5){rb(1.6,.9,1.2,.1,toon(0xc8ccd2),-w/4,h+.75,-d/2,g);if(r()<.3){cyB(.9,1.6,toon(0x9a6a44),w/4,h+.3,-d/2-1,g,12);cone(1,.7,toon(0x7a5434),w/4,h+2.25,-d/2-1,g,12);}}
  // ground floor: shop window, door and a sign
  var gcol=st==='glass'?0xe8eef2:col;rb(w,3.5,.25,.05,toon(gcol),0,1.75,.02,g);
  plane(w-3.2,2.3,toon(0xffffff,{map:shopInT(b.D?b.D.win:'street')}),.9,1.55,.13,g);bx(w-3.2,2.3,.06,glass(0xbfe6ff,.35),.9,1.55,.2,g);bx(1.2,2.4,.14,toon(0x5a3a28),DOORX,1.2,.18,g);
  var biz=opt.name||bizPick(b,lot),sgc=pal.cols[(Math.floor(r()*9))%pal.cols.length];
  plane(Math.min(w-1.5,6.4),.9,flat(0xffffff,{map:signT(biz,{bg:'#fffaf0',fg:'#3a2317',w:512,h:128})}),.6,3.05,.17,g);
  if(st!=='glass'){var aw=cy(.5,.5,w-2.6,toon(0xffffff,{map:stripeT(sgc,0xffffff)}),.9,2.85,.55,g,14);aw.rotation.z=Math.PI/2;aw.scale.set(1,1,.55);}
  if(r()<.35)rb(1.4,.5,.5,.1,toon(0x7fbf5a),2.8,.45,.6,g);
  rectCol(lot,-w/2,w/2,-d,.1).h=h+(st==='old'||st==='snow'?2.4:0);
  return {g:g,h:h,name:biz};
}
function apartment(lot,b,r){
  var g=lotGroup(lot),w=lot.w-.3,d=BDEP-.4,col=palette(b).cols[Math.floor(r()*5)],fl=3+Math.floor(r()*4),h=1+fl*3.1;
  rb(w,h,d,.12,toon(col),0,h/2,-d/2,g);planeR(w-.8,fl*3.1,Math.round(w/4.2),fl,facadeMat(col,'apt'),0,1+fl*3.1/2,.02,g);
  for(var f=1;f<fl;f++)for(var i=-1;i<=1;i+=2){var bal=bx(2.4,.12,.9,toon(0xffffff),i*(w/4),f*3.1+.9,.45,g);bx(2.4,.7,.06,toon(0x6a7480),i*(w/4),f*3.1+1.3,.88,g);if(r()<.3)sp(.25,toon(0x5fb35a),i*(w/4)+.8,f*3.1+1.25,.5,g,8);}
  rb(w+.3,.4,d+.3,.08,toon(0xffffff),0,h+.1,-d/2,g);bx(1.6,2.4,.2,toon(0x5a3a28),0,1.2,.1,g);bx(2.4,.15,1.3,toon(0xffffff),0,2.6,.6,g);
  rectCol(lot,-w/2,w/2,-d,.1).h=h;return fl;
}
