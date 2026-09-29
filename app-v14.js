// Mise V14 — verified recipe imagery, 60 student-budget recipes, precise appliance-aware cooking
// AI Gateway env refresh 2026-09-29
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const tr=(fr,en)=>state.profile.language==='en'?en:fr;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const moneyCost=n=>'≈ '+Number(n).toFixed(2).replace('.',',')+' € / portion';

  // ---------- 60 student-budget recipes ----------
  const budgetRecipes=[];
  const oatFlavors=[
    ['Banane & beurre de cacahuète',[['Banane','½'],['Beurre de cacahuète','1 tbsp']],1.05,8,10],
    ['Pomme & cannelle',[['Pomme','½'],['Cannelle','1 pinch']],0.85,4,4],
    ['Chocolat & banane',[['Banane','½'],['Cacao non sucré','1 tbsp']],0.95,5,5],
    ['Fruits rouges & skyr',[['Fruits rouges surgelés','½ cup'],['Skyr','½ cup']],1.35,12,3],
    ['Poire & cannelle',[['Poire','½'],['Cannelle','1 pinch']],0.90,4,4],
    ['Raisins & noix',[['Raisins secs','1 tbsp'],['Noix','½ oz']],1.20,5,10],
    ['Compote & cannelle',[['Compote sans sucre','½ cup'],['Cannelle','1 pinch']],0.80,3,2],
    ['Carotte cake',[['Carotte râpée','½ cup'],['Cannelle','1 pinch']],0.75,4,3],
    ['Coco & banane',[['Banane','½'],['Noix de coco râpée','1 tbsp']],1.00,4,7],
    ['Vanille & pomme',[['Pomme','½'],['Extrait de vanille','½ tsp']],0.90,4,3]
  ];
  oatFlavors.forEach((f,i)=>budgetRecipes.push({
    id:'student-oats-'+(i+1),name:'Porridge étudiant · '+f[0],slot:'breakfast',time:6,kcal:350+f[3]*4,protein:15+Math.round(f[3]/2),carbs:55,fat:8+Math.round(f[4]/3),
    tags:['student-budget','budget','breakfast','vegetarian','microwave'],estimatedCost:f[2],
    ingredients:[['Flocons d’avoine','½ cup'],['Lait','¾ cup'],...f[1]],
    steps:['Mélangez les flocons et le lait dans un grand bol.','Cuisez au micro-ondes par intervalles et remuez.','Ajoutez la garniture et servez.'],
    methods:{default:['Micro-ondes','3–4 min'],microwave:['Micro-ondes','3–4 min']}
  }));
  const yogurtFlavors=[
    ['Banane & avoine',[['Banane','½'],['Flocons d’avoine','¼ cup']],1.15],
    ['Pomme & cannelle',[['Pomme','½'],['Cannelle','1 pinch']],1.10],
    ['Fruits rouges',[['Fruits rouges surgelés','½ cup'],['Flocons d’avoine','¼ cup']],1.35],
    ['Compote & cacahuète',[['Compote sans sucre','⅓ cup'],['Beurre de cacahuète','1 tbsp']],1.30],
    ['Raisins & noix',[['Raisins secs','1 tbsp'],['Noix','½ oz']],1.45]
  ];
  yogurtFlavors.forEach((f,i)=>budgetRecipes.push({
    id:'student-yogurt-'+(i+1),name:'Bowl yaourt étudiant · '+f[0],slot:'breakfast',time:4,kcal:360+i*8,protein:24,carbs:45,fat:10,
    tags:['student-budget','budget','breakfast','vegetarian','no-cook','high-protein'],estimatedCost:f[2],
    ingredients:[['Yaourt grec ou skyr','1 cup'],...f[1]],steps:['Versez le yaourt dans un bol.','Ajoutez les garnitures.','Mélangez juste avant de manger.'],methods:{default:['Sans cuisson','4 min']}
  }));
  const eggBreakfasts=[
    ['Œufs brouillés & pain',[['Œufs','2'],['Pain complet','2 slices'],['Tomate','½']],1.35],
    ['Omelette épinards',[['Œufs','2'],['Épinards surgelés','½ cup'],['Fromage râpé','1 oz']],1.45],
    ['Wrap œuf & haricots',[['Œufs','2'],['Tortilla','1'],['Haricots noirs en conserve','⅓ cup']],1.55],
    ['Pommes de terre & œufs',[['Œufs','2'],['Pomme de terre','1 medium'],['Oignon','¼']],1.30],
    ['Toast œuf & pois chiches',[['Œufs','2'],['Pain complet','2 slices'],['Pois chiches en conserve','⅓ cup']],1.45]
  ];
  eggBreakfasts.forEach((f,i)=>budgetRecipes.push({
    id:'student-eggs-'+(i+1),name:'Petit-déj étudiant · '+f[0],slot:'breakfast',time:10+i,kcal:390+i*15,protein:23+i,carbs:38,fat:16,
    tags:['student-budget','budget','breakfast','high-protein'],estimatedCost:f[2],ingredients:f[1],
    steps:['Préparez les ingrédients.','Cuisez les œufs sur feu moyen jusqu’à la texture souhaitée.','Ajoutez les accompagnements et servez.'],methods:{default:['Plaques / poêle','8–12 min']}
  }));

  const mealBases=[
    {id:'rice-beans',label:'Riz & haricots',ingredients:[['Riz','¾ cup cooked'],['Haricots rouges en conserve','½ cup']],cost:1.15,kcal:510,protein:20,carbs:86,fat:8,method:'microwave'},
    {id:'pasta-lentils',label:'Pâtes & lentilles',ingredients:[['Pâtes','3 oz dry'],['Lentilles en conserve','½ cup']],cost:1.20,kcal:540,protein:25,carbs:88,fat:8,method:'stovetop'},
    {id:'potato-eggs',label:'Pommes de terre & œufs',ingredients:[['Pomme de terre','1 large'],['Œufs','2']],cost:1.10,kcal:480,protein:22,carbs:58,fat:17,method:'stovetop'},
    {id:'couscous-chickpea',label:'Couscous & pois chiches',ingredients:[['Couscous','¾ cup cooked'],['Pois chiches en conserve','½ cup']],cost:1.10,kcal:500,protein:20,carbs:78,fat:12,method:'microwave'},
    {id:'tuna-rice',label:'Riz & thon',ingredients:[['Riz','¾ cup cooked'],['Thon en conserve','1 can']],cost:1.75,kcal:500,protein:38,carbs:60,fat:10,method:'microwave'},
    {id:'tofu-rice',label:'Riz & tofu',ingredients:[['Riz','¾ cup cooked'],['Tofu','5 oz']],cost:1.65,kcal:520,protein:27,carbs:65,fat:17,method:'stovetop'},
    {id:'bean-wrap',label:'Wrap aux haricots',ingredients:[['Tortilla','1'],['Haricots noirs en conserve','½ cup'],['Fromage râpé','1 oz']],cost:1.45,kcal:490,protein:23,carbs:62,fat:17,method:'microwave'},
    {id:'lentil-soup',label:'Soupe de lentilles',ingredients:[['Lentilles en conserve','¾ cup'],['Bouillon','1 cup'],['Carotte','1']],cost:1.10,kcal:430,protein:24,carbs:62,fat:8,method:'stovetop'},
    {id:'chickpea-pasta',label:'Pâtes aux pois chiches',ingredients:[['Pâtes','3 oz dry'],['Pois chiches en conserve','½ cup']],cost:1.25,kcal:560,protein:22,carbs:90,fat:11,method:'stovetop'},
    {id:'egg-rice',label:'Riz sauté aux œufs',ingredients:[['Riz','¾ cup cooked'],['Œufs','2'],['Légumes surgelés','1 cup']],cost:1.25,kcal:500,protein:22,carbs:68,fat:15,method:'stovetop'}
  ];
  const mealFlavors=[
    {id:'tomato-spinach',label:'tomate & épinards',extra:[['Tomates en conserve','½ cup'],['Épinards surgelés','½ cup']],cost:.35,tags:['vegetarian']},
    {id:'corn-salsa',label:'maïs & salsa',extra:[['Maïs en conserve','⅓ cup'],['Salsa','2 tbsp']],cost:.35,tags:[]},
    {id:'curry-peas',label:'curry & petits pois',extra:[['Petits pois surgelés','½ cup'],['Curry','1 tsp']],cost:.30,tags:[]},
    {id:'lemon-herbs',label:'citron & herbes',extra:[['Citron','½'],['Herbes séchées','1 tsp']],cost:.30,tags:[]}
  ];
  mealBases.forEach((b,bi)=>mealFlavors.forEach((f,fi)=>{
    const microwave=b.method==='microwave',slot=(bi+fi)%2?'dinner':'lunch';
    budgetRecipes.push({
      id:'student-'+b.id+'-'+f.id,name:b.label+' · '+f.label,slot,time:microwave?9:16,kcal:b.kcal+fi*8,protein:b.protein,carbs:b.carbs,fat:b.fat,
      tags:['student-budget','budget','student',...(f.tags||[]),microwave?'microwave':'quick'],estimatedCost:b.cost+f.cost,
      ingredients:[...b.ingredients,...f.extra],
      steps:microwave?['Préparez tous les ingrédients.','Réchauffez la base et les légumes dans un récipient compatible micro-ondes.','Mélangez, assaisonnez et servez.']:['Préparez tous les ingrédients.','Faites chauffer une poêle ou une casserole sur feu moyen.','Cuisez et mélangez les ingrédients jusqu’à ce qu’ils soient bien chauds et tendres.','Assaisonnez puis servez.'],
      methods:microwave?{default:['Micro-ondes','5–8 min'],microwave:['Micro-ondes','5–8 min']}:{default:['Plaques / poêle','12–18 min']}
    });
  }));
  budgetRecipes.forEach(r=>{if(!RECIPES.some(x=>x.id===r.id))RECIPES.push(r)});

  // ---------- verified images for every recipe ----------
  function imageUrl(r){
    const p=new URLSearchParams({
      v:'5',id:r.id||r.name||'recipe',name:r.name||'Recette',
      ingredients:(r.ingredients||[]).slice(0,10).map(x=>x[0]).join('|'),
      tags:(r.tags||[]).slice(0,10).join('|')
    });
    return '/api/recipe-image?'+p.toString();
  }
  RECIPES.forEach(r=>{if(r?.id!=='fasting-slot')r.image=imageUrl(r)});

  const oldRecipeCard=typeof recipeCard==='function'?recipeCard:null;
  recipeCard=function(r){
    const rt=recipeText(r),fav=state.favorites.has(r.id),cost=r.estimatedCost?'<span class="recipe-cost-badge">'+moneyCost(r.estimatedCost)+'</span>':'<span>'+recipeCategory(r)+'</span>';
    return '<article class="recipe-tile rich-recipe" data-recipe="'+r.id+'"><div class="recipe-tile-photo recipe-image-placeholder" data-recipe-image="'+r.id+'" data-image-url="'+r.image+'"><span>'+r.time+' min</span><button class="recipe-fav '+(fav?'active':'')+'" data-fav="'+r.id+'" aria-label="Favori">'+(fav?'♥':'♡')+'</button></div><div class="recipe-tile-body"><div class="eyebrow">'+r.protein+'g '+(isEN()?'protein':'protéines')+' · '+r.kcal+' kcal</div><h3>'+rt.name+'</h3><div class="recipe-meta">'+cost+'<button class="mini-add" data-add-week="'+r.id+'">+ '+(isEN()?'Week':'Semaine')+'</button></div></div></article>';
  };
  let imageObserver=null;
  function hydrateImages(root=document){
    const nodes=[...root.querySelectorAll('[data-recipe-image]:not([data-image-loaded])')];
    if(!('IntersectionObserver'in window)){nodes.forEach(load);return}
    if(!imageObserver)imageObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){load(e.target);imageObserver.unobserve(e.target)}}),{rootMargin:'350px'});
    nodes.forEach(n=>imageObserver.observe(n));
    function load(el){
      el.dataset.imageLoaded='1';
      const u=el.dataset.imageUrl;if(!u)return;
      const img=new Image();
      img.onload=()=>{el.style.backgroundImage='url("'+u.replace(/"/g,'%22')+'")';el.classList.remove('recipe-image-placeholder')};
      img.onerror=()=>{el.classList.add('recipe-image-placeholder')};
      img.src=u;
    }
  }

  const renderRecipesBeforeV14=renderRecipes;
  renderRecipes=function(filter='all'){
    const cat=window.__recipeCategory||'all';
    if(cat==='student-budget'){
      window.__recipeFilter=filter;
      let list=RECIPES.filter(r=>r.id!=='fasting-slot'&&(r.tags||[]).includes('student-budget')&&eligibleByProfile(r));
      if(filter==='favorite')list=list.filter(r=>state.favorites.has(r.id));
      else if(filter==='quick')list=list.filter(r=>r.time<=20);
      else if(filter!=='all')list=list.filter(r=>(r.tags||[]).includes(filter));
      const grid=$('#recipeGrid');if(!grid)return;
      grid.innerHTML=list.map(recipeCard).join('');
      $$('[data-recipe]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-fav],[data-add-week]'))return;openRecipe(recipeById(el.dataset.recipe),tr('Carnet de recettes','Recipe book'))});
      $$('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();favoriteRecipe(b.dataset.fav);renderRecipes(filter)});
      $$('[data-add-week]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCalendar(recipeById(b.dataset.addWeek))});
      hydrateImages(grid);return;
    }
    renderRecipesBeforeV14(filter);setTimeout(()=>hydrateImages($('#recipeGrid')||document),0);
  };

  function proposalControls(r){
    const fav=state.favorites.has(r.id);
    return '<div class="proposal-actions"><button type="button" class="proposal-heart '+(fav?'active':'')+'" data-proposal-fav="'+r.id+'">'+(fav?'♥':'♡')+'</button><button type="button" class="proposal-plus" data-proposal-add="'+r.id+'">+</button></div>';
  }
  function bindProposalV14(root){
    root.querySelectorAll('[data-proposal-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();favoriteRecipe(b.dataset.proposalFav);renderLazyIdeasV14();renderLazyDrawerV14()});
    root.querySelectorAll('[data-proposal-add]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCalendar(recipeById(b.dataset.proposalAdd))});
  }
  function lazyPhoto(r,cls){
    return '<div class="'+cls+' recipe-image-placeholder" data-recipe-image="'+r.id+'" data-image-url="'+r.image+'">'+proposalControls(r)+'</div>';
  }
  function renderLazyIdeasV14(){
    const box=$('#recipeIdeasGrid');if(!box)return;
    const used=new Set(state.plan.flat()),pool=RECIPES.filter(r=>r.id!=='fasting-slot'&&eligibleByProfile(r)&&!used.has(r.id));
    const picks=Array.from({length:8},(_,i)=>pool[(i+(state.ideaOffset||0))%Math.max(1,pool.length)]).filter(Boolean);
    box.innerHTML=picks.map(r=>'<article class="idea-card enhanced-proposal" data-idea="'+r.id+'">'+lazyPhoto(r,'idea-photo')+'<div><span>'+r.time+' min · '+r.protein+'g '+tr('prot.','protein')+'</span><h4>'+recipeText(r).name+'</h4><small>'+((window.KitchenStudioV9?.recipeCovered?.(r))?tr('✓ Faisable avec le frigo','✓ Fridge-ready'):tr('Ingrédients manquants → + les ajoute aux courses','Missing ingredients → + adds them to shopping'))+'</small></div></article>').join('');
    box.querySelectorAll('[data-idea]').forEach(c=>c.onclick=e=>{if(e.target.closest('.proposal-actions'))return;openRecipe(recipeById(c.dataset.idea),tr('Idée recette','Recipe idea'))});
    bindProposalV14(box);hydrateImages(box);
  }
  let drawerOffsetV14=0;
  function renderLazyDrawerV14(){
    const week=$('#drawerWeekMenu'),track=$('#drawerIdeasTrack');if(!week||!track)return;
    week.innerHTML=state.plan.flatMap((day,d)=>day.map((id,si)=>{const r=recipeById(id);if(!r||id==='fasting-slot')return'';return '<button type="button" class="drawer-menu-chip" data-drawer-recipe="'+id+'"><small>'+currentDays()[d]+' · '+[currentMeals().breakfast,currentMeals().lunch,currentMeals().dinner][si]+'</small><strong>'+recipeText(r).name+'</strong></button>'})).join('');
    week.querySelectorAll('[data-drawer-recipe]').forEach(b=>b.onclick=()=>openRecipe(recipeById(b.dataset.drawerRecipe),tr('Menu de la semaine','Weekly menu')));
    const pool=RECIPES.filter(r=>r.id!=='fasting-slot'&&eligibleByProfile(r)&&!state.plan.flat().includes(r.id));
    const picks=Array.from({length:12},(_,i)=>pool[(i+drawerOffsetV14)%Math.max(1,pool.length)]).filter(Boolean);
    track.innerHTML=picks.map(r=>'<article class="drawer-idea enhanced-proposal" data-drawer-idea="'+r.id+'">'+lazyPhoto(r,'drawer-idea-photo')+'<small>'+r.time+' min</small><h4>'+recipeText(r).name+'</h4></article>').join('');
    track.querySelectorAll('[data-drawer-idea]').forEach(c=>c.onclick=e=>{if(e.target.closest('.proposal-actions'))return;openRecipe(recipeById(c.dataset.drawerIdea),tr('Idée à ajouter','Idea to add'))});
    bindProposalV14(track);hydrateImages(track);
  }
  $('#refreshIdeas')?.addEventListener('click',()=>setTimeout(renderLazyIdeasV14,0));
  $('#refreshDrawerIdeas')?.addEventListener('click',()=>{drawerOffsetV14+=6;renderLazyDrawerV14()});
  renderRecipeIdeas=renderLazyIdeasV14;
  if(window.KitchenStudioV9){window.KitchenStudioV9.renderRecipeIdeas=renderLazyIdeasV14;window.KitchenStudioV9.renderPlannerDrawer=renderLazyDrawerV14}
  // ---------- servings / quantities ----------
  const FRACTIONS={'¼':.25,'½':.5,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125};
  function scaleQty(qty,servings){
    qty=String(qty||'');if(servings===1)return qty;
    const mixed=qty.match(/^(\d+)\s*([¼½¾⅓⅔⅛])/);
    if(mixed){const n=Number(mixed[1])+(FRACTIONS[mixed[2]]||0);return fmt(n*servings)+qty.slice(mixed[0].length)}
    const frac=qty.match(/^([¼½¾⅓⅔⅛])/);if(frac)return fmt((FRACTIONS[frac[1]]||0)*servings)+qty.slice(frac[0].length);
    const num=qty.match(/^(\d+(?:\.\d+)?)/);if(num)return fmt(Number(num[1])*servings)+qty.slice(num[0].length);
    return servings+' × '+qty;
  }
  function fmt(n){if(Math.abs(n-Math.round(n))<.02)return String(Math.round(n));return String(Math.round(n*100)/100)}
  function servings(){return clamp(Number(state.profile.servings||1),1,8)}
  function scaledIngredients(r){return (r.ingredients||[]).map(([n,q])=>[n,scaleQty(q,servings())])}

  // ---------- basic kitchen cooking engine ----------
  function methodText(r){return String(r.methods?.default?.[0]||'').toLowerCase()}
  function rawNames(r){return (r.ingredients||[]).map(x=>String(x[0]||'').toLowerCase()).join(' ')}
  function has(r,re){return re.test((r.name+' '+rawNames(r)+' '+(r.tags||[]).join(' ')).toLowerCase())}
  function parsedTime(r){
    const t=String(r.methods?.default?.[1]||'');
    const m=t.match(/(\d+)\s*(?:–|-|à)\s*(\d+)\s*min/i)||t.match(/(\d+)\s*min/i);
    return m?{min:Number(m[1]),max:Number(m[2]||m[1])}:{min:Math.max(3,Number(r.time||10)),max:Math.max(5,Number(r.time||10)+3)};
  }
  function ingredientSentence(r){
    return scaledIngredients(r).slice(0,8).map(([n,q])=>q+' '+n).join(', ');
  }
  function basicsGuide(r,forced='auto'){
    const tags=r.tags||[],mt=methodText(r),raw=rawNames(r),time=parsedTime(r);
    let kind=forced;
    if(kind==='auto'){
      if(tags.includes('no-cook')||/sans cuisson/.test(mt))kind='no-cook';
      else if(tags.includes('microwave')||/micro/.test(mt))kind='microwave';
      else if(/poele|poêle|plaques|casserole/.test(mt)||has(r,/pasta|pâtes|soup|soupe|lentil|lentille|riz sauté|œuf|egg/))kind='stovetop';
      else kind='oven';
    }
    const poultry=/poulet|chicken|dinde|turkey/.test(raw),fish=/saumon|salmon|thon frais|cabillaud|cod|poisson|fish/.test(raw),sweet=/dessert|cake|gâteau|cookie|muffin/.test((r.tags||[]).join(' ')+' '+r.name.toLowerCase());
    const prep='Préparez les quantités pour '+servings()+' portion'+(servings()>1?'s':'')+' : '+ingredientSentence(r)+'.';
    if(kind==='no-cook')return {compatible:true,device:tr('Cuisine basique','Basic kitchen'),mode:tr('Sans cuisson','No-cook'),temp:'—',power:'—',time:time.min+'–'+time.max+' min',container:tr('Bol + planche + couteau','Bowl + board + knife'),placement:tr('Plan de travail','Countertop'),preheat:tr('Non','No'),doneness:tr('Prêt après assemblage','Ready after assembly'),manualBased:false,note:tr('Aucun appareil particulier nécessaire.','No special appliance needed.'),steps:[prep,tr('Rincez/égouttez les ingrédients qui le nécessitent puis séchez les légumes.','Rinse/drain ingredients as needed and dry produce.'),tr('Coupez les ingrédients en morceaux réguliers. Préparez la sauce séparément.','Cut ingredients evenly. Prepare the dressing separately.'),tr('Assemblez la base, la protéine et les légumes. Ajoutez la sauce en dernier.','Assemble the base, protein and vegetables. Add dressing last.'),tr('Goûtez, rectifiez sel/acidité, puis servez.','Taste, adjust salt/acidity, then serve.')]};
    if(kind==='microwave'){
      const safeRaw=/poulet cru|raw chicken|boeuf cru|bœuf cru|porc cru/.test(raw);
      if(safeRaw)return {compatible:false,device:tr('Micro-ondes','Microwave'),mode:tr('Non recommandé pour cette recette','Not recommended for this recipe'),temp:'—',power:'—',time:'—',container:'—',placement:'—',preheat:tr('Non','No'),doneness:'—',manualBased:false,note:tr('Cette recette contient une protéine crue : utilisez plutôt le four ou les plaques.','This recipe contains raw protein: use the oven or stovetop instead.'),steps:[]};
      return {compatible:true,device:tr('Micro-ondes standard','Standard microwave'),mode:tr('Micro-ondes','Microwave'),temp:tr('Pas de °C au micro-ondes','No °C setting'),power:tr('Puissance élevée · env. 800–900 W','High power · about 800–900 W'),time:time.min+'–'+time.max+' min',container:tr('Grand bol/plat compatible micro-ondes, couvert sans fermer hermétiquement','Large microwave-safe bowl/dish, loosely covered'),placement:tr('Au centre du plateau tournant','Center of turntable'),preheat:tr('Non','No'),doneness:tr('Très chaud à cœur; remuer avant de servir','Piping hot throughout; stir before serving'),manualBased:false,note:tr('Cuisez par intervalles courts : la puissance varie selon les micro-ondes.','Cook in short intervals because microwave wattage varies.'),steps:[prep,tr('Placez les ingrédients à cuire dans un grand récipient compatible micro-ondes et couvrez légèrement.','Put ingredients to cook in a large microwave-safe container and cover loosely.'),tr('Chauffez 2 minutes à puissance élevée, remuez, puis poursuivez par intervalles de 30–60 secondes jusqu’à la durée indiquée.','Heat 2 minutes on high, stir, then continue in 30–60 second intervals until the stated time.'),tr('Remuez soigneusement et vérifiez que le centre est bien chaud.','Stir thoroughly and check the center is hot.'),tr('Laissez reposer 1 minute avant d’ajouter les garnitures froides et de servir.','Rest 1 minute before adding cold toppings and serving.')]};
    }
    if(kind==='stovetop'){
      return {compatible:true,device:tr('Plaques + poêle/casserole','Stovetop + pan/pot'),mode:tr('Feu moyen à moyen-vif','Medium to medium-high heat'),temp:tr('Feu moyen; poêle bien chaude','Medium heat; fully heated pan'),power:tr('Plaque 5–7/10 environ','About 5–7/10 burner level'),time:time.min+'–'+time.max+' min',container:/soup|soupe|pasta|pâtes|lentil|lentille/.test(r.name.toLowerCase())?tr('Casserole moyenne','Medium saucepan'):tr('Poêle 24–28 cm','24–28 cm skillet'),placement:tr('Zone de cuisson adaptée à la taille du récipient','Burner matching pan size'),preheat:tr('Oui · 2–3 min à feu moyen','Yes · 2–3 min over medium heat'),doneness:poultry?'74°C / 165°F au centre':fish?tr('Chair opaque et qui se détache facilement','Opaque and flakes easily'):tr('Ingrédients tendres et bien chauds','Ingredients tender and hot'),manualBased:false,note:tr('Baissez le feu si les aliments colorent avant d’être cuits à cœur.','Lower heat if food browns before cooking through.'),steps:[prep,tr('Placez la poêle/casserole sur feu moyen et préchauffez 2–3 minutes. Ajoutez 1 c. à café d’huile seulement si nécessaire.','Heat the pan/pot over medium heat for 2–3 minutes. Add 1 tsp oil only if needed.'),poultry?tr('Ajoutez la volaille en une couche et cuisez en retournant régulièrement jusqu’à 74°C / 165°F à cœur.','Add poultry in one layer and cook, turning regularly, until 74°C / 165°F internally.'):tr('Ajoutez d’abord les ingrédients qui demandent le plus de cuisson; remuez régulièrement.','Add the ingredients needing the longest cooking first; stir regularly.'),tr('Ajoutez ensuite les légumes, féculents déjà cuits et sauce. Mélangez jusqu’à cuisson homogène.','Add vegetables, cooked starches, and sauce. Stir until evenly cooked.'),tr('Goûtez, rectifiez l’assaisonnement, retirez du feu et servez.','Taste, adjust seasoning, remove from heat and serve.')]};
    }
    const tempF=sweet?350:400,tempC=sweet?180:200;
    let ovenTime=time;
    if(poultry)ovenTime={min:18,max:25};else if(fish)ovenTime={min:10,max:15};
    return {compatible:true,device:tr('Four traditionnel','Conventional oven'),mode:tr('Chaleur tournante / Bake','Convection / Bake'),temp:tempF+'°F / '+tempC+'°C',power:'—',time:ovenTime.min+'–'+ovenTime.max+' min',container:sweet?tr('Moule/plat allant au four','Oven-safe baking dish'):tr('Plaque ou plat allant au four, papier cuisson si utile','Sheet pan or oven-safe dish, parchment if useful'),placement:tr('Grille au milieu du four','Middle oven rack'),preheat:tr('Oui · préchauffez complètement 10–15 min','Yes · fully preheat 10–15 min'),doneness:poultry?'74°C / 165°F au centre':fish?tr('Chair opaque et facilement détachable','Opaque and flakes easily'):tr('Doré et chaud à cœur','Golden and hot throughout'),manualBased:false,note:tr('Commencez à vérifier 3–5 minutes avant la fin : les fours varient.','Start checking 3–5 minutes early because ovens vary.'),steps:[prep,'Préchauffez le four à '+tempF+'°F / '+tempC+'°C et placez la grille au milieu.',tr('Préparez et assaisonnez les ingrédients, puis répartissez-les sans trop les entasser dans le récipient indiqué.','Prepare and season ingredients, then spread them without overcrowding in the stated vessel.'),'Enfournez '+ovenTime.min+'–'+ovenTime.max+' minutes.'+(poultry?' Vérifiez 74°C / 165°F au centre.':fish?' Vérifiez que le poisson est opaque et se détache facilement.':''),tr('Retournez/remuez à mi-cuisson si les morceaux sont répartis sur une plaque.','Flip/stir halfway through if pieces are spread on a tray.'),tr('Sortez du four, laissez reposer 2–3 minutes si nécessaire, puis ajoutez sauces et garnitures.','Remove from oven, rest 2–3 minutes if needed, then add sauces and toppings.')]};
  }

  // ---------- custom appliance / manual-first guide ----------
  function loadDevices(){try{const a=JSON.parse(localStorage.getItem('miseCustomAppliances')||'[]');return Array.isArray(a)?a:[]}catch{return []}}
  const guideCache=new Map();
  function deviceKey(d,r){return [d?.id,r?.id,d?.manualUpdatedAt||d?.manualPageCount||0,servings()].join('|')}
  async function customGuide(r,d){
    const key=deviceKey(d,r);if(guideCache.has(key))return guideCache.get(key);
    const promise=(async()=>{
      try{
        const resp=await fetch('/api/adapt-cooking',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({recipe:r,device:d,servings:servings()})});
        const g=await resp.json();if(!resp.ok||!g?.compatible)throw new Error(g?.notes||g?.error||'not compatible');
        return {compatible:true,device:g.device||[d.brand,d.model].filter(Boolean).join(' '),mode:g.mode||'—',temp:g.temperatureF?g.temperatureF+'°F / '+(g.temperatureC??Math.round((g.temperatureF-32)*5/9))+'°C':g.temperatureC?g.temperatureC+'°C':'—',power:g.powerLevel||'—',time:g.timeMinutes?(g.timeMinutes.min+'–'+g.timeMinutes.max+' min'):'—',container:g.container||'—',placement:g.placement||'—',preheat:g.preheat||'—',doneness:g.doneness||g.safety||'—',manualBased:!!g.manualBased,note:[g.notes,g.safety].filter(Boolean).join(' '),steps:[...(g.preparation||[]),...(g.steps||[])]};
      }catch(e){
        const fallback=basicsGuide(r,'auto');fallback.note=tr('L’appareil enregistré n’est pas adapté ou l’adaptation IA n’est pas disponible. Mise utilise donc la méthode basique recommandée. ','Saved appliance is not suitable or AI adaptation is unavailable. Mise is using the recommended basic method instead. ')+(fallback.note||'');return fallback;
      }
    })();
    guideCache.set(key,promise);return promise;
  }
  function activeDeviceFromSelect(){
    const id=$('#detailApplianceSelect')?.value;
    return id&&id!=='basic'?loadDevices().find(x=>x.id===id)||null:null;
  }
  function populateOurDeviceSelect(){
    const sel=$('#detailApplianceSelect');if(!sel)return;
    const devices=loadDevices(),active=state.profile.applianceId;
    sel.innerHTML='<option value="basic">'+tr('Basiques · four / plaques / micro-ondes','Basics · oven / stovetop / microwave')+'</option>'+devices.map(d=>'<option value="'+d.id+'">'+[d.brand,d.model].filter(Boolean).join(' ')+(d.manualKnowledge?' · manuel ✓':'')+'</option>').join('');
    sel.value=devices.some(d=>d.id===active)?active:'basic';
  }
  function applyGuide(g,showPanel=true){
    if(!g)return;
    if(showPanel)$('#cookGuidePanel').hidden=false;
    $('#cookGuideDevice').textContent=g.device||'—';$('#cookGuideMode').textContent=g.mode||'—';$('#cookGuideTemp').textContent=g.temp||'—';$('#cookGuideTime').textContent=g.time||'—';$('#cookGuideContainer').textContent=g.container||'—';$('#cookGuidePreheat').textContent=g.preheat||'—';
    $('#cookGuidePlacement').textContent=g.placement||'—';$('#cookGuidePower').textContent=g.power||'—';$('#cookGuideDoneness').textContent=g.doneness||'—';
    $('#cookCompatibility').textContent=g.compatible?tr('Compatible','Compatible'):tr('Non recommandé','Not recommended');$('#cookCompatibility').classList.toggle('not-compatible',!g.compatible);
    $('#cookGuideNote').innerHTML=(g.manualBased?'<span class="manual-priority-note">'+tr('✓ Réglages basés sur votre manuel','✓ Settings based on your manual')+'</span> ':'')+(g.note||'');
    $('#cookGuideSteps').innerHTML=(g.steps||[]).map((s,i)=>'<li><strong class="step-number-title">'+tr('Étape ','Step ')+(i+1)+'</strong><span>'+s+'</span></li>').join('');
    let ing=$('#cookGuideIngredients');if(!ing){ing=document.createElement('div');ing.id='cookGuideIngredients';ing.className='cook-guide-ingredients';$('#cookGuideNote').insertAdjacentElement('beforebegin',ing)}
    ing.innerHTML='<strong>'+tr('Quantités utilisées','Quantities used')+'</strong>'+scaledIngredients(currentRecipe).map(([n,q])=>'<span>'+q+' '+n+'</span>').join('');
    $('#cookSetting').innerHTML='<span>'+g.mode+(g.manualBased?' · '+tr('manuel vérifié','manual-informed'):'')+'</span><strong>'+[g.temp,g.time].filter(x=>x&&x!=='—').join(' · ')+'</strong>';
    if(showPanel)$('#cookGuidePanel').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function guideFor(method='selected'){
    const r=currentRecipe;if(!r)return null;
    if(method==='oven'||method==='stovetop'||method==='microwave')return basicsGuide(r,method);
    const d=activeDeviceFromSelect();return d?await customGuide(r,d):basicsGuide(r,'auto');
  }
  async function showGuide(method='selected',showPanel=true){
    const btn=$('#startCookingBtn');if(btn&&showPanel){btn.disabled=true;btn.textContent=tr('✦ Adaptation de la cuisson…','✦ Adapting cooking…')}
    const g=await guideFor(method);applyGuide(g,showPanel);
    $$('.cook-method').forEach(b=>b.classList.toggle('active',b.dataset.cookMethod===method));
    if(btn){btn.disabled=false;btn.textContent=tr('👩‍🍳 Cuisiner cette recette','👩‍🍳 Cook this recipe')}
    return g;
  }

  // Remove legacy cooking listeners by cloning controls.
  const startOld=$('#startCookingBtn');if(startOld){const n=startOld.cloneNode(true);startOld.replaceWith(n);n.addEventListener('click',()=>showGuide('selected',true))}
  const switchBox=$('.cook-method-switch');if(switchBox){
    const clone=switchBox.cloneNode(true);switchBox.replaceWith(clone);
    clone.querySelectorAll('.cook-method').forEach(b=>b.addEventListener('click',()=>showGuide(b.dataset.cookMethod,true)));
  }
  const selectOld=$('#detailApplianceSelect');if(selectOld){
    const n=selectOld.cloneNode(false);n.id='detailApplianceSelect';selectOld.replaceWith(n);
    n.addEventListener('change',async()=>{
      const d=activeDeviceFromSelect();if(d){state.profile.applianceId=d.id;localStorage.setItem('miseProfile',JSON.stringify(state.profile));window.KitchenCloud?.saveSoon?.()}
      await showGuide('selected',false);if(!$('#cookGuidePanel').hidden)await showGuide('selected',true);
    });
  }

  const openRecipeBeforeV14=openRecipe;
  openRecipe=function(r,slot){
    openRecipeBeforeV14(r,slot);
    populateOurDeviceSelect();
    const s=servings();$('#detailServingsLabel').textContent=tr('Pour ','For ')+s+' '+tr('portion'+(s>1?'s':''),'serving'+(s>1?'s':''));
    $('#detailIngredients').innerHTML=scaledIngredients(r).map(([n,q])=>'<div class="ingredient-row"><span>'+n+'</span><span>'+q+'</span></div>').join('');
    const basic=basicsGuide(r,'auto');
    $('#detailSteps').innerHTML=basic.steps.map((x,i)=>'<li><strong class="step-number-title">'+tr('Étape ','Step ')+(i+1)+'</strong><span>'+x+'</span></li>').join('');
    applyGuide(basic,false);$('#cookGuidePanel').hidden=true;
    const d=activeDeviceFromSelect();
    if(d)customGuide(r,d).then(g=>{if(currentRecipe?.id===r.id)applyGuide(g,false)});
  };

  // Re-render recipe surfaces so old shared fallback images disappear now.
  try{renderRecipes(window.__recipeFilter||'all')}catch{}
  try{renderWeek()}catch{}
  try{renderLazyIdeasV14();renderLazyDrawerV14()}catch{}
  setTimeout(()=>hydrateImages(document),80);

  window.MiseCookingV14={basicsGuide,customGuide,showGuide,budgetRecipeCount:budgetRecipes.length};
})();