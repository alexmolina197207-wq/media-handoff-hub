import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

export default function Collections() {
  const { collections, media } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Collections</h1>
        <p className="text-muted-foreground text-sm">Group media by project or campaign.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {collections.map(c => {
          const items = media.filter(m => m.collectionId === c.id);
          return (
            <Card key={c.id} className="shadow-card border-border hover:shadow-elevated transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Layers className="h-6 w-6 text-primary" />
                  <Badge variant="secondary">{items.length} files</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.purpose}</p>
                {items.length > 0 && (
                  <div className="flex -space-x-2 mt-3">
                    {items.slice(0, 4).map(m => (
                      <img key={m.id} src={m.previewUrl} alt="" className="w-8 h-8 rounded-md border-2 border-card object-cover" />
                    ))}
                    {items.length > 4 && (
                      <div className="w-8 h-8 rounded-md bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground font-medium">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
