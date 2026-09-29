function clean(s=''){return String(s).replace(/[<>]/g,'').trim()}
function placeholder(res,name){
  res.setHeader('Content-Type','image/svg+xml; charset=utf-8');res.setHeader('Cache-Control','no-store');
  const n=clean(name).replace(/[&"]/g,'').slice(0,58);
  return res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#eee3d7"/><stop offset="1" stop-color="#f8f3ec"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="47%" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" fill="#6f6257">Image en préparation</text><text x="50%" y="54%" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" fill="#8b7e72">${n}</text></svg>`);
}
async function generateImage(apiKey,model,prompt){
  const r=await fetch('https://ai-gateway.vercel.sh/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,prompt,n:1,response_format:'b64_json',providerOptions:{blackForestLabs:{outputFormat:'jpeg'}}})});
  const d=await r.json();if(!r.ok){console.error('[recipe-image] generation response',{status:r.status,error:d?.error?.message||d?.error||d?.message||'unknown'});throw new Error('image generation failed: '+r.status);}
  const item=d?.data?.[0];if(item?.b64_json)return {b64:item.b64_json,mime:'image/jpeg'};
  if(item?.url){
    const img=await fetch(item.url);if(!img.ok)throw new Error('generated image fetch failed');
    const ab=await img.arrayBuffer();return {b64:Buffer.from(ab).toString('base64'),mime:img.headers.get('content-type')||'image/png'};
  }
  throw new Error('no generated image');
}
async function verifyImage(apiKey,model,b64,mime,ctx){
  if(!model)return {match:false,confidence:0};
  const content=[
    {type:'text',text:`Recipe name: ${ctx.name}\nDish type/tags: ${ctx.tags}\nIngredients: ${ctx.ingredients.join(', ')}\nVerify that this generated food photo represents the exact requested recipe closely enough for a recipe card. The main dish type and defining ingredients must be visually consistent. Reject a different protein, oatmeal when the dish is eggs, a generic salad when it should be a stuffed potato, etc. Minor garnish differences are fine. Return strict JSON only: {"match":boolean,"confidence":number,"reason":string}.`},
    {type:'image_url',image_url:{url:`data:${mime};base64,${b64}`},detail:'low'}
  ];
  try{
    const r=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:'You are a strict food-photo quality controller. Approve only if the image is visually consistent with the named recipe and main ingredients.'},{role:'user',content}]})});
    const d=await r.json();if(!r.ok)return {match:false,confidence:0};const raw=d?.choices?.[0]?.message?.content;return typeof raw==='string'?JSON.parse(raw):raw;
  }catch{return {match:false,confidence:0}}
}
function imagePrompt(name,ingredients,tags,strict=false){
  const key=ingredients.slice(0,7).join(', ');
  return `Professional realistic food photography for a recipe app. Create EXACTLY this dish: "${name}". Main ingredients: ${key}. Recipe context: ${tags}. ${strict?'Be literal: clearly show the defining ingredients and exact dish form; do not substitute another dish, grain, protein, or breakfast type. ':''}Natural appetizing plating, believable portion, soft daylight, restaurant-quality but realistic home food, 4:3 composition, no people, no hands, no text, no labels, no packaging, no logos.`;
}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const name=clean(req.query?.name||'').slice(0,220),ingredients=clean(req.query?.ingredients||'').slice(0,900).split('|').map(x=>x.trim()).filter(Boolean),tags=clean(req.query?.tags||'').slice(0,400);
  if(!name)return res.status(400).end();
  const apiKey=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
  const imageModel=process.env.AI_IMAGE_MODEL||'bfl/flux-2-pro';
  const visionModel=process.env.AI_VISION_MODEL||process.env.AI_MODEL||'openai/gpt-5.6-sol';
  if(!apiKey){console.error('[recipe-image] no AI Gateway credential available');return placeholder(res,name);}
  console.log('[recipe-image] start',{name,imageModel,hasVisionModel:Boolean(visionModel)});
  for(let attempt=0;attempt<2;attempt++){
    try{
      const generated=await generateImage(apiKey,imageModel,imagePrompt(name,ingredients,tags,attempt===1));
      console.log('[recipe-image] generated',{name,attempt,mime:generated.mime,bytes:generated.b64?.length||0});
      const check=await verifyImage(apiKey,visionModel,generated.b64,generated.mime,{name,ingredients,tags});
      console.log('[recipe-image] verified',{name,attempt,match:check?.match,confidence:check?.confidence,reason:check?.reason||''});
      if(check?.match===true&&Number(check.confidence)>=0.72){
        const buf=Buffer.from(generated.b64,'base64');
        res.setHeader('Content-Type',generated.mime||'image/png');res.setHeader('Cache-Control','public, s-maxage=2592000, stale-while-revalidate=7776000');
        return res.status(200).end(buf);
      }
    }catch(e){console.error('[recipe-image] attempt failed',{name,attempt,error:String(e?.message||e)})}
  }
  console.error('[recipe-image] all attempts rejected',{name});return placeholder(res,name);
}