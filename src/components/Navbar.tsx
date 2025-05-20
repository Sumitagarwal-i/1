
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, User } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">MirrorMind</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-accent"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            className="p-2 rounded-md hover:bg-accent relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className="p-1 rounded-full hover:bg-accent"
            aria-label="User profile"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
