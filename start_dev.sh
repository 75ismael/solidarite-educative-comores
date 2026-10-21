#!/bin/bash
# Script de lancement local rapide de la plateforme (Backend + Frontend)

echo "=== Lancement de la Plateforme Solidarité Éducative Comores ==="

# 1. Vérification environnement backend
if [ ! -d "backend/venv" ]; then
    echo "[!] Environnement virtuel manquant. Initialisation..."
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
    python backend/manage.py migrate
    python backend/manage.py seed_demo_data
fi

echo "[+] Démarrage du serveur Backend Django sur http://127.0.0.1:8000 ..."
source backend/venv/bin/activate
python backend/manage.py runserver 8000 &
BACKEND_PID=$!

echo "[+] Démarrage du serveur Frontend React sur http://localhost:5173 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
