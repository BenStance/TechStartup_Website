import axiosClient from './axiosClient';

export interface Project {
  id: number;
  title: string;
  description: string;
  serviceId: number;
  clientId: number;
  controllerId?: number;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  amount?: number;
  amountDescription?: string;
  requirementsPdf?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  serviceId: number;
  clientId: number;
  controllerId?: number;
  progress?: number;
  amount?: number;
  amountDescription?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  serviceId?: number;
  clientId?: number;
  controllerId?: number;
  status?: string;
  progress?: number;
  amount?: number;
  amountDescription?: string;
}

export interface ProgressRecord {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface AddProgressRequest {
  title: string;
  description: string;
  status: string;
}

class ProjectsApi {
  // Create a new project
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await axiosClient.post('/projects', data);
    return response.data;
  }

  // Get all projects (for admin users) or projects assigned to controller (for controller users)
  async getAllProjects(): Promise<Project[]> {
    const response = await axiosClient.get('/projects');
    // Handle response wrapper from backend interceptor
    const projects = response.data.data || response.data;
    
    // Map snake_case fields to camelCase
    return projects.map((project: any) => ({
      ...project,
      requirementsPdf: project.requirements_pdf || project.requirementsPdf
    }));
  }

  // Get project by ID
  async getProjectById(id: number): Promise<Project> {
    const response = await axiosClient.get(`/projects/${id}`);
    // Handle response wrapper from backend interceptor
    const project = response.data.data || response.data;
    
    // Map snake_case fields to camelCase
    return {
      ...project,
      requirementsPdf: project.requirements_pdf || project.requirementsPdf
    };
  }

  // Update project
  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    const response = await axiosClient.put(`/projects/${id}`, data);
    // Handle response wrapper from backend interceptor
    const project = response.data.data || response.data;
    
    // Map snake_case fields to camelCase
    return {
      ...project,
      requirementsPdf: project.requirements_pdf || project.requirementsPdf
    };
  }

  // Delete project
  async deleteProject(id: number): Promise<void> {
    await axiosClient.delete(`/projects/${id}`);
  }

  // Add project progress record
  async addProgress(id: number, data: AddProgressRequest): Promise<ProgressRecord> {
    const response = await axiosClient.post(`/projects/${id}/progress`, data);
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Get project progress records
  async getProjectProgress(id: number): Promise<ProgressRecord[]> {
    const response = await axiosClient.get(`/projects/${id}/progress`);
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Upload project requirement document
  async uploadProjectRequirement(id: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post(`/uploads/project/${id}/requirement`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Upload project file
  async uploadProjectFile(id: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post(`/projects/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Get projects for authenticated client
  async getClientProjects(): Promise<Project[]> {
    const response = await axiosClient.get('/projects');
    // Handle response wrapper from backend interceptor
    const projects = response.data.data || response.data;
    
    // Map snake_case fields to camelCase
    return projects.map((project: any) => ({
      ...project,
      requirementsPdf: project.requirements_pdf || project.requirementsPdf
    }));
  }

  // Get project files
  async getProjectFiles(id: number): Promise<any[]> {
    const response = await axiosClient.get(`/projects/${id}/files`);
    
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }

  // Delete project file
  async deleteProjectFile(id: number, fileId: number): Promise<any> {
    const response = await axiosClient.delete(`/projects/${id}/files/${fileId}`);
    
    // Handle response wrapper from backend interceptor
    return response.data.data || response.data;
  }
}

export default new ProjectsApi();