import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { subjects } from "../data/mock.js";
import { useCollection } from "../hooks/useCollection.js";

export default function Subjects() {
  const { language } = useApp();
  const t = useT(language);
  const { items, create, remove, isDemo } = useCollection("subjects", subjects);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: "", color: "#7C3AED", icon: "BookOpen", averageGrade: 85, progressPercentage: 50 } });

  async function submit(values) {
    await create({ ...values, averageGrade: Number(values.averageGrade), progressPercentage: Number(values.progressPercentage) });
    toast.success(language === "he" ? "המקצוע נוסף" : "Subject added");
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t.subjects} subtitle={isDemo ? t.localMode : t.synced} action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} />{t.create}</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((subject) => {
          const id = subject._id || subject.id;
          const progress = subject.progressPercentage ?? subject.progress ?? 0;
          return (
            <article key={id} className="panel p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="h-3 flex-1 rounded-full" style={{ background: subject.color }} />
                <button className="btn-soft h-9 w-9 p-0" onClick={() => remove(id)} aria-label={t.delete}><Trash2 size={16} /></button>
              </div>
              <h3 className="text-xl font-black">{subject.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{t.averageGrade} {subject.averageGrade}</p>
              <div className="mt-5 h-2 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${progress}%`, background: subject.color }} /></div>
              <p className="mt-2 text-sm font-semibold">{progress}% {t.progress}</p>
            </article>
          );
        })}
      </div>
      <Modal title={t.subjects} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(submit)} className="grid gap-3">
          <input className="input" placeholder={t.subject} {...register("name", { required: true })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input className="input h-11" type="color" title={t.color} {...register("color")} />
            <input className="input" type="number" min="0" max="100" placeholder={t.averageGrade} {...register("averageGrade")} />
            <input className="input" type="number" min="0" max="100" placeholder={t.progress} {...register("progressPercentage")} />
          </div>
          <button className="btn-primary">{t.create}</button>
        </form>
      </Modal>
    </div>
  );
}
