import type { MediaFile, Folder, Collection, ShareLink, User, StorageSummary } from '@/data/mockData';

interface ExportPayload {
  user: User;
  media: MediaFile[];
  folders: Folder[];
  collections: Collection[];
  shareLinks: ShareLink[];
  storage: StorageSummary;
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ── JSON ──
export function exportJSON(data: ExportPayload) {
  const payload = {
    exportedAt: new Date().toISOString(),
    account: { name: data.user.name, email: data.user.email, plan: data.user.plan },
    storage: { used: formatBytes(data.storage.used), limit: formatBytes(data.storage.limit), fileCount: data.storage.fileCount },
    media: data.media.map(m => ({
      title: m.title, type: m.type, tags: m.tags, size: formatBytes(m.size),
      folder: data.folders.find(f => f.id === m.folderId)?.name || null,
      collection: data.collections.find(c => c.id === m.collectionId)?.name || null,
      uploadedAt: m.uploadedAt, source: m.source, notes: m.notes,
    })),
    folders: data.folders.map(f => ({ name: f.name, description: f.description })),
    collections: data.collections.map(c => ({ name: c.name, purpose: c.purpose })),
    shareLinks: data.shareLinks.map(s => {
      const file = data.media.find(m => m.id === s.mediaId);
      return { file: file?.title || 'Unknown', slug: s.slug, access: s.access, clicks: s.clicks, expiresAt: s.expiresAt };
    }),
  };
  triggerDownload(JSON.stringify(payload, null, 2), 'droprelay-export.json', 'application/json');
}

// ── CSV ──
function escapeCsv(val: string) {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function toCsv(headers: string[], rows: string[][]) {
  return [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
}

export function exportCSV(data: ExportPayload) {
  const mediaHeaders = ['Title', 'Type', 'Tags', 'Size', 'Folder', 'Collection', 'Uploaded', 'Source', 'Notes'];
  const mediaRows = data.media.map(m => [
    m.title, m.type, m.tags.join('; '), formatBytes(m.size),
    data.folders.find(f => f.id === m.folderId)?.name || '',
    data.collections.find(c => c.id === m.collectionId)?.name || '',
    m.uploadedAt, m.source, m.notes,
  ]);

  const linkHeaders = ['File', 'Slug', 'Access', 'Clicks', 'Expires'];
  const linkRows = data.shareLinks.map(s => {
    const file = data.media.find(m => m.id === s.mediaId);
    return [file?.title || 'Unknown', s.slug, s.access, String(s.clicks), s.expiresAt];
  });

  const sections = [
    `# Account`,
    `Name,${escapeCsv(data.user.name)}`,
    `Email,${escapeCsv(data.user.email)}`,
    `Plan,${data.user.plan}`,
    `Storage Used,${formatBytes(data.storage.used)}`,
    `Storage Limit,${formatBytes(data.storage.limit)}`,
    `Total Files,${data.storage.fileCount}`,
    '',
    '# Media Library',
    toCsv(mediaHeaders, mediaRows),
    '',
    '# Share Links',
    toCsv(linkHeaders, linkRows),
  ];

  triggerDownload(sections.join('\n'), 'droprelay-export.csv', 'text/csv');
}

// ── XLSX (HTML table approach for broad compatibility) ──
export function exportXLSX(data: ExportPayload) {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const accountRows = [
    ['Name', data.user.name], ['Email', data.user.email], ['Plan', data.user.plan],
    ['Storage Used', formatBytes(data.storage.used)], ['Storage Limit', formatBytes(data.storage.limit)],
    ['Total Files', String(data.storage.fileCount)],
  ];

  const mediaHeaders = ['Title', 'Type', 'Tags', 'Size', 'Folder', 'Collection', 'Uploaded', 'Source', 'Notes'];
  const mediaRows = data.media.map(m => [
    m.title, m.type, m.tags.join('; '), formatBytes(m.size),
    data.folders.find(f => f.id === m.folderId)?.name || '',
    data.collections.find(c => c.id === m.collectionId)?.name || '',
    m.uploadedAt, m.source, m.notes,
  ]);

  const linkHeaders = ['File', 'Slug', 'Access', 'Clicks', 'Expires'];
  const linkRows = data.shareLinks.map(s => {
    const file = data.media.find(m => m.id === s.mediaId);
    return [file?.title || 'Unknown', s.slug, s.access, String(s.clicks), s.expiresAt];
  });

  const makeTable = (title: string, headers: string[], rows: string[][]) => `
    <table>
      <tr><td colspan="${headers.length}" style="font-weight:bold;font-size:14pt">${escape(title)}</td></tr>
      <tr>${headers.map(h => `<th style="font-weight:bold;background:#D5E8F0;border:1px solid #ccc;padding:4px">${escape(h)}</th>`).join('')}</tr>
      ${rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ccc;padding:4px">${escape(c)}</td>`).join('')}</tr>`).join('')}
    </table><br/>`;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
      <x:ExcelWorksheet><x:Name>Export</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
    </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body>
      ${makeTable('Account', ['Field', 'Value'], accountRows)}
      ${makeTable('Media Library', mediaHeaders, mediaRows)}
      ${makeTable('Share Links', linkHeaders, linkRows)}
    </body></html>`;

  triggerDownload(html, 'droprelay-export.xls', 'application/vnd.ms-excel');
}
