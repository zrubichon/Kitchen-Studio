// Mise V13 — always-visible planner ideas, resilient buyable list, richer cooking steps
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const tr=(fr,en)=>state.profile.language==='en'?en:fr;

  // ---------- richer cooking instructions ----------
  function ingredientNames(r){return (r?.ingredients||[]).map(x=>String(x[0]||'')).filter(Boolean)}
  function hasAny(names,patterns){const s=names.join(' ').toLowerCase();return patterns.some(p=>s.includes(p))}
  function detailedSteps(r){
    if(!r)return [];
    const existing=(r.steps||[]).map(x=>String(x).trim()).filter(Boolean);
    const names=ingredientNames(r);
    const method=String(r.methods?.default?.[0]||'').toLowerCase();
    const time=String(r.methods?.default?.[1]||r.time+' min');
    const noCook=method.includes('sans cuisson')||(r.tags||[]).includes('no-cook');
    const microwave=method.includes('micro-ondes')||(r.tags||[]).includes('microwave');
    const poultry=hasAny(names,['poulet','dinde','chicken','turkey']);
    const fish=hasAny(names,['saumon','thon','poisson','salmon','tuna','fish']);
    const canned=names.filter(n=>/conserve|pois chiches|haricots|thon|maïs/i.test(n));
    const veg=names.filter(n=>/tomate|concombre|courgette|poivron|carotte|brocoli|épinard|salade|avocat|pomme|banane|fruit|oignon|citron/i.test(n));

    const out=[];
    out.push(tr(
      'Mise en place — lisez la recette en entier, sortez tous les ingrédients et préparez les quantités indiquées avant de commencer.',
      'Mise en place — read the full recipe, take out every ingredient, and measure the listed amounts before starting.'
    ));
    if(canned.length) out.push(tr(
      'Égouttez et rincez les ingrédients en conserve quand c’est adapté ('+canned.slice(0,3).join(', ')+'). Laissez-les bien s’égoutter pour éviter de détremper le plat.',
      'Drain and rinse canned ingredients when appropriate ('+canned.slice(0,3).join(', ')+'). Let them drain well so the dish does not become watery.'
    ));
    if(veg.length) out.push(tr(
      'Préparez les fruits et légumes : rincez-les, séchez-les puis coupez-les de façon régulière afin qu’ils cuisent ou se mélangent uniformément.',
      'Prepare produce: rinse, dry, then cut into even pieces so it cooks or mixes evenly.'
    ));

    if(noCook){
      out.push(tr('Préparez séparément la sauce ou l’assaisonnement afin de pouvoir ajuster le sel, l’acidité et la texture avant l’assemblage.','Prepare the dressing or seasoning separately so you can adjust salt, acidity, and texture before assembling.'));
      existing.forEach(s=>out.push(s));
      out.push(tr('Assemblez juste avant de servir : commencez par la base, ajoutez la protéine et les légumes, puis terminez par la sauce et les garnitures.','Assemble just before serving: start with the base, add protein and vegetables, then finish with dressing and toppings.'));
      out.push(tr('Goûtez et ajustez l’assaisonnement. Servez immédiatement ou gardez la sauce séparée si le repas est préparé à l’avance.','Taste and adjust seasoning. Serve immediately, or keep dressing separate if meal-prepping.'));
    }else if(microwave){
      out.push(tr('Utilisez un récipient assez grand et compatible micro-ondes. Couvrez légèrement sans fermer hermétiquement pour laisser la vapeur s’échapper.','Use a large microwave-safe container. Cover loosely, never airtight, so steam can escape.'));
      existing.forEach(s=>out.push(s));
      out.push(tr('Remuez ou retournez à mi-cuisson lorsque c’est possible, puis poursuivez par intervalles courts pour éviter de trop cuire.','Stir or turn halfway through when possible, then continue in short intervals to avoid overcooking.'));
      if(poultry) out.push(tr('Si vous réchauffez du poulet déjà cuit, chauffez-le jusqu’à ce qu’il soit bien chaud à cœur.','If reheating cooked chicken, heat until steaming hot throughout.'));
      out.push(tr('Laissez reposer 1 minute après cuisson : la chaleur continue de se répartir et la vapeur peut être très chaude.','Let the food stand for 1 minute after cooking: heat continues to distribute and steam can be very hot.'));
    }else{
      out.push(tr('Préparez la zone de cuisson et préchauffez l’appareil si la recette ou votre appareil le demande. Gardez les ingrédients déjà coupés à portée de main.','Set up the cooking area and preheat the appliance if the recipe or your device requires it. Keep prepared ingredients within reach.'));
      existing.forEach(s=>out.push(s));
      out.push(tr('Respectez le mode et la durée indiqués ('+time+'), mais commencez à vérifier quelques minutes avant la fin car les appareils varient.','Follow the listed method and time ('+time+'), but start checking a few minutes early because appliances vary.'));
      if(poultry) out.push(tr('Pour la volaille crue, vérifiez que le centre atteint 74 °C / 165 °F avant de servir. Laissez reposer quelques minutes avant de couper.','For raw poultry, verify the center reaches 74°C / 165°F before serving. Let it rest a few minutes before cutting.'));
      else if(fish) out.push(tr('Pour le poisson, arrêtez la cuisson dès que la chair devient opaque et se détache facilement, afin d’éviter de le dessécher.','For fish, stop cooking once the flesh turns opaque and flakes easily to avoid drying it out.'));
      out.push(tr('Assemblez le plat dans l’ordre prévu, ajoutez les sauces et garnitures à la fin, puis goûtez avant de rectifier l’assaisonnement.','Assemble the dish in the intended order, add sauces and toppings at the end, then taste before adjusting seasoning.'));
    }

    // Deduplicate and cap so every recipe stays readable.
    const seen=new Set();
    return out.filter(s=>{const k=s.toLowerCase().replace(/\s+/g,' ').trim();if(!k||seen.has(k))return false;seen.add(k);return true}).slice(0,9);
  }

  RECIPES.forEach(r=>{r.steps=detailedSteps(r)});

  const prevOpenRecipe=openRecipe;
  openRecipe=function(r,slot){
    if(r)r.steps=detailedSteps(r);
    prevOpenRecipe(r,slot);
    const list=$('#detailSteps');
    if(list&&r){
      list.innerHTML=r.steps.map((s,i)=>'<li><strong class="step-number-title">'+tr('Étape ','Step ')+(i+1)+'</strong><span>'+s+'</span></li>').join('');
    }
  };

  // ---------- robust purchasable list ----------
  function buyItems(){
    try{return aggregateShopping().filter(x=>x?.name)}catch{return []}
  }
  function itemSearchUrl(name){
    return 'https://www.instacart.com/store/s?k='+encodeURIComponent(name);
  }
  function renderBuyModal(items){
    $('#buyListStore').textContent=tr('Magasin : ','Store: ')+(state.profile.store||tr('votre magasin','your store'));
    $('#buyListCount').textContent=items.length+' '+tr('produit'+(items.length>1?'s':''),'item'+(items.length>1?'s':''));
    $('#buyListItems').innerHTML=items.map(it=>{
      const qty=Array.isArray(it.qty)?it.qty.filter(Boolean).join(' + '):(it.qty||'');
      return '<div class="buy-list-row"><div><strong>'+it.name+'</strong><small>'+qty+'</small></div><a target="_blank" rel="noopener" href="'+itemSearchUrl(it.name)+'">'+tr('Chercher','Find')+' ↗</a></div>';
    }).join('');
  }
  async function openBuyableList(){
    const items=buyItems();
    if(!items.length){toast(tr('Votre liste de courses est vide pour le moment.','Your grocery list is empty right now.'));return}
    renderBuyModal(items);
    const dlg=$('#shoppingBuyModal');openModal(dlg);
    const status=$('#buyListStatus'),direct=$('#openInstacartList');
    direct.hidden=true;status.textContent=tr('Préparation de la liste achetable…','Preparing your buyable list…');

    try{
      const line_items=items.map(x=>({name:x.name,line_item_measurements:[{quantity:1,unit:'each'}]}));
      const res=await fetch('/api/instacart-shopping-list',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:'Mise — Courses de la semaine',line_items})});
      const data=await res.json().catch(()=>({}));
      if(res.ok&&data.products_link_url){
        direct.href=data.products_link_url;direct.hidden=false;
        status.textContent=tr('Votre liste Instacart est prête. Vous pouvez aussi rechercher chaque produit individuellement ci-dessus.','Your Instacart list is ready. You can also search each item individually above.');
      }else{
        status.textContent=tr('La connexion Instacart directe n’est pas encore active. La liste reste utilisable : ouvrez chaque produit avec “Chercher” ou copiez toute la liste.','Direct Instacart connection is not active yet. The list still works: open each product with “Find” or copy the full list.');
      }
    }catch{
      status.textContent=tr('La connexion magasin n’est pas disponible pour le moment. La liste reste utilisable ci-dessus.','Store connection is unavailable right now. The list above is still usable.');
    }
  }

  ['#shopRealProducts','#shopRealProducts2'].forEach(sel=>{
    const b=$(sel);if(b)b.onclick=e=>{e.preventDefault();openBuyableList()};
  });

  $('#copyBuyList')?.addEventListener('click',async()=>{
    const text=buyItems().map(x=>'- '+x.name+(Array.isArray(x.qty)&&x.qty.length?' — '+x.qty.join(' + '):'')).join('\n');
    try{await navigator.clipboard.writeText(text);toast(tr('Liste copiée.','List copied.'))}
    catch{toast(tr('Impossible de copier automatiquement.','Could not copy automatically.'))}
  });

  // Keep the planner inspiration area permanently open and non-interactive.
  const drawer=$('#plannerMenuDrawer');
  if(drawer?.tagName==='DETAILS'){drawer.open=true;drawer.querySelector('summary')?.addEventListener('click',e=>e.preventDefault())}
})();