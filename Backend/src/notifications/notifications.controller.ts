import { Controller, Post, Body, UseGuards, Request, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { MarkAllReadDto } from './dto/mark-read.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly projectsService: ProjectsService,
  ) {}

  // Send notification to a specific user - for admin/controller only
  @UseGuards(JwtAuthGuard)
  @Post('send-to-user')
  async sendNotificationToUser(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req
  ) {
    // Clients cannot send notifications
    if (req.user.role === 'client') {
      throw new Error('Clients cannot send notifications');
    }

    // Admins can send notifications to any user
    if (req.user.role === 'admin') {
      if (!createNotificationDto.userId) {
        throw new Error('User ID is required for sending notification to a specific user');
      }
      
      return await this.notificationsService.create({
        userId: createNotificationDto.userId,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        isRead: false
      });
    }

    // Controllers can only send notifications to users related to their projects
    if (req.user.role === 'controller') {
      if (!createNotificationDto.userId) {
        throw new Error('User ID is required for sending notification to a specific user');
      }
      
      const isRelated = await this.projectsService.isUserRelatedToController(
        createNotificationDto.userId,
        req.user.id
      );
      
      if (!isRelated) {
        throw new Error('Controllers can only send notifications to users related to their projects');
      }
      
      return await this.notificationsService.create({
        userId: createNotificationDto.userId,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        isRead: false
      });
    }

    throw new Error('Unauthorized to send notifications');
  }

  // Get all notifications (admin only)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllNotifications(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new Error('Only admins can view all notifications');
    }
    
    return await this.notificationsService.getAllNotifications();
  }

  // Get notifications for the current user
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getMyNotifications(@Request() req) {
    // All roles can view their own notifications
    console.log('Fetching notifications for user ID:', req.user.id, 'with role:', req.user.role);
    const notifications = await this.notificationsService.findAllForUser(req.user.id);
    console.log('Found notifications:', notifications.length);
    return notifications;
  }

  // Get notification by ID for current user
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getMyNotificationById(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    // All roles can view their own notification
    return await this.notificationsService.getNotificationByIdForUser(id, req.user.id);
  }

  // Get notifications for a specific user
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number, 
    @Request() req
  ) {
    // Clients cannot view other users' notifications
    if (req.user.role === 'client' && req.user.id !== userId) {
      throw new Error('Clients can only view their own notifications');
    }
    
    // Admins can view notifications for any user
    if (req.user.role === 'admin') {
      return await this.notificationsService.getNotificationsForUser(userId);
    }
    
    // Controllers can view notifications for users related to their projects
    if (req.user.role === 'controller') {
      if (req.user.id === userId) {
        // Controller can view their own notifications
        return await this.notificationsService.getNotificationsForUser(userId);
      }
      
      // Check if the target user is related to projects managed by this controller
      const isRelated = await this.projectsService.isUserRelatedToController(
        userId,
        req.user.id
      );
      
      if (!isRelated) {
        throw new Error('Controllers can only view notifications for users related to their projects');
      }
      
      return await this.notificationsService.getNotificationsForUser(userId);
    }
    
    // For clients, they can only view their own notifications
    if (req.user.role === 'client' && req.user.id === userId) {
      return await this.notificationsService.getNotificationsForUser(userId);
    }
    
    throw new Error('Unauthorized to view notifications for this user');
  }

  // Mark a specific notification as read - admin/controller only
  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    // Only admin and controller can mark any notification as read
    if (req.user.role === 'client') {
      throw new Error('Clients cannot mark other users\' notifications as read');
    }
    
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      return await this.notificationsService.markAsRead(id);
    }
    
    throw new Error('Unauthorized to mark notification as read');
  }

  // Mark a notification as read for current user
  @UseGuards(JwtAuthGuard)
  @Post('user/:id/read')
  async markMyNotificationAsRead(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    // Clients can mark their own notifications as read
    if (req.user.role === 'client') {
      return await this.notificationsService.markAsReadForUserAndNotify(id, req.user.id);
    }
    
    // Admin and controller can mark their own notifications as read
    return await this.notificationsService.markAsReadForUser(id, req.user.id);
  }

  // Mark all notifications as read for current user
  @UseGuards(JwtAuthGuard)
  @Post('user/read-all')
  async markAllMyNotificationsAsRead(@Request() req) {
    // Clients can mark all their notifications as read
    if (req.user.role === 'client') {
      return await this.notificationsService.markAllAsReadForUserAndNotify(req.user.id);
    }
    
    // Admin and controller can mark all their notifications as read
    return await this.notificationsService.markAllAsRead(req.user.id);
  }

  // Delete a notification for current user
  @UseGuards(JwtAuthGuard)
  @Post('user/:id/delete')
  async deleteMyNotification(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    // Only admin and controller can delete their own notifications
    if (req.user.role === 'client') {
      throw new Error('Clients cannot delete notifications');
    }
    
    // Admin and controller can delete their own notifications
    return await this.notificationsService.deleteNotificationForUser(id, req.user.id);
  }

  // Mark all notifications for the current user as read (admin/controller only)
  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async markAllAsRead(@Request() req) {
    // Admin and controller can mark all their own notifications as read
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      return await this.notificationsService.markAllAsRead(req.user.id);
    }
    
    throw new Error('Unauthorized to mark all notifications as read');
  }

  // Create a new notification (admin/controller only)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req
  ) {
    // Only admin and controller can create notifications
    if (req.user.role === 'client') {
      throw new Error('Clients cannot create notifications');
    }
    
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      if (createNotificationDto.broadcast) {
        // Handle broadcast notification
        // TODO: Implement broadcast notification functionality
        /* return await this.broadcastNotification({
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          type: createNotificationDto.type,
          targetUsers: createNotificationDto.targetUsers
        }, req); */
        
        // For now, convert to broadcast call
        const broadcastDto: BroadcastNotificationDto = {
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          type: createNotificationDto.type,
          targetUsers: createNotificationDto.targetUsers
        };
        
        return await this.notificationsService.broadcastNotification(createNotificationDto);
      }
      
      if (!createNotificationDto.userId) {
        throw new Error('User ID is required for sending notification to a specific user');
      }
      
      return await this.notificationsService.create({
        userId: createNotificationDto.userId,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        isRead: false
      });
    }
    
    throw new Error('Unauthorized to create notifications');
  }

  // Delete a specific notification - admin/controller only
  @UseGuards(JwtAuthGuard)
  @Post(':id/delete')
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number, 
    @Request() req
  ) {
    // Only admin and controller can delete notifications
    if (req.user.role === 'client') {
      throw new Error('Clients cannot delete notifications');
    }
    
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      return await this.notificationsService.deleteNotificationById(id);
    }
    
    throw new Error('Unauthorized to delete notification');
  }

  // Get the count of unread notifications for a specific user
  @UseGuards(JwtAuthGuard)
  @Get(':userId/unread-count')
  async getUnreadCount(
    @Param('userId', ParseIntPipe) userId: number, 
    @Request() req
  ) {
    // Clients cannot check other users' unread count
    if (req.user.role === 'client' && req.user.id !== userId) {
      throw new Error('Clients can only check their own unread notification count');
    }
    
    // Admins can check unread count for any user
    if (req.user.role === 'admin') {
      return await this.notificationsService.getUnreadCount(userId);
    }
    
    // Controllers can check unread count for users related to their projects
    if (req.user.role === 'controller') {
      if (req.user.id === userId) {
        // Controller can check their own unread count
        return await this.notificationsService.getUnreadCount(userId);
      }
      
      const isRelated = await this.projectsService.isUserRelatedToController(
        userId,
        req.user.id
      );
      
      if (!isRelated) {
        throw new Error('Controllers can only check unread count for users related to their projects');
      }
      
      return await this.notificationsService.getUnreadCount(userId);
    }
    
    // For clients, they can only check their own unread count
    if (req.user.role === 'client' && req.user.id === userId) {
      return await this.notificationsService.getUnreadCount(userId);
    }
    
    throw new Error('Unauthorized to check unread count for this user');
  }

  // Broadcast notification to all users or specific users
  @UseGuards(JwtAuthGuard)
  @Post('broadcast')
  async broadcastNotification(
    @Body() broadcastDto: BroadcastNotificationDto,
    @Request() req
  ) {
    // Only admin and controller can broadcast notifications
    if (req.user.role === 'client') {
      throw new Error('Clients cannot broadcast notifications');
    }
    
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      // Convert to CreateNotificationDto format
      const createNotificationDto: CreateNotificationDto = {
        title: broadcastDto.title,
        message: broadcastDto.message,
        type: broadcastDto.type,
        targetUsers: broadcastDto.targetUsers,
      };
      
      return await this.notificationsService.broadcastNotification(createNotificationDto);
    }
    
    throw new Error('Unauthorized to broadcast notifications');
  }

  // Mark all notifications as read for a specific user - admin/controller only
  @UseGuards(JwtAuthGuard)
  @Post(':userId/mark-all-read')
  async markAllUserNotificationsAsRead(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req
  ) {
    // Only admin and controller can mark all notifications as read for a specific user
    if (req.user.role === 'client') {
      throw new Error('Clients cannot mark other users\' notifications as read');
    }
    
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      // Verify access permissions
      if (req.user.role === 'controller') {
        const isRelated = await this.projectsService.isUserRelatedToController(
          userId,
          req.user.id
        );
        
        if (!isRelated) {
          throw new Error('Controllers can only mark notifications as read for users related to their projects');
        }
      }
      
      return await this.notificationsService.markAllAsRead(userId);
    }
    
    throw new Error('Unauthorized to mark all notifications as read for user');
  }

  // Delete all notifications for a specific user - admin/controller only
  @UseGuards(JwtAuthGuard)
  @Post(':userId/delete-all')
  async deleteAllUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req
  ) {
    // Only admin and controller can delete all notifications for a specific user
    if (req.user.role === 'client') {
      throw new Error('Clients cannot delete notifications');
    }
    
    if (req.user.role === 'admin' || req.user.role === 'controller') {
      // Verify access permissions
      if (req.user.role === 'controller') {
        const isRelated = await this.projectsService.isUserRelatedToController(
          userId,
          req.user.id
        );
        
        if (!isRelated) {
          throw new Error('Controllers can only delete notifications for users related to their projects');
        }
      }
      
      return await this.notificationsService.deleteAllNotificationsForUser(userId);
    }
    
    throw new Error('Unauthorized to delete all notifications for user');
  }

  // Get notifications for current user with pagination
  @UseGuards(JwtAuthGuard)
  @Get('user/paginated')
  async getMyNotificationsPaginated(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    // All roles can view their own notifications
    const notifications = await this.notificationsService.findAllForUser(req.user.id);
    const paginatedNotifications = notifications.slice(offset, offset + limitNum);
    
    return {
      data: paginatedNotifications,
      page: pageNum,
      limit: limitNum,
      total: notifications.length,
      totalPages: Math.ceil(notifications.length / limitNum)
    };
  }
}