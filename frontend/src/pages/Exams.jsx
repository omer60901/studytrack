import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../components/Modal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { exams, subjects } from "../data/mock.js";
import { useCollection } from "../hooks/useCollection.js";

export default function Exams() {
  const { language } = useApp();
  const t = useT(language);
  const { items: subjectItems } = useCollection("subjects", subjects);
  const { items, create, remove, isDemo } = useCollection("exams", exams);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { title: "", subjectId: subjectItems[0]?._id || subjectItems[0]?.id || "", examDate: "2026-06-21", difficulty: "medium", preparationStatus: 50 } });

  async function submit(values) {
    const subject = subjectItems.find((item) => (item._id || item.id) === values.subjectId);
    await create({ ...values, subject: subject?.name || "General", preparationStatus: Number(values.preparationStatus) });
    toast.success(language === "he" ? "המבחן נוסף" : "Exam added");
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t.exams} subtitle={isDemo ? t.localMode : t.synced} action={<button className="btn-primary" onClick={() => setOpen(true)}><Plus size={18} />{t.addExam}</button>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((exam) => {
          const id = exam._id || exam.id;
          const readiness = exam.preparationStatus ?? exam.readiness ?? 0;
          return (
            <article key={id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">{exam.title}</h3>
                  <p className="text-slate-400">{exam.subjectId?.name || exam.subject} • {exam.examDate || exam.date} • {exam.difficulty}</p>
                </div>
                <button className="btn-soft h-9 w-9 p-0" onClick={() => remove(id)} aria-label={t.delete}><Trash2 size={16} /></button>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-3 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-500" style={{ width: `${readiness}%` }} /></div>
                <strong>{readiness}%</strong>
              </div>
            </article>
          );
        })}
      </div>
      <Modal title={t.addExam} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(submit)} className="grid gap-3">
          <input className="input" placeholder={t.title} {...register("title", { required: true })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" {...register("subjectId")}>{subjectItems.map((subject) => <option key={subject._id || subject.id} value={subject._id || subject.id}>{subject.name}</option>)}</select>
            <select className="input" {...register("difficulty")}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
            <input className="input" type="date" {...register("examDate", { required: true })} />
            <input className="input" type="number" min="0" max="100" placeholder={t.readiness} {...register("preparationStatus")} />
          </div>
          <button className="btn-primary">{t.create}</button>
        </form>
      </Modal>
    </div>
  );
}
