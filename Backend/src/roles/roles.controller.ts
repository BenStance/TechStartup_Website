import { Controller, Get, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../config/roles.config';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.getAllRoles();
  }

  @Get(':role')
  findOne(@Param('role') role: string) {
    // Check if role is valid
    if (!this.rolesService.isValidRole(role)) {
      return { 
        error: 'Invalid role', 
        message: `Role '${role}' is not a valid role in the system`,
        validRoles: Object.values(Role)
      };
    }
    
    const roleInfo = this.rolesService.getRoleInfo(role);
    if (!roleInfo) {
      return { 
        error: 'Role not found', 
        message: `Information for role '${role}' is not available` 
      };
    }
    
    return roleInfo;
  }

  @Get(':role/permissions')
  getRolePermissions(@Param('role') role: string) {
    // Check if role is valid
    if (!this.rolesService.isValidRole(role)) {
      return { 
        error: 'Invalid role', 
        message: `Role '${role}' is not a valid role in the system`,
        validRoles: Object.values(Role)
      };
    }
    
    const roleInfo = this.rolesService.getRoleInfo(role);
    if (!roleInfo) {
      return { 
        error: 'Role not found', 
        message: `Information for role '${role}' is not available` 
      };
    }
    
    return {
      role: roleInfo.name,
      permissions: roleInfo.permissions
    };
  }

  @Get(':role/can-access/:targetRole')
  canAccessRole(@Param('role') role: string, @Param('targetRole') targetRole: string) {
    // Check if roles are valid
    if (!this.rolesService.isValidRole(role)) {
      return { 
        error: 'Invalid role', 
        message: `Role '${role}' is not a valid role in the system`,
        validRoles: Object.values(Role)
      };
    }
    
    if (!this.rolesService.isValidRole(targetRole)) {
      return { 
        error: 'Invalid target role', 
        message: `Target role '${targetRole}' is not a valid role in the system`,
        validRoles: Object.values(Role)
      };
    }
    
    const canAccess = this.rolesService.canAccessRole(role, targetRole);
    
    return {
      role,
      targetRole,
      canAccess,
      message: canAccess 
        ? `Role '${role}' can access resources of role '${targetRole}'` 
        : `Role '${role}' cannot access resources of role '${targetRole}'`
    };
  }
}