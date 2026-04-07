import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (isSignup) {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        toast.error(error);
      } else {
        setConfirmationSent(true);
        toast.success('Check your email to confirm your account');
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error(error);
      } else {
        navigate('/app');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return;
    const { error } = await resetPassword(resetEmail);
    if (error) {
      toast.error(error);
    } else {
      setResetSent(true);
      toast.success('Password reset link sent');
    }
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated border-border text-center">
          <CardContent className="py-10 space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setConfirmationSent(false); setIsSignup(false); }}>
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elevated border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-10 h-10 rounded-lg gradient-hero flex items-center justify-center mb-2">
            <span className="font-bold text-sm" style={{color:'white'}}>AR</span>
          </div>
          <CardTitle>{isSignup ? 'Create Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isSignup ? 'Create your account to get started' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
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
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isSignup ? 'Creating…' : 'Signing in…') : (isSignup ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button className="text-primary hover:underline font-medium" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3">
            No account? You can still upload without signing in.
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
