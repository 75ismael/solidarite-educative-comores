import React, { useEffect, useState, useMemo } from 'react';
import { apiClient, extractResults } from '../../api/client';
import { Pairing, TutoringSession, VolunteerProfile, SessionReport } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LiaisonNotebookModal } from '../../components/LiaisonNotebookModal';
import { LearningObjectivesModal } from '../../components/LearningObjectivesModal';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FileCheck,
  ChevronRight,
  MapPin,
  MessageSquare,
  Target,
  Award,
  Download,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  X,
  ExternalLink,
  FileText,
  Check,
  Video,
  Phone,
  UserCheck,
  GraduationCap,
  Star,
  HeartHandshake,
  BookMarked,
  Printer,
  ChevronDown,
} from 'lucide-react';

type TabType = 'overview' | 'students' | 'sessions' | 'toolkit' | 'certificate';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Disponibilité toggle
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Modals Carnet de liaison & Objectifs (F11, F09)
  const [selectedPairingForNotes, setSelectedPairingForNotes] = useState<Pairing | null>(null);
  const [selectedPairingForObjectives, setSelectedPairingForObjectives] = useState<Pairing | null>(null);

  // Modal Saisie Compte Rendu (F08)
  const [reportingSession, setReportingSession] = useState<TutoringSession | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    attendance: 'PRESENT' as 'PRESENT' | 'ABSENT_JUSTIFIED' | 'ABSENT_UNJUSTIFIED',
    duration_actual_minutes: 90,
    topics_covered: '',
    exercises_done: '',
    understanding_level: 3,
    remaining_difficulties: '',
    next_steps: '',
  });

  // Modal Consultation Compte Rendu
  const [viewingReportSession, setViewingReportSession] = useState<TutoringSession | null>(null);

  // Modal Planifier Séance (F07)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    pairing_id: 0,
    title: '',
    scheduled_at: '',
    duration_minutes: 90,
    mode: 'REMOTE' as 'REMOTE' | 'IN_PERSON',
    location_or_link: 'Appel WhatsApp',
  });

  // Modal Annuler / Reporter Séance
  const [cancellingSession, setCancellingSession] = useState<TutoringSession | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Filtres onglet Séances
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'NEEDS_REPORT' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [sessionPairingFilter, setSessionPairingFilter] = useState<number | 'ALL'>('ALL');

  // Chargement des données
  const fetchData = async () => {
    try {
      const [pairRes, sessRes, profRes] = await Promise.all([
        apiClient.get<Pairing[]>('/matching/pairings/'),
        apiClient.get<TutoringSession[]>('/sessions/'),
        apiClient.get<VolunteerProfile>('/volunteering/profile/me/').catch(() => null),
      ]);

      const pairList = extractResults<Pairing>(pairRes.data);
      const sessList = extractResults<TutoringSession>(sessRes.data);
      setPairings(pairList);
      setSessions(sessList);

      if (profRes && profRes.data) {
        setProfile(profRes.data);
      }

      if (pairList.length > 0 && !scheduleForm.pairing_id) {
        setScheduleForm((prev) => ({ ...prev, pairing_id: pairList[0].id }));
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données bénévole', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Rafraîchir manuellement
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Basculer la disponibilité bénévole
  const handleToggleAvailability = async () => {
    if (!profile) return;
    setUpdatingAvailability(true);
    const newStatus = !profile.is_available_for_new_student;
    try {
      const res = await apiClient.put<VolunteerProfile>('/volunteering/profile/me/', {
        is_available_for_new_student: newStatus,
      });
      setProfile(res.data);
    } catch (err) {
      alert("Erreur lors de la mise à jour de la disponibilité.");
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Soumission d'un compte rendu de séance
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSession) return;
    setSubmittingReport(true);
    try {
      await apiClient.post('/sessions/reports/', {
        session: reportingSession.id,
        ...reportForm,
      });
      setReportingSession(null);
      setReportForm({
        attendance: 'PRESENT',
        duration_actual_minutes: 90,
        topics_covered: '',
        exercises_done: '',
        understanding_level: 3,
        remaining_difficulties: '',
        next_steps: '',
      });
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement du compte rendu.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Soumission de planification de séance
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    try {
      await apiClient.post('/sessions/', {
        pairing: scheduleForm.pairing_id,
        title: scheduleForm.title,
        scheduled_at: scheduleForm.scheduled_at,
        duration_minutes: scheduleForm.duration_minutes,
        mode: scheduleForm.mode,
        location_or_link: scheduleForm.location_or_link,
      });
      setShowScheduleModal(false);
      setScheduleForm({
        pairing_id: pairings[0]?.id || 0,
        title: '',
        scheduled_at: '',
        duration_minutes: 90,
        mode: 'REMOTE',
        location_or_link: 'Appel WhatsApp',
      });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la planification de la séance.");
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Annuler une séance
  const handleCancelSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSession) return;
    setSubmittingCancel(true);
    try {
      await apiClient.patch(`/sessions/${cancellingSession.id}/`, {
        status: 'CANCELLED',
        cancellation_reason: cancellationReason.trim() || 'Séance reportée à la demande du binôme',
      });
      setCancellingSession(null);
      setCancellationReason('');
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'annulation de la séance.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  // KPIs & Statistiques
  const stats = useMemo(() => {
    const now = new Date();
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
    const scheduledSessions = sessions.filter(
      (s) => s.status === 'SCHEDULED' && new Date(s.scheduled_at) >= now
    );
    const pastPendingReportSessions = sessions.filter(
      (s) => s.status === 'SCHEDULED' && new Date(s.scheduled_at) < now && !s.report
    );

    // Calcul du total d'heures dispensées
    const totalMinutes = completedSessions.reduce((acc, curr) => {
      const mins = curr.report?.duration_actual_minutes || curr.duration_minutes || 90;
      return acc + mins;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;
    const hoursFormatted = remainingMins > 0 ? `${hours}h${remainingMins}` : `${hours}h`;

    // Taux d'assiduité
    const sessionsWithReports = sessions.filter((s) => s.report);
    const presentCount = sessionsWithReports.filter((s) => s.report?.attendance === 'PRESENT').length;
    const attendanceRate =
      sessionsWithReports.length > 0
        ? Math.round((presentCount / sessionsWithReports.length) * 100)
        : 100;

    return {
      totalHoursFormatted: hoursFormatted || '0h',
      totalMinutes,
      completedCount: completedSessions.length,
      activePairingsCount: pairings.filter((p) => p.status === 'ACTIVE').length,
      totalPairingsCount: pairings.length,
      scheduledCount: scheduledSessions.length,
      pendingReportsCount: pastPendingReportSessions.length,
      pastPendingReportSessions,
      attendanceRate,
    };
  }, [sessions, pairings]);

  // Prochaine séance planifiée
  const nextSession = useMemo(() => {
    const now = new Date();
    const upcoming = sessions
      .filter((s) => s.status === 'SCHEDULED' && new Date(s.scheduled_at) >= now)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    return upcoming[0] || null;
  }, [sessions]);

  // Séances filtrées pour l'onglet "Séances & Agenda"
  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => {
      // Recherche textuelle
      if (sessionSearch.trim()) {
        const query = sessionSearch.toLowerCase();
        const studentName = `${s.pairing_details?.student_details?.first_name || ''} ${s.pairing_details?.student_details?.last_name_initial || ''}`.toLowerCase();
        const title = s.title.toLowerCase();
        if (!studentName.includes(query) && !title.includes(query)) {
          return false;
        }
      }

      // Filtre binôme
      if (sessionPairingFilter !== 'ALL' && s.pairing !== sessionPairingFilter) {
        return false;
      }

      // Filtre statut
      if (sessionStatusFilter === 'SCHEDULED') {
        return s.status === 'SCHEDULED' && new Date(s.scheduled_at) >= now;
      }
      if (sessionStatusFilter === 'NEEDS_REPORT') {
        return s.status === 'SCHEDULED' && new Date(s.scheduled_at) < now && !s.report;
      }
      if (sessionStatusFilter === 'COMPLETED') {
        return s.status === 'COMPLETED';
      }
      if (sessionStatusFilter === 'CANCELLED') {
        return s.status === 'CANCELLED' || s.status === 'MISSED';
      }

      return true;
    });
  }, [sessions, sessionSearch, sessionStatusFilter, sessionPairingFilter]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 bg-[#0B0817]">
        <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Chargement de votre portail bénévole...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0817] text-slate-100 pb-16 selection:bg-purple-600/30 selection:text-white">
      {/* ── BANDEAU HERO DU PORTAIL BÉNÉVOLE ── */}
      <div className="bg-gradient-to-r from-[#170E33] via-[#100A26] to-[#0A0717] border-b border-[#281F4B] text-white shadow-xl shadow-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Profil & Badges de certification */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-purple-500/20 border-2 border-purple-400/30 shrink-0">
                  {user?.first_name?.[0] || 'B'}{user?.last_name?.[0] || 'M'}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0B0817] flex items-center justify-center"
                  title="Compte mentor actif"
                >
                  <Check className="w-3 h-3 text-[#0B0817] stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Portail Mentor & Tuteur Bénévole
                  </span>
                  {profile?.verification_status === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      Profil Certifié & Validé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      <Clock className="w-3 h-3 text-amber-300" />
                      Vérification en cours
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    <ShieldCheck className="w-3 h-3" />
                    Charte F14 signée
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Bonjour, {user?.first_name || 'Bénévole'} {user?.last_name || ''} 👋
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-slate-300">{user?.email}</span>
                  {user?.city && (
                    <span className="flex items-center gap-1 text-purple-300">
                      <MapPin className="w-3 h-3" />
                      {user.city} ({user.island})
                    </span>
                  )}
                  {profile?.profession_or_studies && (
                    <span className="text-slate-400">• {profile.profession_or_studies}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Actions rapides du header */}
            <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
              {/* Bouton de bascule de disponibilité */}
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={updatingAvailability}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                  profile?.is_available_for_new_student
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/40 text-emerald-200'
                    : 'bg-[#181230] hover:bg-[#201840] border-[#281F4B] text-slate-300'
                }`}
                title="Cliquer pour changer votre statut de disponibilité pour un nouvel élève"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    profile?.is_available_for_new_student ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span>
                  {profile?.is_available_for_new_student
                    ? 'Disponible pour nouvel élève'
                    : 'En pause temporaire'}
                </span>
              </button>

              {/* Bouton Planifier séance */}
              {pairings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/40 transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Planifier une séance</span>
                </button>
              )}

              {/* Rafraîchir */}
              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── BARRE DE NAVIGATION PAR ONGLETS ── */}
      <div className="sticky top-[86px] sm:top-[90px] z-20 bg-[#0B0817]/90 backdrop-blur-md border-b border-[#281F4B] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
            {[
              { id: 'overview', label: "Vue d'ensemble", icon: Sparkles },
              {
                id: 'students',
                label: 'Mes Élèves & Binômes',
                icon: BookOpen,
                count: stats.totalPairingsCount,
              },
              {
                id: 'sessions',
                label: 'Séances & Agenda',
                icon: Calendar,
                badge: stats.pendingReportsCount > 0 ? `${stats.pendingReportsCount} à rédiger` : undefined,
              },
              { id: 'toolkit', label: 'Boîte à Outils Pédagogique', icon: BookMarked },
              { id: 'certificate', label: "Attestation d'Engagement", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                    active
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-200' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        active ? 'bg-white/20 text-white' : 'bg-[#281F4B] text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-500/40 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* ── BANDEAU D'ALERTE : COMPTE RENDU EN RETARD ── */}
        {stats.pendingReportsCount > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm text-amber-200">
                  {stats.pendingReportsCount} compte{stats.pendingReportsCount > 1 ? 's' : ''} rendu{stats.pendingReportsCount > 1 ? 's' : ''} post-séance à compléter
                </h3>
                <p className="text-xs text-amber-300/80">
                  Renseignez les notions travaillées et les progrès pour tenir informés la famille et le coordinateur pédagogique.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const pending = stats.pastPendingReportSessions[0];
                if (pending) setReportingSession(pending);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors shrink-0"
            >
              <FileCheck className="w-4 h-4" />
              <span>Compléter le compte rendu</span>
            </button>
          </div>
        )}

        {/* ── CARTES KPI STATISTIQUES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#140F2D] rounded-2xl p-4 sm:p-5 border border-[#281F4B] shadow-lg shadow-purple-950/10 space-y-1 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Volume de tutorat</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent">
              {stats.totalHoursFormatted}
            </div>
            <p className="text-[11px] text-slate-400">Heures dispensées avec les élèves</p>
          </div>

          <div className="bg-[#140F2D] rounded-2xl p-4 sm:p-5 border border-[#281F4B] shadow-lg shadow-purple-950/10 space-y-1 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Séances réalisées</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.completedCount}
            </div>
            <p className="text-[11px] text-slate-400">Cours complétés & validés</p>
          </div>

          <div className="bg-[#140F2D] rounded-2xl p-4 sm:p-5 border border-[#281F4B] shadow-lg shadow-purple-950/10 space-y-1 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Élèves en suivi</span>
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.activePairingsCount}
            </div>
            <p className="text-[11px] text-slate-400">Binômes actifs cette année</p>
          </div>

          <div className="bg-[#140F2D] rounded-2xl p-4 sm:p-5 border border-[#281F4B] shadow-lg shadow-purple-950/10 space-y-1 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Assiduité moyenne</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.attendanceRate}%
            </div>
            <p className="text-[11px] text-slate-400">Présence constatée en séance</p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ONGLET 1 : VUE D'ENSEMBLE                                      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Spotlight Prochaine Séance */}
            {nextSession ? (
              <div className="bg-gradient-to-br from-[#1C143B] via-[#160F30] to-[#100A24] rounded-3xl border border-purple-500/30 p-6 sm:p-7 shadow-xl shadow-purple-950/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-xs">
                        Prochaine séance
                      </span>
                      <span className="text-xs font-bold text-purple-300">
                        {new Date(nextSession.scheduled_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {nextSession.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="font-bold text-white">
                        Élève : {nextSession.pairing_details?.student_details?.first_name} {nextSession.pairing_details?.student_details?.last_name_initial}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="px-2 py-0.5 rounded bg-[#281F4B] text-purple-200 border border-purple-500/20 font-semibold">
                        {nextSession.pairing_details?.subject_details?.name}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        {nextSession.mode === 'REMOTE' ? <Video className="w-3.5 h-3.5 text-purple-400" /> : <MapPin className="w-3.5 h-3.5 text-purple-400" />}
                        {nextSession.location_or_link || 'WhatsApp / Visio'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {nextSession.pairing_details && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedPairingForNotes(nextSession.pairing_details!)}
                          className="px-3.5 py-2 rounded-xl bg-[#221846] hover:bg-[#2C1F5A] border border-[#3A2D6E] hover:border-purple-400/50 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                          <span>Carnet de liaison</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPairingForObjectives(nextSession.pairing_details!)}
                          className="px-3.5 py-2 rounded-xl bg-[#221846] hover:bg-[#2C1F5A] border border-[#3A2D6E] hover:border-purple-400/50 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Target className="w-3.5 h-3.5 text-purple-400" />
                          <span>Objectifs</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setCancellingSession(nextSession)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      Annuler / Reporter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-6 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="font-extrabold text-sm text-white">
                  Aucune séance planifiée dans les prochains jours
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Consultez les disponibilités de votre élève et planifiez votre prochaine session de soutien.
                </p>
                {pairings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-md shadow-purple-900/40"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Programmer une séance maintenant</span>
                  </button>
                )}
              </div>
            )}

            {/* Mes Élèves Actifs (Aperçu) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    Mes Binômes Actifs ({pairings.length})
                  </h2>
                </div>
                {pairings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('students')}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Voir tous les détails</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {pairings.length === 0 ? (
                <div className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-white text-sm">
                    Aucun binôme ne vous est encore attribué
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    L'équipe de coordination pédagogique analyse actuellement les demandes d'élèves correspondant à vos matières et disponibilités. Vous serez notifié par email dès qu'un jumelage est prêt.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {pairings.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-5 sm:p-6 shadow-md hover:border-purple-500/40 transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                            {p.student_details?.first_name?.[0] || 'E'}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-white leading-snug">
                              {p.student_details?.first_name} {p.student_details?.last_name_initial}
                            </h3>
                            <p className="text-xs text-purple-300 font-mono">
                              {p.student_details?.anonymous_code} • {p.student_details?.grade} ({p.student_details?.school_level})
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-950/60 text-purple-300 border border-purple-500/30 shrink-0">
                          {p.subject_details?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-[#0E0A20] p-3 rounded-2xl border border-[#281F4B]">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.student_details?.city}, {p.student_details?.island_display}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Rythme : {p.weekly_frequency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedPairingForNotes(p)}
                          className="flex-1 py-2 px-3 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 font-bold text-xs border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Carnet (F11)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPairingForObjectives(p)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#1A133A] hover:bg-[#251B4E] text-slate-200 font-bold text-xs border border-[#281F4B] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Target className="w-3.5 h-3.5 text-purple-400" />
                          <span>Objectifs (F09)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Raccourcis professionnels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div
                onClick={() => setActiveTab('certificate')}
                className="bg-[#140F2D] rounded-2xl p-5 border border-[#281F4B] hover:border-purple-500/50 hover:bg-[#1A133A] shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                  Attestation d'Engagement Bénévole
                </h4>
                <p className="text-xs text-slate-400">
                  Générez et téléchargez votre justificatif officiel d'heures de tutorat pour votre CV ou université.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('toolkit')}
                className="bg-[#140F2D] rounded-2xl p-5 border border-[#281F4B] hover:border-purple-500/50 hover:bg-[#1A133A] shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookMarked className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                  Boîte à Outils & Annales Scolaires
                </h4>
                <p className="text-xs text-slate-400">
                  Accédez aux fiches méthodologiques, programmes d'examens (Brevet & Bac) et guides de cours.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('sessions')}
                className="bg-[#140F2D] rounded-2xl p-5 border border-[#281F4B] hover:border-purple-500/50 hover:bg-[#1A133A] shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                  Historique des Comptes Rendus
                </h4>
                <p className="text-xs text-slate-400">
                  Consultez l'historique complet des notions travaillées et des bilans d'assimilation des élèves.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ONGLET 2 : MES ÉLÈVES & BINÔMES DÉTAILLÉS                      */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Élèves & Binômes sous ma responsabilité ({pairings.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Accompagnement pédagogique individuel, suivi du carnet de liaison et atteinte des objectifs.
                </p>
              </div>

              {pairings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition-colors shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Programmer une séance</span>
                </button>
              )}
            </div>

            {pairings.length === 0 ? (
              <div className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-12 text-center space-y-3">
                <HeartHandshake className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="font-extrabold text-white text-sm">
                  Aucun élève attribué pour le moment
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Dès qu'un élève nécessitant un soutien dans vos matières est validé par notre coordinateur, il apparaîtra ici.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pairings.map((p) => {
                  const studentSessions = sessions.filter((s) => s.pairing === p.id);
                  const completedCount = studentSessions.filter((s) => s.status === 'COMPLETED').length;

                  return (
                    <div
                      key={p.id}
                      className="bg-[#140F2D] rounded-3xl border border-[#281F4B] shadow-md p-6 space-y-5 hover:border-purple-500/40 transition-all"
                    >
                      {/* En-tête de la carte */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-xs">
                            {p.student_details?.first_name?.[0] || 'E'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-white">
                                {p.student_details?.first_name} {p.student_details?.last_name_initial}
                              </h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {p.status_display}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              Identifiant sécurisé : <span className="font-bold text-purple-300">{p.student_details?.anonymous_code}</span>
                            </p>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          {p.subject_details?.name}
                        </span>
                      </div>

                      {/* Grille d'informations pratiques */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300 bg-[#0E0A20] p-3.5 rounded-2xl border border-[#281F4B]">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Niveau & Classe</span>
                          <span className="font-bold text-slate-200">{p.student_details?.grade}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Localité</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {p.student_details?.city || p.student_details?.island_display}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Rythme fixé</span>
                          <span className="font-bold text-slate-200">{p.weekly_frequency}</span>
                        </div>
                      </div>

                      {/* Objectifs pédagogiques résumés */}
                      {p.general_goals && (
                        <div className="text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            Objectif global prioritaire :
                          </span>
                          <p className="text-purple-200 bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/20 italic text-[11px] leading-relaxed">
                            « {p.general_goals} »
                          </p>
                        </div>
                      )}

                      {/* Compteur séances */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[#281F4B]">
                        <span>Séances réalisées pour ce binôme :</span>
                        <span className="font-extrabold text-white">{completedCount} séance{completedCount > 1 ? 's' : ''}</span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedPairingForNotes(p)}
                          className="py-2.5 px-3 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 font-bold text-xs border border-purple-500/30 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Carnet de liaison (F11)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPairingForObjectives(p)}
                          className="py-2.5 px-3 rounded-xl bg-[#1A133A] hover:bg-[#251B4E] text-slate-200 font-bold text-xs border border-[#281F4B] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Target className="w-3.5 h-3.5 text-purple-400" />
                          <span>Objectifs (F09)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ONGLET 3 : SÉANCES & AGENDA DÉTAILLÉ                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            
            {/* Barre d'outils filtres & recherche */}
            <div className="bg-[#140F2D] rounded-3xl p-4 sm:p-5 border border-[#281F4B] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par élève ou sujet de séance..."
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#281F4B] bg-[#0E0A20] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {pairings.length > 0 && (
                    <select
                      value={sessionPairingFilter}
                      onChange={(e) => setSessionPairingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                      className="text-xs py-2 px-3 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="ALL">Tous les élèves</option>
                      {pairings.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.student_details?.first_name} ({p.subject_details?.name})
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition-colors shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Nouvelle séance</span>
                  </button>
                </div>
              </div>

              {/* Puces de filtrage par statut */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                {[
                  { key: 'ALL', label: 'Toutes les séances' },
                  { key: 'SCHEDULED', label: 'À venir / Planifiées' },
                  {
                    key: 'NEEDS_REPORT',
                    label: 'En attente de compte rendu',
                    count: stats.pendingReportsCount,
                  },
                  { key: 'COMPLETED', label: 'Terminées & Validées' },
                  { key: 'CANCELLED', label: 'Annulées / Absences' },
                ].map((st) => {
                  const active = sessionStatusFilter === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setSessionStatusFilter(st.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        active
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                          : 'bg-[#0E0A20] text-slate-400 hover:text-white hover:bg-[#1A133A] border border-[#281F4B]'
                      }`}
                    >
                      <span>{st.label}</span>
                      {st.count !== undefined && st.count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                          {st.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Liste des séances */}
            {filteredSessions.length === 0 ? (
              <div className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-10 text-center text-xs text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                <p>Aucune séance ne correspond aux critères de recherche sélectionnés.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((s) => {
                  const isPast = new Date(s.scheduled_at) < new Date();
                  const needsReport = isPast && s.status === 'SCHEDULED' && !s.report;

                  return (
                    <div
                      key={s.id}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        needsReport
                          ? 'border-amber-500/50 bg-[#1D1612]'
                          : 'bg-[#140F2D] border-[#281F4B] hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#0E0A20] text-slate-200 flex flex-col items-center justify-center shrink-0 border border-[#281F4B]">
                          <span className="text-[10px] uppercase font-bold text-purple-300 leading-none">
                            {new Date(s.scheduled_at).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="text-base font-extrabold text-white leading-tight">
                            {new Date(s.scheduled_at).getDate()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-sm text-white">
                              {s.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                s.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : s.status === 'CANCELLED'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : needsReport
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {needsReport ? 'Compte rendu requis' : s.status_display}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                            <span className="font-semibold text-slate-200">
                              {s.pairing_details?.student_details?.first_name} {s.pairing_details?.student_details?.last_name_initial}
                            </span>
                            <span>•</span>
                            <span>{s.pairing_details?.subject_details?.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(s.scheduled_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })} ({s.duration_minutes} min)
                            </span>
                            <span>•</span>
                            <span className="text-slate-300">
                              {s.location_or_link || 'Visio WhatsApp'}
                            </span>
                          </div>

                          {s.cancellation_reason && (
                            <p className="text-[11px] text-rose-400 italic">
                              Motif : {s.cancellation_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-end md:self-center shrink-0">
                        {s.report ? (
                          <button
                            type="button"
                            onClick={() => setViewingReportSession(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E173D] hover:bg-[#281F54] border border-[#281F4B] text-slate-200 text-xs font-bold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            <span>Voir le bilan</span>
                          </button>
                        ) : needsReport ? (
                          <button
                            type="button"
                            onClick={() => setReportingSession(s)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Remplir le CR</span>
                          </button>
                        ) : s.status === 'SCHEDULED' ? (
                          <button
                            type="button"
                            onClick={() => setCancellingSession(s)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          >
                            Modifier / Annuler
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ONGLET 4 : BOÎTE À OUTILS PÉDAGOGIQUE & GUIDE DU MENTOR         */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'toolkit' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Boîte à Outils Pédagogique du Mentor Bénévole
              </h2>
              <p className="text-xs text-slate-400">
                Méthodes recommandées, programmes officiels des Comores et protocole de protection des mineurs.
              </p>
            </div>

            {/* Les 4 temps d'une séance réussie */}
            <div className="bg-[#140F2D] rounded-3xl p-6 sm:p-7 border border-[#281F4B] shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">
                  La structure type d'une séance de 1h30
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    step: '1. Accueil & Écoute (10 min)',
                    desc: 'Prendre des nouvelles, vérifier le moral de l’élève et passer en revue les résultats des derniers devoirs surveillés.',
                  },
                  {
                    step: '2. Révision du cours (25 min)',
                    desc: 'Reprendre la leçon du collège/lycée avec ses propres mots, identifier les incompréhensions et reformuler les définitions clés.',
                  },
                  {
                    step: '3. Pratique guidée (40 min)',
                    desc: 'Résolution d’exercices progressifs. Laisser l’élève chercher en autonomie avant de donner des indices méthodologiques.',
                  },
                  {
                    step: '4. Synthèse & Carnet (15 min)',
                    desc: 'Faire résumer à l’élève ce qu’il a retenu, fixer 1 ou 2 exercices d’entraînement et compléter le compte rendu de séance.',
                  },
                ].map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0E0A20] border border-[#281F4B] space-y-1.5">
                    <span className="text-xs font-extrabold text-purple-300 block">{s.step}</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Règles déontologiques & Protection F14 */}
            <div className="bg-gradient-to-br from-[#1A1238] to-[#120F2A] rounded-3xl p-6 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Rappel de déontologie & Protection des mineurs (F14)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Transparence avec la famille :</strong> Les parents sont systématiquement prévenus des dates de cours. Utilisez le carnet de liaison pour les bilans.
                </li>
                <li>
                  <strong className="text-white">Pas de communications privées isolées :</strong> Tous les échanges se font dans le respect du cadre associatif et pédagogique.
                </li>
                <li>
                  <strong className="text-white">Signalement d'une difficulté :</strong> En cas de doute sur la sécurité ou la détresse d'un enfant, prévenez immédiatement le coordinateur de l'association.
                </li>
              </ul>
            </div>

            {/* Contacts & Coordination */}
            <div className="bg-[#140F2D] rounded-3xl p-6 border border-[#281F4B] shadow-md space-y-3">
              <h3 className="font-extrabold text-sm text-white">
                Besoin d'un conseil pédagogique ou d'un appui ?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                L'équipe de coordination de Solidarité Éducative Comores est à votre écoute pour vous aider à adapter les exercices, vous fournir des manuels ou faire le point sur votre binôme.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-md shadow-purple-900/40"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contacter la coordination</span>
                </a>
                <a
                  href="/demande-soutien#temoignages"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E0A20] hover:bg-[#1A133A] border border-[#281F4B] text-slate-200 text-xs font-bold transition-colors"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Donner votre retour d'expérience mentor</span>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ONGLET 5 : ATTESTATION D'ENGAGEMENT OFFICIELLE                  */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Attestation d'Engagement Citoyen & Bénévolat
                </h2>
                <p className="text-xs text-slate-400">
                  Document officiel valorisant vos heures d'accompagnement pour votre parcours professionnel ou académique.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-900/40 transition-colors shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer l'attestation</span>
              </button>
            </div>

            {/* Certificat Visuel Stylisé */}
            <div className="bg-[#140F2D] rounded-3xl border-2 border-purple-500/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8 text-slate-100">
              {/* Filigrane discret */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Award className="w-72 h-72 text-purple-400" />
              </div>

              {/* En-tête certificat */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#281F4B] pb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-purple-900/50">
                    SEC
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white uppercase tracking-wider">
                      Solidarité Éducative Comores
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Association d'accompagnement scolaire & mentorat solidaire
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <p>Référence : ATTEST-{user?.id || 1}-{new Date().getFullYear()}</p>
                  <p>Date d'émission : {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Corps de l'attestation */}
              <div className="space-y-4 text-center max-w-2xl mx-auto py-4">
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                  Certificat d'engagement bénévole
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                  Attestation de Tutorat Scolaire Solidaire
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                  La coordination de l'association <strong className="text-white">Solidarité Éducative Comores</strong> certifie par la présente que :
                </p>
                <div className="py-2">
                  <p className="text-xl sm:text-2xl font-extrabold text-purple-300 underline decoration-purple-500 decoration-2 underline-offset-4">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Bénévole engagé(e) • {user?.email}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  a assuré avec rigueur, bienveillance et assiduité un accompagnement scolaire individualisé totalisant :
                </p>
                
                <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-4 my-3 inline-block">
                  <span className="text-2xl sm:text-3xl font-extrabold text-purple-300">
                    {stats.totalHoursFormatted}
                  </span>
                  <span className="text-xs text-purple-200 font-bold block mt-0.5">
                    de soutien bénévole effectif auprès d'élèves comoriens
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Compétences développées : Pédagogie différenciée, communication bienveillante, méthodologie de révision et respect du cadre de protection des mineurs.
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 border-t border-[#281F4B] pt-6 text-xs text-slate-400">
                <div className="space-y-1">
                  <span className="font-bold text-slate-200 block">Le Bénévole Mentor</span>
                  <p className="italic text-slate-400">{user?.first_name} {user?.last_name}</p>
                  <p className="text-[10px] text-slate-500">Signature électronique vérifiée</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="font-bold text-slate-200 block">La Coordination Pédagogique</span>
                  <p className="text-purple-300 font-extrabold">Solidarité Éducative</p>
                  <p className="text-[10px] text-slate-500">Cachet & Signature numérique officielle</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 1 : SAISIE DU COMPTE RENDU (F08)                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {reportingSession && (
        <div className="fixed inset-0 z-50 bg-[#070512]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140F2D] border border-[#281F4B] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in text-slate-100">
            <div className="flex items-center justify-between border-b border-[#281F4B] pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Compte rendu post-séance (F08)
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {reportingSession.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Élève : {reportingSession.pairing_details?.student_details?.first_name} ({reportingSession.pairing_details?.student_details?.anonymous_code})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportingSession(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Présence de l'élève *
                  </label>
                  <select
                    value={reportForm.attendance}
                    onChange={(e) => setReportForm({ ...reportForm, attendance: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="PRESENT">Élève présent(e)</option>
                    <option value="ABSENT_JUSTIFIED">Absent(e) excusé(e)</option>
                    <option value="ABSENT_UNJUSTIFIED">Absence non justifiée</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Durée effective (minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={reportForm.duration_actual_minutes}
                    onChange={(e) => setReportForm({ ...reportForm, duration_actual_minutes: parseInt(e.target.value) || 90 })}
                    className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Niveau d'assimilation observé *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { lvl: 1, label: '1 - Blocages persistants' },
                    { lvl: 2, label: '2 - Assimilation partielle' },
                    { lvl: 3, label: '3 - Bonne compréhension' },
                    { lvl: 4, label: '4 - Très bonne maîtrise' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => setReportForm({ ...reportForm, understanding_level: item.lvl })}
                      className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition-all ${
                        reportForm.understanding_level === item.lvl
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                          : 'bg-[#0E0A20] border-[#281F4B] text-slate-300 hover:border-purple-500/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Notions et chapitres travaillés *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex : Révision du théorème de Pythagore, factorisation d'expressions, exercices types Brevet..."
                  value={reportForm.topics_covered}
                  onChange={(e) => setReportForm({ ...reportForm, topics_covered: e.target.value })}
                  className="w-full p-2.5 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Exercices et méthodes abordés (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Exercices 4, 5 et 8 page 112 du manuel..."
                  value={reportForm.exercises_done}
                  onChange={(e) => setReportForm({ ...reportForm, exercises_done: e.target.value })}
                  className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Points à revoir / Prochaine séance
                </label>
                <textarea
                  rows={2}
                  placeholder="Ce qu'il faudra approfondir ou continuer lors de la prochaine séance..."
                  value={reportForm.next_steps}
                  onChange={(e) => setReportForm({ ...reportForm, next_steps: e.target.value })}
                  className="w-full p-2.5 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#281F4B]">
                <button
                  type="button"
                  onClick={() => setReportingSession(null)}
                  className="px-4 py-2 rounded-xl border border-[#281F4B] font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-900/40 transition-all disabled:opacity-50"
                >
                  {submittingReport ? 'Enregistrement…' : 'Valider le compte rendu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 2 : CONSULTATION DU COMPTE RENDU                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {viewingReportSession && viewingReportSession.report && (
        <div className="fixed inset-0 z-50 bg-[#070512]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140F2D] border border-[#281F4B] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-xs animate-in fade-in text-slate-100">
            <div className="flex items-center justify-between border-b border-[#281F4B] pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Bilan validé
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {viewingReportSession.title}
                </h3>
                <p className="text-slate-400">
                  Élève : {viewingReportSession.pairing_details?.student_details?.first_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReportSession(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-[#0E0A20] p-3 rounded-2xl border border-[#281F4B]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Présence</span>
                  <span className="font-bold text-slate-200">
                    {viewingReportSession.report.attendance_display || viewingReportSession.report.attendance}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Durée</span>
                  <span className="font-bold text-slate-200">
                    {viewingReportSession.report.duration_actual_minutes} minutes
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Niveau d'assimilation :</span>
                <span className="px-3 py-1 rounded-xl bg-purple-950/60 text-purple-300 font-extrabold border border-purple-500/30 inline-block">
                  Niveau {viewingReportSession.report.understanding_level} / 4
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Notions travaillées :</span>
                <p className="p-3 rounded-xl bg-[#0E0A20] text-slate-200 leading-relaxed border border-[#281F4B]">
                  {viewingReportSession.report.topics_covered}
                </p>
              </div>

              {viewingReportSession.report.exercises_done && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Exercices abordés :</span>
                  <p className="p-3 rounded-xl bg-[#0E0A20] text-slate-200 leading-relaxed border border-[#281F4B]">
                    {viewingReportSession.report.exercises_done}
                  </p>
                </div>
              )}

              {viewingReportSession.report.next_steps && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Prochaines étapes recommandées :</span>
                  <p className="p-3 rounded-xl bg-[#0E0A20] text-slate-200 leading-relaxed border border-[#281F4B]">
                    {viewingReportSession.report.next_steps}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#281F4B] text-right">
              <button
                type="button"
                onClick={() => setViewingReportSession(null)}
                className="px-4 py-2 rounded-xl bg-[#0E0A20] hover:bg-[#1A133A] border border-[#281F4B] text-slate-300 font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 3 : PLANIFIER UNE SÉANCE (F07)                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-[#070512]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140F2D] border border-[#281F4B] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in text-slate-100">
            <div className="flex items-center justify-between border-b border-[#281F4B] pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  Planification de cours (F07)
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Programmer une séance de tutorat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Élève concerné *</label>
                <select
                  value={scheduleForm.pairing_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, pairing_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none"
                >
                  {pairings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.student_details?.first_name} {p.student_details?.last_name_initial} — {p.subject_details?.name} ({p.student_details?.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Titre / Objectif prévu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Révision contrôle de mathématiques, factorisation et problèmes"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Date et Heure *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduled_at}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Durée prévue</label>
                  <select
                    value={scheduleForm.duration_minutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value={60}>1 heure (60 min)</option>
                    <option value={90}>1h30 (90 min) - Recommandé</option>
                    <option value={120}>2 heures (120 min)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Format</label>
                  <select
                    value={scheduleForm.mode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="REMOTE">À distance (visio / appel)</option>
                    <option value="IN_PERSON">En présentiel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Lieu ou Moyen</label>
                  <input
                    type="text"
                    placeholder="Ex : Appel WhatsApp, Google Meet, ou Bibliothèque"
                    value={scheduleForm.location_or_link}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location_or_link: e.target.value })}
                    className="w-full px-3 py-2 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#281F4B]">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#281F4B] font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-900/40 transition-all disabled:opacity-50"
                >
                  {submittingSchedule ? 'Planification…' : 'Enregistrer la séance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 4 : ANNULER / REPORTER UNE SÉANCE                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {cancellingSession && (
        <div className="fixed inset-0 z-50 bg-[#070512]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140F2D] border border-[#281F4B] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-in fade-in text-slate-100">
            <div className="flex items-center justify-between border-b border-[#281F4B] pb-3">
              <h3 className="text-base font-extrabold text-white">
                Modifier ou annuler la séance
              </h3>
              <button
                type="button"
                onClick={() => setCancellingSession(null)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Vous vous apprêtez à marquer la séance <strong className="text-white">« {cancellingSession.title} »</strong> comme annulée ou reportée.
            </p>

            <form onSubmit={handleCancelSessionSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Motif d'annulation ou de report *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex : Coupure d'électricité, empêchement de l'élève, séance décalée à samedi..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full p-3 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#281F4B]">
                <button
                  type="button"
                  onClick={() => setCancellingSession(null)}
                  className="px-4 py-2 rounded-xl border border-[#281F4B] font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {submittingCancel ? 'Mise à jour…' : 'Confirmer l’annulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 5 : CARNET DE LIAISON (F11)                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selectedPairingForNotes && (
        <LiaisonNotebookModal
          isOpen={true}
          onClose={() => setSelectedPairingForNotes(null)}
          pairing={selectedPairingForNotes}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 6 : OBJECTIFS PÉDAGOGIQUES (F09)                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selectedPairingForObjectives && (
        <LearningObjectivesModal
          isOpen={true}
          onClose={() => setSelectedPairingForObjectives(null)}
          studentId={selectedPairingForObjectives.student}
          studentName={`${selectedPairingForObjectives.student_details?.first_name} ${selectedPairingForObjectives.student_details?.last_name_initial}`}
          studentCode={selectedPairingForObjectives.student_details?.anonymous_code || ''}
          canEdit={true}
          defaultSubjectId={selectedPairingForObjectives.subject}
          defaultSubjectName={selectedPairingForObjectives.subject_details?.name}
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;
