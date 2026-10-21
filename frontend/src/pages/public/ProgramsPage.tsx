import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, Compass, Smartphone, Clock, CheckCircle2 } from 'lucide-react';

export const ProgramsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-brand-teal text-xs font-semibold">
          <GraduationCap className="w-4 h-4" /> Programmes scolaires & Méthodologie
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-blue tracking-tight">
          Un soutien scolaire adapté à chaque cycle d'apprentissage
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Du renforcement des fondamentaux en primaire jusqu'à la préparation aux examens d'État (Brevet, Baccalauréat), nos programmes reposent sur des méthodes simples, régulières et éprouvées.
        </p>
      </div>

      {/* 2. Les 3 Programmes par Cycle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cycle 1 : Primaire */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">Du CP au CM2</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Programme Primaire</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Consolider la lecture fluide, l'expression écrite, la conjugaison et les bases de la numération et des 4 opérations pour réussir l'entrée au collège.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Matières clés :</div>
              <ul className="space-y-1">
                <li>• Français (lecture, grammaire, dictée)</li>
                <li>• Mathématiques (calcul, géométrie de base)</li>
                <li>• Méthodologie et autonomie</li>
              </ul>
            </div>
          </div>

          <Link
            to="/demande-soutien"
            className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Inscrire un élève de primaire
          </Link>
        </div>

        {/* Cycle 2 : Collège */}
        <div className="bg-white rounded-3xl border-2 border-brand-teal p-6 shadow-md flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-teal text-white text-[11px] font-bold uppercase tracking-wider">
            Priorité Brevet
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-brand-blue flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">De la 6ème à la 3ème</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Programme Collège</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maîtrise de l'algèbre, de la géométrie démonstrative, des sciences et des dissertations. Entraînement ciblé sur les annales du Brevet des collèges.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Matières clés :</div>
              <ul className="space-y-1">
                <li>• Mathématiques (Pythagore, Thalès, calcul littéral)</li>
                <li>• Français (analyse de texte, rédaction)</li>
                <li>• Sciences de la Vie et de la Terre (SVT)</li>
                <li>• Physique-Chimie</li>
              </ul>
            </div>
          </div>

          <Link
            to="/demande-soutien"
            className="w-full text-center py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white text-xs font-bold shadow transition-colors"
          >
            Inscrire un collégien
          </Link>
        </div>

        {/* Cycle 3 : Lycée */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">De la 2nde à la Terminale</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Programme Lycée</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Préparation rigoureuse au Baccalauréat comorien ou français. Approfondissement conceptuel, rigueur de rédaction et orientation vers les études supérieures.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Matières clés :</div>
              <ul className="space-y-1">
                <li>• Mathématiques & Analyse</li>
                <li>• Physique-Chimie approfondie</li>
                <li>• Philosophie & Littérature</li>
                <li>• Histoire-Géographie</li>
              </ul>
            </div>
          </div>

          <Link
            to="/demande-soutien"
            className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Inscrire un lycéen
          </Link>
        </div>
      </div>

      {/* 3. Méthodologie adaptée aux connexions lentes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">
            Pragmatisme & Efficacité
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-blue">
            Une méthode adaptée aux réalités des Comores
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Pour tenir compte des coupures d'électricité ou des connexions internet intermittentes, nos binômes utilisent des modes de travail légers et ultra-résilients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
              <Smartphone className="w-5 h-5 text-brand-teal" />
              <span>Outils ultra-légers</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pas de logiciels lourds ni d'applications gourmandes en données. Séances via appels WhatsApp, échange de photos d'exercices et manuels imprimés.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
              <Clock className="w-5 h-5 text-brand-teal" />
              <span>Régularité & Ponctualité</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              1 séance de 1h30 par semaine à jour et heure fixes. En cas d'indisponibilité réseau, le créneau est décalé d'un commun accord avec la famille.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-brand-teal" />
              <span>Compte rendu en 2 min</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rempli par le bénévole dès la fin du cours sur smartphone : notions travaillées, appréciation, et devoirs pour la semaine suivante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
