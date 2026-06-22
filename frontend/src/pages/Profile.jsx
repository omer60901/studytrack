import { Award, Flame, Trophy } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function Profile() {
  const { language, user } = useApp();
  const t = useT(language);
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.profile}</h2>
      <div className="panel p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-3xl font-black">{(user?.username || "D")[0]}</div>
          <div><h3 className="text-3xl font-black">{user?.username || "Demo Student"}</h3><p className="text-slate-400">{user?.email || "demo@studytrack.app"}</p></div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Badge icon={Trophy} label={t.level} value={user?.level || 12} />
          <Badge icon={Award} label={t.xp} value={user?.xp || 2840} />
          <Badge icon={Flame} label={t.streak} value={user?.streak || 9} />
        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label, value }) {
  return <div className="rounded-lg bg-white/10 p-5 light:bg-slate-100"><Icon className="mb-4 text-purple-300" /><p className="text-sm text-slate-400">{label}</p><strong className="text-3xl">{value}</strong></div>;
}
