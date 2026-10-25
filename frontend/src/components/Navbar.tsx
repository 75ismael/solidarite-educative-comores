import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
  FileText,
  Heart,
  ChevronDown,
  GraduationCap,
  Info,
  PhoneCall,
  Award,
  ArrowRight,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAboutDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
  }, [location.pathname, location.hash]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setAboutDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 150);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCurrent = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const isAboutActive = ['/a-propos', '/programmes', '/charte-ethique', '/rapport-impact'].includes(
    location.pathname
  );

  return (
    <header className="sticky top-0 z-40 w-full shadow-2xl border-b border-[#281F4B] transition-all">
      {/* ── 1. Bandeau supérieur : Mon compte + Publier une mission + Protection ── */}
      <aside aria-label="Bandeau officiel" className="bg-[#070512] text-slate-400 text-xs border-b border-[#1E173E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-4">

          {/* Gauche : statut plateforme */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="font-medium text-slate-400 hidden md:inline">
              Plateforme associative &bull; Soutien scolaire gratuit Comores &ndash; France
            </span>
            <span className="font-medium text-slate-400 md:hidden">
              Solidarité Éducative
            </span>
          </div>

          {/* Droite : actions rapides réorganisées */}
          <div className="flex items-center gap-1 sm:gap-3">

            {/* 1. Publier une mission */}
            <Link
              to="/publier-mission"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                isCurrent('/publier-mission')
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40'
              }`}
            >
              <PlusCircle className="w-3 h-3 text-purple-400" />
              <span className="hidden sm:inline">Publier une mission</span>
              <span className="sm:hidden">Publier</span>
            </Link>

            <span className="text-slate-700">|</span>

            {/* 2. Protection des mineurs */}
            <Link
              to="/signalement-protection"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-rose-300 hover:text-rose-200 hover:bg-white/5 font-semibold transition-colors"
              title="Canal confidentiel de protection des mineurs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Protection des mineurs</span>
              <span className="sm:hidden">Protection</span>
            </Link>

            <span className="text-slate-700">|</span>

            {/* 3. Mon compte (tout à droite) */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all shadow-xs"
                >
                  <LayoutDashboard className="w-3 h-3 text-purple-400" />
                  <span>
                    {user?.role === 'VOLUNTEER'
                      ? 'Portail Bénévole'
                      : user?.role === 'COORDINATOR'
                      ? 'Coordination'
                      : user?.role === 'PARENT'
                      ? 'Espace Famille'
                      : 'Mon compte'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-slate-400 hover:text-rose-300 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden md:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all shadow-xs"
              >
                <UserIcon className="w-3 h-3 text-purple-400" />
                <span>Mon compte</span>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ── 2. Navigation principale ── */}
      <nav aria-label="Navigation principale" className="bg-[#0B0817]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">

            {/* Logo & Identité */}
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0 group py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-purple-950/60 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="w-5 h-5 text-purple-200" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-tight group-hover:text-purple-300 transition-colors">
                  Solidarité Éducative
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                  <span>Comores</span>
                  <span className="w-1 h-1 rounded-full bg-purple-400/60"></span>
                  <span>France</span>
                </div>
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-300">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isCurrent('/')
                    ? 'text-white font-bold bg-purple-600/20 border border-purple-500/30'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                Accueil
              </Link>

              {/* Menu Déroulant "L'Association" */}
              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  aria-expanded={aboutDropdownOpen}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    isAboutActive || aboutDropdownOpen
                      ? 'text-white font-bold bg-purple-600/20 border border-purple-500/30'
                      : 'hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>L'Association</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      aboutDropdownOpen ? 'rotate-180 text-purple-400' : ''
                    }`}
                  />
                </button>

                {aboutDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-1.5 w-72 bg-[#140F2D] rounded-2xl shadow-2xl border border-[#2B2353] p-2 z-50 transition-all duration-150 backdrop-blur-md"
                  >
                    <Link
                      to="/a-propos"
                      onClick={() => setAboutDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-950/70 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          À Propos &amp; Histoire
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          Notre mission, genèse associative et équipe
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/programmes"
                      onClick={() => setAboutDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/70 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          Programmes Scolaires
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          Accompagnement Primaire, Collège et Lycée
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/rapport-impact"
                      onClick={() => setAboutDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/70 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Rapport d'Impact
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          Bilan officiel consolidé et indicateurs clés
                        </div>
                      </div>
                    </Link>

                    <div className="my-1 border-t border-[#2B2353]"></div>

                    <Link
                      to="/charte-ethique"
                      onClick={() => setAboutDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-rose-950/30 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-950/70 text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                          Charte Éthique &amp; Mineurs
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          Cadre déontologique et sauvegarde des élèves
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/missions"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isCurrent('/missions')
                    ? 'text-white font-bold bg-purple-600/20 border border-purple-500/30'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                Missions
              </Link>

              <Link
                to="/actualites"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isCurrent('/actualites')
                    ? 'text-white font-bold bg-purple-600/20 border border-purple-500/30'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                Actualités
              </Link>

              <Link
                to="/transparence"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isCurrent('/transparence')
                    ? 'text-white font-bold bg-purple-600/20 border border-purple-500/30'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                Transparence
              </Link>

              <Link
                to="/contact"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isCurrent('/contact')
                    ? 'text-white font-bold bg-purple-600/20 border border-purple-500/30'
                    : 'hover:text-white hover:bg-white/5'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Actions Desktop (Droite) - Style Scaleway (Pillules & Outlines) */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                to="/transparence#faire-un-don"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all shadow-xs"
                title="Soutenir l'action bénévole aux Comores"
              >
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
                <span>Faire un don</span>
              </Link>

              <Link
                to="/demande-soutien"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] transition-all"
              >
                <span>Demander de l'aide</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-200" />
              </Link>
            </div>

            {/* Mobile Actions Header */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <Link
                to="/transparence#faire-un-don"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white text-xs font-bold shadow-xs"
              >
                <Heart className="w-3 h-3 fill-white" />
                <span>Don</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 border border-white/15 transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── 3. Mobile Drawer ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 top-[88px] sm:top-[92px] bg-black/60 backdrop-blur-xs z-40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Tiroir coulissant */}
            <div className="absolute top-full left-0 right-0 bg-[#0E0A20] border-b border-[#281F4B] shadow-2xl px-5 pt-3 pb-8 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto z-50 text-slate-200">

              {/* ── Mon compte + Publier (tout en haut du drawer) ── */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/publier-mission"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full font-bold text-xs shadow-sm transition-colors ${
                    isCurrent('/publier-mission')
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-950/50 border border-purple-800/50 text-purple-300 hover:bg-purple-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Publier mission</span>
                </Link>

                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white/10 border border-white/15 text-white font-bold text-xs shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {user?.role === 'VOLUNTEER'
                        ? 'Portail Bénévole'
                        : user?.role === 'COORDINATOR'
                        ? 'Coordination'
                        : user?.role === 'PARENT'
                        ? 'Espace Famille'
                        : 'Mon compte'}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border border-white/15 text-slate-200 font-bold text-xs hover:bg-white/5 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mon compte</span>
                  </Link>
                )}
              </div>

              {/* Navigation principale */}
              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Navigation
                </div>

                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isCurrent('/') ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  Accueil
                </Link>

                {/* Accordéon "L'Association" */}
                <div className="rounded-xl border border-[#281F4B] bg-[#140F2D] p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span className="uppercase tracking-wider">L'Association</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        mobileAboutOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {mobileAboutOpen && (
                    <div className="space-y-0.5 pt-1 pl-1">
                      <Link
                        to="/a-propos"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isCurrent('/a-propos') ? 'text-white font-bold bg-purple-600/30 shadow-sm' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Info className="w-4 h-4 text-purple-400" />
                        <span>À Propos &amp; Histoire</span>
                      </Link>
                      <Link
                        to="/programmes"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isCurrent('/programmes') ? 'text-white font-bold bg-purple-600/30 shadow-sm' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span>Programmes Scolaires</span>
                      </Link>
                      <Link
                        to="/rapport-impact"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isCurrent('/rapport-impact') ? 'text-white font-bold bg-purple-600/30 shadow-sm' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Rapport d'Impact</span>
                      </Link>
                      <Link
                        to="/charte-ethique"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                          isCurrent('/charte-ethique') ? 'text-white font-bold bg-purple-600/30 shadow-sm' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                        <span>Charte Éthique &amp; Mineurs</span>
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  to="/missions"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isCurrent('/missions') ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-purple-400" />
                  <span>Missions de bénévolat</span>
                </Link>

                <Link
                  to="/actualites"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isCurrent('/actualites') ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Actualités &amp; Bilans</span>
                </Link>

                <Link
                  to="/transparence"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isCurrent('/transparence') ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Transparence &amp; Dons</span>
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isCurrent('/contact') ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-slate-400" />
                  <span>Contact &amp; Relais locaux</span>
                </Link>

                {/* Protection mineurs */}
                <div className="pt-2">
                  <Link
                    to="/signalement-protection"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-800/40"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Protection des mineurs (Signalement)</span>
                  </Link>
                </div>
              </div>

              {/* Section CTAs + Déconnexion */}
              <div className="pt-4 border-t border-[#281F4B] space-y-2.5">
                <Link
                  to="/transparence#faire-un-don"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Faire un don solidaire</span>
                </Link>

                <Link
                  to="/demande-soutien"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40"
                >
                  <span>Demander de l'aide</span>
                  <ArrowRight className="w-4 h-4 text-purple-200" />
                </Link>

                <Link
                  to="/devenir-benevole"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-purple-950/40 border border-purple-800/50 text-purple-300 font-bold text-xs"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Devenir bénévole</span>
                </Link>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2 text-rose-400 text-xs font-semibold hover:bg-rose-950/30 rounded-lg cursor-pointer transition-colors"
                  >
                    Se déconnecter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
