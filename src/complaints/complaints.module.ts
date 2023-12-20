import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { complaintsProviders } from './complaints.providers';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { ComplaintOwnershipChecker } from './owner/complaint.ownership.checker';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ComplaintsController],
  providers: [
    ComplaintsService,
    ComplaintOwnershipChecker,
    ...complaintsProviders,
  ],
  exports: [ComplaintsService, ComplaintOwnershipChecker],
})
export class ComplaintsModule {}
