import { PartialType } from '@nestjs/swagger';
import { CreateProgramLineDto } from './create-program-line.dto';

export class UpdateProgramLineDto extends PartialType(CreateProgramLineDto) {}
