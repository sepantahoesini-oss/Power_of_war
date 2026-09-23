const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const text=(data,status=200)=>new Response(data,{status,headers:{"content-type":"text/plain;charset=UTF-8"}});
const esc=v=>String(v??'').trim();
const n=v=>Math.floor(Number(v));

const CATALOG={
  missiles:[
    ['موشک عادی','missiles_normal',10000],['موشک پیشرفته','missiles_advanced',25000],['موشک فوق پیشرفته','missiles_super',50000],['موشک سنگین','missiles_heavy',75000],['موشک سنگین پیشرفته','missiles_heavy_advanced',120000],['موشک دوربرد','missiles_long',180000],['موشک دوربرد پیشرفته','missiles_long_advanced',250000],['موشک بسیار دوربرد','missiles_very_long',400000],['موشک بسیار دوربرد پیشرفته','missiles_very_long_advanced',600000],['موشک ویژه','missiles_special',1000000]
  ],
  military:[
    ['سرباز عادی','military_normal',1000],['سرباز پیشرفته','military_advanced',2500],['سرباز ویژه','military_special',5000],['سرباز لجستیکی','military_logistics',7500],['سرباز سنگین','military_heavy',10000],['سرباز سنگین پیشرفته','military_heavy_advanced',15000],['فرمانده','commander',25000],['فرمانده پیشرفته','commander_advanced',50000],['فرمانده ویژه','commander_special',100000],['فرمانده کل','commander_general',250000]
  ],
  defense:[
    ['پدافند عادی','defense_normal',15000],['پدافند پیشرفته','defense_advanced',35000],['پدافند فوق پیشرفته','defense_super',75000],['پدافند کوتاه‌برد','defense_short',100000],['پدافند کوتاه‌برد پیشرفته','defense_short_advanced',175000],['پدافند میان‌برد','defense_medium',250000],['پدافند میان‌برد پیشرفته','defense_medium_advanced',400000],['پدافند دوربرد','defense_long',600000],['پدافند دوربرد پیشرفته','defense_long_advanced',1000000],['پدافند بسیار پیشرفته','defense_very_advanced',2000000]
  ],
  fighters:[
    ['جنگنده عادی','fighter_normal',5000000],['جنگنده پیشرفته','fighter_advanced',10000000],['جنگنده فوق پیشرفته','fighter_super',20000000],['جنگنده سبک','fighter_light',25000000],['جنگنده سبک پیشرفته','fighter_light_advanced',40000000],['جنگنده سنگین','fighter_heavy',60000000],['جنگنده سنگین پیشرفته','fighter_heavy_advanced',90000000],['جنگنده دوربرد','fighter_long',120000000],['جنگنده دوربرد پیشرفته','fighter_long_advanced',175000000],['جنگنده بسیار پیشرفته','fighter_very_advanced',250000000]
  ],
  bombers:[
    ['بمب‌افکن عادی','bomber_normal',30000000],['بمب‌افکن پیشرفته','bomber_advanced',60000000],['بمب‌افکن فوق پیشرفته','bomber_super',120000000],['بمب‌افکن سبک','bomber_light',150000000],['بمب‌افکن سبک پیشرفته','bomber_light_advanced',200000000],['بمب‌افکن سنگین','bomber_heavy',300000000],['بمب‌افکن سنگین پیشرفته','bomber_heavy_advanced',450000000],['بمب‌افکن دوربرد','bomber_long',600000000],['بمب‌افکن دوربرد پیشرفته','bomber_long_advanced',800000000],['بمب‌افکن بسیار پیشرفته','bomber_very_advanced',1000000000]
  ],
  ships:[
    ['ناو عادی','ship_normal',100000000],['ناو پیشرفته','ship_advanced',200000000],['ناو فوق پیشرفته','ship_super',400000000],['ناو سبک','ship_light',500000000],['ناو سبک پیشرفته','ship_light_advanced',750000000],['ناو سنگین','ship_heavy',1000000000],['ناو سنگین پیشرفته','ship_heavy_advanced',1500000000],['ناو دوربرد','ship_long',2000000000],['ناو دوربرد پیشرفته','ship_long_advanced',3000000000],['ناو بسیار پیشرفته','ship_very_advanced',5000000000]
  ]
};

const INCOME=[
  ['مزرعه کوچک','income_small_farm',10000,500],['فروشگاه کوچک','income_small_shop',25000,1200],['کارگاه','income_workshop',50000,2500],['مزرعه بزرگ','income_large_farm',100000,5000],['فروشگاه بزرگ','income_large_shop',200000,10000],['کارخانه کوچک','income_small_factory',500000,25000],['کارخانه بزرگ','income_large_factory',1000000,60000],['شرکت تجاری','income_trade_company',2500000,150000],['شرکت بزرگ','income_large_company',5000000,300000],['مرکز تجاری','income_business_center',10000000,600000],['کارخانه پیشرفته','income_advanced_factory',25000000,1500000],['شرکت بسیار بزرگ','income_very_large_company',50000000,3000000],['مرکز صنعتی','income_industrial_center',100000000,6000000],['مرکز تجاری بزرگ','income_large_business_center',250000000,15000000],['مجموعه اقتصادی بزرگ','income_economic_group',500000000,30000000]
];

const ASSET_META={};
for(const [group,items] of Object.entries(CATALOG)) for(const [name,key,price] of items) ASSET_META[key]={name,key,price,group,mode:group==='defense'?'defense':'war'};
for(const [name,key,price,daily] of INCOME) ASSET_META[key]={name,key,price,daily,group:'income',mode:'income'};
const EQUIPMENT_KEYS=Object.keys(ASSET_META).filter(k=>ASSET_META[k].mode!=='income');
const WAR_KEYS=EQUIPMENT_KEYS.filter(k=>ASSET_META[k].mode==='war');
const DEFENSE_KEYS=Object.keys(ASSET_META).filter(k=>ASSET_META[k].mode==='defense');

const txCode=()=>{
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part=()=>Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  return `${part()}-${part()}-${part()}`;
};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function b64url(bytes){
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
}
async function hmac(secret,data){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return b64url(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(data)));
}
async function makeToken(env){
  const exp=Date.now()+12*60*60*1000;
  const body=b64url(new TextEncoder().encode(String(exp)));
  return `${body}.${await hmac(env.ADMIN_PASSWORD,body)}`;
}
async function adminOK(req,env){
  if(!env.ADMIN_PASSWORD)return false;
  const header=req.headers.get('authorization')||'';
  if(!header.startsWith('Bearer '))return false;
  const [body,sig]=header.slice(7).split('.');
  if(!body||!sig)return false;
  let exp;
  try{
    let raw=body.replaceAll('-','+').replaceAll('_','/');
    raw+= '='.repeat((4-raw.length%4)%4);
    exp=Number(new TextDecoder().decode(Uint8Array.from(atob(raw),c=>c.charCodeAt(0))));
  }catch{return false;}
  if(!Number.isFinite(exp)||exp<Date.now())return false;
  return (await hmac(env.ADMIN_PASSWORD,body))===sig;
}

async function tableColumns(env,table){
  const r=await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  return new Set((r.results||[]).map(x=>x.name));
}
async function userColumns(env){return tableColumns(env,'users');}

function userWinsColumn(cols){return cols.has('wins')?'wins':cols.has('victories')?'victories':null;}
function userBlockColumn(cols){return cols.has('block_type')?'block_type':cols.has('blocked_type')?'blocked_type':null;}

async function getUser(env,code){
  const u=await env.DB.prepare('SELECT * FROM users WHERE code=?').bind(code).first();
  if(!u)return null;
  const cols=await userColumns(env);
  const wc=userWinsColumn(cols);
  const bc=userBlockColumn(cols);
  return {
    ...u,
    wins:wc?Number(u[wc]||0):0,
    block_type:bc?u[bc]:null
  };
}

async function listUsers(env){
  const rows=await env.DB.prepare('SELECT * FROM users ORDER BY id DESC').all();
  const cols=await userColumns(env),wc=userWinsColumn(cols),bc=userBlockColumn(cols);
  return (rows.results||[]).map(u=>({...u,wins:wc?Number(u[wc]||0):0,block_type:bc?u[bc]:null}));
}

async function insertUser(env,d){
  const cols=await userColumns(env);
  const fields=['code','name','total_games'];
  const vals=[esc(d.code).toUpperCase(),esc(d.name),n(d.total_games||0)];
  const wc=userWinsColumn(cols);
  if(wc){fields.push(wc);vals.push(n(d.wins||0));}
  const placeholders=fields.map(()=>'?').join(',');
  await env.DB.prepare(`INSERT INTO users(${fields.join(',')}) VALUES(${placeholders})`).bind(...vals).run();
}

async function updateUser(env,code,d){
  const cols=await userColumns(env);
  const sets=[],vals=[];
  if(cols.has('name')){sets.push('name=?');vals.push(esc(d.name));}
  if(cols.has('total_games')){sets.push('total_games=?');vals.push(n(d.total_games||0));}
  const wc=userWinsColumn(cols);
  if(wc){sets.push(`${wc}=?`);vals.push(n(d.wins||0));}
  if(!sets.length)return;
  vals.push(code);
  await env.DB.prepare(`UPDATE users SET ${sets.join(',')} WHERE code=?`).bind(...vals).run();
}

async function setBlock(env,code,type){
  const cols=await userColumns(env);
  const bc=userBlockColumn(cols);
  if(!bc)throw new Error('ستون وضعیت مسدودی در users وجود ندارد');
  let until='permanent';
  if(type==='month')until=new Date(Date.now()+30*86400000).toISOString();
  else if(type==='season')until='season';
  await env.DB.prepare(`UPDATE users SET ${bc}=?,blocked_until=? WHERE code=?`).bind(type,until,code).run();
}
async function unblock(env,code){
  const cols=await userColumns(env),bc=userBlockColumn(cols);
  if(!bc)throw new Error('ستون وضعیت مسدودی در users وجود ندارد');
  const value=bc==='blocked_type'?'none':null; await env.DB.prepare(`UPDATE users SET ${bc}=?,blocked_until=NULL WHERE code=?`).bind(value,code).run();
}

function isBlocked(u){
  if(!u)return false;
  if(u.blocked_until==='permanent')return true;
  if(u.blocked_until==='season')return true;
  if(u.blocked_until)return new Date(u.blocked_until).getTime()>Date.now();
  return false;
}

async function playerJoinColumns(env){
  const cols=await userColumns(env);
  const block=cols.has('block_type')?'u.block_type AS block_type':cols.has('blocked_type')?'u.blocked_type AS block_type':'NULL AS block_type';
  const loyalty=cols.has('loyalty_date')?'u.loyalty_date':'NULL AS loyalty_date';
  return `u.name,u.total_games,${loyalty},u.blocked_until,${block}`;
}
async function getPlayerByCode(env,code){
  const uc=await playerJoinColumns(env);
  return env.DB.prepare(`SELECT sp.*,${uc},a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.user_code=?`).bind(code).first();
}
async function getPlayerById(env,id){
  const uc=await playerJoinColumns(env);
  return env.DB.prepare(`SELECT sp.*,${uc},a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.id=?`).bind(id).first();
}
async function getPlayerByCountry(env,country){
  const uc=await playerJoinColumns(env);
  return env.DB.prepare(`SELECT sp.*,${uc},a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.country=?`).bind(country).first();
}

async function authPlayer(req,env){
  const code=esc(req.headers.get('x-user-code')).toUpperCase();
  if(!/^POW\d+$/.test(code))return {error:json({message:'کد کاربری نامعتبر است.'},400)};
  const user=await getUser(env,code);
  if(!user)return {error:json({message:'این کد وجود ندارد'},404)};
  if(isBlocked(user))return {error:json({message:'حساب کاربری شما مسدود است.'},403)};
  const player=await getPlayerByCode(env,code);
  if(!player)return {error:json({message:'در بازی ثبت نام نشده اید'},403)};
  return {user,player};
}

function publicAssets(p){
  const assets={};
  for(const key of EQUIPMENT_KEYS){
    const m=ASSET_META[key];
    assets[key]={name:m.name,qty:Number(p[key]||0),price:m.price};
  }
  return assets;
}
async function incomeForPlayer(env,playerId){
  const r=await env.DB.prepare('SELECT kind,qty FROM s8_income_assets WHERE player_id=? AND qty>0').bind(playerId).all();
  let daily=0;
  const income_assets={};
  for(const x of r.results||[]){
    income_assets[x.kind]=Number(x.qty);
    daily+=(ASSET_META[x.kind]?.daily||0)*Number(x.qty);
  }
  return {daily,income_assets};
}
async function publicPlayer(env,p){
  const inc=await incomeForPlayer(env,p.id);
  return {
    id:p.id,code:p.user_code,name:p.name,country:p.country,dollars:Number(p.dollars||0),oil:Number(p.oil||0),daily_income:inc.daily,
    assets:publicAssets(p),income_assets:inc.income_assets,loyalty_date:p.loyalty_date
  };
}

function catalogResponse(){
  return {
    missiles:CATALOG.missiles.map(([name,key,price])=>({name,key,price})),
    military:CATALOG.military.map(([name,key,price])=>({name,key,price})),
    defense:CATALOG.defense.map(([name,key,price])=>({name,key,price})),
    fighters:CATALOG.fighters.map(([name,key,price])=>({name,key,price})),
    bombers:CATALOG.bombers.map(([name,key,price])=>({name,key,price})),
    ships:CATALOG.ships.map(([name,key,price])=>({name,key,price})),
    income:INCOME.map(([name,key,price,daily])=>({name,key,price,daily}))
  };
}

async function setting(env,key,def=null){
  const r=await env.DB.prepare('SELECT value FROM s8_settings WHERE key=?').bind(key).first();
  return r?.value??def;
}
async function setSetting(env,key,value){
  await env.DB.prepare(`INSERT INTO s8_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(key,String(value)).run();
}

async function addIncome(env){
  const tz=await setting(env,'timezone','Asia/Tehran');
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hour12:false}).formatToParts(new Date());
  const get=k=>parts.find(x=>x.type===k)?.value;
  const day=`${get('year')}-${get('month')}-${get('day')}`;
  if(Number(get('hour'))!==0)return;
  if(await setting(env,'last_income_day','')===day)return;
  const players=await env.DB.prepare('SELECT id FROM s8_players WHERE active=1').all();
  for(const p of players.results||[]){
    const inc=await incomeForPlayer(env,p.id);
    if(inc.daily>0){
      await env.DB.prepare('UPDATE s8_players SET dollars=dollars+?,income_daily=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(inc.daily,inc.daily,p.id).run();
      await env.DB.prepare('INSERT INTO s8_transactions(tx_code,player_id,type,description,amount) VALUES(?,?,?,?,?)').bind(txCode(),p.id,'income','درآمد روزانه',inc.daily).run();
    }
  }
  await setSetting(env,'last_income_day',day);
}

async function countries(env){
  const r=await env.DB.prepare('SELECT id,country FROM s8_players WHERE active=1 ORDER BY country').all();
  return r.results||[];
}

export default {
  async scheduled(event,env,ctx){ctx.waitUntil(addIncome(env));},
  async fetch(req,env){
    const url=new URL(req.url),path=url.pathname;
    try{
      if(path==='/api/catalog'&&req.method==='GET')return json(catalogResponse());

      if(path==='/api/season/settings'&&req.method==='GET'){
        return json({war_enabled:(await setting(env,'war_enabled','1'))==='1',bitcoin_price:Number(await setting(env,'bitcoin_price','120000'))});
      }

      if(path==='/api/season/governments'&&req.method==='GET'){
        const r=await env.DB.prepare(`SELECT sp.*,u.name,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id WHERE sp.active=1 ORDER BY sp.dollars DESC`).all();
        const out=[];
        for(const p of r.results||[])out.push(await publicPlayer(env,p));
        return json(out);
      }

      if(path==='/api/account'&&req.method==='GET'){
        const code=esc(url.searchParams.get('code')).toUpperCase();
        const user=await getUser(env,code);
        if(!user)return json({message:'این کد وجود ندارد'},404);
        if(isBlocked(user))return json({message:'حساب کاربری شما مسدود است.'},403);
        return json({code:user.code,name:user.name,loyalty_date:user.loyalty_date,total_games:Number(user.total_games||0),wins:Number(user.wins||0)});
      }

      if(path==='/api/season/login'&&req.method==='POST'){
        const d=await req.json(),code=esc(d.code).toUpperCase();
        const user=await getUser(env,code);
        if(!user)return json({message:'این کد وجود ندارد'},404);
        if(isBlocked(user))return json({message:'حساب کاربری شما مسدود است.'},403);
        const p=await getPlayerByCode(env,code);
        if(!p)return json({message:'در بازی ثبت نام نشده اید'},403);
        return json(await publicPlayer(env,p));
      }

      if(path==='/api/season/me'&&req.method==='GET'){
        const a=await authPlayer(req,env);if(a.error)return a.error;
        return json(await publicPlayer(env,a.player));
      }

      if(path==='/api/season/buy'&&req.method==='POST'){
        const a=await authPlayer(req,env);if(a.error)return a.error;
        const d=await req.json(),kind=esc(d.kind),qty=n(d.quantity);
        const meta=ASSET_META[kind];
        if(!meta||!Number.isSafeInteger(qty)||qty<1)return json({message:'اطلاعات خرید نامعتبر است.'},400);
        const total=meta.price*qty;
        if(!Number.isSafeInteger(total))return json({message:'مبلغ خرید نامعتبر است.'},400);
        const p=await getPlayerById(env,a.player.id);
        if(Number(p.dollars)<total)return json({message:'موجودی کافی نیست'},400);
        const code=txCode();
        if(meta.mode==='income'){
          await env.DB.batch([
            env.DB.prepare('UPDATE s8_players SET dollars=dollars-?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(total,p.id),
            env.DB.prepare(`INSERT INTO s8_income_assets(player_id,kind,qty) VALUES(?,?,?) ON CONFLICT(player_id,kind) DO UPDATE SET qty=qty+excluded.qty`).bind(p.id,kind,qty),
            env.DB.prepare('INSERT INTO s8_transactions(tx_code,player_id,user_code,type,description,amount) VALUES(?,?,?,?,?,?)').bind(code,p.id,p.user_code,'purchase',`خرید ${meta.name} × ${qty}`,total)
          ]);
        }else{
          await env.DB.batch([
            env.DB.prepare('UPDATE s8_players SET dollars=dollars-?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(total,p.id),
            env.DB.prepare(`UPDATE s8_assets SET ${kind}=${kind}+? WHERE player_id=?`).bind(qty,p.id),
            env.DB.prepare('INSERT INTO s8_transactions(tx_code,player_id,user_code,type,description,amount) VALUES(?,?,?,?,?,?)').bind(code,p.id,p.user_code,'purchase',`خرید ${meta.name} × ${qty}`,total)
          ]);
        }
        return json({message:'پرداخت موفق',transaction_id:code});
      }

      if(path==='/api/season/transactions'&&req.method==='GET'){
        const a=await authPlayer(req,env);if(a.error)return a.error;
        const r=await env.DB.prepare('SELECT tx_code,type,description,amount,created_at FROM s8_transactions WHERE player_id=? ORDER BY id DESC LIMIT 100').bind(a.player.id).all();
        return json(r.results||[]);
      }

      if(path==='/api/season/transfer'&&req.method==='POST'){
        const a=await authPlayer(req,env);if(a.error)return a.error;
        const d=await req.json();
        const toCode=esc(d.to_code).toUpperCase();
        const toCountry=esc(d.to_country);
        const receiver=toCountry?await getPlayerByCountry(env,toCountry):await getPlayerByCode(env,toCode);
        const kind=esc(d.kind),qty=n(d.quantity);
        if(!receiver)return json({message:'کشور مقصد پیدا نشد.'},404);
        if(receiver.id===a.player.id)return json({message:'انتقال به خودتان امکان‌پذیر نیست.'},400);
        if(!Number.isSafeInteger(qty)||qty<1)return json({message:'مقدار انتقال نامعتبر است.'},400);
        if(kind.startsWith('income_'))return json({message:'دارایی‌های درآمدزا قابل انتقال نیستند.'},400);
        if(kind!=='dollars'&&kind!=='oil'&&!ASSET_META[kind])return json({message:'دارایی نامعتبر است.'},400);
        if(kind!=='dollars'&&kind!=='oil'&&ASSET_META[kind].mode==='income')return json({message:'دارایی‌های درآمدزا قابل انتقال نیستند.'},400);
        const p=await getPlayerById(env,a.player.id);
        const available=kind==='dollars'?Number(p.dollars):kind==='oil'?Number(p.oil):Number(p[kind]||0);
        if(available<qty)return json({message:'موجودی کافی نیست.'},400);
        const day=new Date().toISOString().slice(0,10);
        const count=await env.DB.prepare(`SELECT COUNT(*) c FROM s8_transfers WHERE sender_player_id=? AND substr(created_at,1,10)=?`).bind(p.id,day).first();
        if(Number(count?.c||0)>=3)return json({message:'سقف انتقال روزانه شما تکمیل شده است.'},400);
        const code=txCode();
        const stm=[];
        if(kind==='dollars')stm.push(env.DB.prepare('UPDATE s8_players SET dollars=dollars-? WHERE id=?').bind(qty,p.id),env.DB.prepare('UPDATE s8_players SET dollars=dollars+? WHERE id=?').bind(qty,receiver.id));
        else if(kind==='oil')stm.push(env.DB.prepare('UPDATE s8_players SET oil=oil-? WHERE id=?').bind(qty,p.id),env.DB.prepare('UPDATE s8_players SET oil=oil+? WHERE id=?').bind(qty,receiver.id));
        else stm.push(env.DB.prepare(`UPDATE s8_assets SET ${kind}=${kind}-? WHERE player_id=?`).bind(qty,p.id),env.DB.prepare(`UPDATE s8_assets SET ${kind}=${kind}+? WHERE player_id=?`).bind(qty,receiver.id));
        stm.push(env.DB.prepare('INSERT INTO s8_transfers(tx_code,sender_player_id,receiver_player_id,kind,asset_key,quantity) VALUES(?,?,?,?,?,?)').bind(code,p.id,receiver.id,kind,kind,qty));
        stm.push(env.DB.prepare('INSERT INTO s8_transactions(tx_code,player_id,user_code,type,description,amount) VALUES(?,?,?,?,?,?)').bind(code,p.id,p.user_code,'transfer',`انتقال ${kind} به ${receiver.country}`,0));
        await env.DB.batch(stm);
        return json({message:'انتقال با موفقیت انجام شد',transaction_id:code});
      }

      if(path==='/api/season/battle'&&req.method==='POST'){
        const a=await authPlayer(req,env);if(a.error)return a.error;
        if((await setting(env,'war_enabled','1'))!=='1')return json({message:'جنگ در حال حاضر غیرفعال است.'},403);
        const d=await req.json(),mode=d.mode==='defense'?'defense':'war',scenario=esc(d.scenario);
        if(!scenario)return json({message:'سناریو را وارد کنید.'},400);
        let defender=null;
        if(d.to_country)defender=await getPlayerByCountry(env,esc(d.to_country));
        else defender=await getPlayerByCode(env,esc(d.to_code).toUpperCase());
        if(!defender||defender.id===a.player.id)return json({message:'کشور حریف معتبر نیست.'},400);
        const selected=d.assets||{};
        const allowed=mode==='defense'?DEFENSE_KEYS:WAR_KEYS;
        const clean=[];
        for(const [key,value] of Object.entries(selected)){
          const qty=n(value);
          if(qty>0){
            if(!allowed.includes(key))return json({message:'این تجهیز برای این نوع نبرد مجاز نیست.'},400);
            if(Number(a.player[key]||0)<qty)return json({message:`تعداد ${ASSET_META[key]?.name||key} کافی نیست.`},400);
            clean.push([key,qty]);
          }
        }
        if(!clean.length)return json({message:'حداقل یک تجهیز انتخاب کنید.'},400);
        const code=txCode();
        const ins=await env.DB.prepare('INSERT INTO s8_battles(code,attacker_player_id,defender_player_id,mode,scenario) VALUES(?,?,?,?,?)').bind(code,a.player.id,defender.id,mode,scenario).run();
        const battle=await env.DB.prepare('SELECT id FROM s8_battles WHERE code=?').bind(code).first();
        if(!battle)throw new Error('ثبت سناریو انجام نشد');
        const stm=[];
        for(const [key,qty] of clean){
          stm.push(env.DB.prepare(`UPDATE s8_assets SET ${key}=${key}-? WHERE player_id=?`).bind(qty,a.player.id));
          stm.push(env.DB.prepare('INSERT INTO s8_battle_assets(battle_id,asset_key,quantity) VALUES(?,?,?)').bind(battle.id,key,qty));
        }
        await env.DB.batch(stm);
        return json({message:'سناریو ارسال شد',code});
      }

      if(path==='/api/admin/login'&&req.method==='POST'){
        if(!env.ADMIN_PASSWORD)return json({message:'ADMIN_PASSWORD تنظیم نشده است.'},500);
        const d=await req.json();
        if(d.password!==env.ADMIN_PASSWORD)return json({message:'رمز عبور اشتباه است.'},401);
        return json({token:await makeToken(env)});
      }
      if(path.startsWith('/api/admin/')){
        if(!(await adminOK(req,env)))return json({message:'دسترسی غیرمجاز'},401);
      }

      if(path==='/api/admin/users'&&req.method==='GET')return json(await listUsers(env));
      if(path==='/api/admin/users'&&req.method==='POST'){
        const d=await req.json(),code=esc(d.code).toUpperCase(),name=esc(d.name),total=n(d.total_games||0),wins=n(d.wins||0);
        if(!/^POW\d+$/.test(code)||!name||total<0||wins<0||wins>total)return json({message:'اطلاعات نامعتبر است.'},400);
        try{await insertUser(env,d);return json({message:'کاربر اضافه شد'});}catch(e){return json({message:String(e).includes('UNIQUE')?'این کد قبلاً ثبت شده است.':`خطا در ثبت کاربر: ${String(e)}`},409);}
      }
      if(path.startsWith('/api/admin/users/')&&req.method==='PUT'){
        const code=decodeURIComponent(path.split('/').pop()).toUpperCase(),d=await req.json();
        if(d.action==='block'){await setBlock(env,code,d.type);return json({message:'کاربر مسدود شد'});}
        if(d.action==='unblock'){await unblock(env,code);return json({message:'مسدودی برداشته شد'});}
        const total=n(d.total_games||0),wins=n(d.wins||0);if(total<0||wins<0||wins>total)return json({message:'مقادیر بازی نامعتبر است.'},400);await updateUser(env,code,d);return json({message:'ویرایش شد'});
      }
      if(path.startsWith('/api/admin/users/')&&req.method==='DELETE'){
        const code=decodeURIComponent(path.split('/').pop()).toUpperCase();
        await env.DB.prepare('DELETE FROM users WHERE code=?').bind(code).run();
        return json({message:'حذف شد'});
      }

      if(path==='/api/admin/players'&&req.method==='GET'){
        const r=await env.DB.prepare(`SELECT sp.*,u.name,u.total_games,u.loyalty_date,a.* FROM s8_players sp JOIN users u ON u.code=sp.user_code JOIN s8_assets a ON a.player_id=sp.id ORDER BY sp.dollars DESC`).all();
        return json((r.results||[]).map(p=>({...p,wins:Number(p.wins||0)})));
      }
      if(path==='/api/admin/players'&&req.method==='POST'){
        const d=await req.json(),code=esc(d.user_code).toUpperCase(),country=esc(d.country),oil=n(d.oil||0);
        const u=await getUser(env,code);if(!u)return json({message:'کاربر وجود ندارد'},404);if(isBlocked(u))return json({message:'کاربر مسدود است'},400);if(await getPlayerByCode(env,code))return json({message:'این کاربر قبلاً وارد سیزن شده است.'},409);if(!country)return json({message:'کشور را وارد کنید.'},400);if(oil<0)return json({message:'مقدار نفت نامعتبر است.'},400);
        if(await env.DB.prepare('SELECT id FROM s8_players WHERE country=?').bind(country).first())return json({message:'این کشور قبلاً انتخاب شده است.'},409);
        const ins=await env.DB.prepare('INSERT INTO s8_players(user_code,country,dollars,oil) VALUES(?,?,?,?)').bind(code,country,10000,oil).run();
        const player=await env.DB.prepare('SELECT id FROM s8_players WHERE user_code=?').bind(code).first();
        if(!player)throw new Error('بازیکن ثبت شد اما شناسه پیدا نشد');
        await env.DB.prepare('INSERT INTO s8_assets(player_id) VALUES(?)').bind(player.id).run();
        return json({message:'بازیکن سیزن ۸ ثبت شد'});
      }
      if(path.startsWith('/api/admin/players/')&&req.method==='PUT'){
        const id=n(path.split('/').pop()),d=await req.json(),p=await getPlayerById(env,id);if(!p)return json({message:'بازیکن پیدا نشد'},404);
        if(d.action==='country'){
          const c=esc(d.country);if(!c)return json({message:'کشور نامعتبر است.'},400);
          if(await env.DB.prepare('SELECT id FROM s8_players WHERE country=? AND id<>?').bind(c,id).first())return json({message:'این کشور در اختیار بازیکن دیگری است.'},409);
          const resets=EQUIPMENT_KEYS.map(k=>`${k}=0`).join(',');
          await env.DB.prepare(`UPDATE s8_players SET country=?,dollars=10000,oil=0,income_daily=0,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(c,id).run();
          await env.DB.prepare(`UPDATE s8_assets SET ${resets} WHERE player_id=?`).bind(id).run();
          await env.DB.prepare('DELETE FROM s8_income_assets WHERE player_id=?').bind(id).run();
          return json({message:'کشور تغییر کرد؛ دارایی‌ها به ۱۰هزار دلار بازنشانی شدند.'});
        }
        return json({message:'عملیات نامعتبر'},400);
      }

      if(path==='/api/admin/grant'&&req.method==='POST'){
        const d=await req.json(),id=n(d.player_id),kind=esc(d.kind),qty=n(d.quantity);if(qty<1)return json({message:'مقدار نامعتبر است.'},400);
        const p=await getPlayerById(env,id);if(!p)return json({message:'بازیکن پیدا نشد'},404);
        if(kind==='dollars'||kind==='oil')await env.DB.prepare(`UPDATE s8_players SET ${kind}=${kind}+? WHERE id=?`).bind(qty,id).run();
        else if(ASSET_META[kind]?.mode==='income')await env.DB.prepare('INSERT INTO s8_income_assets(player_id,kind,qty) VALUES(?,?,?) ON CONFLICT(player_id,kind) DO UPDATE SET qty=qty+excluded.qty').bind(id,kind,qty).run();
        else if(ASSET_META[kind])await env.DB.prepare(`UPDATE s8_assets SET ${kind}=${kind}+? WHERE player_id=?`).bind(qty,id).run();
        else return json({message:'دارایی نامعتبر است.'},400);
        return json({message:'اعطا شد'});
      }

      if(path==='/api/admin/income'&&req.method==='GET'){
        const r=await env.DB.prepare(`SELECT ia.player_id,ia.kind,ia.qty,sp.country,sp.user_code FROM s8_income_assets ia JOIN s8_players sp ON sp.id=ia.player_id WHERE ia.qty>0 ORDER BY sp.country`).all();return json(r.results||[]);
      }
      if(path==='/api/admin/transactions'&&req.method==='GET'){
        const r=await env.DB.prepare(`SELECT t.*,sp.country FROM s8_transactions t LEFT JOIN s8_players sp ON sp.id=t.player_id ORDER BY t.id DESC LIMIT 500`).all();return json(r.results||[]);
      }
      if(path==='/api/admin/battles'&&req.method==='GET'){
        const r=await env.DB.prepare(`SELECT b.*,a.country attacker_country,d.country defender_country FROM s8_battles b JOIN s8_players a ON a.id=b.attacker_player_id JOIN s8_players d ON d.id=b.defender_player_id WHERE b.status='pending' ORDER BY b.id ASC`).all();
        const out=[];for(const b of r.results||[]){const ar=await env.DB.prepare('SELECT asset_key,quantity FROM s8_battle_assets WHERE battle_id=?').bind(b.id).all();out.push({...b,assets:ar.results||[]});}return json(out);
      }
      if(path.startsWith('/api/admin/battles/')&&req.method==='PUT'){
        const id=n(path.split('/').pop()),d=await req.json();const b=await env.DB.prepare(`SELECT * FROM s8_battles WHERE id=? AND status='pending'`).bind(id).first();if(!b)return json({message:'سناریو پیدا نشد یا قبلاً بررسی شده.'},404);
        const rows=await env.DB.prepare('SELECT asset_key,quantity FROM s8_battle_assets WHERE battle_id=?').bind(id).all();
        await env.DB.prepare('UPDATE s8_battles SET status=?,reviewed_at=CURRENT_TIMESTAMP WHERE id=?').bind(d.approved?'approved':'rejected',id).run();
        if(!d.approved)for(const r of rows.results||[])await env.DB.prepare(`UPDATE s8_assets SET ${r.asset_key}=${r.asset_key}+? WHERE player_id=?`).bind(r.quantity,b.attacker_player_id).run();
        return json({message:d.approved?'سناریو تأیید و بسته شد.':'سناریو رد شد و تجهیزات برگشت.'});
      }
      if(path==='/api/admin/war'&&req.method==='POST'){const d=await req.json();await setSetting(env,'war_enabled',d.enabled?'1':'0');return json({message:d.enabled?'جنگ فعال شد.':'جنگ غیرفعال شد.'});}
      if(path==='/api/admin/bitcoin'&&req.method==='POST'){const price=n((await req.json()).price);if(!Number.isSafeInteger(price)||price<1)return json({message:'قیمت نامعتبر است.'},400);await setSetting(env,'bitcoin_price',price);return json({message:'قیمت بیت‌کوین ثبت شد.'});}
      if(path==='/api/admin/test-state'&&req.method==='GET')return json({db:'OK',season:'8',war_enabled:(await setting(env,'war_enabled','1'))==='1'});

      return env.ASSETS.fetch(req);
    }catch(e){
      return json({message:'خطای سرور',detail:String(e?.message||e)},500);
    }
  }
};
