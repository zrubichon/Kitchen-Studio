export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.AI_GATEWAY_API_KEY,model=process.env.AI_MODEL;
  if(!apiKey||!model)return res.status(503).json({error:'AI cooking adaptation is not configured'});
  const recipe=req.body?.recipe,device=req.body?.device;
  if(!recipe||!device)return res.status(400).json({error:'recipe and device required'});
  const system=`You are Kitchen Studio's appliance-specific cooking adapter. You receive one recipe and one researched kitchen-appliance profile.

Return STRICT JSON only:
{
"compatible": boolean,
"device": string,
"mode": string|null,
"temperatureF": number|null,
"temperatureC": number|null,
"timeMinutes": {"min":number,"max":number}|null,
"container": string|null,
"preheat": string|null,
"preparation": string[],
"steps": string[],
"notes": string,
"safety": string
}

Rules:
- Recommend using the selected appliance ONLY if it genuinely makes sense for the recipe.
- Respect the appliance's supported modes and explicit temperature range. Never name a mode the device profile does not support.
- If exact device limits are unknown, be conservative and say so in notes rather than inventing a device capability.
- Recipe-specific time/temperature are culinary recommendations, not manufacturer claims.
- When the appliance is unsuitable (e.g. blender for a roast), compatible=false and explain briefly; do not force a method.
- Account for form factor: basket, dual basket, oven-style, glass vessel, pressure pot, blender, etc.
- Specify the correct vessel/accessory/preparation when relevant: crisper plate, oven-safe mold, rack, tray, inner pot, liquid requirement, probe, etc.
- For meat/fish, include a safety note to verify final doneness/core temperature as appropriate.
- Prefer clear step-by-step instructions, including shake/flip/stir timing when useful.
- Keep temperatures inside device.tempRangeF when it is known.`;
  const payload={recipe:{name:recipe.name,time:recipe.time,ingredients:recipe.ingredients,steps:recipe.steps,tags:recipe.tags,methods:recipe.methods},device};
  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,temperature:0.15,response_format:{type:'json_object'},messages:[
        {role:'system',content:system},
        {role:'user',content:JSON.stringify(payload)}
      ]})
    });
    const data=await upstream.json();
    if(!upstream.ok)return res.status(upstream.status).json({error:'AI cooking adaptation failed',details:data});
    const raw=data?.choices?.[0]?.message?.content;
    const guide=typeof raw==='string'?JSON.parse(raw):raw;
    return res.status(200).json(guide);
  }catch(e){return res.status(500).json({error:'Cooking adaptation failed'})}
}
