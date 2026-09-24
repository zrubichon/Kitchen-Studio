function decodeHtml(s=''){return s.replace(/&amp;/g,'&').replace(/&#x2F;/gi,'/').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<[^>]+>/g,' ')}
function clean(s=''){return decodeHtml(s).replace(/\s+/g,' ').trim()}
function extractResults(html){
  const blocks=[...html.matchAll(/<li class="b_algo"[\s\S]*?<\/li>/gi)].slice(0,8).map(m=>m[0]);
  const out=[];
  for(const b of blocks){
    const a=b.match(/<h2><a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/i);
    if(!a)continue;
    const p=b.match(/<p>([\s\S]*?)<\/p>/i);
    out.push({url:decodeHtml(a[1]),title:clean(a[2]),snippet:clean(p?.[1]||'')});
  }
  return out.filter(x=>/^https?:\/\//i.test(x.url));
}
function stripPage(html){
  return clean(html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ')).slice(0,12000);
}
function likelyOfficial(url,brand=''){
  try{
    const host=new URL(url).hostname.toLowerCase();
    const b=brand.toLowerCase().replace(/[^a-z0-9]/g,'');
    return b&&host.replace(/[^a-z0-9]/g,'').includes(b);
  }catch{return false}
}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const query=String(req.body?.query||'').trim().slice(0,220);
  if(!query)return res.status(400).json({error:'Device query required'});
  const apiKey=process.env.AI_GATEWAY_API_KEY,model=process.env.AI_MODEL;
  if(!apiKey||!model)return res.status(503).json({error:'AI research is not configured'});
  const headers={'user-agent':'Mozilla/5.0 (compatible; KitchenStudio/1.0)','accept':'text/html,application/xhtml+xml'};
  let results=[];
  for(const q of [`"${query}" official product manual specifications temperature modes`,`"${query}" manual pdf manufacturer`]){
    try{
      const r=await fetch('https://www.bing.com/search?q='+encodeURIComponent(q)+'&count=8',{headers,redirect:'follow'});
      if(r.ok)results.push(...extractResults(await r.text()));
    }catch{}
  }
  const seen=new Set();results=results.filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true}).slice(0,10);
  const pages=[];
  for(const item of results.slice(0,5)){
    try{
      const u=new URL(item.url);if(!['http:','https:'].includes(u.protocol))continue;
      const r=await fetch(item.url,{headers,redirect:'follow',signal:AbortSignal.timeout(4500)});
      const type=r.headers.get('content-type')||'';
      if(r.ok&&type.includes('text/html'))pages.push({url:r.url||item.url,title:item.title,text:stripPage(await r.text())});
    }catch{}
  }
  const evidence={query,results,pages};
  const system=`You are Kitchen Studio's appliance research engine. Identify the exact kitchen appliance requested by the user using ONLY the supplied web-search evidence. The appliance may be an air fryer, oven, multicooker, rice cooker, blender, slow cooker, grill, microwave, toaster oven, or another kitchen appliance.

Return STRICT JSON only with:
{
"id": "custom-slug",
"brand": string|null,
"model": string|null,
"modelCode": string|null,
"type": string|null,
"description": string,
"confidence": number 0..1,
"verified": boolean,
"source": string|null,
"sourceUrls": string[],
"tempRangeF": [number,number]|null,
"capacityQt": number|null,
"style": "basket"|"dual"|"oven"|"glass"|"pot"|"blender"|"grill"|"microwave"|"other",
"container": string|null,
"preheat": "recommended"|"optional"|"not-required"|"unknown",
"modes": [{"name":string,"preset":string|null,"goodFor":string|null}],
"notes": string,
"evidenceSummary": string
}
Rules:
- Do not invent any exact specification. Unknown facts must be null/"unknown".
- verified=true only when the exact model/reference is supported by credible evidence, preferably manufacturer/manual.
- source should be the strongest manufacturer/manual source URL available.
- Keep modes to actually supported named modes/functions found in evidence.
- For temperature ranges, only return them when explicitly supported by evidence.
- Do not provide recipe-specific cooking times here.
- If the query is ambiguous, choose the strongest exact candidate but lower confidence and explain what remains uncertain.`;
  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',
      headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,temperature:0,response_format:{type:'json_object'},messages:[
        {role:'system',content:system},
        {role:'user',content:'Research this appliance from the evidence:\n'+JSON.stringify(evidence).slice(0,50000)}
      ]})
    });
    const data=await upstream.json();
    if(!upstream.ok)return res.status(upstream.status).json({error:'AI appliance research failed',details:data});
    const raw=data?.choices?.[0]?.message?.content;
    const device=typeof raw==='string'?JSON.parse(raw):raw;
    if(!device||!device.model)return res.status(422).json({error:'No exact appliance could be identified',evidence:results.slice(0,5)});
    device.id=device.id||('custom-'+String(device.brand||'device')+'-'+String(device.modelCode||device.model)).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
    return res.status(200).json({device,searchResults:results.slice(0,6)});
  }catch(e){
    return res.status(500).json({error:'Appliance research failed'});
  }
}
