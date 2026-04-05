import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image, Video, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const { folders, collections, addMedia } = useApp();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
  const [collection, setCollection] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const simulateUpload = () => {
    if (!title.trim()) { toast.error('Please enter a title'); return; }
    setUploading(true);
    setTimeout(() => {
      addMedia({
        id: `m-${Date.now()}`,
        title: title.trim(),
        type: fileType,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
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
          onDrop={e => { e.preventDefault(); setIsDragging(false); setFileSelected(true); }}
          onClick={() => setFileSelected(true)}
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
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="marketing, hero, product" value={tags} onChange={e => setTags(e.target.value)} />
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
              <Button variant="outline" onClick={() => setFileSelected(false)}>Cancel</Button>
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
