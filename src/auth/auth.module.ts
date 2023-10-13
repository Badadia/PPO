import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { usersProviders } from '../users/users.providers';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppBaseExceptionFilter } from 'src/users/roles/exception/filter/base.exception.filter';
import { AppValidationPipe } from './pipe/app.validation.pipe';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES,
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ...usersProviders,
    {
      provide: APP_PIPE,
      useClass: AppValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: AppBaseExceptionFilter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
