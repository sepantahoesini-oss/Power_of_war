const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
const ub64=s=>{const x=s.replaceAll("-","+").replaceAll("_","/");const pad=(4-(x.length%4))%4;return Uint8Array.from(atob(x+"=".repeat(pad)),c=>c.charCodeAt(0));};
async function hmac(secret,data){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64(await crypto.subtle.sign("HMAC",k,new TextEncoder().encode(data)))}
async function token(env){const exp=Date.now()+1000*60*60*12,body=b64(new TextEncoder().encode(String(exp)));return body+"."+await hmac(env.ADMIN_PASSWORD,body)}
async function valid(req,env){const x=req.headers.get("authorization")||"";if(!x.startsWith("Bearer "))return false;const t=x.slice(7),[body,sig]=t.split(".");if(!body||!sig||Number(new TextDecoder().decode(ub64(body)))<Date.now())return false;const good=await hmac(env.ADMIN_PASSWORD,body);return good===sig}
export default{async fetch(req,env){
 const u=new URL(req.url),path=u.pathname;
 if(path==="/api/admin/login"&&req.method==="POST"){try{const {password}=await req.json();if(password!==env.ADMIN_PASSWORD)return json({message:"wrong"},401);return json({token:await token(env)})}catch{return json({message:"bad"},400)}}
 if(path==="/api/users/"||path==="/api/users")return json({message:"not found"},404);
 if(path.startsWith("/api/users/")&&req.method==="GET"){const code=decodeURIComponent(path.split("/").pop()).toUpperCase();const r=await env.DB.prepare("SELECT code,name,total_games,played_games FROM users WHERE code=?").bind(code).first();return r?json(r):json({message:"not found"},404)}
 if(path==="/api/admin/users"||path.startsWith("/api/admin/users/")){
   if(!(await valid(req,env)))return json({message:"unauthorized"},401);
   if(path==="/api/admin/users"&&req.method==="GET"){const {results}=await env.DB.prepare("SELECT code,name,total_games,played_games,created_at FROM users ORDER BY id DESC").all();return json(results)}
   if(path==="/api/admin/users"&&req.method==="POST"){try{const d=await req.json();const code=String(d.code||"").toUpperCase(),name=String(d.name||"").trim(),t=Number(d.total_games),p=Number(d.played_games);if(!/^POW\d+$/.test(code)||!name||!Number.isInteger(t)||!Number.isInteger(p)||t<0||p<0||p>t)return json({message:"اطلاعات نامعتبر است."},400);await env.DB.prepare("INSERT INTO users(code,name,total_games,played_games) VALUES(?,?,?,?)").bind(code,name,t,p).run();return json({message:"کاربر با موفقیت ثبت شد."},201)}catch(e){if(String(e).includes("UNIQUE"))return json({message:"این کد قبلاً ثبت شده است."},409);return json({message:"خطا در ثبت کاربر."},500)}}
   const code=decodeURIComponent(path.split("/").pop()).toUpperCase();
   if(req.method==="GET"){const r=await env.DB.prepare("SELECT code,name,total_games,played_games FROM users WHERE code=?").bind(code).first();return r?json(r):json({message:"not found"},404)}
   if(req.method==="PUT"){try{const d=await req.json(),n=String(d.name||"").trim(),t=Number(d.total_games),p=Number(d.played_games);if(!n||!Number.isInteger(t)||!Number.isInteger(p)||t<0||p<0||p>t)return json({message:"اطلاعات نامعتبر است."},400);await env.DB.prepare("UPDATE users SET name=?,total_games=?,played_games=? WHERE code=?").bind(n,t,p,code).run();return json({message:"updated"})}catch{return json({message:"خطا"},500)}}
   if(req.method==="DELETE"){await env.DB.prepare("DELETE FROM users WHERE code=?").bind(code).run();return json({message:"deleted"})}
 }
 return env.ASSETS.fetch(req)
}}
