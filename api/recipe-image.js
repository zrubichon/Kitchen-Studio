function decodeHtml(s=''){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\u0026/g,'&')}
function norm(s=''){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function safe(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.toString():null}catch{return null}}
const WORDS={poulet:'chicken',saumon:'salmon',cabillaud:'cod',crevettes:'shrimp',crevette:'shrimp',boeuf:'beef','bœuf':'beef',porc:'pork',jambon:'ham',oeufs:'eggs','œufs':'eggs',oeuf:'egg','œuf':'egg',pois:'chickpea',chiches:'chickpea',lentilles:'lentils',lentille:'lentils',tofu:'tofu',riz:'rice',pates:'pasta','pâtes':'pasta',nouilles:'noodles',salade:'salad',soupe:'soup',tomates:'tomato',tomate:'tomato',epinards:'spinach','épinards':'spinach',feta:'feta',avocat:'avocado',thon:'tuna',edamame:'edamame',avoine:'oats',porridge:'oatmeal',yaourt:'yogurt',skyr:'skyr',banane:'banana',pomme:'apple',patate:'potato',douce:'sweet potato',pommes:'potatoes',terre:'potatoes',haricots:'beans',mais:'corn','maïs':'corn',couscous:'couscous',tortilla:'wrap',wrap:'wrap',citron:'lemon',curry:'curry',chocolat:'chocolate',beurre:'butter',cacahuete:'peanut','cacahuète':'peanut',bowl:'bowl',mug:'mug'};
function translate(text=''){return norm(text).split(' ').filter(Boolean).map(x=>WORDS[x]||x).filter((x,i,a)=>x.length>2&&a.indexOf(x)===i)}
function extractCandidates(html){
  const out=[];let m;
  const re=/m=(["'])(\{.*?\})\1/g;
  while((m=re.exec(html))&&out.length<100){try{const o=JSON.parse(decodeHtml(m[2]));if(o.murl)out.push({url:o.murl,title:o.t||o.desc||'',page:o.purl||''})}catch{}}
  if(!out.length){const re2=/"murl":"([^"]+)","purl":"([^"]*)","t":"([^"]*)"/g;while((m=re2.exec(html))&&out.length<100)out.push({url:m[1].replace(/\\\//g,'/'),page:m[2].replace(/\\\//g,'/'),title:m[3]})}
  return out;
}
function dishType(name='',tags=''){
  const n=norm(name+' '+tags);
  if(/smoothie|drink|boisson|chocolat chaud/.test(n))return'beverage';
  if(/porridge|oatmeal|overnight/.test(n))return'oatmeal';
  if(/mug/.test(n)&&/egg|oeuf/.test(n))return'savory egg mug';
  if(/wrap|tortilla|burrito/.test(n))return'wrap';
  if(/salad|salade/.test(n))return'salad';
  if(/soup|soupe/.test(n))return'soup';
  if(/pasta|pates|nouilles/.test(n))return'pasta';
  if(/toast|bagel/.test(n))return'toast';
  if(/bowl|bol|riz|rice/.test(n))return'grain bowl';
  if(/potato|patate|pomme de terre/.test(n))return'potato dish';
  return'plated meal';
}
function textScore(c,required,optional,bad){
  const h=norm([c.title,c.page,c.url].join(' '));let s=0;
  required.forEach(k=>{if(h.includes(k))s+=10});
  optional.forEach(k=>{if(h.includes(k))s+=2});
  bad.forEach(k=>{if(h.includes(k))s-=16});
  if(/recipe|food|dish|meal|cooking/.test(h))s+=3;
  if(/logo|icon|vector|drawing|clipart|package|raw/.test(h))s-=12;
  return s;
}
async function verifyWithAI(candidate,ctx){
  const apiKey=process.env.AI_GATEWAY_API_KEY,model=process.env.AI_MODEL;
  if(!apiKey||!model)return {match:false,confidence:0,reason:'AI verification unavailable'};
  const content=[
    {type:'text',text:`Recipe: ${ctx.name}\nDish type: ${ctx.dish}\nIngredients: ${ctx.ingredients.join(', ')}\nImportant visible concepts: ${ctx.required.join(', ')}\nCandidate metadata: ${candidate.title} | ${candidate.page}\nDecide whether the photo visually represents this recipe closely enough for a recipe card. Reject if it is a different dish type, different main protein, or clearly missing/replacing the defining ingredients. Minor garnish differences are acceptable. Return JSON only: {"match":boolean,"confidence":number,"reason":string}.`},
    {type:'image_url',image_url:{url:candidate.url},detail:'low'}
  ];
  try{
    const r=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:'You are a strict food-photo verifier. Never approve a merely similar generic meal when the visible dish conflicts with the recipe.'},{role:'user',content}]})});
    const d=await r.json();if(!r.ok)return {match:false,confidence:0,reason:'vision check failed'};
    const raw=d?.choices?.[0]?.message?.content;return typeof raw==='string'?JSON.parse(raw):raw;
  }catch{return {match:false,confidence:0,reason:'vision check failed'}}
}
function placeholder(res,name){
  res.setHeader('Content-Type','image/svg+xml; charset=utf-8');res.setHeader('Cache-Control','no-store');
  const safeName=String(name).replace(/[<>&"]/g,'').slice(0,54);
  return res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#eee3d7"/><stop offset="1" stop-color="#f8f3ec"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="47%" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" fill="#6f6257">Image en préparation</text><text x="50%" y="54%" text-anchor="middle" font-family="Arial,sans-serif" font-size="23" fill="#8b7e72">${safeName}</text></svg>`);
}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const name=String(req.query?.name||'').slice(0,220),ingredientsRaw=String(req.query?.ingredients||'').slice(0,900),tags=String(req.query?.tags||'').slice(0,400);
  if(!name)return res.status(400).end();
  const ingredients=ingredientsRaw.split('|').map(x=>x.trim()).filter(Boolean);
  const dish=dishType(name,tags),nameTokens=translate(name),ingredientTokens=translate(ingredients.join(' '));
  const required=[...new Set([...nameTokens.slice(0,4),...ingredientTokens.slice(0,4),...translate(dish).slice(0,2)])].slice(0,7);
  const optional=[...new Set([...nameTokens,...ingredientTokens])].slice(0,14);
  const bad=[];
  const all=norm(name+' '+ingredients.join(' '));
  const proteinGroups=[['chicken','poulet'],['salmon','saumon'],['tuna','thon'],['beef','boeuf'],['pork','porc'],['tofu'],['eggs','oeuf']];
  const present=proteinGroups.find(g=>g.some(x=>all.includes(norm(x))));
  proteinGroups.forEach(g=>{if(present!==g)bad.push(...g)});
  const query=[...translate(name).slice(0,8),...ingredientTokens.slice(0,6),dish,'recipe food photography'].join(' ');
  try{
    const sr=await fetch('https://www.bing.com/images/search?q='+encodeURIComponent(query)+'&form=HDRSC2&first=1',{headers:{'user-agent':'Mozilla/5.0 (compatible; MiseKitchen/2.0)','accept':'text/html'}});
    if(sr.ok){
      const ranked=extractCandidates(await sr.text()).map(c=>({...c,url:safe(c.url)})).filter(c=>c.url).map(c=>({...c,score:textScore(c,required,optional,bad)})).filter(c=>c.score>=4).sort((a,b)=>b.score-a.score).slice(0,6);
      for(const c of ranked.slice(0,4)){
        const check=await verifyWithAI(c,{name,dish,ingredients,required});
        if(check?.match===true&&Number(check.confidence)>=0.78){
          res.setHeader('Cache-Control','public, s-maxage=604800, stale-while-revalidate=2592000');
          return res.redirect(302,c.url);
        }
      }
    }
  }catch{}
  return placeholder(res,name);
}