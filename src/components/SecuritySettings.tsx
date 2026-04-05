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
import { Shield, ShieldCheck, ShieldOff, Smartphone, Mail, MessageSquare } from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';
import { useApp } from '@/context/AppContext';

const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  authenticator: { label: 'Authenticator App', icon: <Smartphone className="h-4 w-4" /> },
  email: { label: 'Email Code', icon: <Mail className="h-4 w-4" /> },
  sms: { label: 'SMS Code', icon: <MessageSquare className="h-4 w-4" /> },
};

export default function SecuritySettings() {
  const { twoFactorEnabled, twoFactorMethod, setTwoFactor } = useApp();
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  const handleEnable = (method: string) => {
    setTwoFactor(true, method);
    toast.success('Two-factor authentication enabled!');
  };

  const handleDisable = () => {
    setTwoFactor(false, null);
    setDisableOpen(false);
    toast.success('Two-factor authentication disabled');
  };

  const methodInfo = twoFactorMethod ? METHOD_LABELS[twoFactorMethod] : null;

  return (
    <>
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
    </>
  );
}
