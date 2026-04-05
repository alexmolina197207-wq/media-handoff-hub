import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import LoginTwoFactor from '@/components/LoginTwoFactor';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('alex@anyrelay.demo');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { setAuthenticated, twoFactorEnabled, twoFactorMethod } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorEnabled && !isSignup) {
      setShow2FA(true);
    } else {
      setAuthenticated(true);
      navigate('/app');
    }
  };

  const handleTwoFactorVerify = () => {
    setAuthenticated(true);
    navigate('/app');
  };

  const handleForgotPassword = () => {
    if (!resetEmail) return;
    setResetSent(true);
    toast.success('Password reset link sent (demo)');
  };

  if (show2FA) {
    return (
      <LoginTwoFactor
        method={twoFactorMethod || 'authenticator'}
        onVerify={handleTwoFactorVerify}
        onBack={() => setShow2FA(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mb-2">
            <span className="font-bold text-sm" style={{color:'white'}}>DR</span>
          </div>
          <CardTitle>{isSignup ? 'Create Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isSignup ? 'Start your demo experience' : 'Sign in to your demo account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Rivera" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={() => { setResetEmail(email); setResetSent(false); setForgotOpen(true); }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" type="password" placeholder="Enter any password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">{isSignup ? 'Create Account' : 'Sign In'}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button className="text-primary hover:underline font-medium" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3 bg-muted rounded-md p-2">
            🧪 This is a demo environment. No real account is created.
          </p>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={(v) => { setForgotOpen(v); if (!v) setResetSent(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              {resetSent
                ? "We've sent a password reset link to your email."
                : "Enter the email address associated with your account and we'll send you a reset link."
              }
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Check your inbox</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A reset link was sent to <strong className="text-foreground">{resetEmail}</strong>. The link expires in 1 hour.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setResetSent(false)}>
                Didn't receive it? Try again
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 py-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setForgotOpen(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
                <Button onClick={handleForgotPassword} disabled={!resetEmail}>
                  Send Reset Link
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
