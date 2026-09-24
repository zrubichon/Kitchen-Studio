// Expanded deterministic recipe catalog.
// Ensures at least 20 options for every public recipe category (except user-owned Favorites).
(function(){
  const FLAVORS=['citron & herbes','paprika fumé','ail & persil','gingembre sésame','tomate basilic','moutarde douce','curry doux','miso citron','cumin coriandre','pesto roquette','orange gingembre','herbes de Provence','sésame citron vert','coco curry','tomate épicée douce','ail rôti','basilic parmesan','citron poivre','paprika citron','herbes fraîches','miel moutarde','soja gingembre','tomate olive','cumin citron'];
  const IMG={
    default:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
    fish:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',
    chicken:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80',
    beef:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    salad:'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
    soup:'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80',
    pasta:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80',
    breakfast:'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=80',
    smoothie:'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1000&q=80',
    dessert:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80'
  };
  const CONFIG={
    occasion:{label:'Menu spécial',kind:'dessert',slot:'dinner',tags:['dessert','occasion']},
    french:{label:'Assiette française',kind:'chicken',slot:'dinner',tags:['french']},
    italian:{label:'Assiette italienne',kind:'pasta',slot:'dinner',tags:['italian']},
    mediterranean:{label:'Assiette méditerranéenne',kind:'bowl',slot:'lunch',tags:['mediterranean']},
    greek:{label:'Assiette grecque',kind:'bowl',slot:'lunch',tags:['greek','mediterranean']},
    spanish:{label:'Assiette espagnole',kind:'rice',slot:'dinner',tags:['spanish']},
    mexican:{label:'Bowl mexicain',kind:'bowl',slot:'lunch',tags:['mexican']},
    american:{label:'Classique américain',kind:'chicken',slot:'dinner',tags:['american']},
    japanese:{label:'Bowl japonais',kind:'fish',slot:'dinner',tags:['japanese','fish','pescatarian']},
    korean:{label:'Bowl coréen',kind:'beef',slot:'dinner',tags:['korean','beef','meat']},
    chinese:{label:'Wok chinois',kind:'chicken',slot:'dinner',tags:['chinese','chicken','meat']},
    thai:{label:'Curry thaï',kind:'chicken',slot:'dinner',tags:['thai','chicken','meat']},
    vietnamese:{label:'Bol vietnamien',kind:'soup',slot:'dinner',tags:['vietnamese']},
    indian:{label:'Curry indien',kind:'vegan',slot:'dinner',tags:['indian','vegan','vegetarian']},
    moroccan:{label:'Tajine marocain',kind:'chicken',slot:'dinner',tags:['moroccan','chicken','meat']},
    'middle-eastern':{label:'Assiette Moyen-Orient',kind:'vegan',slot:'lunch',tags:['middle-eastern','vegan','vegetarian']},
    lebanese:{label:'Assiette libanaise',kind:'vegan',slot:'lunch',tags:['lebanese','middle-eastern','vegan','vegetarian']},
    protein:{label:'Assiette très protéinée',kind:'chicken',slot:'dinner',tags:['protein','high-protein']},
    vegetarian:{label:'Assiette végétarienne',kind:'vegetarian',slot:'lunch',tags:['vegetarian']},
    vegan:{label:'Assiette vegan',kind:'vegan',slot:'lunch',tags:['vegan','vegetarian']},
    pescatarian:{label:'Assiette pescatarienne',kind:'fish',slot:'dinner',tags:['pescatarian','fish']},
    'gluten-free':{label:'Assiette sans gluten',kind:'bowl',slot:'lunch',tags:['gluten-free']},
    'dairy-free':{label:'Assiette sans lactose',kind:'bowl',slot:'lunch',tags:['dairy-free']},
    'low-carb':{label:'Assiette low carb',kind:'chicken',slot:'dinner',tags:['low-carb','protein','high-protein']},
    'high-fiber':{label:'Bowl riche en fibres',kind:'vegan',slot:'lunch',tags:['high-fiber','vegetarian']},
    'low-sugar':{label:'Assiette peu sucrée',kind:'bowl',slot:'lunch',tags:['low-sugar']},
    budget:{label:'Repas petit budget',kind:'vegan',slot:'dinner',tags:['budget','high-fiber']},
    fish:{label:'Poisson',kind:'fish',slot:'dinner',tags:['fish','pescatarian']},
    meat:{label:'Viande',kind:'beef',slot:'dinner',tags:['meat']},
    chicken:{label:'Poulet',kind:'chicken',slot:'dinner',tags:['chicken','meat']},
    beef:{label:'Bœuf',kind:'beef',slot:'dinner',tags:['beef','meat']},
    pork:{label:'Porc',kind:'pork',slot:'dinner',tags:['pork','meat']},
    breakfast:{label:'Petit-déjeuner',kind:'breakfast',slot:'breakfast',tags:['breakfast']},
    smoothie:{label:'Smoothie',kind:'smoothie',slot:'breakfast',tags:['smoothie','drink','breakfast']},
    drink:{label:'Boisson maison',kind:'drink',slot:'breakfast',tags:['drink']},
    dessert:{label:'Dessert',kind:'dessert',slot:'dinner',tags:['dessert']},
    salad:{label:'Grande salade',kind:'salad',slot:'lunch',tags:['salad']},
    soup:{label:'Soupe maison',kind:'soup',slot:'dinner',tags:['soup']},
    pasta:{label:'Pasta',kind:'pasta',slot:'dinner',tags:['pasta','italian']},
    bowl:{label:'Bowl complet',kind:'bowl',slot:'lunch',tags:['bowl']},
    brunch:{label:'Brunch',kind:'breakfast',slot:'breakfast',tags:['brunch','breakfast']},
    comfort:{label:'Comfort food',kind:'pasta',slot:'dinner',tags:['comfort']},
    'meal-prep':{label:'Meal prep',kind:'bowl',slot:'lunch',tags:['meal-prep']},
    'one-pot':{label:'One-pot',kind:'soup',slot:'dinner',tags:['one-pot']},
    airfryer:{label:'Air Fryer',kind:'chicken',slot:'dinner',tags:['airfryer']},
    summer:{label:'Repas d’été',kind:'salad',slot:'lunch',tags:['summer']},
    winter:{label:'Repas d’hiver',kind:'soup',slot:'dinner',tags:['winter']},
    'date-night':{label:'Dîner à deux',kind:'fish',slot:'dinner',tags:['date-night','occasion']},
    family:{label:'Repas famille',kind:'pasta',slot:'dinner',tags:['family']},
    quick:{label:'Repas express',kind:'bowl',slot:'lunch',tags:['quick']}
  };
  function base(kind){
    switch(kind){
      case 'fish':return {protein:42,kcal:560,carbs:38,fat:22,image:IMG.fish,ingredients:[['Filet de saumon','5 oz'],['Riz cuit','½ cup'],['Brocoli','1 cup'],['Citron','½']],steps:['Assaisonnez le poisson.','Cuisez jusqu’à cuisson juste à cœur.','Servez avec les accompagnements.'],methods:{default:['Four / poêle','15–20 min'],airfryer:['Air Fry','390°F · 8–11 min']}};
      case 'chicken':return {protein:47,kcal:590,carbs:46,fat:20,image:IMG.chicken,ingredients:[['Poulet','5 oz'],['Pommes de terre','5 oz'],['Courgette','1 cup'],['Citron','½']],steps:['Assaisonnez le poulet.','Cuisez avec les légumes.','Vérifiez la cuisson à cœur avant de servir.'],methods:{default:['Poêle / four','20–25 min'],airfryer:['Air Fry','390°F · 12–15 min']}};
      case 'beef':return {protein:44,kcal:640,carbs:45,fat:28,image:IMG.beef,ingredients:[['Bœuf émincé','5 oz'],['Riz cuit','½ cup'],['Poivron','1 cup'],['Sauce soja','1 tbsp']],steps:['Saisissez le bœuf.','Ajoutez les légumes.','Servez avec le féculent.'],methods:{default:['Poêle','15–20 min'],airfryer:['Air Fry','400°F · 7–10 min']}};
      case 'pork':return {protein:43,kcal:610,carbs:42,fat:25,image:IMG.beef,ingredients:[['Filet mignon de porc','5 oz'],['Pommes de terre','5 oz'],['Carotte','1 cup'],['Moutarde','1 tbsp']],steps:['Assaisonnez le porc.','Cuisez avec les légumes.','Laissez reposer avant de trancher.'],methods:{default:['Four / poêle','22–28 min'],airfryer:['Roast','380°F · 17–21 min']}};
      case 'vegan':return {protein:21,kcal:520,carbs:72,fat:16,image:IMG.default,ingredients:[['Pois chiches','1 cup'],['Riz cuit','½ cup'],['Épinards','1 cup'],['Tomates','½ cup']],steps:['Préparez les légumes.','Ajoutez les pois chiches et assaisonnez.','Servez avec le riz.'],methods:{default:['Casserole / poêle','18–24 min'],airfryer:['Non recommandé','Préférez une casserole ou une poêle']}};
      case 'vegetarian':return {protein:28,kcal:510,carbs:52,fat:20,image:IMG.default,ingredients:[['Œufs','2'],['Pois chiches','½ cup'],['Épinards','1 cup'],['Feta','1 oz']],steps:['Préparez la base végétale.','Ajoutez les œufs ou le fromage.','Assaisonnez et servez.'],methods:{default:['Poêle','15–20 min'],airfryer:['Bake','350°F · 9–12 min']}};
      case 'salad':return {protein:24,kcal:430,carbs:38,fat:20,image:IMG.salad,ingredients:[['Salade','2 cups'],['Concombre','½'],['Tomates','1 cup'],['Pois chiches','½ cup']],steps:['Coupez les ingrédients.','Assemblez la salade.','Ajoutez la vinaigrette juste avant de servir.'],methods:{default:['Sans cuisson','10 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}};
      case 'soup':return {protein:22,kcal:420,carbs:62,fat:10,image:IMG.soup,ingredients:[['Pois chiches','¾ cup'],['Carotte','1'],['Tomates','1 cup'],['Épinards','1 cup']],steps:['Mettez les ingrédients dans une casserole.','Laissez mijoter jusqu’à tendreté.','Rectifiez l’assaisonnement.'],methods:{default:['Casserole','25–35 min'],airfryer:['Non recommandé','Préférez une casserole ou un multicuiseur']}};
      case 'pasta':return {protein:33,kcal:620,carbs:80,fat:18,image:IMG.pasta,ingredients:[['Pâtes','3 oz sec'],['Passata tomate','½ cup'],['Épinards','1 cup'],['Parmesan','1 oz']],steps:['Cuisez les pâtes.','Préparez la sauce.','Mélangez et servez.'],methods:{default:['Plaques','20–25 min'],airfryer:['Non recommandé','Pâtes et sauce sur plaques']}};
      case 'rice':return {protein:32,kcal:590,carbs:78,fat:16,image:IMG.default,ingredients:[['Riz cuit','¾ cup'],['Poulet','4 oz'],['Poivron','1 cup'],['Tomates','½ cup']],steps:['Faites revenir la garniture.','Ajoutez le riz et assaisonnez.','Laissez cuire jusqu’à texture souhaitée.'],methods:{default:['Grande poêle','22–28 min'],airfryer:['Non recommandé','Préférez une grande poêle']}};
      case 'bowl':return {protein:35,kcal:540,carbs:60,fat:18,image:IMG.default,ingredients:[['Riz cuit','½ cup'],['Poulet','4 oz'],['Concombre','½'],['Tomates cerises','½ cup']],steps:['Cuisez la protéine.','Préparez les légumes.','Assemblez le bowl.'],methods:{default:['Poêle','15–20 min'],airfryer:['Air Fry','390°F · 11–13 min']}};
      case 'breakfast':return {protein:27,kcal:420,carbs:48,fat:14,image:IMG.breakfast,ingredients:[['Œufs','2'],['Pain complet','2 tranches'],['Fruits rouges','½ cup']],steps:['Préparez la base du petit-déjeuner.','Cuisez ou toastez si nécessaire.','Ajoutez les fruits.'],methods:{default:['Poêle / toaster','10–15 min'],airfryer:['Bake','350°F · 7–10 min']}};
      case 'smoothie':return {protein:25,kcal:320,carbs:42,fat:6,image:IMG.smoothie,ingredients:[['Skyr','¾ cup'],['Fruits rouges','1 cup'],['Lait','½ cup'],['Banane','½']],steps:['Ajoutez tout au blender.','Mixez jusqu’à texture lisse.'],methods:{default:['Blender','2 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}};
      case 'drink':return {protein:8,kcal:160,carbs:24,fat:4,image:IMG.smoothie,ingredients:[['Lait','1 cup'],['Fruits rouges','½ cup'],['Miel','1 tsp']],steps:['Mélangez ou mixez les ingrédients.','Servez frais ou chaud selon la recette.'],methods:{default:['Sans cuisson / blender','5 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}};
      case 'dessert':return {protein:7,kcal:390,carbs:56,fat:16,image:IMG.dessert,ingredients:[['Farine','¾ cup'],['Œufs','1'],['Fruits rouges','½ cup'],['Sucre','¼ cup']],steps:['Préparez la pâte.','Versez dans un moule.','Cuisez jusqu’à cœur.'],methods:{default:['Four','350°F · 25–30 min'],airfryer:['Bake','320°F · 16–22 min dans un moule compatible']}};
      default:return base('bowl');
    }
  }
  function buildRecipe(category,i,cfg){
    const b=base(cfg.kind),flavor=FLAVORS[i%FLAVORS.length];
    const isQuick=category==='quick';
    const tags=[...new Set([...(cfg.tags||[]),category])];
    if(isQuick)tags.push('quick');
    const time=isQuick?12:Math.max(8,Math.min(40,15+(i%6)*3));
    return {
      id:`catalog-${category}-${i+1}`,
      name:`${cfg.label} · ${flavor}`,
      slot:cfg.slot||'dinner',
      time,kcal:b.kcal+(i%4)*15,protein:b.protein+(i%3)*2,carbs:b.carbs,fat:b.fat,
      tags,image:b.image,ingredients:b.ingredients.map(x=>[...x]),
      steps:[...b.steps],tip:`Variation ${i+1} pensée pour la catégorie “${cfg.label}”.`,methods:b.methods
    };
  }
  Object.entries(CONFIG).forEach(([category,cfg])=>{
    let count;
    if(category==='quick')count=RECIPES.filter(r=>r.time<=20).length;
    else count=RECIPES.filter(r=>(r.tags||[]).includes(category)).length;
    const needed=Math.max(0,20-count);
    for(let i=0;i<needed;i++)RECIPES.push(buildRecipe(category,i,cfg));
  });

  // Semantic image assignment for every recipe
  function semanticRecipeImage(r){
    const names=(r.ingredients||[]).map(i=>i[0]).slice(0,6).join('|');
    return '/api/recipe-image?id='+encodeURIComponent(r.id||r.name)
      +'&name='+encodeURIComponent(r.name||'')
      +'&ingredients='+encodeURIComponent(names)
      +'&tags='+encodeURIComponent((r.tags||[]).join('|'));
  }
  RECIPES.forEach(r=>{r.image=semanticRecipeImage(r)});
  // Re-render after expansion.
  if(typeof renderRecipes==='function')renderRecipes(window.__recipeFilter||'all');
})();
