import React from 'react';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_NAV_ITEMS } from '../constants';
import { Logo, ChevronDownIcon } from './icons';
import { SidebarNavItem } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onNavigate: (page: string) => void;
  currentView: string;
}

const NavItem: React.FC<{ item: SidebarNavItem; isSidebarOpen: boolean; isActive: boolean; onClick: () => void }> = ({ item, isSidebarOpen, isActive, onClick }) => {
  // Improved active state styling
  const activeClasses = isActive ? 'bg-primary/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white';
  
  return (
    <li title={!isSidebarOpen ? item.name : ''}>
      <a
        href={item.href}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${activeClasses} ${!isSidebarOpen ? 'justify-center' : ''}`}
      >
        <item.icon className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
        <span className={`font-medium text-sm flex-1 ml-4 text-left whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{item.name}</span>
        {item.isDropdown && <ChevronDownIcon className={`w-4 h-4 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} />}
      </a>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen, onNavigate, currentView }) => {
  
  const handleNavClick = (item: SidebarNavItem) => {
    onNavigate(item.name.toLowerCase());
  };

  return (
    <aside 
      onMouseEnter={() => setIsSidebarOpen(true)}
      onMouseLeave={() => setIsSidebarOpen(false)}
      className={`bg-sidebar h-screen flex flex-col p-4 flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
      <div className="px-2 mb-6 h-12 flex items-center">
        <button onClick={() => onNavigate('home')} className="w-full">
            <Logo className={`text-white transition-all duration-300 h-10 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 invisible'}`} />
            <img src="https://i.imgur.com/6U31UIH.png" alt="Mihael.bet Logo Icon" className={`h-10 mx-auto transition-all duration-300 ${!isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 invisible'}`} />
        </button>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {SIDEBAR_NAV_ITEMS.map(item => (
            <NavItem 
              key={item.name} 
              item={item} 
              isSidebarOpen={isSidebarOpen}
              isActive={currentView.toLowerCase() === item.name.toLowerCase()}
              onClick={() => handleNavClick(item)} 
            />
          ))}
        </ul>
      </nav>
      
      <div className="mb-4">
        <ul className="space-y-2">
          {SIDEBAR_BOTTOM_NAV_ITEMS.map(item => (
            <NavItem 
              key={item.name} 
              item={item} 
              isSidebarOpen={isSidebarOpen}
              isActive={false}
              onClick={() => {}} // Placeholder for help/faq modals
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};