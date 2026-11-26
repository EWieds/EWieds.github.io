
/* ---------- in the air: a cabin you can look around, and real windows to look out of ---------- */
var CAB=null;
function cloudTex(){return tx('cloud',128,128,function(g,w,h){var gr=g.createRadialGradient(64,64,6,64,64,62);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.6,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});}
function landT(){return tx('landpatch',256,256,function(g,w,h){for(var y=0;y<8;y++)for(var x=0;x<8;x++){g.fillStyle=['#8cc47a','#a8d48a','#d8c88a','#7ab468','#c4d49a','#6aa45a'][(x*3+y*5)%6];g.fillRect(x*32,y*32,32,32);}
  g.strokeStyle='rgba(120,110,100,.6)';g.lineWidth=2;for(var i=0;i<4;i++){g.beginPath();g.moveTo(0,Math.random()*h);g.lineTo(w,Math.random()*h);g.stroke();}g.fillStyle='#5aa8d8';g.beginPath();g.ellipse(180,70,40,22,.4,0,7);g.fill();});}
function buildCabin(to){
  var sc=new T.Scene(),sky=new T.Scene();sc.background=new T.Color(0x2a2a30);sky.background=new T.Color(0x8fd0f4);sky.fog=new T.Fog(0xcfe8f8,200,1400);
  [sc,sky].forEach(function(s){s.add(new T.HemisphereLight(0xffffff,0x9a8a7a,.8));var d=new T.DirectionalLight(0xffffff,.6);d.position.set(10,30,10);s.add(d);});
  // the cabin: a tube you sit in
  var tube=new T.Mesh(new T.CylinderGeometry(2.3,2.3,30,24,1,true),toonU(0xf2efe8));tube.material.side=T.BackSide;tube.rotation.z=Math.PI/2;tube.position.y=1.6;sc.add(tube);
  var fl=plane(30,3.4,toon(0x3a4a6a),0,.05,0,sc);fl.rotation.x=-Math.PI/2;var ail=plane(30,.7,toon(0x8a2a3a),0,.06,0,sc);ail.rotation.x=-Math.PI/2;
  bx(30,.5,.9,toon(0xe8e4dc),0,3.1,-1.6,sc);bx(30,.5,.9,toon(0xe8e4dc),0,3.1,1.6,sc);
  var rt=new T.WebGLRenderTarget(lowEnd()?256:384,lowEnd()?256:384);rt.texture.encoding=T.sRGBEncoding;var wm=new T.MeshBasicMaterial({map:rt.texture});
  var seatM=toon(0x2f5f9f),win=[];
  for(var r=0;r<12;r++){var x=-13+r*2.2;[-1.55,-.95,.95,1.55].forEach(function(z){var s=new T.Group();s.position.set(x,0,z);sc.add(s);rb(.55,.45,.55,.08,seatM,0,.45,0,s);rb(.15,.85,.55,.06,seatM,-.25,.95,0,s);rb(.12,.22,.4,.05,toon(0xf2efe8),-.25,1.45,0,s);});
    [-1,1].forEach(function(sd){var w=new T.Mesh(new T.CircleGeometry(.24,20),wm);w.scale.set(1,1.35,1);w.position.set(x+.4,1.55,sd*2.22);w.rotation.y=sd>0?Math.PI:0;sc.add(w);var fr=new T.Mesh(new T.TorusGeometry(.26,.04,6,20),toon(0xd8d4cc));fr.scale.set(1,1.35,1);fr.position.copy(w.position);fr.rotation.y=w.rotation.y;sc.add(fr);win.push(w);});
    if(r!==6)for(var k=0;k<2;k++){var pz=[-1.55,-.95,.95,1.55][(r+k*2)%4];var ps=liteMe();ps.sit=true;ps.root.position.set(x-.05,.35,pz);ps.root.rotation.y=Math.PI/2;sc.add(ps.root);animLite(ps,0,false);}}
  var att=liteMe({shirt:0x2f8fd0});att.root.position.set(-6,0,0);sc.add(att.root);var cart=rb(.8,1,.5,.05,toon(0xd8dde4),-5.2,.6,0,sc);
  var sign=plane(1,.4,flat(0xffffff,{map:signT('FASTEN SEATBELT',{bg:'#1a1a1e',fg:'#ffc63d',w:256,h:100})}),0,2.6,-1.1,sc);
  // the sky outside: clouds drift past, the ground slides by far below
  var ground=planeR(6000,6000,24,24,toon(0xffffff,{map:landT()}),0,-600,0,sky);ground.rotation.x=-Math.PI/2;
  var clouds=[];var nC=lowEnd()?24:48;for(var i=0;i<nC;i++){var c=new T.Sprite(new T.SpriteMaterial({map:cloudTex(),transparent:true,depthWrite:false,opacity:.9}));var s2=rnd(40,120);c.scale.set(s2*1.6,s2,1);c.position.set(rnd(-900,900),rnd(-260,60),rnd(-500,500));sky.add(c);clouds.push(c);}
  var wcam=new T.PerspectiveCamera(60,1,1,2000);
  var cam=new T.PerspectiveCamera(70,W/H,.05,60);
  CAB={sc:sc,sky:sky,rt:rt,cam:cam,wcam:wcam,clouds:clouds,ground:ground,att:att,cart:cart,t:0,seat:{x:.2,z:1.5},look:0,yaw:-Math.PI/2+.45,pitch:-.08,to:to,said:0};cabinExtras();
}
function cabinFrame(dt){var c=CAB;c.t+=dt;
  c.clouds.forEach(function(cl){cl.position.x+=dt*160;if(cl.position.x>900)cl.position.x-=1800;});c.ground.position.x=(c.ground.position.x+dt*60)%250;
  c.att.root.position.x=Math.min(12,-11+c.t*.7);c.cart.position.x=c.att.root.position.x+.8;animLite(c.att,dt,true,.4);
  // you sit by the window on the right; drag to look around, or press the button to lean into the window
  var px=c.seat.x,pz=c.seat.z;if(c.look){c.cam.position.set(px+.4,1.55,1.95);c.cam.lookAt(px+.4,1.42,6);}else{c.cam.position.set(px,1.45,pz);c.cam.lookAt(px+Math.sin(c.yaw)*Math.cos(c.pitch),1.45+Math.sin(c.pitch),pz+Math.cos(c.yaw)*Math.cos(c.pitch));}
  cabinTick2(dt);c.cam.aspect=W/H;c.cam.updateProjectionMatrix();
  c.wcam.position.set(0,0,0);c.wcam.lookAt(-.3,-.35,1);renderer.setRenderTarget(c.rt);renderer.render(c.sky,c.wcam);renderer.setRenderTarget(null);
  renderer.render(c.sc,c.cam);
  if(c.t>2&&c.said===0){c.said=1;captain('Ladies and gentlemen, welcome aboard Air Crema flight '+(10+c.to*7)+' to '+cityName(c.to)+'. Sit back and enjoy the view.');}
  if(c.t>10&&c.said===1){c.said=2;captain('The cart is coming down the aisle. WiFi is available for $8 if you need your phone.');}
  if(c.t>32&&c.said===2){c.said=3;captain('We\'re beginning our descent into '+cityName(c.to)+'. Please return to your seat.');}
}
function captain(t){var el=$('#o-cap');el.textContent=t;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(function(){el.hidden=true;},5200);try{tone(880,.2,'sine',.02);tone(660,.3,'sine',.02,.22);}catch(e){}}
