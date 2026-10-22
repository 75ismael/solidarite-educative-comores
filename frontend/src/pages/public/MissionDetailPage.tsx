import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { PublicMission } from '../../types';
import {
  MapPin, Clock, Calendar, HeartHandshake, BookOpen, ArrowLeft, ArrowRight,
  Building2, GraduationCap, Users, Laptop, ShieldCheck, CheckCircle2,
  Info, Sparkles, ChevronDown, ChevronUp, ExternalLink, Award,
  User, Mail, Phone, AlertCircle, Hash,
} from 'lucide-react';

interface MissionApplication {
  id: number;
  mission: number;
  volunteer: number;
  volunteer_name: string;
  volunteer_first_name: string;
  volunteer_email: string;
  volunteer_city?: string;
  motivation: string;
  availability_start?: string;
  availability_end?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  status_display: string;
  created_at: string;
}

// Données de démo enrichies pour la colonne candidatures
const DEMO_APPLICATIONS: MissionApplication[] = [
  {
    id: 1, mission: 1, volunteer: 10,
    volunteer_name: 'Khadija Mzé', volunteer_first_name: 'Khadija',
    volunteer_email: 'khadija.m@email.com', volunteer_city: 'Paris 11e',
    motivation: 'Étudiante en licence de Lettres Modernes à Paris 3, je suis sensible à la cause des inégalités scolaires aux Comores. Je souhaite m\'investir 2h/semaine en visio.',
    availability_start: '2026-11-03', availability_end: '2027-06-30',
    status: 'ACCEPTED', status_display: 'Candidature retenue', created_at: '2026-10-21T09:15:00Z',
  },
  {
    id: 2, mission: 1, volunteer: 11,
    volunteer_name: 'Youssouf Ali', volunteer_first_name: 'Youssouf',
    volunteer_email: 'y.ali@email.fr', volunteer_city: 'Marseille 13e',
    motivation: 'Enseignant en collège à Marseille, je veux redonner au pays de mes parents. Disponible le samedi matin.',
    availability_start: '2026-11-10', availability_end: '2027-07-15',
    status: 'PENDING', status_display: 'En cours d\'examen', created_at: '2026-10-21T14:30:00Z',
  },
  {
    id: 3, mission: 1, volunteer: 12,
    volunteer_name: 'Salma Ibrahim', volunteer_first_name: 'Salma',
    volunteer_email: 'salma.i@email.com', volunteer_city: 'Lyon 3e',
    motivation: 'Master FLE en cours, passionnée par la pédagogie interculturelle. Je propose 1h30 par semaine.',
    availability_start: '2026-11-17', availability_end: '2027-05-31',
    status: 'PENDING', status_display: 'En cours d\'examen', created_at: '2026-10-22T08:00:00Z',
  },
  {
    id: 4, mission: 1, volunteer: 13,
    volunteer_name: 'Ahmed Bakar', volunteer_first_name: 'Ahmed',
    volunteer_email: 'a.bakar@email.fr', volunteer_city: 'Bordeaux',
    motivation: 'Diplômé de Sciences Po, je voudrais contribuer à l\'égalité des chances. Disponible le mercredi et vendredi soir.',
    availability_start: '2026-12-01', availability_end: '2027-06-01',
    status: 'DECLINED', status_display: 'Non retenue', created_at: '2026-10-20T11:20:00Z',
  },
];

// Missions démo pour l'affichage hors API
const DEMO_MISSIONS: Record<string, PublicMission> = {
  '1': {
    id: 1,
    title: 'Je suis étudiant et je réalise du tutorat en collège 2h/semaine',
    published_by: 'Ebru B., Ayoub B.',
    organization_name: 'ZUPdeCO & Solidarité Éducative',
    organization_description: "Créée pour lutter contre les inégalités scolaires à travers des programmes d'accompagnement en ligne et en présentiel. L'association défend l'idée que nous ne pourrons pas résoudre les inégalités sociales sans résoudre les inégalités scolaires.\n\nChaque année, de nombreux jeunes ont besoin d'un coup de pouce décisif : un bénévole accompagne 1h à 2h par semaine un élève jusqu'à l'amélioration de ses résultats.",
    activity_type: 'Soutien scolaire & Tutorat',
    target_public: 'Collégiens (6e à 3e - Préparation Brevet)',
    subject: 1, subject_name: 'Français & Méthodologie',
    school_level: 'Collège (6e à 3e)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Moroni, Iconi, Mitsamiouli',
    intervention_zone_details: 'Moroni : Collège Moroni Sud • Iconi : Collège Communal • Mitsamiouli : Collège Rural • Antenne numérique Comores-France',
    format: 'EITHER', format_display: 'Sur le terrain ou à distance',
    prerequisites: 'Offre ouverte aux étudiants, enseignants et professionnels diplômés du supérieur. Aisance dans les notions fondamentales du collège et pédagogie bienveillante.',
    description: "Accompagnement hebdomadaire d'élèves de collège pour consolider la lecture, l'expression écrite et la méthodologie de révision.",
    presentation_full: `Bonjour,\nTout d'abord nous vous remercions de prendre ce temps pour nous lire :)\n\nL'association recherche des bénévoles engagés pour intégrer le programme d'accompagnement dans les collèges partenaires. Nous proposons d'intervenir, selon vos disponibilités, à travers un rendez-vous hebdomadaire de 1h à 2h/semaine pour accompagner un élève ou un petit groupe de la 6e à la 3e dans leur réussite (et l'obtention du Brevet !).\n\nPour notre équipe, c'est réduire les inégalités scolaires en agissant sur la motivation, la méthodologie développée par vos élèves et la régularité de vos rendez-vous !`,
    steps_to_join: "Rassurez-vous, notre superbe équipe organise une réunion d'information pour répondre aux questions avant engagement.\nUne rapide formation sera dispensée pour perfectionner votre accompagnement avant la mission.",
    practical_details: "Vous n'êtes pas seuls ! Notre équipe vous accueille dans l'établissement que vous avez choisi, suit votre accompagnement de manière bienveillante.\nIl n'y a pas d'accompagnement le week-end.",
    benefits: '⚡ Vous recevrez une attestation des compétences transverses développées tout du long de cet engagement bénévole.',
    expected_commitment: '2h par semaine',
    status: 'OPEN', status_display: 'Mission ouverte',
    deadline: '2026-11-20',
    start_date: '2026-11-03',
    end_date: '2027-06-30',
    created_at: '2026-10-21',
    applications_count: 4,
  },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const STATUS_CONFIG = {
  ACCEPTED: { label: 'Retenue', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  PENDING:  { label: 'En cours', bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-200',   dot: 'bg-amber-500'  },
  DECLINED: { label: 'Non retenue', bg: 'bg-rose-100', text: 'text-rose-800',   border: 'border-rose-200',   dot: 'bg-rose-400'   },
};

export const MissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mission, setMission] = useState<PublicMission | null>(null);
  const [applications, setApplications] = useState<MissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgExpanded, setOrgExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentation' | 'steps' | 'practical'>('presentation');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const missionId = id || '1';

    Promise.all([
      apiClient.get<PublicMission>(`/volunteering/missions/${missionId}/`).catch(() => null),
      apiClient.get(`/volunteering/applications/?mission_id=${missionId}`).catch(() => null),
    ]).then(([missionRes, appsRes]) => {
      if (missionRes?.data) {
        setMission(missionRes.data);
      } else if (DEMO_MISSIONS[missionId]) {
        setMission(DEMO_MISSIONS[missionId]);
      } else if (Object.values(DEMO_MISSIONS).length > 0) {
        setMission(Object.values(DEMO_MISSIONS)[0]);
      }

      if (appsRes?.data) {
        const results = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data.results || [];
        setApplications(results.length > 0 ? results : DEMO_APPLICATIONS);
      } else {
        setApplications(DEMO_APPLICATIONS);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500">Chargement de la mission...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Mission introuvable</h2>
        <p className="text-sm text-slate-500">Cette mission n'existe plus ou n'est pas encore publiée.</p>
        <Link to="/missions" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux missions</span>
        </Link>
      </div>
    );
  }

  const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length;
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;

  return (
    <div className="bg-brand-light min-h-screen">
      {/* ── BANDEAU HERO ── */}
      <div className="bg-gradient-to-b from-brand-blue to-teal-900 text-white pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-teal-200 mb-5 font-medium">
            <Link to="/missions" className="inline-flex items-center gap-1 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Toutes les missions</span>
            </Link>
            <span className="text-teal-400">›</span>
            <span className="text-white/70 truncate max-w-xs">{mission.title}</span>
          </div>

          {/* Badges d'état */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-500/30 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              {mission.activity_type || 'Soutien scolaire'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {mission.target_public || mission.school_level}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              MISSION OUVERTE
            </span>
            <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              mission.format === 'REMOTE'
                ? 'bg-blue-500/20 text-blue-200 border-blue-500/30'
                : mission.format === 'IN_PERSON'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-200 border-purple-500/30'
            }`}>
              <Laptop className="w-3.5 h-3.5" />
              {mission.format === 'REMOTE' ? 'MISSION À DISTANCE' : mission.format === 'IN_PERSON' ? 'MISSION SUR LE TERRAIN' : 'HYBRIDE / AU CHOIX'}
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight max-w-4xl">
            {mission.title}
          </h1>

          {/* Organisation & Auteur */}
          <p className="mt-3 text-sm text-slate-300">
            Publié par{' '}
            <strong className="text-white">{mission.published_by || 'Coordination Pédagogique'}</strong>
            {' '}de l'organisation{' '}
            <span className="font-bold text-teal-300">{mission.organization_name || 'Solidarité Éducative Comores'}</span>
          </p>
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL DEUX COLONNES ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ══ COLONNE GAUCHE : Détails de la mission (2/3) ══ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Carte méta-infos rapides */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Localisation</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                  <span>{mission.city || mission.island}</span>
                </div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Engagement</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-center sm:justify-start">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{mission.expected_commitment}</span>
                </div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Début</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-center sm:justify-start">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{formatDateShort(mission.start_date)}</span>
                </div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fin prévue</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-center sm:justify-start">
                  <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{formatDateShort(mission.end_date)}</span>
                </div>
              </div>
            </div>

            {/* Zone d'intervention */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{mission.city || 'Zone d\'intervention'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{mission.island}</div>
                </div>
              </div>
              {mission.intervention_zone_details && (
                <div className="pl-8 border-l-2 border-brand-teal/30 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Précisions sur la zone d'intervention :
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mission.intervention_zone_details}
                  </p>
                </div>
              )}
            </div>

            {/* Pré-requis */}
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-amber-700 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Pré-requis pour réaliser cette mission
                </h3>
              </div>
              <p className="text-sm text-amber-950 leading-relaxed font-medium">
                {mission.prerequisites || "Mission ouverte aux étudiants, enseignants, professionnels bienveillants et membres de la diaspora. Aisance dans la matière et engagement dans la durée requis."}
              </p>
            </div>

            {/* Onglets de contenu : Présentation / Sautez le pas / Précisions */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-slate-100 bg-slate-50/60">
                {[
                  { key: 'presentation', label: 'Présentation de la mission', icon: BookOpen },
                  { key: 'steps',        label: 'Sautez le pas',             icon: CheckCircle2 },
                  { key: 'practical',    label: 'Précisions',                 icon: Info },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                      activeTab === key
                        ? 'border-brand-teal text-brand-teal bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 hidden sm:block" />
                    <span className="leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5 sm:p-7 text-sm text-slate-700 leading-relaxed whitespace-pre-line min-h-[200px]">
                {activeTab === 'presentation' && (
                  <div className="space-y-4">
                    <div>
                      {mission.presentation_full || mission.description}
                    </div>
                    {mission.benefits && (
                      <div className="p-4 rounded-2xl bg-purple-50 text-purple-900 text-xs font-medium border border-purple-200 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <p>{mission.benefits}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'steps' && (
                  <div>
                    {mission.steps_to_join ||
                      "Rassurez-vous, notre superbe équipe organise une réunion d'information pour répondre aux questions avant engagement.\nUne rapide formation sera dispensée pour perfectionner votre accompagnement.\nEnfin, nous aidons nos bénévoles dans leur démarche de professionnalisation."}
                  </div>
                )}

                {activeTab === 'practical' && (
                  <div>
                    {mission.practical_details ||
                      "Vous n'êtes pas seuls ! Notre équipe vous accueille et suit votre accompagnement de manière bienveillante.\nIl n'y a pas d'accompagnement le week-end ni les jours fériés."}
                  </div>
                )}
              </div>
            </div>

            {/* Présentation de l'organisation */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-teal-800 text-white flex items-center justify-center shadow-sm">
                    <Building2 className="w-5 h-5 text-teal-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {mission.organization_name || 'Solidarité Éducative Comores'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Organisation partenaire agréée</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrgExpanded(!orgExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:underline cursor-pointer shrink-0"
                >
                  <span>{orgExpanded ? 'Replier' : 'Déplier'}</span>
                  {orgExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line overflow-hidden transition-all duration-300 ${orgExpanded ? 'max-h-[500px]' : 'line-clamp-3'}`}>
                {mission.organization_description ||
                  "Créée pour lutter contre les inégalités scolaires à travers des programmes d'accompagnement en ligne et en présentiel dans les établissements partenaires. Chaque bénévole accompagne dans la durée 1h à 2h par semaine un élève jusqu'à l'amélioration de ses résultats."}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <Link
                  to="/a-propos"
                  className="inline-flex items-center gap-1 text-brand-teal font-bold hover:underline"
                >
                  <span>En savoir plus sur notre association</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Charte Éthique Signée</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══ COLONNE DROITE : Candidature CTA + Liste des candidats (1/3) ══ */}
          <div className="space-y-5">

            {/* Card CTA Candidature */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-4 sticky top-20">
              {/* Rythme & Dates clés */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Engagement</span>
                  <span className="font-bold text-slate-800">{mission.expected_commitment}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Début de mission</span>
                  <span className="font-bold text-emerald-700">{formatDateShort(mission.start_date)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Fin prévue</span>
                  <span className="font-bold text-rose-600">{formatDateShort(mission.end_date)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Date limite candidature</span>
                  <span className="font-bold text-amber-700">{formatDateShort(mission.deadline)}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <Link
                  to={`/devenir-benevole?mission=${mission.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-blue hover:bg-slate-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Candidater à cette mission</span>
                  <ArrowRight className="w-4 h-4 text-teal-300" />
                </Link>

                <div className="flex items-center gap-2 justify-center">
                  <div className="flex -space-x-2">
                    {applications.slice(0, 3).map((a, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-blue to-teal-700 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                      >
                        {(a.volunteer_first_name || a.volunteer_name || 'B')[0].toUpperCase()}
                      </div>
                    ))}
                    {applications.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                        +{applications.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    <strong className="text-slate-800">{mission.applications_count}</strong> candidature{mission.applications_count > 1 ? 's' : ''} reçue{mission.applications_count > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Légende statuts */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <div className="text-center space-y-1">
                  <div className="text-base font-extrabold text-emerald-700">{acceptedCount}</div>
                  <div className="text-[10px] font-semibold text-slate-500">Retenue{acceptedCount > 1 ? 's' : ''}</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-base font-extrabold text-amber-600">{pendingCount}</div>
                  <div className="text-[10px] font-semibold text-slate-500">En cours</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-base font-extrabold text-slate-400">{applications.filter(a => a.status === 'DECLINED').length}</div>
                  <div className="text-[10px] font-semibold text-slate-500">Non retenue{applications.filter(a => a.status === 'DECLINED').length > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* ── LISTE DES CANDIDATS ── */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-teal" />
                  Personnes qui postulent
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {applications.length}
                </span>
              </div>

              <div className="divide-y divide-slate-50">
                {applications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING;
                  const initials = (app.volunteer_name || 'B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <div key={app.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                      {/* Identité + Statut */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-teal-700 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{app.volunteer_name}</div>
                            {app.volunteer_city && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {app.volunteer_city}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Dates disponibilités */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50 rounded-xl px-2.5 py-1.5 text-center border border-emerald-100">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Début</div>
                          <div className="text-xs font-bold text-emerald-900 mt-0.5">{formatDateShort(app.availability_start)}</div>
                        </div>
                        <div className="bg-rose-50 rounded-xl px-2.5 py-1.5 text-center border border-rose-100">
                          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Fin</div>
                          <div className="text-xs font-bold text-rose-900 mt-0.5">{formatDateShort(app.availability_end)}</div>
                        </div>
                      </div>

                      {/* Motivation (extraite) */}
                      {app.motivation && (
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 italic bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                          "{app.motivation}"
                        </p>
                      )}

                      {/* Date de candidature */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Hash className="w-3 h-3" />
                        <span>Candidaté le {formatDate(app.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
