import { ReactNode, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard, Image, Upload, FolderOpen, Link2, Layers, HardDrive, BarChart3, Settings, LogOut, Sun, Moon, Menu,
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

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user } = useApp();
  const { signOut } = useAuth();
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
              {navItems.map(item => {
                const active = isItemActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={cn(
                          'hover:bg-sidebar-accent',
                          active && 'bg-sidebar-accent text-sidebar-primary font-medium'
                        )}
                        activeClassName=""
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={async () => { await signOut(); navigate('/'); }}>
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

function MobileDrawerNav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();
  const { signOut } = useAuth();

  const isActive = (url: string) => {
    if (url === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(url);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <img src={anyrelayLogo} alt="AnyRelay" className="w-7 h-7 shrink-0" />
              <span className="font-bold text-foreground">AnyRelay</span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {navItems.map(item => {
              const active = isActive(item.url);
              return (
                <button
                  key={item.url}
                  onClick={() => { navigate(item.url); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.plan} plan</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={async () => { await signOut(); navigate('/'); setOpen(false); }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card">
            <MobileDrawerNav />
            <SidebarTrigger className="mr-4 hidden md:flex" />
            <h2 className="font-semibold text-foreground text-sm ml-2 md:ml-0">AnyRelay Dashboard</h2>
            <div className="ml-auto flex items-center gap-1">
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
