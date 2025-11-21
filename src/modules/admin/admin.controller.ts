import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
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
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'Assign doctor to patient' })
  @Post('assign-doctor')
  assignDoctorToPatient(@Body() assignDoctorDto: AssignDoctorDto) {
    return this.adminService.assignDoctorToPatient(assignDoctorDto);
  }

  @ApiOperation({ summary: 'Unassign doctor from patient' })
  @Post('unassign-doctor')
  unassignDoctorFromPatient(@Body() body: { doctorId: string; patientId: string }) {
    return this.adminService.unassignDoctorFromPatient(body.doctorId, body.patientId);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  @ApiOperation({ summary: 'Activate user' })
  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  @ApiOperation({ summary: 'Get doctor assignments' })
  @Get('doctor-assignments')
  getDoctorAssignments() {
    return this.adminService.getDoctorAssignments();
  }

  @ApiOperation({ summary: 'Get system statistics' })
  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }
}