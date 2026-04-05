import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, Video, CheckCircle, Sparkles, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AI_TAG_POOL = [
  'screenshot', 'meme', 'product', 'group photo', 'document',
  'short-form', 'tutorial', 'promo', 'archive', 'lifestyle',
  'behind-the-scenes', 'announcement', 'testimonial', 'infographic',
];

function pickSuggestedTags(count = 5): string[] {
  const shuffled = [...AI_TAG_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function UploadPage() {
  const { folders, collections, addMedia } = useApp();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [folder, setFolder] = useState('');
  const [collection, setCollection] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFileSelect = useCallback(() => {
    setFileSelected(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setSuggestedTags(pickSuggestedTags(5));
      setShowSuggestions(true);
    }, 800);
  }, []);

  const acceptTag = (tag: string) => {
    if (!tags.includes(tag)) setTags(prev => [...prev, tag]);
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const dismissTag = (tag: string) => {
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const addManualTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const simulateUpload = () => {
    if (!title.trim()) { toast.error('Please enter a title'); return; }
    setUploading(true);
    setTimeout(() => {
      addMedia({
        id: `m-${Date.now()}`,
        title: title.trim(),
        type: fileType,
        tags,
        size: Math.floor(Math.random() * 20000000) + 500000,
        folderId: folder || null,
        collectionId: collection || null,
        previewUrl: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop`,
        notes,
        uploadedAt: new Date().toISOString(),
        source: 'Upload',
      });
      setUploading(false);
      toast.success('File uploaded successfully!');
      navigate('/app/library');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Media</h1>
        <p className="text-muted-foreground text-sm">Add images or videos to your library.</p>
      </div>

      {!fileSelected ? (
        <Card
          className={`shadow-card border-2 border-dashed cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(); }}
          onClick={handleFileSelect}
        >
          <CardContent className="py-16 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Image className="h-4 w-4" /> JPEG, PNG, WebP, GIF
              <span className="mx-2">|</span>
              <Video className="h-4 w-4" /> MP4, MOV, WebM
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" /> File selected (simulated)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button variant={fileType === 'image' ? 'default' : 'outline'} size="sm" onClick={() => setFileType('image')}>
                <Image className="h-4 w-4 mr-1" /> Image
              </Button>
              <Button variant={fileType === 'video' ? 'default' : 'outline'} size="sm" onClick={() => setFileType('video')}>
                <Video className="h-4 w-4 mr-1" /> Video
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="My awesome media file" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {/* AI Suggested Tags */}
            {showSuggestions && suggestedTags.length > 0 && (
              <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI-Suggested Tags
                </div>
                <p className="text-xs text-muted-foreground">Tap to accept, or dismiss tags you don't need.</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer border-primary/30 hover:bg-primary/10 active:scale-95 transition-all pl-2.5 pr-1 gap-1"
                    >
                      <span onClick={() => acceptTag(tag)}>
                        <Plus className="h-3 w-3 inline mr-0.5" />{tag}
                      </span>
                      <button onClick={() => dismissTag(tag)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <p className="text-xs text-muted-foreground">Tags can be auto-suggested by AI or added manually.</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag…"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addManualTag())}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={addManualTag} disabled={!tagInput.trim()}>Add</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                  <SelectContent>
                    {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.icon} {f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Collection</Label>
                <Select value={collection} onValueChange={setCollection}>
                  <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                  <SelectContent>
                    {collections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Optional notes about this file..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button onClick={simulateUpload} disabled={uploading} className="flex-1">
                {uploading ? 'Uploading...' : 'Upload File'}
              </Button>
              <Button variant="outline" onClick={() => { setFileSelected(false); setShowSuggestions(false); setSuggestedTags([]); setTags([]); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center bg-muted rounded-md p-2">
        🧪 Demo mode — files are simulated and stored in local state only.
      </p>
    </div>
  );
}