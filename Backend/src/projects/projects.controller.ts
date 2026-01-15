import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // If user is controller, only return projects assigned to them
    if (req.user.role === 'controller') {
      return this.projectsService.findProjectsByController(req.user.id);
    }
    // If user is client, only return their own projects
    if (req.user.role === 'client') {
      return this.projectsService.findProjectsByClient(req.user.id);
    }
    return this.projectsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // If user is controller, only allow access to assigned projects
    if (req.user.role === 'controller') {
      return this.projectsService.findOneForController(+id, req.user);
    }
    // If user is client, only allow access to their own projects
    if (req.user.role === 'client') {
      return this.projectsService.findOneForClient(+id, req.user);
    }
    return this.projectsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    return this.projectsService.update(+id, updateProjectDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(+id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/progress')
  addProgress(@Param('id') id: string, @Body() progressData: any, @Request() req) {
    return this.projectsService.addProgress(+id, progressData, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/progress')
  getProjectProgress(@Param('id') id: string) {
    return this.projectsService.getProjectProgress(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upload')
  uploadProjectFile(@Param('id') id: string, @Body() body: any, @Request() req) {
    // For backward compatibility, if fileData is passed in body, use it
    if (body && body.originalname) {
      return this.projectsService.uploadProjectFile(+id, body, req.user);
    }
    
    // Otherwise return an error indicating improper usage
    throw new Error('File data is required for upload');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/files')
  getProjectFiles(@Param('id') id: string, @Request() req) {
    // If user is controller, only allow access to assigned projects
    if (req.user.role === 'controller') {
      return this.projectsService.getProjectFilesForController(+id, req.user);
    }
    return this.projectsService.getProjectFiles(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/files/:fileId')
  deleteProjectFile(@Param('id') id: string, @Param('fileId') fileId: string, @Request() req) {
    return this.projectsService.deleteProjectFile(+fileId, req.user);
  }
}