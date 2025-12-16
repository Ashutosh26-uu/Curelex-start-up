import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @ApiOperation({ summary: 'Self registration by patient with phone-based unique ID' })
  @Public()
  @Post('self-register')
  selfRegister(@Body() patientData: any) {
    return this.patientService.selfRegisterPatient(patientData);
  }

  @ApiOperation({ summary: 'Assisted registration by junior doctor' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('assisted-register')
  @Roles(UserRole.DOCTOR)
  assistedRegister(@Body() patientData: any, @Request() req: any) {
    return this.patientService.assistedRegisterPatient(patientData, req.user.id);
  }

  @ApiOperation({ summary: 'Legacy registration endpoint' })
  @Public()
  @Post('register')
  register(@Body() patientData: any) {
    return this.patientService.registerPatient(patientData);
  }

  @ApiOperation({ summary: 'Get all patients' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.DOCTOR)
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
  async getMyProfile(@Request() req: any) {
    // Validate session and user access
    if (!req.user?.patient?.id) {
      throw new UnauthorizedException('Patient profile not found');
    }
    return this.patientService.findByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Get patient by phone-based unique ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('by-phone/:phoneId')
  @Roles(UserRole.DOCTOR)
  findByPhoneId(@Param('phoneId') phoneId: string) {
    return this.patientService.findByPhoneId(phoneId);
  }

  @ApiOperation({ summary: 'Update medical details after registration' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':patientId/medical-details')
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  updateMedicalDetails(
    @Param('patientId') patientId: string,
    @Body() medicalData: any
  ) {
    return this.patientService.updateMedicalDetails(patientId, medicalData);
  }

  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.DOCTOR)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @ApiOperation({ summary: 'Update patient' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @ApiOperation({ summary: 'Get patient medical history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/medical-history')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  async getMedicalHistory(@Param('id') id: string, @Request() req: any) {
    // Patients can only access their own medical history
    if (req.user.role === UserRole.PATIENT) {
      if (req.user.patient?.id !== id) {
        throw new ForbiddenException('Access denied to medical history');
      }
    }
    
    // Doctors can only access assigned patients' history
    if (req.user.role === UserRole.DOCTOR) {
      const hasAccess = await this.patientService.verifyDoctorPatientAccess(req.user.doctor.id, id);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied to patient medical history');
      }
    }
    
    return this.patientService.getMedicalHistory(id);
  }

  @ApiOperation({ summary: 'Add medical history entry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/medical-history')
  @Roles(UserRole.DOCTOR)
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
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  async getPastVisits(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req: any
  ) {
    // Validate access permissions
    if (req.user.role === UserRole.PATIENT && req.user.patient?.id !== id) {
      throw new ForbiddenException('Access denied to visit history');
    }
    
    if (req.user.role === UserRole.DOCTOR) {
      const hasAccess = await this.patientService.verifyDoctorPatientAccess(req.user.doctor.id, id);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied to patient visit history');
      }
    }
    
    return this.patientService.getPastVisits(id, page, limit);
  }
}