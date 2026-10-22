import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient, extractResults, formatApiError } from '../../api/client';
import { Subject } from '../../types';
import {
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  GraduationCap,
  MapPin,
  BookMarked,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Wifi,
  Users,
  Lock,
  Phone,
  Mail,
  CalendarDays,
  School,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ─── */
const inputCls =
  'w-full text-sm px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all placeholder:text-slate-400';
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide';
const selectCls =
  'w-full text-sm px-4 py-3 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all appearance-none';

const STEPS = [
  { id: 1, label: 'Votre profil',   icon: User },
  { id: 2, label: "L'élève",        icon: GraduationCap },
  { id: 3, label: 'Les besoins',    icon: BookMarked },
  { id: 4, label: 'Confirmation',   icon: ShieldCheck },
];

const URGENCY_OPTIONS = [
  { value: 'LOW',  label: 'Soutien régulier',        sub: "Accompagnement continu tout au long de l'année", color: 'emerald' },
  { value: 'MEDIUM', label: 'Difficultés notables',  sub: 'Baisse des résultats constatée récemment',        color: 'amber'   },
  { value: 'HIGH', label: 'Risque de décrochage',    sub: 'Situation préoccupante nécessitant une prise en charge rapide', color: 'orange' },
  { value: 'EXAM', label: 'Urgence Examen',           sub: 'Préparation Brevet, Bac ou concours imminent',   color: 'rose'    },
];

const FORMAT_OPTIONS = [
  { value: 'EITHER',    label: 'Au choix',      sub: 'Présentiel ou à distance selon disponibilités', icon: Users },
  { value: 'REMOTE',    label: 'À distance',    sub: 'Visio / WhatsApp / appels', icon: Wifi },
  { value: 'IN_PERSON', label: 'En présentiel', sub: 'Cours physiques uniquement', icon: MapPin },
];

export const RequestSupportPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    parent_first_name: '',
    parent_last_name: '',
    parent_email: '',
    parent_password: '',
    parent_phone: '',
    student_first_name: '',
    student_last_name_initial: '',
    birth_year: 2012,
    school_level: 'COLLEGE',
    grade: '',
    island: 'NGAZIDJA',
    city: '',
    school_name: '',
    selected_subjects: [] as number[],
    difficulties_description: '',
    pedagogical_goals: '',
    format_preference: 'EITHER',
    availabilities: '',
    urgency: 'MEDIUM',
    parental_consent: false,
  });

  useEffect(() => {
    apiClient.get('/pedagogy/subjects/').then((res) => {
      const list = extractResults<Subject>(res.data);
      setSubjects(list);
    });

    if (user) {
      setForm((prev) => ({
        ...prev,
        parent_first_name: user.first_name,
        parent_last_name: user.last_name,
        parent_email: user.email,
        parent_phone: user.phone || '',
        island: user.island,
        city: user.city || '',
      }));
    }
  }, [user]);

  const set = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSubject = (id: number) => {
    set(
      'selected_subjects',
      form.selected_subjects.includes(id)
        ? form.selected_subjects.filter((s) => s !== id)
        : [...form.selected_subjects, id]
    );
  };

  /* Step validation */
  const canNext = (): boolean => {
    if (step === 1 && !user) {
      return (
        form.parent_first_name.trim() !== '' &&
        form.parent_last_name.trim() !== '' &&
        form.parent_email.includes('@') &&
        form.parent_password.length >= 6 &&
        form.parent_phone.trim() !== ''
      );
    }
    if (step === 2) {
      return (
        form.student_first_name.trim() !== '' &&
        form.student_last_name_initial.trim() !== '' &&
        form.grade.trim() !== '' &&
        form.city.trim() !== ''
      );
    }
    if (step === 3) {
      return (
        form.selected_subjects.length > 0 &&
        form.difficulties_description.trim().length >= 20
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.parental_consent) {
      setErrorMsg("L'autorisation parentale est indispensable pour inscrire un élève mineur.");
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      if (!user) {
        await apiClient.post('/auth/register/', {
          username: form.parent_email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
          email: form.parent_email,
          password: form.parent_password,
          first_name: form.parent_first_name,
          last_name: form.parent_last_name,
          role: 'PARENT',
          phone: form.parent_phone,
          island: form.island,
          city: form.city,
        });
        const loginRes = await apiClient.post('/auth/login/', {
          email: form.parent_email,
          password: form.parent_password,
        });
        login(loginRes.data);
      }

      const studentRes = await apiClient.post('/pedagogy/students/', {
        first_name: form.student_first_name,
        last_name_initial: form.student_last_name_initial.toUpperCase().slice(0, 1) + '.',
        birth_year: form.birth_year,
        school_level: form.school_level,
        grade: form.grade,
        island: form.island,
        city: form.city,
        school_name: form.school_name,
        parental_consent_granted: true,
      });

      const newStudent = studentRes.data;
      setGeneratedCode(newStudent.anonymous_code);

      await apiClient.post('/pedagogy/requests/', {
        student: newStudent.id,
        subjects_ids: form.selected_subjects,
        difficulties_description: form.difficulties_description,
        pedagogical_goals: form.pedagogical_goals,
        format_preference: form.format_preference,
        availabilities: form.availabilities,
        urgency: form.urgency,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(formatApiError(err, "Une erreur est survenue. Veuillez vérifier les informations."));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Écran de succès ── */
  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-brand-teal flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue">
              Demande enregistrée !
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Le dossier de votre enfant a bien été transmis à notre équipe de coordination.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Identifiant confidentiel du dossier
            </p>
            <p className="text-2xl font-mono font-extrabold text-brand-blue tracking-widest bg-white border border-slate-200 rounded-xl py-3 px-4">
              {generatedCode}
            </p>
            <p className="text-xs text-slate-500">
              Conservez ce code. Il protège l'identité de votre enfant et permet de suivre son dossier.
            </p>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs font-bold text-brand-blue">Ce qui se passe maintenant :</p>
            <div className="space-y-1.5">
              {[
                'Notre équipe examine votre dossier sous 48h',
                'Un bénévole qualifié vous est proposé',
                'Vous recevez les détails par email ou WhatsApp',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-4 h-4 rounded-full bg-brand-teal text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-sm shadow transition-colors"
          >
            Accéder à mon espace famille
          </button>
        </div>
      </div>
    );
  }

  /* ── Page principale ── */
  return (
    <div className="bg-brand-light min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-brand-blue via-slate-800 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-8 h-8 text-teal-300" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                <Lock className="w-3 h-3" />
                Formulaire sécurisé · Soutien 100% gratuit · Confidentiel
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Demander un accompagnement scolaire
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                Inscrivez votre enfant pour bénéficier d'un soutien scolaire bénévole et gratuit aux Comores.
                Notre équipe vous attribue un tuteur qualifié sous 48h.
              </p>
            </div>
          </div>

          {/* Parcours 4 étapes */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: User,          label: 'Demande',        sub: 'Formulaire & profil' },
              { icon: Lock,          label: 'Code anonymisé', sub: 'Protection identité' },
              { icon: Users,         label: 'Attribution',    sub: 'Bénévole qualifié' },
              { icon: CalendarDays,  label: 'Cours & Suivi',  sub: 'Séances régulières' },
            ].map((item, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${i === 0 ? 'bg-teal-500/20 border-teal-400/40' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${i === 0 ? 'bg-teal-400 text-white' : 'bg-white/20 text-white/70'}`}>
                    {i + 1}
                  </span>
                  <span className={`text-xs font-bold ${i === 0 ? 'text-teal-300' : 'text-white/80'}`}>{item.label}</span>
                </div>
                <p className="text-[11px] text-white/50 leading-snug">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white border-b border-slate-200 rounded-b-2xl shadow-sm px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = step === s.id;
              const done = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      done ? 'bg-brand-teal text-white' : active ? 'bg-brand-blue text-white shadow-md' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`hidden sm:block text-xs font-bold transition-colors ${
                      active ? 'text-brand-blue' : done ? 'text-brand-teal' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all ${done ? 'bg-brand-teal' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Contenu du formulaire ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            {(errorMsg.includes('connecter') || errorMsg.includes('associée')) && (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 text-center"
              >
                Se connecter
              </Link>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* ────────────────── ÉTAPE 1 : Profil parent ────────────────── */}
          {step === 1 && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Votre profil</h2>
                  <p className="text-xs text-slate-500">Informations du parent ou responsable légal</p>
                </div>
              </div>

              {user ? (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-blue">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-slate-500">{user.email} · Compte connecté</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-brand-teal ml-auto shrink-0" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>Un compte sera créé pour vous permettre de suivre le dossier de votre enfant.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Prénom *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" required placeholder="Votre prénom"
                          value={form.parent_first_name} onChange={(e) => set('parent_first_name', e.target.value)}
                          className={inputCls + ' pl-10'} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Nom *</label>
                      <input type="text" required placeholder="Votre nom de famille"
                        value={form.parent_last_name} onChange={(e) => set('parent_last_name', e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Adresse e-mail *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" required placeholder="votre@email.com"
                          value={form.parent_email} onChange={(e) => set('parent_email', e.target.value)}
                          className={inputCls + ' pl-10'} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Mot de passe (pour suivre le dossier) *</label>
                      <input type="password" required minLength={6} placeholder="Minimum 6 caractères"
                        value={form.parent_password} onChange={(e) => set('parent_password', e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Téléphone / WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required placeholder="+269 321 00 00"
                        value={form.parent_phone} onChange={(e) => set('parent_phone', e.target.value)}
                        className={inputCls + ' pl-10'} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Nous vous contacterons via ce numéro pour organiser les séances.</p>
                  </div>

                  <div className="pt-2 text-center text-xs text-slate-500">
                    Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="text-brand-teal font-semibold hover:underline">
                      Se connecter
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── ÉTAPE 2 : L'élève ────────────────── */}
          {step === 2 && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Informations sur l'élève</h2>
                  <p className="text-xs text-slate-500">Le prénom suffit — l'identité reste anonymisée dans notre système</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Prénom de l'élève *</label>
                  <input type="text" required placeholder="Prénom uniquement"
                    value={form.student_first_name} onChange={(e) => set('student_first_name', e.target.value)}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Initiale du nom *</label>
                  <input type="text" required maxLength={2} placeholder="Ex : M"
                    value={form.student_last_name_initial} onChange={(e) => set('student_last_name_initial', e.target.value)}
                    className={inputCls} />
                  <p className="text-[11px] text-slate-400 mt-1">Une seule lettre pour protéger son identité.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Niveau scolaire *</label>
                  <select value={form.school_level} onChange={(e) => set('school_level', e.target.value)} className={selectCls}>
                    <option value="PRIMAIRE">Primaire</option>
                    <option value="COLLEGE">Collège</option>
                    <option value="LYCEE">Lycée</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Classe *</label>
                  <input type="text" required placeholder="Ex : CM2, 3ème, Terminale"
                    value={form.grade} onChange={(e) => set('grade', e.target.value)}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Année de naissance</label>
                  <input type="number" min={2004} max={2020}
                    value={form.birth_year} onChange={(e) => set('birth_year', parseInt(e.target.value))}
                    className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Île de résidence *</label>
                  <select value={form.island} onChange={(e) => set('island', e.target.value)} className={selectCls}>
                    <option value="NGAZIDJA">Grande Comore (Ngazidja)</option>
                    <option value="NDZUWANI">Anjouan (Ndzuwani)</option>
                    <option value="MWALI">Mohéli (Mwali)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ville / Village *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="Ex : Moroni, Mutsamudu…"
                      value={form.city} onChange={(e) => set('city', e.target.value)}
                      className={inputCls + ' pl-10'} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>École fréquentée (optionnel)</label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Nom de l'établissement scolaire"
                    value={form.school_name} onChange={(e) => set('school_name', e.target.value)}
                    className={inputCls + ' pl-10'} />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── ÉTAPE 3 : Besoins ────────────────── */}
          {step === 3 && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Besoins pédagogiques</h2>
                  <p className="text-xs text-slate-500">Matières, difficultés et disponibilités</p>
                </div>
              </div>

              {/* Matières */}
              <div>
                <label className={labelCls}>Matières nécessitant un soutien * <span className="normal-case font-normal text-slate-400">(plusieurs choix possibles)</span></label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => {
                    const selected = form.selected_subjects.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          selected
                            ? 'bg-brand-blue text-white border-brand-blue shadow-sm scale-[1.03]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-teal hover:text-brand-teal'
                        }`}>
                        {selected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficultés */}
              <div>
                <label className={labelCls}>Difficultés précises de l'élève * <span className="normal-case font-normal text-slate-400">(min. 20 caractères)</span></label>
                <textarea required rows={4}
                  placeholder="Ex : Difficultés à résoudre des équations du 2nd degré, blocage en rédaction, méthode de révision inefficace…"
                  value={form.difficulties_description} onChange={(e) => set('difficulties_description', e.target.value)}
                  className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all placeholder:text-slate-400 resize-none" />
                <div className="flex justify-between mt-1">
                  <p className="text-[11px] text-slate-400">Soyez précis — cela aide le bénévole à mieux préparer ses séances.</p>
                  <span className={`text-[11px] font-mono ${form.difficulties_description.length < 20 ? 'text-rose-400' : 'text-emerald-500'}`}>
                    {form.difficulties_description.length}/20
                  </span>
                </div>
              </div>

              {/* Objectifs */}
              <div>
                <label className={labelCls}>Objectifs pédagogiques <span className="normal-case font-normal text-slate-400">(optionnel)</span></label>
                <textarea rows={2}
                  placeholder="Ex : Remonter la moyenne en maths à 12/20, préparer l'épreuve de français du Brevet…"
                  value={form.pedagogical_goals} onChange={(e) => set('pedagogical_goals', e.target.value)}
                  className="w-full text-sm p-4 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all placeholder:text-slate-400 resize-none" />
              </div>

              {/* Format */}
              <div>
                <label className={labelCls}>Format de cours préféré</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FORMAT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const sel = form.format_preference === opt.value;
                    return (
                      <button key={opt.value} type="button" onClick={() => set('format_preference', opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          sel ? 'border-brand-teal bg-teal-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className={`w-4 h-4 ${sel ? 'text-brand-teal' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold ${sel ? 'text-brand-teal' : 'text-slate-700'}`}>{opt.label}</span>
                          {sel && <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal ml-auto" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgence */}
              <div>
                <label className={labelCls}>Situation de l'élève</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {URGENCY_OPTIONS.map((opt) => {
                    const sel = form.urgency === opt.value;
                    const colors: Record<string, string> = {
                      emerald: 'border-emerald-400 bg-emerald-50',
                      amber:   'border-amber-400 bg-amber-50',
                      orange:  'border-orange-400 bg-orange-50',
                      rose:    'border-rose-400 bg-rose-50',
                    };
                    const textColors: Record<string, string> = {
                      emerald: 'text-emerald-700',
                      amber:   'text-amber-700',
                      orange:  'text-orange-700',
                      rose:    'text-rose-700',
                    };
                    return (
                      <button key={opt.value} type="button" onClick={() => set('urgency', opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          sel ? colors[opt.color] : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${sel ? textColors[opt.color] : 'text-slate-700'}`}>{opt.label}</span>
                          {sel && <CheckCircle2 className={`w-3.5 h-3.5 ${textColors[opt.color]}`} />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disponibilités */}
              <div>
                <label className={labelCls}>Créneaux de disponibilité <span className="normal-case font-normal text-slate-400">(optionnel)</span></label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea rows={2}
                    placeholder="Ex : Mercredi après-midi, Samedi matin, les soirs après 18h…"
                    value={form.availabilities} onChange={(e) => set('availabilities', e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all placeholder:text-slate-400 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── ÉTAPE 4 : Confirmation ────────────────── */}
          {step === 4 && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Récapitulatif & Consentement</h2>
                  <p className="text-xs text-slate-500">Vérifiez les informations avant d'envoyer</p>
                </div>
              </div>

              {/* Récap */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden text-sm">
                {[
                  {
                    icon: User, label: 'Responsable légal',
                    value: user
                      ? `${user.first_name} ${user.last_name} (connecté)`
                      : `${form.parent_first_name} ${form.parent_last_name} · ${form.parent_email}`
                  },
                  {
                    icon: GraduationCap, label: 'Élève',
                    value: `${form.student_first_name} ${form.student_last_name_initial.toUpperCase()}.  ·  ${form.grade}  ·  ${form.school_level}`
                  },
                  {
                    icon: MapPin, label: 'Localisation',
                    value: `${form.city}, ${form.island === 'NGAZIDJA' ? 'Grande Comore' : form.island === 'NDZUWANI' ? 'Anjouan' : 'Mohéli'}`
                  },
                  {
                    icon: BookMarked, label: 'Matières',
                    value: form.selected_subjects.length > 0
                      ? subjects.filter(s => form.selected_subjects.includes(s.id)).map(s => s.name).join(', ')
                      : 'Aucune matière sélectionnée'
                  },
                  {
                    icon: Wifi, label: 'Format',
                    value: FORMAT_OPTIONS.find(f => f.value === form.format_preference)?.label || ''
                  },
                  {
                    icon: Sparkles, label: 'Situation',
                    value: URGENCY_OPTIONS.find(u => u.value === form.urgency)?.label || ''
                  },
                ].map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-[120px] text-xs font-bold text-slate-500">{row.label}</div>
                      <div className="text-xs text-slate-800 flex-1">{row.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Consentement */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50/50 border border-cyan-200 space-y-4">
                <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0" />
                  <span>Consentement parental légal (F14)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  En tant que parent ou représentant légal, j'autorise expressément l'inscription de l'élève sur
                  la plateforme, l'échange avec le bénévole désigné dans le cadre des séances scolaires encadrées
                  et l'analyse pédagogique par l'équipe de coordination. Les données sont traitées conformément
                  au cadre de protection des mineurs de l'association.
                </p>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    form.parental_consent ? 'bg-brand-teal border-brand-teal' : 'border-slate-300 group-hover:border-brand-teal'
                  }`}
                    onClick={() => set('parental_consent', !form.parental_consent)}>
                    {form.parental_consent && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={form.parental_consent}
                    onChange={(e) => set('parental_consent', e.target.checked)} />
                  <span className="text-xs font-bold text-brand-blue leading-relaxed">
                    Je confirme être le représentant légal de l'élève et donne mon consentement éclairé pour son inscription et son suivi pédagogique. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ── Footer navigation ── */}
          <div className="px-6 sm:px-10 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => { setErrorMsg(''); setStep(step - 1); }}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>

            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id} className={`h-1.5 rounded-full transition-all ${
                  s.id === step ? 'w-6 bg-brand-blue' : s.id < step ? 'w-2 bg-brand-teal' : 'w-2 bg-slate-200'
                }`} />
              ))}
            </div>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setStep(step + 1); }}
                disabled={!canNext()}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuer
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !form.parental_consent}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Envoyer la demande
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
