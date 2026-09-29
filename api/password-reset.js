const SUPABASE_URL=process.env.SUPABASE_URL||'https://ojacdskephxupbjbkyep.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_XGO8qr7If3JiSMsWoCWdCA_tUj3fi2f';
const REDIRECT='https://mise-kitchen-studio.vercel.app/';
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v||'').trim())}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const email=String(req.body?.email||'').trim().toLowerCase();
  if(!validEmail(email))return res.status(400).json({ok:false,code:'invalid_email',message:'Adresse email invalide.'});
  try{
    const r=await fetch(SUPABASE_URL+'/auth/v1/recover?redirect_to='+encodeURIComponent(REDIRECT),{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY},
      body:JSON.stringify({email})
    });
    const data=await r.json().catch(()=>({}));
    if(r.ok)return res.status(200).json({ok:true,message:'Si un compte correspond à cette adresse et que l’envoi email est autorisé, le lien vient d’être envoyé.'});
    const raw=String(data?.msg||data?.message||data?.error_description||data?.error||'');
    if(r.status===429)return res.status(429).json({ok:false,code:'rate_limit',message:'Trop de demandes ont été envoyées. Attendez quelques minutes avant de réessayer.'});
    if(/not authorized|email address not authorized/i.test(raw))return res.status(503).json({ok:false,code:'smtp_restricted',message:'Le serveur email Supabase actuel n’autorise pas encore l’envoi vers cette adresse. Il faudra connecter un SMTP personnalisé pour les utilisateurs publics.'});
    return res.status(r.status).json({ok:false,code:'supabase_error',message:raw||'Supabase n’a pas pu envoyer le lien de récupération.'});
  }catch(e){
    return res.status(500).json({ok:false,code:'network_error',message:'Impossible de contacter le service de récupération pour le moment.'});
  }
}