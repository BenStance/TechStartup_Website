import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { ProjectsModule } from '../projects/projects.module';
import { ShopModule } from '../shop/shop.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ProjectsModule,
    ShopModule,
    CommonModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}