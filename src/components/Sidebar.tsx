
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart2, MessageSquare, Settings, X } from 'lucide-react';

interface SidebarProps {
  closeSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Journal', path: '/journal', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Insights', path: '/insights', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'Companion Chat', path: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className="h-full flex flex-col bg-background border-r">
      <div className="p-4 flex items-center justify-between md:justify-center border-b">
        <h2 className="font-bold text-xl">Mirror<span className="text-primary">Mind</span></h2>
        <button 
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-accent'
                  }`
                }
                onClick={(e) => {
                  // Close sidebar on mobile when a link is clicked
                  const isMobile = window.innerWidth < 768;
                  if (isMobile) {
                    closeSidebar();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <div className="p-3 rounded-md bg-primary/10 text-center">
          <p className="text-sm font-medium">Reflect daily for better insights</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
