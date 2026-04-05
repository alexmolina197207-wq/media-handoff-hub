import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle2, X, Clock, Trash2 } from 'lucide-react';
import { useNotifications, type AppNotification, type NotificationType } from '@/context/NotificationContext';

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
  const { notifications, unreadCount, markAsRead, markAllRead, dismiss, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{unreadCount} new</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={markAllRead}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full h-8">
              <TabsTrigger value="all" className="text-xs flex-1">
                All {notifications.length > 0 && <span className="ml-1 text-muted-foreground">({notifications.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs flex-1">Security</TabsTrigger>
              <TabsTrigger value="upload" className="text-xs flex-1">Uploads</TabsTrigger>
              <TabsTrigger value="share" className="text-xs flex-1">Shares</TabsTrigger>
            </TabsList>
          </div>

          {['all', 'security', 'upload', 'share'].map(tab => (
            <TabsContent key={tab} value={tab} className="m-0">
              <NotificationList notifications={filterByType(tab)} onRead={markAsRead} onDismiss={dismiss} />
            </TabsContent>
          ))}
        </Tabs>

        {notifications.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-7" onClick={clearAll}>
              <Trash2 className="h-3 w-3 mr-1" /> Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationList({ notifications, onRead, onDismiss }: {
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
            className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group ${!notif.read ? 'bg-primary/[0.03]' : ''}`}
            onClick={() => onRead(notif.id)}
          >
            <div className={`h-8 w-8 rounded-lg ${TYPE_BG[notif.type]} ${TYPE_COLORS[notif.type]} flex items-center justify-center shrink-0 mt-0.5`}>
              {notif.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium truncate ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</p>
                {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {notif.timestamp}
              </p>
            </div>
            <Button
              variant="ghost" size="icon"
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
