import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { FarmsService } from './farms.service';
import { CustomResponseInterceptor } from 'src/interceptors/api-response.interceptor';
import { ZodValidationPipe } from 'src/infrastructure/pipeline/validation.pipeline';
import { createFarmDto } from './dto/create-farm.dto';
import type { CreateFarmDto } from './dto/create-farm.dto';
import { AuthGuard, CurrentUser, Roles, RolesGuard } from 'src/app/auth';
import { RoleNameType } from 'src/interfaces/users';
import type { JwtPayload } from 'src/interfaces/users';
import { paginationDto } from 'src/infrastructure/helper/pagination.helper';
import type { UpdateFarmDto } from './dto/update-farm.dto';

@Controller('farms')
@UseInterceptors(CustomResponseInterceptor)
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)
  @UsePipes(new ZodValidationPipe(createFarmDto))
  create(@Body() dto: CreateFarmDto, @CurrentUser() user: JwtPayload) {
    return this.farmsService.create(dto, user.sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)
  @UsePipes(new ZodValidationPipe(paginationDto))
  findAll(@Body() dto: any) {
    return this.farmsService.findAll(dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)
  findOne(@Param('id') id: string) {
    return this.farmsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)
  update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmsService.update(+id, updateFarmDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleNameType.Admin)
  remove(@Param('id') id: string) {
    return this.farmsService.remove(+id);
  }
}
