// Mise V15 — freemium monetization, premium gating, Student Budget Pack
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const tr=(fr,en)=>state.profile.language==='en'?en:fr;

  const ACCESS={
    premium:false,
    studentPack:false,
    source:'free'
  };
  let commerce={ready:false,links:{}};

  async function loadCommerce(){
    try{
      const r=await fetch('/api/commerce-config',{cache:'no-store'});
      if(r.ok)commerce=await r.json();
    }catch{}
  }

  function gotoPremium(){
    try{navigate('premium')}catch{}
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function showLocked(feature){
    const names={
      ai:tr('Composer avec l’IA','AI meal planning'),
      wellness:tr('Suivi objectif & calories','Goal & calorie tracking'),
      appliance:tr('Appareils & manuels intelligents','Smart appliances & manuals'),
      student:tr('Student Budget Pack','Student Budget Pack')
    };
    toast((names[feature]||tr('Cette fonction','This feature'))+' · '+tr('disponible avec Mise Premium ou le pack correspondant.','available with Mise Premium or the matching pack.'));
    gotoPremium();
  }

  function offerMessage(type){
    const label=type==='student-pack'?'Student Budget Pack · 4,99 €':type==='premium-yearly'?'Mise Premium · 24,99 €/an':'Mise Premium · 2,99 €/mois';
    return label+' — '+tr('le paiement Stripe sera activé dès que la connexion sera terminée. Aucun paiement n’est effectué pour le moment.','Stripe checkout will activate once the connection is finished. No payment is being taken right now.');
  }

  async function startOffer(type){
    if(!window.KitchenCloud?.user){
      toast(tr('Créez ou connectez votre compte avant un achat afin que votre accès puisse être associé à votre profil.','Create or sign in to your account before purchasing so access can be linked to your profile.'));
      navigate('profile');
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }
    await loadCommerce();
    const url=commerce?.links?.[type];
    if(url){
      window.location.href=url;
      return;
    }
    toast(offerMessage(type));
  }

  function enforcePremiumProfile(){
    const lock=$('#premiumProfileLock');
    const goal=$('#premiumGoalCard');
    if(!goal)return;
    if(lock)lock.hidden=ACCESS.premium;
    $$('#premiumFields input,#premiumFields select,#premiumFields textarea').forEach(el=>{
      el.disabled=!ACCESS.premium;
    });
    const status=$('#premiumStatus');
    if(status){
      status.textContent=ACCESS.premium?tr('Premium actif','Premium active'):tr('Premium','Premium');
      status.classList.toggle('active',ACCESS.premium);
    }
  }

  function addAppliancePaywall(){
    const page=$('#page-appliances');if(!page)return;
    let banner=$('#appliancePremiumBanner');
    if(ACCESS.premium){banner?.remove();return}
    if(!banner){
      banner=document.createElement('section');
      banner.id='appliancePremiumBanner';
      banner.className='feature-paywall-banner';
      banner.innerHTML='<div><span class="premium-badge">✦ Premium</span><h3>'+tr('L’adaptation avancée de vos appareils est Premium.','Advanced appliance adaptation is Premium.')+'</h3><p>'+tr('La version gratuite continue d’utiliser four, plaques et micro-ondes. Premium ajoute la recherche IA de votre modèle et la lecture de vos photos de manuel.','Free still supports oven, stovetop and microwave. Premium adds AI model research and manual-photo learning.')+'</p></div><button class="btn btn-dark" type="button" data-go-premium>'+tr('Découvrir Premium','Explore Premium')+'</button>';
      page.querySelector('.page-head')?.insertAdjacentElement('afterend',banner);
    }
  }

  function markPremiumControls(){
    ['#generateWeek','#openAiPrompt','#personalQuestionsBtn','#recipeAiBtn','#deviceResearchBtn'].forEach(sel=>{
      const el=$(sel);if(el)el.classList.toggle('premium-locked-control',!ACCESS.premium);
    });
    addAppliancePaywall();
  }

  function applyStudentPackLock(){
    if((window.__recipeCategory||'all')!=='student-budget')return;
    const cards=$$('#recipeGrid [data-recipe]');
    cards.forEach((card,i)=>{
      const locked=!ACCESS.studentPack&&i>=6;
      card.classList.toggle('pack-locked',locked);
      card.dataset.packLocked=locked?'1':'0';
    });
    const group=document.querySelector('.student-budget-group');
    if(group){
      let note=group.querySelector('.student-pack-category-note');
      if(!note){
        note=document.createElement('div');
        note.className='student-pack-category-note';
        group.appendChild(note);
      }
      note.textContent=ACCESS.studentPack
        ?tr('Pack débloqué · 60 recettes disponibles.','Pack unlocked · 60 recipes available.')
        :tr('6 recettes en aperçu gratuit · 54 recettes dans le pack à 4,99 €.', '6 free preview recipes · 54 more in the €4.99 pack.');
    }
  }

  // Wrap recipe rendering after V14.
  const prevRender=renderRecipes;
  renderRecipes=function(filter='all'){
    const result=prevRender(filter);
    setTimeout(applyStudentPackLock,0);
    return result;
  };

  // Premium actions: capture before older handlers.
  document.addEventListener('click',e=>{
    const target=e.target.closest?.('#generateWeek,#openAiPrompt,#personalQuestionsBtn,#recipeAiBtn,#deviceResearchBtn');
    if(target&&!ACCESS.premium){
      e.preventDefault();e.stopImmediatePropagation();
      showLocked(target.id==='deviceResearchBtn'?'appliance':target.id==='personalQuestionsBtn'?'wellness':'ai');
      return;
    }

    const packCard=e.target.closest?.('.recipe-tile.pack-locked');
    if(packCard&&!ACCESS.studentPack){
      e.preventDefault();e.stopImmediatePropagation();showLocked('student');return;
    }

    const go=e.target.closest?.('[data-go-premium]');
    if(go){e.preventDefault();gotoPremium();return}

    const offer=e.target.closest?.('[data-offer]');
    if(offer){e.preventDefault();startOffer(offer.dataset.offer);return}
  },true);

  document.addEventListener('submit',e=>{
    if(e.target?.id==='deviceResearchForm'&&!ACCESS.premium){
      e.preventDefault();e.stopImmediatePropagation();showLocked('appliance');
    }
  },true);

  document.addEventListener('click',e=>{
    if(!ACCESS.premium&&e.target?.matches?.('[data-manual-upload]')){
      e.preventDefault();e.stopImmediatePropagation();showLocked('appliance');
    }
  },true);

  document.addEventListener('change',e=>{
    if(e.target?.id==='detailApplianceSelect'&&!ACCESS.premium&&e.target.value!=='basic'&&e.target.value!=='default'){
      e.preventDefault();e.stopImmediatePropagation();
      e.target.value='basic';
      showLocked('appliance');
    }
  },true);

  $('#previewStudentPack')?.addEventListener('click',()=>{
    navigate('recipes');
    setTimeout(()=>{
      const chip=$('[data-recipe-category="student-budget"]');
      chip?.click();
      window.scrollTo({top:0,behavior:'smooth'});
    },30);
  });

  // Add plan badge to the account summary.
  function renderMembership(){
    const box=$('.account-summary');if(!box)return;
    let badge=$('#membershipBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='membershipBadge';
      badge.className='membership-badge';
      box.querySelector('.eyebrow')?.insertAdjacentElement('beforebegin',badge);
    }
    badge.textContent=ACCESS.premium?'✦ Mise Premium':ACCESS.studentPack?'Student Pack':'Mise Free';
    badge.classList.toggle('paid',ACCESS.premium||ACCESS.studentPack);
  }

  function refreshAccessUI(){
    enforcePremiumProfile();
    markPremiumControls();
    renderMembership();
    applyStudentPackLock();
  }

  document.addEventListener('mise:auth',()=>setTimeout(refreshAccessUI,0));
  $('#languageSelect')?.addEventListener('change',()=>setTimeout(refreshAccessUI,0));

  loadCommerce();
  refreshAccessUI();

  window.MiseAccess={
    get premium(){return ACCESS.premium},
    get studentPack(){return ACCESS.studentPack},
    refresh:refreshAccessUI
  };
})();