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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Dto, UserQueryDto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles/roles.guard';
import { Role } from './roles/roles.enum';
import { Roles } from './roles/roles.decorator';
import { OwnerChecker } from './roles/decorator/ownership.checker.decorator';
import { UserOwnershipChecker } from './owner/user.ownership.checker';
import { JwtAuth } from 'src/auth/decorator/jwt.auth.decorator';
import { Public } from 'src/auth/decorator/public.auth.decorator';
import { Request, Response } from 'express';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@JwtAuth()
@OwnerChecker(UserOwnershipChecker)
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
  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: number, @Body() updateDto: DtoUpdate) {
    this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    this.usersService.remove(+id);
  }
}
