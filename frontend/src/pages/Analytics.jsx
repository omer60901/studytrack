import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { subjects as seedSubjects, tasks as seedTasks, weekly } from "../data/mock.js";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { useCollection } from "../hooks/useCollection.js";

export default function Analytics() {
  const { language } = useApp();
  const t = useT(language);
  const { items: subjects } = useCollection("subjects", seedSubjects);
  const { items: tasks } = useCollection("tasks", seedTasks);
  const completed = tasks.filter((task) => task.status === "completed").length;
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.analytics}</h2>
      <div className="grid gap-6 xl:grid-cols-2">
        <Chart title={t.studyTime}><BarChart data={weekly}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Bar dataKey="hours" fill="#7C3AED" radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title={t.productivity}><LineChart data={weekly}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" /><XAxis dataKey="day" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip /><Line dataKey="productivity" stroke="#3B82F6" strokeWidth={3} /></LineChart></Chart>
      </div>
      <div className="panel p-5">
        <h3 className="mb-4 text-xl font-black">Subject Performance</h3>
        <div className="mb-4 rounded-lg bg-white/10 p-4 light:bg-slate-100"><strong>{t.completion}</strong><p className="text-2xl font-black">{tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%</p></div>
        <div className="grid gap-3 md:grid-cols-4">{subjects.map((subject) => <div key={subject._id || subject.id} className="rounded-lg bg-white/10 p-4 light:bg-slate-100"><strong>{subject.name}</strong><p className="text-2xl font-black">{subject.averageGrade}</p></div>)}</div>
      </div>
    </div>
  );
}

function Chart({ title, children }) {
  return <div className="panel p-5"><h3 className="mb-4 text-xl font-black">{title}</h3><div className="h-72"><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;
}
