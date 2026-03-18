import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import {
  Layers,
  MousePointerClick,
  ToggleRight,
  Terminal,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Check,
  Loader2,
} from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

type HookStatus = "checking" | "not_installed" | "installed" | "installing" | "error";

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Rocket,
      title: t("onboarding.step1.title"),
      description: t("onboarding.step1.desc"),
      details: [t("onboarding.step1.d1"), t("onboarding.step1.d2"), t("onboarding.step1.d3")],
    },
    {
      icon: Layers,
      title: t("onboarding.step2.title"),
      description: t("onboarding.step2.desc"),
      details: [t("onboarding.step2.d1"), t("onboarding.step2.d2"), t("onboarding.step2.d3")],
    },
    {
      icon: MousePointerClick,
      title: t("onboarding.step3.title"),
      description: t("onboarding.step3.desc"),
      details: [t("onboarding.step3.d1"), t("onboarding.step3.d2"), t("onboarding.step3.d3")],
    },
    {
      icon: ToggleRight,
      title: t("onboarding.step4.title"),
      description: t("onboarding.step4.desc"),
      details: [t("onboarding.step4.d1"), t("onboarding.step4.d2"), t("onboarding.step4.d3")],
    },
    {
      icon: Terminal,
      title: t("onboarding.step5.title"),
      description: t("onboarding.step5.desc"),
      details: [],
    },
  ];

  const [step, setStep] = useState(0);
  const [hookStatus, setHookStatus] = useState<HookStatus>("checking");
  const [hookInfo, setHookInfo] = useState<{ shell: string; configPath: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  useEffect(() => {
    if (isLast) {
      checkHookStatus();
    }
  }, [step]);

  async function checkHookStatus() {
    try {
      setHookStatus("checking");
      const result = await invoke<{ installed: boolean; shell: string; configPath: string }>(
        "get_shell_hook_status",
      );
      setHookInfo({ shell: result.shell, configPath: result.configPath });
      setHookStatus(result.installed ? "installed" : "not_installed");
    } catch (e) {
      setHookStatus("error");
      setErrorMsg(String(e));
    }
  }

  async function handleInstallHook() {
    try {
      setHookStatus("installing");
      const result = await invoke<{ success: boolean; configPath: string }>(
        "install_shell_hook",
      );
      if (result.success) {
        setHookStatus("installed");
      }
    } catch (e) {
      setHookStatus("error");
      setErrorMsg(String(e));
    }
  }

  function renderShellStep() {
    return (
      <div className="space-y-4">
        {hookStatus === "checking" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("onboarding.hook.checking")}
          </div>
        )}

        {hookStatus === "not_installed" && hookInfo && (
          <>
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("onboarding.hook.detected")}{" "}
                <span className="font-medium text-foreground">{hookInfo.shell}</span>
                {", "}
                {t("onboarding.hook.configAt")}
              </p>
              <code className="block text-xs font-mono text-foreground/70">
                {hookInfo.configPath}
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("onboarding.hook.clickToInject")}
            </p>
            <Button onClick={handleInstallHook} className="w-full">
              <Terminal className="h-4 w-4 mr-2" />
              {t("onboarding.hook.inject")}
            </Button>
          </>
        )}

        {hookStatus === "installing" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("onboarding.hook.writing")}
          </div>
        )}

        {hookStatus === "installed" && hookInfo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Check className="h-4 w-4" />
              {t("onboarding.hook.done")}
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {t("onboarding.hook.writtenTo")} {hookInfo.configPath}
              </p>
              <code className="block text-xs font-mono text-foreground">
                {hookInfo.shell === "powershell"
                  ? 'if (Test-Path "~/.devenv/active.ps1") { . "~/.devenv/active.ps1" }'
                  : '[ -f ~/.devenv/active.sh ] && source ~/.devenv/active.sh'}
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("onboarding.hook.restart")}
            </p>
          </div>
        )}

        {hookStatus === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{t("onboarding.hook.error")}{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={checkHookStatus}>
              {t("onboarding.hook.retry")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>

          <h2 className="text-lg font-semibold mb-2">{current.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {current.description}
          </p>

          {isLast ? (
            renderShellStep()
          ) : (
            <ul className="space-y-2.5">
              {current.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground/80">{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {t("onboarding.prev")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onComplete}>
              {isLast ? t("onboarding.skipLater") : t("onboarding.skip")}
            </Button>
            {isLast ? (
              <Button size="sm" onClick={onComplete} disabled={hookStatus === "installing"}>
                {t("onboarding.start")}
                <Rocket className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                {t("onboarding.next")}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
