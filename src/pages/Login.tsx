import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('alex@droprelay.demo');
  const [password, setPassword] = useState('');
  const { setAuthenticated } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticated(true);
    navigate('/app');
  };

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
              <Label htmlFor="password">Password</Label>
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
    </div>
  );
}
