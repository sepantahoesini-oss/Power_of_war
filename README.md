# POWER OF WAR — نسخه آماده برای Cloudflare Dashboard و گوشی

این نسخه برای راه‌اندازی از طریق داشبورد Cloudflare و GitHub آماده شده است و **Database ID داخل فایل پروژه لازم نیست**.

## محتویات
- `public/index.html` — سایت اصلی
- `public/admin.html` — پنل مدیریت
- `src/worker.js` — API و اتصال به D1
- `schema.sql` — ساخت جدول کاربران
- `wrangler.json` — تنظیمات Worker و Assets

## وضعیت دیتابیس
جدول `users` باید در D1 ساخته شده باشد. اگر هنوز نساخته‌اید، SQL داخل `schema.sql` را در D1 > Console اجرا کنید.

## راه‌اندازی با گوشی
1. این پروژه را در یک repository در GitHub قرار دهید.
2. در Cloudflare بروید به Workers & Pages > Create application > Import a repository و repository را انتخاب کنید.
3. Worker را Deploy کنید.
4. وارد Worker شوید و از بخش Bindings یک binding از نوع **D1 database** اضافه کنید.
   - Variable name: `DB`
   - D1 database: دیتابیس `power-of-war-db`
5. در بخش Settings > Variables and Secrets یک Secret بسازید:
   - Name: `ADMIN_PASSWORD`
   - Value: رمز مدیریت شما
6. دوباره Deploy کنید.
7. آدرس `workers.dev` سایت اصلی است و `/admin.html` پنل مدیریت است.

## نکته مهم
این پروژه عمداً `database_id` را داخل `wrangler.json` ندارد، چون در این روش اتصال D1 از داخل Dashboard انجام می‌شود. Cloudflare رسماً Dashboard binding برای D1 را پشتیبانی می‌کند.
