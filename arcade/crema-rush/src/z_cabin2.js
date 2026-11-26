
/* ---------- a better flight: first class up front, seatback screens, a drink cart that stops at your row, turbulence, and WiFi for your phone ---------- */
function cabinExtras(){var c=CAB;if(!c)return;var sc=c.sc,w=W4();c.first=w.flyCls==='first';w.flyCls='';c.served=0;c.wifi=0;c.items=[];
  sc.children.filter(function(o){return o.type==='Group'&&o.position.x<-9.3;}).forEach(function(o){sc.remove(o);});
  if(c.first){c.seat={x:-11.9,z:1.2};c.yaw=Math.PI/2-.5;}
  // first-class cabin: four big leather seats behind a curtain
  for(var r=0;r<2;r++)[-1.2,1.2].forEach(function(z){var s=new T.Group();s.position.set(-12.2+r*2.6,0,z);sc.add(s);rb(1,.5,.95,.12,toon(0x6a3a28),0,.45,0,s);rb(.2,1.1,.95,.1,toon(0x6a3a28),-.45,1.05,0,s);rb(.4,.12,.25,.05,toon(0xd4af37),.1,.75,.5*Math.sign(z),s);});
  var cur=plane(3,2.6,toon(0x2a3a6a),-8.95,1.5,0,sc);cur.rotation.y=Math.PI/2;
  // seatback screens and row numbers
  for(var k=0;k<12;k++){var x=-13+k*2.2;if(x<-9)continue;[-1.55,-.95,.95,1.55].forEach(function(z){var scr=plane(.22,.16,toon(0x2f8fd0,{e:0x2f8fd0,ei:.8}),x+.27,1.25,z,sc);scr.rotation.y=-Math.PI/2;});
    [-1.6,1.6].forEach(function(z){var n=plane(.3,.16,flat(0xffffff,{map:signT(String(k+1),{bg:'#e8e4dc',fg:'#2a2a2a',w:64,h:32})}),x,2.82,z,sc);n.rotation.x=Math.PI/2.4;});}
  for(var e=0;e<2;e++){var ex=plane(.6,.22,toon(0x2fa860,{e:0x2fa860,ei:1}),[-6,8][e],2.4,0,sc);ex.rotation.y=Math.PI/2;}
  for(var l=-14;l<15;l+=1.4)bx(.6,.03,.05,toon(0xfff2c0,{e:0xffe0a0,ei:.9}),l,3.32,0,sc);
  // your tray table
  c.tray=bx(.42,.03,.32,toon(0x3a3f4b),c.seat.x+.45,.95,c.seat.z,sc);
  cabUI();}
function cabUI(){var el=$('#o-cabui');if(!el){el=document.createElement('div');el.id='o-cabui';document.body.appendChild(el);}el.hidden=false;var c=CAB;
  el.innerHTML='<button type="button" data-k="wifi">'+(c.wifi?'📶 WiFi on':'📶 WiFi · $8')+'</button><button type="button" data-k="ph">📱 Phone</button><button type="button" data-k="cart">🥤 Attendant</button>';
  el.querySelector('[data-k=wifi]').onclick=function(){if(c.wifi)return;if(!pay(8,'In-flight WiFi'))return;c.wifi=1;toast('Connected. Your phone works up here now.','good');cabUI();};
  el.querySelector('[data-k=ph]').onclick=function(){if(!c.wifi){popup('Airplane mode','No signal at 35,000 feet. Buy in-flight WiFi to use your phone.',[{t:'Buy WiFi · $8',fn:function(){if(!pay(8,'In-flight WiFi'))return;c.wifi=1;cabUI();openPhone();}},{t:'Never mind',cls:'sec'}]);return;}openPhone();};
  el.querySelector('[data-k=cart]').onclick=function(){drinkMenu(true);};}
function drinkMenu(called){var c=CAB;if(!c)return;var f=c.first,free=function(p){return f?0:p;};var items=[['Coffee',0,null],['Crema cold brew',free(6),'fast'],['Orange juice',free(4),null],['Snack box',free(9),'full'],['Champagne',free(18),'fame'],['Warm cookie',free(3),null]];
  popup(f?'First class service':'The drink cart','"'+(f?'Anything at all. It\'s on the house.':called?'You rang? What can I get you?':'Something to drink?')+'"',items.map(function(it){return {t:it[0]+(it[1]?' · $'+it[1]:' · free'),fn:function(){if(it[1]&&!pay(it[1],it[0]))return;serve(it[0],it[2]);}};}).concat([{t:'No thanks',cls:'sec'}]),'',{who:'Flight attendant',role:'Air Crema',col:'#2f8fd0'});}
function serve(n,perk){var c=CAB;if(!c)return;var col=/Coffee|cold brew/.test(n)?0x5a3018:/juice/.test(n)?0xff8a3d:/Champagne/.test(n)?0xffe38a:0xd8a45a;var cup=/Snack|cookie/.test(n)?bx(.16,.06,.12,toon(col),c.tray.position.x+(c.items.length*.1-.1),.99,c.tray.position.z,c.sc):cy(.04,.035,.12,toon(col),c.tray.position.x+(c.items.length*.1-.1),1.02,c.tray.position.z,c.sc,8);c.items.push(cup);
  var w=W4();w.buff=w.buff||{};if(perk==='fast')w.buff.fast=now()+180000;if(perk==='full')w.buff.full=now()+900000;if(perk==='fame')addFame(1);w.stats.flights=(w.stats.flights||0);try{tone(660,.08,'sine',.03);}catch(e){}captainSay(pick(['"Enjoy."','"There you go."','"Careful, it\'s hot."']));}
function captainSay(t){var el=$('#o-cap');el.textContent=t;el.hidden=false;clearTimeout(el._t);el._t=setTimeout(function(){el.hidden=true;},3000);}
function cabinTick2(dt){var c=CAB;if(!c||!c.tray)return;
  if(!c.served&&(Math.abs(c.cart.position.x-c.seat.x)<1.2||(c.first&&c.t>6))&&c.t>4&&!popOpen()){c.served=1;drinkMenu(false);}
  if(c.t>16&&c.t<20){var k=Math.sin(c.t*40)*.012;c.cam.position.y+=k;c.cam.rotation.z+=k*.4;if(!c.bump){c.bump=1;captain('Folks, we\'re heading through a little turbulence. Please keep your seatbelts fastened.');}}}
function cabinEnd(){var el=$('#o-cabui');if(el)el.hidden=true;var w=W4();w.stats.flights=(w.stats.flights||0)+1;}
function flyClass(f,go){var fc=Math.round(Math.max(f.cost,200)*3);popup(f.name,'Which seat?',[{t:'Economy · '+fmt(f.cost),s:'A window seat in the back. Drinks from the cart',fn:function(){go(f.cost,'eco');}},{t:'First class · '+fmt(fc),s:'Big leather seat up front, free drinks, champagne',fn:function(){go(fc,'first');}},{t:'Never mind',cls:'sec'}],'',{who:'Air Crema',role:'Ticketing',col:'#2f8fd0'});}
