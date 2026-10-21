import React, { useState, useEffect } from 'react';
import { apiClient, extractResults } from '../api/client';
import { LearningObjective } from '../types';
import { Target, CheckCircle2, Clock, AlertCircle, PlusCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  studentCode: string;
  canEdit: boolean;
  defaultSubjectId?: number;
  defaultSubjectName?: string;
}

export const LearningObjectivesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentCode,
  canEdit,
  defaultSubjectId,
  defaultSubjectName,
}) => {
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<LearningObjective[]>(
        `/pedagogy/objectives/?student_id=${studentId}`
      );
      setObjectives(extractResults<LearningObjective>(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      fetchObjectives();
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handleStatusChange = async (
    objId: number,
    newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED'
  ) => {
    try {
      await apiClient.patch(`/pedagogy/objectives/${objId}/`, {
        status: newStatus,
      });
      setObjectives((prev) =>
        prev.map((o) => (o.id === objId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour de l'objectif.");
    }
  };

  const handleAddObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !defaultSubjectId || saving) return;

    try {
      setSaving(true);
      const res = await apiClient.post<LearningObjective>('/pedagogy/objectives/', {
        student: studentId,
        subject: defaultSubjectId,
        description: newDesc.trim(),
        status: 'IN_PROGRESS',
      });
      setObjectives((prev) => [...prev, res.data]);
      setNewDesc('');
      setShowAddForm(false);
    } catch (err) {
      alert("Erreur lors de la création de l'objectif pédagogique.");
    } finally {
      setSaving(false);
    }
  };

  const achievedCount = objectives.filter((o) => o.status === 'ACHIEVED').length;
  const progressPercent = objectives.length > 0 ? Math.round((achievedCount / objectives.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                  Livret Pédagogique (F09)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Objectifs d'apprentissage : {studentName} ({studentCode})
                </h3>
              </div>
            </div>
            {defaultSubjectName && (
              <p className="text-xs text-slate-500 mt-1">
                Discipline : <strong>{defaultSubjectName}</strong>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 bg-teal-50/50 border-b border-teal-100 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-teal-950">
              <span>Progression globale des compétences</span>
              <span>{achievedCount} / {objectives.length} validés ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-teal-200/50 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-teal h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {canEdit && defaultSubjectId && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 shadow-sm transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showAddForm ? 'Annuler' : 'Ajouter un objectif'}</span>
            </button>
          )}
        </div>

        {/* Add Objective Inline Form */}
        {showAddForm && (
          <form onSubmit={handleAddObjective} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Définir un nouvel objectif opérationnel
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Ex: Maîtriser la factorisation par un facteur commun..."
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving || !newDesc.trim()}
                className="px-4 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {/* Objectives List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Chargement des objectifs pédagogiques...
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-semibold text-slate-600">
                Aucun objectif formalisé pour le moment.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Le tuteur peut ajouter les notions prioritaires à acquérir afin d'orienter le travail des séances.
              </p>
            </div>
          ) : (
            objectives.map((obj) => (
              <div
                key={obj.id}
                className={`p-4 rounded-2xl border transition-all ${
                  obj.status === 'ACHIEVED'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className={`text-xs sm:text-sm font-medium ${
                      obj.status === 'ACHIEVED' ? 'text-emerald-950 font-bold' : 'text-slate-800'
                    }`}>
                      {obj.description}
                    </p>
                    {obj.evaluation_notes && (
                      <p className="text-xs text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-100">
                        Remarque tuteur : {obj.evaluation_notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {canEdit ? (
                      <select
                        value={obj.status}
                        onChange={(e) =>
                          handleStatusChange(
                            obj.id,
                            e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED'
                          )
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          obj.status === 'ACHIEVED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : obj.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="NOT_STARTED">Non commencé</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="ACHIEVED">Atteint ✓</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          obj.status === 'ACHIEVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : obj.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {obj.status === 'ACHIEVED'
                          ? 'Atteint ✓'
                          : obj.status === 'IN_PROGRESS'
                          ? 'En cours'
                          : 'Non commencé'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
