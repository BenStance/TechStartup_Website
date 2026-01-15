import axiosClient from './axiosClient';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

class LogsApi {
  // Get system logs (admin only)
  async getLogs(): Promise<LogEntry[]> {
    const response = await axiosClient.get('/logs');
    return response.data;
  }

  // Clear system logs (admin only)
  async clearLogs(): Promise<{ message: string }> {
    const response = await axiosClient.delete('/logs');
    return response.data;
  }
}

export default new LogsApi();