import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Award, Printer, CheckCircle2, TrendingUp, Users, BookOpen, Clock, ShieldCheck } from 'lucide-react';

interface ImpactData {
  report_title: string;
  generated_at: string;
  key_figures: {
    total_students_enrolled: number;
    verified_volunteers: number;
    active_pairings: number;
    completed_sessions: number;
    total_tutoring_hours: number;
    attendance_rate_percent: number;
    satisfaction_rate_percent: number;
  };
  geographic_coverage: Array<{
    island: string;
    students_count: number;
    percentage: number;
  }>;
  financial_summary: {
    total_funds_raised_eur: number;
    total_funds_deployed_eur: number;
    cost_per_hour_tutored_eur: number;
  };
  commitments: string[];
}

export const ImpactReportPage: React.FC = () => {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ImpactData>('/cms/impact-report/')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Génération du rapport d'impact...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0">
      {/* Barre d'action hors impression */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase tracking-wide">
            Rapports d'impact publics (F16, F21)
          </span>
          <h1 className="text-2xl font-extrabold text-brand-blue">
            Rapport Synthétique d'Impact & d'Activité
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-slate-800 text-white text-xs font-bold shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimer / Exporter PDF
        </button>
      </div>

      {/* DOCUMENT DU RAPPORT */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-2">
        {/* En-tête officiel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-brand-teal pb-6">
          <div>
            <span className="text-xs font-bold text-brand-teal tracking-wide uppercase">
              Solidarité Éducative Comores • Coordination France / Comores
            </span>
            <h2 className="text-2xl font-black text-brand-blue mt-1">
              {data?.report_title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Édition officielle datée du {data?.generated_at} • Zone Pilote Grande Comore
            </p>
          </div>
          <div className="text-right sm:text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Programme Certifié
            </span>
          </div>
        </div>

        {/* 1. Indicateurs Majeurs d'Impact */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">
            1. Indicateurs Quantitatifs Clés
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-brand-blue">
                {data?.key_figures.total_students_enrolled}
              </div>
              <span className="text-xs text-slate-600 font-medium block">Élèves accompagnés</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-brand-teal">
                {data?.key_figures.verified_volunteers}
              </div>
              <span className="text-xs text-slate-600 font-medium block">Bénévoles qualifiés</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-slate-900">
                {data?.key_figures.completed_sessions}
              </div>
              <span className="text-xs text-slate-600 font-medium block">Séances délivrées</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-emerald-600">
                {data?.key_figures.attendance_rate_percent}%
              </div>
              <span className="text-xs text-slate-600 font-medium block">Taux d'assiduité</span>
            </div>
          </div>
        </div>

        {/* 2. Répartition Géographique */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">
            2. Déploiement & Couverture Géographique
          </h3>
          <div className="space-y-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            {data?.geographic_coverage.map((geo) => (
              <div key={geo.island} className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-900">{geo.island}</span>
                  <span className="text-slate-600 font-bold">{geo.students_count} élèves ({geo.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-brand-teal h-full rounded-full" style={{ width: `${geo.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Bilan Financier & Efficience */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">
            3. Efficience des Ressources & Modèle Économique Solidaire
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Fonds collectés (Dons)</span>
              <div className="text-xl font-bold text-brand-blue">
                {data?.financial_summary.total_funds_raised_eur.toLocaleString('fr-FR')} €
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Fonds engagés sur le terrain</span>
              <div className="text-xl font-bold text-slate-800">
                {data?.financial_summary.total_funds_deployed_eur.toLocaleString('fr-FR')} €
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium">Coût moyen de soutien par heure</span>
              <div className="text-xl font-bold text-teal-700">
                {data?.financial_summary.cost_per_hour_tutored_eur} € / h
              </div>
            </div>
          </div>
        </div>

        {/* 4. Engagements éthiques garantis */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-700">
            4. Garanties & Engagements Institutionnels
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            {data?.commitments.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bas de page officiel */}
        <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
          Document généré électroniquement par la Plateforme de Solidarité Éducative Comores. Conforme aux articles F16 et F21 du cahier des charges associatif.
        </div>
      </div>
    </div>
  );
};
