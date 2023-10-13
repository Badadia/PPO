import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Dto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import { LoginDto } from './dto/dtoLogin';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: Dto) {
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ nome: string; jwtToken: string; email: string }> {
    return this.usersService.login(loginDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: DtoUpdate) {
    this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.usersService.remove(+id);
  }
}
