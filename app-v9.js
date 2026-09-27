// Kitchen Studio V9 — fridge inventory, universal recipe actions, multi-device manuals, cloud hooks.
(function(){
  const V9={};
  const STAPLE_RE=/^(eau|water|sel|salt|poivre|pepper|huile d.?olive|olive oil|huile|oil|épices|epices|spices?|herbes?|herbs?|paprika|cannelle|cinnamon)$/i;

  function normName(s=''){
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/\b(cuit|cuite|cuits|cuites|frais|fraiche|fraîche|fraiches|fraîches|complet|complete|complète|cerises?|sec|seche|sèche)\b/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim().replace(/s$/,'');
  }
  function fridgeKey(name){return normName(name).replace(/\s+/g,'-')}
  function loadFridge(){
    const raw=JSON.parse(localStorage.getItem('miseFridge')||'[]');
    return Array.isArray(raw)?raw:[];
  }
  function saveFridge(items){
    localStorage.setItem('miseFridge',JSON.stringify(items));
    state.checked=new Set(items.map(x=>fridgeKey(x.name)));
    state.shopChecked=state.checked;
    localStorage.setItem('miseShoppingChecked',JSON.stringify([...state.checked]));
    window.KitchenCloud?.saveSoon?.();
  }
  function fridgeItems(){return loadFridge()}
  function fridgeHas(name){
    if(STAPLE_RE.test(String(name).trim()))return true;
    const target=normName(name);
    return fridgeItems().some(x=>{
      const n=normName(x.name);
      return n===target||n.includes(target)||target.includes(n);
    });
  }
  function addToFridge(name,qty='',source='manual'){
    if(!name)return;
    const items=fridgeItems(),key=fridgeKey(name),i=items.findIndex(x=>fridgeKey(x.name)===key);
    const obj={name:String(name).trim(),qty:String(qty||''),source,addedAt:new Date().toISOString()};
    if(i>=0)items[i]={...items[i],...obj};else items.push(obj);
    saveFridge(items);renderFridge();renderShopping();renderFridgeCoverage();
  }
  function removeFromFridge(key){
    const items=fridgeItems().filter(x=>fridgeKey(x.name)!==key);
    saveFridge(items);renderFridge();renderShopping();renderFridgeCoverage();
  }
  function recipeCovered(r){
    return !!r&&(r.ingredients||[]).every(([name])=>fridgeHas(name));
  }
  function missingIngredients(r){
    return (r?.ingredients||[]).map(x=>x[0]).filter(name=>!fridgeHas(name)&&!STAPLE_RE.test(name));
  }
  V9.fridgeItems=fridgeItems;
  V9.recipeCovered=recipeCovered;

  // Keep legacy "checked/pantry" state aligned with the new fridge inventory.
  saveFridge(fridgeItems());

  const aggregateBeforeFridge=aggregateShopping;
  aggregateShopping=function(){
    return aggregateBeforeFridge().filter(it=>!fridgeHas(it.name));
  };

  function recipeUsesIngredient(name){
    const n=normName(name),out=[];
    state.plan.flat().forEach(id=>{
      const r=recipeById(id);if(!r)return;
      if((r.ingredients||[]).some(([x])=>normName(x)===n)){
        const title=recipeText(r).name;if(!out.includes(title))out.push(title);
      }
    });return out;
  }
  renderShopping=function(){
    const items=aggregateShopping(),groups={};
    items.forEach(it=>{
      const cat=categorize(it.name);
      (groups[cat]??=[]).push({...it,key:fridgeKey(it.name)});
    });
    const removed=state.removedShopping?.size?'<div class="removed-shopping-bar"><span>'+state.removedShopping.size+' '+txt('article(s) retiré(s)','removed item(s)')+'</span><button id="restoreShoppingItems" type="button">'+txt('Restaurer','Restore')+'</button></div>':'';
    $('#shoppingList').innerHTML=removed+Object.entries(groups).map(([cat,arr])=>'<div class="shopping-category"><div class="shopping-category-title">'+categoryLabel(cat)+'</div>'+arr.map(it=>{
      const uses=recipeUsesIngredient(it.name),useLine=uses.length?'<small class="shop-recipes">'+txt('Utilisé pour : ','Used for: ')+uses.slice(0,3).join(' · ')+(uses.length>3?' +'+(uses.length-3):'')+'</small>':'';
      return '<div class="shop-row" data-shop-row="'+it.key+'"><input class="shop-check fridge-transfer" type="checkbox" data-shop="'+it.key+'" data-name="'+String(it.name).replace(/"/g,'&quot;')+'"><span class="shop-name"><strong>'+ingredientName(it.name)+'</strong>'+useLine+'<small class="shop-product">'+productSuggestion()+'</small></span><span class="shop-price">'+money(estimateItemPrice(it.name))+'</span><span class="shop-qty">'+simplifyQty(it.name,it.qty)+'</span><button class="shop-remove" type="button" data-remove-shop="'+it.key+'" aria-label="Retirer">×</button></div>';
    }).join('')+'</div>').join('');
    $$('.fridge-transfer').forEach(c=>c.addEventListener('change',()=>{
      if(c.checked){addToFridge(c.dataset.name,'', 'shopping');toast(txt('Ajouté au frigo.','Added to fridge.'))}
    }));
    $$('[data-remove-shop]').forEach(b=>b.addEventListener('click',()=>{
      state.removedShopping.add(b.dataset.removeShop);
      localStorage.setItem('miseRemovedShopping',JSON.stringify([...state.removedShopping]));
      renderShopping();window.KitchenCloud?.saveSoon?.();
    }));
    $('#restoreShoppingItems')?.addEventListener('click',()=>{
      state.removedShopping.clear();localStorage.removeItem('miseRemovedShopping');renderShopping();window.KitchenCloud?.saveSoon?.();
    });
    $('#shoppingCount').textContent=items.length;$('#cartItems').textContent=items.length;$('#pantryCount').textContent=fridgeItems().length;
    updateShoppingMeta();
  };

  function renderFridge(){
    const items=fridgeItems(),box=$('#fridgeList');if(!box)return;
    $('#fridgeCount').textContent=items.length;
    box.innerHTML=items.length?items.map(x=>{
      const key=fridgeKey(x.name),uses=recipeUsesIngredient(x.name);
      return '<label class="fridge-item"><input type="checkbox" checked data-fridge="'+key+'"><span class="fridge-item-main"><strong>'+ingredientName(x.name)+'</strong><small>'+(x.qty||txt('Disponible','Available'))+(uses.length?' · '+txt('prévu pour ','planned for ')+uses.slice(0,2).join(' · '):'')+'</small></span><button type="button" class="fridge-remove" data-fridge-remove="'+key+'">×</button></label>';
    }).join(''):'<div class="fridge-empty"><strong>'+txt('Votre frigo est vide dans Kitchen Studio.','Your Kitchen Studio fridge is empty.')+'</strong><small>'+txt('Cochez vos courses achetées ou ajoutez ce que vous avez déjà.','Check purchased groceries or add what you already have.')+'</small></div>';
    $$('[data-fridge]').forEach(c=>c.addEventListener('change',()=>{if(!c.checked)removeFromFridge(c.dataset.fridge)}));
    $$('[data-fridge-remove]').forEach(b=>b.addEventListener('click',()=>removeFromFridge(b.dataset.fridgeRemove)));
  }
  function renderFridgeCoverage(){
    const box=$('#fridgeCoverage');if(!box)return;
    const covered=state.plan.flat().filter(id=>recipeCovered(recipeById(id))).length;
    box.innerHTML='<div><strong>'+covered+'/21</strong><span>'+txt('repas du menu entièrement couverts par le frigo','menu meals fully covered by your fridge')+'</span></div><div class="fridge-coverage-bar"><span style="width:'+(covered/21*100)+'%"></span></div>';
  }
  $('#fridgeAddForm')?.addEventListener('submit',e=>{
    e.preventDefault();addToFridge($('#fridgeAddName').value,$('#fridgeAddQty').value,'manual');
    e.target.reset();toast(txt('Produit ajouté au frigo.','Item added to fridge.'));
  });

  // Fridge-only planner composition. Never invent availability.
  function fridgeCandidates(slot){
    return RECIPES.filter(r=>r.slot===slot&&eligibleByProfile(r)&&recipeCovered(r));
  }
  function buildFridgePlan(previous=state.plan){
    const plan=[],counts=new Map();
    for(let d=0;d<7;d++){
      const day=[];
      for(let si=0;si<3;si++){
        const slot=['breakfast','lunch','dinner'][si],pool=fridgeCandidates(slot);
        const prev=d?plan[d-1][si]:null,old=previous?.[d]?.[si];
        let choices=pool.filter(r=>r.id!==prev&&(counts.get(r.id)||0)<2&&r.id!==old);
        if(!choices.length)choices=pool.filter(r=>r.id!==prev&&(counts.get(r.id)||0)<3);
        if(!choices.length)choices=pool.filter(r=>r.id!==prev);
        if(!choices.length)choices=pool;
        if(!choices.length){day.push(old||previous?.[d]?.[si]||null);continue}
        choices.sort((a,b)=>scoreRecipe(b)-scoreRecipe(a));
        const pick=choices[0];day.push(pick.id);counts.set(pick.id,(counts.get(pick.id)||0)+1);
      }plan.push(day);
    }return plan;
  }
  function allSlotsCanUseFridge(){
    return ['breakfast','lunch','dinner'].every(slot=>fridgeCandidates(slot).length>0);
  }
  const regen=$('#regenerateSelected');
  if(regen)regen.onclick=()=>{
    if(!fridgeItems().length){toast(txt('Ajoutez d’abord des aliments dans votre frigo.','Add food to your fridge first.'));return}
    if(!allSlotsCanUseFridge()){
      toast(txt('Il manque encore des aliments pour couvrir petit-déjeuner, déjeuner et dîner uniquement avec le frigo.','There is not enough fridge inventory to cover breakfast, lunch and dinner yet.'));
      return;
    }
    const before=JSON.stringify(state.plan),selected=[...state.selected];
    if(!selected.length)state.plan=buildFridgePlan(state.plan);
    else{
      for(const key of selected){
        const [d,si]=key.split('-').map(Number),slot=['breakfast','lunch','dinner'][si];
        const prev=d?state.plan[d-1][si]:null,next=d<6?state.plan[d+1][si]:null,current=state.plan[d][si];
        const pool=fridgeCandidates(slot).filter(r=>r.id!==current&&r.id!==prev&&r.id!==next);
        if(pool[0])state.plan[d][si]=pool.sort((a,b)=>scoreRecipe(b)-scoreRecipe(a))[0].id;
      }
    }
    state.selected.clear();savePlan();renderWeek();renderShopping();renderFridgeCoverage();renderPlannerDrawer();
    toast(before===JSON.stringify(state.plan)?txt('Aucun autre menu compatible avec le frigo pour le moment.','No other fridge-compatible menu is available yet.'):txt('Menu recomposé uniquement avec les aliments du frigo.','Menu recomposed using only fridge ingredients.'));
    window.KitchenCloud?.saveSoon?.();
  };
  const wizardHandler=$('#wizardNext')?.onclick;
  if(wizardHandler)$('#wizardNext').onclick=async function(e){
    const finalStep=typeof wizardStep!=='undefined'&&wizardStep===3;
    await wizardHandler.call(this,e);
    if(finalStep&&fridgeItems().length&&allSlotsCanUseFridge()){
      state.plan=buildFridgePlan(state.plan);savePlan();renderWeek();renderShopping();renderFridgeCoverage();renderPlannerDrawer();window.KitchenCloud?.saveSoon?.();
    }
  };

  // Universal ♥ / + controls for recommendation surfaces.
  function actionButtons(r){
    const fav=state.favorites.has(r.id);
    return '<div class="proposal-actions"><button type="button" class="proposal-heart '+(fav?'active':'')+'" data-proposal-fav="'+r.id+'" aria-label="Favori">'+(fav?'♥':'♡')+'</button><button type="button" class="proposal-plus" data-proposal-add="'+r.id+'" aria-label="Ajouter à la semaine">+</button></div>';
  }
  function bindProposalActions(root=document){
    root.querySelectorAll('[data-proposal-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();favoriteRecipe(b.dataset.proposalFav);renderRecipeIdeas();renderPlannerDrawer();window.KitchenCloud?.saveSoon?.()});
    root.querySelectorAll('[data-proposal-add]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCalendar(recipeById(b.dataset.proposalAdd))});
  }
  renderRecipeIdeas=function(){
    const used=new Set(state.plan.flat()),pool0=RECIPES.filter(r=>!used.has(r.id)&&eligibleByProfile(r)),pool=pool0.length>=8?pool0:RECIPES.filter(eligibleByProfile);
    const picks=Array.from({length:8},(_,i)=>pool[(i+(state.ideaOffset||0))%pool.length]).filter(Boolean),box=$('#recipeIdeasGrid');if(!box)return;
    box.innerHTML=picks.map(r=>{const rt=recipeText(r);return '<article class="idea-card enhanced-proposal" data-idea="'+r.id+'"><div class="idea-photo" style="background-image:url(\''+r.image+'\')">'+actionButtons(r)+'</div><div><span>'+r.time+' min · '+r.protein+'g '+(isEN()?'protein':'prot.')+'</span><h4>'+rt.name+'</h4><small>'+(recipeCovered(r)?txt('✓ Faisable avec le frigo','✓ Fridge-ready'):txt('Ingrédients manquants → + les ajoute aux courses','Missing ingredients → + adds them to shopping'))+'</small></div></article>'}).join('');
    $$('[data-idea]').forEach(c=>c.onclick=e=>{if(e.target.closest('.proposal-actions'))return;openRecipe(recipeById(c.dataset.idea),txt('Idée recette','Recipe idea'))});
    bindProposalActions(box);
  };
  $('.save-heart')?.addEventListener('click',()=>{if(currentRecipe){favoriteRecipe(currentRecipe.id);$('.save-heart').textContent=state.favorites.has(currentRecipe.id)?'♥':'♡';window.KitchenCloud?.saveSoon?.()}});

  let drawerOffset=0;
  function renderPlannerDrawer(){
    const week=$('#drawerWeekMenu'),track=$('#drawerIdeasTrack');if(!week||!track)return;
    week.innerHTML=state.plan.flatMap((day,d)=>day.map((id,si)=>{const r=recipeById(id);if(!r)return'';return '<button type="button" class="drawer-menu-chip '+(recipeCovered(r)?'covered':'missing')+'" data-drawer-recipe="'+id+'"><small>'+currentDays()[d]+' · '+[currentMeals().breakfast,currentMeals().lunch,currentMeals().dinner][si]+'</small><strong>'+recipeText(r).name+'</strong></button>'})).join('');
    $$('[data-drawer-recipe]').forEach(b=>b.onclick=()=>openRecipe(recipeById(b.dataset.drawerRecipe),txt('Menu de la semaine','Weekly menu')));
    const candidates=RECIPES.filter(r=>eligibleByProfile(r)&&!state.plan.flat().includes(r.id));
    const picks=Array.from({length:14},(_,i)=>candidates[(i+drawerOffset)%candidates.length]).filter(Boolean);
    track.innerHTML=picks.map(r=>'<article class="drawer-idea enhanced-proposal" data-drawer-idea="'+r.id+'"><div class="drawer-idea-photo" style="background-image:url(\''+r.image+'\')">'+actionButtons(r)+'</div><small>'+r.time+' min · '+(recipeCovered(r)?txt('frigo OK','fridge OK'):missingIngredients(r).length+' '+txt('manquant(s)','missing'))+'</small><h4>'+recipeText(r).name+'</h4></article>').join('');
    $$('[data-drawer-idea]').forEach(c=>c.onclick=e=>{if(e.target.closest('.proposal-actions'))return;openRecipe(recipeById(c.dataset.drawerIdea),txt('Idée à ajouter','Idea to add'))});
    bindProposalActions(track);
  }
  $('#refreshDrawerIdeas')?.addEventListener('click',()=>{drawerOffset+=7;renderPlannerDrawer()});
  V9.renderPlannerDrawer=renderPlannerDrawer;

  // When calendar "+ Add" changes the plan, the shopping list immediately gains missing ingredients.
  const calendarForm=$('#calendarAddForm');
  if(calendarForm){
    const previousSubmit=calendarForm.onsubmit;
    calendarForm.onsubmit=function(e){
      previousSubmit?.call(this,e);
      setTimeout(()=>{renderShopping();renderFridgeCoverage();renderPlannerDrawer();window.KitchenCloud?.saveSoon?.()},0);
    };
  }

  // ---------- MULTI-DEVICE VAULT ----------
  function loadDevices(){
    let arr=JSON.parse(localStorage.getItem('miseCustomAppliances')||'null');
    if(!Array.isArray(arr)){
      const one=JSON.parse(localStorage.getItem('miseCustomAppliance')||'null');
      arr=one?[one]:[];
      localStorage.setItem('miseCustomAppliances',JSON.stringify(arr));
    }
    return arr;
  }
  function saveDevices(arr){
    localStorage.setItem('miseCustomAppliances',JSON.stringify(arr));
    const active=arr.find(x=>x.id===state.profile.applianceId)||arr[0]||null;
    if(active){state.profile.applianceId=active.id;localStorage.setItem('miseCustomAppliance',JSON.stringify(active))}
    else{delete state.profile.applianceId;localStorage.removeItem('miseCustomAppliance')}
    saveProfileV3();window.KitchenCloud?.saveSoon?.();
  }
  function deviceImage(d){return '/api/appliance-image?brand='+encodeURIComponent(d.brand||'')+'&model='+encodeURIComponent(d.model||'')+'&code='+encodeURIComponent(d.modelCode||'')+'&source='+encodeURIComponent(d.source||'')}
  function setActiveDevice(id){
    const arr=loadDevices(),d=arr.find(x=>x.id===id);if(!d)return;
    state.profile.applianceId=id;localStorage.setItem('miseCustomAppliance',JSON.stringify(d));saveProfileV3();renderDevices();populateApplianceSelect();window.KitchenCloud?.saveSoon?.();
  }
  function addDevice(d){
    const arr=loadDevices(),i=arr.findIndex(x=>x.id===d.id||((x.modelCode||'')&&(x.modelCode===d.modelCode)));
    if(i>=0)arr[i]={...arr[i],...d};else arr.push(d);
    if(!state.profile.applianceId)state.profile.applianceId=d.id;
    saveDevices(arr);renderDevices();populateApplianceSelect();
  }
  function removeDevice(id){
    const arr=loadDevices().filter(x=>x.id!==id);if(state.profile.applianceId===id)state.profile.applianceId=arr[0]?.id;
    saveDevices(arr);renderDevices();populateApplianceSelect();
  }
  async function researchDeviceV9(query){
    // Internal exact cache first.
    const q=normName(query);let best=null;
    for(const a of appliances){
      const code=normName(a.modelCode||''),brand=normName(a.brand||''),model=normName(a.model||'');let score=0;
      if(code&&q.includes(code))score+=30;if(brand&&q.includes(brand))score+=6;
      model.split(' ').filter(x=>x.length>2).forEach(t=>{if(q.includes(t))score+=2});
      if(!best||score>best.score)best={a,score};
    }
    if(best?.score>=10)return {...best.a,confidence:.95,verified:true,sourceUrls:best.a.source?[best.a.source]:[]};
    const r=await fetch('/api/research-appliance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query})}),data=await r.json();
    if(!r.ok)throw new Error(data.error||'research failed');return data.device;
  }
  const researchForm=$('#deviceResearchForm');
  if(researchForm)researchForm.onsubmit=async e=>{
    e.preventDefault();const q=$('#deviceResearchInput').value.trim(),status=$('#deviceResearchStatus'),box=$('#deviceResearchResult'),btn=$('#deviceResearchBtn');if(!q)return;
    status.hidden=false;box.hidden=true;status.innerHTML='<strong>✦ '+txt('Recherche du modèle…','Researching model…')+'</strong><small>'+txt('Identification des modes, températures, accessoires et source.','Identifying modes, temperature ranges, accessories and source.')+'</small>';btn.disabled=true;
    try{
      const d=await researchDeviceV9(q);
      status.hidden=true;box.hidden=false;
      box.innerHTML='<div class="device-result-grid"><div class="device-result-image"><img src="'+deviceImage(d)+'"></div><div class="device-result-info"><span class="confidence-pill '+(d.verified?'verified':'')+'">'+Math.round((d.confidence||0)*100)+'%</span><h3>'+[d.brand,d.model].filter(Boolean).join(' ')+'</h3><p>'+[d.type,d.modelCode,d.tempRangeF?d.tempRangeF.join('–')+'°F':null].filter(Boolean).join(' · ')+'</p><small class="device-evidence">'+(d.evidenceSummary||'')+'</small><div class="device-result-actions"><button class="btn btn-primary" id="saveDeviceV9" type="button">'+txt('Ajouter à mes appareils','Add to my devices')+'</button></div></div></div>';
      $('#saveDeviceV9').onclick=()=>{addDevice(d);box.hidden=true;$('#deviceResearchInput').value='';toast(txt('Appareil ajouté. Vous pouvez maintenant importer son manuel.','Device added. You can now upload its manual.'))};
    }catch{status.innerHTML='<strong>'+txt('Modèle non confirmé','Model not confirmed')+'</strong><small>'+txt('Essayez avec la référence exacte inscrite sur l’appareil.','Try the exact model number printed on the device.')+'</small>'}
    finally{btn.disabled=false}
  };

  // IndexedDB for persistent local manual page thumbnails.
  const DB_NAME='kitchen-studio-manuals',STORE='pages';
  function dbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)){const st=db.createObjectStore(STORE,{keyPath:'id'});st.createIndex('deviceId','deviceId',{unique:false})}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
  async function dbPutPage(page){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(page);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
  async function dbPages(deviceId){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readonly'),idx=tx.objectStore(STORE).index('deviceId'),req=idx.getAll(deviceId);req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error)})}
  async function dbDeleteDevice(deviceId){const pages=await dbPages(deviceId),db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,'readwrite'),st=tx.objectStore(STORE);pages.forEach(p=>st.delete(p.id));tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
  function compressImage(file,max=1200,quality=.72){
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',quality))};img.onerror=reject;img.src=reader.result};reader.onerror=reject;reader.readAsDataURL(file)});
  }
  async function analyzeManual(device,images){
    let knowledge=device.manualKnowledge||null;
    for(let i=0;i<images.length;i+=4){
      const r=await fetch('/api/analyze-manual',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({device,images:images.slice(i,i+4),existingKnowledge:knowledge})}),data=await r.json();
      if(!r.ok)throw new Error(data.error||'manual analysis failed');knowledge=data.knowledge;
    }return knowledge;
  }
  async function uploadManualFiles(deviceId,files){
    const arr=loadDevices(),i=arr.findIndex(x=>x.id===deviceId);if(i<0||!files.length)return;
    const device=arr[i],images=[];
    for(let k=0;k<files.length;k++){
      const file=files[k];if(!file.type.startsWith('image/'))continue;
      const dataUrl=await compressImage(file);images.push(dataUrl);
      await dbPutPage({id:deviceId+':'+Date.now()+':'+k,deviceId,name:file.name,dataUrl,createdAt:new Date().toISOString()});
      window.KitchenCloud?.uploadManualPage?.(deviceId,file).catch(()=>{});
    }
    if(!images.length)return;
    toast(txt('Analyse du manuel en cours…','Analyzing manual…'));
    const knowledge=await analyzeManual(device,images);
    arr[i]={...device,manualKnowledge:knowledge,manualPageCount:(device.manualPageCount||0)+images.length,manualUpdatedAt:new Date().toISOString()};
    saveDevices(arr);renderDevices();toast(txt('Manuel appris et enregistré pour cet appareil.','Manual learned and saved for this device.'));
  }
  async function renderManualPages(deviceId,box){
    if(!box)return;const pages=await dbPages(deviceId);
    box.innerHTML=pages.length?pages.map(p=>'<div class="manual-thumb"><img src="'+p.dataUrl+'" alt="'+p.name+'"><small>'+p.name+'</small></div>').join(''):'<div class="manual-pages-empty">'+txt('Aucune page importée pour le moment.','No manual pages uploaded yet.')+'</div>';
  }
  async function renderDevices(){
    const arr=loadDevices(),box=$('#savedDevicesList');if(!box)return;
    $('#savedDevicesCount').textContent=arr.length+' '+(arr.length>1?txt('appareils','devices'):txt('appareil','device'));
    box.innerHTML=arr.length?arr.map(d=>{
      const active=d.id===state.profile.applianceId,manual=d.manualKnowledge;
      return '<article class="vault-device '+(active?'active':'')+'" data-device-card="'+d.id+'"><div class="vault-device-top"><div class="vault-device-image"><img src="'+deviceImage(d)+'"></div><div class="vault-device-copy"><div class="eyebrow">'+(active?txt('Appareil actif','Active device'):d.type||txt('Appareil','Device'))+'</div><h4>'+[d.brand,d.model].filter(Boolean).join(' ')+'</h4><p>'+[d.modelCode,d.tempRangeF?d.tempRangeF.join('–')+'°F':null].filter(Boolean).join(' · ')+'</p><div class="mode-pills">'+(d.modes||[]).slice(0,7).map(m=>'<span>'+m.name+'</span>').join('')+'</div></div><div class="vault-device-actions"><button class="btn btn-outline btn-small" data-device-active="'+d.id+'">'+(active?'✓ '+txt('Actif','Active'):txt('Utiliser','Use'))+'</button><button class="text-btn danger" data-device-delete="'+d.id+'">'+txt('Retirer','Remove')+'</button></div></div><div class="manual-memory"><div class="manual-memory-head"><div><strong>'+txt('Pages de mon manuel','My manual pages')+'</strong><small>'+((d.manualPageCount||0)+' '+txt('page(s) analysée(s)','page(s) analyzed'))+(manual?' · '+txt('mémoire IA active','AI memory active'):'')+'</small></div><label class="btn btn-cream btn-small">+ '+txt('Ajouter des photos','Add photos')+'<input type="file" accept="image/*" multiple data-manual-upload="'+d.id+'" hidden></label></div><div class="manual-knowledge-summary">'+(manual?'<span>✓ '+txt('L’IA utilisera ce manuel en priorité pour adapter les recettes.','AI will prioritize this manual when adapting recipes.')+'</span>':'<span>'+txt('Photographiez les pages avec tableaux de cuisson, modes, températures et accessoires.','Photograph pages with cooking charts, modes, temperatures and accessories.')+'</span>')+'</div><div class="manual-thumbs" data-manual-pages="'+d.id+'"></div></div></article>';
    }).join(''):'<div class="device-vault-empty">'+txt('Aucun appareil enregistré. Utilisez la recherche ci-dessus pour ajouter le premier.','No saved devices. Use the search above to add your first one.')+'</div>';
    $$('[data-device-active]').forEach(b=>b.onclick=()=>setActiveDevice(b.dataset.deviceActive));
    $$('[data-device-delete]').forEach(b=>b.onclick=async()=>{await dbDeleteDevice(b.dataset.deviceDelete);removeDevice(b.dataset.deviceDelete)});
    $$('[data-manual-upload]').forEach(inp=>inp.onchange=async()=>{try{await uploadManualFiles(inp.dataset.manualUpload,[...inp.files])}catch{toast(txt('Certaines pages du manuel n’ont pas pu être analysées.','Some manual pages could not be analyzed.'))}});
    $$('[data-manual-pages]').forEach(el=>renderManualPages(el.dataset.manualPages,el));
    const summary=$('#profileDeviceSummary');if(summary)summary.innerHTML=arr.length?'<strong>'+arr.length+' '+txt('appareil(s) enregistré(s)','saved device(s)')+'</strong><small>'+txt('Actif : ','Active: ')+(arr.find(x=>x.id===state.profile.applianceId)?.brand||'—')+' '+(arr.find(x=>x.id===state.profile.applianceId)?.model||'')+'</small>':'<strong>'+txt('Aucun appareil enregistré','No saved device')+'</strong><small>'+txt('Ajoutez vos modèles dans “Mes appareils”.','Add models in “My devices”.')+'</small>';
    $('#accountAppliance') && ($('#accountAppliance').textContent=arr.length);
  }
  populateApplianceSelect=function(){
    const sel=$('#detailApplianceSelect');if(!sel)return;const arr=loadDevices();
    sel.innerHTML='<option value="default">'+UI[state.profile.language].classic+'</option>'+arr.map(d=>'<option value="'+d.id+'">'+d.brand+' '+d.model+'</option>').join('');
    if(state.profile.applianceId&&arr.some(d=>d.id===state.profile.applianceId))sel.value=state.profile.applianceId;
    sel.onchange=()=>{if(sel.value!=='default')setActiveDevice(sel.value)};
  };
  V9.renderDevices=renderDevices;

  // Migration from V8 single device and hide the now-obsolete single-device card.
  const legacy=JSON.parse(localStorage.getItem('miseCustomAppliance')||'null'),arr0=loadDevices();
  if(legacy&&!arr0.some(x=>x.id===legacy.id)){arr0.push(legacy);saveDevices(arr0)}
  if($('#savedDeviceCard'))$('#savedDeviceCard').style.display='none';

  // Wrap persistence hooks for cloud syncing.
  const oldSavePlan=savePlan;savePlan=function(){oldSavePlan();window.KitchenCloud?.saveSoon?.()};
  const oldSaveProfile=saveProfileV3;saveProfileV3=function(){oldSaveProfile();window.KitchenCloud?.saveSoon?.()};
  const oldFavorite=favoriteRecipe;favoriteRecipe=function(id){oldFavorite(id);window.KitchenCloud?.saveSoon?.()};

  renderFridge();renderShopping();renderFridgeCoverage();renderRecipeIdeas();renderPlannerDrawer();renderDevices();populateApplianceSelect();
  window.KitchenStudioV9=V9;
})();
