import { JwtService } from '@nestjs/jwt';

export class JwtUtil {
  static async generateAccessToken(payload: any, secret: string): Promise<string> {
    const jwtService = new JwtService({ secret });
    return jwtService.signAsync(payload);
  }

  static async generateRefreshToken(payload: any, secret: string): Promise<string> {
    const jwtService = new JwtService({ secret });
    return jwtService.signAsync(payload);
  }

  static async verifyToken(token: string, secret: string): Promise<any> {
    const jwtService = new JwtService({ secret });
    return jwtService.verifyAsync(token);
  }
}