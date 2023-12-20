import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Dto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { Role } from './roles/roles.enum';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/models/jwt-payload.model';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }
    return user;
  }

  async register(createUserDto: Dto): Promise<{
    token: string;
    nome: string;
    email: string;
    telefone: number;
    id: any;
  }> {
    const { nome, telefone, email, senha } = createUserDto;
    if (!nome || !telefone || !email || !senha) {
      throw new UnprocessableEntityException('Validation problem');
    }
    const hashedPassword = await bcrypt.hash(senha, 10);

    if (senha.length < 6) {
      throw new UnprocessableEntityException(
        'A senha deve ter pelo menos 6 caracteres',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use!');
    }

    const user = await this.userRepository.create({
      nome,
      telefone,
      email,
      role: Role.User,
      senha: hashedPassword,
    });

    await this.userRepository.save(user);

    const { token } = this.authService.generateToken({
      id: user.id,
      nome: user.nome,
      role: user.role,
    });
    return { token, nome, telefone, id: user.id, email };
  }

  async update(id: number, updateUsersDto: DtoUpdate) {
    if (updateUsersDto.senha) {
      updateUsersDto.senha = await this.hashPassword(updateUsersDto.senha);
    }

    const updateResult = await this.userRepository.update(id, updateUsersDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: id } });
    return user;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    return this.userRepository.remove(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: jwtPayload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user;
  }

  private static jwtExtractor(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new BadRequestException('Bad request.');
    }
    const [, token] = authHeader.split(' ');
    return token;
  }

  public returnJwtExtractor(): (request: Request) => string {
    return UsersService.jwtExtractor;
  }
}
