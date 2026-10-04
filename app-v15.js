// Mise V15 — freemium monetization, premium gating, Student Budget Pack
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const tr=(fr,en)=>state.profile.language==='en'?en:fr;

  const ACCESS={
    premium:false,
    studentPack:false,
    owner:false,
    source:'free'
  };
  let commerce={ready:false,links:{}};
  let preview='all', accessRequest=0;
  let aiStatus={state:'untested'};

  function applyAccess(){
    const before=ACCESS.premium+':'+ACCESS.studentPack;
    const granted=commerce.access||{};
    ACCESS.owner=granted.owner===true;
    ACCESS.source=granted.source||'free';
    ACCESS.premium=granted.premium===true&&(!ACCESS.owner||['all','premium'].includes(preview));
    ACCESS.studentPack=granted.studentPack===true&&(!ACCESS.owner||['all','student-pack'].includes(preview));
    refreshAccessUI();
    if(before!==ACCESS.premium+':'+ACCESS.studentPack)document.dispatchEvent(new CustomEvent('mise:access'));
  }

  async function loadCommerce(checkAi=false){
    const seq=++accessRequest;
    try{
      const r=await window.KitchenCloud.request('/api/commerce-config'+(checkAi?'?checkAi=1':''),{cache:'no-store'});
      const data=await r.json();
      if(seq!==accessRequest)return;
      if(r.ok){
        commerce=data;
        if(data.ai?.state&&data.ai.state!=='untested')aiStatus=data.ai;
        if(commerce.access?.owner){
          const saved=sessionStorage.getItem('miseOwnerPreview');
          preview=['all','free','premium','student-pack'].includes(saved)?saved:'all';
        }else preview='all';
      }else commerce={ready:false,links:{},access:{}};
    }catch{if(seq!==accessRequest)return;commerce={ready:false,links:{},access:{}}}
    applyAccess();
  }

  function setPreview(value){
    if(!ACCESS.owner||!['all','free','premium','student-pack'].includes(value))return;
    preview=value;sessionStorage.setItem('miseOwnerPreview',value);
    applyAccess();
  }

  function renderOwnerTools(){
    let panel=$('#ownerAccessPanel');
    if(!ACCESS.owner){panel?.remove();return}
    if(!panel){
      panel=document.createElement('section');panel.id='ownerAccessPanel';panel.className='owner-access-panel';
      panel.innerHTML='<div><span class="premium-badge">'+tr('Compte propriétaire · gratuit','Owner account · free')+'</span><h3>'+tr('Toutes les fonctions sont incluses pour votre compte.','All features are included for your account.')+'</h3><p>'+tr('Prévisualisez chaque offre. Ce choix ne modifie ni votre compte ni vos données.','Preview each plan. This does not change your account or data.')+'</p></div><label>'+tr('Offre à tester','Plan to preview')+'<select id="ownerPreviewSelect"><option value="all">'+tr('Tout débloqué · propriétaire','Everything unlocked · owner')+'</option><option value="free">Mise Free</option><option value="premium">Mise Premium</option><option value="student-pack">Student Budget Pack</option></select></label><div><p id="ownerAiStatus" role="status"></p><button class="btn btn-outline btn-small" id="ownerTestAi" type="button">'+tr('Tester l’IA','Test AI')+'</button><a href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card" target="_blank" rel="noopener" id="ownerActivateAi" hidden>'+tr('Activer AI Gateway dans Vercel ↗','Activate AI Gateway in Vercel ↗')+'</a></div>';
      $('#page-profile .page-head')?.insertAdjacentElement('afterend',panel);
      $('#ownerPreviewSelect')?.addEventListener('change',e=>setPreview(e.target.value));
      $('#ownerTestAi')?.addEventListener('click',async e=>{
        e.target.disabled=true;aiStatus={state:'testing'};renderOwnerTools();
        try{await loadCommerce(true)}finally{e.target.disabled=false;renderOwnerTools()}
      });
    }
    $('#ownerPreviewSelect').value=preview;
    $('#ownerAiStatus').textContent=aiStatus.state==='available'?tr('IA : réponse reçue.','AI: response received.')
      :aiStatus.state==='testing'?tr('IA : test en cours…','AI: testing…')
      :aiStatus.state==='blocked'?(aiStatus.ownerMessage||aiStatus.message||tr('IA indisponible · mode local disponible.','AI unavailable · local planning available.'))
      :tr('IA : disponibilité à tester.','AI: availability not tested yet.');
    $('#ownerActivateAi').hidden=aiStatus.code!=='ai_billing_required'&&aiStatus.code!=='customer_verification_required';
  }

  function renderAiStatus(){
    let note=$('#aiAvailabilityNote');
    if(!note){note=document.createElement('p');note.id='aiAvailabilityNote';note.className='muted ai-availability-note';note.setAttribute('role','status');$('#page-planner .hero-row')?.insertAdjacentElement('afterend',note)}
    if(note){
      note.hidden=aiStatus.state!=='blocked';
      note.textContent=tr('IA indisponible. Les menus proposés actuellement sont calculés en mode local.','AI unavailable. Current meal suggestions use local planning.');
    }
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
    if(ACCESS.owner){setPreview(type==='student-pack'?'student-pack':'premium');toast(tr('Aperçu activé gratuitement pour votre compte propriétaire.','Preview enabled free for your owner account.'));return}
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
    badge.textContent=ACCESS.owner?tr('✦ Propriétaire · gratuit','✦ Owner · free')+(preview==='all'?'':' · '+preview):ACCESS.premium?'✦ Mise Premium':ACCESS.studentPack?'Student Pack':'Mise Free';
    badge.classList.toggle('paid',ACCESS.premium||ACCESS.studentPack);
  }

  function refreshAccessUI(){
    enforcePremiumProfile();
    markPremiumControls();
    renderMembership();
    applyStudentPackLock();
    renderOwnerTools();renderAiStatus();
  }

  document.addEventListener('mise:auth',()=>{
    ++accessRequest;
    commerce={ready:false,links:{},access:{}};ACCESS.owner=false;ACCESS.premium=false;ACCESS.studentPack=false;preview='all';
    refreshAccessUI();setTimeout(()=>loadCommerce(),0);
  });
  document.addEventListener('mise:cloudloaded',()=>setTimeout(refreshAccessUI,0));
  document.addEventListener('mise:ai-status',e=>{aiStatus=e.detail;renderOwnerTools();renderAiStatus()});
  $('#languageSelect')?.addEventListener('change',()=>setTimeout(refreshAccessUI,0));

  loadCommerce();
  refreshAccessUI();

  window.MiseAccess={
    get premium(){return ACCESS.premium},
    get studentPack(){return ACCESS.studentPack},
    get owner(){return ACCESS.owner},
    get preview(){return preview},
    get aiStatus(){return aiStatus},
    refresh:refreshAccessUI
  };
})();
