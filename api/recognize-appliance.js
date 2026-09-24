export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.AI_GATEWAY_API_KEY, model=process.env.AI_MODEL;
  if(!apiKey||!model) return res.status(503).json({error:'AI Gateway not configured'});
  const {imageDataUrl,catalog=[]}=req.body||{};
  if(typeof imageDataUrl!=='string'||!imageDataUrl.startsWith('data:image/')) return res.status(400).json({error:'Valid imageDataUrl required'});
  const system=`You identify kitchen appliances from photos. Be conservative. Compare the appliance only against the supplied verified catalog. Return strict JSON: {"matchId": string|null, "brand": string|null, "model": string|null, "type": string|null, "confidence": number from 0 to 1, "visibleEvidence": string}. Set matchId only when visual evidence strongly supports one catalog entry. Never invent cooking modes or settings.`;
  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,messages:[
        {role:'system',content:system},
        {role:'user',content:[
          {type:'text',text:`Verified catalog: ${JSON.stringify(catalog)}. Identify the photographed kitchen appliance. Use visible brand/model text, shape and controls. If uncertain, use matchId:null.`},
          {type:'image_url',image_url:{url:imageDataUrl}}
        ]}
      ],temperature:0,response_format:{type:'json_object'}})
    });
    const data=await upstream.json();
    if(!upstream.ok) return res.status(upstream.status).json({error:'Vision model request failed',details:data});
    const content=data?.choices?.[0]?.message?.content;
    const parsed=typeof content==='string'?JSON.parse(content):content;
    return res.status(200).json(parsed);
  }catch(e){return res.status(500).json({error:'Appliance recognition failed'})}
}
