const ALLOWED_PROTOCOLS=new Set(['http:','https:']);
function decodeHtml(s=''){return s.replace(/&amp;/g,'&').replace(/&#x2F;/gi,'/').replace(/&quot;/g,'"').replace(/&#39;/g,"'")}
function absoluteUrl(url,base){try{return new URL(decodeHtml(url),base).toString()}catch{return null}}
function normalize(s=''){return s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function ogImage(html,base){
  const patterns=[
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i
  ];
  for(const p of patterns){const m=html.match(p);if(m?.[1])return absoluteUrl(m[1],base)}
  const json=html.match(/"image"\s*:\s*(?:"([^"]+)"|\[\s*"([^"]+)")/i);
  return json?absoluteUrl(json[1]||json[2],base):null;
}
function genericSource(url=''){return /\/collections\/|\/manuals?\/|\/latest|shop-by-brand|small-kitchen-appliances\/air-fryers|c-m-ho\/cooking\/airfryer/i.test(url)}
function extractBingCandidates(html){
  const out=[];
  const re=/m=(["'])(\{.*?\})\1/g;
  let m;
  while((m=re.exec(html))&&out.length<80){
    try{
      const raw=decodeHtml(m[2]);
      const obj=JSON.parse(raw);
      if(obj.murl)out.push({murl:obj.murl,purl:obj.purl||'',title:obj.t||obj.desc||''});
    }catch{}
  }
  if(!out.length){
    const re2=/"murl":"([^"]+)","purl":"([^"]*)","t":"([^"]*)"/g;
    while((m=re2.exec(html))&&out.length<80)out.push({murl:m[1].replace(/\\\//g,'/'),purl:m[2].replace(/\\\//g,'/'),title:m[3]});
  }
  return out;
}
function scoreCandidate(c,{brand,model,code,host}){
  const hay=normalize([c.title,c.purl,c.murl].join(' '));
  const codeN=normalize(code),brandN=normalize(brand),modelTokens=normalize(model).split(' ').filter(x=>x.length>2);
  let score=0;
  if(codeN&&hay.includes(codeN))score+=20;
  if(brandN&&hay.includes(brandN))score+=6;
  score+=modelTokens.slice(0,6).filter(t=>hay.includes(t)).length*2;
  try{if(host&&new URL(c.purl).hostname.replace(/^www\./,'').endsWith(host))score+=14}catch{}
  if(/amazon|ebay|walmart|bestbuy|target/.test(hay)&&host)score-=3;
  return score;
}
function safeImage(url){try{const u=new URL(url);return ALLOWED_PROTOCOLS.has(u.protocol)?u.toString():null}catch{return null}}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const brand=String(req.query?.brand||'').slice(0,120).trim();
  const model=String(req.query?.model||'').slice(0,180).trim();
  const code=String(req.query?.code||'').slice(0,100).trim();
  const source=String(req.query?.source||'').slice(0,1000).trim();
  if(!brand&&!model&&!code)return res.status(400).end();
  res.setHeader('Cache-Control','public, s-maxage=604800, stale-while-revalidate=2592000');
  const headers={'user-agent':'Mozilla/5.0 (compatible; KitchenStudio/1.0; +https://github.com/zrubichon/Kitchen-Studio)','accept':'text/html,application/xhtml+xml'};
  let host='';
  try{host=source?new URL(source).hostname.replace(/^www\./,''):''}catch{}
  // Exact official product page first.
  try{
    if(source&&!genericSource(source)){
      const u=new URL(source);
      if(ALLOWED_PROTOCOLS.has(u.protocol)){
        const r=await fetch(u.toString(),{headers,redirect:'follow'});
        if(r.ok){
          const html=await r.text();
          const body=normalize(html.slice(0,250000));
          const codeOk=!code||body.includes(normalize(code));
          const modelOk=!model||normalize(model).split(' ').filter(x=>x.length>3).slice(0,4).some(t=>body.includes(t));
          const img=ogImage(html,r.url||u.toString());
          if(img&&(codeOk||modelOk))return res.redirect(302,img);
        }
      }
    }
  }catch{}
  // Exact image search, strongly preferring manufacturer pages and model code.
  try{
    const exact=[code?'"'+code+'"':'',brand?'"'+brand+'"':'',model?'"'+model+'"':''].filter(Boolean).join(' ');
    const site=host?' site:'+host:'';
    const url='https://www.bing.com/images/search?q='+encodeURIComponent(exact+site+' product')+'&form=HDRSC2&first=1';
    const r=await fetch(url,{headers,redirect:'follow'});
    if(r.ok){
      const html=await r.text(),candidates=extractBingCandidates(html);
      const ranked=candidates.map(c=>({c,score:scoreCandidate(c,{brand,model,code,host})})).sort((a,b)=>b.score-a.score);
      const best=ranked.find(x=>x.score>=10)||ranked[0];
      const img=best?safeImage(best.c.murl):null;
      if(img)return res.redirect(302,img);
    }
  }catch{}
  // Neutral fallback: never display a different product as if it were this exact model.
  const label=[brand,model,code].filter(Boolean).join(' · ').replace(/[<>&"']/g,' ').slice(0,95);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="520"><rect width="100%" height="100%" fill="#fffaf4"/><rect x="200" y="65" rx="38" width="320" height="350" fill="#342c25"/><rect x="230" y="98" rx="18" width="260" height="74" fill="#171411"/><circle cx="360" cy="135" r="21" fill="#eee6da"/><rect x="248" y="220" rx="18" width="224" height="145" fill="#4c4138"/><rect x="330" y="190" rx="8" width="60" height="145" fill="#78685a"/><text x="360" y="458" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#342c25">${label}</text><text x="360" y="487" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#7b6b5e">Photo exacte indisponible — modèle non substitué</text></svg>`;
  res.setHeader('Content-Type','image/svg+xml; charset=utf-8');return res.status(200).send(svg);
}
