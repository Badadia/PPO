import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/users/dto/dtoLogin';
import { Role } from 'src/users/roles/roles.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(user: any) {
    const token = this.jwtService.sign({
      sub: user.id,
      nome: user.nome,
      role: user.role,
    });

    return { token };
  }

  public async CreateAcessToken(userId: string): Promise<string> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtExpires = this.configService.get<string>('JWT_EXPIRES');
    return sign({ userId }, jwtSecret, {
      expiresIn: jwtExpires,
    });
  }

  public async validateUser(
    loginDto: LoginDto,
  ): Promise<{ nome: string; id: any; email: string; role: Role }> {
    const { email, senha } = loginDto;
    const login = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!login || !(await bcrypt.compare(senha, login.senha))) {
      throw new UnauthorizedException('Senha ou email incorretos!');
    }

    return {
      id: login.id,
      nome: login.nome,
      email: login.email,
      role: login.role,
    };
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

  async getById(id: any) {
    const user = await this.userRepository.findOne(id);
    return user;
  }
}
