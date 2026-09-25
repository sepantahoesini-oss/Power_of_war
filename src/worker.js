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

  let rank=0;

  try{

    const ranks=
      await env.DB
        .prepare(`
          SELECT id
          FROM s8_players
          WHERE active=1
          ORDER BY dollars DESC,id ASC
        `)
        .all();

    rank=
      (ranks.results||[])
        .findIndex(
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

    assets,

    income_assets:incomes,

    rank

  };

  if(includeCode)
    result.code=p.user_code;

  return result;

}


/* =========================================================
   DAILY INCOME — اصلاح‌شده
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

  /*
     قفل اتمیک روزانه:
     فقط یک درخواست می‌تواند روز را claim کند.
  */

  const claim=
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
        WHERE s8_settings.value<>excluded.value
      `)
      .bind(
        'last_income_day',
        day
      )
      .run();

  if(
    Number(claim.meta?.changes||0)!==1
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

    if(total<=0)
      continue;

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


/* ---------------------------------------------------------
   AI خرید — اصلاح‌شده
--------------------------------------------------------- */

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

  if(
    !Number.isSafeInteger(quantity)
  )
    return false;

  const cost=
    meta.price*quantity;

  if(
    !Number.isSafeInteger(cost) ||
    Number(p.dollars)<cost
  )
    return false;

  /*
     اول پول به‌صورت اتمیک کم می‌شود.
     این قسمت جلوی خرید همزمان و دوباره‌خرج‌کردن
     موجودی را می‌گیرد.
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
        cost,
        p.id,
        cost
      )
      .run();

  if(
    Number(debit.meta?.changes||0)!==1
  )
    return false;

  try{

    const id=txCode();

    if(meta.category==='income'){

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

  }catch(err){

    /*
       اگر ثبت دارایی/تراکنش شکست خورد،
       پول خرج‌شده برگردانده می‌شود.
    */

    await env.DB
      .prepare(`
        UPDATE s8_players
        SET
          dollars=dollars+?,
          updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `)
      .bind(
        cost,
        p.id
      )
      .run();

    return false;

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


/* ---------------------------------------------------------
   AI انتخاب خرید
--------------------------------------------------------- */

async function aiChoosePurchase(
  env,
  p,
  memory,
  assets
){

  const money=
    Number(p.dollars||0);

  if(money<1000)
    return null;


  const incomeRows=
    INCOME.filter(
      x=>x[2]<=money
    );

  const defenseOwned=
    defenseKeys.reduce(
      (s,k)=>
        s+
        Number(
          assets?.[k]||0
        ),
      0
    );

  const militaryOwned=
    CATALOG.military
      .map(x=>x[1])
      .reduce(
        (s,k)=>
          s+
          Number(
            assets?.[k]||0
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
      incomeRows
        .slice(
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
      CATALOG.defense
        .filter(
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
      CATALOG.military
        .filter(
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


  /*
     در صورت داشتن پول کافی،
     AI از دسته‌های مختلف انتخاب می‌کند
     تا رفتار کاملاً ثابت نباشد.
  */

  const allAffordable=
    Object.values(CATALOG)
      .flat()
      .filter(
        x=>x[2]<=money
      );

  if(!allAffordable.length)
    return null;

  const sample=
    allAffordable.slice(
      0,
      Math.min(
        allAffordable.length,
        15
      )
    );

  const chosen=
    pick(sample);

  return {
    key:chosen[1],
    quantity:
      money>=chosen[2]*4
        ?randomInt(1,3)
        :1
  };

        }
            );
          }

          stm.push(
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
              txCode(),
              player.id,
              player.user_code,
              'buy',
              item.meta.name,
              item.cost,
              item.qty,
              item.key
            )
          );

        }

        try{

          const result=
            await env.DB.batch(stm);

          const debitResult=
            result?.[0];

          if(
            Number(
              debitResult?.meta?.changes||0
            )!==1
          ){

            return json(
              {
                message:
                  'موجودی کافی نیست یا خرید همزمان انجام شده است.'
              },
              409
            );

          }

        }catch(e){

          return json(
            {
              message:
                'خرید انجام نشد.',
              error:
                String(
                  e?.message||e
                )
            },
            500
          );

        }

        return json({
          ok:true,
          message:
            'خریدها با موفقیت انجام شد.'
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

        const targetCode=
          clean(
            d.target_code
          ).toUpperCase();

        const type=
          clean(
            d.type
          ).toLowerCase();

        const amount=
          Math.floor(
            Number(d.amount)
          );

        if(
          !/^POW\d+$/.test(targetCode)
        ){

          return json(
            {
              message:
                'کد مقصد نامعتبر است.'
            },
            400
          );

        }

        if(
          targetCode===a.player.user_code
        ){

          return json(
            {
              message:
                'انتقال به خودتان ممکن نیست.'
            },
            400
          );

        }

        if(
          !['dollars','oil'].includes(type)
        ){

          return json(
            {
              message:
                'نوع انتقال نامعتبر است.'
            },
            400
          );

        }

        if(
          !Number.isSafeInteger(amount) ||
          amount<1
        ){

          return json(
            {
              message:
                'مقدار انتقال نامعتبر است.'
            },
            400
          );

        }

        const target=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_players
              WHERE user_code=?
              AND active=1
            `)
            .bind(targetCode)
            .first();

        if(!target){

          return json(
            {
              message:
                'کشور مقصد پیدا نشد.'
            },
            404
          );

        }

        const column=
          type==='oil'
            ?'oil'
            :'dollars';

        const sender=
          await env.DB
            .prepare(`
              SELECT id,${column}
              FROM s8_players
              WHERE id=?
              AND active=1
            `)
            .bind(a.player.id)
            .first();

        if(!sender){

          return json(
            {
              message:
                'کشور مبدا پیدا نشد.'
            },
            404
          );

        }

        if(
          Number(sender[column]||0)<amount
        ){

          return json(
            {
              message:
                'موجودی کافی نیست.'
            },
            400
          );

        }

        /*
           ابتدا موجودی فرستنده اتمیک کم می‌شود.
           بنابراین چند درخواست همزمان نمی‌توانند
           یک موجودی را دوباره خرج کنند.
        */

        const debit=
          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                ${column}=${column}-?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
              AND active=1
              AND ${column}>=?
            `)
            .bind(
              amount,
              sender.id,
              amount
            )
            .run();

        if(
          Number(
            debit.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'موجودی کافی نیست یا انتقال همزمان انجام شده است.'
            },
            409
          );

        }

        try{

          const credit=
            await env.DB
              .prepare(`
                UPDATE s8_players
                SET
                  ${column}=${column}+?,
                  updated_at=CURRENT_TIMESTAMP
                WHERE id=?
                AND active=1
              `)
              .bind(
                amount,
                target.id
              )
              .run();

          if(
            Number(
              credit.meta?.changes||0
            )!==1
          ){

            throw new Error(
              'کشور مقصد دیگر فعال نیست.'
            );

          }

          await env.DB
            .prepare(`
              INSERT INTO s8_transactions(
                tx_code,
                player_id,
                user_code,
                type,
                description,
                amount
              )
              VALUES(?,?,?,?,?,?)
            `)
            .bind(
              txCode(),
              sender.id,
              sender.id===a.player.id
                ?a.player.user_code
                :'',
              'transfer_out',
              `انتقال به ${target.country}`,
              -amount
            )
            .run();

          await env.DB
            .prepare(`
              INSERT INTO s8_transactions(
                tx_code,
                player_id,
                user_code,
                type,
                description,
                amount
              )
              VALUES(?,?,?,?,?,?)
            `)
            .bind(
              txCode(),
              target.id,
              target.user_code,
              'transfer_in',
              `دریافت از ${a.player.country}`,
              amount
            )
            .run();

        }catch(e){

          /*
             اگر مقصد یا ثبت انتقال شکست خورد،
             مبلغ به فرستنده برمی‌گردد.
          */

          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                ${column}=${column}+?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              amount,
              sender.id
            )
            .run();

          return json(
            {
              message:
                'انتقال انجام نشد.',
              error:
                String(
                  e?.message||e
                )
            },
            500
          );

        }

        return json({
          ok:true,
          message:
            'انتقال با موفقیت انجام شد.'
        });

      }


      /* ===================================================
         BATTLE CREATE
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

        const warEnabled=
          await setting(
            env,
            'war_enabled',
            '1'
          );

        if(
          warEnabled!=='1'
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

        const defenderCode=
          clean(
            d.defender_code
          ).toUpperCase();

        const mode=
          clean(
            d.mode
          )||'war';

        const scenario=
          clean(
            d.scenario
          );

        const assets=
          d.assets &&
          typeof d.assets==='object'
            ?d.assets
            :{};

        if(
          !/^POW\d+$/.test(
            defenderCode
          )
        ){

          return json(
            {
              message:
                'کد مدافع نامعتبر است.'
            },
            400
          );

        }

        if(
          defenderCode===a.player.user_code
        ){

          return json(
            {
              message:
                'نمی‌توانید به کشور خودتان حمله کنید.'
            },
            400
          );

        }

        const defender=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_players
              WHERE user_code=?
              AND active=1
            `)
            .bind(
              defenderCode
            )
            .first();

        if(!defender){

          return json(
            {
              message:
                'کشور مدافع پیدا نشد.'
            },
            404
          );

        }

        const selected=[];

        for(
          const [key,value]
          of Object.entries(assets)
        ){

          if(
            !META[key] ||
            META[key].category==='income'
          )
            continue;

          const q=
            Math.floor(
              Number(value)
            );

          if(
            !Number.isSafeInteger(q) ||
            q<1
          )
            continue;

          if(
            mode==='defense' &&
            !defenseKeys.includes(key)
          )
            continue;

          if(
            mode!=='defense' &&
            !warKeys.includes(key)
          )
            continue;

          selected.push({
            key,
            quantity:q
          });

        }

        if(!selected.length){

          return json(
            {
              message:
                'هیچ تجهیزاتی برای جنگ انتخاب نشده است.'
            },
            400
          );

        }

        /*
           ساخت شرط اتمیک برای کم‌کردن تمام تجهیزات.
           اگر حتی یکی از موجودی‌ها کافی نباشد،
           هیچ‌کدام کم نمی‌شوند.
        */

        const where=[];
        const binds=[];

        for(
          const item of selected
        ){

          where.push(
            `${item.key}>=?`
          );

          binds.push(
            item.quantity
          );

        }

        const setParts=[];

        for(
          const item of selected
        ){

          setParts.push(
            `${item.key}=${item.key}-?`
          );

        }

        const setBinds=
          selected.map(
            x=>x.quantity
          );

        const debit=
          await env.DB
            .prepare(`
              UPDATE s8_assets
              SET
                ${setParts.join(',')},
                updated_at=CURRENT_TIMESTAMP
              WHERE player_id=?
              AND ${where.join(' AND ')}
            `)
            .bind(
              ...setBinds,
              a.player.id,
              ...binds
            )
            .run();

        if(
          Number(
            debit.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'موجودی تجهیزات برای این جنگ کافی نیست.'
            },
            409
          );

        }

        const code=
          txCode();

        let battleId=null;

        try{

          const battle=
            await env.DB
              .prepare(`
                INSERT INTO s8_battles(
                  code,
                  attacker_player_id,
                  defender_player_id,
                  mode,
                  scenario,
                  status
                )
                VALUES(?,?,?,?,?,'pending')
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

          if(!battle)
            throw new Error(
              'ساخت جنگ ناموفق بود.'
            );

          battleId=
            battle.id;

          const stm=[];

          for(
            const item of selected
          ){

            stm.push(
              env.DB.prepare(`
                INSERT INTO s8_battle_assets(
                  battle_id,
                  asset_key,
                  quantity
                )
                VALUES(?,?,?)
              `).bind(
                battleId,
                item.key,
                item.quantity
              )
            );

          }

          if(stm.length)
            await env.DB.batch(stm);

        }catch(e){

          /*
             جنگ ساخته نشد؛ تجهیزات کم‌شده
             به کشور مهاجم برگردانده می‌شوند.
          */

          const refunds=
            selected.map(
              item=>
                env.DB.prepare(`
                  UPDATE s8_assets
                  SET
                    ${item.key}=${item.key}+?
                  WHERE player_id=?
                `).bind(
                  item.quantity,
                  a.player.id
                )
            );

          if(refunds.length)
            await env.DB.batch(
              refunds
            );

          return json(
            {
              message:
                'ساخت جنگ انجام نشد.',
              error:
                String(
                  e?.message||e
                )
            },
            500
          );

        }

        return json({
          ok:true,
          battle_id:battleId,
          code,
          message:
            'جنگ با موفقیت ثبت شد.'
        });

      }


      /* ===================================================
         BATTLES
      =================================================== */

      if(
        path==='/api/season/battles' &&
        req.method==='GET'
      ){

        const a=
          await auth(
            req,
            env
          );

        if(a.error)
          return a.error;

        const rows=
          await env.DB
            .prepare(`
              SELECT
                b.*,
                ap.country AS attacker_country,
                dp.country AS defender_country
              FROM s8_battles b
              JOIN s8_players ap
                ON ap.id=b.attacker_player_id
              JOIN s8_players dp
                ON dp.id=b.defender_player_id
              WHERE
                b.attacker_player_id=?
                OR
                b.defender_player_id=?
              ORDER BY b.id DESC
            `)
            .bind(
              a.player.id,
              a.player.id
            )
            .all();

        const out=[];

        for(
          const battle
          of rows.results||[]
        ){

          const assets=
            await env.DB
              .prepare(`
                SELECT
                  asset_key,
                  quantity
                FROM s8_battle_assets
                WHERE battle_id=?
              `)
              .bind(
                battle.id
              )
              .all();

          out.push({
            id:battle.id,
            code:battle.code,
            attacker_country:
              battle.attacker_country,
            defender_country:
              battle.defender_country,
            mode:battle.mode,
            scenario:battle.scenario,
            status:battle.status,
            created_at:battle.created_at,
            reviewed_at:battle.reviewed_at,
            assets:
              assets.results||[]
          });

        }

        return json(out);

      }


      /* ===================================================
         ADMIN AUTH
      =================================================== */

      if(
        path==='/api/admin/login' &&
        req.method==='POST'
      ){

        const d=
          await req.json();

        const password=
          String(
            d.password??''
          );

        if(
          !env.ADMIN_PASSWORD ||
          password!==env.ADMIN_PASSWORD
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
          ok:true,
          token:
            await makeToken(env)
        });

      }


      /* ===================================================
         ADMIN MIDDLEWARE
      =================================================== */

      if(
        path.startsWith('/api/admin/')
      ){

        if(
          !await adminOK(
            req,
            env
          )
        ){

          return json(
            {
              message:
                'دسترسی غیرمجاز است.'
            },
            401
          );

        }

      }


      /* ===================================================
         ADMIN PLAYERS LIST
      =================================================== */

      if(
        path==='/api/admin/players' &&
        req.method==='GET'
      ){

        const rows=
          await env.DB
            .prepare(`
              SELECT
                p.*,
                u.name,
                u.total_games,
                u.loyalty_date
              FROM s8_players p
              LEFT JOIN users u
                ON u.code=p.user_code
              ORDER BY p.id DESC
            `)
            .all();

        return json(
          rows.results||[]
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
            d.code
          ).toUpperCase();

        const country=
          clean(
            d.country
          );

        const dollars=
          Math.max(
            0,
            Math.floor(
              Number(
                d.dollars??10000
              )
            )
          );

        const oil=
          Math.max(
            0,
            Math.floor(
              Number(
                d.oil??0
              )
            )
          );

        const isAI=
          Number(
            d.is_ai??0
          )===1
            ?1
            :0;

        if(
          !/^POW\d+$/.test(code)
        ){

          return json(
            {
              message:
                'کد کاربری نامعتبر است.'
            },
            400
          );

        }

        if(!country){

          return json(
            {
              message:
                'نام کشور الزامی است.'
            },
            400
          );

        }

        if(
          !Number.isSafeInteger(
            dollars
          ) ||
          !Number.isSafeInteger(
            oil
          )
        ){

          return json(
            {
              message:
                'مقادیر مالی نامعتبر هستند.'
            },
            400
          );

        }

        const user=
          await getUser(
            env,
            code
          );

        if(!user){

          return json(
            {
              message:
                'این کد کاربری در جدول کاربران وجود ندارد.'
            },
            404
          );

        }

        try{

          await env.DB.batch([

            env.DB.prepare(`
              INSERT INTO s8_players(
                user_code,
                country,
                dollars,
                oil,
                income_daily,
                active,
                is_ai,
                ai_active,
                ai_memory
              )
              VALUES(?,?,?,?,0,1,?,?,?)
            `).bind(
              code,
              country,
              dollars,
              oil,
              isAI,
              isAI,
              '{}'
            ),

            env.DB.prepare(`
              INSERT INTO s8_assets(
                player_id
              )
              SELECT id
              FROM s8_players
              WHERE user_code=?
            `).bind(
              code
            )

          ]);

        }catch(e){

          return json(
            {
              message:
                'ثبت بازیکن انجام نشد.',
              error:
                String(
                  e?.message||e
                )
            },
            500
          );

        }

        if(isAI){

          await aiSchedule(
            env,
            (
              await env.DB
                .prepare(`
                  SELECT id
                  FROM s8_players
                  WHERE user_code=?
                `)
                .bind(code)
                .first()
            ).id,
            1,
            5
          );

        }

        return json({
          ok:true,
          message:
            isAI
              ?'کشور با موفقیت به هوش مصنوعی واگذار شد.'
              :'کشور با موفقیت اضافه شد.'
        });

      }


      /* ===================================================
         ADMIN TOGGLE AI
      =================================================== */

      if(
        path.startsWith('/api/admin/players/') &&
        req.method==='PUT'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isInteger(id) ||
          id<1
        ){

          return json(
            {
              message:
                'شناسه بازیکن نامعتبر است.'
            },
            400
          );

        }

        const d=
          await req.json();

        if(
          d.action==='ai'
        ){

          const enabled=
            Number(
              d.enabled
            )===1
              ?1
              :0;

          const result=
            await env.DB
              .prepare(`
                UPDATE s8_players
                SET
                  is_ai=?,
                  ai_active=?,
                  ai_next_action_at=
                    CASE
                      WHEN ?=1
                      THEN ?
                      ELSE NULL
                    END,
                  updated_at=CURRENT_TIMESTAMP
                WHERE id=?
              `)
              .bind(
                enabled,
                enabled,
                enabled,
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

          if(
            Number(
              result.meta?.changes||0
            )!==1
          ){

            return json(
              {
                message:
                  'بازیکن پیدا نشد.'
              },
              404
            );

          }

          return json({
            ok:true,
            is_ai:enabled
          });

        }

        return json(
          {
            message:
              'عملیات نامعتبر است.'
          },
          400
        );

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
            Math.max(
              0,
              Math.floor(
                Number(
                  d.total_games||0
                )
              )
            ),
            Math.max(
              0,
              Math.floor(
                Number(
                  d.victories??
                  d.wins??
                  0
                )
              )
            ),
            code
          )
          .run();


        return json({
          message:
            'اطلاعات کاربر ویرایش شد.'
        });

      }


      /* ===================================================
         ADMIN PLAYER DELETE
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/players/'
        ) &&
        req.method==='DELETE'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isSafeInteger(id) ||
          id<1
        ){

          return json(
            {
              message:
                'شناسه بازیکن نامعتبر است.'
            },
            400
          );

        }

        const player=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_players
              WHERE id=?
            `)
            .bind(id)
            .first();

        if(!player){

          return json(
            {
              message:
                'بازیکن پیدا نشد.'
            },
            404
          );

        }

        try{

          await env.DB
            .prepare(`
              DELETE FROM s8_players
              WHERE id=?
            `)
            .bind(id)
            .run();

        }catch(e){

          return json(
            {
              message:
                'حذف بازیکن انجام نشد.',
              error:
                String(
                  e?.message||e
                )
            },
            500
          );

        }

        return json({
          ok:true,
          message:
            'بازیکن حذف شد.'
        });

      }


      /* ===================================================
         ADMIN PLAYER ACTIVATE / DEACTIVATE
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        req.method==='PUT'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isSafeInteger(id) ||
          id<1
        ){

          return json(
            {
              message:
                'شناسه بازیکن نامعتبر است.'
            },
            400
          );

        }

        const d=
          await req.json();

        const active=
          Number(
            d.active
          )===1
            ?1
            :0;

        const result=
          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                active=?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              active,
              id
            )
            .run();

        if(
          Number(
            result.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'بازیکن پیدا نشد.'
            },
            404
          );

        }

        return json({
          ok:true,
          active
        });

      }


      /* ===================================================
         ADMIN BATTLES
      =================================================== */

      if(
        path==='/api/admin/battles' &&
        req.method==='GET'
      ){

        const rows=
          await env.DB
            .prepare(`
              SELECT
                b.*,
                ap.country AS attacker_country,
                dp.country AS defender_country
              FROM s8_battles b
              JOIN s8_players ap
                ON ap.id=b.attacker_player_id
              JOIN s8_players dp
                ON dp.id=b.defender_player_id
              ORDER BY
                b.id DESC
              LIMIT 300
            `)
            .all();

        const result=[];

        for(
          const battle
          of rows.results||[]
        ){

          const assets=
            await env.DB
              .prepare(`
                SELECT
                  asset_key,
                  quantity
                FROM s8_battle_assets
                WHERE battle_id=?
              `)
              .bind(
                battle.id
              )
              .all();

          result.push({
            ...battle,
            assets:
              assets.results||[]
          });

        }

        return json(result);

      }


      /* ===================================================
         ADMIN REVIEW BATTLE
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/battles/'
        ) &&
        req.method==='PUT'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isSafeInteger(id) ||
          id<1
        ){

          return json(
            {
              message:
                'شناسه جنگ نامعتبر است.'
            },
            400
          );

        }

        const d=
          await req.json();

        const action=
          clean(
            d.action
          ).toLowerCase();

        if(
          !['approve','reject']
            .includes(action)
        ){

          return json(
            {
              message:
                'عملیات نامعتبر است.'
            },
            400
          );

        }

        /*
           ابتدا جنگ pending را claim می‌کنیم.
           این کار جلوی این را می‌گیرد که دو درخواست
           همزمان یک جنگ را دوبار بررسی کنند.
        */

        const claim=
          await env.DB
            .prepare(`
              UPDATE s8_battles
              SET
                status=?,
                reviewed_at=CURRENT_TIMESTAMP
              WHERE id=?
              AND status='pending'
            `)
            .bind(
              action==='approve'
                ?'approved'
                :'rejected',
              id
            )
            .run();

        if(
          Number(
            claim.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'این جنگ قبلاً بررسی شده یا وجود ندارد.'
            },
            409
          );

        }

        if(
          action==='reject'
        ){

          const battle=
            await env.DB
              .prepare(`
                SELECT
                  attacker_player_id
                FROM s8_battles
                WHERE id=?
              `)
              .bind(id)
              .first();

          if(!battle){

            return json(
              {
                message:
                  'جنگ پیدا نشد.'
              },
              404
            );

          }

          const assets=
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

          const refunds=[];

          for(
            const item
            of assets.results||[]
          ){

            if(
              !META[item.asset_key]
            )
              continue;

            refunds.push(
              env.DB.prepare(`
                UPDATE s8_assets
                SET
                  ${item.asset_key}=
                  ${item.asset_key}+?
                WHERE player_id=?
              `).bind(
                Number(item.quantity),
                battle.attacker_player_id
              )
            );

          }

          if(refunds.length)
            await env.DB.batch(
              refunds
            );

        }

        return json({
          ok:true,
          status:
            action==='approve'
              ?'approved'
              :'rejected'
        });

      }


      /* ===================================================
         ADMIN AI TICK
      =================================================== */

      if(
        path==='/api/admin/ai-tick' &&
        req.method==='POST'
      ){

        await aiTick(env);

        return json({
          ok:true,
          message:
            'AI tick اجرا شد.'
        });

      }


      /* ===================================================
         ADMIN AI LOGS
      =================================================== */

      if(
        path==='/api/admin/ai-logs' &&
        req.method==='GET'
      ){

        const limit=
          Math.min(
            500,
            Math.max(
              1,
              Number(
                u.searchParams.get(
                  'limit'
                )||100
              )
            )
          );

        const playerId=
          Number(
            u.searchParams.get(
              'player_id'
            )||0
          );

        let rows;

        if(
          Number.isSafeInteger(
            playerId
          ) &&
          playerId>0
        ){

          rows=
            await env.DB
              .prepare(`
                SELECT
                  l.*,
                  p.country
                FROM s8_ai_logs l
                JOIN s8_players p
                  ON p.id=l.player_id
                WHERE l.player_id=?
                ORDER BY l.id DESC
                LIMIT ?
              `)
              .bind(
                playerId,
                limit
              )
              .all();

        }else{

          rows=
            await env.DB
              .prepare(`
                SELECT
                  l.*,
                  p.country
                FROM s8_ai_logs l
                JOIN s8_players p
                  ON p.id=l.player_id
                ORDER BY l.id DESC
                LIMIT ?
              `)
              .bind(
                limit
              )
              .all();

        }

        return json(
          rows.results||[]
        );

      }


      /* ===================================================
         ADMIN DATABASE STATUS
      =================================================== */

      if(
        path==='/api/admin/status' &&
        req.method==='GET'
      ){

        const tables=[
          'users',
          's8_players',
          's8_assets',
          's8_income_assets',
          's8_battles',
          's8_battle_assets',
          's8_transactions',
          's8_transfers',
          's8_settings',
          's8_ai_logs'
        ];

        const status={};

        for(
          const table
          of tables
        ){

          try{

            const r=
              await env.DB
                .prepare(
                  `SELECT COUNT(*) AS c FROM ${table}`
                )
                .first();

            status[table]=
              Number(
                r?.c||0
              );

          }catch{

            status[table]=null;

          }

        }

        return json({
          ok:true,
          db:true,
          tables:status
        });

      }


      /* ===================================================
         ADMIN PLAYER DETAIL
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        req.method==='GET'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isSafeInteger(id) ||
          id<1
        ){

          return json(
            {
              message:
                'شناسه نامعتبر است.'
            },
            400
          );

        }

        const player=
          await env.DB
            .prepare(`
              SELECT
                p.*,
                u.name,
                u.total_games,
                u.loyalty_date
              FROM s8_players p
              LEFT JOIN users u
                ON u.code=p.user_code
              WHERE p.id=?
            `)
            .bind(id)
            .first();

        if(!player){

          return json(
            {
              message:
                'بازیکن پیدا نشد.'
            },
            404
          );

        }

        const assets=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_assets
              WHERE player_id=?
            `)
            .bind(id)
            .first();

        const incomeAssets=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_income_assets
              WHERE player_id=?
            `)
            .bind(id)
            .all();

        return json({
          player,
          assets,
          income_assets:
            incomeAssets.results||[]
        });

      }


      /* ===================================================
         ADMIN ADD MONEY
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        path.endsWith(
          '/money'
        ) &&
        req.method==='POST'
      ){

        const parts=
          path.split('/');

        const id=
          Number(
            parts[
              parts.length-2
            ]
          );

        const d=
          await req.json();

        const amount=
          Math.floor(
            Number(
              d.amount
            )
          );

        if(
          !Number.isSafeInteger(
            amount
          ) ||
          amount===0
        ){

          return json(
            {
              message:
                'مبلغ نامعتبر است.'
            },
            400
          );

        }

        const result=
          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                dollars=dollars+?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              amount,
              id
            )
            .run();

        if(
          Number(
            result.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'بازیکن پیدا نشد.'
            },
            404
          );

        }

        return json({
          ok:true
        });

      }


      /* ===================================================
         ADMIN ADD OIL
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        path.endsWith(
          '/oil'
        ) &&
        req.method==='POST'
      ){

        const parts=
          path.split('/');

        const id=
          Number(
            parts[
              parts.length-2
            ]
          );

        const d=
          await req.json();

        const amount=
          Math.floor(
            Number(
              d.amount
            )
          );

        if(
          !Number.isSafeInteger(
            amount
          ) ||
          amount===0
        ){

          return json(
            {
              message:
                'مقدار نامعتبر است.'
            },
            400
          );

        }

        const result=
          await env.DB
            .prepare(`
              UPDATE s8_players
              SET
                oil=oil+?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              amount,
              id
            )
            .run();

        if(
          Number(
            result.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'بازیکن پیدا نشد.'
            },
            404
          );

        }

        return json({
          ok:true
        });

      }


      /* ===================================================
         ADMIN ADD EQUIPMENT
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        path.endsWith(
          '/equipment'
        ) &&
        req.method==='POST'
      ){

        const parts=
          path.split('/');

        const id=
          Number(
            parts[
              parts.length-2
            ]
          );

        const d=
          await req.json();

        const key=
          clean(
            d.key
          );

        const quantity=
          Math.floor(
            Number(
              d.quantity
            )
          );

        if(
          !META[key] ||
          META[key].category==='income' ||
          !Number.isSafeInteger(
            quantity
          ) ||
          quantity<1
        ){

          return json(
            {
              message:
                'تجهیزات یا تعداد نامعتبر است.'
            },
            400
          );

        }

        const result=
          await env.DB
            .prepare(`
              UPDATE s8_assets
              SET
                ${key}=${key}+?
              WHERE player_id=?
            `)
            .bind(
              quantity,
              id
            )
            .run();

        if(
          Number(
            result.meta?.changes||0
          )!==1
        ){

          return json(
            {
              message:
                'دارایی بازیکن پیدا نشد.'
            },
            404
          );

        }

        return json({
          ok:true
        });

      }


      /* ===================================================
         ADMIN ADD INCOME ASSET
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        path.endsWith(
          '/income'
        ) &&
        req.method==='POST'
      ){

        const parts=
          path.split('/');

        const id=
          Number(
            parts[
              parts.length-2
            ]
          );

        const d=
          await req.json();

        const key=
          clean(
            d.key
          );

        const quantity=
          Math.floor(
            Number(
              d.quantity
            )
          );

        if(
          !META[key] ||
          META[key].category!=='income' ||
          !Number.isSafeInteger(
            quantity
          ) ||
          quantity<1
        ){

          return json(
            {
              message:
                'دارایی درآمدزا یا تعداد نامعتبر است.'
            },
            400
          );

        }

        const result=
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
              id,
              key,
              quantity
            )
            .run();

        return json({
          ok:true,
          changes:
            Number(
              result.meta?.changes||0
            )
        });

      }


      /* ===================================================
         ADMIN RESET PLAYER
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/player/'
        ) &&
        path.endsWith(
          '/reset'
        ) &&
        req.method==='POST'
      ){

        const parts=
          path.split('/');

        const id=
          Number(
            parts[
              parts.length-2
            ]
          );

        const player=
          await env.DB
            .prepare(`
              SELECT *
              FROM s8_players
              WHERE id=?
            `)
            .bind(id)
            .first();

        if(!player){

          return json(
            {
              message:
                'بازیکن پیدا نشد.'
            },
            404
          );

        }

        await env.DB.batch([

          env.DB.prepare(`
            UPDATE s8_players
            SET
              dollars=10000,
              oil=0,
              income_daily=0,
              updated_at=CURRENT_TIMESTAMP
            WHERE id=?
          `).bind(id),

          env.DB.prepare(`
            DELETE FROM s8_income_assets
            WHERE player_id=?
          `).bind(id),

          env.DB.prepare(`
            UPDATE s8_assets
            SET
              ${allAssetKeys
                .map(
                  k=>`${k}=0`
                )
                .join(',')}
            WHERE player_id=?
          `).bind(id)

        ]);

        return json({
          ok:true,
          message:
            'اطلاعات بازیکن ریست شد.'
        });

      }


      /* ===================================================
         ADMIN TRANSACTIONS
      =================================================== */

      if(
        path==='/api/admin/transactions' &&
        req.method==='GET'
      ){

        const limit=
          Math.min(
            500,
            Math.max(
              1,
              Number(
                u.searchParams.get(
                  'limit'
                )||200
              )
            )
          );

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
              LIMIT ?
            `)
            .bind(limit)
            .all();

        return json(
          r.results||[]
        );

      }


      /* ===================================================
         ADMIN TRANSFERS
      =================================================== */

      if(
        path==='/api/admin/transfers' &&
        req.method==='GET'
      ){

        const limit=
          Math.min(
            500,
            Math.max(
              1,
              Number(
                u.searchParams.get(
                  'limit'
                )||200
              )
            )
          );

        const r=
          await env.DB
            .prepare(`
              SELECT
                tr.*,
                sp.country sender_country,
                rp.country receiver_country
              FROM s8_transfers tr
              LEFT JOIN s8_players sp
                ON sp.id=tr.sender_player_id
              LEFT JOIN s8_players rp
                ON rp.id=tr.receiver_player_id
              ORDER BY tr.id DESC
              LIMIT ?
            `)
            .bind(limit)
            .all();

        return json(
          r.results||[]
        );

      }


      /* ===================================================
         HEALTH
      =================================================== */

      if(
        path==='/api/health'
      ){

        return json({
          ok:true,
          db:!!env.DB,
          time:
            new Date().toISOString()
        });

      }


      /* ===================================================
         404
      =================================================== */

      if(
        path.startsWith('/api/')
      ){

        return json(
          {
            message:
              'مسیر API پیدا نشد.'
          },
          404
        );

      }


      /* ===================================================
         STATIC
      =================================================== */

      if(
        env.ASSETS
      ){

        return env.ASSETS.fetch(
          req
        );

      }


      return text(
        'Power of War'
      );

    }catch(e){

      return json(
        {
          message:
            'خطای داخلی سرور.',
          error:
            String(
              e?.message||e
            )
        },
        500
      );

    }

  }

};
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
          message:'ویرایش شد'
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
          message:'حذف شد'
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
              message:'کاربر وجود ندارد'
            },
            404
          );

        }

        if(await isBlocked(u)){

          return json(
            {
              message:'کاربر مسدود است'
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
              message:'کشور را وارد کنید.'
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

        const dollars=
          Math.max(
            0,
            Math.floor(
              Number(
                d.dollars||
                10000
              )
            )
          );

        const incomeDaily=
          Math.max(
            0,
            Math.floor(
              Number(
                d.income_daily||0
              )
            )
          );

        const isAI=
          Number(
            d.is_ai||0
          )===1
            ?1
            :0;

        const aiActive=
          isAI
            ?1
            :0;

        const aiMemory=
          isAI
            ?JSON.stringify({
                purchases:0,
                battles:0,
                defense:0,
                last_target:null,
                last_action:'created',
                preferred_category:null,
                risk:randomFloat(
                  0.25,
                  0.85
                )
              })
            :'{}';

        const player=
          await env.DB
            .prepare(`
              INSERT INTO s8_players(
                user_code,
                country,
                dollars,
                oil,
                income_daily,
                active,
                is_ai,
                ai_active,
                ai_memory
              )
              VALUES(?,?,?,?,?,?,?,?,?)
              RETURNING id
            `)
            .bind(
              code,
              country,
              dollars,
              oil,
              incomeDaily,
              1,
              isAI,
              aiActive,
              aiMemory
            )
            .first();

        if(!player){

          return json(
            {
              message:
                'ساخت بازیکن ناموفق بود.'
            },
            500
          );

        }

        await env.DB
          .prepare(`
            INSERT INTO s8_assets(
              player_id
            )
            VALUES(?)
          `)
          .bind(
            player.id
          )
          .run();

        if(isAI){

          await aiSchedule(
            env,
            player.id,
            1,
            4
          );

        }

        return json({
          message:'بازیکن اضافه شد',
          id:player.id
        });

      }


      /* ===================================================
         ADMIN PLAYER UPDATE
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/players/'
        ) &&
        req.method==='PUT'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isSafeInteger(id) ||
          id<1
        ){

          return json(
            {
              message:'شناسه نامعتبر است.'
            },
            400
          );

        }

        const d=
          await req.json();

        if(
          d.action==='ai'
        ){

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
                message:'بازیکن پیدا نشد.'
              },
              404
            );

          }

          const enable=
            Boolean(
              d.enabled
            );

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
              enable?1:0,
              enable?1:0,
              enable
                ?new Date(
                    Date.now()+
                    randomInt(
                      1,
                      4
                    )*60000
                  ).toISOString()
                :null,
              id
            )
            .run();

          await aiLog(
            env,
            id,
            enable
              ?'ai_enabled'
              :'ai_disabled',
            {}
          );

          return json({
            ok:true
          });

        }

        const country=
          clean(d.country);

        const dollars=
          Math.max(
            0,
            Math.floor(
              Number(
                d.dollars||0
              )
            )
          );

        const oil=
          Math.max(
            0,
            Math.floor(
              Number(
                d.oil||0
              )
            )
          );

        const active=
          Number(
            d.active
          )===0
            ?0
            :1;

        await env.DB
          .prepare(`
            UPDATE s8_players
            SET
              country=?,
              dollars=?,
              oil=?,
              active=?,
              updated_at=CURRENT_TIMESTAMP
            WHERE id=?
          `)
          .bind(
            country,
            dollars,
            oil,
            active,
            id
          )
          .run();

        return json({
          ok:true
        });

      }


      /* ===================================================
         ADMIN PLAYER DELETE
      =================================================== */

      if(
        path.startsWith(
          '/api/admin/players/'
        ) &&
        req.method==='DELETE'
      ){

        const id=
          Number(
            path.split('/').pop()
          );

        if(
          !Number.isSafeInteger(id) ||
          id<1
        ){

          return json(
            {
              message:'شناسه نامعتبر است.'
            },
            400
          );

        }

        await env.DB
          .prepare(`
            DELETE FROM s8_players
            WHERE id=?
          `)
          .bind(id)
          .run();

        return json({
          ok:true
        });

      }


      /* ===================================================
         ADMIN AI TICK
      =================================================== */

      if(
        path==='/api/admin/ai-tick' &&
        req.method==='POST'
      ){

        await aiTick(env);

        return json({
          ok:true
        });

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
              message:'بازیکن پیدا نشد'
            },
            404
          );

        }

        if(q<1){

          return json(
            {
              message:'مقدار نامعتبر است.'
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
              message:'دارایی نامعتبر است.'
            },
            400
          );

        }

        return json({
          message:'اعطا شد'
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
          message:'انجام شد'
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
              message:'قیمت نامعتبر است.'
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
         ADMIN TEST / MANUAL AI TICK
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
          message:'خطای سرور',
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
