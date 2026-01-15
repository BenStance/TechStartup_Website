import { Injectable } from '@nestjs/common';
import { Role } from '../config/roles.config';

export interface RoleInfo {
  name: string;
  description: string;
  permissions: string[];
}

@Injectable()
export class RolesService {
  private roles: Record<string, RoleInfo> = {
    [Role.ADMIN]: {
      name: Role.ADMIN,
      description: 'Administrator with full access to all system features',
      permissions: [
        'manage_users',
        'manage_projects',
        'manage_services',
        'manage_shop',
        'view_dashboard',
        'manage_notifications',
        'approve_projects',
        'assign_controllers'
      ]
    },
    [Role.CONTROLLER]: {
      name: Role.CONTROLLER,
      description: 'Project controller responsible for managing assigned projects',
      permissions: [
        'manage_assigned_projects',
        'update_project_progress',
        'view_assigned_projects',
        'upload_project_files',
        'view_own_notifications',
        'manage_own_notifications',
        'mark_notifications_as_read'
      ]
    },
    [Role.CLIENT]: {
      name: Role.CLIENT,
      description: 'Client who creates and manages their own projects',
      permissions: [
        'create_projects',
        'view_own_projects',
        'upload_project_requirements',
        'update_own_projects'
      ]
    }
  };

  getAllRoles(): RoleInfo[] {
    return Object.values(this.roles);
  }

  getRoleInfo(role: string): RoleInfo | null {
    return this.roles[role] || null;
  }

  isValidRole(role: string): boolean {
    return Object.values(Role).includes(role as Role);
  }

  hasPermission(role: string, permission: string): boolean {
    const roleInfo = this.roles[role];
    if (!roleInfo) return false;
    return roleInfo.permissions.includes(permission);
  }

  canAccessRole(userRole: string, targetRole: string): boolean {
    // Admin can access all roles
    if (userRole === Role.ADMIN) return true;
    
    // Controller can access client roles
    if (userRole === Role.CONTROLLER && targetRole === Role.CLIENT) return true;
    
    // Users can access their own role
    return userRole === targetRole;
  }
}