// Kitchen Studio V3 — stability + personalization + rich recipe library
const EXTRA_RECIPES = [
{id:'herb-salmon',name:'Saumon citron herbes',slot:'dinner',time:20,kcal:560,protein:42,carbs:28,fat:27,tags:['fish','protein','high-protein','airfryer','french'],image:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',ingredients:[['Filet de saumon','5 oz'],['Pommes de terre','6 oz'],['Haricots verts','1 cup'],['Citron','½']],steps:['Assaisonnez le saumon avec citron et herbes.','Cuisez les pommes de terre puis ajoutez le saumon selon votre appareil.','Servez avec les haricots verts.'],tip:'Très bon avec une sauce yaourt-citron.',methods:{default:['Four','400°F · 12–15 min'],airfryer:['Air Fry','390°F · 9–11 min']}},
{id:'cod-provencal',name:'Cabillaud à la provençale',slot:'dinner',time:24,kcal:470,protein:43,carbs:36,fat:15,tags:['fish','protein','french'],image:'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80',ingredients:[['Cabillaud','5 oz'],['Tomates','1 cup'],['Courgette','1'],['Olives','1 tbsp']],steps:['Coupez courgette et tomates.','Disposez le poisson au centre avec les légumes.','Cuisez jusqu’à ce que le poisson se détache facilement.'],tip:'Ajoutez du basilic juste avant de servir.',methods:{default:['Four','400°F · 14–16 min'],airfryer:['Bake','375°F · 10–13 min']}},
{id:'beef-bowl',name:'Bœuf gingembre bowl',slot:'dinner',time:18,kcal:650,protein:45,carbs:66,fat:22,tags:['meat','beef','protein','chinese','quick'],image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',ingredients:[['Bœuf émincé','5 oz'],['Riz cuit','¾ cup'],['Brocoli','1 cup'],['Sauce soja','1 tbsp']],steps:['Saisissez le bœuf à feu vif.','Ajoutez brocoli, gingembre et soja.','Servez avec le riz chaud.'],tip:'Coupez le bœuf très fin pour une cuisson rapide.',methods:{default:['Wok / poêle','10–12 min'],airfryer:['Air Fry + plaques','Bœuf 400°F · 6–8 min; sauce sur plaques']}},
{id:'beef-burger',name:'Burger bœuf smash maison',slot:'dinner',time:22,kcal:720,protein:43,carbs:55,fat:35,tags:['meat','beef','american','occasion'],image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',ingredients:[['Bœuf haché','5 oz'],['Pain burger','1'],['Tomate','½'],['Salade','½ cup']],steps:['Formez une boule de bœuf.','Écrasez-la sur poêle très chaude et faites dorer.','Toastez le pain et assemblez.'],tip:'Ajoutez pickles et oignon selon vos goûts.',methods:{default:['Poêle','8–10 min'],airfryer:['Air Fry','390°F · 8–10 min']}},
{id:'pork-tenderloin',name:'Filet mignon moutarde & pommes',slot:'dinner',time:30,kcal:590,protein:47,carbs:47,fat:22,tags:['meat','pork','protein','french','airfryer'],image:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',ingredients:[['Filet mignon de porc','6 oz'],['Pomme','1'],['Pommes de terre','6 oz'],['Moutarde','1 tbsp']],steps:['Badigeonnez le porc de moutarde.','Ajoutez pommes et pommes de terre.','Cuisez jusqu’à température interne sûre puis laissez reposer.'],tip:'Le repos de 5 minutes garde la viande plus juteuse.',methods:{default:['Four','400°F · 22–28 min'],airfryer:['Roast','380°F · 18–22 min']}},
{id:'thai-chicken',name:'Poulet thaï coco basilic',slot:'dinner',time:24,kcal:640,protein:46,carbs:58,fat:24,tags:['meat','chicken','protein','thai'],image:'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','5 oz'],['Lait de coco','½ cup'],['Poivron','½'],['Riz cuit','¾ cup']],steps:['Saisissez le poulet en morceaux.','Ajoutez poivron, curry et lait de coco.','Laissez réduire puis servez sur le riz avec basilic.'],tip:'Dosez le piment séparément pour ajuster le niveau épicé.',methods:{default:['Poêle','20–24 min'],airfryer:['Air Fry + plaques','Poulet 390°F · 11–13 min; sauce sur plaques']}},
{id:'chicken-parm',name:'Chicken parmesan croustillant',slot:'dinner',time:28,kcal:690,protein:54,carbs:58,fat:24,tags:['meat','chicken','protein','italian','airfryer'],image:'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80',ingredients:[['Blanc de poulet','5 oz'],['Chapelure','⅓ cup'],['Passata tomate','½ cup'],['Parmesan','1 oz']],steps:['Panez le poulet.','Cuisez jusqu’à croustillant.','Ajoutez tomate et parmesan puis gratinez brièvement.'],tip:'Servez avec salade ou pâtes selon votre objectif.',methods:{default:['Four','425°F · 20–24 min'],airfryer:['Air Fry','390°F · 14–17 min']}},
{id:'vegan-curry',name:'Curry vegan pois chiches & coco',slot:'dinner',time:25,kcal:590,protein:21,carbs:76,fat:22,tags:['vegan','vegetarian','thai','protein'],image:'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pois chiches','1 cup'],['Lait de coco','½ cup'],['Épinards','1 cup'],['Riz cuit','½ cup']],steps:['Faites revenir les épices.','Ajoutez pois chiches et lait de coco.','Incorporez les épinards puis servez avec riz.'],tip:'Se congèle très bien en portions individuelles.',methods:{default:['Casserole','22–25 min'],airfryer:['Plaques recommandées','Cuisson sauce sur plaques']}},
{id:'vegan-noodles',name:'Nouilles vegan sésame légumes',slot:'lunch',time:16,kcal:520,protein:19,carbs:73,fat:18,tags:['vegan','vegetarian','chinese','quick'],image:'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1000&q=80',ingredients:[['Nouilles','3 oz'],['Brocoli','1 cup'],['Carotte','1'],['Sauce soja','1 tbsp']],steps:['Cuisez les nouilles.','Sautez les légumes rapidement.','Mélangez avec soja, sésame et nouilles.'],tip:'Ajoutez tofu ou edamame pour plus de protéines.',methods:{default:['Wok','16 min'],airfryer:['Plaques recommandées','Les nouilles sont plus adaptées au wok']}},
{id:'croque-monsieur',name:'Croque-monsieur léger',slot:'lunch',time:15,kcal:520,protein:33,carbs:48,fat:21,tags:['meat','french','quick','airfryer'],image:'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pain complet','2 tranches'],['Jambon','3 oz'],['Fromage','1 oz'],['Moutarde','1 tsp']],steps:['Montez le sandwich avec jambon, fromage et moutarde.','Cuisez jusqu’à pain doré et fromage fondu.'],tip:'Ajoutez une salade verte pour un repas complet.',methods:{default:['Poêle / four','10–12 min'],airfryer:['Air Fry','360°F · 6–8 min']}},
{id:'italian-pesto',name:'Pasta pesto poulet & tomate',slot:'dinner',time:20,kcal:700,protein:48,carbs:78,fat:22,tags:['meat','chicken','protein','italian','quick'],image:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pâtes','3 oz sec'],['Poulet','4 oz'],['Pesto','1 tbsp'],['Tomates cerises','½ cup']],steps:['Cuisez les pâtes.','Cuisez et tranchez le poulet.','Mélangez pâtes, pesto, tomates et poulet.'],tip:'Gardez un peu d’eau de cuisson pour détendre le pesto.',methods:{default:['Plaques','20 min'],airfryer:['Air Fry + plaques','Poulet 390°F · 11–13 min']}},
{id:'american-tacos',name:'Tacos poulet BBQ',slot:'lunch',time:18,kcal:610,protein:44,carbs:61,fat:20,tags:['meat','chicken','american','quick'],image:'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','4 oz'],['Tortilla complète','2'],['Chou','1 cup'],['Sauce BBQ','1 tbsp']],steps:['Cuisez le poulet avec paprika.','Réchauffez les tortillas.','Assemblez avec chou et sauce BBQ.'],tip:'Ajoutez yaourt citronné pour remplacer une sauce plus riche.',methods:{default:['Poêle','16–18 min'],airfryer:['Air Fry','390°F · 11–13 min']}},
{id:'french-omelet',name:'Omelette fines herbes & chèvre',slot:'breakfast',time:10,kcal:410,protein:29,carbs:12,fat:27,tags:['breakfast','vegetarian','protein','french','quick'],image:'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=1000&q=80',ingredients:[['Œufs','3'],['Fromage de chèvre','1 oz'],['Épinards','1 cup'],['Herbes','1 tbsp']],steps:['Battez les œufs.','Cuisez doucement en ramenant les bords vers le centre.','Ajoutez chèvre et herbes puis pliez.'],tip:'Feu doux = omelette plus tendre.',methods:{default:['Poêle','8–10 min'],airfryer:['Bake','325°F · 8–10 min dans moule']}},
{id:'breakfast-burrito',name:'Breakfast burrito protéiné',slot:'breakfast',time:15,kcal:540,protein:37,carbs:49,fat:21,tags:['breakfast','protein','american','quick'],image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1000&q=80',ingredients:[['Tortilla complète','1'],['Œufs','2'],['Haricots noirs','½ cup'],['Fromage','1 oz']],steps:['Brouillez les œufs.','Ajoutez haricots et fromage.','Roulez dans la tortilla et grillez légèrement.'],tip:'Préparez-en plusieurs et congelez-les.',methods:{default:['Poêle','15 min'],airfryer:['Reheat','350°F · 4–5 min']}},
{id:'berry-smoothie',name:'Smoothie fruits rouges protéiné',slot:'breakfast',time:5,kcal:360,protein:31,carbs:43,fat:7,tags:['smoothie','drink','breakfast','protein','vegetarian','quick'],image:'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1000&q=80',ingredients:[['Fruits rouges','1 cup'],['Skyr','¾ cup'],['Lait','½ cup'],['Banane','½']],steps:['Placez tous les ingrédients dans le blender.','Mixez jusqu’à texture lisse.'],tip:'Ajoutez glace ou lait pour ajuster la texture.',methods:{default:['Blender','1 min'],airfryer:['Sans cuisson','Aucune cuisson']}},
{id:'green-smoothie',name:'Smoothie vert mangue épinard',slot:'breakfast',time:5,kcal:300,protein:18,carbs:52,fat:4,tags:['smoothie','drink','breakfast','vegetarian','quick'],image:'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=1000&q=80',ingredients:[['Mangue','1 cup'],['Épinards','1 cup'],['Skyr','½ cup'],['Lait','½ cup']],steps:['Mixez tous les ingrédients jusqu’à homogénéité.'],tip:'Le skyr rend le smoothie plus rassasiant.',methods:{default:['Blender','1 min'],airfryer:['Sans cuisson','Aucune cuisson']}},
{id:'iced-matcha',name:'Iced matcha latte',slot:'breakfast',time:4,kcal:140,protein:8,carbs:18,fat:4,tags:['drink','vegetarian','quick'],image:'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=1000&q=80',ingredients:[['Matcha','1 tsp'],['Lait','1 cup'],['Miel','1 tsp'],['Glace','1 cup']],steps:['Fouettez le matcha avec un peu d’eau.','Ajoutez glace, lait et miel.'],tip:'Le miel est facultatif si vous choisissez peu de sucre.',methods:{default:['Sans cuisson','4 min'],airfryer:['Sans cuisson','Aucune cuisson']}},
{id:'protein-chocolate',name:'Chocolat chaud protéiné',slot:'breakfast',time:7,kcal:230,protein:25,carbs:24,fat:6,tags:['drink','protein','breakfast','quick'],image:'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=1000&q=80',ingredients:[['Lait','1 cup'],['Cacao','1 tbsp'],['Protéine chocolat','1 scoop']],steps:['Chauffez le lait sans bouillir.','Fouettez le cacao puis incorporez la protéine hors du feu.'],tip:'Évitez de faire bouillir après ajout de la poudre protéinée.',methods:{default:['Casserole / micro-ondes','5–7 min'],airfryer:['Sans cuisson air fryer','Utilisez casserole ou micro-ondes']}},
{id:'apple-tart',name:'Tarte fine aux pommes',slot:'dinner',time:35,kcal:390,protein:6,carbs:58,fat:16,tags:['dessert','french','occasion','vegetarian'],image:'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pâte feuilletée','1 portion'],['Pomme','1'],['Cannelle','1 tsp'],['Miel','1 tsp']],steps:['Étalez la pâte et disposez les pommes fines.','Saupoudrez de cannelle.','Cuisez jusqu’à pâte bien dorée.'],tip:'Parfait pour une occasion sans gâteau lourd.',methods:{default:['Four','400°F · 25–30 min'],airfryer:['Bake','350°F · 14–18 min en format individuel']}},
{id:'birthday-cake',name:'Gâteau anniversaire vanille & fruits',slot:'dinner',time:55,kcal:520,protein:8,carbs:72,fat:22,tags:['dessert','occasion','american','vegetarian'],image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',ingredients:[['Farine','1 cup'],['Œufs','2'],['Sucre','½ cup'],['Fruits rouges','1 cup']],steps:['Préparez la pâte à gâteau.','Cuisez jusqu’à lame sèche au centre.','Laissez refroidir puis décorez avec fruits et crème selon envie.'],tip:'Ajoutez l’événement à votre semaine pour inclure les ingrédients dans les courses.',methods:{default:['Four','350°F · 30–35 min'],airfryer:['Bake','320°F · 22–28 min selon moule']}},
{id:'holiday-cookies',name:'Cookies fête chocolat',slot:'dinner',time:28,kcal:310,protein:5,carbs:39,fat:16,tags:['dessert','occasion','american','vegetarian'],image:'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=80',ingredients:[['Farine','1 cup'],['Beurre','½ cup'],['Sucre','⅓ cup'],['Chocolat','½ cup']],steps:['Mélangez la pâte.','Formez des cookies espacés.','Cuisez jusqu’à bords dorés.'],tip:'Préparez la pâte à l’avance et congelez les portions.',methods:{default:['Four','350°F · 10–12 min'],airfryer:['Bake','320°F · 7–9 min']}},
{id:'thai-shrimp',name:'Crevettes thaï citron vert',slot:'dinner',time:17,kcal:510,protein:39,carbs:55,fat:15,tags:['fish','protein','thai','quick','airfryer'],image:'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=1000&q=80',ingredients:[['Crevettes','6 oz'],['Riz cuit','¾ cup'],['Poivron','½'],['Citron vert','1']],steps:['Assaisonnez les crevettes avec citron vert et ail.','Cuisez rapidement jusqu’à opaques.','Servez avec riz et poivron.'],tip:'Les crevettes cuisent très vite : évitez la surcuisson.',methods:{default:['Poêle','6–8 min'],airfryer:['Air Fry','390°F · 6–8 min']}},
{id:'chinese-orange-chicken',name:'Poulet orange maison',slot:'dinner',time:25,kcal:660,protein:47,carbs:78,fat:17,tags:['meat','chicken','protein','chinese','airfryer'],image:'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','5 oz'],['Riz cuit','¾ cup'],['Orange','1'],['Sauce soja','1 tbsp']],steps:['Cuisez le poulet jusqu’à doré.','Réduisez jus d’orange et soja en sauce.','Enrobez le poulet et servez avec riz.'],tip:'Contrôlez le sucre en n’ajoutant pas de sucre supplémentaire.',methods:{default:['Poêle','20–25 min'],airfryer:['Air Fry + plaques','Poulet 390°F · 12–14 min; sauce sur plaques']}},
{id:'caprese-toast',name:'Toast caprese pesto',slot:'lunch',time:10,kcal:460,protein:23,carbs:44,fat:21,tags:['vegetarian','italian','quick'],image:'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pain complet','2 tranches'],['Mozzarella','2 oz'],['Tomate','1'],['Pesto','1 tbsp']],steps:['Tartinez le pain de pesto.','Ajoutez tomate et mozzarella.','Grillez jusqu’à fromage fondu.'],tip:'Ajoutez roquette après cuisson.',methods:{default:['Four / poêle','8–10 min'],airfryer:['Air Fry','360°F · 5–6 min']}}
];
RECIPES.push(...EXTRA_RECIPES.filter(x=>!RECIPES.some(r=>r.id===x.id)));

const REGIONAL_RECIPES = [
{id:'greek-souvlaki',name:'Souvlaki poulet, tzatziki & citron',slot:'dinner',time:25,kcal:590,protein:48,carbs:45,fat:21,tags:['greek','mediterranean','chicken','meat','protein','high-protein','gluten-free','summer'],image:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','5 oz'],['Greek yogurt','¼ cup'],['Concombre','½'],['Citron','½'],['Riz cuit','½ cup']],steps:['Marinez le poulet avec citron et herbes.','Cuisez jusqu’à doré.','Préparez un tzatziki rapide.','Servez avec riz ou salade.'],tip:'Très bon froid le lendemain.',methods:{default:['Poêle / grill','18–22 min'],airfryer:['Air Fry','390°F · 11–13 min']}},
{id:'spanish-paella',name:'Paella express crevettes & légumes',slot:'dinner',time:30,kcal:610,protein:36,carbs:78,fat:16,tags:['spanish','fish','pescatarian','gluten-free','one-pot','family'],image:'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1000&q=80',ingredients:[['Crevettes','5 oz'],['Riz cuit','¾ cup'],['Poivron','½'],['Edamame','½ cup']],steps:['Faites revenir poivron et épices.','Ajoutez le riz.','Ajoutez les crevettes en fin de cuisson.'],tip:'Une grande poêle donne une cuisson plus régulière.',methods:{default:['Grande poêle','28–30 min'],airfryer:['Plaques recommandées','Cuisson one-pan']}},
{id:'mexican-burrito-bowl',name:'Burrito bowl poulet, maïs & haricots',slot:'lunch',time:22,kcal:650,protein:46,carbs:76,fat:18,tags:['mexican','chicken','meat','protein','bowl','meal-prep','high-fiber','gluten-free'],image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','4 oz'],['Riz cuit','¾ cup'],['Pois chiches','½ cup'],['Avocat','½']],steps:['Cuisez le poulet avec cumin et paprika.','Réchauffez riz et pois chiches.','Assemblez avec avocat.'],tip:'Parfait en meal prep.',methods:{default:['Poêle','20–22 min'],airfryer:['Air Fry','Poulet 390°F · 11–13 min']}},
{id:'japanese-teriyaki-salmon',name:'Saumon teriyaki & riz japonais',slot:'dinner',time:20,kcal:630,protein:43,carbs:70,fat:20,tags:['japanese','fish','pescatarian','protein','airfryer','family'],image:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',ingredients:[['Filet de saumon','5 oz'],['Riz cuit','¾ cup'],['Sauce soja','1 tbsp'],['Miel','1 tsp'],['Brocoli','1 cup']],steps:['Mélangez soja et miel.','Badigeonnez le saumon.','Cuisez saumon et brocoli.','Servez avec le riz.'],tip:'Réduisez le miel si vous choisissez peu de sucre.',methods:{default:['Four','400°F · 12–14 min'],airfryer:['Air Fry','390°F · 8–10 min']}},
{id:'korean-bibimbap',name:'Bibimbap bœuf & légumes',slot:'dinner',time:28,kcal:680,protein:42,carbs:76,fat:23,tags:['korean','beef','meat','protein','bowl','high-fiber'],image:'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1000&q=80',ingredients:[['Bœuf émincé','4 oz'],['Riz cuit','¾ cup'],['Carotte','1'],['Épinards','1 cup'],['Œuf','1']],steps:['Saisissez le bœuf avec soja et ail.','Cuisez carotte et épinards.','Préparez un œuf.','Assemblez sur le riz.'],tip:'Servez la sauce pimentée à part.',methods:{default:['Poêle','25–28 min'],airfryer:['Air Fry + plaques','Bœuf 400°F · 6–8 min']}},
{id:'vietnamese-pho',name:'Pho poulet express',slot:'dinner',time:30,kcal:520,protein:40,carbs:61,fat:12,tags:['vietnamese','chicken','meat','soup','dairy-free','low-sugar','comfort'],image:'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','4 oz'],['Nouilles','3 oz'],['Carotte','1'],['Herbes','1 cup']],steps:['Faites frémir un bouillon avec gingembre.','Ajoutez le poulet.','Cuisez les nouilles.','Assemblez avec herbes fraîches.'],tip:'Ajoutez citron vert au dernier moment.',methods:{default:['Casserole','30 min'],airfryer:['Plaques recommandées','Bouillon sur plaques']}},
{id:'indian-dal',name:'Dal lentilles & épinards',slot:'dinner',time:28,kcal:520,protein:24,carbs:74,fat:14,tags:['indian','vegan','vegetarian','gluten-free','dairy-free','high-fiber','budget','one-pot','winter'],image:'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pois chiches','1 cup'],['Épinards','1 cup'],['Tomates','1 cup'],['Lait de coco','⅓ cup']],steps:['Faites revenir les épices.','Ajoutez pois chiches, tomate et coco.','Mijotez puis ajoutez les épinards.'],tip:'Se conserve très bien plusieurs jours.',methods:{default:['Casserole','25–28 min'],airfryer:['Plaques recommandées','Cuisson one-pot']}},
{id:'moroccan-tagine',name:'Tajine poulet, carottes & pois chiches',slot:'dinner',time:35,kcal:620,protein:44,carbs:64,fat:20,tags:['moroccan','chicken','meat','protein','one-pot','high-fiber','winter','family'],image:'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','5 oz'],['Pois chiches','½ cup'],['Carotte','1'],['Tomates','½ cup']],steps:['Faites dorer le poulet avec les épices.','Ajoutez carotte, tomate et pois chiches.','Couvrez et mijotez.'],tip:'Excellent préparé la veille.',methods:{default:['Cocotte','30–35 min'],airfryer:['Plaques recommandées','Mijotage préférable']}},
{id:'lebanese-falafel-bowl',name:'Bowl falafels, houmous & crudités',slot:'lunch',time:24,kcal:570,protein:22,carbs:67,fat:24,tags:['lebanese','middle-eastern','vegan','vegetarian','bowl','high-fiber','meal-prep','summer','airfryer'],image:'https://images.unsplash.com/photo-1593001874117-c99c800e3eb3?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pois chiches','1 cup'],['Concombre','½'],['Tomates','½ cup'],['Pita','1']],steps:['Formez ou utilisez des falafels.','Cuisez jusqu’à croustillant.','Assemblez avec crudités et sauce citronnée.'],tip:'Gardez les crudités séparées jusqu’au repas.',methods:{default:['Four','400°F · 18–22 min'],airfryer:['Air Fry','375°F · 10–12 min']}},
{id:'shakshuka',name:'Shakshuka œufs & tomate',slot:'breakfast',time:22,kcal:430,protein:24,carbs:28,fat:24,tags:['middle-eastern','vegetarian','brunch','low-carb','gluten-free','one-pot','comfort'],image:'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1000&q=80',ingredients:[['Œufs','2'],['Tomates','1½ cups'],['Poivron','½'],['Feta','1 oz']],steps:['Faites mijoter tomate et poivron.','Ajoutez les œufs.','Couvrez jusqu’à cuisson des blancs.','Ajoutez feta et herbes.'],tip:'Ajoutez du pain seulement si vous voulez plus de glucides.',methods:{default:['Poêle','20–22 min'],airfryer:['Bake','350°F · 10–12 min']}},
{id:'chicken-caesar',name:'Salade César poulet protéinée',slot:'lunch',time:18,kcal:510,protein:46,carbs:25,fat:25,tags:['salad','chicken','meat','protein','low-carb','quick','summer'],image:'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','5 oz'],['Salade','2 cups'],['Parmesan','1 oz'],['Greek yogurt','¼ cup']],steps:['Cuisez et tranchez le poulet.','Mélangez yaourt, citron et parmesan.','Assemblez avec la salade.'],tip:'Ajoutez croûtons seulement selon vos objectifs.',methods:{default:['Poêle','15–18 min'],airfryer:['Air Fry','390°F · 11–13 min']}},
{id:'tomato-soup',name:'Soupe tomate rôtie & basilic',slot:'dinner',time:32,kcal:360,protein:13,carbs:43,fat:16,tags:['soup','vegetarian','budget','comfort','winter','gluten-free'],image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80',ingredients:[['Tomates','2 cups'],['Carotte','1'],['Greek yogurt','2 tbsp']],steps:['Rôtissez les légumes.','Mixez avec eau ou bouillon.','Réchauffez et ajoutez basilic.'],tip:'Une recette simple et économique.',methods:{default:['Four + casserole','30–32 min'],airfryer:['Roast + casserole','Tomates 390°F · 14–16 min']}},
{id:'onepot-pasta',name:'One-pot pasta tomate & épinards',slot:'dinner',time:20,kcal:590,protein:25,carbs:84,fat:16,tags:['pasta','italian','vegetarian','one-pot','budget','comfort','family','quick'],image:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pâtes','3 oz sec'],['Tomates','1 cup'],['Épinards','1 cup'],['Parmesan','1 oz']],steps:['Mettez pâtes, tomates et eau dans une casserole.','Cuisez en mélangeant.','Ajoutez épinards et parmesan.'],tip:'Très pratique pour une soirée sans vaisselle.',methods:{default:['Casserole','18–20 min'],airfryer:['Plaques recommandées','One-pot sur plaques']}},
{id:'zoodle-chicken',name:'Poulet citron & spaghetti de courgette',slot:'dinner',time:18,kcal:410,protein:47,carbs:18,fat:17,tags:['chicken','meat','protein','low-carb','gluten-free','dairy-free','quick','summer'],image:'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=80',ingredients:[['Poulet','5 oz'],['Courgette','2'],['Citron','½'],['Huile d’olive','1 tbsp']],steps:['Cuisez le poulet au citron.','Faites sauter rapidement la courgette.','Servez ensemble.'],tip:'Très léger et rapide.',methods:{default:['Poêle','16–18 min'],airfryer:['Air Fry + plaques','Poulet 390°F · 11–13 min']}},
{id:'chia-pudding',name:'Chia pudding coco & fruits rouges',slot:'breakfast',time:5,kcal:330,protein:12,carbs:35,fat:17,tags:['breakfast','vegetarian','gluten-free','dairy-free','low-sugar','meal-prep'],image:'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1000&q=80',ingredients:[['Graines de chia','3 tbsp'],['Lait de coco','¾ cup'],['Fruits rouges','½ cup']],steps:['Mélangez chia et lait de coco.','Réfrigérez au moins 4 heures.','Ajoutez les fruits.'],tip:'Préparez plusieurs portions à la fois.',methods:{default:['Sans cuisson','5 min'],airfryer:['Sans cuisson','Aucune cuisson']}},
{id:'brunch-french-toast',name:'French toast banane & cannelle',slot:'breakfast',time:15,kcal:490,protein:23,carbs:62,fat:17,tags:['breakfast','brunch','american','comfort','vegetarian','occasion'],image:'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pain complet','2 tranches'],['Œufs','2'],['Banane','½'],['Cannelle','1 tsp']],steps:['Battez œufs et cannelle.','Trempez le pain puis cuisez.','Ajoutez banane et yaourt.'],tip:'Parfait pour un brunch.',methods:{default:['Poêle','12–15 min'],airfryer:['Bake','350°F · 7–9 min']}},
{id:'date-night-steak',name:'Steak, pommes grenailles & asperges',slot:'dinner',time:32,kcal:760,protein:52,carbs:52,fat:37,tags:['beef','meat','protein','date-night','occasion','gluten-free'],image:'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',ingredients:[['Bœuf émincé','6 oz'],['Pommes de terre','7 oz'],['Brocoli','1 cup']],steps:['Cuisez les pommes de terre.','Saisissez le bœuf.','Cuisez les légumes et laissez reposer la viande.'],tip:'Laissez reposer la viande avant de couper.',methods:{default:['Poêle + four','28–32 min'],airfryer:['Roast + poêle','Pommes 390°F · 16–20 min']}},
{id:'family-lasagna',name:'Lasagnes familiales poulet & épinards',slot:'dinner',time:50,kcal:720,protein:49,carbs:72,fat:27,tags:['italian','chicken','meat','pasta','family','comfort','meal-prep'],image:'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pâtes','3 oz sec'],['Poulet','5 oz'],['Épinards','1 cup'],['Passata tomate','1 cup']],steps:['Préparez la garniture poulet-tomate.','Montez les couches.','Cuisez jusqu’à gratiné.'],tip:'Préparez deux portions et congelez-en une.',methods:{default:['Four','375°F · 35–40 min'],airfryer:['Bake','Petite portion 330°F · 22–28 min']}},
{id:'summer-salad',name:'Salade concombre, feta & fruits',slot:'lunch',time:8,kcal:330,protein:13,carbs:34,fat:17,tags:['salad','vegetarian','mediterranean','summer','gluten-free','quick'],image:'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',ingredients:[['Feta','1 oz'],['Concombre','½'],['Fruits rouges','½ cup'],['Citron','½']],steps:['Coupez les ingrédients.','Mélangez avec citron et herbes.'],tip:'Servez très frais.',methods:{default:['Sans cuisson','8 min'],airfryer:['Sans cuisson','Aucune cuisson']}},
{id:'winter-lentil-soup',name:'Soupe pois chiches, carotte & cumin',slot:'dinner',time:35,kcal:430,protein:25,carbs:66,fat:8,tags:['soup','vegan','vegetarian','winter','budget','high-fiber','one-pot','gluten-free','dairy-free'],image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80',ingredients:[['Pois chiches','1 cup'],['Carotte','1'],['Tomates','½ cup']],steps:['Faites revenir carotte et cumin.','Ajoutez pois chiches, tomate et eau.','Mijotez puis mixez partiellement.'],tip:'Très économique pour plusieurs portions.',methods:{default:['Casserole','30–35 min'],airfryer:['Plaques recommandées','One-pot']}}
];
RECIPES.push(...REGIONAL_RECIPES.filter(x=>!RECIPES.some(r=>r.id===x.id)));

const TAG_AUGMENTS={
'overnight-oats':['breakfast','meal-prep','budget','vegetarian'],
'egg-toast':['breakfast','brunch','vegetarian'],
'protein-pancakes':['breakfast','brunch','protein','vegetarian'],
'chicken-bowl':['chicken','meat','protein','bowl','mediterranean','meal-prep'],
'turkey-wrap':['meat','protein','meal-prep','american'],
'greek-salad':['greek','mediterranean','salad','vegetarian','high-fiber','summer'],
'tofu-bowl':['vegan','vegetarian','bowl','high-fiber','dairy-free'],
'salmon-rice':['fish','pescatarian','protein','bowl','gluten-free'],
'fried-rice':['chinese','chicken','meat','protein','budget'],
'chicken-pasta':['chicken','meat','protein','pasta','italian','comfort'],
'sheet-pan':['chicken','meat','protein','meal-prep','family','gluten-free'],
'vegan-curry':['indian','one-pot','high-fiber','gluten-free','dairy-free'],
'berry-smoothie':['low-sugar'],
'green-smoothie':['low-sugar'],
'caprese-toast':['mediterranean'],
'apple-tart':['dessert','occasion'],
'birthday-cake':['dessert','occasion'],
'holiday-cookies':['dessert','occasion']
};
Object.entries(TAG_AUGMENTS).forEach(([id,tags])=>{const r=RECIPES.find(x=>x.id===id);if(r)r.tags=[...new Set([...(r.tags||[]),...tags])]});

state.favorites=new Set(JSON.parse(localStorage.getItem('miseFavorites')||'[]'));
state.extraExpenses=JSON.parse(localStorage.getItem('miseExtraExpenses')||'[]');
state.account=JSON.parse(localStorage.getItem('miseAccount')||'null');
state.profile.proteinPriority=state.profile.proteinPriority||'normal';
state.profile.sugar=state.profile.sugar||'normal';
state.profile.notes=state.profile.notes||'';

const v3BaseRenderAppliances=renderAppliances;
renderAppliances=function(filter){
  if(state.profile.applianceId) appliances.forEach(a=>a.favorite=a.id===state.profile.applianceId);
  return v3BaseRenderAppliances(filter);
};
const v3BasePopulateApplianceSelect=populateApplianceSelect;
populateApplianceSelect=function(){
  v3BasePopulateApplianceSelect();
  const sel=$('#detailApplianceSelect');
  if(sel&&state.profile.applianceId&&appliances.some(a=>a.id===state.profile.applianceId)) sel.value=state.profile.applianceId;
};

function savePlan(){localStorage.setItem('misePlan',JSON.stringify(state.plan))}
function saveProfileV3(){localStorage.setItem('miseProfile',JSON.stringify(state.profile))}
function favoriteRecipe(id){state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);localStorage.setItem('miseFavorites',JSON.stringify([...state.favorites]));renderRecipes(window.__recipeFilter||'all');renderAccount();if(currentRecipe?.id===id)syncDetailActions()}
function syncDetailActions(){if(!currentRecipe)return;const b=$('#detailFavoriteBtn');if(b)b.textContent=state.favorites.has(currentRecipe.id)?'♥ Favori':'♡ Ajouter aux favoris'}
function recipeCategory(r){
 const t=new Set(r.tags||[]);if(t.has('fish'))return'fish';if(t.has('beef'))return'beef';if(t.has('pork'))return'pork';if(t.has('chicken'))return'chicken';if(t.has('vegan'))return'vegan';if(t.has('smoothie'))return'smoothie';if(t.has('drink'))return'drink';if(t.has('breakfast')||r.slot==='breakfast')return'breakfast';if(t.has('french'))return'french';if(t.has('american'))return'american';if(t.has('chinese'))return'chinese';if(t.has('thai'))return'thai';if(t.has('italian'))return'italian';if(t.has('dessert'))return'dessert';if(t.has('occasion'))return'occasion';if(t.has('meat'))return'meat';if(t.has('protein')||t.has('high-protein'))return'protein';return'other'
}
function eligibleByProfile(r){
 const tags=new Set(r.tags||[]),diet=state.profile.diet;
 if(diet==='vegan'&&!tags.has('vegan'))return false;
 if(diet==='vegetarian'&&!(tags.has('vegetarian')||tags.has('vegan')||r.slot==='breakfast'))return false;
 if(diet==='pescatarian'&&(tags.has('meat')||tags.has('chicken')||tags.has('beef')||tags.has('pork')))return false;
 return true;
}
function scoreRecipe(r){
 let score=Math.random()*2;if((state.profile.proteinPriority==='high'||state.profile.proteinPriority==='very-high')&&(r.tags.includes('high-protein')||r.tags.includes('protein')))score+=4;if(state.profile.sugar==='low'&&(r.tags.includes('dessert')||r.tags.includes('drink')))score-=2;
 const active=appliances.find(a=>a.id===state.profile.applianceId)||appliances.find(a=>a.favorite);if(active?.type==='Air Fryer'&&r.tags.includes('airfryer'))score+=2;return score
}
function chooseDifferent(slot,current){
 const pool=RECIPES.filter(r=>r.slot===slot&&r.id!==current&&eligibleByProfile(r)).sort((a,b)=>scoreRecipe(b)-scoreRecipe(a));return (pool[0]||RECIPES.find(r=>r.slot===slot&&r.id!==current)||recipe(current)).id
}
function planIngredientKeys(plan){
 const map=new Map();(plan||[]).flat().map(recipeById).filter(Boolean).forEach(r=>r.ingredients.forEach(([name])=>{const key=name.toLowerCase().replace(/\s/g,'-');if(!state.checked.has(key)&&!map.has(key))map.set(key,name)}));return map
}
function estimatePlanGroceryCost(plan){return [...planIngredientKeys(plan).values()].reduce((sum,name)=>sum+estimateItemPrice(name),0)}
function recipeMarginalCost(r,used){
 let cost=0;(r.ingredients||[]).forEach(([name])=>{const key=name.toLowerCase().replace(/\s/g,'-');if(!state.checked.has(key)&&!used.has(key))cost+=estimateItemPrice(name)});return cost
}
function addRecipeIngredients(r,used){(r.ingredients||[]).forEach(([name])=>used.add(name.toLowerCase().replace(/\s/g,'-')))}
function buildBudgetPlan(target){
 const used=new Set([...state.checked]),counts=new Map(),plan=[];
 for(let d=0;d<7;d++){const day=[];for(const slot of ['breakfast','lunch','dinner']){
   const pool=RECIPES.filter(r=>r.slot===slot&&eligibleByProfile(r));
   const ranked=pool.map(r=>{const marginal=recipeMarginalCost(r,used),repeat=counts.get(r.id)||0,protein=(r.tags.includes('protein')||r.tags.includes('high-protein'))?1:0,budgetTag=r.tags.includes('budget')?1:0;return{r,marginal,score:marginal*8+repeat*5-protein*(state.profile.proteinPriority==='high'||state.profile.proteinPriority==='very-high'?3:0)-budgetTag*4-Math.min(2,scoreRecipe(r))}}).sort((a,b)=>a.score-b.score);
   let pick=ranked.find(x=>estimateUsedCost(used)+x.marginal<=target&&((counts.get(x.r.id)||0)<3))||ranked.find(x=>estimateUsedCost(used)+x.marginal<=target)||ranked[0];
   day.push(pick.r.id);addRecipeIngredients(pick.r,used);counts.set(pick.r.id,(counts.get(pick.r.id)||0)+1)
 }plan.push(day)}
 return plan
}
function estimateUsedCost(used){
 let sum=0;used.forEach(key=>{if(state.checked.has(key))return;const name=[...RECIPES].flatMap(r=>r.ingredients.map(i=>i[0])).find(n=>n.toLowerCase().replace(/\s/g,'-')===key);if(name)sum+=estimateItemPrice(name)});return sum
}
function enforceBudgetPlan(plan){
 const target=Math.max(20,Number(state.profile.budget||90)),cost=estimatePlanGroceryCost(plan);
 if(cost<=target)return plan;
 const rebuilt=buildBudgetPlan(target);
 return estimatePlanGroceryCost(rebuilt)<cost?rebuilt:plan
}
function updateBudgetUI(grocery){
 const target=Math.max(20,Number(state.profile.budget||90)),remaining=target-grocery,pct=Math.min(100,Math.max(0,(grocery/target)*100));
 if($('#budgetTarget'))$('#budgetTarget').textContent=money(target);
 if($('#budgetEstimate'))$('#budgetEstimate').textContent=money(grocery);
 if($('#budgetMiniBar')){$('#budgetMiniBar').style.width=pct+'%';$('#budgetMiniBar').classList.toggle('over',grocery>target)}
 if($('#budgetRemaining')){$('#budgetRemaining').textContent=remaining>=0?txt(money(remaining)+' restants',money(remaining)+' left'):txt(money(Math.abs(remaining))+' au-dessus du budget',money(Math.abs(remaining))+' over budget');$('#budgetRemaining').classList.toggle('over',remaining<0)}
}
function enforceCurrentBudget(showMessage=true){
 const before=estimatePlanGroceryCost(state.plan),target=Number(state.profile.budget||90);
 if(before<=target){updateBudgetUI(before);return false}
 state.plan=enforceBudgetPlan(state.plan);savePlan();renderWeek();const after=estimatePlanGroceryCost(state.plan);updateBudgetUI(after);
 if(showMessage)toast(after<=target?txt('Semaine adaptée à votre budget.','Week adjusted to your budget.'):txt('Budget très serré : plan rapproché au maximum.','Very tight budget: plan moved as close as possible.'));
 return true
}
function robustRenderWeek(){
 const grid=$('#weekGrid');if(!grid)return;grid.innerHTML='';const days=currentDays(),labels=currentMeals();
 state.plan.forEach((meals,d)=>{const col=document.createElement('div');col.className='day-col';const date=dateForDay(d);col.innerHTML=`<div class="day-head"><strong>${days[d]}</strong><small>${fmtDate(date)}</small></div>`;meals.forEach((id,s)=>{const r=recipeById(id);if(!r)return;const slot=['breakfast','lunch','dinner'][s],key=`${d}-${s}`,rt=recipeText(r);const card=document.createElement('article');card.className=`meal-card ${slot==='dinner'?'dinner':''} ${state.selected.has(key)?'selected':''}`;card.innerHTML=`<span class="selected-dot"></span><div class="meal-slot">${labels[slot]}</div><h4>${rt.name}</h4><div class="meal-foot"><span>${r.time} min · ${r.protein}g ${isEN()?'protein':'prot.'}</span><span class="kcal">${r.kcal} kcal</span></div>`;card.onclick=e=>{if(e.shiftKey){toggleSelect(key);return}openRecipe(r,`${days[d]} ${date.getDate()} · ${labels[slot]}`)};card.oncontextmenu=e=>{e.preventDefault();toggleSelect(key)};col.appendChild(card)});grid.appendChild(col)});updateWeekHeader();renderShopping();renderRecipeIdeas()
}
renderWeek=robustRenderWeek;

const oldOpenRecipe=openRecipe;
openRecipe=function(r,slot){oldOpenRecipe(r,slot);syncDetailActions()};

function recipeCard(r){
 const rt=recipeText(r),fav=state.favorites.has(r.id);return `<article class="recipe-tile rich-recipe" data-recipe="${r.id}"><div class="recipe-tile-photo" style="background-image:url('${r.image}')"><span>${r.time} min</span><button class="recipe-fav ${fav?'active':''}" data-fav="${r.id}" aria-label="Favori">${fav?'♥':'♡'}</button></div><div class="recipe-tile-body"><div class="eyebrow">${r.protein}g ${isEN()?'protein':'protéines'} · ${r.kcal} kcal</div><h3>${rt.name}</h3><div class="recipe-meta"><span>${recipeCategory(r)}</span><button class="mini-add" data-add-week="${r.id}">+ ${isEN()?'Week':'Semaine'}</button></div></div></article>`
}
renderRecipes=function(filter='all'){
 window.__recipeFilter=filter;const cat=window.__recipeCategory||'all';let list=RECIPES.filter(eligibleByProfile);
 if(filter==='favorite')list=list.filter(r=>state.favorites.has(r.id));else if(filter!=='all')list=list.filter(r=>filter==='quick'?r.time<=20:r.tags.includes(filter));
 if(cat==='favorite')list=list.filter(r=>state.favorites.has(r.id));else if(cat==='quick')list=list.filter(r=>r.time<=20);else if(cat!=='all')list=list.filter(r=>r.tags.includes(cat)||recipeCategory(r)===cat);
 const grid=$('#recipeGrid');if(!grid)return;grid.innerHTML=list.length?list.map(recipeCard).join(''):`<div class="empty-state">${isEN()?'No recipe matches these filters yet.':'Aucune recette ne correspond encore à ces filtres.'}</div>`;
 $$('[data-recipe]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-fav],[data-add-week]'))return;openRecipe(recipeById(el.dataset.recipe),txt('Carnet de recettes','Recipe book'))});
 $$('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();favoriteRecipe(b.dataset.fav)});
 $$('[data-add-week]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCalendar(recipeById(b.dataset.addWeek))})
};
$$('.filter-chip').forEach(b=>b.onclick=()=>{$$('.filter-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderRecipes(b.dataset.filter)});
$$('[data-recipe-category]').forEach(b=>b.onclick=()=>{$$('[data-recipe-category]').forEach(x=>x.classList.remove('active'));b.classList.add('active');window.__recipeCategory=b.dataset.recipeCategory;renderRecipes(window.__recipeFilter||'all')});

let calendarRecipe=null;
function openCalendar(r){calendarRecipe=r;$('#calendarRecipeTitle').textContent=`${txt('Ajouter','Add')} “${recipeText(r).name}”`;$('#calendarDay').innerHTML=currentDays().map((d,i)=>`<option value="${i}">${d}</option>`).join('');$('#calendarSlot').value=r.slot==='breakfast'?'0':r.slot==='lunch'?'1':'2';openModal($('#calendarModal'))}
$('#calendarAddForm').onsubmit=e=>{e.preventDefault();if(!calendarRecipe)return;const d=Number($('#calendarDay').value),s=Number($('#calendarSlot').value);state.plan[d][s]=calendarRecipe.id;savePlan();closeModal($('#calendarModal'));renderWeek();toast(txt('Recette ajoutée à la semaine.','Recipe added to your week.'))};
$('#detailFavoriteBtn').onclick=()=>favoriteRecipe(currentRecipe.id);
$('#detailAddWeekBtn').onclick=()=>openCalendar(currentRecipe);

$('#regenerateSelected').onclick=()=>{const hadSelection=state.selected.size>0,keys=hadSelection?[...state.selected]:state.plan.flatMap((_,d)=>[0,1,2].map(s=>`${d}-${s}`));keys.forEach(key=>{const [d,s]=key.split('-').map(Number),slot=['breakfast','lunch','dinner'][s];state.plan[d][s]=chooseDifferent(slot,state.plan[d][s])});state.selected.clear();state.plan=enforceBudgetPlan(state.plan);savePlan();renderWeek();toast(txt(hadSelection?'Repas recomposés en respectant le budget.':'Semaine recomposée en respectant le budget.',hadSelection?'Meals regenerated within budget.':'Week regenerated within budget.'))};

function renderExtraExpenses(){const list=$('#extraExpenseList');if(!list)return;const total=state.extraExpenses.reduce((a,x)=>a+Number(x.price||0),0);$('#extraTotal').textContent=money(total);list.innerHTML=state.extraExpenses.map((x,i)=>`<div class="extra-row"><span><strong>${x.name}</strong><small>${money(Number(x.price))}</small></span><button data-extra-remove="${i}" aria-label="Supprimer">×</button></div>`).join('');$$('[data-extra-remove]').forEach(b=>b.onclick=()=>{state.extraExpenses.splice(Number(b.dataset.extraRemove),1);localStorage.setItem('miseExtraExpenses',JSON.stringify(state.extraExpenses));renderExtraExpenses();updateShoppingMeta();renderAccount()});updateShoppingMeta()}
$('#extraExpenseForm').onsubmit=e=>{e.preventDefault();const name=$('#extraExpenseName').value.trim(),price=Number($('#extraExpensePrice').value);if(!name||!Number.isFinite(price))return;state.extraExpenses.push({name,price});localStorage.setItem('miseExtraExpenses',JSON.stringify(state.extraExpenses));e.target.reset();renderExtraExpenses();renderAccount()};
const v2UpdateShoppingMeta=updateShoppingMeta;
updateShoppingMeta=function(){const grocery=estimatedCartTotal(),extras=state.extraExpenses.reduce((a,x)=>a+Number(x.price||0),0),total=grocery+extras;$('#pantryCount').textContent=state.checked.size;renderMoneyBig(total);updateBudgetUI(grocery);let row=$('#extraSummaryLine');if(!row){const btn=$('#shopRealProducts2');row=document.createElement('div');row.className='summary-line';row.id='extraSummaryLine';btn.parentNode.insertBefore(row,btn)}row.innerHTML=`<span>${txt('Extra dépenses','Extra expenses')}</span><strong>${money(extras)}</strong>`;if($('#extraTotal'))$('#extraTotal').textContent=money(extras)}
const v2RenderShopping=renderShopping;
renderShopping=function(){v2RenderShopping();renderExtraExpenses()};

$('#personalQuestionsBtn').onclick=()=>{const f=$('#personalQuestionsForm');f.elements.diet.value=state.profile.diet||'balanced';f.elements.proteinPriority.value=state.profile.proteinPriority||'normal';f.elements.sugar.value=state.profile.sugar||'normal';f.elements.goal.value=state.profile.goal||'balanced';f.elements.allergies.value=state.profile.allergies||'';f.elements.notes.value=state.profile.notes||'';openModal($('#personalQuestionsModal'))};
$('#personalQuestionsForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);['diet','proteinPriority','sugar','goal','allergies','notes'].forEach(k=>state.profile[k]=fd.get(k)||'');saveProfileV3();closeModal($('#personalQuestionsModal'));renderRecipes();toast(txt('Préférences personnelles enregistrées.','Personal preferences saved.'))};

function renderAccount(){const a=state.account;$('#accountFavoriteCount').textContent=state.favorites.size;$('#accountExtraCount').textContent=state.extraExpenses.length;const ap=appliances.find(x=>x.id===state.profile.applianceId)||appliances.find(x=>x.favorite);$('#accountAppliance').textContent=ap?ap.brand:'—';if(!a)return;$('#accountName').value=a.name||'';$('#accountEmail').value=a.email||'';$('#accountDisplayName').textContent=a.name;$('#accountDisplayEmail').textContent=a.email;$('#accountAvatar').textContent=(a.name||'M')[0].toUpperCase();$('.avatar').textContent=(a.name||'M')[0].toUpperCase();$('.profile-mini strong').textContent=a.name}
$('#accountForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target);state.account={name:String(fd.get('name')||'').trim(),email:String(fd.get('email')||'').trim()};localStorage.setItem('miseAccount',JSON.stringify(state.account));renderAccount();toast(txt('Compte mémorisé sur cet appareil.','Account remembered on this device.'))};

let applianceImageData=null;
$('#appliancePhotoInput').onchange=()=>{const file=$('#appliancePhotoInput').files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{applianceImageData=reader.result;$('#appliancePhotoPreview').innerHTML=`<img src="${applianceImageData}" alt="Photo appareil"><small>${file.name}</small>`;$('#recognizeApplianceBtn').disabled=false};reader.readAsDataURL(file)};
$('#recognizeApplianceBtn').onclick=async()=>{if(!applianceImageData)return;const result=$('#applianceRecognitionResult');result.hidden=false;result.innerHTML='<strong>✦ Analyse en cours…</strong>';try{const catalog=appliances.filter(a=>a.type==='Air Fryer').map(a=>({id:a.id,brand:a.brand,model:a.model}));const r=await fetch('/api/recognize-appliance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({imageDataUrl:applianceImageData,catalog})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Recognition unavailable');const match=appliances.find(a=>a.id===d.matchId);if(match){appliances.forEach(a=>a.favorite=false);match.favorite=true;state.profile.applianceId=match.id;saveProfileV3();result.innerHTML=`<div class="recognition-match"><span>✓</span><div><small>${Math.round((d.confidence||0)*100)}% confiance</small><strong>${match.brand} ${match.model}</strong><p>${d.visibleEvidence||''}</p></div></div>`;renderAppliances();populateApplianceSelect();renderAccount()}else{result.innerHTML=`<div class="recognition-match tentative"><span>?</span><div><small>${Math.round((d.confidence||0)*100)}% confiance · à confirmer</small><strong>${d.brand||'Appareil'} ${d.model||''}</strong><p>${d.visibleEvidence||txt('Modèle non présent dans la bibliothèque vérifiée.','Model is not yet in the verified library.')}</p></div></div>`}}catch(err){result.innerHTML=`<strong>${txt('Reconnaissance IA non disponible. Vérifiez la configuration AI Gateway.','AI recognition unavailable. Check AI Gateway configuration.')}</strong>`}};

const previousWizardNextHandler=$('#wizardNext').onclick;
$('#wizardNext').onclick=async function(e){const beforeStep=wizardStep;await previousWizardNextHandler?.call(this,e);if(beforeStep===3)setTimeout(()=>enforceCurrentBudget(true),50)};
$('#saveProfile').addEventListener('click',()=>setTimeout(()=>{state.profile.budget=Number($('#profileForm [name="budget"]').value||state.profile.budget||90);saveProfileV3();enforceCurrentBudget(true)},40));

const baseNavigate=navigate;
navigate=function(page){baseNavigate(page);if(page==='account')renderAccount();if(page==='recipes')renderRecipes(window.__recipeFilter||'all')};
$$('[data-page]').forEach(b=>{b.onclick=()=>navigate(b.dataset.page)});

renderRecipes();renderExtraExpenses();renderAccount();robustRenderWeek();enforceCurrentBudget(false);


// V5 — verified appliance cooking engine + category intelligence
(function(){
  // Clean incorrect legacy categorization first.
  const burger=RECIPES.find(r=>r.id==='beef-burger');
  if(burger) burger.tags=(burger.tags||[]).filter(t=>t!=='occasion');

  function recipeTextBlob(r){
    return [r.name,...(r.tags||[]),...(r.ingredients||[]).map(i=>i[0])].join(' ').toLowerCase();
  }
  function inferredCategories(r){
    const out=new Set(r.tags||[]),blob=recipeTextBlob(r),name=(r.name||'').toLowerCase();
    const has=(re)=>re.test(blob);
    if(has(/saumon|cabillaud|crevette|thon|poisson/)) out.add('fish');
    if(has(/poulet|chicken|dinde/)){out.add('chicken');out.add('meat')}
    if(has(/bœuf|boeuf|beef|steak|burger/)){out.add('beef');out.add('meat')}
    if(has(/porc|pork|jambon/)){out.add('pork');out.add('meat')}
    if(has(/pâtes|pasta|lasagn|nouilles/)) out.add('pasta');
    if(/bowl/.test(name)) out.add('bowl');
    if(/salade|salad/.test(name)) out.add('salad');
    if(/soupe|pho|soup/.test(name)) out.add('soup');
    if(/smoothie/.test(name)) out.add('smoothie');
    if(/latte|boisson|chocolat chaud|smoothie/.test(name)) out.add('drink');
    if(r.slot==='breakfast') out.add('breakfast');
    if((r.tags||[]).includes('high-protein') || r.protein>=30) out.add('protein');
    if((r.tags||[]).includes('vegan')){out.add('vegan');out.add('vegetarian')}
    if((r.tags||[]).includes('vegetarian')) out.add('vegetarian');
    if(out.has('fish')&&!out.has('meat')) out.add('pescatarian');

    // "Fêtes & occasions" is deliberately curated: normal burgers/tacos/etc do not qualify.
    const explicitSpecial=(r.tags||[]).some(t=>['date-night','holiday','birthday'].includes(t));
    const festiveName=/anniversaire|birthday|gâteau|gateau|cake|cookie|tarte|holiday|fête|fete|noël|noel|thanksgiving|saint.?valentin/.test(name);
    if(!(explicitSpecial||festiveName||((r.tags||[]).includes('dessert')&&(r.tags||[]).includes('occasion')))) out.delete('occasion');
    else out.add('occasion');

    // Avoid cuisine leakage: infer cuisine from explicit curated tags only.
    ['french','italian','mediterranean','greek','spanish','mexican','american','japanese','korean','chinese','thai','vietnamese','indian','moroccan','middle-eastern','lebanese'].forEach(c=>{
      if(!(r.tags||[]).includes(c)) out.delete(c);
    });
    return out;
  }
  function categoryLabelSmart(r){
    const cats=inferredCategories(r);
    const priority=['japanese','korean','thai','chinese','vietnamese','indian','moroccan','lebanese','middle-eastern','mexican','greek','mediterranean','italian','french','american','fish','chicken','beef','pork','vegan','vegetarian','smoothie','drink','breakfast','dessert','protein'];
    return priority.find(x=>cats.has(x))||'recipe';
  }
  recipeCategory=categoryLabelSmart;

  const oldEligible=eligibleByProfile;
  eligibleByProfile=function(r){
    if(!oldEligible(r))return false;
    const cats=inferredCategories(r);
    if(state.profile.diet==='pescatarian' && (cats.has('chicken')||cats.has('beef')||cats.has('pork'))) return false;
    return true;
  };

  renderRecipes=function(filter='all'){
    window.__recipeFilter=filter;
    const cat=window.__recipeCategory||'all';
    let list=RECIPES.filter(eligibleByProfile);
    if(filter==='favorite') list=list.filter(r=>state.favorites.has(r.id));
    else if(filter!=='all') list=list.filter(r=>filter==='quick'?r.time<=20:inferredCategories(r).has(filter));
    if(cat==='favorite') list=list.filter(r=>state.favorites.has(r.id));
    else if(cat==='quick') list=list.filter(r=>r.time<=20);
    else if(cat!=='all') list=list.filter(r=>inferredCategories(r).has(cat));
    const grid=$('#recipeGrid');if(!grid)return;
    grid.innerHTML=list.length?list.map(recipeCard).join(''):`<div class="empty-state">${isEN()?'No recipe matches these filters yet.':'Aucune recette ne correspond encore à ces filtres.'}</div>`;
    $$('[data-recipe]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-fav],[data-add-week]'))return;openRecipe(recipeById(el.dataset.recipe),txt('Carnet de recettes','Recipe book'))});
    $$('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();favoriteRecipe(b.dataset.fav)});
    $$('[data-add-week]').forEach(b=>b.onclick=e=>{e.stopPropagation();openCalendar(recipeById(b.dataset.addWeek))});
  };
  $$('[data-recipe-category]').forEach(b=>b.onclick=()=>{
    $$('[data-recipe-category]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    window.__recipeCategory=b.dataset.recipeCategory;
    renderRecipes(window.__recipeFilter||'all');
  });

  // Appliance catalog search / brand filter.
  function applianceImageQuery(a){
    if(a.brand==='Profil cuisine'){
      const map={
        'Four':'countertop convection oven full product',
        'Plaques':'induction cooktop full product',
        'Micro-ondes':'countertop microwave full product',
        'Rice Cooker':'rice cooker full product',
        'Multicuiseur':'electric pressure cooker multicooker full product',
        'Blender':'countertop blender full product',
        'Slow Cooker':'slow cooker full product',
        'Grill':'countertop grill panini press full product'
      };
      return map[a.type]||a.model;
    }
    return [a.brand,a.model,a.modelCode].filter(Boolean).join(' ');
  }
  function applianceResolvedImage(a){
    return '/api/appliance-image?brand='+encodeURIComponent(a.brand||'')+'&model='+encodeURIComponent(a.model||'')+'&code='+encodeURIComponent(a.modelCode||'')+'&source='+encodeURIComponent(a.source||'');
  }
  function populateBrandFilter(){
    const sel=$('#applianceBrandFilter');if(!sel)return;
    const current=sel.value||'all';
    const brands=[...new Set(appliances.filter(a=>a.type==='Air Fryer').map(a=>a.brand))].sort();
    sel.innerHTML=`<option value="all">${txt('Toutes les marques','All brands')}</option>`+brands.map(b=>`<option value="${b}">${b}</option>`).join('');
    if([...sel.options].some(o=>o.value===current))sel.value=current;
  }
  function applianceMatches(a){
    const q=($('#applianceSearchInput')?.value||'').trim().toLowerCase();
    const brand=$('#applianceBrandFilter')?.value||'all';
    if(brand!=='all'&&a.brand!==brand)return false;
    if(!q)return true;
    return [a.brand,a.model,a.modelCode,a.description].filter(Boolean).join(' ').toLowerCase().includes(q);
  }
  renderAppliances=function(filter=state.applianceFilter||'all'){
    state.applianceFilter=filter;populateBrandFilter();
    if(state.profile.applianceId) appliances.forEach(a=>a.favorite=a.id===state.profile.applianceId);
    const fav=appliances.find(a=>a.favorite)||appliances.find(a=>a.type==='Air Fryer')||appliances[0];
    if(fav){
      const d=applianceDisplay(fav);
      $('#favoriteApplianceName').textContent=`${d.brand} ${d.model}`;
      $('#favoriteApplianceMeta').textContent=`${fav.description||''}${fav.modelCode?' · '+fav.modelCode:''}`;
      $('#favoriteModes').innerHTML=(fav.modes||[]).slice(0,7).map(m=>`<span>${m.name}</span>`).join('');
      $('#viewFavoriteManual').onclick=()=>openAppliance(fav.id);
    }
    let list=filter==='all'?appliances:appliances.filter(a=>a.type===filter);
    list=list.filter(applianceMatches);
    $('#applianceCount').textContent=`${list.length} ${UI[state.profile.language].appliances}`;
    $('#applianceGrid').innerHTML=list.map(a=>{
      const d=applianceDisplay(a);
      const visual=`<div class="appliance-photo-wrap"><img class="appliance-photo" src="${applianceResolvedImage(a)}" alt="${d.brand} ${d.model}" loading="lazy" referrerpolicy="no-referrer"></div>`;
      return `<article class="appliance-card" data-appliance="${a.id}">${visual}<div class="eyebrow">${a.type} · ${d.brand}</div><h3>${d.model}</h3><p>${isEN()?(APPLIANCE_DESC_EN[a.id]||a.description):a.description}</p><div class="appliance-spec-line"><span>${a.modelCode||''}</span><span>${a.tempRangeF?a.tempRangeF[0]+'–'+a.tempRangeF[1]+'°F':''}</span></div><footer><span>${(a.modes||[]).length} ${UI[state.profile.language].modes}</span><span>${UI[state.profile.language].guide}</span></footer></article>`;
    }).join('');
    $$('[data-appliance]').forEach(c=>c.onclick=()=>openAppliance(c.dataset.appliance));
  };
  $('#applianceSearchInput')?.addEventListener('input',()=>renderAppliances(state.applianceFilter||'all'));
  $('#applianceBrandFilter')?.addEventListener('change',()=>renderAppliances(state.applianceFilter||'all'));
  $$('[data-appliance-filter]').forEach(b=>b.onclick=()=>{
    $$('[data-appliance-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderAppliances(b.dataset.applianceFilter);
  });

  // --- Adaptive cooking engine ---
  function cleanText(x){return String(x||'').replace(/[–—]/g,'-')}
  function parseAirMethod(r,applianceOverride=null){
    let method=null;
    const active=applianceOverride||appliances.find(a=>a.id===state.profile.applianceId)||appliances.find(a=>a.favorite);
    if(active?.brand==='COSORI'&&r.methods?.cosori)method=r.methods.cosori;
    else if(active?.brand==='Instant Pot'&&r.methods?.instant)method=r.methods.instant;
    else if(active?.brand==='Ninja'&&r.methods?.ninja)method=r.methods.ninja;
    else method=r.methods?.airfryer;
    if(!method)return null;
    const text=cleanText(method.join(' '));
    if(/plaques recommandées|wok reste|sans cuisson air fryer|aucune cuisson nécessaire/i.test(text))return null;
    const temp=Number((text.match(/(\d{3})\s*°?F/i)||[])[1]||0)||null;
    const tm=text.match(/(\d+)\s*(?:-|à)\s*(\d+)\s*min/i)||text.match(/(\d+)\s*min/i);
    const min=tm?Number(tm[1]):null,max=tm?Number(tm[2]||tm[1]):null;
    return {mode:method[0]||'Air Fry',temp,min,max,raw:method[1]||''};
  }
  function recipeNeedsBake(r){
    const cats=inferredCategories(r),n=(r.name||'').toLowerCase();
    return cats.has('dessert')||/cake|gâteau|gateau|cookie|tarte|pancake|lasagn/.test(n);
  }
  function recipeNeedsRoast(r){
    const n=(r.name||'').toLowerCase();return /filet mignon|whole|rôti|roti|sheet.pan|légumes rôtis|legumes rotis/.test(n);
  }
  function chooseSupportedMode(a,r,base){
    const modes=(a?.modes||[]).map(m=>m.name);
    const find=(names)=>modes.find(m=>names.some(n=>m.toLowerCase().includes(n)));
    if(recipeNeedsBake(r))return find(['bake','cuisson'])||find(['air fry'])||base||modes[0]||'Air Fry';
    if(recipeNeedsRoast(r))return find(['roast'])||find(['air fry'])||base||modes[0]||'Air Fry';
    if(/toast|croque|gratin/.test((r.name||'').toLowerCase()))return find(['broil','grill','air fry'])||base||modes[0]||'Air Fry';
    return find([String(base||'air fry').toLowerCase()])||find(['air fry','max crisp'])||base||modes[0]||'Air Fry';
  }
  function fToC(f){return Math.round((f-32)*5/9)}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
  function timeText(min,max){if(!min)return 'Selon cuisson';return min===max?`${min} min`:`${min}–${max} min`}
  function airFryerGuide(r,a){
    const base=parseAirMethod(r,a);
    if(!base)return {compatible:false,device:`${a.brand} ${a.model}`,note:txt('Cette recette est mieux adaptée aux plaques, au four ou à un autre appareil.','This recipe is better suited to stovetop, oven, or another appliance.')};
    const factor=Number(a.timeFactor||1);
    const min=base.min?Math.max(1,Math.round(base.min*factor)):null;
    const max=base.max?Math.max(min||1,Math.round(base.max*factor)):min;
    let temp=base.temp||390;
    if(a.style==='oven')temp+=5;
    if(a.tempRangeF)temp=clamp(temp,a.tempRangeF[0],a.tempRangeF[1]);
    const mode=chooseSupportedMode(a,r,base.mode);
    let container=a.container||txt('Panier + plaque croustillante','Basket + crisper plate');
    if(recipeNeedsBake(r)&&a.style!=='oven'&&a.style!=='glass')container=txt('Petit moule silicone/métal compatible Air Fryer placé dans le panier','Small heat-safe silicone/metal pan placed in basket');
    if(recipeNeedsBake(r)&&a.style==='oven')container=txt('Plaque ou moule sur grille centrale','Baking pan on middle rack');
    const pre=a.preheat==='not-required'||a.preheat==='usually-not-needed'?txt('Non requis en général','Usually not required'):a.preheat==='recommended'?txt('Oui, 3–5 min','Yes, 3–5 min'):txt('Optionnel, 2–3 min pour plus de régularité','Optional, 2–3 min for consistency');
    const dual=a.style==='dual'?txt('Utilisez une seule zone pour cette recette, ou Sync/Match si vous doublez les portions.','Use one zone for this recipe, or Sync/Match when doubling portions.'):'';
    const dualHeat=/dual blaze|dome 2/i.test(a.model)?txt('Le double élément chauffe dessus/dessous : pas besoin de retourner systématiquement.','Dual heating cooks top and bottom, so flipping is not always necessary.'):'';
    const catalogOnly=a.profileConfidence==='catalog'?txt('Profil catalogue : le modèle est identifié, mais sa plage exacte n’est pas encore validée dans le manuel. Confirmez température et mode sur l’écran de votre appareil avant de lancer.','Catalog profile: the model is identified, but its exact range is not yet manual-verified. Confirm temperature and mode on the appliance display before starting.'):'';
    const steps=[...recipeText(r).steps];
    if(!recipeNeedsBake(r)&&a.style!=='oven'&&!/dual blaze|dome 2/i.test(a.model))steps.splice(Math.min(2,steps.length),0,txt('À mi-cuisson, secouez le panier ou retournez les pièces pour une coloration uniforme.','Halfway through, shake the basket or flip pieces for even browning.'));
    return {compatible:true,device:`${a.brand} ${a.model}${a.modelCode?' ('+a.modelCode+')':''}`,mode,temp:`${temp}°F / ${fToC(temp)}°C`,time:timeText(min,max),container,preheat:pre,note:[dual,dualHeat,catalogOnly,a.notes].filter(Boolean).join(' '),steps};
  }
  function ovenGuide(r){
    const def=r.methods?.default||['Four traditionnel',`${r.time} min`];
    const text=cleanText(def.join(' '));
    let temp=Number((text.match(/(\d{3})\s*°?F/i)||[])[1]||0)||null;
    const tm=text.match(/(\d+)\s*(?:-|à)\s*(\d+)\s*min/i)||text.match(/(\d+)\s*min/i);
    let min=tm?Number(tm[1]):null,max=tm?Number(tm[2]||tm[1]):null;
    const air=parseAirMethod(r);
    if(!temp&&air?.temp)temp=Math.min(475,air.temp+25);
    if(!min&&air?.min){min=Math.round(air.min*1.25);max=Math.round((air.max||air.min)*1.25)}
    temp=temp||400;min=min||Math.max(10,r.time);max=max||min+5;
    return {compatible:true,device:txt('Four traditionnel','Conventional oven'),mode:txt('Chaleur tournante / Bake','Convection / Bake'),temp:`${temp}°F / ${fToC(temp)}°C`,time:timeText(min,max),container:recipeNeedsBake(r)?txt('Moule ou plat allant au four','Oven-safe pan or dish'):txt('Plaque avec papier cuisson ou plat adapté','Sheet pan or oven-safe dish'),preheat:txt('Oui, préchauffez complètement','Yes, fully preheat'),note:txt('Les temps restent indicatifs : vérifiez la cuisson réelle selon l’épaisseur et votre four.','Times are guidance; verify actual doneness based on thickness and your oven.'),steps:recipeText(r).steps};
  }
  function selectedGuide(method){
    const r=currentRecipe;if(!r)return null;
    if(method==='oven')return ovenGuide(r);
    let a=null;
    if(method==='airfryer')a=appliances.find(x=>x.id===state.profile.applianceId&&x.type==='Air Fryer')||appliances.find(x=>x.favorite&&x.type==='Air Fryer')||appliances.find(x=>x.type==='Air Fryer');
    else{
      const id=$('#detailApplianceSelect')?.value;
      a=appliances.find(x=>x.id===id);
      if(id==='default'||!a)return ovenGuide(r);
    }
    if(a?.type==='Air Fryer')return airFryerGuide(r,a);
    return {compatible:true,device:a?`${a.brand} ${a.model}`:txt('Cuisson classique','Classic cooking'),mode:r.methods?.default?.[0]||txt('Selon recette','Per recipe'),temp:'—',time:r.methods?.default?.[1]||`${r.time} min`,container:txt('Récipient adapté à l’appareil','Appliance-safe cookware'),preheat:txt('Selon appareil','Depends on appliance'),note:'',steps:recipeText(r).steps};
  }
  function showCookGuide(method='selected'){
    const g=selectedGuide(method);if(!g)return;
    $('#cookGuidePanel').hidden=false;
    $$('.cook-method').forEach(b=>b.classList.toggle('active',b.dataset.cookMethod===method));
    $('#cookGuideDevice').textContent=g.device||'—';
    $('#cookGuideMode').textContent=g.mode||txt('Non recommandé','Not recommended');
    $('#cookGuideTemp').textContent=g.temp||'—';
    $('#cookGuideTime').textContent=g.time||'—';
    $('#cookGuideContainer').textContent=g.container||'—';
    $('#cookGuidePreheat').textContent=g.preheat||'—';
    $('#cookCompatibility').textContent=g.compatible?txt('Compatible','Compatible'):txt('Non recommandé','Not recommended');
    $('#cookCompatibility').classList.toggle('not-compatible',!g.compatible);
    $('#cookGuideNote').textContent=g.note||'';
    $('#cookGuideSteps').innerHTML=(g.steps||recipeText(currentRecipe).steps).map(x=>`<li>${x}</li>`).join('');
    $('#cookGuidePanel').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  $('#startCookingBtn')?.addEventListener('click',()=>showCookGuide('selected'));
  $$('.cook-method').forEach(b=>b.addEventListener('click',()=>showCookGuide(b.dataset.cookMethod)));
  $('#detailApplianceSelect')?.addEventListener('change',()=>{if(!$('#cookGuidePanel').hidden)showCookGuide('selected')});

  const previousOpenRecipe=openRecipe;
  openRecipe=function(r,slot){
    previousOpenRecipe(r,slot);
    if($('#cookGuidePanel'))$('#cookGuidePanel').hidden=true;
    if($('#startCookingBtn'))$('#startCookingBtn').textContent=txt('👩‍🍳 Cuisiner cette recette','👩‍🍳 Cook this recipe');
  };

  // Re-render with full catalog after async appliance JSON load.
  setTimeout(()=>{renderAppliances(state.applianceFilter||'all');populateApplianceSelect();renderRecipes(window.__recipeFilter||'all')},250);
})();


// V6 — reliable recomposition, diversity and canonical store persistence
(function(){
  function samePlan(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  function clonePlan(p){return p.map(day=>[...day])}
  function keyForIngredient(name){return name.toLowerCase().replace(/\s/g,'-')}
  function usedCost(used){
    let total=0;
    const names=new Map();
    RECIPES.forEach(r=>r.ingredients.forEach(([name])=>names.set(keyForIngredient(name),name)));
    used.forEach(k=>{if(!state.checked.has(k)&&names.has(k))total+=estimateItemPrice(names.get(k))});
    return total;
  }
  function candidateMarginal(r,used){
    let total=0;
    for(const [name] of r.ingredients){
      const k=keyForIngredient(name);
      if(!state.checked.has(k)&&!used.has(k)) total+=estimateItemPrice(name);
    }
    return total;
  }
  function addIngredients(r,used){r.ingredients.forEach(([name])=>used.add(keyForIngredient(name)))}
  function diverseCandidates(slot,dayIndex,slotIndex,planSoFar,counts,avoidPlan){
    let pool=RECIPES.filter(r=>r.slot===slot&&eligibleByProfile(r));
    if(!pool.length)pool=RECIPES.filter(r=>r.slot===slot);
    const previous=dayIndex>0?planSoFar[dayIndex-1]?.[slotIndex]:null;
    let preferred=pool.filter(r=>r.id!==previous&&(counts.get(r.id)||0)<2);
    if(avoidPlan?.[dayIndex]?.[slotIndex]&&preferred.some(r=>r.id!==avoidPlan[dayIndex][slotIndex])){
      preferred=preferred.filter(r=>r.id!==avoidPlan[dayIndex][slotIndex]);
    }
    if(!preferred.length) preferred=pool.filter(r=>r.id!==previous&&(counts.get(r.id)||0)<3);
    if(!preferred.length) preferred=pool.filter(r=>r.id!==previous);
    return preferred.length?preferred:pool;
  }
  function buildDiverseBudgetPlan(target,avoidPlan=null){
    const used=new Set([...state.checked]),counts=new Map(),plan=[];
    const maxBudget=Math.max(20,Number(target||state.profile.budget||90));
    for(let d=0;d<7;d++){
      const day=[];
      plan.push(day);
      for(let si=0;si<3;si++){
        const slot=['breakfast','lunch','dinner'][si];
        const pool=diverseCandidates(slot,d,si,plan,counts,avoidPlan);
        const current=usedCost(used);
        const ranked=pool.map(r=>{
          const marginal=candidateMarginal(r,used),repeats=counts.get(r.id)||0;
          const profileBonus=scoreRecipe(r);
          const oldPenalty=avoidPlan?.[d]?.[si]===r.id?15:0;
          const overPenalty=current+marginal>maxBudget?1000+(current+marginal-maxBudget)*30:0;
          return {r,marginal,score:marginal*9+repeats*14+oldPenalty+overPenalty-profileBonus*2};
        }).sort((a,b)=>a.score-b.score);
        const pick=ranked[0]?.r||pool[0];
        day.push(pick.id);counts.set(pick.id,(counts.get(pick.id)||0)+1);addIngredients(pick,used);
      }
    }
    return plan;
  }
  function repairConsecutiveDuplicates(plan){
    const out=clonePlan(plan);
    for(let si=0;si<3;si++){
      const counts=new Map();
      for(let d=0;d<7;d++){
        const id=out[d][si];
        counts.set(id,(counts.get(id)||0)+1);
        const prev=d>0?out[d-1][si]:null;
        if(id===prev){
          const slot=['breakfast','lunch','dinner'][si];
          const pool=RECIPES.filter(r=>r.slot===slot&&eligibleByProfile(r)&&r.id!==prev&&(counts.get(r.id)||0)<3);
          if(pool.length){
            pool.sort((a,b)=>candidateMarginal(a,new Set([...state.checked]))-candidateMarginal(b,new Set([...state.checked])));
            out[d][si]=pool[0].id;
            counts.set(pool[0].id,(counts.get(pool[0].id)||0)+1);
          }
        }
      }
    }
    return out;
  }
  function countChanged(before,after){
    let n=0;for(let d=0;d<7;d++)for(let s=0;s<3;s++)if(before[d]?.[s]!==after[d]?.[s])n++;return n;
  }
  function finalizeGeneratedPlan(plan,previous=null){
    const target=Number(state.profile.budget||90);
    let candidate=repairConsecutiveDuplicates(plan);
    if(estimatePlanGroceryCost(candidate)>target) candidate=buildDiverseBudgetPlan(target,previous||plan);
    candidate=repairConsecutiveDuplicates(candidate);
    if(previous&&samePlan(candidate,previous)) candidate=buildDiverseBudgetPlan(target,previous);
    return candidate;
  }

  // Replace budget builder with diversity-aware version so budget repair never creates streaks.
  buildBudgetPlan=function(target){return buildDiverseBudgetPlan(target,state.plan)};
  enforceBudgetPlan=function(plan){
    const target=Math.max(20,Number(state.profile.budget||90));
    const clean=repairConsecutiveDuplicates(plan);
    if(estimatePlanGroceryCost(clean)<=target)return clean;
    const rebuilt=buildDiverseBudgetPlan(target,clean);
    return estimatePlanGroceryCost(rebuilt)<=estimatePlanGroceryCost(clean)?rebuilt:clean;
  };

  // Final, authoritative Recomposer handler.
  $('#regenerateSelected').onclick=()=>{
    const before=clonePlan(state.plan);
    const selected=[...state.selected];
    if(!selected.length){
      state.plan=buildDiverseBudgetPlan(Number(state.profile.budget||90),before);
    }else{
      const working=clonePlan(state.plan),counts=new Map();
      working.flat().forEach(id=>counts.set(id,(counts.get(id)||0)+1));
      for(const key of selected){
        const [d,si]=key.split('-').map(Number),slot=['breakfast','lunch','dinner'][si];
        const prev=d>0?working[d-1][si]:null,next=d<6?working[d+1][si]:null,current=working[d][si];
        let pool=RECIPES.filter(r=>r.slot===slot&&eligibleByProfile(r)&&r.id!==current&&r.id!==prev&&r.id!==next&&(counts.get(r.id)||0)<3);
        if(!pool.length)pool=RECIPES.filter(r=>r.slot===slot&&eligibleByProfile(r)&&r.id!==current&&r.id!==prev&&r.id!==next);
        if(!pool.length)pool=RECIPES.filter(r=>r.slot===slot&&r.id!==current);
        pool.sort((a,b)=>scoreRecipe(b)-scoreRecipe(a));
        if(pool[0]){counts.set(current,Math.max(0,(counts.get(current)||1)-1));working[d][si]=pool[0].id;counts.set(pool[0].id,(counts.get(pool[0].id)||0)+1)}
      }
      state.plan=finalizeGeneratedPlan(working,before);
    }
    state.selected.clear();savePlan();renderWeek();
    const changed=countChanged(before,state.plan);
    toast(txt(`${changed} repas recomposé${changed>1?'s':''} · aucune répétition consécutive.`,`${changed} meal${changed===1?'':'s'} regenerated · no consecutive duplicates.`));
  };

  function persistCanonicalStore(){
    const form=$('#profileForm');if(!form)return;
    const fd=new FormData(form);
    state.profile.store=String(fd.get('store')||state.profile.store||'Whole Foods Market');
    state.profile.location=String(fd.get('location')||state.profile.location||'');
    state.profile.budget=Number(fd.get('budget')||state.profile.budget||90);
    state.profile.goal=String(fd.get('goal')||state.profile.goal||'balanced');
    state.profile.diet=String(fd.get('diet')||state.profile.diet||'balanced');
    state.profile.servings=Number(fd.get('servings')||state.profile.servings||1);
    saveProfileV3();
    updateStoreUI();
    const wf=$('#wizardForm');
    if(wf){
      if(wf.elements.weekStore&&[...wf.elements.weekStore.options].some(o=>o.value===state.profile.store||o.text===state.profile.store))wf.elements.weekStore.value=state.profile.store;
      if(wf.elements.weekLocation)wf.elements.weekLocation.value=state.profile.location;
      if(wf.elements.weekBudget)wf.elements.weekBudget.value=state.profile.budget;
    }
    renderShopping();
  }
  $('#profileStore')?.addEventListener('change',()=>setTimeout(persistCanonicalStore,0));
  $('#profileLocation')?.addEventListener('change',()=>setTimeout(persistCanonicalStore,0));
  $('#profileForm [name="budget"]')?.addEventListener('change',()=>setTimeout(persistCanonicalStore,0));
  $('#saveProfile')?.addEventListener('click',()=>setTimeout(()=>{persistCanonicalStore();enforceCurrentBudget(true);toast(txt(`Profil enregistré · courses chez ${state.profile.store}.`,`Profile saved · shopping at ${state.profile.store}.`))},10));

  // Keep the weekly wizard synchronized with the saved shopping profile.
  const wizardStore=$('#wizardForm [name="weekStore"]');
  const wizardLocation=$('#wizardForm [name="weekLocation"]');
  const wizardBudget=$('#wizardForm [name="weekBudget"]');
  function syncWizardFromProfile(){
    if(wizardStore){
      const has=[...wizardStore.options].some(o=>o.value===state.profile.store||o.text===state.profile.store);
      if(!has){const o=document.createElement('option');o.value=state.profile.store;o.textContent=state.profile.store;wizardStore.appendChild(o)}
      wizardStore.value=state.profile.store;
    }
    if(wizardLocation)wizardLocation.value=state.profile.location||'';
    if(wizardBudget)wizardBudget.value=state.profile.budget||90;
  }
  $('#weekSettings')?.addEventListener('click',syncWizardFromProfile);
  $('#generateWeek')?.addEventListener('click',syncWizardFromProfile);

  // Replace the final wizard action so its store/location/budget are actually saved.
  $('#wizardNext').onclick=async()=>{
    if(wizardStep<3){wizardStep++;syncWizard();return}
    const fd=new FormData($('#wizardForm'));
    state.profile.store=String(fd.get('weekStore')||state.profile.store||'Whole Foods Market');
    state.profile.location=String(fd.get('weekLocation')||state.profile.location||'');
    state.profile.budget=Number(fd.get('weekBudget')||state.profile.budget||90);
    saveProfileV3();updateStoreUI();
    const prompt=String(fd.get('prompt')||''),goal=String(fd.get('weekGoal')||'high-protein');
    closeModal($('#wizardModal'));toast(txt('Le chef recompose votre semaine…','The chef is rebuilding your week…'));
    const before=clonePlan(state.plan);
    let plan=null;
    try{
      const r=await fetch('/api/generate-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile:state.profile,brief:{goal,prompt,budget:state.profile.budget,store:state.profile.store,location:state.profile.location,avoidPlan:before,noConsecutiveDuplicates:true}})});
      if(r.ok){const d=await r.json();if(Array.isArray(d.plan)&&d.plan.length===7)plan=d.plan}
    }catch{}
    state.plan=finalizeGeneratedPlan(plan||buildDiverseBudgetPlan(state.profile.budget,before),before);
    savePlan();renderWeek();persistCanonicalStore();
    const changed=countChanged(before,state.plan);
    toast(txt(`Semaine prête · ${changed} repas changés · budget ${money(state.profile.budget)}.`,`Week ready · ${changed} meals changed · ${money(state.profile.budget)} budget.`));
  };

  // Initial normalization: saved plan and shopping location are repaired once on load.
  state.plan=finalizeGeneratedPlan(state.plan,null);savePlan();persistCanonicalStore();renderWeek();
})();


// V7 — removable shopping items + durable store key
(function(){
  state.removedShopping=new Set(JSON.parse(localStorage.getItem('miseRemovedShopping')||'[]'));
  const aggregateShoppingBeforeRemoval=aggregateShopping;
  aggregateShopping=function(){
    return aggregateShoppingBeforeRemoval().filter(x=>!state.removedShopping.has(x.name.toLowerCase().replace(/\s/g,'-')));
  };
  function saveChecked(){
    const arr=[...state.checked];
    localStorage.setItem('miseShoppingChecked',JSON.stringify(arr));
    localStorage.setItem('miseShopChecked',JSON.stringify(arr));
  }
  function recipeUsesIngredient(name){
    const key=name.toLowerCase();
    const out=[];
    state.plan.flat().forEach(id=>{
      const r=recipeById(id);
      if(!r)return;
      if((r.ingredients||[]).some(([n])=>n.toLowerCase()===key)){
        const title=recipeText(r).name;
        if(!out.includes(title))out.push(title);
      }
    });
    return out;
  }
  function shoppingRecipeLine(name){
    const uses=recipeUsesIngredient(name);
    if(!uses.length)return '';
    const visible=uses.slice(0,3).join(' · ');
    const extra=uses.length>3?` +${uses.length-3}`:'';
    return `<small class="shop-recipes">${txt('Utilisé pour : ','Used for: ')}${visible}${extra}</small>`;
  }
  renderShopping=function(){
    const items=aggregateShopping(),groups={};
    items.forEach(it=>{const c=categorize(it.name);(groups[c]??=[]).push({...it,key:it.name.toLowerCase().replace(/\s/g,'-')})});
    const restore=state.removedShopping.size?`<div class="removed-shopping-bar"><span>${state.removedShopping.size} ${txt('article(s) retiré(s)','removed item(s)')}</span><button id="restoreShoppingItems" type="button">${txt('Restaurer','Restore')}</button></div>`:'';
    $('#shoppingList').innerHTML=restore+Object.entries(groups).map(([cat,arr])=>`<div class="shopping-category"><div class="shopping-category-title">${categoryLabel(cat)}</div>${arr.map(it=>`<div class="shop-row" data-shop-row="${it.key}"><input class="shop-check" type="checkbox" data-shop="${it.key}" ${state.checked.has(it.key)?'checked':''}><span class="shop-name"><strong>${ingredientName(it.name)}</strong>${shoppingRecipeLine(it.name)}<small class="shop-product">${productSuggestion()}</small></span><span class="shop-price">${money(estimateItemPrice(it.name))}</span><span class="shop-qty">${simplifyQty(it.name,it.qty)}</span><button class="shop-remove" type="button" data-remove-shop="${it.key}" aria-label="${txt('Retirer de la liste','Remove from list')}">×</button></div>`).join('')}</div>`).join('');
    $$('.shop-check').forEach(c=>c.addEventListener('change',()=>{c.checked?state.checked.add(c.dataset.shop):state.checked.delete(c.dataset.shop);state.shopChecked=state.checked;saveChecked();updateShoppingMeta()}));
    $$('[data-remove-shop]').forEach(b=>b.addEventListener('click',()=>{state.removedShopping.add(b.dataset.removeShop);localStorage.setItem('miseRemovedShopping',JSON.stringify([...state.removedShopping]));renderShopping();toast(txt('Article retiré de la liste.','Item removed from list.'))}));
    $('#restoreShoppingItems')?.addEventListener('click',()=>{state.removedShopping.clear();localStorage.removeItem('miseRemovedShopping');renderShopping();toast(txt('Articles restaurés.','Items restored.'))});
    $('#shoppingCount').textContent=items.length;$('#cartItems').textContent=items.length;$('#pantryCount').textContent=state.checked.size;updateShoppingMeta();
  };

  function persistStoreKeys(){
    localStorage.setItem('miseStore',state.profile.store||'Whole Foods Market');
    localStorage.setItem('miseLocation',state.profile.location||'');
    localStorage.setItem('miseBudget',String(state.profile.budget||90));
    saveProfileV3();
  }
  const savedStore=localStorage.getItem('miseStore');
  const savedLocation=localStorage.getItem('miseLocation');
  const savedBudget=Number(localStorage.getItem('miseBudget'));
  if(savedStore)state.profile.store=savedStore;
  if(savedLocation)state.profile.location=savedLocation;
  if(Number.isFinite(savedBudget)&&savedBudget>0)state.profile.budget=savedBudget;
  updateStoreUI();
  if($('#profileStore'))$('#profileStore').value=state.profile.store;
  if($('#profileLocation'))$('#profileLocation').value=state.profile.location;
  const budgetInput=$('#profileForm [name="budget"]');if(budgetInput)budgetInput.value=state.profile.budget;

  $('#profileStore')?.addEventListener('change',e=>{state.profile.store=e.target.value;persistStoreKeys();updateStoreUI();renderShopping()});
  $('#profileLocation')?.addEventListener('change',e=>{state.profile.location=e.target.value;persistStoreKeys();updateStoreUI()});
  budgetInput?.addEventListener('change',e=>{state.profile.budget=Number(e.target.value||90);persistStoreKeys();updateShoppingMeta()});
  $('#saveProfile')?.addEventListener('click',()=>setTimeout(()=>{state.profile.store=$('#profileStore')?.value||state.profile.store;state.profile.location=$('#profileLocation')?.value||state.profile.location;state.profile.budget=Number(budgetInput?.value||state.profile.budget||90);persistStoreKeys();updateStoreUI();renderShopping()},20));

  renderShopping();
})();
