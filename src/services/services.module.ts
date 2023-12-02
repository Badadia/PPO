import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { servicesProviders } from './services.providers';
import { ServiceOwnershipChecker } from './owner/service.ownership.checker';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ServicesController],
  providers: [ServicesService, ServiceOwnershipChecker, ...servicesProviders],
  exports: [ServicesService, ServiceOwnershipChecker],
})
export class ServicesModule {}
