import React, { useState, useRef, useEffect } from 'react';
import { LogEntry, LogType } from '../types';
import { Filter, Download, ChevronLeft, ChevronRight, Search, Check, Clock, User, DollarSign, FileSpreadsheet } from 'lucide-react';

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
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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

  const getTypeColor = (type: LogType) => {
    switch(type) {
        case LogType.TRADE: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case LogType.WARNING: return 'bg-amber-50 text-amber-700 border-amber-200';
        case LogType.ERROR: return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full relative">
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-t-xl">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg hidden sm:block">
                <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">历史日志</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input - Optimized Visuals */}
          <div className="relative flex-grow sm:flex-grow-0 group">
             <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
             <input 
                type="text" 
                placeholder="搜索日志..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
             />
          </div>
          
          <div className="flex gap-2">
            {/* Filter Dropdown */}
            <div className="relative flex-1 sm:flex-none" ref={filterRef}>
                <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                    isFilterOpen || filterType !== 'ALL' 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
                >
                <Filter className="w-4 h-4 mr-2" />
                {filterType === 'ALL' ? '筛选' : filterType}
                </button>
                
                {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                    按类型筛选
                    </div>
                    <button 
                    onClick={() => { setFilterType('ALL'); setIsFilterOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between group"
                    >
                    <span>全部等级</span>
                    {filterType === 'ALL' && <Check className="w-3 h-3" />}
                    </button>
                    {Object.values(LogType).map((type) => (
                    <button 
                        key={type}
                        onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between group"
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
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-sm font-medium transition-all duration-200"
            >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">导出 CSV</span>
                <span className="inline sm:hidden">导出</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        {filteredData.length > 0 ? (
          <>
            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block min-w-full inline-block align-middle">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">时间</th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">类型</th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">账号 ID</th>
                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">消息内容</th>
                        <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">收益变动</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                    {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                            {row.timestamp.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-[11px] leading-4 font-bold rounded-full border ${getTypeColor(row.type)}`}>
                            {row.type}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                            {row.account}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-lg truncate" title={row.message}>
                            {row.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                            {row.amount ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">{row.amount}</span>
                            ) : (
                            <span className="text-slate-300">-</span>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List View (Visible only on Mobile) */}
            <div className="md:hidden p-4 space-y-3">
                {filteredData.map((row) => (
                    <div key={row.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-[0.99] transition-transform duration-100">
                        {/* Row 1: Status & Time */}
                        <div className="flex justify-between items-start">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wide ${getTypeColor(row.type)}`}>
                                {row.type}
                            </span>
                            <div className="flex items-center text-xs text-slate-400 font-mono">
                                <Clock className="w-3 h-3 mr-1" />
                                {row.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                <span className="ml-1.5 opacity-60">
                                    {row.timestamp.toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Row 2: Account & Amount */}
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <div className="flex items-center text-sm font-bold text-slate-700">
                                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-2">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                {row.account}
                            </div>
                            {row.amount && (
                                <div className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                                    {row.amount}
                                </div>
                            )}
                        </div>

                        {/* Row 3: Message */}
                        <div className="text-sm text-slate-600 leading-relaxed break-words">
                            {row.message}
                        </div>
                    </div>
                ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-900 font-medium mb-1">没有找到相关日志</h4>
            <p className="text-sm text-slate-500 mb-4">尝试调整搜索关键词或筛选条件</p>
            <button 
                onClick={() => {setSearchTerm(''); setFilterType('ALL');}}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors"
            >
                清除筛选
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white z-10 rounded-b-xl">
          <div className="text-sm text-slate-500 hidden sm:block">
              显示 <span className="font-medium text-slate-900">{filteredData.length}</span> 条，共 <span className="font-medium text-slate-900">{data.length}</span> 条记录
          </div>
          <div className="text-xs text-slate-400 sm:hidden">
              {filteredData.length} 条记录
          </div>
          <div className="flex space-x-2">
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors" disabled>
                  <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
              </button>
          </div>
      </div>
    </div>
  );
};

export default HistoryTable;