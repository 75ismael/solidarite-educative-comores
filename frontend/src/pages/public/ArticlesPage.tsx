import React, { useEffect, useState } from 'react';
import { apiClient, extractResults } from '../../api/client';
import { Article } from '../../types';
import {
  FileText,
  Calendar,
  User,
  Tag,
  Search,
  ArrowUpDown,
  X,
  RotateCcw,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  useEffect(() => {
    apiClient
      .get('/cms/articles/')
      .then((res) => setArticles(extractResults<Article>(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'ALL', label: 'Toutes les publications' },
    { key: 'NEWS', label: 'Actualités du projet' },
    { key: 'PEDAGOGY', label: 'Pédagogie & Méthodes' },
    { key: 'COMMUNITY', label: 'Vie associative' },
  ];

  // Filtrage combiné : catégorie + recherche textuelle
  const filtered = articles.filter((a) => {
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
      a.content.toLowerCase().includes(q) ||
      a.author_name.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Tri dynamique
  const sortedArticles = [...filtered].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
    }
    return 0;
  });

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSortBy('recent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header section */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-brand-blue text-xs font-semibold">
          <FileText className="w-3.5 h-3.5 text-brand-teal" /> Vie associative & Conseils pédagogiques
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-blue tracking-tight">
          Actualités & Bilans d'activités
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Suivez les étapes du projet solidaire aux Comores, les retours d'expérience et les conseils méthodologiques partagés par nos tuteurs bénévoles.
        </p>

        {/* Toolbar: Search, Sort & Categories */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé, titre, extrait ou auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Menu */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-teal" />
                <span className="font-medium hidden sm:inline">Trier par :</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'title')}
                className="w-full sm:w-auto text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-brand-teal"
              >
                <option value="recent">Plus récents d'abord</option>
                <option value="oldest">Plus anciens d'abord</option>
                <option value="title">Titre (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Categories Pills & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === c.key
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {sortedArticles.length} publication{sortedArticles.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Compact Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">Chargement des articles...</div>
      ) : sortedArticles.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <p>Aucun article ne correspond à vos critères de recherche ou de filtre.</p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => setReadingArticle(art)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-brand-teal transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Compact Thumbnail Banner */}
                {art.image_url ? (
                  <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={art.image_url}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-brand-teal font-bold text-[10px] shadow-xs">
                        {art.category_display || art.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-full bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-between px-4">
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-brand-teal font-bold text-[10px]">
                      {art.category_display || art.category}
                    </span>
                    <FileText className="w-6 h-6 text-brand-teal/30" />
                  </div>
                )}

                {/* Content body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(art.published_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~2 min
                    </span>
                  </div>

                  <h2 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {art.excerpt || art.content.slice(0, 110) + '...'}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px] flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{art.author_name}</span>
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-teal group-hover:underline">
                  <span>Lire</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* MODAL: Lecture complète d'un article */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header Image (if exists) */}
            {readingArticle.image_url && (
              <div className="w-full h-52 sm:h-64 overflow-hidden rounded-t-3xl relative bg-slate-100">
                <img
                  src={readingArticle.image_url}
                  alt={readingArticle.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setReadingArticle(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4 pt-4">
              {!readingArticle.image_url && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setReadingArticle(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-brand-teal font-bold text-xs">
                  {readingArticle.category_display || readingArticle.category}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(readingArticle.published_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <User className="w-3.5 h-3.5" /> {readingArticle.author_name}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {readingArticle.title}
              </h2>

              {/* Excerpt if present */}
              {readingArticle.excerpt && (
                <p className="text-xs sm:text-sm text-slate-700 font-medium italic border-l-2 border-brand-teal pl-3 py-0.5 bg-slate-50 rounded-r-lg">
                  {readingArticle.excerpt}
                </p>
              )}

              {/* Full Content */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line pt-2 border-t border-slate-100">
                {readingArticle.content}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Fermer la lecture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
