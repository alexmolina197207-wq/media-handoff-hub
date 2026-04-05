import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, Shield, Upload, Link2, Monitor, AlertTriangle,
  CheckCircle2, X, Clock, Trash2,
} from 'lucide-react';

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
    id: 'n3', type: 'security', title: 'Failed sign-in attempt',
    message: 'Someone tried to access your account from Lagos, Nigeria using Chrome 123.',
    timestamp: '1 hour ago', read: false,
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    id: 'n4', type: 'share', title: 'Shared link accessed',
    message: '"App walkthrough clip" was viewed 12 times via your public share link.',
    timestamp: '2 hours ago', read: false,
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    id: 'n5', type: 'security', title: '2FA enabled',
    message: 'Two-factor authentication was enabled on your account using Authenticator App.',
    timestamp: '3 hours ago', read: true,
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: 'n6', type: 'upload', title: 'Upload complete',
    message: '"TikTok draft — feature reveal" (22.9 MB) was uploaded successfully.',
    timestamp: '5 hours ago', read: true,
    icon: <Upload className="h-4 w-4" />,
  },
  {
    id: 'n7', type: 'share', title: 'Share link created',
    message: 'A new share link was created for "Dashboard screenshot v2" with 7-day expiry.',
    timestamp: '1 day ago', read: true,
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    id: 'n8', type: 'security', title: 'Session revoked',
    message: 'Windows Desktop · Firefox 126 session was signed out remotely.',
    timestamp: '2 days ago', read: true,
    icon: <Monitor className="h-4 w-4" />,
  },
];

const TYPE_COLORS: Record<NotificationType, string> = {
  security: 'text-primary',
  upload: 'text-accent',
  share: 'text-primary',
};

const TYPE_BG: Record<NotificationType, string> = {
  security: 'bg-primary/10',
  upload: 'bg-accent/10',
  share: 'bg-primary/10',
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filterByType = (type: string) => {
    if (type === 'all') return notifications;
    return notifications.filter(n => n.type === type);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={markAllRead}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full h-8">
              <TabsTrigger value="all" className="text-xs flex-1">
                All
                {notifications.length > 0 && <span className="ml-1 text-muted-foreground">({notifications.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs flex-1">Security</TabsTrigger>
              <TabsTrigger value="upload" className="text-xs flex-1">Uploads</TabsTrigger>
              <TabsTrigger value="share" className="text-xs flex-1">Shares</TabsTrigger>
            </TabsList>
          </div>

          {['all', 'security', 'upload', 'share'].map(tab => (
            <TabsContent key={tab} value={tab} className="m-0">
              <NotificationList
                notifications={filterByType(tab)}
                onRead={markAsRead}
                onDismiss={dismiss}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground h-7"
              onClick={clearAll}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationList({
  notifications,
  onRead,
  onDismiss,
}: {
  notifications: AppNotification[];
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No notifications</p>
        <p className="text-xs text-muted-foreground/70">You're all caught up!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[360px]">
      <div className="divide-y divide-border">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group ${
              !notif.read ? 'bg-primary/[0.03]' : ''
            }`}
            onClick={() => onRead(notif.id)}
          >
            <div className={`h-8 w-8 rounded-lg ${TYPE_BG[notif.type]} ${TYPE_COLORS[notif.type]} flex items-center justify-center shrink-0 mt-0.5`}>
              {notif.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notif.title}
                </p>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {notif.timestamp}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
