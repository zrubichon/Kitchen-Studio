// Mise V11 — flexible planner, empty slots, direct recipe insertion, smart recomposition
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const FAST_ID='fasting-slot';
  const slots=['breakfast','lunch','dinner'];
  const tr=(fr,en)=>state.profile.language==='en'?en:fr;
  let moveSource=null;
  let pendingSlot=null;

  function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/\b(cuit|cuite|cuits|cuites|frais|fraiche|fraîche|fraiches|fraîches|complet|complete|complète|cerises?|sec|seche|sèche)\b/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim().replace(/s$/,'')}
  function fridgeItems(){return window.KitchenStudioV9?.fridgeItems?.()||[]}
  function hasFridge(){return fridgeItems().length>0}
  function fridgeSet(){return new Set(fridgeItems().map(x=>norm(x.name)))}
  function recipeFitsFridge(r){
    if(!r||r.id===FAST_ID)return false;
    const set=fridgeSet();
    return (r.ingredients||[]).every(([name])=>set.has(norm(name)) || /^(salt|pepper|oil|olive oil|water|sel|poivre|huile|eau)$/i.test(String(name)));
  }

  function removeShoppingItemByKey(key){
    if(!key)return;
    if(!(state.removedShopping instanceof Set))state.removedShopping=new Set(state.removedShopping||[]);
    state.removedShopping.add(key);
    localStorage.setItem('miseRemovedShopping',JSON.stringify([...state.removedShopping]));
    try{renderShopping()}catch{}
    window.KitchenCloud?.saveSoon?.();
    toast(tr('Produit retiré de la liste de courses.','Item removed from grocery list.'));
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('[data-remove-shop]');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    removeShoppingItemByKey(btn.dataset.removeShop);
  },true);

  // Null/empty slots must never break the grocery list.
  aggregateShopping=function(){
    const map=new Map(),fridge=fridgeSet(),removed=state.removedShopping||new Set();
    state.plan.flat().forEach(id=>{
      if(!id||id===FAST_ID)return;
      const r=recipeById(id);if(!r)return;
      (r.ingredients||[]).forEach(([name,qty])=>{
        const n=norm(name),key=n.replace(/\s/g,'-');
        if(fridge.has(n)||removed.has(key))return;
        if(!map.has(n))map.set(n,{name,qty:[]});
        map.get(n).qty.push(qty);
      });
    });
    return [...map.values()];
  };

  // Keep the synthetic fasting item out of inspiration pages.
  if(typeof eligibleByProfile==='function'){
    const prevEligible=eligibleByProfile;
    eligibleByProfile=function(r){return !!r&&r.id!==FAST_ID&&prevEligible(r)};
  }

  function persist(){
    localStorage.setItem('misePlan',JSON.stringify(state.plan));
    window.KitchenCloud?.saveSoon?.();
  }
  function swapSlots(a,b){
    if(!a||!b)return;
    const tmp=state.plan[a.d][a.si];
    state.plan[a.d][a.si]=state.plan[b.d][b.si];
    state.plan[b.d][b.si]=tmp;
    moveSource=null;persist();renderWeek();
    toast(tr('Repas déplacé.','Meal moved.'));
  }
  function deleteSlot(d,si){
    state.plan[d][si]=null;state.selected?.delete?.(d+'-'+si);persist();renderWeek();
    toast(tr('Case libérée. Cliquez sur + pour choisir un autre plat.','Slot cleared. Tap + to choose another meal.'));
  }

  function slotLabel(si){
    const m=currentMeals();return [m.breakfast,m.lunch,m.dinner][si];
  }
  function openRecipePicker(d,si){
    pendingSlot={d,si};
    moveSource=null;
    navigate('recipes');
    window.__recipeFilter='all';window.__recipeCategory='all';
    try{renderRecipes('all')}catch{}
    renderPickerBanner();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function renderPickerBanner(){
    let banner=$('#slotPickBanner');
    const page=$('#page-recipes');if(!page)return;
    if(!pendingSlot){banner?.remove();return}
    if(!banner){
      banner=document.createElement('div');banner.id='slotPickBanner';banner.className='slot-pick-banner';
      const head=page.querySelector('.page-head');head?.insertAdjacentElement('afterend',banner);
    }
    banner.innerHTML='<div><span class="eyebrow">'+tr('Choisir pour le calendrier','Choose for calendar')+'</span><strong>'+currentDays()[pendingSlot.d]+' · '+slotLabel(pendingSlot.si)+'</strong><small>'+tr('Cliquez sur + sur une inspiration, un favori ou une recette : elle sera placée directement dans cette case.','Tap + on any inspiration, favorite or recipe: it will go straight into this slot.')+'</small></div><button type="button" class="btn btn-outline btn-small" id="cancelSlotPick">'+tr('Annuler','Cancel')+'</button>';
    $('#cancelSlotPick').onclick=()=>{pendingSlot=null;banner.remove();navigate('planner')};
  }
  function assignPending(recipeId){
    if(!pendingSlot||!recipeId)return false;
    const r=recipeById(recipeId);if(!r||r.id===FAST_ID)return false;
    state.plan[pendingSlot.d][pendingSlot.si]=r.id;
    pendingSlot=null;persist();renderPickerBanner();navigate('planner');renderWeek();
    toast(tr('Plat ajouté au calendrier.','Meal added to calendar.'));
    return true;
  }

  document.addEventListener('click',e=>{
    if(!pendingSlot)return;
    const plus=e.target.closest('[data-add-week],[data-proposal-add]');
    if(plus){
      const id=plus.dataset.addWeek||plus.dataset.proposalAdd;
      if(assignPending(id)){e.preventDefault();e.stopImmediatePropagation()}
      return;
    }
    if(e.target.closest('#detailAddWeekBtn')&&typeof currentRecipe!=='undefined'&&currentRecipe){
      if(assignPending(currentRecipe.id)){e.preventDefault();e.stopImmediatePropagation()}
    }
  },true);

  renderWeek=function(){
    const grid=$('#weekGrid');if(!grid)return;grid.innerHTML='';
    const days=currentDays(),labels=currentMeals();
    state.plan.forEach((meals,d)=>{
      const col=document.createElement('div');col.className='day-col';const date=dateForDay(d);
      col.innerHTML='<div class="day-head '+(date.getDate()===23&&state.weekOffset===0?'today':'')+'"><strong>'+days[d]+'</strong><small>'+fmtDate(date)+'</small></div>';
      meals.forEach((id,si)=>{
        const slot=slots[si],key=d+'-'+si;
        if(id===FAST_ID){
          const card=document.createElement('article');card.className='meal-card fasting planner-slot';card.dataset.day=d;card.dataset.slot=si;
          card.innerHTML='<div class="meal-slot">'+labels[slot]+'</div><h4>'+tr('Jeûne','Fasting')+'</h4><span class="fasting-chip">'+(state.profile.fastingMode||'')+'</span><div class="fast-window">'+tr('Fenêtre repas ','Eating window ')+(state.profile.fastingStart||'')+'–'+(state.profile.fastingEnd||'')+'</div>';
          col.appendChild(card);return;
        }
        if(!id||!recipeById(id)){
          const card=document.createElement('article');card.className='meal-card empty-slot planner-slot'+(moveSource?' move-target':'');card.dataset.day=d;card.dataset.slot=si;
          card.innerHTML='<div class="meal-slot">'+labels[slot]+'</div><button type="button" class="empty-slot-plus" aria-label="'+tr('Ajouter un plat','Add a meal')+'">+</button><small>'+tr('Choisir un plat','Choose a meal')+'</small>';
          card.addEventListener('click',e=>{
            if(moveSource){swapSlots(moveSource,{d,si});return}
            if(e.target.closest('.empty-slot-plus')||e.currentTarget===e.target)openRecipePicker(d,si);
          });
          card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drop-ready')});
          card.addEventListener('dragleave',()=>card.classList.remove('drop-ready'));
          card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drop-ready');const raw=e.dataTransfer.getData('text/plain');if(raw){const [sd,ss]=raw.split(',').map(Number);swapSlots({d:sd,si:ss},{d,si})}});
          col.appendChild(card);return;
        }
        const r=recipeById(id),rt=recipeText(r),card=document.createElement('article');
        card.className='meal-card planner-slot '+(slot==='dinner'?'dinner ':'')+(state.selected.has(key)?'selected ':'')+(moveSource&&moveSource.d===d&&moveSource.si===si?'move-source ':'')+(moveSource?'move-target':'');
        card.dataset.day=d;card.dataset.slot=si;card.dataset.key=key;card.dataset.id=id;card.draggable=true;
        card.innerHTML='<div class="calendar-card-actions"><button type="button" data-move-slot title="'+tr('Déplacer','Move')+'">↔</button><button type="button" data-delete-slot title="'+tr('Supprimer','Delete')+'">×</button></div><span class="selected-dot"></span><div class="meal-slot">'+labels[slot]+'</div><h4>'+rt.name+'</h4><div class="meal-foot"><span>'+r.time+' min · '+r.protein+'g '+(isEN()?'protein':'prot.')+'</span><span class="kcal">'+r.kcal+' kcal</span></div>';
        card.querySelector('[data-delete-slot]').onclick=e=>{e.stopPropagation();deleteSlot(d,si)};
        card.querySelector('[data-move-slot]').onclick=e=>{e.stopPropagation();moveSource={d,si};renderWeek();toast(tr('Touchez maintenant la case de destination.','Now tap the destination slot.'))};
        card.addEventListener('click',e=>{
          if(e.target.closest('.calendar-card-actions'))return;
          if(moveSource){if(moveSource.d===d&&moveSource.si===si){moveSource=null;renderWeek()}else swapSlots(moveSource,{d,si});return}
          if(e.shiftKey){toggleSelect(key);return}
          openRecipe(r,days[d]+' '+date.getDate()+' · '+labels[slot]);
        });
        card.addEventListener('contextmenu',e=>{e.preventDefault();toggleSelect(key)});
        card.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',d+','+si);card.classList.add('dragging')});
        card.addEventListener('dragend',()=>card.classList.remove('dragging'));
        card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drop-ready')});
        card.addEventListener('dragleave',()=>card.classList.remove('drop-ready'));
        card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drop-ready');const raw=e.dataTransfer.getData('text/plain');if(raw){const [sd,ss]=raw.split(',').map(Number);if(sd!==d||ss!==si)swapSlots({d:sd,si:ss},{d,si})}});
        col.appendChild(card);
      });
      grid.appendChild(col);
    });
    updateWeekHeader();
    try{renderShopping()}catch{}
    try{renderRecipeIdeas()}catch{}
    window.KitchenStudioV9?.renderFridgeCoverage?.();
    window.KitchenStudioV9?.renderPlannerDrawer?.();
  };

  function candidatesForSlot(si,strictFridge){
    const slot=slots[si];
    return RECIPES.filter(r=>r.id!==FAST_ID&&r.slot===slot&&eligibleByProfile(r)&&(!strictFridge||recipeFitsFridge(r)));
  }
  function localPick(si,current,strictFridge,d){
    let pool=candidatesForSlot(si,strictFridge);
    const prev=d>0?state.plan[d-1]?.[si]:null;
    pool=pool.filter(r=>r.id!==current&&r.id!==prev);
    if(!pool.length)pool=candidatesForSlot(si,strictFridge);
    if(!pool.length)return strictFridge?null:current;
    pool.sort((a,b)=>{
      let sa=Math.random(),sb=Math.random();
      if(state.profile.proteinPriority==='high'||state.profile.proteinPriority==='very-high'){sa+=(a.protein||0)/100;sb+=(b.protein||0)/100}
      return sb-sa;
    });
    return pool[0].id;
  }

  async function generalRecompose(targetKeys){
    const before=JSON.parse(JSON.stringify(state.plan));let generated=null;
    try{
      const r=await window.KitchenCloud.request('/api/generate-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        profile:state.profile,
        brief:{prompt:state.profile.adaptiveRequest||'',avoidPlan:before},
        fridgeInventory:[]
      })});
      if(r.ok){const d=await r.json();if(Array.isArray(d.plan)&&d.plan.length===7)generated=d.plan}
    }catch{}
    for(const key of targetKeys){
      const [d,si]=key.split('-').map(Number);
      if(state.plan[d][si]===FAST_ID)continue;
      const candidate=generated?.[d]?.[si],candidateRecipe=candidate?recipeById(candidate):null;
      state.plan[d][si]=(candidateRecipe&&candidate!==FAST_ID&&candidateRecipe.slot===slots[si])?candidate:localPick(si,state.plan[d][si],false,d);
    }
    window.MiseWellness?.applyFasting?.();persist();renderWeek();
  }
  function fridgeRecompose(targetKeys){
    let empty=0;
    for(const key of targetKeys){
      const [d,si]=key.split('-').map(Number);
      if(state.plan[d][si]===FAST_ID)continue;
      const pick=localPick(si,state.plan[d][si],true,d);
      state.plan[d][si]=pick||null;if(!pick)empty++;
    }
    window.MiseWellness?.applyFasting?.();persist();renderWeek();
    toast(empty?tr('Menu recomposé avec le frigo. Certaines cases restent vides faute d’ingrédients compatibles.','Menu rebuilt from your fridge. Some slots stay empty because there are not enough compatible ingredients.'):tr('Menu recomposé uniquement avec ce qu’il y a dans votre frigo.','Menu rebuilt only from what is in your fridge.'));
  }

  if(window.KitchenStudioV9){
    window.KitchenStudioV9.renderFridgeCoverage=function(){
      const box=$('#fridgeCoverage');if(!box)return;
      const meals=state.plan.flat().filter(id=>id&&id!==FAST_ID);
      const covered=meals.filter(id=>window.KitchenStudioV9.recipeCovered?.(recipeById(id))).length,total=meals.length;
      box.innerHTML='<div><strong>'+covered+'/'+total+'</strong><span>'+tr('repas prévus entièrement couverts par le frigo','planned meals fully covered by your fridge')+'</span></div><div class="fridge-coverage-bar"><span style="width:'+(total?covered/total*100:0)+'%"></span></div>';
    };
  }

  const regen=$('#regenerateSelected');
  if(regen)regen.onclick=async()=>{
    const selected=[...(state.selected||[])],targets=selected.length?selected:state.plan.flatMap((_,d)=>[0,1,2].map(si=>d+'-'+si)).filter(key=>{const [d,si]=key.split('-').map(Number);return state.plan[d][si]!==FAST_ID});
    if(!targets.length){toast(tr('Aucun repas à recomposer.','No meals to regenerate.'));return}
    regen.disabled=true;const old=regen.textContent;regen.textContent=tr('✦ Recomposition…','✦ Regenerating…');
    try{
      if(hasFridge())fridgeRecompose(targets);
      else{await generalRecompose(targets);toast(window.MiseAccess?.aiStatus?.state==='blocked'?tr('Semaine recomposée en mode local · IA indisponible.','Week regenerated locally · AI unavailable.'):tr('Semaine recomposée. La liste de courses contient tout ce qu’il faut acheter.','Week regenerated. Your grocery list now contains what you need to buy.'))}
      state.selected?.clear?.();
    }finally{regen.disabled=false;regen.textContent=old}
  };

  renderWeek();
  window.MisePlannerV11={openRecipePicker,assignPending,deleteSlot,swapSlots};
})();