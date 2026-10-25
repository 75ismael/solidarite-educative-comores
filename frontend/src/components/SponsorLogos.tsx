import React, { useState, useEffect } from 'react';
import {
  Building2,
  ExternalLink,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Globe,
  ShieldCheck,
  Send,
  Clock,
  Check,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { apiClient, extractResults, formatApiError } from '../api/client';
import { Partner } from '../types';
import { useAuth } from '../context/AuthContext';

// Partenaires et entreprises mécènes par défaut si l'API est en cours de chargement
const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 101,
    name: 'Telma Comores',
    category: 'TECH',
    category_display: 'Connectivité & Numérique',
    logo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=160&auto=format&fit=crop&q=80',
    website_url: 'https://telma.km',
    description: 'Forfaits internet 4G et connectivité mobile offerts pour les séances de tutorat en visio.',
    order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 102,
    name: 'Banque de Développement des Comores (BDC)',
    category: 'CORPORATE',
    category_display: 'Mécénat & Entreprise',
    logo_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=160&auto=format&fit=crop&q=80',
    website_url: 'https://bdc-comores.com',
    description: 'Mécénat pour l’inclusion scolaire et financement des bourses de manuels scolaires.',
    order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 103,
    name: 'TotalEnergies Comores',
    category: 'CORPORATE',
    category_display: 'Mécénat & Entreprise',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=160&auto=format&fit=crop&q=80',
    website_url: 'https://totalenergies.com',
    description: 'Soutien logistique et fourniture de lampes solaires d’étude pour les élèves en milieu rural.',
    order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 104,
    name: 'SNPSF Comores',
    category: 'CORPORATE',
    category_display: 'Mécénat & Entreprise',
    logo_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=160&auto=format&fit=crop&q=80',
    website_url: 'https://snpsf.km',
    description: 'Partenaire pour l’inclusion numérique et mise à disposition de points relais dans les îles.',
    order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 105,
    name: 'Al-Qamar Holding',
    category: 'CORPORATE',
    category_display: 'Mécénat & Entreprise',
    logo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=160&auto=format&fit=crop&q=80',
    website_url: '',
    description: 'Mécénat d’entreprise et dotation de kits de fournitures scolaires pour les familles aidées.',
    order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 106,
    name: 'UNICEF Comores',
    category: 'INSTITUTIONAL',
    category_display: 'Partenaire Institutionnel',
    logo_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=160&auto=format&fit=crop&q=80',
    website_url: 'https://unicef.org',
    description: 'Appui institutionnel pour l’accès universel à un soutien scolaire gratuit et de qualité.',
    order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

interface SponsorLogosProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export const SponsorLogos: React.FC<SponsorLogosProps> = ({
  className = '',
  title = 'Les entreprises & partenaires qui nous soutiennent',
  subtitle = 'Grâce à leur mécénat et à leur confiance, l’accompagnement scolaire de Solidarité Éducative reste 100% gratuit pour toutes les familles comoriennes.',
}) => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [pendingPartners, setPendingPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // Modal d'inscription / ajout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Modération admin en direct
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'CORPORATE' as Partner['category'],
    logo_url: '',
    website_url: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    order: 0,
  });

  const isManager =
    user?.role === 'COORDINATOR' ||
    user?.role === 'ADMIN' ||
    user?.role === 'SAFEGUARDING_OFFICER';

  // Charger les partenaires validés (public)
  const fetchActivePartners = () => {
    setLoading(true);
    apiClient
      .get('/cms/partners/')
      .then((res) => {
        const list = extractResults<Partner>(res.data);
        if (list && list.length > 0) {
          setPartners(list);
        }
      })
      .catch(() => {
        // En cas d'erreur réseau, on conserve DEFAULT_PARTNERS
      })
      .finally(() => setLoading(false));
  };

  // Charger les entreprises en attente de validation si l'utilisateur est administrateur
  const fetchPendingPartners = () => {
    if (!isManager) return;
    apiClient
      .get('/cms/partners/?status=pending')
      .then((res) => {
        const list = extractResults<Partner>(res.data);
        setPendingPartners(list || []);
      })
      .catch(() => {
        setPendingPartners([]);
      });
  };

  useEffect(() => {
    fetchActivePartners();
    if (isManager) {
      fetchPendingPartners();
    }
  }, [isManager]);

  // Validation d'une entreprise par l'administrateur
  const handleApprovePartner = async (partnerId: number) => {
    setProcessingId(partnerId);
    try {
      const res = await apiClient.patch<Partner>(`/cms/partners/${partnerId}/`, {
        is_active: true,
      });
      const approved = res.data;

      // Retirer des en attente
      setPendingPartners((prev) => prev.filter((p) => p.id !== partnerId));
      // Ajouter à la liste active affichée
      setPartners((prev) => [approved, ...prev.filter((p) => p.id !== partnerId)]);
    } catch (err: any) {
      alert("Erreur lors de la validation de l'entreprise par l'administrateur.");
    } finally {
      setProcessingId(null);
    }
  };

  // Refus / suppression d'une demande par l'administrateur
  const handleRejectPartner = async (partnerId: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette demande d'entreprise ?")) return;
    setProcessingId(partnerId);
    try {
      await apiClient.delete(`/cms/partners/${partnerId}/`);
      setPendingPartners((prev) => prev.filter((p) => p.id !== partnerId));
    } catch (err: any) {
      alert("Erreur lors de la suppression de la demande.");
    } finally {
      setProcessingId(null);
    }
  };

  // Soumission d'une nouvelle entreprise
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Le nom de l'entreprise est obligatoire.");
      return;
    }
    if (!form.contact_email.trim() || !form.contact_email.includes('@')) {
      setFormError("Une adresse email de contact valide est indispensable pour la validation administrative.");
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        logo_url: form.logo_url.trim(),
        website_url: form.website_url.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        description: form.description.trim(),
        order: Number(form.order) || 0,
        // Si créé par un administrateur connecté, on peut l'activer directement,
        // sinon l'entreprise est enregistrée en attente de validation (is_active = false)
        is_active: isManager,
      };

      const res = await apiClient.post<Partner>('/cms/partners/', payload);
      const created = res.data;

      if (isManager) {
        setPartners((prev) => [created, ...prev]);
        setFormSuccessMessage("L'entreprise a été enregistrée et publiée directement par l'administrateur.");
      } else {
        setFormSuccessMessage(
          "Inscription enregistrée avec succès ! Votre demande est transmise à l'administrateur. Dès qu'elle sera validée, votre logo sera visible sur le site."
        );
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccessMessage('');
        setForm({
          name: '',
          category: 'CORPORATE',
          logo_url: '',
          website_url: '',
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          description: '',
          order: 0,
        });
        fetchPendingPartners();
      }, 2500);
    } catch (err: any) {
      setFormError(formatApiError(err, "Une erreur est survenue lors de l'enregistrement de l'entreprise."));
    } finally {
      setSubmitting(false);
    }
  };

  const getCompanyInitials = (name: string) => {
    return (
      name
        .replace(/[\(\)]/g, '')
        .split(' ')
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || 'SO'
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── En-tête de la section ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Mécénat &amp; Entreprises partenaires</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Bouton d'inscription / proposition de mécénat */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setFormSuccessMessage('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-950/40 transition-all active:scale-95 cursor-pointer"
            title="Inscrire votre entreprise ou proposer un mécénat"
          >
            <PlusCircle className="w-4 h-4 text-purple-200" />
            <span>Inscrire une entreprise mécène</span>
          </button>
        </div>
      </div>

      {/* ── BANDEAU ADMINISTRATEUR : Entreprises en attente de validation ── */}
      {isManager && pendingPartners.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 text-amber-300 font-extrabold text-sm">
              <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>
                {pendingPartners.length} entreprise{pendingPartners.length > 1 ? 's' : ''} en attente de validation par l'administrateur
              </span>
            </div>
            <a
              href="/admin/cms/partner/?is_active__exact=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-300 hover:text-amber-100 font-bold underline inline-flex items-center gap-1"
            >
              <span>Ouvrir dans Django Admin</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {pendingPartners.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#140F2D] border border-amber-500/30 shadow-2xs flex flex-col justify-between space-y-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white truncate">{item.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/70 border border-amber-800/50 text-amber-300 font-bold">
                      À valider
                    </span>
                  </div>
                  {item.contact_email && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Contact : {item.contact_name || 'Non précisé'} ({item.contact_email})
                    </p>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-slate-300 italic mt-1 line-clamp-2">
                      « {item.description} »
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#281F4B]">
                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => handleApprovePartner(item.id)}
                    className="flex-1 py-1.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Valider &amp; Afficher</span>
                  </button>
                  <button
                    type="button"
                    disabled={processingId === item.id}
                    onClick={() => handleRejectPartner(item.id)}
                    className="py-1.5 px-2.5 rounded-full bg-rose-950/50 hover:bg-rose-900 border border-rose-800/40 text-rose-300 font-bold text-[11px] flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                    title="Supprimer la demande"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Grille des logos d'entreprises validées ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {partners.map((partner) => {
          const hasImage = partner.logo_url && !imgErrors[partner.id];
          return (
            <div
              key={partner.id}
              className="group bg-[#140F2D] rounded-2xl p-4 border border-[#281F4B] shadow-md hover:border-purple-500/40 transition-all flex flex-col items-center text-center justify-between min-h-[140px]"
            >
              {/* Conteneur Logo */}
              <div className="w-16 h-16 rounded-xl bg-[#1D173C] border border-[#281F4B] flex items-center justify-center p-2 overflow-hidden group-hover:scale-105 transition-transform">
                {hasImage ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    onError={() => setImgErrors((prev) => ({ ...prev, [partner.id]: true }))}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-purple-700 to-indigo-900 text-white flex flex-col items-center justify-center font-extrabold text-xs shadow-2xs">
                    <span>{getCompanyInitials(partner.name)}</span>
                  </div>
                )}
              </div>

              {/* Nom & catégorie */}
              <div className="space-y-1 w-full mt-2">
                <h4 className="font-extrabold text-white text-xs leading-snug truncate group-hover:text-purple-300 transition-colors">
                  {partner.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {partner.category_display ||
                    (partner.category === 'TECH'
                      ? 'Tech & Connectivité'
                      : partner.category === 'CORPORATE'
                      ? 'Entreprise mécène'
                      : partner.category === 'INSTITUTIONAL'
                      ? 'Institution'
                      : 'Éducation')}
                </p>
              </div>

              {/* Lien site externe s'il existe */}
              {partner.website_url ? (
                <a
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 hover:underline font-semibold"
                  title={`Visiter le site de ${partner.name}`}
                >
                  <Globe className="w-2.5 h-2.5" />
                  <span>Site web</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                </a>
              ) : (
                <span className="mt-2 text-[10px] text-emerald-600 font-bold inline-flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Soutien vérifié</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Détail des apports et engagements des entreprises ── */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Leur soutien concret pour les élèves :
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {partners.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="p-3 bg-white rounded-xl border border-slate-200/70 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 truncate">{p.name}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {p.category === 'TECH' ? 'Connectivité' : 'Mécénat'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                {p.description || "Engagement solidaire pour la réussite des élèves comoriens."}
              </p>
            </div>
          ))}
        </div>

        {/* Note de modération & lien admin */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            <span>
              Chaque entreprise inscrite est examinée et validée par notre équipe d'administrateurs avant d'être publiée.
            </span>
          </div>
          {isManager && (
            <a
              href="/admin/cms/partner/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal hover:underline font-bold inline-flex items-center gap-1 shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Gérer les partenariats dans Django Admin →</span>
            </a>
          )}
        </div>
      </div>

      {/* ── MODAL : Inscription d'entreprise (avec validation admin) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* En-tête du modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand-teal">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Inscription Entreprise & Mécénat
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proposez votre soutien solidaire aux élèves des Comores
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulaire dans le corps du modal */}
            <form onSubmit={handleCreatePartner} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Explication du workflow de validation admin */}
              <div className="p-3.5 rounded-xl bg-cyan-50/80 border border-cyan-200 text-brand-blue space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>Validation administrative préalable</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Après avoir inscrit votre entreprise, votre dossier est examiné par l'administrateur. Le logo sera affiché publiquement sur la plateforme dès validation de votre partenariat.
                </p>
              </div>

              {formSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nom de l'entreprise */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom de l'entreprise ou mécène *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Comores Télécom, Banque BDC, TotalEnergies…"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catégorie de partenariat *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                >
                  <option value="CORPORATE">Mécénat & Entreprise</option>
                  <option value="TECH">Connectivité & Numérique</option>
                  <option value="INSTITUTIONAL">Partenaire Institutionnel</option>
                  <option value="EDUCATION">Éducation & Université</option>
                  <option value="ASSOCIATION">Association & Collectif</option>
                </select>
              </div>

              {/* Contact pour validation administrative */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nom du responsable / contact
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Responsable RSE / Mécénat"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@entreprise.km"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    L'administrateur vous contactera via cet email.
                  </p>
                </div>
              </div>

              {/* URL du Logo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL du logo de l'entreprise
                </label>
                <input
                  type="url"
                  placeholder="https://... (lien vers votre logo ou image officielle)"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                />
              </div>

              {/* Lien officiel du site */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Site web officiel (optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://www.nom-entreprise.km"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                />
              </div>

              {/* Description de l'apport */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Soutien proposé ou apport envisagé *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex : Mise à disposition de matériel informatique, forfaits 4G pour le tutorat, bourses de fournitures..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none resize-none"
                />
              </div>

              {/* Bouton de soumission */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transmission à l'administrateur…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isManager
                          ? "Enregistrer & publier en tant qu'administrateur"
                          : "Transmettre pour validation par l'administrateur"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorLogos;
