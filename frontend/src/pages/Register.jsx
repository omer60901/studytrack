import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api, useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { AuthShell } from "./Login.jsx";

export default function Register() {
  const { language, setToken, setUser } = useApp();
  const t = useT(language);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  async function submit(values) {
    try {
      const { data } = await api.post("/auth/register", values);
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.message || "Registration failed");
        return;
      }
      toast.error(language === "he" ? "השרת לא מחובר. הפעילי npm run dev ונסי שוב." : "Server is not connected. Run npm run dev and try again.");
      return;
    }
    navigate("/");
  }

  return (
    <AuthShell title={t.register}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <input className="input" placeholder={t.username} {...register("username", { required: true })} />
        <input className="input" placeholder={t.email} {...register("email", { required: true })} />
        <input className="input" type="password" placeholder={t.password} {...register("password", { required: true })} />
        <button className="btn-primary w-full">{t.register}</button>
        <Link className="block text-center text-sm text-blue-300" to="/login">{t.haveAccount} {t.login}</Link>
      </form>
    </AuthShell>
  );
}
