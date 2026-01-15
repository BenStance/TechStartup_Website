import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from './entities/user.interface';
import { NotificationType } from '../common/constants/notification-types.constant';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.databaseService.createUser(createUserDto);
    
    // Send notification to all admins about new user registration
    await this.sendAdminNotification(
      'New User Registered',
      `A new user "${createUserDto.firstName} ${createUserDto.lastName}" has registered with email ${createUserDto.email}.`
    );
    
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.databaseService.findUserByEmail(email);
    console.log('UsersService.findByEmail result:', user);
    return user;
  }

  async findById(id: number) {
    const user = await this.databaseService.findUserById(id);
    console.log('UsersService.findById result:', user);
    return user;
  }

  // Update user details (excluding email)
  async update(id: number, updateUserDto: UpdateUserDto) {
    // Remove email from update data to prevent email changes
    const { email, ...updateData } = updateUserDto;
    const user = await this.databaseService.updateUserDetails(id, updateData) as User | null;
    
    // Send notification to user about profile update
    if (user) {
      await this.notificationsService.create({
        userId: id,
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
        type: NotificationType.PROFILE_UPDATE,
        isRead: false
      });
      
      // If role was updated, notify admins
      if (updateUserDto.role !== undefined) {
        await this.sendAdminNotification(
          'User Role Updated',
          `User "${user.first_name} ${user.last_name}" role has been updated to ${updateUserDto.role}.`
        );
      }
    }
    
    return user;
  }

  // Delete user (for admin use)
  async remove(id: number) {
    const user = await this.databaseService.findUserById(id) as User | null;
    const result = await this.databaseService.deleteUser(id);
    
    // Send notification to all admins about user deletion
    if (user && result.deleted) {
      await this.sendAdminNotification(
        'User Account Deleted',
        `User "${user.first_name} ${user.last_name}" account has been deleted.`
      );
    }
    
    return result;
  }

  // Get all users (for admin use)
  async findAll() {
    try {
      const users = await this.databaseService.executeQuery(
        'SELECT id, email, role, first_name, last_name, phone, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
  
  // Get all clients (for controller use)
  async findAllClients() {
    try {
      const clients = await this.databaseService.executeQuery(
        "SELECT id, email, role, first_name, last_name, phone, is_verified, created_at, updated_at FROM users WHERE role = 'client' ORDER BY created_at DESC"
      );
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }
  
  // Helper method to send notifications to all admins
  private async sendAdminNotification(title: string, message: string) {
    try {
      // Get all admins
      const admins = this.databaseService.executeQuery(
        "SELECT id FROM users WHERE role = 'admin'"
      );
      
      // Send notification to each admin
      for (const admin of admins) {
        await this.notificationsService.create({
          userId: admin.id,
          title,
          message,
          type: NotificationType.USER_UPDATE,
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }
}