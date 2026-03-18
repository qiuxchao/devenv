import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Profile } from "@/types";
import { Plus, Trash2, HelpCircle, Settings } from "lucide-react";

interface SidebarProps {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onActivate: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onShowGuide: () => void;
  onShowSettings: () => void;
  isSettingsActive: boolean;
}

export function Sidebar({
  profiles,
  selectedId,
  onSelect,
  onActivate,
  onAdd,
  onDelete,
  onShowGuide,
  onShowSettings,
  isSettingsActive,
}: SidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="w-64 border-r border-border flex flex-col bg-sidebar">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">DevEnv</h1>
        <Button variant="ghost" size="icon" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                selectedId === profile.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => onSelect(profile.id)}
              onDoubleClick={() => onActivate(profile.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      profile.active ? "bg-green-500" : "bg-muted-foreground/30"
                    }`}
                  />
                  <span className="text-sm font-medium truncate">
                    {profile.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate ml-4">
                  {profile.description}
                </p>
              </div>
              {profile.active && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {t("profile.active")}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(profile.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={onShowGuide}
        >
          <HelpCircle className="h-3.5 w-3.5 mr-2" />
          {t("sidebar.guide")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start ${
            isSettingsActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          }`}
          onClick={onShowSettings}
        >
          <Settings className="h-3.5 w-3.5 mr-2" />
          {t("sidebar.settings")}
        </Button>
      </div>
    </div>
  );
}
