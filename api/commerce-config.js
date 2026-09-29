export default function handler(req,res){
  if(req.method!=='GET')return res.status(405).end();
  const links={
    'premium-monthly':process.env.STRIPE_PAYMENT_LINK_PREMIUM_MONTHLY||'',
    'premium-yearly':process.env.STRIPE_PAYMENT_LINK_PREMIUM_YEARLY||'',
    'student-pack':process.env.STRIPE_PAYMENT_LINK_STUDENT_PACK||''
  };
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({
    ready:Boolean(links['premium-monthly']||links['premium-yearly']||links['student-pack']),
    links
  });
}