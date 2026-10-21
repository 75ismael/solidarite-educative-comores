import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, extractResults } from '../../api/client';
import { PublicMission, Subject } from '../../types';
import { HeartHandshake, MapPin, Clock, Search, Filter, BookOpen } from 'lucide-react';

export const PublicMissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<PublicMission[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedIsland, setSelectedIsland] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/pedagogy/subjects/'),
      apiClient.get('/volunteering/missions/'),
    ])
      .then(([subRes, misRes]) => {
        setSubjects(extractResults<Subject>(subRes.data));
        setMissions(extractResults<PublicMission>(misRes.data));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredMissions = missions.filter((m) => {
    const title = m.title || '';
    const desc = m.description || '';
    const island = m.island || '';
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || m.subject_name === selectedSubject;
    const matchesIsland = !selectedIsland || island.includes(selectedIsland);
    return matchesSearch && matchesSubject && matchesIsland;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-brand-teal text-xs font-semibold">
          <HeartHandshake className="w-4 h-4" /> Appels au bénévolat (Missions anonymisées)
        </div>
        <h1 className="text-3xl font-extrabold text-brand-blue">
          Rejoignez un élève en difficulté scolaire
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Pour préserver la vie privée des enfants, les missions publiées sont strictement anonymisées.
          Sélectionnez une mission correspondant à vos compétences et disponibilités.
        </p>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-teal"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-brand-teal"
          >
            <option value="">Toutes les matières</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedIsland}
            onChange={(e) => setSelectedIsland(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-brand-teal"
          >
            <option value="">Toutes les îles / zones</option>
            <option value="Grande Comore">Grande Comore (Ngazidja)</option>
            <option value="Anjouan">Anjouan (Ndzuwani)</option>
            <option value="Mohéli">Mohéli (Mwali)</option>
          </select>
        </div>
      </div>

      {/* Liste des cartes de missions */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Chargement des missions disponibles...</div>
      ) : filteredMissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">Aucune mission ne correspond à ces critères</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vous pouvez déposer une candidature spontanée pour être sollicité dès qu'une nouvelle demande correspond à vos matières.
          </p>
          <Link
            to="/devenir-benevole"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-bold"
          >
            Déposer une candidature spontanée
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-brand-teal transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-100 text-cyan-900">
                    {m.subject_name}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {m.school_level}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {m.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {m.description}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.island} {m.city ? `• ${m.city}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rythme : {m.expected_commitment}</span>
                  </div>
                  <div className="text-teal-700 font-medium">
                    Format : {m.format_display}
                  </div>
                </div>
              </div>

              <Link
                to={`/devenir-benevole?mission=${m.id}`}
                className="w-full text-center py-2.5 rounded-xl bg-brand-blue hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Candidater à cette mission
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
