import React from 'react';
import { ADMIN_SIDEBAR_NAV_ITEMS } from '../../constants';
import { SidebarNavItem } from '../../types';

interface AdminSidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

const NavItem: React.FC<{ item: SidebarNavItem; isActive: boolean; onClick: () => void }> = ({ item, isActive, onClick }) => {
  const activeClasses = isActive ? 'bg-primary/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white';
  
  return (
    <li>
      <a
        href={item.href}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${activeClasses}`}
      >
        <item.icon className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
        <span className="font-medium text-sm flex-1 ml-4 text-left whitespace-nowrap">{item.name}</span>
      </a>
    </li>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="bg-background w-64 h-full flex flex-col p-4 flex-shrink-0 border-r border-border-color">
      <div className="px-2 mb-6 h-12 flex items-center">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {ADMIN_SIDEBAR_NAV_ITEMS.map(item => (
            <NavItem 
              key={item.name} 
              item={item} 
              isActive={activeView === item.name.toLowerCase().replace(' ', '_')}
              onClick={() => setActiveView(item.name.toLowerCase().replace(' ', '_'))} 
            />
          ))}
        </ul>
      </nav>
      
      <div className="text-center text-xs text-text-muted">
        <p>&copy; 2024 Mihael.bet Admin</p>
        <p>Version 1.0.0</p>
      </div>
    </aside>
  );
};