 const json=(d,s=200)=>new Response(
  JSON.stringify(d),
  {
    status:s,
    headers:{
      "content-type":"application/json;charset=UTF-8",
      "cache-control":"no-store"
    }
  }
);

const text=(s)=>new Response(
  s,
  {
    status:200,
    headers:{
      "content-type":"text/plain;charset=UTF-8"
    }
  }
);

const clean=v=>String(v??'').trim();

const b64=a=>btoa(
  String.fromCharCode(...new Uint8Array(a))
)
.replaceAll('+','-')
.replaceAll('/','_')
.replaceAll('=','');


/* =========================================================
   ADMIN TOKEN
========================================================= */

async function hmac(secret,data){

  const k=await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name:'HMAC',
      hash:'SHA-256'
    },
    false,
    ['sign']
  );

  return b64(
    await crypto.subtle.sign(
      'HMAC',
      k,
      new TextEncoder().encode(data)
    )
  );
}


async function makeToken(env){

  const exp=
    Date.now()+
    12*60*60*1000;

  const body=
    b64(
      new TextEncoder().encode(
        String(exp)
      )
    );

  return body+'.'+
    await hmac(
      env.ADMIN_PASSWORD,
      body
    );
}


async function adminOK(req,env){

  if(!env.ADMIN_PASSWORD)
    return false;

  const a=
    req.headers.get('authorization')||'';

  if(!a.startsWith('Bearer '))
    return false;

  const [body,sig]=
    a.slice(7).split('.');

  if(!body||!sig)
    return false;

  try{

    let raw=
      body
        .replaceAll('-','+')
        .replaceAll('_','/');

    raw+='='.repeat(
      (4-raw.length%4)%4
    );

    const exp=Number(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(raw),
          c=>c.charCodeAt(0)
        )
      )
    );

    return (
      exp>Date.now() &&
      (await hmac(
        env.ADMIN_PASSWORD,
        body
      ))===sig
    );

  }catch{

    return false;

  }
}


/* =========================================================
   CATALOG
========================================================= */

const CATALOG={

  missiles:[
    ['موشک عادی','missiles_normal',10000],
    ['موشک پیشرفته','missiles_advanced',25000],
    ['موشک فوق پیشرفته','missiles_super',50000],
    ['موشک سنگین','missiles_heavy',75000],
    ['موشک سنگین پیشرفته','missiles_heavy_advanced',120000],
    ['موشک دوربرد','missiles_long',180000],
    ['موشک دوربرد پیشرفته','missiles_long_advanced',250000],
    ['موشک بسیار دوربرد','missiles_very_long',400000],
    ['موشک بسیار دوربرد پیشرفته','missiles_very_long_advanced',600000],
    ['موشک ویژه','missiles_special',1000000]
  ],

  military:[
    ['سرباز عادی','military_normal',1000],
    ['سرباز پیشرفته','military_advanced',2500],
    ['سرباز ویژه','military_special',5000],
    ['سرباز لجستیکی','military_logistics',7500],
    ['سرباز سنگین','military_heavy',10000],
    ['سرباز سنگین پیشرفته','military_heavy_advanced',15000],
    ['فرمانده','commander',25000],
    ['فرمانده پیشرفته','commander_advanced',50000],
    ['فرمانده ویژه','commander_special',100000],
    ['فرمانده کل','commander_general',250000]
  ],

  defense:[
    ['پدافند عادی','defense_normal',15000],
    ['پدافند پیشرفته','defense_advanced',35000],
    ['پدافند فوق پیشرفته','defense_super',75000],
    ['پدافند کوتاه‌برد','defense_short',100000],
    ['پدافند کوتاه‌برد پیشرفته','defense_short_advanced',175000],
    ['پدافند میان‌برد','defense_medium',250000],
    ['پدافند میان‌برد پیشرفته','defense_medium_advanced',400000],
    ['پدافند دوربرد','defense_long',600000],
    ['پدافند دوربرد پیشرفته','defense_long_advanced',1000000],
    ['پدافند بسیار پیشرفته','defense_very_advanced',2000000]
  ],

  fighters:[
    ['جنگنده عادی','fighter_normal',5000000],
    ['جنگنده پیشرفته','fighter_advanced',10000000],
    ['جنگنده فوق پیشرفته','fighter_super',20000000],
    ['جنگنده سبک','fighter_light',25000000],
    ['جنگنده سبک پیشرفته','fighter_light_advanced',40000000],
    ['جنگنده سنگین','fighter_heavy',60000000],
    ['جنگنده سنگین پیشرفته','fighter_heavy_advanced',90000000],
    ['جنگنده دوربرد','fighter_long',120000000],
    ['جنگنده دوربرد پیشرفته','fighter_long_advanced',175000000],
    ['جنگنده بسیار پیشرفته','fighter_very_advanced',250000000]
  ],

  bombers:[
    ['بمب‌افکن عادی','bomber_normal',30000000],
    ['بمب‌افکن پیشرفته','bomber_advanced',60000000],
    ['بمب‌افکن فوق پیشرفته','bomber_super',120000000],
    ['بمب‌افکن سبک','bomber_light',150000000],
    ['بمب‌افکن سبک پیشرفته','bomber_light_advanced',200000000],
    ['بمب‌افکن سنگین','bomber_heavy',300000000],
    ['بمب‌افکن سنگین پیشرفته','bomber_heavy_advanced',450000000],
    ['بمب‌افکن دوربرد','bomber_long',600000000],
    ['بمب‌افکن دوربرد پیشرفته','bomber_long_advanced',800000000],
    ['بمب‌افکن بسیار پیشرفته','bomber_very_advanced',1000000000]
  ],

  ships:[
    ['ناو عادی','ship_normal',100000000],
    ['ناو پیشرفته','ship_advanced',200000000],
    ['ناو فوق پیشرفته','ship_super',400000000],
    ['ناو سبک','ship_light',500000000],
    ['ناو سبک پیشرفته','ship_light_advanced',750000000],
    ['ناو سنگین','ship_heavy',1000000000],
    ['ناو سنگین پیشرفته','ship_heavy_advanced',1500000000],
    ['ناو دوربرد','ship_long',2000000000],
    ['ناو دوربرد پیشرفته','ship_long_advanced',3000000000],
    ['ناو بسیار پیشرفته','ship_very_advanced',5000000000]
  ]
};


const INCOME=[

  ['مزرعه کوچک','income_small_farm',10000,500],
  ['فروشگاه کوچک','income_small_shop',25000,1200],
  ['کارگاه','income_workshop',50000,2500],
  ['مزرعه بزرگ','income_large_farm',100000,5000],
  ['فروشگاه بزرگ','income_large_shop',200000,10000],
  ['کارخانه کوچک','income_small_factory',500000,25000],
  ['کارخانه بزرگ','income_large_factory',1000000,60000],
  ['شرکت تجاری','income_trade_company',2500000,150000],
  ['شرکت بزرگ','income_large_company',5000000,300000],
  ['مرکز تجاری','income_business_center',10000000,600000],
  ['کارخانه پیشرفته','income_advanced_factory',25000000,1500000],
  ['شرکت بسیار بزرگ','income_very_large_company',50000000,3000000],
  ['مرکز صنعتی','income_industrial_center',100000000,6000000],
  ['مرکز تجاری بزرگ','income_large_business_center',250000000,15000000],
  ['مجموعه اقتصادی بزرگ','income_economic_group',500000000,30000000]

];


const META={};

for(
  const [cat,rows]
  of Object.entries(CATALOG)
){

  for(
    const [name,key,price]
    of rows
  ){

    META[key]={
      name,
      key,
      price,
      category:cat,
      war:cat!=='defense',
      defense:cat==='defense'
    };

  }

}


for(
  const [name,key,price,daily]
  of INCOME
){

  META[key]={
    name,
    key,
    price,
    daily,
    category:'income'
  };

}


const allAssetKeys=
  Object.values(CATALOG)
    .flat()
    .map(x=>x[1]);


const warKeys=
  Object.values(CATALOG)
    .filter((_,i)=>i!==2)
    .flat()
    .map(x=>x[1]);


const defenseKeys=
  CATALOG.defense.map(x=>x[1]);


/* =========================================================
   GENERAL HELPERS
========================================================= */

const txCode=()=>{

  const chars=
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const part=()=>
    Array.from(
      {length:4},
      ()=>chars[
        Math.floor(
          Math.random()*chars.length
        )
      ]
    ).join('');

  return `${part()}-${part()}-${part()}`;

};


const randomInt=(min,max)=>
  Math.floor(
    Math.random()*(max-min+1)
  )+min;


const randomFloat=(min,max)=>
  Math.random()*(max-min)+min;


const chance=p=>
  Math.random()<p;


const pick=arr=>
  arr[
    Math.floor(
      Math.random()*arr.length
    )
  ];


/* =========================================================
   قدرت نظامی
========================================================= */

function calculateMilitaryPower(p,assets){

  const POWER={

    missiles_normal:1,
    missiles_advanced:2,
    missiles_super:4,
    missiles_heavy:7,
    missiles_heavy_advanced:11,
    missiles_long:16,
    missiles_long_advanced:23,
    missiles_very_long:32,
    missiles_very_long_advanced:45,
    missiles_special:65,

    military_normal:1,
    military_advanced:2,
    military_special:4,
    military_logistics:3,
    military_heavy:5,
    military_heavy_advanced:8,
    commander:12,
    commander_advanced:20,
    commander_special:35,
    commander_general:60,

    defense_normal:5,
    defense_advanced:9,
    defense_super:16,
    defense_short:25,
    defense_short_advanced:40,
    defense_medium:60,
    defense_medium_advanced:90,
    defense_long:130,
    defense_long_advanced:190,
    defense_very_advanced:280,

    fighter_normal:100,
    fighter_advanced:180,
    fighter_super:300,
    fighter_light:380,
    fighter_light_advanced:520,
    fighter_heavy:700,
    fighter_heavy_advanced:950,
    fighter_long:1250,
    fighter_long_advanced:1700,
    fighter_very_advanced:2300,

    bomber_normal:250,
    bomber_advanced:450,
    bomber_super:750,
    bomber_light:950,
    bomber_light_advanced:1250,
    bomber_heavy:1700,
    bomber_heavy_advanced:2300,
    bomber_long:3000,
    bomber_long_advanced:3900,
    bomber_very_advanced:5000,

    ship_normal:500,
    ship_advanced:850,
    ship_super:1400,
    ship_light:1800,
    ship_light_advanced:2600,
    ship_heavy:3500,
    ship_heavy_advanced:4800,
    ship_long:6500,
    ship_long_advanced:8500,
    ship_very_advanced:11000

  };

  let score=0;

  for(
    const [key,power]
    of Object.entries(POWER)
  ){

    const qty=Math.max(
      0,
      Number(assets?.[key]||0)
    );

    score+=qty*power;

  }

  const moneyScore=
    Math.max(
      0,
      Number(p?.dollars||0)
    )/1000000;

  return Math.floor(
    score+
    moneyScore*0.15
  );

}


/* =========================================================
   SETTINGS / USERS
========================================================= */

async function setting(env,key,def=null){

  const r=await env.DB
    .prepare(
      'SELECT value FROM s8_settings WHERE key=?'
    )
    .bind(key)
    .first();

  return r?.value??def;

}


async function tableCols(env,table){

  const r=await env.DB
    .prepare(
      `PRAGMA table_info(${table})`
    )
    .all();

  return new Set(
    (r.results||[])
      .map(x=>x.name)
  );

}


async function userSchema(env){

  const c=
    await tableCols(env,'users');

  return {
    victories:
      c.has('victories')
        ?'victories'
        :'wins',

    blocked:
      c.has('blocked_type')
        ?'blocked_type'
        :'block_type'
  };

}


async function getUser(env,code){

  return env.DB
    .prepare(
      'SELECT * FROM users WHERE code=?'
    )
    .bind(code)
    .first();

}


async function isBlocked(u){

  if(!u?.blocked_until)
    return false;

  if(
    u.blocked_until==='permanent' ||
    u.blocked_until==='season'
  )
    return true;

  const t=
    Date.parse(u.blocked_until);

  return (
    Number.isFinite(t) &&
    t>Date.now()
  );

}


/* =========================================================
   PLAYER AUTH
========================================================= */

async function auth(req,env){

  const code=clean(
    req.headers.get('x-user-code')
  ).toUpperCase();

  if(!/^POW\d+$/.test(code)){

    return {
      error:json(
        {
          message:
            'کد کاربری نامعتبر است.'
        },
        400
      )
    };

  }

  const u=
    await getUser(env,code);

  if(!u){

    return {
      error:json(
        {
          message:
            'این کد وجود ندارد'
        },
        404
      )
    };

  }

  if(await isBlocked(u)){

    return {
      error:json(
        {
          message:
            'حساب کاربری شما مسدود است.'
        },
        403
      )
    };

  }

  const p=
    await env.DB
      .prepare(`
        SELECT
          p.*,
          u.name,
          u.total_games,
          u.loyalty_date
        FROM s8_players p
        JOIN users u
          ON u.code=p.user_code
        WHERE p.user_code=?
      `)
      .bind(code)
      .first();

  if(!p){

    return {
      error:json(
        {
          message:
            'در بازی ثبت نام نکرده اید'
        },
        403
      )
    };

  }

  if(
    Number(p.is_ai||0)===1
  ){

    return {
      error:json(
        {
          message:
            'این کشور توسط هوش مصنوعی کنترل می‌شود.'
        },
        403
      )
    };

  }

  return {
    user:u,
    player:p
  };

}


/* =========================================================
   ACCOUNT
========================================================= */

async function account(env,code){

  const u=
    await getUser(env,code);

  if(!u)
    return null;

  const s=
    await userSchema(env);

  return {

    code:u.code,
    name:u.name,
    loyalty_date:u.loyalty_date,

    total_games:
      Number(u.total_games||0),

    victories:
      Number(u[s.victories]||0),

    blocked:
      await isBlocked(u)

  };

}


/* =========================================================
   PLAYER DATA
========================================================= */

async function incomeTotal(env,pid){

  const r=
    await env.DB
      .prepare(`
        SELECT kind,qty
        FROM s8_income_assets
        WHERE player_id=?
        AND qty>0
      `)
      .bind(pid)
      .all();

  return (
    r.results||[]
  ).reduce(
    (sum,x)=>
      sum+
      (META[x.kind]?.daily||0)*
      Number(x.qty),
    0
  );

}


/* =========================================================
   PLAYER + RANK
========================================================= */

async function publicPlayer(
  env,
  p,
  includeCode=false
){

  const ar=
    await env.DB
      .prepare(`
        SELECT kind,qty
        FROM s8_income_assets
        WHERE player_id=?
        AND qty>0
      `)
      .bind(p.id)
      .all();

  const assetRow=
    await env.DB
      .prepare(`
        SELECT *
        FROM s8_assets
        WHERE player_id=?
      `)
      .bind(p.id)
      .first();

  const assets={};

  for(
    const k of allAssetKeys
  ){

    assets[k]={
      name:META[k].name,
      qty:Number(
        assetRow?.[k]||0
      ),
      price:META[k].price
    };

  }

  const incomes={};

  for(
    const x of ar.results||[]
  ){

    incomes[x.kind]=
      Number(x.qty);

  }

  const daily=
    Object.entries(incomes)
      .reduce(
        (s,[k,q])=>
          s+
          (META[k]?.daily||0)*q,
        0
      );

  const militaryPower=
    calculateMilitaryPower(
      p,
      assetRow
    );

  let rank=0;

  try{

    const [playersR,assetsR]=
      await Promise.all([

        env.DB
          .prepare(`
            SELECT *
            FROM s8_players
            WHERE active=1
          `)
          .all(),

        env.DB
          .prepare(`
            SELECT *
            FROM s8_assets
          `)
          .all()

      ]);

    const assetMap=
      new Map(
        (assetsR.results||[])
          .map(
            x=>[
              x.player_id,
              x
            ]
          )
      );

    const ranked=
      (playersR.results||[])
        .map(rp=>({

          id:rp.id,

          power:
            calculateMilitaryPower(
              rp,
              assetMap.get(rp.id)
            )

        }))
        .sort(
          (a,b)=>
            b.power-a.power ||
            a.id-b.id
        );

    rank=
      ranked.findIndex(
        x=>x.id===p.id
      )+1;

  }catch{

    rank=0;

  }

  const result={

    id:p.id,
    name:p.name,
    country:p.country,

    dollars:
      Number(p.dollars||0),

    oil:
      Number(p.oil||0),

    daily_income:daily,

    military_power:
      militaryPower,

    assets,

    income_assets:incomes,

    rank

  };

  if(includeCode)
    result.code=p.user_code;

  return result;

}


/* =========================================================
   DAILY INCOME
========================================================= */

async function addIncome(env){

  const tz=
    await setting(
      env,
      'timezone',
      'Asia/Tehran'
    );

  const parts=
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:tz,
        year:'numeric',
        month:'2-digit',
        day:'2-digit',
        hour:'2-digit',
        hour12:false
      }
    ).formatToParts(
      new Date()
    );

  const get=k=>
    parts.find(
      x=>x.type===k
    )?.value;

  const day=
    `${get('year')}-${get('month')}-${get('day')}`;

  const hour=
    Number(get('hour'));

  if(hour!==0)
    return;

  if(
    await setting(
      env,
      'last_income_day',
      ''
    )===day
  )
    return;

  const ps=
    await env.DB
      .prepare(`
        SELECT id
        FROM s8_players
        WHERE active=1
      `)
      .all();

  for(
    const p of ps.results||[]
  ){

    const total=
      await incomeTotal(
        env,
        p.id
      );

    if(total>0){

      await env.DB
        .prepare(`
          UPDATE s8_players
          SET
            dollars=dollars+?,
            income_daily=?,
            updated_at=CURRENT_TIMESTAMP
          WHERE id=?
        `)
        .bind(
          total,
          total,
          p.id
        )
        .run();

      await env.DB
        .prepare(`
          INSERT INTO s8_transactions(
            tx_code,
            player_id,
            type,
            description,
            amount
          )
          VALUES(?,?,?,?,?)
        `)
        .bind(
          txCode(),
          p.id,
          'income',
          'درآمد روزانه',
          total
        )
        .run();

    }

  }

  await env.DB
    .prepare(`
      INSERT INTO s8_settings(
        key,
        value
      )
      VALUES(?,?)
      ON CONFLICT(key)
      DO UPDATE SET
        value=excluded.value
    `)
    .bind(
      'last_income_day',
      day
    )
    .run();

}


/* =========================================================
   AI ENGINE
========================================================= */

async function getAIMemory(env,p){

  let memory={};

  try{

    memory=
      JSON.parse(
        p.ai_memory||'{}'
      )||{};

  }catch{

    memory={};

  }

  return memory;

}


async function saveAIMemory(
  env,
  playerId,
  memory
){

  await env.DB
    .prepare(`
      UPDATE s8_players
      SET
        ai_memory=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `)
    .bind(
      JSON.stringify(memory),
      playerId
    )
    .run();

}


async function aiLog(
  env,
  playerId,
  actionType,
  actionData={}
){

  await env.DB
    .prepare(`
      INSERT INTO s8_ai_logs(
        player_id,
        action_type,
        action_data
      )
      VALUES(?,?,?)
    `)
    .bind(
      playerId,
      actionType,
      JSON.stringify(actionData)
    )
    .run();

}


async function aiSchedule(
  env,
  playerId,
  minMinutes=3,
  maxMinutes=15
){

  const next=
    new Date(
      Date.now()+
      randomInt(
        minMinutes,
        maxMinutes
      )*60*1000
    ).toISOString();

  await env.DB
    .prepare(`
      UPDATE s8_players
      SET
        ai_next_action_at=?,
        ai_active=1,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `)
    .bind(
      next,
      playerId
    )
    .run();

  return next;

}


async function aiBuy(
  env,
  p,
  key,
  quantity
){

  const meta=META[key];

  if(!meta)
    return false;

  quantity=
    Math.max(
      1,
      Math.floor(
        Number(quantity)
      )
    );

  const cost=
    meta.price*quantity;

  if(
    !Number.isSafeInteger(cost) ||
    Number(p.dollars)<cost
  )
    return false;

  const id=txCode();

  if(meta.category==='income'){

    await env.DB.batch([

      env.DB.prepare(`
        UPDATE s8_players
        SET
          dollars=dollars-?,
          updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        AND dollars>=?
      `).bind(
        cost,
        p.id,
        cost
      ),

      env.DB.prepare(`
        INSERT INTO s8_income_assets(
          player_id,
          kind,
          qty
        )
        VALUES(?,?,?)
        ON CONFLICT(player_id,kind)
        DO UPDATE SET
          qty=qty+excluded.qty
      `).bind(
        p.id,
        key,
        quantity
      ),

      env.DB.prepare(`
        INSERT INTO s8_transactions(
          tx_code,
          player_id,
          user_code,
          type,
          description,
          amount,
          quantity,
          item_key
        )
        VALUES(?,?,?,?,?,?,?,?)
      `).bind(
        id,
        p.id,
        p.user_code,
        'buy_ai',
        meta.name,
        cost,
        quantity,
        key
      )

    ]);

  }else{

    await env.DB.batch([

      env.DB.prepare(`
        UPDATE s8_players
        SET
          dollars=dollars-?,
          updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        AND dollars>=?
      `).bind(
        cost,
        p.id,
        cost
      ),

      env.DB.prepare(`
        UPDATE s8_assets
        SET
          ${key}=${key}+?
        WHERE player_id=?
      `).bind(
        quantity,
        p.id
      ),

      env.DB.prepare(`
        INSERT INTO s8_transactions(
          tx_code,
          player_id,
          user_code,
          type,
          description,
          amount,
          quantity,
          item_key
        )
        VALUES(?,?,?,?,?,?,?,?)
      `).bind(
        id,
        p.id,
        p.user_code,
        'buy_ai',
        meta.name,
        cost,
        quantity,
        key
      )

    ]);

  }

  await aiLog(
    env,
    p.id,
    'buy',
    {
      key,
      quantity,
      cost
    }
  );

  return true;

}


/* =========================================================
   بقیه Worker فعلی GitHub
========================================================= */

/*
ادامه‌ی فایل از اینجا بدون تغییر نسبت به نسخه فعلی
GitHub است و شامل:

aiChoosePurchase
aiChooseTarget
aiChooseBattleAssets
aiBattle
aiAct
aiTick
scheduled
fetch
/api/account
/api/catalog
/api/season/settings
/api/season/login
/api/season/me
/api/season/governments
/api/season/buy
/api/season/buy-batch
/api/season/transfer
/api/season/battle
/api/season/transactions
تمام APIهای admin
و static fallback

است.
*/
/* ---------------------------------------------------------
   ادامه aiChoosePurchase
--------------------------------------------------------- */

async function aiChoosePurchase(
  env,
  p,
  memory,
  assetsRow
){

  const money=
    Math.max(
      0,
      Number(p.dollars||0)
    );

  if(money<=0)
    return null;


  const incomeRows=
    INCOME.filter(
      x=>x[2]<=money
    );


  const ownedKeys=
    allAssetKeys.filter(
      k=>
        Number(
          assetsRow?.[k]||0
        )>0
    );


  const defenseOwned=
    defenseKeys.reduce(
      (s,k)=>
        s+
        Number(
          assetsRow?.[k]||0
        ),
      0
    );


  const militaryOwned=
    CATALOG.military
      .reduce(
        (s,x)=>
          s+
          Number(
            assetsRow?.[x[1]]||0
          ),
        0
      );


  const incomeDaily=
    await incomeTotal(
      env,
      p.id
    );

  const incomePressure=
    incomeDaily<50000
      ?0.55
      :incomeDaily<500000
        ?0.35
        :0.15;


  if(
    incomeRows.length &&
    chance(incomePressure)
  ){

    const candidates=
      incomeRows.slice(
        0,
        Math.min(
          incomeRows.length,
          8
        )
      );

    const chosen=
      pick(candidates);

    return {
      key:chosen[1],
      quantity:
        money>=chosen[2]*5
          ?randomInt(1,3)
          :1
    };

  }


  if(
    defenseOwned<3 &&
    chance(0.65)
  ){

    const affordable=
      CATALOG.defense.filter(
        x=>x[2]<=money
      );

    if(affordable.length){

      const chosen=
        pick(
          affordable.slice(
            0,
            Math.min(
              affordable.length,
              6
            )
          )
        );

      return {
        key:chosen[1],
        quantity:
          money>=chosen[2]*3
            ?randomInt(1,3)
            :1
      };

    }

  }


  if(
    militaryOwned<5 &&
    chance(0.70)
  ){

    const affordable=
      CATALOG.military.filter(
        x=>x[2]<=money
      );

    if(affordable.length){

      const chosen=
        pick(
          affordable.slice(
            0,
            Math.min(
              affordable.length,
              7
            )
          )
        );

      return {
        key:chosen[1],
        quantity:
          money>=chosen[2]*5
            ?randomInt(1,5)
            :1
      };

    }

  }


  const affordable=
    warKeys
      .map(k=>META[k])
      .filter(
        x=>
          x &&
          x.price<=money
      );

  if(!affordable.length)
    return null;


  const candidates=[];

  for(
    let i=0;
    i<Math.min(
      affordable.length,
      12
    );
    i++
  ){

    candidates.push(
      affordable[
        randomInt(
          0,
          affordable.length-1
        )
      ]
    );

  }


  const chosen=
    pick(
      candidates.length
        ?candidates
        :affordable
    );

  return {
    key:chosen.key,
    quantity:
      money>=chosen.price*4
        ?randomInt(1,4)
        :1
  };

}


/* ---------------------------------------------------------
   AI هدف جنگ
--------------------------------------------------------- */

async function aiChooseTarget(
  env,
  p
){

  const rows=
    await env.DB
      .prepare(`
        SELECT *
        FROM s8_players
        WHERE active=1
        AND id<>?
        AND (
          is_ai=0
          OR is_ai IS NULL
        )
      `)
      .bind(p.id)
      .all();

  const targets=
    rows.results||[];

  if(!targets.length){

    const all=
      await env.DB
        .prepare(`
          SELECT *
          FROM s8_players
          WHERE active=1
          AND id<>?
        `)
        .bind(p.id)
        .all();

    if(
      (all.results||[]).length
    ){

      return pick(
        all.results
      );

    }

    return null;

  }


  const scored=
    targets.map(
      target=>{

        const money=
          Number(
            target.dollars||0
          );

        const myMoney=
          Number(
            p.dollars||0
          );

        let score=
          randomFloat(
            0.7,
            1.3
          );

        if(
          money<myMoney
        )
          score*=1.25;

        if(
          money>myMoney*3
        )
          score*=0.75;

        return {
          target,
          score
        };

      }
    );


  scored.sort(
    (a,b)=>
      b.score-a.score
  );


  const top=
    scored.slice(
      0,
      Math.min(
        4,
        scored.length
      )
    );


  return pick(
    top
  ).target;

}


/* ---------------------------------------------------------
   AI انتخاب تجهیزات جنگ
--------------------------------------------------------- */

async function aiChooseBattleAssets(
  env,
  p,
  mode
){

  const row=
    await env.DB
      .prepare(`
        SELECT *
        FROM s8_assets
        WHERE player_id=?
      `)
      .bind(p.id)
      .first();

  if(!row)
    return {};


  const allowed=
    mode==='defense'
      ?defenseKeys
      :warKeys;


  const available=
    allowed.filter(
      k=>
        Number(
          row?.[k]||0
        )>0
    );


  if(!available.length)
    return {};


  const shuffled=
    [...available].sort(
      ()=>Math.random()-0.5
    );


  const selected={};


  const count=
    randomInt(
      1,
      Math.min(
        5,
        shuffled.length
      )
    );


  for(
    let i=0;
    i<count;
    i++
  ){

    const key=
      shuffled[i];

    const owned=
      Number(
        row[key]||0
      );

    const ratio=
      randomFloat(
        0.25,
        0.85
      );

    let q=
      Math.max(
        1,
        Math.floor(
          owned*ratio
        )
      );

    q=
      Math.min(
        q,
        owned
      );

    if(q>0)
      selected[key]=q;

  }


  return selected;

}


/* ---------------------------------------------------------
   AI ایجاد جنگ
--------------------------------------------------------- */

async function aiBattle(
  env,
  p,
  memory
){

  const warEnabled=
    await setting(
      env,
      'war_enabled',
      '1'
    );

  if(warEnabled!=='1')
    return false;


  const target=
    await aiChooseTarget(
      env,
      p
    );

  if(!target)
    return false;


  const attackChance=
    Number(p.dollars||0)>=100000000
      ?0.38
      :Number(p.dollars||0)>=10000000
        ?0.25
        :0.12;


  if(!chance(attackChance))
    return false;


  const mode=
    chance(0.78)
      ?'war'
      :'defense';


  if(mode==='defense')
    return false;


  const assets=
    await aiChooseBattleAssets(
      env,
      p,
      mode
    );


  if(!Object.keys(assets).length)
    return false;


  const code=
    txCode();


  const first=
    await env.DB
      .prepare(`
        INSERT INTO s8_battles(
          code,
          attacker_player_id,
          defender_player_id,
          mode,
          scenario
        )
        VALUES(?,?,?,?,?)
        RETURNING id
      `)
      .bind(
        code,
        p.id,
        target.id,
        mode,
        ''
      )
      .first();


  if(!first)
    return false;


  const stm=[];


  for(
    const [key,q]
    of Object.entries(assets)
  ){

    stm.push(
      env.DB.prepare(`
        UPDATE s8_assets
        SET
          ${key}=${key}-?
        WHERE player_id=?
        AND ${key}>=?
      `).bind(
        q,
        p.id,
        q
      )
    );


    stm.push(
      env.DB.prepare(`
        INSERT INTO s8_battle_assets(
          battle_id,
          asset_key,
          quantity
        )
        VALUES(?,?,?)
      `).bind(
        first.id,
        key,
        q
      )
    );

  }


  await env.DB.batch(stm);


  memory.battles=
    Number(
      memory.battles||0
    )+1;

  memory.last_target=
    target.id;

  memory.last_action=
    'battle';


  await aiLog(
    env,
    p.id,
    'battle',
    {
      battle_id:first.id,
      code,
      target_id:target.id,
      target_country:target.country,
      mode,
      assets
    }
  );


  return true;

}


/* ---------------------------------------------------------
   AI یک تصمیم
--------------------------------------------------------- */

async function aiAct(
  env,
  p
){

  const memory=
    await getAIMemory(
      env,
      p
    );


  const assetsRow=
    await env.DB
      .prepare(`
        SELECT *
        FROM s8_assets
        WHERE player_id=?
      `)
      .bind(p.id)
      .first();


  if(!assetsRow)
    return;


  const roll=
    Math.random();


  let action='idle';


  if(
    roll<0.58
  ){

    const purchase=
      await aiChoosePurchase(
        env,
        p,
        memory,
        assetsRow
      );


    if(purchase){

      const ok=
        await aiBuy(
          env,
          p,
          purchase.key,
          purchase.quantity
        );


      if(ok){

        memory.purchases=
          Number(
            memory.purchases||0
          )+1;

        memory.last_action=
          'purchase';

        memory.preferred_category=
          META[
            purchase.key
          ]?.category||'unknown';

        action='purchase';

      }

    }

  }

  else if(
    roll<0.86
  ){

    const ok=
      await aiBattle(
        env,
        p,
        memory
      );

    if(ok)
      action='battle';

  }

  else{

    action='idle';

  }


  memory.last_roll=
    roll;

  memory.last_action=
    action;


  await saveAIMemory(
    env,
    p.id,
    memory
  );


  await aiLog(
    env,
    p.id,
    action,
    {
      dollars_before:
        Number(
          p.dollars||0
        )
    }
  );


  await aiSchedule(
    env,
    p.id,
    action==='battle'
      ?4
      :3,
    action==='battle'
      ?18
      :14
  );

}


/* ---------------------------------------------------------
   AI TICK
--------------------------------------------------------- */

async function aiTick(env){

  let players;

  try{

    const r=
      await env.DB
        .prepare(`
          SELECT *
          FROM s8_players
          WHERE active=1
          AND is_ai=1
          AND ai_active=1
        `)
        .all();

    players=
      r.results||[];

  }catch{

    return;

  }


  for(
    const p of players
  ){

    try{

      if(!p.ai_next_action_at){

        await aiSchedule(
          env,
          p.id,
          randomInt(1,4),
          randomInt(6,10)
        );

        continue;

      }


      const next=
        Date.parse(
          p.ai_next_action_at
        );


      if(
        !Number.isFinite(next) ||
        next>Date.now()
      )
        continue;


      const fresh=
        await env.DB
          .prepare(`
            SELECT *
            FROM s8_players
            WHERE id=?
            AND active=1
            AND is_ai=1
            AND ai_active=1
          `)
          .bind(p.id)
          .first();


      if(!fresh)
        continue;


      await aiAct(
        env,
        fresh
      );


    }catch(e){

      try{

        await aiLog(
          env,
          p.id,
          'error',
          {
            message:
              String(
                e?.message||e
              )
          }
        );


        await aiSchedule(
          env,
          p.id,
          5,
          15
        );

      }catch{}

    }

  }

}


/* =========================================================
   WORKER
========================================================= */

export default {

  async scheduled(
    event,
    env,
    ctx
  ){

    ctx.waitUntil(
      Promise.all([
        addIncome(env),
        aiTick(env)
      ])
    );

  },


  async fetch(req,env){

    const u=
      new URL(req.url);

    const path=
      u.pathname;


    try{


      /* ===================================================
         ACCOUNT
      =================================================== */

      if(
        path==='/api/account' &&
        req.method==='GET'
      ){

        const code=
          clean(
            u.searchParams.get('code')
          ).toUpperCase();


        if(!/^POW\d+$/.test(code)){

          return json(
            {
              message:
                'کد کاربری نامعتبر است.'
            },
            400
          );

        }


        const a=
          await account(
            env,
            code
          );


        if(!a){

          return json(
            {
              message:
                'این کد وجود ندارد'
            },
            404
          );

        }


        if(a.blocked){

          return json(
            {
              message:
                'حساب کاربری شما مسدود است.'
            },
            403
          );

        }


        return json(a);

      }


      /* ===================================================
         CATALOG
      =================================================== */

      if(
        path==='/api/catalog'
      ){

        return json({

          equipment:
            Object.fromEntries(
              Object.entries(
                CATALOG
              ).map(
                ([k,v])=>[
                  k,
                  v.map(
                    x=>({
                      name:x[0],
                      key:x[1],
                      price:x[2]
                    })
                  )
                ]
              )
            ),

          income:
            INCOME.map(
              x=>({
                name:x[0],
                key:x[1],
                price:x[2],
                daily:x[3]
              })
            )

        });

      }


      /* ===================================================
         SEASON SETTINGS
      =================================================== */

      if(
        path==='/api/season/settings' &&
        req.method==='GET'
      ){

        return json({

          war_enabled:
            (
              await setting(
                env,
                'war_enabled',
                '1'
              )
            )==='1',

          bitcoin_price:
            Number(
              await setting(
                env,
                'bitcoin_price',
                '120000'
              )
            ),

          season:8,

          name:
            'جنگ جهانی سوم'

        });

      }


      /* ===================================================
         SEASON LOGIN
      =================================================== */

      if(
        path==='/api/season/login' &&
        req.method==='POST'
      ){

        const {code}=
          await req.json();


        const a=
          await auth(
            new Request(
              req.url,
              {
                headers:{
                  'x-user-code':
                    clean(code)
                }
              }
            ),
            env
          );


        if(a.error)
          return a.error;


        return json({
          ok:true,
          code:a.user.code,
          country:a.player.country
        });

      }


      /* ===================================================
         SEASON ME
      =================================================== */

      if(
        path==='/api/season/me' &&
        req.method==='GET'
      ){

        const a=
          await auth(
            req,
            env
          );


        if(a.error)
          return a.error;


        return json(
          await publicPlayer(
            env,
            a.player,
            true
          )
        );

      }


      /* ===================================================
         GOVERNMENTS
      =================================================== */

      if(
        path==='/api/season/governments' &&
        req.method==='GET'
      ){

        const rows =
  await env.DB
    .prepare(`
      SELECT p.*
      FROM s8_players p
      WHERE active=1
    `)
    .all();

const out = [];

for (const p of rows.results || []) {

  out.push(
    await publicPlayer(
      env,
      p,
      false
    )
  );

}

out.sort(
  (a, b) =>
    Number(b.military_power || 0) -
    Number(a.military_power || 0) ||
    Number(a.id || 0) -
    Number(b.id || 0)
);
        }


        return json(out);

      }


      /* ===================================================
         BUY
      =================================================== */

      if(
        path==='/api/season/buy' &&
        req.method==='POST'
      ){

        const a=
          await auth(
            req,
            env
          );


        if(a.error)
          return a.error;


        const d=
          await req.json();


        const key=
          clean(d.key);


        const qty=
          Math.floor(
            Number(d.quantity)
          );


        if(
          !META[key] ||
          !Number.isSafeInteger(qty) ||
          qty<1
        ){

          return json(
            {
              message:
                'خرید نامعتبر است.'
            },
            400
          );

        }


        const m=
          META[key];


        const total=
          m.price*qty;


        if(
          !Number.isSafeInteger(total)
        ){

          return json(
            {
              message:
                'مبلغ خرید نامعتبر است.'
            },
            400
          );

        }


        if(
          Number(a.player.dollars)<
          total
        ){

          return json(
            {
              message:
                'موجودی کافی نیست'
            },
            400
          );

        }


        const transactionId=
          txCode();


        /* -----------------------------------------------
           درآمدزا
        ------------------------------------------------ */

        if(
          m.category==='income'
        ){

          const result=
            await env.DB
              .prepare(`
                UPDATE s8_players
                SET
                  dollars=dollars-?,
                  updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                AND dollars>=?
              `)
              .bind(
                total,
                a.player.id,
                total
              )
              .run();


          if(
            !result.meta?.changes
          ){

            return json(
              {
                message:
                  'موجودی کافی نیست'
              },
              400
            );

          }


          await env.DB.batch([

            env.DB.prepare(`
              INSERT INTO s8_income_assets(
                player_id,
                kind,
                qty
              )
              VALUES(?,?,?)
              ON CONFLICT(player_id,kind)
              DO UPDATE SET
                qty=qty+excluded.qty
            `).bind(
              a.player.id,
              key,
              qty
            ),

            env.DB.prepare(`
              INSERT INTO s8_transactions(
                tx_code,
                player_id,
                user_code,
                type,
                description,
                amount,
                quantity,
                item_key
              )
              VALUES(?,?,?,?,?,?,?,?)
            `).bind(
              transactionId,
              a.player.id,
              a.user.code,
              'buy',
              m.name,
              total,
              qty,
              key
            )

          ]);


          return json({
            message:
              'پرداخت موفق',
            transaction_id:
              transactionId
          });

        }


        /* -----------------------------------------------
           تجهیزات نظامی
        ------------------------------------------------ */

        const result=
          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                dollars=dollars-?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
              AND dollars>=?
            `)
            .bind(
              total,
              a.player.id,
              total
            )
            .run();


        if(
          !result.meta?.changes
        ){

          return json(
            {
              message:
                'موجودی کافی نیست'
            },
            400
          );

        }


        await env.DB.batch([

          env.DB.prepare(`
            UPDATE s8_assets
            SET
              ${key}=${key}+?
            WHERE player_id=?
          `).bind(
            qty,
            a.player.id
          ),

          env.DB.prepare(`
            INSERT INTO s8_transactions(
              tx_code,
              player_id,
              user_code,
              type,
              description,
              amount,
              quantity,
              item_key
            )
            VALUES(?,?,?,?,?,?,?,?)
          `).bind(
            transactionId,
            a.player.id,
            a.user.code,
            'buy',
            m.name,
            total,
            qty,
            key
          )

        ]);


        return json({
          message:
            'پرداخت موفق',
          transaction_id:
            transactionId
        });

      }


      /* ===================================================
         BUY BATCH
      =================================================== */

      if(
        path==='/api/season/buy-batch' &&
        req.method==='POST'
      ){

        const a=
          await auth(
            req,
            env
          );


        if(a.error)
          return a.error;


        const d=
          await req.json();


        if(
          !Array.isArray(d.items) ||
          !d.items.length
        ){

          return json(
            {
              message:
                'هیچ خریدی انتخاب نشده است.'
            },
            400
          );

        }


        const items=[];
        const seen=new Set();
        let total=0;


        for(
          const item of d.items
        ){

          const key=
            clean(item?.key);


          const qty=
            Math.floor(
              Number(
                item?.quantity
              )
            );


          if(seen.has(key)){

            return json(
              {
                message:
                  'یک تجهیز بیش از یک بار انتخاب شده است.'
              },
              400
            );

          }


          seen.add(key);


          if(
            !META[key] ||
            !Number.isSafeInteger(qty) ||
            qty<2
          ){

            return json(
              {
                message:
                  'اطلاعات یکی از خریدها نامعتبر است.'
              },
              400
            );

          }


          const m=
            META[key];


          const cost=
            m.price*qty;


          if(
            !Number.isSafeInteger(cost)
          ){

            return json(
              {
                message:
                  'مبلغ یکی از خریدها نامعتبر است.'
              },
              400
            );

          }


          total+=cost;


          items.push({
            key,
            qty,
            meta:m,
            cost
          });

        }


        if(
          !Number.isSafeInteger(total)
        ){

          return json(
            {
              message:
                'مبلغ کل خرید نامعتبر است.'
            },
            400
          );

        }


        if(
          Number(a.player.dollars)<
          total
        ){

          return json(
            {
              message:
                'موجودی کافی نیست'
            },
            400
          );

        }


        /*
           اول پول را به صورت اتمیک کم می‌کنیم.
           اگر پول کافی نباشد، هیچ تجهیزی اضافه نمی‌شود.
        */

        const debit=
          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                dollars=dollars-?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
              AND dollars>=?
            `)
            .bind(
              total,
              a.player.id,
              total
            )
            .run();


        if(
          !debit.meta?.changes
        ){

          return json(
            {
              message:
                'موجودی کافی نیست'
            },
            400
          );

        }


        const statements=[];


        for(
          const item of items
        ){

          const transactionId=
            txCode();


          if(
            item.meta.category==='income'
          ){

            statements.push(
              env.DB.prepare(`
                INSERT INTO s8_income_assets(
                  player_id,
                  kind,
                  qty
                )
                VALUES(?,?,?)
                ON CONFLICT(player_id,kind)
                DO UPDATE SET
                  qty=qty+excluded.qty
              `).bind(
                a.player.id,
                item.key,
                item.qty
              )
            );

          }else{

            statements.push(
              env.DB.prepare(`
                UPDATE s8_assets
                SET
                  ${item.key}=
                  ${item.key}+?
                WHERE player_id=?
              `).bind(
                item.qty,
                a.player.id
              )
            );

          }


          statements.push(
            env.DB.prepare(`
              INSERT INTO s8_transactions(
                tx_code,
                player_id,
                user_code,
                type,
                description,
                amount,
                quantity,
                item_key
              )
              VALUES(?,?,?,?,?,?,?,?)
            `).bind(
              transactionId,
              a.player.id,
              a.user.code,
              'buy',
              item.meta.name,
              item.cost,
              item.qty,
              item.key
            )
          );

        }


        await env.DB.batch(
          statements
        );


        return json({
          message:
            'خرید کل با موفقیت انجام شد.',
          total,
          count:
            items.length
        });

      }


      /* ===================================================
         TRANSFER
      =================================================== */

      if(
        path==='/api/season/transfer' &&
        req.method==='POST'
      ){

        const a=
          await auth(
            req,
            env
          );


        if(a.error)
          return a.error;


        const d=
          await req.json();


        const toCountry=
          clean(
            d.to_country||
            d.country
          );


        const oldToCode=
          clean(
            d.to_code
          ).toUpperCase();


        const key=
          clean(d.key);


        const qty=
          Math.floor(
            Number(d.quantity)
          );


        let b=null;


        if(toCountry){

          b=
            await env.DB
              .prepare(`
                SELECT *
                FROM s8_players
                WHERE country=?
                AND active=1
              `)
              .bind(toCountry)
              .first();

        }else if(oldToCode){

          b=
            await env.DB
              .prepare(`
                SELECT *
                FROM s8_players
                WHERE user_code=?
                AND active=1
              `)
              .bind(oldToCode)
              .first();

        }


        if(
          !b ||
          b.id===a.player.id
        ){

          return json(
            {
              message:
                'گیرنده معتبر نیست.'
            },
            400
          );

        }


        if(
          ![
            'dollars',
            'oil',
            ...allAssetKeys
          ].includes(key)
        ){

          return json(
            {
              message:
                'دارایی قابل انتقال نیست.'
            },
            400
          );

        }


        if(
          META[key]?.category==='income'
        ){

          return json(
            {
              message:
                'دارایی‌های درآمدزا قابل انتقال نیستند.'
            },
            400
          );

        }


        if(
          !Number.isSafeInteger(qty) ||
          qty<1
        ){

          return json(
            {
              message:
                'مقدار انتقال نامعتبر است.'
            },
            400
          );

        }


        const cnt=
          await env.DB
            .prepare(`
              SELECT COUNT(*) n
              FROM s8_transfers
              WHERE sender_player_id=?
              AND created_at>=date('now')
            `)
            .bind(
              a.player.id
            )
            .first();


        if(
          Number(cnt?.n||0)>=3
        ){

          return json(
            {
              message:
                'سقف ۳ انتقال امروز شما پر شده است.'
            },
            400
          );

        }


        const transactionId=
          txCode();


        if(
          key==='dollars' ||
          key==='oil'
        ){

          if(
            Number(a.player[key])<qty
          ){

            return json(
              {
                message:
                  'موجودی کافی نیست'
              },
              400
            );

          }


          await env.DB.batch([

            env.DB.prepare(`
              UPDATE s8_players
              SET
                ${key}=${key}-?
              WHERE id=?
            `).bind(
              qty,
              a.player.id
            ),

            env.DB.prepare(`
              UPDATE s8_players
              SET
                ${key}=${key}+?
              WHERE id=?
            `).bind(
              qty,
              b.id
            )

          ]);

        }else{

          const senderAsset=
            await env.DB
              .prepare(`
                SELECT ${key}
                FROM s8_assets
                WHERE player_id=?
              `)
              .bind(
                a.player.id
              )
              .first();


          if(
            Number(
              senderAsset?.[key]||0
            )<qty
          ){

            return json(
              {
                message:
                  'موجودی کافی نیست'
              },
              400
            );

          }


          await env.DB.batch([

            env.DB.prepare(`
              UPDATE s8_assets
              SET
                ${key}=${key}-?
              WHERE player_id=?
            `).bind(
              qty,
              a.player.id
            ),

            env.DB.prepare(`
              UPDATE s8_assets
              SET
                ${key}=${key}+?
              WHERE player_id=?
            `).bind(
              qty,
              b.id
            )

          ]);

        }


        await env.DB.batch([

          env.DB.prepare(`
            INSERT INTO s8_transfers(
              tx_code,
              sender_player_id,
              receiver_player_id,
              kind,
              asset_key,
              quantity
            )
            VALUES(?,?,?,?,?,?)
          `).bind(
            transactionId,
            a.player.id,
            b.id,
            key,
            key,
            qty
          ),

          env.DB.prepare(`
            INSERT INTO s8_transactions(
              tx_code,
              player_id,
              user_code,
              type,
              description,
              amount,
              quantity,
              item_key
            )
            VALUES(?,?,?,?,?,?,?,?)
          `).bind(
            transactionId,
            a.player.id,
            a.user.code,
            'transfer',
            `انتقال ${key} به ${b.country}`,
            0,
            qty,
            key
          )

        ]);


        return json({
          message:
            'انتقال با موفقیت انجام شد',
          transaction_id:
            transactionId
        });

      }


      /* ===================================================
         BATTLE
      =================================================== */

      if(
        path==='/api/season/battle' &&
        req.method==='POST'
      ){

        const a=
          await auth(
            req,
            env
          );


        if(a.error)
          return a.error;


        if(
          (
            await setting(
              env,
              'war_enabled',
              '1'
            )
          )!=='1'
        ){

          return json(
            {
              message:
                'جنگ در حال حاضر غیرفعال است.'
            },
            403
          );

        }


        const d=
          await req.json();


        const mode=
          d.mode==='defense'
            ?'defense'
            :'war';


        const toCountry=
          clean(
            d.to_country||
            d.country
          );


        const oldToCode=
          clean(
            d.to_code
          ).toUpperCase();


        const scenario=
          clean(
            d.scenario
          );


        if(!scenario){

          return json(
            {
              message:
                'سناریو را وارد کنید.'
            },
            400
          );

        }


        let defender=null;


        if(toCountry){

          defender=
            await env.DB
              .prepare(`
                SELECT *
                FROM s8_players
                WHERE country=?
                AND active=1
              `)
              .bind(toCountry)
              .first();

        }else if(oldToCode){

          defender=
            await env.DB
              .prepare(`
                SELECT *
                FROM s8_players
                WHERE user_code=?
                AND active=1
              `)
              .bind(oldToCode)
              .first();

        }


        if(
          !defender ||
          defender.id===a.player.id
        ){

          return json(
            {
              message:
                'کشور حریف معتبر نیست.'
            },
            400
          );

        }


        const allowed=
          mode==='defense'
            ?defenseKeys
            :warKeys;


        const selected=
          d.assets||{};


        const cleaned=[];


        const currentAssets=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_assets
              WHERE player_id=?
            `)
            .bind(
              a.player.id
            )
            .first();


        for(
          const [k,v]
          of Object.entries(selected)
        ){

          const q=
            Math.floor(
              Number(v)
            );


          if(q>0){

            if(
              !allowed.includes(k)
            ){

              return json(
                {
                  message:
                    'این تجهیز برای این نوع نبرد مجاز نیست.'
                },
                400
              );

            }


            if(
              Number(
                currentAssets?.[k]||0
              )<q
            ){

              return json(
                {
                  message:
                    `تعداد ${META[k]?.name||k} کافی نیست.`
                },
                400
              );

            }


            cleaned.push([
              k,
              q
            ]);

          }

        }


        if(!cleaned.length){

          return json(
            {
              message:
                'حداقل یک تجهیز انتخاب کنید.'
            },
            400
          );

        }


        const code=
          txCode();


        const first=
          await env.DB
            .prepare(`
              INSERT INTO s8_battles(
                code,
                attacker_player_id,
                defender_player_id,
                mode,
                scenario
              )
              VALUES(?,?,?,?,?)
              RETURNING id
            `)
            .bind(
              code,
              a.player.id,
              defender.id,
              mode,
              scenario
            )
            .first();


        if(!first){

          return json(
            {
              message:
                'ثبت سناریو انجام نشد.'
            },
            500
          );

        }


        const stm=[];


        for(
          const [k,q]
          of cleaned
        ){

          stm.push(
            env.DB.prepare(`
              UPDATE s8_assets
              SET
                ${k}=${k}-?
              WHERE player_id=?
            `).bind(
              q,
              a.player.id
            )
          );


          stm.push(
            env.DB.prepare(`
              INSERT INTO s8_battle_assets(
                battle_id,
                asset_key,
                quantity
              )
              VALUES(?,?,?)
            `).bind(
              first.id,
              k,
              q
            )
          );

        }


        await env.DB.batch(
          stm
        );


        return json({
          message:
            'سناریو ارسال شد',
          code
        });

      }


      /* ===================================================
         TRANSACTIONS
      =================================================== */

      if(
        path==='/api/season/transactions' &&
        req.method==='GET'
      ){

        const a=
          await auth(
            req,
            env
          );


        if(a.error)
          return a.error;


        const r=
          await env.DB
            .prepare(`
              SELECT
                tx_code,
                type,
                description,
                amount,
                quantity,
                created_at
              FROM s8_transactions
              WHERE player_id=?
              ORDER BY id DESC
              LIMIT 100
            `)
            .bind(
              a.player.id
            )
            .all();


        return json(
          r.results||[]
        );

      }


      /* ===================================================
         ADMIN LOGIN
      =================================================== */

      if(
        path==='/api/admin/login' &&
        req.method==='POST'
      ){

        if(!env.ADMIN_PASSWORD){

          return json(
            {
              message:
                'ADMIN_PASSWORD تنظیم نشده است.'
            },
            500
          );

        }


        const d=
          await req.json();


        if(
          d.password!==
          env.ADMIN_PASSWORD
        ){

          return json(
            {
              message:
                'رمز عبور اشتباه است.'
            },
            401
          );

        }


        return json({
          token:
            await makeToken(env)
        });

      }


      /* ===================================================
         ADMIN AUTH
      =================================================== */

      if(
        path.startsWith('/api/admin/')
      ){

        if(
          !(await adminOK(req,env))
        ){

          return json(
            {
              message:
                'دسترسی غیرمجاز'
            },
            401
          );

        }

      }


      /* ===================================================
         ADMIN USERS
      =================================================== */

      if(
        path==='/api/admin/users' &&
        req.method==='GET'
      ){

        const r=
          await env.DB
            .prepare(
              'SELECT * FROM users ORDER BY id DESC'
            )
            .all();


        return json(
          r.results||[]
        );

      }


      if(
        path==='/api/admin/users' &&
        req.method==='POST'
      ){

        const d=
          await req.json();


        const code=
          clean(d.code)
            .toUpperCase();


        const name=
          clean(d.name);


        const total=
          Math.floor(
            Number(
              d.total_games||0
            )
          );


        const wins=
          Math.floor(
            Number(
              d.wins??
              d.victories??
              0
            )
          );


        if(
          !/^POW\d+$/.test(code) ||
          !name ||
          total<0 ||
          wins<0 ||
          wins>total
        ){

          return json(
            {
              message:
                'اطلاعات نامعتبر است.'
            },
            400
          );

        }


        const s=
          await userSchema(env);


        try{

          await env.DB
            .prepare(`
              INSERT INTO users(
                code,
                name,
                total_games,
                ${s.victories},
                loyalty_date
              )
              VALUES(?,?,?,?,?)
            `)
            .bind(
              code,
              name,
              total,
              wins,
              d.loyalty_date||
              new Date().toISOString()
            )
            .run();


          return json({
            message:
              'کاربر اضافه شد'
          });

        }catch(e){

          return json(
            {
              message:
                String(e).includes(
                  'UNIQUE'
                )
                  ?'این کد قبلاً ثبت شده است.'
                  :'خطا در ثبت کاربر.'
            },
            409
          );

        }

      }


      /* ===================================================
         ADMIN USER EDIT / BLOCK
      =================================================== */

      if(
        path.startsWith('/api/admin/users/') &&
        req.method==='PUT'
      ){

        const code=
          decodeURIComponent(
            path.split('/').pop()
          ).toUpperCase();


        const d=
          await req.json();


        const s=
          await userSchema(env);


        if(
          d.action==='block'
        ){

          let until=
            'permanent';


          if(
            d.type==='month'
          ){

            until=
              new Date(
                Date.now()+
                30*86400000
              ).toISOString();

          }

          else if(
            d.type==='season'
          ){

            until='season';

          }


          await env.DB
            .prepare(`
              UPDATE users
              SET
                blocked_until=?,
                ${s.blocked}=?
              WHERE code=?
            `)
            .bind(
              until,
              d.type,
              code
            )
            .run();


          return json({
            message:
              'کاربر مسدود شد'
          });

        }


        if(
          d.action==='unblock'
        ){

          await env.DB
            .prepare(`
              UPDATE users
              SET
                blocked_until=NULL,
                ${s.blocked}=NULL
              WHERE code=?
            `)
            .bind(
              code
            )
            .run();


          return json({
            message:
              'مسدودی برداشته شد'
          });

        }


        await env.DB
          .prepare(`
            UPDATE users
            SET
              name=?,
              total_games=?,
              ${s.victories}=?
            WHERE code=?
          `)
          .bind(
            clean(d.name),
            Number(d.total_games),
            Number(
              d.wins??
              d.victories??
              0
            ),
            code
          )
          .run();


        return json({
          message:
            'ویرایش شد'
        });

      }


      /* ===================================================
         ADMIN USER DELETE
      =================================================== */

      if(
        path.startsWith('/api/admin/users/') &&
        req.method==='DELETE'
      ){

        const code=
          decodeURIComponent(
            path.split('/').pop()
          ).toUpperCase();


        await env.DB
          .prepare(
            'DELETE FROM users WHERE code=?'
          )
          .bind(code)
          .run();


        return json({
          message:
            'حذف شد'
        });

      }


      /* ===================================================
         ADMIN PLAYERS
      =================================================== */

      if(
        path==='/api/admin/players' &&
        req.method==='GET'
      ){

        const r=
          await env.DB
            .prepare(`
              SELECT
                p.*,
                u.name
              FROM s8_players p
              JOIN users u
                ON u.code=p.user_code
              WHERE p.active=1
              ORDER BY p.dollars DESC
            `)
            .all();


        return json(
          r.results||[]
        );

      }


      /* ===================================================
         ADMIN ADD PLAYER
      =================================================== */

      if(
        path==='/api/admin/players' &&
        req.method==='POST'
      ){

        const d=
          await req.json();


        const code=
          clean(
            d.user_code
          ).toUpperCase();


        const country=
          clean(d.country);


        const u=
          await getUser(
            env,
            code
          );


        if(!u){

          return json(
            {
              message:
                'کاربر وجود ندارد'
            },
            404
          );

        }


        if(await isBlocked(u)){

          return json(
            {
              message:
                'کاربر مسدود است'
            },
            400
          );

        }


        if(
          await env.DB
            .prepare(`
              SELECT id
              FROM s8_players
              WHERE user_code=?
            `)
            .bind(code)
            .first()
        ){

          return json(
            {
              message:
                'این کاربر قبلاً وارد سیزن شده است.'
            },
            409
          );

        }


        if(!country){

          return json(
            {
              message:
                'کشور را وارد کنید.'
            },
            400
          );

        }


        if(
          await env.DB
            .prepare(`
              SELECT id
              FROM s8_players
              WHERE country=?
              AND active=1
            `)
            .bind(country)
            .first()
        ){

          return json(
            {
              message:
                'این کشور قبلاً انتخاب شده است.'
            },
            409
          );

        }


        const oil=
          Math.max(
            0,
            Math.floor(
              Number(
                d.oil||0
              )
            )
          );


        const isAI=
          d.is_ai===true ||
          d.is_ai===1 ||
          d.is_ai==='1' ||
          d.is_ai==='true';


        const r=
          await env.DB
            .prepare(`
              INSERT INTO s8_players(
                user_code,
                country,
                dollars,
                oil,
                is_ai,
                ai_active,
                ai_memory
              )
              VALUES(
                ?,?,
                10000,
                ?,
                ?,
                ?,
                '{}'
              )
              RETURNING id
            `)
            .bind(
              code,
              country,
              oil,
              isAI?1:0,
              isAI?1:0
            )
            .first();


        await env.DB
          .prepare(`
            INSERT INTO s8_assets(
              player_id
            )
            VALUES(?)
          `)
          .bind(r.id)
          .run();


        if(isAI){

          await aiSchedule(
            env,
            r.id,
            1,
            4
          );

        }


        return json({
          message:
            isAI
              ?'بازیکن AI سیزن ۸ ثبت شد'
              :'بازیکن سیزن ۸ ثبت شد',
          is_ai:
            isAI
        });

      }


      /* ===================================================
         ADMIN PLAYER EDIT
      =================================================== */

      if(
        path.startsWith('/api/admin/players/') &&
        req.method==='PUT'
      ){

        const id=
          Number(
            path.split('/').pop()
          );


        const d=
          await req.json();


        const p=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_players
              WHERE id=?
            `)
            .bind(id)
            .first();


        if(!p){

          return json(
            {
              message:
                'بازیکن پیدا نشد'
            },
            404
          );

        }


        if(
          d.action==='ai'
        ){

          const enabled=
            d.enabled===true ||
            d.enabled===1 ||
            d.enabled==='1' ||
            d.enabled==='true';


          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                is_ai=?,
                ai_active=?,
                ai_next_action_at=?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              enabled?1:0,
              enabled?1:0,
              enabled
                ?new Date(
                    Date.now()+
                    randomInt(
                      1,
                      5
                    )*60*1000
                  ).toISOString()
                :null,
              id
            )
            .run();


          await aiLog(
            env,
            id,
            enabled
              ?'enabled'
              :'disabled',
            {
              by:'admin'
            }
          );


          return json({
            message:
              enabled
                ?'هوش مصنوعی فعال شد.'
                :'هوش مصنوعی غیرفعال شد.',
            is_ai:
              enabled
          });

        }


        if(
          d.action==='country'
        ){

          const c=
            clean(d.country);


          if(!c){

            return json(
              {
                message:
                  'کشور را وارد کنید.'
              },
              400
            );

          }


          if(
            await env.DB
              .prepare(`
                SELECT id
                FROM s8_players
                WHERE country=?
                AND id<>?
                AND active=1
              `)
              .bind(c,id)
              .first()
          ){

            return json(
              {
                message:
                  'این کشور در اختیار بازیکن دیگری است.'
              },
              409
            );

          }


          const zeros=
            allAssetKeys
              .map(
                k=>`${k}=0`
              )
              .join(',');


          await env.DB.batch([

            env.DB.prepare(`
              UPDATE s8_players
              SET
                country=?,
                dollars=10000,
                oil=0,
                income_daily=0,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `).bind(
              c,
              id
            ),

            env.DB.prepare(`
              UPDATE s8_assets
              SET ${zeros}
              WHERE player_id=?
            `).bind(id),

            env.DB.prepare(`
              DELETE FROM s8_income_assets
              WHERE player_id=?
            `).bind(id)

          ]);


          return json({
            message:
              'کشور تغییر کرد و دارایی‌ها به ۱۰٬۰۰۰ دلار بازنشانی شدند.'
          });

        }


        return json(
          {
            message:
              'عملیات نامعتبر'
          },
          400
        );

      }


      /* ===================================================
         ADMIN GRANT
      =================================================== */

      if(
        path==='/api/admin/grant' &&
        req.method==='POST'
      ){

        const d=
          await req.json();


        const p=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_players
              WHERE id=?
            `)
            .bind(
              Number(
                d.player_id
              )
            )
            .first();


        const kind=
          clean(d.kind);


        const q=
          Math.floor(
            Number(
              d.quantity
            )
          );


        if(!p){

          return json(
            {
              message:
                'بازیکن پیدا نشد'
            },
            404
          );

        }


        if(q<1){

          return json(
            {
              message:
                'مقدار نامعتبر است.'
            },
            400
          );

        }


        if(
          kind==='dollars' ||
          kind==='oil'
        ){

          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                ${kind}=${kind}+?
              WHERE id=?
            `)
            .bind(
              q,
              p.id
            )
            .run();

        }

        else if(
          META[kind] &&
          META[kind].category!=='income'
        ){

          await env.DB
            .prepare(`
              UPDATE s8_assets
              SET
                ${kind}=${kind}+?
              WHERE player_id=?
            `)
            .bind(
              q,
              p.id
            )
            .run();

        }

        else if(
          META[kind]?.category==='income'
        ){

          await env.DB
            .prepare(`
              INSERT INTO s8_income_assets(
                player_id,
                kind,
                qty
              )
              VALUES(?,?,?)
              ON CONFLICT(player_id,kind)
              DO UPDATE SET
                qty=qty+excluded.qty
            `)
            .bind(
              p.id,
              kind,
              q
            )
            .run();

        }

        else{

          return json(
            {
              message:
                'دارایی نامعتبر است.'
            },
            400
          );

        }


        return json({
          message:
            'اعطا شد'
        });

      }


      /* ===================================================
         ADMIN AI LOGS
      =================================================== */

      if(
        path==='/api/admin/ai-logs' &&
        req.method==='GET'
      ){

        const r=
          await env.DB
            .prepare(`
              SELECT
                l.*,
                p.country
              FROM s8_ai_logs l
              LEFT JOIN s8_players p
                ON p.id=l.player_id
              ORDER BY l.id DESC
              LIMIT 500
            `)
            .all();


        return json(
          r.results||[]
        );

      }


      /* ===================================================
         ADMIN TRANSACTIONS
      =================================================== */

      if(
        path==='/api/admin/transactions' &&
        req.method==='GET'
      ){

        const r=
          await env.DB
            .prepare(`
              SELECT
                t.*,
                p.country
              FROM s8_transactions t
              LEFT JOIN s8_players p
                ON p.id=t.player_id
              ORDER BY t.id DESC
              LIMIT 500
            `)
            .all();


        return json(
          r.results||[]
        );

      }


      /* ===================================================
         ADMIN BATTLES
      =================================================== */

      if(
        path==='/api/admin/battles' &&
        req.method==='GET'
      ){

        const r=
          await env.DB
            .prepare(`
              SELECT
                b.*,
                a.country attacker_country,
                d.country defender_country
              FROM s8_battles b
              JOIN s8_players a
                ON a.id=b.attacker_player_id
              JOIN s8_players d
                ON d.id=b.defender_player_id
              WHERE b.status='pending'
              ORDER BY b.id ASC
            `)
            .all();


        const out=[];


        for(
          const b of r.results||[]
        ){

          const ar=
            await env.DB
              .prepare(`
                SELECT
                  asset_key,
                  quantity
                FROM s8_battle_assets
                WHERE battle_id=?
              `)
              .bind(b.id)
              .all();


          out.push({
            ...b,
            assets:
              ar.results||[]
          });

        }


        return json(out);

      }


      /* ===================================================
         ADMIN REVIEW BATTLE
      =================================================== */

      if(
        path.startsWith('/api/admin/battles/') &&
        req.method==='PUT'
      ){

        const id=
          Number(
            path.split('/').pop()
          );


        const d=
          await req.json();


        const b=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_battles
              WHERE id=?
              AND status='pending'
            `)
            .bind(id)
            .first();


        if(!b){

          return json(
            {
              message:
                'سناریو پیدا نشد یا قبلاً بررسی شده.'
            },
            404
          );

        }


        const rows=
          await env.DB
            .prepare(`
              SELECT
                asset_key,
                quantity
              FROM s8_battle_assets
              WHERE battle_id=?
            `)
            .bind(id)
            .all();


        const stm=[

          env.DB.prepare(`
            UPDATE s8_battles
            SET
              status=?,
              reviewed_at=CURRENT_TIMESTAMP
            WHERE id=?
          `).bind(
            d.approved
              ?'approved'
              :'rejected',
            id
          )

        ];


        if(!d.approved){

          for(
            const r of rows.results||[]
          ){

            stm.push(
              env.DB.prepare(`
                UPDATE s8_assets
                SET
                  ${r.asset_key}=
                  ${r.asset_key}+?
                WHERE player_id=?
              `).bind(
                r.quantity,
                b.attacker_player_id
              )
            );

          }

        }


        await env.DB.batch(stm);


        return json({
          message:
            d.approved
              ?'سناریو بررسی و بسته شد.'
              :'سناریو رد شد و تجهیزات برگشت.'
        });

      }


      /* ===================================================
         ADMIN WAR
      =================================================== */

      if(
        path==='/api/admin/war' &&
        req.method==='POST'
      ){

        const d=
          await req.json();


        await env.DB
          .prepare(`
            INSERT INTO s8_settings(
              key,
              value
            )
            VALUES(?,?)
            ON CONFLICT(key)
            DO UPDATE SET
              value=excluded.value
          `)
          .bind(
            'war_enabled',
            d.enabled?'1':'0'
          )
          .run();


        return json({
          message:
            'انجام شد'
        });

      }


      /* ===================================================
         ADMIN BITCOIN
      =================================================== */

      if(
        path==='/api/admin/bitcoin' &&
        req.method==='POST'
      ){

        const price=
          Math.floor(
            Number(
              (await req.json())
                .price
            )
          );


        if(
          !Number.isSafeInteger(price) ||
          price<0
        ){

          return json(
            {
              message:
                'قیمت نامعتبر است.'
            },
            400
          );

        }


        await env.DB
          .prepare(`
            INSERT INTO s8_settings(
              key,
              value
            )
            VALUES(?,?)
            ON CONFLICT(key)
            DO UPDATE SET
              value=excluded.value
          `)
          .bind(
            'bitcoin_price',
            String(price)
          )
          .run();


        return json({
          message:
            'قیمت بیت‌کوین ثبت شد.'
        });

      }


      /* ===================================================
         ADMIN AI TEST / MANUAL TICK
      =================================================== */

      if(
        path==='/api/admin/ai-tick' &&
        req.method==='POST'
      ){

        await aiTick(env);

        return json({
          message:
            'چرخه AI اجرا شد.'
        });

      }


      /* ===================================================
         ADMIN TEST
      =================================================== */

      if(
        path==='/api/admin/test-state' &&
        req.method==='GET'
      ){

        return json({

          db:'OK',

          season:8,

          war_enabled:
            (
              await setting(
                env,
                'war_enabled',
                '1'
              )
            )==='1'

        });

      }


      /* ===================================================
         STATIC
      =================================================== */

      return env.ASSETS.fetch(req);


    }catch(e){

      return json(
        {
          message:
            'خطای سرور',

          detail:
            String(
              e?.message||e
            )
        },
        500
      );

    }

  }

};
