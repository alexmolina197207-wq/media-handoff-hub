import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Upload, Image, Video, X, RotateCcw, AlertTriangle, CheckCircle2,
  FileWarning, Trash2, Ban, FolderOpen, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatBytes } from '@/data/mockData';

// --- Config ---
const ACCEPTED_TYPES: Record<string, 'image' | 'video'> = {
  'image/jpeg': 'image', 'image/png': 'image', 'image/webp': 'image', 'image/gif': 'image',
  'video/mp4': 'video', 'video/quicktime': 'video', 'video/webm': 'video',
};
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ACCEPT_STRING = Object.keys(ACCEPTED_TYPES).join(',');

type FileStatus = 'queued' | 'uploading' | 'complete' | 'error' | 'cancelled' | 'duplicate';

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  mediaType: 'image' | 'video';
  status: FileStatus;
  progress: number;
  error?: string;
  previewUrl?: string;
}

function fileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function UploadPage() {
  const { media, addMedia } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const abortRefs = useRef<Map<string, () => void>>(new Map());
  const dragCounter = useRef(0);

  // --- Validation ---
  const validateFile = useCallback((file: File): { ok: boolean; error?: string } => {
    if (!ACCEPTED_TYPES[file.type]) {
      return { ok: false, error: `Unsupported type: ${file.type || 'unknown'}` };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { ok: false, error: `File too large (max ${formatBytes(MAX_FILE_SIZE)})` };
    }
    return { ok: true };
  }, []);

  const isDuplicate = useCallback((file: File): boolean => {
    // Check against existing library
    const existsInLibrary = media.some(
      m => m.title === file.name && Math.abs(m.size - file.size) < 1024
    );
    return existsInLibrary;
  }, [media]);

  // --- Add files to queue ---
  const enqueueFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueuedFile[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const id = fileId(file);
      // Check already in queue
      setQueue(prev => {
        if (prev.some(q => q.id === id && q.status !== 'cancelled' && q.status !== 'error')) return prev;
        return prev;
      });

      const validation = validateFile(file);
      const duplicate = isDuplicate(file);

      let previewUrl: string | undefined;
      if (ACCEPTED_TYPES[file.type] === 'image') {
        previewUrl = URL.createObjectURL(file);
      }

      newItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        mediaType: ACCEPTED_TYPES[file.type] || 'image',
        status: !validation.ok ? 'error' : duplicate ? 'duplicate' : 'queued',
        progress: 0,
        error: validation.ok ? undefined : validation.error,
        previewUrl,
      });
    }

    setQueue(prev => {
      const existingIds = new Set(prev.filter(q => q.status !== 'cancelled' && q.status !== 'error').map(q => q.id));
      const deduped = newItems.filter(n => !existingIds.has(n.id));
      // Also check for duplicate names within the new batch
      const seen = new Set<string>();
      const filtered: QueuedFile[] = [];
      for (const item of deduped) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        filtered.push(item);
      }
      return [...prev, ...filtered];
    });
  }, [validateFile, isDuplicate]);

  // --- Simulate upload for a single file ---
  const uploadFile = useCallback((id: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'uploading', progress: 0, error: undefined } : q));

    let progress = 0;
    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled) { clearInterval(interval); return; }
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setQueue(prev => prev.map(q => {
          if (q.id !== id) return q;
          // Add to media library
          addMedia({
            id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: q.name,
            type: q.mediaType,
            tags: [],
            size: q.size,
            folderId: null,
            collectionId: null,
            previewUrl: q.previewUrl || `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop`,
            notes: '',
            uploadedAt: new Date().toISOString(),
            source: 'Upload',
          });
          return { ...q, status: 'complete', progress: 100 };
        }));
        abortRefs.current.delete(id);
      } else {
        setQueue(prev => prev.map(q => q.id === id ? { ...q, progress: Math.min(progress, 99) } : q));
      }
    }, 200 + Math.random() * 300);

    abortRefs.current.set(id, () => {
      cancelled = true;
      clearInterval(interval);
      setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'cancelled', progress: 0 } : q));
    });
  }, [addMedia]);

  // --- Auto-start queued files (one at a time) ---
  useEffect(() => {
    const uploading = queue.filter(q => q.status === 'uploading');
    if (uploading.length >= 2) return; // max 2 concurrent
    const next = queue.find(q => q.status === 'queued');
    if (next) uploadFile(next.id);
  }, [queue, uploadFile]);

  // --- Actions ---
  const cancelFile = (id: string) => {
    const abort = abortRefs.current.get(id);
    if (abort) abort();
    else setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'cancelled' } : q));
  };

  const retryFile = (id: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'queued', progress: 0, error: undefined } : q));
  };

  const forceUploadDuplicate = (id: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'queued' } : q));
  };

  const removeFile = (id: string) => {
    cancelFile(id);
    setQueue(prev => {
      const item = prev.find(q => q.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(q => q.id !== id);
    });
  };

  const clearCompleted = () => {
    setQueue(prev => {
      prev.filter(q => q.status === 'complete' && q.previewUrl).forEach(q => URL.revokeObjectURL(q.previewUrl!));
      return prev.filter(q => q.status !== 'complete');
    });
  };

  // --- Drag & Drop ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0; }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files.length) enqueueFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) enqueueFiles(e.target.files);
    e.target.value = '';
  };

  // --- Stats ---
  const completedCount = queue.filter(q => q.status === 'complete').length;
  const totalCount = queue.length;
  const hasActive = queue.some(q => q.status === 'uploading' || q.status === 'queued');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Media</h1>
          <p className="text-muted-foreground text-sm">Drag & drop or browse to upload files.</p>
        </div>
        {completedCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => navigate('/app/library')}>
            View Library
          </Button>
        )}
      </div>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed cursor-pointer transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg'
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="py-12 text-center">
          <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-foreground font-medium mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Image className="h-3.5 w-3.5" /> JPEG, PNG, WebP, GIF
            <span className="mx-1.5 text-border">|</span>
            <Video className="h-3.5 w-3.5" /> MP4, MOV, WebM
          </div>
          <p className="text-xs text-muted-foreground mt-2">Max {formatBytes(MAX_FILE_SIZE)} per file</p>
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Queue header */}
      {queue.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {completedCount}/{totalCount} uploaded
          </p>
          <div className="flex gap-2">
            {completedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
            {hasActive && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                onClick={() => queue.filter(q => q.status === 'uploading' || q.status === 'queued').forEach(q => cancelFile(q.id))}>
                Cancel all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* File queue */}
      <div className="space-y-2">
        {queue.map(item => (
          <FileQueueItem
            key={item.id}
            item={item}
            onCancel={() => cancelFile(item.id)}
            onRetry={() => retryFile(item.id)}
            onRemove={() => removeFile(item.id)}
            onForceUpload={() => forceUploadDuplicate(item.id)}
          />
        ))}
      </div>

      {queue.length === 0 && (
        <p className="text-xs text-muted-foreground text-center bg-muted rounded-md p-2">
          🧪 Demo mode — files are simulated and stored in local state only.
        </p>
      )}
    </div>
  );
}

// --- File queue item component ---
function FileQueueItem({
  item,
  onCancel,
  onRetry,
  onRemove,
  onForceUpload,
}: {
  item: QueuedFile;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
  onForceUpload: () => void;
}) {
  const statusConfig: Record<FileStatus, { icon: React.ReactNode; label: string; color: string }> = {
    queued: { icon: null, label: 'Waiting…', color: 'text-muted-foreground' },
    uploading: { icon: null, label: `${Math.round(item.progress)}%`, color: 'text-primary' },
    complete: {
      icon: <CheckCircle2 className="h-4 w-4 text-accent" />,
      label: 'Done',
      color: 'text-accent',
    },
    error: {
      icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
      label: item.error || 'Failed',
      color: 'text-destructive',
    },
    cancelled: {
      icon: <Ban className="h-4 w-4 text-muted-foreground" />,
      label: 'Cancelled',
      color: 'text-muted-foreground',
    },
    duplicate: {
      icon: <FileWarning className="h-4 w-4 text-yellow-500" />,
      label: 'Duplicate',
      color: 'text-yellow-500',
    },
  };

  const { icon, label, color } = statusConfig[item.status];

  return (
    <Card className={`border-border transition-all ${
      item.status === 'duplicate' ? 'border-yellow-500/30 bg-yellow-500/5' : ''
    } ${item.status === 'error' ? 'border-destructive/30 bg-destructive/5' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Thumbnail or icon */}
          <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
            {item.previewUrl ? (
              <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
            ) : item.mediaType === 'video' ? (
              <Video className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Image className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{formatBytes(item.size)}</span>
              <span className={`flex items-center gap-1 ${color}`}>
                {icon} {label}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.status === 'uploading' && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            {(item.status === 'error' || item.status === 'cancelled') && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRetry}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            {item.status === 'duplicate' && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onForceUpload}>
                Upload anyway
              </Button>
            )}
            {item.status !== 'uploading' && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onRemove}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {(item.status === 'uploading' || item.status === 'queued') && (
          <Progress
            value={item.progress}
            className="h-1.5 mt-2"
          />
        )}

        {/* Duplicate warning */}
        {item.status === 'duplicate' && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
            <FileWarning className="h-3 w-3 flex-shrink-0" />
            A file with this name already exists in your library.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
