const recipeIds = ["overnight-oats","egg-toast","protein-pancakes","chicken-bowl","turkey-wrap","greek-salad","tofu-bowl","salmon-rice","fried-rice","chicken-pasta","sheet-pan","cosori-turboblaze-6","instant-vortex-plus-6","ninja-foodi-xl-dt200","herb-salmon","cod-provencal","beef-bowl","beef-burger","pork-tenderloin","thai-chicken","chicken-parm","vegan-curry","vegan-noodles","croque-monsieur","italian-pesto","american-tacos","french-omelet","breakfast-burrito","berry-smoothie","green-smoothie","iced-matcha","protein-chocolate","apple-tart","birthday-cake","holiday-cookies","thai-shrimp","chinese-orange-chicken","caprese-toast","greek-souvlaki","spanish-paella","mexican-burrito-bowl","japanese-teriyaki-salmon","korean-bibimbap","vietnamese-pho","indian-dal","moroccan-tagine","lebanese-falafel-bowl","shakshuka","chicken-caesar","tomato-soup","onepot-pasta","zoodle-chicken","chia-pudding","brunch-french-toast","date-night-steak","family-lasagna","summer-salad","winter-lentil-soup"];
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_MODEL;
  if (!apiKey || !model) return res.status(503).json({ error: 'AI gateway not configured; client fallback will be used.' });
  const payload = req.body || {};
  const system = `You are the meal-planning engine for a premium cooking app. Return ONLY strict JSON with a key "plan" containing exactly 7 arrays, each with exactly 3 recipe IDs (breakfast,lunch,dinner). Use only these IDs: ${recipeIds.join(', ')}. Respect the supplied profile and weekly brief. The user's weekly grocery budget is a HARD MAXIMUM, not a suggestion. Strongly reuse ingredients, prefer budget-tagged meals when needed, and avoid expensive proteins too often. Respect diet, protein priority, sugar preference, allergies, applianceId and time. Keep variety when possible without exceeding budget.`;
  try {
    const upstream = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method:'POST', headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:JSON.stringify(payload)}],temperature:0.4,response_format:{type:'json_object'}})
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    const content = data?.choices?.[0]?.message?.content;
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (!Array.isArray(parsed?.plan) || parsed.plan.length !== 7) throw new Error('Invalid plan');
    return res.status(200).json({ plan: parsed.plan });
  } catch (error) { return res.status(500).json({ error: 'AI generation failed' }); }
}
