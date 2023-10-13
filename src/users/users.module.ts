import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { usersProviders } from './users.providers';
import { AuthModule } from 'src/auth/auth.module';
import { UserOwnershipChecker } from './owner/user.ownership.checker';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService, ...usersProviders, UserOwnershipChecker],
  exports: [UsersService, UserOwnershipChecker],
})
export class UsersModule {}
