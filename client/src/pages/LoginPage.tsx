import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-slate-100">
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-[2rem] bg-gradient-to-br from-purple-700 to-sky-700 p-10 text-white shadow-inner shadow-slate-950/20">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-200">{t('welcomeBack')}</p>
            <h1 className="mt-4 text-4xl font-semibold">{t('finishStrong')}</h1>
          </div>
          <p className="text-slate-200/90">{t('loginDesc')}</p>
          <div className="space-y-4 rounded-3xl bg-white/10 p-6 text-sm text-slate-100">
            <p className="font-semibold">{t('whyStudyTrack')}</p>
            <ul className="space-y-2 pl-4 text-slate-200/90">
              <li>• {t('seeGoals')}</li>
              <li>• {t('trackDeadlines')}</li>
              <li>• {t('planSessions')}</li>
            </ul>
          </div>
        </div>

        <div className="card-soft">
          <h2 className="text-3xl font-semibold text-white">{t('signIn')}</h2>
          <p className="mt-3 text-sm text-slate-400">{t('signInDesc')}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm text-slate-300">
              {t('email')}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </label>
            <label className="block text-sm text-slate-300">
              {t('password')}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </label>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button className="button-primary w-full justify-center" disabled={loading}>
              {loading ? t('signingIn') : t('signInBtn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {t('noAccount')}{' '}
            <Link to="/register" className="font-semibold text-white hover:text-purple-200">
              {t('createOne')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
