import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  MediaFile, Folder, Collection, ShareLink, StorageSummary, ActivitySummary, User,
} from '@/data/mockData';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { persistMedia, persistShareLink } from '@/lib/supabaseHelpers';
import { supabase } from '@/integrations/supabase/client';

export interface TagPreset {
  id: string;
  name: string;
  tags: string[];
}

interface AppState {
  user: User;
  media: MediaFile[];
  folders: Folder[];
  collections: Collection[];
  shareLinks: ShareLink[];
  storage: StorageSummary;
  activity: ActivitySummary;
  isAuthenticated: boolean;
  addMedia: (m: MediaFile) => void;
  updateMedia: (id: string, updates: Partial<MediaFile>) => void;
  addShareLink: (s: ShareLink) => void;
  updateShareLink: (id: string, updates: Partial<ShareLink>) => void;
  upgradeUser: () => void;
  addFolder: (f: Folder) => void;
  reorderFolders: (folders: Folder[]) => void;
  reorderMedia: (media: MediaFile[]) => void;
  addCollection: (c: Collection) => void;
  deleteMedia: (id: string) => void;
  bulkDeleteMedia: (ids: string[]) => void;
  bulkMoveToFolder: (ids: string[], folderId: string | null) => void;
  bulkAddTags: (ids: string[], tags: string[]) => void;
  bulkRemoveTags: (ids: string[], tags: string[]) => void;
  deleteFolder: (id: string) => void;
  deleteCollection: (id: string) => void;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  setTwoFactor: (enabled: boolean, method: string | null) => void;
  tagPresets: TagPreset[];
  addTagPreset: (preset: TagPreset) => void;
  deleteTagPreset: (id: string) => void;
  updateTagPreset: (id: string, updates: Partial<TagPreset>) => void;
  hasUploaded: boolean;
  mediaDbIdMap: Map<string, string>; // local id -> db id
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotifications();
  const { user: authUser } = useAuth();
  const isAuthenticated = !!authUser;

  // Derive display user from real auth — no more fake "Alex Rivera"
  const [plan, setPlan] = useState<'free' | 'pro' | 'team'>('free');
  const user: User = {
    name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Guest',
    email: authUser?.email || '',
    plan,
  };
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [storage, setStorage] = useState<StorageSummary>({ used: 0, limit: 500_000_000, fileCount: 0, recentUploads: 0 });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    try { return localStorage.getItem('dr_2fa_enabled') === 'true'; } catch { return false; }
  });
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(() => {
    try { return localStorage.getItem('dr_2fa_method'); } catch { return null; }
  });

  const setTwoFactor = (enabled: boolean, method: string | null) => {
    setTwoFactorEnabled(enabled);
    setTwoFactorMethod(method);
    addNotification({
      type: 'security',
      title: enabled ? '2FA enabled' : '2FA disabled',
      message: enabled
        ? `Two-factor authentication was enabled using ${method || 'an authenticator'}.`
        : 'Two-factor authentication was disabled on your account.',
    });
    try {
      if (enabled) {
        localStorage.setItem('dr_2fa_enabled', 'true');
        localStorage.setItem('dr_2fa_method', method || '');
      } else {
        localStorage.removeItem('dr_2fa_enabled');
        localStorage.removeItem('dr_2fa_method');
      }
    } catch {}
  };

  const [hasUploaded, setHasUploaded] = useState(() => {
    try { return localStorage.getItem('dr_has_uploaded') === 'true'; } catch { return false; }
  });

  const [mediaDbIdMap] = useState(() => new Map<string, string>());
  const [hydrated, setHydrated] = useState(false);

  // Hydrate state from database when authenticated user session is ready
  useEffect(() => {
    if (!authUser) {
      setHydrated(true);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      try {
        const { data: dbMedia, error: mediaErr } = await supabase
          .from('media_files')
          .select('*')
          .eq('user_id', authUser!.id)
          .order('created_at', { ascending: false });

        if (mediaErr) console.error('Failed to hydrate media:', mediaErr);

        const { data: dbLinks, error: linksErr } = await supabase
          .from('share_links')
          .select('*')
          .eq('user_id', authUser!.id);

        if (linksErr) console.error('Failed to hydrate share links:', linksErr);

        if (cancelled) return;

        if (dbMedia && dbMedia.length > 0) {
          // Generate signed URLs for authenticated user's files
          const mapped: MediaFile[] = await Promise.all(dbMedia.map(async (row) => {
            mediaDbIdMap.set(row.id, row.id);

            let previewUrl = '';
            let videoUrl: string | undefined;

            // Generate signed URLs from storage paths
            const previewPath = (row as any).preview_path;
            const videoPath = (row as any).video_path;

            if (previewPath) {
              const { data } = await supabase.storage.from('media').createSignedUrl(previewPath, 3600);
              if (data) previewUrl = data.signedUrl;
            }
            if (videoPath) {
              const { data } = await supabase.storage.from('media').createSignedUrl(videoPath, 3600);
              if (data) videoUrl = data.signedUrl;
            }

            return {
              id: row.id,
              title: row.title,
              type: (row.file_type === 'video' ? 'video' : 'image') as 'image' | 'video',
              tags: row.tags || [],
              size: Number(row.size),
              folderId: row.folder_id,
              collectionId: row.collection_id,
              previewUrl,
              videoUrl,
              notes: '',
              uploadedAt: row.created_at,
              source: 'upload',
            };
          }));
          setMedia(mapped);
          const totalSize = mapped.reduce((s, m) => s + m.size, 0);
          setStorage(prev => ({
            ...prev,
            fileCount: mapped.length,
            used: totalSize,
          }));
        }

        if (dbLinks && dbLinks.length > 0) {
          const mapped: ShareLink[] = dbLinks.map(row => ({
            id: row.id,
            mediaId: row.media_id,
            slug: row.slug,
            expiresAt: row.expires_at || '',
            access: row.access as 'public' | 'private' | 'password',
            clicks: 0,
            active: row.active,
            password: row.password_hash || undefined,
          }));
          setShareLinks(mapped);
        }
      } catch (err) {
        console.error('Hydration error:', err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, [authUser?.id]);

  const addMedia = (m: MediaFile) => {
    setMedia(prev => [m, ...prev]);
    setStorage(prev => ({ ...prev, fileCount: prev.fileCount + 1, used: prev.used + m.size, recentUploads: prev.recentUploads + 1 }));
    if (!hasUploaded) {
      setHasUploaded(true);
      try { localStorage.setItem('dr_has_uploaded', 'true'); } catch {}
    }
    addNotification({
      type: 'upload',
      title: 'Upload complete',
      message: `"${m.title}" (${(m.size / 1_000_000).toFixed(1)} MB) was uploaded successfully.`,
    });
    // Persist to database
    persistMedia(m).then(dbId => {
      if (dbId) mediaDbIdMap.set(m.id, dbId);
    });
  };

  const updateMedia = (id: string, updates: Partial<MediaFile>) => {
    setMedia(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedia = (id: string) => {
    const file = media.find(m => m.id === id);
    setMedia(prev => prev.filter(m => m.id !== id));
    setShareLinks(prev => prev.filter(s => s.mediaId !== id));
    if (file) {
      setStorage(prev => ({ ...prev, fileCount: prev.fileCount - 1, used: prev.used - file.size }));
    }
  };

  const bulkDeleteMedia = (ids: string[]) => {
    const files = media.filter(m => ids.includes(m.id));
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    setMedia(prev => prev.filter(m => !ids.includes(m.id)));
    setShareLinks(prev => prev.filter(s => !ids.includes(s.mediaId)));
    setStorage(prev => ({ ...prev, fileCount: prev.fileCount - files.length, used: prev.used - totalSize }));
  };

  const bulkMoveToFolder = (ids: string[], folderId: string | null) => {
    setMedia(prev => prev.map(m => ids.includes(m.id) ? { ...m, folderId } : m));
  };

  const bulkAddTags = (ids: string[], tags: string[]) => {
    setMedia(prev => prev.map(m => ids.includes(m.id)
      ? { ...m, tags: [...new Set([...m.tags, ...tags])] }
      : m
    ));
  };

  const bulkRemoveTags = (ids: string[], tags: string[]) => {
    setMedia(prev => prev.map(m => ids.includes(m.id)
      ? { ...m, tags: m.tags.filter(t => !tags.includes(t)) }
      : m
    ));
  };

  const addShareLink = (s: ShareLink) => {
    setShareLinks(prev => [s, ...prev]);
    const file = media.find(m => m.id === s.mediaId);
    addNotification({
      type: 'share',
      title: 'Share link created',
      message: `A new share link was created for "${file?.title || 'a file'}"${s.expiresAt ? ` expiring ${new Date(s.expiresAt).toLocaleDateString()}` : ''}.`,
    });
    // Persist to database - wait for media DB id to be available
    const tryPersist = (attempts = 0) => {
      const dbMediaId = mediaDbIdMap.get(s.mediaId);
      if (dbMediaId) {
        persistShareLink(s, dbMediaId);
      } else if (attempts < 20) {
        setTimeout(() => tryPersist(attempts + 1), 300);
      }
    };
    tryPersist();
  };

  const updateShareLink = (id: string, updates: Partial<ShareLink>) => {
    setShareLinks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const upgradeUser = () => {
    setPlan('pro');
    setStorage(prev => ({ ...prev, limit: 5_000_000_000 }));
  };

  const addFolder = (f: Folder) => {
    setFolders(prev => [...prev, f]);
  };

  const reorderFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
  };

  const reorderMedia = (newMedia: MediaFile[]) => {
    setMedia(newMedia);
  };

  const addCollection = (c: Collection) => {
    setCollections(prev => [...prev, c]);
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setMedia(prev => prev.map(m => m.folderId === id ? { ...m, folderId: null } : m));
  };

  const deleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    setMedia(prev => prev.map(m => m.collectionId === id ? { ...m, collectionId: null } : m));
  };

  const defaultPresets: TagPreset[] = [
    { id: 'preset-social', name: 'Social Media', tags: ['social', 'marketing', 'content'] },
    { id: 'preset-client', name: 'Client Work', tags: ['client', 'deliverable', 'approved'] },
    { id: 'preset-internal', name: 'Internal', tags: ['internal', 'draft', 'review'] },
  ];

  const [tagPresets, setTagPresets] = useState<TagPreset[]>(() => {
    try {
      const saved = localStorage.getItem('dr_tag_presets');
      return saved ? JSON.parse(saved) : defaultPresets;
    } catch { return defaultPresets; }
  });

  const persistPresets = (presets: TagPreset[]) => {
    setTagPresets(presets);
    try { localStorage.setItem('dr_tag_presets', JSON.stringify(presets)); } catch {}
  };

  const addTagPreset = (preset: TagPreset) => persistPresets([...tagPresets, preset]);
  const deleteTagPreset = (id: string) => persistPresets(tagPresets.filter(p => p.id !== id));
  const updateTagPreset = (id: string, updates: Partial<TagPreset>) =>
    persistPresets(tagPresets.map(p => p.id === id ? { ...p, ...updates } : p));

  return (
    <AppContext.Provider value={{
      user, media, folders, collections,
      shareLinks, storage,
      isAuthenticated, addMedia, updateMedia, deleteMedia, bulkDeleteMedia, bulkMoveToFolder, bulkAddTags, bulkRemoveTags, addShareLink, updateShareLink, upgradeUser,
      addFolder, reorderFolders, reorderMedia, addCollection, deleteFolder, deleteCollection,
      twoFactorEnabled, twoFactorMethod, setTwoFactor,
      tagPresets, addTagPreset, deleteTagPreset, updateTagPreset,
      hasUploaded,
      mediaDbIdMap,
      activity: { uploadsThisWeek: 0, sharesThisWeek: 0, topTags: [], collectionsActive: 0 },
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
