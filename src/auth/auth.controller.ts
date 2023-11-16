import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LoginAuth } from './decorator/login.auth.decorator';
import { JwtAuth } from './decorator/jwt.auth.decorator';
import { Public } from './decorator/public.auth.decorator';

@ApiTags('Login')
@Controller('login')
@JwtAuth()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @LoginAuth()
  @Post()
  async peformLogin(@Req() req, @Res({ passthrough: true }) res: Response) {
    const login = await this.authService.generateToken(req.user);
    res.set('Authorization', login.token);
    res.set('Access-Control-Expose-Headers', 'Authorization');
    return req.user;
  }

  @Get()
  getProfile(@Req() req) {
    return req.user;
  }
}
