import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";

type ThemeMode = "system" | "light" | "dark";
type LanguageMode = "system" | "zh-CN" | "en";

interface SettingsContextValue {
  theme: ThemeMode;
  language: LanguageMode;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageMode) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  theme: "system",
  language: "system",
  setTheme: () => {},
  setLanguage: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

async function getSystemLanguage(): Promise<string> {
  try {
    return await invoke<string>("get_system_locale");
  } catch {
    return "en";
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("devenv-theme") as ThemeMode) || "system";
  });

  const [language, setLanguageState] = useState<LanguageMode>(() => {
    return (localStorage.getItem("devenv-language-mode") as LanguageMode) || "system";
  });

  // Theme logic
  const applyTheme = useCallback((mode: ThemeMode) => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (mode === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, applyTheme]);

  function setTheme(mode: ThemeMode) {
    setThemeState(mode);
    localStorage.setItem("devenv-theme", mode);
  }

  async function setLanguage(mode: LanguageMode) {
    setLanguageState(mode);
    localStorage.setItem("devenv-language-mode", mode);

    if (mode === "system") {
      localStorage.removeItem("devenv-language");
      const sysLang = await getSystemLanguage();
      i18n.changeLanguage(sysLang);
    } else {
      localStorage.setItem("devenv-language", mode);
      i18n.changeLanguage(mode);
    }
  }

  // Initialize language on mount
  useEffect(() => {
    (async () => {
      if (language === "system") {
        localStorage.removeItem("devenv-language");
        const sysLang = await getSystemLanguage();
        i18n.changeLanguage(sysLang);
      } else {
        localStorage.setItem("devenv-language", language);
        i18n.changeLanguage(language);
      }
    })();
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}
