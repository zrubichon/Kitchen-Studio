const ALLOWED_PROTOCOLS=new Set(['http:','https:']);
function decodeHtml(s=''){return s.replace(/&amp;/g,'&').replace(/&#x2F;/gi,'/').replace(/&quot;/g,'"').replace(/&#39;/g,"'")}
function absoluteUrl(url,base){try{return new URL(decodeHtml(url),base).toString()}catch{return null}}
function ogImage(html,base){
  const patterns=[
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i
  ];
  for(const p of patterns){const m=html.match(p);if(m?.[1])return absoluteUrl(m[1],base)}
  const json=html.match(/"image"\s*:\s*(?:"([^"]+)"|\[\s*"([^"]+)")/i);
  if(json)return absoluteUrl(json[1]||json[2],base);
  return null;
}
function bingImage(html){
  const patterns=[
    /murl&quot;:&quot;(https?:\\?\/\\?\/[^&"]+)/i,
    /"murl":"(https?:\\?\/\\?\/[^"]+)"/i,
    /murl%22%3A%22(https?%3A%2F%2F[^%]+)/i
  ];
  for(const p of patterns){
    const m=html.match(p);if(!m?.[1])continue;
    let u=m[1].replace(/\\\//g,'/');
    try{u=decodeURIComponent(u)}catch{}
    u=decodeHtml(u);
    try{const x=new URL(u);if(ALLOWED_PROTOCOLS.has(x.protocol))return x.toString()}catch{}
  }
  return null;
}
function isGenericSource(url=''){
  return /\/collections\/|\/manuals?\/|\/latest|shop-by-brand|small-kitchen-appliances\/air-fryers|c-m-ho\/cooking\/airfryer/i.test(url);
}
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const q=String(req.query?.q||'').slice(0,220).trim();
  const source=String(req.query?.source||'').slice(0,1000).trim();
  if(!q)return res.status(400).end();
  res.setHeader('Cache-Control','public, s-maxage=604800, stale-while-revalidate=2592000');
  const headers={'user-agent':'Mozilla/5.0 (compatible; KitchenStudio/1.0; +https://github.com/zrubichon/Kitchen-Studio)','accept':'text/html,application/xhtml+xml'};
  try{
    if(source&&!isGenericSource(source)){
      const u=new URL(source);
      if(ALLOWED_PROTOCOLS.has(u.protocol)){
        const r=await fetch(u.toString(),{headers,redirect:'follow'});
        if(r.ok){
          const html=await r.text(),img=ogImage(html,r.url||u.toString());
          if(img)return res.redirect(302,img);
        }
      }
    }
  }catch{}
  try{
    let site='';
    if(source){try{site=' site:'+new URL(source).hostname.replace(/^www\./,'')}catch{}}
    const search=`${q} ${site} full product white background`;
    const url='https://www.bing.com/images/search?q='+encodeURIComponent(search)+'&form=HDRSC2&first=1';
    const r=await fetch(url,{headers,redirect:'follow'});
    if(r.ok){
      const html=await r.text(),img=bingImage(html);
      if(img)return res.redirect(302,img);
    }
  }catch{}
  // SVG fallback still shows the whole device identity rather than a cropped/wrong photo.
  const label=q.replace(/[<>&"']/g,' ').slice(0,80);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="520"><rect width="100%" height="100%" fill="#fffaf4"/><rect x="190" y="75" rx="42" width="340" height="330" fill="#342c25"/><rect x="220" y="105" rx="20" width="280" height="75" fill="#171411"/><circle cx="360" cy="142" r="23" fill="#eee6da"/><rect x="245" y="220" rx="18" width="230" height="140" fill="#4c4138"/><rect x="330" y="190" rx="8" width="60" height="145" fill="#78685a"/><text x="360" y="465" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#342c25">${label}</text></svg>`;
  res.setHeader('Content-Type','image/svg+xml; charset=utf-8');return res.status(200).send(svg);
}
