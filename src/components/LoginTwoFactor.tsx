import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, ArrowLeft } from 'lucide-react';

interface LoginTwoFactorProps {
  method: string;
  onVerify: () => void;
  onBack: () => void;
}

export default function LoginTwoFactor({ method, onVerify, onBack }: LoginTwoFactorProps) {
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Please enter a valid code');
      return;
    }
    onVerify();
  };

  const methodText = method === 'authenticator'
    ? 'Enter the 6-digit code from your authenticator app.'
    : method === 'email'
      ? 'Enter the 6-digit code sent to your email.'
      : 'Enter the 6-digit code sent to your phone.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <CardTitle>{useBackup ? 'Enter Backup Code' : 'Two-Factor Verification'}</CardTitle>
          <CardDescription>
            {useBackup
              ? 'Enter one of your backup codes to sign in.'
              : methodText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={code}
              onChange={e => {
                const val = useBackup ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(val);
              }}
              placeholder={useBackup ? 'a1b2-c3d4-e5f6' : '000000'}
              className={useBackup ? 'text-center font-mono' : 'text-center text-lg tracking-[0.5em] font-mono'}
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={code.length < 6}>
              Verify
            </Button>
          </form>
          <div className="flex flex-col items-center gap-2 mt-4">
            <button
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => { setUseBackup(!useBackup); setCode(''); }}
            >
              {useBackup ? 'Use verification code instead' : 'Use a backup code'}
            </button>
            <button
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={onBack}
            >
              <ArrowLeft className="h-3 w-3" /> Back to sign in
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3 bg-muted rounded-md p-2">
            🧪 Enter any 6+ digit code to continue (demo).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
