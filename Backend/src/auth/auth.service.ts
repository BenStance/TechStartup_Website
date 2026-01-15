import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashUtil } from '../common/utils/hash.util';
import { MailService } from './services/mail.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  // In-memory token blacklist (in production, use Redis or database)
  private static tokenBlacklist: Set<string> = new Set();
  
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
    private databaseService: DatabaseService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user: any = await this.usersService.findByEmail(email);
    if (user && await HashUtil.comparePasswords(password, user.password)) {
      // Check if user is verified
      if (!user.is_verified) {
        throw new UnauthorizedException('Please verify your email before logging in');
      }
      const { password: pwd, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.userId || user.id, 
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role
    };
  }

  async register(userData: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    
    // Hash password before saving
    const hashedPassword = await HashUtil.hashPassword(userData.password);
    const user: any = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      is_verified: 0, // Not verified initially
    });
    
    // Save OTP to database with 10-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    await this.databaseService.saveUserOTP(userData.email, otp, expiresAt);
    
    // Send OTP via email
    try {
      await this.mailService.sendOTP(userData.email, otp, 'Verify Your Email - Origin Technologies');
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Don't throw error here as we still want to register the user
    }
    
    // Don't return the user object until they verify their email
    return {
      message: 'Registration successful. Please check your email for verification.',
      email: userData.email,
    };
  }

  async verifyOTP(email: string, otp: string) {
    const isValid = await this.databaseService.verifyUserOTP(email, otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    
    // Get the verified user
    const user: any = await this.usersService.findByEmail(email);
    const { password: pwd, ...result } = user;
    
    // Generate JWT token for the verified user
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
      message: 'Email verified successfully'
    };
  }

  async forgotPassword(email: string) {
    // Check if user exists
    const user: any = await this.usersService.findByEmail(email);
    if (!user) {
      // We don't reveal if the email exists or not for security reasons
      return { message: 'If the email exists, an OTP has been sent.' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    
    // Save OTP to database with 10-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    await this.databaseService.saveUserOTP(email, otp, expiresAt);
    
    // Send OTP via email
    try {
      await this.mailService.sendOTP(email, otp, 'Password Reset - Origin Technologies');
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
      throw new Error('Failed to send password reset email');
    }
    
    return { message: 'Password reset OTP sent to your email' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // Verify OTP
    const isValid = await this.databaseService.verifyUserOTP(email, otp);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    
    // Hash new password
    const hashedPassword = await HashUtil.hashPassword(newPassword);
    
    // Update user password
    const updated = await this.databaseService.updateUserPassword(email, hashedPassword);
    if (!updated) {
      throw new BadRequestException('Failed to update password');
    }
    
    return { message: 'Password updated successfully' };
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      // Verify the token is valid before blacklisting
      const decoded = this.jwtService.verify(token);
      
      // Add token to blacklist with expiration time
      AuthService.tokenBlacklist.add(token);
      
      // Optional: Set a timeout to automatically remove the token after expiration
      const expiresInMs = decoded.exp * 1000 - Date.now();
      if (expiresInMs > 0) {
        setTimeout(() => {
          AuthService.tokenBlacklist.delete(token);
        }, expiresInMs);
      }
      
      return { message: 'Successfully logged out' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  
  // Method to check if a token is blacklisted
  static isTokenBlacklisted(token: string): boolean {
    return AuthService.tokenBlacklist.has(token);
  }

  async createUser(createUserDto: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password before saving
    const hashedPassword = await HashUtil.hashPassword(createUserDto.password);
    
    // Create user with is_verified = 1 (true) for admin-created users
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      is_verified: 1, // Mark as verified since admin is creating
    };
    
    const user: any = await this.usersService.create(userData);
    
    // Send email notification to the created user
    try {
      await this.mailService.sendEmail(
        createUserDto.email,
        'Account Created - Origin Technologies',
        `Hello ${createUserDto.firstName} ${createUserDto.lastName},

Your account has been created by an administrator. Please contact the admin for your login credentials.

Best regards,
Origin Technologies Team`
      );
    } catch (error) {
      console.error('Failed to send account creation notification email:', error);
      // Don't throw error here as the user was already created
    }
    
    // Return success response without sensitive information
    const { password: pwd, ...result } = user;
    return {
      message: 'User created successfully',
      user: result
    };
  }
}