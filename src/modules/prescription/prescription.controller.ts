import { Controller, Get, Patch, Param, UseGuards, Request, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private prescriptionService: PrescriptionService) {}

  @ApiOperation({ summary: 'Get my prescriptions' })
  @Get('me')
  @Roles(UserRole.PATIENT)
  getMyPrescriptions(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.prescriptionService.getMyPrescriptions(req.user.id, status, page, limit);
  }

  @ApiOperation({ summary: 'Update prescription status' })
  @Patch(':id/status')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.prescriptionService.updateStatus(id, status);
  }
}