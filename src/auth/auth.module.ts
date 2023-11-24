import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { usersProviders } from '../users/users.providers';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AppBaseExceptionFilter } from 'src/users/roles/exception/filter/base.exception.filter';
import { AppValidationPipe } from './pipe/app.validation.pipe';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategy/local.startegy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES,
      },
    }),
    DatabaseModule,
    AuthModule,
    PassportModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    UsersService,
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
  controllers: [AuthController],
})
export class AuthModule {}
