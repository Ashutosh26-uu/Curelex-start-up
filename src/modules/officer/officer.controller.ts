import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OfficerService } from './officer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Officer Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('officer')
export class OfficerController {
  constructor(private officerService: OfficerService) {}

  @ApiOperation({ summary: 'Get dashboard analytics' })
  @Get('dashboard')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getDashboardAnalytics() {
    return this.officerService.getDashboardAnalytics();
  }

  @ApiOperation({ summary: 'Get appointment analytics' })
  @Get('analytics/appointments')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getAppointmentAnalytics() {
    return this.officerService.getAppointmentAnalytics();
  }

  @ApiOperation({ summary: 'Get patient analytics' })
  @Get('analytics/patients')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getPatientAnalytics() {
    return this.officerService.getPatientAnalytics();
  }

  @ApiOperation({ summary: 'Get doctor analytics' })
  @Get('analytics/doctors')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getDoctorAnalytics() {
    return this.officerService.getDoctorAnalytics();
  }

  @ApiOperation({ summary: 'Get total patients today' })
  @Get('metrics/patients-today')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getPatientsToday() {
    return this.officerService.getPatientsToday();
  }

  @ApiOperation({ summary: 'Get pending assignments' })
  @Get('metrics/pending-assignments')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getPendingAssignments() {
    return this.officerService.getPendingAssignments();
  }

  @ApiOperation({ summary: 'Get doctor performance metrics' })
  @Get('metrics/doctor-performance')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getDoctorPerformance() {
    return this.officerService.getDoctorPerformance();
  }

  @ApiOperation({ summary: 'Get appointment completion trends' })
  @Get('metrics/completion-trends')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getCompletionTrends() {
    return this.officerService.getCompletionTrends();
  }

  @ApiOperation({ summary: 'Get alerts and escalations' })
  @Get('metrics/alerts')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO, UserRole.ADMIN)
  getAlerts() {
    return this.officerService.getAlerts();
  }
}