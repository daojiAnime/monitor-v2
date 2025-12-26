import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center text-gray-500 text-sm">
        <span className="text-gray-800 font-medium text-lg">数据监控中心</span>
      </div>

      <div className="flex items-center space-x-6">
        {/* Search is useful for users to find specific account logs in the future */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="搜索账号 ID..." 
            className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-4 text-gray-500">
          <button className="relative hover:text-blue-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <div className="flex items-center border-l pl-6 border-gray-200">
             <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-green-700">运行中</span>
             </div>
        </div>
      </div>
    </header>
  );
};

export default Header;