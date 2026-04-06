import { useState, useRef, useCallback } from 'react';
import { useApp, TagPreset } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, X, Trash2, Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';

function SwipeableRow({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const [confirming, setConfirming] = useState(false);

  const resetPosition = useCallback(() => {
    if (!rowRef.current) return;
    rowRef.current.style.transition = 'transform 200ms ease-out';
    rowRef.current.style.transform = 'translateX(0)';
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (confirming) return;
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
    swiping.current = true;
  }, [confirming]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current || !rowRef.current) return;
    const diff = e.touches[0].clientX - startX.current;
    currentX.current = Math.min(0, diff);
    rowRef.current.style.transform = `translateX(${currentX.current}px)`;
    rowRef.current.style.transition = 'none';
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!rowRef.current) return;
    swiping.current = false;
    const threshold = -80;
    if (currentX.current < threshold) {
      // Hold at reveal position and show confirm
      rowRef.current.style.transition = 'transform 200ms ease-out';
      rowRef.current.style.transform = 'translateX(-90px)';
      setConfirming(true);
    } else {
      resetPosition();
    }
    currentX.current = 0;
  }, [resetPosition]);

  const handleConfirmDelete = useCallback(() => {
    if (!rowRef.current) return;
    rowRef.current.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
    rowRef.current.style.transform = 'translateX(-100%)';
    rowRef.current.style.opacity = '0';
    setTimeout(onDelete, 200);
  }, [onDelete]);

  const handleCancelDelete = useCallback(() => {
    setConfirming(false);
    resetPosition();
  }, [resetPosition]);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete background with confirm/cancel */}
      <div className="absolute inset-0 bg-destructive flex items-center justify-end gap-1.5 pr-2 rounded-lg">
        {confirming ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] px-2 text-destructive-foreground hover:bg-destructive-foreground/20"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-6 text-[10px] px-2 bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </>
        ) : (
          <Trash2 className="h-4 w-4 text-destructive-foreground" />
        )}
      </div>
      <div
        ref={rowRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}

interface Props {
  fileIds: string[];
  onApplied?: () => void;
}

function PresetForm({
  initialName = '',
  initialTags = [] as string[],
  onSave,
  onCancel,
  saveLabel = 'Save',
}: {
  initialName?: string;
  initialTags?: string[];
  onSave: (name: string, tags: string[]) => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const [name, setName] = useState(initialName);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  return (
    <div className="space-y-2 p-2 rounded-lg bg-muted/50 border border-border">
      <Input
        placeholder="Preset name…"
        value={name}
        onChange={e => setName(e.target.value)}
        className="h-7 text-xs"
        autoFocus
      />
      <div className="flex gap-1">
        <Input
          placeholder="Add tag…"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          className="h-7 text-xs"
        />
        <Button size="sm" className="h-7 text-xs px-2" onClick={addTag} disabled={!tagInput.trim()}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] gap-0.5 pr-1">
              {tag}
              <X
                className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                onClick={() => setTags(prev => prev.filter(t => t !== tag))}
              />
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <Button size="sm" className="h-7 text-xs flex-1" onClick={() => onSave(name.trim(), tags)} disabled={!name.trim() || tags.length === 0}>
          <Check className="h-3 w-3 mr-0.5" /> {saveLabel}
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function TagPresetManager({ fileIds, onApplied }: Props) {
  const { tagPresets, addTagPreset, deleteTagPreset, updateTagPreset, bulkAddTags } = useApp();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleApply = (preset: TagPreset) => {
    bulkAddTags(fileIds, preset.tags);
    toast.success(`Applied "${preset.name}" (${preset.tags.length} tags) to ${fileIds.length} file${fileIds.length > 1 ? 's' : ''}`);
    onApplied?.();
  };

  const handleCreate = (name: string, tags: string[]) => {
    addTagPreset({ id: `preset-${Date.now()}`, name, tags });
    toast.success(`Created preset "${name}"`);
    setCreating(false);
  };

  const handleUpdate = (id: string, name: string, tags: string[]) => {
    updateTagPreset(id, { name, tags });
    toast.success(`Updated preset "${name}"`);
    setEditingId(null);
  };

  const handleDelete = (preset: TagPreset) => {
    deleteTagPreset(preset.id);
    toast(`Deleted "${preset.name}"`, {
      action: {
        label: 'Undo',
        onClick: () => {
          addTagPreset(preset);
          toast.success(`Restored "${preset.name}"`);
        },
      },
      duration: 5000,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Layers className="h-3 w-3" /> Tag Presets
        </p>
        {!creating && !editingId && (
          <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setCreating(true)}>
            <Plus className="h-3 w-3 mr-0.5" /> New
          </Button>
        )}
      </div>

      {creating && (
        <PresetForm onSave={handleCreate} onCancel={() => setCreating(false)} saveLabel="Create" />
      )}

      {tagPresets.length === 0 && !creating ? (
        <p className="text-xs text-muted-foreground text-center py-2">No presets yet</p>
      ) : (
        <div className="space-y-1.5">
          {tagPresets.map(preset =>
            editingId === preset.id ? (
              <PresetForm
                key={preset.id}
                initialName={preset.name}
                initialTags={preset.tags}
                onSave={(name, tags) => handleUpdate(preset.id, name, tags)}
                onCancel={() => setEditingId(null)}
                saveLabel="Update"
              />
            ) : (
              <SwipeableRow
                key={preset.id}
                onDelete={() => handleDelete(preset)}
              >
                <div
                  className="group flex items-start gap-2 p-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{preset.name}</p>
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {preset.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => handleApply(preset)}>
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                      onClick={() => { setEditingId(preset.id); setCreating(false); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(preset)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </SwipeableRow>
            )
          )}
        </div>
      )}
    </div>
  );
}
