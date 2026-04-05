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
  addShareLink: (s: ShareLink) => void;
  upgradeUser: () => void;
  addFolder: (f: Folder) => void;
  reorderFolders: (folders: Folder[]) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User>(demoUser);
  const [media, setMedia] = useState<MediaFile[]>(demoMedia);
  const [folders, setFolders] = useState<Folder[]>(demoFolders);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(demoShareLinks);
  const [storage, setStorage] = useState<StorageSummary>(demoStorage);

  const addMedia = (m: MediaFile) => {
    setMedia(prev => [m, ...prev]);
    setStorage(prev => ({ ...prev, fileCount: prev.fileCount + 1, used: prev.used + m.size, recentUploads: prev.recentUploads + 1 }));
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

  return (
    <AppContext.Provider value={{
      user, media, folders, collections: demoCollections,
      shareLinks, storage, activity: demoActivity,
      isAuthenticated, setAuthenticated, addMedia, addShareLink, upgradeUser,
      addFolder, reorderFolders,
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
