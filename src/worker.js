const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store"
    }
  });

const esc = v => String(v ?? "").trim();
const n = v => Math.floor(Number(v));

const CATALOG = {
  missiles: [
    ["موشک عادی","missiles_normal",10000],
    ["موشک پیشرفته","missiles_advanced",25000],
    ["موشک فوق پیشرفته","missiles_super",50000],
    ["موشک سنگین","missiles_heavy",75000],
    ["موشک سنگین پیشرفته","missiles_heavy_advanced",120000],
    ["موشک دوربرد","missiles_long",180000],
    ["موشک دوربرد پیشرفته","missiles_long_advanced",250000],
    ["موشک بسیار دوربرد","missiles_very_long",400000],
    ["موشک بسیار دوربرد پیشرفته","missiles_very_long_advanced",600000],
    ["موشک ویژه","missiles_special",1000000]
  ],

  military: [
    ["سرباز عادی","military_normal",1000],
    ["سرباز پیشرفته","military_advanced",2500],
    ["سرباز ویژه","military_special",5000],
    ["سرباز لجستیکی","military_logistics",7500],
    ["سرباز سنگین","military_heavy",10000],
    ["سرباز سنگین پیشرفته","military_heavy_advanced",15000],
    ["فرمانده","commander",25000],
    ["فرمانده پیشرفته","commander_advanced",50000],
    ["فرمانده ویژه","commander_special",100000],
    ["فرمانده کل","commander_general",250000]
  ],

  defense: [
    ["پدافند عادی","defense_normal",15000],
    ["پدافند پیشرفته
