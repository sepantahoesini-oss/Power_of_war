const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const esc=v=>String(v??"").trim();
const n=v=>Math.floor(Number(v));
const txCode=()=>{const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const p=()=>Array.from({length:4},()=>c[Math.floor(Math.random()*c.length)]).join("");return `${p()}-${p()}-${p()}`};
const aiRand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const CATALOG={
missiles:[
["موشک عادی","missiles_normal",10000],["موشک پیشرفته","missiles_advanced",25000],["موشک فوق پیشرفته","missiles_super",50000],["موشک سنگین","missiles_heavy",75000],["موشک سنگین پیشرفته","missiles_heavy_advanced",120000],["موشک دوربرد","missiles_long",180000],["موشک دوربرد پیشرفته","missiles_long_advanced",250000],["موشک بسیار دوربرد","missiles_very_long",400000],["موشک بسیار دوربرد پیشرفته","missiles_very_long_advanced",600000],["موشک ویژه","missiles_special",1000000]],
military:[
["سرباز عادی","military_normal",1000],["سرباز پیشرفته","military_advanced",2500],["سرباز ویژه","military_special",5000],["سرباز لجستیکی","military_logistics",7500],["سرباز سنگین","military_heavy",10000],["سرباز سنگین پیشرفته","military_heavy_advanced",15000],["فرمانده","commander",25000],["فرمانده پیشرفته","commander_advanced",50000],["فرمانده ویژه","commander_special",100000],["فرمانده کل","commander_general",250000]],
defense:[
["پدافند عادی","defense_normal",15000],["پدافند پیشرفته","defense_advanced",35000],["پدافند فوق پیشرفته","defense_super",75000],["پدافند کوتاه‌برد","defense_short",100000],["پدافند کوتاه‌برد پیشرفته","defense_short_advanced",175000],["پدافند میان‌برد","defense_medium",250000],["پدافند میان‌برد پیشرفته","defense_medium_advanced",400000],["پدافند دوربرد","defense_long",600000],["پدافند دوربرد پیشرفته","defense_long_advanced",1000000],["پدافند بسیار پیشرفته","defense_very_advanced",2000000]],
fighters:[
["جنگنده عادی","fighter_normal",5000000],["جنگنده پیشرفته","fighter_advanced",10000000],["جنگنده فوق پیشرفته","fighter_super",20000000],["جنگنده سبک","fighter_light",25000000],["جنگنده سبک پیشرفته","fighter_light_advanced",40000000],["جنگنده سنگین","fighter_heavy",60000000],["جنگنده سنگین پیشرفته","fighter_heavy_advanced",90000000],["جنگنده دوربرد","fighter_long",120000000],["جنگنده دوربرد پیشرفته","fighter_long_advanced",175000000],["جنگنده بسیار پیشرفته","fighter_very_advanced",250000000]],
bombers:[
["بمب‌افکن عادی","bomber_normal",30000000],["بمب‌افکن پیشرفته","bomber_advanced",60000000],["بمب‌افکن فوق پیشرفته","bomber_super",120000000],["بمب‌افکن سبک","bomber_light",150000000],["بمب‌افکن سبک پیشرفته","bomber_light_advanced",200000000],["بمب‌افکن سنگین","bomber_heavy",300000000],["بمب‌افکن سنگین پیشرفته","bomber_heavy_advanced",450000000],["بمب‌افکن دوربرد","bomber_long",600000000],["بمب‌افکن دوربرد پیشرفته","bomber_long_advanced",800000000],["بمب‌افکن بسیار پیشرفته","bomber_very_advanced",1000000000]],
ships:[
["ناو عادی","ship_normal",100000000],["ناو پیشرفته","ship_advanced",200000000],["ناو فوق پیشرفته","ship_super",400000000],["ناو سبک","ship_light",500000000],["ناو سبک پیشرفته","ship_light_advanced",750000000],["ناو سنگین","ship_heavy",1000000000],["ناو سنگین پیشرفته","ship_heavy_advanced",1500000000],["ناو دوربرد","ship_long",2000000000],["ناو دوربرد پیشرفته","ship_long_advanced",3000000000],["ناو بسیار پیشرفته","ship_very_advanced",5000000000]]
};
const INCOME=[
["مزرعه کوچک","income_small_farm",10000,500],["فروشگاه کوچک","income_small_shop",25000,1200],["کارگاه","income_workshop",50000,2500],["مزرعه بزرگ","income_large_farm",100000,5000],["فروشگاه بزرگ","income_large_shop",200000,10000],["کارخانه کوچک","income_small_factory",500000,25000],["کارخانه بزرگ","income_large_factory",1000000,60000],["شرکت تجاری","income_trade_company",2500000,150000],["شرکت بزرگ","income_large_company",5000000,300000],["مرکز تجاری","income_business_center",10000000,600000],["کارخانه پیشرفته","income_advanced_factory",25000000,1500000],["شرکت بسیار بزرگ","income_very_large_company",50000000,3000000],["مرکز صنعتی","income_industrial_center",100000000,6000000],["مرکز تجاری بزرگ","income_large_business_center",250000000,15000000],["مجموعه اقتصادی بزرگ","income_economic_group",500000000,30000000]
];
const META={};
for(const [g,items] of Object.entries(CATALOG))for(const [name,key,price] of items)META[key]={name,key,price,group:g,mode:g==="defense"?"defense":"war"};
for(const [name,key,price,daily] of INCOME)META[key]={name,key,price,daily,group:"income",mode:"income"};
const EQUIPMENT_KEYS=Object.keys(META).filter(k=>META[k].mode!=="income");
const WAR_KEYS=EQUIPMENT_KEYS.filter(k=>META[k].mode==="war");
const DEFENSE_KEYS=EQUIPMENT_KEYS.filter(k=>META[k].mode==="defense");

async function columns(env,t){const r=await env.DB.prepare(`PRAGMA table_info(${t})`).all();return new Set((r.results||[]).map(x=>x.name))}
async function ensureSchema(env){
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_settings(key TEXT PRIMARY KEY,value TEXT)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_players(id INTEGER PRIMARY KEY AUTOINCREMENT,user_code TEXT NOT NULL UNIQUE,country TEXT NOT NULL UNIQUE,dollars INTEGER NOT NULL DEFAULT 10000,oil INTEGER NOT NULL DEFAULT 0,income_daily INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_income_assets(id INTEGER PRIMARY KEY AUTOINCREMENT,player_id INTEGER NOT NULL,kind TEXT NOT NULL,qty INTEGER NOT NULL DEFAULT 0,UNIQUE(player_id,kind))").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_battles(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL UNIQUE,attacker_player_id INTEGER NOT NULL,defender_player_id INTEGER NOT NULL,mode TEXT NOT NULL,scenario TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,reviewed_at TEXT)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_battle_assets(id INTEGER PRIMARY KEY AUTOINCREMENT,battle_id INTEGER NOT NULL,asset_key TEXT NOT NULL,quantity INTEGER NOT NULL,UNIQUE(battle_id,asset_key))").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_transfers(id INTEGER PRIMARY KEY AUTOINCREMENT,tx_code TEXT NOT NULL UNIQUE,sender_player_id INTEGER NOT NULL,receiver_player_id INTEGER NOT NULL,kind TEXT NOT NULL,asset_key TEXT NOT NULL,quantity INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_transactions(id INTEGER PRIMARY KEY AUTOINCREMENT,tx_code TEXT NOT NULL,player_id INTEGER,user_code TEXT,type TEXT,description TEXT,amount INTEGER DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  const assetCols=Object.keys(META).map(k=>`${k} INTEGER NOT NULL DEFAULT 0`).join(",");
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS s8_assets(player_id INTEGER PRIMARY KEY,${assetCols})`).run();

  const pc=await columns(env,"s8_players");
  for(const [name,type] of [["is_ai","INTEGER NOT NULL DEFAULT 0"],["ai_active","INTEGER NOT NULL DEFAULT 0"],["ai_last_action_at","TEXT"],["ai_next_action_at","TEXT"],["ai_memory","TEXT NOT NULL DEFAULT '{}'"]]){
    if(!pc.has(name))await env.DB.prepare(`ALTER TABLE s8_players ADD COLUMN ${name} ${type}`).run();
  }
  const uc=await columns(env,"users");
  if(uc.size){
    if(!uc.has("blocked_until"))await env.DB.prepare("ALTER TABLE users ADD COLUMN blocked_until TEXT").run();
    if(!uc.has("block_type"))await env.DB.prepare("ALTER TABLE users ADD COLUMN block_type TEXT").run();
    if(!uc.has("wins")&&!uc.has("victories"))await env.DB.prepare("ALTER TABLE users ADD COLUMN wins INTEGER NOT NULL DEFAULT 0").run();
  }
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS s8_ai_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,player_id INTEGER NOT NULL,action_type TEXT NOT NULL,action_data TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_s8_ai_logs_player ON s8_ai_logs(player_id)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_s8_ai_logs_created ON s8_ai_logs(created_at)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_s8_players_ai ON s8_players(is_ai,ai_active)").run();
}
async function setting(env,k,d=null){const r=await env.DB.prepare("SELECT value FROM s8_settings WHERE key=?").bind(k).first();return r?.value??d}
async function setSetting(env,k,v){await env.DB.prepare("INSERT INTO s8_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(k,String(v)).run()}
function blocked(u){if(!u)return false;if(u.blocked_until==="permanent"||u.blocked_until==="season")return true;return u.blocked_until?new Date(u.blocked_until).getTime()>Date.now():false}
function winCol(c){return c.has("wins")?"wins":c.has("victories")?"victories":null}
async function user(env,code){const u=await env.DB.prepare("SELECT * FROM users WHERE code=?").bind(code).first();if(!u)return null;const c=await columns(env,"users"),w=winCol(c);return {...u,wins:w?Number(u[w]||0):0}}
async function player(env,code){return env.DB.prepare("SELECT sp.*,u.name,u.total_games,u.loyalty_date,u.blocked_until,u.block_type,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.user_code=?").bind(code).first()}
async function playerId(env,id){return env.DB.prepare("SELECT sp.*,u.name,u.total_games,u.loyalty_date,u.blocked_until,u.block_type,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.id=?").bind(id).first()}
async function playerCountry(env,c){return env.DB.prepare("SELECT sp.*,u.name,u.total_games,u.loyalty_date,u.blocked_until,u.block_type,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.country=?").bind(c).first()}
async function income(env,id){const r=await env.DB.prepare("SELECT kind,qty FROM s8_income_assets WHERE player_id=? AND qty>0").bind(id).all();let daily=0,assets={};for(const x of r.results||[]){assets[x.kind]=Number(x.qty);daily+=(META[x.kind]?.daily||0)*Number(x.qty)}return {daily,assets}}
async function pub(env,p){const i=await income(env,p.id),assets={};for(const k of EQUIPMENT_KEYS)assets[k]={name:META[k].name,qty:Number(p[k]||0),price:META[k].price};return {id:p.id,code:p.user_code,name:p.name,country:p.country,dollars:Number(p.dollars||0),oil:Number(p.oil||0),daily_income:i.daily,assets,income_assets:i.assets,loyalty_date:p.loyalty_date}}
async function auth(req,env){
  const code=esc(req.headers.get("x-user-code")).toUpperCase();
  if(!/^POW\d+$/.test(code))return {error:json({message:"کد کاربری نامعتبر است."},400)};
  const u=await user(env,code);if(!u)return {error:json({message:"این کد وجود ندارد"},404)};
  if(blocked(u))return {error:json({message:"حساب کاربری شما مسدود است."},403)};
  const p=await player(env,code);if(!p)return {error:json({message:"در بازی ثبت نام نشده اید"},403)};
  if(Number(p.is_ai||0)===1)return {error:json({message:"این کشور توسط هوش مصنوعی کنترل می‌شود."},403)};
  return {user:u,player:p}
}

function catalog(){return Object.fromEntries([...Object.entries(CATALOG).map(([g,a])=>[g,a.map(([name,key,price])=>({name,key,price}))]),["income",INCOME.map(([name,key,price,daily])=>({name,key,price,daily}))]])}

async function addIncome(env){
  const tz=await setting(env,"timezone","Asia/Tehran");
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hour12:false}).formatToParts(new Date());
  const get=k=>parts.find(x=>x.type===k)?.value,day=`${get("year")}-${get("month")}-${get("day")}`;
  if(Number(get("hour"))!==0)return;
  const claim=await env.DB.prepare("INSERT INTO s8_settings(key,value) VALUES('last_income_day',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE s8_settings.value<>excluded.value").bind(day).run();
  if(Number(claim.meta?.changes||0)!==1)return;
  const ps=await env.DB.prepare("SELECT id FROM s8_players WHERE active=1").all();
  for(const p of ps.results||[]){const i=await income(env,p.id);if(i.daily>0){await env.DB.prepare("UPDATE s8_players SET dollars=dollars+?,income_daily=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(i.daily,i.daily,p.id).run();await env.DB.prepare("INSERT INTO s8_transactions(tx_code,player_id,type,description,amount) VALUES(?,?,?,?,?)").bind(txCode(),p.id,"income","درآمد روزانه",i.daily).run()}}
}

function mem(p){try{const x=JSON.parse(p.ai_memory||"{}");return x&&typeof x==="object"?x:{}}catch{return {}}}
async function ailog(env,id,t,d){await env.DB.prepare("INSERT INTO s8_ai_logs(player_id,action_type,action_data) VALUES(?,?,?)").bind(id,t,JSON.stringify(d||{})).run()}
async function aisched(env,id,a=2,b=9){const next=new Date(Date.now()+aiRand(a*60000,b*60000)).toISOString();await env.DB.prepare("UPDATE s8_players SET ai_last_action_at=CURRENT_TIMESTAMP,ai_next_action_at=? WHERE id=? AND is_ai=1 AND ai_active=1").bind(next,id).run()}
async function aibuy(env,p,k,q){
  const m=META[k];q=Math.max(1,Math.floor(q));if(!m||!Number.isSafeInteger(q))return false;const total=m.price*q;
  const d=await env.DB.prepare("UPDATE s8_players SET dollars=dollars-?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND is_ai=1 AND ai_active=1 AND dollars>=?").bind(total,p.id,total).run();
  if(Number(d.meta?.changes||0)!==1)return false;
  try{
    if(m.mode==="income")await env.DB.prepare("INSERT INTO s8_income_assets(player_id,kind,qty) VALUES(?,?,?) ON CONFLICT(player_id,kind) DO UPDATE SET qty=qty+excluded.qty").bind(p.id,k,q).run();
    else await env.DB.prepare("UPDATE s8_assets SET "+k+"="+k+"+? WHERE player_id=?").bind(q,p.id).run();
    await env.DB.prepare("INSERT INTO s8_transactions(tx_code,player_id,user_code,type,description,amount) VALUES(?,?,?,?,?,?)").bind(txCode(),p.id,p.user_code,"ai_purchase","خرید خودکار "+m.name+" × "+q,total).run();
    await ailog(env,p.id,"purchase",{kind:k,qty:q,total});return true;
  }catch(e){await env.DB.prepare("UPDATE s8_players SET dollars=dollars+? WHERE id=?").bind(total,p.id).run();throw e}
}
function aiPick(p){
  const money=Number(p.dollars||0);if(money<10000)return null;const m=mem(p);
  if(Math.random()<(money>=100000?(Number(m.income_buys||0)<3?.38:.18):.08)){const a=INCOME.filter(x=>x[2]<=money*.35);if(a.length)return a[Math.floor(Math.random()*a.length)][1]}
  const a=EQUIPMENT_KEYS.filter(k=>META[k].price<=money*.45);if(!a.length)return null;return a[Math.floor(Math.random()*a.length)]
}
async function aiPurchase(env,p){const k=aiPick(p);if(!k)return false;const q=Math.max(1,Math.min(8,Math.floor((Number(p.dollars||0)*(.04+Math.random()*.18))/META[k].price)));return aibuy(env,p,k,q)}
async function aiBattle(env,p){
  const t=await env.DB.prepare("SELECT id,country FROM s8_players WHERE active=1 AND id<>? ORDER BY RANDOM() LIMIT 1").bind(p.id).first();if(!t)return false;
  const keys=WAR_KEYS.filter(k=>Number(p[k]||0)>0).sort(()=>Math.random()-.5).slice(0,aiRand(1,4));if(!keys.length)return false;
  const selected=keys.map(k=>[k,Math.max(1,Math.min(Number(p[k]),aiRand(1,Math.max(1,Math.ceil(Number(p[k])*.35)))))]),cond=selected.map(x=>x[0]+">=?").join(" AND "),upd=selected.map(x=>x[0]+"="+x[0]+"-?").join(",");
  const d=await env.DB.prepare("UPDATE s8_assets SET "+upd+" WHERE player_id=? AND "+cond).bind(...selected.map(x=>x[1]),p.id,...selected.map(x=>x[1])).run();if(Number(d.meta?.changes||0)!==1)return false;
  try{
    const b=await env.DB.prepare("INSERT INTO s8_battles(code,attacker_player_id,defender_player_id,mode,scenario) VALUES(?,?,?,?,?) RETURNING id").bind(txCode(),p.id,t.id,"war","").first();
    if(!b)throw new Error("ثبت نبرد هوش مصنوعی انجام نشد");
    await env.DB.batch(selected.map(x=>env.DB.prepare("INSERT INTO s8_battle_assets(battle_id,asset_key,quantity) VALUES(?,?,?)").bind(b.id,x[0],x[1])));
    await ailog(env,p.id,"battle",{target:t.country,battle_id:b.id,assets:selected});return true;
  }catch(e){await env.DB.batch(selected.map(x=>env.DB.prepare("UPDATE s8_assets SET "+x[0]+"="+x[0]+"+? WHERE player_id=?").bind(x[1],p.id)));throw e}
}
async function aiTick(env){
  const r=await env.DB.prepare("SELECT sp.*,u.name,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.active=1 AND sp.is_ai=1 AND sp.ai_active=1 AND (sp.ai_next_action_at IS NULL OR sp.ai_next_action_at<=CURRENT_TIMESTAMP) ORDER BY RANDOM() LIMIT 20").all();
  for(const p of r.results||[]){
    const next=new Date(Date.now()+aiRand(2*60000,9*60000)).toISOString();
    const claim=await env.DB.prepare("UPDATE s8_players SET ai_next_action_at=? WHERE id=? AND is_ai=1 AND ai_active=1 AND (ai_next_action_at IS NULL OR ai_next_action_at<=CURRENT_TIMESTAMP)").bind(next,p.id).run();
    if(Number(claim.meta?.changes||0)!==1)continue;
    try{
      const m=mem(p),roll=Math.random();let ok=false,type="observe";
      if(roll<.58){type="purchase";ok=await aiPurchase(env,p)}
      else if(roll<.84){type="battle";ok=await aiBattle(env,p)}
      else{await ailog(env,p.id,"observe",{});ok=true}
      m.actions=Number(m.actions||0)+1;m.last_action=type;m.last_success=ok;m.last_action_at=new Date().toISOString();
      if(type==="purchase")m.income_buys=Number(m.income_buys||0)+(ok&&META[aiPick(p)]?.mode==="income"?1:0);
      await env.DB.prepare("UPDATE s8_players SET ai_memory=? WHERE id=? AND is_ai=1").bind(JSON.stringify(m),p.id).run();await aisched(env,p.id)
    }catch(e){await ailog(env,p.id,"error",{message:String(e?.message||e)});await aisched(env,p.id,3,12)}
  }
}

async function adminToken(env){
  const e=Date.now()+43200000,b=btoa(String(e)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.ADMIN_PASSWORD),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const sig=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(b))))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
  return b+"."+sig
}
async function adminOK(req,env){
  if(!env.ADMIN_PASSWORD)return false;const h=req.headers.get("authorization")||"";if(!h.startsWith("Bearer "))return false;
  const [b,s]=h.slice(7).split(".");if(!b||!s)return false;let raw=b.replaceAll("-","+").replaceAll("_","/");raw+="=".repeat((4-raw.length%4)%4);
  let e=0;try{e=Number(atob(raw))}catch{return false}if(!Number.isFinite(e)||e<Date.now())return false;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.ADMIN_PASSWORD),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const x=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(b))))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
  return x===s
}

export default{
async scheduled(event,env,ctx){ctx.waitUntil((async()=>{await ensureSchema(env);await addIncome(env);await aiTick(env)})())},
async fetch(req,env){
  const u=new URL(req.url),p=u.pathname;
  try{
    await ensureSchema(env);

    if(p==="/api/catalog"&&req.method==="GET")return json(catalog());
    if(p==="/api/season/settings"&&req.method==="GET")return json({war_enabled:(await setting(env,"war_enabled","1"))==="1",bitcoin_price:Number(await setting(env,"bitcoin_price","120000"))});
    if(p==="/api/account"&&req.method==="GET"){const c=esc(u.searchParams.get("code")).toUpperCase(),x=await user(env,c);if(!x)return json({message:"این کد وجود ندارد"},404);if(blocked(x))return json({message:"حساب کاربری شما مسدود است."},403);return json({code:x.code,name:x.name,loyalty_date:x.loyalty_date,total_games:Number(x.total_games||0),wins:Number(x.wins||0)})}
    if(p==="/api/season/login"&&req.method==="POST"){const d=await req.json(),c=esc(d.code).toUpperCase(),x=await user(env,c);if(!x)return json({message:"این کد وجود ندارد"},404);if(blocked(x))return json({message:"حساب کاربری شما مسدود است."},403);const pl=await player(env,c);if(!pl)return json({message:"در بازی ثبت نام نشده اید"},403);if(Number(pl.is_ai||0)===1)return json({message:"این کشور توسط هوش مصنوعی کنترل می‌شود."},403);return json(await pub(env,pl))}
    if(p==="/api/season/me"&&req.method==="GET"){const a=await auth(req,env);if(a.error)return a.error;return json(await pub(env,a.player))}
    if(p==="/api/season/governments"&&req.method==="GET"){const r=await env.DB.prepare("SELECT sp.*,u.name,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.active=1 ORDER BY sp.dollars DESC").all();const o=[];for(const x of r.results||[])o.push(await pub(env,x));return json(o)}

    if(p==="/api/season/buy"&&req.method==="POST"){
      const a=await auth(req,env);if(a.error)return a.error;const d=await req.json(),k=esc(d.kind),q=n(d.quantity),m=META[k];if(!m||!Number.isSafeInteger(q)||q<1)return json({message:"اطلاعات خرید نامعتبر است."},400);const total=m.price*q;
      const x=await playerId(env,a.player.id);if(!x)return json({message:"بازیکن پیدا نشد."},404);const old=Number(x.dollars||0);if(old<total)return json({message:"موجودی کافی نیست"},400);
      const deb=await env.DB.prepare("UPDATE s8_players SET dollars=dollars-?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND dollars=? AND dollars>=?").bind(total,x.id,old,total).run();if(Number(deb.meta?.changes||0)!==1)return json({message:"موجودی در لحظه خرید تغییر کرد، دوباره تلاش کنید."},409);
      try{
        if(m.mode==="income")await env.DB.prepare("INSERT INTO s8_income_assets(player_id,kind,qty) VALUES(?,?,?) ON CONFLICT(player_id,kind) DO UPDATE SET qty=qty+excluded.qty").bind(x.id,k,q).run();
        else await env.DB.prepare("UPDATE s8_assets SET "+k+"="+k+"+? WHERE player_id=?").bind(q,x.id).run();
        await env.DB.prepare("INSERT INTO s8_transactions(tx_code,player_id,user_code,type,description,amount) VALUES(?,?,?,?,?,?)").bind(txCode(),x.id,x.user_code,"purchase","خرید "+m.name+" × "+q,total).run();return json({message:"پرداخت موفق"})
      }catch(e){await env.DB.prepare("UPDATE s8_players SET dollars=dollars+? WHERE id=?").bind(total,x.id).run();throw e}
    }

    if(p==="/api/season/buy-batch"&&req.method==="POST"){
      const a=await auth(req,env);if(a.error)return a.error;const d=await req.json(),items=Array.isArray(d.items)?d.items:[];if(!items.length)return json({message:"سبد خرید خالی است."},400);
      const list=[];let total=0;for(const z of items){const k=esc(z.kind||z.key),q=n(z.quantity),m=META[k];if(!m||!Number.isSafeInteger(q)||q<1)return json({message:"یکی از آیتم‌های خرید نامعتبر است."},400);total+=m.price*q;list.push({k,q,m,c:m.price*q})}
      const x=await playerId(env,a.player.id);if(!x)return json({message:"بازیکن پیدا نشد."},404);const old=Number(x.dollars||0);if(old<total)return json({message:"موجودی کافی نیست"},400);
      const stm=[env.DB.prepare("UPDATE s8_players SET dollars=dollars-?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND dollars=? AND dollars>=?").bind(total,x.id,old,total)];
      for(const z of list)stm.push(z.m.mode==="income"?env.DB.prepare("INSERT INTO s8_income_assets(player_id,kind,qty) VALUES(?,?,?) ON CONFLICT(player_id,kind) DO UPDATE SET qty=qty+excluded.qty").bind(x.id,z.k,z.q):env.DB.prepare("UPDATE s8_assets SET "+z.k+"="+z.k+"+? WHERE player_id=?").bind(z.q,x.id));
      const rs=await env.DB.batch(stm);if(Number(rs[0]?.meta?.changes||0)!==1)return json({message:"موجودی در لحظه خرید تغییر کرد، دوباره تلاش کنید."},409);
      for(const z of list)await env.DB.prepare("INSERT INTO s8_transactions(tx_code,player_id,user_code,type,description,amount) VALUES(?,?,?,?,?,?)").bind(txCode(),x.id,x.user_code,"purchase","خرید "+z.m.name+" × "+z.q,z.c).run();
      return json({message:"خریدها با موفقیت انجام شدند."})
    }

    if(p==="/api/season/transactions"&&req.method==="GET"){const a=await auth(req,env);if(a.error)return a.error;const r=await env.DB.prepare("SELECT tx_code,type,description,amount,created_at FROM s8_transactions WHERE player_id=? ORDER BY id DESC LIMIT 100").bind(a.player.id).all();return json(r.results||[])}

    if(p==="/api/season/transfer"&&req.method==="POST"){
      const a=await auth(req,env);if(a.error)return a.error;const d=await req.json(),rc=esc(d.to_code).toUpperCase(),country=esc(d.to_country),to=country?await playerCountry(env,country):await player(env,rc),k=esc(d.kind),q=n(d.quantity);if(!to)return json({message:"کشور مقصد پیدا نشد."},404);if(to.id===a.player.id)return json({message:"انتقال به خودتان امکان‌پذیر نیست."},400);if(!Number.isSafeInteger(q)||q<1)return json({message:"مقدار انتقال نامعتبر است."},400);if(k.startsWith("income_"))return json({message:"دارایی‌های درآمدزا قابل انتقال نیستند."},400);if(k!=="dollars"&&k!=="oil"&&!META[k])return json({message:"دارایی نامعتبر است."},400);
      const avail=k==="dollars"?Number(a.player.dollars):k==="oil"?Number(a.player.oil):Number(a.player[k]||0);if(avail<q)return json({message:"موجودی کافی نیست."},400);
      const day=new Date().toISOString().slice(0,10),cnt=await env.DB.prepare("SELECT COUNT(*) c FROM s8_transfers WHERE sender_player_id=? AND substr(created_at,1,10)=?").bind(a.player.id,day).first();if(Number(cnt?.c||0)>=3)return json({message:"سقف انتقال روزانه شما تکمیل شده است."},400);
      const s=k==="dollars"?"dollars":k==="oil"?"oil":k,stm=[];
      if(k==="dollars"||k==="oil")stm.push(env.DB.prepare("UPDATE s8_players SET "+s+"="+s+"-? WHERE id=? AND "+s+">=?").bind(q,a.player.id,q),env.DB.prepare("UPDATE s8_players SET "+s+"="+s+"+? WHERE id=?").bind(q,to.id));
      else stm.push(env.DB.prepare("UPDATE s8_assets SET "+s+"="+s+"-? WHERE player_id=? AND "+s+">=?").bind(q,a.player.id,q),env.DB.prepare("UPDATE s8_assets SET "+s+"="+s+"+? WHERE player_id=?").bind(q,to.id));
      stm.push(env.DB.prepare("INSERT INTO s8_transfers(tx_code,sender_player_id,receiver_player_id,kind,asset_key,quantity) VALUES(?,?,?,?,?,?)").bind(txCode(),a.player.id,to.id,k,k,q));
      const rs=await env.DB.batch(stm);if(Number(rs[0]?.meta?.changes||0)!==1)return json({message:"موجودی در لحظه انتقال تغییر کرده است، دوباره تلاش کنید."},409);return json({message:"انتقال با موفقیت انجام شد"})
    }

    if(p==="/api/season/battle"&&req.method==="POST"){
      const a=await auth(req,env);if(a.error)return a.error;if((await setting(env,"war_enabled","1"))!=="1")return json({message:"جنگ در حال حاضر غیرفعال است."},403);
      const d=await req.json(),mode=d.mode==="defense"?"defense":"war",scenario=esc(d.scenario);if(!scenario)return json({message:"سناریو را وارد کنید."},400);const def=d.to_country?await playerCountry(env,esc(d.to_country)):await player(env,esc(d.to_code).toUpperCase());if(!def||def.id===a.player.id)return json({message:"کشور حریف معتبر نیست."},400);
      const allowed=mode==="defense"?DEFENSE_KEYS:WAR_KEYS,sel=d.assets||{},clean=[];for(const [k,v] of Object.entries(sel)){const q=n(v);if(q>0){if(!allowed.includes(k)||Number(a.player[k]||0)<q)return json({message:"تجهیز انتخابی معتبر یا کافی نیست."},400);clean.push([k,q])}}if(!clean.length)return json({message:"حداقل یک تجهیز انتخاب کنید."},400);
      const cond=clean.map(x=>x[0]+">=?").join(" AND "),upd=clean.map(x=>x[0]+"="+x[0]+"-?").join(","),dec=await env.DB.prepare("UPDATE s8_assets SET "+upd+" WHERE player_id=? AND "+cond).bind(...clean.map(x=>x[1]),a.player.id,...clean.map(x=>x[1])).run();if(Number(dec.meta?.changes||0)!==1)return json({message:"تجهیزات در لحظه ثبت جنگ تغییر کرده‌اند."},409);
      try{const b=await env.DB.prepare("INSERT INTO s8_battles(code,attacker_player_id,defender_player_id,mode,scenario) VALUES(?,?,?,?,?) RETURNING id").bind(txCode(),a.player.id,def.id,mode,scenario).first();await env.DB.batch(clean.map(x=>env.DB.prepare("INSERT INTO s8_battle_assets(battle_id,asset_key,quantity) VALUES(?,?,?)").bind(b.id,x[0],x[1])));return json({message:"سناریو ارسال شد",code:b.code})}catch(e){await env.DB.batch(clean.map(x=>env.DB.prepare("UPDATE s8_assets SET "+x[0]+"="+x[0]+"+? WHERE player_id=?").bind(x[1],a.player.id)));throw e}
    }

    if(p==="/api/admin/login"&&req.method==="POST"){if(!env.ADMIN_PASSWORD)return json({message:"ADMIN_PASSWORD تنظیم نشده است."},500);const d=await req.json();if(d.password!==env.ADMIN_PASSWORD)return json({message:"رمز عبور اشتباه است."},401);return json({token:await adminToken(env)})}
    if(p.startsWith("/api/admin/")){if(!(await adminOK(req,env)))return json({message:"دسترسی غیرمجاز"},401)}

    if(p==="/api/admin/users"&&req.method==="GET"){const r=await env.DB.prepare("SELECT * FROM users ORDER BY id DESC").all();return json(r.results||[])}
    if(p==="/api/admin/users"&&req.method==="POST"){const d=await req.json(),code=esc(d.code).toUpperCase(),name=esc(d.name),total=n(d.total_games||0),wins=n(d.wins||0);if(!/^POW\d+$/.test(code)||!name||total<0||wins<0||wins>total)return json({message:"اطلاعات نامعتبر است."},400);try{const c=await columns(env,"users"),w=winCol(c);await env.DB.prepare(`INSERT INTO users(code,name,total_games${w?","+w:""}) VALUES(?,?,?${w?",?":""})`).bind(...[code,name,total].concat(w?[wins]:[])).run();return json({message:"کاربر اضافه شد"})}catch(e){return json({message:"خطا در ثبت کاربر: "+String(e)},409)}}

    if(p.startsWith("/api/admin/users/")&&req.method==="PUT"){
      const code=decodeURIComponent(p.split("/").pop()).toUpperCase(),d=await req.json();
      if(d.action==="block"){const type=d.type==="month"?"month":d.type==="season"?"season":"permanent",until=type==="permanent"?"permanent":type==="season"?"season":new Date(Date.now()+30*86400000).toISOString();await env.DB.prepare("UPDATE users SET block_type=?,blocked_until=? WHERE code=?").bind(type,until,code).run();return json({message:"کاربر مسدود شد"})}
      if(d.action==="unblock"){await env.DB.prepare("UPDATE users SET block_type=NULL,blocked_until=NULL WHERE code=?").bind(code).run();return json({message:"مسدودی برداشته شد"})}
      const c=await columns(env,"users"),w=winCol(c),sets=["name=?","total_games=?"],vals=[esc(d.name),n(d.total_games||0)];if(w){sets.push(w+"=?");vals.push(n(d.wins||0))}vals.push(code);await env.DB.prepare("UPDATE users SET "+sets.join(",")+" WHERE code=?").bind(...vals).run();return json({message:"ویرایش شد"})
    }
    if(p.startsWith("/api/admin/users/")&&req.method==="DELETE"){await env.DB.prepare("DELETE FROM users WHERE code=?").bind(decodeURIComponent(p.split("/").pop()).toUpperCase()).run();return json({message:"حذف شد"})}

    if(p==="/api/admin/players"&&req.method==="GET"){const r=await env.DB.prepare("SELECT sp.*,u.name,u.total_games,u.loyalty_date,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id ORDER BY sp.dollars DESC").all();return json(r.results||[])}
    if(p==="/api/admin/players"&&req.method==="POST"){
      const d=await req.json(),code=esc(d.user_code).toUpperCase(),country=esc(d.country),oil=n(d.oil||0),isAI=d.is_ai===true||d.is_ai===1||d.is_ai==="1";const u=await user(env,code);if(!u)return json({message:"کاربر وجود ندارد"},404);if(blocked(u))return json({message:"کاربر مسدود است"},400);if(await player(env,code))return json({message:"این کاربر قبلاً وارد سیزن شده است."},409);if(!country)return json({message:"کشور را وارد کنید."},400);if(await playerCountry(env,country))return json({message:"این کشور قبلاً انتخاب شده است."},409);
      const r=await env.DB.prepare("INSERT INTO s8_players(user_code,country,dollars,oil,is_ai,ai_active,ai_next_action_at) VALUES(?,?,?,?,?,?,?)").bind(code,country,10000,oil,isAI?1:0,isAI?1:0,isAI?new Date(Date.now()+aiRand(1,5)*60000).toISOString():null).run();const id=r.meta?.last_row_id||((await env.DB.prepare("SELECT id FROM s8_players WHERE user_code=?").bind(code).first()).id);await env.DB.prepare("INSERT INTO s8_assets(player_id) VALUES(?) ON CONFLICT(player_id) DO NOTHING").bind(id).run();return json({message:"بازیکن سیزن ۸ ثبت شد"})
    }
    if(p.startsWith("/api/admin/players/")&&req.method==="PUT"){
      const id=n(p.split("/").pop()),d=await req.json(),x=await playerId(env,id);if(!x)return json({message:"بازیکن پیدا نشد"},404);
      if(d.action==="ai"){const on=d.enabled===true||d.enabled===1||d.enabled==="1";await env.DB.prepare("UPDATE s8_players SET is_ai=?,ai_active=?,ai_next_action_at=? WHERE id=?").bind(on?1:0,on?1:0,on?new Date(Date.now()+aiRand(1,5)*60000).toISOString():null,id).run();return json({message:on?"هوش مصنوعی فعال شد.":"هوش مصنوعی غیرفعال شد.",is_ai:on?1:0})}
      if(d.action==="country"){const c=esc(d.country);if(!c)return json({message:"کشور نامعتبر است."},400);if(await env.DB.prepare("SELECT id FROM s8_players WHERE country=? AND id<>?").bind(c,id).first())return json({message:"این کشور در اختیار بازیکن دیگری است."},409);await env.DB.prepare("UPDATE s8_players SET country=?,dollars=10000,oil=0,income_daily=0,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(c,id).run();await env.DB.prepare("UPDATE s8_assets SET "+EQUIPMENT_KEYS.map(k=>k+"=0").join(",")+" WHERE player_id=?").bind(id).run();await env.DB.prepare("DELETE FROM s8_income_assets WHERE player_id=?").bind(id).run();return json({message:"کشور تغییر کرد؛ دارایی‌ها بازنشانی شدند."})}
      return json({message:"عملیات نامعتبر"},400)
    }
    if(p==="/api/admin/ai-tick"&&req.method==="POST"){await aiTick(env);return json({message:"چرخه هوش مصنوعی اجرا شد."})}
    if(p==="/api/admin/grant"&&req.method==="POST"){const d=await req.json(),id=n(d.player_id),k=esc(d.kind),q=n(d.quantity);if(q<1)return json({message:"مقدار نامعتبر است."},400);if(k==="dollars"||k==="oil")await env.DB.prepare("UPDATE s8_players SET "+k+"="+k+"+? WHERE id=?").bind(q,id).run();else if(META[k]?.mode==="income")await env.DB.prepare("INSERT INTO s8_income_assets(player_id,kind,qty) VALUES(?,?,?) ON CONFLICT(player_id,kind) DO UPDATE SET qty=qty+excluded.qty").bind(id,k,q).run();else if(META[k])await env.DB.prepare("UPDATE s8_assets SET "+k+"="+k+"+? WHERE player_id=?").bind(q,id).run();else return json({message:"دارایی نامعتبر است."},400);return json({message:"اعطا شد"})}
    if(p==="/api/admin/income"&&req.method==="GET"){const r=await env.DB.prepare("SELECT ia.player_id,ia.kind,ia.qty,sp.country,sp.user_code FROM s8_income_assets ia JOIN s8_players sp ON sp.id=ia.player_id WHERE ia.qty>0 ORDER BY sp.country").all();return json(r.results||[])}
    if(p==="/api/admin/transactions"&&req.method==="GET"){const r=await env.DB.prepare("SELECT t.*,sp.country FROM s8_transactions t LEFT JOIN s8_players sp ON sp.id=t.player_id ORDER BY t.id DESC LIMIT 500").all();return json(r.results||[])}
    if(p==="/api/admin/battles"&&req.method==="GET"){const r=await env.DB.prepare("SELECT b.*,a.country attacker_country,d.country defender_country FROM s8_battles b JOIN s8_players a ON a.id=b.attacker_player_id JOIN s8_players d ON d.id=b.defender_player_id WHERE b.status='pending' ORDER BY b.id ASC").all();const o=[];for(const b of r.results||[]){const x=await env.DB.prepare("SELECT asset_key,quantity FROM s8_battle_assets WHERE battle_id=?").bind(b.id).all();o.push({...b,assets:x.results||[]})}return json(o)}
    if(p.startsWith("/api/admin/battles/")&&req.method==="PUT"){const id=n(p.split("/").pop()),d=await req.json(),b=await env.DB.prepare("SELECT * FROM s8_battles WHERE id=? AND status='pending'").bind(id).first();if(!b)return json({message:"سناریو پیدا نشد یا قبلاً بررسی شده."},404);const rows=await env.DB.prepare("SELECT asset_key,quantity FROM s8_battle_assets WHERE battle_id=?").bind(id).all();await env.DB.prepare("UPDATE s8_battles SET status=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?").bind(d.approved?"approved":"rejected",id).run();if(!d.approved)for(const x of rows.results||[])await env.DB.prepare("UPDATE s8_assets SET "+x.asset_key+"="+x.asset_key+"+? WHERE player_id=?").bind(x.quantity,b.attacker_player_id).run();return json({message:d.approved?"سناریو تأیید و بسته شد.":"سناریو رد شد و تجهیزات برگشت."})}
    if(p==="/api/admin/war"&&req.method==="POST"){const d=await req.json();await setSetting(env,"war_enabled",d.enabled?"1":"0");return json({message:"تنظیم جنگ ثبت شد."})}
    if(p==="/api/admin/bitcoin"&&req.method==="POST"){const price=n((await req.json()).price);if(!Number.isSafeInteger(price)||price<1)return json({message:"قیمت نامعتبر است."},400);await setSetting(env,"bitcoin_price",price);return json({message:"قیمت بیت‌کوین ثبت شد."})}
    if(p==="/api/admin/test-state"&&req.method==="GET")return json({db:"OK",season:"8",war_enabled:(await setting(env,"war_enabled","1"))==="1",ai:true});
    return env.ASSETS.fetch(req)
  }catch(e){return json({message:"خطای سرور",detail:String(e?.message||e)},500)}
}
};
