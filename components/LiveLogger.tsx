import React, { useEffect, useRef, useState } from 'react';
import { LogEntry, LogType } from '../types';
import { Terminal, Activity, Pause, Play, Wifi, WifiOff } from 'lucide-react';

// --- CONFIGURATION ---
const USE_MOCK_DATA = true; // Set to false to use real SSE endpoint
const SSE_ENDPOINT = '/api/logs/stream'; // Your backend endpoint
// ---------------------

const generateMockLog = (): LogEntry => {
  const types = [LogType.INFO, LogType.SUCCESS, LogType.TRADE, LogType.TRADE, LogType.WARNING];
  const type = types[Math.floor(Math.random() * types.length)];
  const accounts = ['user_8821', 'vip_trader_01', 'auto_bot_x9', 'whale_account_03'];
  const account = accounts[Math.floor(Math.random() * accounts.length)];
  
  let message = '';
  let amount = '';

  switch (type) {
    case LogType.TRADE:
      const profit = Math.floor(Math.random() * 5000) + 100;
      message = `Sold player Mbappe for ${profit * 10} coins.`;
      amount = `+${profit}`;
      break;
    case LogType.SUCCESS:
      message = 'Successfully listed items on transfer market.';
      break;
    case LogType.WARNING:
      message = 'Response time high (240ms). Retrying connection...';
      break;
    default:
      message = 'Scanning market for undervalue items...';
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    type,
    account,
    message,
    amount
  };
};

const LiveLogger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Helper to add log safely
  const addLog = (newLog: LogEntry) => {
    setLogs((prev) => {
      const updated = [...prev, newLog];
      // Keep last 100 logs to prevent memory leak in browser
      return updated.length > 200 ? updated.slice(updated.length - 200) : updated;
    });
  };

  useEffect(() => {
    let intervalId: any;
    let eventSource: EventSource | null = null;

    if (isPaused) {
        // If paused, we might want to keep the connection but stop updating UI, 
        // or close connection. For logs, usually keeping connection open but not 
        // auto-scrolling is better, but here we pause data generation/reception for demo.
        return; 
    }

    if (USE_MOCK_DATA) {
      // --- MOCK MODE ---
      setConnectionStatus('connected');
      intervalId = setInterval(() => {
        addLog(generateMockLog());
      }, 1500);
    } else {
      // --- REAL SSE MODE ---
      // Native browser API for Server-Sent Events
      setConnectionStatus('connecting');
      eventSource = new EventSource(SSE_ENDPOINT);

      eventSource.onopen = () => {
        setConnectionStatus('connected');
        console.log('SSE Connected');
      };

      eventSource.onmessage = (event) => {
        try {
          // Assuming backend sends JSON format: data: {"id": "...", "message": "..."}
          const data = JSON.parse(event.data);
          // Map backend data to frontend LogEntry structure if needed
          const newLog: LogEntry = {
            id: data.id || Date.now().toString(),
            timestamp: new Date(), // or new Date(data.timestamp)
            type: data.type || LogType.INFO,
            account: data.account || 'System',
            message: data.message,
            amount: data.amount
          };
          addLog(newLog);
        } catch (e) {
          console.error('Error parsing SSE message', e);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE Error', err);
        setConnectionStatus('disconnected');
        eventSource?.close();
        
        // Optional: Retry logic is built-in to EventSource, 
        // but visual status update needs to handle it.
        setTimeout(() => setConnectionStatus('connecting'), 3000); 
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (eventSource) {
        eventSource.close();
        setConnectionStatus('disconnected');
      }
    };
  }, [isPaused]);

  // Auto scroll to bottom - using scrollTop to avoid moving the main window
  useEffect(() => {
    if (scrollViewportRef.current && !isPaused) {
      const { scrollHeight, clientHeight } = scrollViewportRef.current;
      // Only scroll if there is content to scroll
      if (scrollHeight > clientHeight) {
        scrollViewportRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [logs, isPaused]);

  const getLogColor = (type: LogType) => {
    switch (type) {
      case LogType.ERROR: return 'text-red-400';
      case LogType.WARNING: return 'text-yellow-400';
      case LogType.SUCCESS: return 'text-green-400';
      case LogType.TRADE: return 'text-cyan-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-lg shadow-lg overflow-hidden flex flex-col h-[500px]">
      <div className="bg-[#0f172a] px-4 py-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Real-time Execution</h3>
          
          {/* Connection Status Indicator */}
          <div className={`flex items-center space-x-1 ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            connectionStatus === 'connected' ? 'bg-green-500/10 text-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {connectionStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{connectionStatus === 'connected' ? 'LIVE' : connectionStatus}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-400 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                <span>{isPaused ? '0' : '42'} ops/min</span>
            </div>
            <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`transition-colors p-1.5 rounded text-xs font-medium flex items-center space-x-1 ${
                    isPaused 
                    ? 'bg-blue-600 text-white hover:bg-blue-500' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={isPaused ? "Resume Feed" : "Pause Feed"}
            >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
        </div>
      </div>

      <div 
        ref={scrollViewportRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-0 sm:space-y-1 font-mono text-xs log-scrollbar bg-[#1e293b]"
      >
        {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 italic space-y-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Waiting for incoming signals...</span>
            </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-start gap-x-2 sm:gap-x-3 hover:bg-[#2d3b52] p-2 sm:p-1 rounded transition-colors duration-75 group border-b border-gray-800 sm:border-0">
            
            {/* Metadata Group (Time, Type, Account) - Wraps on Mobile, Columns on Desktop */}
            <span className="text-gray-500 group-hover:text-gray-400 text-[10px] sm:text-xs font-mono shrink-0 sm:w-20">
              {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
            </span>
            <span className={`font-bold text-[10px] sm:text-xs shrink-0 sm:w-16 ${getLogColor(log.type)}`}>
              [{log.type}]
            </span>
            <span className="text-blue-300/80 group-hover:text-blue-300 text-[10px] sm:text-xs shrink-0 sm:w-24 truncate" title={log.account}>
              @{log.account}
            </span>

            {/* Force line break on mobile only */}
            <div className="basis-full h-0 sm:hidden"></div>

            {/* Message & Amount */}
            <div className="text-xs sm:text-xs text-gray-300 w-full sm:w-auto sm:flex-grow break-words mt-0.5 sm:mt-0 leading-tight sm:leading-normal flex justify-between gap-2">
                 <span>{log.message}</span>
                 {log.amount && (
                    <span className="text-green-500/90 group-hover:text-green-400 font-bold shrink-0">
                        {log.amount}
                    </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveLogger;