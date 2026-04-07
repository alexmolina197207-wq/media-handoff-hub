import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDate, ShareLink } from '@/data/mockData';
import {
  Copy, ExternalLink, Lock, Globe, Eye, Calendar, MousePointerClick,
  Shield, Clock, Users, Smartphone, Monitor, Tablet, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SharedLinks() {
  const { shareLinks, media, updateShareLink } = useApp();
  const [selectedLink, setSelectedLink] = useState<string | null>(null);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://anyrelay.net/s/${slug}`);
    toast.success('Link copied to clipboard!');
  };

  const getStatusInfo = (s: ShareLink) => {
    const expired = new Date(s.expiresAt) < new Date();
    if (expired) return { label: 'Expired', variant: 'destructive' as const, color: 'text-destructive' };
    if (!s.active) return { label: 'Inactive', variant: 'secondary' as const, color: 'text-muted-foreground' };
    return { label: 'Active', variant: 'default' as const, color: 'text-primary' };
  };

  const accessIcon = (access: string) => {
    if (access === 'public') return <Globe className="h-3.5 w-3.5" />;
    if (access === 'password') return <Lock className="h-3.5 w-3.5" />;
    return <Eye className="h-3.5 w-3.5" />;
  };

  const detail = shareLinks.find(s => s.id === selectedLink);
  const detailFile = detail ? media.find(m => m.id === detail.mediaId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shared Links</h1>
        <p className="text-muted-foreground text-sm">
          {shareLinks.length} link{shareLinks.length !== 1 ? 's' : ''} · {shareLinks.filter(s => s.active && new Date(s.expiresAt) >= new Date()).length} active
        </p>
      </div>

      {shareLinks.length === 0 ? (
        <div className="text-center py-16">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-foreground font-medium">No share links yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create a share link from any file in your Library.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shareLinks.map(s => {
            const file = media.find(m => m.id === s.mediaId);
            const status = getStatusInfo(s);
            return (
              <Card
                key={s.id}
                className="shadow-card border-border hover:shadow-elevated transition-all cursor-pointer active:scale-[0.99]"
                onClick={() => setSelectedLink(s.id)}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {file && <img src={file.previewUrl} alt={file.title} className="w-14 h-14 rounded-md object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{file?.title || 'Unknown file'}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">anyrelay.net/s/{s.slug}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant={status.variant} className="text-[10px]">
                        {status.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {accessIcon(s.access)}
                        <span className="capitalize">{s.access}</span>
                      </span>
                      {s.access === 'password' && (
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <Lock className="h-2.5 w-2.5" /> Protected
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(s.expiresAt)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{s.clicks} clicks</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyLink(s.slug); }}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedLink} onOpenChange={(open) => !open && setSelectedLink(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {detail && detailFile && (
            <ShareLinkDetail
              link={detail}
              file={detailFile}
              onCopy={() => copyLink(detail.slug)}
              onUpdate={(updates) => {
                updateShareLink(detail.id, updates);
                toast.success('Link settings updated');
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ShareLinkDetail({ link, file, onCopy, onUpdate }: {
  link: ShareLink;
  file: { title: string; previewUrl: string; type: string };
  onCopy: () => void;
  onUpdate: (updates: Partial<ShareLink>) => void;
}) {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState(link.password || '');
  const status = (() => {
    const expired = new Date(link.expiresAt) < new Date();
    if (expired) return { label: 'Expired', variant: 'destructive' as const };
    if (!link.active) return { label: 'Inactive', variant: 'secondary' as const };
    return { label: 'Active', variant: 'default' as const };
  })();

  const expiryOptions = [
    { label: '1 day', days: 1 },
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
  ];

  return (
    <div className="space-y-5">
      <SheetHeader>
        <SheetTitle className="text-lg">Link Settings</SheetTitle>
      </SheetHeader>

      {/* File preview */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
        <img src={file.previewUrl} alt={file.title} className="w-12 h-12 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{file.title}</p>
          <p className="text-xs text-muted-foreground font-mono">anyrelay.net/s/{link.slug}</p>
        </div>
        <Badge variant={status.variant} className="text-xs shrink-0">{status.label}</Badge>
      </div>

      {/* Copy link */}
      <Button variant="outline" className="w-full" onClick={onCopy}>
        <Copy className="h-4 w-4 mr-2" /> Copy Link
      </Button>

      <Separator />

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Link active</p>
          <p className="text-xs text-muted-foreground">Disable to prevent access</p>
        </div>
        <Switch
          checked={link.active}
          onCheckedChange={(active) => onUpdate({ active })}
        />
      </div>

      {/* Access level */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Access level</p>
        <Select
          value={link.access}
          onValueChange={(v: 'public' | 'private' | 'password') => {
            if (v === 'password' && !isAuthenticated) {
              toast.info('Create a free account to use password-protected links');
              navigate('/login');
              return;
            }
            onUpdate({ access: v });
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">
              <span className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Public — anyone with link</span>
            </SelectItem>
            <SelectItem value="private">
              <span className="flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Private — restricted</span>
            </SelectItem>
            <SelectItem value="password">
              <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Password protected</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Password field */}
      {link.access === 'password' && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4" /> Password
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="h-9"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              onClick={() => onUpdate({ password })}
              disabled={!password.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Expiry */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Expiration
        </p>
        <p className="text-xs text-muted-foreground">
          Current: {formatDate(link.expiresAt)}
        </p>
        <div className="flex flex-wrap gap-2">
          {expiryOptions.map(opt => (
            <Button
              key={opt.days}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onUpdate({
                expiresAt: new Date(Date.now() + opt.days * 86400000).toISOString(),
              })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Engagement stats */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <MousePointerClick className="h-4 w-4" /> Engagement
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{link.clicks}</p>
            <p className="text-xs text-muted-foreground">Total clicks</p>
          </div>
          <div className="p-3 rounded-lg border border-border text-center">
            <p className="text-2xl font-bold text-foreground">{link.uniqueVisitors || 0}</p>
            <p className="text-xs text-muted-foreground">Unique visitors</p>
          </div>
        </div>

        {/* Click history */}
        {link.clickHistory && link.clickHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Clicks over time</p>
            <div className="flex items-end gap-1 h-16">
              {link.clickHistory.map((h, i) => {
                const max = Math.max(...link.clickHistory!.map(c => c.clicks));
                const height = max > 0 ? (h.clicks / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-sm bg-primary/80 min-h-[2px] transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Referrers */}
        {link.referrers && link.referrers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Top referrers</p>
            <div className="space-y-1.5">
              {link.referrers.map(r => {
                const total = link.referrers!.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                return (
                  <div key={r.source} className="flex items-center gap-2 text-sm">
                    <span className="text-foreground w-20 truncate">{r.source}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Devices */}
        {link.devices && link.devices.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Devices</p>
            <div className="flex gap-3">
              {link.devices.map(d => {
                const Icon = d.device === 'Mobile' ? Smartphone : d.device === 'Tablet' ? Tablet : Monitor;
                return (
                  <div key={d.device} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
