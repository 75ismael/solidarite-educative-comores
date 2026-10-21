import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  ShieldCheck,
  RefreshCw,
  Mail,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const MaintenancePage: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const res = await apiClient.get('/cms/metrics/');
      if (res.status === 200) {
        setIsOnline(true);
        setStatusMessage("Bonne nouvelle ! Les services sont de nouveau opérationnels. Vous pouvez naviguer sur le site.");
      } else {
        setIsOnline(false);
        setStatusMessage("L'intervention est toujours en cours. Merci pour votre patience.");
      }
    } catch (err: any) {
      setIsOnline(false);
      setStatusMessage("L'intervention est toujours en cours. Nos équipes finalisent la mise à jour.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Badge Statut */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold border border-amber-200 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Maintenance programmée en cours • Code HTTP 503</span>
        </div>

        {/* Icône & Titre principal */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-blue to-cyan-900 text-white flex items-center justify-center mx-auto shadow-xl ring-8 ring-teal-50">
            <Wrench className="w-10 h-10 text-teal-300 animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-blue tracking-tight leading-tight">
            Plateforme temporairement en maintenance
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Nous effectuons actuellement une mise à niveau technique de nos serveurs et de nos outils pédagogiques pour vous offrir un service toujours plus fluide et sécurisé.
          </p>
        </div>

        {/* 3 Cartes informatives rassurantes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Données protégées</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vos dossiers, carnets de liaison et compétences sont sauvegardés et intacts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-brand-blue flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Durée estimée</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Interruption habituelle de moins de 30 minutes. Rétablissement rapide.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Séances préservées</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vos séances planifiées sont maintenues selon vos accords directs par message.
            </p>
          </div>
        </div>

        {/* Message de test d'état en direct */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-2.5 max-w-md mx-auto ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {isOnline ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <span className="text-left leading-snug">{statusMessage}</span>
          </div>
        )}

        {/* Actions utilisateur */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isOnline ? (
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Accéder à l'accueil</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-blue hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Vérification en cours...' : 'Vérifier si le service est rétabli'}</span>
            </button>
          )}

          <a
            href="mailto:contact@benevolat.km"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4 text-slate-500" />
            <span>Contacter l'assistance</span>
          </a>
        </div>

        {/* Notice d'urgence protection des mineurs */}
        <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-500 max-w-lg mx-auto">
          <p>
            Pour toute situation urgente concernant la protection d'un mineur, vous pouvez écrire directement à{' '}
            <a href="mailto:protection@benevolat.km" className="text-rose-600 font-semibold underline">
              protection@benevolat.km
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
