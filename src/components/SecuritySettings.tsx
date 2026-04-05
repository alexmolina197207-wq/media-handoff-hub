import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Shield, ShieldCheck, ShieldOff, Smartphone, Mail, MessageSquare,
  Monitor, Laptop, TabletSmartphone, LogOut, MapPin, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';
import { useApp } from '@/context/AppContext';

const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  authenticator: { label: 'Authenticator App', icon: <Smartphone className="h-4 w-4" /> },
  email: { label: 'Email Code', icon: <Mail className="h-4 w-4" /> },
  sms: { label: 'SMS Code', icon: <MessageSquare className="h-4 w-4" /> },
};

interface Session {
  id: string;
  device: string;
  icon: React.ReactNode;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

interface ActivityEntry {
  id: string;
  action: string;
  device: string;
  location: string;
  ip: string;
  timestamp: string;
  success: boolean;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: 's1', device: 'MacBook Pro', icon: <Laptop className="h-4 w-4" />,
    browser: 'Chrome 124', location: 'San Francisco, CA', ip: '192.168.1.***',
    lastActive: 'Now', current: true,
  },
  {
    id: 's2', device: 'iPhone 15', icon: <TabletSmartphone className="h-4 w-4" />,
    browser: 'Safari Mobile', location: 'San Francisco, CA', ip: '10.0.0.***',
    lastActive: '2 hours ago', current: false,
  },
  {
    id: 's3', device: 'Windows Desktop', icon: <Monitor className="h-4 w-4" />,
    browser: 'Firefox 126', location: 'New York, NY', ip: '172.16.0.***',
    lastActive: '3 days ago', current: false,
  },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: 'a1', action: 'Sign in', device: 'MacBook Pro · Chrome 124', location: 'San Francisco, CA', ip: '192.168.1.***', timestamp: 'Today, 9:42 AM', success: true },
  { id: 'a2', action: 'Sign in', device: 'iPhone 15 · Safari Mobile', location: 'San Francisco, CA', ip: '10.0.0.***', timestamp: 'Today, 7:15 AM', success: true },
  { id: 'a3', action: 'Password change attempted', device: 'MacBook Pro · Chrome 124', location: 'San Francisco, CA', ip: '192.168.1.***', timestamp: 'Yesterday, 4:30 PM', success: false },
  { id: 'a4', action: 'Sign in', device: 'Windows Desktop · Firefox 126', location: 'New York, NY', ip: '172.16.0.***', timestamp: 'Apr 2, 2026, 11:20 AM', success: true },
  { id: 'a5', action: '2FA enabled', device: 'MacBook Pro · Chrome 124', location: 'San Francisco, CA', ip: '192.168.1.***', timestamp: 'Apr 1, 2026, 3:05 PM', success: true },
  { id: 'a6', action: 'Sign in (failed)', device: 'Unknown · Chrome 123', location: 'Lagos, Nigeria', ip: '203.0.113.***', timestamp: 'Mar 30, 2026, 1:12 AM', success: false },
];

export default function SecuritySettings() {
  const { twoFactorEnabled, twoFactorMethod, setTwoFactor } = useApp();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);

  const handleEnable = (method: string) => {
    setTwoFactor(true, method);
    toast.success('Two-factor authentication enabled!');
  };

  const handleDisable = () => {
    setTwoFactor(false, null);
    setDisableOpen(false);
    toast.success('Two-factor authentication disabled');
  };

  const handleRevokeSession = () => {
    if (!revokeTarget) return;
    setSessions(prev => prev.filter(s => s.id !== revokeTarget.id));
    toast.success(`Signed out of ${revokeTarget.device}`);
    setRevokeTarget(null);
  };

  const handleRevokeAll = () => {
    setSessions(prev => prev.filter(s => s.current));
    setRevokeAllOpen(false);
    toast.success('Signed out of all other devices');
  };

  const methodInfo = twoFactorMethod ? METHOD_LABELS[twoFactorMethod] : null;
  const otherSessions = sessions.filter(s => !s.current);
  const visibleActivity = activityExpanded ? MOCK_ACTIVITY : MOCK_ACTIVITY.slice(0, 3);

  return (
    <>
      {/* Two-Factor Authentication */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security
            </CardTitle>
            <Badge
              variant={twoFactorEnabled ? 'default' : 'secondary'}
              className={twoFactorEnabled ? 'bg-accent text-accent-foreground' : ''}
            >
              {twoFactorEnabled ? '2FA Enabled' : '2FA Off'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add an extra layer of security by requiring a verification code in addition to your password when signing in.
            </p>
          </div>

          {twoFactorEnabled && methodInfo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-accent/10 rounded-lg p-3">
                <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Protected</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {methodInfo.icon} {methodInfo.label}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisableOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Disable 2FA
              </Button>
            </div>
          ) : (
            <Button onClick={() => setSetupOpen(true)} size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          )}

          <Separator />

          <div>
            <p className="text-sm font-medium text-foreground">Password</p>
            <p className="text-xs text-muted-foreground mt-1">Last changed: Never (demo)</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => toast.info('Password change flow (demo)')}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              Active Sessions
            </CardTitle>
            <Badge variant="secondary">{sessions.length} device{sessions.length !== 1 ? 's' : ''}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            These devices are currently signed in to your account. If you don't recognize a session, revoke it immediately.
          </p>

          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  session.current ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  session.current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {session.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{session.device}</p>
                    {session.current && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">This device</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{session.browser}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.lastActive}</span>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setRevokeTarget(session)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {otherSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => setRevokeAllOpen(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out All Other Devices
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Login Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Recent security events on your account.
          </p>

          <div className="space-y-2">
            {visibleActivity.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                  entry.success ? 'bg-accent' : 'bg-destructive'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{entry.action}</p>
                    {!entry.success && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Failed</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.device}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{entry.location}</span>
                    <span>{entry.ip}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{entry.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {MOCK_ACTIVITY.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setActivityExpanded(!activityExpanded)}
            >
              {activityExpanded ? (
                <><ChevronUp className="h-4 w-4 mr-1" /> Show less</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" /> Show all activity ({MOCK_ACTIVITY.length})</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TwoFactorSetup open={setupOpen} onOpenChange={setSetupOpen} onComplete={handleEnable} />

      <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the extra security layer from your account. You can re-enable it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Disable 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!revokeTarget} onOpenChange={(v) => !v && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of {revokeTarget?.device}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately end the session on that device. They'll need to sign in again to access the account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sign Out Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={revokeAllOpen} onOpenChange={setRevokeAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of all other devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end {otherSessions.length} session{otherSessions.length !== 1 ? 's' : ''} on other devices. Only your current session will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sign Out All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
