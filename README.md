# Dernier Métro API

API pour connaître les horaires du dernier métro à Paris.

## Architecture

- **Backend** : Node.js + Express
- **Base de données** : SQLite
- **Conteneurisation** : Docker + Docker Compose
- **Documentation** : OpenAPI/Swagger UI
- **Tests** : Jest + Supertest
- **CI/CD** : GitLab CI

## Branches de développement

- `04-db-endpoints` : Endpoints avec base de données SQLite
- `05-openapi-docs` : Documentation OpenAPI/Swagger complète  
- `06-unit-tests` : Tests unitaires (9 tests)
- `07-integration-tests` : Tests d'intégration (13 tests)
- `08-gitlab-ci-basic` : Pipeline CI basique avec tests automatisés
- `09-docker-build-ci` : Build automatisé d'images Docker dans le pipeline

## Installation locale

```bash
# Cloner le projet
git clone <repository-url>
cd dernier-metro-api

# Installer les dépendances
npm install

# Lancer l'API
npm start
```

## Avec Docker Compose

```bash
# Lancer API + Swagger UI
docker compose up -d

# API accessible sur http://localhost:5000
# Swagger UI sur http://localhost:8080
```

## Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
NODE_ENV=test npm run test:integration

# Tous les tests
NODE_ENV=test npm test
```

## Endpoints

- `GET /health` - Health check
- `GET /next-metro?station=<name>` - Prochain passage
- `GET /last-metro?station=<name>` - Dernier métro

## CI/CD Pipeline

Le pipeline GitLab CI exécute automatiquement :
- Tests unitaires
- Tests d'intégration
- Validation de la syntaxe (linting)
- Vérification du build
- Construction automatique des images Docker

Les tests doivent passer avant tout merge.
Les images Docker sont buildées automatiquement à chaque commit.

----------------------------------------------------------
----------------------------------------------------------

Gitlab:
# Depuis votre dossier projet :
git remote add gitlab https://gitlab.com/VOTRE_USERNAME/dernier-metro-api.git

# Pousser tout
git push gitlab --all

# Vérifier que ça a marché
git remote -v
# Vous devriez voir origin (GitHub) et gitlab (GitLab)