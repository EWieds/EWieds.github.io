
/* ---------- high graphics: real sun shadows that follow you, a gradient sky with a sun and drifting clouds, filmic color ---------- */
var GFX={sky:null,clouds:[],on:false};
function gfxHigh(){var w=W4();if(w.gfx==null)return !lowEnd();return w.gfx==='high';}
function gfxSetup(){var hi=gfxHigh();GFX.on=hi;renderer.shadowMap.enabled=hi;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.NoToneMapping;
  var s=lights.sun;if(!s)return;s.castShadow=hi;if(hi){s.shadow.mapSize.set(2048,2048);var c=s.shadow.camera;c.left=-55;c.right=55;c.top=55;c.bottom=-55;c.near=1;c.far=220;c.updateProjectionMatrix();s.shadow.bias=-.0006;s.shadow.normalBias=.03;if(!s.target.parent)O.scene.add(s.target);}
  if(hi){O.scene.traverse(function(o){if(o.isMesh&&!o.isSprite){var m=o.material;var tr=m&&(m.transparent||m.isMeshBasicMaterial);o.receiveShadow=!tr;o.castShadow=!tr&&!(o.geometry&&o.geometry.type==='PlaneGeometry'&&o.rotation.x<-1);}});}
  if(GFX.sky&&GFX.sky.parent)GFX.sky.parent.remove(GFX.sky);GFX.sky=null;GFX.clouds.forEach(function(c){if(c.parent)c.parent.remove(c);});GFX.clouds=[];
  if(hi){var geo=new T.SphereGeometry(300,24,14),mat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new T.Color(0x4a90d8)},mid:{value:new T.Color(0x9fd2f2)},bot:{value:new T.Color(0xe8f2f8)},sun:{value:new T.Vector3(.3,.6,.4)},sunc:{value:new T.Color(0xfff2d0)}},
      vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform vec3 top;uniform vec3 mid;uniform vec3 bot;uniform vec3 sun;uniform vec3 sunc;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.0?mix(mid,top,smoothstep(0.0,0.6,h)):mix(mid,bot,smoothstep(0.0,-0.2,h));float s=max(dot(normalize(vP),normalize(sun)),0.0);c+=sunc*pow(s,180.0)*1.4+sunc*pow(s,8.0)*0.18;gl_FragColor=vec4(c,1.0);}'});
    GFX.sky=new T.Mesh(geo,mat);GFX.sky.renderOrder=-10;GFX.sky.frustumCulled=false;O.scene.add(GFX.sky);
    var ct=cloudTex?cloudTex():null;for(var i=0;i<26;i++){var cl=new T.Sprite(new T.SpriteMaterial({map:ct,transparent:true,depthWrite:false,opacity:.85,fog:false}));var sc2=rnd(50,140);cl.scale.set(sc2*2.2,sc2*.8,1);cl.userData.o=new T.Vector3(rnd(-260,260),rnd(110,170),rnd(-260,260));O.scene.add(cl);GFX.clouds.push(cl);}}}
function gfxTick(dt){if(!GFX.on||!lights.sun)return;var f=drv?drv.v.g.position:P.me?P.me.root.position:null;if(!f)return;var s=lights.sun,h=clockH,ang=(h-6)/12*Math.PI;
  var dx=Math.cos(ang)*-60,dy=Math.max(18,Math.sin(ang)*90),dz=35;s.position.set(f.x+dx,f.y+dy,f.z+dz);s.target.position.set(f.x,f.y,f.z);s.target.updateMatrixWorld();
  var inside=P.area!=='city';if(GFX.sky){GFX.sky.visible=!inside;GFX.sky.position.copy(O.cam.position);var day=h>=6.5&&h<18.5?1:h>=5.5&&h<6.5?h-5.5:h>=18.5&&h<19.5?19.5-h:0,dusk=Math.max(0,1-Math.abs(h-18.7)/1.3),u=GFX.sky.material.uniforms,wet=rain.k||0;
    u.top.value.setHex(0x0a1430).lerp(_tc.setHex(0x3a86d4),day).lerp(_tc.setHex(0x6a5a9a),dusk*.5).lerp(_tc.setHex(0x6a7888),wet*.7);u.mid.value.copy(O.scene.background&&O.scene.background.isColor?O.scene.background:u.mid.value);u.bot.value.copy(u.mid.value).lerp(_tc.setHex(0xffffff),.25*day);u.sun.value.set(-dx,dy,-dz).normalize();u.sunc.value.setHex(dusk>.3?0xffa860:0xfff2d0).multiplyScalar(day*(1-wet*.8)+.05);}
  GFX.clouds.forEach(function(c){c.visible=!inside;var o=c.userData.o;o.x+=dt*4;if(o.x>260)o.x-=520;c.position.set(O.cam.position.x+o.x,o.y,O.cam.position.z+o.z);c.material.opacity=(.35+.5*(h>=6&&h<19?1:.25))*(1-(rain.k||0)*.2);});
  GFX.dynT=(GFX.dynT||0)-dt;if(GFX.dynT<=0&&dyn){GFX.dynT=2;dyn.traverse(function(o){if(o.isMesh&&!o.castShadow&&!(o.material&&(o.material.transparent||o.material.isMeshBasicMaterial))){o.castShadow=true;o.receiveShadow=true;}});}
  s.castShadow=!inside||P.area==='mall'||P.area==='mall2'||P.area==='fun';}
var _tc=new T.Color();
function gfxToggle(){var w=W4();w.gfx=gfxHigh()?'std':'high';save();O.dirty=true;toast(w.gfx==='high'?'High graphics: shadows, sky and filmic color.':'Standard graphics: faster on older devices.','good');}
