import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/constants/notification-types.constant';

@Injectable()
export class ServicesService {
  constructor(
    private databaseService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      const result = await this.databaseService.executeQuery(
        `INSERT INTO services (name, description, category, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          createServiceDto.name,
          createServiceDto.description,
          createServiceDto.category,
          createServiceDto.price || null
        ]
      );

      // Get the created service
      const createdService = await this.databaseService.executeQuery(
        'SELECT * FROM services WHERE id = ?',
        [result.lastInsertRowid]
      );

      // Send notification to all admins about new service creation
      await this.sendAdminNotification(
        'New Service Added',
        `A new service "${createServiceDto.name}" has been added to the platform.`
      );

      return createdService[0];
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const services = await this.databaseService.executeQuery(
        'SELECT * FROM services ORDER BY created_at DESC'
      );
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  async findOne(id: number) {
    try {
      const service = await this.databaseService.executeQuery(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );
      return service[0] || null;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      return null;
    }
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    try {
      // Check if service exists
      const existingService = await this.findOne(id);
      if (!existingService) {
        throw new Error('Service not found');
      }

      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
      
      if (updateServiceDto.name !== undefined) {
        fields.push('name = ?');
        values.push(updateServiceDto.name);
      }
      
      if (updateServiceDto.description !== undefined) {
        fields.push('description = ?');
        values.push(updateServiceDto.description);
      }
      
      if (updateServiceDto.category !== undefined) {
        fields.push('category = ?');
        values.push(updateServiceDto.category);
      }
      
      if (updateServiceDto.price !== undefined) {
        fields.push('price = ?');
        values.push(updateServiceDto.price);
      }
      
      // Always update the updated_at timestamp
      fields.push("updated_at = datetime('now')");
      
      if (fields.length === 1) {
        // Only timestamp would be updated, skip
        return existingService;
      }
      
      // Construct the query
      const query = `UPDATE services SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);
      
      // Execute the update
      await this.databaseService.executeQuery(query, values);
      
      // Fetch and return the updated service
      const updatedService = await this.databaseService.executeQuery(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );
      
      // Send notification to all admins about service update
      await this.sendAdminNotification(
        'Service Updated',
        `Service "${updatedService[0].name}" has been updated.`
      );
      
      return updatedService[0];
    } catch (error) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Check if service exists
      const existingService = await this.findOne(id);
      if (!existingService) {
        return {
          message: 'Service not found',
          deleted: false
        };
      }

      // Check if there are projects associated with this service
      const projects = await this.databaseService.executeQuery(
        'SELECT id FROM projects WHERE service_id = ?',
        [id]
      );

      if (projects.length > 0) {
        // Get all project IDs that will be affected
        const projectIds = projects.map(p => p.id);
        
        // First delete all project files associated with these projects
        await this.databaseService.executeQuery(
          `DELETE FROM project_files WHERE project_id IN (${projectIds.map(() => '?').join(',')})`,
          projectIds
        );
        
        // Then delete all related projects
        await this.databaseService.executeQuery(
          `DELETE FROM projects WHERE service_id = ?`,
          [id]
        );
      }

      // Now delete the service
      await this.databaseService.executeQuery(
        'DELETE FROM services WHERE id = ?',
        [id]
      );

      // Send notification to all admins about service deletion
      await this.sendAdminNotification(
        'Service Removed',
        `Service "${existingService.name}" has been removed from the platform.`
      );

      return {
        message: 'Service deleted successfully',
        deleted: true
      };
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      return {
        message: 'Error deleting service',
        deleted: false
      };
    }
  }

  // Helper method to send notifications to all admins
  private async sendAdminNotification(title: string, message: string) {
    try {
      // Get all admins
      const admins = await this.databaseService.executeQuery(
        "SELECT id FROM users WHERE role = 'admin'"
      );
      
      // Send notification to each admin
      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.id,
          title,
          message,
          type: NotificationType.SERVICE_UPDATE,
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }
}