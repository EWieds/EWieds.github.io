
/* ---------- city plan: a grid of blocks, your district in the middle ---------- */
function mkPlan(city){
  var ds=cityDistricts(city),air=null,list=[];ds.forEach(function(D){if(!air&&D.win==='runway')air=D;else list.push(D);});
  var uni=list.some(function(D){return D.win==='campus';}),C=4,n=list.length+4+(uni?1:0),R=Math.max(3,Math.ceil(n/C)),slots=[];
  for(var r=0;r<R;r++)for(var c=0;c<C;c++)slots.push({c:c,r:r,d:Math.hypot(c-(C-1)/2,(r-(R-1)/2)*1.3)+c*.001+r*.0001});
  slots.sort(function(a,b){return a.d-b.d;});
  var order=[{t:'dist',D:list[0]},{t:'civic'},{t:'market'},{t:'park'}];
  list.slice(1).forEach(function(D){order.push({t:'dist',D:D});});order.push({t:'motors'});if(uni)order.push({t:'uni'});
  while(order.length<C*R)order.push({t:'homes'});
  var blocks=order.slice(0,C*R).map(function(o,i){var s=slots[i];return {t:o.t,D:o.D||null,c:s.c,r:s.r,x:s.c*PX,z:s.r*PZ,id:o.D?o.D.id:o.t+(o.t==='homes'?i:''),seed:city*131+i*17+7};});
  placeEdges({blocks:blocks,R:R});
  // the university sits right next to Campus Corner
  var cb=blocks.filter(function(q){return q.D&&q.D.win==='campus';})[0],ub=blocks.filter(function(q){return q.t==='uni';})[0];
  if(cb&&ub){var nb=blocks.filter(function(q){return q!==ub&&(q.t==='homes'||q.t==='motors'||(q.t==='dist'&&q!==blocks[0]&&q!==cb))&&Math.abs(q.c-cb.c)+Math.abs(q.r-cb.r)===1;}).sort(function(a,b){return (a.t==='homes'?0:a.t==='motors'?1:2)-(b.t==='homes'?0:b.t==='motors'?1:2);})[0];
    if(nb){['c','r','x','z'].forEach(function(k){var t=nb[k];nb[k]=ub[k];ub[k]=t;});}}
  var xs=[],zs=[];for(var i=0;i<=C;i++)xs.push((i-.5)*PX);for(var j=0;j<=R;j++)zs.push((j-.5)*PZ);
  var jm=Math.floor(R/2),AZ=zs[jm],CX=xs[C]+RH+34,AX=CX+30;
  var p={city:city,C:C,R:R,blocks:blocks,xs:xs,zs:zs,air:air,AX:AX,AZ:AZ,CX:CX,jm:jm,name:cityName(city)};
  var AV=['1st Ave','2nd Ave','3rd Ave','4th Ave','5th Ave','6th Ave'],SN=['North St','Oak St','Elm St','Cedar St','Harbor Rd','Bay St','Pine St','Lake St'],r0=seeded(city*13+3);SN.sort(function(){return r0()-.5;});
  p.vn=xs.map(function(_,i){return AV[i];});p.hn=zs.map(function(_,j){return SN[j];});var hb=blocks[0];p.hn[hb.r+1]='Main St';
  p.minX=xs[0]-44;p.maxX=AX-22;p.minZ=zs[0]-RH-34;p.maxZ=zs[R]+RH+24;
  return p;
}
function blockOf(t){for(var i=0;i<plan.blocks.length;i++)if(plan.blocks[i].t===t)return plan.blocks[i];return null;}
function blockAt(x,z){for(var i=0;i<plan.blocks.length;i++){var b=plan.blocks[i];if(Math.abs(x-b.x)<=BW/2&&Math.abs(z-b.z)<=BD/2)return b;}return null;}
function lotsOf(b){var out=[];[1,-1].forEach(function(s){for(var i=0;i<NL;i++){var x=b.x-INW/2+LOTW/2+i*(LOTW+LGAP);
  out.push({s:s,i:i,x:x,z:b.z+s*(BD/2-WALK),ry:s>0?0:Math.PI,b:b,w:LOTW,key:plan.city+':'+(b.D?b.D.id:b.id)+':'+s+':'+i});}});return out;}
function wideLot(b,s,i0,i1){var a=b.x-INW/2+LOTW/2+i0*(LOTW+LGAP),c=b.x-INW/2+LOTW/2+i1*(LOTW+LGAP);return {s:s,i:i0,x:(a+c)/2,z:b.z+s*(BD/2-WALK),ry:s>0?0:Math.PI,b:b,w:c-a+LOTW,key:plan.city+':'+b.id+':'+s+':'+i0+'-'+i1};}
function districtName(x,z){
  if(P.area!=='city')return AREAS[P.area]?AREAS[P.area].name:'';
  if(x>plan.xs[plan.C]+RH)return apName()+' Airport';
  var b=blockAt(x,z),best=null,bd=1e9;if(b)best=b;else plan.blocks.forEach(function(q){var d=Math.hypot(q.x-x,q.z-z);if(d<bd){bd=d;best=q;}});
  return best?blockName(best):plan.name;
}
function blockName(b){return b.D?b.D.name:{civic:'Civic Center',market:'Market Square',park:'Central Park',motors:'Motor Row',homes:'Residential',uni:plan.name+' University'}[b.t]||'';}

/* ---------- drivable surfaces ---------- */
function mkRoads(){
  var p=plan,R=[];
  p.xs.forEach(function(x){R.push({x0:x-RH,x1:x+RH,z0:p.zs[0]-RH,z1:p.zs[p.R]+RH});});
  p.zs.forEach(function(z){R.push({x0:p.xs[0]-RH,x1:p.xs[p.C]+RH,z0:z-RH,z1:z+RH});});
  R.push({x0:p.xs[p.C],x1:p.CX+RH,z0:p.AZ-RH,z1:p.AZ+RH,air:1});
  R.push({x0:p.CX-RH,x1:p.CX+RH,z0:p.AZ-48,z1:p.AZ+48,air:1});
  R.push({x0:p.CX-42,x1:p.CX-RH,z0:p.AZ-48,z1:p.AZ-9,air:1,lot:1});
  roads=R;
}
function onRoad(x,z,pad){pad=pad||0;for(var i=0;i<roads.length;i++){var r=roads[i];if(x>=r.x0+pad&&x<=r.x1-pad&&z>=r.z0+pad&&z<=r.z1-pad)return true;}return false;}
function onBlockSlab(x,z){var b=blockAt(x,z);return !!b;}

/* ---------- road graph + routing for GPS, taxis and crews ---------- */
var GR=null;
function mkGraph(){
  var p=plan,N={},E=[];
  function key(i,j){return i+','+j;}
  for(var i=0;i<=p.C;i++)for(var j=0;j<=p.R;j++)N[key(i,j)]={id:key(i,j),i:i,j:j,x:p.xs[i],z:p.zs[j],nb:[]};
  function link(a,b){N[a].nb.push(b);N[b].nb.push(a);E.push([a,b]);}
  for(i=0;i<=p.C;i++)for(j=0;j<=p.R;j++){if(i<p.C)link(key(i,j),key(i+1,j));if(j<p.R)link(key(i,j),key(i,j+1));}
  N.A={id:'A',x:p.CX,z:p.AZ,nb:[]};N.An={id:'An',x:p.CX,z:p.AZ-44,nb:[]};N.As={id:'As',x:p.CX,z:p.AZ+44,nb:[]};
  link(key(p.C,p.jm),'A');link('A','An');link('A','As');
  GR={N:N,E:E};
}
function projSeg(px,pz,a,b){var dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz,t=l2?clamp(((px-a.x)*dx+(pz-a.z)*dz)/l2,0,1):0;return {x:a.x+dx*t,z:a.z+dz*t,t:t,d:Math.hypot(px-a.x-dx*t,pz-a.z-dz*t)};}
function nearestEdge(x,z){var best=null;GR.E.forEach(function(e){var a=GR.N[e[0]],b=GR.N[e[1]],q=projSeg(x,z,a,b);if(!best||q.d<best.q.d)best={e:e,q:q};});return best;}
function route(from,to){
  var s=nearestEdge(from.x,from.z),t=nearestEdge(to.x,to.z);if(!s||!t)return [from,to];
  var pts=[{x:from.x,z:from.z}];
  if(s.e===t.e||(s.e[0]===t.e[0]&&s.e[1]===t.e[1])){pts.push({x:s.q.x,z:s.q.z},{x:t.q.x,z:t.q.z},{x:to.x,z:to.z});return pts;}
  var dist={},prev={},done={},Q=Object.keys(GR.N);Q.forEach(function(k){dist[k]=1e9;});
  var sa=GR.N[s.e[0]],sb=GR.N[s.e[1]];dist[sa.id]=Math.hypot(s.q.x-sa.x,s.q.z-sa.z);dist[sb.id]=Math.hypot(s.q.x-sb.x,s.q.z-sb.z);
  for(var it=0;it<Q.length;it++){var u=null;Q.forEach(function(k){if(!done[k]&&(u===null||dist[k]<dist[u]))u=k;});if(u===null||dist[u]>=1e9)break;done[u]=1;
    GR.N[u].nb.forEach(function(v){var a=GR.N[u],b=GR.N[v],d=dist[u]+Math.hypot(a.x-b.x,a.z-b.z);if(d<dist[v]){dist[v]=d;prev[v]=u;}});}
  var ta=GR.N[t.e[0]],tb=GR.N[t.e[1]],ea=dist[ta.id]+Math.hypot(t.q.x-ta.x,t.q.z-ta.z),eb=dist[tb.id]+Math.hypot(t.q.x-tb.x,t.q.z-tb.z),end=ea<=eb?ta.id:tb.id;
  var chain=[];for(var k=end;k!=null;k=prev[k])chain.unshift(k);
  pts.push({x:s.q.x,z:s.q.z});chain.forEach(function(k){pts.push({x:GR.N[k].x,z:GR.N[k].z});});pts.push({x:t.q.x,z:t.q.z},{x:to.x,z:to.z});
  // drop zero-length hops
  return pts.filter(function(q,i){return i===0||Math.hypot(q.x-pts[i-1].x,q.z-pts[i-1].z)>.3;});
}
function routeLen(pts){var l=0;for(var i=1;i<pts.length;i++)l+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);return l;}
/* walking routes keep to the sidewalk on your right */
function walkify(pts){
  if(pts.length<4)return pts;var off=RH+WALK*.5,out=[pts[0]];
  function nrm(a,b){var dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;return {x:-dz/l,z:dx/l};}
  for(var i=1;i<pts.length-1;i++){
    var n1=i>1?nrm(pts[i-1],pts[i]):null,n2=i<pts.length-2?nrm(pts[i],pts[i+1]):null;
    if(!n1||!n2){var nn=n1||n2;if(!nn){out.push(pts[i]);continue;}out.push({x:pts[i].x+nn.x*off,z:pts[i].z+nn.z*off});continue;}
    var mx=n1.x+n2.x,mz=n1.z+n2.z,ml=Math.hypot(mx,mz);
    if(ml<.2){out.push({x:pts[i].x+n1.x*off,z:pts[i].z+n1.z*off});continue;}
    mx/=ml;mz/=ml;var k=off/Math.max(.5,mx*n1.x+mz*n1.z);out.push({x:pts[i].x+mx*k,z:pts[i].z+mz*k});}
  out.push(pts[pts.length-1]);return out;
}

function streetAt(x,z){var p=plan,best=null,bd=1e9;p.xs.forEach(function(X,i){var d=Math.abs(x-X);if(d<bd&&z>p.zs[0]-RH-2&&z<p.zs[p.R]+RH+2){bd=d;best=p.vn[i];}});p.zs.forEach(function(Z,j){var d=Math.abs(z-Z);if(d<bd&&x>p.xs[0]-RH-2&&x<p.xs[p.C]+RH+2){bd=d;best=p.hn[j];}});
  if(x>p.xs[p.C]+RH)return 'Airport Rd';return bd<RH+WALK+9?best:null;}
function segStreet(a,b){var p=plan;if(Math.abs(a.z-b.z)<.5){var j=p.zs.indexOf(a.z);if(j<0)for(var k=0;k<p.zs.length;k++)if(Math.abs(p.zs[k]-a.z)<RH+3)j=k;return j>=0?p.hn[j]:'Airport Rd';}
  var i=-1;for(var k2=0;k2<p.xs.length;k2++)if(Math.abs(p.xs[k2]-a.x)<RH+3)i=k2;return i>=0?p.vn[i]:'Airport Rd';}
