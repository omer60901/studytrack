import { CalendarDays } from "lucide-react";
import { exams as seedExams, tasks as seedTasks } from "../data/mock.js";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { useCollection } from "../hooks/useCollection.js";

export default function CalendarPage() {
  const { language } = useApp();
  const t = useT(language);
  const { items: tasks } = useCollection("tasks", seedTasks);
  const { items: exams } = useCollection("exams", seedExams);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.calendar}</h2>
      <div className="panel grid grid-cols-7 gap-px overflow-hidden p-2">
        {days.map((day) => (
          <div key={day} className="min-h-28 rounded-lg bg-white/5 p-2 light:bg-slate-50">
            <div className="mb-2 flex items-center justify-between text-sm font-bold"><span>{day}</span><CalendarDays size={14} /></div>
            {tasks.filter((task) => Number(String(task.dueDate || "").slice(-2)) === day).slice(0, 2).map((task) => <p key={task._id || task.id} className="mb-1 rounded bg-blue-500/20 p-1 text-xs">{task.title}</p>)}
            {exams.filter((exam) => Number(String(exam.examDate || exam.date || "").slice(-2)) === day).slice(0, 2).map((exam) => <p key={exam._id || exam.id} className="mb-1 rounded bg-purple-500/20 p-1 text-xs">{exam.title}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}
