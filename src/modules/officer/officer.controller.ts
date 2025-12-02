import { Controller, Get, UseGuards, Query } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Get comprehensive dashboard' })
  @Get('dashboard')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO)
  getDashboard() {
    return this.officerService.getComprehensiveDashboard();
  }

  @ApiOperation({ summary: 'Get dashboard statistics' })
  @Get('stats')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO)
  getDashboardStats() {
    return this.officerService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Get appointment analytics' })
  @Get('analytics/appointments')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO)
  getAppointmentAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.officerService.getAppointmentAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @ApiOperation({ summary: 'Get patient analytics' })
  @Get('analytics/patients')
  @Roles(UserRole.CEO, UserRole.CTO, UserRole.CFO, UserRole.CMO)
  getPatientAnalytics() {
    return this.officerService.getPatientAnalytics();
  }

  @ApiOperation({ summary: 'Get revenue analytics' })
  @Get('analytics/revenue')
  @Roles(UserRole.CEO, UserRole.CFO)
  getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.officerService.getRevenueAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @ApiOperation({ summary: 'Get system health metrics' })
  @Get('system/health')
  @Roles(UserRole.CEO, UserRole.CTO)
  getSystemHealth() {
    return this.officerService.getSystemHealth();
  }
}