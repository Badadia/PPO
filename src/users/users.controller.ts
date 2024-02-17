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
  Res,
  UseFilters,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Dto, UserQueryDto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import { Role } from './roles/roles.enum';
import { Roles } from './roles/roles.decorator';
import { OwnerChecker } from './roles/decorator/ownership.checker.decorator';
import { UserOwnershipChecker } from './owner/user.ownership.checker';
import { JwtAuth } from 'src/auth/decorator/jwt.auth.decorator';
import { Public } from 'src/auth/decorator/public.auth.decorator';
import { Response } from 'express';
import { CustomExceptionFilterUser } from './filters/user.custom-exception.filter';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@JwtAuth()
@OwnerChecker(UserOwnershipChecker)
@UseFilters(CustomExceptionFilterUser)
@SerializeOptions({
  exposeUnsetFields: false,
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Owner)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() registerDto: Dto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.register(registerDto);
    res.set('Authorization', 'Bearer ' + user.token);
    const { token, ...body } = user;
    return body;
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Owner)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() updateDto: DtoUpdate) {
    const updatedUser = await this.usersService.update(id, updateDto);
    return updatedUser;
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.usersService.remove(+id);
  }
}
