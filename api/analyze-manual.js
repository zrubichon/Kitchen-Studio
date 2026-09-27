export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.AI_GATEWAY_API_KEY,model=process.env.AI_MODEL;
  if(!apiKey||!model)return res.status(503).json({error:'AI manual analysis is not configured'});
  const {device,images=[],existingKnowledge=null}=req.body||{};
  if(!device||!Array.isArray(images)||!images.length)return res.status(400).json({error:'device and images required'});
  const valid=images.filter(x=>typeof x==='string'&&x.startsWith('data:image/')).slice(0,6);
  if(!valid.length)return res.status(400).json({error:'valid manual page images required'});

  const system=`You extract durable, model-specific cooking knowledge from photographed appliance manual pages.
Return STRICT JSON only:
{
"deviceIdentity":{"brand":string|null,"model":string|null,"modelCode":string|null},
"temperatureRangeF":[number,number]|null,
"temperatureRangeC":[number,number]|null,
"modes":[{"name":string,"temperatureRangeF":[number,number]|null,"defaultTempF":number|null,"defaultTimeMin":number|null,"notes":string|null}],
"accessories":[{"name":string,"use":string|null}],
"preheat":{"required":boolean|null,"instructions":string|null},
"airflowAndPlacement":[string],
"turnShakeStirRules":[string],
"capacityRules":[string],
"liquidRules":[string],
"cookingCharts":[{"food":string,"mode":string|null,"temperatureF":number|null,"timeMin":{"min":number,"max":number}|null,"prep":string|null,"turnOrShake":string|null}],
"warnings":[string],
"pageSummaries":[string],
"confidence":number
}
Rules:
- Extract ONLY what is visible in the provided manual pages or already present in existingKnowledge.
- Never invent missing temperatures, times, modes, accessories, capacities, or warnings.
- Merge new pages with existingKnowledge without deleting previously supported facts unless the new pages clearly correct them.
- Prefer exact manual terminology.
- Preserve contradictory values as notes rather than guessing which is right.
- This knowledge will later override generic cooking assumptions for this specific appliance.`;

  const content=[{type:'text',text:'Device profile: '+JSON.stringify(device)+'\nExisting extracted manual knowledge: '+JSON.stringify(existingKnowledge)}];
  valid.forEach((url,i)=>content.push({type:'image_url',image_url:{url},detail:'high'}));

  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
      method:'POST',
      headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,temperature:0,response_format:{type:'json_object'},messages:[
        {role:'system',content:system},
        {role:'user',content}
      ]})
    });
    const data=await upstream.json();
    if(!upstream.ok)return res.status(upstream.status).json({error:'Manual analysis failed',details:data});
    const raw=data?.choices?.[0]?.message?.content;
    const knowledge=typeof raw==='string'?JSON.parse(raw):raw;
    return res.status(200).json({knowledge});
  }catch(e){
    return res.status(500).json({error:'Manual analysis failed'});
  }
}
