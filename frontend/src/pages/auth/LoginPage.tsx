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
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center mx-auto shadow-sm">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-blue">
          Connexion à votre espace
        </h1>
        <p className="text-xs text-slate-500">
          Accédez à votre espace sécurisé selon votre rôle.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse e-mail</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-brand-teal focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-teal hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow transition-colors"
        >
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>

        <div className="text-center text-xs text-slate-500 pt-2">
          Pas encore de compte ?{' '}
          <Link to="/demande-soutien" className="text-brand-teal font-semibold hover:underline">
            Inscrire un élève
          </Link>{' '}
          ou{' '}
          <Link to="/devenir-benevole" className="text-brand-teal font-semibold hover:underline">
            Devenir bénévole
          </Link>
        </div>
      </form>

      {/* Comptes Démo en 1 Clic */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <UserCheck className="w-4 h-4 text-brand-teal" />
          <span>Comptes de démonstration pré-configurés (1 clic) :</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => selectDemoAccount('coordinateur@benevolat.km', 'pass1234')}
            className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-brand-teal transition-all"
          >
            <strong className="block text-brand-blue">Coordinateur</strong>
            <span className="text-slate-500 text-[10px]">Matching, demandes</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('aminata.benevole@benevolat.km', 'pass1234')}
            className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-brand-teal transition-all"
          >
            <strong className="block text-brand-blue">Bénévole</strong>
            <span className="text-slate-500 text-[10px]">Séances, comptes rendus</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('fatima.parent@benevolat.km', 'pass1234')}
            className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-brand-teal transition-all"
          >
            <strong className="block text-brand-blue">Parent d'élève</strong>
            <span className="text-slate-500 text-[10px]">Suivi de son enfant</span>
          </button>

          <button
            type="button"
            onClick={() => selectDemoAccount('protection@benevolat.km', 'pass1234')}
            className="p-2 text-left rounded-lg bg-white border border-slate-200 hover:border-brand-teal transition-all"
          >
            <strong className="block text-rose-700">Protection Mineurs</strong>
            <span className="text-slate-500 text-[10px]">Signalements sensibles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
