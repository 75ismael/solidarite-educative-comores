import React, { useEffect, useState } from 'react';
import { apiClient, extractResults } from '../../api/client';
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface ConfidentialReportItem {
  id: number;
  report_number: string;
  reporter_name?: string;
  reporter_contact?: string;
  reporter_role: string;
  category: string;
  category_display: string;
  details: string;
  status: string;
  status_display: string;
  investigation_log?: string;
  created_at: string;
}

export const SafeguardingDashboard: React.FC = () => {
  const [reports, setReports] = useState<ConfidentialReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ConfidentialReportItem | null>(null);
  const [logInput, setLogInput] = useState('');
  const [statusInput, setStatusInput] = useState('UNDER_INVESTIGATION');

  const fetchReports = async () => {
    try {
      const res = await apiClient.get<ConfidentialReportItem[]>('/safeguarding/reports/');
      setReports(extractResults<ConfidentialReportItem>(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      const updatedLog = selectedReport.investigation_log
        ? `${selectedReport.investigation_log}\n[${new Date().toLocaleString('fr-FR')}] : ${logInput}`
        : `[${new Date().toLocaleString('fr-FR')}] : ${logInput}`;

      await apiClient.patch(`/safeguarding/reports/${selectedReport.id}/`, {
        status: statusInput,
        investigation_log: updatedLog,
      });

      setSelectedReport(null);
      setLogInput('');
      fetchReports();
    } catch (err) {
      alert("Erreur lors de la mise à jour du dossier de signalement.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Chargement de l'espace confidentiel...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" /> Espace Restreint — Référent Protection des Mineurs (F15)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Signalements Confidentiels & Protocoles d'Urgence
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Ces dossiers sont protégés par le secret professionnel et le protocole de sauvegarde des mineurs.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-800">
            Dossiers de signalement reçus ({reports.length})
          </h2>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aucun signalement en attente de traitement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Dossier</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Motif / Risque</th>
                  <th className="py-3 px-4">Déclarant</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-brand-blue">
                      {r.report_number}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {r.category_display}
                    </td>
                    <td className="py-3 px-4">
                      {r.reporter_role} {r.reporter_name ? `(${r.reporter_name})` : '(Anonyme)'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800">
                        {r.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReport(r);
                          setStatusInput(r.status);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        Consulter & Traiter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Traitement Signalement */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {selectedReport.report_number}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedReport.category_display}
                </h3>
                <span className="text-xs text-slate-500">
                  Déclaré par : {selectedReport.reporter_role} • Contact : {selectedReport.reporter_contact || 'Non communiqué'}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <strong className="block text-xs text-slate-700 uppercase tracking-wide">
                Faits signalés :
              </strong>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {selectedReport.details}
              </div>
            </div>

            {selectedReport.investigation_log && (
              <div className="space-y-2">
                <strong className="block text-xs text-slate-700 uppercase tracking-wide">
                  Historique des mesures prises :
                </strong>
                <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 text-xs font-mono text-slate-700 whitespace-pre-line">
                  {selectedReport.investigation_log}
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateReport} className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statut du dossier
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="UNDER_INVESTIGATION">En cours de traitement confidentiel</option>
                  <option value="ACTION_TAKEN">Mesures de protection déployées</option>
                  <option value="CLOSED">Dossier résolu et clôturé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ajouter une note de suivi / Décision prise
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Échange téléphonique avec la famille le 22/10, bénévole remplacé..."
                  value={logInput}
                  onChange={(e) => setLogInput(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow"
                >
                  Enregistrer la mise à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
