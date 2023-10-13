import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { JwtPayload } from './models/jwt-payload.model';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {}

  public async CreateAcessToken(userId: string): Promise<string> {
    return sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User> {
    const userId = +jwtPayload.userId;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  private static JwtExtractor(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException('Bad request');
    }

    const [, token] = authHeader.split(' ');

    return token;
  }

  public returnJwtExtractor(): (request: Request) => string {
    return AuthService.JwtExtractor;
  }
}
