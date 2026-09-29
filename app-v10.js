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

  const FAST_ID='fasting-slot';
  if(!RECIPES.some(r=>r.id===FAST_ID))RECIPES.push({id:FAST_ID,name:'Jeûne',slot:'fasting',time:0,kcal:0,protein:0,carbs:0,fat:0,tags:['fasting'],image:'',ingredients:[],steps:[],tip:'Fenêtre de jeûne intermittent.',methods:{default:['Jeûne','']}});
  state.profile.bodyGoal=state.profile.bodyGoal||'maintain';
  state.profile.goalPace=state.profile.goalPace||'moderate';
  state.profile.activityLevel=state.profile.activityLevel||'moderate';
  state.profile.proteinPriority=state.profile.proteinPriority||'normal';
  state.profile.sugar=state.profile.sugar||'normal';
  state.profile.fastingMode=state.profile.fastingMode||'none';
  state.profile.fastingStart=state.profile.fastingStart||'12:00';
  state.profile.fastingEnd=state.profile.fastingEnd||'20:00';
  state.profile.breakfastTime=state.profile.breakfastTime||'08:00';
  state.profile.lunchTime=state.profile.lunchTime||'13:00';
  state.profile.dinnerTime=state.profile.dinnerTime||'19:00';
  state.profile.adaptiveRequest=state.profile.adaptiveRequest||'';

  function hydrate(){
    const f=q('#profileForm');if(!f)return;
    const p=state.profile;
    const values=['firstName','lastName','age','weightKg','heightCm','targetWeightKg','bodyGoal','goalPace','activityLevel','fastingMode','fastingStart','fastingEnd','breakfastTime','lunchTime','dinnerTime','adaptiveRequest','goal','diet','proteinPriority','sugar','servings','maxTime','allergies','dislikes','productPriority'];
    values.forEach(k=>{if(f.elements[k]&&p[k]!=null&&p[k]!=='')f.elements[k].value=p[k]});
    qa('[data-wellness-fr]').forEach(el=>{el.textContent=en()?(el.dataset.wellnessEn||el.textContent):(el.dataset.wellnessFr||el.textContent)});
    syncFastingPreset(false);
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
      p.goalPace=String(fd.get('goalPace')||'moderate');
      p.activityLevel=String(fd.get('activityLevel')||'moderate');
      p.fastingMode=String(fd.get('fastingMode')||'none');
      p.fastingStart=String(f.elements.fastingStart?.value||'12:00');
      p.fastingEnd=String(f.elements.fastingEnd?.value||'20:00');
      p.breakfastTime=String(fd.get('breakfastTime')||'08:00');
      p.lunchTime=String(fd.get('lunchTime')||'13:00');
      p.dinnerTime=String(fd.get('dinnerTime')||'19:00');
      p.adaptiveRequest=String(fd.get('adaptiveRequest')||'').trim();
    }
    const w=computeWellness(p);
    p.calorieTarget=w.valid?{low:w.low,high:w.high,maintenance:w.maintenance,movementTarget:w.movementTarget,durationMinWeeks:w.durationMinWeeks,durationMaxWeeks:w.durationMaxWeeks,pace:p.goalPace,updatedAt:new Date().toISOString()}:null;
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
    const pace=p.goalPace||'moderate';
    const lossPct={gentle:.08,moderate:.12,faster:.18}[pace]||.12;
    const gainPct={gentle:.03,moderate:.05,faster:.08}[pace]||.05;
    let low=maintenance,high=maintenance;
    if(p.bodyGoal==='loss'){
      low=Math.max(floor,round50(maintenance*(1-lossPct-.015)));
      high=Math.max(low,round50(maintenance*(1-lossPct+.015)));
    }else if(p.bodyGoal==='muscle'){
      low=round50(maintenance*(1+gainPct-.01));
      high=round50(maintenance*(1+gainPct+.01));
    }else {low=round50(maintenance*.96);high=round50(maintenance*1.04)}
    let durationMinWeeks=null,durationMaxWeeks=null;
    if(p.bodyGoal==='loss'&&target&&target<weight){
      const d=weight-target,rate={gentle:.25,moderate:.4,faster:.6}[pace]||.4;
      durationMinWeeks=Math.max(1,Math.ceil(d/rate));durationMaxWeeks=Math.max(durationMinWeeks,Math.ceil(d/(rate*.7)));
    }else if(p.bodyGoal==='muscle'&&target&&target>weight){
      const d=target-weight,rate={gentle:.1,moderate:.18,faster:.28}[pace]||.18;
      durationMinWeeks=Math.max(1,Math.ceil(d/rate));durationMaxWeeks=Math.max(durationMinWeeks,Math.ceil(d/(rate*.65)));
    }
    const movementTarget=p.bodyGoal==='loss'?clamp(Math.round((maintenance*.07)/25)*25,125,225):150;
    const activities=activityCatalog.map(a=>{
      const perMin=a.met*3.5*weight/200;
      const minutes=clamp(Math.round((movementTarget/perMin)/5)*5,10,120);
      return {...a,minutes};
    });
    return {valid:true,age,weight,height,target,bmi,targetBmi,maintenance,low,high,movementTarget,durationMinWeeks,durationMaxWeeks,activities,pace};
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
    const fasting=state.profile.fastingMode&&state.profile.fastingMode!=='none'?tr(', avec une fenêtre repas '+state.profile.fastingStart+'–'+state.profile.fastingEnd,', with an eating window '+state.profile.fastingStart+'–'+state.profile.fastingEnd):'';
    return tr((name?'Bienvenue '+name+' — ':'')+'Mise vise '+w.low+'–'+w.high+' kcal/jour pour une '+goalLabel(state.profile.bodyGoal)+duration+fasting+'.',(name?'Welcome '+name+' — ':'')+'Mise targets '+w.low+'–'+w.high+' kcal/day for '+goalLabel(state.profile.bodyGoal)+duration+fasting+'.');
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
        pace:state.profile.goalPace,fastingMode:state.profile.fastingMode,fastingStart:state.profile.fastingStart,fastingEnd:state.profile.fastingEnd,
        adaptiveRequest:state.profile.adaptiveRequest||'',
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
    const duration=w.durationMinWeeks?'<strong>'+w.durationMinWeeks+'–'+w.durationMaxWeeks+' '+tr('sem.','wks')+'</strong><small>'+tr('Estimation, pas une promesse de délai.','Estimate, not a guaranteed timeline.')+'</small>':'<strong>'+tr('Stable','Steady')+'</strong><small>'+tr('Objectif centré sur la régularité.','Goal focused on consistency.')+'</small>';
    const paceNames={gentle:tr('très progressif','very gradual'),moderate:tr('modéré','moderate'),faster:tr('plus rapide mais encadré','faster but bounded')};
    const paceNote=state.profile.bodyGoal==='loss'?tr('Fourchette estimée pour un rythme '+paceNames[w.pace]+'.','Estimated range for a '+paceNames[w.pace]+' pace.'):state.profile.bodyGoal==='muscle'?tr('Léger surplus estimé pour un rythme '+paceNames[w.pace]+'.','Estimated modest surplus for a '+paceNames[w.pace]+' pace.'):tr('Fourchette proche de la maintenance estimée.','Range kept near estimated maintenance.');
    const acts=w.activities.slice(0,6).map(a=>'<span>'+a.icon+' '+(en()?a.en:a.fr)+' ≈ '+a.minutes+' min</span>').join('');
    const fastLine=state.profile.fastingMode!=='none'?'<span class="fasting-chip">'+tr('Jeûne ','Fasting ')+state.profile.fastingMode+' · '+state.profile.fastingStart+'–'+state.profile.fastingEnd+'</span>':'';
    card.innerHTML='<div class="wellness-coach-head"><div><span class="premium-badge">✦ '+tr('Coach IA','AI coach')+'</span><h3 id="wellnessWelcome">'+tr('Bienvenue','Welcome')+(state.profile.firstName?', '+state.profile.firstName:'')+'.</h3><p id="wellnessAiSentence">'+localSentence(w)+'</p>'+fastLine+'</div><button class="btn btn-outline btn-small" id="coachAdaptWeek">'+tr('Adapter ma semaine','Adapt my week')+'</button></div><div class="wellness-metrics"><div><small>'+tr('À manger','Daily intake')+'</small><strong>'+w.low+'–'+w.high+' kcal/j</strong><em>'+paceNote+'</em></div><div><small>'+tr('Temps estimé','Estimated time')+'</small>'+duration+'</div><div><small>'+tr('Repère mouvement','Movement reference')+'</small><strong>≈ '+w.movementTarget+' kcal</strong><em>'+tr('Exemples seulement : votre activité habituelle est déjà prise en compte.','Examples only: your usual activity is already included.')+'</em></div></div><div class="activity-equivalents">'+acts+'</div><p class="wellness-disclaimer">'+tr('Les calories dépensées varient beaucoup selon la personne et l’intensité. Ces activités sont des ordres de grandeur, pas une “dette” à compenser après avoir mangé.','Calories burned vary widely by person and intensity. These are rough examples, not a “debt” to compensate after eating.')+'</p>';
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

  function syncFastingPreset(write=true){
    const f=q('#profileForm');if(!f)return;
    const mode=f.elements.fastingMode?.value||state.profile.fastingMode||'none';
    const presets={'12-12':['08:00','20:00'],'14-10':['10:00','20:00'],'16-8':['12:00','20:00'],'18-6':['13:00','19:00']};
    if(write&&presets[mode]){f.elements.fastingStart.value=presets[mode][0];f.elements.fastingEnd.value=presets[mode][1]}
    const custom=mode==='custom',off=mode==='none';
    if(f.elements.fastingStart){f.elements.fastingStart.readOnly=off||(!custom&&!!presets[mode]);f.elements.fastingStart.classList.toggle('readonly-field',f.elements.fastingStart.readOnly)}
    if(f.elements.fastingEnd){f.elements.fastingEnd.readOnly=off||(!custom&&!!presets[mode]);f.elements.fastingEnd.classList.toggle('readonly-field',f.elements.fastingEnd.readOnly)}
  }
  q('#fastingMode')?.addEventListener('change',()=>syncFastingPreset(true));

  const toMinutes=t=>{const [h,m]=String(t||'00:00').split(':').map(Number);return h*60+(m||0)};
  function inEatingWindow(time){
    const mode=state.profile.fastingMode||'none';if(mode==='none')return true;
    const t=toMinutes(time),a=toMinutes(state.profile.fastingStart),b=toMinutes(state.profile.fastingEnd);
    return a<=b?(t>=a&&t<=b):(t>=a||t<=b);
  }
  function slotTime(si){return [state.profile.breakfastTime||'08:00',state.profile.lunchTime||'13:00',state.profile.dinnerTime||'19:00'][si]}
  function eatingSlots(){
    if(state.profile.fastingMode==='none')return [0,1,2];
    const slots=[0,1,2].filter(si=>inEatingWindow(slotTime(si)));
    return slots.length?slots:[1];
  }
  function shouldFast(si){return state.profile.fastingMode!=='none'&&!eatingSlots().includes(si)}
  function foodReplacement(si,day){
    const slot=['breakfast','lunch','dinner'][si],prev=day>0?state.plan[day-1]?.[si]:null;
    const pool=RECIPES.filter(r=>r.id!==FAST_ID&&r.slot===slot&&profileSafeEligible(r)&&r.id!==prev);
    return (pool.sort((a,b)=>Number(b.protein||0)-Number(a.protein||0))[0]||RECIPES.find(r=>r.slot===slot&&r.id!==FAST_ID))?.id||state.plan[day]?.[si];
  }
  function applyFastingSchedule(){
    for(let d=0;d<7;d++)for(let si=0;si<3;si++){
      if(shouldFast(si))state.plan[d][si]=FAST_ID;
      else if(state.plan[d][si]===FAST_ID)state.plan[d][si]=foodReplacement(si,d);
    }
    localStorage.setItem('misePlan',JSON.stringify(state.plan));
  }

  const renderWeekBeforeFasting=renderWeek;
  renderWeek=function(){
    const grid=q('#weekGrid');if(!grid)return;
    grid.innerHTML='';const days=currentDays(),labels=currentMeals();
    state.plan.forEach((meals,d)=>{
      const col=document.createElement('div');col.className='day-col';const date=dateForDay(d);
      col.innerHTML='<div class="day-head '+(date.getDate()===23&&state.weekOffset===0?'today':'')+'"><strong>'+days[d]+'</strong><small>'+fmtDate(date)+'</small></div>';
      meals.forEach((id,si)=>{
        const slot=['breakfast','lunch','dinner'][si],key=d+'-'+si,card=document.createElement('article');
        if(id===FAST_ID){
          card.className='meal-card fasting';card.innerHTML='<div class="meal-slot">'+labels[slot]+'</div><h4>'+tr('Jeûne','Fasting')+'</h4><span class="fasting-chip">'+(state.profile.fastingMode||'')+'</span><div class="fast-window">'+tr('Fenêtre repas ','Eating window ')+(state.profile.fastingStart||'')+'–'+(state.profile.fastingEnd||'')+'</div><div class="meal-foot"><span>'+tr('Hydratation selon vos habitudes','Hydration as usual')+'</span><span class="kcal">—</span></div>';
          col.appendChild(card);return;
        }
        const r=recipeById(id);if(!r)return;
        const rt=recipeText(r);card.className='meal-card '+(slot==='dinner'?'dinner ':'')+(state.selected.has(key)?'selected':'');card.dataset.key=key;card.dataset.id=id;
        card.innerHTML='<span class="selected-dot"></span><div class="meal-slot">'+labels[slot]+'</div><h4>'+rt.name+'</h4><div class="meal-foot"><span>'+r.time+' min · '+r.protein+'g '+(isEN()?'protein':'prot.')+'</span><span class="kcal">'+r.kcal+' kcal</span></div>';
        card.addEventListener('click',e=>{if(e.shiftKey){toggleSelect(key);return}openRecipe(r,days[d]+' '+date.getDate()+' · '+labels[slot])});
        card.addEventListener('contextmenu',e=>{e.preventDefault();toggleSelect(key)});col.appendChild(card);
      });grid.appendChild(col);
    });
    updateWeekHeader();renderShopping();renderRecipeIdeas();window.KitchenStudioV9?.renderFridgeCoverage?.();window.KitchenStudioV9?.renderPlannerDrawer?.();
  };
  if(window.KitchenStudioV9){
    window.KitchenStudioV9.renderFridgeCoverage=function(){
      const box=q('#fridgeCoverage');if(!box)return;
      const meals=state.plan.flat().filter(id=>id!==FAST_ID);
      const covered=meals.filter(id=>window.KitchenStudioV9.recipeCovered?.(recipeById(id))).length,total=meals.length;
      box.innerHTML='<div><strong>'+covered+'/'+total+'</strong><span>'+tr('repas prévus entièrement couverts par le frigo','planned meals fully covered by your fridge')+'</span></div><div class="fridge-coverage-bar"><span style="width:'+(total?covered/total*100:0)+'%"></span></div>';
    };
  }

  function showFirstRun(){
    if(localStorage.getItem('miseFirstRunComplete')==='1'||sessionStorage.getItem('miseFirstRunDismissed')==='1'||isConnected()||!window.KitchenCloud?.ready)return;
    const dlg=q('#firstRunModal');if(!dlg||dlg.open)return;
    try{openModal(dlg)}catch{dlg.showModal()}
  }
  let firstMode='signup';
  qa('[data-first-auth-mode]').forEach(b=>b.addEventListener('click',()=>{
    firstMode=b.dataset.firstAuthMode;qa('[data-first-auth-mode]').forEach(x=>x.classList.toggle('active',x===b));
    q('#firstRunNameLabel').hidden=firstMode==='signin';q('#firstRunSubmit').textContent=firstMode==='signup'?tr('Créer mon compte','Create my account'):tr('Se connecter','Sign in');
    q('#firstRunPassword').autocomplete=firstMode==='signup'?'new-password':'current-password';
  }));
  q('#firstRunAuthForm')?.addEventListener('submit',async e=>{
    e.preventDefault();const c=window.KitchenCloud?.client,status=q('#firstRunStatus');if(!c){status.innerHTML='<span class="status-dot"></span><span>'+tr('Connexion en cours d’initialisation…','Cloud connection is initializing…')+'</span>';return}
    const email=q('#firstRunEmail').value.trim(),password=q('#firstRunPassword').value,name=q('#firstRunName').value.trim();
    status.innerHTML='<span class="status-dot"></span><span>'+(firstMode==='signup'?tr('Création du compte…','Creating account…'):tr('Connexion…','Signing in…'))+'</span>';
    if(firstMode==='signup'){
      const {data,error}=await c.auth.signUp({email,password,options:{data:{name},emailRedirectTo:location.origin+'/'}});
      if(error){status.innerHTML='<span class="status-dot"></span><span>'+error.message+'</span>';return}
      if(data.session){localStorage.setItem('miseFirstRunComplete','1');try{closeModal(q('#firstRunModal'))}catch{};navigate('profile')}
      else status.innerHTML='<span class="status-dot ok"></span><span>'+tr('Compte créé. Confirmez votre email puis revenez sur Mise.','Account created. Confirm your email, then return to Mise.')+'</span>';
    }else{
      const {data,error}=await c.auth.signInWithPassword({email,password});
      if(error){status.innerHTML='<span class="status-dot"></span><span>'+error.message+'</span>';return}
      if(data.user){localStorage.setItem('miseFirstRunComplete','1');try{closeModal(q('#firstRunModal'))}catch{};navigate('profile')}
    }
  });
  q('#firstRunSkip')?.addEventListener('click',()=>{localStorage.setItem('miseFirstRunComplete','1');try{closeModal(q('#firstRunModal'))}catch{};});

  function profileSafeEligible(r){
    try{return typeof eligibleByProfile==='function'?eligibleByProfile(r):true}catch{return true}
  }
  function tunePlanToGoal(){
    if(!isConnected())return;
    const w=computeWellness(state.profile);if(!w.valid)return;
    const target=(w.low+w.high)/2;
    const foodSlots=[0,1,2].filter(si=>!shouldFast(si)),baseRatios=foodSlots.length===2?[.46,.54]:foodSlots.length===1?[1]:[.25,.35,.40];
    const ratioBySlot={};foodSlots.forEach((si,i)=>ratioBySlot[si]=baseRatios[i]||1/foodSlots.length);
    const next=state.plan.map((day,di)=>day.map((id,si)=>{
      if(shouldFast(si))return FAST_ID;
      const current=RECIPES.find(r=>r.id===id&&r.id!==FAST_ID);if(!current)return foodReplacement(si,di);
      const slot=['breakfast','lunch','dinner'][si],targetKcal=target*(ratioBySlot[si]||1/foodSlots.length),currentGap=Math.abs(Number(current.kcal||0)-targetKcal);
      if(currentGap<110)return id;
      const prev=di>0?state.plan[di-1][si]:null;
      const pool=RECIPES.filter(r=>r.id!==FAST_ID&&r.slot===slot&&profileSafeEligible(r)&&r.id!==prev);
      let best=current,bestScore=currentGap;
      pool.forEach(r=>{
        let score=Math.abs(Number(r.kcal||0)-targetKcal);
        if((state.profile.proteinPriority==='high'||state.profile.proteinPriority==='very-high')&&(r.tags||[]).some(t=>t==='protein'||t==='high-protein'))score-=55;
        if(state.profile.sugar==='low'&&(r.tags||[]).some(t=>t==='dessert'||t==='drink'))score+=140;
        if(score<bestScore-35){best=r;bestScore=score}
      });
      return best.id;
    }));
    state.plan=next;applyFastingSchedule();localStorage.setItem('misePlan',JSON.stringify(state.plan));renderWeek();window.KitchenCloud?.saveSoon?.();
  }

  q('#premiumCreateAccountBtn')?.addEventListener('click',()=>q('#profileAccountShell')?.scrollIntoView({behavior:'smooth',block:'start'}));
  q('#saveProfile')?.addEventListener('click',()=>setTimeout(()=>{
    collect();hydrate();applyFastingSchedule();tunePlanToGoal();renderWeek();const w=computeWellness(state.profile);renderPremiumPreview(w);renderGate();renderCoach();renderRecipes(window.__recipeFilter||'all');
    toast(tr('Profil enregistré. L’IA utilisera ces données pour les prochains menus.','Profile saved. The AI will use these details for future menus.'));
  },30));

  q('#personalQuestionsForm')?.addEventListener('submit',()=>setTimeout(()=>{hydrate();renderCoach();renderMini();window.KitchenCloud?.saveSoon?.()},40));
  q('#languageSelect')?.addEventListener('change',()=>setTimeout(()=>{hydrate();renderGate();renderCoach()},30));

  const wizard=q('#wizardNext');
  if(wizard&&wizard.onclick){
    const prev=wizard.onclick;
    wizard.onclick=async function(e){const final=typeof wizardStep!=='undefined'&&wizardStep===3;await prev.call(this,e);if(final)setTimeout(()=>{applyFastingSchedule();tunePlanToGoal();renderCoach()},180)};
  }
  const regen=q('#regenerateSelected');regen?.addEventListener('click',()=>setTimeout(()=>{applyFastingSchedule();renderWeek()},80));
  const quick=q('#sendQuickPrompt');
  if(quick){
    quick.onclick=async function(){
      const prompt=q('#quickPrompt').value.trim();if(!prompt)return;
      toast(tr('Mise adapte votre semaine à votre demande…','Mise is adapting your week…'));
      const before=JSON.parse(JSON.stringify(state.plan));
      let plan=null;
      try{
        const r=await fetch('/api/generate-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
          profile:state.profile,
          brief:{prompt,adaptiveRequest:state.profile.adaptiveRequest||'',fasting:{mode:state.profile.fastingMode,start:state.profile.fastingStart,end:state.profile.fastingEnd},avoidPlan:before},
          fridgeInventory:window.KitchenStudioV9?.fridgeItems?.()||[]
        })});
        if(r.ok){const d=await r.json();if(Array.isArray(d.plan)&&d.plan.length===7)plan=d.plan}
      }catch{}
      if(plan)state.plan=plan;applyFastingSchedule();tunePlanToGoal();localStorage.setItem('misePlan',JSON.stringify(state.plan));renderWeek();
      try{closeModal(q('#aiModal'))}catch{}navigate('planner');toast(plan?tr('Votre demande a été intégrée au menu.','Your request has been integrated into the menu.'):tr('Mise a gardé votre semaine et appliqué vos réglages personnels.','Mise kept your week and applied your personal settings.'));
    };
  }

  document.addEventListener('mise:auth',e=>{
    const u=e.detail?.user||null;
    if(u&&!state.profile.firstName){
      state.profile.firstName=u.user_metadata?.name||'';
      localStorage.setItem('miseProfile',JSON.stringify(state.profile));
    }
    if(u){localStorage.setItem('miseFirstRunComplete','1');const dlg=q('#firstRunModal');if(dlg?.open){try{closeModal(dlg)}catch{dlg.close()}}}
    hydrate();renderGate();applyFastingSchedule();renderWeek();renderCoach();
    if(!u)setTimeout(showFirstRun,50);
  });
  document.addEventListener('mise:cloudloaded',()=>setTimeout(()=>{hydrate();renderGate();renderCoach()},0));

  hydrate();renderGate();applyFastingSchedule();renderWeek();renderCoach();setTimeout(showFirstRun,350);
  window.MiseWellness={compute:()=>computeWellness(state.profile),render:renderCoach,tune:tunePlanToGoal,applyFasting:applyFastingSchedule};
})();