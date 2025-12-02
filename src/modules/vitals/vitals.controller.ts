import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VitalsService } from './vitals.service';
import { CreateVitalDto } from './dto/create-vital.dto';
import { UpdateVitalsDto } from './dto/update-vitals.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Vitals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vitals')
export class VitalsController {
  constructor(private vitalsService: VitalsService) {}

  @ApiOperation({ summary: 'Record vital signs' })
  @Post()
  @Roles(UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE)
  create(@Body() createVitalDto: CreateVitalDto, @Request() req: any) {
    return this.vitalsService.create(createVitalDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get patient vitals' })
  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getPatientVitals(
    @Param('patientId') patientId: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.vitalsService.findPatientVitals(patientId, type, page, limit);
  }

  @ApiOperation({ summary: 'Get latest vitals for patient' })
  @Get('patient/:patientId/latest')
  @Roles(UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getLatestVitals(@Param('patientId') patientId: string) {
    return this.vitalsService.getLatestVitals(patientId);
  }

  @ApiOperation({ summary: 'Update vital record' })
  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE)
  update(
    @Param('id') id: string,
    @Body() updateVitalsDto: UpdateVitalsDto,
    @Request() req: any,
  ) {
    return this.vitalsService.update(id, updateVitalsDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get patient vital history' })
  @Get('patient/:patientId/history')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getPatientVitalHistory(
    @Param('patientId') patientId: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.vitalsService.findPatientVitals(patientId, type, page, limit);
  }

  @ApiOperation({ summary: 'Delete vital record' })
  @Delete(':id')
  @Roles(UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  delete(@Param('id') id: string, @Request() req: any) {
    return this.vitalsService.delete(id, req.user.id);
  }
}