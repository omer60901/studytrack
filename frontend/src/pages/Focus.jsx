import { Pause, Play, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function Focus() {
  const { language } = useApp();
  const t = useT(language);
  const [mode, setMode] = useState(25);
  const minutes = useMemo(() => String(mode).padStart(2, "0"), [mode]);
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.focus}</h2>
      <div className="panel grid min-h-[520px] place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-64 w-64 place-items-center rounded-full border border-purple-400/40 bg-gradient-to-br from-purple-600/20 to-blue-500/20 text-6xl font-black shadow-glow">{minutes}:00</div>
          <div className="mt-8 flex justify-center gap-2">{[25, 50, 90].map((value) => <button key={value} className={`btn-soft ${mode === value ? "bg-white text-slate-950" : ""}`} onClick={() => setMode(value)}>{value}/5</button>)}</div>
          <div className="mt-6 flex justify-center gap-3"><button className="btn-primary"><Play size={18} />Start</button><button className="btn-soft"><Pause size={18} /></button><button className="btn-soft"><RotateCcw size={18} /></button></div>
        </div>
      </div>
    </div>
  );
}
