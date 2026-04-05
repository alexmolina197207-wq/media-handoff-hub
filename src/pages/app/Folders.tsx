import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Folders() {
  const { folders, media } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Folders</h1>
        <p className="text-muted-foreground text-sm">Organize media by platform or purpose.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map(f => {
          const count = media.filter(m => m.folderId === f.id).length;
          return (
            <Card key={f.id} className="shadow-card border-border hover:shadow-elevated transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{f.icon}</span>
                  <Badge variant="secondary">{count} files</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{f.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
