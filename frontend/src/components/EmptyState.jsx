import { Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function EmptyState() {
  const { language } = useApp();
  const t = useT(language);
  return (
    <div className="panel grid min-h-52 place-items-center p-8 text-center">
      <div>
        <Sparkles className="mx-auto mb-3 text-purple-300" />
        <p className="font-semibold text-slate-300 light:text-slate-700">{t.empty}</p>
      </div>
    </div>
  );
}
