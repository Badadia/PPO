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

  @Get(':id')
  @Roles(Role.Admin, Role.Owner)
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
