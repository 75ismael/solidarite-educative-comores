import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { TransparencyData } from '../../types';
import { TrendingUp, ShieldCheck, Heart, ArrowUpRight, DollarSign, CheckCircle2 } from 'lucide-react';

export const TransparencyPage: React.FC = () => {
  const [data, setData] = useState<TransparencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pledgeSuccess, setPledgeSuccess] = useState(false);
  const [pledgeForm, setPledgeForm] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    currency: 'EUR',
    is_anonymous: false,
    allocation: 'Soutien scolaire général',
  });

  useEffect(() => {
    apiClient
      .get<TransparencyData>('/finance/transparency/')
      .then((res) => {
        setData(res.data);
        if (window.location.hash === '#faire-un-don') {
          setTimeout(() => {
            const el = document.getElementById('faire-un-don');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      })
      .catch((err) => console.error("Erreur de chargement transparence", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/finance/donations/', {
        ...pledgeForm,
        amount: parseFloat(pledgeForm.amount),
        status: 'PLEDGED',
        received_at: new Date().toISOString().split('T')[0],
      });
      setPledgeSuccess(true);
      setPledgeForm({
        donor_name: '',
        donor_email: '',
        amount: '',
        currency: 'EUR',
        is_anonymous: false,
        allocation: 'Soutien scolaire général',
      });
    } catch (err) {
      alert("Erreur lors de l'enregistrement de votre promesse de don.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-sm">Chargement des données de transparence...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Transparence Financière & Traçabilité (F20)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-blue">
          Comptes publics et utilisation des ressources
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Conformément à nos statuts et au cahier des charges éthique, chaque dépense et chaque don sont documentés, vérifiés par notre responsable financier et consultables en toute clarté.
        </p>
      </div>

      {/* 2. Key Finance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total des dons collectés
          </span>
          <div className="text-3xl font-extrabold text-brand-blue">
            {data?.total_donations_received_eur.toLocaleString('fr-FR')} €
          </div>
          <span className="text-xs text-teal-700 block">
            Dons encaissés et affectés aux projets
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Dépenses engagées et justifiées
          </span>
          <div className="text-3xl font-extrabold text-slate-800">
            {data?.total_expenses_eur.toLocaleString('fr-FR')} €
          </div>
          <span className="text-xs text-slate-500 block">
            Factures & justificatifs audités
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Solde disponible
          </span>
          <div className="text-3xl font-extrabold text-emerald-600">
            {data?.balance_eur.toLocaleString('fr-FR')} €
          </div>
          <span className="text-xs text-emerald-700 block">
            Prêt à être mobilisé pour le programme
          </span>
        </div>
      </div>

      {/* 3. Campagne Active & Barre d'avancement */}
      {data?.active_campaign && (
        <div className="bg-gradient-to-r from-cyan-900 to-brand-blue rounded-3xl text-white p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Campagne en cours
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                {data.active_campaign.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-teal-300">
                {data.active_campaign.current_amount_eur.toLocaleString('fr-FR')} €
              </span>
              <span className="text-xs text-slate-300 block">
                sur {data.active_campaign.target_amount_eur.toLocaleString('fr-FR')} € visés
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200">
            {data.active_campaign.description}
          </p>

          <div className="space-y-1.5 pt-2">
            <div className="w-full bg-cyan-950/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, data.active_campaign.progress_percentage)}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-teal-300 font-semibold">
              {data.active_campaign.progress_percentage}% atteint
            </div>
          </div>
        </div>
      )}

      {/* 4. Ventilation des Dépenses par Catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-brand-blue">
              Ventilation des dépenses par catégorie
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Répartition des dépenses réelles engagées sur le terrain aux Comores.
            </p>
          </div>

          <div className="space-y-4">
            {data?.categories_breakdown.map((c) => (
              <div key={c.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                  <span className="text-slate-800">{c.label}</span>
                  <span className="text-slate-600 font-bold">
                    {c.amount_eur.toLocaleString('fr-FR')} € ({c.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-teal h-full rounded-full"
                    style={{ width: `${c.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Formulaire de Promesse de Don Solidaire */}
        <div id="faire-un-don" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 scroll-mt-24 ring-2 ring-emerald-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal text-xs font-semibold">
              <Heart className="w-3.5 h-3.5" /> Soutenir l'action
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Faire une promesse de don
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              100% des fonds sont tracés et affectés aux outils d'apprentissage.
            </p>
          </div>

          {pledgeSuccess ? (
            <div className="p-5 rounded-xl bg-teal-50 border border-teal-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-brand-teal mx-auto" />
              <h4 className="font-bold text-sm text-teal-900">Merci pour votre générosité !</h4>
              <p className="text-xs text-teal-800">
                Votre promesse de don a été transmise au responsable financier. Les instructions de virement vous seront envoyées.
              </p>
              <button
                onClick={() => setPledgeSuccess(false)}
                className="mt-3 text-xs font-semibold text-brand-teal hover:underline"
              >
                Faire une autre contribution
              </button>
            </div>
          ) : (
            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre nom ou organisme
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amina M."
                    value={pledgeForm.donor_name}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, donor_name: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail de contact
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@exemple.com"
                    value={pledgeForm.donor_email}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, donor_email: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    placeholder="50"
                    value={pledgeForm.amount}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, amount: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Devise
                  </label>
                  <select
                    value={pledgeForm.currency}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, currency: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-teal"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="KMF">Franc comorien (KMF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Affectation souhaitée
                </label>
                <select
                  value={pledgeForm.allocation}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, allocation: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-brand-teal"
                >
                  <option value="Soutien scolaire général">Soutien scolaire général (selon besoins prioritaires)</option>
                  <option value="Connectivité 4G élèves">Connectivité 4G & data pour les élèves</option>
                  <option value="Manuels & Livrets scolaires">Manuels scolaires & impressions d'annales</option>
                  <option value="Formation des bénévoles">Formation des bénévoles & encadrement</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={pledgeForm.is_anonymous}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, is_anonymous: e.target.checked })}
                  className="rounded text-brand-teal focus:ring-brand-teal"
                />
                <label htmlFor="anonymousCheck" className="text-xs text-slate-600">
                  Je souhaite que mon nom n'apparaisse pas sur la liste publique des donateurs.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs shadow transition-colors"
              >
                Confirmer ma promesse de don
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 6. Registre Public des Dépenses Récentes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base">
            Journal public des dépenses vérifiées
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaque opération fait l'objet d'un justificatif comptable conservé par l'association.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Objet de la dépense</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Réf. Justificatif</th>
                <th className="py-3 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.recent_expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">{exp.spent_at}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{exp.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">
                      {exp.category_display}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">{exp.receipt_reference || 'Vérifié'}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {parseFloat(exp.amount_eur).toLocaleString('fr-FR')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
