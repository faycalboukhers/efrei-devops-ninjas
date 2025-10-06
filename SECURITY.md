# Security Policy

## Security Scanning

Ce projet utilise plusieurs outils de sécurité dans le pipeline CI/CD :

### 1. NPM Audit
Scan des vulnérabilités connues dans les dépendances npm.
- Niveau minimum : `moderate`
- Exécuté à chaque push

### 2. Trivy
Scan de sécurité des images Docker pour détecter :
- Vulnérabilités CVE dans les packages système
- Vulnérabilités dans les dépendances
- Mauvaises configurations
- Seuil : HIGH et CRITICAL

### 3. Gitleaks
Détection de secrets potentiellement exposés :
- Clés API
- Tokens
- Passwords
- Clés privées

### 4. Snyk (optionnel)
Analyse avancée des dépendances avec suggestions de fix.

## Reporting a Vulnerability

Si vous découvrez une vulnérabilité de sécurité, veuillez nous contacter directement plutôt que d'ouvrir une issue publique.

## Best Practices

- Ne jamais commiter de secrets (`.env`, clés API, passwords)
- Utiliser des variables d'environnement pour les configurations sensibles
- Garder les dépendances à jour
- Utiliser Docker multi-stage builds pour réduire la surface d'attaque
- Limiter les privilèges des conteneurs