import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AppContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_URL });

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("studytrack_token"));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("studytrack_user") || "null"));
  const [theme, setTheme] = useState(localStorage.getItem("studytrack_theme") || user?.theme || "dark");
  const [language, setLanguage] = useState(localStorage.getItem("studytrack_language") || user?.language || "en");

  useEffect(() => {
    api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : "";
    if (token) localStorage.setItem("studytrack_token", token);
    else localStorage.removeItem("studytrack_token");
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("studytrack_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    localStorage.setItem("studytrack_language", language);
  }, [language]);

  useEffect(() => {
    if (user) localStorage.setItem("studytrack_user", JSON.stringify(user));
    else localStorage.removeItem("studytrack_user");
  }, [user]);

  const value = useMemo(
    () => ({ token, setToken, user, setUser, theme, setTheme, language, setLanguage, isAuthed: Boolean(token) }),
    [token, user, theme, language]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
