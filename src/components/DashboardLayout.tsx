import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Image, Upload, FolderOpen, Link2, Layers, HardDrive, BarChart3, Settings, LogOut, Sun, Moon, MoreHorizontal,
} from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import { cn } from '@/lib/utils';
import anyrelayLogo from '@/assets/anyrelay-logo.png';

const navItems = [
  { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
  { title: 'Library', url: '/app/library', icon: Image },
  { title: 'Upload', url: '/app/upload', icon: Upload },
  { title: 'Folders', url: '/app/folders', icon: FolderOpen },
  { title: 'Collections', url: '/app/collections', icon: Layers },
  { title: 'Shared Links', url: '/app/shared', icon: Link2 },
  { title: 'Storage', url: '/app/storage', icon: HardDrive },
  { title: 'Analytics', url: '/app/analytics', icon: BarChart3 },
  { title: 'Settings', url: '/app/settings', icon: Settings },
];

// Primary tabs shown in the bottom bar (max 5)
const bottomTabs = [
  { title: 'Home', url: '/app', icon: LayoutDashboard },
  { title: 'Library', url: '/app/library', icon: Image },
  { title: 'Upload', url: '/app/upload', icon: Upload },
  { title: 'Links', url: '/app/shared', icon: Link2 },
  { title: 'More', url: '__more__', icon: MoreHorizontal },
];

// Items shown in the "More" sheet on mobile
const moreItems = navItems.filter(
  item => !bottomTabs.some(tab => tab.url === item.url)
);

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, setAuthenticated } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isItemActive = (url: string) => {
    if (url === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border hidden md:flex">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          <img src={anyrelayLogo} alt="AnyRelay" className="w-8 h-8 shrink-0" />
          {!collapsed && <span className="font-bold text-sidebar-foreground">AnyRelay</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className={cn(
                        'hover:bg-sidebar-accent',
                        item.title === 'Upload' && 'ring-1 ring-primary/30 bg-primary/5 font-medium text-primary'
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium !ring-0"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.plan} plan</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={() => { setAuthenticated(false); navigate('/'); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, setAuthenticated } = useApp();

  const isActive = (url: string) => {
    if (url === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(url);
  };

  // Check if current route is in "more" items
  const isMoreActive = moreItems.some(item => isActive(item.url));

  return (
    <>
      {/* More sheet overlay */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={() => setMoreOpen(false)} />
      )}
      {moreOpen && (
        <div className="fixed bottom-16 left-2 right-2 z-50 bg-card border border-border rounded-xl shadow-elevated p-2 animate-fade-in">
          <div className="grid grid-cols-3 gap-1">
            {moreItems.map(item => (
              <button
                key={item.url}
                onClick={() => { navigate(item.url); setMoreOpen(false); }}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg transition-colors',
                  isActive(item.url)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.title}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border mt-2 pt-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-xs text-muted-foreground truncate">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => { setAuthenticated(false); navigate('/'); }}
            >
              <LogOut className="h-3 w-3 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border md:hidden safe-area-bottom">
        <div className="flex items-stretch">
          {bottomTabs.map(tab => {
            const active = tab.url === '__more__' ? (isMoreActive || moreOpen) : isActive(tab.url);
            return (
              <button
                key={tab.title}
                onClick={() => {
                  if (tab.url === '__more__') {
                    setMoreOpen(prev => !prev);
                  } else {
                    setMoreOpen(false);
                    navigate(tab.url);
                  }
                }}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <tab.icon className={cn('h-5 w-5', active && 'scale-110')} />
                <span className={cn('text-[10px]', active ? 'font-semibold' : 'font-medium')}>
                  {tab.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

import { useState } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card">
            <SidebarTrigger className="mr-4 hidden md:flex" />
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center shrink-0">
                <span className="font-bold text-[10px]" style={{color:'white'}}>DR</span>
              </div>
            </div>
            <h2 className="font-semibold text-foreground text-sm ml-2 md:ml-0">AnyRelay Dashboard</h2>
            <div className="ml-auto flex items-center gap-1">
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
