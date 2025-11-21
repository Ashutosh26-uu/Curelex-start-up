import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @ApiOperation({ summary: 'Schedule appointment' })
  @Post()
  @Roles(UserRole.PATIENT, UserRole.NURSE, UserRole.ADMIN)
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @ApiOperation({ summary: 'Get all appointments' })
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  findAll() {
    return this.appointmentService.findAll();
  }

  @ApiOperation({ summary: 'Get appointment by ID' })
  @Get(':id')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @ApiOperation({ summary: 'Update appointment' })
  @Patch(':id')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @ApiOperation({ summary: 'Get upcoming appointments' })
  @Get('upcoming/me')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  getUpcomingAppointments(@Request() req) {
    return this.appointmentService.getUpcomingAppointments(req.user.id, req.user.role);
  }
}