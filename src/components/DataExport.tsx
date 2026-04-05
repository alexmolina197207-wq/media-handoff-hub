import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { exportJSON, exportCSV, exportXLSX } from '@/lib/exportData';
import { toast } from 'sonner';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

const formats = [
  { id: 'csv', label: 'CSV', desc: 'Spreadsheet-compatible text format', icon: FileText, ext: '.csv' },
  { id: 'json', label: 'JSON', desc: 'Machine-readable structured data', icon: FileJson, ext: '.json' },
  { id: 'xlsx', label: 'Excel', desc: 'Formatted workbook with tables', icon: FileSpreadsheet, ext: '.xls' },
] as const;

type FormatId = typeof formats[number]['id'];

export default function DataExport() {
  const { user, media, folders, collections, shareLinks, storage } = useApp();
  const [loading, setLoading] = useState<FormatId | null>(null);

  const handleExport = (format: FormatId) => {
    setLoading(format);
    const payload = { user, media, folders, collections, shareLinks, storage };

    setTimeout(() => {
      try {
        if (format === 'csv') exportCSV(payload);
        else if (format === 'json') exportJSON(payload);
        else exportXLSX(payload);
        toast.success(`Data exported as ${format.toUpperCase()}`);
      } catch {
        toast.error('Export failed. Please try again.');
      }
      setLoading(null);
    }, 400);
  };

  return (
    <Card className="shadow-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {media.length} files · {shareLinks.length} links
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download your media library, folders, share links, and account data.
        </p>
        <div className="grid gap-2">
          {formats.map(f => (
            <Button
              key={f.id}
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              disabled={loading !== null}
              onClick={() => handleExport(f.id)}
            >
              {loading === f.id ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <f.icon className="h-4 w-4 mr-3 shrink-0" />
              )}
              <div className="text-left">
                <span className="text-sm font-medium">{f.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{f.desc}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
