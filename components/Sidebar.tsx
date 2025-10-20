import React from 'react';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_NAV_ITEMS } from '../constants';
import { Logo, ChevronDownIcon } from './icons';
import { SidebarNavItem } from '../types';
import { SidebarLiveFeed } from './LiveStatsRail';


interface SidebarProps {
  isSidebarOpen: boolean;
  onNavigate: (page: string) => void;
  currentView: string;
}

const NavItem: React.FC<{ item: SidebarNavItem; isActive: boolean; onClick: () => void }> = ({ item, isActive, onClick }) => {
  const activeClasses = isActive ? 'bg-primary/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white';
  
  return (
    <li title={item.name}>
      <a
        href={item.href}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${activeClasses}`}
      >
        <item.icon className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
        <span className="font-medium text-sm flex-1 ml-4 text-left whitespace-nowrap">{item.name}</span>
        {item.isDropdown && <ChevronDownIcon className="w-4 h-4" />}
      </a>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onNavigate, currentView }) => {
  
  const handleNavClick = (item: SidebarNavItem) => {
    onNavigate(item.name.toLowerCase());
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 bg-sidebar h-screen flex flex-col p-4 flex-shrink-0 transition-transform duration-300 ease-in-out w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-2 mb-6 h-12 flex items-center">
        <button onClick={() => onNavigate('home')} className="w-full">
            <Logo className="text-white h-10" />
        </button>
      </div>
      
      <div className="flex flex-col flex-1 min-h-0">
          <nav>
            <ul className="space-y-2">
              {SIDEBAR_NAV_ITEMS.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isActive={currentView.toLowerCase() === item.name.toLowerCase()}
                  onClick={() => handleNavClick(item)} 
                />
              ))}
            </ul>
          </nav>
          
          <SidebarLiveFeed isSidebarOpen={true} />
          
          <div className="flex-shrink-0 mt-auto pt-4 border-t border-border-color">
            <ul className="space-y-2">
              {SIDEBAR_BOTTOM_NAV_ITEMS.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isActive={false}
                  onClick={() => {}} // Placeholder for help/faq modals
                />
              ))}
            </ul>
          </div>
      </div>
    </aside>
  );
};