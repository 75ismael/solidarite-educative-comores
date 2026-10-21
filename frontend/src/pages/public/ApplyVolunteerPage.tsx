import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient, extractResults, formatApiError } from '../../api/client';
import { Subject, PublicMission } from '../../types';
import { HeartHandshake, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ApplyVolunteerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('mission');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [targetMission, setTargetMission] = useState<PublicMission | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    island: 'NGAZIDJA',
    city: '',
    levels_can_teach: 'TOUS',
    selected_subjects: [] as number[],
    languages: 'Français, Shicomori',
    profession_or_studies: '',
    experience: '',
    availabilities: '',
    hours_per_week: 2,
    charter_accepted: false,
  });

  useEffect(() => {
    apiClient.get('/pedagogy/subjects/').then((res) => {
      setSubjects(extractResults<Subject>(res.data));
    });

    if (missionId) {
      apiClient.get<PublicMission>(`/volunteering/missions/${missionId}/`).then((res) => {
        setTargetMission(res.data);
        if (res.data.subject) {
          setForm((prev) => ({
            ...prev,
            selected_subjects: [res.data.subject],
          }));
        }
      });
    }
  }, [missionId]);

  const toggleSubject = (id: number) => {
    setForm((prev) => ({
      ...prev,
      selected_subjects: prev.selected_subjects.includes(id)
        ? prev.selected_subjects.filter((s) => s !== id)
        : [...prev.selected_subjects, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.charter_accepted) {
      setErrorMsg("Vous devez accepter et signer la Charte de protection des mineurs pour postuler.");
      return;
    }

    if (form.selected_subjects.length === 0) {
      setErrorMsg("Veuillez sélectionner au moins une matière d'accompagnement.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Inscription compte utilisateur bénévole
      const regRes = await apiClient.post('/auth/register/', {
        username: form.email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: 'VOLUNTEER',
        phone: form.phone,
        island: form.island,
        city: form.city,
      });

      // 2. Connexion JWT immédiate
      const loginRes = await apiClient.post('/auth/login/', {
        email: form.email,
        password: form.password,
      });

      login(loginRes.data);

      // 3. Mettre à jour profil bénévole & signer la charte
      await apiClient.post('/auth/sign-safeguarding/');
      await apiClient.put('/volunteering/profile/me/', {
        subjects_ids: form.selected_subjects,
        levels_can_teach: form.levels_can_teach,
        languages: form.languages,
        profession_or_studies: form.profession_or_studies,
        experience: form.experience,
        availabilities: form.availabilities,
        hours_per_week: form.hours_per_week,
      });

      // 4. Si mission ciblée, déposer la candidature
      if (missionId) {
        await apiClient.post('/volunteering/applications/', {
          mission: parseInt(missionId),
          motivation: form.experience || "Très motivé pour accompagner cet élève.",
        });
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        formatApiError(
          err,
          "Erreur lors de la création de votre candidature. Veuillez vérifier les informations saisies."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-teal-100 text-brand-teal mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-brand-blue">
          Candidature transmise avec succès !
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Merci pour votre générosité. Notre équipe de coordination va examiner votre profil et vous contacter pour un court échange de bienvenue avant de valider votre premier binôme.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-sm shadow hover:bg-teal-700 transition-colors"
          >
            Accéder à mon espace bénévole
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-brand-teal text-xs font-semibold">
          <HeartHandshake className="w-4 h-4" /> Bénévolat Solidaire Comores
        </div>
        <h1 className="text-3xl font-extrabold text-brand-blue">
          Rejoindre l'équipe des bénévoles
        </h1>
        <p className="text-sm text-slate-600">
          {targetMission ? (
            <span className="font-semibold text-brand-teal">
              Candidature pour la mission : {targetMission.title}
            </span>
          ) : (
            "Partagez vos compétences pour faire progresser un élève aux Comores (en distanciel ou en présentiel)."
          )}
        </p>
      </div>

      {/* BANDEAU PARCOURS BÉNÉVOLE EN 4 ÉTAPES */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-teal mb-3">
          Votre parcours d'accompagnement en 4 étapes
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">1</span>
              <span>Candidature</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Vos coordonnées, matières et disponibilités (formulaire ci-dessous).</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">2</span>
              <span>Charte éthique</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Signature numérique du cadre strict de protection des mineurs.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">3</span>
              <span>Matching</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Court échange d'accueil et association avec un élève compatible.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">4</span>
              <span>Tutorat actif</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Séances régulières et carnet de liaison documenté à chaque cours.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          {(errorMsg.includes('connecter') || errorMsg.includes('déjà associée')) && (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 text-center shadow-xs"
            >
              Se connecter
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Identité */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            1. Vos coordonnées
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse e-mail *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe pour votre compte *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="+269 ... ou +33 ..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Votre localisation *</label>
              <select
                value={form.island}
                onChange={(e) => setForm({ ...form, island: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value="NGAZIDJA">Grande Comore (Ngazidja)</option>
                <option value="NDZUWANI">Anjouan (Ndzuwani)</option>
                <option value="MWALI">Mohéli (Mwali)</option>
                <option value="FRANCE">France (Coordination/Diaspora)</option>
                <option value="AUTRE">Autre pays</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ville / Commune</label>
              <input
                type="text"
                placeholder="Ex: Moroni, Paris, etc."
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Compétences & Matières */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            2. Vos matières & disponibilités
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Matières que vous souhaitez accompagner *
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => {
                const selected = form.selected_subjects.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selected
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-teal'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Niveaux scolaires souhaités</label>
              <select
                value={form.levels_can_teach}
                onChange={(e) => setForm({ ...form, levels_can_teach: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value="TOUS">Tous niveaux (Primaire, Collège, Lycée)</option>
                <option value="PRIMAIRE">Primaire uniquement</option>
                <option value="COLLEGE">Collège uniquement</option>
                <option value="LYCEE">Lycée uniquement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engagement hebdomadaire</label>
              <select
                value={form.hours_per_week}
                onChange={(e) => setForm({ ...form, hours_per_week: parseInt(e.target.value) })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value={1}>1 heure par semaine</option>
                <option value={2}>2 heures par semaine (recommandé)</option>
                <option value={3}>3 à 4 heures par semaine</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vos créneaux de disponibilité
            </label>
            <input
              type="text"
              placeholder="Ex: Samedi matin, Mercredi après-midi, Dimanche soir"
              value={form.availabilities}
              onChange={(e) => setForm({ ...form, availabilities: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Votre parcours & expérience (études, enseignement, etc.)
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Étudiant en Licence de Mathématiques, ou enseignant retraité..."
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Charte de protection des mineurs */}
        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-3">
          <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0" />
            <span>Charte éthique et protection des mineurs</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Je m'engage sur l'honneur à respecter la dignité, la vie privée et la sécurité physique et morale de chaque élève accompagné, à respecter les créneaux convenus et à avertir la coordination de toute difficulté ou absence.
          </p>
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="charter"
              checked={form.charter_accepted}
              onChange={(e) => setForm({ ...form, charter_accepted: e.target.checked })}
              className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal"
            />
            <label htmlFor="charter" className="text-xs font-bold text-brand-blue cursor-pointer">
              J'ai lu et j'accepte sans réserve la charte de conduite et de protection des mineurs. *
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-brand-teal hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow transition-colors"
        >
          {submitting ? "Envoi en cours..." : "Soumettre ma candidature bénévole"}
        </button>
      </form>
    </div>
  );
};
