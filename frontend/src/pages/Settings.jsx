import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { api, useApp } from "../context/AppContext.jsx";
import { useT } from "../data/i18n.js";

export default function Settings() {
  const { language, setLanguage, theme, setTheme, user, setUser } = useApp();
  const t = useT(language);
  const profileForm = useForm({ values: { username: user?.username || "", avatar: user?.avatar || "" } });
  const passwordForm = useForm();

  async function save() {
    const patch = { language, theme };
    try {
      const { data } = await api.patch("/auth/me", patch);
      setUser(data.user);
    } catch {
      setUser({ ...(user || {}), ...patch });
    }
    toast.success(language === "he" ? "ההגדרות נשמרו" : "Settings saved");
  }

  async function saveProfile(values) {
    try {
      const { data } = await api.patch("/auth/me", values);
      setUser(data.user);
    } catch {
      setUser({ ...(user || {}), ...values });
    }
    toast.success(language === "he" ? "הפרופיל נשמר" : "Profile saved");
  }

  async function changePassword(values) {
    try {
      await api.patch("/auth/password", values);
      toast.success(language === "he" ? "הסיסמה עודכנה" : "Password updated");
      passwordForm.reset();
    } catch {
      toast.error(language === "he" ? "צריך שרת מחובר כדי לשנות סיסמה" : "Connect the server to change password");
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black">{t.settings}</h2>
      <div className="grid gap-5 xl:grid-cols-2">
      <div className="panel p-5">
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 font-black">{t.language}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className={`btn-soft ${language === "en" ? "bg-white text-slate-950 light:bg-slate-900 light:text-white" : ""}`} onClick={() => setLanguage("en")}>{t.english}</button>
              <button className={`btn-soft ${language === "he" ? "bg-white text-slate-950 light:bg-slate-900 light:text-white" : ""}`} onClick={() => setLanguage("he")}>{t.hebrew}</button>
            </div>
          </section>
          <section>
            <h3 className="mb-3 font-black">{t.theme}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className={`btn-soft ${theme === "dark" ? "bg-white text-slate-950 light:bg-slate-900 light:text-white" : ""}`} onClick={() => setTheme("dark")}>{t.dark}</button>
              <button className={`btn-soft ${theme === "light" ? "bg-white text-slate-950 light:bg-slate-900 light:text-white" : ""}`} onClick={() => setTheme("light")}>{t.light}</button>
            </div>
          </section>
          <button className="btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
      <div className="panel p-5">
        <h3 className="mb-3 font-black">{t.profileSettings}</h3>
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-3">
          <input className="input" placeholder={t.username} {...profileForm.register("username", { required: true })} />
          <input className="input" placeholder="Avatar URL" {...profileForm.register("avatar")} />
          <button className="btn-primary">{t.save}</button>
        </form>
      </div>
      <div className="panel p-5 xl:col-span-2">
        <h3 className="mb-3 font-black">{t.passwordChange}</h3>
        <form onSubmit={passwordForm.handleSubmit(changePassword)} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="input" type="password" placeholder="Current password" {...passwordForm.register("currentPassword", { required: true })} />
          <input className="input" type="password" placeholder="New password" {...passwordForm.register("newPassword", { required: true, minLength: 6 })} />
          <button className="btn-primary">{t.save}</button>
        </form>
      </div>
      </div>
    </div>
  );
}
