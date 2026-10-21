import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractResults } from '../../api/client';
import { KeyMetric, PublicMission, Article, Testimonial, FAQItem, Partner } from '../../types';
import {
  BookOpen,
  HeartHandshake,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  HelpCircle,
  Users,
  Heart,
  Building2,
  ExternalLink,
  FileText,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [metrics, setMetrics] = useState<KeyMetric[]>([]);
  const [missions, setMissions] = useState<PublicMission[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faq, setFaq] = useState<FAQItem[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeJourney, setActiveJourney] = useState<'volunteer' | 'family'>('volunteer');

  useEffect(() => {
    // Charger le contenu CMS de la page d'accueil
    apiClient.get('/cms/metrics/').then((res) => {
      const data = extractResults<KeyMetric>(res.data);
      if (data.length) setMetrics(data);
    }).catch(() => {});

    apiClient.get('/volunteering/missions/').then((res) => {
      const data = extractResults<PublicMission>(res.data);
      setMissions(data.slice(0, 3));
    }).catch(() => {});

    apiClient.get('/cms/articles/').then((res) => {
      const data = extractResults<Article>(res.data);
      if (data.length) setArticles(data.slice(0, 3));
    }).catch(() => {});

    apiClient.get('/cms/testimonials/').then((res) => {
      const data = extractResults<Testimonial>(res.data);
      if (data.length) setTestimonials(data);
    }).catch(() => {});

    apiClient.get('/cms/faq/').then((res) => {
      const data = extractResults<FAQItem>(res.data);
      if (data.length) setFaq(data);
    }).catch(() => {});

    apiClient.get('/cms/partners/').then((res) => {
      const data = extractResults<Partner>(res.data);
      if (data.length) setPartners(data);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-950 via-brand-blue to-cyan-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Programme Pilote 2026 • Coordination France - Comores
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Offrons à chaque élève aux Comores un soutien scolaire{' '}
            <span className="text-teal-400">bienveillant et gratuit</span>.
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Nous mettons en relation des élèves du primaire, collège et lycée avec des bénévoles engagés
            (étudiants, enseignants, diaspora) pour un accompagnement méthodique, régulier et documenté.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/devenir-benevole"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-5 h-5" />
              Devenir bénévole
            </Link>
            <Link
              to="/transparence#faire-un-don"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-white" />
              Faire un don
            </Link>
            <Link
              to="/demande-soutien"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              Inscrire un élève
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CHIFFRES CLÉS / KEY METRICS (F12, F21) */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(metrics.length > 0 ? metrics : [
            { id: 1, label: 'Élèves accompagnés', value: '142', icon: 'Users' },
            { id: 2, label: 'Bénévoles mobilisés', value: '48', icon: 'Heart' },
            { id: 3, label: 'Séances réalisées', value: '890', icon: 'BookOpen' },
            { id: 4, label: 'Assiduité', value: '95%', icon: 'Award' },
          ]).map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 text-center space-y-1 hover:shadow-md transition-shadow"
            >
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-blue tracking-tight">
                {m.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NOS PILIERS D'ACTION (Selon Cahier des Charges) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
            Bien plus qu'une simple mise en relation
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Un dispositif rigoureux pensé pour garantir la régularité pédagogique et la sécurité absolue des élèves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Suivi Pédagogique Documenté</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Chaque séance fait l'objet d'un compte rendu concis : notions abordées, exercices réalisés, niveau de compréhension et prochaines étapes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-brand-blue flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Protection Stricte des Mineurs</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dossiers anonymisés, vérification des bénévoles, consentement parental formel et canal direct de signalement confidentiel.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Transparence Totale</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Publication transparente des dons reçus, des dépenses affectées (connectivité, livrets scolaires) et des résultats agrégés d'impact.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LES PARCOURS D'ACCOMPAGNEMENT : BÉNÉVOLE OU ÉLÈVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-brand-blue to-cyan-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Effets lumineux d'arrière-plan */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* En-tête de section */}
          <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Comment ça fonctionne
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Des parcours simples, transparents et accompagnés
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Que vous souhaitiez transmettre votre savoir ou trouver un accompagnement de qualité pour un élève, découvrez chaque étape du parcours.
            </p>

            {/* Commutateur Bénévole / Famille */}
            <div className="pt-4 flex justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
                <button
                  type="button"
                  onClick={() => setActiveJourney('volunteer')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeJourney === 'volunteer'
                      ? 'bg-teal-500 text-slate-950 shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  Je souhaite devenir Bénévole
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJourney('family')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeJourney === 'family'
                      ? 'bg-cyan-400 text-slate-950 shadow-md'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Je cherche un soutien (Familles)
                </button>
              </div>
            </div>
          </div>

          {/* Contenu selon l'onglet actif */}
          <div className="mt-12 relative z-10">
            {activeJourney === 'volunteer' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Étape 1 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-400/20 text-teal-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 01
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Candidature & Matières
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Indiquez vos matières de prédilection, le niveau scolaire ciblé (primaire, collège, lycée) et votre disponibilité hebdomadaire (1 à 2h).
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-teal-300/80 font-medium mt-4">
                      Formulaire rapide en 2 minutes
                    </div>
                  </div>

                  {/* Étape 2 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-400/20 text-teal-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 02
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Charte éthique & Entretien
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Signature numérique de notre Charte de protection des mineurs et court échange d'accueil avec l'équipe pour valider votre engagement.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-teal-300/80 font-medium mt-4">
                      Sécurité et cadre éthique garantis
                    </div>
                  </div>

                  {/* Étape 3 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-400/20 text-teal-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 03
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <HeartHandshake className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Matching affinitaire
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Notre algorithme et l'équipe pédagogique vous apparient avec un élève selon vos créneaux partagés, la matière clé et le format (présentiel ou visio).
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-teal-300/80 font-medium mt-4">
                      Binôme sur-mesure & équilibré
                    </div>
                  </div>

                  {/* Étape 4 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-400/20 text-teal-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 04
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Tutorat & Carnet de liaison
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Animation des séances hebdomadaires et remplissage du compte rendu succinct après chaque cours pour informer les parents et mesurer les progrès.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-teal-300/80 font-medium mt-4">
                      Tableau de bord & ressources inclus
                    </div>
                  </div>
                </div>

                {/* Actions Bénévole */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    to="/devenir-benevole"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    Rejoindre l'équipe des bénévoles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/missions"
                    className="text-xs sm:text-sm text-slate-300 hover:text-white font-semibold underline underline-offset-4 flex items-center gap-1"
                  >
                    Voir les missions en attente de bénévoles
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Étape 1 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-400/20 text-cyan-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 01
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Demande d'aide scolaire
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Le parent ou représentant légal remplit le formulaire : classe de l'enfant, matières nécessitant un soutien, objectifs et créneaux favorables.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-cyan-300/80 font-medium mt-4">
                      Totalement gratuit et accessible
                    </div>
                  </div>

                  {/* Étape 2 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-400/20 text-cyan-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 02
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Code secret & Sécurité
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Un identifiant anonymisé (ex: COM-3401) est attribué à l'élève avec recueil du consentement parental. L'identité complète n'est jamais divulguée publiquement.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-cyan-300/80 font-medium mt-4">
                      Protection absolue des données
                    </div>
                  </div>

                  {/* Étape 3 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-400/20 text-cyan-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 03
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Attribution d'un tuteur
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        L'équipe pédagogique mobilise un bénévole qualifié correspondant exactement aux besoins exprimés et organise la mise en relation sécurisée.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-cyan-300/80 font-medium mt-4">
                      Bénévoles sélectionnés et vérifiés
                    </div>
                  </div>

                  {/* Étape 4 */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative flex flex-col justify-between hover:bg-white/15 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-400/20 text-cyan-300 font-extrabold text-xs tracking-wider">
                          ÉTAPE 04
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Séances & Suivi des progrès
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        L'élève suit ses séances régulières. Les parents consultent les notes pédagogiques dans le carnet de liaison et constatent la progression des résultats.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-cyan-300/80 font-medium mt-4">
                      Visibilité totale pour les parents
                    </div>
                  </div>
                </div>

                {/* Actions Famille */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    to="/demande-soutien"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Inscrire un élève gratuitement
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/transparence"
                    className="text-xs sm:text-sm text-slate-300 hover:text-white font-semibold underline underline-offset-4 flex items-center gap-1"
                  >
                    Consulter notre charte et nos garanties
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. MISSIONS DE BÉNÉVOLAT OUVERTES (F04 anonymisées) */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                Appels publics au bénévolat
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue mt-1">
                Missions en attente de bénévoles
              </h2>
            </div>
            <Link
              to="/missions"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:underline"
            >
              Voir toutes les missions ({missions.length})
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missions.length > 0 ? (
              missions.map((mission) => (
                <div
                  key={mission.id}
                  className="rounded-2xl border border-slate-200 p-5 hover:border-brand-teal transition-colors flex flex-col justify-between space-y-4 bg-slate-50/50"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-100 text-cyan-900">
                        {mission.subject_name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {mission.format_display}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base line-clamp-2">
                      {mission.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3">
                      {mission.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mission.island} {mission.city && `• ${mission.city}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Engagement : {mission.expected_commitment}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/devenir-benevole"
                    className="w-full text-center py-2.5 rounded-lg bg-brand-blue hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    Postuler à cette mission
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 col-span-3 text-center py-6">
                Toutes les missions actuelles ont trouvé un binôme. De nouveaux besoins sont publiés régulièrement.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. ACTUALITÉS & VIE ASSOCIATIVE (CMS) */}
      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-brand-blue text-xs font-semibold">
                <FileText className="w-3.5 h-3.5" /> Vie associative & Conseils
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
                Dernières actualités & Bilans
              </h2>
              <p className="text-sm text-slate-600 max-w-xl">
                Suivez les étapes du projet solidaire aux Comores et découvrez nos conseils pédagogiques.
              </p>
            </div>
            <Link
              to="/actualites"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-teal hover:underline self-start sm:self-end"
            >
              <span>Toutes les actualités</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {art.image_url && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-brand-teal font-semibold text-[11px]">
                        {art.category_display || art.category}
                      </span>
                      <span>
                        {new Date(art.published_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-blue transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {art.excerpt || art.content.slice(0, 140) + '...'}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <Link
                    to="/actualites"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal group-hover:underline"
                  >
                    <span>Lire l'article complet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 6. TÉMOIGNAGES (CMS) */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
              Ils témoignent de leur expérience
            </h2>
            <p className="text-sm text-slate-600">
              Familles accompagnées et bénévoles engagés racontent les progrès réalisés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  « {t.quote} »
                </p>
                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="font-bold text-slate-900 block">{t.name}</span>
                    <span className="text-slate-500">{t.role}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {t.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. PARTENAIRES & SOUTIENS (CMS) */}
      {partners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-brand-teal" /> Écosystème & Partenariats
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue">
              Ils soutiennent l'accompagnement scolaire aux Comores
            </h2>
            <p className="text-sm text-slate-600">
              Institutions publiques, universités, associations de la diaspora et mécènes unis pour la réussite de chaque élève.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 tracking-wide">
                      {p.category_display || p.category}
                    </span>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-brand-teal transition-colors"
                        title={`Visiter le site de ${p.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-start gap-3.5">
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-cyan-50 text-brand-teal flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue transition-colors leading-snug">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {p.website_url && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-teal font-medium">
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <span>Découvrir leur action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Encart Devenir Partenaire */}
          <div className="bg-gradient-to-r from-slate-50 to-teal-50/50 rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Vous représentez une institution, une école ou une entreprise ?
              </h4>
              <p className="text-xs text-slate-600">
                Rejoignez notre réseau de partenaires pour fournir du matériel pédagogique, des espaces d'étude ou de la connectivité.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors"
            >
              Proposer un partenariat
            </Link>
          </div>
        </section>
      )}

      {/* 7. FAQ (CMS) */}
      {faq.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-brand-blue">Questions fréquentes</h2>
            <p className="text-sm text-slate-600">Comprendre le fonctionnement de l'accompagnement</p>
          </div>

          <div className="space-y-3">
            {faq.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === item.id ? null : item.id)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brand-teal shrink-0" />
                    {item.question}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === item.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaq === item.id && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. APPEL À L'ACTION FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-blue text-white p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto">
            Vous souhaitez participer au projet ou inscrire un enfant ?
          </h2>
          <p className="max-w-xl mx-auto text-slate-300 text-sm sm:text-base">
            Que vous ayez 1 heure par semaine à offrir ou que votre enfant ait besoin d'aide pour réussir ses examens, rejoignez notre communauté solidaire.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/devenir-benevole"
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm shadow transition-colors"
            >
              Rejoindre comme bénévole
            </Link>
            <Link
              to="/transparence#faire-un-don"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              Faire un don
            </Link>
            <Link
              to="/demande-soutien"
              className="px-6 py-3 rounded-xl bg-white text-brand-blue hover:bg-slate-100 font-bold text-sm transition-colors"
            >
              Faire une demande d'aide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
