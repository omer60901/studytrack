import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, CalendarClock, CheckCircle2, Flame, Plus, Sparkles, Target, Timer, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { exams as seedExams, subjects as seedSubjects, tasks as seedTasks, weekly } from "../data/mock.js";
import { useCollection } from "../hooks/useCollection.js";

export default function Dashboard() {
  const { language, user } = useApp();
  const t = useT(language);
  const { items: tasks } = useCollection("tasks", seedTasks);
  const { items: exams } = useCollection("exams", seedExams);
  const { items: subjects } = useCollection("subjects", seedSubjects);
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((task) => task.dueDate === today && task.status !== "completed").length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CheckCircle2} label={t.dueToday} value={dueToday} note={t.today} />
        <StatCard icon={CalendarClock} label={t.upcoming} value={exams.length} note={exams[0]?.title || "No exams"} />
        <StatCard icon={Timer} label={t.studyTime} value={`${Math.round(tasks.reduce((sum, task) => sum + Number(task.estimatedTime || task.time || 0), 0) / 60)}h`} note="+18% this week" />
        <StatCard icon={Target} label={t.completion} value={`${completionRate}%`} note="Strong momentum" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">{t.weekly}</h2>
            <span className="rounded-lg bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">{t.productivity} 88</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={weekly}>
                <defs><linearGradient id="study" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="hours" stroke="#8B5CF6" fill="url(#study)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 text-xl font-black">{t.quickActions}</h2>
          <div className="grid gap-3">
            <Link className="btn-primary" to="/tasks"><Plus size={18} />{t.addTask}</Link>
            <Link className="btn-soft" to="/exams"><CalendarClock size={18} />{t.addExam}</Link>
            <Link className="btn-soft" to="/focus"><Timer size={18} />{t.startFocus}</Link>
            <Link className="btn-soft" to="/planner"><Sparkles size={18} />{t.generatePlan}</Link>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Mini icon={Trophy} label={t.xp} value={user?.xp || 2840} />
            <Mini icon={BookOpen} label={t.level} value={user?.level || 12} />
            <Mini icon={Flame} label={t.streak} value={user?.streak || 9} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <List title={t.tasks} items={tasks.slice(0, 5).map((task) => `${task.title} - ${task.subjectId?.name || task.subject || "General"}`)} link="/tasks" />
        <List title={t.exams} items={exams.slice(0, 5).map((exam) => `${exam.title} - ${exam.preparationStatus ?? exam.readiness ?? 0}% ready`)} link="/exams" />
      </section>
    </div>
  );
}

function Mini({ icon: Icon, label, value }) {
  return <div className="rounded-lg bg-white/10 p-3 text-center light:bg-slate-100"><Icon className="mx-auto mb-2 text-purple-300" size={18} /><div className="text-xl font-black">{value}</div><div className="text-xs text-slate-400">{label}</div></div>;
}

function List({ title, items, link }) {
  return <div className="panel p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">{title}</h2><Link className="text-sm font-bold text-blue-300" to={link}>Open</Link></div><div className="space-y-3">{items.map((item) => <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm light:border-slate-200 light:bg-slate-50">{item}</div>)}</div></div>;
}
