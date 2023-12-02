import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './users/roles/roles.guard';
import { ServicesModule } from './services/services.module';
import { ComplaintsModule } from './complaints/complaints.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    ServicesModule,
    ComplaintsModule,
  ],
  controllers: [AppController],
  providers: [AppService, RolesGuard],
})
export class AppModule {}
