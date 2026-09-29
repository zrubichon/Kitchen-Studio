// Kitchen Studio cloud sync. Uses only the public Supabase URL + publishable key.
(function(){
  const Cloud={ready:false,client:null,user:null,timer:null};
  const AUTH_REDIRECT='https://mise-kitchen-studio.vercel.app/';
  const status=()=>document.querySelector('#cloudAuthStatus');

  function setStatus(message,ok=false){
    const el=status();if(!el)return;
    el.innerHTML='<span class="status-dot '+(ok?'ok':'')+'"></span><span>'+message+'</span>';
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
    if(!Cloud.ready||!Cloud.user)return;
    const payload=capture();
    const {error}=await Cloud.client.from('kitchen_user_state').upsert({user_id:Cloud.user.id,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error)console.warn('Kitchen cloud save failed',error.message);
  }
  function saveSoon(){
    clearTimeout(Cloud.timer);Cloud.timer=setTimeout(()=>saveNow(),700);
  }
  async function loadCloud(){
    if(!Cloud.ready||!Cloud.user)return;
    const {data,error}=await Cloud.client.from('kitchen_user_state').select('payload,updated_at').eq('user_id',Cloud.user.id).maybeSingle();
    if(error){console.warn(error.message);return}
    if(data?.payload)apply(data.payload);else await saveNow();
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
  function safeSignupMessage(){
    return 'Si cette adresse est nouvelle, un email de confirmation vient d’être envoyé. Si vous aviez déjà un compte, il n’est pas recréé : choisissez “Se connecter” ou “Mot de passe oublié ?”.';
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
    try{
      const cfg=await fetch('/api/public-config').then(r=>r.json());
      if(!cfg.configured){setStatus('Compte cloud prêt dans le code, mais Supabase n’est pas encore configuré pour Kitchen Studio.');return}
      await loadSdk();
      // Auth users live in the stable Supabase project, not in a Vercel deployment.
      // Keeping the same project URL/publishable key means accounts survive every website update.
      Cloud.client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      Cloud.ready=true;
      const {data:{session}}=await Cloud.client.auth.getSession();
      Cloud.user=session?.user||null;updateAccountUI(Cloud.user);
      if(Cloud.user)await loadCloud();
      Cloud.client.auth.onAuthStateChange(async(event,session)=>{
        Cloud.user=session?.user||null;updateAccountUI(Cloud.user);
        if(event==='PASSWORD_RECOVERY'){
          setTimeout(()=>{
            const dlg=document.querySelector('#passwordRecoveryModal');
            if(dlg&&!dlg.open){try{openModal(dlg)}catch{dlg.showModal()}}
          },50);
        }
        if(Cloud.user)await loadCloud();
      });
      setStatus(Cloud.user?'Compte connecté · synchronisation active':'Cloud prêt · créez un compte ou connectez-vous',Boolean(Cloud.user));
    }catch(e){setStatus('Connexion cloud indisponible pour le moment.')}
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
  });
  document.querySelector('#cloudAuthForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!Cloud.ready){setStatus('Le projet cloud Kitchen Studio doit d’abord être activé.');return}
    const email=document.querySelector('#cloudAccountEmail').value.trim(),password=document.querySelector('#cloudAccountPassword').value,name=document.querySelector('#cloudAccountName').value.trim();
    setStatus(mode==='signup'?'Création du compte…':'Connexion…');
    if(mode==='signup'){
      const {data,error}=await signUpAccount(email,password,name);
      if(error){setStatus(error.message);return}
      Cloud.user=data.user||null;
      if(data.session){updateAccountUI(Cloud.user);await saveNow();setStatus('Compte créé et synchronisé',true)}
      else setStatus(safeSignupMessage(),true);
    }else{
      const {data,error}=await signInAccount(email,password);
      if(error){setStatus(error.message);return}
      Cloud.user=data.user;updateAccountUI(Cloud.user);await loadCloud();
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
    const {error}=await sendPasswordReset(email);
    if(error){setStatus(error.message||'Impossible d’envoyer le lien de récupération.');return}
    setStatus('Si un compte correspond à cet email, un lien pour choisir un nouveau mot de passe vient d’être envoyé.',true);
  });
  document.querySelector('#passwordRecoveryForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const p1=document.querySelector('#newRecoveryPassword')?.value||'',p2=document.querySelector('#confirmRecoveryPassword')?.value||'';
    const status=document.querySelector('#passwordRecoveryStatus');
    const say=(m,ok=false)=>{if(status)status.innerHTML='<span class="status-dot '+(ok?'ok':'')+'"></span><span>'+m+'</span>'};
    if(p1.length<8){say('Utilisez au moins 8 caractères.');return}
    if(p1!==p2){say('Les deux mots de passe ne correspondent pas.');return}
    say('Mise à jour du mot de passe…');
    const {error}=await Cloud.client.auth.updateUser({password:p1});
    if(error){say(error.message||'Impossible de modifier le mot de passe.');return}
    say('Mot de passe mis à jour. Votre compte et vos données sont conservés.',true);
    setTimeout(()=>{const dlg=document.querySelector('#passwordRecoveryModal');if(dlg?.open)dlg.close()},900);
  });

  document.querySelector('#cloudSignOut')?.addEventListener('click',async()=>{if(Cloud.client)await Cloud.client.auth.signOut();Cloud.user=null;updateAccountUI(null);setStatus('Déconnecté. Les données locales restent sur cet appareil.')});

  Object.assign(Cloud,{saveSoon,saveNow,loadCloud,uploadManualPage,listManualPages,capture,apply,signUpAccount,signInAccount,resendConfirmation,sendPasswordReset});
  window.KitchenCloud=Cloud;
  init();
})();
