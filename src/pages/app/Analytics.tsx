import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Link2, Layers, Tag } from 'lucide-react';

export default function Analytics() {
  const { activity, shareLinks } = useApp();
  const totalClicks = shareLinks.reduce((acc, s) => acc + s.clicks, 0);

  const stats = [
    { label: 'Uploads This Week', value: activity.uploadsThisWeek, icon: Upload },
    { label: 'Shares This Week', value: activity.sharesThisWeek, icon: Link2 },
    { label: 'Active Collections', value: activity.collectionsActive, icon: Layers },
    { label: 'Total Link Clicks', value: totalClicks, icon: Tag },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your media activity and engagement.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="shadow-card border-border">
            <CardContent className="p-5 text-center">
              <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Most Used Tags</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activity.topTags.map((tag, i) => (
              <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                #{tag}
                <span className="ml-2 text-xs text-muted-foreground">{Math.floor(Math.random() * 10 + 3)} files</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Top Shared Links</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {shareLinks.sort((a, b) => b.clicks - a.clicks).slice(0, 5).map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground font-mono">/{s.slug}</p>
                <p className="text-xs text-muted-foreground">{s.access} · {s.active ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{s.clicks}</p>
                <p className="text-xs text-muted-foreground">clicks</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center bg-muted rounded-md p-2">
        🧪 Analytics data is simulated for demo purposes.
      </p>
    </div>
  );
}
