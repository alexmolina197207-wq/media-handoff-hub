import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, Shield, LogIn, AlertTriangle, KeyRound, Monitor } from 'lucide-react';

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultOn: boolean;
}

const SECURITY_NOTIFICATIONS: NotificationPref[] = [
  {
    id: 'new_device_login',
    label: 'New device sign-in',
    description: 'Get notified when your account is accessed from an unrecognized device or location.',
    icon: <Monitor className="h-4 w-4" />,
    defaultOn: true,
  },
  {
    id: 'failed_login',
    label: 'Failed sign-in attempts',
    description: 'Receive an alert when there are multiple failed sign-in attempts on your account.',
    icon: <AlertTriangle className="h-4 w-4" />,
    defaultOn: true,
  },
  {
    id: 'password_changed',
    label: 'Password changes',
    description: 'Get notified when your password is changed or a reset is requested.',
    icon: <KeyRound className="h-4 w-4" />,
    defaultOn: true,
  },
  {
    id: 'two_factor_changes',
    label: 'Two-factor authentication changes',
    description: 'Receive an alert when 2FA is enabled, disabled, or modified on your account.',
    icon: <Shield className="h-4 w-4" />,
    defaultOn: true,
  },
  {
    id: 'new_session',
    label: 'Active session alerts',
    description: 'Get notified about new sessions and when sessions are revoked remotely.',
    icon: <LogIn className="h-4 w-4" />,
    defaultOn: false,
  },
];

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECURITY_NOTIFICATIONS.map(n => [n.id, n.defaultOn]))
  );

  const handleToggle = (id: string, checked: boolean) => {
    setPrefs(prev => ({ ...prev, [id]: checked }));
    const pref = SECURITY_NOTIFICATIONS.find(n => n.id === id);
    toast.success(
      `${pref?.label} notifications ${checked ? 'enabled' : 'disabled'} (demo)`
    );
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <Card className="shadow-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Email Notifications
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {enabledCount} of {SECURITY_NOTIFICATIONS.length} active
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground mb-3">
          Choose which security events trigger an email notification to your inbox.
        </p>

        {SECURITY_NOTIFICATIONS.map((notif, index) => (
          <div key={notif.id}>
            <div className="flex items-start gap-3 py-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                {notif.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{notif.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
              </div>
              <Switch
                checked={prefs[notif.id]}
                onCheckedChange={(checked) => handleToggle(notif.id, checked)}
                className="shrink-0"
              />
            </div>
            {index < SECURITY_NOTIFICATIONS.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
