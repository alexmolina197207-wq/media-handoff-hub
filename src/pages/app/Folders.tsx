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
import { GripVertical, Plus } from 'lucide-react';
import { toast } from 'sonner';

const EMOJI_OPTIONS = ['📁', '📂', '📸', '🎬', '🎵', '📱', '💼', '🎨', '🗂️', '📦', '🚀', '💎'];

export default function Folders() {
  const { folders, media, addFolder, reorderFolders } = useApp();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [dialogOpen, setDialogOpen] = useState(false);
  const dragNode = useRef<HTMLDivElement | null>(null);

  // Touch drag state
  const touchStartY = useRef(0);
  const touchCurrentIdx = useRef<number | null>(null);

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
              <Card className="shadow-card border-border hover:shadow-elevated transition-shadow cursor-grab active:cursor-grabbing">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0 touch-none" />
                      <span className="text-3xl">{f.icon}</span>
                    </div>
                    <Badge variant="secondary">{count} files</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{f.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}