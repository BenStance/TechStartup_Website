import axiosClient from './axiosClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

export interface AuthResponseWrapper {
  data: {
    access_token: string;
    role: string;
  };
  statusCode: number;
  message: string;
}

export interface AuthResponse {
  access_token: string;
  role: string;
}

class AuthApi {
  // User login
  async login(data: LoginRequest): Promise<AuthResponseWrapper> {
    const response = await axiosClient.post('/auth/login', data);
    return response.data;
  }

  // User registration
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  }

  // Verify OTP
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    const response = await axiosClient.post('/auth/verify-otp', data);
    return response.data;
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await axiosClient.post('/auth/forgot-password', data);
    return response.data;
  }

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await axiosClient.post('/auth/reset-password', data);
    return response.data;
  }

  // Logout
  async logout(): Promise<{ message: string }> {
    try {
      const response = await axiosClient.delete('/auth/logout');
      return response.data;
    } finally {
      // Always clear tokens from localStorage, even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
  }

  // Create user (admin only)
  async createUser(data: CreateUserRequest): Promise<{ message: string, user: any }> {
    const response = await axiosClient.post('/auth/create-user', data);
    return response.data;
  }
}

export default new AuthApi();