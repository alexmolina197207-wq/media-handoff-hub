import { useState } from 'react';
import { useApp, TagPreset } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, X, Trash2, Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';

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
              <div
                key={preset.id}
                className="group flex items-start gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
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
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                    onClick={() => { setEditingId(preset.id); setCreating(false); }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => { deleteTagPreset(preset.id); toast.success(`Deleted "${preset.name}"`); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
