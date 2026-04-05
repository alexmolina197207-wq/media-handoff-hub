import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Shield, ShieldCheck, ShieldOff, Smartphone, Mail, MessageSquare,
  Monitor, Laptop, TabletSmartphone, LogOut, MapPin, Clock, ChevronDown, ChevronUp,
  Key, CheckCircle2, AlertTriangle, Eye, EyeOff, ShieldAlert, Fingerprint,
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
  const { twoFactorEnabled, twoFactorMethod, setTwoFactor, user } = useApp();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);

  // Change password state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLastChanged, setPasswordLastChanged] = useState<string | null>(null);

  // Email verification
  const [emailVerified, setEmailVerified] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);

  // Trusted device
  const [trustedDevice, setTrustedDevice] = useState(false);

  // Suspicious login warning
  const [suspiciousWarning, setSuspiciousWarning] = useState(true);
  const suspiciousLogin = MOCK_ACTIVITY.find(a => !a.success && a.location !== 'San Francisco, CA');

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

  const handleChangePassword = () => {
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLastChanged('Just now');
    setChangePasswordOpen(false);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    toast.success('Password changed successfully');
  };

  const handleResendVerification = () => {
    setVerificationSent(true);
    toast.success(`Verification email sent to ${user.email}`);
    setTimeout(() => setVerificationSent(false), 30000);
  };

  const methodInfo = twoFactorMethod ? METHOD_LABELS[twoFactorMethod] : null;
  const otherSessions = sessions.filter(s => !s.current);
  const visibleActivity = activityExpanded ? MOCK_ACTIVITY : MOCK_ACTIVITY.slice(0, 3);

  const pwStrength = newPw.length === 0 ? null : newPw.length < 8 ? 'weak' : newPw.length < 12 ? 'fair' : 'strong';
  const pwStrengthColor = pwStrength === 'weak' ? 'bg-destructive' : pwStrength === 'fair' ? 'bg-accent' : 'bg-primary';

  return (
    <>
      {/* Suspicious Login Warning */}
      {suspiciousLogin && suspiciousWarning && (
        <Card className="shadow-card border-destructive/40 border bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-destructive">Suspicious login attempt detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A failed sign-in from <strong className="text-foreground">{suspiciousLogin.location}</strong> ({suspiciousLogin.ip}) was blocked on {suspiciousLogin.timestamp}.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  If this wasn't you, we recommend changing your password and enabling 2FA.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-7 text-xs" onClick={() => setChangePasswordOpen(true)}>
                    <Key className="h-3 w-3 mr-1" />
                    Change Password
                  </Button>
                  {!twoFactorEnabled && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSetupOpen(true)}>
                      <Shield className="h-3 w-3 mr-1" />
                      Enable 2FA
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground ml-auto" onClick={() => setSuspiciousWarning(false)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Verification */}
      <Card className="shadow-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${emailVerified ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                {emailVerified ? <CheckCircle2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Email Verification</p>
                  <Badge variant={emailVerified ? 'default' : 'destructive'} className={`text-[10px] px-1.5 py-0 ${emailVerified ? 'bg-accent text-accent-foreground' : ''}`}>
                    {emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              </div>
            </div>
            {!emailVerified && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleResendVerification} disabled={verificationSent}>
                {verificationSent ? 'Sent ✓' : 'Resend'}
              </Button>
            )}
            {emailVerified && (
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => { setEmailVerified(false); toast.info('Email marked as unverified (demo)'); }}>
                Test unverified
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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

              {/* Trusted Device */}
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Remember this device</p>
                    <p className="text-xs text-muted-foreground">Skip 2FA on this device for 30 days</p>
                  </div>
                </div>
                <Switch
                  checked={trustedDevice}
                  onCheckedChange={(checked) => {
                    setTrustedDevice(checked);
                    toast.success(checked ? 'This device is now trusted for 30 days' : 'Device trust removed — 2FA required on next sign-in');
                  }}
                />
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

          {/* Password */}
          <div>
            <p className="text-sm font-medium text-foreground">Password</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last changed: {passwordLastChanged || 'Never'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setChangePasswordOpen(true)}>
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
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

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={(v) => { setChangePasswordOpen(v); if (!v) { setCurrentPw(''); setNewPw(''); setConfirmPw(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one. Use at least 8 characters with a mix of letters, numbers, and symbols.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPw(!showNewPw)}
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {pwStrength && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {['weak', 'fair', 'strong'].map((level, i) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          (pwStrength === 'weak' && i === 0) || (pwStrength === 'fair' && i <= 1) || (pwStrength === 'strong')
                            ? pwStrengthColor
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] capitalize ${pwStrength === 'weak' ? 'text-destructive' : pwStrength === 'fair' ? 'text-accent' : 'text-primary'}`}>
                    {pwStrength} password
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-[11px] text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={!currentPw || newPw.length < 8 || newPw !== confirmPw}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
