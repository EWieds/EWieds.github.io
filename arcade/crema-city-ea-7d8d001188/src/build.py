#!/usr/bin/env python3
"""Build Crema City (Crema Rush v4) from the Crema Rush v3 source plus the city module."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/claude/ewieds.github.io'
SRC = os.path.join(REPO, 'arcade/crema-rush/index.html')
OUT = os.path.join(REPO, 'arcade/crema-city-ea-7d8d001188/index.html')
PARTS = ['a_core.js', 'b_plan.js', 'c_world.js', 'd_lots.js', 'e_blocks.js', 'f_vehicles.js', 'g_life.js', 'h_ventures.js', 'i_interiors.js', 'j_player.js', 'k_phone.js', 'c2_shops.js', 'm_deals.js', 'o_talk.js', 'p_cabin.js', 'q_nav.js', 'r_geo.js', 's_air.js', 'v_homes.js', 't_say.js', 'w_ai.js', 'x_air.js', 'y_jobs.js', 'z_world2.js', 'z_life2.js', 'z_wave3.js', 'z_extras.js', 'z_more.js', 'z_mall.js', 'z_food.js', 'z_cinema.js', 'z_roast.js', 'z_bob.js', 'z_bank.js', 'z_fresh.js', 'z_law.js', 'z_mall2.js', 'z_fun.js', 'z_econ.js', 'z_steps.js', 'z_mp.js', 'z_metro.js', 'z_cabin2.js', 'z_gfx.js', 'l_main.js']

s = open(SRC).read()
def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        sys.exit('patch target found %d times (want %d): %r' % (n, count, a[:90]))
    s = s.replace(a, b)

rep('<title>Crema Rush | Lazer Arcade</title>', '<title>Crema City · Crema Rush v4 (early access) | Lazer Arcade</title>\n<meta name="robots" content="noindex,nofollow">')
css = open(os.path.join(HERE, 'ui.css')).read()
i = s.index('</style>'); s = s[:i] + css + s[i:]
rep('<button class="hb" id="bShop" type="button">Shop</button>',
    '<button class="hb out" id="bOut" type="button" aria-label="Go outside"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h9A1.5 1.5 0 0 1 17 4.5V21M3 21h18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="13.6" cy="12.5" r="1.3" fill="currentColor"/></svg><span>Outside</span></button>\n        <button class="hb" id="bShop" type="button">Shop</button>')
ui = open(os.path.join(HERE, 'ui.html')).read()
rep('<div id="modal" hidden></div>', ui + '<div id="modal" hidden></div>')

# ---- economy hooks
rep("function costRate(loc){return Math.max(.08,.3*(1-.06*holdLv(IND_HOLD[loc.ind]))*(1-.04*holdLv('logistics')));}",
    "function costRate(loc){return Math.max(.08,.3*(1-.06*holdLv(IND_HOLD[loc.ind]))*(1-.04*holdLv('logistics')))*(OUT?OUT.costMult(loc):1);}")
rep("G.stats.served++;var p=V3(c.pos.x,2.5,c.pos.z+.2);", "G.stats.served++;if(OUT)OUT.use(loc,c&&c.items?c.items.length:1);var p=V3(c.pos.x,2.5,c.pos.z+.2);") if s.count("G.stats.served++;var p=V3(c.pos.x,2.5,c.pos.z+.2);") else None
if 'OUT.use(' not in s:
    rep("  G.stats.served++;\n", "  G.stats.served++;if(OUT)OUT.use(loc,c&&c.items?c.items.length:1);\n")
rep("*TM(D.tier).dm*hxMult(loc);}", "*TM(D.tier).dm*hxMult(loc)*(OUT?OUT.demMult(loc):1);}")

# ---- customers come in through the street door and leave through it
rep("var c={id:SH.cid++,spot:si,courier:cr,x:p.x,z:p.z,pos:V3(side*(SH.L.rx-.4),0,-2.75),path:[V3(p.x+side*.25,0,-2.75),V3(p.x,0,p.z)],",
    "var dr=SH.L.door,c={id:SH.cid++,spot:si,courier:cr,x:p.x,z:p.z,pos:dr?V3(dr.x,0,dr.z+.3):V3(side*(SH.L.rx-.4),0,-2.75),path:dr?[V3(dr.x,0,-2.75),V3(p.x+.25,0,-2.75),V3(p.x,0,p.z)]:[V3(p.x+side*.25,0,-2.75),V3(p.x,0,p.z)],")
rep("  if(vip){SH.s.vip++;banner('Food critic'", "  if(OUT){OUT.custIn(SH.loc,c);OUT.inSwing();}\n  if(vip){SH.s.vip++;banner('Food critic'")
rep("c.path=[V3(c.x,0,-2.75),V3(side*(SH.L.rx-.3),0,-2.9)];", "c.path=SH.L.door?[V3(c.x,0,-2.75),V3(SH.L.door.x,0,-2.75),V3(SH.L.door.x,0,SH.L.door.z+.25)]:[V3(c.x,0,-2.75),V3(side*(SH.L.rx-.3),0,-2.9)];")
rep("c.path=SH.L.portrait?[V3(-(SH.L.rx-.3),0,c.pos.z)]:[V3(c.pos.x,0,-2.75),V3(-(SH.L.rx-.3),0,-2.9)];}}",
    "c.path=SH.L.door?[V3(c.pos.x,0,-2.75),V3(SH.L.door.x,0,-2.75),V3(SH.L.door.x,0,SH.L.door.z+.25)]:SH.L.portrait?[V3(-(SH.L.rx-.3),0,c.pos.z)]:[V3(c.pos.x,0,-2.75),V3(-(SH.L.rx-.3),0,-2.9)];}}")
rep("    else if(c.state==='out'&&!c.path.length){custG.remove(c.v.root);", "    else if(c.state==='out'&&!c.path.length){if(OUT){OUT.custOut(SH.loc,c);if(SH.L.door)OUT.inSwing();}custG.remove(c.v.root);")

# ---- the shop window shows the street; a real door to walk out of
rep("  plane(ww,wh,flat(0xffffff,{map:winTex(D.win)}),0,wy,zB+.08,envG);", "  if(OUT)OUT.winPlane(envG,ww,wh,wy,zB);else plane(ww,wh,flat(0xffffff,{map:winTex(D.win)}),0,wy,zB+.08,envG);")
rep("  var mg=new T.Group();mg.position.set(ww/2+.15+sw/2,2.6,zB+.05);envG.add(mg);", "  if(OUT)OUT.shopDoor(envG,L,loc,{zB:zB,ww:ww,sw:sw,hw:hw,th:th});\n  var mg=new T.Group();mg.position.set(ww/2+.15+sw/2,2.6,zB+.05);envG.add(mg);")
rep("function tapAt(x,y){\n  audioOn();", "function tapAt(x,y){\n  audioOn();if(OUT&&OUT.tapDoor(x,y))return;")

# ---- day reports wait for you if you're out; news reaches your phone; insurance; buyouts
rep("function showSummary(s){\n", "function showSummary(s){\n  if(OUT&&OUT.deferSum(s))return;\n")
rep("function news(text,kind,loc){G.news.unshift({t:now(),text:text,kind:kind||''});if(G.news.length>40)G.news.length=40;showNews(text,kind);}",
    "function news(text,kind,loc){G.news.unshift({t:now(),text:text,kind:kind||''});if(G.news.length>40)G.news.length=40;showNews(text,kind);if(OUT&&OUT.note)OUT.note(kind==='bad'?'Heads up':kind==='good'?'Good news':'News',text,kind==='bad'?'bad':kind==='good'?'good':'info');}")
rep("  var cn=loc.comp.name;\n", "  var cn=loc.comp.name;\n  if(OUT&&OUT.insured(loc)){news('Your insurance covered a dirty trick by '+cn+'.','good',loc);return;}\n")
rep("if(!loc.comp&&Math.random()<.012*(1+owned*.15))", "if(!loc.comp&&!(loc.cd&&loc.cd.nocomp>now())&&Math.random()<.012*(1+owned*.15))")

# ---- the loop
rep("  empTick(rdt);\n", "  empTick(rdt);\n  if(OUT&&OUT.frame(dt))return;\n")
rep("  previewShop();\n  showTitle(", "  previewShop();OUT.bind();\n  showTitle(")

# ---- the module itself
mod = '\n'.join(open(os.path.join(HERE, p)).read() for p in PARTS)
# city money: income earned by city-only ventures stays in the city (it never shows up in legacy v3);
# shop money flows both ways. Every cash change inside the city module goes through the ledger.
import re
mod = re.sub(r'G\.cash\+=([^;{}]+);', r'cityGain(\1);', mod)
mod = re.sub(r'G\.cash-=([^;{}]+);', r'citySpend(\1);', mod)
left = re.findall(r'G\.cash[-+]=', mod)
if left: print('note: untracked cash changes:', len(left))
rep("function save(){if(!G)return;G.ts=now();try{localStorage.setItem(SAVEKEY,JSON.stringify(G));}catch(e){}",
    "function save(){if(!G)return;G.ts=now();try{localStorage.setItem(SAVEKEY,JSON.stringify(G,function(k,v){return k==='cash'&&this===G&&G.w4&&G.w4.led?Math.max(0,Math.round((v-G.w4.led)*100)/100):v;}));}catch(e){}")
rep("  if(s.act>=s.locs.length)s.act=0;return s;}}catch(e){}return null;}",
    "  if(s.act>=s.locs.length)s.act=0;if(s.w4&&s.w4.led>0)s.cash+=s.w4.led;return s;}}catch(e){}return null;}")
rep("closeModal();if(!G.started){G.started=true;}startShift();", "closeModal();if(!G.started){G.started=true;}startShift();if(OUT&&OUT.firstRun)OUT.firstRun();")
rep("function cityName(n){return n<CITY_NAMES.length?CITY_NAMES[n]:'Metro '+(n+1);}", "function cityName(n){if(n===20)return 'Crema Metro';return n<CITY_NAMES.length?CITY_NAMES[n]:'Metro '+(n+1);}")
rep("function cityDistricts(n){\n  if(n===0)return DIST0;", "function cityDistricts(n){\n  if(n===0)return DIST0;\n  if(n===20)return CITYC[20]||(CITYC[20]=[['main','Metro Center'],['finance','The Exchange'],['campus','Metro University'],['board','Metro Beach'],['old','Historic Quarter'],['air','Metro International'],['gym','Riverside Park'],['night','Neon Row'],['harbor','Metro Harbor'],['main','Midtown'],['finance','Tech Park'],['old','Arts District'],['night','Little Saigon'],['board','Pier 9']].map(function(q,i){var t=DIST0.filter(function(d){return d.id===q[0];})[0];return Object.assign({},t,{id:'m'+i,name:q[1],lvl:Math.min(12,1+i),cost:Math.round(60000*(1+.35*i)),tier:2});}));")
rep("function TM(t){t=t||0;", "function TM(t){t=t||0;if(t===20)t=2;")
rep("/* ================= INIT ================= */", mod + "\n\n/* ================= INIT ================= */")
open(OUT, 'w').write(s)
open(os.path.join(HERE, 'main_check.js'), 'w').write(s[s.rindex('<script>') + 8:s.rindex('</script>')])
print('ok', len(s))
