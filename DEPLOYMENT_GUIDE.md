# Guide de Déploiement en Production — Publication Immédiate

Ce guide explique pas à pas comment déployer et publier publiquement le site et l'application **Solidarité Éducative Comores** aujourd'hui.

---

## Option 1 : Déploiement Cloud en 1 Clic (Render / Railway) — Le plus rapide (10 min)

### Déployer sur Render.com (ou Railway.app) :
1. Créez un compte gratuit sur [Render.com](https://render.com).
2. Connectez votre dépôt Git.
3. **Backend Web Service** :
   - Root directory : `backend`
   - Build command : `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python manage.py seed_demo_data`
   - Start command : `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - Variables d'environnement :
     - `SECRET_KEY` = votre clé secrète
     - `DEBUG` = `False`
     - `ALLOWED_HOSTS` = `*` (ou votre URL render `.onrender.com`)
4. **Frontend Static Site** :
   - Root directory : `frontend`
   - Build command : `npm install && npm run build`
   - Publish directory : `dist`
   - Variable d'environnement :
     - `VITE_API_BASE_URL` = `https://votre-backend.onrender.com/api`

---

## Option 2 : Déploiement sur Serveur VPS avec Docker Compose (Recommandé)

Sur n'importe quel serveur VPS (OVH, Hetzner, Scaleway, DigitalOcean à 4-5 €/mois) :

### 1. Prérequis sur le serveur (Ubuntu 22.04 / 24.04) :
```bash
sudo apt update && sudo apt install -y git docker.io docker-compose
sudo systemctl enable --now docker
```

### 2. Cloner le projet et lancer :
```bash
git clone <URL_DU_DEPOT> Benevolat
cd Benevolat

# Lancer la pile complète
docker-compose up -d --build
```

Le site est immédiatement accessible sur le port 80 de votre adresse IP ou nom de domaine !

### 3. Activer HTTPS avec Certbot / Let's Encrypt :
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Option 3 : Déploiement Natif (Sans Docker sur VPS)

### 1. Backend (Gunicorn + Systemd) :
Dans `backend/` :
```bash
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py seed_demo_data
```
Créer un service systemd `/etc/systemd/system/benevolat.service` pour faire tourner Gunicorn en tâche de fond.

### 2. Frontend (Nginx) :
Dans `frontend/` :
```bash
npm run build
```
Copiez le dossier `frontend/dist/` dans `/var/www/benevolat-frontend/` et servez-le avec Nginx.

---

## 🔐 Check-list finale avant ouverture au public

- [x] Base de données initialisée avec les rôles, matières et niveaux scolaires.
- [x] Comptes d'administration et de coordination configurés.
- [x] Charte de protection des mineurs consultable publiquement (`/charte-ethique`).
- [x] Formulaire de signalement confidentiel opérationnel (`/signalement-protection`).
- [x] Formulaire de contact fonctionnel avec sauvegarde des messages (`/contact`).
- [x] Page de transparence des dons et dépenses en ligne (`/transparence`).
- [x] Rapport d'impact officiel imprimable et exportable (`/rapport-impact`).
- [x] Bundle frontend ultra-léger (~100 kB) vérifié pour réseaux lents aux Comores.
