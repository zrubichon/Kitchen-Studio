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
    'date-night':{label:'Dîner à deux',kind:'fish',slot:'dinner',tags:['date-night']},
    family:{label:'Repas famille',kind:'pasta',slot:'dinner',tags:['family']},
    quick:{label:'Repas express',kind:'bowl',slot:'lunch',tags:['quick']},
    everyday:{label:'Everyday',kind:'bowl',slot:'lunch',tags:['everyday']}
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
    const b=base(cfg.kind),flavor=category==='occasion'?['vanille & fruits rouges','chocolat fondant','citron meringué','caramel doux','framboise & vanille','pomme cannelle','chocolat noisette','fraise & crème'][i%8]:FLAVORS[i%FLAVORS.length];
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

  const EVERYDAY_RECIPES = [
    {id:'everyday-no-knead-bread',name:'Pain maison sans pétrissage',slot:'breakfast',time:10,kcal:180,protein:6,carbs:36,fat:1,tags:['everyday','bread','vegetarian'],isSide:true,ingredients:[['Farine','1 cup'],['Levure boulangère','½ tsp'],['Sel','½ tsp'],['Eau','¾ cup']],steps:['Mélangez farine, levure, sel et eau.','Laissez lever jusqu’à ce que la pâte soit gonflée.','Cuisez dans un petit moule ou une cocotte jusqu’à croûte dorée.'],tip:'Très peu de travail actif : parfait pour avoir du pain maison sous la main.',methods:{default:['Four','425°F · 25–30 min'],airfryer:['Bake','330°F · 18–22 min dans un moule compatible']}},
    {id:'everyday-focaccia',name:'Mini focaccia huile d’olive & herbes',slot:'lunch',time:15,kcal:230,protein:6,carbs:34,fat:8,tags:['everyday','bread','italian','vegetarian'],isSide:true,ingredients:[['Farine','1 cup'],['Levure boulangère','½ tsp'],['Huile d’olive','1 tbsp'],['Herbes','1 tbsp']],steps:['Préparez une pâte souple.','Étalez-la dans un petit moule huilé.','Ajoutez huile et herbes puis cuisez jusqu’à doré.'],tip:'Idéale avec salade, soupe ou pâtes.',methods:{default:['Four','400°F · 18–22 min'],airfryer:['Bake','330°F · 12–16 min']}},
    {id:'everyday-naan',name:'Naan express au yaourt',slot:'lunch',time:15,kcal:210,protein:8,carbs:36,fat:4,tags:['everyday','bread','indian','vegetarian','quick'],isSide:true,ingredients:[['Farine','¾ cup'],['Greek yogurt','½ cup'],['Sel','1 pinch']],steps:['Mélangez farine, yaourt et sel.','Formez deux petits pains plats.','Cuisez à la poêle très chaude des deux côtés.'],tip:'Trois ingrédients, parfait avec curry ou bowl.',methods:{default:['Poêle','8–10 min'],airfryer:['Air Fry','360°F · 6–8 min']}},
    {id:'everyday-pita',name:'Pita maison rapide',slot:'lunch',time:18,kcal:190,protein:6,carbs:38,fat:1,tags:['everyday','bread','middle-eastern','vegan'],isSide:true,ingredients:[['Farine','1 cup'],['Levure boulangère','½ tsp'],['Eau','½ cup'],['Sel','½ tsp']],steps:['Préparez une pâte et laissez-la détendre.','Étalez en disques fins.','Cuisez très chaud jusqu’à gonflement.'],tip:'À remplir ou servir avec houmous.',methods:{default:['Poêle / four','10–12 min'],airfryer:['Bake','375°F · 5–7 min']}},
    {id:'everyday-flatbread',name:'Flatbread 2 ingrédients',slot:'lunch',time:12,kcal:200,protein:9,carbs:34,fat:3,tags:['everyday','bread','vegetarian','quick'],isSide:true,ingredients:[['Farine','¾ cup'],['Greek yogurt','½ cup']],steps:['Mélangez farine et yaourt.','Divisez et étalez finement.','Cuisez quelques minutes de chaque côté.'],tip:'Utilisez-le comme pain, wrap ou accompagnement.',methods:{default:['Poêle','8–10 min'],airfryer:['Air Fry','360°F · 5–7 min']}},
    {id:'everyday-garlic-bread',name:'Garlic bread express',slot:'lunch',time:8,kcal:220,protein:7,carbs:30,fat:9,tags:['everyday','bread','quick','vegetarian'],isSide:true,ingredients:[['Pain complet','2 tranches'],['Beurre','1 tbsp'],['Ail','1 clove'],['Persil','1 tbsp']],steps:['Mélangez beurre, ail et persil.','Tartinez le pain.','Faites dorer jusqu’à bords croustillants.'],tip:'Très simple avec pâtes, soupe ou salade.',methods:{default:['Four','400°F · 6–8 min'],airfryer:['Air Fry','350°F · 4–5 min']}},
    {id:'everyday-breadsticks',name:'Breadsticks parmesan & herbes',slot:'lunch',time:20,kcal:210,protein:8,carbs:30,fat:7,tags:['everyday','bread','italian','vegetarian'],isSide:true,ingredients:[['Farine','¾ cup'],['Parmesan','1 oz'],['Herbes','1 tbsp'],['Huile d’olive','1 tsp']],steps:['Formez une pâte simple.','Roulez en bâtonnets.','Ajoutez parmesan et herbes puis cuisez.'],tip:'À servir avec soupe ou sauce tomate.',methods:{default:['Four','400°F · 12–15 min'],airfryer:['Bake','340°F · 8–10 min']}},
    {id:'everyday-croutons',name:'Croûtons croustillants maison',slot:'lunch',time:8,kcal:140,protein:4,carbs:20,fat:5,tags:['everyday','bread','quick','airfryer'],isSide:true,ingredients:[['Pain complet','2 tranches'],['Huile d’olive','1 tsp'],['Herbes','1 tsp']],steps:['Coupez le pain en cubes.','Mélangez avec huile et herbes.','Cuisez jusqu’à croustillant en remuant une fois.'],tip:'Pour salades et soupes.',methods:{default:['Four','375°F · 8–10 min'],airfryer:['Air Fry','350°F · 5–7 min']}},
    {id:'everyday-crackers',name:'Crackers graines & herbes',slot:'lunch',time:18,kcal:160,protein:5,carbs:22,fat:6,tags:['everyday','bread','vegetarian'],isSide:true,ingredients:[['Farine','½ cup'],['Graines','2 tbsp'],['Huile d’olive','1 tsp'],['Eau','¼ cup']],steps:['Mélangez en pâte ferme.','Étalez très finement.','Découpez puis cuisez jusqu’à sec et doré.'],tip:'Parfaits avec houmous ou fromage.',methods:{default:['Four','375°F · 12–15 min'],airfryer:['Bake','330°F · 8–10 min']}},
    {id:'everyday-parmesan-crisps',name:'Tuiles de parmesan',slot:'lunch',time:7,kcal:110,protein:9,carbs:1,fat:8,tags:['everyday','quick','low-carb','gluten-free'],isSide:true,ingredients:[['Parmesan','2 oz']],steps:['Formez de petits tas de parmesan.','Aplatissez légèrement.','Cuisez jusqu’à doré puis laissez refroidir.'],tip:'Ajoute du croustillant aux salades et soupes.',methods:{default:['Four','400°F · 5–7 min'],airfryer:['Bake','350°F · 4–5 min']}},
    {id:'everyday-roasted-chickpeas',name:'Pois chiches croustillants paprika',slot:'lunch',time:18,kcal:190,protein:9,carbs:28,fat:5,tags:['everyday','vegan','high-fiber','airfryer'],isSide:true,ingredients:[['Pois chiches','1 cup'],['Paprika','1 tsp'],['Huile d’olive','1 tsp']],steps:['Séchez très bien les pois chiches.','Ajoutez huile et paprika.','Cuisez en secouant plusieurs fois.'],tip:'À ajouter sur bowls et salades.',methods:{default:['Four','400°F · 22–25 min'],airfryer:['Air Fry','390°F · 12–15 min']}},
    {id:'everyday-hummus',name:'Houmous minute',slot:'lunch',time:5,kcal:180,protein:7,carbs:22,fat:8,tags:['everyday','vegan','middle-eastern','quick','gluten-free'],isSide:true,ingredients:[['Pois chiches','1 cup'],['Citron','½'],['Tahini','1 tbsp'],['Ail','1 clove']],steps:['Mettez tout au blender.','Mixez en ajoutant un peu d’eau jusqu’à texture crémeuse.'],tip:'Sauce, dip ou base de sandwich.',methods:{default:['Blender','3–5 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-tzatziki',name:'Tzatziki express',slot:'lunch',time:7,kcal:90,protein:8,carbs:7,fat:3,tags:['everyday','vegetarian','greek','quick','gluten-free'],isSide:true,ingredients:[['Greek yogurt','½ cup'],['Concombre','½'],['Citron','½'],['Herbes','1 tbsp']],steps:['Râpez le concombre et essorez-le.','Mélangez avec yaourt, citron et herbes.'],tip:'Avec poulet, pita, pommes de terre ou crudités.',methods:{default:['Sans cuisson','7 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-yogurt-sauce',name:'Sauce yaourt citron & herbes',slot:'lunch',time:3,kcal:70,protein:7,carbs:5,fat:2,tags:['everyday','vegetarian','quick','gluten-free'],isSide:true,ingredients:[['Greek yogurt','½ cup'],['Citron','½'],['Herbes','1 tbsp']],steps:['Mélangez tous les ingrédients.','Salez et poivrez selon goût.'],tip:'Passe partout avec viande, légumes et bowls.',methods:{default:['Sans cuisson','3 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-pesto',name:'Pesto basilic express',slot:'lunch',time:5,kcal:150,protein:4,carbs:4,fat:14,tags:['everyday','italian','vegetarian','quick'],isSide:true,ingredients:[['Basilic','1 cup'],['Parmesan','1 oz'],['Huile d’olive','1 tbsp'],['Ail','1 clove']],steps:['Mixez basilic, parmesan et ail.','Ajoutez l’huile jusqu’à texture souhaitée.'],tip:'Pour pâtes, tartines, poulet ou légumes.',methods:{default:['Blender','5 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-garlic-butter',name:'Beurre à l’ail & persil',slot:'lunch',time:4,kcal:110,protein:0,carbs:1,fat:12,tags:['everyday','vegetarian','quick','gluten-free'],isSide:true,ingredients:[['Beurre','1 tbsp'],['Ail','1 clove'],['Persil','1 tbsp']],steps:['Ramollissez le beurre.','Mélangez avec ail et persil.'],tip:'Sur pain, légumes, pommes de terre ou viande.',methods:{default:['Sans cuisson','4 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-bruschetta',name:'Bruschetta tomate basilic',slot:'lunch',time:10,kcal:180,protein:5,carbs:28,fat:6,tags:['everyday','italian','vegetarian','quick'],isSide:true,ingredients:[['Pain complet','2 tranches'],['Tomates','1 cup'],['Basilic','1 tbsp'],['Huile d’olive','1 tsp']],steps:['Toastez le pain.','Coupez tomates et basilic.','Déposez la garniture juste avant de servir.'],tip:'Petit accompagnement frais et rapide.',methods:{default:['Toaster / four','8–10 min'],airfryer:['Air Fry','350°F · 4–5 min pour le pain']}},
    {id:'everyday-guacamole',name:'Guacamole très simple',slot:'lunch',time:5,kcal:170,protein:2,carbs:9,fat:15,tags:['everyday','vegan','mexican','quick','gluten-free'],isSide:true,ingredients:[['Avocat','1'],['Citron vert','½'],['Tomates','¼ cup']],steps:['Écrasez l’avocat.','Ajoutez citron vert et tomate.','Salez selon goût.'],tip:'Avec tacos, bowls ou crudités.',methods:{default:['Sans cuisson','5 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-pickled-onions',name:'Oignons rouges pickles express',slot:'lunch',time:8,kcal:35,protein:1,carbs:8,fat:0,tags:['everyday','vegan','quick','gluten-free'],isSide:true,ingredients:[['Oignon rouge','1'],['Vinaigre','½ cup'],['Sucre','1 tsp'],['Sel','½ tsp']],steps:['Émincez finement l’oignon.','Versez vinaigre chaud, sucre et sel.','Laissez reposer avant de servir.'],tip:'Transforme instantanément tacos, burgers et bowls.',methods:{default:['Sans cuisson','8 min + repos'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-vinaigrette',name:'Vinaigrette moutarde maison',slot:'lunch',time:3,kcal:90,protein:0,carbs:2,fat:9,tags:['everyday','vegan','quick','gluten-free'],isSide:true,ingredients:[['Huile d’olive','1 tbsp'],['Moutarde','1 tsp'],['Vinaigre','1 tsp']],steps:['Mélangez moutarde et vinaigre.','Fouettez avec l’huile.'],tip:'Une base pour toutes les salades.',methods:{default:['Sans cuisson','3 min'],airfryer:['Sans cuisson','Aucune cuisson nécessaire']}},
    {id:'everyday-roast-potatoes',name:'Pommes de terre rôties toutes simples',slot:'dinner',time:25,kcal:240,protein:5,carbs:42,fat:6,tags:['everyday','vegan','gluten-free','airfryer'],isSide:true,ingredients:[['Pommes de terre','7 oz'],['Huile d’olive','1 tsp'],['Paprika','1 tsp']],steps:['Coupez les pommes de terre en morceaux.','Mélangez avec huile et paprika.','Cuisez jusqu’à cœur et croustillantes.'],tip:'Accompagnement universel.',methods:{default:['Four','425°F · 25–30 min'],airfryer:['Air Fry','390°F · 16–20 min']}},
    {id:'everyday-couscous',name:'Couscous aux herbes 5 minutes',slot:'lunch',time:7,kcal:210,protein:7,carbs:42,fat:2,tags:['everyday','vegan','quick'],isSide:true,ingredients:[['Couscous','½ cup'],['Eau','½ cup'],['Herbes','1 tbsp'],['Citron','½']],steps:['Versez l’eau chaude sur le couscous.','Couvrez 5 minutes.','Égrenez puis ajoutez herbes et citron.'],tip:'Accompagnement ultra rapide pour poulet, poisson ou légumes.',methods:{default:['Bouilloire / casserole','7 min'],airfryer:['Sans cuisson Air Fryer','Utilisez eau chaude']}},
    {id:'everyday-rice',name:'Riz citron & persil',slot:'lunch',time:18,kcal:220,protein:4,carbs:46,fat:2,tags:['everyday','vegan','gluten-free'],isSide:true,ingredients:[['Riz cuit','1 cup'],['Citron','½'],['Persil','1 tbsp']],steps:['Cuisez ou réchauffez le riz.','Ajoutez citron, persil et poivre.'],tip:'Base neutre pour presque tous les bowls.',methods:{default:['Casserole / rice cooker','15–18 min'],airfryer:['Non recommandé','Préférez casserole ou rice cooker']}},
    {id:'everyday-green-beans',name:'Haricots verts ail & citron',slot:'dinner',time:12,kcal:100,protein:4,carbs:13,fat:4,tags:['everyday','vegan','quick','gluten-free','airfryer'],isSide:true,ingredients:[['Haricots verts','1 cup'],['Ail','1 clove'],['Citron','½'],['Huile d’olive','1 tsp']],steps:['Mélangez les haricots avec huile et ail.','Cuisez jusqu’à tendres mais encore fermes.','Ajoutez citron à la fin.'],tip:'Accompagnement léger et très simple.',methods:{default:['Poêle','10–12 min'],airfryer:['Air Fry','375°F · 8–10 min']}},
    {id:'everyday-roast-broccoli',name:'Brocoli rôti parmesan',slot:'dinner',time:15,kcal:150,protein:9,carbs:14,fat:7,tags:['everyday','vegetarian','quick','gluten-free','airfryer'],isSide:true,ingredients:[['Brocoli','2 cups'],['Parmesan','1 oz'],['Huile d’olive','1 tsp']],steps:['Mélangez brocoli et huile.','Cuisez jusqu’à bords grillés.','Ajoutez parmesan en fin de cuisson.'],tip:'Simple avec poulet, poisson ou pâtes.',methods:{default:['Four','425°F · 15–18 min'],airfryer:['Air Fry','380°F · 9–11 min']}}
  ];

  const SWEET_OCCASION_RECIPES = [
    ['birthday-vanilla','Gâteau anniversaire vanille & fruits rouges','cake'],
    ['chocolate-layer','Gâteau chocolat fondant de fête','cake'],
    ['lemon-cake','Gâteau citron glaçage léger','cake'],
    ['red-velvet','Red velvet cake','cake'],
    ['carrot-cake','Carrot cake cannelle & noix','cake'],
    ['strawberry-shortcake','Strawberry shortcake','cake'],
    ['cheesecake-berry','Cheesecake fruits rouges','cake'],
    ['apple-crumble','Crumble pommes cannelle','tart'],
    ['pear-tart','Tarte poire & chocolat','tart'],
    ['lemon-tart','Tarte citron meringuée','tart'],
    ['chocolate-cookies','Cookies chocolat de fête','cookies'],
    ['sugar-cookies','Sugar cookies décorés','cookies'],
    ['gingerbread','Biscuits pain d’épices','cookies'],
    ['brownies','Brownies chocolat fondants','brownie'],
    ['blondies','Blondies vanille chocolat blanc','brownie'],
    ['cupcakes-vanilla','Cupcakes vanille & fruits','cake'],
    ['cupcakes-chocolate','Cupcakes chocolat','cake'],
    ['cinnamon-rolls','Cinnamon rolls glaçage vanille','bread'],
    ['chocolate-mousse','Mousse au chocolat','dessert'],
    ['tiramisu','Tiramisu classique','dessert'],
    ['panna-cotta','Panna cotta fruits rouges','dessert'],
    ['macarons','Macarons vanille & framboise','cookies'],
    ['madeleines','Madeleines citron','cookies'],
    ['banana-bread-party','Banana bread chocolat & noix','bread']
  ].map(([id,name,kind],i)=>({
    id:'occasion-'+id,name,slot:'dinner',time:20+(i%5)*7,kcal:300+(i%6)*35,protein:5+(i%3),carbs:42+(i%5)*5,fat:12+(i%4)*3,
    tags:['dessert','occasion','sweet','vegetarian'],
    ingredients:kind==='cookies'?[['Farine','1 cup'],['Beurre','½ cup'],['Sucre','⅓ cup'],['Œufs','1']]:
      kind==='dessert'?[['Lait','1 cup'],['Sucre','¼ cup'],['Fruits rouges','½ cup']]:
      [['Farine','1 cup'],['Œufs','2'],['Sucre','½ cup'],['Beurre','¼ cup']],
    steps:kind==='dessert'?['Préparez la base sucrée.','Laissez prendre ou refroidir selon la recette.','Décorez avant de servir.']:['Préparez la pâte.','Versez ou formez dans le moule adapté.','Cuisez jusqu’à cuisson juste puis laissez refroidir avant de décorer.'],
    tip:'Une recette sucrée pensée pour fêtes, anniversaires ou occasions spéciales.',
    methods:{default:['Four / préparation froide',kind==='dessert'?'Selon prise au froid':'350°F · 18–30 min'],airfryer:['Bake',kind==='dessert'?'Non recommandé':'320°F · 12–22 min selon format']}
  }));
  RECIPES.push(...EVERYDAY_RECIPES.filter(x=>!RECIPES.some(r=>r.id===x.id)));
  RECIPES.push(...SWEET_OCCASION_RECIPES.filter(x=>!RECIPES.some(r=>r.id===x.id)));

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
  if(typeof renderRecipeIdeas==='function')renderRecipeIdeas();
})();
