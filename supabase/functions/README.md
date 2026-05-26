# Lokadia — Edge Functions Supabase

Proxies serveur pour les sources officielles non-CORS qu'on ne peut pas appeler directement depuis le navigateur.

## Edge Functions disponibles

| Fonction | Source | URL utilisateur |
|---|---|---|
| `advisories-mae` | MAE France (diplomatie.gouv.fr) | `/functions/v1/advisories-mae?country=japon` |
| `advisories-us-state` | US Department of State | `/functions/v1/advisories-us-state?country=JP` |
| `advisories-who` | OMS Disease Outbreak News (RSS) | `/functions/v1/advisories-who?country=JP` |

(Note : USGS Earthquakes et ReliefWeb sont déjà CORS-friendly et fetchés directement depuis le navigateur via `src/app/lib/liveAlertsService.ts`.)

## Déploiement

Pré-requis : Supabase CLI installé et lié au projet `prj_ZEpP7qLPOW5GEAKqBpo6XrcWwXRT`.

```bash
# Installer la CLI Supabase (une fois)
npm install -g supabase

# Se connecter au projet
supabase login
supabase link --project-ref yprdlcqwloydwzxihepw

# Déployer les 3 fonctions (--no-verify-jwt = public, sans auth)
supabase functions deploy advisories-mae --no-verify-jwt
supabase functions deploy advisories-us-state --no-verify-jwt
supabase functions deploy advisories-who --no-verify-jwt
```

## Tester en local

```bash
supabase functions serve advisories-mae --no-verify-jwt
# Puis dans un autre terminal :
curl "http://localhost:54321/functions/v1/advisories-mae?country=japon"
```

## Intégration côté front

Une fois déployées, ajouter dans `src/app/lib/lokascoreSources.ts` un fetch async qui :

1. Pour chaque destination chargée, appelle les 3 endpoints (mae + us-state + who) en parallèle
2. Met à jour `countryRiskData` en mémoire avec les valeurs fraîches reçues
3. Cache 1h dans `sessionStorage`
4. Re-calcule les dimensions S et H avec les nouvelles données

Le code de l'intégration sera ajouté lorsque tu auras déployé les fonctions, parce que tester sans backend réel ne sert à rien.

## Notes techniques

- **MAE** : le HTML de `diplomatie.gouv.fr` n'a pas d'API officielle. Le scraping cherche les mots-clés "déconseillé", "vigilance renforcée", etc. La structure peut changer — à surveiller.
- **US State** : pareil, scraping HTML. Le pattern "Level X" est stable depuis 2018.
- **WHO** : flux RSS officiel stable. Parser XML minimal pour éviter les dépendances.
- Toutes les fonctions cachent leur réponse 1h côté CDN Supabase via `Cache-Control: public, max-age=3600`.
- Aucune des fonctions ne nécessite d'authentification (drapeau `--no-verify-jwt`).
