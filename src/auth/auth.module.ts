import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { usersProviders } from '../users/users.providers';

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
  providers: [AuthService, JwtStrategy, ...usersProviders],
  exports: [AuthService],
})
export class AuthModule {}
