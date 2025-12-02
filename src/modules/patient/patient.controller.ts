import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @ApiOperation({ summary: 'Register new patient' })
  @Post('register')
  register(@Body() patientData: any) {
    return this.patientService.registerPatient(patientData);
  }

  @ApiOperation({ summary: 'Get all patients' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN, UserRole.CEO, UserRole.CMO)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.patientService.findAll(page, limit, search);
  }

  @ApiOperation({ summary: 'Get patient profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  @Roles(UserRole.PATIENT)
  getMyProfile(@Request() req: any) {
    return this.patientService.findByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN, UserRole.CEO, UserRole.CMO)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @ApiOperation({ summary: 'Update patient' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @ApiOperation({ summary: 'Get patient medical history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/medical-history')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getMedicalHistory(@Param('id') id: string) {
    return this.patientService.getMedicalHistory(id);
  }

  @ApiOperation({ summary: 'Add medical history entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/medical-history')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  addMedicalHistory(
    @Param('id') id: string,
    @Body() historyData: {
      condition: string;
      diagnosis: string;
      treatment?: string;
      severity?: string;
      diagnosedAt: string;
    },
  ) {
    return this.patientService.addMedicalHistory(id, {
      ...historyData,
      diagnosedAt: new Date(historyData.diagnosedAt),
    });
  }

  @ApiOperation({ summary: 'Get patient past visits' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/past-visits')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getPastVisits(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.patientService.getPastVisits(id, page, limit);
  }
}