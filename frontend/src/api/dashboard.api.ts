import axiosClient from './axiosClient';

export interface DashboardStats {
  totalProjects: number;
  totalClients: number;
  totalControllers: number;
  totalServices: number;
  projectStatusBreakdown: {
    status: string;
    count: number;
  }[];
  recentActivities: number;
  totalRevenue: number;
}

export interface RecentProject {
  id: number;
  title: string;
  description: string;
  status: string;
  client_id: number;
  controller_id: number;
  service_id: number;
  start_date: string;
  end_date: string;
  budget: number;
  created_at: string;
  updated_at: string;
  client_name: string;
}

export interface ProjectAnalytics {
  projectsByStatus: {
    status: string;
    count: number;
  }[];
  projectsByMonth: {
    month: string;
    count: number;
    revenue: number;
  }[];
  avgProjectDuration: number;
  topServices: {
    name: string;
    project_count: number;
  }[];
}

export interface UserGroup {
  role: string;
  count: number;
  users: any[];
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Controller {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  projectCount: number;
}

export interface RawController {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  assigned_projects: number;
  [key: string]: any; // Allow other fields
}

export interface ControllerDashboardStats {
  totalAssignedProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingReviews: number;
  overdueProjects: number;
  totalProgressUpdates: number;
}

export interface ControllerProject {
  id: number;
  title: string;
  description: string;
  status: string;
  clientId: number;
  controllerId: number;
  serviceId: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  amount?: number;
  amountDescription?: string;
  requirementsPdf?: string;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  serviceName?: string;
}

export interface ControllerActivity {
  id: number;
  action: string;
  time: string;
  type: string;
}

export interface UpcomingDeadline {
  id: number;
  project: string;
  date: string;
  status: string;
}

class DashboardApi {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    const response = await axiosClient.get('/dashboard/stats');
    return response.data.data;
  }

  // Get recent projects
  async getRecentProjects(): Promise<RecentProject[]> {
    const response = await axiosClient.get('/dashboard/recent-projects');
    return response.data.data;
  }

  // Get project analytics
  async getAnalytics(): Promise<ProjectAnalytics> {
    const response = await axiosClient.get('/dashboard/analytics');
    return response.data.data;
  }

  // Get all users grouped by role
  async getUsers(): Promise<UserGroup[]> {
    const response = await axiosClient.get('/dashboard/users');
    return response.data.data;
  }

  // Get all projects with detailed information
  async getProjects(): Promise<any[]> {
    const response = await axiosClient.get('/dashboard/projects');
    return response.data.data;
  }

  // Get all services
  async getServices(): Promise<Service[]> {
    const response = await axiosClient.get('/dashboard/services');
    return response.data.data;
  }

  // Get all controllers with their assigned project counts
  async getControllers(): Promise<Controller[]> {
    const response = await axiosClient.get('/dashboard/controllers');
    // Handle response wrapper from backend interceptor
    const rawData = response.data.data.data || response.data.data || response.data;
    
    // Map raw data to Controller interface format
    const controllers = rawData.map((rawController: RawController) => ({
      id: rawController.id,
      firstName: rawController.first_name,
      lastName: rawController.last_name,
      email: rawController.email,
      projectCount: rawController.assigned_projects
    }));
    
    return controllers;
  }

  // Controller-specific methods
  async getControllerStats(): Promise<ControllerDashboardStats> {
    const response = await axiosClient.get('/dashboard/controller/stats');
    // Handle response wrapper from backend interceptor
    const data = response.data.data.data;
    return data;
  }

  async getControllerAssignedProjects(): Promise<ControllerProject[]> {
    const response = await axiosClient.get('/dashboard/controller/assigned-projects');
    // Handle response wrapper from backend interceptor
    const data = response.data.data.data || response.data.data;
    return data;
  }

  async getControllerRecentActivities(): Promise<ControllerActivity[]> {
    const response = await axiosClient.get('/dashboard/controller/recent-activities');
    // Handle response wrapper from backend interceptor
    const data = response.data.data || response.data;
    return data;
  }

  async getControllerUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
    const response = await axiosClient.get('/dashboard/controller/upcoming-deadlines');
    // Handle response wrapper from backend interceptor
    const data = response.data.data || response.data;
    return data;
  }

  async getClientStats(): Promise<any> {
    const response = await axiosClient.get('/dashboard/client/stats');
    // Handle response wrapper from backend interceptor
    const data = response.data.data.data || response.data.data || response.data;
    return data;
  }
}

export default new DashboardApi();