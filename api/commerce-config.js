import { authenticatedUser, accessForUser } from '../lib/access.js';
import { aiFailure } from '../lib/ai-status.js';
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const links={
    'premium-monthly':process.env.STRIPE_PAYMENT_LINK_PREMIUM_MONTHLY||'',
    'premium-yearly':process.env.STRIPE_PAYMENT_LINK_PREMIUM_YEARLY||'',
    'student-pack':process.env.STRIPE_PAYMENT_LINK_STUDENT_PACK||''
  };
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Vary','Authorization');
  let user;
  try { user=await authenticatedUser(req); }
  catch { return res.status(503).json({error:'Vérification du compte indisponible.',code:'auth_unavailable'}); }
  if(req.headers?.authorization&&!user)return res.status(401).json({error:'Reconnectez votre compte.',code:'auth_required'});
  const access=accessForUser(user);
  let ai={state:'untested',message:'La disponibilité de l’IA sera vérifiée lors d’une demande.'};
  if(req.query?.checkAi==='1'){
    if(!access.owner)return res.status(403).json({error:'Diagnostic réservé au compte propriétaire.'});
    const key=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
    if(!key)ai={state:'blocked',code:'ai_not_configured',message:'AI Gateway n’est pas configuré.'};
    else try{
      const upstream=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{
        method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
        body:JSON.stringify({model:process.env.AI_MODEL||'openai/gpt-5.6-sol',messages:[{role:'user',content:'Reply OK only.'}],max_tokens:16}),signal:AbortSignal.timeout(20000)
      });
      const data=await upstream.json();
      ai=upstream.ok&&data?.choices?.[0]?.message?.content
        ?{state:'available',message:'L’IA a répondu au test.'}
        :{state:'blocked',...aiFailure(data,upstream.status)};
    }catch{ai={state:'blocked',code:'ai_unavailable',message:'L’IA n’a pas répondu au test.'};}
  }
  return res.status(200).json({
    ready:Boolean(links['premium-monthly']||links['premium-yearly']||links['student-pack']),
    links,access,ai
  });
}
