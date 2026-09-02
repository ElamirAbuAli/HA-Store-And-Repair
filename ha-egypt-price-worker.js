const E="https://www.egprices.com";
const C={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Methods":"GET,OPTIONS",
 "Content-Type":"application/json;charset=utf-8"
};
const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:C});
const N=x=>String(x||"").toLowerCase().replace(/[أإآ]/g,"ا").replace(/ة/g,"ه");
const P=t=>{
 let m=String(t).match(/(?:Price:\s*|السعر[:：]\s*)([\d,٬.]+)(?:\s*-\s*([\d,٬.]+))?\s*(?:EGP|ج\.?\s*م)/i);
 if(m)return +m[1].replace(/[,٬]/g,"");
 let a=[...String(t).matchAll(/([\d,]{3,})\s*EGP/gi)]
   .map(x=>+x[1].replace(/,/g,""))
   .filter(x=>x>500&&x<300000);
 return a.length?Math.min(...a):0;
};
async function T(u){
 let r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});
 if(!r.ok)throw 0;
 return r.text();
}
function links(t){
 let a=[];
 let re=/href=["']((?:https?:\/\/www\.egprices\.com)?\/(?:en|ar)\/product\/[^"'?#]+)["']/gi,m;
 while((m=re.exec(t))&&a.length<12){
  let u=m[1].startsWith("http")?m[1]:E+m[1];
  if(!a.includes(u))a.push(u);
 }
 return a;
}
function slug(q){
 return N(q).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
export default{async fetch(r){
 if(r.method=="OPTIONS")return new Response(null,{status:204,headers:C});
 let u=new URL(r.url);
 if(u.pathname!="/price")return J({ok:true,service:"H&A Egyptian Phone Price API"});
 let q=u.searchParams.get("query")?.trim();
 if(!q)return J({ok:false,error:"query_required"},400);
 try{
  let s=await T(E+"/en/search?q="+encodeURIComponent(q));
  let a=links(s);
  let direct=E+"/en/product/"+slug(q);
  if(!a.includes(direct))a.unshift(direct);
  let nq=N(q),best=0,bestUrl="";
  for(let x of a.slice(0,10)){
   try{
    let t=await T(x),p=P(t),nt=N(t);
    if(p&&nt.includes(nq.split(/\s+/)[0])){
     if(!best||p<best){best=p;bestUrl=x}
    }
   }catch(e){}
  }
  if(!best)return J({ok:false,error:"price_not_found"},404);
  return J({
   ok:true,
   price:best,
   source:"EGPrices",
   date:new Date().toISOString().slice(0,10),
   url:bestUrl
  });
 }catch(e){
  return J({ok:false,error:"price_not_found"},404);
 }
}};
