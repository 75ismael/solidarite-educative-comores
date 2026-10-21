import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient, extractResults, formatApiError } from '../../api/client';
import { Subject } from '../../types';
import { BookOpen, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RequestSupportPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    // Données parent / compte (si non connecté)
    parent_first_name: '',
    parent_last_name: '',
    parent_email: '',
    parent_password: '',
    parent_phone: '',
    // Données élève
    student_first_name: '',
    student_last_name_initial: '',
    birth_year: 2012,
    school_level: 'COLLEGE',
    grade: '3ème',
    island: 'NGAZIDJA',
    city: 'Moroni',
    school_name: '',
    // Données besoin de soutien
    selected_subjects: [] as number[],
    difficulties_description: '',
    pedagogical_goals: '',
    format_preference: 'EITHER',
    availabilities: 'Mercredi après-midi et Samedi',
    urgency: 'MEDIUM',
    parental_consent: false,
  });

  useEffect(() => {
    apiClient.get('/pedagogy/subjects/').then((res) => {
      const list = extractResults<Subject>(res.data);
      setSubjects(list);
      if (list.length > 0) {
        setForm((prev) => ({ ...prev, selected_subjects: [list[0].id] }));
      }
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

    if (!form.parental_consent) {
      setErrorMsg("L'autorisation parentale est indispensable pour inscrire un élève mineur.");
      return;
    }

    if (form.selected_subjects.length === 0) {
      setErrorMsg("Veuillez choisir au moins une matière nécessitant un soutien.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Si utilisateur non connecté, créer le compte parent
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

      // 2. Créer le dossier élève avec consentement
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

      // 3. Créer la demande de soutien F03
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
      console.error(err);
      setErrorMsg(
        formatApiError(
          err,
          "Une erreur est survenue lors de l'enregistrement de la demande. Veuillez vérifier les informations."
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
          Demande d'accompagnement enregistrée !
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Le dossier de votre enfant a reçu l'identifiant confidentiel :{' '}
          <strong className="text-brand-blue font-mono bg-slate-100 px-2 py-0.5 rounded">
            {generatedCode}
          </strong>
          . Notre équipe de coordination va examiner les besoins et vous proposer un bénévole qualifié.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-sm shadow hover:bg-teal-700 transition-colors"
          >
            Accéder à mon espace famille
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-brand-blue text-xs font-semibold">
          <BookOpen className="w-4 h-4" /> Formulaire officiel de demande (F02, F03)
        </div>
        <h1 className="text-3xl font-extrabold text-brand-blue">
          Demander un accompagnement scolaire
        </h1>
        <p className="text-sm text-slate-600">
          Ce formulaire permet aux parents ou représentants légaux d'inscrire un élève aux Comores pour bénéficier d'un soutien scolaire bénévole gratuit.
        </p>
      </div>

      {/* BANDEAU PARCOURS BÉNÉFICIAIRE EN 4 ÉTAPES */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-3">
          Le parcours de votre enfant en 4 étapes
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-950">
              <span className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">1</span>
              <span>Demande</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Formulaire d'inscription : niveau, matières et créneaux (ci-dessous).</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">2</span>
              <span>Code anonymisé</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Génération d'un code confidentiel protégeant l'identité de l'élève.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">3</span>
              <span>Attribution tuteur</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Sélection d'un bénévole qualifié par notre équipe pédagogique.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">4</span>
              <span>Cours & Suivi</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">Séances régulières et suivi des notes dans le carnet de liaison.</p>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Section 1 : Parent ou Référent légal */}
        {!user && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
              1. Informations sur le parent ou responsable légal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Votre prénom *</label>
                <input
                  type="text"
                  required
                  value={form.parent_first_name}
                  onChange={(e) => setForm({ ...form, parent_first_name: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Votre nom *</label>
                <input
                  type="text"
                  required
                  value={form.parent_last_name}
                  onChange={(e) => setForm({ ...form, parent_last_name: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Votre e-mail *</label>
                <input
                  type="email"
                  required
                  value={form.parent_email}
                  onChange={(e) => setForm({ ...form, parent_email: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe pour suivre le dossier *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.parent_password}
                  onChange={(e) => setForm({ ...form, parent_password: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de téléphone / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="+269 ... pour vous contacter"
                value={form.parent_phone}
                onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Section 2 : Informations sur l'Élève */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            2. Informations sur l'élève
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom de l'élève *</label>
              <input
                type="text"
                required
                value={form.student_first_name}
                onChange={(e) => setForm({ ...form, student_first_name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initiale du nom de famille *</label>
              <input
                type="text"
                required
                maxLength={2}
                placeholder="Ex: M"
                value={form.student_last_name_initial}
                onChange={(e) => setForm({ ...form, student_last_name_initial: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Niveau scolaire *</label>
              <select
                value={form.school_level}
                onChange={(e) => setForm({ ...form, school_level: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value="PRIMAIRE">Primaire</option>
                <option value="COLLEGE">Collège</option>
                <option value="LYCEE">Lycée</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classe actuelle *</label>
              <input
                type="text"
                required
                placeholder="Ex: CM2, 3ème, Seconde..."
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Année de naissance</label>
              <input
                type="number"
                min="2004"
                max="2020"
                value={form.birth_year}
                onChange={(e) => setForm({ ...form, birth_year: parseInt(e.target.value) })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Île de résidence *</label>
              <select
                value={form.island}
                onChange={(e) => setForm({ ...form, island: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value="NGAZIDJA">Grande Comore (Ngazidja)</option>
                <option value="NDZUWANI">Anjouan (Ndzuwani)</option>
                <option value="MWALI">Mohéli (Mwali)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ville / Village *</label>
              <input
                type="text"
                required
                placeholder="Ex: Moroni, Mutsamudu..."
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3 : Besoins pédagogiques */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2">
            3. Matières & Difficultés observées
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Matières nécessitant un accompagnement *
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Difficultés précises rencontrées par l'élève *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Difficultés à résoudre des équations, lenteur en calcul, méthode de révision..."
              value={form.difficulties_description}
              onChange={(e) => setForm({ ...form, difficulties_description: e.target.value })}
              className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format préféré</label>
              <select
                value={form.format_preference}
                onChange={(e) => setForm({ ...form, format_preference: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value="EITHER">Au choix (présentiel ou à distance)</option>
                <option value="REMOTE">À distance (visio / WhatsApp)</option>
                <option value="IN_PERSON">En présentiel uniquement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degré d'urgence</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-brand-teal focus:outline-none"
              >
                <option value="LOW">Soutien continu régulier</option>
                <option value="MEDIUM">Difficultés notables constatées</option>
                <option value="HIGH">Risque de décrochage scolaire</option>
                <option value="EXAM">Urgence Examen (Brevet, Bac)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4 : Autorisation parentale obligatoire */}
        <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 space-y-3">
          <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0" />
            <span>Consentement parental légal (F14)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            En tant que parent ou représentant légal, j'autorise expressément l'inscription de l'élève sur la plateforme, l'échange avec le bénévole désigné dans le cadre des séances scolaires encadrées et l'analyse pédagogique par l'équipe de coordination.
          </p>
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="parentalConsent"
              checked={form.parental_consent}
              onChange={(e) => setForm({ ...form, parental_consent: e.target.checked })}
              className="mt-0.5 rounded text-brand-teal focus:ring-brand-teal"
            />
            <label htmlFor="parentalConsent" className="text-xs font-bold text-brand-blue cursor-pointer">
              Je confirme être le représentant légal de l'élève et donne mon consentement éclairé. *
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-brand-teal hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow transition-colors"
        >
          {submitting ? "Validation en cours..." : "Valider et transmettre la demande d'accompagnement"}
        </button>
      </form>
    </div>
  );
};
