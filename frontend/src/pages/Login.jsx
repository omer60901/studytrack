import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function Login() {
  const { language, setToken, setUser } = useApp();
  const t = useT(language);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm({ defaultValues: { email: "demo@studytrack.app", password: "password" } });

  async function submit(values) {
    try {
      const { data } = await api.post("/auth/login", values);
      setToken(data.token);
      setUser(data.user);
      navigate("/");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.message || "Login failed");
        return;
      }
      toast.error(language === "he" ? "השרת לא מחובר. הפעילי npm run dev ונסי שוב." : "Server is not connected. Run npm run dev and try again.");
    }
  }

  function startDemo() {
    setToken("demo-token");
    setUser({ username: "Demo Student", email: "demo@studytrack.app", level: 12, xp: 2840, streak: 9 });
    toast.success(language === "he" ? "מצב דמו הופעל" : "Demo mode started");
    navigate("/");
  }

  return (
    <AuthShell title={t.login}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <input className="input" placeholder={t.email} {...register("email")} />
        <input className="input" type="password" placeholder={t.password} {...register("password")} />
        <button className="btn-primary w-full">{t.login}</button>
        <button className="btn-soft w-full" type="button" onClick={startDemo}>Demo</button>
        <div className="flex items-center justify-between text-sm">
          <Link className="text-blue-300" to="/register">{t.noAccount}</Link>
          <Link className="text-slate-400 hover:text-blue-300" to="/forgot-password">{t.forgotPassword}</Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ title, children }) {
  const { language } = useApp();
  const t = useT(language);
  return (
    <div className="grid min-h-screen place-items-center bg-[#080a12] p-4 text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_10%,rgba(124,58,237,.34),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,.28),transparent_32%)]" />
      <div className="panel w-full max-w-md p-8">
        <h1 className="text-4xl font-black">{t.app}</h1>
        <p className="mb-8 mt-2 text-slate-400">{t.subtitle}</p>
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
