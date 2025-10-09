# Déploiement Staging

## Vue d'ensemble

L'environnement staging permet de tester l'application dans des conditions proches de la production avant le déploiement final.

## Architecture Staging

- **Base de données** : PostgreSQL 15 dédiée avec volumes persistants
- **API** : Image Docker taguée `staging`
- **Swagger UI** : Documentation accessible
- **Network** : Réseau Docker isolé `staging-network`

## Déploiement automatique

Le déploiement staging se déclenche :
- **Manuellement** via l'interface GitLab CI/CD
- Sur les branches : `main`, `staging`, `11-deploy-staging`
- Après validation des tests et scans de sécurité

## Étapes du déploiement

1. **Build de l'image** : `docker:build:staging`
2. **Déploiement** : `deploy:staging` (manuel)
3. **Tests smoke** : `test:staging:smoke` (automatique après déploiement)

## Déploiement manuel local

```bash
# 1. Copier le fichier d'environnement
cp .env.staging.example .env.staging

# 2. Éditer avec vos valeurs
nano .env.staging

# 3. Lancer l'environnement staging
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# 4. Vérifier les logs
docker-compose -f docker-compose.staging.yml logs -f

# 5. Tester l'API
curl http://localhost:5000/health
curl http://localhost:5000/last-metro?station=chatelet

# 6. Accéder à Swagger
# http://localhost:8080
```

## Variables d'environnement requises

- `POSTGRES_PASSWORD_STAGING` : Mot de passe PostgreSQL
- `DATABASE_URL` : URL complète de connexion
- `STAGING_IMAGE` : Image Docker à déployer
- `NODE_ENV=staging`

## Rollback

En cas de problème :

```bash
# Revenir à l'image précédente
docker-compose -f docker-compose.staging.yml down
# Modifier STAGING_IMAGE dans .env.staging
docker-compose -f docker-compose.staging.yml up -d
```

## Monitoring

Vérifier les logs en temps réel :
```bash
docker-compose -f docker-compose.staging.yml logs -f api
docker-compose -f docker-compose.staging.yml logs -f postgres
```

## Différences avec Production

- Mot de passe différent
- Volumes séparés
- Réseau isolé
- Logs en debug mode
- Pas de haute disponibilité