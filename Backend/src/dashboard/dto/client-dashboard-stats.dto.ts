export class ClientDashboardStatsDto {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  pendingProjects: number;
  lastProjectProgress?: number;
  lastProjectTitle?: string;
  totalNotifications: number;
  unreadNotifications: number;
  recentActivity?: any[];
  upcomingDeadlines?: any[];
}