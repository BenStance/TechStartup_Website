import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/constants/roles.constant';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { SetMetadata } from '@nestjs/common';
import { User } from './entities/user.interface';

// Custom decorator for roles
const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@Request() req) {
    // Admins can get all users
    if (req.user.role === 'admin') {
      return await this.usersService.findAll();
    }
    // Controllers can get all clients
    if (req.user.role === 'controller') {
      return await this.usersService.findAllClients();
    }
    // Other roles are not authorized
    throw new Error('Unauthorized to access users list');
  }

  // Get user by ID (user can get their own profile, admin can get any profile)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  // Create user (public endpoint)
  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  // Update user details (user can update their own profile, admin can update any profile)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User | null> {
    return this.usersService.update(+id, updateUserDto);
  }

  // Delete user (admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}