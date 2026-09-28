export default function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const url=process.env.SUPABASE_URL||'https://ojacdskephxupbjbkyep.supabase.co';
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_XGO8qr7If3JiSMsWoCWdCA_tUj3fi2f';
  res.setHeader('Cache-Control','public, max-age=300');
  return res.status(200).json({configured:Boolean(url&&key),url,key});
}
