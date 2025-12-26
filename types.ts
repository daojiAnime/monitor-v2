export interface AccountStat {
  id: string;
  label: string;
  value: string;
  trend?: string; // e.g., "+5.2%"
  iconType: 'coin' | 'profit' | 'account';
  color: string;
}

export interface ChartDataPoint {
  date: string;
  profit: number;
  volume: number;
}

export enum LogType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  TRADE = 'TRADE'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: LogType;
  account: string;
  message: string;
  amount?: string;
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  LOGS = 'LOGS'
}