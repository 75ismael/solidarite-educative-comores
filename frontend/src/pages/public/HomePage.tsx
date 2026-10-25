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
    <div className="space-y-20 pb-16 bg-[#0B0817] text-slate-100">
      {/* 1. HERO SECTION (Inspiré de Scaleway : fond sombre violet avec lueur centrale) */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#281F4B]/60">
        {/* Halos lumineux de fond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-900/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 text-purple-300 text-xs font-semibold tracking-wide border border-purple-800/50 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            Programme Pilote 2026 • Coordination France &ndash; Comores
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
            Offrons à chaque élève aux Comores un soutien scolaire{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
              bienveillant et gratuit
            </span>.
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            Nous mettons en relation des élèves du primaire, collège et lycée avec des bénévoles engagés
            (étudiants, enseignants, diaspora) pour un accompagnement méthodique, régulier et sécurisé.
          </p>

          {/* Boutons d'action (Style pilule Scaleway) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              to="/devenir-benevole"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <HeartHandshake className="w-4 h-4" />
              Devenir bénévole
            </Link>
            <Link
              to="/demande-soutien"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              Inscrire un élève
              <ArrowRight className="w-4 h-4 text-purple-300" />
            </Link>
            <Link
              to="/transparence#faire-un-don"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              Faire un don
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CHIFFRES CLÉS / KEY METRICS (Exactement comme 100+, 4, 65+, 5 000+ sur Scaleway) */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 sm:-mt-14 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(metrics.length > 0 ? metrics : [
            { id: 1, label: 'Élèves accompagnés', value: '142', icon: 'Users' },
            { id: 2, label: 'Bénévoles mobilisés', value: '48', icon: 'Heart' },
            { id: 3, label: 'Séances réalisées', value: '890', icon: 'BookOpen' },
            { id: 4, label: 'Assiduité moyenne', value: '95%', icon: 'Award' },
          ]).map((m) => (
            <div
              key={m.id}
              className="bg-[#140F2D]/90 backdrop-blur-md rounded-2xl p-6 border border-[#281F4B] text-center space-y-1 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-950/30 transition-all group"
            >
              <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                {m.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NOS PILIERS D'ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Méthode &amp; Rigueur
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Bien plus qu'une simple mise en relation
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Un dispositif pensé pour garantir la régularité pédagogique et la sécurité absolue des élèves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#140F2D]/80 backdrop-blur-md rounded-2xl p-7 border border-[#281F4B] space-y-3 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-800/40 text-purple-400 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Suivi Pédagogique Documenté</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Chaque séance fait l'objet d'un compte rendu concis : notions abordées, exercices réalisés, niveau de compréhension et prochaines étapes.
            </p>
          </div>

          <div className="bg-[#140F2D]/80 backdrop-blur-md rounded-2xl p-7 border border-[#281F4B] space-y-3 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Protection Stricte des Mineurs</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Dossiers anonymisés, vérification des bénévoles, consentement parental formel et canal direct de signalement confidentiel.
            </p>
          </div>

          <div className="bg-[#140F2D]/80 backdrop-blur-md rounded-2xl p-7 border border-[#281F4B] space-y-3 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Transparence Totale</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Publication transparente des dons reçus, des dépenses affectées (connectivité, livrets scolaires) et des résultats agrégés d'impact.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LES PARCOURS D'ACCOMPAGNEMENT : BÉNÉVOLE OU ÉLÈVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#171136] via-[#120E2C] to-[#0A0717] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-[#281F4B] relative overflow-hidden">
          {/* Effets lumineux d'arrière-plan */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* En-tête de section */}
          <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-800/50">
              <Sparkles className="w-3.5 h-3.5" />
              Comment ça fonctionne
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Des parcours simples, transparents et accompagnés
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Que vous souhaitiez transmettre votre savoir ou trouver un accompagnement de qualité pour un élève, découvrez chaque étape du parcours.
            </p>

            {/* Commutateur Bénévole / Famille (Style pilule) */}
            <div className="pt-4 flex justify-center">
              <div className="inline-flex p-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveJourney('volunteer')}
                  className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeJourney === 'volunteer'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  Je souhaite devenir Bénévole
                </button>
                <button
                  type="button"
                  onClick={() => setActiveJourney('family')}
                  className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeJourney === 'family'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 font-extrabold text-xs tracking-wider border border-purple-800/40">
                          ÉTAPE 01
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Candidature &amp; Matières
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Indiquez vos matières de prédilection, le niveau scolaire ciblé (primaire, collège, lycée) et votre disponibilité hebdomadaire (1 à 2h).
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-purple-300 font-medium mt-4">
                      Formulaire rapide en 2 minutes
                    </div>
                  </div>

                  {/* Étape 2 */}
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 font-extrabold text-xs tracking-wider border border-purple-800/40">
                          ÉTAPE 02
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Charte éthique &amp; Entretien
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Signature numérique de notre Charte de protection des mineurs et court échange d'accueil avec l'équipe pour valider votre engagement.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-purple-300 font-medium mt-4">
                      Sécurité et cadre éthique garantis
                    </div>
                  </div>

                  {/* Étape 3 */}
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 font-extrabold text-xs tracking-wider border border-purple-800/40">
                          ÉTAPE 03
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <HeartHandshake className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Matching affinitaire
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Notre équipe vous apparie avec un élève selon vos créneaux partagés, la matière clé et le format (présentiel ou visio).
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-purple-300 font-medium mt-4">
                      Binôme sur-mesure &amp; équilibré
                    </div>
                  </div>

                  {/* Étape 4 */}
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 font-extrabold text-xs tracking-wider border border-purple-800/40">
                          ÉTAPE 04
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Tutorat &amp; Carnet de liaison
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Animation des séances hebdomadaires et remplissage du compte rendu succinct après chaque cours pour informer les parents et mesurer les progrès.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-purple-300 font-medium mt-4">
                      Tableau de bord &amp; ressources inclus
                    </div>
                  </div>
                </div>

                {/* Actions Bénévole */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    to="/devenir-benevole"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
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
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 font-extrabold text-xs tracking-wider border border-indigo-800/40">
                          ÉTAPE 01
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Demande d'aide scolaire
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Le parent remplit le formulaire : classe de l'enfant, matières nécessitant un soutien, objectifs et créneaux favorables.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-indigo-300 font-medium mt-4">
                      Totalement gratuit et accessible
                    </div>
                  </div>

                  {/* Étape 2 */}
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 font-extrabold text-xs tracking-wider border border-indigo-800/40">
                          ÉTAPE 02
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Code secret &amp; Sécurité
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Un identifiant anonymisé (ex: COM-3401) est attribué à l'élève avec recueil du consentement parental.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-indigo-300 font-medium mt-4">
                      Protection absolue des données
                    </div>
                  </div>

                  {/* Étape 3 */}
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 font-extrabold text-xs tracking-wider border border-indigo-800/40">
                          ÉTAPE 03
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Attribution d'un tuteur
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        L'équipe mobilise un bénévole qualifié correspondant aux besoins exprimés et organise la mise en relation sécurisée.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-indigo-300 font-medium mt-4">
                      Bénévoles sélectionnés et vérifiés
                    </div>
                  </div>

                  {/* Étape 4 */}
                  <div className="bg-[#140F2D]/90 backdrop-blur-sm border border-[#281F4B] rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 font-extrabold text-xs tracking-wider border border-indigo-800/40">
                          ÉTAPE 04
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-white">
                        Séances &amp; Suivi des progrès
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        L'élève suit ses séances régulières. Les parents consultent les notes dans le carnet de liaison et constatent la progression.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 text-[11px] text-indigo-300 font-medium mt-4">
                      Visibilité totale pour les parents
                    </div>
                  </div>
                </div>

                {/* Actions Famille */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Link
                    to="/demande-soutien"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
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

      {/* 5. MISSIONS DE BÉNÉVOLAT OUVERTES */}
      <section className="py-12 border-y border-[#281F4B]/80 bg-[#0E0A20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Appels publics au bénévolat
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Missions en attente de bénévoles
              </h2>
            </div>
            <Link
              to="/missions"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline"
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
                  className="rounded-2xl border border-[#281F4B] p-6 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 bg-[#140F2D] hover:shadow-xl hover:shadow-purple-950/30"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 border border-purple-800/40 text-purple-300">
                        {mission.subject_name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {mission.format_display}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base line-clamp-2">
                      {mission.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {mission.description}
                    </p>

                    <div className="pt-3 border-t border-[#281F4B] text-xs text-slate-400 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{mission.island} {mission.city && `• ${mission.city}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Engagement : {mission.expected_commitment}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/devenir-benevole"
                    className="w-full text-center py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/40 transition-all"
                  >
                    Postuler à cette mission
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 col-span-3 text-center py-6">
                Toutes les missions actuelles ont trouvé un binôme. De nouveaux besoins sont publiés régulièrement.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 6. ACTUALITÉS & VIE ASSOCIATIVE (CMS) */}
      {articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5" /> Vie associative &amp; Conseils
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Dernières actualités &amp; Bilans
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Suivez les étapes du projet solidaire aux Comores et découvrez nos conseils pédagogiques.
              </p>
            </div>
            <Link
              to="/actualites"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline self-start sm:self-end"
            >
              <span>Toutes les actualités</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-[#140F2D] rounded-2xl border border-[#281F4B] overflow-hidden shadow-md hover:border-purple-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {art.image_url && (
                    <div className="h-44 w-full overflow-hidden bg-slate-900">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 font-semibold text-[11px]">
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

                    <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {art.excerpt || art.content.slice(0, 140) + '...'}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    to="/actualites"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:underline"
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

      {/* 7. TÉMOIGNAGES (CMS) */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ils témoignent de leur expérience
            </h2>
            <p className="text-sm text-slate-400">
              Familles accompagnées et bénévoles engagés racontent les progrès réalisés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-[#140F2D] rounded-2xl p-6 border border-[#281F4B] shadow-md space-y-4 hover:border-purple-500/40 transition-all"
              >
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  « {t.quote} »
                </p>
                <div className="flex items-center justify-between text-xs border-t border-[#281F4B] pt-4">
                  <div>
                    <span className="font-bold text-white block">{t.name}</span>
                    <span className="text-purple-400">{t.role}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                    {t.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. PARTENAIRES & SOUTIENS (CMS) */}
      {partners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-purple-400" /> Écosystème &amp; Partenariats
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ils soutiennent l'accompagnement scolaire aux Comores
            </h2>
            <p className="text-sm text-slate-400">
              Institutions publiques, universités, associations de la diaspora et mécènes unis pour la réussite de chaque élève.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div
                key={p.id}
                className="bg-[#140F2D] rounded-2xl p-6 border border-[#281F4B] shadow-md hover:border-purple-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 tracking-wide">
                      {p.category_display || p.category}
                    </span>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-purple-300 transition-colors"
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
                        className="w-12 h-12 rounded-xl object-cover border border-[#281F4B] shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-800/40 text-purple-400 flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors leading-snug">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {p.website_url && (
                  <div className="mt-4 pt-3 border-t border-[#281F4B] flex items-center justify-between text-xs text-purple-400 font-medium">
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
          <div className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-white text-sm sm:text-base">
                Vous représentez une institution, une école ou une entreprise ?
              </h4>
              <p className="text-xs text-slate-400">
                Rejoignez notre réseau de partenaires pour fournir du matériel pédagogique, des espaces d'étude ou de la connectivité.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-colors"
            >
              Proposer un partenariat
            </Link>
          </div>
        </section>
      )}

      {/* 9. FAQ (CMS) */}
      {faq.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Questions fréquentes</h2>
            <p className="text-sm text-slate-400">Comprendre le fonctionnement de l'accompagnement</p>
          </div>

          <div className="space-y-3">
            {faq.map((item) => (
              <div
                key={item.id}
                className="bg-[#140F2D] rounded-2xl border border-[#281F4B] overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === item.id ? null : item.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-white text-sm hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    {item.question}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-purple-400 transition-transform ${
                      activeFaq === item.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaq === item.id && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-[#281F4B] bg-[#0E0A20]">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. APPEL À L'ACTION FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#201448] via-[#161035] to-[#0A0717] border border-[#352963] text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/20 blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl mx-auto text-white relative z-10">
            Vous souhaitez participer au projet ou inscrire un enfant ?
          </h2>
          <p className="max-w-xl mx-auto text-slate-300 text-sm sm:text-base relative z-10">
            Que vous ayez 1 heure par semaine à offrir ou que votre enfant ait besoin d'aide pour réussir ses examens, rejoignez notre communauté solidaire.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              to="/devenir-benevole"
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all"
            >
              Rejoindre comme bénévole
            </Link>
            <Link
              to="/demande-soutien"
              className="px-7 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
            >
              Faire une demande d'aide
            </Link>
            <Link
              to="/transparence#faire-un-don"
              className="px-6 py-3.5 rounded-full border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-950/30 text-emerald-300 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              Faire un don
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
