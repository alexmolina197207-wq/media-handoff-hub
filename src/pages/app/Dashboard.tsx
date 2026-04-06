import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDate } from '@/data/mockData';
import { Upload, Link2, FolderOpen, Layers, HardDrive, TrendingUp, ChevronRight, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { media, storage, activity, folders, collections, shareLinks, hasUploaded } = useApp();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Files', value: storage.fileCount, icon: Upload, color: 'text-primary', route: '/app/library' },
    { label: 'Share Links', value: shareLinks.length, icon: Link2, color: 'text-accent', route: '/app/shared' },
    { label: 'Folders', value: folders.length, icon: FolderOpen, color: 'text-primary', route: '/app/folders' },
    { label: 'Collections', value: collections.length, icon: Layers, color: 'text-accent', route: '/app/collections' },
    { label: 'Storage Used', value: formatBytes(storage.used), icon: HardDrive, color: 'text-primary', route: '/app/storage' },
    { label: 'Uploads This Week', value: activity.uploadsThisWeek, icon: TrendingUp, color: 'text-accent', route: '/app/analytics' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Onboarding banner — hidden after first upload */}
      {!hasUploaded && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Welcome to AnyRelay</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Start by uploading your first file to generate a secure share link — no account needed.
            </p>
          </div>
          <Button size="lg" className="gradient-hero shrink-0 gap-2" style={{ color: 'white' }} onClick={() => navigate('/app/upload')}>
            <Upload className="h-4 w-4" />
            Upload File
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.route} className="block">
            <Card className="shadow-card border-border transition-all duration-100 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.97] active:shadow-sm h-full">
              <CardContent className="p-3 md:p-4 text-center relative">
                <s.icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
                <p className="text-xl md:text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 absolute top-2 right-2" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader><CardTitle className="text-base">Recent Uploads</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {media.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No files yet — upload your first file to get started</p>
              </div>
            ) : (
              media.slice(0, 5).map(m => (
                <Link key={m.id} to="/app/library" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors">
                  <img src={m.previewUrl} alt={m.title} className="w-10 h-10 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.uploadedAt)} · {formatBytes(m.size)}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{m.type}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader><CardTitle className="text-base">Top Tags</CardTitle></CardHeader>
          <CardContent>
            {activity.topTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6">
                {activity.topTags.map(tag => (
                  <Link key={tag} to={`/app/library?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-primary/10 active:scale-95 transition-all">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Storage</p>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="h-3 rounded-full gradient-hero transition-all" style={{ width: `${(storage.used / storage.limit) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatBytes(storage.used)} of {formatBytes(storage.limit)} used</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
