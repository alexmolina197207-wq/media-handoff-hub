import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MediaFile, formatBytes, formatDate } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Image, Video, Link2, FolderOpen, Layers, FileText, Calendar,
  HardDrive, Tag, Copy, Pencil, Check, X, Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  mediaId: string | null;
  onClose: () => void;
  onTagClick: (tag: string) => void;
}

export default function MediaDetailSheet({ mediaId, onClose, onTagClick }: Props) {
  const { media, folders, collections, shareLinks, addShareLink, updateMedia } = useApp();
  const selected = media.find(m => m.id === mediaId);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState<string | null>(null);

  // Sync edit state when selected file changes or edit mode starts
  useEffect(() => {
    if (selected) {
      setTitle(selected.title);
      setNotes(selected.notes);
      setTags([...selected.tags]);
      setFolderId(selected.folderId);
      setCollectionId(selected.collectionId);
    }
    setEditing(false);
  }, [selected?.id]);

  if (!selected) return null;

  const selectedFolder = folders.find(f => f.id === selected.folderId);
  const selectedCollection = collections.find(c => c.id === selected.collectionId);
  const selectedLinks = shareLinks.filter(s => s.mediaId === selected.id);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Title cannot be empty');
      return;
    }
    updateMedia(selected.id, {
      title: trimmedTitle,
      notes: notes.trim(),
      tags: tags.filter(t => t.trim()),
      folderId,
      collectionId,
    });
    setEditing(false);
    toast.success('File updated!');
  };

  const handleCancel = () => {
    setTitle(selected.title);
    setNotes(selected.notes);
    setTags([...selected.tags]);
    setFolderId(selected.folderId);
    setCollectionId(selected.collectionId);
    setEditing(false);
  };

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const createShareLink = () => {
    const slug = `share-${Date.now().toString(36)}`;
    addShareLink({
      id: `s-${Date.now()}`,
      mediaId: selected.id,
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
    <Sheet open={!!mediaId} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <div className="space-y-5">
          <SheetHeader className="space-y-0 flex flex-row items-center justify-between">
            {editing ? (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-lg font-semibold"
                maxLength={100}
              />
            ) : (
              <SheetTitle className="text-lg">{selected.title}</SheetTitle>
            )}
            {!editing ? (
              <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="shrink-0">
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </SheetHeader>

          <div className="rounded-lg overflow-hidden border border-border">
            <img src={selected.previewUrl} alt={selected.title} className="w-full aspect-video object-cover" />
          </div>

          {/* Metadata (read-only) */}
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
          <Separator />
          <div className="space-y-3">
            {editing ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" /> Folder
                  </label>
                  <Select value={folderId ?? '__none__'} onValueChange={v => setFolderId(v === '__none__' ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {folders.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.icon} {f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4" /> Collection
                  </label>
                  <Select value={collectionId ?? '__none__'} onValueChange={v => setCollectionId(v === '__none__' ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {collections.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
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
                {!selectedFolder && !selectedCollection && (
                  <p className="text-sm text-muted-foreground">No folder or collection assigned.</p>
                )}
              </>
            )}
          </div>

          {/* Tags */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="h-4 w-4" /> Tags
            </div>
            {editing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <Badge key={t} variant="outline" className="text-xs gap-1">
                      #{t}
                      <button onClick={() => removeTag(t)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="h-8 text-sm"
                    maxLength={30}
                  />
                  <Button size="sm" variant="outline" onClick={addTag} className="h-8">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {selected.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(t => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-primary/10 active:scale-95 transition-all"
                        onClick={() => { onClose(); onTagClick(t); }}
                      >
                        #{t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </>
            )}
          </div>

          {/* Notes */}
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Notes</p>
            {editing ? (
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes..."
                className="min-h-[80px]"
                maxLength={500}
              />
            ) : (
              selected.notes ? (
                <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">{selected.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No notes</p>
              )
            )}
          </div>

          {/* Sharing (always visible, not editable) */}
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
            <Button size="sm" variant="outline" className="w-full" onClick={createShareLink}>
              <Link2 className="h-4 w-4 mr-1" /> Create Share Link
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
