import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    JwtModule.register({
      secret: JwtConfig.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [],
  exports: [JwtModule],
})
export class CommonModule {}