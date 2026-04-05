import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Layers, Plus, ArrowLeft, Link2, ChevronRight, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatBytes, formatDate } from '@/data/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Collections() {
  const { collections, media, addCollection, addShareLink, deleteCollection } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPurpose, setNewPurpose] = useState('');

  const selected = collections.find(c => c.id === selectedId);
  const selectedItems = selected ? media.filter(m => m.collectionId === selected.id) : [];

  const handleCreate = () => {
    if (!newName.trim()) { toast.error('Collection name is required'); return; }
    addCollection({
      id: `c-${Date.now()}`,
      name: newName.trim(),
      purpose: newPurpose.trim() || 'Custom collection',
    });
    setNewName('');
    setNewPurpose('');
    setDialogOpen(false);
    toast.success('Collection created!');
  };

  const createShareLink = (mediaId: string) => {
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
    toast.success('Share link created!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground text-sm">Group media by project or campaign.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. Q2 Campaign" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea placeholder="What's this collection for?" value={newPurpose} onChange={e => setNewPurpose(e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {collections.map(c => {
          const items = media.filter(m => m.collectionId === c.id);
          return (
            <Card
              key={c.id}
              className="shadow-card border-border hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => setSelectedId(c.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Layers className="h-6 w-6 text-primary" />
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{items.length} files</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.purpose}</p>
                {items.length > 0 && (
                  <div className="flex -space-x-2 mt-3">
                    {items.slice(0, 4).map(m => (
                      <img key={m.id} src={m.previewUrl} alt="" className="w-8 h-8 rounded-md border-2 border-card object-cover" />
                    ))}
                    {items.length > 4 && (
                      <div className="w-8 h-8 rounded-md bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground font-medium">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Collection Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={open => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  {selected.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">{selected.purpose}</p>
              </SheetHeader>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{selectedItems.length} files</Badge>
                  <Badge variant="outline">
                    {formatBytes(selectedItems.reduce((a, m) => a + m.size, 0))} total
                  </Badge>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{selected.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the collection. Files inside will be unassigned but not deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => { deleteCollection(selected.id); setSelectedId(null); toast.success('Collection deleted'); }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {selectedItems.length > 0 ? (
                <div className="space-y-2">
                  {selectedItems.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 active:bg-muted transition-colors">
                      <img src={m.previewUrl} alt={m.title} className="w-11 h-11 rounded-md object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(m.size)} · {formatDate(m.uploadedAt)}</p>
                        {m.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.tags.slice(0, 3).map(t => (
                              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); createShareLink(m.id); }}>
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No files in this collection yet.
                  <Button variant="link" className="block mx-auto mt-2" onClick={() => { setSelectedId(null); navigate('/app/upload'); }}>
                    Upload media →
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
