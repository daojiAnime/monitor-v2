import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Activity, 
  PieChart as PieChartIcon, 
  Trophy,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  AlertTriangle,
  RefreshCw,
  Settings,
  Monitor,
  LogOut,
  User,
  Trash2
} from 'lucide-react';
import LiveLogger from './components/LiveLogger';
import HistoryTable from './components/HistoryTable';
import { TabView, ChartDataPoint } from './types';

// --- Mock Data Definitions ---

const data24H: ChartDataPoint[] = [
  { date: '00:00', profit: 12000, volume: 150 },
  { date: '04:00', profit: 15000, volume: 220 },
  { date: '08:00', profit: 8000, volume: 180 },
  { date: '12:00', profit: 24000, volume: 450 },
  { date: '16:00', profit: 32000, volume: 600 },
  { date: '20:00', profit: 18000, volume: 320 },
  { date: '23:59', profit: 22000, volume: 380 },
];

const data7D: ChartDataPoint[] = [
  { date: '12/20', profit: 620000, volume: 2400 },
  { date: '12/21', profit: 150000, volume: 1398 },
  { date: '12/22', profit: 280000, volume: 9800 },
  { date: '12/23', profit: 290000, volume: 3908 },
  { date: '12/24', profit: 350000, volume: 4800 },
  { date: '12/25', profit: 10000, volume: 3800 },
  { date: '12/26', profit: 50000, volume: 4300 },
];

const data30D: ChartDataPoint[] = [
  { date: '12/01', profit: 450000, volume: 3200 },
  { date: '12/05', profit: 520000, volume: 4100 },
  { date: '12/10', profit: 380000, volume: 2800 },
  { date: '12/15', profit: 750000, volume: 6500 },
  { date: '12/20', profit: 620000, volume: 5400 },
  { date: '12/25', profit: 900000, volume: 8200 },
  { date: '12/30', profit: 850000, volume: 7100 },
];

// Helper to generate mock data for custom range
const generateRandomData = (startStr: string, endStr: string): ChartDataPoint[] => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const data: ChartDataPoint[] = [];
    
    // Safety check
    if(isNaN(start.getTime()) || isNaN(end.getTime())) return data7D;
    
    let current = new Date(start);
    // Limit to 60 points to prevent performance issues on huge ranges
    let maxPoints = 60;
    let count = 0;

    while (current <= end && count < maxPoints) {
        data.push({
            date: `${current.getMonth() + 1}/${current.getDate()}`,
            profit: Math.floor(Math.random() * 800000) + 50000,
            volume: Math.floor(Math.random() * 8000) + 1000,
        });
        current.setDate(current.getDate() + 1);
        count++;
    }
    return data.length > 0 ? data : data7D;
};

// Mock Data for Analysis
const accountStatusData = [
  { name: 'Active', value: 39, color: '#22c55e' }, // green-500
  { name: 'Sleep', value: 12, color: '#94a3b8' },  // slate-400
  { name: 'Captcha', value: 5, color: '#f59e0b' }, // amber-500
  { name: 'Soft Ban', value: 3, color: '#ef4444' }, // red-500
];

const topItems = [
  { name: 'K. Mbappé', profit: 450000, count: 12, rating: 91 },
  { name: 'V. Van Dijk', profit: 210000, count: 28, rating: 89 },
  { name: 'Shadow Chem', profit: 155000, count: 145, rating: 0 },
  { name: 'T. Hernández', profit: 98000, count: 42, rating: 85 },
  { name: 'Alisson', profit: 85000, count: 15, rating: 89 },
];

// Expanded Mock problematic accounts list for scrolling
const detailedProblemAccounts = [
    { id: 'User_8821', issue: 'Captcha', time: '12m', status: 'Paused' },
    { id: 'Vip_Trader_09', issue: 'Soft Ban', time: '45m', status: 'Cooldown' },
    { id: 'Auto_Bot_X', issue: 'Re-Login', time: '2h', status: 'Offline' },
    { id: 'Sniper_Elite_V2', issue: 'Auth Fail', time: '5m', status: 'Retry' },
    { id: 'Market_Maker_02', issue: 'Captcha', time: '1h', status: 'Paused' },
    { id: 'FUT_King_99', issue: 'Soft Ban', time: '20m', status: 'Cooldown' },
    { id: 'Trader_Joe_Pro', issue: 'Network', time: '10s', status: 'Retry' },
    { id: 'Coin_Farmer_01', issue: 'Captcha', time: '5m', status: 'Paused' },
];

// --- Custom Range Calendar Component ---
const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const RangeCalendar: React.FC<{
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}> = ({ startDate, endDate, onChange }) => {
    const [viewDate, setViewDate] = useState(new Date());
    
    // Parse input strings to Date objects for logic
    const startObj = startDate ? new Date(startDate) : null;
    const endObj = endDate ? new Date(endDate) : null;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday

    const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        const clickedStr = formatDate(clickedDate);
        
        if (!startObj || (startObj && endObj)) {
            // Reset and start new selection
            onChange(clickedStr, '');
        } else if (startObj && !endObj) {
            // Complete selection
            if (clickedDate < startObj) {
                onChange(clickedStr, '');
            } else {
                onChange(formatDate(startObj), clickedStr);
            }
        }
    };

    const isSelected = (day: number) => {
        const d = new Date(year, month, day);
        const t = d.getTime();
        const s = startObj?.getTime();
        const e = endObj?.getTime();

        if (s && t === s) return 'start';
        if (e && t === e) return 'end';
        if (s && e && t > s && t < e) return 'range';
        return null;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    return (
        <div className="select-none p-2">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-bold text-slate-800 text-lg">
                    {year}年 {month + 1}月
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 mb-3">
                {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                    <div key={i} className="text-center text-xs font-bold text-slate-400">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = isSelected(day);
                    
                    let containerClass = "relative w-full aspect-square flex items-center justify-center";
                    let btnClass = "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all relative z-10";
                    let bgRangeClass = "absolute inset-y-0 bg-blue-50/80 z-0";

                    if (status === 'start') {
                        btnClass += " bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700";
                        bgRangeClass += " left-1/2 right-0 rounded-l-none";
                    } else if (status === 'end') {
                        btnClass += " bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700";
                        bgRangeClass += " left-0 right-1/2 rounded-r-none";
                    } else if (status === 'range') {
                        btnClass += " text-blue-700 hover:bg-blue-100/50";
                        bgRangeClass += " left-0 right-0";
                    } else {
                        btnClass += " text-slate-700 hover:bg-slate-100";
                        if(isToday(day)) btnClass += " ring-1 ring-blue-500 text-blue-600 font-bold";
                    }

                    return (
                        <div key={day} className={containerClass}>
                            {/* Visual Range Connector */}
                            {(status === 'range' || (status === 'start' && endObj) || (status === 'end')) && (
                                <div className={bgRangeClass} />
                            )}
                            
                            <button onClick={() => handleDayClick(day)} className={btnClass}>
                                {day}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
// -------------------------------------

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
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${colorClass} opacity-5 group-hover:scale-150 transition-transform duration-500`}></div>
  </div>
);

const UserProfileWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center gap-3 md:gap-4 relative sm:ml-4 sm:pl-4 sm:border-l border-gray-200 w-full sm:w-auto justify-between sm:justify-start">
            {/* Avatar & Info */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col items-start">
                     <span className="font-bold text-gray-800 text-sm leading-tight">daoji</span>
                </div>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded border border-green-200 whitespace-nowrap">
                    已激活
                </span>
            </div>

            {/* Settings Button */}
            <button 
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all ${isOpen ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
                <Settings className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden origin-top-right"
                >
                    <div className="py-1">
                        <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                            <Monitor className="w-4 h-4 text-gray-400" />
                            管理后台
                        </button>
                        <div className="h-px bg-gray-100 mx-2"></div>
                        <button className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                            <LogOut className="w-4 h-4 text-red-400" />
                            退出登录
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AlertBanner: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex justify-between items-start animate-fade-in shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-bold text-red-800">系统告警: {detailedProblemAccounts.length} 个账号需要人工干预</h3>
          <div className="mt-1 text-sm text-red-700">
            检测到部分账号出现验证码拦截或临时封禁，已自动暂停相关任务以保护资产。
          </div>
        </div>
      </div>
      <div className="ml-auto pl-3">
        <button 
            onClick={onClose}
            className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none transition-colors"
        >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
        </button>
      </div>
    </div>
);

const AnalysisSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Col 1: Account Health Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[320px] overflow-hidden">
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-700 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-500" />
                账号健康度
            </h3>
            <span className="text-xs font-medium text-gray-400">Total: 59</span>
        </div>
        
        {/* Fixed height container for Recharts to prevent width(-1) error */}
        <div className="relative w-full h-[250px]">
            {/* Added minWidth={0} minHeight={0} to suppress 'width(-1)' warning */}
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                    <Pie
                        data={accountStatusData}
                        cx="50%"
                        cy="42%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                    >
                        {accountStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
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
                        iconSize={8}
                        wrapperStyle={{fontSize: '12px', bottom: '10px'}}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Centered Label */}
            <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="block text-3xl font-extrabold text-gray-800 tracking-tight">66%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Healthy</span>
            </div>
        </div>
      </div>

      {/* Col 2: Problematic Accounts List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[320px] overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h3 className="font-bold text-gray-700 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                问题账号列表
            </h3>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
               {detailedProblemAccounts.length}
            </span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
             {detailedProblemAccounts.map((acc, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-800">{acc.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                acc.issue === 'Captcha' ? 'bg-orange-100 text-orange-700' : 
                                acc.issue === 'Soft Ban' ? 'bg-red-100 text-red-700' : 
                                acc.issue === 'Auth Fail' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {acc.issue}
                            </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {acc.time} ago
                        </div>
                    </div>
                    <button 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Retry / Resolve"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
             ))}
        </div>
      </div>

      {/* Col 3: Top Performers List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[320px] overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
            <h3 className="font-bold text-gray-700 flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-orange-500" />
                今日 Top 盈利
            </h3>
            <button className="text-xs text-blue-500 font-medium hover:underline">查看全部</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group py-1">
                    <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            {idx + 1}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {item.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                                {item.count} items sold
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                            +{item.profit.toLocaleString()}
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
  const [timeRange, setTimeRange] = useState('7D');
  const [isAlertVisible, setIsAlertVisible] = useState(true);

  // Date Picker State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  
  // Use a backdrop click for closing instead of complex ref checking
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
        setIsDatePickerOpen(false);
    }
  };

  const handleCustomDateApply = () => {
    if (dateRange.start && dateRange.end) {
        setTimeRange('CUSTOM');
        setIsDatePickerOpen(false);
    }
  };

  const handleClear = () => {
      setDateRange({ start: '', end: '' });
  };

  // Dynamic Data Logic
  const chartData = useMemo(() => {
    switch (timeRange) {
        case '24H': return data24H;
        case '7D': return data7D;
        case '30D': return data30D;
        case 'CUSTOM': return generateRandomData(dateRange.start, dateRange.end);
        default: return data7D;
    }
  }, [timeRange, dateRange]);

  return (
    <div className="space-y-6">
      
      {/* Alert Banner for Critical Issues */}
      {isAlertVisible && <AlertBanner onClose={() => setIsAlertVisible(false)} />}

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
        
        {/* Main Profit Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-6 border-b border-transparent">
              <button className="pb-2 border-b-2 border-blue-500 text-blue-600 font-semibold text-sm">收益趋势</button>
              <button className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm transition">利润率</button>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
                {['24H', '7D', '30D'].map((range) => (
                    <button 
                        key={range}
                        onClick={() => {
                            setTimeRange(range);
                            // setIsDatePickerOpen(false); // No need to auto close if open
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            timeRange === range 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {range}
                    </button>
                ))}
                
                <button 
                    onClick={() => setIsDatePickerOpen(true)}
                    className={`px-2 py-1 rounded-md transition-all ${
                        timeRange === 'CUSTOM'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-400 hover:bg-gray-200'
                    }`}
                >
                   <Calendar className="w-4 h-4" />
                </button>
            </div>
          </div>

          <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : `${value}`}
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
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Volume Chart (1/3 width) */}
         <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-w-0 overflow-hidden">
           <h3 className="font-bold text-gray-700 mb-6 pb-2">交易量分布</h3>
           <div className="h-[300px] w-full" style={{ minWidth: 0 }}>
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
               <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0} // Force show all labels
                  />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="volume" fill="#cbd5e1" radius={[4, 4, 0, 0]} animationDuration={500} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>

      </div>

      {/* Deep Dive Analysis Row */}
      <AnalysisSection />

      {/* Bottom Row: Live Logs (Full width) */}
      <div className="w-full">
        <LiveLogger />
      </div>

      {/* Global Date Picker Modal */}
      {isDatePickerOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
          >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100">
                      <div>
                          <h4 className="text-base font-bold text-gray-800">自定义日期范围</h4>
                          <p className="text-xs text-gray-400 mt-0.5">点击选择开始和结束日期</p>
                      </div>
                      <button onClick={() => setIsDatePickerOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="bg-slate-50 px-4 py-3 flex gap-2">
                     <div className={`flex-1 flex flex-col p-2 rounded-lg border ${!dateRange.start ? 'border-blue-500 bg-white ring-2 ring-blue-500/20' : 'border-gray-200 bg-white'}`}>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">开始日期</span>
                        <span className={`text-sm font-bold ${dateRange.start ? 'text-gray-800' : 'text-gray-300'}`}>
                            {dateRange.start || 'YYYY-MM-DD'}
                        </span>
                     </div>
                     <div className="flex items-center text-gray-300">
                        <ChevronRight className="w-4 h-4" />
                     </div>
                     <div className={`flex-1 flex flex-col p-2 rounded-lg border ${dateRange.start && !dateRange.end ? 'border-blue-500 bg-white ring-2 ring-blue-500/20' : 'border-gray-200 bg-white'}`}>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">结束日期</span>
                        <span className={`text-sm font-bold ${dateRange.end ? 'text-gray-800' : 'text-gray-300'}`}>
                            {dateRange.end || 'YYYY-MM-DD'}
                        </span>
                     </div>
                  </div>
                  
                  <RangeCalendar 
                      startDate={dateRange.start}
                      endDate={dateRange.end}
                      onChange={(start, end) => setDateRange({start, end})}
                  />
                  
                  <div className="p-4 border-t border-gray-100 flex gap-3">
                      <button 
                          onClick={handleClear}
                          className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
                          title="清除"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                          onClick={() => setIsDatePickerOpen(false)}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                          取消
                      </button>
                      <button 
                          onClick={handleCustomDateApply}
                          disabled={!dateRange.start || !dateRange.end}
                          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-[0.98]"
                      >
                          应用日期
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabView>(TabView.DASHBOARD);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Simple Header & Tab Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">数据监控中心</h1>
            <p className="text-slate-500 text-sm mt-1">FUT Bot 实时交易监控与数据分析</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 w-full lg:w-auto">
            {/* Tab Switcher */}
            <div className="bg-white p-1 rounded-lg border border-gray-200 flex sm:inline-flex shadow-sm">
                <button 
                onClick={() => setCurrentTab(TabView.DASHBOARD)}
                className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start px-4 py-2 text-sm font-medium rounded-md transition-all ${
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
                className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    currentTab === TabView.LOGS 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                >
                <FileText className="w-4 h-4 mr-2" />
                历史日志
                </button>
            </div>

            {/* User Profile Widget */}
            <UserProfileWidget />
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