import React, { useState } from 'react';
import { LogEntry, LogType } from '../types';
import { Filter, Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';

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
  const [data] = useState<LogEntry[]>(generateHistory(25));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    item.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
           <button className="flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.timestamp.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${row.type === LogType.TRADE ? 'bg-green-100 text-green-800' : 
                      row.type === LogType.WARNING ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {row.account}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-lg truncate">
                  {row.message}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {row.amount || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">1240</span> results
          </div>
          <div className="flex space-x-2">
              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-500">
                  <ChevronRight className="w-4 h-4" />
              </button>
          </div>
      </div>
    </div>
  );
};

export default HistoryTable;