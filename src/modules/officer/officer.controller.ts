import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OfficerService } from './officer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Executive Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('officer')
export class OfficerController {
  constructor(private officerService: OfficerService) {}

  @ApiOperation({ summary: 'CEO Dashboard - Complete access' })
  @Get('ceo-dashboard')
  @Roles(UserRole.CEO, UserRole.FOUNDER, UserRole.BOD)
  getCEODashboard() {
    return this.officerService.getCEODashboard();
  }

  @ApiOperation({ summary: 'COO Dashboard - Operations + Earnings + Legal' })
  @Get('coo-dashboard')
  @Roles(UserRole.COO, UserRole.CEO, UserRole.FOUNDER)
  getCOODashboard() {
    return this.officerService.getCOODashboard();
  }

  @ApiOperation({ summary: 'CTO Dashboard - Technical + Operations' })
  @Get('cto-dashboard')
  @Roles(UserRole.CTO, UserRole.CEO, UserRole.FOUNDER)
  getCTODashboard() {
    return this.officerService.getCTODashboard();
  }

  @ApiOperation({ summary: 'CFO Dashboard - Financial + Earnings' })
  @Get('cfo-dashboard')
  @Roles(UserRole.CFO, UserRole.CEO, UserRole.FOUNDER)
  getCFODashboard() {
    return this.officerService.getCFODashboard();
  }

  @ApiOperation({ summary: 'CLO Dashboard - Legal + Operations' })
  @Get('clo-dashboard')
  @Roles(UserRole.CLO, UserRole.CEO, UserRole.FOUNDER)
  getCLODashboard() {
    return this.officerService.getCLODashboard();
  }

  @ApiOperation({ summary: 'CXO Schedule - All executives visibility' })
  @Get('cxo-schedule')
  @Roles(UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.CFO, UserRole.CLO, UserRole.FOUNDER)
  getCXOSchedule() {
    return this.officerService.getCXOSchedule();
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

  @ApiOperation({ summary: 'Daily earnings - CEO, COO, CFO only' })
  @Get('analytics/earnings')
  @Roles(UserRole.CEO, UserRole.COO, UserRole.CFO, UserRole.FOUNDER)
  getDailyEarnings(
    @Query('date') date?: string
  ) {
    return this.officerService.getDailyEarnings(
      date ? new Date(date) : new Date()
    );
  }

  @ApiOperation({ summary: 'Legal matters - CEO, COO, CLO only' })
  @Get('analytics/legal')
  @Roles(UserRole.CEO, UserRole.COO, UserRole.CLO, UserRole.FOUNDER)
  getLegalMatters() {
    return this.officerService.getLegalMatters();
  }

  @ApiOperation({ summary: 'Daily operations - All CXOs' })
  @Get('analytics/operations')
  @Roles(UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.FOUNDER)
  getDailyOperations(
    @Query('date') date?: string
  ) {
    return this.officerService.getDailyOperations(
      date ? new Date(date) : new Date()
    );
  }

  @ApiOperation({ summary: 'Patient portal access - Owner view' })
  @Get('patient-portal-access')
  @Roles(UserRole.CEO, UserRole.FOUNDER, UserRole.BOD)
  getPatientPortalAccess() {
    return this.officerService.getPatientPortalOwnerView();
  }

  @ApiOperation({ summary: 'Get system health metrics' })
  @Get('system/health')
  @Roles(UserRole.CEO, UserRole.CTO)
  getSystemHealth() {
    return this.officerService.getSystemHealth();
  }
}