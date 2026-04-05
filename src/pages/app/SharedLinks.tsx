import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/data/mockData';
import { Copy, ExternalLink, Lock, Globe, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedLinks() {
  const { shareLinks, media } = useApp();

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://droprelay.app/s/${slug}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Shared Links</h1>
        <p className="text-muted-foreground text-sm">{shareLinks.length} active and past share links.</p>
      </div>
      <div className="space-y-3">
        {shareLinks.map(s => {
          const file = media.find(m => m.id === s.mediaId);
          const expired = new Date(s.expiresAt) < new Date();
          const accessIcon = s.access === 'public' ? Globe : s.access === 'password' ? Lock : Eye;
          const AccessIcon = accessIcon;
          return (
            <Card key={s.id} className="shadow-card border-border">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {file && <img src={file.previewUrl} alt={file.title} className="w-14 h-14 rounded-md object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{file?.title || 'Unknown file'}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">droprelay.app/s/{s.slug}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={expired ? 'destructive' : s.active ? 'default' : 'secondary'} className="text-[10px]">
                      {expired ? 'Expired' : s.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <AccessIcon className="h-3 w-3" /> {s.access}
                    </span>
                    <span className="text-xs text-muted-foreground">Expires {formatDate(s.expiresAt)}</span>
                    <span className="text-xs text-muted-foreground">{s.clicks} clicks</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => copyLink(s.slug)}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
