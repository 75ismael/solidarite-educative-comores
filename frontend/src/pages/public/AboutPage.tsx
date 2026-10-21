import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractResults } from '../../api/client';
import { Partner, Milestone } from '../../types';
import { BookOpen, ShieldCheck, Heart, MapPin, Users, Target, CheckCircle2, Award, Building2, ExternalLink, ChevronRight, History } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    apiClient.get('/cms/partners/').then((res) => {
      const data = extractResults<Partner>(res.data);
      if (data.length) setPartners(data);
    }).catch(() => {});

    apiClient.get('/cms/milestones/').then((res) => {
      const data = extractResults<Milestone>(res.data);
      if (data.length) setMilestones(data);
    }).catch(() => {});
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* 1. Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-brand-blue text-xs font-semibold">
          <BookOpen className="w-4 h-4" /> Projet associatif de solidarité éducative
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-blue tracking-tight">
          Donner à chaque enfant comorien les mêmes chances de réussir
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Née de la volonté commune de la diaspora en France et des acteurs éducatifs aux Comores, notre initiative organise un soutien scolaire bénévole, gratuit, rigoureusement documenté et sécurisé.
        </p>
      </div>

      {/* 2. Notre Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Notre Mission</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identifier les élèves en difficulté scolaire aux Comores (primaire, collège, lycée), mobiliser des bénévoles qualifiés, organiser des binômes sur mesure et assurer un suivi hebdomadaire factuel des progrès et des blocages.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Accès 100% gratuit, sans discrimination financière</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Attribution basée sur les besoins réels et compétences</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Suivi documenté après chaque séance de tutorat</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-brand-blue flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Notre Vision</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Faire en sorte qu'aucun élève ne soit laissé pour compte face aux examens (Brevet, Baccalauréat) ou aux fondamentaux de lecture et de calcul, en créant un pont de solidarité durable et bienveillant entre la France et les Comores.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Valorisation des compétences de la diaspora et des enseignants locaux</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Transparence absolue dans la gestion des ressources</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              <span>Protection inconditionnelle de l'enfance</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. NOTRE HISTOIRE & GENÈSE DU PROJET (CMS) */}
      {milestones.length > 0 && (
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-brand-teal text-xs font-semibold">
              <History className="w-4 h-4" /> Les Origines du Projet
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
              Notre Histoire : de l'étincelle à la mobilisation
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
              Comment une poignée d'enseignants aux Comores et de bénévoles de la diaspora en France ont bâti un pont éducatif durable.
            </p>
          </div>

          <div className="relative border-l-2 border-teal-500/30 ml-4 sm:ml-28 space-y-8 pl-6 sm:pl-8 py-2">
            {milestones.map((m) => (
              <div key={m.id} className="relative group">
                {/* Pastille interactive sur l'axe vertical */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 rounded-full bg-white border-2 border-brand-teal flex items-center justify-center text-brand-teal shadow-xs group-hover:bg-brand-teal group-hover:text-white transition-colors">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                </div>

                {/* Année mise en valeur sur grand écran à gauche de la frise */}
                <div className="hidden sm:block absolute -left-28 top-1.5 w-20 text-right">
                  <span className="text-lg font-extrabold text-brand-blue tracking-tight">
                    {m.year}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="sm:hidden font-extrabold text-brand-blue text-sm">
                      {m.year}
                    </span>
                    {m.tag && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-brand-blue">
                        {m.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Organisation & Équipe (Cahier des charges Chapitre 15) */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
            Organisation & Gouvernance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Une structure claire avec séparation stricte des rôles pour garantir la sécurité et l'éthique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">Pédagogie</span>
            <h3 className="font-bold text-base text-slate-900">Coordination Pédagogique</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Évalue les demandes des familles, valide la priorité pédagogique, supervise les binômes et analyse les comptes rendus de séance.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">Protection</span>
            <h3 className="font-bold text-base text-slate-900">Référent Protection Mineurs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fonction étanche dédiée à la réception des signalements sensibles, à l'application de la charte et à la gestion des protocoles d'urgence.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Gestion</span>
            <h3 className="font-bold text-base text-slate-900">Responsable Financier</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assure la conformité comptable, le contrôle des factures (connectivité, livrets scolaires) et la publication des comptes publics.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wide">Bénévoles</span>
            <h3 className="font-bold text-base text-slate-900">Responsable des Bénévoles</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accompagne les nouveaux tuteurs, vérifie les compétences déclarées et organise les modules de formation à la charte.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Terrain</span>
            <h3 className="font-bold text-base text-slate-900">Relais Locaux aux Comores</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Points de contact physiques à Moroni (Ngazidja), Mutsamudu (Ndzuwani) et Mohéli pour la remise de matériel et le contact avec les écoles.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Numérique</span>
            <h3 className="font-bold text-base text-slate-900">Support Technique & Data</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Garantit l'anonymisation des bases de données, l'accessibilité sur connexions lentes et la sécurité des accès administratifs.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Zone d'intervention & Extension progressive */}
      <div className="bg-cyan-950 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
            Périmètre d'action
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Déploiement Pilote aux Comores
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Le dispositif démarre dans une zone pilote à Moroni et en Grande Comore (Ngazidja). Son extension aux îles d'Anjouan (Ndzuwani) et Mohéli (Mwali) s'effectue après chaque évaluation semestrielle des résultats et des retours de terrain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-teal-300 font-bold block">Phase 1 (Active)</span>
            <div className="font-bold text-base">Grande Comore (Ngazidja)</div>
            <span className="text-xs text-slate-400">Zone pilote • Moroni et périphérie</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-teal-300 font-bold block">Phase 2</span>
            <div className="font-bold text-base">Anjouan (Ndzuwani)</div>
            <span className="text-xs text-slate-400">Ouverture progressive • Mutsamudu</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-teal-300 font-bold block">Phase 3</span>
            <div className="font-bold text-base">Mohéli (Mwali)</div>
            <span className="text-xs text-slate-400">Extension nationale • Fomboni</span>
          </div>
        </div>
      </div>

      {/* 5. Écosystème & Partenaires Associés (CMS) */}
      {partners.length > 0 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
              Alliances & Soutiens
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
              Nos partenaires officiels
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Des organisations unies pour la réussite des élèves et l'égalité des chances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {p.category_display || p.category}
                    </span>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-brand-teal"
                        title="Site web"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-brand-teal flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {p.website_url && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-brand-teal font-medium">
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>En savoir plus</span>
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Call to action */}
      <div className="text-center pt-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">
          Vous souhaitez soutenir ou participer à cette aventure humaine ?
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/devenir-benevole"
            className="px-6 py-3 rounded-xl bg-brand-teal text-white font-bold text-sm shadow hover:bg-teal-700 transition-colors"
          >
            Rejoindre comme bénévole
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
};
