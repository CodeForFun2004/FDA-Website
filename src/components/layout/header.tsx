"use client";

import  { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Bell, Search, User, LogOut } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Button, Input } from '../../components/ui/common';
import { clearSessionCookie } from '@/helpers/auth-session';

export const Header = () => {
  const { toggleSidebar, theme, setTheme, currentUser, logout } = useAppStore();
  const router = useRouter();
  const { signOut } = useClerk();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };



const handleLogout = () => {
  logout();               // clear zustand store
  clearSessionCookie();   // clear cookie fda_session
  router.replace("/authenticate/login");
};

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <form className="hidden flex-1 md:block max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[300px]"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
          {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <div className="relative pl-4 border-l">
            <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 outline-none"
            >
                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30">
                    <User className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{currentUser?.role || 'Viewer'}</p>
                </div>
            </button>

            {/* Simple Dropdown Menu */}
            {showProfileMenu && (
                <div className="absolute right-0 top-12 mt-2 w-48 rounded-md border bg-card p-1 shadow-md animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground md:hidden border-b mb-1">
                        Signed in as <br/> <span className="font-medium text-foreground">{currentUser?.name}</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            )}
            
            {/* Click outside listener overlay */}
            {showProfileMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
            )}
        </div>
      </div>
    </header>
  );
};
