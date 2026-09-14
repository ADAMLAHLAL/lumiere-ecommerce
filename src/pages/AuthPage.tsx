import { useState, useEffect } from 'react';
import { Sun, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const { signIn, signUp, session, profile, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === 'admin') onNavigate('admin');
      else if (profile.role === 'agent') onNavigate('agent');
      else onNavigate('home');
    }
  }, [session, profile, loading, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
      }
    } else {
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setSubmitting(false);
      } else {
        setError(null);
        setMode('signin');
        setSubmitting(false);
        // Show success message
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center gap-2 mb-8 mx-auto group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
            <Sun className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Lumi<span className="text-amber-400">è</span>re
          </span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {mode === 'signin' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            {mode === 'signin'
              ? 'Accédez à votre espace d\'administration'
              : 'Inscrivez-vous pour rejoindre l\'équipe'}
          </p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                  placeholder="vous@lumiere.fr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Se connecter' : 'S\'inscrire'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-sm text-gray-500 hover:text-amber-600 transition-colors"
            >
              {mode === 'signin'
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Le premier compte créé devient automatiquement administrateur.
        </p>
      </div>
    </div>
  );
}
