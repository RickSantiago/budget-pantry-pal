import React from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BellRing } from "lucide-react";

// Em uma implementação futura, esses valores e handlers viriam do componente pai (Profile.tsx)
interface NotificationSettings {
  expiryNotifications: boolean;
  budgetAlerts: boolean;
  weeklySummary: boolean;
}

interface NotificationSettingsCardProps {
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
}

const NotificationSettingsCard = ({ settings, onSettingsChange }: NotificationSettingsCardProps) => {

  const handleToggle = (key: keyof NotificationSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <Card className="glass border-border/50 p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <BellRing className="w-5 h-5 mr-2 text-blue-500" />
        Preferências de Notificação
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg glass border border-border/50">
          <div>
            <Label htmlFor="expiry-notifications" className="font-medium cursor-pointer">
              Itens perto do vencimento
            </Label>
            <p className="text-xs text-muted-foreground">
              Avisos sobre produtos na despensa que vão vencer.
            </p>
          </div>
          <Switch
            id="expiry-notifications"
            checked={settings.expiryNotifications}
            onCheckedChange={() => handleToggle('expiryNotifications')}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg glass border border-border/50">
          <div>
            <Label htmlFor="budget-alerts" className="font-medium cursor-pointer">
              Alertas de orçamento
            </Label>
            <p className="text-xs text-muted-foreground">
              Alertas ao se aproximar ou exceder seu orçamento mensal.
            </p>
          </div>
          <Switch
            id="budget-alerts"
            checked={settings.budgetAlerts}
            onCheckedChange={() => handleToggle('budgetAlerts')}
          />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg glass border-dashed border-border/50 opacity-60">
          <div>
            <Label htmlFor="weekly-summary" className="font-medium">
              Resumo Semanal (Em Breve)
            </Label>
            <p className="text-xs text-muted-foreground">
              Um resumo semanal dos seus gastos por e-mail.
            </p>
          </div>
          <Switch
            id="weekly-summary"
            disabled
            checked={settings.weeklySummary}
          />
        </div>
      </div>
    </Card>
  );
};

export default NotificationSettingsCard;
