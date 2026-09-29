export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const p=req.body||{};
  const fallback=()=>{
    const fr=(p.language||'fr')!=='en';
    const name=p.firstName?((fr?'Bienvenue ':'Welcome ')+p.firstName+' — '):'';
    const range=(p.calorieLow&&p.calorieHigh)?p.calorieLow+'–'+p.calorieHigh+' kcal/'+(fr?'jour':'day'):'';
    const duration=p.durationMinWeeks?((fr?' sur environ ':' over roughly ')+p.durationMinWeeks+'–'+p.durationMaxWeeks+(fr?' semaines':' weeks')):'';
    return name+(fr?'Mise adapte les menus à votre objectif avec une cible progressive de ':'Mise adapts your menus to your goal with a gradual target of ')+range+duration+'.';
  };
  const apiKey=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN,model=process.env.AI_MODEL||'openai/gpt-5.6-sol';
  if(!apiKey||!model)return res.status(200).json({text:fallback(),fallback:true});
  const system='Write exactly one short, supportive sentence for a meal-planning app. Use only the supplied goal summary. Do not diagnose, shame, promise a result, prescribe extreme calorie deficits, or frame exercise as compensation for eating. Mention the calorie range and timeline only when provided. Return plain text only.';
  try{
    const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(p)}],temperature:.35,max_tokens:90})});
    const data=await upstream.json();
    const text=data?.choices?.[0]?.message?.content?.trim();
    if(!upstream.ok||!text)return res.status(200).json({text:fallback(),fallback:true});
    return res.status(200).json({text});
  }catch{return res.status(200).json({text:fallback(),fallback:true})}
}