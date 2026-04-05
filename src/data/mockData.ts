export interface User {
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'team';
  avatar?: string;
}

export interface MediaFile {
  id: string;
  title: string;
  type: 'image' | 'video';
  tags: string[];
  size: number; // bytes
  folderId: string | null;
  collectionId: string | null;
  previewUrl: string;
  notes: string;
  uploadedAt: string;
  source: string;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Collection {
  id: string;
  name: string;
  purpose: string;
}

export interface ShareLink {
  id: string;
  mediaId: string;
  slug: string;
  expiresAt: string;
  access: 'public' | 'private' | 'password';
  clicks: number;
  active: boolean;
}

export interface StorageSummary {
  used: number; // bytes
  limit: number;
  fileCount: number;
  recentUploads: number;
}

export interface ActivitySummary {
  uploadsThisWeek: number;
  sharesThisWeek: number;
  topTags: string[];
  collectionsActive: number;
}

export const demoUser: User = {
  name: 'Alex Rivera',
  email: 'alex@droprelay.demo',
  plan: 'free',
};

const colors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', '06b6d4', 'ec4899', '14b8a6'];
const placeholderImg = (w: number, h: number, i: number) =>
  `https://images.unsplash.com/photo-${['1611162617213-7d7a39e9b1d7','1526374965328-7f61d4dc18c5','1574375927938-d5a98e8d6f2b','1551650975-87deedd944c6','1618556450994-a6a128ef0d9d','1535016120720-40c646be5580','1498050108023-c5249f4df085','1504805572947-34fad45aed93','1519389950473-47ba0277781c','1516321318423-f06f85e504b3','1611532736597-de2d4265fba3','1542831371-29b0f74f9713'][i % 12]}?w=${w}&h=${h}&fit=crop&auto=format`;

export const demoFolders: Folder[] = [
  { id: 'f1', name: 'Telegram', description: 'Content for Telegram channels', icon: '📨' },
  { id: 'f2', name: 'X / Twitter', description: 'Posts and media for X', icon: '🐦' },
  { id: 'f3', name: 'Reels & Shorts', description: 'Short-form vertical video', icon: '🎬' },
  { id: 'f4', name: 'TikTok', description: 'TikTok drafts and reposts', icon: '🎵' },
  { id: 'f5', name: 'Archive', description: 'Stored for later use', icon: '📦' },
  { id: 'f6', name: 'Client Drops', description: 'Files shared by clients', icon: '📁' },
];

export const demoCollections: Collection[] = [
  { id: 'c1', name: 'Q1 Campaign', purpose: 'Marketing assets for Q1 launch' },
  { id: 'c2', name: 'Product Screenshots', purpose: 'App screenshots for listings' },
  { id: 'c3', name: 'Team Memes', purpose: 'Internal fun folder' },
  { id: 'c4', name: 'Client — Acme Corp', purpose: 'Deliverables for Acme' },
];

export const demoMedia: MediaFile[] = [
  { id: 'm1', title: 'Product hero banner', type: 'image', tags: ['marketing','hero'], size: 2400000, folderId: 'f2', collectionId: 'c1', previewUrl: placeholderImg(400,300,0), notes: 'Main banner for campaign', uploadedAt: '2025-03-28T10:30:00Z', source: 'Upload' },
  { id: 'm2', title: 'App walkthrough clip', type: 'video', tags: ['demo','product'], size: 18500000, folderId: 'f3', collectionId: 'c2', previewUrl: placeholderImg(400,300,1), notes: '30s walkthrough for reels', uploadedAt: '2025-03-27T15:20:00Z', source: 'Screen Record' },
  { id: 'm3', title: 'Team photo — offsite', type: 'image', tags: ['team','culture'], size: 3100000, folderId: 'f5', collectionId: null, previewUrl: placeholderImg(400,300,2), notes: '', uploadedAt: '2025-03-25T09:00:00Z', source: 'Upload' },
  { id: 'm4', title: 'Dashboard screenshot v2', type: 'image', tags: ['product','screenshot'], size: 890000, folderId: 'f2', collectionId: 'c2', previewUrl: placeholderImg(400,300,3), notes: 'Updated UI', uploadedAt: '2025-03-24T11:45:00Z', source: 'Upload' },
  { id: 'm5', title: 'TikTok draft — feature reveal', type: 'video', tags: ['tiktok','draft'], size: 24000000, folderId: 'f4', collectionId: null, previewUrl: placeholderImg(400,300,4), notes: 'Needs voiceover', uploadedAt: '2025-03-23T16:10:00Z', source: 'Import' },
  { id: 'm6', title: 'Meme — deploy friday', type: 'image', tags: ['meme','fun'], size: 450000, folderId: 'f5', collectionId: 'c3', previewUrl: placeholderImg(400,300,5), notes: '', uploadedAt: '2025-03-22T14:00:00Z', source: 'Upload' },
  { id: 'm7', title: 'Client logo — Acme', type: 'image', tags: ['client','logo'], size: 120000, folderId: 'f6', collectionId: 'c4', previewUrl: placeholderImg(400,300,6), notes: 'SVG version preferred', uploadedAt: '2025-03-21T08:30:00Z', source: 'Client Drop' },
  { id: 'm8', title: 'Promo reel — spring sale', type: 'video', tags: ['promo','marketing'], size: 32000000, folderId: 'f3', collectionId: 'c1', previewUrl: placeholderImg(400,300,7), notes: '15s version', uploadedAt: '2025-03-20T12:00:00Z', source: 'Upload' },
  { id: 'm9', title: 'Telegram infographic', type: 'image', tags: ['telegram','infographic'], size: 1800000, folderId: 'f1', collectionId: null, previewUrl: placeholderImg(400,300,8), notes: 'For channel post', uploadedAt: '2025-03-19T17:30:00Z', source: 'Design Tool' },
  { id: 'm10', title: 'Behind the scenes clip', type: 'video', tags: ['bts','culture'], size: 15000000, folderId: 'f5', collectionId: 'c3', previewUrl: placeholderImg(400,300,9), notes: '', uploadedAt: '2025-03-18T10:15:00Z', source: 'Upload' },
  { id: 'm11', title: 'Feature comparison table', type: 'image', tags: ['product','comparison'], size: 680000, folderId: 'f2', collectionId: 'c2', previewUrl: placeholderImg(400,300,10), notes: 'For blog post', uploadedAt: '2025-03-17T13:45:00Z', source: 'Upload' },
  { id: 'm12', title: 'Onboarding tutorial', type: 'video', tags: ['tutorial','product'], size: 42000000, folderId: 'f3', collectionId: null, previewUrl: placeholderImg(400,300,11), notes: '2min full tutorial', uploadedAt: '2025-03-16T09:00:00Z', source: 'Screen Record' },
];

export const demoShareLinks: ShareLink[] = [
  { id: 's1', mediaId: 'm1', slug: 'hero-banner-q1', expiresAt: '2025-04-15T00:00:00Z', access: 'public', clicks: 47, active: true },
  { id: 's2', mediaId: 'm2', slug: 'walkthrough-demo', expiresAt: '2025-04-10T00:00:00Z', access: 'public', clicks: 123, active: true },
  { id: 's3', mediaId: 'm7', slug: 'acme-logo-drop', expiresAt: '2025-04-01T00:00:00Z', access: 'password', clicks: 8, active: false },
  { id: 's4', mediaId: 'm8', slug: 'spring-promo-reel', expiresAt: '2025-05-01T00:00:00Z', access: 'public', clicks: 312, active: true },
  { id: 's5', mediaId: 'm9', slug: 'tg-infographic', expiresAt: '2025-04-20T00:00:00Z', access: 'private', clicks: 15, active: true },
];

export const demoStorage: StorageSummary = {
  used: 141_940_000,
  limit: 500_000_000,
  fileCount: 12,
  recentUploads: 4,
};

export const demoActivity: ActivitySummary = {
  uploadsThisWeek: 4,
  sharesThisWeek: 7,
  topTags: ['marketing', 'product', 'demo', 'tiktok', 'meme'],
  collectionsActive: 3,
};

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
