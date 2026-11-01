import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiClient, extractResults, formatApiError } from '../../api/client';
import { Subject, PublicMission, VolunteerProfile, DEFAULT_SUBJECTS } from '../../types';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  ArrowRight,
  LogOut,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const COMMON_LANGUAGES = ['Français', 'Shicomori', 'Arabe', 'Anglais', 'Malgache'];

export const ApplyVolunteerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('mission');
  const { user, login, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [targetMission, setTargetMission] = useState<PublicMission | null>(null);
  const [, setLoadingMission] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState<{ id: number; status_display?: string; status: string } | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    island: 'NGAZIDJA',
    city: '',
    levels_can_teach: 'TOUS' as 'PRIMAIRE' | 'COLLEGE' | 'LYCEE' | 'TOUS',
    selected_subjects: [] as number[],
    languages: 'Français, Shicomori',
    profession_or_studies: '',
    experience: '',
    availabilities: '',
    hours_per_week: 2,
    mission_motivation: '',
    charter_accepted: false,
  });

  // Charger la liste des matières disponibles
  useEffect(() => {
    apiClient
      .get('/pedagogy/subjects/')
      .then((res) => {
        const fetched = extractResults<Subject>(res.data);
        if (fetched && fetched.length > 0) {
          setSubjects((prev) => {
            const map = new Map<number, Subject>();
            prev.forEach((s) => map.set(s.id, s));
            fetched.forEach((s) => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => {
        console.warn('Impossible de charger les matières distantes, maintien des matières par défaut', err);
      });
  }, []);

  // Charger la mission cible si spécifiée dans l'URL
  useEffect(() => {
    if (missionId) {
      setLoadingMission(true);
      apiClient
        .get<PublicMission>(`/volunteering/missions/${missionId}/`)
        .then((res) => {
          setTargetMission(res.data);
          if (res.data.subject) {
            setSubjects((prev) => {
              if (!prev.some((s) => s.id === res.data.subject)) {
                return [
                  ...prev,
                  {
                    id: res.data.subject,
                    name: res.data.subject_name || 'Matière ciblée',
                    category: 'Mission',
                    is_active: true,
                  },
                ];
              }
              return prev;
            });
            setForm((prev) => {
              if (!prev.selected_subjects.includes(res.data.subject)) {
                return {
                  ...prev,
                  selected_subjects: [...prev.selected_subjects, res.data.subject],
                };
              }
              return prev;
            });
          }
        })
        .catch((err) => {
          console.warn('Mission non trouvée ou indisponible', err);
        })
        .finally(() => {
          setLoadingMission(false);
        });
    }
  }, [missionId]);

  // Si l'utilisateur est connecté, préremplir ses données et charger son profil bénévole existant
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        first_name: prev.first_name || user.first_name || '',
        last_name: prev.last_name || user.last_name || '',
        email: user.email || '',
        phone: prev.phone || user.phone || '',
        island: prev.island || user.island || 'NGAZIDJA',
        city: prev.city || user.city || '',
        charter_accepted: user.safeguarding_signed ? true : prev.charter_accepted,
      }));

      // Charger le profil bénévole existant pour préremplir le formulaire
      apiClient
        .get<VolunteerProfile>('/volunteering/profile/me/')
        .then((res) => {
          const prof = res.data;
          if (prof) {
            setForm((prev) => ({
              ...prev,
              selected_subjects:
                prev.selected_subjects.length > 0
                  ? prev.selected_subjects
                  : prof.subjects || [],
              levels_can_teach: (prof.levels_can_teach as any) || prev.levels_can_teach,
              languages: prof.languages || prev.languages,
              profession_or_studies: prof.profession_or_studies || prev.profession_or_studies,
              experience: prof.experience || prev.experience,
              availabilities: prof.availabilities || prev.availabilities,
              hours_per_week: prof.hours_per_week || prev.hours_per_week,
            }));
          }
        })
        .catch(() => {
          // Nouveau profil bénévole, aucune donnée préalable
        });

      // Si mission spécifiée, vérifier si déjà candidaté
      if (missionId) {
        apiClient
          .get<any[]>('/volunteering/applications/')
          .then((res) => {
            const apps = extractResults<{ id: number; mission: number; status_display?: string; status: string }>(res.data);
            const existing = apps.find((a) => a.mission === parseInt(missionId));
            if (existing) {
              setAlreadyApplied(existing);
            }
          })
          .catch(() => {});
      }
    }
  }, [user, missionId]);

  const toggleSubject = (subjectId: number) => {
    setForm((prev) => {
      const exists = prev.selected_subjects.includes(subjectId);
      return {
        ...prev,
        selected_subjects: exists
          ? prev.selected_subjects.filter((id) => id !== subjectId)
          : [...prev.selected_subjects, subjectId],
      };
    });
  };

  const handleToggleLanguage = (lang: string) => {
    setForm((prev) => {
      const current = prev.languages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      let updated: string[];
      if (current.includes(lang)) {
        updated = current.filter((l) => l !== lang);
      } else {
        updated = [...current, lang];
      }
      return { ...prev, languages: updated.join(', ') };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations préalables
    if (!form.charter_accepted) {
      setErrorMsg('Vous devez accepter et signer la Charte de protection des mineurs pour vous engager comme bénévole.');
      return;
    }

    if (form.selected_subjects.length === 0) {
      setErrorMsg("Veuillez sélectionner au moins une matière d'accompagnement.");
      return;
    }

    if (!form.availabilities.trim()) {
      setErrorMsg('Veuillez renseigner vos créneaux de disponibilité (ex: Samedi matin, Mercredi soir).');
      return;
    }

    if (!user && form.password.length < 6) {
      setErrorMsg('Votre mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      if (!user) {
        // 1. Inscription nouveau compte bénévole
        const emailTrimmed = form.email.trim().toLowerCase();
        await apiClient.post('/auth/register/', {
          username: emailTrimmed.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
          email: emailTrimmed,
          password: form.password,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          role: 'VOLUNTEER',
          phone: form.phone.trim(),
          island: form.island,
          city: form.city.trim(),
        });

        // 2. Connexion JWT immédiate
        const loginRes = await apiClient.post('/auth/login/', {
          email: emailTrimmed,
          password: form.password,
        });

        login(loginRes.data);
      } else {
        // 1b. Utilisateur déjà connecté : mise à jour de ses coordonnées personnelles
        const updatePayload: Record<string, any> = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          island: form.island,
          city: form.city.trim(),
        };

        // Si l'utilisateur n'est pas encore un rôle d'administration ou bénévole, on l'active en VOLUNTEER
        if (!['VOLUNTEER', 'COORDINATOR', 'ADMIN', 'SAFEGUARDING_OFFICER'].includes(user.role)) {
          updatePayload.role = 'VOLUNTEER';
        }

        try {
          const userRes = await apiClient.patch('/auth/me/', updatePayload);
          updateUser(userRes.data);
        } catch (uErr) {
          console.warn('Mise à jour coordonnées utilisateur non bloquante', uErr);
        }
      }

      // 3. Signature numérique de la charte de protection des mineurs
      try {
        await apiClient.post('/auth/sign-safeguarding/');
      } catch (charterErr) {
        console.warn('Charte déjà signée ou validée', charterErr);
      }

      // 4. Mettre à jour le profil bénévole complet
      await apiClient.put('/volunteering/profile/me/', {
        subjects_ids: form.selected_subjects,
        levels_can_teach: form.levels_can_teach,
        languages: form.languages.trim() || 'Français, Shicomori',
        profession_or_studies: form.profession_or_studies.trim(),
        experience: form.experience.trim(),
        availabilities: form.availabilities.trim(),
        hours_per_week: form.hours_per_week,
      });

      // 5. Si mission ciblée, déposer la candidature à la mission
      if (missionId && !alreadyApplied) {
        try {
          await apiClient.post('/volunteering/applications/', {
            mission: parseInt(missionId),
            motivation:
              form.mission_motivation.trim() ||
              form.experience.trim() ||
              'Très motivé pour accompagner cet élève sur cette mission.',
          });
        } catch (appErr: any) {
          console.warn('Candidature déjà existante ou note de validation', appErr);
        }
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Erreur soumission candidature bénévole:', err);
      setErrorMsg(
        formatApiError(
          err,
          "Erreur lors de l'enregistrement de votre candidature. Veuillez vérifier les informations saisies."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Écran de succès ───
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 text-slate-100">
        <div className="w-20 h-20 rounded-3xl bg-purple-600/20 border border-purple-500/40 text-purple-400 mx-auto flex items-center justify-center shadow-lg shadow-purple-900/30">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Candidature enregistrée avec succès
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bienvenue dans l'équipe des bénévoles !
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
            Merci infiniment pour votre engagement solidaire au service de la réussite des élèves comoriens. Votre candidature a été transmise à notre équipe de coordination.
          </p>
        </div>

        {targetMission && (
          <div className="p-4 rounded-2xl bg-[#140F2D] border border-purple-500/30 text-left text-xs space-y-1.5 max-w-lg mx-auto">
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">
              Mission sollicitée :
            </span>
            <div className="text-sm font-bold text-white">{targetMission.title}</div>
            <div className="text-slate-400">
              {targetMission.island} • {targetMission.subject_name} • {targetMission.format_display}
            </div>
          </div>
        )}

        {/* Prochaines étapes */}
        <div className="bg-[#140F2D] border border-[#281F4B] rounded-2xl p-5 text-left space-y-3 max-w-lg mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Les prochaines étapes :
          </div>
          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <span><strong>Examen de votre profil</strong> par le coordinateur pédagogique sous 48h à 72h.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <span><strong>Court entretien de bienvenue</strong> (téléphone ou WhatsApp) pour faire connaissance et cadrer l'accompagnement.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <span><strong>Mise en relation avec votre élève</strong> et accès direct à votre tableau de bord tuteur.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 transition-colors flex items-center justify-center gap-2"
          >
            <span>Accéder à mon espace bénévole</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/missions"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#140F2D] hover:bg-[#1C163D] border border-[#281F4B] text-slate-300 hover:text-white font-semibold text-sm transition-colors text-center"
          >
            Consulter les autres missions
          </Link>
        </div>
      </div>
    );
  }

  const currentLanguagesList = form.languages
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const loginRedirectUrl = `/login?redirect=${encodeURIComponent(
    `/devenir-benevole${missionId ? `?mission=${missionId}` : ''}`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-slate-100">
      {/* En-tête */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
          <HeartHandshake className="w-4 h-4 text-purple-400" /> Bénévolat Solidaire Comores
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Rejoindre l'équipe des bénévoles
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          Donnez de votre temps et partagez vos compétences pour faire progresser un élève aux Comores, en distanciel ou sur le terrain. 1 à 2 heures par semaine suffisent pour transformer un parcours scolaire.
        </p>
      </div>

      {/* Si mission ciblée, encart récapitulatif */}
      {targetMission && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C133A] to-[#140F2D] border border-purple-500/40 space-y-3 shadow-lg">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
              <Sparkles className="w-3 h-3 text-purple-300" /> Candidature ciblée pour cette mission
            </span>
            <Link
              to={`/missions/${targetMission.id}`}
              className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 font-semibold"
            >
              Voir la fiche détaillée <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">{targetMission.title}</h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
              {targetMission.description || targetMission.presentation_full}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-[#0E0A20] border border-[#281F4B]">
              📚 Matière : <strong className="text-purple-300">{targetMission.subject_name}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0E0A20] border border-[#281F4B]">
              📍 {targetMission.island} {targetMission.city ? `(${targetMission.city})` : ''}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0E0A20] border border-[#281F4B]">
              💻 {targetMission.format_display}
            </span>
            {targetMission.expected_commitment && (
              <span className="px-2.5 py-1 rounded-lg bg-[#0E0A20] border border-[#281F4B]">
                ⏱️ {targetMission.expected_commitment}
              </span>
            )}
          </div>

          {alreadyApplied && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Vous avez déjà postulé à cette mission (statut : <strong>{alreadyApplied.status_display || alreadyApplied.status}</strong>).
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs shrink-0"
              >
                Mon espace
              </button>
            </div>
          )}
        </div>
      )}

      {/* Si l'utilisateur est déjà connecté, bandeau d'information de compte */}
      {user ? (
        <div className="p-4 rounded-2xl bg-[#140F2D] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
              {(user.first_name || user.username || 'B')[0].toUpperCase()}
            </div>
            <div className="text-xs">
              <div className="text-slate-400">Compte connecté :</div>
              <div className="font-bold text-white text-sm">
                {user.first_name} {user.last_name}{' '}
                <span className="text-purple-300 font-normal">({user.email})</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Rôle actuel : {user.role_display || user.role} • Vos informations sont pré-remplies
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E0A20] hover:bg-[#1A133A] border border-[#281F4B] text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors self-start sm:self-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Changer de compte</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#140F2D] border border-[#281F4B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Vous avez déjà un compte bénévole ou membre sur la plateforme ?</span>
          </div>
          <Link
            to={loginRedirectUrl}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 text-center shadow-xs transition-colors"
          >
            Se connecter
          </Link>
        </div>
      )}

      {/* BANDEAU PARCOURS BÉNÉVOLE EN 4 ÉTAPES */}
      <div className="bg-[#140F2D] border border-[#281F4B] rounded-2xl p-4 sm:p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
          Votre parcours d'accompagnement en 4 étapes
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-200">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[11px] font-extrabold shrink-0">1</span>
              <span>Candidature</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Vos coordonnées, matières et disponibilités (formulaire ci-dessous).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0E0A20] border border-[#281F4B] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-5 h-5 rounded-full bg-[#281F4B] text-slate-300 flex items-center justify-center text-[11px] font-extrabold shrink-0">2</span>
              <span>Charte éthique</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Signature numérique du cadre strict de protection des mineurs.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0E0A20] border border-[#281F4B] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-5 h-5 rounded-full bg-[#281F4B] text-slate-300 flex items-center justify-center text-[11px] font-extrabold shrink-0">3</span>
              <span>Matching</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Court échange d'accueil et association avec un élève compatible.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0E0A20] border border-[#281F4B] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="w-5 h-5 rounded-full bg-[#281F4B] text-slate-300 flex items-center justify-center text-[11px] font-extrabold shrink-0">4</span>
              <span>Tutorat actif</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Séances régulières et carnet de liaison documenté à chaque cours.
            </p>
          </div>
        </div>
      </div>

      {/* Message d'erreur s'il y a lieu */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          {(errorMsg.includes('connecter') || errorMsg.includes('déjà associée')) && (
            <Link
              to={loginRedirectUrl}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 text-center shadow-xs transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
      )}

      {/* FORMULAIRE DE CANDIDATURE */}
      <form onSubmit={handleSubmit} className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-6 sm:p-8 shadow-xl space-y-8">
        {/* Section 1 : Coordonnées & Identité */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#281F4B] pb-2.5">
            <UserIcon className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              1. Vos coordonnées personnelles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom *</label>
              <input
                type="text"
                required
                placeholder="Ex: Mohamed"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nom *</label>
              <input
                type="text"
                required
                placeholder="Ex: Ali"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse e-mail *</label>
              <input
                type="email"
                required
                disabled={!!user}
                placeholder="Ex: mohamed.ali@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] rounded-xl focus:border-purple-500 focus:outline-none transition-colors ${
                  user ? 'bg-[#1C163D] text-slate-400 cursor-not-allowed' : 'bg-[#0E0A20] text-white'
                }`}
              />
              {user && (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Liée à votre compte connecté.
                </span>
              )}
            </div>

            {!user ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mot de passe de votre compte *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Au moins 6 caractères"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 pr-10 border border-[#281F4B] bg-[#0E0A20] text-white rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Permettra de vous connecter à votre espace tuteur.
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Statut de connexion
                </label>
                <div className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-purple-500/30 bg-[#1C163D] text-purple-200 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Compte actif et authentifié</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Téléphone / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="+269 ... ou +33 ..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Votre localisation *
              </label>
              <select
                value={form.island}
                onChange={(e) => setForm({ ...form, island: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="NGAZIDJA">Grande Comore (Ngazidja)</option>
                <option value="NDZUWANI">Anjouan (Ndzuwani)</option>
                <option value="MWALI">Mohéli (Mwali)</option>
                <option value="FRANCE">France (Coordination/Diaspora)</option>
                <option value="AUTRE">Autre pays</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ville / Commune *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Moroni, Mutsamudu, Paris..."
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Profession & Langues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Profession / Domaine d'études
              </label>
              <input
                type="text"
                placeholder="Ex: Enseignant, Étudiant en Sciences, Ingénieur, Retraité..."
                value={form.profession_or_studies}
                onChange={(e) => setForm({ ...form, profession_or_studies: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Langues maîtrisées
              </label>
              <input
                type="text"
                placeholder="Ex: Français, Shicomori, Arabe..."
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_LANGUAGES.map((lang) => {
                  const active = currentLanguagesList.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleToggleLanguage(lang)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                        active
                          ? 'bg-purple-600/30 text-purple-200 border-purple-500/50'
                          : 'bg-[#0E0A20] text-slate-400 border-[#281F4B] hover:text-slate-200'
                      }`}
                    >
                      {active ? `✓ ${lang}` : `+ ${lang}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 : Matières & Disponibilités */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#281F4B] pb-2.5">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              2. Vos matières & disponibilités
            </h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="block text-xs font-semibold text-slate-300">
                Matières que vous souhaitez accompagner *
                <span className="text-slate-400 font-normal ml-1.5">(plusieurs choix possibles)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-purple-300 font-medium">
                  {form.selected_subjects.length} sélectionnée(s)
                </span>
                {form.selected_subjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, selected_subjects: [] }))}
                    className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
                {form.selected_subjects.length < subjects.length && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, selected_subjects: subjects.map((s) => s.id) }))}
                    className="text-[11px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    Tout sélectionner
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => {
                const selected = form.selected_subjects.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                      selected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40 ring-1 ring-purple-400 scale-[1.02]'
                        : 'bg-[#0E0A20] text-slate-300 border-[#281F4B] hover:border-purple-500/50 hover:bg-[#150F2C]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                        selected
                          ? 'bg-white text-purple-700'
                          : 'border border-slate-500 bg-transparent text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>

            {form.selected_subjects.length === 0 && (
              <span className="text-[11px] text-amber-400 mt-2 block">
                ⚠️ Veuillez sélectionner au moins une matière d'accompagnement.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Niveaux scolaires souhaités
              </label>
              <select
                value={form.levels_can_teach}
                onChange={(e) => setForm({ ...form, levels_can_teach: e.target.value as any })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="TOUS">Tous niveaux (Primaire, Collège, Lycée)</option>
                <option value="PRIMAIRE">Primaire uniquement (CP à CM2)</option>
                <option value="COLLEGE">Collège uniquement (6ème à 3ème)</option>
                <option value="LYCEE">Lycée uniquement (2nde à Terminale)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Engagement hebdomadaire envisagé
              </label>
              <select
                value={form.hours_per_week}
                onChange={(e) => setForm({ ...form, hours_per_week: parseInt(e.target.value) })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] rounded-xl bg-[#0E0A20] text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value={1}>1 heure par semaine</option>
                <option value={2}>2 heures par semaine (recommandé pour un binôme)</option>
                <option value={3}>3 heures par semaine</option>
                <option value={4}>4 heures ou plus par semaine</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vos créneaux de disponibilité *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Samedi matin, Mercredi après-midi, Dimanche soir"
              value={form.availabilities}
              onChange={(e) => setForm({ ...form, availabilities: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Permet à notre équipe de vous proposer un élève disponible sur les mêmes créneaux.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Votre parcours & expérience (études, enseignement, bénévolat...)
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Étudiant en Licence de Mathématiques, ou enseignant certifié, soutien scolaire déjà dispensé en association..."
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full text-xs sm:text-sm p-3 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
            ></textarea>
          </div>
        </div>

        {/* Section 3 : Motivation spécifique pour la mission (si mission ciblée) */}
        {targetMission && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-[#281F4B] pb-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">
                3. Votre motivation pour cette mission
              </h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pourquoi cette mission vous intéresse-t-elle particulièrement ?
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Je suis disponible immédiatement et j'ai une bonne maîtrise du programme de 3ème en mathématiques..."
                value={form.mission_motivation}
                onChange={(e) => setForm({ ...form, mission_motivation: e.target.value })}
                className="w-full text-xs sm:text-sm p-3 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              ></textarea>
            </div>
          </div>
        )}

        {/* Section 4 : Charte de protection des mineurs */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C123B] to-[#130E28] border border-purple-500/40 space-y-3 shadow-md">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
              <span>Charte éthique et protection des mineurs (Obligatoire)</span>
            </div>
            <Link
              to="/charte-ethique"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
            >
              Lire le texte intégral <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Je m'engage sur l'honneur à respecter la dignité, l'intégrité morale et physique de chaque élève accompagné, à respecter rigoureusement les créneaux convenus, à tenir à jour le carnet de liaison après chaque séance et à avertir sans délai la coordination de toute difficulté ou comportement anormal.
          </p>

          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-[#0E0A20]/80 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-colors">
              <input
                type="checkbox"
                id="charter"
                checked={form.charter_accepted}
                onChange={(e) => setForm({ ...form, charter_accepted: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-[#0E0A20] border-[#281F4B] cursor-pointer"
              />
              <span className="text-xs font-semibold text-white leading-snug">
                J'ai lu, je comprends et j'accepte sans réserve la charte de conduite et de protection des mineurs. *
              </span>
            </label>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Enregistrement de votre candidature...</span>
              </>
            ) : (
              <>
                <HeartHandshake className="w-5 h-5 text-purple-200" />
                <span>
                  {targetMission
                    ? 'Valider mon profil & candidater à la mission'
                    : 'Soumettre ma candidature bénévole'}
                </span>
                <ArrowRight className="w-4 h-4 text-purple-200" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            🔒 Vos informations personnelles restent strictement confidentielles et ne sont partagées qu'avec l'équipe de coordination éducative.
          </p>
        </div>
      </form>
    </div>
  );
};
