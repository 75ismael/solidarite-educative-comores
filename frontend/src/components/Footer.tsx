import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Heart, MapPin, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070512] text-slate-400 pt-14 pb-10 border-t border-[#221B47] mt-20 relative overflow-hidden">
      {/* Halo violet subtil en fond */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 : Présentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center shadow-md shadow-purple-950/60">
                <BookOpen className="w-5 h-5 text-purple-200" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">Solidarité Éducative</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plateforme associative de soutien scolaire bénévole pour les élèves des Comores, coordonnée entre la France et les Comores.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Zone pilote : Ngazidja (Grande Comore)</span>
            </div>
          </div>

          {/* Col 2 : Liens Rapides */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Plateforme
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white hover:text-purple-300 transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-white hover:text-purple-300 transition-colors">Notre Mission &amp; Vision</Link>
              </li>
              <li>
                <Link to="/programmes" className="hover:text-white hover:text-purple-300 transition-colors">Programmes Scolaires</Link>
              </li>
              <li>
                <Link to="/missions" className="hover:text-white hover:text-purple-300 transition-colors">Appels à bénévoles</Link>
              </li>
              <li>
                <Link to="/actualites" className="hover:text-white hover:text-purple-300 transition-colors">Actualités &amp; Conseils</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:text-purple-300 transition-colors">Contact &amp; Relais locaux</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Éthique & Protection */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Protection des mineurs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/charte-ethique" className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
                  <span>Charte éthique officielle</span>
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400 leading-relaxed block">
                  Dossiers anonymisés, vérification manuelle des bénévoles et consentement parental obligatoire.
                </span>
              </li>
              <li className="pt-2">
                <Link
                  to="/signalement-protection"
                  className="inline-block text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/40 px-3.5 py-2 rounded-full hover:bg-rose-900/60 hover:text-white transition-all shadow-xs"
                >
                  Canal confidentiel de signalement
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 : Transparence & Impact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Transparence &amp; Impact
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Chaque euro et franc comorien collecté est affecté directement aux outils pédagogiques et à la connectivité.
            </p>
            <div className="space-y-2.5 text-xs">
              <Link
                to="/transparence"
                className="flex items-center gap-1.5 text-purple-300 hover:text-white font-semibold transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-purple-400" /> Comptes publics &amp; Dons
              </Link>
              <Link
                to="/rapport-impact"
                className="flex items-center gap-1.5 text-purple-300 hover:text-white font-semibold transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Rapport d'impact consolidé
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1F183E] text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Solidarité Éducative Comores. Plateforme associative d'accompagnement scolaire solidaire.</p>
        </div>
      </div>
    </footer>
  );
};
