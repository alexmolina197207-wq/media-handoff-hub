import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatDate } from '@/data/mockData';
import { Upload, Link2, FolderOpen, Layers, HardDrive, TrendingUp, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { media, storage, activity, folders, collections, shareLinks } = useApp();
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back. Here's your media overview.</p>
      </div>

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
            {media.slice(0, 5).map(m => (
              <Link key={m.id} to="/app/library" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors">
                <img src={m.previewUrl} alt={m.title} className="w-10 h-10 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(m.uploadedAt)} · {formatBytes(m.size)}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{m.type}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader><CardTitle className="text-base">Top Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {activity.topTags.map(tag => (
                <Link key={tag} to={`/app/library?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-primary/10 active:scale-95 transition-all">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
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
