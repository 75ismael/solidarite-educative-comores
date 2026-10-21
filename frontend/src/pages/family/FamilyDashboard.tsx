import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractResults } from '../../api/client';
import { Student, Pairing, TutoringSession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LiaisonNotebookModal } from '../../components/LiaisonNotebookModal';
import { LearningObjectivesModal } from '../../components/LearningObjectivesModal';
import {
  Users,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  AlertTriangle,
  MessageSquare,
  Target,
  UserX,
  XCircle,
} from 'lucide-react';

export const FamilyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals Carnet de liaison & Objectifs (F11, F09)
  const [selectedPairingForNotes, setSelectedPairingForNotes] = useState<Pairing | null>(null);
  const [selectedPairingForObjectives, setSelectedPairingForObjectives] = useState<Pairing | null>(null);

  // Modal Demande de changement de tuteur
  const [changePairing, setChangePairing] = useState<Pairing | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  const fetchFamilyData = () => {
    Promise.all([
      apiClient.get<Student[]>('/pedagogy/students/'),
      apiClient.get<Pairing[]>('/matching/pairings/'),
      apiClient.get<TutoringSession[]>('/sessions/'),
    ])
      .then(([stuRes, pairRes, sessRes]) => {
        setStudents(extractResults<Student>(stuRes.data));
        setPairings(extractResults<Pairing>(pairRes.data));
        setSessions(extractResults<TutoringSession>(sessRes.data));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePairing || !changeReason.trim()) return;
    setSubmittingChange(true);
    try {
      await apiClient.post(`/matching/pairings/${changePairing.id}/request-change/`, {
        reason: changeReason.trim(),
      });
      setChangeSuccess(true);
      setTimeout(() => {
        setChangePairing(null);
        setChangeSuccess(false);
        setChangeReason('');
        fetchFamilyData();
      }, 1500);
    } catch (err) {
      alert("Erreur lors de la transmission de la demande de changement.");
    } finally {
      setSubmittingChange(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Chargement de votre espace famille...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
            Espace Famille & Parents
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue">
            Bienvenue, {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consultez le déroulement des séances de votre enfant et les comptes rendus pédagogiques.
          </p>
        </div>

        <Link
          to="/demande-soutien"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Inscrire un autre enfant
        </Link>
      </div>

      {/* 1. Mes Enfants Inscrits */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-teal" />
          Mes Enfants ({students.length})
        </h2>

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">Aucun élève inscrit sur ce compte.</p>
            <Link
              to="/demande-soutien"
              className="inline-block px-5 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold"
            >
              Faire une première demande de soutien
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((student) => {
              const studentPairing = pairings.find((p) => p.student === student.id);
              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-brand-blue">
                        {student.first_name} {student.last_name_initial}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {student.grade} • {student.school_level_display} ({student.city})
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700">
                      {student.anonymous_code}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                      Accompagnement bénévole :
                    </span>
                    {studentPairing ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-brand-blue">
                            Bénévole : {studentPairing.volunteer_details?.first_name} {studentPairing.volunteer_details?.last_name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            studentPairing.status === 'REASSIGNMENT_REQUESTED'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {studentPairing.status === 'REASSIGNMENT_REQUESTED'
                              ? 'Changement demandé'
                              : studentPairing.status_display}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          Matière : <strong>{studentPairing.subject_details?.name}</strong>
                        </div>
                        <div className="text-slate-500">
                          Rythme : {studentPairing.weekly_frequency}
                        </div>

                        {studentPairing.status === 'REASSIGNMENT_REQUESTED' && (
                          <div className="p-2 rounded-lg bg-amber-50 text-amber-800 text-[11px] border border-amber-200 mt-1">
                            Votre demande de réattribution est en cours d'examen par la coordination pédagogique.
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                          <button
                            onClick={() => setSelectedPairingForNotes(studentPairing)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Carnet de liaison (F11)
                          </button>
                          <button
                            onClick={() => setSelectedPairingForObjectives(studentPairing)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-colors"
                          >
                            <Target className="w-3.5 h-3.5 text-brand-teal" />
                            Objectifs (F09)
                          </button>
                        </div>

                        {studentPairing.status === 'ACTIVE' && (
                          <div className="pt-1 text-right">
                            <button
                              onClick={() => {
                                setChangePairing(studentPairing);
                                setChangeReason('');
                                setChangeSuccess(false);
                              }}
                              className="text-[11px] text-slate-400 hover:text-amber-700 underline font-medium cursor-pointer"
                            >
                              Demander un changement de bénévole
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>En cours de matching par le coordinateur...</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Suivi des Séances & Comptes Rendus Reçus */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-teal" />
          Séances & Bilans Pédagogiques Reçus
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Aucun historique de séance disponible.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{s.title}</h3>
                    <span className="text-xs text-slate-500">
                      Prévue le {new Date(s.scheduled_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                      s.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {s.status_display}
                  </span>
                </div>

                {s.report ? (
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <strong>Présence :</strong>{' '}
                        <span className="text-emerald-700 font-semibold">{s.report.attendance_display}</span>
                      </div>
                      <div>
                        <strong>Niveau de compréhension :</strong>{' '}
                        <span className="text-teal-700 font-semibold">{s.report.understanding_level_display}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <strong className="block text-xs text-slate-800">Notions travaillées :</strong>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                        {s.report.topics_covered}
                      </p>
                    </div>

                    {s.report.next_steps && (
                      <div>
                        <strong className="block text-xs text-slate-800">Conseils pour la prochaine séance :</strong>
                        <p className="text-xs text-slate-600 mt-0.5">{s.report.next_steps}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Séance à venir ou compte rendu en attente de validation par le tuteur.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1 : Carnet de liaison encadré (F11) */}
      {selectedPairingForNotes && (
        <LiaisonNotebookModal
          isOpen={true}
          onClose={() => setSelectedPairingForNotes(null)}
          pairing={selectedPairingForNotes}
        />
      )}

      {/* MODAL 2 : Objectifs pédagogiques (F09) */}
      {selectedPairingForObjectives && (
        <LearningObjectivesModal
          isOpen={true}
          onClose={() => setSelectedPairingForObjectives(null)}
          studentId={selectedPairingForObjectives.student}
          studentName={`${selectedPairingForObjectives.student_details?.first_name} ${selectedPairingForObjectives.student_details?.last_name_initial}`}
          studentCode={selectedPairingForObjectives.student_details?.anonymous_code || ''}
          canEdit={false}
          defaultSubjectId={selectedPairingForObjectives.subject}
          defaultSubjectName={selectedPairingForObjectives.subject_details?.name}
        />
      )}

      {/* MODAL 3 : Demande de changement de bénévole */}
      {changePairing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-1">
                  <UserX className="w-3.5 h-3.5" /> Changement d'accompagnement
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Demande de changement de tuteur
                </h3>
              </div>
              <button
                onClick={() => setChangePairing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span>Élève concerné(e) :</span>
                <strong className="text-brand-blue">
                  {changePairing.student_details?.first_name} {changePairing.student_details?.last_name_initial} ({changePairing.student_details?.anonymous_code})
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Tuteur actuel :</span>
                <span className="font-semibold text-slate-900">
                  {changePairing.volunteer_details?.first_name} {changePairing.volunteer_details?.last_name}
                </span>
              </div>
              <p className="text-slate-500 pt-1 border-t border-slate-200/80 leading-relaxed italic">
                Votre demande sera traitée avec bienveillance par la coordination. Les compétences déjà acquises par votre enfant restent enregistrées.
              </p>
            </div>

            {changeSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Demande transmise à la coordination pédagogique avec succès.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motif de votre demande *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ex: Les horaires actuels ne conviennent plus à notre organisation, besoin d'un créneau le week-end..."
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setChangePairing(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingChange || !changeReason.trim()}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{submittingChange ? 'Envoi...' : 'Envoyer la demande'}</span>
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
