import { PartialType } from '@nestjs/mapped-types';
import { Dto } from './dto';

export class DtoUpdate extends PartialType(Dto) {}
