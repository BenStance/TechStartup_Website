import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ServicesModule } from './services/services.module';
import { ShopModule } from './shop/shop.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadsModule } from './uploads/uploads.module';
import { LogsModule } from './logs/logs.module';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './roles/roles.module';
import { CommonModule } from './common/common.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    NotificationsModule,
    ServicesModule,
    ShopModule,
    DashboardModule,
    UploadsModule,
    LogsModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    RolesGuard,
  ],
})
export class AppModule {}