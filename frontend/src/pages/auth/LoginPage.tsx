import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login/', { email, password });
      login(res.data);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail ||
        "Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 text-slate-100">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-900/40">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Connexion à votre espace
        </h1>
        <p className="text-xs text-slate-400">
          Accédez à votre espace sécurisé selon votre rôle.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#140F2D] rounded-3xl border border-[#281F4B] p-6 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse e-mail</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 border border-[#281F4B] bg-[#0E0A20] text-white placeholder-slate-500 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-900/40 transition-colors"
        >
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>

        <div className="text-center text-xs text-slate-400 pt-2">
          Pas encore de compte ?{' '}
          <Link to="/demande-soutien" className="text-purple-400 font-semibold hover:underline">
            Inscrire un élève
          </Link>{' '}
          ou{' '}
          <Link to="/devenir-benevole" className="text-purple-400 font-semibold hover:underline">
            Devenir bénévole
          </Link>
        </div>
      </form>

      {/* Comptes Démo en 1 Clic */}
      <div className="bg-[#140F2D] border border-[#281F4B] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <UserCheck className="w-4 h-4 text-purple-400" />
          <span>Comptes de démonstration pré-configurés (1 clic) :</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => selectDemoAccount('coordinateur@benevolat.km', 'pass1234')}
            className="p-2.5 text-left rounded-xl bg-[#0E0A20] border border-[#281F4B] hover:border-purple-500/50 hover:bg-[#1A133A] transition-all"
          >
            <strong className="block text-white">Coordinateur</strong>
            <span className="text-slate-400 text-[10px]">Matching, demandes</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('aminata.benevole@benevolat.km', 'pass1234')}
            className="p-2.5 text-left rounded-xl bg-[#0E0A20] border border-[#281F4B] hover:border-purple-500/50 hover:bg-[#1A133A] transition-all"
          >
            <strong className="block text-purple-300">Bénévole</strong>
            <span className="text-slate-400 text-[10px]">Séances, comptes rendus</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('fatima.parent@benevolat.km', 'pass1234')}
            className="p-2.5 text-left rounded-xl bg-[#0E0A20] border border-[#281F4B] hover:border-purple-500/50 hover:bg-[#1A133A] transition-all"
          >
            <strong className="block text-cyan-300">Parent d'élève</strong>
            <span className="text-slate-400 text-[10px]">Suivi de son enfant</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('protection@benevolat.km', 'pass1234')}
            className="p-2.5 text-left rounded-xl bg-[#0E0A20] border border-[#281F4B] hover:border-rose-500/50 hover:bg-[#1A133A] transition-all"
          >
            <strong className="block text-rose-400">Protection Mineurs</strong>
            <span className="text-slate-400 text-[10px]">Signalements sensibles</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
