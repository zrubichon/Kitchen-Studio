import { aiFailure } from '../lib/ai-status.js';
import { requirePremium } from '../lib/access.js';
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!await requirePremium(req,res))return;
  const apiKey=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN,model=process.env.AI_MODEL||'openai/gpt-5.6-sol';
  if(!apiKey||!model)return res.status(503).json({error:'AI cooking adaptation is not configured'});
  const recipe=req.body?.recipe,device=req.body?.device,servings=Math.max(1,Number(req.body?.servings||1));
  if(!recipe||!device)return res.status(400).json({error:'recipe and device required'});
  const system=`You are Mise's appliance-specific cooking engineer. Produce a practical cooking guide that a beginner can follow without guessing.

Return STRICT JSON only:
{
"compatible": boolean,
"device": string,
"mode": string|null,
"temperatureF": number|null,
"temperatureC": number|null,
"powerLevel": string|null,
"timeMinutes": {"min":number,"max":number}|null,
"container": string|null,
"placement": string|null,
"preheat": string|null,
"doneness": string|null,
"preparation": string[],
"steps": string[],
"notes": string,
"safety": string,
"manualBased": boolean
}

Non-negotiable rules:
- Quantities from recipe.ingredients are for one serving. The requested serving count is supplied. In preparation/steps, mention the scaled quantities when an ingredient is first used whenever practical.
- If device.manualKnowledge exists, it is the HIGHEST-PRIORITY source. Use its exact mode names, temperature limits, preheat rules, accessories, rack/basket/inner-pot placement, turn/shake/stir instructions, liquid requirements, capacity rules and matching cooking-chart values.
- Never contradict the photographed manual. Never invent a manual mode or accessory.
- Set manualBased=true when manualKnowledge materially determines the method.
- Prefer the user's active appliance whenever it is genuinely suitable. If not suitable, compatible=false rather than forcing it.
- Give an exact recommended temperature when the appliance uses temperature control. For microwave-only devices, temperature may be null and powerLevel must be explicit.
- Give a concrete time range, preheat instruction, correct container/accessory, and exact placement (middle rack, crisper plate, basket, inner pot, turntable, etc.) when known.
- Steps must be detailed and chronological: mise en place, preheat/setup, seasoning, loading vessel, cooking, turning/stirring timing, doneness check, rest/finish.
- For raw poultry use 74°C/165°F core temperature. For fish, state an appropriate doneness check. For reheating, say food must be piping hot throughout.
- Stay inside known device temperature limits. If a device-specific fact is unknown, say so in notes rather than pretending it came from the manual.
- Culinary settings may be recommendations when no exact chart exists; explicitly distinguish those from manual-derived settings.`;
  const payload={servings,recipe:{name:recipe.name,time:recipe.time,ingredients:recipe.ingredients,steps:recipe.steps,tags:recipe.tags,methods:recipe.methods},device};
  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,temperature:0.1,response_format:{type:'json_object'},messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(payload)}]})});
    const data=await upstream.json();if(!upstream.ok)return res.status(upstream.status).json({error:'AI cooking adaptation failed',...aiFailure(data,upstream.status)});
    const raw=data?.choices?.[0]?.message?.content,guide=typeof raw==='string'?JSON.parse(raw):raw;
    return res.status(200).json(guide);
  }catch{return res.status(500).json({error:'Cooking adaptation failed'})}
}
