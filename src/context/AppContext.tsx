import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  MediaFile, Folder, Collection, ShareLink, StorageSummary, ActivitySummary, User,
  demoUser, demoMedia, demoFolders, demoCollections, demoShareLinks, demoStorage, demoActivity,
} from '@/data/mockData';

interface AppState {
  user: User;
  media: MediaFile[];
  folders: Folder[];
  collections: Collection[];
  shareLinks: ShareLink[];
  storage: StorageSummary;
  activity: ActivitySummary;
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  addMedia: (m: MediaFile) => void;
  updateMedia: (id: string, updates: Partial<MediaFile>) => void;
  addShareLink: (s: ShareLink) => void;
  upgradeUser: () => void;
  addFolder: (f: Folder) => void;
  reorderFolders: (folders: Folder[]) => void;
  reorderMedia: (media: MediaFile[]) => void;
  addCollection: (c: Collection) => void;
  deleteMedia: (id: string) => void;
  bulkDeleteMedia: (ids: string[]) => void;
  bulkMoveToFolder: (ids: string[], folderId: string | null) => void;
  deleteFolder: (id: string) => void;
  deleteCollection: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(demoUser);
  const [media, setMedia] = useState<MediaFile[]>(demoMedia);
  const [folders, setFolders] = useState<Folder[]>(demoFolders);
  const [collections, setCollections] = useState<Collection[]>(demoCollections);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(demoShareLinks);
  const [storage, setStorage] = useState<StorageSummary>(demoStorage);

  const addMedia = (m: MediaFile) => {
    setMedia(prev => [m, ...prev]);
    setStorage(prev => ({ ...prev, fileCount: prev.fileCount + 1, used: prev.used + m.size, recentUploads: prev.recentUploads + 1 }));
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

  const addShareLink = (s: ShareLink) => {
    setShareLinks(prev => [s, ...prev]);
  };

  const upgradeUser = () => {
    setUser(prev => ({ ...prev, plan: 'pro' }));
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

  return (
    <AppContext.Provider value={{
      user, media, folders, collections,
      shareLinks, storage, activity: demoActivity,
      isAuthenticated, setAuthenticated, addMedia, updateMedia, deleteMedia, bulkDeleteMedia, bulkMoveToFolder, addShareLink, upgradeUser,
      addFolder, reorderFolders, reorderMedia, addCollection, deleteFolder, deleteCollection,
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
