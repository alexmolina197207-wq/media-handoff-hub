import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AlertTriangle, Moon, Sun, Trash2 } from 'lucide-react';
import SecuritySettings from '@/components/SecuritySettings';
import NotificationPreferences from '@/components/NotificationPreferences';
import DataExport from '@/components/DataExport';

export default function AppSettings() {
  const { user, upgradeUser, setAuthenticated } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [deleteStep, setDeleteStep] = useState<'closed' | 'warning' | 'confirm'>('closed');
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = () => {
    setAuthenticated(false);
    setDeleteStep('closed');
    toast.success('Account scheduled for deletion. You have 30 days to cancel.');
    navigate('/');
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input defaultValue={user.name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user.email} />
          </div>
          <Button onClick={() => toast.success('Profile saved')}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <SecuritySettings />

      <NotificationPreferences />

      <DataExport />

      <Card className="shadow-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Billing & Plan</CardTitle>
            <Badge variant="secondary" className="capitalize">{user.plan} plan</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.plan === 'free' ? (
            <>
              <p className="text-sm text-muted-foreground">You're on the free plan with 500 MB storage and basic features.</p>
              <div className="flex gap-3">
                <Button onClick={() => { upgradeUser(); toast.success('🎉 Upgraded to Pro!'); }}>Upgrade to Pro — $12/mo</Button>
                <Button variant="outline" onClick={() => toast.info('Contact sales for Team plan pricing')}>Team Plan</Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">You're on the <strong>Pro</strong> plan with 5 GB storage and full features.</p>
              <Button variant="outline" onClick={() => toast.info('Opening billing portal...')}>Manage Billing</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="shadow-card border-destructive/30 border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data, including files, folders, collections, and shared links. This action cannot be undone after 30 days.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteStep('warning')}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete My Account
          </Button>
        </CardContent>
      </Card>


      {/* Step 1: Warning */}
      <AlertDialog open={deleteStep === 'warning'} onOpenChange={v => !v && setDeleteStep('closed')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">Deleting your account will permanently remove:</span>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>All uploaded files and media</li>
                <li>Folders, collections, and tags</li>
                <li>Shared links and access permissions</li>
                <li>Account settings and preferences</li>
              </ul>
              <span className="block font-medium text-foreground">
                You have 30 days to cancel the deletion before it becomes permanent.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={() => { setDeleteStep('confirm'); setConfirmText(''); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2: Type to confirm */}
      <AlertDialog open={deleteStep === 'confirm'} onOpenChange={v => !v && setDeleteStep('closed')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Confirm Account Deletion</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  To confirm, type <strong className="text-foreground font-mono">delete my account</strong> below.
                </p>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                  className="font-mono"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteStep('closed')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={confirmText.toLowerCase() !== 'delete my account'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Permanently Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}