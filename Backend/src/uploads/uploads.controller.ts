import { Controller, Post, UseGuards, Request, UploadedFile, UseInterceptors, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from '../projects/projects.service';
import { ShopService } from '../shop/shop.service';
import { UploadsService } from './uploads.service';
import { diskStorage } from 'multer';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly shopService: ShopService,
    private readonly uploadsService: UploadsService,
  ) {}
  
  // Upload project requirement PDF
  @UseGuards(JwtAuthGuard)
  @Post('project/:projectId/requirement')
  @UseInterceptors(FileInterceptor('file', {
    storage: UploadsService.getStorageConfig('project-files'),
  }))
  async uploadProjectRequirement(
    @UploadedFile() file: Express.Multer.File,
    @Param('projectId') projectId: string,
    @Request() req,
  ) {
    // Admins, controllers, and clients can upload project requirements
    if (req.user.role !== 'admin' && req.user.role !== 'controller' && req.user.role !== 'client') {
      throw new Error('Only admins, controllers, and clients can upload project requirements');
    }
  
    // For controllers, they can only upload to projects they manage
    if (req.user.role === 'controller') {
      // Ensure user ID is available
      if (!req.user.id) {
        throw new Error('User information not available');
      }
      const project = await this.projectsService.findOneForController(+projectId, req.user);
      if (!project) {
        throw new Error('Controllers can only upload requirements to projects assigned to them');
      }
    }
    
    // For clients, they can only upload to their own projects
    if (req.user.role === 'client') {
      // Ensure user ID is available
      if (!req.user.id) {
        throw new Error('User information not available');
      }
      const project = await this.projectsService.findOneForClient(+projectId, req.user);
      if (!project) {
        throw new Error('Clients can only upload requirements to their own projects');
      }
    }
  
    // Validate file type (only PDFs are allowed)
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Only PDF files are allowed for project requirements');
    }
  
    // Process the file upload information
    const fileData = {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      projectId: +projectId,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };
  
    // Store file information in the project_files table
    const result = await this.projectsService.uploadProjectFile(+projectId, fileData, req.user);
    
    // Update the requirement_pdf field in the projects table
    await this.projectsService.updateRequirementPdf(+projectId, `/uploads/storage/project-files/${file.filename}`, req.user);
    
    return result;
  }
  
  // Upload product image
  @UseGuards(JwtAuthGuard)
  @Post('product/:productId/image')
  @UseInterceptors(FileInterceptor('file', {
    storage: UploadsService.getStorageConfig('images'),
  }))
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('productId') productId: string,
    @Request() req,
  ) {
    // Only admins and controllers can upload product images
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can upload product images');
    }
  
    // Process the file upload information
    const fileData = {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      productId: +productId,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };
  
    // Update the product with the image URL
    const updateProductDto = { imageUrl: `/uploads/storage/images/${file.filename}` };
    return await this.shopService.update(+productId, updateProductDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('project/:projectId')
  @UseInterceptors(FileInterceptor('file', {
    storage: UploadsService.getStorageConfig('project-files'),
  }))
  async uploadProjectFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('projectId') projectId: string,
    @Request() req,
    @Body() body: any
  ) {
    // Only admins and controllers can upload files to projects
    if (req.user.role !== 'admin' && req.user.role !== 'controller') {
      throw new Error('Only admins and controllers can upload files to projects');
    }

    // For controllers, they can only upload to projects they manage
    if (req.user.role === 'controller') {
      // Ensure user ID is available
      if (!req.user.id) {
        throw new Error('User information not available');
      }
      const project = await this.projectsService.findOneForController(+projectId, req.user);
      if (!project) {
        throw new Error('Controllers can only upload files to projects assigned to them');
      }
    }

      // Process the file upload information
    const fileData = {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      projectId: +projectId,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    // Store file information in the project
    return await this.projectsService.uploadProjectFile(+projectId, fileData, req.user);
  }
}

function uuidv4() {
  throw new Error('Function not implemented.');
}
