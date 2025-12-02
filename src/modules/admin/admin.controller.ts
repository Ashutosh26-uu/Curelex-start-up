import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Assign doctor to patient' })
  @Post('assign-doctor')
  @Roles(UserRole.ADMIN)
  assignDoctor(@Body() assignDoctorDto: AssignDoctorDto, @Request() req: any) {
    return this.adminService.assignDoctorToPatient(assignDoctorDto, req.user.id);
  }

  @ApiOperation({ summary: 'Unassign doctor from patient' })
  @Delete('assign-doctor/:doctorId/:patientId')
  @Roles(UserRole.ADMIN)
  unassignDoctor(
    @Param('doctorId') doctorId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.adminService.unassignDoctorFromPatient(doctorId, patientId);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, role, search);
  }

  @ApiOperation({ summary: 'Toggle user status' })
  @Patch('users/:id/toggle-status')
  @Roles(UserRole.ADMIN)
  toggleUserStatus(@Param('id') id: string) {
    return this.adminService.toggleUserStatus(id);
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Get system statistics' })
  @Get('stats')
  @Roles(UserRole.ADMIN)
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @ApiOperation({ summary: 'Get recent activity' })
  @Get('activity')
  @Roles(UserRole.ADMIN)
  getRecentActivity(@Query('limit') limit?: number) {
    return this.adminService.getRecentActivity(limit);
  }

  @ApiOperation({ summary: 'Get doctor-patient assignments' })
  @Get('assignments')
  @Roles(UserRole.ADMIN)
  getDoctorPatientAssignments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getDoctorPatientAssignments(page, limit);
  }
}