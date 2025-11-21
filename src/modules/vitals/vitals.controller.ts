import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VitalsService } from './vitals.service';
import { CreateVitalDto } from './dto/create-vital.dto';
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
  @Roles(UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.DOCTOR)
  create(@Body() createVitalDto: CreateVitalDto) {
    return this.vitalsService.create(createVitalDto);
  }

  @ApiOperation({ summary: 'Get patient vitals' })
  @Get('patient/:patientId')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  findByPatient(@Param('patientId') patientId: string) {
    return this.vitalsService.findByPatient(patientId);
  }

  @ApiOperation({ summary: 'Get latest vitals for patient' })
  @Get('patient/:patientId/latest')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getLatestVitals(@Param('patientId') patientId: string) {
    return this.vitalsService.getLatestVitals(patientId);
  }

  @ApiOperation({ summary: 'Get vital history by type' })
  @Get('patient/:patientId/history')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getVitalHistory(
    @Param('patientId') patientId: string,
    @Query('type') type: string,
  ) {
    return this.vitalsService.getVitalHistory(patientId, type);
  }
}