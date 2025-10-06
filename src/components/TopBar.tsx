import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { KeyboardShortcutsSheet } from './KeyboardShortcutsSheet';
import { 
  List, 
  MagnifyingGlass, 
  CalendarBlank, 
  Moon, 
  Gear,
  SignOut,
  User,
  Kanban,
  GridFour
} from '@phosphor-icons/react';
import { useUserStore } from '../hooks/use-store';
import { useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';

export function TopBar() {
  const { preferences, updatePreferences } = useUserStore();
  const { setCurrentView, searchQuery, setSearchQuery, currentView } = useAppContext();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const toggleSidebar = () => {
    updatePreferences({ 
      sidebarCollapsed: !(preferences?.sidebarCollapsed || false) 
    });
  };

  const viewButtons = [
    { id: 'inbox', icon: List, label: 'List View' },
    { id: 'kanban', icon: Kanban, label: 'Kanban Board' },
    { id: 'today', icon: CalendarBlank, label: 'Calendar View' }
  ];

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={toggleSidebar}
        >
          <List size={20} />
        </Button>
        
        <h1 className="heading-2 text-foreground">
          ClarityFlow
        </h1>

        {/* View Switcher */}
        <div className="flex items-center gap-1 ml-6">
          {viewButtons.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(view.id)}
              className={cn(
                "gap-2",
                currentView === view.id && "bg-primary text-primary-foreground"
              )}
            >
              <view.icon size={16} />
              <span className="hidden sm:inline">{view.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <MagnifyingGlass 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10 w-80"
          />
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('today')}
          className="hidden md:flex"
        >
          <CalendarBlank size={20} />
        </Button>

        <KeyboardShortcutsSheet />

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            const currentTheme = preferences?.theme || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            updatePreferences({ theme: newTheme });
          }}
        >
          <Moon size={20} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setCurrentView('settings')}>
              <Gear size={16} className="mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOut size={16} className="mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}