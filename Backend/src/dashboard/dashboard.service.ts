import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';
import { DatabaseService } from '../database/database.service';
import { ShopService } from '../shop/shop.service';

@Injectable()
export class DashboardService {
  constructor(
    private projectsService: ProjectsService,
    private usersService: UsersService,
    private servicesService: ServicesService,
    private databaseService: DatabaseService,
    private shopService: ShopService,
  ) {}

  async getControllerDashboardStats(controllerId: number) {
    try {
      // Get projects assigned to this controller
      const controllerProjects = await this.databaseService.executeQuery(
        `SELECT * FROM projects WHERE controller_id = ?`,
        [controllerId]
      );
      
      // Calculate stats based on controller's projects
      const totalAssignedProjects = controllerProjects.length;
      const activeProjects = controllerProjects.filter(p => 
        p.status.toLowerCase() === 'active' || 
        p.status.toLowerCase() === 'in_progress' || 
        p.status.toLowerCase() === 'development'
      ).length;
      
      const completedProjects = controllerProjects.filter(p => 
        p.status.toLowerCase().includes('complete')
      ).length;
      
      const pendingReviews = controllerProjects.filter(p => 
        p.status.toLowerCase() === 'pending review' || 
        p.status.toLowerCase() === 'review'
      ).length;
      
      const overdueProjects = controllerProjects.filter(p => {
        if (!p.end_date) return false;
        const endDate = new Date(p.end_date);
        const today = new Date();
        return endDate < today && p.status.toLowerCase() !== 'completed';
      }).length;
      
      // Count total progress updates from all projects
      // Since there's no separate progress_records table, we'll count projects that have progress > 0
      const totalProgressUpdates = controllerProjects.filter(p => p.progress > 0).length;
      
      return {
        totalAssignedProjects,
        activeProjects,
        completedProjects,
        pendingReviews,
        overdueProjects,
        totalProgressUpdates
      };
    } catch (error) {
      console.error('Error fetching controller dashboard stats:', error);
      return {
        totalAssignedProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        pendingReviews: 0,
        overdueProjects: 0,
        totalProgressUpdates: 0
      };
    }
  }

  async getDashboardStats() {
    try {
      // Get total counts
      const totalProjects = await this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM projects'
      );
      
      const totalClients = await this.databaseService.executeQuery(
        "SELECT COUNT(*) as count FROM users WHERE role = 'client'"
      );
      
      const totalControllers = await this.databaseService.executeQuery(
        "SELECT COUNT(*) as count FROM users WHERE role = 'controller'"
      );
      
      const totalServices = await this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM services'
      );
      
      // Get project status breakdown
      const projectStatusBreakdown = await this.databaseService.executeQuery(`
        SELECT status, COUNT(*) as count 
        FROM projects 
        GROUP BY status
      `);
      
      // Get recent project activities (last 7 days)
      const recentActivities = await this.databaseService.executeQuery(`
        SELECT COUNT(*) as count 
        FROM projects 
        WHERE created_at >= date('now', '-7 days')
      `);
      
      // Get total revenue from projects
      const totalProjectRevenueResult = await this.databaseService.executeQuery(
        'SELECT COALESCE(SUM(amount), 0) as total_revenue FROM projects WHERE amount IS NOT NULL'
      );
      
      // Get total revenue from sales using ShopService
      const totalSalesRevenue = await this.shopService.getTotalRevenue();
      
      // Combine both revenues
      const totalRevenue = (totalProjectRevenueResult[0]?.total_revenue || 0) + totalSalesRevenue;
      
      return {
        totalProjects: totalProjects[0]?.count || 0,
        totalClients: totalClients[0]?.count || 0,
        totalControllers: totalControllers[0]?.count || 0,
        totalServices: totalServices[0]?.count || 0,
        projectStatusBreakdown,
        recentActivities: recentActivities[0]?.count || 0,
        totalRevenue,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalProjects: 0,
        totalClients: 0,
        totalControllers: 0,
        totalServices: 0,
        projectStatusBreakdown: [],
        recentActivities: 0,
      };
    }
  }

  async getControllerAssignedProjects(controllerId: number) {
    try {
      const projects = await this.databaseService.executeQuery(
        `SELECT p.*,
          u.first_name || ' ' || u.last_name as client_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.controller_id = ?
        ORDER BY p.updated_at DESC
        LIMIT 5`,
        [controllerId]
      );
      
      return projects;
    } catch (error) {
      console.error('Error fetching controller assigned projects:', error);
      return [];
    }
  }

  async getRecentProjectActivities(controllerId: number) {
    try {
      // Get projects assigned to controller
      const projects = await this.databaseService.executeQuery(
        `SELECT p.*, 
          u.first_name || ' ' || u.last_name as client_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.controller_id = ?
        ORDER BY p.updated_at DESC
        LIMIT 10`,
        [controllerId]
      );
      
      // Create activity feed based on project updates
      const activities = projects.map(project => {
        const updatedDate = new Date(project.updated_at || project.updatedAt);
        const now = new Date();
        const diffHours = Math.round((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
        
        let timeString;
        if (diffHours < 1) timeString = 'Just now';
        else if (diffHours < 24) timeString = `${diffHours} hours ago`;
        else {
          const diffDays = Math.round(diffHours / 24);
          timeString = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
        
        // Determine activity type based on project status
        let activityType, action;
        if (project.status?.toLowerCase().includes('complete')) {
          activityType = 'review';
          action = `Completed project: ${project.title}`;
        } else if (project.progress > 75) {
          activityType = 'progress';
          action = `Updated progress on: ${project.title} (${project.progress}%)`;
        } else {
          activityType = 'upload';
          action = `Updated project: ${project.title}`;
        }
        
        return {
          id: project.id,
          action,
          time: timeString,
          type: activityType
        };
      });
      
      return activities.slice(0, 3); // Return only first 3 activities
    } catch (error) {
      console.error('Error fetching recent project activities:', error);
      return [];
    }
  }

  async getUpcomingDeadlines(controllerId: number) {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Get projects assigned to controller with approaching deadlines
      const projects = await this.databaseService.executeQuery(
        `SELECT p.*,
          u.first_name || ' ' || u.last_name as client_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.controller_id = ? AND p.end_date IS NOT NULL
        ORDER BY p.end_date ASC`,
        [controllerId]
      );
      
      const upcomingDeadlines = projects
        .filter(project => {
          const endDate = new Date(project.end_date);
          return endDate >= today && endDate <= nextWeek;
        })
        .map((project, index) => ({
          id: project.id,
          project: project.title,
          date: project.end_date,
          status: new Date(project.end_date).getTime() - today.getTime() < 2 * 24 * 60 * 60 * 1000 ? 'high' : 'medium' // High if within 2 days
        }));
      
      return upcomingDeadlines.slice(0, 3); // Take only first 3 upcoming deadlines
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      return [];
    }
  }

  async getRecentProjects() {
    try {
      const recentProjects = await this.databaseService.executeQuery(`
        SELECT p.*, u.first_name || ' ' || u.last_name as client_name
        FROM projects p
        JOIN users u ON p.client_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 10
      `);
      
      return recentProjects;
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      return [];
    }
  }

  async getProjectAnalytics() {
    try {
      // Get projects by status
      const projectsByStatus = await this.databaseService.executeQuery(`
        SELECT status, COUNT(*) as count
        FROM projects
        GROUP BY status
      `);
      
      // Get projects by month (last 6 months)
      const projectsByMonth = await this.databaseService.executeQuery(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as revenue
        FROM projects
        WHERE created_at >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month
      `);
      
      // Get average project duration
      const avgProjectDuration = await this.databaseService.executeQuery(`
        SELECT AVG(julianday(end_date) - julianday(start_date)) as avg_duration_days
        FROM projects
        WHERE end_date IS NOT NULL AND start_date IS NOT NULL
      `);
      
      // Get top services by project count
      const topServices = await this.databaseService.executeQuery(`
        SELECT s.name, COUNT(p.id) as project_count
        FROM services s
        JOIN projects p ON s.id = p.service_id
        GROUP BY s.id, s.name
        ORDER BY project_count DESC
        LIMIT 5
      `);
      
      // Format the projectsByMonth data to ensure it includes revenue
      const formattedProjectsByMonth = projectsByMonth.map(item => ({
        month: item.month,
        count: item.count,
        revenue: item.revenue || 0
      }));
      
      return {
        projectsByStatus,
        projectsByMonth: formattedProjectsByMonth,
        avgProjectDuration: avgProjectDuration[0]?.avg_duration_days || 0,
        topServices,
      };
    } catch (error) {
      console.error('Error fetching project analytics:', error);
      return {
        projectsByStatus: [],
        projectsByMonth: [],
        avgProjectDuration: 0,
        topServices: [],
      };
    }
  }

  async getAllUsers() {
    try {
      const users = await this.databaseService.executeQuery(`
        SELECT id, email, role, first_name, last_name, phone, created_at, is_verified
        FROM users
        ORDER BY created_at DESC
      `);
      
      // Group users by role
      const clients = users.filter(user => user.role === 'client');
      const controllers = users.filter(user => user.role === 'controller');
      const admins = users.filter(user => user.role === 'admin');
      
      return {
        allUsers: users,
        clients,
        controllers,
        admins,
        totalUsers: users.length,
        totalClients: clients.length,
        totalControllers: controllers.length,
        totalAdmins: admins.length,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        allUsers: [],
        clients: [],
        controllers: [],
        admins: [],
        totalUsers: 0,
        totalClients: 0,
        totalControllers: 0,
        totalAdmins: 0,
      };
    }
  }

  async getAllProjects() {
    try {
      const projects = await this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        ORDER BY p.created_at DESC
      `);
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async getAllServices() {
    try {
      const services = await this.databaseService.executeQuery(`
        SELECT *
        FROM services
        ORDER BY created_at DESC
      `);
      
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async getControllers() {
    try {
      const controllers = await this.databaseService.executeQuery(`
        SELECT 
          u.*,
          COUNT(p.id) as assigned_projects
        FROM users u
        LEFT JOIN projects p ON u.id = p.controller_id
        WHERE u.role = 'controller'
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);
      
      return controllers;
    } catch (error) {
      console.error('Error fetching controllers:', error);
      return [];
    }
  }
  
  async getClientDashboardStats(clientId: number) {
    try {
      // Get total projects for this client
      const totalProjectsResult = this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM projects WHERE client_id = ?',
        [clientId]
      );
      const totalProjects = totalProjectsResult[0]?.count || 0;
      
      // Get completed projects for this client
      const completedProjectsResult = this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = ?',
        [clientId, 'completed']
      );
      const completedProjects = completedProjectsResult[0]?.count || 0;
      
      // Get in-progress projects for this client
      const inProgressProjectsResult = this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status IN (?, ?, ?, ?)',
        [clientId, 'in_progress', 'development', 'testing', 'delivery']
      );
      const inProgressProjects = inProgressProjectsResult[0]?.count || 0;
      
      // Get pending projects for this client
      const pendingProjectsResult = this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM projects WHERE client_id = ? AND status = ?',
        [clientId, 'pending']
      );
      const pendingProjects = pendingProjectsResult[0]?.count || 0;
      
      // Get the most recent project for progress info
      const lastProjectResult = this.databaseService.executeQuery(
        'SELECT title, progress, status, created_at FROM projects WHERE client_id = ? ORDER BY created_at DESC LIMIT 1',
        [clientId]
      );
      
      // Get notification counts for this client
      const totalNotificationsResult = this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
        [clientId]
      );
      const totalNotifications = totalNotificationsResult[0]?.count || 0;
      
      const unreadNotificationsResult = this.databaseService.executeQuery(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [clientId]
      );
      const unreadNotifications = unreadNotificationsResult[0]?.count || 0;
      
      // Get recent activities (recent notifications)
      const recentActivities = this.databaseService.executeQuery(
        'SELECT title, message, created_at, is_read FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        [clientId]
      );
      
      // Get upcoming deadlines (projects with end dates approaching)
      const upcomingDeadlines = this.databaseService.executeQuery(
        'SELECT id, title, status, progress, end_date FROM projects WHERE client_id = ? AND end_date IS NOT NULL AND end_date >= datetime(?) ORDER BY end_date ASC LIMIT 3',
        [clientId, 'now']
      );
      
      // Get project progress summary
      const projectProgressSummary = this.databaseService.executeQuery(
        'SELECT status, COUNT(*) as count FROM projects WHERE client_id = ? GROUP BY status',
        [clientId]
      );
      
      const clientStats = {
        totalProjects,
        completedProjects,
        inProgressProjects,
        pendingProjects,
        lastProjectProgress: lastProjectResult[0]?.progress || 0,
        lastProjectTitle: lastProjectResult[0]?.title || null,
        totalNotifications,
        unreadNotifications,
        recentActivity: recentActivities,
        upcomingDeadlines,
        projectProgressSummary,
      };
      
      return clientStats;
    } catch (error) {
      console.error('Error fetching client dashboard stats:', error);
      return {
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        pendingProjects: 0,
        lastProjectProgress: 0,
        lastProjectTitle: null,
        totalNotifications: 0,
        unreadNotifications: 0,
        recentActivity: [],
        upcomingDeadlines: [],
        projectProgressSummary: [],
      };
    }
  }
}