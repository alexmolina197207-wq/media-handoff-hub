import { useState, useRef, useCallback } from 'react';
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
import { GripVertical, Plus, Link2, ChevronRight } from 'lucide-react';
import { formatBytes, formatDate } from '@/data/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EMOJI_OPTIONS = ['📁', '📂', '📸', '🎬', '🎵', '📱', '💼', '🎨', '🗂️', '📦', '🚀', '💎'];

export default function Folders() {
  const { folders, media, addFolder, reorderFolders, addShareLink } = useApp();
  const navigate = useNavigate();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const selected = folders.find(f => f.id === selectedId);
  const selectedItems = selected ? media.filter(m => m.folderId === selected.id) : [];

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const reordered = [...folders];
      const [moved] = reordered.splice(dragIdx, 1);
      reordered.splice(overIdx, 0, moved);
      reorderFolders(reordered);
      toast.success('Folder order updated');
    }
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx, folders, reorderFolders]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) { toast.error('Folder name is required'); return; }
    addFolder({
      id: `folder-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Custom folder',
      icon: newIcon,
    });
    setNewName('');
    setNewDesc('');
    setNewIcon('📁');
    setDialogOpen(false);
    toast.success('Folder created!');
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

  const handleCardClick = (folderId: string, e: React.MouseEvent) => {
    // Don't open detail if clicking the drag handle
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]')) return;
    setSelectedId(folderId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Folders</h1>
          <p className="text-muted-foreground text-sm">Organize media by platform or purpose. Drag to reorder.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> New Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewIcon(e)}
                      className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center transition-all ${newIcon === e ? 'bg-primary/15 ring-2 ring-primary' : 'hover:bg-muted'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. Client Drops" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="What's this folder for?" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((f, idx) => {
          const count = media.filter(m => m.folderId === f.id).length;
          const isDragging = dragIdx === idx;
          const isOver = overIdx === idx && dragIdx !== idx;
          return (
            <div
              key={f.id}
              ref={isDragging ? dragNode : undefined}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-150 ${isDragging ? 'opacity-40 scale-95' : ''} ${isOver ? 'ring-2 ring-primary rounded-xl' : ''}`}
            >
              <Card
                className="shadow-card border-border hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
                onClick={(e) => handleCardClick(f.id, e)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical data-drag-handle className="h-4 w-4 text-muted-foreground/50 shrink-0 touch-none cursor-grab active:cursor-grabbing" />
                      <span className="text-3xl">{f.icon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{count} files</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground">{f.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Folder Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={open => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selected.icon}</span>
                  {selected.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </SheetHeader>

              <div className="flex items-center gap-3">
                <Badge variant="secondary">{selectedItems.length} files</Badge>
                <Badge variant="outline">
                  {formatBytes(selectedItems.reduce((a, m) => a + m.size, 0))} total
                </Badge>
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
                  No files in this folder yet.
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
