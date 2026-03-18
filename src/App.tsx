import { useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Sidebar } from "@/components/Sidebar";
import { ProfileDetail } from "@/components/ProfileDetail";
import { Settings } from "@/components/Settings";
import { Onboarding } from "@/components/Onboarding";
import type { Profile, EnvVar } from "@/types";

const defaultProfiles: Profile[] = [
  {
    id: "1",
    name: "Work - Backend",
    description: "Node 18 · Java 17 · proxy",
    active: true,
    vars: [
      { key: "NODE_VERSION", value: "18.19.0", enabled: true },
      { key: "JAVA_HOME", value: "/opt/jdk-17", enabled: true },
      { key: "http_proxy", value: "http://127.0.0.1:7890", enabled: true },
      { key: "https_proxy", value: "http://127.0.0.1:7890", enabled: true },
    ],
  },
  {
    id: "2",
    name: "Work - Frontend",
    description: "Node 20 · no proxy",
    active: false,
    vars: [
      { key: "NODE_VERSION", value: "20.11.0", enabled: true },
      { key: "http_proxy", value: "", enabled: false },
    ],
  },
  {
    id: "3",
    name: "Personal",
    description: "Node 22 · Go 1.22",
    active: false,
    vars: [
      { key: "NODE_VERSION", value: "22.0.0", enabled: true },
      { key: "GOROOT", value: "/usr/local/go", enabled: true },
    ],
  },
];

function App() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>(defaultProfiles);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("devenv-onboarding-done");
  });

  function handleOnboardingComplete() {
    localStorage.setItem("devenv-onboarding-done", "1");
    setShowOnboarding(false);
  }

  const selectedProfile = profiles.find((p) => p.id === selectedId)!;

  function handleSelect(id: string) {
    setSelectedId(id);
    setShowSettings(false);
  }

  function handleActivate(id: string) {
    setProfiles((prev) => {
      const next = prev.map((p) => ({ ...p, active: p.id === id }));
      const activated = next.find((p) => p.id === id);
      if (activated) {
        invoke("write_active_profile", { vars: activated.vars }).catch(console.error);
      }
      return next;
    });
  }

  function handleUpdateVars(id: string, vars: EnvVar[]) {
    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, vars } : p));
      const updated = next.find((p) => p.id === id);
      if (updated?.active) {
        invoke("write_active_profile", { vars }).catch(console.error);
      }
      return next;
    });
  }

  function handleAddProfile() {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: t("profile.newName"),
      description: t("profile.newDesc"),
      active: false,
      vars: [],
    };
    setProfiles((prev) => [...prev, newProfile]);
    setSelectedId(newProfile.id);
    setShowSettings(false);
  }

  function handleDeleteProfile(id: string) {
    const deleted = profiles.find((p) => p.id === id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (deleted?.active) {
      invoke("clear_active_profile").catch(console.error);
    }
    if (selectedId === id) {
      setSelectedId(profiles[0]?.id ?? "");
    }
  }

  function handleRenameProfile(id: string, name: string) {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p)),
    );
  }

  return (
    <SettingsProvider>
      <TooltipProvider>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar
            profiles={profiles}
            selectedId={showSettings ? null : selectedId}
            onSelect={handleSelect}
            onActivate={handleActivate}
            onAdd={handleAddProfile}
            onDelete={handleDeleteProfile}
            onShowGuide={() => setShowOnboarding(true)}
            onShowSettings={() => setShowSettings(true)}
            isSettingsActive={showSettings}
          />
          <main className="flex-1 overflow-hidden">
            {showSettings ? (
              <Settings />
            ) : (
              selectedProfile && (
                <ProfileDetail
                  profile={selectedProfile}
                  onUpdateVars={(vars) => handleUpdateVars(selectedId, vars)}
                  onRename={(name) => handleRenameProfile(selectedId, name)}
                  onActivate={() => handleActivate(selectedId)}
                />
              )
            )}
          </main>
        </div>
      </TooltipProvider>
    </SettingsProvider>
  );
}

export default App;
