import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Bot
} from 'lucide-react';
import { TabView } from '../types';

interface SidebarProps {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: TabView.DASHBOARD, label: '监控大盘', icon: LayoutDashboard },
    { id: TabView.LOGS, label: '历史日志', icon: FileText },
  ];

  return (
    <div className="h-screen w-64 bg-[#0B1437] text-white flex flex-col shadow-xl flex-shrink-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Bot className="w-8 h-8 text-blue-500 mr-3" />
        <span className="text-xl font-bold tracking-wider">FUT BOT</span>
      </div>

      <div className="flex-1 py-6">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          User Controls
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as TabView)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white border-r-4 border-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            US
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">User Account</p>
            <p className="text-xs text-gray-500">Standard Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;