import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Dto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<User>,
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

  async create(createUserDto: Dto) {
    const hashedPassword = await this.hashPassword(createUserDto.senha);
    const user = this.userRepository.create({
      ...createUserDto,
      senha: hashedPassword,
    });
    return this.userRepository.save(user);
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
