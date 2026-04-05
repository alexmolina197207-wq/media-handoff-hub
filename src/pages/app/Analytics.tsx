import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Link2, Layers, Tag, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Analytics() {
  const { activity, shareLinks, media } = useApp();
  const navigate = useNavigate();
  const totalClicks = shareLinks.reduce((acc, s) => acc + s.clicks, 0);

  const stats = [
    { label: 'Uploads This Week', value: activity.uploadsThisWeek, icon: Upload, route: '/app/library' },
    { label: 'Shares This Week', value: activity.sharesThisWeek, icon: Link2, route: '/app/shared' },
    { label: 'Active Collections', value: activity.collectionsActive, icon: Layers, route: '/app/collections' },
    { label: 'Total Link Clicks', value: totalClicks, icon: Tag, route: '/app/shared' },
  ];

  // Count files per tag for display
  const tagCounts: Record<string, number> = {};
  media.forEach(m => m.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your media activity and engagement.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.route} className="block">
            <Card className="shadow-card border-border hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.97]">
              <CardContent className="p-5 text-center relative">
                <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 absolute top-2 right-2" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Most Used Tags</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activity.topTags.map(tag => (
              <Link key={tag} to={`/app/library?tag=${encodeURIComponent(tag)}`}>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 cursor-pointer hover:bg-primary/10 active:scale-95 transition-all"
                >
                  #{tag}
                  <span className="ml-2 text-xs text-muted-foreground">{tagCounts[tag] || 0} files</span>
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader><CardTitle className="text-base">Top Shared Links</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {[...shareLinks].sort((a, b) => b.clicks - a.clicks).slice(0, 5).map(s => {
            const file = media.find(m => m.id === s.mediaId);
            return (
              <Link
                key={s.id}
                to="/app/shared"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file && <img src={file.previewUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground font-mono truncate">/{s.slug}</p>
                    <p className="text-xs text-muted-foreground">{s.access} · {s.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2 shrink-0">
                  <div>
                    <p className="text-lg font-bold text-foreground">{s.clicks}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center bg-muted rounded-md p-2">
        🧪 Analytics data is simulated for demo purposes.
      </p>
    </div>
  );
}
