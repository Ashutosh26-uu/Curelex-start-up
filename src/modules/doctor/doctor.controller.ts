import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @ApiOperation({ summary: 'Get all doctors' })
  @Get()
  @Roles(UserRole.PATIENT)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('specialization') specialization?: string,
  ) {
    return this.doctorService.findAll(page, limit, specialization);
  }

  @ApiOperation({ summary: 'Get doctor profile' })
  @Get('me')
  @Roles(UserRole.DOCTOR)
  getMyProfile(@Request() req: any) {
    return this.doctorService.findByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Get doctor by ID' })
  @Get(':id')
  @Roles(UserRole.PATIENT)
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @ApiOperation({ summary: 'Get assigned patients' })
  @Get(':id/patients')
  @Roles(UserRole.DOCTOR)
  getAssignedPatients(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.doctorService.getAssignedPatients(id, page, limit);
  }

  @ApiOperation({ summary: 'Create prescription' })
  @Post('prescriptions')
  @Roles(UserRole.DOCTOR)
  createPrescription(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @Request() req: any,
  ) {
    return this.doctorService.createPrescription(createPrescriptionDto, req.user.id);
  }

  @ApiOperation({ summary: 'Get visit history' })
  @Get(':id/visit-history')
  @Roles(UserRole.DOCTOR)
  getVisitHistory(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.doctorService.getVisitHistory(id, page, limit);
  }

  @ApiOperation({ summary: 'Get doctor statistics' })
  @Get(':id/stats')
  @Roles(UserRole.DOCTOR)
  getDoctorStats(@Param('id') id: string) {
    return this.doctorService.getDoctorStats(id);
  }

  @ApiOperation({ summary: 'Update availability' })
  @Patch(':id/availability')
  @Roles(UserRole.DOCTOR)
  updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.doctorService.updateAvailability(id, isAvailable);
  }
}