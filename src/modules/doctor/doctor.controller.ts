import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { ScheduleAppointmentDto } from './dto/schedule-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @ApiOperation({ summary: 'Create doctor profile' })
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @ApiOperation({ summary: 'Get doctor by ID' })
  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @ApiOperation({ summary: 'Get assigned patients' })
  @Get(':id/patients')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  getAssignedPatients(@Param('id') id: string) {
    return this.doctorService.getAssignedPatients(id);
  }

  @ApiOperation({ summary: 'Create prescription' })
  @Post('prescriptions')
  @Roles(UserRole.DOCTOR)
  createPrescription(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.doctorService.createPrescription(createPrescriptionDto);
  }

  @ApiOperation({ summary: 'Get visit history' })
  @Get(':id/visit-history')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  getVisitHistory(@Param('id') id: string) {
    return this.doctorService.getVisitHistory(id);
  }

  @ApiOperation({ summary: 'Get patient medical records' })
  @Get('patient/:id/records')
  @Roles(UserRole.DOCTOR, UserRole.JUNIOR_DOCTOR)
  getPatientRecords(@Param('id') patientId: string) {
    return this.doctorService.getPatientRecords(patientId);
  }

  @ApiOperation({ summary: 'Create prescription for patient' })
  @Post('patient/:id/prescription')
  @Roles(UserRole.DOCTOR)
  createPatientPrescription(
    @Param('id') patientId: string,
    @Body() createPrescriptionDto: Omit<CreatePrescriptionDto, 'patientId'>,
    @CurrentUser() user: any,
  ) {
    return this.doctorService.createPatientPrescription(patientId, createPrescriptionDto, user.id);
  }

  @ApiOperation({ summary: 'Schedule appointment' })
  @Post('appointment/schedule')
  @Roles(UserRole.DOCTOR)
  scheduleAppointment(
    @Body() scheduleAppointmentDto: ScheduleAppointmentDto,
    @CurrentUser() user: any,
  ) {
    return this.doctorService.scheduleAppointment(scheduleAppointmentDto, user.id);
  }
}