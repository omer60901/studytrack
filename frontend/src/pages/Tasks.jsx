import { Check, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { subjects as seedSubjects, tasks as seedTasks } from "../data/mock.js";
import { useCollection } from "../hooks/useCollection.js";

export default function Tasks() {
  const { language } = useApp();
  const t = useT(language);
  const { items: subjectItems } = useCollection("subjects", seedSubjects);
  const { items, create, update, remove, isDemo } = useCollection("tasks", seedTasks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: "", description: "", subjectId: subjectItems[0]?._id || subjectItems[0]?.id || "", priority: "medium", dueDate: new Date().toISOString().slice(0, 10), estimatedTime: 45, status: "pending" }
  });

  const filtered = useMemo(() => {
    return items.filter((task) => {
      const matchesText = `${task.title} ${task.description || ""}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [items, query, statusFilter]);

  async function submit(values) {
    const subject = subjectItems.find((item) => (item._id || item.id) === values.subjectId);
    await create({ ...values, subject: subject?.name || "General", estimatedTime: Number(values.estimatedTime) });
    toast.success(language === "he" ? "המשימה נוספה" : "Task added");
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t.tasks} subtitle={isDemo ? t.localMode : t.synced} action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} />{t.addTask}</button>} />

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative"><Search className="absolute start-3 top-2.5 text-slate-500" size={18} /><input className="input ps-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" /></div>
        <select className="input lg:w-48" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn-soft"><SlidersHorizontal size={18} />Filters</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {["pending", "in-progress", "completed"].map((status) => (
          <div key={status} className="panel p-4">
            <h3 className="mb-4 font-black capitalize">{status.replace("-", " ")}</h3>
            <div className="space-y-3">
              {filtered.filter((task) => task.status === status).map((task) => {
                const id = task._id || task.id;
                return (
                  <article key={id} className="rounded-lg bg-white/10 p-4 light:bg-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{task.title}</div>
                        <p className="text-sm text-slate-400">{task.subjectId?.name || task.subject} • {task.estimatedTime || task.time} min • {task.dueDate || task.due}</p>
                      </div>
                      <button className="btn-soft h-9 w-9 p-0" onClick={() => remove(id)} aria-label={t.delete}><Trash2 size={16} /></button>
                    </div>
                    {task.description && <p className="mt-3 text-sm text-slate-300 light:text-slate-600">{task.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-purple-500/15 px-2 py-1 text-xs font-bold text-purple-200">{task.priority}</span>
                      {status !== "completed" && <button className="btn-soft px-2 py-1 text-xs" onClick={() => update(id, { status: "completed" })}><Check size={14} />{t.complete}</button>}
                      {status === "pending" && <button className="btn-soft px-2 py-1 text-xs" onClick={() => update(id, { status: "in-progress" })}>Start</button>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal title={t.addTask} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(submit)} className="grid gap-3">
          <input className="input" placeholder={t.title} {...register("title", { required: true })} />
          <textarea className="input min-h-24" placeholder={t.description} {...register("description")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" {...register("subjectId")}>{subjectItems.map((subject) => <option key={subject._id || subject.id} value={subject._id || subject.id}>{subject.name}</option>)}</select>
            <select className="input" {...register("priority")}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
            <input className="input" type="date" {...register("dueDate", { required: true })} />
            <input className="input" type="number" min="5" step="5" placeholder={t.estimatedTime} {...register("estimatedTime")} />
          </div>
          <button className="btn-primary">{t.create}</button>
        </form>
      </Modal>
    </div>
  );
}
