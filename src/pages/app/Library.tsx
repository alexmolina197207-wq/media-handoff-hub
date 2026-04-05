import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDate } from '@/data/mockData';
import { Search, Grid3X3, List, Image, Video, Link2, FolderOpen } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import MediaDetailSheet from '@/components/MediaDetailSheet';

export default function Library() {
  const { media, folders, collections, addShareLink, shareLinks } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('tag') || '');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      setSearch(tag);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = media.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.title.toLowerCase().includes(q) || m.tags.some(t => t.includes(q));
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const selected = media.find(m => m.id === selectedId);
  const selectedFolder = selected ? folders.find(f => f.id === selected.folderId) : undefined;
  const selectedCollection = selected ? collections.find(c => c.id === selected.collectionId) : undefined;
  const selectedLinks = selected ? shareLinks.filter(s => s.mediaId === selected.id) : [];

  const createShareLink = (mediaId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const slug = `share-${Date.now().toString(36)}`;
    addShareLink({
      id: `s-${Date.now()}`,
      mediaId,
      slug,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      access: 'public',
      clicks: 0,
      active: true,
    });
    toast.success('Share link created!', { description: `droprelay.app/${slug}` });
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://droprelay.app/s/${slug}`);
    toast.success('Link copied!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} files</p>
        </div>
        <Button onClick={() => navigate('/app/upload')}>Upload New</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search files or tags..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('all')}>All</Button>
          <Button variant={typeFilter === 'image' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('image')}><Image className="h-4 w-4 mr-1" />Images</Button>
          <Button variant={typeFilter === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('video')}><Video className="h-4 w-4 mr-1" />Videos</Button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setView('grid')}><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      {search && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            Filtering: "{search}"
            <button onClick={() => setSearch('')} className="ml-1 hover:text-destructive text-xs">✕</button>
          </Badge>
        </div>
      )}

      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(m => {
            const folder = folders.find(f => f.id === m.folderId);
            return (
              <Card
                key={m.id}
                className="shadow-card border-border overflow-hidden group hover:shadow-elevated transition-shadow cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedId(m.id)}
              >
                <div className="relative aspect-video bg-muted">
                  <img src={m.previewUrl} alt={m.title} className="w-full h-full object-cover" />
                  <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                    {m.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                    {m.type}
                  </Badge>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => createShareLink(m.id, e)}>
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatBytes(m.size)}</span>
                    <span>·</span>
                    <span>{formatDate(m.uploadedAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.tags.slice(0, 2).map(t => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-primary/10 active:scale-95 transition-all"
                        onClick={(e) => { e.stopPropagation(); setSearch(t); }}
                      >
                        {t}
                      </Badge>
                    ))}
                    {folder && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <FolderOpen className="h-2.5 w-2.5 mr-0.5" />{folder.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => {
            const folder = folders.find(f => f.id === m.folderId);
            return (
              <div
                key={m.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedId(m.id)}
              >
                <img src={m.previewUrl} alt={m.title} className="w-12 h-12 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{m.type}</Badge>
                    <span>{formatBytes(m.size)}</span>
                    <span>{formatDate(m.uploadedAt)}</span>
                    {folder && <span>📁 {folder.name}</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={(e) => createShareLink(m.id, e)}>
                  <Link2 className="h-4 w-4 mr-1" /> Share
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={open => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <div className="space-y-5">
              <SheetHeader className="space-y-0">
                <SheetTitle className="text-lg">{selected.title}</SheetTitle>
              </SheetHeader>

              <div className="rounded-lg overflow-hidden border border-border">
                <img src={selected.previewUrl} alt={selected.title} className="w-full aspect-video object-cover" />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  {selected.type === 'video' ? <Video className="h-4 w-4 text-muted-foreground" /> : <Image className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground capitalize">{selected.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground">{formatBytes(selected.size)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="text-foreground">{formatDate(selected.uploadedAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Source:</span>
                  <span className="text-foreground">{selected.source}</span>
                </div>
              </div>

              {/* Folder & Collection */}
              {(selectedFolder || selectedCollection) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    {selectedFolder && (
                      <div className="flex items-center gap-2 text-sm">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Folder:</span>
                        <Badge variant="secondary" className="text-xs">{selectedFolder.icon} {selectedFolder.name}</Badge>
                      </div>
                    )}
                    {selectedCollection && (
                      <div className="flex items-center gap-2 text-sm">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Collection:</span>
                        <Badge variant="secondary" className="text-xs">{selectedCollection.name}</Badge>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Tags */}
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Tag className="h-4 w-4" /> Tags
                </div>
                {selected.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(t => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-primary/10 active:scale-95 transition-all"
                        onClick={() => { setSelectedId(null); setSearch(t); }}
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">{selected.notes}</p>
                  </div>
                </>
              )}

              {/* Sharing */}
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Share Links
                </p>
                {selectedLinks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLinks.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border text-sm">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-foreground truncate">droprelay.app/s/{s.slug}</p>
                          <p className="text-xs text-muted-foreground">{s.clicks} clicks · {s.active ? 'Active' : 'Inactive'}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copyLink(s.slug)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No share links yet.</p>
                )}
                <Button size="sm" variant="outline" className="w-full" onClick={() => createShareLink(selected.id)}>
                  <Link2 className="h-4 w-4 mr-1" /> Create Share Link
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
