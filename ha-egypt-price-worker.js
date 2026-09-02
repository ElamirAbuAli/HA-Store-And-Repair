const E="https://www.egprices.com";
const C={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,OPTIONS","Content-Type":"application/json;charset=utf-8"};
const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:C});
const N=x=>String(x||"").toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه");
const P=t=>{let m=t.match(/(?:Price:\s*|السعر[:：]\s*)([\d,٬.]+)/i)||t.match(/([\d,]{3,})\s*EGP/i);return m?+m[1].replace(/[,٬]/g,""):0};
async function T(u){let r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});if(!r.ok)throw 0;return r.text()}
export default{async fetch(r){
 if(r.method=="OPTIONS")return new Response(null,{status:204,headers:C});
 let u=new URL(r.url);
 if(u.pathname!="/price")return J({ok:true,service:"H&A Egyptian Phone Price API"});
 let q=u.searchParams.get("query")?.trim();if(!q)return J({ok:false,error:"query_required"},400);
 try{
  let s=await T(E+"/en/search?q="+encodeURIComponent(q));
  let a=[...s.matchAll(/https?:\/\/www\.egprices\.com\/(?:en|ar)\/product\/[a-z0-9-]+/gi)].map(x=>x[0]);
  for(let x of [...new Set(a)].slice(0,8)){let t=await T(x),p=P(t);if(p&&N(t).includes(N(q).split(" ")[0]))return J({ok:true,price:p,source:"EGPrices",date:new Date().toISOString().slice(0,10),url:x})}
  return J({ok:false,error:"price_not_found"},404)
 }catch(e){return J({ok:false,error:"price_not_found"},404)}
}};
