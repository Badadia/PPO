import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuth } from 'src/auth/decorator/jwt.auth.decorator';
import { OwnerChecker } from 'src/users/roles/decorator/ownership.checker.decorator';
import { Role } from 'src/users/roles/roles.enum';
import { Roles } from 'src/users/roles/roles.decorator';
import { ServiceOwnershipChecker } from './owner/service.ownership.checker';
import { AuthUser } from 'src/auth/decorator/request.user.decorator';
import { UpdateServiceStatusDto } from './dto/updateServiceStatus.dto';

@JwtAuth()
@UseInterceptors(ClassSerializerInterceptor)
@OwnerChecker(ServiceOwnershipChecker)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() createServiceDto: CreateServiceDto,
    @AuthUser('id') userId: number,
  ) {
    return this.servicesService.create(createServiceDto, userId);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('/user/:id')
  findAllByUser(@Param('id') userId: number, @Req() req) {
    return this.servicesService.findOwnerServices(userId, req.user);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Owner)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Owner)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Patch('status/:id')
  @Roles(Role.Admin)
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateServiceStatusDto,
  ) {
    return this.servicesService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
