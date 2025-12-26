import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Coins, 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  PieChart as PieChartIcon, 
  Trophy,
  Activity
} from 'lucide-react';
import LiveLogger from './components/LiveLogger';
import HistoryTable from './components/HistoryTable';
import { TabView, ChartDataPoint } from './types';

// Mock Data for Charts
const data: ChartDataPoint[] = [
  { date: '12/20', profit: 620000, volume: 2400 },
  { date: '12/21', profit: 150000, volume: 1398 },
  { date: '12/22', profit: 280000, volume: 9800 },
  { date: '12/23', profit: 290000, volume: 3908 },
  { date: '12/24', profit: 350000, volume: 4800 },
  { date: '12/25', profit: 10000, volume: 3800 },
  { date: '12/26', profit: 50000, volume: 4300 },
];

// Mock Data for Analysis
const accountStatusData = [
  { name: 'Active', value: 39, color: '#22c55e' }, // green-500
  { name: 'Sleep', value: 12, color: '#94a3b8' },  // slate-400
  { name: 'Captcha', value: 3, color: '#f59e0b' }, // amber-500
  { name: 'Soft Ban', value: 1, color: '#ef4444' }, // red-500
];

const assetData = [
  { name: 'Liquid Coins', value: 4662156, color: '#eab308' }, // yellow-500
  { name: 'Transfer List', value: 2100500, color: '#3b82f6' }, // blue-500
  { name: 'Unassigned', value: 450000, color: '#6366f1' },    // indigo-500
];

const topItems = [
  { name: 'K. Mbappé', profit: 450000, count: 12, rating: 91 },
  { name: 'V. Van Dijk', profit: 210000, count: 28, rating: 89 },
  { name: 'Shadow Chem', profit: 155000, count: 145, rating: 0 },
  { name: 'T. Hernández', profit: 98000, count: 42, rating: 85 },
];

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  subtext: string; 
  icon: React.ReactNode; 
  colorClass: string; 
  badge?: string 
}> = ({ title, value, subtext, icon, colorClass, badge }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
    <div className="z-10">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="font-bold text-gray-700">{title}</h3>
        {badge && <span className={`text-[10px] px-2 py-0.5 rounded-full ${colorClass} bg-opacity-10 text-opacity-100`}>{badge}</span>}
      </div>
      <div className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">{value}</div>
      <div className="text-sm text-gray-400 font-medium">{subtext}</div>
    </div>
    <div className={`p-4 rounded-full ${colorClass} bg-opacity-10 z-10`}>
      {icon}
    </div>
    {/* Decorative background element */}
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${colorClass} opacity-5 group-hover:scale-150 transition-transform duration-500`}></div>
  </div>
);

const AnalysisSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Account Health Donut */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" />
                账号健康度
            </h3>
            <span className="text-xs font-medium text-gray-400">Total: 55</span>
        </div>
        <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={accountStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {accountStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b', fontSize: '12px' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value, entry: any) => <span className="text-xs text-gray-500 ml-1">{value}</span>} 
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center">
                <span className="block text-2xl font-bold text-gray-800">71%</span>
                <span className="text-[10px] text-gray-400 uppercase">Health</span>
            </div>
        </div>
      </div>

      {/* Asset Allocation Pie */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center">
                <PieChartIcon className="w-4 h-4 mr-2 text-yellow-500" />
                资产持仓分布
            </h3>
        </div>
        <div className="h-[200px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={assetData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                    >
                        {assetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => val.toLocaleString()} />
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        formatter={(value) => <span className="text-xs text-gray-500">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-orange-500" />
                今日 Top 盈利
            </h3>
            <button className="text-xs text-blue-500 font-medium hover:underline">查看全部</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            {idx + 1}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {item.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                                Count: {item.count} | Rating: {item.rating > 0 ? item.rating : 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                            +{item.profit.toLocaleString()}
                        </div>
                        <div className="h-1 w-16 bg-gray-100 rounded-full mt-1 ml-auto">
                            <div 
                                className="h-1 bg-green-500 rounded-full" 
                                style={{ width: `${(item.profit / topItems[0].profit) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="总金币资产" 
          value="4,662,156" 
          subtext="托管账户总余额"
          badge="实时"
          icon={<Coins className="w-8 h-8 text-yellow-500" />}
          colorClass="bg-yellow-500 text-yellow-600"
        />
        <StatCard 
          title="本周净利润" 
          value="1,669,725" 
          subtext="较上周增长 12%"
          badge="收益"
          icon={<TrendingUp className="w-8 h-8 text-red-400" />}
          colorClass="bg-red-400 text-red-500"
        />
        <StatCard 
          title="在线托管账号" 
          value="39" 
          subtext="运行正常"
          badge="状态"
          icon={<CreditCard className="w-8 h-8 text-blue-500" />}
          colorClass="bg-blue-500 text-blue-600"
        />
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-6 border-b border-transparent">
              <button className="pb-2 border-b-2 border-blue-500 text-blue-600 font-semibold text-sm">收益趋势</button>
              <button className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm transition">利润率</button>
            </div>
            <div className="flex space-x-2">
               <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Calendar className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={(value: number) => [`${value.toLocaleString()}`, 'Profit']}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

         <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0">
           <h3 className="font-bold text-gray-700 mb-6 pb-2">交易量分布</h3>
           <div className="h-[300px] w-full min-w-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="volume" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
      </div>

      {/* NEW: Deep Dive Analysis Row */}
      <AnalysisSection />

      {/* Bottom Row: Live Logs (Full width) */}
      <div className="w-full">
        <LiveLogger />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabView>(TabView.DASHBOARD);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Simple Header & Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">数据监控中心</h1>
            <p className="text-slate-500 text-sm mt-1">FUT Bot 实时交易监控与数据分析</p>
          </div>
          
          <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex shadow-sm">
             <button 
               onClick={() => setCurrentTab(TabView.DASHBOARD)}
               className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                 currentTab === TabView.DASHBOARD 
                   ? 'bg-blue-600 text-white shadow-sm' 
                   : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               <LayoutDashboard className="w-4 h-4 mr-2" />
               监控大盘
             </button>
             <button 
               onClick={() => setCurrentTab(TabView.LOGS)}
               className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                 currentTab === TabView.LOGS 
                   ? 'bg-blue-600 text-white shadow-sm' 
                   : 'text-gray-600 hover:bg-gray-50'
               }`}
             >
               <FileText className="w-4 h-4 mr-2" />
               历史日志
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {currentTab === TabView.DASHBOARD && <DashboardView />}
          {currentTab === TabView.LOGS && <HistoryTable />}
        </div>
      </div>
    </div>
  );
};

export default App;