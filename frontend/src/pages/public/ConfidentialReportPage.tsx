import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { ShieldAlert, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export const ConfidentialReportPage: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reportNumber, setReportNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    reporter_name: '',
    reporter_contact: '',
    reporter_role: 'Parent',
    category: 'SAFETY_CONCERN',
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await apiClient.post('/safeguarding/reports/submit/', form);
      setReportNumber(res.data.report_number || 'SIG-RECU');
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Une erreur est survenue lors de la transmission du signalement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Signalement transmis en toute confidentialité
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Votre signalement a été directement adressé au Responsable de la protection des mineurs sous le numéro :{' '}
          <strong className="text-brand-blue font-mono bg-slate-100 px-2 py-0.5 rounded">
            {reportNumber}
          </strong>
          . Des mesures appropriées seront prises dans les plus brefs délais selon notre protocole d'urgence.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-rose-600" /> Canal Confidentiel Dédié (F15)
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Signaler une difficulté ou un risque concernant un élève
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Ce formulaire est strictement confidentiel et accessible uniquement par le Responsable désigné de la protection des mineurs. Vous pouvez choisir de rester anonyme.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Important en cas d'urgence immédiate :</strong>
          Si un enfant est en danger physique immédiat, veuillez solliciter les secours ou services compétents d'urgence sans attendre le traitement de ce formulaire en ligne.
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Votre rôle par rapport à l'élève
            </label>
            <select
              value={form.reporter_role}
              onChange={(e) => setForm({ ...form, reporter_role: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
            >
              <option value="Parent">Parent / Représentant légal</option>
              <option value="Élève">Élève accompagné</option>
              <option value="Bénévole">Bénévole tuteur</option>
              <option value="Enseignant">Enseignant / Établissement</option>
              <option value="Tiers">Témoin extérieur / Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nature de la situation
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
            >
              <option value="SAFETY_CONCERN">Inquiétude relative à la sécurité ou au bien-être</option>
              <option value="BEHAVIOR">Comportement suspect ou inapproprié</option>
              <option value="EMERGENCY">Difficulté familiale, matérielle ou scolaire grave</option>
              <option value="ETHICAL_BREACH">Manquement à la charte de confidentialité</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description détaillée et factuelle des faits constatés *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Décrivez avec le plus de précision possible les faits, dates, propos ou situations qui motivent votre signalement..."
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
          ></textarea>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Coordonnées pour vous recontacter (facultatif / si vous souhaitez être informé)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Nom / Prénom (facultatif)</label>
              <input
                type="text"
                placeholder="Laisser vide pour un signalement 100% anonyme"
                value={form.reporter_name}
                onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Téléphone ou E-mail (facultatif)</label>
              <input
                type="text"
                placeholder="Ex: +269 ... ou email"
                value={form.reporter_contact}
                onChange={(e) => setForm({ ...form, reporter_contact: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm shadow transition-colors flex items-center justify-center gap-2"
        >
          <ShieldAlert className="w-4 h-4" />
          {submitting ? "Transmission sécurisée..." : "Transmettre le signalement confidentiel"}
        </button>
      </form>
    </div>
  );
};
