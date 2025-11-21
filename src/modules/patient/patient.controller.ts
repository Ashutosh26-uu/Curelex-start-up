import { Controller, Get, Post, Body, Patch, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @ApiOperation({ summary: 'Register new patient' })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  registerPatient(@Body() patientRegisterDto: PatientRegisterDto) {
    return this.patientService.registerPatient(patientRegisterDto);
  }

  @ApiOperation({ summary: 'Create patient profile' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.NURSE)
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @ApiOperation({ summary: 'Get all patients' })
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  findAll() {
    return this.patientService.findAll();
  }

  @ApiOperation({ summary: 'Get patient by ID' })
  @Get(':id')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @ApiOperation({ summary: 'Update patient profile' })
  @Patch(':id')
  @Roles(UserRole.PATIENT, UserRole.NURSE, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @ApiOperation({ summary: 'Get patient medical history' })
  @Get(':id/medical-history')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getMedicalHistory(@Param('id') id: string) {
    return this.patientService.getMedicalHistory(id);
  }

  @ApiOperation({ summary: 'Get patient past visits' })
  @Get(':id/past-visits')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getPastVisits(@Param('id') id: string) {
    return this.patientService.getPastVisits(id);
  }
}