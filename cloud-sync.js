// Kitchen Studio cloud sync. Uses only the public Supabase URL + publishable key.
(function(){
  const Cloud={ready:false,client:null,user:null,timer:null};
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
      version:9,
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
  }
  async function init(){
    try{
      const cfg=await fetch('/api/public-config').then(r=>r.json());
      if(!cfg.configured){setStatus('Compte cloud prêt dans le code, mais Supabase n’est pas encore configuré pour Kitchen Studio.');return}
      await loadSdk();
      Cloud.client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      Cloud.ready=true;
      const {data:{session}}=await Cloud.client.auth.getSession();
      Cloud.user=session?.user||null;updateAccountUI(Cloud.user);
      if(Cloud.user)await loadCloud();
      Cloud.client.auth.onAuthStateChange(async(_event,session)=>{
        Cloud.user=session?.user||null;updateAccountUI(Cloud.user);
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
  });
  document.querySelector('#cloudAuthForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!Cloud.ready){setStatus('Le projet cloud Kitchen Studio doit d’abord être activé.');return}
    const email=document.querySelector('#cloudAccountEmail').value.trim(),password=document.querySelector('#cloudAccountPassword').value,name=document.querySelector('#cloudAccountName').value.trim();
    setStatus(mode==='signup'?'Création du compte…':'Connexion…');
    if(mode==='signup'){
      const {data,error}=await Cloud.client.auth.signUp({email,password,options:{data:{name},emailRedirectTo:window.location.origin+'/'}});
      if(error){setStatus(error.message);return}
      Cloud.user=data.user||null;
      if(data.session){updateAccountUI(Cloud.user);await saveNow();setStatus('Compte créé et synchronisé',true)}
      else setStatus('Compte créé. Vérifiez votre email pour confirmer puis reconnectez-vous.',true);
    }else{
      const {data,error}=await Cloud.client.auth.signInWithPassword({email,password});
      if(error){setStatus(error.message);return}
      Cloud.user=data.user;updateAccountUI(Cloud.user);await loadCloud();
    }
  });
  document.querySelector('#cloudSignOut')?.addEventListener('click',async()=>{if(Cloud.client)await Cloud.client.auth.signOut();Cloud.user=null;updateAccountUI(null);setStatus('Déconnecté. Les données locales restent sur cet appareil.')});

  Object.assign(Cloud,{saveSoon,saveNow,loadCloud,uploadManualPage,listManualPages,capture,apply});
  window.KitchenCloud=Cloud;
  init();
})();
