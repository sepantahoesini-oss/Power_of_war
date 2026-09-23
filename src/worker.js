const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');

async function hmac(secret,data){
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return b64(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(data)));
}

async function makeToken(env){
  const exp=Date.now()+12*60*60*1000;
  const body=b64(new TextEncoder().encode(String(exp)));
  return body+'.'+await hmac(env.ADMIN_PASSWORD,body);
}

async function adminOK(req,env){
  if(!env.ADMIN_PASSWORD)return false;
  const a=req.headers.get('authorization')||'';
  if(!a.startsWith('Bearer '))return false;
  const [body,sig]=a.slice(7).split('.');
  if(!body||!sig)return false;

  let exp;
  try{
    exp=Number(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(body.replaceAll('-','+').replaceAll('_','/')+'=='),
          c=>c.charCodeAt(0)
        )
      )
    );
  }catch{
    return false;
  }

  if(exp<Date.now())return false;
  return (await hmac(env.ADMIN_PASSWORD,body))===sig;
}

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

const ASSET_META=Object.fromEntries(
  Object.values(CATALOG).flat().map(x=>[
    x[1],
    {name:x[0],price:x[2],mode:'war'}
  ])
  .concat(
    CATALOG.defense.map(x=>[
      x[1],
      {name:x[0],price:x[2],mode:'defense'}
    ])
  )
  .concat(
    INCOME.map(x=>[
      x[1],
      {name:x[0],price:x[2],daily:x[3],mode:'income'}
    ])
  )
);

const warKeys=Object.values(CATALOG)
  .flat()
  .map(x=>x[1])
  .filter(k=>!k.startsWith('defense_'));

const defenseKeys=CATALOG.defense.map(x=>x[1]);

const txCode=()=>{
  const a='ABCDEFGHJKLMNPQRSTUVWXYZ';
  const n='0123456789';

  const pick=s=>
    Array.from(
      {length:4},
      ()=>s[Math.floor(Math.random()*s.length)]
    ).join('');

  return pick(a)+'-'+pick(a+n)+'-'+pick(a+n);
};

const esc=x=>String(x??'').trim();

async function setting(env,key,def=null){
  const r=await env.DB
    .prepare('SELECT value FROM s8_settings WHERE key=?')
    .bind(key)
    .first();

  return r?.value??def;
}

async function blocked(user){
  if(!user?.blocked_until)return false;

  if(user.blocked_until==='permanent')return true;

  return new Date(user.blocked_until).getTime()>Date.now();
}

async function getUser(env,code){
  return env.DB
    .prepare('SELECT * FROM users WHERE code=?')
    .bind(code)
    .first();
}

async function getPlayer(env,code){
  return env.DB
    .prepare(`
      SELECT
        sp.*,
        u.name,
        u.total_games,
        u.victories AS wins,
        u.loyalty_date,
        u.blocked_until,
        u.blocked_type,
        a.*
      FROM s8_players sp
      JOIN users u ON u.code=sp.user_code
      JOIN s8_assets a ON a.player_id=sp.id
      WHERE sp.user_code=?
    `)
    .bind(code)
    .first();
}

async function publicPlayer(env,code){
  const p=await getPlayer(env,code);
  if(!p)return null;
  return p;
}

function assetList(p){
  const out={};

  for(const [k,v] of Object.entries(ASSET_META)){
    if(v.mode!=='income'){
      out[k]={
        name:v.name,
        qty:Number(p[k]||0),
        price:v.price
      };
    }
  }

  return out;
}

async function derivedPlayer(env,p){
  const incomeRows=await env.DB
    .prepare(`
      SELECT kind,qty
      FROM s8_income_assets
      WHERE player_id=? AND qty>0
    `)
    .bind(p.id)
    .all();

  const incomes=incomeRows.results||[];

  let daily=0;

  for(const r of incomes){
    daily+=(ASSET_META[r.kind]?.daily||0)*r.qty;
  }

  return {
    id:p.id,
    code:p.user_code,
    name:p.name,
    country:p.country,
    dollars:p.dollars,
    oil:p.oil,
    daily_income:daily,
    assets:assetList(p),
    income_assets:Object.fromEntries(
      incomes.map(r=>[r.kind,r.qty])
    ),
    loyalty_date:p.loyalty_date
  };
}

async function authPlayer(req,env){
  const code=esc(
    req.headers.get('x-user-code')
  ).toUpperCase();

  if(!/^POW\d+$/.test(code)){
    return {
      error:json(
        {message:'کد کاربری نامعتبر است.'},
        400
      )
    };
  }

  const u=await getUser(env,code);

  if(!u){
    return {
      error:json(
        {message:'این کد وجود ندارد'},
        404
      )
    };
  }

  if(await blocked(u)){
    return {
      error:json(
        {message:'حساب کاربری شما مسدود است.'},
        403
      )
    };
  }

  const p=await getPlayer(env,code);

  if(!p){
    return {
      error:json(
        {message:'در بازی ثبت نام نشده اید'},
        403
      )
    };
  }

  return {
    user:u,
    player:p
  };
}

async function addIncome(env){
  const tz=await setting(
    env,
    'timezone',
    'Asia/Tehran'
  );

  const now=new Date();

  const parts=new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone:tz,
      year:'numeric',
      month:'2-digit',
      day:'2-digit',
      hour:'2-digit',
      hour12:false
    }
  ).formatToParts(now);

  const get=k=>
    parts.find(x=>x.type===k)?.value;

  const day=
    `${get('year')}-${get('month')}-${get('day')}`;

  const hour=Number(get('hour'));

  if(hour!==0){
    return {
      done:false,
      day
    };
  }

  const last=await setting(
    env,
    'last_income_day',
    ''
  );

  if(last===day){
    return {
      done:false,
      day
    };
  }

  const rows=await env.DB
    .prepare(`
      SELECT
        sp.id,
        sp.dollars
      FROM s8_players sp
      GROUP BY sp.id
    `)
    .all();

  for(const p of rows.results||[]){
    const rs=await env.DB
      .prepare(`
        SELECT ia.kind,ia.qty
        FROM s8_income_assets ia
        WHERE ia.player_id=?
      `)
      .bind(p.id)
      .all();

    let total=0;

    for(const r of rs.results||[]){
      total+=(ASSET_META[r.kind]?.daily||0)*Number(r.qty);
    }

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
        .bind(total,total,p.id)
        .run();

      await env.DB
        .prepare(`
          INSERT INTO s8_transactions
          (tx_code,player_id,type,description,amount)
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
      INSERT INTO s8_settings(key,value)
      VALUES(?,?)
      ON CONFLICT(key)
      DO UPDATE SET value=excluded.value
    `)
    .bind(
      'last_income_day',
      day
    )
    .run();

  return {
    done:true,
    day
  };
}

export default {

  async scheduled(event,env,ctx){
    ctx.waitUntil(
      addIncome(env)
    );
  },

  async fetch(req,env){

    const u=new URL(req.url);
    const path=u.pathname;

    try{

      /* ACCOUNT */

      if(
        path==='/api/account' &&
        req.method==='GET'
      ){
        const code=esc(
          u.searchParams.get('code')
        ).toUpperCase();

        const user=await getUser(
          env,
          code
        );

        if(!user){
          return json(
            {message:'این کد وجود ندارد'},
            404
          );
        }

        if(await blocked(user)){
          return json(
            {message:'حساب کاربری شما مسدود است.'},
            403
          );
        }

        return json({
          code:user.code,
          name:user.name,
          loyalty_date:user.loyalty_date,
          total_games:user.total_games,
          wins:user.victories
        });
      }


      /* SEASON LOGIN */

      if(
        path==='/api/season/login' &&
        req.method==='POST'
      ){
        const {code}=await req.json();

        const user=await getUser(
          env,
          esc(code).toUpperCase()
        );

        if(!user){
          return json(
            {message:'این کد وجود ندارد'},
            404
          );
        }

        if(await blocked(user)){
          return json(
            {message:'حساب کاربری شما مسدود است.'},
            403
          );
        }

        const p=await getPlayer(
          env,
          user.code
        );

        if(!p){
          return json(
            {message:'در بازی ثبت نام نشده اید'},
            403
          );
        }

        return json(
          await derivedPlayer(env,p)
        );
      }


      /* SEASON ME */

      if(
        path==='/api/season/me' &&
        req.method==='GET'
      ){
        const a=await authPlayer(
          req,
          env
        );

        if(a.error)return a.error;

        return json(
          await derivedPlayer(
            env,
            a.player
          )
        );
      }


      /* SEASON BUY */

      if(
        path==='/api/season/buy' &&
        req.method==='POST'
      ){
        const a=await authPlayer(
          req,
          env
        );

        if(a.error)return a.error;

        const d=await req.json();

        const kind=esc(d.kind);
        const qty=Math.floor(
          Number(d.quantity)
        );

        if(
          !ASSET_META[kind] ||
          !Number.isFinite(qty) ||
          qty<1
        ){
          return json(
            {message:'اطلاعات خرید نامعتبر است.'},
            400
          );
        }

        const meta=ASSET_META[kind];

        const total=meta.price*qty;

        if(!Number.isSafeInteger(total)){
          return json(
            {message:'مبلغ خرید نامعتبر است.'},
            400
          );
        }

        const p=await getPlayer(
          env,
          a.player.user_code
        );

        if(!p){
          return json(
            {message:'بازیکن پیدا نشد.'},
            404
          );
        }

        if(Number(p.dollars)<total){
          return json(
            {message:'موجودی کافی نیست'},
            400
          );
        }

        /* درآمدزاها در جدول جدا ذخیره می‌شوند */

        if(meta.mode==='income'){

          const newMoney=Number(p.dollars)-total;

          await env.DB.batch([
            env.DB
              .prepare(`
                UPDATE s8_players
                SET
                  dollars=?,
                  updated_at=CURRENT_TIMESTAMP
                WHERE id=?
              `)
              .bind(newMoney,p.id),

            env.DB
              .prepare(`
                INSERT INTO s8_income_assets
                (player_id,kind,qty)
                VALUES(?,?,?)
                ON CONFLICT(player_id,kind)
                DO UPDATE SET qty=qty+excluded.qty
              `)
              .bind(
                p.id,
                kind,
                qty
              ),

            env.DB
              .prepare(`
                INSERT INTO s8_transactions
                (tx_code,player_id,user_code,type,description,amount,quantity,item_key)
                VALUES(?,?,?,?,?,?,?,?)
              `)
              .bind(
                txCode(),
                p.id,
                p.user_code,
                'purchase',
                `خرید ${meta.name}`,
                total,
                qty,
                kind
              )
          ]);

          return json({
            message:'پرداخت موفق',
            transaction_id:txCode()
          });
        }


        /* تجهیزات نظامی */

        const newMoney=
          Number(p.dollars)-total;

        await env.DB.batch([

          env.DB
            .prepare(`
              UPDATE s8_players
              SET
                dollars=?,
                updated_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              newMoney,
              p.id
            ),

          env.DB
            .prepare(`
              UPDATE s8_assets
              SET ${kind}=${kind}+?
              WHERE player_id=?
            `)
            .bind(
              qty,
              p.id
            ),

          env.DB
            .prepare(`
              INSERT INTO s8_transactions
              (tx_code,player_id,user_code,type,description,amount,quantity,item_key)
              VALUES(?,?,?,?,?,?,?,?)
            `)
            .bind(
              txCode(),
              p.id,
              p.user_code,
              'purchase',
              `خرید ${meta.name}`,
              total,
              qty,
              kind
            )
        ]);

        return json({
          message:'پرداخت موفق',
          transaction_id:txCode()
        });
      }


      /* SEASON TRANSFER */

      if(
        path==='/api/season/transfer' &&
        req.method==='POST'
      ){
        const a=await authPlayer(
          req,
          env
        );

        if(a.error)return a.error;

        const d=await req.json();

        const toCode=esc(
          d.to_code
        ).toUpperCase();

        const kind=esc(
          d.kind
        );

        const qty=Math.floor(
          Number(d.quantity)
        );

        if(
          !toCode ||
          !kind ||
          !Number.isFinite(qty) ||
          qty<1
        ){
          return json(
            {message:'اطلاعات انتقال نامعتبر است.'},
            400
          );
        }

        if(
          kind==='income' ||
          kind.startsWith('income_')
        ){
          return json(
            {message:'دارایی‌های درآمدزا قابل انتقال نیستند.'},
            400
          );
        }

        const receiver=await getPlayer(
          env,
          toCode
        );

        if(!receiver){
          return json(
            {message:'کشور مقصد پیدا نشد.'},
            404
          );
        }

        if(
          receiver.id===a.player.id
        ){
          return json(
            {message:'انتقال به خودتان امکان‌پذیر نیست.'},
            400
          );
        }

        const sender=await getPlayer(
          env,
          a.player.user_code
        );

        if(
          kind!=='dollars' &&
          kind!=='oil' &&
          !ASSET_META[kind]
        ){
          return json(
            {message:'دارایی نامعتبر است.'},
            400
          );
        }

        if(
          kind!=='dollars' &&
          kind!=='oil' &&
          ASSET_META[kind].mode==='income'
        ){
          return json(
            {message:'دارایی‌های درآمدزا قابل انتقال نیستند.'},
            400
          );
        }

        const current=
          kind==='dollars'
            ? Number(sender.dollars)
            : kind==='oil'
              ? Number(sender.oil)
              : Number(sender[kind]||0);

        if(current<qty){
          return json(
            {message:'موجودی کافی نیست.'},
            400
          );
        }

        const today=new Date()
          .toISOString()
          .slice(0,10);

        const count=await env.DB
          .prepare(`
            SELECT COUNT(*) AS c
            FROM s8_transfers
            WHERE sender_player_id=?
            AND substr(created_at,1,10)=?
          `)
          .bind(
            sender.id,
            today
          )
          .first();

        if(Number(count?.c||0)>=3){
          return json(
            {message:'سقف انتقال روزانه شما تکمیل شده است.'},
            400
          );
        }

        const code=txCode();

        const stm=[];

        if(kind==='dollars'){
          stm.push(
            env.DB
              .prepare(`
                UPDATE s8_players
                SET dollars=dollars-?
                WHERE id=?
              `)
              .bind(qty,sender.id),

            env.DB
              .prepare(`
                UPDATE s8_players
                SET dollars=dollars+?
                WHERE id=?
              `)
              .bind(qty,receiver.id)
          );
        }else if(kind==='oil'){
          stm.push(
            env.DB
              .prepare(`
                UPDATE s8_players
                SET oil=oil-?
                WHERE id=?
              `)
              .bind(qty,sender.id),

            env.DB
              .prepare(`
                UPDATE s8_players
                SET oil=oil+?
                WHERE id=?
              `)
              .bind(qty,receiver.id)
          );
        }else{
          stm.push(
            env.DB
              .prepare(`
                UPDATE s8_assets
                SET ${kind}=${kind}-?
                WHERE player_id=?
              `)
              .bind(qty,sender.id),

            env.DB
              .prepare(`
                UPDATE s8_assets
                SET ${kind}=${kind}+?
                WHERE player_id=?
              `)
              .bind(qty,receiver.id)
          );
        }

        stm.push(
          env.DB
            .prepare(`
              INSERT INTO s8_transfers
              (tx_code,sender_player_id,receiver_player_id,kind,asset_key,quantity)
              VALUES(?,?,?,?,?,?)
            `)
            .bind(
              code,
              sender.id,
              receiver.id,
              kind,
              kind==='dollars'||kind==='oil'
                ? kind
                : kind,
              qty
            )
        );

        stm.push(
          env.DB
            .prepare(`
              INSERT INTO s8_transactions
              (tx_code,player_id,user_code,type,description,amount,quantity,item_key)
              VALUES(?,?,?,?,?,?,?,?)
            `)
            .bind(
              code,
              sender.id,
              sender.user_code,
              'transfer',
              `انتقال ${kind} به ${receiver.country}`,
              0,
              qty,
              kind
            )
        );

        await env.DB.batch(stm);

        return json({
          message:'انتقال با موفقیت انجام شد',
          transaction_id:code
        });
      }


      /* BATTLE / DEFENSE */

      if(
        path==='/api/season/battle' &&
        req.method==='POST'
      ){
        const a=await authPlayer(
          req,
          env
        );

        if(a.error)return a.error;

        if(
          (await setting(
            env,
            'war_enabled',
            '1'
          ))!=='1'
        ){
          return json(
            {message:'جنگ در حال حاضر غیرفعال است.'},
            403
          );
        }

        const d=await req.json();

        const mode=
          d.mode==='defense'
            ? 'defense'
            : 'war';

        const to=esc(
          d.to_code
        ).toUpperCase();

        const scenario=esc(
          d.scenario
        );

        if(!scenario){
          return json(
            {message:'سناریو را وارد کنید.'},
            400
          );
        }

        const defender=await getPlayer(
          env,
          to
        );

        if(
          !defender ||
          defender.id===a.player.id
        ){
          return json(
            {message:'کشور حریف معتبر نیست.'},
            400
          );
        }

        const selected=d.assets||{};

        const allowed=
          mode==='defense'
            ? defenseKeys
            : warKeys;

        const clean=[];

        for(
          const [k,v]
          of Object.entries(selected)
        ){
          const q=Math.floor(
            Number(v)
          );

          if(q>0){

            if(!allowed.includes(k)){
              return json(
                {message:'این تجهیز برای این نوع نبرد مجاز نیست.'},
                400
              );
            }

            if(
              Number(a.player[k]||0)<q
            ){
              return json(
                {
                  message:
                    `تعداد ${ASSET_META[k]?.name||k} کافی نیست.`
                },
                400
              );
            }

            clean.push([k,q]);
          }
        }

        if(!clean.length){
          return json(
            {message:'حداقل یک تجهیز انتخاب کنید.'},
            400
          );
        }

        const code=txCode();

        const stm=[
          env.DB
            .prepare(`
              INSERT INTO s8_battles
              (code,attacker_player_id,defender_player_id,mode,scenario)
              VALUES(?,?,?,?,?)
            `)
            .bind(
              code,
              a.player.id,
              defender.id,
              mode,
              scenario
            )
        ];

        for(
          const [k,q]
          of clean
        ){
          stm.push(
            env.DB
              .prepare(`
                UPDATE s8_assets
                SET ${k}=${k}-?
                WHERE player_id=?
              `)
              .bind(
                q,
                a.player.id
              )
          );

          stm.push(
            env.DB
              .prepare(`
                INSERT INTO s8_battle_assets
                (battle_id,asset_key,quantity)
                SELECT id,?,?
                FROM s8_battles
                WHERE code=?
              `)
              .bind(
                k,
                q,
                code
              )
          );
        }

        await env.DB.batch(stm);

        return json({
          message:'سناریو ارسال شد',
          code
        });
      }


      /* TRANSACTIONS */

      if(
        path==='/api/season/transactions' &&
        req.method==='GET'
      ){
        const a=await authPlayer(
          req,
          env
        );

        if(a.error)return a.error;

        const r=await env.DB
          .prepare(`
            SELECT
              tx_code,
              type,
              description,
              amount,
              created_at
            FROM s8_transactions
            WHERE player_id=?
            ORDER BY id DESC
            LIMIT 100
          `)
          .bind(a.player.id)
          .all();

        return json(
          r.results||[]
        );
      }


      /* ADMIN LOGIN */

      if(
        path==='/api/admin/login' &&
        req.method==='POST'
      ){
        if(!env.ADMIN_PASSWORD){
          return json(
            {message:'ADMIN_PASSWORD تنظیم نشده است.'},
            500
          );
        }

        const {password}=await req.json();

        if(
          password!==env.ADMIN_PASSWORD
        ){
          return json(
            {message:'رمز عبور اشتباه است.'},
            401
          );
        }

        return json({
          token:await makeToken(env)
        });
      }


      if(
        path.startsWith('/api/admin/')
      ){
        if(
          !(await adminOK(req,env))
        ){
          return json(
            {message:'دسترسی غیرمجاز'},
            401
          );
        }
      }


      /* ADMIN USERS */

      if(
        path==='/api/admin/users' &&
        req.method==='GET'
      ){
        const r=await env.DB
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
        const d=await req.json();

        const code=esc(
          d.code
        ).toUpperCase();

        const name=esc(
          d.name
        );

        const total=Math.floor(
          Number(d.total_games||0)
        );

        const wins=Math.floor(
          Number(d.wins||0)
        );

        if(
          !/^POW\d+$/.test(code) ||
          !name ||
          total<0 ||
          wins<0 ||
          wins>total
        ){
          return json(
            {message:'اطلاعات نامعتبر است.'},
            400
          );
        }

        try{

          await env.DB
            .prepare(`
              INSERT INTO users
              (code,name,total_games,victories,loyalty_date)
              VALUES(?,?,?,?,COALESCE(?,CURRENT_TIMESTAMP))
            `)
            .bind(
              code,
              name,
              total,
              wins,
              d.loyalty_date||null
            )
            .run();

          return json({
            message:'کاربر اضافه شد'
          });

        }catch(e){

          return json({
            message:
              String(e).includes('UNIQUE')
                ? 'این کد قبلاً ثبت شده است.'
                : 'خطا در ثبت کاربر.'
          },409);
        }
      }


      /* ADMIN USER EDIT */

      if(
        path.startsWith('/api/admin/users/') &&
        req.method==='PUT'
      ){
        const code=decodeURIComponent(
          path.split('/').pop()
        ).toUpperCase();

        const d=await req.json();

        if(
          d.action==='block'
        ){
          let until='permanent';

          if(d.type==='month'){
            const dt=
              new Date(
                Date.now()+30*86400000
              );

            until=dt.toISOString();

          }else if(
            d.type==='season'
          ){
            until='season';
          }

          await env.DB
            .prepare(`
              UPDATE users
              SET blocked_until=?,blocked_type=?
              WHERE code=?
            `)
            .bind(
              until,
              d.type,
              code
            )
            .run();

          return json({
            message:'کاربر مسدود شد'
          });
        }

        if(
          d.action==='unblock'
        ){
          await env.DB
            .prepare(`
              UPDATE users
              SET blocked_until=NULL,
                  blocked_type=NULL
              WHERE code=?
            `)
            .bind(code)
            .run();

          return json({
            message:'مسدودی برداشته شد'
          });
        }

        await env.DB
          .prepare(`
            UPDATE users
            SET
              name=?,
              total_games=?,
              victories=?
            WHERE code=?
          `)
          .bind(
            esc(d.name),
            Number(d.total_games),
            Number(d.wins),
            code
          )
          .run();

        return json({
          message:'ویرایش شد'
        });
      }


      /* ADMIN USER DELETE */

      if(
        path.startsWith('/api/admin/users/') &&
        req.method==='DELETE'
      ){
        const code=decodeURIComponent(
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


      /* ADMIN PLAYERS */

      if(
        path==='/api/admin/players' &&
        req.method==='GET'
      ){
        const r=await env.DB
          .prepare(`
            SELECT
              sp.*,
              u.name,
              u.victories AS wins
            FROM s8_players sp
            JOIN users u ON u.code=sp.user_code
            ORDER BY sp.dollars DESC
          `)
          .all();

        return json(
          r.results||[]
        );
      }


      /* ADMIN ADD PLAYER */

      if(
        path==='/api/admin/players' &&
        req.method==='POST'
      ){
        const d=await req.json();

        const code=esc(
          d.user_code
        ).toUpperCase();

        const country=esc(
          d.country
        );

        const u=await getUser(
          env,
          code
        );

        if(!u){
          return json(
            {message:'کاربر وجود ندارد'},
            404
          );
        }

        if(await blocked(u)){
          return json(
            {message:'کاربر مسدود است'},
            400
          );
        }

        if(await getPlayer(env,code)){
          return json(
            {message:'این کاربر قبلاً وارد سیزن شده است.'},
            409
          );
        }

        if(!country){
          return json(
            {message:'کشور را وارد کنید.'},
            400
          );
        }

        if(
          await env.DB
            .prepare(`
              SELECT id
              FROM s8_players
              WHERE country=?
            `)
            .bind(country)
            .first()
        ){
          return json(
            {message:'این کشور قبلاً انتخاب شده است.'},
            409
          );
        }

        await env.DB.batch([

          env.DB
            .prepare(`
              INSERT INTO s8_players
              (user_code,country,dollars,oil)
              VALUES(?,?,?,?)
            `)
            .bind(
              code,
              country,
              10000,
              Number(d.oil||0)
            ),

          env.DB
            .prepare(`
              INSERT INTO s8_assets(player_id)
              SELECT id
              FROM s8_players
              WHERE user_code=?
            `)
            .bind(code)
        ]);

        return json({
          message:'بازیکن سیزن ۸ ثبت شد'
        });
      }


      /* ADMIN PLAYER EDIT */

      if(
        path.startsWith('/api/admin/players/') &&
        req.method==='PUT'
      ){
        const id=Number(
          path.split('/').pop()
        );

        const d=await req.json();

        const p=await env.DB
          .prepare(`
            SELECT *
            FROM s8_players
            WHERE id=?
          `)
          .bind(id)
          .first();

        if(!p){
          return json(
            {message:'بازیکن پیدا نشد'},
            404
          );
        }

        if(
          d.action==='country'
        ){
          const c=esc(
            d.country
          );

          if(
            await env.DB
              .prepare(`
                SELECT id
                FROM s8_players
                WHERE country=?
                AND id<>?
              `)
              .bind(c,id)
              .first()
          ){
            return json(
              {message:'این کشور در اختیار بازیکن دیگری است.'},
              409
            );
          }

          const equipmentReset=
            Object.keys(ASSET_META)
              .filter(
                k=>ASSET_META[k].mode!=='income'
              )
              .map(
                k=>`${k}=0`
              )
              .join(',');

          await env.DB.batch([

            env.DB
              .prepare(`
                UPDATE s8_players
                SET
                  country=?,
                  dollars=10000,
                  oil=0,
                  income_daily=0,
                  updated_at=CURRENT_TIMESTAMP
                WHERE id=?
              `)
              .bind(c,id),

            env.DB
              .prepare(`
                UPDATE s8_assets
                SET ${equipmentReset}
                WHERE player_id=?
              `)
              .bind(id),

            env.DB
              .prepare(`
                DELETE FROM s8_income_assets
                WHERE player_id=?
              `)
              .bind(id)

          ]);

          return json({
            message:'کشور تغییر کرد و دارایی‌ها طبق قانون بازنشانی شد.'
          });
        }

        return json(
          {message:'عملیات نامعتبر'},
          400
        );
      }


      /* ADMIN GRANT */

      if(
        path==='/api/admin/grant' &&
        req.method==='POST'
      ){
        const d=await req.json();

        const p=await env.DB
          .prepare(`
            SELECT *
            FROM s8_players
            WHERE id=?
          `)
          .bind(
            Number(d.player_id)
          )
          .first();

        if(!p){
          return json(
            {message:'بازیکن پیدا نشد'},
            404
          );
        }

        const kind=esc(
          d.kind
        );

        const q=Math.floor(
          Number(d.quantity)
        );

        if(q<1){
          return json(
            {message:'مقدار نامعتبر است.'},
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
              SET ${kind}=${kind}+?
              WHERE id=?
            `)
            .bind(
              q,
              p.id
            )
            .run();

        }else{

          if(
            !ASSET_META[kind] ||
            ASSET_META[kind].mode==='income'
          ){
            return json(
              {message:'دارایی نامعتبر است.'},
              400
            );
          }

          await env.DB
            .prepare(`
              UPDATE s8_assets
              SET ${kind}=${kind}+?
              WHERE player_id=?
            `)
            .bind(
              q,
              p.id
            )
            .run();
        }

        return json({
          message:'اعطا شد'
        });
      }


      /* ADMIN INCOME */

      if(
        path==='/api/admin/income' &&
        req.method==='GET'
      ){
        const r=await env.DB
          .prepare(`
            SELECT
              ia.player_id,
              ia.kind,
              ia.qty,
              sp.country,
              sp.user_code
            FROM s8_income_assets ia
            JOIN s8_players sp
              ON sp.id=ia.player_id
            WHERE ia.qty>0
            ORDER BY sp.country
          `)
          .all();

        return json(
          r.results||[]
        );
      }


      /* ADMIN TRANSACTIONS */

      if(
        path==='/api/admin/transactions' &&
        req.method==='GET'
      ){
        const r=await env.DB
          .prepare(`
            SELECT
              t.*,
              sp.country
            FROM s8_transactions t
            LEFT JOIN s8_players sp
              ON sp.id=t.player_id
            ORDER BY t.id DESC
            LIMIT 500
          `)
          .all();

        return json(
          r.results||[]
        );
      }


      /* ADMIN BATTLES */

      if(
        path==='/api/admin/battles' &&
        req.method==='GET'
      ){
        const r=await env.DB
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
          const ar=await env.DB
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
            assets:ar.results||[]
          });
        }

        return json(out);
      }


      /* ADMIN REVIEW BATTLE */

      if(
        path.startsWith('/api/admin/battles/') &&
        req.method==='PUT'
      ){
        const id=Number(
          path.split('/').pop()
        );

        const d=await req.json();

        const b=await env.DB
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
            {message:'سناریو پیدا نشد یا قبلاً بررسی شده.'},
            404
          );
        }

        const rows=await env.DB
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

          env.DB
            .prepare(`
              UPDATE s8_battles
              SET
                status=?,
                reviewed_at=CURRENT_TIMESTAMP
              WHERE id=?
            `)
            .bind(
              d.approved
                ? 'approved'
                : 'rejected',
              id
            )

        ];

        if(!d.approved){

          for(
            const r of rows.results||[]
          ){

            stm.push(
              env.DB
                .prepare(`
                  UPDATE s8_assets
                  SET ${r.asset_key}=${r.asset_key}+?
                  WHERE player_id=?
                `)
                .bind(
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
              ? 'سناریو تأیید و بسته شد.'
              : 'سناریو رد شد و تجهیزات برگشت.'
        });
      }


      /* ADMIN WAR */

      if(
        path==='/api/admin/war' &&
        req.method==='POST'
      ){
        const d=await req.json();

        await env.DB
          .prepare(`
            INSERT INTO s8_settings(key,value)
            VALUES(?,?)
            ON CONFLICT(key)
            DO UPDATE SET value=excluded.value
          `)
          .bind(
            'war_enabled',
            d.enabled?'1':'0'
          )
          .run();

        return json({
          message:
            d.enabled
              ? 'جنگ فعال شد.'
              : 'جنگ غیرفعال شد.'
        });
      }


      /* ADMIN BITCOIN */

      if(
        path==='/api/admin/bitcoin' &&
        req.method==='POST'
      ){
        const price=Math.floor(
          Number(
            (await req.json()).price
          )
        );

        if(
          !price ||
          price<1
        ){
          return json(
            {message:'قیمت نامعتبر است.'},
            400
          );
        }

        await env.DB
          .prepare(`
            INSERT INTO s8_settings(key,value)
            VALUES(?,?)
            ON CONFLICT(key)
            DO UPDATE SET value=excluded.value
          `)
          .bind(
            'bitcoin_price',
            String(price)
          )
          .run();

        return json({
          message:'قیمت بیت‌کوین ثبت شد.'
        });
      }


      /* TEST */

      if(
        path==='/api/admin/test-state' &&
        req.method==='GET'
      ){
        return json({
          db:'OK',
          season:'8',
          war_enabled:
            (await setting(
              env,
              'war_enabled',
              '1'
            ))==='1'
        });
      }


      return env.ASSETS.fetch(req);

    }catch(e){

      return json({
        message:'خطای سرور',
        detail:String(e)
      },500);
    }
  }
};
