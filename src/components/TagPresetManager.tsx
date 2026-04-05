import { useState } from 'react';
import { useApp, TagPreset } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, X, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  /** IDs of the files to apply presets to */
  fileIds: string[];
  onApplied?: () => void;
}

export default function TagPresetManager({ fileIds, onApplied }: Props) {
  const { tagPresets, addTagPreset, deleteTagPreset, bulkAddTags } = useApp();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);

  const handleApply = (preset: TagPreset) => {
    bulkAddTags(fileIds, preset.tags);
    toast.success(`Applied "${preset.name}" (${preset.tags.length} tags) to ${fileIds.length} file${fileIds.length > 1 ? 's' : ''}`);
    onApplied?.();
  };

  const handleAddNewTag = () => {
    const t = newTagInput.trim().toLowerCase();
    if (t && !newTags.includes(t)) {
      setNewTags(prev => [...prev, t]);
    }
    setNewTagInput('');
  };

  const handleSavePreset = () => {
    const name = newName.trim();
    if (!name || newTags.length === 0) return;
    addTagPreset({
      id: `preset-${Date.now()}`,
      name,
      tags: newTags,
    });
    toast.success(`Created preset "${name}"`);
    setCreating(false);
    setNewName('');
    setNewTags([]);
    setNewTagInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Layers className="h-3 w-3" /> Tag Presets
        </p>
        {!creating && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] px-2"
            onClick={() => setCreating(true)}
          >
            <Plus className="h-3 w-3 mr-0.5" /> New
          </Button>
        )}
      </div>

      {creating && (
        <div className="space-y-2 p-2 rounded-lg bg-muted/50 border border-border">
          <Input
            placeholder="Preset name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="h-7 text-xs"
            autoFocus
          />
          <div className="flex gap-1">
            <Input
              placeholder="Add tag…"
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewTag(); } }}
              className="h-7 text-xs"
            />
            <Button size="sm" className="h-7 text-xs px-2" onClick={handleAddNewTag} disabled={!newTagInput.trim()}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {newTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {newTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-0.5 pr-1">
                  {tag}
                  <X
                    className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                    onClick={() => setNewTags(prev => prev.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-1.5">
            <Button size="sm" className="h-7 text-xs flex-1" onClick={handleSavePreset} disabled={!newName.trim() || newTags.length === 0}>
              <Check className="h-3 w-3 mr-0.5" /> Save
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setCreating(false); setNewName(''); setNewTags([]); setNewTagInput(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {tagPresets.length === 0 && !creating ? (
        <p className="text-xs text-muted-foreground text-center py-2">No presets yet</p>
      ) : (
        <div className="space-y-1.5">
          {tagPresets.map(preset => (
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
                <Button
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => handleApply(preset)}
                >
                  Apply
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
          ))}
        </div>
      )}
    </div>
  );
}
