import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { api, useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";
import { AuthShell } from "./Login.jsx";

export default function ForgotPassword() {
  const { language } = useApp();
  const t = useT(language);
  const { register, handleSubmit } = useForm();

  async function submit(values) {
    try {
      await api.post("/auth/forgot-password", values);
    } catch {
      // Keep the same user-facing response to avoid exposing registered emails.
    }
    toast.success(t.resetSent);
  }

  return (
    <AuthShell title={t.forgotPassword}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <input className="input" placeholder={t.email} {...register("email", { required: true })} />
        <button className="btn-primary w-full">{t.sendReset}</button>
        <Link className="block text-center text-sm text-blue-300" to="/login">{t.login}</Link>
      </form>
    </AuthShell>
  );
}
