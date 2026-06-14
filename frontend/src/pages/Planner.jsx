import { Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { api, useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function Planner() {
  const { language } = useApp();
  const t = useT(language);
  const [prompt, setPrompt] = useState(t.samplePrompt);
  const [plan, setPlan] = useState(null);

  async function generate() {
    try {
      const { data } = await api.post("/ai/plan", { prompt });
      setPlan(data);
    } catch {
      setPlan({ title: t.generatePlan, summary: prompt, days: [1, 2, 3, 4, 5, 6, 7].map((day) => ({ day, goal: `Study block ${day}`, sessions: ["Review", "Practice", "Recall"] })), recommendations: ["Prioritize weak topics", "Use timed practice"] });
      toast.success("Generated local AI-style plan");
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.planner}</h2>
      <div className="panel p-5">
        <label className="mb-2 block text-sm font-bold text-slate-400">{t.planPrompt}</label>
        <textarea className="input min-h-32" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        <button className="btn-primary mt-4" onClick={generate}><Sparkles size={18} />{t.generatePlan}</button>
      </div>
      {plan && <div className="panel p-5"><h3 className="text-2xl font-black">{plan.title}</h3><p className="mt-2 text-slate-400">{plan.summary}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{plan.days?.map((day) => <article key={day.day} className="rounded-lg bg-white/10 p-4 light:bg-slate-100"><strong>Day {day.day}: {day.goal}</strong><ul className="mt-2 list-inside list-disc text-sm text-slate-400">{day.sessions?.map((session) => <li key={session}>{session}</li>)}</ul></article>)}</div></div>}
    </div>
  );
}
