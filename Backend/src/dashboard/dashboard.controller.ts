import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/constants/roles.constant';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Admin routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  async getDashboardStats() {
    const data = await this.dashboardService.getDashboardStats();
    return {
      data,
      statusCode: 200,
      message: 'Dashboard stats retrieved successfully'
    };
  }

  @Get('recent-projects')
  async getRecentProjects() {
    const data = await this.dashboardService.getRecentProjects();
    return {
      data,
      statusCode: 200,
      message: 'Recent projects retrieved successfully'
    };
  }

  @Get('analytics')
  async getProjectAnalytics() {
    const data = await this.dashboardService.getProjectAnalytics();
    return {
      data,
      statusCode: 200,
      message: 'Project analytics retrieved successfully'
    };
  }

  @Get('users')
  async getAllUsers() {
    const data = await this.dashboardService.getAllUsers();
    return {
      data,
      statusCode: 200,
      message: 'Users retrieved successfully'
    };
  }

  @Get('projects')
  async getAllProjects() {
    const data = await this.dashboardService.getAllProjects();
    return {
      data,
      statusCode: 200,
      message: 'Projects retrieved successfully'
    };
  }

  @Get('services')
  async getAllServices() {
    const data = await this.dashboardService.getAllServices();
    return {
      data,
      statusCode: 200,
      message: 'Services retrieved successfully'
    };
  }

  @Get('controllers')
  async getControllers() {
    const data = await this.dashboardService.getControllers();
    return {
      data,
      statusCode: 200,
      message: 'Controllers retrieved successfully'
    };
  }

  // Controller routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTROLLER)
  @Get('controller/stats')
  async getControllerStats(@Request() req) {
    const data = await this.dashboardService.getControllerDashboardStats(req.user.id);
    return {
      data,
      statusCode: 200,
      message: 'Controller dashboard stats retrieved successfully'
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTROLLER)
  @Get('controller/assigned-projects')
  async getControllerAssignedProjects(@Request() req) {
    const data = await this.dashboardService.getControllerAssignedProjects(req.user.id);
    return {
      data,
      statusCode: 200,
      message: 'Controller assigned projects retrieved successfully'
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTROLLER)
  @Get('controller/recent-activities')
  async getControllerRecentActivities(@Request() req) {
    const data = await this.dashboardService.getRecentProjectActivities(req.user.id);
    return {
      data,
      statusCode: 200,
      message: 'Controller recent activities retrieved successfully'
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CONTROLLER)
  @Get('controller/upcoming-deadlines')
  async getControllerUpcomingDeadlines(@Request() req) {
    const data = await this.dashboardService.getUpcomingDeadlines(req.user.id);
    return {
      data,
      statusCode: 200,
      message: 'Controller upcoming deadlines retrieved successfully'
    };
  }
  
  // Client routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Get('client/stats')
  async getClientStats(@Request() req) {
    const data = await this.dashboardService.getClientDashboardStats(req.user.id);
    return {
      data,
      statusCode: 200,
      message: 'Client dashboard stats retrieved successfully'
    };
  }
}