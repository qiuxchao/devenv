import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Profile, EnvVar } from "@/types";
import { Plus, Trash2, Play, Pencil, Check } from "lucide-react";

interface ProfileDetailProps {
  profile: Profile;
  onUpdateVars: (vars: EnvVar[]) => void;
  onRename: (name: string) => void;
  onActivate: () => void;
}

export function ProfileDetail({
  profile,
  onUpdateVars,
  onRename,
  onActivate,
}: ProfileDetailProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  function handleAddVar() {
    onUpdateVars([...profile.vars, { key: "", value: "", enabled: true }]);
  }

  function handleUpdateVar(index: number, field: keyof EnvVar, val: string | boolean) {
    const updated = profile.vars.map((v, i) =>
      i === index ? { ...v, [field]: val } : v,
    );
    onUpdateVars(updated);
  }

  function handleDeleteVar(index: number) {
    onUpdateVars(profile.vars.filter((_, i) => i !== index));
  }

  function handleSaveName() {
    onRename(nameInput);
    setEditing(false);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="h-8 w-48 text-lg font-semibold"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveName}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setNameInput(profile.name);
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {profile.active && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  {t("profile.active")}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!profile.active && (
            <Button onClick={onActivate} size="sm">
              <Play className="h-3.5 w-3.5 mr-1.5" />
              {t("profile.activate")}
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <div className="p-6 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t("profile.envVars")}
        </h3>
        <Button variant="outline" size="sm" onClick={handleAddVar}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {t("profile.addVar")}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">{t("profile.table.on")}</TableHead>
              <TableHead className="w-[200px]">{t("profile.table.key")}</TableHead>
              <TableHead>{t("profile.table.value")}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {profile.vars.map((v, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Switch
                    checked={v.enabled}
                    onCheckedChange={(checked) =>
                      handleUpdateVar(i, "enabled", checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={v.key}
                    onChange={(e) => handleUpdateVar(i, "key", e.target.value)}
                    placeholder="KEY"
                    className="h-8 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={v.value}
                    onChange={(e) => handleUpdateVar(i, "value", e.target.value)}
                    placeholder="value"
                    className="h-8 font-mono text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDeleteVar(i)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {profile.vars.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {t("profile.noVars")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
