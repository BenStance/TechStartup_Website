import axiosClient from './axiosClient';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

class UsersApi {
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const response = await axiosClient.get('/users');
    // Handle response wrapper from backend interceptor
    const data = response.data.data.data || response.data.data || response.data;
    return data;
  }

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await axiosClient.get(`/users/${id}`);
    // Handle response wrapper from backend interceptor
    const data = response.data.data.data || response.data.data || response.data;
    return data;
  }

  // Create a new user (public endpoint)
  async createUser(data: Partial<User>): Promise<User> {
    const response = await axiosClient.post('/users', data);
    // Handle response wrapper from backend interceptor
    const result = response.data.data.data || response.data.data || response.data;
    return result;
  }

  // Update user details
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await axiosClient.put(`/users/${id}`, data);
    // Handle response wrapper from backend interceptor
    const result = response.data.data.data || response.data.data || response.data;
    return result;
  }

  // Delete user (admin only)
  async deleteUser(id: number): Promise<void> {
    await axiosClient.delete(`/users/${id}`);
  }
}

export default new UsersApi();