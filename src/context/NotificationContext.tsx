import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Upload, Link2, Monitor, Shield } from 'lucide-react';

export type NotificationType = 'security' | 'upload' | 'share';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp' | 'icon'> & { icon?: React.ReactNode }) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  upload: <Upload className="h-4 w-4" />,
  share: <Link2 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1', type: 'security', title: 'New device sign-in',
    message: 'Your account was accessed from MacBook Pro · Chrome 124 in San Francisco, CA.',
    timestamp: '2 minutes ago', read: false,
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: 'n2', type: 'upload', title: 'Upload complete',
    message: '"Product hero banner" (2.3 MB) was uploaded successfully to the Marketing folder.',
    timestamp: '15 minutes ago', read: false,
    icon: <Upload className="h-4 w-4" />,
  },
  {
    id: 'n3', type: 'share', title: 'Shared link accessed',
    message: '"App walkthrough clip" was viewed 12 times via your public share link.',
    timestamp: '2 hours ago', read: false,
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    id: 'n4', type: 'security', title: '2FA enabled',
    message: 'Two-factor authentication was enabled on your account using Authenticator App.',
    timestamp: '3 hours ago', read: true,
    icon: <Shield className="h-4 w-4" />,
  },
];

const NotificationContext = createContext<NotificationState | null>(null);

let nextId = 100;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'read' | 'timestamp' | 'icon'> & { icon?: React.ReactNode }) => {
    const newNotif: AppNotification = {
      ...n,
      id: `notif-${nextId++}`,
      read: false,
      timestamp: 'Just now',
      icon: n.icon || ICON_MAP[n.type],
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllRead, dismiss, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
