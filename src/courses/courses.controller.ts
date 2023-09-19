import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Dto } from './dto/dto';
import { DtoUpdate } from './dto/dto-update';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  create(@Body() createCourseDto: Dto) {
    return this.coursesService.create(createCourseDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: DtoUpdate) {
    this.coursesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.coursesService.remove(id);
  }
}
