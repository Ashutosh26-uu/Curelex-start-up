import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
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
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @ApiOperation({ summary: 'Patient registration (public)' })
  @Post('register')
  async register(@Body() patientRegisterDto: PatientRegisterDto) {
    return this.patientService.registerPatient(patientRegisterDto);
  }

  @ApiOperation({ summary: 'Create patient' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @ApiOperation({ summary: 'Get all patients' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.JUNIOR_DOCTOR)
  @Get()
  async findAll() {
    return { data: await this.patientService.findAll() };
  }

  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @ApiOperation({ summary: 'Update patient' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @ApiOperation({ summary: 'Get patient medical history' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/medical-history')
  async getMedicalHistory(@Param('id') id: string) {
    return this.patientService.getMedicalHistory(id);
  }

  @ApiOperation({ summary: 'Get patient past visits' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/past-visits')
  async getPastVisits(@Param('id') id: string) {
    return this.patientService.getPastVisits(id);
  }
}