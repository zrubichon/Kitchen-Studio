// Mise V10 — account-first premium wellness profile + goal-aware planning
(function(){
  const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
  const en=()=>state.profile.language==='en';
  const tr=(fr,enText)=>en()?enText:fr;
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const round50=v=>Math.max(0,Math.round(v/50)*50);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const user=()=>window.KitchenCloud?.user||null;
  const isConnected=()=>Boolean(user());

  const activityFactors={low:28,light:31,moderate:34,high:37,'very-high':40};
  const activityCatalog=[
    {fr:'Marche rapide',en:'Brisk walk',met:4.3,icon:'🚶'},
    {fr:'Vélo modéré',en:'Moderate cycling',met:6.8,icon:'🚲'},
    {fr:'Natation',en:'Swimming',met:6.0,icon:'🏊'},
    {fr:'Danse',en:'Dancing',met:5.0,icon:'💃'},
    {fr:'Renforcement',en:'Strength training',met:5.0,icon:'🏋️'},
    {fr:'Randonnée',en:'Hiking',met:6.0,icon:'🥾'},
    {fr:'Jogging tranquille',en:'Easy jogging',met:7.0,icon:'🏃'},
    {fr:'Yoga dynamique',en:'Dynamic yoga',met:3.3,icon:'🧘'}
  ];

  state.profile.bodyGoal=state.profile.bodyGoal||'maintain';
  state.profile.activityLevel=state.profile.activityLevel||'moderate';
  state.profile.proteinPriority=state.profile.proteinPriority||'normal';
  state.profile.sugar=state.profile.sugar||'normal';

  function hydrate(){
    const f=q('#profileForm');if(!f)return;
    const p=state.profile;
    const values=['firstName','lastName','age','weightKg','heightCm','targetWeightKg','bodyGoal','activityLevel','goal','diet','proteinPriority','sugar','servings','maxTime','allergies','dislikes','productPriority'];
    values.forEach(k=>{if(f.elements[k]&&p[k]!=null&&p[k]!=='')f.elements[k].value=p[k]});
    qa('[data-wellness-fr]').forEach(el=>{el.textContent=en()?(el.dataset.wellnessEn||el.textContent):(el.dataset.wellnessFr||el.textContent)});
  }

  function collect(){
    const f=q('#profileForm');if(!f)return;
    const fd=new FormData(f),p=state.profile;
    ['goal','diet','proteinPriority','sugar','maxTime','allergies','dislikes','productPriority'].forEach(k=>{if(fd.has(k))p[k]=String(fd.get(k)||'')});
    p.servings=Number(fd.get('servings')||p.servings||1);
    p.preferences=fd.getAll('pref').map(String);
    if(isConnected()){
      p.firstName=String(fd.get('firstName')||'').trim();
      p.lastName=String(fd.get('lastName')||'').trim();
      p.age=num(fd.get('age'));
      p.weightKg=num(fd.get('weightKg'));
      p.heightCm=num(fd.get('heightCm'));
      p.targetWeightKg=num(fd.get('targetWeightKg'));
      p.bodyGoal=String(fd.get('bodyGoal')||'maintain');
      p.activityLevel=String(fd.get('activityLevel')||'moderate');
    }
    const w=computeWellness(p);
    p.calorieTarget=w.valid?{low:w.low,high:w.high,maintenance:w.maintenance,movementTarget:w.movementTarget,durationMinWeeks:w.durationMinWeeks,durationMaxWeeks:w.durationMaxWeeks,updatedAt:new Date().toISOString()}:null;
    localStorage.setItem('miseProfile',JSON.stringify(p));
    try{saveProfileV3()}catch{}
    window.KitchenCloud?.saveSoon?.();
  }

  function computeWellness(p){
    const age=num(p.age),weight=num(p.weightKg),height=num(p.heightCm),target=num(p.targetWeightKg);
    if(!age||!weight||!height)return {valid:false,reason:'incomplete'};
    if(age<18)return {valid:false,reason:'minor'};
    const meters=height/100,bmi=weight/(meters*meters),targetBmi=target?target/(meters*meters):null;
    if(p.bodyGoal==='loss'&&(bmi<18.5||(targetBmi&&targetBmi<18.5)))return {valid:false,reason:'low-bmi'};
    const factor=activityFactors[p.activityLevel]||34;
    const maintenance=round50(weight*factor);
    const floor=Math.max(1400,round50(weight*22));
    let low=maintenance,high=maintenance;
    if(p.bodyGoal==='loss'){low=Math.max(floor,round50(maintenance*.85));high=Math.max(low,round50(maintenance*.90))}
    else if(p.bodyGoal==='muscle'){low=round50(maintenance*1.05);high=round50(maintenance*1.10)}
    else {low=round50(maintenance*.95);high=round50(maintenance*1.05)}
    let durationMinWeeks=null,durationMaxWeeks=null;
    if(p.bodyGoal==='loss'&&target&&target<weight){
      const d=weight-target;durationMinWeeks=Math.max(1,Math.ceil(d/.5));durationMaxWeeks=Math.max(durationMinWeeks,Math.ceil(d/.25));
    }else if(p.bodyGoal==='muscle'&&target&&target>weight){
      const d=target-weight;durationMinWeeks=Math.max(1,Math.ceil(d/.25));durationMaxWeeks=Math.max(durationMinWeeks,Math.ceil(d/.10));
    }
    const movementTarget=p.bodyGoal==='loss'?clamp(Math.round((maintenance*.08)/25)*25,150,250):150;
    const activities=activityCatalog.map(a=>{
      const perMin=a.met*3.5*weight/200;
      const minutes=clamp(Math.round((movementTarget/perMin)/5)*5,10,120);
      return {...a,minutes};
    });
    return {valid:true,age,weight,height,target,bmi,targetBmi,maintenance,low,high,movementTarget,durationMinWeeks,durationMaxWeeks,activities};
  }

  function goalLabel(goal){
    return goal==='loss'?tr('perte de poids progressive','gradual weight loss'):goal==='muscle'?tr('prise de muscle progressive','gradual muscle gain'):tr('maintien du poids','weight maintenance');
  }

  function localSentence(w){
    const name=state.profile.firstName||user()?.user_metadata?.name||'';
    if(!w.valid){
      if(w.reason==='minor')return tr('Mise garde les menus équilibrés mais ne calcule pas de déficit calorique automatique avant 18 ans.','Mise keeps menus balanced but does not calculate an automatic calorie deficit under age 18.');
      if(w.reason==='low-bmi')return tr('Mise ne crée pas de déficit automatique pour cet objectif : ajustez le poids cible ou demandez un avis professionnel.','Mise will not create an automatic deficit for this goal: adjust the target weight or seek professional guidance.');
      return tr((name?'Bienvenue '+name+' — ':'')+'complétez votre âge, poids, taille, activité et objectif pour activer le suivi Premium.',(name?'Welcome '+name+' — ':'')+'complete your age, weight, height, activity and goal to activate Premium tracking.');
    }
    const duration=w.durationMinWeeks?tr(' sur environ '+w.durationMinWeeks+'–'+w.durationMaxWeeks+' semaines',' over roughly '+w.durationMinWeeks+'–'+w.durationMaxWeeks+' weeks'):'';
    return tr((name?'Bienvenue '+name+' — ':'')+'Mise vise '+w.low+'–'+w.high+' kcal/jour pour une '+goalLabel(state.profile.bodyGoal)+duration+', avec un rythme volontairement progressif.',(name?'Welcome '+name+' — ':'')+'Mise targets '+w.low+'–'+w.high+' kcal/day for '+goalLabel(state.profile.bodyGoal)+duration+', using a deliberately gradual approach.');
  }

  async function aiSentence(w){
    if(!w.valid)return localSentence(w);
    try{
      const r=await fetch('/api/wellness-note',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        firstName:state.profile.firstName||user()?.user_metadata?.name||'',
        bodyGoal:state.profile.bodyGoal,
        calorieLow:w.low,calorieHigh:w.high,
        durationMinWeeks:w.durationMinWeeks,durationMaxWeeks:w.durationMaxWeeks,
        diet:state.profile.diet,proteinPriority:state.profile.proteinPriority,
        language:state.profile.language||'fr'
      })});
      if(r.ok){const d=await r.json();if(d?.text)return d.text}
    }catch{}
    return localSentence(w);
  }

  function renderPremiumPreview(w){
    const el=q('#premiumGoalPreview');if(!el)return;
    if(!isConnected()){el.innerHTML='';return}
    if(!w.valid){
      el.innerHTML='<strong>'+localSentence(w)+'</strong>';
      return;
    }
    const duration=w.durationMinWeeks?tr(w.durationMinWeeks+'–'+w.durationMaxWeeks+' semaines estimées',w.durationMinWeeks+'–'+w.durationMaxWeeks+' estimated weeks'):tr('Pas de durée cible nécessaire','No target duration needed');
    el.innerHTML='<div><small>'+tr('Apport estimé','Estimated intake')+'</small><strong>'+w.low+'–'+w.high+' kcal/j</strong></div><div><small>'+tr('Maintenance estimée','Estimated maintenance')+'</small><strong>≈ '+w.maintenance+' kcal/j</strong></div><div><small>'+tr('Horizon','Timeline')+'</small><strong>'+duration+'</strong></div>';
  }

  async function renderCoach(){
    const card=q('#wellnessCoachCard');if(!card)return;
    if(!isConnected()){
      card.className='wellness-coach-card locked';
      card.innerHTML='<div><span class="premium-badge">✦ '+tr('Premium personnalisé','Personalized Premium')+'</span><h3>'+tr('Votre suivi calories et objectif physique est prêt à être activé.','Your calorie and physical-goal tracking is ready to unlock.')+'</h3><p>'+tr('Créez un compte dans Mon profil : cela permet à Mise de conserver votre objectif, votre frigo, votre liste de courses et vos menus synchronisés.','Create an account in My profile so Mise can keep your goal, fridge, grocery list and menus synchronized.')+'</p></div><button class="btn btn-dark" id="coachGoProfile">'+tr('Créer / connecter mon compte','Create / sign in')+'</button>';
      q('#coachGoProfile')?.addEventListener('click',()=>{navigate('profile');setTimeout(()=>q('#profileAccountShell')?.scrollIntoView({behavior:'smooth',block:'start'}),100)});
      return;
    }
    const w=computeWellness(state.profile);
    card.className='wellness-coach-card';
    if(!w.valid){
      card.innerHTML='<div><span class="premium-badge">✦ '+tr('Premium personnalisé','Personalized Premium')+'</span><h3>'+localSentence(w)+'</h3><p>'+tr('Complétez Mon profil pour que l’IA adapte ensuite les menus et les portions.','Complete My profile so the AI can then adapt menus and portions.')+'</p></div><button class="btn btn-outline" id="coachGoProfile">'+tr('Compléter mon profil','Complete profile')+'</button>';
      q('#coachGoProfile')?.addEventListener('click',()=>navigate('profile'));
      renderPremiumPreview(w);return;
    }
    const duration=w.durationMinWeeks?'<strong>'+w.durationMinWeeks+'–'+w.durationMaxWeeks+' '+tr('sem.','wks')+'</strong><small>'+tr('Rythme progressif, pas une promesse de délai.','Gradual pace, not a guaranteed timeline.')+'</small>':'<strong>'+tr('Stable','Steady')+'</strong><small>'+tr('Objectif centré sur la régularité.','Goal focused on consistency.')+'</small>';
    const acts=w.activities.slice(0,6).map(a=>'<span>'+a.icon+' '+(en()?a.en:a.fr)+' ≈ '+a.minutes+' min</span>').join('');
    card.innerHTML='<div class="wellness-coach-head"><div><span class="premium-badge">✦ '+tr('Coach IA','AI coach')+'</span><h3 id="wellnessWelcome">'+tr('Bienvenue','Welcome')+(state.profile.firstName?', '+state.profile.firstName:'')+'.</h3><p id="wellnessAiSentence">'+localSentence(w)+'</p></div><button class="btn btn-outline btn-small" id="coachAdaptWeek">'+tr('Adapter ma semaine','Adapt my week')+'</button></div><div class="wellness-metrics"><div><small>'+tr('À manger','Daily intake')+'</small><strong>'+w.low+'–'+w.high+' kcal/j</strong><em>'+tr('≈ 10–15 % sous la maintenance pour une perte progressive, ou proche de la maintenance selon votre objectif.','A gradual range based on estimated maintenance and your selected goal.')+'</em></div><div><small>'+tr('Temps estimé','Estimated time')+'</small>'+duration+'</div><div><small>'+tr('Repère mouvement','Movement reference')+'</small><strong>≈ '+w.movementTarget+' kcal</strong><em>'+tr('Exemples seulement : votre activité habituelle est déjà prise en compte.','Examples only: your usual activity is already included.')+'</em></div></div><div class="activity-equivalents">'+acts+'</div><p class="wellness-disclaimer">'+tr('Les calories dépensées varient beaucoup selon la personne et l’intensité. Ces activités sont des ordres de grandeur, pas une “dette” à compenser après avoir mangé.','Calories burned vary widely by person and intensity. These are rough examples, not a “debt” to compensate after eating.')+'</p>';
    q('#coachAdaptWeek')?.addEventListener('click',()=>q('#generateWeek')?.click());
    const sentence=await aiSentence(w);const target=q('#wellnessAiSentence');if(target)target.textContent=sentence;
    renderPremiumPreview(w);
  }

  function renderMini(){
    const u=user(),name=state.profile.firstName||u?.user_metadata?.name||'';
    const mini=q('#profileMiniName'),av=q('#profileMiniAvatar')||q('.profile-mini .avatar');
    if(mini)mini.textContent=name||tr('Mon profil','My profile');
    if(av)av.textContent=(name||'M').charAt(0).toUpperCase();
    const s=q('#profileSummary'),w=computeWellness(state.profile);
    if(s){
      if(isConnected()&&w.valid)s.textContent=(state.profile.bodyGoal==='loss'?tr('Perte','Loss'):state.profile.bodyGoal==='muscle'?tr('Muscle','Muscle'):tr('Maintien','Maintain'))+' · '+w.low+'–'+w.high+' kcal';
      else s.textContent=(state.profile.diet==='vegan'?'Vegan':state.profile.diet==='vegetarian'?tr('Végétarien','Vegetarian'):state.profile.proteinPriority==='very-high'?tr('Très protéiné','Very high protein'):tr('Mon profil','My profile'));
    }
  }

  function renderGate(){
    const connected=isConnected(),card=q('#premiumGoalCard'),lock=q('#premiumHealthLock'),fields=q('#premiumFields'),status=q('#premiumStatus');
    if(card)card.classList.toggle('locked',!connected);
    if(lock)lock.hidden=connected;
    if(fields)qa('#premiumFields input,#premiumFields select').forEach(x=>x.disabled=!connected);
    if(status){status.textContent=connected?tr('Activé','Active'):tr('Compte requis','Account required');status.classList.toggle('active',connected)}
    const auth=q('.cloud-auth-card'),summary=q('.account-summary');
    if(auth)auth.hidden=connected;
    if(summary)summary.classList.toggle('connected',connected);
    if(connected){
      const display=q('#accountDisplayName'),email=q('#accountDisplayEmail');
      const nm=state.profile.firstName||user()?.user_metadata?.name||user()?.email?.split('@')[0]||tr('Compte Mise','Mise account');
      if(display)display.textContent=nm;if(email)email.textContent=user()?.email||'';
    }
    renderMini();
  }

  function profileSafeEligible(r){
    try{return typeof eligibleByProfile==='function'?eligibleByProfile(r):true}catch{return true}
  }
  function tunePlanToGoal(){
    if(!isConnected())return;
    const w=computeWellness(state.profile);if(!w.valid)return;
    const target=(w.low+w.high)/2,ratios=[.25,.35,.40];
    const next=state.plan.map((day,di)=>day.map((id,si)=>{
      const current=RECIPES.find(r=>r.id===id);if(!current)return id;
      const slot=current.slot,targetKcal=target*ratios[si],currentGap=Math.abs(Number(current.kcal||0)-targetKcal);
      if(currentGap<130)return id;
      const prev=di>0?state.plan[di-1][si]:null;
      const pool=RECIPES.filter(r=>r.slot===slot&&profileSafeEligible(r)&&r.id!==prev);
      let best=current,bestScore=currentGap;
      pool.forEach(r=>{
        let score=Math.abs(Number(r.kcal||0)-targetKcal);
        if((state.profile.proteinPriority==='high'||state.profile.proteinPriority==='very-high')&&(r.tags||[]).some(t=>t==='protein'||t==='high-protein'))score-=45;
        if(state.profile.sugar==='low'&&(r.tags||[]).some(t=>t==='dessert'||t==='drink'))score+=120;
        if(score<bestScore-45){best=r;bestScore=score}
      });
      return best.id;
    }));
    state.plan=next;localStorage.setItem('misePlan',JSON.stringify(state.plan));renderWeek();renderShopping();window.KitchenCloud?.saveSoon?.();
  }

  q('#premiumCreateAccountBtn')?.addEventListener('click',()=>q('#profileAccountShell')?.scrollIntoView({behavior:'smooth',block:'start'}));
  q('#saveProfile')?.addEventListener('click',()=>setTimeout(()=>{
    collect();hydrate();const w=computeWellness(state.profile);renderPremiumPreview(w);renderGate();renderCoach();renderRecipes(window.__recipeFilter||'all');
    toast(tr('Profil enregistré. L’IA utilisera ces données pour les prochains menus.','Profile saved. The AI will use these details for future menus.'));
  },30));

  q('#personalQuestionsForm')?.addEventListener('submit',()=>setTimeout(()=>{hydrate();renderCoach();renderMini();window.KitchenCloud?.saveSoon?.()},40));
  q('#languageSelect')?.addEventListener('change',()=>setTimeout(()=>{hydrate();renderGate();renderCoach()},30));

  const wizard=q('#wizardNext');
  if(wizard&&wizard.onclick){
    const prev=wizard.onclick;
    wizard.onclick=async function(e){const final=typeof wizardStep!=='undefined'&&wizardStep===3;await prev.call(this,e);if(final)setTimeout(()=>{tunePlanToGoal();renderCoach()},160)};
  }
  const quick=q('#sendQuickPrompt');
  if(quick&&quick.onclick){
    const prev=quick.onclick;quick.onclick=function(e){const out=prev.call(this,e);setTimeout(()=>{tunePlanToGoal();renderCoach()},100);return out};
  }

  document.addEventListener('mise:auth',e=>{
    const u=e.detail?.user||null;
    if(u&&!state.profile.firstName){
      state.profile.firstName=u.user_metadata?.name||'';
      localStorage.setItem('miseProfile',JSON.stringify(state.profile));
    }
    hydrate();renderGate();renderCoach();
  });
  document.addEventListener('mise:cloudloaded',()=>setTimeout(()=>{hydrate();renderGate();renderCoach()},0));

  hydrate();renderGate();renderCoach();
  window.MiseWellness={compute:()=>computeWellness(state.profile),render:renderCoach,tune:tunePlanToGoal};
})();