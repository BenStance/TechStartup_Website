import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtConfig } from '../../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtConfig.secret,
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy validate payload:', payload);
    console.log('JWT Strategy payload.sub:', payload.sub);
    console.log('JWT Strategy payload.email:', payload.email);
    console.log('JWT Strategy payload.role:', payload.role);
    const user = { id: payload.sub, email: payload.email, role: payload.role };
    console.log('JWT Strategy returning user object:', user);
    return user;
  }
}