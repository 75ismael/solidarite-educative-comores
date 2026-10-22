import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, extractResults, formatApiError } from '../../api/client';
import { Subject } from '../../types';
import {
  Building2,
  User,
  BookOpen,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  HeartHandshake,
  Laptop,
  GraduationCap,
  Users,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  School,
  Briefcase,
  Home,
} from 'lucide-react';

// ─── Type de publiant ────────────────────────────────────────────────────────
const PUBLISHER_TYPES = [
  {
    value: 'ORGANIZATION',
    label: 'Organisation / Structure',
    desc: 'École, association, entreprise, collectivité…',
    icon: Building2,
    color: 'brand-blue',
  },
  {
    value: 'INDIVIDUAL',
    label: 'Particulier',
    desc: "Parent d'élève, citoyen, enseignant indépendant…",
    icon: User,
    color: 'brand-teal',
  },
] as const;

const ORGANIZATION_TYPES = [
  { value: 'PUBLIC_SCHOOL',  label: 'École / Établissement public',    icon: School },
  { value: 'PRIVATE_SCHOOL', label: 'Établissement scolaire privé',    icon: School },
  { value: 'ASSOCIATION',    label: 'Association / ONG / Collectif',   icon: HeartHandshake },
  { value: 'ENTERPRISE',     label: 'Entreprise / Mécénat',            icon: Briefcase },
  { value: 'COMMUNITY',      label: 'Collectivité locale / Mairie',    icon: Building2 },
  { value: 'OTHER',          label: 'Autre organisation',              icon: Sparkles },
];

const INDIVIDUAL_ROLES = [
  { value: 'PARENT',  label: "Parent d'élève / Famille",        icon: Home },
  { value: 'STUDENT', label: 'Élève / Étudiant porteur de projet', icon: GraduationCap },
  { value: 'TEACHER', label: 'Enseignant indépendant',           icon: BookOpen },
  { value: 'CITIZEN', label: 'Citoyen engagé / Autre',           icon: Users },
];

const ISLANDS = [
  { value: 'Grande Comore (Ngazidja)', label: 'Grande Comore (Ngazidja)' },
  { value: 'Anjouan (Ndzuwani)',       label: 'Anjouan (Ndzuwani)' },
  { value: 'Mohéli (Mwali)',           label: 'Mohéli (Mwali)' },
  { value: 'Mayotte (Maore)',          label: 'Mayotte (Maore)' },
  { value: 'Diaspora / International', label: 'Diaspora / International' },
];

const FORMATS = [
  { value: 'EITHER',    label: 'Sur place ou à distance',  icon: Laptop },
  { value: 'IN_PERSON', label: 'Sur le terrain uniquement', icon: MapPin },
  { value: 'REMOTE',    label: 'À distance (visio)',        icon: Laptop },
];

const SCHOOL_LEVELS = [
  'Primaire (CP à CM2)',
  'Collège (6e à 3e)',
  'Lycée (Seconde à Terminale)',
  'Tous niveaux',
  'Formation professionnelle',
];

const COMMITMENTS = [
  '1h par semaine',
  '1h30 par semaine',
  '2h par semaine',
  '3h par semaine',
  'Flexible (à définir)',
];

// ─── Form state ──────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  // Étape 1 : Publiant
  publisher_type:    'ORGANIZATION' as 'ORGANIZATION' | 'INDIVIDUAL',
  organization_type: 'PUBLIC_SCHOOL',
  individual_role:   'PARENT',
  published_by:      '',
  organization_name: '',
  contact_email:     '',
  contact_phone:     '',
  // Étape 2 : Mission
  title:             '',
  subject:           0,
  school_level:      'Collège (6e à 3e)',
  island:            'Grande Comore (Ngazidja)',
  city:              '',
  format:            'EITHER',
  mentors_needed:    3,
  expected_commitment: '2h par semaine',
  // Étape 3 : Contenu
  description:       '',
  presentation_full: '',
  prerequisites:     '',
  steps_to_join:     '',
  practical_details: '',
  benefits:          '',
  intervention_zone_details: '',
  // Étape 4 : Calendrier
  start_date: '',
  end_date:   '',
  deadline:   '',
  // Charte
  charter_accepted: false,
};

const STEPS = [
  { id: 1, label: 'Qui publie ?',   icon: User },
  { id: 2, label: 'La mission',     icon: BookOpen },
  { id: 3, label: 'Contenu',        icon: Sparkles },
  { id: 4, label: 'Calendrier',     icon: Calendar },
];

// ─── Field helpers ────────────────────────────────────────────────────────────
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  hint?: string;
}> = ({ label, name, value, onChange, required, placeholder, type = 'text', hint }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {hint && <p className="text-[11px] text-slate-400 mb-1">{hint}</p>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20 bg-white"
    />
  </div>
);

const TextareaField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  hint?: string;
}> = ({ label, value, onChange, required, placeholder, rows = 3, hint }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {hint && <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>}
    <textarea
      rows={rows}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20 bg-white resize-none"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  required?: boolean;
}> = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── Page principale ──────────────────────────────────────────────────────────
export const PublishMissionPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/pedagogy/subjects/').then(res => {
      const list = extractResults<Subject>(res.data);
      setSubjects(list);
      if (list.length > 0 && !form.subject) {
        setForm(f => ({ ...f, subject: list[0].id }));
      }
    }).catch(() => {});
  }, []);

  const set = (field: string, value: unknown) =>
    setForm(f => ({ ...f, [field]: value }));

  // ── Validation par étape ──
  const canContinue = (): boolean => {
    if (step === 1) {
      const nameOk = form.publisher_type === 'ORGANIZATION'
        ? form.organization_name.trim().length > 1
        : form.published_by.trim().length > 1;
      return nameOk && form.contact_email.includes('@');
    }
    if (step === 2) {
      return form.title.trim().length > 5 && form.subject > 0 && form.city.trim().length > 1;
    }
    if (step === 3) {
      return form.description.trim().length > 20;
    }
    return true; // étape 4 : calendrier optionnel
  };

  const handleSubmit = async () => {
    if (!form.charter_accepted) {
      setErrorMsg('Veuillez accepter la charte de publication avant de soumettre.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        publisher_type:    form.publisher_type,
        organization_type: form.publisher_type === 'ORGANIZATION' ? form.organization_type : '',
        individual_role:   form.publisher_type === 'INDIVIDUAL'   ? form.individual_role : '',
        published_by:      form.publisher_type === 'ORGANIZATION' ? form.organization_name : form.published_by,
        organization_name: form.organization_name || form.published_by,
        contact_email:     form.contact_email,
        contact_phone:     form.contact_phone,
        title:             form.title,
        subject:           form.subject,
        school_level:      form.school_level,
        island:            form.island,
        city:              form.city,
        format:            form.format,
        mentors_needed:    form.mentors_needed,
        expected_commitment: form.expected_commitment,
        description:       form.description,
        presentation_full: form.presentation_full,
        prerequisites:     form.prerequisites,
        steps_to_join:     form.steps_to_join,
        practical_details: form.practical_details,
        benefits:          form.benefits,
        intervention_zone_details: form.intervention_zone_details,
        activity_type:     'Soutien scolaire & Tutorat',
        target_public:     `Élèves – ${form.school_level}`,
        status:            'OPEN',
      };
      if (form.start_date) payload.start_date = form.start_date;
      if (form.end_date)   payload.end_date   = form.end_date;
      if (form.deadline)   payload.deadline   = form.deadline;

      const res = await apiClient.post('/volunteering/missions/', payload);
      setCreatedId(res.data.id);
      setSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(formatApiError(err, 'Une erreur est survenue. Vérifiez les champs et réessayez.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Écran de succès ──
  if (success) {
    return (
      <div className="bg-brand-light min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 max-w-lg w-full p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center mx-auto border-2 border-teal-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Mission publiée avec succès !</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Votre appel à bénévoles a été soumis et est maintenant visible sur la plateforme. Notre équipe de coordination le validera sous 24h.
            </p>
          </div>
          <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 text-sm text-teal-900 font-medium">
            📩 Un e-mail de confirmation a été envoyé à <strong>{form.contact_email}</strong>. Conservez-le pour suivre votre mission.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {createdId && (
              <Link
                to={`/missions/${createdId}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-blue hover:bg-slate-900 text-white font-bold text-sm shadow-md transition-all"
              >
                <span>Voir la mission publiée</span>
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </Link>
            )}
            <Link
              to="/missions"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all"
            >
              <span>Toutes les missions</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-light min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-dark via-brand-blue to-teal-800 text-white pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider text-teal-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Appel à bénévoles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Publier une mission de bénévolat
          </h1>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            École, association, parent d'élève ou citoyen — publiez gratuitement votre appel à bénévoles et connectez-vous avec des tuteurs engagés.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 px-4 py-4 flex items-center justify-between gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const current = step === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-all ${
                      done    ? 'bg-emerald-500 text-white' :
                      current ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30' :
                                'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <div className={`text-[11px] font-bold truncate ${current ? 'text-brand-blue' : done ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {s.label}
                    </div>
                    <div className="text-[10px] text-slate-400">Étape {s.id}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 max-w-[40px] rounded-full transition-all ${step > s.id ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Card contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8">

          {/* ── ÉTAPE 1 : QUI PUBLIE ── */}
          {step === 1 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Qui publie cette mission ?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Choisissez votre profil pour adapter le formulaire à votre situation.
                </p>
              </div>

              {/* Choix Organisation / Particulier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PUBLISHER_TYPES.map(pt => {
                  const Icon = pt.icon;
                  const selected = form.publisher_type === pt.value;
                  return (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => set('publisher_type', pt.value)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${
                        selected
                          ? 'border-brand-teal bg-teal-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{pt.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{pt.desc}</div>
                      </div>
                      {selected && (
                        <div className="ml-auto shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Type d'organisation */}
              {form.publisher_type === 'ORGANIZATION' && (
                <div className="space-y-5 pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Type d'organisation</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ORGANIZATION_TYPES.map(ot => {
                        const Icon = ot.icon;
                        const sel = form.organization_type === ot.value;
                        return (
                          <button
                            key={ot.value}
                            type="button"
                            onClick={() => set('organization_type', ot.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs font-semibold transition-all ${
                              sel
                                ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                : 'border-slate-200 text-slate-600 hover:border-brand-blue/30 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="leading-tight">{ot.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Nom de l'organisation / établissement"
                      name="organization_name"
                      value={form.organization_name}
                      onChange={v => set('organization_name', v)}
                      required
                      placeholder="Ex: Collège de Moroni Sud, Association Éducation+"
                    />
                    <InputField
                      label="Nom du référent / contact"
                      name="published_by"
                      value={form.published_by}
                      onChange={v => set('published_by', v)}
                      placeholder="Ex: Mme Fatima Bacar, Directrice"
                    />
                  </div>
                </div>
              )}

              {/* Rôle particulier */}
              {form.publisher_type === 'INDIVIDUAL' && (
                <div className="space-y-5 pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Votre rôle</div>
                    <div className="grid grid-cols-2 gap-2">
                      {INDIVIDUAL_ROLES.map(ir => {
                        const Icon = ir.icon;
                        const sel = form.individual_role === ir.value;
                        return (
                          <button
                            key={ir.value}
                            type="button"
                            onClick={() => set('individual_role', ir.value)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                              sel
                                ? 'border-brand-teal bg-teal-50 text-brand-teal'
                                : 'border-slate-200 text-slate-600 hover:border-brand-teal/30 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="leading-tight">{ir.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <InputField
                    label="Votre nom complet"
                    name="published_by"
                    value={form.published_by}
                    onChange={v => set('published_by', v)}
                    required
                    placeholder="Ex: Hamid Abdou"
                  />
                </div>
              )}

              {/* Contact commun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse e-mail de contact <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={e => set('contact_email', e.target.value)}
                      required
                      placeholder="contact@ecole.km"
                      className="w-full text-sm pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={e => set('contact_phone', e.target.value)}
                      placeholder="+269 3XX XX XX"
                      className="w-full text-sm pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : LA MISSION ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Décrivez votre mission</h2>
                <p className="text-sm text-slate-500 mt-1">Les informations essentielles qui permettront aux bénévoles de trouver votre appel.</p>
              </div>

              <InputField
                label="Titre de la mission"
                name="title"
                value={form.title}
                onChange={v => set('title', v)}
                required
                placeholder="Ex: Tutorat en Mathématiques pour collégiens de 3ème"
                hint="Soyez précis et descriptif — c'est ce que les bénévoles verront en premier."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Matière concernée <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.subject}
                    onChange={e => set('subject', Number(e.target.value))}
                    required
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
                  >
                    <option value={0}>— Choisir une matière —</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <SelectField
                  label="Niveau scolaire"
                  value={form.school_level}
                  onChange={v => set('school_level', v)}
                  options={SCHOOL_LEVELS.map(l => ({ value: l, label: l }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Île / Zone"
                  value={form.island}
                  onChange={v => set('island', v)}
                  options={ISLANDS}
                  required
                />
                <InputField
                  label="Ville / Localité"
                  name="city"
                  value={form.city}
                  onChange={v => set('city', v)}
                  required
                  placeholder="Ex: Moroni, Mutsamudu, Fomboni"
                />
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Format de la mission <span className="text-rose-500">*</span></div>
                <div className="grid grid-cols-3 gap-3">
                  {FORMATS.map(f => {
                    const Icon = f.icon;
                    const sel = form.format === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => set('format', f.value)}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                          sel
                            ? 'border-brand-teal bg-teal-50 text-brand-teal'
                            : 'border-slate-200 text-slate-500 hover:border-brand-teal/30'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="leading-tight">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Engagement attendu</label>
                  <select
                    value={form.expected_commitment}
                    onChange={e => set('expected_commitment', e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
                  >
                    {COMMITMENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre de bénévoles souhaités
                    <span className="text-slate-400 font-normal ml-1">(mentors)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => set('mentors_needed', Math.max(1, form.mentors_needed - 1))}
                      className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-lg"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-extrabold text-brand-blue">{form.mentors_needed}</span>
                      <span className="text-xs text-slate-500 block">mentor{form.mentors_needed > 1 ? 's' : ''}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('mentors_needed', Math.min(20, form.mentors_needed + 1))}
                      className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : CONTENU ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Contenu de la mission</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Un contenu riche et honnête attire 3× plus de candidats. Seul le résumé est obligatoire.
                </p>
              </div>

              <TextareaField
                label="Résumé de la mission"
                value={form.description}
                onChange={v => set('description', v)}
                required
                rows={3}
                placeholder="Ex: Accompagnement 1h30/semaine d'un élève de 3ème en difficultés de mathématiques. Séances en visio ou en présentiel au collège."
                hint="Ce texte apparaît sur la carte de la mission. Max 3 lignes."
              />

              <TextareaField
                label="Présentation complète"
                value={form.presentation_full}
                onChange={v => set('presentation_full', v)}
                rows={5}
                placeholder="Bonjour,&#10;Nous recherchons un(e) bénévole motivé(e) pour...&#10;Notre structure...&#10;Les bénéfices pour le bénévole..."
                hint="Parlez de votre structure, du contexte de l'élève et de ce que le bénévole va apporter."
              />

              <TextareaField
                label="Pré-requis pour réaliser cette mission"
                value={form.prerequisites}
                onChange={v => set('prerequisites', v)}
                rows={2}
                placeholder="Ex: Niveau Licence minimum, bienveillance, disponibilité le samedi matin"
              />

              <TextareaField
                label="Zone d'intervention précise (établissements, quartiers…)"
                value={form.intervention_zone_details}
                onChange={v => set('intervention_zone_details', v)}
                rows={2}
                placeholder="Ex: Collège Moroni Sud (route nationale) • Salle de réunion associative • Visio via Google Meet"
              />

              <TextareaField
                label="Comment rejoindre la mission (Sautez le pas)"
                value={form.steps_to_join}
                onChange={v => set('steps_to_join', v)}
                rows={3}
                placeholder="Ex: 1. Réunion d'information en ligne le jeudi soir. 2. Entretien avec le coordinateur. 3. Première séance encadrée."
              />

              <TextareaField
                label="Précisions pratiques"
                value={form.practical_details}
                onChange={v => set('practical_details', v)}
                rows={2}
                placeholder="Ex: Séances le mercredi de 15h à 16h30. Matériel fourni. Pas de week-end."
              />

              <TextareaField
                label="Ce que nous apportons au bénévole (bénéfices)"
                value={form.benefits}
                onChange={v => set('benefits', v)}
                rows={2}
                placeholder="Ex: Attestation officielle, accès aux ressources pédagogiques, réseau de tuteurs, valorisation sur le CV."
              />
            </div>
          )}

          {/* ── ÉTAPE 4 : CALENDRIER ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Calendrier de la mission</h2>
                <p className="text-sm text-slate-500 mt-1">Les dates aident les bénévoles à planifier leur engagement. Toutes sont optionnelles.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Date de début"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={v => set('start_date', v)}
                />
                <InputField
                  label="Date de fin prévue"
                  name="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={v => set('end_date', v)}
                />
                <InputField
                  label="Date limite de candidature"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={v => set('deadline', v)}
                />
              </div>

              {/* Récapitulatif */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Récapitulatif de votre publication
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div><span className="font-bold text-slate-500 uppercase tracking-wide">Publiant</span><br /><span className="font-semibold text-slate-800">{form.publisher_type === 'ORGANIZATION' ? form.organization_name : form.published_by}</span></div>
                    <div><span className="font-bold text-slate-500 uppercase tracking-wide">Contact</span><br /><span className="font-semibold text-slate-800">{form.contact_email}</span></div>
                    <div><span className="font-bold text-slate-500 uppercase tracking-wide">Mission</span><br /><span className="font-semibold text-slate-800">{form.title}</span></div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-bold text-slate-500 uppercase tracking-wide">Niveau</span><br /><span className="font-semibold text-slate-800">{form.school_level}</span></div>
                    <div><span className="font-bold text-slate-500 uppercase tracking-wide">Lieu</span><br /><span className="font-semibold text-slate-800">{form.city} — {form.island}</span></div>
                    <div><span className="font-bold text-slate-500 uppercase tracking-wide">Mentors visés</span><br /><span className="font-semibold text-brand-blue">{form.mentors_needed} bénévole{form.mentors_needed > 1 ? 's' : ''} • {form.expected_commitment}</span></div>
                  </div>
                </div>
              </div>

              {/* Charte de publication */}
              <div className="bg-teal-50/70 rounded-2xl border border-teal-200 p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-brand-teal text-sm">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Charte de publication responsable</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  En publiant cette mission, vous vous engagez à ce que les informations soient exactes, que le besoin soit réel et que vous assurerez le suivi du ou des bénévoles recrutés dans un cadre bienveillant, éthique et conforme à la protection des mineurs.
                </p>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.charter_accepted}
                    onChange={e => set('charter_accepted', e.target.checked)}
                    className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal"
                  />
                  <span className="text-xs font-bold text-brand-blue">
                    J'accepte la charte de publication et m'engage à respecter les bénévoles et les règles éthiques de la plateforme. *
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => step === 1 ? navigate('/missions') : setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Retour' : 'Précédent'}</span>
            </button>

            {step < 4 ? (
              <button
                type="button"
                disabled={!canContinue()}
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md transition-all"
              >
                <span>Continuer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !form.charter_accepted}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md transition-all"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publication en cours…</span>
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-4 h-4" />
                    <span>Publier la mission</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
