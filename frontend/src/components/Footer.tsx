import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Heart, MapPin, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-blue text-slate-300 pt-12 pb-8 border-t border-cyan-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 : Présentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 rounded-lg bg-brand-teal flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Solidarité Éducative</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plateforme associative de soutien scolaire bénévole pour les élèves des Comores, coordonnée entre la France et les Comores.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Zone pilote : Ngazidja (Grande Comore)</span>
            </div>
          </div>

          {/* Col 2 : Liens Rapides */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Plateforme
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              </li>
              <li>
                <Link to="/a-propos" className="hover:text-white transition-colors">Notre Mission & Vision</Link>
              </li>
              <li>
                <Link to="/programmes" className="hover:text-white transition-colors">Programmes Scolaires</Link>
              </li>
              <li>
                <Link to="/missions" className="hover:text-white transition-colors">Appels à bénévoles</Link>
              </li>
              <li>
                <Link to="/actualites" className="hover:text-white transition-colors">Actualités & Conseils</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact & Relais locaux</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Éthique & Protection */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Protection des mineurs
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/charte-ethique" className="flex items-center gap-2 text-emerald-400 hover:underline">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Charte éthique officielle</span>
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400">
                  Dossiers anonymisés, vérification manuelle des bénévoles et consentement parental obligatoire.
                </span>
              </li>
              <li className="pt-2">
                <Link
                  to="/signalement-protection"
                  className="inline-block text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-md hover:bg-rose-900 transition-colors"
                >
                  Canal confidentiel de signalement
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 : Transparence & Impact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Transparence & Impact
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Chaque euro et franc comorien collecté est affecté directement aux outils pédagogiques et à la connectivité.
            </p>
            <div className="space-y-2 text-xs">
              <Link
                to="/transparence"
                className="flex items-center gap-1.5 text-teal-300 font-semibold hover:underline"
              >
                <Heart className="w-3.5 h-3.5" /> Comptes publics & Dons
              </Link>
              <Link
                to="/rapport-impact"
                className="flex items-center gap-1.5 text-teal-300 font-semibold hover:underline"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Rapport d'impact officiel (F21)
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-cyan-900/60 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Solidarité Éducative Comores. Projet associatif d'accompagnement scolaire solidaire.</p>
        </div>
      </div>
    </footer>
  );
};
