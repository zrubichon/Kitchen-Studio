function decodeHtml(s=''){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\u0026/g,'&')}
function norm(s=''){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function hash(s=''){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const WORDS={
  poulet:'chicken',saumon:'salmon',cabillaud:'cod',crevettes:'shrimp',crevette:'shrimp',boeuf:'beef','bœuf':'beef',porc:'pork',jambon:'ham',oeufs:'eggs','œufs':'eggs',oeuf:'egg','œuf':'egg',
  pois:'chickpea',chiches:'chickpea',tofu:'tofu',riz:'rice',pates:'pasta','pâtes':'pasta',nouilles:'noodles',salade:'salad',soupe:'soup',tomates:'tomato',tomate:'tomato',
  citron:'lemon',herbes:'herbs',paprika:'paprika',fume:'smoked','fumé':'smoked',gingembre:'ginger',sesame:'sesame','sésame':'sesame',basilic:'basil',curry:'curry',miso:'miso',
  moutarde:'mustard',coco:'coconut',orange:'orange',pesto:'pesto',ail:'garlic',parmesan:'parmesan',fruits:'berries',rouges:'berries',banane:'banana',chocolat:'chocolate',
  omelette:'omelette',tarte:'tart',gateau:'cake','gâteau':'cake',cookies:'cookies',smoothie:'smoothie',burger:'burger',tacos:'tacos',burrito:'burrito',lasagnes:'lasagna',
  bowl:'bowl',assiette:'plate',wok:'wok',curry:'curry',tajine:'tagine',paella:'paella',pho:'pho',bibimbap:'bibimbap',falafel:'falafel',shakshuka:'shakshuka'
};
function translateTokens(text=''){
  const parts=norm(text).split(' ').filter(Boolean);
  const out=[];
  for(const p of parts){const w=WORDS[p]||p;if(w.length>2&&!out.includes(w))out.push(w)}
  return out;
}
function primaryFromIngredients(raw=''){
  const arr=raw.split('|').map(x=>x.trim()).filter(Boolean);
  for(const x of arr){
    const n=norm(x);
    if(/poulet|chicken/.test(n))return'chicken';
    if(/saumon|salmon/.test(n))return'salmon';
    if(/cabillaud|cod/.test(n))return'cod';
    if(/crevette|shrimp/.test(n))return'shrimp';
    if(/boeuf|beef|steak/.test(n))return'beef';
    if(/porc|pork|jambon|ham/.test(n))return'pork';
    if(/tofu/.test(n))return'tofu';
    if(/pois chiches|chickpea/.test(n))return'chickpea';
    if(/oeuf|egg/.test(n))return'eggs';
  }
  return translateTokens(arr[0]||'')[0]||'food';
}
function dishFrom(name='',tags=''){
  const n=norm(name+' '+tags);
  if(/smoothie/.test(n))return'smoothie';
  if(/soup|soupe|pho/.test(n))return'soup bowl';
  if(/salad|salade/.test(n))return'salad';
  if(/pasta|pates|lasagn/.test(n))return'pasta dish';
  if(/burger/.test(n))return'burger';
  if(/taco/.test(n))return'tacos';
  if(/burrito/.test(n))return'burrito bowl';
  if(/cake|gateau|gâteau/.test(n))return'cake';
  if(/cookie/.test(n))return'cookies';
  if(/tart|tarte/.test(n))return'tart';
  if(/breakfast|brunch|petit dejeuner/.test(n))return'breakfast';
  if(/bowl|bol/.test(n))return'bowl';
  if(/wok/.test(n))return'wok';
  if(/curry/.test(n))return'curry';
  return'plated meal';
}
function extractCandidates(html){
  const out=[];
  const re=/m=(["'])(\{.*?\})\1/g;let m;
  while((m=re.exec(html))&&out.length<80){
    try{const obj=JSON.parse(decodeHtml(m[2]));if(obj.murl)out.push({url:obj.murl,title:obj.t||obj.desc||'',page:obj.purl||''})}catch{}
  }
  if(!out.length){
    const re2=/"murl":"([^"]+)","purl":"([^"]*)","t":"([^"]*)"/g;
    while((m=re2.exec(html))&&out.length<80)out.push({url:m[1].replace(/\\\//g,'/'),page:m[2].replace(/\\\//g,'/'),title:m[3]});
  }
  return out;
}
function scoreCandidate(c,target){
  const hay=norm([c.title,c.page,c.url].join(' '));let s=0;
  for(const k of target.required)if(hay.includes(k))s+=8;
  for(const k of target.optional)if(hay.includes(k))s+=2;
  for(const bad of target.bad)if(hay.includes(bad))s-=12;
  if(/food|recipe|cooking|dish|meal|restaurant/.test(hay))s+=2;
  if(/logo|icon|vector|drawing|clipart|package|raw meat/.test(hay))s-=8;
  return s;
}
function safe(url){try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.toString():null}catch{return null}}
const FALLBACK={
 chicken:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85',
 salmon:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=85',
 fish:'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=85',
 beef:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
 pork:'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1200&q=85',
 tofu:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85',
 chickpea:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=85',
 eggs:'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1200&q=85',
 food:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85'
};
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const name=String(req.query?.name||'').slice(0,220);
  const ingredients=String(req.query?.ingredients||'').slice(0,500);
  const tags=String(req.query?.tags||'').slice(0,300);
  const id=String(req.query?.id||name).slice(0,160);
  if(!name)return res.status(400).end();
  res.setHeader('Cache-Control','public, s-maxage=2592000, stale-while-revalidate=7776000');
  const primary=primaryFromIngredients(ingredients),dish=dishFrom(name,tags);
  const nameTokens=translateTokens(name).filter(x=>!['assiette','plate','sans','with','and'].includes(x));
  const flavor=nameTokens.slice(-4);
  const query=[primary,...flavor,dish,'food photography'].filter(Boolean).join(' ');
  const target={required:[primary],optional:[...flavor,...dish.split(' ')],bad:[]};
  if(primary==='chicken')target.bad=['salmon','fish','beef','pork','shrimp'];
  if(['salmon','cod','shrimp'].includes(primary))target.bad=['chicken','beef','pork'];
  if(primary==='beef')target.bad=['salmon','fish','chicken','pork'];
  if(primary==='pork')target.bad=['salmon','fish','chicken','beef'];
  try{
    const url='https://www.bing.com/images/search?q='+encodeURIComponent(query)+'&form=HDRSC2&first=1';
    const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (compatible; KitchenStudio/1.0)','accept':'text/html'}});
    if(r.ok){
      const candidates=extractCandidates(await r.text()).map(c=>({...c,score:scoreCandidate(c,target)})).filter(c=>c.score>=6).sort((a,b)=>b.score-a.score);
      if(candidates.length){
        const top=candidates.slice(0,Math.min(8,candidates.length));
        const pick=top[hash(id)%top.length];
        const image=safe(pick.url);if(image)return res.redirect(302,image);
      }
    }
  }catch{}
  const fb=FALLBACK[primary]||(['salmon','cod','shrimp'].includes(primary)?FALLBACK.fish:FALLBACK.food);
  return res.redirect(302,fb);
}
