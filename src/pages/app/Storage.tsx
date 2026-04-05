import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatDate } from '@/data/mockData';
import { HardDrive, TrendingUp, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Storage() {
  const { storage, user, media, upgradeUser } = useApp();
  const pct = Math.round((storage.used / storage.limit) * 100);

  const handleUpgrade = () => {
    upgradeUser();
    toast.success('🎉 Upgraded to Pro!', { description: 'Your storage limit is now 5 GB.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Storage</h1>
        <p className="text-muted-foreground text-sm">Monitor your usage and manage your plan.</p>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HardDrive className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Storage Usage</p>
                <p className="text-sm text-muted-foreground">{formatBytes(storage.used)} of {formatBytes(storage.limit)}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">{pct}%</Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-4 mb-2">
            <div className={`h-4 rounded-full transition-all gradient-hero`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{formatBytes(storage.limit - storage.used)} remaining</p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-5 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{storage.fileCount}</p>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-5 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-foreground">{storage.recentUploads}</p>
            <p className="text-sm text-muted-foreground">Recent Uploads</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-5 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground capitalize">{user.plan}</p>
            <p className="text-sm text-muted-foreground">Current Plan</p>
          </CardContent>
        </Card>
      </div>

      {user.plan === 'free' && (
        <Card className="shadow-card border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Running low on space?</p>
              <p className="text-sm text-muted-foreground">Upgrade to Pro for 5 GB storage, unlimited files, and advanced analytics.</p>
            </div>
            <Button onClick={handleUpgrade}>Upgrade to Pro — $12/mo</Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Recent Files</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {media.slice(0, 5).map(m => (
            <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <img src={m.previewUrl} alt={m.title} className="w-9 h-9 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(m.uploadedAt)}</p>
              </div>
              <span className="text-xs text-muted-foreground">{formatBytes(m.size)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
