import React, { useState, useRef, useEffect } from 'react';
import { LogEntry, LogType } from '../types';
import { Filter, Download, ChevronLeft, ChevronRight, Search, Check } from 'lucide-react';

// Mock historical data
const generateHistory = (count: number): LogEntry[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `hist-${i}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 15), // Every 15 mins back
    type: i % 5 === 0 ? LogType.TRADE : i % 3 === 0 ? LogType.WARNING : LogType.INFO,
    account: `user_account_${100 + (i % 10)}`,
    message: i % 5 === 0 ? `Sold item for ${(i+1) * 200} coins via automated process.` : 'Standard health check routine passed.',
    amount: i % 5 === 0 ? `+${(i+1) * 200}` : undefined
  }));
};

const HistoryTable: React.FC = () => {
  const [data] = useState<LogEntry[]>(generateHistory(100)); // Increased mock data count
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<LogType | 'ALL'>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Export CSV Logic
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Level', 'Account ID', 'Message', 'Impact'];
    
    // Convert data to CSV format
    const rows = filteredData.map(row => [
      row.id,
      row.timestamp.toISOString(),
      row.type,
      row.account,
      `"${row.message.replace(/"/g, '""')}"`, // Escape double quotes within message
      row.amount || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fut_bot_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Historical System Logs</h3>
        <div className="flex space-x-3">
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input 
                type="text" 
                placeholder="Search history..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
             />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                isFilterOpen || filterType !== 'ALL' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {filterType === 'ALL' ? 'Filter' : filterType}
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-100 z-30 py-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                  Filter by Level
                </div>
                <button 
                  onClick={() => { setFilterType('ALL'); setIsFilterOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between group"
                >
                  <span>All Levels</span>
                  {filterType === 'ALL' && <Check className="w-3 h-3" />}
                </button>
                {Object.values(LogType).map((type) => (
                  <button 
                    key={type}
                    onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between group"
                  >
                    <span>{type}</span>
                    {filterType === type && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm font-medium transition-colors border border-green-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        {filteredData.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {row.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${row.type === LogType.TRADE ? 'bg-green-100 text-green-800' : 
                        row.type === LogType.WARNING ? 'bg-yellow-100 text-yellow-800' : 
                        row.type === LogType.ERROR ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {row.account}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-lg truncate" title={row.message}>
                    {row.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {row.amount ? (
                      <span className="text-green-600">{row.amount}</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No logs found matching your criteria</p>
            <button 
                onClick={() => {setSearchTerm(''); setFilterType('ALL');}}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
                Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
          <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">{data.length}</span> total logs
          </div>
          <div className="flex space-x-2">
              <button className="p-2 border border-gray-300 rounded-md hover:bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-md hover:bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm">
                  <ChevronRight className="w-4 h-4" />
              </button>
          </div>
      </div>
    </div>
  );
};

export default HistoryTable;