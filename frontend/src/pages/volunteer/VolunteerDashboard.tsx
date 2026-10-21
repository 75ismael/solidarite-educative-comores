import React, { useEffect, useState } from 'react';
import { apiClient, extractResults } from '../../api/client';
import { Pairing, TutoringSession } from '../../types';
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
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Carnet de liaison & Objectifs (F11, F09)
  const [selectedPairingForNotes, setSelectedPairingForNotes] = useState<Pairing | null>(null);
  const [selectedPairingForObjectives, setSelectedPairingForObjectives] = useState<Pairing | null>(null);

  // Modal Saisie Compte Rendu (F08)
  const [reportingSession, setReportingSession] = useState<TutoringSession | null>(null);
  const [reportForm, setReportForm] = useState({
    attendance: 'PRESENT',
    duration_actual_minutes: 90,
    topics_covered: '',
    exercises_done: '',
    understanding_level: 3,
    remaining_difficulties: '',
    next_steps: '',
  });

  // Modal Planifier Séance (F07)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    pairing_id: 0,
    title: '',
    scheduled_at: '',
    duration_minutes: 90,
    mode: 'REMOTE',
    location_or_link: 'Appel WhatsApp',
  });

  const fetchData = async () => {
    try {
      const [pairRes, sessRes] = await Promise.all([
        apiClient.get<Pairing[]>('/matching/pairings/'),
        apiClient.get<TutoringSession[]>('/sessions/'),
      ]);
      const pairList = extractResults<Pairing>(pairRes.data);
      const sessList = extractResults<TutoringSession>(sessRes.data);
      setPairings(pairList);
      setSessions(sessList);
      if (pairList.length > 0) {
        setScheduleForm((prev) => ({ ...prev, pairing_id: pairList[0].id }));
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

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSession) return;
    try {
      await apiClient.post('/sessions/reports/', {
        session: reportingSession.id,
        ...reportForm,
      });
      setReportingSession(null);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement du compte rendu.");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Chargement de votre espace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
            Portail Bénévole
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue">
            Bonjour, {user?.first_name || user?.username} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos séances de tutorat et complétez les bilans après chaque cours.
          </p>
        </div>

        {pairings.length > 0 && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Planifier une nouvelle séance
          </button>
        )}
      </div>

      {/* 1. Mes Binômes Actifs */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-teal" />
          Mes Élèves & Binômes ({pairings.length})
        </h2>

        {pairings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">
              Aucun binôme ne vous est encore attribué.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Notre équipe de coordination examine les demandes et vous contactera dès qu'un élève correspond à vos disponibilités.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pairings.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 text-teal-800">
                    {p.subject_details?.name}
                  </span>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.status_display}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {p.student_details?.first_name} {p.student_details?.last_name_initial}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Code anonymisé : <span className="font-mono">{p.student_details?.anonymous_code}</span> • {p.student_details?.grade}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.student_details?.island_display} ({p.student_details?.city})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rythme : {p.weekly_frequency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedPairingForNotes(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Carnet de liaison
                  </button>
                  <button
                    onClick={() => setSelectedPairingForObjectives(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5 text-brand-teal" />
                    Objectifs (F09)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Calendrier & Séances de tutorat (F07, F08) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-teal" />
          Séances de tutorat & Comptes rendus
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Aucune séance planifiée pour le moment.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Élève</th>
                    <th className="py-3 px-4">Sujet de la séance</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Compte rendu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                        {new Date(s.scheduled_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        {s.pairing_details?.student_details?.first_name}{' '}
                        {s.pairing_details?.student_details?.last_name_initial}
                      </td>
                      <td className="py-3 px-4">{s.title}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            s.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {s.status_display}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.report ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Validé
                          </span>
                        ) : (
                          <button
                            onClick={() => setReportingSession(s)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            Remplir le CR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1 : Saisie Compte Rendu (F08) */}
      {reportingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">
                Compte rendu post-séance (F08)
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {reportingSession.title}
              </h3>
              <p className="text-xs text-slate-500">
                Élève : {reportingSession.pairing_details?.student_details?.first_name} ({reportingSession.pairing_details?.student_details?.anonymous_code})
              </p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Présence de l'élève
                  </label>
                  <select
                    value={reportForm.attendance}
                    onChange={(e) => setReportForm({ ...reportForm, attendance: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="PRESENT">Élève présent(e)</option>
                    <option value="ABSENT_JUSTIFIED">Absent(e) excusé(e)</option>
                    <option value="ABSENT_UNJUSTIFIED">Absence non justifiée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Durée effective (min)
                  </label>
                  <input
                    type="number"
                    value={reportForm.duration_actual_minutes}
                    onChange={(e) => setReportForm({ ...reportForm, duration_actual_minutes: parseInt(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notions et chapitres travaillés *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Théorème de Pythagore, factorisation..."
                  value={reportForm.topics_covered}
                  onChange={(e) => setReportForm({ ...reportForm, topics_covered: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exercices réalisés
                </label>
                <input
                  type="text"
                  placeholder="Ex: Exercices 4, 5 et 8 du manuel..."
                  value={reportForm.exercises_done}
                  onChange={(e) => setReportForm({ ...reportForm, exercises_done: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Niveau d'assimilation observé
                </label>
                <select
                  value={reportForm.understanding_level}
                  onChange={(e) => setReportForm({ ...reportForm, understanding_level: parseInt(e.target.value) })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value={1}>1 - Difficultés majeures persistantes</option>
                  <option value={2}>2 - Assimilation partielle</option>
                  <option value={3}>3 - Bon niveau de compréhension</option>
                  <option value={4}>4 - Très bonne maîtrise des notions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Points de blocage / Prochaines étapes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ce qu'il faudra revoir ou continuer lors de la prochaine séance..."
                  value={reportForm.next_steps}
                  onChange={(e) => setReportForm({ ...reportForm, next_steps: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportingSession(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 shadow"
                >
                  Valider le compte rendu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : Planifier Séance (F07) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">
                Planification (F07)
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Programmer une séance de tutorat
              </h3>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Binôme concerné</label>
                <select
                  value={scheduleForm.pairing_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, pairing_id: parseInt(e.target.value) })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  {pairings.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.student_details?.first_name} ({p.subject_details?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre / Objectif prévu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Séance 3 - Calcul d'aires et révisions"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date et Heure *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleForm.scheduled_at}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    value={scheduleForm.duration_minutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lieu ou Moyen de connexion</label>
                <input
                  type="text"
                  placeholder="Ex: Appel WhatsApp, Google Meet, ou Bibliothèque"
                  value={scheduleForm.location_or_link}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location_or_link: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 shadow"
                >
                  Enregistrer la séance
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

      {/* MODAL 4 : Objectifs pédagogiques (F09) */}
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
