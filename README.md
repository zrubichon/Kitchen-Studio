# Mise — AI Kitchen Studio

Prototype fonctionnel d'une application de planification de repas personnalisée.

## Ce qui fonctionne dans cette V1
- Planning hebdomadaire 7 jours × petit-déjeuner / déjeuner / dîner.
- Questionnaire hebdomadaire et brief libre en langage naturel.
- Choix de langue **français / anglais**, mémorisé pour les prochaines visites.
- Choix des mesures **grammes / mL** ou **cups / oz**, appliqué aux fiches recettes et à la liste de courses.
- Section **Idées recettes** indépendante du planning de la semaine.
- Générateur local de secours qui adapte la sélection de recettes aux critères clés.
- Point d'extension `/api/generate-plan` pour connecter une IA via Vercel AI Gateway (`AI_GATEWAY_API_KEY` + `AI_MODEL`).
- Fiches recettes avec ingrédients, étapes, macros et adaptation par appareil de cuisson.
- Bibliothèque étendue à **14 profils d'appareils** : Air Fryers identifiables par photo, four, plaques, micro-ondes, rice cooker, multicuiseur, blender, slow cooker et grill.
- Liste de courses agrégée et persistante avec **estimation de prix par produit et estimation du panier total**, recalculées selon les repas planifiés et les produits déjà disponibles.
- Endpoint `/api/instacart-shopping-list` pour créer une liste achetable via Instacart Developer Platform (`INSTACART_API_KEY`).
- Profil permanent (régime, portions, budget, magasin, localisation) sauvegardé en localStorage.

## Lancer localement
Le front peut être ouvert directement via `index.html`. Pour servir les fichiers :

```bash
npx serve . -l 3000
```

Les routes `/api/*` sont prévues pour Vercel et fonctionnent une fois le projet déployé avec les variables d'environnement configurées.

## Variables d'environnement
- `AI_GATEWAY_API_KEY` : clé Vercel AI Gateway.
- `AI_MODEL` : identifiant de modèle choisi dans votre compte Gateway.
- `INSTACART_API_KEY` : clé Instacart Developer Platform.

## Architecture produit recommandée pour la suite
1. Auth + base utilisateurs / préférences.
2. Base de recettes structurée + génération IA de recettes complètes.
3. Normalisation nutritionnelle et contrôle allergies.
4. Catalogue appareils / ingestion des manuels constructeur.
5. Intégration retailer réelle : Instacart en Amérique du Nord, partenaires spécifiques en Europe.
6. Panier réel, substitutions, prix et disponibilité par magasin.
7. Calendrier + meal prep + notifications de décongélation/préparation.
8. Photos de recettes générées ou bibliothèque média sous licence.

## Sources constructeur incluses dans la démo
- COSORI TurboBlaze 6.0-Quart : page produit/guide officiel.
- Instant Pot Vortex Plus 6QT ClearCook : page produit/manuel officiel.
- Ninja Foodi XL Pro Air Oven DT200 Series : guide officiel.

Les presets de démo sont des points de départ. Toujours vérifier la cuisson finale des aliments sensibles et suivre les instructions du constructeur.


## Intelligent appliance engine
- L'interface ne présente plus un catalogue d'Air Fryers à parcourir. L'utilisateur saisit directement sa **marque + modèle / référence**.
- Kitchen Studio vérifie d'abord son cache interne de modèles connus, puis peut lancer une recherche web + IA pour identifier un appareil non encore enregistré.
- Le profil enregistré conserve selon les informations trouvées : marque, modèle, référence, type d'appareil, modes, plage de température, capacité, récipient/accessoire, préchauffage et sources.
- L'appareil actif est sauvegardé dans le navigateur et réinjecté après rechargement.
- Au clic sur **Cuisiner cette recette**, l'app envoie la recette et le profil de l'appareil au moteur d'adaptation IA, qui renvoie : compatibilité, mode, température °F/°C, durée, récipient, préchauffage, préparation et étapes adaptées.
- Si l'appareil n'est pas approprié à la recette, le moteur doit le signaler au lieu de forcer une méthode.
- Les anciens profils détaillés restent disponibles uniquement comme cache interne de reconnaissance rapide et de secours ; ils ne sont plus affichés comme une bibliothèque à parcourir.

Les réglages proposés sont des recommandations culinaires dérivées de la recette et des capacités documentées de l'appareil. Les caractéristiques non confirmées restent inconnues plutôt que d'être inventées, et la cuisson finale des aliments sensibles doit toujours être vérifiée.
