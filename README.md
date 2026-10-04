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


## Smart fridge, accounts and manual memory
- **Ce qu'il y a dans mon frigo** est l'inventaire alimentaire actif.
- Cocher un article dans la liste de courses le transfère dans le frigo et le retire du coût restant.
- Retirer/décocher un article du frigo le remet automatiquement dans les courses s'il est nécessaire au menu.
- Le bouton Recomposer privilégie exclusivement les recettes dont les ingrédients sont disponibles dans le frigo; si le stock ne permet pas de couvrir les 3 créneaux de repas, l'app le signale au lieu d'inventer la disponibilité.
- Le bas de la page principale comporte un tiroir Menu + idées, avec **♡** et **+**. Ajouter une recette à la semaine ajoute automatiquement ses ingrédients manquants aux courses.
- Les surfaces de suggestion utilisent toutes des actions favori + ajout au calendrier.

### Multiple appliances + photographed manuals
- L'utilisateur peut enregistrer autant d'appareils que souhaité.
- Chaque appareil peut devenir l'appareil actif pour la recette.
- Chaque carte appareil contient une zone **Pages de mon manuel** acceptant plusieurs photos.
- Les images sont conservées localement dans IndexedDB; lorsqu'un compte cloud est actif, elles sont aussi envoyées dans le bucket privé Supabase `manual-pages`.
- `/api/analyze-manual.js` extrait une mémoire structurée: modes, températures, tableaux de cuisson, accessoires, préchauffage, placement, règles shake/turn, liquides et avertissements.
- `/api/adapt-cooking.js` traite cette mémoire issue du manuel comme la source prioritaire avant toute hypothèse générique.

### Cloud accounts
Kitchen Studio inclut maintenant le flux email/mot de passe avec Supabase Auth et la synchronisation du profil, frigo, menu, favoris, dépenses et appareils.

Variables Vercel requises:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Le navigateur utilise une version épinglée de `@supabase/supabase-js` et la clé publiée n'est jamais une clé `service_role`.

Appliquer le schéma:
- `supabase/kitchen-studio.sql`
- Créer un bucket Storage **privé** nommé `manual-pages` avec des types d'images adaptés.
- Les politiques RLS du fichier SQL limitent l'état et les fichiers à leur propriétaire authentifié.

Le projet Supabase doit être dédié à Kitchen Studio. Ne pas réutiliser un backend d'une autre application uniquement pour éviter de créer le projet.


## Accès propriétaire et aperçu des offres

L’accès gratuit à Premium et au Student Budget Pack est réservé au compte Supabase confirmé de Zoé. `lib/access.js` vérifie côté serveur l’identifiant permanent et l’adresse email, via `/auth/v1/user`. Aucune préférence locale ou donnée `user_metadata` ne donne de droits. Les autres comptes restent Free tant que les paiements et leur validation ne sont pas connectés.

Dans Mon profil, le compte propriétaire peut choisir : Tout débloqué, Free, Premium ou Student Budget Pack. L’aperçu réduit uniquement les fonctions visibles et ne modifie pas les comptes ou leurs données. Les API IA vérifient également les droits. Le bouton Tester l’IA effectue une véritable requête et signale notamment le blocage de facturation Vercel. Les suggestions locales restent utilisables lorsqu’AI Gateway est indisponible.

Vérification du 4 octobre 2026 : compte propriétaire confirmé, dernière connexion réussie le 30 septembre ; création de compte email autorisée avec confirmation obligatoire. AI Gateway refuse les requêtes avec `customer_verification_required` (carte bancaire requise). Les liens Stripe ne sont pas configurés. La délivrance des emails publics n’est pas validée : ne pas présenter le service email comme prêt pour le lancement sans vérifier le SMTP et la réception.

Tests : `node --test tests/access.test.js`.
