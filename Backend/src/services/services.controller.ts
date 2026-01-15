import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    // Only admins can create services
    if (req.user.role !== 'admin') {
      throw new Error('Only admins can create services');
    }
    return await this.servicesService.create(createServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    // Admins, controllers, and clients can get all services
    if (req.user.role === 'admin' || req.user.role === 'controller' || req.user.role === 'client') {
      return await this.servicesService.findAll();
    }
    throw new Error('Unauthorized to access services');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    // Admins, controllers, and clients can get a specific service
    if (req.user.role === 'admin' || req.user.role === 'controller' || req.user.role === 'client') {
      return await this.servicesService.findOne(+id);
    }
    throw new Error('Unauthorized to access service');
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req) {
    // Only admins can update services
    if (req.user.role !== 'admin') {
      throw new Error('Only admins can update services');
    }
    return await this.servicesService.update(+id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    // Only admins can delete services
    if (req.user.role !== 'admin') {
      throw new Error('Only admins can delete services');
    }
    return await this.servicesService.remove(+id);
  }
}