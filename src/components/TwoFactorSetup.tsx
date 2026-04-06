import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Smartphone, Mail, MessageSquare, Copy, Download, CheckCircle2, ArrowLeft } from 'lucide-react';

type TwoFAMethod = 'authenticator' | 'email' | 'sms';
type SetupStep = 'choose-method' | 'setup-authenticator' | 'verify-code' | 'backup-codes' | 'done';

const MOCK_SECRET = 'JBSWY3DPEHPK3PXP';
const MOCK_BACKUP_CODES = [
  'a1b2-c3d4-e5f6', 'g7h8-i9j0-k1l2',
  'm3n4-o5p6-q7r8', 's9t0-u1v2-w3x4',
  'y5z6-a7b8-c9d0', 'e1f2-g3h4-i5j6',
  'k7l8-m9n0-o1p2', 'q3r4-s5t6-u7v8',
];

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (method: TwoFAMethod) => void;
}

export default function TwoFactorSetup({ open, onOpenChange, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('choose-method');
  const [selectedMethod, setSelectedMethod] = useState<TwoFAMethod>('authenticator');
  const [code, setCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);

  const reset = () => {
    setStep('choose-method');
    setSelectedMethod('authenticator');
    setCode('');
    setShowSecret(false);
    setCodesCopied(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleMethodSelect = (method: TwoFAMethod) => {
    setSelectedMethod(method);
    if (method === 'authenticator') {
      setStep('setup-authenticator');
    } else {
      setStep('verify-code');
    }
  };

  const handleVerify = () => {
    if (code.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setStep('backup-codes');
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(MOCK_BACKUP_CODES.join('\n')).then(() => {
      setCodesCopied(true);
      toast.success('Backup codes copied to clipboard');
    }).catch(() => {
      toast.success('Backup codes copied to clipboard');
      setCodesCopied(true);
    });
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([
      'AnyRelay - Two-Factor Authentication Backup Codes\n',
      '================================================\n\n',
      'Keep these codes in a safe place. Each code can only be used once.\n\n',
      ...MOCK_BACKUP_CODES.map((c, i) => `${i + 1}. ${c}\n`),
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anyrelay-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
    setCodesCopied(true);
  };

  const handleFinish = () => {
    onComplete(selectedMethod);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'choose-method' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account. Choose how you'd like to receive verification codes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <MethodOption
                icon={<Smartphone className="h-5 w-5" />}
                title="Authenticator App"
                description="Use an app like Google Authenticator or Authy"
                recommended
                onClick={() => handleMethodSelect('authenticator')}
              />
              <MethodOption
                icon={<Mail className="h-5 w-5" />}
                title="Email Code"
                description="Receive a verification code via email"
                onClick={() => handleMethodSelect('email')}
              />
              <MethodOption
                icon={<MessageSquare className="h-5 w-5" />}
                title="SMS Code"
                description="Receive a verification code via text message"
                onClick={() => handleMethodSelect('sms')}
              />
            </div>
          </>
        )}

        {step === 'setup-authenticator' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button onClick={() => setStep('choose-method')} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                Set Up Authenticator App
              </DialogTitle>
              <DialogDescription>
                Scan the QR code below with your authenticator app, then enter the 6-digit code to verify.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-2">
              {/* QR Code Placeholder */}
              <div className="w-48 h-48 bg-foreground/5 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-5 gap-1 p-4">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm ${
                          [0,1,2,4,5,6,10,12,14,18,20,22,23,24].includes(i)
                            ? 'bg-foreground'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Scan with your authenticator app</p>
                </div>
              </div>

              {/* Manual key */}
              <div className="w-full">
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {showSecret ? 'Hide manual key' : "Can't scan? Enter key manually"}
                </button>
                {showSecret && (
                  <div className="mt-2 flex items-center gap-2 bg-muted rounded-lg p-3">
                    <code className="text-sm font-mono text-foreground flex-1 tracking-wider">{MOCK_SECRET}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(MOCK_SECRET).catch(() => {});
                        toast.success('Secret key copied');
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-foreground">Enter 6-digit verification code</label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <Button onClick={handleVerify} className="w-full" disabled={code.length < 6}>
                Verify & Continue
              </Button>
            </div>
          </>
        )}

        {step === 'verify-code' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button onClick={() => setStep('choose-method')} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                Verify {selectedMethod === 'email' ? 'Email' : 'SMS'} Code
              </DialogTitle>
              <DialogDescription>
                {selectedMethod === 'email'
                  ? 'We sent a verification code to your email address.'
                  : 'We sent a verification code to your phone number.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {selectedMethod === 'email' ? 'Code sent to your email address' : 'Code sent to •••••••1234'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Enter 6-digit code</label>
                <Input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <Button onClick={handleVerify} className="w-full" disabled={code.length < 6}>
                Verify & Continue
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Didn't receive it?{' '}
                <button className="text-primary hover:underline" onClick={() => toast.success('Code resent')}>
                  Resend code
                </button>
              </p>
            </div>
          </>
        )}

        {step === 'backup-codes' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                Save Your Backup Codes
              </DialogTitle>
              <DialogDescription>
                Store these codes in a safe place. You can use them to access your account if you lose your authentication device.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Each code can only be used once. Save them somewhere safe — you won't be able to see them again.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-muted rounded-lg p-4">
                {MOCK_BACKUP_CODES.map((c, i) => (
                  <code key={i} className="text-sm font-mono text-foreground">{c}</code>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCopyCodes}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Codes
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDownloadCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <Button onClick={handleFinish} className="w-full" disabled={!codesCopied}>
                {codesCopied ? 'Finish Setup' : 'Save codes to continue'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MethodOption({ icon, title, description, recommended, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {recommended && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Recommended</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
