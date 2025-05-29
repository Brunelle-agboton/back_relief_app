import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramLineService } from './program-line.service';
import { CreateProgramLineDto } from './dto/create-program-line.dto';
import { UpdateProgramLineDto } from './dto/update-program-line.dto';

@Controller('program-line')
export class ProgramLineController {
  constructor(private readonly programLineService: ProgramLineService) {}

  @Post()
  create(@Body() createProgramLineDto: CreateProgramLineDto) {
    return this.programLineService.create(createProgramLineDto);
  }

  @Get()
  findAll() {
    return this.programLineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programLineService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramLineDto: UpdateProgramLineDto) {
    return this.programLineService.update(+id, updateProgramLineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programLineService.remove(+id);
  }
}
