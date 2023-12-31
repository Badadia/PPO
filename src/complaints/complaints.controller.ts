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
  Req,
  UseFilters,
  UploadedFile,
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
import { UpdateComplaintStatusDto } from './dto/updateComplaintStatus.dto';
import { CustomExceptionFilterComplaint } from './filters/complaint.custom-exception.filter';
import { multerConfig } from 'src/multer-config';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileCleanupInterceptor } from 'src/services/filters/fileCleanupInterceptor.filter';

@JwtAuth()
@UseInterceptors(ClassSerializerInterceptor)
@OwnerChecker(ComplaintOwnershipChecker)
//@UseFilters(CustomExceptionFilterComplaint)
@UseInterceptors(FileCleanupInterceptor)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createComplaintDto: CreateComplaintDto,
    @AuthUser('id') userId: number,
  ) {
    return this.complaintsService.create(createComplaintDto, userId, file);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.complaintsService.findAll();
  }
  @Get('/user/:id')
  findAllByUser(@Param('id') userId: number, @Req() req) {
    return this.complaintsService.findOwnerComplaints(userId, req.user);
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

  @Patch('/:id/status')
  @Roles(Role.Admin)
  async updateStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.Admin, Role.Owner)
  remove(@Param('id') id: string) {
    return this.complaintsService.remove(+id);
  }
}
