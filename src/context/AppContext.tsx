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
  addCollection: (c: Collection) => void;
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
      isAuthenticated, setAuthenticated, addMedia, addShareLink, upgradeUser,
      addFolder, reorderFolders, addCollection, deleteFolder, deleteCollection,
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
