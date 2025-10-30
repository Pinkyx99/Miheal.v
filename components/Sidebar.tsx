

import React from 'react';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_BOTTOM_NAV_ITEMS } from '../constants';
import { Logo, ChevronLeftIcon } from './icons';
import { SidebarNavItem } from '../types';
import { SidebarLiveFeed } from './LiveStatsRail';


interface SidebarProps {
  isSidebarOpen: boolean;
  onNavigate: (page: string) => void;
  currentView: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NavItem: React.FC<{ item: SidebarNavItem; isActive: boolean; onClick: () => void; isCollapsed: boolean }> = ({ item, isActive, onClick, isCollapsed }) => {
  const activeClasses = isActive ? 'bg-primary/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white';
  
  return (
    <li title={item.name}>
      <a
        href={item.href}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${activeClasses} ${isCollapsed ? 'lg:justify-center' : ''}`}
      >
        <item.icon className={`w-6 h-6 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'}`} />
        <span className={`font-medium text-sm ml-4 whitespace-nowrap transition-opacity ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
      </a>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onNavigate, currentView, isCollapsed, setIsCollapsed }) => {
  
  const handleNavClick = (item: SidebarNavItem) => {
    onNavigate(item.name.toLowerCase());
  };

  return (
    <aside 
      className={`fixed lg:relative inset-y-0 left-0 z-40 bg-sidebar h-screen flex flex-col p-4 flex-shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`px-2 mb-6 h-12 flex items-center transition-all duration-300 ${isCollapsed ? 'lg:justify-center' : 'lg:justify-start'}`}>
        <button onClick={() => onNavigate('home')} className="w-full">
            <Logo className={`text-white h-10 transition-all duration-300 ${isCollapsed ? 'lg:h-8' : 'lg:h-10'}`} />
        </button>
      </div>
      
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <nav>
            <ul className="space-y-2">
              {SIDEBAR_NAV_ITEMS.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isActive={currentView.toLowerCase() === item.name.toLowerCase()}
                  onClick={() => handleNavClick(item)} 
                  isCollapsed={isCollapsed}
                />
              ))}
            </ul>
          </nav>
          
          <SidebarLiveFeed isCollapsed={isCollapsed} />
          
      </div>
      <div className="flex-shrink-0 mt-auto pt-4 border-t border-border-color">
            <ul className="space-y-2">
              {SIDEBAR_BOTTOM_NAV_ITEMS.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isActive={false}
                  onClick={() => {}} // Placeholder for help/faq modals
                  isCollapsed={isCollapsed}
                />
              ))}
            </ul>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex items-center justify-center w-full h-12 mt-2 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-colors">
                <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
    </aside>
  );
};