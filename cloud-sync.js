// Kitchen Studio cloud sync. Uses only the public Supabase URL + publishable key.
(function(){
  // Capture recovery intent before the SDK consumes/clears the URL fragment.
  const recoveryHash=new URLSearchParams(window.location.hash.slice(1));
  const recoveryLink=recoveryHash.get('type')==='recovery';
  const recoveryToken=recoveryHash.get('access_token');
  let recoveryStored=null;try{recoveryStored=sessionStorage.getItem('misePasswordRecoveryUser')}catch{}
  const Cloud={ready:false,client:null,user:null,timer:null,loading:false,recovering:recoveryLink||Boolean(recoveryStored),recoveryUserId:null,recoverySubmitting:false};
  let recoveryError=recoveryHash.get('error_description')||recoveryHash.get('error')||'';
  const AUTH_REDIRECT='https://mise-kitchen-studio.vercel.app/';
  const status=()=>document.querySelector('#cloudAuthStatus');

  function setStatus(message,ok=false){
    const el=status();if(!el)return;
    el.innerHTML='<span class="status-dot '+(ok?'ok':'')+'"></span><span>'+message+'</span>';
  }
  function recoveryStatus(message,ok=false){
    const el=document.querySelector('#passwordRecoveryStatus');
    if(el){el.textContent=message;el.classList.toggle('auth-success',ok)}
  }
  function openRecovery(valid=false,message='Validation du lien de récupération…'){
    const dlg=document.querySelector('#passwordRecoveryModal');if(!dlg)return;
    document.querySelectorAll('dialog[open]').forEach(other=>{if(other!==dlg)closeModal(other)});
    const button=document.querySelector('#passwordRecoverySubmit');if(button)button.disabled=!valid||Cloud.recoverySubmitting;
    recoveryStatus(message,valid);
    if(!dlg.open){try{openModal(dlg)}catch{dlg.showModal()}}
    if(valid)document.querySelector('#newRecoveryPassword')?.focus();
  }
  function recoverySession(session){
    if(!Cloud.recovering)return false;
    if(!recoveryLink&&recoveryStored&&session?.user&&session.user.id!==recoveryStored){
      Cloud.recovering=false;recoveryStored=null;try{sessionStorage.removeItem('misePasswordRecoveryUser')}catch{};
      const dlg=document.querySelector('#passwordRecoveryModal');if(dlg?.open)closeModal(dlg);
      return false;
    }
    Cloud.user=session?.user||null;
    const valid=Boolean(Cloud.user&&!recoveryError&&(!recoveryToken||session.access_token===recoveryToken));
    Cloud.recoveryUserId=valid?Cloud.user.id:null;
    if(valid){
      recoveryStored=Cloud.user.id;try{sessionStorage.setItem('misePasswordRecoveryUser',recoveryStored)}catch{}
      openRecovery(true,'Lien validé. Saisissez et confirmez votre nouveau mot de passe.');
      setStatus('Réinitialisation en cours · choisissez votre nouveau mot de passe.');
    }else openRecovery(false,'Ce lien est expiré, déjà utilisé ou invalide. Demandez un nouveau lien avec « Mot de passe oublié ? ».');
    return true;
  }
  function loadSdk(){
    return new Promise((resolve,reject)=>{
      if(window.supabase?.createClient)return resolve();
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js';
      s.integrity='';s.crossOrigin='anonymous';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
  }
  function capture(){
    return {
      version:10,
      profile:state.profile,
      plan:state.plan,
      favorites:[...(state.favorites||[])],
      fridge:JSON.parse(localStorage.getItem('miseFridge')||'[]'),
      removedShopping:[...(state.removedShopping||[])],
      extraExpenses:state.extraExpenses||[],
      devices:JSON.parse(localStorage.getItem('miseCustomAppliances')||'[]'),
      activeDeviceId:state.profile.applianceId||null,
      store:state.profile.store,
      location:state.profile.location,
      budget:state.profile.budget,
      updatedAt:new Date().toISOString()
    };
  }
  function apply(payload){
    if(!payload||typeof payload!=='object')return;
    if(payload.profile)state.profile={...state.profile,...payload.profile};
    if(Array.isArray(payload.plan)&&payload.plan.length===7)state.plan=payload.plan;
    if(Array.isArray(payload.favorites))state.favorites=new Set(payload.favorites);
    if(Array.isArray(payload.removedShopping))state.removedShopping=new Set(payload.removedShopping);
    if(Array.isArray(payload.extraExpenses))state.extraExpenses=payload.extraExpenses;
    if(Array.isArray(payload.fridge))localStorage.setItem('miseFridge',JSON.stringify(payload.fridge));
    if(Array.isArray(payload.devices)){
      localStorage.setItem('miseCustomAppliances',JSON.stringify(payload.devices));
      const active=payload.devices.find(x=>x.id===(payload.activeDeviceId||state.profile.applianceId))||payload.devices[0];
      if(active){state.profile.applianceId=active.id;localStorage.setItem('miseCustomAppliance',JSON.stringify(active))}
    }
    localStorage.setItem('miseProfile',JSON.stringify(state.profile));
    localStorage.setItem('misePlan',JSON.stringify(state.plan));
    localStorage.setItem('miseFavorites',JSON.stringify([...state.favorites]));
    localStorage.setItem('miseRemovedShopping',JSON.stringify([...state.removedShopping]));
    localStorage.setItem('miseExtraExpenses',JSON.stringify(state.extraExpenses));
    if(state.profile.store)localStorage.setItem('miseStore',state.profile.store);
    if(state.profile.location)localStorage.setItem('miseLocation',state.profile.location);
    if(state.profile.budget)localStorage.setItem('miseBudget',String(state.profile.budget));
    const v9=window.KitchenStudioV9;
    document.dispatchEvent(new CustomEvent('mise:cloudloaded',{detail:{payload}}));
    v9?.renderDevices?.();
    v9?.renderPlannerDrawer?.();
    v9?.renderFridge?.();
    v9?.renderFridgeCoverage?.();
    v9?.renderShopping?.();
    renderWeek();renderRecipes(window.__recipeFilter||'all');
    v9?.renderRecipeIdeas?.();
    if(typeof renderRecipeIdeas==='function')renderRecipeIdeas();
  }
  async function saveNow(){
    if(!Cloud.ready||!Cloud.user||Cloud.loading||Cloud.recovering)return;
    const payload=capture();
    const {error}=await Cloud.client.from('kitchen_user_state').upsert({user_id:Cloud.user.id,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error)console.warn('Kitchen cloud save failed',error.message);
  }
  function saveSoon(){
    clearTimeout(Cloud.timer);Cloud.timer=setTimeout(()=>saveNow(),700);
  }
  // Attach the verified Supabase session to premium requests.
  async function request(url,options={}){
    const headers=new Headers(options.headers||{});
    const {data:{session}={}}=await (Cloud.client?.auth.getSession()||Promise.resolve({data:{}}));
    if(session?.access_token)headers.set('Authorization','Bearer '+session.access_token);
    if(window.MiseAccess?.owner)headers.set('X-Mise-Preview',window.MiseAccess.preview||'all');
    if(String(url).includes('/api/generate-plan')&&options.body){
      const payload=JSON.parse(options.body);
      payload.recipeCatalog=RECIPES.filter(r=>r.id!=='fasting-slot'&&(!window.eligibleByProfile||eligibleByProfile(r))).map(r=>({id:r.id,slot:r.slot,name:r.name,tags:r.tags,ingredients:r.ingredients,kcal:r.kcal,protein:r.protein,estimatedCost:r.estimatedCost}));
      options={...options,body:JSON.stringify(payload)};
    }
    const response=await fetch(url,{...options,headers});
    if(/\/api\/(generate-plan|adapt-cooking|wellness-note|recognize-appliance|research-appliance|analyze-manual)/.test(String(url))){
      const data=await response.clone().json().catch(()=>({}));
      if(['auth_required','premium_required','preview_locked'].includes(data.code))return response;
      if(!response.ok||data.fallback)document.dispatchEvent(new CustomEvent('mise:ai-status',{detail:{state:'blocked',code:data.code||data.details?.error?.type,message:data.message||data.error?.message||data.error||'IA indisponible · mode local',ownerMessage:data.ownerMessage}}));
      else document.dispatchEvent(new CustomEvent('mise:ai-status',{detail:{state:'available',message:'L’IA a répondu à votre demande.'}}));
    }
    return response;
  }
  async function loadCloud(){
    if(!Cloud.ready||!Cloud.user||Cloud.recovering)return;
    const userId=Cloud.user.id;Cloud.loading=true;clearTimeout(Cloud.timer);
    try{
      const {data,error}=await Cloud.client.from('kitchen_user_state').select('payload,updated_at').eq('user_id',userId).maybeSingle();
      if(Cloud.user?.id!==userId)return;
      if(error){console.warn(error.message);return}
      if(data?.payload)apply(data.payload);
      else{Cloud.loading=false;await saveNow();}
    }finally{Cloud.loading=false;}
  }
  async function uploadManualPage(deviceId,file){
    if(!Cloud.ready||!Cloud.user)return null;
    const safe=String(file.name||'page.jpg').replace(/[^a-z0-9._-]+/gi,'-');
    const path=Cloud.user.id+'/'+deviceId+'/'+Date.now()+'-'+safe;
    const {data,error}=await Cloud.client.storage.from('manual-pages').upload(path,file,{cacheControl:'3600',upsert:false});
    if(error)throw error;return data;
  }
  async function listManualPages(deviceId){
    if(!Cloud.ready||!Cloud.user)return [];
    const prefix=Cloud.user.id+'/'+deviceId;
    const {data,error}=await Cloud.client.storage.from('manual-pages').list(prefix,{limit:100,sortBy:{column:'created_at',order:'asc'}});
    if(error)return [];
    const out=[];
    for(const item of data||[]){
      const path=prefix+'/'+item.name;
      const {data:signed}=await Cloud.client.storage.from('manual-pages').createSignedUrl(path,3600);
      if(signed?.signedUrl)out.push({name:item.name,url:signed.signedUrl,cloud:true});
    }
    return out;
  }

  async function signUpAccount(email,password,name=''){
    if(!Cloud.ready||!Cloud.client)throw new Error('Cloud indisponible');
    return await Cloud.client.auth.signUp({
      email,password,
      options:{data:{name},emailRedirectTo:AUTH_REDIRECT}
    });
  }
  async function signInAccount(email,password){
    if(!Cloud.ready||!Cloud.client)throw new Error('Cloud indisponible');
    return await Cloud.client.auth.signInWithPassword({email,password});
  }
  async function resendConfirmation(email){
    if(!email)throw new Error('Entrez votre email.');
    return await Cloud.client.auth.resend({type:'signup',email,options:{emailRedirectTo:AUTH_REDIRECT}});
  }
  async function sendPasswordReset(email){
    if(!email)throw new Error('Entrez votre email.');
    return await Cloud.client.auth.resetPasswordForEmail(email,{redirectTo:AUTH_REDIRECT});
  }
  function isRepeatedSignup(data){
    return Boolean(data?.user && Array.isArray(data.user.identities) && data.user.identities.length===0);
  }
  function rememberExistingEmail(email){
    try{sessionStorage.setItem('miseKnownExistingEmail',String(email||'').trim().toLowerCase())}catch{}
  }
  function knownExistingEmail(email){
    try{return sessionStorage.getItem('miseKnownExistingEmail')===String(email||'').trim().toLowerCase()}catch{return false}
  }
  function setHint(selector,message,kind=''){
    const el=document.querySelector(selector);if(!el)return;
    el.textContent=message;
    el.classList.remove('known-account','auth-warning','auth-success');
    if(kind)el.classList.add(kind);
  }
  function safeSignupMessage(){
    return 'Si cette adresse est nouvelle, un email de confirmation vient d’être envoyé. Si vous aviez déjà un compte, utilisez “Se connecter” ou “Mot de passe oublié ?”.';
  }

  function updateAccountUI(user){
    const signOut=document.querySelector('#cloudSignOut');
    if(user){
      const name=user.user_metadata?.name||user.email?.split('@')[0]||'Compte';
      document.querySelector('#accountDisplayName').textContent=name;
      document.querySelector('#accountDisplayEmail').textContent=user.email||'';
      document.querySelector('#accountAvatar').textContent=name[0]?.toUpperCase()||'M';
      if(signOut)signOut.hidden=false;
      setStatus('Compte connecté · synchronisation active',true);
    }else{
      document.querySelector('#accountDisplayName').textContent='Pas encore connecté';
      document.querySelector('#accountDisplayEmail').textContent='Créez votre compte ou connectez-vous.';
      if(signOut)signOut.hidden=true;
    }
    document.dispatchEvent(new CustomEvent('mise:auth',{detail:{user:user||null}}));
  }
  async function init(){
    if(Cloud.recovering||recoveryError){Cloud.recovering=true;openRecovery(false,recoveryError?'Ce lien est expiré, déjà utilisé ou invalide. Demandez un nouveau lien.':'Validation du lien de récupération…')}
    try{
      const cfg=await fetch('/api/public-config').then(r=>r.json());
      if(!cfg.configured){setStatus('Compte cloud prêt dans le code, mais Supabase n’est pas encore configuré pour Kitchen Studio.');return}
      await loadSdk();
      // Auth users live in the stable Supabase project, not in a Vercel deployment.
      // Keeping the same project URL/publishable key means accounts survive every website update.
      Cloud.client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      Cloud.ready=true;
      // Subscribe before getSession(): PASSWORD_RECOVERY can fire during initialization.
      Cloud.client.auth.onAuthStateChange((event,session)=>{
        clearTimeout(Cloud.timer);
        if(event==='PASSWORD_RECOVERY')Cloud.recovering=true;
        if(recoverySession(session))return;
        Cloud.user=session?.user||null;updateAccountUI(Cloud.user);
        // Supabase calls must run outside the synchronous auth callback.
        if(Cloud.user&&['SIGNED_IN','INITIAL_SESSION'].includes(event))setTimeout(()=>loadCloud(),0);
      });
      const {data:{session},error}=await Cloud.client.auth.getSession();
      if(error&&Cloud.recovering)recoveryError=error.message||'Lien invalide';
      if(recoverySession(session))return;
      Cloud.user=session?.user||null;updateAccountUI(Cloud.user);
      if(Cloud.user)await loadCloud();
      setStatus(Cloud.user?'Compte connecté · synchronisation active':'Cloud prêt · créez un compte ou connectez-vous',Boolean(Cloud.user));
    }catch(e){setStatus('Connexion cloud indisponible pour le moment.');if(Cloud.recovering)openRecovery(false,'Impossible de valider le lien pour le moment. Réessayez ou demandez un nouveau lien.')}
  }

  let mode='signup';
  document.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>{
    mode=b.dataset.authMode;document.querySelectorAll('[data-auth-mode]').forEach(x=>x.classList.toggle('active',x===b));
    document.querySelector('#cloudNameLabel').hidden=mode==='signin';
    document.querySelector('#cloudAuthSubmit').textContent=mode==='signup'?'Créer mon compte':'Se connecter';
    document.querySelector('#cloudAccountPassword').autocomplete=mode==='signup'?'new-password':'current-password';
    const resend=document.querySelector('#resendConfirmation'),forgot=document.querySelector('#forgotPassword');
    if(resend)resend.hidden=mode!=='signup';
    if(forgot)forgot.hidden=mode!=='signin';
    setHint('#cloudEmailHint',mode==='signup'
      ?'Si cette adresse possède déjà un compte, Mise vous proposera de vous connecter.'
      :'Entrez l’adresse utilisée lors de la création de votre compte.');
    setHint('#cloudPasswordHint',mode==='signup'
      ?'8 caractères minimum.'
      :'Mot de passe oublié ? Utilisez le bouton juste sous le formulaire pour le réinitialiser.');
  });
  document.querySelector('#cloudAuthForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!Cloud.ready){setStatus('Le projet cloud Kitchen Studio doit d’abord être activé.');return}
    const email=document.querySelector('#cloudAccountEmail').value.trim(),password=document.querySelector('#cloudAccountPassword').value,name=document.querySelector('#cloudAccountName').value.trim();
    setStatus(mode==='signup'?'Création du compte…':'Connexion…');
    if(mode==='signup'){
      const {data,error}=await signUpAccount(email,password,name);
      if(error){setStatus(error.message);return}
      if(data.session){
        Cloud.user=data.user||null;
        updateAccountUI(Cloud.user);await saveNow();setStatus('Compte créé et synchronisé',true);
        setHint('#cloudEmailHint','Compte créé avec cette adresse.','auth-success');
      }else if(isRepeatedSignup(data)){
        rememberExistingEmail(email);
        setStatus('Cette adresse est déjà associée à un compte Mise. Passez sur “Se connecter”.',true);
        setHint('#cloudEmailHint','✓ Un compte Mise existe déjà avec cette adresse. Utilisez “Se connecter”.','known-account');
        setHint('#cloudPasswordHint','Si vous ne connaissez plus le mot de passe, passez sur “Se connecter” puis cliquez sur “Mot de passe oublié ?”.','known-account');
      }else{
        setStatus(safeSignupMessage(),true);
        setHint('#cloudEmailHint','Nouvelle inscription : vérifiez votre boîte mail et vos spams pour confirmer l’adresse.','auth-success');
      }
    }else{
      const {data,error}=await signInAccount(email,password);
      if(error){
        const invalid=error.code==='invalid_credentials'||/invalid login credentials/i.test(error.message||'');
        if(invalid){
          if(knownExistingEmail(email)){
            setStatus('Le mot de passe saisi est incorrect pour ce compte.');
            setHint('#cloudEmailHint','✓ Un compte Mise existe avec cette adresse.','known-account');
            setHint('#cloudPasswordHint','Mot de passe incorrect. Cliquez sur “Mot de passe oublié ?” ci-dessous pour en choisir un nouveau.','auth-warning');
          }else{
            setStatus('Email ou mot de passe incorrect.');
            setHint('#cloudPasswordHint','Si vous avez déjà créé un compte avec cet email, cliquez sur “Mot de passe oublié ?” pour réinitialiser le mot de passe.','auth-warning');
          }
        }else setStatus(error.message);
        return
      }
      try{sessionStorage.removeItem('miseKnownExistingEmail')}catch{}
      Cloud.user=data.user;updateAccountUI(Cloud.user);await loadCloud();
      setHint('#cloudEmailHint','✓ Compte reconnu.','auth-success');
      setHint('#cloudPasswordHint','Connexion réussie.','auth-success');
    }
  });

  document.querySelector('#resendConfirmation')?.addEventListener('click',async()=>{
    const email=document.querySelector('#cloudAccountEmail')?.value.trim();
    if(!email){setStatus('Entrez votre email ci-dessus.');return}
    setStatus('Envoi de la confirmation…');
    const {error}=await resendConfirmation(email);
    if(error){
      setStatus('Impossible de renvoyer une confirmation. Si ce compte est déjà confirmé, utilisez “Se connecter” ou “Mot de passe oublié ?”.');
      return;
    }
    setStatus('Si cette adresse attend encore une confirmation, un nouvel email vient d’être envoyé.',true);
  });
  document.querySelector('#forgotPassword')?.addEventListener('click',async()=>{
    const email=document.querySelector('#cloudAccountEmail')?.value.trim();
    if(!email){setStatus('Entrez votre email ci-dessus.');return}
    setStatus('Envoi du lien de récupération…');
    setHint('#cloudPasswordHint','Nous allons envoyer un lien permettant de choisir un nouveau mot de passe. Votre compte et vos données ne seront pas supprimés.','known-account');
    const {error}=await sendPasswordReset(email);
    if(error){setStatus(error.message||'Impossible d’envoyer le lien de récupération.');return}
    setStatus('Email de réinitialisation demandé. Vérifiez votre boîte mail et vos spams.',true);
    setHint('#cloudPasswordHint','Ouvrez l’email de Mise, cliquez sur le lien, puis choisissez un nouveau mot de passe. Ensuite vous pourrez vous reconnecter normalement.','auth-success');
  });
  document.querySelector('#passwordRecoveryForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const p1=document.querySelector('#newRecoveryPassword')?.value||'',p2=document.querySelector('#confirmRecoveryPassword')?.value||'';
    const say=recoveryStatus,button=document.querySelector('#passwordRecoverySubmit');
    if(Cloud.recoverySubmitting)return;
    if(!Cloud.ready||!Cloud.recovering||!Cloud.recoveryUserId||Cloud.recoveryUserId!==Cloud.user?.id){say('Lien invalide ou expiré. Demandez un nouveau lien de récupération.');return}
    if(p1.length<8){say('Utilisez au moins 8 caractères.');return}
    if(p1!==p2){say('Les deux mots de passe ne correspondent pas.');return}
    say('Mise à jour du mot de passe…');
    Cloud.recoverySubmitting=true;if(button)button.disabled=true;
    try{
      const {data,error}=await Cloud.client.auth.updateUser({password:p1});
      if(error){say(error.message||'Impossible de modifier le mot de passe.');return}
      Cloud.user=data?.user||Cloud.user;Cloud.recovering=false;Cloud.recoveryUserId=null;
      try{sessionStorage.removeItem('misePasswordRecoveryUser')}catch{}
      document.querySelector('#passwordRecoveryForm').reset();
      closeModal(document.querySelector('#passwordRecoveryModal'));
      updateAccountUI(Cloud.user);try{await loadCloud()}catch{console.warn('Cloud reload failed after password update')}
      setStatus('Nouveau mot de passe enregistré · compte connecté.',true);
      toast('Votre nouveau mot de passe a été enregistré.');
    }catch{say('Impossible de modifier le mot de passe pour le moment. Réessayez.');}
    finally{Cloud.recoverySubmitting=false;if(button)button.disabled=false;}
  });
  document.querySelector('#passwordRecoveryModal')?.addEventListener('cancel',e=>{if(Cloud.recovering)e.preventDefault()});
  document.querySelector('#passwordRecoveryModal')?.addEventListener('close',()=>{
    if(Cloud.recovering)setTimeout(()=>{if(Cloud.recovering)openRecovery(Boolean(Cloud.recoveryUserId),document.querySelector('#passwordRecoveryStatus')?.textContent||'Choisissez votre nouveau mot de passe.')},0);
  });
  document.querySelector('#passwordRecoveryCancel')?.addEventListener('click',async()=>{
    if(Cloud.recoverySubmitting)return;
    if(Cloud.client)await Cloud.client.auth.signOut({scope:'local'});
    Cloud.recovering=false;Cloud.recoveryUserId=null;Cloud.user=null;
    try{sessionStorage.removeItem('misePasswordRecoveryUser')}catch{}
    history.replaceState(null,'',window.location.pathname+window.location.search);
    closeModal(document.querySelector('#passwordRecoveryModal'));updateAccountUI(null);navigate('profile');
    setStatus('Réinitialisation annulée. Vous pouvez demander un nouveau lien.');
  });

  document.querySelector('#cloudSignOut')?.addEventListener('click',async()=>{if(Cloud.client)await Cloud.client.auth.signOut();Cloud.user=null;updateAccountUI(null);setStatus('Déconnecté. Les données locales restent sur cet appareil.')});

  Object.assign(Cloud,{request,saveSoon,saveNow,loadCloud,uploadManualPage,listManualPages,capture,apply,signUpAccount,signInAccount,resendConfirmation,sendPasswordReset,isRepeatedSignup,rememberExistingEmail,knownExistingEmail});
  window.KitchenCloud=Cloud;
  init();
})();
