import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/constants/notification-types.constant';

@Injectable()
export class ProjectsService {
  constructor(
    private databaseService: DatabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async create(projectData: any, requester: any) {
    try {
      // Allow admins, clients, and controllers to create projects
      if (requester.role !== 'admin' && requester.role !== 'client' && requester.role !== 'controller') {
        throw new Error('Only admins, clients, and controllers can create projects');
      }
      
      // If requester is a client, they can only create projects for themselves
      // In this case, we should set the client_id to the requester's id
      if (requester.role === 'client') {
        projectData.clientId = requester.id; // Use the requester's id (sub from JWT)
      } else if (projectData.clientId !== requester.userId && requester.role !== 'admin' && requester.role !== 'controller') {
        throw new Error('Unauthorized to create project for this client');
      }
      
      // If requester is a controller, they can create projects for any client and assign to themselves
      if (requester.role === 'controller') {
        // Controllers can create projects and assign them to themselves
        projectData.controllerId = requester.id;
      }

      const insertProject = this.databaseService.executeQuery(`
        INSERT INTO projects (title, description, service_id, client_id, controller_id, status, progress, amount, amount_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        projectData.title,
        projectData.description,
        projectData.serviceId,
        projectData.clientId, // This will now be set for clients
        projectData.controllerId || null,
        'pending',
        projectData.progress || 0,
        projectData.amount || null,
        projectData.amountDescription || null
      ]);

      // Get the created project
      const createdProject = this.databaseService.executeQuery(
        'SELECT * FROM projects WHERE id = ?',
        [insertProject.lastInsertRowid]
      );

      // Send notifications to admin, client, and controller
      await this.sendProjectNotification(
        projectData.clientId,
        'admin',
        'New Project Created',
        `A new project "${projectData.title}" has been created by client.`
      );

      // Send notification to client
      await this.sendProjectNotification(
        projectData.clientId,
        'client',
        'Project Created',
        `Your project "${projectData.title}" has been successfully created and is awaiting approval.`
      );

      // Send notification to controller if assigned
      if (projectData.controllerId) {
        await this.sendProjectNotification(
          projectData.controllerId,
          'controller',
          'New Project Assigned',
          `A new project "${projectData.title}" has been assigned to you.`
        );
      }

      return createdProject[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const projects = this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        ORDER BY p.created_at DESC
      `);

      console.log('Projects fetched from DB:', projects.length);
      console.log('Sample project data:', projects[0]);

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async findProjectsByController(controllerId: number) {
    try {
      const projects = this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.controller_id = ?
        ORDER BY p.created_at DESC
      `, [controllerId]);

      return projects;
    } catch (error) {
      console.error('Error fetching projects for controller:', error);
      return [];
    }
  }
  
  async findProjectsByClient(clientId: number) {
    try {
      const projects = this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.client_id = ?
        ORDER BY p.created_at DESC
      `, [clientId]);

      return projects;
    } catch (error) {
      console.error('Error fetching projects for client:', error);
      return [];
    }
  }

  async findOneForController(projectId: number, requester: any) {
    try {
      // Ensure requester and id field exist
      if (!requester || requester.id === undefined || requester.id === null) {
        console.error(`Invalid requester object:`, requester);
        return null;
      }
      
      const project = this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.id = ? AND p.controller_id = ?
      `, [projectId, requester.id]);

      return project[0] || null;
    } catch (error) {
      console.error(`Error fetching project ${projectId} for controller ${requester.id}:`, error);
      return null;
    }
  }
  
  async findOneForClient(projectId: number, requester: any) {
    try {
      // Ensure requester and id field exist
      if (!requester || requester.id === undefined || requester.id === null) {
        console.error(`Invalid requester object:`, requester);
        return null;
      }
      
      const project = this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.id = ? AND p.client_id = ?
      `, [projectId, requester.id]);

      return project[0] || null;
    } catch (error) {
      console.error(`Error fetching project ${projectId} for client ${requester.id}:`, error);
      return null;
    }
  }

  async findOne(id: number) {
    try {
      const project = this.databaseService.executeQuery(`
        SELECT 
          p.*,
          u.first_name || ' ' || u.last_name as client_name,
          c.first_name || ' ' || c.last_name as controller_name,
          s.name as service_name
        FROM projects p
        LEFT JOIN users u ON p.client_id = u.id
        LEFT JOIN users c ON p.controller_id = c.id
        LEFT JOIN services s ON p.service_id = s.id
        WHERE p.id = ?
      `, [id]);

      return project[0] || null;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  }

  async update(id: number, projectData: any, requester: any) {
    try {
      // Check if project exists
      const existingProject = await this.findOne(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }
  
      // Authorization checks
      if (requester.role === 'client') {
        // Clients can only update their own projects
        if (existingProject.client_id !== requester.id) {
          throw new Error('Clients can only update their own projects');
        }
        // Limit what clients can update
        const allowedFields = ['title', 'description', 'amount', 'amountDescription'];
        const requestedFields = Object.keys(projectData);
              
        // Filter out undefined/null values and only check fields that have actual values
        const fieldsWithValue = requestedFields.filter(field => projectData[field] !== undefined && projectData[field] !== null);
        const invalidFields = fieldsWithValue.filter(field => !allowedFields.includes(field));
              
        if (invalidFields.length > 0) {
          throw new Error(`Clients can only update: ${allowedFields.join(', ')}`);
        }
      } else if (requester.role !== 'admin' && requester.role !== 'controller') {
        throw new Error('Only admins, controllers, and project owners can update projects');
      }
  
      // Controllers can only update projects assigned to them
      if (requester.role === 'controller' && existingProject.controller_id !== requester.id) {
        throw new Error('Controllers can only update projects assigned to them');
      }
  
      // Build dynamic update query
      const fields: string[] = [];
      const values: any[] = [];
        
      if (projectData.title !== undefined) {
        fields.push('title = ?');
        values.push(projectData.title);
      }
        
      if (projectData.description !== undefined) {
        fields.push('description = ?');
        values.push(projectData.description);
      }
        
      if (projectData.serviceId !== undefined) {
        fields.push('service_id = ?');
        values.push(projectData.serviceId);
      }
        
      if (projectData.status !== undefined) {
        fields.push('status = ?');
        values.push(projectData.status);
      }
        
      if (projectData.progress !== undefined) {
        fields.push('progress = ?');
        values.push(projectData.progress);
      }
        
      if (projectData.startDate !== undefined) {
        fields.push('start_date = ?');
        values.push(projectData.startDate);
      }
        
      if (projectData.endDate !== undefined) {
        fields.push('end_date = ?');
        values.push(projectData.endDate);
      }
        
      if (projectData.amount !== undefined) {
        fields.push('amount = ?');
        values.push(projectData.amount);
      }
        
      if (projectData.amountDescription !== undefined) {
        fields.push('amount_description = ?');
        values.push(projectData.amountDescription);
      }
        
      // Always update the updated_at timestamp
      fields.push('updated_at = datetime(\'now\')');
        
      if (fields.length === 1) {
        // Only timestamp would be updated
        return existingProject;
      }
  
      values.push(id); // For the WHERE clause
  
      const updateQuery = `
        UPDATE projects 
        SET ${fields.join(', ')}
        WHERE id = ?
      `;
  
      this.databaseService.executeQuery(updateQuery, values);
  
      // Get the updated project
      const updatedProject = await this.findOne(id);
  
      // Send notifications for significant updates
      if (projectData.status || projectData.progress) {
        await this.sendProjectNotification(
          existingProject.client_id,
          'admin',
          'Project Updated',
          `Project "${existingProject.title}" has been updated.`
        );
  
        await this.sendProjectNotification(
          existingProject.client_id,
          'client',
          'Project Updated',
          `Your project "${existingProject.title}" has been updated.`
        );
  
        // Send notification to controller if assigned
        if (existingProject.controller_id) {
          await this.sendProjectNotification(
            existingProject.controller_id,
            'controller',
            'Project Updated',
            `Project "${existingProject.title}" has been updated.`
          );
        }
      }
  
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async remove(id: number, requester: any) {
    try {
      // Check if project exists
      const existingProject = await this.findOne(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Authorization check - admins and controllers can delete projects
      // Admins can delete any project
      // Controllers can only delete projects assigned to them
      if (requester.role !== 'admin' && requester.role !== 'controller') {
        throw new Error('Only admins and controllers can delete projects');
      }
      
      // If requester is a controller, they can only delete projects assigned to them
      if (requester.role === 'controller' && existingProject.controller_id !== requester.id) {
        throw new Error('Controllers can only delete projects assigned to them');
      }

      // Delete the project
      const result = this.databaseService.executeQuery(
        'DELETE FROM projects WHERE id = ?',
        [id]
      );

      if (result.changes > 0) {
        // Send notifications
        await this.sendProjectNotification(
          existingProject.client_id,
          'admin',
          'Project Deleted',
          `Project "${existingProject.title}" has been deleted.`
        );

        await this.sendProjectNotification(
          existingProject.client_id,
          'client',
          'Project Deleted',
          `Your project "${existingProject.title}" has been deleted.`
        );

        // Send notification to controller if assigned
        if (existingProject.controller_id) {
          await this.sendProjectNotification(
            existingProject.controller_id,
            'controller',
            'Project Deleted',
            `Project "${existingProject.title}" has been deleted.`
          );
        }

        return { message: 'Project deleted successfully', deleted: true };
      }

      return { message: 'Project not found', deleted: false };
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }

  async addProgress(projectId: number, progressData: any, requester: any) {
    try {
      // Check if project exists
      const existingProject = await this.findOne(projectId);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Authorization check
      if (requester.role !== 'admin' && requester.role !== 'controller') {
        throw new Error('Only admins and controllers can add progress');
      }

      // Controllers can only add progress to projects assigned to them
      if (requester.role === 'controller' && existingProject.controller_id !== requester.id) {
        throw new Error('Controllers can only add progress to projects assigned to them');
      }

      // Build dynamic update query for projects table
      const fields: string[] = [];
      const values: any[] = [];
      
      if (progressData.progress !== undefined) {
        fields.push('progress = ?');
        values.push(progressData.progress);
      }
      
      if (progressData.status !== undefined) {
        fields.push('status = ?');
        values.push(progressData.status);
      }
      
      // Always update the updated_at timestamp
      fields.push('updated_at = datetime(\'now\')');
      
      if (fields.length === 1) {
        // Only timestamp would be updated
        return existingProject;
      }

      values.push(projectId); // For the WHERE clause

      const updateQuery = `
        UPDATE projects 
        SET ${fields.join(', ')}
        WHERE id = ?
      `;

      this.databaseService.executeQuery(updateQuery, values);

      // Get the updated project
      const updatedProject = await this.findOne(projectId);

      // Send notifications
      await this.sendProjectNotification(
        existingProject.client_id,
        'admin',
        'Project Progress Updated',
        `Progress updated for project "${existingProject.title}".`
      );

      await this.sendProjectNotification(
        existingProject.client_id,
        'client',
        'Project Progress Updated',
        `Progress updated for your project "${existingProject.title}".`
      );

      // Send notification to controller if assigned
      if (existingProject.controller_id) {
        await this.sendProjectNotification(
          existingProject.controller_id,
          'controller',
          'Project Progress Updated',
          `Progress updated for project "${existingProject.title}".`
        );
      }

      return updatedProject;
    } catch (error) {
      console.error(`Error updating progress for project ${projectId}:`, error);
      throw error;
    }
  }

  async getProjectProgress(projectId: number) {
    try {
      const project = this.databaseService.executeQuery(`
        SELECT 
          id as projectId,
          progress,
          status,
          updated_at
        FROM projects 
        WHERE id = ?
      `, [projectId]);

      return project[0] || null;
    } catch (error) {
      console.error(`Error fetching progress for project ${projectId}:`, error);
      return null;
    }
  }

  async uploadProjectFile(projectId: number, fileData: any, requester: any) {
    try {
      // Check if project exists
      const existingProject = await this.findOne(projectId);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Authorization check
      // Controllers have already been validated in the controller layer
      const isAuthorized = requester.role === 'admin' || 
                          requester.role === 'controller' || // Allow controllers who passed controller layer validation
                          requester.id === existingProject.client_id;
      
      if (!isAuthorized) {
        throw new Error('Unauthorized to upload files for this project');
      }

      // Validate fileData exists and has required properties
      if (!fileData || !fileData.originalname) {
        throw new Error('File data is required for upload');
      }

      // Store file information in the project_files table
      const insertFile = this.databaseService.executeQuery(
        `INSERT INTO project_files (project_id, file_name, file_path, file_type, file_size, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          fileData.originalname,
          fileData.path || fileData.filename,
          fileData.mimetype,
          fileData.size,
          requester.id
        ]
      );

      // Send notifications
      await this.sendProjectNotification(
        existingProject.client_id,
        'admin',
        'Project File Uploaded',
        `New file uploaded for project "${existingProject.title}".`
      );

      await this.sendProjectNotification(
        existingProject.client_id,
        'client',
        'Project File Uploaded',
        `New file uploaded for your project "${existingProject.title}".`
      );

      // Send notification to controller if assigned
      if (existingProject.controller_id) {
        await this.sendProjectNotification(
          existingProject.controller_id,
          'controller',
          'Project File Uploaded',
          `New file uploaded for project "${existingProject.title}".`
        );
      }

      return { 
        message: 'File uploaded successfully', 
        projectId,
        fileId: insertFile.lastInsertRowid,
        fileInfo: {
          filename: fileData.originalname,
          path: fileData.path || fileData.filename,
          mimetype: fileData.mimetype,
          size: fileData.size,
          uploadedBy: requester.id,
          uploadedAt: new Date()
        }
      };
    } catch (error) {
      console.error(`Error uploading file for project ${projectId}:`, error);
      throw error;
    }
  }

  // Get all files for a project
  async getProjectFiles(projectId: number) {
    try {
      const files = this.databaseService.executeQuery(
        `SELECT pf.*, u.first_name, u.last_name 
         FROM project_files pf
         LEFT JOIN users u ON pf.uploaded_by = u.id
         WHERE pf.project_id = ?
         ORDER BY pf.uploaded_at DESC`,
        [projectId]
      );
      
      return files;
    } catch (error) {
      console.error(`Error fetching files for project ${projectId}:`, error);
      return [];
    }
  }
  
  // Get all files for a project (for controller - only if project is assigned to them)
  async getProjectFilesForController(projectId: number, requester: any) {
    try {
      // First verify that the project is assigned to this controller
      const project = await this.findOneForController(projectId, requester);
      if (!project) {
        throw new Error('Controller can only access files for projects assigned to them');
      }
      
      const files = this.databaseService.executeQuery(
        `SELECT pf.*, u.first_name, u.last_name 
         FROM project_files pf
         LEFT JOIN users u ON pf.uploaded_by = u.id
         WHERE pf.project_id = ?
         ORDER BY pf.uploaded_at DESC`,
        [projectId]
      );
      
      return files;
    } catch (error) {
      console.error(`Error fetching files for project ${projectId} by controller ${requester.id}:`, error);
      return [];
    }
  }

  // Delete a project file
  async deleteProjectFile(fileId: number, requester: any) {
    try {
      // Get the file info to check authorization
      const file = this.databaseService.executeQuery(
        'SELECT * FROM project_files WHERE id = ?',
        [fileId]
      );
      
      if (!file || file.length === 0) {
        throw new Error('File not found');
      }
      
      const fileRecord = file[0];
      
      // Authorization check
      if (requester.role !== 'admin' && 
          (requester.role !== 'controller' || requester.id !== fileRecord.uploaded_by) &&
          requester.id !== fileRecord.uploaded_by) {
        throw new Error('Unauthorized to delete this file');
      }
      
      // Delete the file record
      const result = this.databaseService.executeQuery(
        'DELETE FROM project_files WHERE id = ?',
        [fileId]
      );
      
      return {
        message: 'File deleted successfully',
        deleted: result.changes > 0
      };
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error);
      throw error;
    }
  }

  private async sendProjectNotification(userId: number, recipientRole: string, title: string, message: string) {
    try {
      let recipients: any[] = [];
      
      if (recipientRole === 'admin') {
        // Get all admins
        recipients = this.databaseService.executeQuery(
          "SELECT id FROM users WHERE role = 'admin'"
        );
      } else if (recipientRole === 'client') {
        // Get specific client
        recipients = [{ id: userId }];
      } else if (recipientRole === 'controller') {
        // Get specific controller
        recipients = [{ id: userId }];
      }

      for (const recipient of recipients) {
        await this.notificationsService.create({
          userId: recipient.id,
          title,
          message,
          type: NotificationType.PROJECT_UPDATE,
          isRead: false
        });
      }
    } catch (error) {
      console.error(`Error sending notification to ${recipientRole}:`, error);
    }
  }

  // Method to check if a user is related to a controller
  async isUserRelatedToController(userId: number, controllerId: number): Promise<boolean> {
    try {
      // First, get the user's projects
      const userProjects = this.databaseService.executeQuery(
        `SELECT p.id FROM projects p 
         JOIN users u ON p.client_id = u.id 
         WHERE u.id = ?`,
        [userId]
      );
      
      if (userProjects.length === 0) {
        return false;
      }
      
      // Check if any of the user's projects are assigned to the controller
      const projectIds = userProjects.map(p => p.id);
      const placeholders = projectIds.map(() => '?').join(',');
      
      const controllerProjects = this.databaseService.executeQuery(
        `SELECT id FROM projects 
         WHERE id IN (${placeholders}) AND controller_id = ?`,
        [...projectIds, controllerId]
      );
      
      console.log('Checked user-controller relationship', {
        userId,
        controllerId,
        isRelated: controllerProjects.length > 0
      });
      
      return controllerProjects.length > 0;
    } catch (error) {
      console.error(`Error checking user-controller relationship for user ${userId} and controller ${controllerId}:`, error);
      return false;
    }
  }
  
  // Update the requirement PDF field for a project
  async updateRequirementPdf(projectId: number, pdfPath: string, requester: any) {
    try {
      // Check if project exists
      const existingProject = await this.findOne(projectId);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Authorization check
      if (requester.role !== 'admin' && requester.role !== 'controller' && requester.role !== 'client') {
        throw new Error('Only admins, controllers, and project owners can update project requirement PDF');
      }

      // Controllers can only update projects assigned to them
      if (requester.role === 'controller' && existingProject.controller_id !== requester.id) {
        throw new Error('Controllers can only update requirement PDF for projects assigned to them');
      }
      
      // Clients can only update requirement PDF for their own projects
      if (requester.role === 'client' && existingProject.client_id !== requester.id) {
        throw new Error('Clients can only update requirement PDF for their own projects');
      }

      // Update the requirements_pdf field
      const updateQuery = `UPDATE projects SET requirements_pdf = ?, updated_at = datetime('now') WHERE id = ?`;
      this.databaseService.executeQuery(updateQuery, [pdfPath, projectId]);

      // Get the updated project
      const updatedProject = await this.findOne(projectId);
      
      // Send notification
      await this.sendProjectNotification(
        existingProject.client_id,
        'admin',
        'Project Requirement Updated',
        `New requirement document uploaded for project "${existingProject.title}".`
      );
      
      await this.sendProjectNotification(
        existingProject.client_id,
        'client',
        'Project Requirement Updated',
        `New requirement document uploaded for your project "${existingProject.title}".`
      );

      // Send notification to controller if assigned
      if (existingProject.controller_id) {
        await this.sendProjectNotification(
          existingProject.controller_id,
          'controller',
          'Project Requirement Updated',
          `New requirement document uploaded for project "${existingProject.title}".`
        );
      }

      return updatedProject;
    } catch (error) {
      console.error(`Error updating requirement PDF for project ${projectId}:`, error);
      throw error;
    }
  }
}