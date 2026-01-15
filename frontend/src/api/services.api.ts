import axiosClient from './axiosClient';

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  price?: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
}

class ServicesApi {
  // Create a new service
  async createService(data: CreateServiceRequest): Promise<Service> {
    const response = await axiosClient.post('/services', data);
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Get all services
  async getAllServices(): Promise<Service[]> {
    const response = await axiosClient.get('/services');
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Get service by ID
  async getServiceById(id: number): Promise<Service> {
    const response = await axiosClient.get(`/services/${id}`);
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Update service
  async updateService(id: number, data: UpdateServiceRequest): Promise<Service> {
    const response = await axiosClient.put(`/services/${id}`, data);
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Delete service
  async deleteService(id: number): Promise<void> {
    await axiosClient.delete(`/services/${id}`);
  }
}

export default new ServicesApi();