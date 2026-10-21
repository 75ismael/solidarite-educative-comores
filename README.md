# Solidarité Éducative Comores — Plateforme & CMS

Plateforme associative solidaire d'accompagnement scolaire pour les élèves des Comores (coordination France / Comores), conçue comme un **CMS headless et portail associatif complet** développé en **Django (Backend REST & Admin)** et **React (Frontend moderne, réactif et optimisé pour connexions faibles)**.

---

## 🚀 Démarrage Rapide

### 1. Lancer le Backend Django (API & Admin)

```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```
- **API REST** accessible sur : `http://127.0.0.1:8000/api/`
- **Django Admin** accessible sur : `http://127.0.0.1:8000/admin/`

*(La base de données est déjà initialisée avec toutes les migrations et les données de démonstration du programme pilote).*

### 2. Lancer le Frontend React (Vite)

Dans un second terminal :

```bash
cd frontend
npm run dev
```
- **Application web & CMS** accessible sur : `http://localhost:5173/`

---

## 🔑 Comptes de Démonstration (Connexion en 1 clic disponible sur `/login`)

| Rôle | E-mail | Mot de passe | Description & Capacités |
| :--- | :--- | :--- | :--- |
| **Coordinateur** | `coordinateur@benevolat.km` | `pass1234` | Évaluation des demandes, moteur de matching intelligent, création de binômes, gestion des alertes |
| **Bénévole** | `aminata.benevole@benevolat.km` | `pass1234` | Consultation des binômes, calendrier des séances, saisie des comptes rendus post-séance |
| **Parent d'élève** | `fatima.parent@benevolat.km` | `pass1234` | Inscription de l'élève, consultation des séances et bilans pédagogiques de son enfant |
| **Protection Mineurs** | `protection@benevolat.km` | `pass1234` | Espace étanche pour le traitement des signalements sensibles (F15) |
| **Finances** | `finances@benevolat.km` | `pass1234` | Suivi des dons, dépenses et justificatifs |
| **Administrateur** | `admin@benevolat.km` | `admin1234` | Accès complet Django Admin et gestion globale |

---

## 📋 Alignement Fonctionnel (Cahier des charges)

| ID | Fonctionnalité | Implémentation |
| :--- | :--- | :--- |
| **F01** | **Comptes et rôles** | Modèle `User` personnalisé avec RBAC (`PARENT`, `VOLUNTEER`, `COORDINATOR`, `SAFEGUARDING_OFFICER`, `ADMIN`), auth JWT. |
| **F02 / F03** | **Dossier Élève & Demandes** | Formulaire avec niveau, matières, difficultés, urgence. Génération d'un identifiant anonymisé (`ELV-XXXXXX`) protégeant l'enfant. |
| **F04** | **Appels au bénévolat** | Missions publiques anonymisées (`/missions`) avec filtres par matière et île, formulaire de candidature direct. |
| **F05** | **Profils bénévoles** | Matières, disponibilités, niveaux, expérience, vérification manuelle et signature obligatoire de la Charte de protection. |
| **F06** | **Attribution & Matching** | Algorithme de correspondance calculant un score d'adéquation (matières, niveau, localisation, créneaux) avec validation humaine obligatoire. |
| **F07** | **Calendrier & Séances** | Planification des cours de soutien (date, heure, durée, lien WhatsApp/visio ou lieu présentiel). |
| **F08** | **Comptes rendus post-séance** | Formulaire simple : présence, notions abordées, exercices, niveau d'assimilation (1 à 4) et prochaines étapes. |
| **F09** | **Objectifs pédagogiques** | Définition et suivi des objectifs par matière avec évaluation de progression. |
| **F10** | **Alertes opérationnelles** | Détection et suivi des absences, retards de comptes rendus ou ruptures de contact avec statut de résolution. |
| **F12** | **Tableaux de bord** | Portails personnalisés pour chaque rôle (Bénévole, Famille, Coordinateur, Référent protection). |
| **F13 / F20** | **Dons & Transparence** | Registre public des dons et des dépenses justifiées (`/transparence`), avancement de la campagne de collecte, ventilation par catégorie. |
| **F14** | **Gestion documentaire & Consentement** | Consentement parental obligatoire pour tout élève mineur, archivage sécurisé. |
| **F15** | **Protection des mineurs & Signalement** | Canal public confidentiel (`/signalement-protection`) avec numéro de dossier `SIG-XXXXXX`, accessible uniquement par le Responsable Protection. |
| **F18** | **Connexion limitée (Comores)** | Interface ultra-légère (bundle JS ~97 kB gzipped), formulaires courts et sauvegarde fluide. |
| **F19 / F21** | **Site vitrine & Rapports d'impact** | Moteur CMS (actualités, FAQ, témoignages, indicateurs clés d'impact en temps réel). |

---

## 🛠️ Architecture Technique

```
Benevolat/
├── backend/                       # Django 4.2 LTS + Django REST Framework
│   ├── config/                    # Configuration, URLs, JWT, CORS
│   └── apps/
│       ├── accounts/              # Utilisateurs, RBAC, authentification
│       ├── cms/                   # Pages dynamiques, articles, métriques, FAQ
│       ├── pedagogy/              # Matières, élèves (anonymisés), demandes
│       ├── volunteering/          # Profils bénévoles, missions publiques
│       ├── matching/              # Binômes et moteur de correspondance
│       ├── sessions_track/        # Séances, calendrier, comptes rendus
│       ├── safeguarding/          # Alertes et signalements confidentiels
│       └── finance/               # Dons, dépenses, transparence publique
└── frontend/                      # React 18 + Vite + TypeScript + Tailwind CSS
    └── src/
        ├── api/                   # Client Axios avec intercepteur JWT
        ├── context/               # AuthContext global
        ├── pages/
        │   ├── public/            # Site vitrine CMS (Accueil, Missions, Transparence, etc.)
        │   ├── volunteer/         # Espace Bénévole (Séances, Saisie CR)
        │   ├── family/            # Espace Famille (Suivi des élèves)
        │   ├── coordinator/       # Espace Coordinateur (Matching, Validation)
        │   ├── safeguarding/      # Espace Protection (Signalements confidentiels)
        │   └── auth/              # Connexion avec comptes démo en 1 clic
        └── types/                 # Typage complet TypeScript
```
