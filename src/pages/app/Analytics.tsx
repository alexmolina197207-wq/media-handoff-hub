import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { formatDate, ShareLink } from '@/data/mockData';
import {
  Upload, Link2, Layers, Tag, ChevronRight,
  MousePointerClick, Users, Globe, Lock, Eye, Clock,
  Smartphone, Monitor, Tablet, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const { activity, shareLinks, media } = useApp();
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const totalClicks = shareLinks.reduce((acc, s) => acc + s.clicks, 0);
  const totalUniqueVisitors = shareLinks.reduce((acc, s) => acc + (s.uniqueVisitors || 0), 0);

  const stats = [
    { label: 'Uploads This Week', value: activity.uploadsThisWeek, icon: Upload, route: '/app/library' },
    { label: 'Shares This Week', value: activity.sharesThisWeek, icon: Link2, route: '/app/shared' },
    { label: 'Total Link Clicks', value: totalClicks, icon: MousePointerClick, route: null },
    { label: 'Unique Visitors', value: totalUniqueVisitors, icon: Users, route: null },
  ];

  const tagCounts: Record<string, number> = {};
  media.forEach(m => m.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));

  const selectedLink = shareLinks.find(s => s.id === selectedLinkId);
  const selectedFile = selectedLink ? media.find(m => m.id === selectedLink.mediaId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your media activity and engagement.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const inner = (
            <Card className="shadow-card border-border hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.97]">
              <CardContent className="p-5 text-center relative">
                <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                {s.route && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 absolute top-2 right-2" />}
              </CardContent>
            </Card>
          );
          return s.route ? (
            <Link key={s.label} to={s.route} className="block">{inner}</Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
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
            const expired = new Date(s.expiresAt) < new Date();
            return (
              <button
                key={s.id}
                onClick={() => setSelectedLinkId(s.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {file && <img src={file.previewUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file?.title || s.slug}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant={expired ? 'destructive' : s.active ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0">
                        {expired ? 'Expired' : s.active ? 'Active' : 'Off'}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{s.access}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2 shrink-0">
                  <div>
                    <p className="text-lg font-bold text-foreground">{s.clicks}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center bg-muted rounded-md p-2">
        🧪 Analytics data is simulated for demo purposes.
      </p>

      {/* Engagement detail sheet */}
      <Sheet open={!!selectedLinkId} onOpenChange={(open) => !open && setSelectedLinkId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selectedLink && selectedFile && (
            <EngagementDetail link={selectedLink} file={selectedFile} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EngagementDetail({ link, file }: {
  link: ShareLink;
  file: { title: string; previewUrl: string; type: string };
}) {
  const expired = new Date(link.expiresAt) < new Date();

  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="text-lg">Engagement Details</SheetTitle>
      </SheetHeader>

      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
        <img src={file.previewUrl} alt={file.title} className="w-12 h-12 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{file.title}</p>
          <p className="text-xs text-muted-foreground font-mono">/{link.slug}</p>
        </div>
        <Badge variant={expired ? 'destructive' : link.active ? 'default' : 'secondary'} className="text-xs">
          {expired ? 'Expired' : link.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{link.clicks}</p>
          <p className="text-xs text-muted-foreground">Total clicks</p>
        </div>
        <div className="p-3 rounded-lg border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{link.uniqueVisitors || 0}</p>
          <p className="text-xs text-muted-foreground">Unique visitors</p>
        </div>
        <div className="p-3 rounded-lg border border-border text-center">
          <p className="text-2xl font-bold text-foreground">
            {link.uniqueVisitors && link.clicks > 0 ? (link.clicks / link.uniqueVisitors).toFixed(1) : '—'}
          </p>
          <p className="text-xs text-muted-foreground">Views/visitor</p>
        </div>
      </div>

      {/* Click history chart */}
      {link.clickHistory && link.clickHistory.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Clicks Over Time
          </p>
          <div className="flex items-end gap-1.5 h-24 p-3 rounded-lg border border-border">
            {link.clickHistory.map((h, i) => {
              const max = Math.max(...link.clickHistory!.map(c => c.clicks));
              const height = max > 0 ? (h.clicks / max) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{h.clicks}</span>
                  <div
                    className="w-full rounded-sm bg-primary min-h-[4px] transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Referrers */}
      {link.referrers && link.referrers.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Top Referrers</p>
          <div className="space-y-2">
            {link.referrers.map(r => {
              const total = link.referrers!.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
              return (
                <div key={r.source} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{r.source}</span>
                    <span className="text-muted-foreground">{r.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Devices */}
      {link.devices && link.devices.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Device Breakdown</p>
          <div className="grid grid-cols-3 gap-3">
            {link.devices.map(d => {
              const Icon = d.device === 'Mobile' ? Smartphone : d.device === 'Tablet' ? Tablet : Monitor;
              const total = link.devices!.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={d.device} className="p-3 rounded-lg border border-border text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold text-foreground">{pct}%</p>
                  <p className="text-xs text-muted-foreground">{d.device}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link info */}
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            {link.access === 'public' ? <Globe className="h-3.5 w-3.5" /> : link.access === 'password' ? <Lock className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            Access
          </span>
          <span className="text-foreground capitalize">{link.access}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Expires
          </span>
          <span className="text-foreground">{formatDate(link.expiresAt)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center bg-muted rounded-md p-2">
        🧪 Engagement data is simulated for demo purposes.
      </p>
    </div>
  );
}
