import { useState, useEffect, type FormEvent } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ScheduleItem {
  day: string;
  focus: string;
  duration: string;
  techniques: string[];
  resources: string[];
  completed: boolean;
}

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface PlanResponse {
  _id?: string;
  goal: string;
  deadline: string | null;
  difficultyLevel: string;
  totalDays: number;
  estimatedHoursPerDay: number;
  schedule: ScheduleItem[];
  dailyGoals: string[];
  recommendations: string[];
  studyTechniques: string[];
  resources: Resource[];
}

const PlannerPage = () => {
  const { t } = useLanguage();
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [savedPlans, setSavedPlans] = useState<PlanResponse[]>([]);
  const [status, setStatus] = useState(() => t('planStatusIdle'));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const loadSavedPlans = async () => {
    try {
      const response = await api.get('/planner');
      setSavedPlans(response.data);
    } catch (err) {
      console.error('Failed to load saved plans:', err);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm(t('deletePlanConfirm'))) return;
    try {
      await api.delete(`/planner/${id}`);
      setSavedPlans((prev) => prev.filter((p) => p._id !== id));
      if (plan?._id === id) setPlan(null);
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();

    if (!goal.trim()) {
      setStatus(t('planGoalRequired'));
      return;
    }

    setLoading(true);
    setStatus(t('planStatusLoading'));

    try {
      const response = await api.post('/planner', { 
        input: goal, 
        deadline: deadline || undefined,
        difficultyLevel: difficulty 
      });
      setPlan(response.data);
      setStatus(t('planStatusReady'));
      loadSavedPlans();
      setLoading(false);
    } catch (err) {
      setStatus(t('planStatusError'));
      setLoading(false);
      console.error(err);
    }
  };

  const toggleDayComplete = async (dayIndex: number) => {
    if (!plan || !plan._id) return;

    try {
      const completed = !plan.schedule[dayIndex].completed;
      const response = await api.patch(`/planner/${plan._id}/progress`, {
        dayIndex,
        completed
      });
      setPlan(response.data);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const exportToText = () => {
    if (!plan) return;
    const content = `
${plan.goal}
Difficulty: ${plan.difficultyLevel}
Total Duration: ${plan.totalDays} days
Daily Study Time: ${plan.estimatedHoursPerDay} hours

STUDY SCHEDULE:
${plan.schedule.map((d) => `${d.day}: ${d.focus} (${d.duration})`).join('\n')}

DAILY GOALS:
${plan.dailyGoals.join('\n')}

STUDY TECHNIQUES:
${plan.studyTechniques.join('\n')}

RECOMMENDATIONS:
${plan.recommendations.join('\n')}
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `StudyPlan_${plan.goal.replace(/\s+/g, '_')}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{t('plannerTitle')}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{t('buildSchedule')}</h2>
          <p className="mt-3 max-w-2xl text-slate-400">{t('plannerDesc')}</p>
        </div>
        <div className="mt-6 rounded-[2rem] bg-slate-950/90 p-6 text-slate-200">
          <p>{status}</p>
        </div>
      </section>

      <div className="flex gap-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'generate' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('generatePlan')}
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'saved' ? 'border-b-2 border-violet-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {`${t('savedPlans')} (${savedPlans.length})`}
        </button>
      </div>

      {activeTab === 'generate' && (
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card">
            <h3 className="text-lg font-semibold text-white">{t('createStudyPlan')}</h3>
            <form onSubmit={handleGenerate} className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">
                {t('studyGoal')}
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={t('studyGoalPlaceholder')}
                  className="input-field"
                />
              </label>

              <label className="block text-sm text-slate-300">
                {t('deadlineOptional')}
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-field"
                />
              </label>

              <label className="block text-sm text-slate-300">
                {t('difficultyLevel')}
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="beginner">{t('beginner')}</option>
                  <option value="intermediate">{t('intermediate')}</option>
                  <option value="advanced">{t('advanced')}</option>
                </select>
              </label>

              <button
                type="submit"
                className="button-primary w-full justify-center"
                disabled={loading}
              >
                {loading ? t('generating') : `✨ ${t('generatePlan')}`}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-slate-950 p-8 shadow-xl shadow-slate-950/20">
            <h3 className="text-lg font-semibold text-white">{t('quickTips')}</h3>
            <div className="mt-6 space-y-4 text-sm text-slate-400">
              <p>💡 <strong>{t('proTip')}</strong> {t('proTipText')}</p>
              <p>🎯 <strong>{t('chooseLevel')}</strong> {t('chooseLevelText')}</p>
              <p>📅 <strong>{t('planAhead')}</strong> {t('planAheadText')}</p>
              <p>📊 <strong>{t('dataDriven')}</strong> {t('dataDrivenText')}</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'saved' && (
        <section className="space-y-4">
          {savedPlans.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-slate-400">{t('noSavedPlans')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedPlans.map((p) => (
                <div key={p._id} className="card flex items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setPlan(p);
                      setActiveTab('generate');
                    }}
                    className="flex-1 text-left"
                  >
                    <p className="font-semibold text-white">{p.goal}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {p.totalDays} {t('days')} • {p.difficultyLevel} {t('level')} • {p.estimatedHoursPerDay}{t('hPerDay')}
                    </p>
                  </button>
                  <button
                    onClick={() => deletePlan(p._id!)}
                    className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400 shrink-0"
                  >
                    {t('delete')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {plan && (
        <section className="space-y-6">
          <div className="card">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-white">{plan.goal}</h2>
                <p className="mt-2 text-slate-400">
                  {plan.totalDays} {t('days')} • {plan.difficultyLevel} {t('level')} • {plan.estimatedHoursPerDay}{t('hPerDay')}
                </p>
              </div>
              <button onClick={exportToText} className="button-primary">
                📥 {t('export')}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-6">
              <h3 className="font-semibold text-white">📅 {t('studySchedule')}</h3>
              <div className="mt-4 space-y-3">
                {plan.schedule.map((item, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-900 p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleDayComplete(idx)}
                        className="mt-1 w-5 h-5 accent-violet-500"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.day}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">{item.focus}</p>
                        <p className="text-xs text-slate-400 mt-2">⏱️ {item.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-950 p-6">
                <h3 className="font-semibold text-white">🎯 {t('dailyGoals')}</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {plan.dailyGoals.map((goal, idx) => (
                    <li key={idx}>✓ {goal}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-slate-950 p-6">
                <h3 className="font-semibold text-white">🧠 {t('studyTechniques')}</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {plan.studyTechniques.map((tech, idx) => (
                    <li key={idx}>• {tech}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6">
            <h3 className="font-semibold text-white mb-4">📚 {t('recommendedResources')}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plan.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-slate-900 p-4 hover:bg-slate-800 transition"
                >
                  <p className="font-semibold text-white">{resource.title}</p>
                  <p className="text-xs text-violet-400 mt-1">{resource.type}</p>
                  <p className="text-xs text-slate-400 mt-2">{t('openInBrowser')}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6">
            <h3 className="font-semibold text-white mb-4">💡 {t('studyRecommendations')}</h3>
            <div className="grid gap-3">
              {plan.recommendations.map((rec, idx) => (
                <p key={idx} className="text-slate-300 text-sm">{rec}</p>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PlannerPage;
