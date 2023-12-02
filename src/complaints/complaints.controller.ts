import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { JwtAuth } from 'src/auth/decorator/jwt.auth.decorator';
import { OwnerChecker } from 'src/users/roles/decorator/ownership.checker.decorator';
import { ComplaintOwnershipChecker } from './owner/complaint.ownership.checker';
import { AuthUser } from 'src/auth/decorator/request.user.decorator';
import { Roles } from 'src/users/roles/roles.decorator';
import { Role } from 'src/users/roles/roles.enum';

@JwtAuth()
@UseInterceptors(ClassSerializerInterceptor)
@OwnerChecker(ComplaintOwnershipChecker)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() createComplaintDto: CreateComplaintDto,
    @AuthUser('id') userId: number,
  ) {
    return this.complaintsService.create(createComplaintDto, userId);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.complaintsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Owner)
  findOne(@Param('id') id: string) {
    return this.complaintsService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin, Role.Owner)
  update(
    @Param('id') id: string,
    @Body() updateComplaintDto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(+id, updateComplaintDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin, Role.Owner)
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(+id);
  }
}
