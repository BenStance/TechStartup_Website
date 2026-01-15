import axiosClient from './axiosClient';

export interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleAccessResponse {
  canAccess: boolean;
}

class RolesApi {
  // Get information about all available roles
  async getAllRoles(): Promise<Role[]> {
    const response = await axiosClient.get('/roles');
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Get detailed information about a specific role
  async getRoleDetails(role: string): Promise<Role> {
    const response = await axiosClient.get(`/roles/${role}`);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Get permissions associated with a specific role
  async getRolePermissions(role: string): Promise<{role: string, permissions: string[]}> {
    const response = await axiosClient.get(`/roles/${role}/permissions`);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }

  // Check if one role can access resources of another role
  async checkRoleAccess(role: string, targetRole: string): Promise<RoleAccessResponse> {
    const response = await axiosClient.get(`/roles/${role}/can-access/${targetRole}`);
    // Handle response wrapper from backend interceptor
    return response.data.data ?? response.data;
  }
}

export default new RolesApi();