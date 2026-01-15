import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../config/jwt.config';
import { CommonModule } from '../common/common.module';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [
    CommonModule,
    ProjectsModule,
    UsersModule,
    ServicesModule,
    DatabaseModule,
    ShopModule,
    JwtModule.register({
      secret: JwtConfig.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}