import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import TagPresetManager from '@/components/TagPresetManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Trash2, FolderOpen, Link2, X, Tag, Plus, Minus, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  selectedIds: Set<string>;
  onClear: () => void;
}

export default function BulkActionBar({ selectedIds, onClear }: Props) {
  const { media, folders, addShareLink, bulkDeleteMedia, bulkMoveToFolder, bulkAddTags, bulkRemoveTags } = useApp();
  const [moveOpen, setMoveOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tagMode, setTagMode] = useState<'add' | 'remove'>('add');
  const count = selectedIds.size;

  const selectedTags = useMemo(() => {
    const ids = Array.from(selectedIds);
    const tagCount = new Map<string, number>();
    media.filter(m => ids.includes(m.id)).forEach(m =>
      m.tags.forEach(t => tagCount.set(t, (tagCount.get(t) || 0) + 1))
    );
    return [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, cnt]) => ({ tag, count: cnt, all: cnt === count }));
  }, [selectedIds, media, count]);

  if (count === 0) return null;

  const ids = Array.from(selectedIds);

  const handleMove = (folderId: string | null) => {
    bulkMoveToFolder(ids, folderId);
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'None';
    toast.success(`Moved ${count} file${count > 1 ? 's' : ''} to ${folderName}`);
    setMoveOpen(false);
    onClear();
  };

  const handleShare = () => {
    ids.forEach(mediaId => {
      const slug = `share-${Date.now().toString(36)}-${mediaId.slice(-4)}`;
      addShareLink({
        id: `s-${Date.now()}-${mediaId.slice(-4)}`,
        mediaId,
        slug,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        access: 'public',
        clicks: 0,
        active: true,
      });
    });
    toast.success(`Created ${count} share link${count > 1 ? 's' : ''}`);
    onClear();
  };

  const handleDelete = () => {
    bulkDeleteMedia(ids);
    toast.success(`Deleted ${count} file${count > 1 ? 's' : ''}`);
    onClear();
  };

  const handleAddTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    bulkAddTags(ids, [t]);
    toast.success(`Added "${t}" to ${count} file${count > 1 ? 's' : ''}`);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    bulkRemoveTags(ids, [tag]);
    toast.success(`Removed "${tag}" from ${count} file${count > 1 ? 's' : ''}`);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg">
      {/* Selection indicator */}
      <div className="bg-card border border-border rounded-xl shadow-elevated animate-fade-in">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <CheckSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground flex-1">
            {count} file{count > 1 ? 's' : ''} selected
          </span>
          <Button size="icon" variant="ghost" onClick={onClear} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {/* Tag editor */}
          <Popover open={tagOpen} onOpenChange={setTagOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0">
                <Tag className="h-4 w-4 mr-1" /> Tags
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="center" side="top">
              <div className="flex gap-1 mb-3">
                <Button
                  size="sm"
                  variant={tagMode === 'add' ? 'default' : 'outline'}
                  className="flex-1 h-7 text-xs"
                  onClick={() => setTagMode('add')}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
                <Button
                  size="sm"
                  variant={tagMode === 'remove' ? 'default' : 'outline'}
                  className="flex-1 h-7 text-xs"
                  onClick={() => setTagMode('remove')}
                >
                  <Minus className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>

              {tagMode === 'add' ? (
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Type a tag…"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(tagInput); } }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button size="sm" className="h-8" onClick={() => handleAddTag(tagInput)} disabled={!tagInput.trim()}>
                      Add
                    </Button>
                  </div>
                  {selectedTags.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">Current tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTags.map(({ tag, all }) => (
                          <Badge key={tag} variant={all ? 'default' : 'secondary'} className="text-[10px]">
                            {tag}
                            {!all && <span className="ml-0.5 opacity-60">(partial)</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTags.length > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground">Tap to remove from all files</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map(({ tag }) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all text-xs gap-1 pr-1"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">No tags on selected files</p>
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Move to folder */}
          <Popover open={moveOpen} onOpenChange={setMoveOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="shrink-0">
                <FolderOpen className="h-4 w-4 mr-1" /> Move
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="center" side="top">
              <div className="space-y-1">
                <button
                  onClick={() => handleMove(null)}
                  className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  No folder
                </button>
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleMove(f.id)}
                    className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-foreground"
                  >
                    {f.icon} {f.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Share */}
          <Button size="sm" variant="outline" onClick={handleShare} className="shrink-0">
            <Link2 className="h-4 w-4 mr-1" /> Share
          </Button>

          {/* Delete with strong confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="shrink-0">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {count} file{count > 1 ? 's' : ''} permanently?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This will permanently remove:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>{count} file{count > 1 ? 's' : ''} from your library</li>
                    <li>All associated share links</li>
                    <li>Any engagement data for those links</li>
                  </ul>
                  <p className="font-medium text-destructive">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep files</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete {count} file{count > 1 ? 's' : ''}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
