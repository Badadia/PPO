import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Dto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from './dto/dtoLogin';

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

  async register(createUserDto: Dto) {
    const hashedPassword = await this.hashPassword(createUserDto.senha);
    const user = this.userRepository.create({
      ...createUserDto,
      senha: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  public async login(
    loginDto: LoginDto,
  ): Promise<{ nome: string; jwtToken: string; email: string }> {
    const user = await this.findByEmail(loginDto.email);
    const match = await this.checkPassword(loginDto.senha, user);

    if (!match) {
      throw new NotFoundException('Invalid Credentials.');
    }
    const jwtToken = await this.authService.CreateAcessToken(
      user.id.toString(),
    );

    return {
      nome: user.nome,
      jwtToken,
      email: user.email,
    };
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  private async checkPassword(senha: string, user: User): Promise<boolean> {
    const match = await bcrypt.compare(senha, user.senha);

    if (!match) {
      throw new NotFoundException('Password not found.');
    }

    return match;
  }

  async update(id: string, updateUsersDto: DtoUpdate) {
    if (updateUsersDto.senha) {
      updateUsersDto.senha = await this.hashPassword(updateUsersDto.senha);
    }

    const user = await this.userRepository.preload({
      id: +id,
      ...updateUsersDto,
    });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }

    return this.userRepository.save(user);
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
}
