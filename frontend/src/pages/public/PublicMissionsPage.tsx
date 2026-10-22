import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractResults } from '../../api/client';
import { PublicMission, Subject } from '../../types';
import {
  HeartHandshake,
  MapPin,
  Clock,
  Search,
  BookOpen,
  ChevronDown,
  X,
  Check,
  Building2,
  Laptop,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
  Users,
  GraduationCap,
} from 'lucide-react';

// Missions initiales de démonstration ultra-complètes au format JeVeuxAider / CMS
const INITIAL_DEMO_MISSIONS: PublicMission[] = [
  {
    id: 1,
    title: 'Je suis étudiant et je réalise du tutorat en collège 2h/semaine',
    published_by: 'Ebru B., Ayoub B.',
    organization_name: 'ZUPdeCO & Solidarité Éducative',
    organization_description: "Créée pour lutter contre les inégalités scolaires à travers des programmes d'accompagnement en ligne et en présentiel dans les établissements scolaires partenaires. L'association défend l'idée que nous ne pourrons pas résoudre les inégalités sociales sans résoudre les inégalités scolaires.\n\nChaque année, de nombreux jeunes ont besoin d'un coup de pouce décisif : un bénévole accompagne dans la durée, 1h ou 2h par semaine, un élève jusqu'à l'amélioration de ses résultats. Le bénévole aide l'élève à faire ses devoirs, solidifier ses bases, reprendre confiance en lui et lui ouvre le champ des possibles.",
    activity_type: 'Soutien scolaire & Tutorat',
    target_public: 'Collégiens (6e à 3e - Préparation Brevet)',
    subject: 1,
    subject_name: 'Français & Méthodologie',
    school_level: 'Collège (6e à 3e)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Moroni, Iconi, Mitsamiouli',
    intervention_zone_details: 'Moroni : Collège Moroni Sud • Iconi : Collège Communal • Mitsamiouli : Collège Rural • Antenne numérique Comores-France',
    format: 'EITHER',
    format_display: 'Sur le terrain ou à distance',
    prerequisites: 'Offre ouverte aux étudiants, enseignants et professionnels diplômés du supérieur. Aisance dans les notions fondamentales du collège et pédagogie bienveillante.',
    description: "Accompagnement hebdomadaire d'élèves de collège pour consolider la lecture, l'expression écrite et la méthodologie de révision.",
    presentation_full: `Bonjour,
Tout d'abord nous vous remercions de prendre ce temps pour nous lire :)

L'association recherche des bénévoles engagés pour intégrer le programme d'accompagnement dans les collèges partenaires. Nous proposons d'intervenir, selon vos disponibilités, à travers un rendez-vous hebdomadaire de 1h à 2h/semaine pour accompagner un élève ou un petit groupe de la 6e à la 3e dans leur réussite (et l'obtention du Brevet !).

Qu'est-ce que cette fameuse réussite ?
Pour notre équipe, c'est réduire les inégalités scolaires en agissant sur la motivation, la méthodologie développée par vos élèves et la régularité de vos rendez-vous ! Les bénéfices sont multiples : de meilleurs acquis, des progrès académiques et du soutien au sein même de leur établissement quand il n'y en a pas à la maison.

Pour nos bénévoles, les compétences développées sont valorisables dans le monde professionnel et l'expérience immersive restera gravée comme un formidable marqueur social.`,
    steps_to_join: `Rassurez-vous, notre superbe équipe organise une réunion d'information pour répondre aux questions avant engagement.
Une rapide formation sera dispensée pour perfectionner votre accompagnement avant la mission.
Enfin, nous aidons nos bénévoles dans leur démarche de professionnalisation tout au long de l'année.`,
    practical_details: `Vous n'êtes pas seuls ! Notre équipe vous accueille dans l'établissement que vous avez choisi, suit votre accompagnement de manière bienveillante et partage des bonnes pratiques grâce à vos retours. Nous sommes à l'écoute et preneurs de temps d'échanges réguliers.
Il n'y a pas d'accompagnement le week-end ni les jours fériés.`,
    benefits: '⚡ PS : Ce qui va sans dire est mieux étant dit, on aime prendre soin de nos bénévoles. Vous recevrez une attestation des compétences transverses développées tout du long de cet engagement bénévole.',
    expected_commitment: '2h par semaine',
    status: 'OPEN',
    status_display: 'Mission ouverte',
    deadline: '2026-11-20',
    created_at: '2026-10-21',
    applications_count: 5,
  },
  {
    id: 2,
    title: 'Accompagnement en Sciences Physiques - Lycée (Terminale C & D)',
    published_by: 'Dr. Nassim M., Équipe Pédagogique',
    organization_name: 'Lycée Saïd Mohamed Cheikh',
    organization_description: "Grand établissement d'enseignement secondaire de référence aux Comores, engagé avec Solidarité Éducative pour démocratiser l'accès aux filières scientifiques d'excellence.",
    activity_type: 'Mentorat scientifique intensif',
    target_public: 'Lycéens en Terminale Scientifique (C & D)',
    subject: 2,
    subject_name: 'Physique-Chimie',
    school_level: 'Lycée (Terminale)',
    island: 'Anjouan (Ndzuwani)',
    city: 'Mutsamudu, Domoni',
    intervention_zone_details: 'Mutsamudu : Campus Lycée Saïd Mohamed Cheikh • Domoni : Salle communale de travail • Visiophonie pour la diaspora',
    format: 'EITHER',
    format_display: 'Sur le terrain ou à distance',
    prerequisites: 'Étudiants en sciences, élèves-ingénieurs ou professeurs de physique-chimie. Maîtrise du programme de Terminale S.',
    description: "Préparation intensive au Baccalauréat scientifique comorien : mécanique newtonienne, circuits électriques, chimie des solutions et optique.",
    presentation_full: `Offrez à un futur bachelier l'accompagnement nécessaire pour décrocher sa mention au Bac et réussir son orientation vers l'enseignement supérieur.

Le tutorat s'articule autour de la reprise des notions de cours difficiles, de l'entraînement sur des annales officielles du baccalauréat et de l'acquisition d'une rigueur de rédaction mathématique et physique.`,
    steps_to_join: `Entretien pédagogique préalable avec le coordinateur scientifique et transmission des sujets d'annales corrigés.
Validation de la charte de protection et mise en relation directe avec l'élève.`,
    practical_details: `Séances de 2h le samedi matin ou créneaux flexibles en semaine en distanciel.
Matériel de travail et fiches de révision mis à disposition.`,
    benefits: 'Attestation de mentorat scientifique officiel reconnue par le réseau des établissements partenaires.',
    expected_commitment: '2h par semaine',
    status: 'OPEN',
    status_display: 'Mission ouverte',
    deadline: '2026-11-15',
    created_at: '2026-10-20',
    applications_count: 2,
  },
  {
    id: 3,
    title: 'Aide aux Devoirs & Découverte de la Lecture - Primaire (CE2 à CM2)',
    published_by: 'Fatima Z., Coordinatrice Primaire',
    organization_name: 'École Primaire Moroni Sud',
    organization_description: "École primaire publique accueillant plus de 450 élèves. Partenaire pilote pour le programme de lutte contre le décrochage précoce et l'apprentissage fondamental.",
    activity_type: 'Aide aux devoirs & Éveil',
    target_public: 'Écoliers du primaire (8 à 11 ans)',
    subject: 3,
    subject_name: 'Aide aux devoirs & Méthodologie',
    school_level: 'Primaire (CE2 - CM2)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Moroni',
    intervention_zone_details: 'Moroni Sud : Bibliothèque de quartier Mtsangani et salles d’études encadrées',
    format: 'IN_PERSON',
    format_display: 'Mission sur le terrain',
    prerequisites: 'Patience, bienveillance, sens de l’écoute et plaisir de transmettre le goût de la lecture aux plus jeunes.',
    description: "Aide aux leçons du soir, entraînement à la lecture à voix haute et jeux éducatifs de calcul pour donner confiance aux écoliers.",
    presentation_full: `Aider un enfant à comprendre ses leçons et à lire avec plaisir, c'est lui ouvrir tout son avenir scolaire !

Les séances se déroulent dans une ambiance calme et chaleureuse. Vous suivez un binôme de deux écoliers, vérifiez la compréhension des consignes et célébrez chaque petit progrès.`,
    steps_to_join: `Rencontre avec la directrice d'école et les enseignants pour faire le point sur les besoins des enfants.
Fourniture d'une mallette de jeux pédagogiques et d'histoires jeunesse.`,
    practical_details: `Interventions en fin d'après-midi (16h30 à 18h) les lundis, mardis ou jeudis.
Aucune intervention le week-end.`,
    benefits: 'Attestation de bénévolat éducatif et moments de partage inoubliables avec les enfants.',
    expected_commitment: '1h30 par semaine',
    status: 'OPEN',
    status_display: 'Mission ouverte',
    deadline: '2026-11-30',
    created_at: '2026-10-19',
    applications_count: 4,
  },
  {
    id: 4,
    title: 'Atelier d’Oral & Conversation en Anglais - Collège & Lycée',
    published_by: 'Karim H., Pôle Langues Vivantes',
    organization_name: 'Relais Éducatif de Fomboni',
    organization_description: "Antenne associative engagée sur l'île de Mohéli pour l'ouverture linguistique, culturelle et numérique de la jeunesse insulaire.",
    activity_type: 'Atelier de pratique linguistique',
    target_public: 'Élèves de 4ème, 3ème et Seconde',
    subject: 4,
    subject_name: 'Anglais',
    school_level: 'Collège & Lycée',
    island: 'Mohéli (Mwali)',
    city: 'Fomboni',
    intervention_zone_details: 'Fomboni centre : Médiathèque municipale • Sessions en visio pour les bénévoles de la diaspora',
    format: 'REMOTE',
    format_display: 'Mission à distance',
    prerequisites: 'Bonne maîtrise de l’anglais parlé (niveau B2/C1 minimum), envie d’animer des échanges vivants et interactifs.',
    description: "Pratique orale de l'anglais à travers des dialogues, jeux de rôle et thématiques d'actualité pour débloquer la timidité à l'oral.",
    presentation_full: `L'anglais est souvent source d'appréhension pour les élèves comoriens par manque d'occasions de pratique orale.

À travers ce tutorat bienveillant en visio ou présentiel, vous proposez des conversations guidées sur des thèmes qui passionnent les jeunes : musique, sport, sciences, études et projets d'avenir.`,
    steps_to_join: `Test technique rapide pour les séances en ligne et cadrage des thèmes d'ateliers avec notre référent linguistique.`,
    practical_details: `Créneaux flexibles de 1h le mercredi ou samedi en visio (Google Meet ou WhatsApp Vidéo optimisé basse bande passante).`,
    benefits: 'Valorisation de vos compétences pédagogiques et linguistiques en milieu multiculturel.',
    expected_commitment: '1h par semaine',
    status: 'OPEN',
    status_display: 'Mission ouverte',
    deadline: '2026-12-05',
    created_at: '2026-10-18',
    applications_count: 1,
  },
];

export const PublicMissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<PublicMission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [cityFilter, setCityFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'IN_PERSON' | 'REMOTE'>('ALL');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedIslands, setSelectedIslands] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');

  // Dropdowns d'ouverture
  const [openDropdown, setOpenDropdown] = useState<'DOMAINS' | 'ISLANDS' | 'ORGS' | null>(null);

  const filterContainerRef = useRef<HTMLDivElement>(null);

  // Fermeture des popovers au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Chargement des données
  useEffect(() => {
    Promise.all([
      apiClient.get('/pedagogy/subjects/').catch(() => ({ data: [] })),
      apiClient.get('/volunteering/missions/').catch(() => ({ data: [] })),
    ])
      .then(([subRes, misRes]) => {
        const apiSubjects = extractResults<Subject>(subRes.data);
        if (apiSubjects.length) setSubjects(apiSubjects);

        const apiMissions = extractResults<PublicMission>(misRes.data);
        if (apiMissions.length > 0) {
          const ids = new Set(apiMissions.map((m) => m.id));
          const complementary = INITIAL_DEMO_MISSIONS.filter((dm) => !ids.has(dm.id));
          setMissions([...apiMissions, ...complementary]);
        } else {
          setMissions(INITIAL_DEMO_MISSIONS);
        }
      })
      .catch(() => {
        setMissions(INITIAL_DEMO_MISSIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Options pour les listes
  const availableDomains = useMemo(() => {
    const list = new Set<string>();
    subjects.forEach((s) => list.add(s.name));
    missions.forEach((m) => {
      if (m.subject_name) list.add(m.subject_name);
    });
    ['Français & Méthodologie', 'Mathématiques', 'Physique-Chimie', 'Anglais', 'Aide aux devoirs & Méthodologie', 'Sciences de la Vie et de la Terre'].forEach((d) => list.add(d));
    return Array.from(list);
  }, [subjects, missions]);

  const availableIslands = [
    { key: 'Grande Comore (Ngazidja)', label: 'Grande Comore (Ngazidja)', alias: ['grande comore', 'ngazidja'] },
    { key: 'Anjouan (Ndzuwani)', label: 'Anjouan (Ndzuwani)', alias: ['anjouan', 'ndzuwani'] },
    { key: 'Mohéli (Mwali)', label: 'Mohéli (Mwali)', alias: ['mohéli', 'mwali', 'moheli'] },
    { key: 'France & Diaspora', label: 'France & Diaspora (En ligne)', alias: ['france', 'diaspora', 'en ligne'] },
  ];

  const availableOrgs = useMemo(() => {
    const list = new Set<string>();
    missions.forEach((m) => {
      if (m.organization_name) list.add(m.organization_name);
    });
    list.add('ZUPdeCO & Solidarité Éducative');
    list.add('Solidarité Éducative Comores');
    list.add('Lycée Saïd Mohamed Cheikh');
    list.add('École Primaire Moroni Sud');
    list.add('Relais Éducatif de Fomboni');
    return Array.from(list);
  }, [missions]);

  // Filtrage combiné en temps réel
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      // 1. Ville
      if (cityFilter.trim()) {
        const queryCity = cityFilter.toLowerCase().trim();
        const missionCity = (m.city || '').toLowerCase();
        const missionIsland = (m.island || '').toLowerCase();
        const missionZone = (m.intervention_zone_details || '').toLowerCase();
        if (!missionCity.includes(queryCity) && !missionIsland.includes(queryCity) && !missionZone.includes(queryCity)) {
          return false;
        }
      }

      // 2. Format
      if (formatFilter === 'IN_PERSON') {
        if (m.format !== 'IN_PERSON' && m.format !== 'EITHER') return false;
      } else if (formatFilter === 'REMOTE') {
        if (m.format !== 'REMOTE' && m.format !== 'EITHER') return false;
      }

      // 3. Domaines
      if (selectedDomains.length > 0) {
        const subjName = m.subject_name || '';
        const match = selectedDomains.some((d) => subjName.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(subjName.toLowerCase()));
        if (!match) return false;
      }

      // 4. Îles
      if (selectedIslands.length > 0) {
        const missionIslandLower = (m.island || '').toLowerCase();
        const match = selectedIslands.some((islKey) => {
          const item = availableIslands.find((i) => i.key === islKey);
          if (!item) return missionIslandLower.includes(islKey.toLowerCase());
          return item.alias.some((a) => missionIslandLower.includes(a));
        });
        if (!match) return false;
      }

      // 5. Organisations
      if (selectedOrgs.length > 0) {
        const org = m.organization_name || 'Solidarité Éducative Comores';
        if (!selectedOrgs.includes(org)) return false;
      }

      // 6. Mot-clé libre
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description.toLowerCase().includes(q);
        const matchPres = (m.presentation_full || '').toLowerCase().includes(q);
        const matchZone = (m.intervention_zone_details || '').toLowerCase();
        if (!matchTitle && !matchDesc && !matchPres && !matchZone) return false;
      }

      return true;
    });
  }, [missions, cityFilter, formatFilter, selectedDomains, selectedIslands, selectedOrgs, keyword]);

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const toggleIsland = (islandKey: string) => {
    setSelectedIslands((prev) =>
      prev.includes(islandKey) ? prev.filter((i) => i !== islandKey) : [...prev, islandKey]
    );
  };

  const toggleOrg = (org: string) => {
    setSelectedOrgs((prev) =>
      prev.includes(org) ? prev.filter((o) => o !== org) : [...prev, org]
    );
  };

  const resetAllFilters = () => {
    setCityFilter('');
    setFormatFilter('ALL');
    setSelectedDomains([]);
    setSelectedIslands([]);
    setSelectedOrgs([]);
    setKeyword('');
    setOpenDropdown(null);
  };

  const totalActiveFiltersCount =
    (cityFilter ? 1 : 0) +
    (formatFilter !== 'ALL' ? 1 : 0) +
    selectedDomains.length +
    selectedIslands.length +
    selectedOrgs.length +
    (keyword ? 1 : 0);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-b from-brand-blue via-teal-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-teal-800/40">
        <div className="max-w-6xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <HeartHandshake className="w-4 h-4 text-teal-300" />
            <span>Missions d'accompagnement scolaire vérifiées</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Trouver une mission de bénévolat
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-slate-300 leading-relaxed">
            Rejoignez un élève comorien en difficulté. Choisissez votre rythme, votre matière de prédilection,
            votre établissement partenaire ou accompagnez à distance depuis la France et la diaspora.
          </p>
        </div>
      </section>

      {/* 2. BARRE DE RECHERCHE ET DE FILTRES MULTICRITÈRES (Style JeVeuxAider) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
        <div
          ref={filterContainerRef}
          className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-4 sm:p-5 space-y-4"
        >
          {/* Grille principale des filtres demandés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* 1. VILLE */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">
                Ville
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="Moroni, Mutsamudu..."
                  className="w-full pl-9 pr-7 py-2.5 text-xs sm:text-sm font-medium bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal transition-all"
                />
                {cityFilter && (
                  <button
                    onClick={() => setCityFilter('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Effacer la ville"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. SUR PLACE / À DISTANCE */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">
                Sur place / À distance
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFormatFilter('ALL')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                    formatFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous
                </button>
                <button
                  type="button"
                  onClick={() => setFormatFilter('IN_PERSON')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                    formatFilter === 'IN_PERSON'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sur place
                </button>
                <button
                  type="button"
                  onClick={() => setFormatFilter('REMOTE')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center ${
                    formatFilter === 'REMOTE'
                      ? 'bg-brand-blue text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  À distance
                </button>
              </div>
            </div>

            {/* 3. DOMAINES (0 filtre sélectionné) */}
            <div className="lg:col-span-2 relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">
                Domaines
              </label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'DOMAINS' ? null : 'DOMAINS')}
                className={`w-full flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                  selectedDomains.length > 0
                    ? 'border-brand-teal bg-teal-50/60 text-brand-teal font-semibold'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="truncate">
                  {selectedDomains.length === 0
                    ? '0 filtre sélectionné'
                    : `${selectedDomains.length} sélectionné${selectedDomains.length > 1 ? 's' : ''}`}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    openDropdown === 'DOMAINS' ? 'rotate-180 text-brand-teal' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Popover Domaines */}
              {openDropdown === 'DOMAINS' && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Matières & Domaines</span>
                    {selectedDomains.length > 0 && (
                      <button
                        onClick={() => setSelectedDomains([])}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Effacer tout
                      </button>
                    )}
                  </div>
                  <div className="py-2 max-h-56 overflow-y-auto space-y-1">
                    {availableDomains.map((dom) => {
                      const isSelected = selectedDomains.includes(dom);
                      return (
                        <label
                          key={dom}
                          onClick={() => toggleDomain(dom)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50 text-brand-teal font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{dom}</span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                              isSelected ? 'bg-brand-teal border-brand-teal' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-slate-800"
                    >
                      Appliquer ({selectedDomains.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. ILE (NGAZIDJA ETC) */}
            <div className="lg:col-span-2 relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">
                Île (Ngazidja etc)
              </label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'ISLANDS' ? null : 'ISLANDS')}
                className={`w-full flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                  selectedIslands.length > 0
                    ? 'border-brand-teal bg-teal-50/60 text-brand-teal font-semibold'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="truncate">
                  {selectedIslands.length === 0
                    ? '0 filtre sélectionné'
                    : `${selectedIslands.length} sélectionnée${selectedIslands.length > 1 ? 's' : ''}`}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    openDropdown === 'ISLANDS' ? 'rotate-180 text-brand-teal' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Popover Îles */}
              {openDropdown === 'ISLANDS' && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Zone géographique</span>
                    {selectedIslands.length > 0 && (
                      <button
                        onClick={() => setSelectedIslands([])}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Effacer tout
                      </button>
                    )}
                  </div>
                  <div className="py-2 space-y-1">
                    {availableIslands.map((isl) => {
                      const isSelected = selectedIslands.includes(isl.key);
                      return (
                        <label
                          key={isl.key}
                          onClick={() => toggleIsland(isl.key)}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50 text-brand-teal font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{isl.label}</span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                              isSelected ? 'bg-brand-teal border-brand-teal' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-slate-800"
                    >
                      Appliquer ({selectedIslands.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. ORGANISATIONS */}
            <div className="lg:col-span-2 relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 pl-1">
                Organisations
              </label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'ORGS' ? null : 'ORGS')}
                className={`w-full flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                  selectedOrgs.length > 0
                    ? 'border-brand-teal bg-teal-50/60 text-brand-teal font-semibold'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                }`}
              >
                <div className="truncate">
                  {selectedOrgs.length === 0
                    ? '0 filtre sélectionné'
                    : `${selectedOrgs.length} sélectionnée${selectedOrgs.length > 1 ? 's' : ''}`}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    openDropdown === 'ORGS' ? 'rotate-180 text-brand-teal' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Popover Organisations */}
              {openDropdown === 'ORGS' && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Établissements & Associations</span>
                    {selectedOrgs.length > 0 && (
                      <button
                        onClick={() => setSelectedOrgs([])}
                        className="text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Effacer tout
                      </button>
                    )}
                  </div>
                  <div className="py-2 max-h-56 overflow-y-auto space-y-1">
                    {availableOrgs.map((org) => {
                      const isSelected = selectedOrgs.includes(org);
                      return (
                        <label
                          key={org}
                          onClick={() => toggleOrg(org)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50 text-brand-teal font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{org}</span>
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center border text-white shrink-0 ml-2 ${
                              isSelected ? 'bg-brand-teal border-brand-teal' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-slate-800"
                    >
                      Appliquer ({selectedOrgs.length})
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Recherche libre par mot-clé complémentaire */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Mot-clé (ex: Brevet, Bac, lecture, fraction...)"
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal focus:bg-white transition-colors"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-semibold text-slate-500">
                <strong className="text-slate-900">{filteredMissions.length}</strong> mission{filteredMissions.length > 1 ? 's' : ''} trouvée{filteredMissions.length > 1 ? 's' : ''}
              </span>

              {totalActiveFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TAGS DES FILTRES ACTIFS */}
      {totalActiveFiltersCount > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 mr-1">Filtres actifs :</span>

            {cityFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <MapPin className="w-3 h-3 text-brand-teal" />
                <span>Ville : {cityFilter}</span>
                <button onClick={() => setCityFilter('')} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {formatFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Laptop className="w-3 h-3" />
                <span>{formatFilter === 'IN_PERSON' ? 'Sur place' : 'À distance'}</span>
                <button onClick={() => setFormatFilter('ALL')} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDomains.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-brand-teal border border-teal-200"
              >
                <span>{d}</span>
                <button onClick={() => toggleDomain(d)} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedIslands.map((isl) => (
              <span
                key={isl}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200"
              >
                <span>{isl}</span>
                <button onClick={() => toggleIsland(isl)} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedOrgs.map((o) => (
              <span
                key={o}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200"
              >
                <Building2 className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{o}</span>
                <button onClick={() => toggleOrg(o)} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {keyword && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <span>"{keyword}"</span>
                <button onClick={() => setKeyword('')} className="hover:text-rose-600 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. LISTE DES CARTES DE MISSIONS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Recherche des missions disponibles...</p>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">
              Aucune mission ne correspond exactement à ces critères
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Modifiez vos filtres de ville, matière ou île, ou déposez une candidature spontanée pour être sollicité dès qu'une demande correspondante est enregistrée.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={resetAllFilters}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Réinitialiser les filtres
              </button>
              <Link
                to="/devenir-benevole"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors"
              >
                Déposer une candidature spontanée
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((m) => {
              const isRemote = m.format === 'REMOTE';
              const isEither = m.format === 'EITHER';

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-brand-teal/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    {/* Header carte : Domaine & Format */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-brand-teal border border-teal-100">
                        {m.subject_name}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isRemote
                            ? 'bg-blue-50 text-brand-blue border border-blue-200'
                            : isEither
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <Laptop className="w-3 h-3" />
                        <span>{m.format_display}</span>
                      </span>
                    </div>

                    {/* Titre cliquable qui navigue vers la page détail */}
                    <Link
                      to={`/missions/${m.id}`}
                      className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-blue transition-colors hover:underline"
                    >
                      {m.title}
                    </Link>

                    {/* Organisation & Auteur */}
                    <div className="text-[11px] text-slate-500 font-medium">
                      Publié par <strong className="text-slate-700">{m.published_by || 'Coordination'}</strong> de l'organisation <span className="text-brand-teal font-semibold">{m.organization_name || 'Solidarité Éducative'}</span>
                    </div>

                    {/* Description concise */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {m.description}
                    </p>

                    {/* Meta infos (Lieu, Niveau, Organisation) */}
                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                        <span className="truncate">
                          {m.city ? `${m.city} • ` : ''}{m.island}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Rythme : <strong>{m.expected_commitment}</strong></span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Niveau : <strong className="text-slate-700">{m.school_level}</strong></span>
                        <span>{m.applications_count} candidature{m.applications_count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions de bas de carte */}
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/missions/${m.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-blue hover:text-white hover:bg-brand-blue border border-brand-blue/30 transition-all"
                    >
                      Détails de la mission
                    </Link>

                    <Link
                      to={`/devenir-benevole?mission=${m.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <span>Candidater</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
