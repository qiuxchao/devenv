import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Languages, Sun } from "lucide-react";

const languageLabels: Record<string, string> = {
  system: "settings.lang.system",
  "zh-CN": "settings.lang.zh",
  en: "settings.lang.en",
};

const themeLabels: Record<string, string> = {
  system: "settings.theme.system",
  light: "settings.theme.light",
  dark: "settings.theme.dark",
};

export function Settings() {
  const { t } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useSettings();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold">{t("settings.title")}</h2>
      </div>
      <Separator />
      <div className="p-6 space-y-6 max-w-md">
        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
              <Languages className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">{t("settings.language")}</span>
          </div>
          <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
            <SelectTrigger className="w-36">
              <span>{t(languageLabels[language])}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t("settings.lang.system")}</SelectItem>
              <SelectItem value="zh-CN">{t("settings.lang.zh")}</SelectItem>
              <SelectItem value="en">{t("settings.lang.en")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
              <Sun className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">{t("settings.theme")}</span>
          </div>
          <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
            <SelectTrigger className="w-36">
              <span>{t(themeLabels[theme])}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t("settings.theme.system")}</SelectItem>
              <SelectItem value="light">{t("settings.theme.light")}</SelectItem>
              <SelectItem value="dark">{t("settings.theme.dark")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
