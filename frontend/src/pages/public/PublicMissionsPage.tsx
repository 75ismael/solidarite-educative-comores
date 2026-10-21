import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractResults } from '../../api/client';
import { PublicMission, Subject } from '../../types';
import {
  HeartHandshake,
  MapPin,
  Clock,
  Search,
  Filter,
  BookOpen,
  ChevronDown,
  X,
  Check,
  Building2,
  Laptop,
  Users,
  RotateCcw,
  Calendar,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface EnhancedMission extends PublicMission {
  organization?: string;
}

// Missions initiales de démonstration réalistes pour illustrer tous les filtres (Villes, Domaines, Îles, Organisations)
const INITIAL_DEMO_MISSIONS: EnhancedMission[] = [
  {
    id: 101,
    title: 'Soutien en Français & Écriture - Niveau Primaire (CM2)',
    subject: 1,
    subject_name: 'Français & Lecture',
    school_level: 'Primaire (CM2)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Moroni',
    format: 'REMOTE',
    format_display: 'À distance (visio/téléphone)',
    description: "Mission d'accompagnement individuel d'un élève préparant son entrée en 6ème. Consolidation de la fluidité de lecture, orthographe grammaticale et compréhension de texte.",
    expected_commitment: '1h30 par semaine',
    status: 'OPEN',
    status_display: 'Appel ouvert',
    deadline: '2026-11-15',
    created_at: '2026-10-20',
    applications_count: 2,
    organization: 'Solidarité Éducative Comores',
  },
  {
    id: 102,
    title: 'Renforcement en Mathématiques - Classe de 3ème (Brevet)',
    subject: 2,
    subject_name: 'Mathématiques',
    school_level: 'Collège (3ème)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Mitsamiouli',
    format: 'IN_PERSON',
    format_display: 'Sur place (Présentiel)',
    description: "Accompagnement méthodique pour la préparation du Brevet des Collèges : calcul littéral, théorème de Pythagore et de Thalès, résolution de problèmes appliqués.",
    expected_commitment: '2h par semaine',
    status: 'OPEN',
    status_display: 'Appel ouvert',
    deadline: '2026-11-20',
    created_at: '2026-10-19',
    applications_count: 4,
    organization: 'Collège Rural de Mitsamiouli',
  },
  {
    id: 103,
    title: 'Accompagnement en Sciences Physiques - Lycée (Terminale C/D)',
    subject: 3,
    subject_name: 'Physique-Chimie',
    school_level: 'Lycée (Terminale)',
    island: 'Anjouan (Ndzuwani)',
    city: 'Mutsamudu',
    format: 'EITHER',
    format_display: 'Sur place ou à distance',
    description: "Préparation intensive au Baccalauréat scientifique comorien. Révision des notions de mécanique newtonienne, circuits RLC, cinétique chimique et titrages.",
    expected_commitment: '2h par semaine',
    status: 'OPEN',
    status_display: 'Appel ouvert',
    deadline: '2026-11-10',
    created_at: '2026-10-18',
    applications_count: 1,
    organization: 'Lycée Saïd Mohamed Cheikh',
  },
  {
    id: 104,
    title: "Initiation & Perfectionnement en Anglais - Collège (4ème/3ème)",
    subject: 4,
    subject_name: 'Anglais',
    school_level: 'Collège (4ème)',
    island: 'Mohéli (Mwali)',
    city: 'Fomboni',
    format: 'REMOTE',
    format_display: 'À distance (visio/téléphone)',
    description: "Aide à la prise de parole orale en anglais, enrichissement du vocabulaire courant, prononciation et repères grammaticaux pour redonner confiance à l'élève.",
    expected_commitment: '1h par semaine',
    status: 'OPEN',
    status_display: 'Appel ouvert',
    deadline: '2026-11-25',
    created_at: '2026-10-21',
    applications_count: 3,
    organization: 'Relais Éducatif de Fomboni',
  },
  {
    id: 105,
    title: 'Aide aux Devoirs & Méthodologie Générale - Primaire (CE2/CM1)',
    subject: 5,
    subject_name: 'Aide aux devoirs & Méthodologie',
    school_level: 'Primaire (CM1)',
    island: 'Grande Comore (Ngazidja)',
    city: 'Iconi',
    format: 'IN_PERSON',
    format_display: 'Sur place (Présentiel)',
    description: "Accompagnement aux devoirs du soir, organisation du cahier de texte, apprentissage des leçons et mise en place de routines d'apprentissage stimulantes.",
    expected_commitment: '2h par semaine',
    status: 'OPEN',
    status_display: 'Appel ouvert',
    deadline: '2026-11-18',
    created_at: '2026-10-20',
    applications_count: 1,
    organization: 'École Primaire Moroni Sud',
  },
  {
    id: 106,
    title: 'Sciences de la Vie et de la Terre (SVT) - Première Générale',
    subject: 6,
    subject_name: 'Sciences de la Vie et de la Terre (SVT)',
    school_level: 'Lycée (1ère)',
    island: 'Anjouan (Ndzuwani)',
    city: 'Domoni',
    format: 'REMOTE',
    format_display: 'À distance (visio/téléphone)',
    description: "Aide à la rédaction scientifique, étude de la génétique et de la dynamique interne de la Terre. Travail sur les schémas bilans et la méthodologie de synthèse.",
    expected_commitment: '1h30 par semaine',
    status: 'OPEN',
    status_display: 'Appel ouvert',
    deadline: '2026-11-30',
    created_at: '2026-10-17',
    applications_count: 0,
    organization: 'Solidarité Éducative Comores',
  },
];

export const PublicMissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<EnhancedMission[]>([]);
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

  // Modal aperçu mission
  const [inspectMission, setInspectMission] = useState<EnhancedMission | null>(null);

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

  // Chargement des missions et des matières depuis l'API
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
          // Fusionner missions réelles et enrichissement démo si nécessaire
          const formatted: EnhancedMission[] = apiMissions.map((m) => ({
            ...m,
            organization: (m as EnhancedMission).organization || 'Solidarité Éducative Comores',
          }));
          // Compléter si peu de missions afin d'assurer une expérience de filtre complète
          const ids = new Set(formatted.map((m) => m.id));
          const complementary = INITIAL_DEMO_MISSIONS.filter((dm) => !ids.has(dm.id));
          setMissions([...formatted, ...complementary]);
        } else {
          setMissions(INITIAL_DEMO_MISSIONS);
        }
      })
      .catch(() => {
        setMissions(INITIAL_DEMO_MISSIONS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listes d'options pour les dropdowns
  const availableDomains = useMemo(() => {
    const list = new Set<string>();
    subjects.forEach((s) => list.add(s.name));
    missions.forEach((m) => {
      if (m.subject_name) list.add(m.subject_name);
    });
    // Compléments usuels
    ['Français & Lecture', 'Mathématiques', 'Physique-Chimie', 'Sciences de la Vie et de la Terre (SVT)', 'Anglais', 'Aide aux devoirs & Méthodologie', 'Histoire-Géographie'].forEach((d) => list.add(d));
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
      if (m.organization) list.add(m.organization);
    });
    list.add('Solidarité Éducative Comores');
    list.add('Lycée Saïd Mohamed Cheikh');
    list.add('Collège Rural de Mitsamiouli');
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
        if (!missionCity.includes(queryCity) && !missionIsland.includes(queryCity)) {
          return false;
        }
      }

      // 2. Format : Sur place / À distance
      if (formatFilter === 'IN_PERSON') {
        if (m.format !== 'IN_PERSON' && m.format !== 'EITHER') return false;
      } else if (formatFilter === 'REMOTE') {
        if (m.format !== 'REMOTE' && m.format !== 'EITHER') return false;
      }

      // 3. Domaines (Matières)
      if (selectedDomains.length > 0) {
        const subjName = m.subject_name || '';
        const match = selectedDomains.some((d) => subjName.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(subjName.toLowerCase()));
        if (!match) return false;
      }

      // 4. Île (Ngazidja etc)
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
        const org = m.organization || 'Solidarité Éducative Comores';
        if (!selectedOrgs.includes(org)) return false;
      }

      // 6. Mot-clé libre
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description.toLowerCase().includes(q);
        const matchLevel = (m.school_level || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLevel) return false;
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
      {/* 1. HERO BANNER & TITRE */}
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
            votre île de cœur ou accompagnez à distance depuis la France et la diaspora.
          </p>
        </div>
      </section>

      {/* 2. BARRE DE RECHERCHE ET DE FILTRES MULTICRITÈRES */}
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
                  <div className="text-xs truncate">
                    {selectedDomains.length === 0
                      ? '0 filtre sélectionné'
                      : `${selectedDomains.length} sélectionné${selectedDomains.length > 1 ? 's' : ''}`}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    openDropdown === 'DOMAINS' ? 'rotate-180 text-brand-teal' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Popover Domaines */}
              {openDropdown === 'DOMAINS' && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Matières & Disciplines</span>
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

            {/* 4. ILE (NGAZIDJA ETC) (0 filtre sélectionné) */}
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
                  <div className="text-xs truncate">
                    {selectedIslands.length === 0
                      ? '0 filtre sélectionné'
                      : `${selectedIslands.length} sélectionnée${selectedIslands.length > 1 ? 's' : ''}`}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    openDropdown === 'ISLANDS' ? 'rotate-180 text-brand-teal' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Popover Îles */}
              {openDropdown === 'ISLANDS' && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
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

            {/* 5. ORGANISATIONS (0 filtre sélectionné) */}
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
                  <div className="text-xs truncate">
                    {selectedOrgs.length === 0
                      ? '0 filtre sélectionné'
                      : `${selectedOrgs.length} sélectionnée${selectedOrgs.length > 1 ? 's' : ''}`}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    openDropdown === 'ORGS' ? 'rotate-180 text-brand-teal' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Popover Organisations */}
              {openDropdown === 'ORGS' && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Établissements & Relais</span>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
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
                <span>Mot-clé : "{keyword}"</span>
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
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

                    {/* Titre */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-blue transition-colors">
                      {m.title}
                    </h3>

                    {/* Description */}
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
                        <span>Engagement : <strong>{m.expected_commitment}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{m.organization || 'Solidarité Éducative Comores'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>Niveau : <strong className="text-slate-700">{m.school_level}</strong></span>
                        <span>{m.applications_count} candidature{m.applications_count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions de bas de carte */}
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectMission(m)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                    >
                      Détails
                    </button>

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

      {/* 5. MODAL APERÇU DÉTAILLÉ DE LA MISSION */}
      {inspectMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-brand-teal border border-teal-100">
                  {inspectMission.subject_name}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {inspectMission.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectMission(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Zone géographique :</span>
                <span className="font-bold text-slate-800">{inspectMission.city ? `${inspectMission.city}, ` : ''}{inspectMission.island}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Format d'intervention :</span>
                <span className="font-bold text-brand-teal">{inspectMission.format_display}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Niveau de l'élève :</span>
                <span className="font-bold text-slate-800">{inspectMission.school_level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rythme suggéré :</span>
                <span className="font-bold text-slate-800">{inspectMission.expected_commitment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Organisation responsable :</span>
                <span className="font-bold text-slate-800">{inspectMission.organization || 'Solidarité Éducative Comores'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Descriptif des besoins
              </h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {inspectMission.description}
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-900 text-[11px] border border-amber-200">
              <Info className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                Pour la sécurité des enfants, les coordonnées réelles de l'élève sont communiquées uniquement après validation de votre profil bénévole et vérification de la charte.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectMission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Fermer
              </button>
              <Link
                to={`/devenir-benevole?mission=${inspectMission.id}`}
                className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Candidater à cette mission</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
