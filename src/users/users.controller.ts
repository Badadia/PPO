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
  Query,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Dto, UserQueryDto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import { LoginDto } from './dto/dtoLogin';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles/roles.guard';
import { Role } from './roles/roles.enum';
import { Roles } from './roles/roles.decorator';
import { OwnerChecker } from './roles/decorator/ownership.checker.decorator';
import { UserOwnershipChecker } from './owner/user.ownership.checker';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  exposeUnsetFields: false,
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin, Role.Owner)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll(@Query() query: UserQueryDto) {
    //todo: transformar a query em filtro e passar como paratero no userService.findAll
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Owner)
  @OwnerChecker(UserOwnershipChecker)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() updateDto: DtoUpdate) {
    this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    this.usersService.remove(+id);
  }
}
