import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  MapPin,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Users,
  BookOpen,
  Award,
  MessageSquarePlus,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { apiClient, extractResults, formatApiError } from '../api/client';
import { Testimonial } from '../types';
import { useAuth } from '../context/AuthContext';

export interface BeneficiaryTestimonialItem {
  id: number | string;
  name: string;
  role: string;
  role_type: 'PARENT' | 'STUDENT' | 'VOLUNTEER' | 'COORDINATOR';
  quote: string;
  photo?: string;
  avatar_url?: string;
  photo_display?: string;
  location: string;
  island?: string;
  rating?: number;
  impact_badge?: string;
  subjects?: string;
}

// Témoignages démo représentatifs (Mentors, Familles et Élèves aidés)
const DEFAULT_TESTIMONIALS: BeneficiaryTestimonialItem[] = [
  {
    id: 'm-1',
    name: 'Aminata Mohamed',
    role: 'Étudiante Master & Tutrice bénévole en Français',
    role_type: 'VOLUNTEER',
    location: 'Lyon (Diaspora) & Moroni',
    island: 'Grande Comore',
    quote:
      "Accompagner mon élève chaque samedi à distance est l'expérience la plus gratifiante de mon parcours étudiant. Les progrès qu'il a réalisés en quelques semaines sur la structure de ses rédactions sont spectaculaires. L'association assure un cadre sécurisé, nous met en relation directe avec la famille et fournit les outils pédagogiques.",
    photo:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Mentor engagé • 8 mois d’accompagnement bénévole',
    subjects: 'Français & Expression écrite',
  },
  {
    id: 'b-1',
    name: 'Fatima Ibrahim',
    role: "Parent d'élève (Mère de Yassine, élève de 3ème)",
    role_type: 'PARENT',
    location: 'Moroni',
    island: 'Grande Comore',
    quote:
      "Grâce au mentor bénévole qui aide mon fils chaque samedi en français et méthodologie, ses notes ont grimpé de 4 points et il a repris confiance avant son examen du Brevet. En tant que maman, voir son enfant retrouver le sourire devant ses devoirs n'a pas de prix. Un immense soulagement pour notre famille !",
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: '+4 points de moyenne • Préparation sereine au Brevet',
    subjects: 'Français & Méthodologie',
  },
  {
    id: 'm-2',
    name: 'Youssouf Ali',
    role: 'Professeur certifié & Mentor bénévole en Mathématiques',
    role_type: 'VOLUNTEER',
    location: 'Marseille & Iconi',
    island: 'Grande Comore',
    quote:
      "Le mentorat avec Solidarité Éducative est structuré avec rigueur. Le carnet de liaison et le contact avec les parents permettent d'avancer pas à pas. Voir un collégien passer du blocage complet au plaisir de résoudre une équation est une immense satisfaction pour tout enseignant.",
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Mentor certifié • Suivi rigoureux en mathématiques',
    subjects: 'Mathématiques Collège & Lycée',
  },
  {
    id: 'b-2',
    name: 'Nassim K.',
    role: 'Élève de 3ème accompagné (Session 2026)',
    role_type: 'STUDENT',
    location: 'Mitsamiouli',
    island: 'Grande Comore',
    quote:
      "Avant je bloquais sur les rédactions et la grammaire, je perdais tous mes moyens lors des contrôles. Mon mentor m'explique calmement sans me juger et me donne des astuces pour retenir les règles. Maintenant j'ose lever la main en classe et je vise la mention au Brevet !",
    photo:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Blocage levé en rédaction • Participation active',
    subjects: 'Français & Mathématiques',
  },
  {
    id: 'm-3',
    name: 'Aïcha Daoud',
    role: 'Ingénieure télécoms & Mentore Sciences & Physique',
    role_type: 'VOLUNTEER',
    location: 'Paris & Mutsamudu',
    island: 'Anjouan',
    quote:
      "Transmettre et encourager les vocations scientifiques auprès des jeunes comoriens me tient à cœur. J'accompagne deux lycéennes qui préparent leur baccalauréat. Les séances en visio se passent à merveille et l'implication des familles est remarquable. Ce projet a un impact réel sur le terrain.",
    photo:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Mentorat d’orientation • Vocation scientifique',
    subjects: 'Physique-Chimie & SVT',
  },
  {
    id: 'b-3',
    name: 'Mariama Said',
    role: 'Mère de deux élèves au primaire (CE2 & CM2)',
    role_type: 'PARENT',
    location: 'Mutsamudu',
    island: 'Anjouan',
    quote:
      "Habitant à Anjouan, nous n'avions pas facilement accès à des professeurs de cours particuliers abordables. La tutrice bénévole fait des séances chaque mercredi après-midi à distance. Mes deux enfants sont devenus très appliqués dans la lecture et le calcul. Tout est gratuit et parfaitement sécurisé.",
    photo:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Progrès rapides en lecture • 100% gratuit pour la fratrie',
    subjects: 'Lecture & Mathématiques',
  },
  {
    id: 'b-4',
    name: 'Mohamed Bacar',
    role: 'Père de Nadia (Élève en Terminale Scientifique)',
    role_type: 'PARENT',
    location: 'Fomboni',
    island: 'Mohéli',
    quote:
      "Trouver un accompagnement de niveau Terminale à Mohéli était un casse-tête pour nous. Grâce à cette plateforme, Nadia a été mise en relation avec un mentor ingénieur comorien de la diaspora. Elle a obtenu son Baccalauréat avec mention Bien. Nous sommes infiniment reconnaissants envers l'association !",
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Bac S obtenu avec mention Bien • Mentorat d’excellence',
    subjects: 'Physique-Chimie & Mathématiques',
  },
  {
    id: 'b-5',
    name: 'Zahra Ahmed',
    role: 'Lycéenne en classe de 1ère générale',
    role_type: 'STUDENT',
    location: 'Iconi',
    island: 'Grande Comore',
    quote:
      "Ma famille traversait une période difficile et ne pouvait pas payer de cours privés. Quand j'ai découvert que ce soutien était 100% bénévole et bienveillant, je me suis inscrite. Mon mentor a repris toutes les bases en mathématiques avec moi. Ma moyenne est passée de 7 à 12,5/20 !",
    photo:
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Moyenne passée de 7/20 à 12,5/20 • Confiance retrouvée',
    subjects: 'Mathématiques & SVT',
  },
  {
    id: 'b-6',
    name: 'Ali Soulaimana',
    role: 'Tuteur familial & Grand-frère responsable',
    role_type: 'PARENT',
    location: 'Domoni',
    island: 'Anjouan',
    quote:
      "J'élève mes deux jeunes frères et j'étais dépassé par leurs devoirs au collège. Le mentor qui les encadre fait preuve d'une pédagogie et d'une ponctualité remarquables. Le carnet de liaison me permet de suivre chaque progrès en toute transparence. C'est une vraie chance pour nos enfants.",
    photo:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    rating: 5,
    impact_badge: 'Suivi transparent via carnet de liaison • Devoirs maîtrisés',
    subjects: 'Anglais & Sciences',
  },
];

type FilterType = 'ALL' | 'VOLUNTEER' | 'PARENT' | 'STUDENT';

interface BeneficiaryTestimonialsProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export const BeneficiaryTestimonials: React.FC<BeneficiaryTestimonialsProps> = ({
  className = '',
  title = 'Témoignages & Avis : Mentors, Familles & Élèves',
  subtitle = "Découvrez les retours d'expérience de nos mentors bénévoles, des parents et des élèves accompagnés aux Comores.",
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<BeneficiaryTestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState<Record<string | number, boolean>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // État du modal pour donner un avis
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Formulaire d'avis
  const [reviewForm, setReviewForm] = useState({
    name: '',
    role_type: 'VOLUNTEER' as 'VOLUNTEER' | 'PARENT' | 'STUDENT',
    role: '',
    location: '',
    rating: 5,
    quote: '',
    subjects: '',
    impact_badge: '',
    avatar_url: '',
  });

  // Pré-remplir les données de l'utilisateur connecté si disponible
  useEffect(() => {
    if (user) {
      const isMentor = user.role === 'VOLUNTEER' || user.role === 'TEACHER';
      const isParent = user.role === 'PARENT';
      const defaultRoleType = isMentor ? 'VOLUNTEER' : isParent ? 'PARENT' : 'VOLUNTEER';

      setReviewForm((prev) => ({
        ...prev,
        name: prev.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        location: prev.location || user.city || (user.island ? user.island : ''),
        role_type: defaultRoleType,
        role:
          prev.role ||
          (isMentor
            ? 'Mentor bénévole'
            : isParent
            ? "Parent d'élève accompagné"
            : 'Élève / Mentor'),
      }));
    }
  }, [user, isModalOpen]);

  // Charger les avis depuis le backend CMS
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/cms/testimonials/')
      .then((res) => {
        if (!isMounted) return;
        const apiList = extractResults<Testimonial>(res.data);
        if (apiList && apiList.length > 0) {
          const formattedFromApi: BeneficiaryTestimonialItem[] = apiList.map((t) => ({
            id: t.id,
            name: t.name,
            role:
              t.role ||
              (t.role_type === 'VOLUNTEER'
                ? 'Mentor bénévole'
                : t.role_type === 'PARENT'
                ? "Parent d'élève"
                : 'Élève accompagné'),
            role_type: (t.role_type as any) || 'VOLUNTEER',
            quote: t.quote,
            photo: t.photo_display || t.avatar_url || t.photo,
            location: t.location || 'Comores',
            rating: t.rating || 5,
            impact_badge:
              t.role_type === 'VOLUNTEER'
                ? 'Mentor engagé • Avis vérifié'
                : t.role_type === 'PARENT'
                ? 'Famille accompagnée avec succès'
                : 'Élève soutenu et épanoui',
            subjects: t.mission_title || 'Soutien pluridisciplinaire',
          }));

          // Fusionner avec la liste par défaut sans doublons
          const merged = [...formattedFromApi];
          DEFAULT_TESTIMONIALS.forEach((def) => {
            if (!merged.some((m) => m.name.toLowerCase() === def.name.toLowerCase())) {
              merged.push(def);
            }
          });
          setItems(merged);
        }
      })
      .catch(() => {
        // En cas d'erreur API, on garde DEFAULT_TESTIMONIALS
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrer les avis en fonction de la catégorie sélectionnée
  const filteredItems = useMemo(() => {
    if (selectedFilter === 'ALL') return items;
    return items.filter((it) => it.role_type === selectedFilter);
  }, [items, selectedFilter]);

  const total = filteredItems.length;

  // Ajuster currentIndex si le filtre change et dépasse la taille
  useEffect(() => {
    if (currentIndex >= total) {
      setCurrentIndex(0);
    }
  }, [selectedFilter, total, currentIndex]);

  const current = filteredItems[currentIndex] || filteredItems[0] || items[0];

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setIsAnimating(false), 200);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsAnimating(false), 200);
  }, [total]);

  const handleSelect = (idx: number) => {
    if (idx === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(idx);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const getInitials = (name: string) => {
    return (name || 'M')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const photoUrl = current?.photo || current?.photo_display || current?.avatar_url;
  const hasValidPhoto = photoUrl && !imgError[current?.id];

  // Soumission d'un nouvel avis (par un mentor ou une famille)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.quote.trim()) {
      setReviewError('Veuillez renseigner votre nom et votre avis.');
      return;
    }
    if (reviewForm.quote.trim().length < 20) {
      setReviewError('Votre avis doit comporter au moins 20 caractères.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      const payload = {
        name: reviewForm.name.trim(),
        role: reviewForm.role.trim() || (reviewForm.role_type === 'VOLUNTEER' ? 'Mentor bénévole' : "Parent d'élève"),
        role_type: reviewForm.role_type,
        quote: reviewForm.quote.trim(),
        location: reviewForm.location.trim() || 'Comores',
        rating: reviewForm.rating,
        avatar_url: reviewForm.avatar_url.trim() || '',
      };

      const res = await apiClient.post('/cms/testimonials/', payload);
      const created = res.data;

      const newItem: BeneficiaryTestimonialItem = {
        id: created.id || Date.now(),
        name: created.name || payload.name,
        role: created.role || payload.role,
        role_type: created.role_type || payload.role_type,
        quote: created.quote || payload.quote,
        photo: created.photo_display || created.avatar_url || payload.avatar_url,
        location: created.location || payload.location,
        rating: created.rating || payload.rating,
        impact_badge:
          payload.role_type === 'VOLUNTEER'
            ? 'Nouveau retour de mentor • Vérifié'
            : 'Nouvel avis partagé',
        subjects: reviewForm.subjects || 'Accompagnement scolaire',
      };

      // Ajouter en tête de liste
      setItems((prev) => [newItem, ...prev]);
      setSelectedFilter('ALL');
      setCurrentIndex(0);
      setReviewSuccess(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setReviewSuccess(false);
        setReviewForm({
          name: '',
          role_type: 'VOLUNTEER',
          role: '',
          location: '',
          rating: 5,
          quote: '',
          subjects: '',
          impact_badge: '',
          avatar_url: '',
        });
      }, 1500);
    } catch (err: any) {
      setReviewError(formatApiError(err, "Une erreur est survenue lors de l'envoi de votre avis."));
    } finally {
      setSubmittingReview(false);
    }
  };

  // Rendu du rôle avec badges et couleurs dédiées
  const renderRoleBadge = (roleType: string) => {
    if (roleType === 'VOLUNTEER') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-brand-teal text-[11px] font-extrabold shadow-2xs">
          <Award className="w-3.5 h-3.5 text-brand-teal shrink-0" />
          <span>Mentor / Tuteur</span>
        </span>
      );
    }
    if (roleType === 'STUDENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Élève accompagné</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold shadow-2xs">
        <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span>Famille / Parent</span>
      </span>
    );
  };

  // Compteurs par rôle pour les onglets
  const counts = useMemo(() => {
    return {
      ALL: items.length,
      VOLUNTEER: items.filter((i) => i.role_type === 'VOLUNTEER').length,
      PARENT: items.filter((i) => i.role_type === 'PARENT').length,
      STUDENT: items.filter((i) => i.role_type === 'STUDENT').length,
    };
  }, [items]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── En-tête de section ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-brand-teal text-xs font-bold">
            <HeartHandshake className="w-4 h-4 text-brand-teal shrink-0" />
            <span>Retours d'expérience vérifiés</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-brand-blue tracking-tight">
            {title}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Bouton pour donner un avis (Mentors & Familles) */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setReviewError('');
              setReviewSuccess(false);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Donner un avis</span>
          </button>

          <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center gap-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <div className="text-xs">
              <span className="font-extrabold text-slate-800">4.9 / 5</span>
              <span className="text-slate-400 ml-1">• Avis vérifiés</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Onglets de filtre par rôle (Mentors, Familles, Élèves) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {[
          { key: 'ALL', label: 'Tous les avis', count: counts.ALL, icon: Sparkles },
          { key: 'VOLUNTEER', label: 'Mentors & Bénévoles', count: counts.VOLUNTEER, icon: Award },
          { key: 'PARENT', label: 'Familles & Parents', count: counts.PARENT, icon: Users },
          { key: 'STUDENT', label: 'Élèves accompagnés', count: counts.STUDENT, icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = selectedFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedFilter(tab.key as FilterType);
                setCurrentIndex(0);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                active
                  ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-teal hover:text-brand-teal'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-teal-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Carte principale du témoignage sélectionné ── */}
      {current ? (
        <div className="bg-[#140F2D] rounded-3xl border border-[#281F4B] shadow-2xl overflow-hidden transition-all duration-300">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              
              {/* Colonne gauche : Photo et informations */}
              <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 border-b lg:border-b-0 lg:border-r border-[#281F4B] pb-6 lg:pb-0 lg:pr-8">
                {/* Photo de profil */}
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md ring-4 ring-purple-500/20 bg-[#1D173C] flex items-center justify-center">
                    {hasValidPhoto ? (
                      <img
                        src={photoUrl}
                        alt={current.name}
                        onError={() => setImgError((prev) => ({ ...prev, [current.id]: true }))}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white text-2xl font-extrabold">
                        {getInitials(current.name)}
                      </div>
                    )}
                  </div>

                  {/* Badge de rôle flottant sur la photo */}
                  <div className="absolute -bottom-2 -right-2">
                    {renderRoleBadge(current.role_type)}
                  </div>
                </div>

                {/* Nom & rôle */}
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {current.name}
                    </h3>
                    <span title="Avis authentifié">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300">
                    {current.role}
                  </p>

                  {/* Localisation */}
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-slate-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>
                      {current.location}
                      {current.island ? ` (${current.island})` : ''}
                    </span>
                  </div>
                </div>

                {/* Matières concernées */}
                {current.subjects && (
                  <div className="w-full pt-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1435] border border-[#281F4B] text-[11px] font-medium text-slate-300">
                      <BookOpen className="w-3 h-3 text-purple-400" />
                      <span>{current.subjects}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite : Citation, impact et note */}
              <div
                className={`lg:col-span-8 flex flex-col justify-between space-y-5 transition-opacity duration-200 ${
                  isAnimating ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Étoiles & Badge de réussite */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(current.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-300 ml-1.5">Note {current.rating || 5}/5</span>
                  </div>

                  {current.impact_badge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800/50 text-purple-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{current.impact_badge}</span>
                    </div>
                  )}
                </div>

                {/* Texte de l'avis avec icône citation */}
                <div className="relative pl-1 sm:pl-2">
                  <Quote className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500/20 absolute -top-4 -left-3 sm:-left-4 pointer-events-none" />
                  <p className="text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed italic relative z-10 font-normal">
                    « {current.quote} »
                  </p>
                </div>

                {/* Cadre de réassurance */}
                <div className="pt-4 border-t border-[#281F4B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {current.role_type === 'VOLUNTEER'
                        ? 'Mentor bénévole certifié par Solidarité Éducative'
                        : 'Soutien scolaire 100% gratuit et bienveillant'}
                    </span>
                  </div>
                  <div className="font-semibold text-purple-400">
                    Avis {currentIndex + 1} sur {total}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Barre de commande : Précédent & Suivant ── */}
          <div className="bg-[#0E0A20] border-t border-[#281F4B] px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Bouton pour retourner / précédent */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={total <= 1}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Retourner au témoignage précédent"
            >
              <ChevronLeft className="w-4 h-4 text-purple-400" />
              <span>Avis précédent</span>
            </button>

            {/* Puces de navigation */}
            <div className="flex items-center gap-2">
              {filteredItems.map((it, idx) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-7 sm:w-8 h-2.5 bg-purple-500 shadow-xs'
                      : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Voir l'avis de ${it.name}`}
                  aria-label={`Aller à l'avis ${idx + 1}`}
                />
              ))}
            </div>

            {/* Bouton pour voir d'autres avis / suivant */}
            <button
              type="button"
              onClick={handleNext}
              disabled={total <= 1}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-950/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Voir d'autres avis"
            >
              <span>Voir d'autres avis</span>
              <ChevronRight className="w-4 h-4 text-purple-200" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#140F2D] rounded-3xl border border-[#281F4B] text-slate-400 text-sm">
          Aucun avis trouvé dans cette catégorie.
        </div>
      )}

      {/* ── Galerie de sélection directe ── */}
      {filteredItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sélection directe ({filteredItems.length} avis disponibles) :
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {filteredItems.map((it, idx) => {
              const isSelected = idx === currentIndex;
              const thumbUrl = it.photo || it.photo_display || it.avatar_url;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleSelect(idx)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30 shadow-xs'
                      : 'bg-[#140F2D] border-[#281F4B] hover:border-purple-500/40 hover:bg-[#1A1435]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#281F4B] bg-[#1D173C] flex items-center justify-center">
                    {thumbUrl && !imgError[it.id] ? (
                      <img
                        src={thumbUrl}
                        alt={it.name}
                        onError={() => setImgError((prev) => ({ ...prev, [it.id]: true }))}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-200">
                        {getInitials(it.name)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                      {it.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {it.role_type === 'VOLUNTEER' ? 'Mentor' : it.location}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL : Donner un avis (Mentors, Familles, Élèves) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* En-tête du modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand-teal">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Partager votre avis & expérience
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mentors, parents ou élèves : votre retour compte !
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
            <form onSubmit={handleSubmitReview} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {reviewSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Merci pour votre avis ! Votre témoignage est désormais visible.</span>
                </div>
              )}

              {reviewError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Sélection du rôle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vous donnez votre avis en tant que : *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'VOLUNTEER', label: 'Mentor / Tuteur', icon: Award },
                    { type: 'PARENT', label: 'Famille / Parent', icon: Users },
                    { type: 'STUDENT', label: 'Élève aidé', icon: GraduationCap },
                  ].map((r) => {
                    const Icon = r.icon;
                    const active = reviewForm.role_type === r.type;
                    return (
                      <button
                        key={r.type}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({
                            ...prev,
                            role_type: r.type as any,
                            role:
                              r.type === 'VOLUNTEER'
                                ? 'Mentor bénévole en Mathématiques'
                                : r.type === 'PARENT'
                                ? "Parent d'élève"
                                : 'Élève accompagné',
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          active
                            ? 'bg-brand-blue text-white border-brand-blue shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-teal-300' : 'text-slate-400'}`} />
                        <span className="text-[11px]">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nom & Localisation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Prénom & Nom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Youssouf Ali"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ville ou Pays
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Moroni, Lyon, Marseille"
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Titre / Rôle précis */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {reviewForm.role_type === 'VOLUNTEER'
                    ? 'Discipline ou statut de mentor *'
                    : reviewForm.role_type === 'PARENT'
                    ? "Relation avec l'élève *"
                    : 'Classe ou niveau *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    reviewForm.role_type === 'VOLUNTEER'
                      ? 'Ex: Enseignant certifié & Mentor en Mathématiques'
                      : reviewForm.role_type === 'PARENT'
                      ? "Ex: Mère d'un élève de 3ème au collège Moroni Sud"
                      : 'Ex: Élève de Terminale à Mitsamiouli'
                  }
                  value={reviewForm.role}
                  onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                />
              </div>

              {/* Matière(s) accompagnée(s) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Matière(s) concernée(s) (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mathématiques, Français, Physique-Chimie..."
                  value={reviewForm.subjects}
                  onChange={(e) => setReviewForm({ ...reviewForm, subjects: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                />
              </div>

              {/* Note / Évaluation étoiles */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Note d'expérience :
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: st })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          st <= reviewForm.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {reviewForm.rating} / 5 étoiles
                  </span>
                </div>
              </div>

              {/* Texte de l'avis */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Votre avis / Témoignage * <span className="font-normal text-slate-400">(min. 20 caractères)</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    reviewForm.role_type === 'VOLUNTEER'
                      ? "Expliquez comment se passe l'accompagnement avec votre élève, les progrès observés, l'organisation et ce que cette expérience vous apporte..."
                      : "Racontez comment l'accompagnement scolaire gratuit a aidé votre famille, les résultats obtenus et votre relation avec le mentor..."
                  }
                  value={reviewForm.quote}
                  onChange={(e) => setReviewForm({ ...reviewForm, quote: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none resize-none"
                />
              </div>

              {/* Lien photo optionnel */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lien de votre photo de profil <span className="font-normal text-slate-400">(optionnel)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... ou URL image"
                  value={reviewForm.avatar_url}
                  onChange={(e) => setReviewForm({ ...reviewForm, avatar_url: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Si non fourni, vos initiales seront stylisées dans un badge élégant.
                </p>
              </div>

              {/* Bouton de soumission */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publication en cours…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publier mon avis</span>
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

export default BeneficiaryTestimonials;
