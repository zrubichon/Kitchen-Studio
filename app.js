
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const DAYS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const LABELS = {breakfast:"Petit-déjeuner", lunch:"Déjeuner", dinner:"Dîner"};
const RECIPES = [
  {id:"overnight-oats",name:"Overnight oats fruits rouges",slot:"breakfast",time:5,kcal:410,protein:27,carbs:51,fat:11,tags:["high-protein","quick","vegetarian"],image:"https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=80",ingredients:[["Flocons d’avoine","¾ cup"],["Skyr","½ cup"],["Lait","⅓ cup"],["Fruits rouges","½ cup"],["Graines de chia","1 tbsp"]],steps:["Mélangez avoine, skyr, lait et chia.","Ajoutez les fruits rouges.","Réfrigérez au moins 4 heures."],tip:"Préparez plusieurs bocaux en une fois.",methods:{default:["Sans cuisson","5 min"],airfryer:["Sans cuisson","Aucune cuisson nécessaire."]}},
  {id:"egg-toast",name:"Toast œufs & avocat",slot:"breakfast",time:10,kcal:455,protein:24,carbs:38,fat:23,tags:["high-protein","quick","vegetarian"],image:"https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80",ingredients:[["Pain complet","2 tranches"],["Œufs","2"],["Avocat","½"],["Feta","1 tbsp"]],steps:["Toastez le pain.","Cuisez les œufs.","Écrasez l’avocat et assemblez avec la feta."],tip:"Gardez l’autre moitié d’avocat pour un déjeuner.",methods:{default:["Plaques + toaster","8–10 min"],airfryer:["Air Fry","370°F · 4–5 min pour toaster le pain"]}},
  {id:"protein-pancakes",name:"Pancakes banane & skyr",slot:"breakfast",time:14,kcal:440,protein:31,carbs:54,fat:10,tags:["high-protein","quick","vegetarian"],image:"https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=80",ingredients:[["Banane","1"],["Œuf","1"],["Flocons d’avoine","¾ cup"],["Skyr","⅓ cup"]],steps:["Mixez ou écrasez tous les ingrédients.","Cuisez de petits pancakes 2–3 minutes par face.","Servez avec quelques fruits."],tip:"La pâte peut être préparée la veille.",methods:{default:["Poêle","10 min"],airfryer:["Bake","320°F · 8–10 min dans petits moules"]}},
  {id:"chicken-bowl",name:"Bowl poulet citron & feta",slot:"lunch",time:18,kcal:610,protein:48,carbs:62,fat:18,tags:["high-protein","quick","airfryer"],image:"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80",ingredients:[["Blanc de poulet","5 oz"],["Riz cuit","¾ cup"],["Concombre","½"],["Tomates cerises","½ cup"],["Feta","1 oz"],["Citron","½"]],steps:["Assaisonnez le poulet avec citron, sel et poivre.","Cuisez selon l’appareil sélectionné jusqu’à cuisson complète.","Coupez les légumes et réchauffez le riz.","Assemblez avec feta et jus de citron."],tip:"Cuisez une seconde portion de poulet pour demain.",methods:{default:["Poêle","6–7 min par face"],airfryer:["Air Fry","390°F · 12–14 min"],cosori:["Air Fry","390°F · 11–13 min"],instant:["Air Fry","390°F · 12–14 min"],ninja:["Air Fry","390°F · 12–14 min"]}},
  {id:"turkey-wrap",name:"Wrap dinde, avocat & crunch",slot:"lunch",time:9,kcal:520,protein:39,carbs:49,fat:19,tags:["high-protein","quick"],image:"https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1000&q=80",ingredients:[["Tortilla complète","1 grande"],["Dinde cuite","4 oz"],["Avocat","½"],["Salade","1 cup"],["Tomate","½"]],steps:["Préparez une sauce rapide au yaourt et citron.","Garnissez la tortilla.","Roulez serré puis coupez en deux."],tip:"Gardez la sauce séparée si préparé la veille.",methods:{default:["Sans cuisson","9 min"],airfryer:["Reheat","320°F · 2 min si vous le voulez chaud"]}},
  {id:"greek-salad",name:"Grande salade grecque & pois chiches",slot:"lunch",time:12,kcal:500,protein:23,carbs:55,fat:24,tags:["vegetarian","quick"],image:"https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80",ingredients:[["Pois chiches","¾ cup"],["Concombre","½"],["Tomates","1 cup"],["Feta","1 oz"],["Olives","1 tbsp"],["Citron","½"]],steps:["Rincez les pois chiches.","Coupez concombre et tomates.","Mélangez avec feta, olives et citron."],tip:"Ajoutez un œuf ou du poulet pour davantage de protéines.",methods:{default:["Sans cuisson","12 min"],airfryer:["Air Fry","Pita 350°F · 2–3 min"]}},
  {id:"tofu-bowl",name:"Tofu croustillant sesame bowl",slot:"lunch",time:20,kcal:590,protein:32,carbs:68,fat:23,tags:["vegetarian","airfryer"],image:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80",ingredients:[["Tofu ferme","6 oz"],["Riz cuit","¾ cup"],["Carotte","1"],["Concombre","½"],["Edamame","½ cup"]],steps:["Pressez et coupez le tofu.","Assaisonnez avec sauce soja.","Cuisez jusqu’à croustillant.","Assemblez sur le riz avec les légumes."],tip:"Pressez le tofu 10 minutes avant cuisson.",methods:{default:["Poêle","10–12 min"],airfryer:["Air Fry","390°F · 12–15 min"],cosori:["Air Fry","385°F · 12–14 min"],instant:["Air Fry","390°F · 13–15 min"],ninja:["Air Fry","390°F · 12–14 min"]}},
  {id:"salmon-rice",name:"Saumon miso, riz & brocoli",slot:"dinner",time:22,kcal:690,protein:44,carbs:68,fat:25,tags:["high-protein","airfryer"],image:"https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80",ingredients:[["Filet de saumon","5 oz"],["Riz cuit","¾ cup"],["Brocoli","1½ cups"],["Miso","1 tsp"],["Sauce soja","1 tsp"]],steps:["Mélangez miso et soja puis badigeonnez le saumon.","Cuisez le saumon et le brocoli selon l’appareil choisi.","Réchauffez le riz et dressez."],tip:"Gardez un peu de riz pour le fried rice du lendemain.",methods:{default:["Four","400°F · 12–15 min"],airfryer:["Air Fry","390°F · 8–11 min"],cosori:["Air Fry","385°F · 8–10 min"],instant:["Air Fry","390°F · 9–11 min"],ninja:["Air Roast","400°F · 10–12 min"]}},
  {id:"fried-rice",name:"Fried rice poulet & edamame",slot:"dinner",time:16,kcal:650,protein:43,carbs:72,fat:19,tags:["high-protein","quick"],image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=80",ingredients:[["Riz cuit froid","1 cup"],["Poulet cuit","4 oz"],["Œuf","1"],["Edamame","½ cup"],["Carotte","½"],["Sauce soja","1 tbsp"]],steps:["Faites revenir carotte et edamame.","Ajoutez le riz froid et laissez légèrement griller.","Brouillez l’œuf sur le côté puis mélangez.","Ajoutez poulet et sauce soja."],tip:"Le riz de la veille donne la meilleure texture.",methods:{default:["Poêle / wok","16 min"],airfryer:["Plaques recommandées","Le wok reste plus adapté à cette recette."]}},
  {id:"chicken-pasta",name:"Pasta poulet tomate crémeuse",slot:"dinner",time:24,kcal:720,protein:51,carbs:76,fat:22,tags:["high-protein"],image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80",ingredients:[["Pâtes","3 oz sec"],["Poulet","4 oz"],["Passata tomate","½ cup"],["Greek yogurt","¼ cup"],["Épinards","1 cup"]],steps:["Cuisez les pâtes al dente.","Cuisez le poulet puis tranchez-le.","Ajoutez tomate et épinards.","Hors du feu, incorporez le yaourt puis les pâtes et le poulet."],tip:"Ajoutez le yaourt hors du feu pour garder une sauce lisse.",methods:{default:["Plaques","24 min"],airfryer:["Air Fry + plaques","Poulet 390°F · 11–13 min; sauce/pâtes sur plaques"]}},
  {id:"sheet-pan",name:"Poulet paprika & légumes rôtis",slot:"dinner",time:28,kcal:580,protein:49,carbs:48,fat:20,tags:["high-protein","airfryer"],image:"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80",ingredients:[["Poulet","5 oz"],["Pommes de terre","7 oz"],["Courgette","1"],["Poivron","½"],["Paprika","1 tsp"]],steps:["Coupez les légumes et pommes de terre.","Mélangez avec paprika, huile, sel et poivre.","Commencez les pommes de terre puis ajoutez poulet et légumes.","Poursuivez jusqu’à cuisson complète."],tip:"Doublez les légumes : ils serviront demain.",methods:{default:["Four","425°F · 25–30 min"],airfryer:["Air Fry","390°F · 18–22 min"],cosori:["Roast","400°F · 18–22 min"],instant:["Roast","400°F · 20–24 min"],ninja:["Air Roast","400°F · 20–24 min"]}}
];
const fallbackAppliances=[
{id:"cosori-turboblaze-6",brand:"COSORI",model:"TurboBlaze™ 6.0-Quart Air Fryer",type:"Air Fryer",favorite:true,source:"https://cosori.com/products/turboblaze%E2%84%A2-6-0-quart-air-fryer-cream",description:"10 fonctions au total, dont Preheat.",modes:[{name:"Air Fry",preset:"385°F · 10 min",goodFor:"Frites, poulet, poisson, légumes"},{name:"Roast",preset:"425°F · 12 min",goodFor:"Viandes et légumes"},{name:"Bake",preset:"330°F · 20 min",goodFor:"Pâtisserie"},{name:"Broil",preset:"450°F · 5 min",goodFor:"Dorer et saisir"},{name:"Dehydrate",preset:"135°F · 6 h",goodFor:"Déshydratation"},{name:"Frozen",preset:"Variable",goodFor:"Surgelés"},{name:"Proof",preset:"Basse température",goodFor:"Pâtes levées"},{name:"Reheat",preset:"Variable",goodFor:"Restes"},{name:"Preheat",preset:"Selon mode",goodFor:"Préchauffage"},{name:"Keep Warm",preset:"170°F · 30 min",goodFor:"Maintien au chaud"}]},
{id:"instant-vortex-plus-6",brand:"Instant Pot",model:"Vortex® Plus 6QT ClearCook",type:"Air Fryer",favorite:false,source:"https://instantpot.com/products/instant-pot-vortex-plus-6qt-clearcook-air-fryer",description:"6 fonctions principales.",modes:[{name:"Air Fry",preset:"95–400°F",goodFor:"Cuisson croustillante"},{name:"Roast",preset:"95–400°F",goodFor:"Viandes et légumes"},{name:"Broil",preset:"95–400°F",goodFor:"Dorer"},{name:"Bake",preset:"95–400°F",goodFor:"Cuisson type four"},{name:"Reheat",preset:"95–400°F",goodFor:"Restes"},{name:"Dehydrate",preset:"95–400°F",goodFor:"Déshydratation"}]},
{id:"ninja-foodi-xl-dt200",brand:"Ninja",model:"Foodi® XL Pro Air Oven DT200 Series",type:"Air Oven",favorite:false,source:"https://support.ninjakitchen.com/hc/en-us/article_attachments/5061879996316",description:"Four multifonction avec Air Fry, Air Roast, Whole Roast et plus.",modes:[{name:"Air Fry",preset:"Selon aliment",goodFor:"Wings, frites, nuggets"},{name:"Air Roast",preset:"Selon aliment",goodFor:"Plaques complètes"},{name:"Whole Roast",preset:"Selon aliment",goodFor:"Grosses pièces"},{name:"Bake",preset:"Selon recette",goodFor:"Cuisson type four"},{name:"Pizza",preset:"Selon pizza",goodFor:"Pizzas"},{name:"Reheat",preset:"Selon aliment",goodFor:"Réchauffer"}]}
];
let appliances=fallbackAppliances;
fetch("data/appliances.json").then(r=>r.ok?r.json():Promise.reject()).then(x=>{appliances=x;renderAppliances();fillApplianceSelect()}).catch(()=>{});
const defaultPlan=[
["overnight-oats","chicken-bowl","sheet-pan"],["egg-toast","turkey-wrap","fried-rice"],["protein-pancakes","chicken-bowl","salmon-rice"],["overnight-oats","greek-salad","chicken-pasta"],["protein-pancakes","turkey-wrap","salmon-rice"],["egg-toast","tofu-bowl","sheet-pan"],["overnight-oats","greek-salad","chicken-pasta"]
];
const state={
  weekOffset:0,
  plan:JSON.parse(localStorage.getItem("misePlan")||"null")||defaultPlan,
  selected:new Set(),
  checked:new Set(JSON.parse(localStorage.getItem("miseShoppingChecked")||"[]")),
  profile:JSON.parse(localStorage.getItem("miseProfile")||"null")||{goal:"protein",diet:"balanced",servings:1,store:"Whole Foods Market",location:"Seattle, WA",budget:90}
};
let currentRecipe=RECIPES[0], wizardStep=0;
function recipe(id){return RECIPES.find(r=>r.id===id)}
function monday(){
  const now=new Date(2026,8,23), day=now.getDay()||7, d=new Date(now);
  d.setDate(now.getDate()-(day-1)+state.weekOffset*7); return d;
}
function renderWeek(){
  const grid=$("#weekGrid"); if(!grid)return; grid.innerHTML="";
  state.plan.forEach((meals,d)=>{
    const col=document.createElement("div"); col.className="day-col";
    const date=new Date(monday()); date.setDate(date.getDate()+d);
    col.innerHTML='<div class="day-head '+(date.getDate()===23&&state.weekOffset===0?"today":"")+'"><strong>'+DAYS[d]+'</strong><small>'+date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"}).replace(".","")+'</small></div>';
    meals.forEach((id,s)=>{
      const r=recipe(id), slot=["breakfast","lunch","dinner"][s], key=d+"-"+s;
      const card=document.createElement("article"); card.className="meal-card "+(slot==="dinner"?"dinner ":"")+(state.selected.has(key)?"selected":""); card.dataset.key=key;
      card.innerHTML='<span class="selected-dot"></span><div class="meal-slot">'+LABELS[slot]+'</div><h4>'+r.name+'</h4><div class="meal-foot"><span>'+r.time+' min · '+r.protein+'g prot.</span><span class="kcal">'+r.kcal+' kcal</span></div>';
      card.onclick=e=>{if(e.shiftKey){state.selected.has(key)?state.selected.delete(key):state.selected.add(key);renderWeek()}else openRecipe(r,DAYS[d]+" "+date.getDate()+" · "+LABELS[slot])};
      card.oncontextmenu=e=>{e.preventDefault();state.selected.has(key)?state.selected.delete(key):state.selected.add(key);renderWeek()};
      col.appendChild(card);
    });
    grid.appendChild(col);
  });
  updateWeekHeader(); renderShopping();
}
function updateWeekHeader(){
  const a=monday(), b=new Date(a); b.setDate(a.getDate()+6);
  $("#weekLabel").textContent="Semaine du "+a.toLocaleDateString("fr-FR",{day:"numeric",month:"long"});
  $("#weekRange").textContent=a.getDate()+"–"+b.getDate()+" "+b.toLocaleDateString("fr-FR",{month:"long"});
}
function navigate(page){
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $$(".page").forEach(p=>p.classList.remove("active")); $("#page-"+page)?.classList.add("active"); window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
function openModal(d){$("#modalBackdrop").hidden=false;d.showModal()}
function closeModal(d){d.close(); if(!$$("dialog[open]").length)$("#modalBackdrop").hidden=true}
$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.closest("dialog")));
$("#modalBackdrop")?.addEventListener("click",()=>$$("dialog[open]").forEach(closeModal));
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2600)}
function methodFor(r,id){
  if(id==="default")return r.methods.default||["Cuisson classique",r.time+" min"];
  const a=appliances.find(x=>x.id===id); let k="airfryer";
  if(a?.brand==="COSORI")k="cosori"; if(a?.brand==="Instant Pot")k="instant"; if(a?.brand==="Ninja")k="ninja";
  return r.methods[k]||r.methods.airfryer||r.methods.default;
}
function fillApplianceSelect(){
  const s=$("#detailApplianceSelect"); if(!s)return;
  s.innerHTML='<option value="default">Plaques / four classique</option>'+appliances.map(a=>'<option value="'+a.id+'">'+a.brand+" "+a.model+"</option>").join("");
  const fav=appliances.find(a=>a.favorite)||appliances[0]; if(fav)s.value=fav.id;
}
function updateMethod(){const m=methodFor(currentRecipe,$("#detailApplianceSelect").value);$("#cookSetting").innerHTML="<span>"+m[0]+"</span><strong>"+m[1]+"</strong>"}
function openRecipe(r,slot="Recette"){
  currentRecipe=r; $("#detailTitle").textContent=r.name; $("#detailMealSlot").textContent=slot; $("#detailTags").textContent=(r.tags.includes("high-protein")?"Protéiné · ":"")+r.time+" min"; $("#detailSubtitle").textContent=r.tip;
  $("#detailPhoto").style.backgroundImage="linear-gradient(to top,rgba(0,0,0,.25),transparent 55%),url('"+r.image+"')";
  $("#detailMacros").innerHTML=[["Calories",r.kcal+" kcal"],["Protéines",r.protein+" g"],["Glucides",r.carbs+" g"],["Lipides",r.fat+" g"]].map(x=>'<div class="macro"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join("");
  $("#detailIngredients").innerHTML=r.ingredients.map(i=>'<div class="ingredient-row"><span>'+i[0]+'</span><span>'+i[1]+'</span></div>').join("");
  $("#detailSteps").innerHTML=r.steps.map(s=>"<li>"+s+"</li>").join(""); $("#detailTip").textContent=r.tip;
  fillApplianceSelect(); updateMethod(); openModal($("#recipeModal"));
}
$("#detailApplianceSelect")?.addEventListener("change",updateMethod);
function renderRecipes(filter="all"){
  const list=RECIPES.filter(r=>filter==="all"||(filter==="quick"?r.time<=20:r.tags.includes(filter)));
  $("#recipeGrid").innerHTML=list.map(r=>'<article class="recipe-tile" data-recipe="'+r.id+'"><div class="recipe-tile-photo" style="background-image:url(\''+r.image+'\')"><span>'+r.time+' min</span></div><div class="recipe-tile-body"><div class="eyebrow">'+r.protein+'g protéines · '+r.kcal+' kcal</div><h3>'+r.name+'</h3><div class="recipe-meta"><span>'+(r.tags.includes("airfryer")?"Air Fryer compatible":"Cuisine simple")+'</span><span>'+(r.tags.includes("vegetarian")?"Végétarien":"Flexible")+'</span></div></div></article>').join("");
  $$("[data-recipe]").forEach(x=>x.onclick=()=>openRecipe(recipe(x.dataset.recipe),"Carnet de recettes"));
}
$$(".filter-chip").forEach(b=>b.onclick=()=>{$$(".filter-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderRecipes(b.dataset.filter)});
function aggregateShopping(){
  const m=new Map(); state.plan.flat().map(recipe).forEach(r=>r.ingredients.forEach(([name,qty])=>{const k=name.toLowerCase();if(!m.has(k))m.set(k,{name,qty:[]});m.get(k).qty.push(qty)})); return [...m.values()];
}
function category(n){n=n.toLowerCase();if(/poulet|saumon|dinde|œuf|tofu/.test(n))return"Protéines";if(/riz|pâtes|pain|tortilla|avoine|granola|pomme/.test(n))return"Épicerie & féculents";if(/yaourt|skyr|feta|parmesan|lait/.test(n))return"Frais & laitages";if(/huile|miso|soja|chia|paprika|olive/.test(n))return"Placard";return"Fruits & légumes"}
function renderShopping(){
  const items=aggregateShopping(), groups={}; items.forEach(x=>(groups[category(x.name)]??=[]).push(x));
  $("#shoppingList").innerHTML=Object.entries(groups).map(([cat,arr])=>'<div class="shopping-category"><div class="shopping-category-title">'+cat+'</div>'+arr.map(x=>{const k=x.name.toLowerCase().replace(/\s/g,"-");return '<label class="shop-row"><input class="shop-check" type="checkbox" data-shop="'+k+'" '+(state.checked.has(k)?"checked":"")+'><span class="shop-name"><strong>'+x.name+'</strong><small>À faire correspondre aux produits de '+(state.profile.store||"votre magasin")+'</small></span><span class="shop-qty">'+(x.qty.length===1?x.qty[0]:x.qty.length+" utilisations")+'</span></label>'}).join("")+'</div>').join("");
  $$(".shop-check").forEach(c=>c.onchange=()=>{c.checked?state.checked.add(c.dataset.shop):state.checked.delete(c.dataset.shop);localStorage.setItem("miseShoppingChecked",JSON.stringify([...state.checked]));$("#pantryCount").textContent=state.checked.size});
  $("#shoppingCount").textContent=items.length; $("#cartItems").textContent=items.length; $("#pantryCount").textContent=state.checked.size;
}
function renderAppliances(){
  const fav=appliances.find(a=>a.favorite)||appliances[0]; if(!fav)return;
  $("#favoriteApplianceName").textContent=fav.brand+" "+fav.model; $("#favoriteApplianceMeta").textContent=fav.description;
  $("#favoriteModes").innerHTML=fav.modes.slice(0,6).map(m=>"<span>"+m.name+"</span>").join(""); $("#applianceCount").textContent=appliances.length+" appareils";
  $("#applianceGrid").innerHTML=appliances.map(a=>'<article class="appliance-card" data-appliance="'+a.id+'"><div class="appliance-icon">'+(a.type.includes("Air")?"♨":"◫")+'</div><div class="eyebrow">'+a.brand+'</div><h3>'+a.model+'</h3><p>'+a.description+'</p><footer><span>'+a.modes.length+' modes répertoriés</span><span>Guide →</span></footer></article>').join("");
  $$("[data-appliance]").forEach(c=>c.onclick=()=>openAppliance(c.dataset.appliance)); $("#viewFavoriteManual").onclick=()=>openAppliance(fav.id);
}
function openAppliance(id){
  const a=appliances.find(x=>x.id===id); if(!a)return;
  $("#applianceModalTitle").textContent=a.brand+" "+a.model; $("#applianceModalDesc").textContent=a.description;
  $("#manualModeList").innerHTML=a.modes.map(m=>'<div class="manual-mode"><strong>'+m.name+' · '+m.preset+'</strong><small>'+m.goodFor+'</small></div>').join("");
  $("#manualSourceLink").href=a.source; openModal($("#applianceModal"));
}
function updateProfileUI(){
  const p=state.profile; $("#storePillName").textContent=(p.store||"Whole Foods Market").replace(" Market","")+" · "+(p.location||"Seattle").split(",")[0];
  $("#shoppingStoreName").textContent=p.store||"Whole Foods Market"; $("#shoppingLocation").textContent=p.location||"Seattle, WA";
  $("#profileSummary").textContent=(p.goal==="protein"?"Protéiné":"Équilibré")+" · "+(p.servings||1)+" pers.";
  if($("#profileStore"))$("#profileStore").value=p.store||"Whole Foods Market"; if($("#profileLocation"))$("#profileLocation").value=p.location||"Seattle, WA";
}
$("#saveProfile")?.addEventListener("click",()=>{
  const fd=new FormData($("#profileForm")); state.profile={...state.profile,goal:fd.get("goal"),diet:fd.get("diet"),servings:Number(fd.get("servings")),store:fd.get("store"),location:fd.get("location"),budget:Number(fd.get("budget"))};
  localStorage.setItem("miseProfile",JSON.stringify(state.profile)); updateProfileUI(); renderShopping(); toast("Profil culinaire enregistré.");
});
$("#profileForm")?.addEventListener("submit",e=>e.preventDefault());
function showWizard(){wizardStep=0;syncWizard();openModal($("#wizardModal"))}
function syncWizard(){$$(".wizard-step").forEach((s,i)=>s.classList.toggle("active",i===wizardStep));$$(".wizard-progress span").forEach((s,i)=>s.classList.toggle("active",i<=wizardStep));$("#wizardBack").disabled=wizardStep===0;$("#wizardNext").textContent=wizardStep===3?"Composer ma semaine ✦":"Continuer"}
$("#generateWeek").onclick=showWizard; $("#weekSettings").onclick=showWizard;
$("#wizardBack").onclick=()=>{wizardStep=Math.max(0,wizardStep-1);syncWizard()};
$("#wizardNext").onclick=async()=>{
  if(wizardStep<3){wizardStep++;syncWizard();return}
  const fd=new FormData($("#wizardForm")), prompt=fd.get("prompt")||"", goal=fd.get("weekGoal")||"high-protein"; closeModal($("#wizardModal"));toast("Le chef compose votre semaine…");
  let plan=null; try{const r=await fetch("/api/generate-plan",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({profile:state.profile,brief:{goal,prompt}})});if(r.ok){const d=await r.json();if(Array.isArray(d.plan))plan=d.plan}}catch{}
  state.plan=plan||defaultPlan.map((d,i)=>i===1&&/peu|rapide|tard/i.test(prompt)?[d[0],"turkey-wrap","fried-rice"]:d);
  localStorage.setItem("misePlan",JSON.stringify(state.plan)); renderWeek(); setTimeout(()=>toast("Votre nouvelle semaine est prête."),350);
};
$("#openAiPrompt").onclick=()=>openModal($("#aiModal")); $("#recipeAiBtn").onclick=()=>openModal($("#aiModal"));
$("#sendQuickPrompt").onclick=()=>{const p=$("#quickPrompt").value.trim();if(!p)return;state.plan=defaultPlan;localStorage.setItem("misePlan",JSON.stringify(state.plan));renderWeek();closeModal($("#aiModal"));navigate("planner");toast("J’ai adapté la semaine à votre demande.")};
$("#prevWeek").onclick=()=>{state.weekOffset--;updateWeekHeader()};$("#nextWeek").onclick=()=>{state.weekOffset++;updateWeekHeader()};
$("#regenerateSelected").onclick=()=>{if(!state.selected.size){toast("Sélectionnez des repas avec clic droit ou Maj + clic.");return}state.selected.forEach(key=>{const[d,s]=key.split("-").map(Number),slot=["breakfast","lunch","dinner"][s],pool=RECIPES.filter(r=>r.slot===slot&&r.id!==state.plan[d][s]);state.plan[d][s]=pool[(d+s)%pool.length].id});state.selected.clear();localStorage.setItem("misePlan",JSON.stringify(state.plan));renderWeek();toast("Les repas sélectionnés ont été recomposés.")};
$("#clearChecked").onclick=()=>{state.checked.clear();localStorage.removeItem("miseShoppingChecked");renderShopping();toast("Tous les articles sont visibles.")};
async function shopReal(){
  const line_items=aggregateShopping().map(x=>({name:x.name,line_item_measurements:[{quantity:1,unit:"each"}]}));toast("Préparation de la liste achetable…");
  try{const r=await fetch("/api/instacart-shopping-list",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:"Mise — Courses de la semaine",line_items})});const d=await r.json();if(r.ok&&d.products_link_url){window.open(d.products_link_url,"_blank");return}}catch{}
  toast("Connexion magasin à activer avec une clé API dans le déploiement.");
}
$("#shopRealProducts").onclick=shopReal;$("#shopRealProducts2").onclick=shopReal;
$("#addAppliance").onclick=()=>toast("Prochaine étape : recherche par marque + modèle et import automatique du manuel constructeur.");
$("#askWhy").onclick=()=>{openModal($("#aiModal"));$("#quickPrompt").value="Explique-moi pourquoi tu as choisi ces repas et comment tu as optimisé les ingrédients."};
$("#viewNutrition").onclick=()=>toast("Moyenne démo : ~1 820 kcal · ~122 g protéines / jour.");
$("#notifBtn").onclick=()=>toast("Aucun rappel cuisine pour le moment.");
fillApplianceSelect(); renderWeek(); renderRecipes(); renderAppliances(); updateProfileUI();
