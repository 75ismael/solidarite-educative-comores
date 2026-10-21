import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await apiClient.post('/cms/contact/', form);
      setSuccess(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-brand-teal text-xs font-semibold">
          <MessageSquare className="w-4 h-4" /> Écoute & Partenariats
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-blue tracking-tight">
          Contactez l'équipe du projet
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Une question sur un accompagnement, une proposition de partenariat ou un besoin d'information ? Notre équipe vous répond sous 48h.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulaire de Contact (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Envoyez-nous un message</h2>
            <p className="text-xs text-slate-500 mt-1">
              Remplissez ce formulaire pour joindre la coordination pédagogique ou administrative.
            </p>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-brand-teal mx-auto" />
              <h3 className="font-bold text-teal-950 text-base">Message envoyé avec succès !</h3>
              <p className="text-xs text-teal-800 max-w-sm mx-auto">
                Merci de votre message. Notre équipe va l'étudier avec attention et vous recontacter très prochainement.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-semibold text-brand-teal hover:underline"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Mohamed Ali"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre adresse e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nom@exemple.com"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Téléphone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+269 ... ou +33 ..."
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Objet de votre demande *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Ex: Partenariat école, question don..."
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Votre message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Précisez votre demande ou vos interrogations..."
                  className="w-full text-xs sm:text-sm p-3.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-brand-teal hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Envoi en cours..." : "Transmettre mon message"}
              </button>
            </form>
          )}
        </div>

        {/* Coordonnées & Relais Locaux (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-cyan-950 text-white rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-xl font-bold">Nos Relais Territoriaux</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pour rencontrer nos coordinateurs locaux, remettre des manuels ou convenir de partenariats scolaires.
            </p>

            <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-teal-300 block">Grande Comore (Ngazidja) — Pilote</span>
                <p className="text-slate-300">Moroni, Quartier Coulée / Mtsangani</p>
                <p className="text-slate-400">Tél : +269 332 11 22</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-teal-300 block">Anjouan (Ndzuwani)</span>
                <p className="text-slate-300">Mutsamudu Centre</p>
                <p className="text-slate-400">Contact : relais-anjouan@benevolat.km</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-teal-300 block">Coordination France (Diaspora)</span>
                <p className="text-slate-300">Paris / Marseille (Siège administratif)</p>
                <p className="text-slate-400">Email : contact@benevolat.km</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block">Note de confidentialité</span>
            <p className="leading-relaxed">
              Les dossiers des élèves ne doivent jamais être envoyés par ce formulaire public. Pour inscrire un enfant, veuillez utiliser le{' '}
              <a href="/demande-soutien" className="text-brand-teal font-semibold underline">
                formulaire sécurisé de demande d'accompagnement
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
