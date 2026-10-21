import React, { useEffect, useState } from 'react';
import { apiClient, extractResults } from '../../api/client';
import { SupportRequest, Pairing, VolunteerProfile, Alert, Subject } from '../../types';
import { LiaisonNotebookModal } from '../../components/LiaisonNotebookModal';
import {
  Users,
  HeartHandshake,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Clock,
  MapPin,
  MessageSquare,
  XCircle,
  FileText,
  Filter,
  UserCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
  GraduationCap,
  Briefcase,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface Suggestion {
  volunteer_id: number;
  volunteer_name: string;
  volunteer_email: string;
  island: string;
  score: number;
  reasons: string[];
  availabilities: string;
}

export const CoordinatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'volunteers' | 'pairings' | 'alerts'>('requests');
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [volunteerProfiles, setVolunteerProfiles] = useState<VolunteerProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Matching Modal
  const [activeRequest, setActiveRequest] = useState<SupportRequest | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [matchingSuccess, setMatchingSuccess] = useState(false);

  // Carnet de liaison Modal
  const [selectedPairingForNotes, setSelectedPairingForNotes] = useState<Pairing | null>(null);

  // Modal Réassigner / Transférer un binôme
  const [reassignPairing, setReassignPairing] = useState<Pairing | null>(null);
  const [reassignForm, setReassignForm] = useState({
    new_volunteer_id: 0,
    reason: '',
    weekly_frequency: '',
  });
  const [submittingReassign, setSubmittingReassign] = useState(false);
  const [reassignSuccess, setReassignSuccess] = useState(false);
  const [reassignError, setReassignError] = useState('');

  // Modal Publier Mission Publique (F04)
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [submittingMission, setSubmittingMission] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: '',
    subject: 0,
    school_level: 'Collège (3ème)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Moroni',
    format: 'REMOTE',
    description: '',
    expected_commitment: '1h30 par semaine',
    deadline: '',
  });

  // Filtres Tab 1 (Demandes d'élèves & statuts)
  const [requestFilterTab, setRequestFilterTab] = useState<'all' | 'unmatched' | 'matched' | 'reassignment'>('all');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestSubjectFilter, setRequestSubjectFilter] = useState<string>('ALL');
  const [requestIslandFilter, setRequestIslandFilter] = useState<string>('ALL');
  const [requestLevelFilter, setRequestLevelFilter] = useState<string>('ALL');

  // Filtres Tab 2 (Vivier Bénévoles & Compétences)
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [volunteerSubjectFilter, setVolunteerSubjectFilter] = useState<string>('ALL');
  const [volunteerLevelFilter, setVolunteerLevelFilter] = useState<string>('ALL');
  const [volunteerIslandFilter, setVolunteerIslandFilter] = useState<string>('ALL');
  const [volunteerAvailabilityFilter, setVolunteerAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'ASSIGNED'>('ALL');
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED'>('ALL');

  const fetchData = async () => {
    try {
      const [reqRes, pairRes, alertRes, volRes, subjRes] = await Promise.all([
        apiClient.get<SupportRequest[]>('/pedagogy/requests/'),
        apiClient.get<Pairing[]>('/matching/pairings/'),
        apiClient.get<Alert[]>('/safeguarding/alerts/'),
        apiClient.get<VolunteerProfile[]>('/volunteering/profiles/'),
        apiClient.get<Subject[]>('/pedagogy/subjects/'),
      ]);
      setRequests(extractResults<SupportRequest>(reqRes.data));
      setPairings(extractResults<Pairing>(pairRes.data));
      setAlerts(extractResults<Alert>(alertRes.data));
      setVolunteerProfiles(extractResults<VolunteerProfile>(volRes.data));
      const subjList = extractResults<Subject>(subjRes.data);
      setSubjects(subjList);
      if (subjList.length > 0) {
        setMissionForm((prev) => ({ ...prev, subject: subjList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openMatching = async (req: SupportRequest) => {
    setActiveRequest(req);
    setLoadingSuggestions(true);
    setMatchingSuccess(false);
    try {
      const res = await apiClient.get<{ suggestions: Suggestion[] }>(
        `/matching/suggestions/${req.id}/`
      );
      setSuggestions(res.data?.suggestions || []);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const confirmPairing = async (volunteerId: number) => {
    if (!activeRequest) return;
    try {
      await apiClient.post('/matching/pairings/', {
        student: activeRequest.student,
        volunteer: volunteerId,
        subject: activeRequest.subjects[0],
        support_request: activeRequest.id,
        weekly_frequency: '1 séance de 1h30 par semaine',
      });
      setMatchingSuccess(true);
      fetchData();
    } catch (err) {
      alert("Erreur lors de la création du binôme.");
    }
  };

  const handleValidateVolunteer = async (profileId: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/volunteering/profiles/${profileId}/`, {
        verification_status: status,
      });
      setVolunteerProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, verification_status: status } : p))
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour du profil bénévole.");
    }
  };

  const handleCreateMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionForm.title.trim() || !missionForm.subject) return;

    try {
      setSubmittingMission(true);
      await apiClient.post('/volunteering/missions/', {
        ...missionForm,
        status: 'OPEN',
      });
      setShowMissionModal(false);
      setMissionForm({
        title: '',
        subject: subjects[0]?.id || 0,
        school_level: 'Collège (3ème)',
        island: 'Grande Comore (Ngazidja)',
        city: 'Moroni',
        format: 'REMOTE',
        description: '',
        expected_commitment: '1h30 par semaine',
        deadline: '',
      });
      alert("Mission d'appel au bénévolat publiée avec succès sur le site public !");
    } catch (err) {
      alert("Erreur lors de la publication de la mission.");
    } finally {
      setSubmittingMission(false);
    }
  };

  const resolveAlert = async (alertId: number) => {
    try {
      await apiClient.patch(`/safeguarding/alerts/${alertId}/`, {
        is_resolved: true,
        resolution_notes: "Traité et régularisé par la coordination.",
      });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la résolution de l'alerte.");
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignPairing || !reassignForm.new_volunteer_id) return;
    setSubmittingReassign(true);
    setReassignError('');
    try {
      await apiClient.post(`/matching/pairings/${reassignPairing.id}/reassign/`, {
        new_volunteer_id: Number(reassignForm.new_volunteer_id),
        reason: reassignForm.reason,
        weekly_frequency: reassignForm.weekly_frequency,
      });
      setReassignSuccess(true);
      setTimeout(() => {
        setReassignPairing(null);
        setReassignSuccess(false);
        fetchData();
      }, 1400);
    } catch (err: any) {
      setReassignError(err.response?.data?.detail || "Erreur lors de la réattribution du binôme.");
    } finally {
      setSubmittingReassign(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Chargement du tableau de bord...</div>;
  }

  const getPairingForRequest = (req: SupportRequest): Pairing | undefined => {
    return (
      pairings.find((p) => p.support_request === req.id) ||
      pairings.find(
        (p) =>
          p.student === req.student &&
          (p.status === 'ACTIVE' || p.status === 'REASSIGNMENT_REQUESTED')
      )
    );
  };

  const isReassignment = (req: SupportRequest) =>
    req.status === 'REASSIGNMENT_REQUESTED' ||
    getPairingForRequest(req)?.status === 'REASSIGNMENT_REQUESTED';

  const isMatched = (req: SupportRequest) =>
    !isReassignment(req) &&
    (req.status === 'MATCHED' || getPairingForRequest(req)?.status === 'ACTIVE');

  const isUnmatched = (req: SupportRequest) => !isReassignment(req) && !isMatched(req);

  const getVolunteerActivePairings = (userId: number): Pairing[] => {
    return pairings.filter(
      (p) => p.volunteer === userId && (p.status === 'ACTIVE' || p.status === 'REASSIGNMENT_REQUESTED')
    );
  };

  const openReassignForRequest = (req: SupportRequest) => {
    const pairing = getPairingForRequest(req);
    if (pairing) {
      setReassignPairing(pairing);
      setReassignForm({
        new_volunteer_id: 0,
        reason: pairing.change_reason || req.change_reason || '',
        weekly_frequency: pairing.weekly_frequency || '',
      });
      setReassignSuccess(false);
      setReassignError('');
    }
  };

  const countUnmatched = requests.filter(isUnmatched).length;
  const countMatched = requests.filter(isMatched).length;
  const countReassignment = requests.filter(isReassignment).length;

  const pendingRequests = requests.filter((r) => r.status !== 'MATCHED');
  const pendingVolunteers = volunteerProfiles.filter((v) => v.verification_status === 'PENDING');
  const availableVolunteers = volunteerProfiles.filter(
    (v) => v.verification_status === 'VERIFIED' && getVolunteerActivePairings(v.user).length === 0
  );
  const activeAlerts = alerts.filter((a) => !a.is_resolved);

  const filteredRequests = requests.filter((r) => {
    if (requestFilterTab === 'unmatched' && !isUnmatched(r)) return false;
    if (requestFilterTab === 'matched' && !isMatched(r)) return false;
    if (requestFilterTab === 'reassignment' && !isReassignment(r)) return false;

    if (requestSearch.trim()) {
      const q = requestSearch.toLowerCase();
      const code = r.student_details?.anonymous_code?.toLowerCase() || '';
      const name = r.student_details?.first_name?.toLowerCase() || '';
      const city = r.student_details?.city?.toLowerCase() || '';
      if (!code.includes(q) && !name.includes(q) && !city.includes(q)) {
        return false;
      }
    }

    if (requestSubjectFilter !== 'ALL') {
      const hasSubj = r.subjects_details?.some(
        (s) => s.id === Number(requestSubjectFilter) || s.name === requestSubjectFilter
      );
      if (!hasSubj) return false;
    }

    if (requestIslandFilter !== 'ALL') {
      if (r.student_details?.island !== requestIslandFilter) return false;
    }

    if (requestLevelFilter !== 'ALL') {
      if (r.student_details?.school_level !== requestLevelFilter) return false;
    }

    return true;
  });

  const filteredVolunteers = volunteerProfiles.filter((vp) => {
    if (volunteerSearch.trim()) {
      const q = volunteerSearch.toLowerCase();
      const first = vp.user_details?.first_name?.toLowerCase() || '';
      const last = vp.user_details?.last_name?.toLowerCase() || '';
      const email = vp.user_details?.email?.toLowerCase() || '';
      const city = vp.user_details?.city?.toLowerCase() || '';
      const prof = vp.profession_or_studies?.toLowerCase() || '';
      if (
        !first.includes(q) &&
        !last.includes(q) &&
        !email.includes(q) &&
        !city.includes(q) &&
        !prof.includes(q)
      ) {
        return false;
      }
    }

    if (volunteerSubjectFilter !== 'ALL') {
      const teaches = vp.subjects_details?.some(
        (s) => s.id === Number(volunteerSubjectFilter) || s.name === volunteerSubjectFilter
      );
      if (!teaches) return false;
    }

    if (volunteerLevelFilter !== 'ALL') {
      if (vp.levels_can_teach !== 'TOUS' && vp.levels_can_teach !== volunteerLevelFilter) {
        return false;
      }
    }

    if (volunteerIslandFilter !== 'ALL') {
      if (vp.user_details?.island !== volunteerIslandFilter) return false;
    }

    const activeCount = getVolunteerActivePairings(vp.user).length;
    if (volunteerAvailabilityFilter === 'AVAILABLE' && activeCount > 0) return false;
    if (volunteerAvailabilityFilter === 'ASSIGNED' && activeCount === 0) return false;

    if (volunteerStatusFilter !== 'ALL' && vp.verification_status !== volunteerStatusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
            Espace Coordination & Pilotage
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue">
            Tableau de bord opérationnel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervisez les demandes d'élèves, validez les tuteurs et pilotez les binômes actifs.
          </p>
        </div>

        <button
          onClick={() => setShowMissionModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Publier un appel au bénévolat
        </button>
      </div>

      {/* 2. Key Metrics Bar (F12) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('requests')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'requests'
              ? 'bg-blue-50/50 border-brand-blue ring-2 ring-brand-blue/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
            Demandes totales
          </span>
          <div className="text-3xl font-extrabold text-brand-blue mt-1">{requests.length}</div>
          <span className="text-xs text-amber-700 font-semibold block mt-1">
            {countUnmatched} sans tuteur • {countReassignment} chgt
          </span>
        </button>

        <button
          onClick={() => setActiveTab('volunteers')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'volunteers'
              ? 'bg-teal-50/50 border-brand-teal ring-2 ring-brand-teal/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
            Bénévoles inscrits
          </span>
          <div className="text-3xl font-extrabold text-brand-teal mt-1">{volunteerProfiles.length}</div>
          <span className="text-xs text-emerald-700 font-semibold block mt-1">
            {availableVolunteers.length} dispo(s) • {pendingVolunteers.length} à valider
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pairings')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'pairings'
              ? 'bg-teal-50/50 border-teal-600 ring-2 ring-teal-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
            Binômes actifs
          </span>
          <div className="text-3xl font-extrabold text-teal-800 mt-1">
            {pairings.filter((p) => p.status === 'ACTIVE').length}
          </div>
          <span className="text-xs text-slate-500 block mt-1">Accompagnements en cours</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'alerts'
              ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
            Alertes opérationnelles
          </span>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">{activeAlerts.length}</div>
          <span className="text-xs text-rose-700 font-semibold block mt-1">
            {activeAlerts.length > 0 ? 'Action requise' : 'Aucune alerte'}
          </span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Élèves & Demandes ({requests.length})
          {countReassignment > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold animate-pulse">
              {countReassignment} chgt
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('volunteers')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'volunteers'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Vivier Bénévoles ({volunteerProfiles.length})
          {pendingVolunteers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {pendingVolunteers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pairings')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'pairings'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Binômes & Carnet ({pairings.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alertes de suivi ({activeAlerts.length})
        </button>
      </div>

      {/* TAB 1: Demandes d'élèves & Statuts de tutorat */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Header & Section Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-teal" />
                Supervision des élèves & Demandes de tutorat
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Suivez en temps réel les élèves avec tuteur, les élèves en attente et les demandes de réattribution.
              </p>
            </div>
          </div>

          {/* Segmented Status Pills */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setRequestFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                requestFilterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes les demandes ({requests.length})
            </button>
            <button
              onClick={() => setRequestFilterTab('unmatched')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                requestFilterTab === 'unmatched'
                  ? 'bg-white text-amber-900 shadow-xs ring-1 ring-amber-300'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Sans tuteur / En attente ({countUnmatched})
            </button>
            <button
              onClick={() => setRequestFilterTab('matched')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                requestFilterTab === 'matched'
                  ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-emerald-300'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Avec tuteur actif ({countMatched})
            </button>
            <button
              onClick={() => setRequestFilterTab('reassignment')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                requestFilterTab === 'reassignment'
                  ? 'bg-rose-50 text-rose-900 shadow-xs ring-1 ring-rose-400'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Changement de tuteur demandé ({countReassignment})
            </button>
          </div>

          {/* Search & Multi-Filters Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Code élève, prénom, ville..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
                />
              </div>

              {/* Subject */}
              <select
                value={requestSubjectFilter}
                onChange={(e) => setRequestSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Toutes les matières</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Island */}
              <select
                value={requestIslandFilter}
                onChange={(e) => setRequestIslandFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Toutes les îles</option>
                <option value="NGAZIDJA">Grande Comore (Ngazidja)</option>
                <option value="NDZUWANI">Anjouan (Ndzuwani)</option>
                <option value="MWALI">Mohéli (Mwali)</option>
                <option value="FRANCE">Diaspora (France)</option>
              </select>

              {/* School Level */}
              <select
                value={requestLevelFilter}
                onChange={(e) => setRequestLevelFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Tous les niveaux scolaires</option>
                <option value="PRIMAIRE">Primaire</option>
                <option value="COLLEGE">Collège</option>
                <option value="LYCEE">Lycée</option>
              </select>
            </div>

            {(requestSearch || requestSubjectFilter !== 'ALL' || requestIslandFilter !== 'ALL' || requestLevelFilter !== 'ALL') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>{filteredRequests.length} demande(s) correspondent à vos filtres</span>
                <button
                  onClick={() => {
                    setRequestSearch('');
                    setRequestSubjectFilter('ALL');
                    setRequestIslandFilter('ALL');
                    setRequestLevelFilter('ALL');
                  }}
                  className="text-brand-teal font-semibold hover:underline cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>

          {/* Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Élève & Code</th>
                    <th className="py-3 px-4">Niveau / Classe</th>
                    <th className="py-3 px-4">Matières & Ville</th>
                    <th className="py-3 px-4">Statut d'attribution</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                        Aucune demande d'élève ne correspond aux critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => {
                      const pairing = getPairingForRequest(r);
                      const reassignmentPending = isReassignment(r);
                      const matched = isMatched(r);

                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            reassignmentPending ? 'bg-amber-50/40 border-l-4 border-l-amber-500' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-extrabold text-brand-blue text-sm">
                              {r.student_details?.anonymous_code}
                            </div>
                            <div className="text-xs text-slate-600 font-medium mt-0.5">
                              {r.student_details?.first_name} {r.student_details?.last_name_initial}.
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900">{r.student_details?.grade}</span>
                            <span className="text-xs text-slate-500 block">
                              {r.student_details?.school_level_display}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <div className="font-medium text-slate-900">
                              {r.subjects_details?.map((s) => s.name).join(', ') || 'Général'}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{r.student_details?.city} ({r.student_details?.island_display?.split(' ')[0]})</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            {reassignmentPending ? (
                              <div className="space-y-1.5 max-w-xs">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  Changement de tuteur demandé
                                </span>
                                {(pairing?.change_reason || r.change_reason) && (
                                  <div className="text-[11px] text-rose-900 bg-rose-50/90 p-2 rounded-xl border border-rose-200/80 leading-snug">
                                    <strong>Motif :</strong> « {pairing?.change_reason || r.change_reason} »
                                  </div>
                                )}
                                {pairing?.volunteer_details && (
                                  <div className="text-[11px] text-slate-500">
                                    Tuteur actuel : <span className="font-medium text-slate-700">{pairing.volunteer_details.first_name} {pairing.volunteer_details.last_name}</span>
                                  </div>
                                )}
                              </div>
                            ) : matched ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  En binôme actif
                                </span>
                                {pairing?.volunteer_details && (
                                  <div className="text-xs text-slate-700">
                                    Tuteur : <strong className="text-slate-900">{pairing.volunteer_details.first_name} {pairing.volunteer_details.last_name}</strong>
                                  </div>
                                )}
                                {pairing?.weekly_frequency && (
                                  <div className="text-[11px] text-slate-500">{pairing.weekly_frequency}</div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  Sans tuteur (En attente)
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Urgence : <span className="font-medium text-slate-700">{r.urgency_display}</span>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {reassignmentPending ? (
                              <button
                                onClick={() => openReassignForRequest(r)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                title="Réattribuer cet élève à un nouveau bénévole"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Réassigner en priorité</span>
                              </button>
                            ) : matched ? (
                              <div className="flex items-center justify-end gap-2">
                                {pairing && (
                                  <button
                                    onClick={() => setSelectedPairingForNotes(pairing)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
                                    title="Consulter le carnet de liaison"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>Échanges</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => openReassignForRequest(r)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                                  title="Changer le bénévole pour ce binôme"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Changer</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openMatching(r)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 shadow-xs transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Trouver un bénévole</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Vivier des Bénévoles, Compétences & Disponibilités */}
      {activeTab === 'volunteers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-teal" />
                Vivier des Bénévoles & Cartographie des Compétences ({volunteerProfiles.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultez l'ensemble des bénévoles, filtrez selon les disciplines enseignées, créneaux disponibles, villes et charge d'attribution.
              </p>
            </div>
          </div>

          {/* Search & Multi-Filters Toolbar for Volunteers */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Search volunteer */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Nom, email, ville, études/profession..."
                  value={volunteerSearch}
                  onChange={(e) => setVolunteerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
                />
              </div>

              {/* Subject */}
              <select
                value={volunteerSubjectFilter}
                onChange={(e) => setVolunteerSubjectFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Toutes les matières enseignées</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Teaching level */}
              <select
                value={volunteerLevelFilter}
                onChange={(e) => setVolunteerLevelFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Tous les niveaux d'enseignement</option>
                <option value="PRIMAIRE">Primaire</option>
                <option value="COLLEGE">Collège</option>
                <option value="LYCEE">Lycée</option>
                <option value="TOUS">Tous niveaux</option>
              </select>

              {/* Island */}
              <select
                value={volunteerIslandFilter}
                onChange={(e) => setVolunteerIslandFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Toutes les îles / localisations</option>
                <option value="NGAZIDJA">Grande Comore (Ngazidja)</option>
                <option value="NDZUWANI">Anjouan (Ndzuwani)</option>
                <option value="MWALI">Mohéli (Mwali)</option>
                <option value="FRANCE">Diaspora (France)</option>
              </select>

              {/* Availability / Pairing load */}
              <select
                value={volunteerAvailabilityFilter}
                onChange={(e) => setVolunteerAvailabilityFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Toutes les disponibilités d'affectation</option>
                <option value="AVAILABLE">Disponible immédiatement (0 binôme actif)</option>
                <option value="ASSIGNED">Déjà en binôme actif (1+ binômes)</option>
              </select>

              {/* Verification status */}
              <select
                value={volunteerStatusFilter}
                onChange={(e) => setVolunteerStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="ALL">Tous les statuts de vérification</option>
                <option value="VERIFIED">Profils vérifiés uniquement</option>
                <option value="PENDING">En attente de validation</option>
                <option value="REJECTED">Candidatures refusées</option>
              </select>
            </div>

            {(volunteerSearch || volunteerSubjectFilter !== 'ALL' || volunteerLevelFilter !== 'ALL' || volunteerIslandFilter !== 'ALL' || volunteerAvailabilityFilter !== 'ALL' || volunteerStatusFilter !== 'ALL') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>{filteredVolunteers.length} bénévole(s) correspondent à vos critères</span>
                <button
                  onClick={() => {
                    setVolunteerSearch('');
                    setVolunteerSubjectFilter('ALL');
                    setVolunteerLevelFilter('ALL');
                    setVolunteerIslandFilter('ALL');
                    setVolunteerAvailabilityFilter('ALL');
                    setVolunteerStatusFilter('ALL');
                  }}
                  className="text-brand-teal font-semibold hover:underline cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>

          {/* Volunteers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVolunteers.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Aucun bénévole ne correspond aux filtres de recherche.
              </div>
            ) : (
              filteredVolunteers.map((p) => {
                const activePairings = getVolunteerActivePairings(p.user);
                const isAvailable = activePairings.length === 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          {p.user_details?.first_name} {p.user_details?.last_name}
                        </h3>
                        <p className="text-xs text-slate-500">{p.user_details?.email}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            p.verification_status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.verification_status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.verification_status === 'VERIFIED'
                            ? 'Vérifié'
                            : p.verification_status === 'REJECTED'
                            ? 'Refusé'
                            : 'À valider'}
                        </span>

                        {/* Availability Pill */}
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Disponible (0 élève)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                            <HeartHandshake className="w-3 h-3 text-blue-500" />
                            En binôme ({activePairings.length} élève{activePairings.length > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active pairings details if already assigned */}
                    {activePairings.length > 0 && (
                      <div className="text-[11px] text-blue-900 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                        <strong>Élève(s) en accompagnement :</strong>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {activePairings.map((ap) => (
                            <span key={ap.id} className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800">
                              {ap.student_details?.anonymous_code} ({ap.subject_details?.name})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Volunteer details: Competencies & Dispos */}
                    <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          <strong>Localisation :</strong> {p.user_details?.island_display} ({p.user_details?.city || 'Non précisé'})
                        </span>
                      </div>

                      <div>
                        <strong>Matières enseignées :</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.subjects_details && p.subjects_details.length > 0 ? (
                            p.subjects_details.map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold"
                              >
                                {s.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic">Toutes matières</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          <strong>Niveaux :</strong> {p.levels_can_teach_display} • <strong>Rythme :</strong> {p.hours_per_week}h/semaine
                        </span>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Disponibilités :</strong> {p.availabilities || 'Non renseignées'}
                        </span>
                      </div>

                      {p.profession_or_studies && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            <strong>Profession / Études :</strong> {p.profession_or_studies}
                          </span>
                        </div>
                      )}

                      {p.experience && (
                        <div className="pt-1 text-slate-500 italic border-t border-slate-200/60">
                          « {p.experience} »
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Charte éthique signée</span>
                      </div>

                      {p.verification_status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleValidateVolunteer(p.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => handleValidateVolunteer(p.id, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Valider le profil
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Dossier vérifié</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Binômes & Carnet de liaison (F06, F11) */}
      {activeTab === 'pairings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-brand-teal" />
              Binômes d'accompagnement en cours ({pairings.length})
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code Élève</th>
                    <th className="py-3 px-4">Tuteur Bénévole</th>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4">Rythme convenu</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions & Carnet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pairings.map((p) => {
                    const isReassign = p.status === 'REASSIGNMENT_REQUESTED';
                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/50 transition-colors ${
                          isReassign ? 'bg-rose-50/40 border-l-4 border-l-rose-500' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-brand-blue">
                            {p.student_details?.anonymous_code}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.student_details?.first_name} ({p.student_details?.city})
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.volunteer_details?.first_name} {p.volunteer_details?.last_name}
                        </td>
                        <td className="py-3 px-4">{p.subject_details?.name}</td>
                        <td className="py-3 px-4 text-slate-500">{p.weekly_frequency}</td>
                        <td className="py-3 px-4">
                          {isReassign ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                Changement demandé
                              </span>
                              {p.change_reason && (
                                <p className="text-[11px] text-rose-900 italic max-w-xs leading-snug">
                                  « {p.change_reason} »
                                </p>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                p.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {p.status_display}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedPairingForNotes(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 shadow-2xs transition-colors cursor-pointer"
                              title="Consulter les échanges"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Échanges</span>
                            </button>
                            {(p.status === 'ACTIVE' || isReassign) && (
                              <button
                                onClick={() => {
                                  setReassignPairing(p);
                                  setReassignForm({
                                    new_volunteer_id: 0,
                                    reason: p.change_reason || '',
                                    weekly_frequency: p.weekly_frequency || '',
                                  });
                                  setReassignSuccess(false);
                                  setReassignError('');
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer ${
                                  isReassign
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}
                                title="Réassigner ce binôme à un nouveau bénévole"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{isReassign ? 'Réassigner' : 'Réassigner'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Alertes de suivi (F10) */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Alertes opérationnelles & Rappels ({activeAlerts.length} actives)
          </h2>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                Aucune alerte opérationnelle signalée.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    alt.is_resolved
                      ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      : 'bg-rose-50/60 border-rose-200 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                        {alt.severity_display}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{alt.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{alt.description}</p>
                  </div>

                  {!alt.is_resolved && (
                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-semibold shadow-sm transition-colors"
                    >
                      Marquer comme résolue
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1 : Moteur de Correspondance & Attribution (F06) */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-teal uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Moteur de correspondance intelligente (F06)
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Attribuer un bénévole à {activeRequest.student_details?.first_name} (
                  <span className="font-mono">{activeRequest.student_details?.anonymous_code}</span>)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matière : {activeRequest.subjects_details?.map((s) => s.name).join(', ')} • {activeRequest.student_details?.grade} ({activeRequest.student_details?.city})
                </p>
              </div>

              <button
                onClick={() => setActiveRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {matchingSuccess ? (
              <div className="p-8 text-center space-y-3 bg-teal-50 rounded-2xl border border-teal-200">
                <CheckCircle2 className="w-12 h-12 text-brand-teal mx-auto" />
                <h4 className="text-lg font-bold text-teal-950">Binôme créé avec succès !</h4>
                <p className="text-xs text-teal-800 max-w-md mx-auto">
                  Le bénévole et la famille ont été notifiés de la mise en relation. Le bénévole pourra dès maintenant planifier les séances.
                </p>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="mt-2 px-6 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold shadow"
                >
                  Fermer
                </button>
              </div>
            ) : loadingSuggestions ? (
              <div className="text-center py-12 text-sm text-slate-500">
                Calcul des correspondances d'affinité en cours...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Aucun bénévole disponible ne correspond actuellement à tous les critères.
                </p>
                <p className="text-xs text-slate-500">
                  Vous pouvez publier une mission d'appel au bénévolat sur le site public pour susciter de nouvelles candidatures.
                </p>
                <button
                  onClick={() => {
                    setActiveRequest(null);
                    setShowMissionModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  Publier une mission pour cette demande
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Candidats recommandés par score d'adéquation :
                </span>

                <div className="space-y-3">
                  {suggestions.map((sug) => (
                    <div
                      key={sug.volunteer_id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-brand-teal bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{sug.volunteer_name}</h4>
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-brand-teal text-[11px] font-bold">
                            Score : {sug.score}/100
                          </span>
                        </div>

                        <div className="text-xs text-slate-500">
                          {sug.island} • Dispos : {sug.availabilities || 'Non renseigné'}
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sug.reasons.map((r, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 font-medium"
                            >
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => confirmPairing(sug.volunteer_id)}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
                      >
                        Valider ce binôme
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2 : Publier un appel au bénévolat (F04) */}
      {showMissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">
                  Diffusion Publique (F04)
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Publier une nouvelle mission bénévole
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  L'appel sera visible sur la page publique « Missions » sans divulguer de données personnelles.
                </p>
              </div>

              <button
                onClick={() => setShowMissionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMissionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre de la mission *
                </label>
                <input
                  type="text"
                  required
                  value={missionForm.title}
                  onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                  placeholder="Ex: Soutien en Mathématiques - Niveau Collège (3ème)"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matière *</label>
                  <select
                    value={missionForm.subject}
                    onChange={(e) => setMissionForm({ ...missionForm, subject: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Niveau scolaire *</label>
                  <input
                    type="text"
                    required
                    value={missionForm.school_level}
                    onChange={(e) => setMissionForm({ ...missionForm, school_level: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Île</label>
                  <select
                    value={missionForm.island}
                    onChange={(e) => setMissionForm({ ...missionForm, island: e.target.value })}
                    className="w-full text-xs sm:text-sm px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="Grande Comore (Ngazidja)">Ngazidja</option>
                    <option value="Anjouan (Ndzuwani)">Ndzuwani</option>
                    <option value="Mohéli (Mwali)">Mwali</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={missionForm.city}
                    onChange={(e) => setMissionForm({ ...missionForm, city: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                  <select
                    value={missionForm.format}
                    onChange={(e) => setMissionForm({ ...missionForm, format: e.target.value })}
                    className="w-full text-xs sm:text-sm px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="REMOTE">À distance</option>
                    <option value="IN_PERSON">Présentiel</option>
                    <option value="EITHER">Au choix</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Engagement horaire attendu
                </label>
                <input
                  type="text"
                  value={missionForm.expected_commitment}
                  onChange={(e) => setMissionForm({ ...missionForm, expected_commitment: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description anonymisée des besoins *
                </label>
                <textarea
                  required
                  rows={3}
                  value={missionForm.description}
                  onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })}
                  placeholder="Décrivez les objectifs généraux sans divulguer l'identité de l'enfant..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMissionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingMission}
                  className="px-5 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 shadow disabled:opacity-50"
                >
                  {submittingMission ? 'Publication...' : 'Publier la mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : Carnet de liaison encadré (F11) */}
      {selectedPairingForNotes && (
        <LiaisonNotebookModal
          isOpen={true}
          onClose={() => setSelectedPairingForNotes(null)}
          pairing={selectedPairingForNotes}
        />
      )}

      {/* MODAL 4 : Réassigner / Transférer le binôme à un nouveau bénévole */}
      {reassignPairing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
                  <UserCheck className="w-3.5 h-3.5" /> Passation de binôme
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Réattribuer l'élève {reassignPairing.student_details?.anonymous_code}
                </h3>
              </div>
              <button
                onClick={() => setReassignPairing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Encadré d'information sur la traçabilité */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span>Tuteur actuel :</span>
                <strong className="text-slate-900">
                  {reassignPairing.volunteer_details?.first_name} {reassignPairing.volunteer_details?.last_name}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Matière principale :</span>
                <strong className="text-brand-blue">{reassignPairing.subject_details?.name}</strong>
              </div>
              <p className="text-slate-500 pt-1 border-t border-slate-200/80 leading-relaxed italic">
                🔒 Garantie d'historique : Toutes les séances et bilans de l'ancien tuteur restent conservés dans les archives. Un nouveau binôme actif sera généré avec accès au livret de compétences de l'élève.
              </p>
            </div>

            {reassignError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {reassignError}
              </div>
            )}

            {reassignSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Passation effectuée avec succès ! Mise à jour des binômes...</span>
              </div>
            ) : (
              <form onSubmit={handleReassignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nouveau bénévole tuteur *
                  </label>
                  <select
                    required
                    value={reassignForm.new_volunteer_id}
                    onChange={(e) => setReassignForm({ ...reassignForm, new_volunteer_id: Number(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="">Sélectionnez un tuteur bénévole disponible</option>
                    {volunteerProfiles
                      .filter((vp) => vp.verification_status === 'VERIFIED' && vp.user !== reassignPairing.volunteer)
                      .map((vp) => (
                        <option key={vp.user} value={vp.user}>
                          {vp.user_details?.first_name} {vp.user_details?.last_name} ({vp.user_details?.island_display} • {vp.levels_can_teach_display})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motif de la réattribution *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fin de disponibilité du bénévole, changement d'horaires, déménagement..."
                    value={reassignForm.reason}
                    onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rythme convenu pour le nouveau tuteur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1 séance de 1h30 par semaine"
                    value={reassignForm.weekly_frequency}
                    onChange={(e) => setReassignForm({ ...reassignForm, weekly_frequency: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReassignPairing(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReassign || !reassignForm.new_volunteer_id}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{submittingReassign ? 'Transfert en cours...' : 'Valider la passation'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
