import { projectsApi } from '../../../api';

// Service functions for project operations
export const projectService = {
  // Get all projects
  async getAllProjects() {
    try {
      const response = await projectsApi.getAllProjects();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
  },

  // Get project by ID
  async getProjectById(id) {
    try {
      const response = await projectsApi.getProjectById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch project');
    }
  },

  // Create a new project
  async createProject(projectData) {
    try {
      const response = await projectsApi.createProject(projectData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  },

  // Update project details
  async updateProject(id, projectData) {
    try {
      const response = await projectsApi.updateProject(id, projectData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },

  // Delete project
  async deleteProject(id) {
    try {
      await projectsApi.deleteProject(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  },

  // Update project progress
  async updateProjectProgress(id, progress) {
    try {
      const response = await projectsApi.updateProjectProgress(id, { progress });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update project progress');
    }
  }
};