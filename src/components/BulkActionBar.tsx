import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Trash2, FolderOpen, Link2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  selectedIds: Set<string>;
  onClear: () => void;
}

export default function BulkActionBar({ selectedIds, onClear }: Props) {
  const { folders, addShareLink, bulkDeleteMedia, bulkMoveToFolder } = useApp();
  const [moveOpen, setMoveOpen] = useState(false);
  const count = selectedIds.size;

  if (count === 0) return null;

  const ids = Array.from(selectedIds);

  const handleMove = (folderId: string | null) => {
    bulkMoveToFolder(ids, folderId);
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'None';
    toast.success(`${count} file${count > 1 ? 's' : ''} moved to ${folderName}`);
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
    toast.success(`${count} share link${count > 1 ? 's' : ''} created!`);
    onClear();
  };

  const handleDelete = () => {
    bulkDeleteMedia(ids);
    toast.success(`${count} file${count > 1 ? 's' : ''} deleted`);
    onClear();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-card border border-border rounded-xl shadow-elevated px-4 py-3 animate-fade-in">
      <span className="text-sm font-medium text-foreground mr-1">
        {count} selected
      </span>

      {/* Move to folder */}
      <Popover open={moveOpen} onOpenChange={setMoveOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
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
      <Button size="sm" variant="outline" onClick={handleShare}>
        <Link2 className="h-4 w-4 mr-1" /> Share
      </Button>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} file{count > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected files and their share links. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear selection */}
      <Button size="icon" variant="ghost" onClick={onClear} className="h-8 w-8 ml-1">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
