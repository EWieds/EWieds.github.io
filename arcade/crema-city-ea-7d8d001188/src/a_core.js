/* ================= CREMA CITY: OUTSIDE (v4) =================
   One continuous world around your counter. A grid town with traffic lights, traffic and
   pedestrians; the people you see walking into your shop are the customers who appear at
   your counter. Phone, GPS, City Hall, a bank, a superstore, food trucks, leasing, an
   airport and other cities to fly to. Same toon look and people as the shop. */
var OUT=(function(){
var O={on:false,scene:null,cam:null,city:-1};
/* layout (meters) */
var RH=4.8,LANE=2.0,WALK=3.4,LOTW=10.2,LGAP=1.1,NL=4,BDEP=8.6;
var INW=NL*LOTW+(NL-1)*LGAP,BW=INW+2*WALK+1.2,BD=2*(WALK+BDEP)+.6,PX=BW+2*RH,PZ=BD+2*RH;
var DOORX=-3.6; // door position on a shopfront, in lot space (local +z faces the street)
/* state */
var keys={},joy={x:0,y:0},drag=null,lastDrag=0,yaw=0,pitch=.44,dist=9.5,curAct=null,curAlt=null,actKey='',altKey='';
var P={x:0,z:0,ry:0,area:'city',me:null,hand:null,phone:null,carry:[],moving:false,mvx:0,mvz:0,stuck:0};
var rtrucks=[],stat=null,plan=null,drv=null,veh=[],cols=[],roads=[],places=[],peds=[],walkers=[],cars=[],sites=[],shopV=[],zones=[],anim=[],doors=[],winMats=[],lampMats=[];
var curArea='city',AREAS={},ACTS={city:[]},dyn=null,lights={},NAV=null,CUT=null,RIDE=null,clockH=9,clockSrc='world',rain={on:false,t:0,next:200,k:0};
var POOL=[],LBL=[],lastT=0,frameN=0,fps={t:0,n:0,v:60};
function lowEnd(){return (W*H<700*700)||(typeof PF!=='undefined'&&PF.tier>0);}

/* ---------- save data (lives in the v3 save, so nothing resets) ---------- */
function W4(){
  G.w4=G.w4||{};var w=G.w4;
  w.stock=w.stock||{};w.land=w.land||{};w.builds=w.builds||[];w.trunk=w.trunk||[];w.tcap=w.tcap||6;w.cars=w.cars||{};
  if(w.car){delete w.car;} // positions from the one-street prototype don't map onto the grid
  Object.keys(w.land).forEach(function(k){var l=w.land[k];if(l.patio&&!l.use){l.use='patio';l.loc=l.patio;delete l.patio;}});
  w.civ=w.civ||{};w.tax=w.tax||{bills:[],auto:false,last:now(),paid:0,visited:false};w.bank=w.bank||{loan:0,sav:0,ins:false,visited:false};
  w.trucks=w.trucks||[];w.supers=w.supers||{};w.notes=w.notes||[];w.unread=w.unread||0;w.tickets=w.tickets||[];w.rent=w.rent||{};
  w.stats=w.stats||{trips:0,taxis:0,deliveries:0,flights:0};
  return w;
}
O.W4=W4;
function civ(c){var w=W4();c=c==null?O.city:c;var v=w.civ[c]=w.civ[c]||{permits:{},council:0,mayor:0,policy:'',polT:0};return v;}
function hasPermit(k,c){return !!civ(c).permits[k];}
function tierM(c){return TM(c==null?O.city:c).pm;}
function cityOfLot(key){return +String(key).split(':')[0];}

/* ---------- money, popups, notes ---------- */
function pay(c,what){c=Math.max(0,Math.round(c));if(G.cash>=c){G.cash-=c;try{sfx.buy();}catch(e){}save();return true;}
  var short=c-G.cash;try{sfx.bad();}catch(e){}
  popup('Not enough cash',what+' costs '+fmt(c)+'. You have '+fmt(G.cash)+', so you are '+fmt(short)+' short.',[
    {t:'Ask the bank for a loan',s:'Crema Savings & Loan · rates on your phone',fn:function(){openPhone('bank');}},{t:'OK',cls:'sec'}],'bad');
  return false;}
O.pay=pay;
var popQ=null;
function popup(title,text,btns,kind,opt){
  opt=opt||{};var el=$('#o-pop');el.hidden=false;popQ={btns:btns||[]};
  var who=opt.who?'<div class="pp-who"><i style="background:'+(opt.col||'#ffc63d')+'">'+esc(opt.who.charAt(0))+'</i><span>'+esc(opt.who)+(opt.role?'<small>'+esc(opt.role)+'</small>':'')+'</span></div>':'';
  el.innerHTML='<div class="pp-card '+(kind||'')+'"><button class="pp-x" type="button" aria-label="Close">✕</button>'+who+'<b class="pp-t">'+esc(title)+'</b>'+(text?'<p>'+esc(text).replace(/\n/g,'<br>')+'</p>':'')+
    (opt.html||'')+'<div class="pp-btns">'+(btns||[]).map(function(b,i){return '<button type="button" class="pp-b '+(b.cls||'')+(b.off?' off':'')+'" data-i="'+i+'"><b>'+esc(b.t)+'</b>'+(b.s?'<small>'+esc(b.s)+'</small>':'')+'</button>';}).join('')+'</div></div>';
  el.querySelector('.pp-x').onclick=closePop;
  el.querySelectorAll('.pp-b').forEach(function(b){b.onclick=function(){if(!popQ)return;var o=popQ.btns[+b.dataset.i];if(o.off){if(o.why)toast(o.why,'bad');try{sfx.nope();}catch(e){}return;}closePop();if(o.fn)o.fn();};});
  if(opt.after)opt.after(el);
}
function closePop(){var e=$('#o-pop');e.hidden=true;e.innerHTML='';popQ=null;}
O.popup=popup;
function popOpen(){return !$('#o-pop').hidden;}
var KIND_COL={good:'#2fa860',bad:'#e2553f',info:'#2f8fd0','':'#ffb83d',call:'#7a5ad8'};
function note(title,text,kind,go){
  var w=W4();w.notes.unshift({t:now(),title:title,text:text||'',kind:kind||''});if(w.notes.length>60)w.notes.length=60;w.unread=Math.min(99,(w.unread||0)+1);badge();
  if(!O.on)return;
  var box=$('#o-notes'),el=document.createElement('div');el.className='nt '+(kind||'');
  el.innerHTML='<i style="background:'+(KIND_COL[kind||'']||'#ffb83d')+'"></i><div><b>'+esc(title)+'</b>'+(text?'<span>'+esc(text)+'</span>':'')+(go?'<button type="button">'+esc(go.label)+'</button>':'')+'</div>';
  if(go)el.querySelector('button').onclick=function(e){e.stopPropagation();el.remove();go.fn();};
  el.onclick=function(){el.remove();};
  box.insertBefore(el,box.firstChild);while(box.children.length>3)box.removeChild(box.lastChild);
  setTimeout(function(){el.classList.add('out');setTimeout(function(){el.remove();},400);},go?9000:6000);
  if(kind==='bad'){try{sfx.nope();}catch(e){}}else{try{sfx.pick();}catch(e){}}
}
O.note=note;
function badge(){var b=$('#o-phb i');if(b){var n=W4().unread||0;b.textContent=n;b.hidden=!n;}}

/* ---------- small helpers ---------- */
function L2W(lot,lx,lz){var c=Math.cos(lot.ry),s=Math.sin(lot.ry);return {x:lot.x+lx*c+lz*s,z:lot.z-lx*s+lz*c};}
function W2L(lot,x,z){var dx=x-lot.x,dz=z-lot.z,c=Math.cos(lot.ry),s=Math.sin(lot.ry);return {x:dx*c-dz*s,z:dx*s+dz*c};}
function lotGroup(lot,par){var g=new T.Group();g.position.set(lot.x,0,lot.z);g.rotation.y=lot.ry;(par||stat).add(g);return g;}
function dynGroup(lot){var g=new T.Group();g.position.set(lot.x,0,lot.z);g.rotation.y=lot.ry;dyn.add(g);return g;}
function rectCol(lot,x0,x1,z0,z1,area){var a=L2W(lot,x0,z0),b=L2W(lot,x1,z1);var r={x0:Math.min(a.x,b.x),x1:Math.max(a.x,b.x),z0:Math.min(a.z,b.z),z1:Math.max(a.z,b.z),area:area||curArea};cols.push(r);return r;}
function addCol(x0,x1,z0,z1,area){var r={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),area:area||curArea};cols.push(r);return r;}
function angD(a,b){var d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
function hasMgr(loc){return (loc.staff.manager||0)>0;}
function shopOpen(loc){if(SH&&SH.loc===loc&&SH.phase!=='done')return SH.phase==='open'&&(!O.on||hasMgr(loc));return locEcon(loc).open;}
function bgShift(){return !!(SH&&SH.phase!=='done'&&O.on&&hasMgr(SH.loc));}
function mmssS(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
function plural(n,w){return n+' '+w+(n===1?'':'s');}
function clockStrH(h){h=((h%24)+24)%24;var hh=Math.floor(h),mm=Math.floor((h-hh)*60/5)*5;return ((hh+11)%12+1)+':'+('0'+mm).slice(-2)+(hh<12?' AM':' PM');}
function seeded(s){return mulberry(s|0);}

/* ---------- static geometry merge: hundreds of meshes become one draw per material ---------- */
var _v=new T.Vector3(),_n=new T.Vector3();
function niGeo(g){if(!g.index)return g;if(!g.userData.ni)g.userData.ni=g.toNonIndexed();return g.userData.ni;}
function mergeGroup(src){
  src.updateMatrixWorld(true);var inv=new T.Matrix4().copy(src.matrixWorld).invert(),by={},out=new T.Group();
  src.traverseVisible(function(o){if(!o.isMesh||o.isInstancedMesh)return;var k=o.material.uuid;(by[k]=by[k]||{m:o.material,l:[],n:0}).l.push(o);by[k].n+=niGeo(o.geometry).attributes.position.count;});
  Object.keys(by).forEach(function(k){var e=by[k],pos=new Float32Array(e.n*3),nor=new Float32Array(e.n*3),uv=new Float32Array(e.n*2),pi=0,ui=0;
    e.l.forEach(function(o){var g=niGeo(o.geometry),p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,mx=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld),nm=new T.Matrix3().getNormalMatrix(mx);
      for(var i=0;i<p.count;i++){_v.fromBufferAttribute(p,i).applyMatrix4(mx);pos[pi]=_v.x;pos[pi+1]=_v.y;pos[pi+2]=_v.z;
        if(n){_n.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();nor[pi]=_n.x;nor[pi+1]=_n.y;nor[pi+2]=_n.z;}
        pi+=3;if(u){uv[ui]=u.getX(i);uv[ui+1]=u.getY(i);}ui+=2;}});
    var bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(pos,3));bg.setAttribute('normal',new T.BufferAttribute(nor,3));bg.setAttribute('uv',new T.BufferAttribute(uv,2));bg.computeBoundingSphere();
    var m=new T.Mesh(bg,e.m);if(e.m===blobMat)m.renderOrder=1;out.add(m);});
  out.position.copy(src.position);out.rotation.copy(src.rotation);out.scale.copy(src.scale);
  return out;
}
/* plane with repeated UVs baked in (so differently sized walls can share one material) */
function planeR(w,h,ru,rv,m,x,y,z,p){return mk(geo('pr'+w+'_'+h+'_'+ru+'_'+rv,function(){var g=new T.PlaneGeometry(w,h),u=g.attributes.uv;for(var i=0;i<u.count;i++)u.setXY(i,u.getX(i)*ru,u.getY(i)*rv);return g;}),m,x,y,z,p);}
function prism(w,h,d,m,x,y,z,p){var o=mk(geo('pz'+w+'_'+h+'_'+d,function(){var s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.lineTo(-w/2,0);var g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);g.computeVertexNormals();return g;}),m,x,y,z,p);return o;}
