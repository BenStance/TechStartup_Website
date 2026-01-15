  import { Injectable } from '@nestjs/common';
  import { DatabaseService } from '../database/database.service';
  import { LogsService } from '../logs/logs.service';
  import { CreateNotificationDto } from './dto/create-notification.dto';

  @Injectable()
  export class NotificationsService {
    constructor(
      private databaseService: DatabaseService,
      private logsService: LogsService,
    ) {}

    async create(notificationData: CreateNotificationDto & { userId?: number; isRead?: boolean }) {
      try {
        const result = this.databaseService.executeQuery(`
          INSERT INTO notifications (user_id, title, message, type, is_read)
          VALUES (?, ?, ?, ?, ?)
        `, [
          notificationData.userId,
          notificationData.title,
          notificationData.message,
          notificationData.type,
          notificationData.isRead ? 1 : 0  // Convert boolean to integer
        ]);

        // Get the created notification
        const createdNotification = this.databaseService.executeQuery(
          'SELECT * FROM notifications WHERE id = ?',
          [result.lastInsertRowid]
        );

        // Log the notification creation
        await this.logsService.logInfo('Notification created', {
          notificationId: result.lastInsertRowid,
          userId: notificationData.userId,
          title: notificationData.title,
          type: notificationData.type
        });

        return createdNotification[0];
      } catch (error) {
        await this.logsService.logError('Failed to create notification', {
          error: error.message,
          userId: notificationData.userId,
          title: notificationData.title
        });
        console.error('Error creating notification:', error);
        throw error;
      }
    }

    async findAllForUser(userId: number) {
      try {
        console.log('Database query for user ID:', userId);
        const notifications = this.databaseService.executeQuery(`
          SELECT * FROM notifications 
          WHERE user_id = ? 
          ORDER BY created_at DESC
        `, [userId]);
        
        console.log('Raw query result:', notifications);

        await this.logsService.logInfo('Notifications fetched for user', { userId, count: notifications.length });
        return notifications;
      } catch (error) {
        await this.logsService.logError('Failed to fetch notifications for user', {
          error: error.message,
          userId
        });
        console.error(`Error fetching notifications for user ${userId}:`, error);
        return [];
      }
    }

    // Mark a notification as read (admin access)
    async markAsRead(id: number) {
      try {
        // For admin access - update any notification
        const result = this.databaseService.executeQuery(`
          UPDATE notifications 
          SET is_read = 1, updated_at = datetime('now')
          WHERE id = ?
        `, [id]);

        if (result.changes > 0) {
          const updatedNotification = this.databaseService.executeQuery(
            'SELECT * FROM notifications WHERE id = ?',
            [id]
          );
          
          await this.logsService.logInfo('Notification marked as read by admin', { notificationId: id });
          return updatedNotification[0];
        }

        return null;
      } catch (error) {
        await this.logsService.logError('Failed to mark notification as read by admin', {
          error: error.message,
          notificationId: id
        });
        console.error(`Error marking notification ${id} as read by admin:`, error);
        throw error;
      }
    }

    // Mark a notification as read and notify admin
    async markAsReadForUserAndNotify(notificationId: number, userId: number) {
      try {
        // First, verify that the notification belongs to the user
        const notification = this.databaseService.executeQuery(
          'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
          [notificationId, userId]
        );
        
        if (!notification || notification.length === 0) {
          throw new Error('Notification not found or unauthorized');
        }
        
        const result = this.databaseService.executeQuery(`
          UPDATE notifications 
          SET is_read = 1, updated_at = datetime('now')
          WHERE id = ? AND user_id = ?
        `, [notificationId, userId]);

        if (result.changes > 0) {
          const updatedNotification = this.databaseService.executeQuery(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
          );
          
          // Log that the user marked notification as read
          await this.logsService.logInfo('Notification marked as read by user', { 
            notificationId, 
            userId 
          });
          
          // Notify admin about the user action
          await this.logsService.logInfo('Admin notification: User marked notification as read', { 
            notificationId, 
            userId,
            title: updatedNotification[0].title
          });
          
          return updatedNotification[0];
        }

        return null;
      } catch (error) {
        await this.logsService.logError('Failed to mark notification as read by user', {
          error: error.message,
          notificationId,
          userId
        });
        console.error(`Error marking notification ${notificationId} as read for user ${userId}:`, error);
        throw error;
      }
    }

    // Mark a specific notification as read for a specific user
    async markAsReadForUser(notificationId: number, userId: number) {
      try {
        // First, verify that the notification belongs to the user
        const notification = this.databaseService.executeQuery(
          'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
          [notificationId, userId]
        );
        
        if (!notification || notification.length === 0) {
          throw new Error('Notification not found or unauthorized');
        }
        
        const result = this.databaseService.executeQuery(`
          UPDATE notifications 
          SET is_read = 1, updated_at = datetime('now')
          WHERE id = ? AND user_id = ?
        `, [notificationId, userId]);

        if (result.changes > 0) {
          const updatedNotification = this.databaseService.executeQuery(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
          );
          
          await this.logsService.logInfo('Notification marked as read by user', { 
            notificationId, 
            userId 
          });
          return updatedNotification[0];
        }

        return null;
      } catch (error) {
        await this.logsService.logError('Failed to mark notification as read by user', {
          error: error.message,
          notificationId,
          userId
        });
        console.error(`Error marking notification ${notificationId} as read for user ${userId}:`, error);
        throw error;
      }
    }

    async markAllAsRead(userId: number) {
      try {
        const result = this.databaseService.executeQuery(`
          UPDATE notifications 
          SET is_read = 1, updated_at = datetime('now')
          WHERE user_id = ? AND is_read = 0
        `, [userId]);

        await this.logsService.logInfo('All notifications marked as read for user', { 
          userId, 
          count: result.changes 
        });
        
        return { 
          message: `Marked ${result.changes} notifications as read`,
          count: result.changes
        };
      } catch (error) {
        await this.logsService.logError('Failed to mark all notifications as read for user', {
          error: error.message,
          userId
        });
        console.error(`Error marking all notifications for user ${userId} as read:`, error);
        throw error;
      }
    }

    async markAllAsReadForUserAndNotify(userId: number) {
      try {
        const result = this.databaseService.executeQuery(`
          UPDATE notifications 
          SET is_read = 1, updated_at = datetime('now')
          WHERE user_id = ? AND is_read = 0
        `, [userId]);

        await this.logsService.logInfo('All notifications marked as read for user', { 
          userId, 
          count: result.changes 
        });
        
        // Notify admin about the user action
        if (result.changes > 0) {
          await this.logsService.logInfo('Admin notification: User marked all notifications as read', { 
            userId,
            count: result.changes
          });
        }
        
        return { 
          message: `Marked ${result.changes} notifications as read`,
          count: result.changes
        };
      } catch (error) {
        await this.logsService.logError('Failed to mark all notifications as read for user', {
          error: error.message,
          userId
        });
        console.error(`Error marking all notifications for user ${userId} as read:`, error);
        throw error;
      }
    }

    async deleteNotification(id: number) {
      try {
        const result = this.databaseService.executeQuery(
          'DELETE FROM notifications WHERE id = ?',
          [id]
        );

        if (result.changes > 0) {
          await this.logsService.logInfo('Notification deleted', { notificationId: id });
          return { message: 'Notification deleted successfully' };
        }

        return { message: 'Notification not found' };
      } catch (error) {
        await this.logsService.logError('Failed to delete notification', {
          error: error.message,
          notificationId: id
        });
        console.error(`Error deleting notification ${id}:`, error);
        throw error;
      }
    }

    async deleteNotificationById(notificationId: number) {
      try {
        const result = this.databaseService.executeQuery(
          'DELETE FROM notifications WHERE id = ?',
          [notificationId]
        );

        if (result.changes > 0) {
          await this.logsService.logInfo('Notification deleted by admin', { notificationId });
          return { message: 'Notification deleted successfully' };
        }

        return { message: 'Notification not found' };
      } catch (error) {
        await this.logsService.logError('Failed to delete notification', {
          error: error.message,
          notificationId
        });
        console.error(`Error deleting notification ${notificationId}:`, error);
        throw error;
      }
    }

    async deleteAllNotificationsForUser(userId: number) {
      try {
        const result = this.databaseService.executeQuery(
          'DELETE FROM notifications WHERE user_id = ?',
          [userId]
        );

        if (result.changes > 0) {
          await this.logsService.logInfo('All notifications deleted for user', { userId, count: result.changes });
          return { message: `${result.changes} notifications deleted successfully` };
        }

        return { message: 'No notifications found for user' };
      } catch (error) {
        await this.logsService.logError('Failed to delete all notifications for user', {
          error: error.message,
          userId
        });
        console.error(`Error deleting all notifications for user ${userId}:`, error);
        throw error;
      }
    }

    async getUnreadCount(userId: number) {
      try {
        const result = this.databaseService.executeQuery(`
          SELECT COUNT(*) as unread_count 
          FROM notifications 
          WHERE user_id = ? AND is_read = 0
        `, [userId]);

        await this.logsService.logInfo('Unread notification count fetched', { 
          userId, 
          count: result[0].unread_count 
        });
        
        return { unreadCount: result[0].unread_count };
      } catch (error) {
        await this.logsService.logError('Failed to fetch unread notification count', {
          error: error.message,
          userId
        });
        console.error(`Error fetching unread count for user ${userId}:`, error);
        return { unreadCount: 0 };
      }
    }

    // New method to get all notifications for admin
    async getAllNotifications() {
      try {
        const notifications = this.databaseService.executeQuery(`
          SELECT * FROM notifications 
          ORDER BY created_at DESC
        `);

        await this.logsService.logInfo('All notifications fetched for admin', { count: notifications.length });
        return notifications;
      } catch (error) {
        await this.logsService.logError('Failed to fetch all notifications for admin', {
          error: error.message
        });
        console.error('Error fetching all notifications:', error);
        return [];
      }
    }

    // Broadcast notification to all users or specific users
    async broadcastNotification(notificationData: CreateNotificationDto) {
      try {
        if (notificationData.targetUsers && notificationData.targetUsers.length > 0) {
          // Send to specific users
          for (const userId of notificationData.targetUsers) {
            await this.create({
              userId,
              title: notificationData.title,
              message: notificationData.message,
              type: notificationData.type,
              isRead: false
            });
          }
        } else {
          // Broadcast to all users
          const allUsers = this.databaseService.executeQuery(
            'SELECT id FROM users WHERE is_active = 1'
          );
          
          for (const user of allUsers) {
            await this.create({
              userId: user.id,
              title: notificationData.title,
              message: notificationData.message,
              type: notificationData.type,
              isRead: false
            });
          }
        }

        await this.logsService.logInfo('Broadcast notification sent', {
          title: notificationData.title,
          targetUsers: notificationData.targetUsers,
          broadcastToAll: !(notificationData.targetUsers && notificationData.targetUsers.length > 0)
        });
        
        return { message: 'Broadcast notification sent successfully' };
      } catch (error) {
        await this.logsService.logError('Failed to broadcast notification', {
          error: error.message,
          title: notificationData.title
        });
        console.error('Error broadcasting notification:', error);
        throw error;
      }
    }

    // Get notification by ID for a specific user
    async getNotificationByIdForUser(notificationId: number, userId: number) {
      try {
        const notification = this.databaseService.executeQuery(
          'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
          [notificationId, userId]
        );
        
        if (notification && notification.length > 0) {
          return notification[0];
        }
        
        throw new Error('Notification not found or unauthorized');
      } catch (error) {
        console.error(`Error fetching notification ${notificationId} for user ${userId}:`, error);
        throw error;
      }
    }

    // Delete notification for a specific user
    async deleteNotificationForUser(notificationId: number, userId: number) {
      try {
        // First, verify that the notification belongs to the user
        const notification = this.databaseService.executeQuery(
          'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
          [notificationId, userId]
        );
        
        if (!notification || notification.length === 0) {
          throw new Error('Notification not found or unauthorized');
        }
        
        const result = this.databaseService.executeQuery(
          'DELETE FROM notifications WHERE id = ? AND user_id = ?',
          [notificationId, userId]
        );

        if (result.changes > 0) {
          await this.logsService.logInfo('Notification deleted by user', { 
            notificationId, 
            userId 
          });
          return { message: 'Notification deleted successfully' };
        }

        return { message: 'Notification not found' };
      } catch (error) {
        await this.logsService.logError('Failed to delete notification by user', {
          error: error.message,
          notificationId,
          userId
        });
        console.error(`Error deleting notification ${notificationId} for user ${userId}:`, error);
        throw error;
      }
    }

    async getNotificationsForUser(userId: number) {
      try {
        const notifications = this.databaseService.executeQuery(`
          SELECT * FROM notifications 
          WHERE user_id = ?
          ORDER BY created_at DESC
        `, [userId]);

        console.log('Notifications fetched for user:', { userId, count: notifications.length });
        return notifications;
      } catch (error) {
        console.error(`Error fetching notifications for user ${userId}:`, error);
        return [];
      }
    }
  }