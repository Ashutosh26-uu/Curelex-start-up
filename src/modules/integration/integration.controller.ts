import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleMeetService } from './google-meet.service';
import { Response } from 'express';

@ApiTags('Integration')
@Controller('integration')
export class IntegrationController {
  constructor(private googleMeetService: GoogleMeetService) {}

  @ApiOperation({ summary: 'Get Google OAuth URL' })
  @Get('google/auth')
  async getGoogleAuthUrl() {
    const authUrl = await this.googleMeetService.getAuthUrl();
    return { authUrl };
  }

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @Get('google/callback')
  async handleGoogleCallback(@Query('code') code: string, @Res() res: Response) {
    const result = await this.googleMeetService.handleCallback(code);
    
    if (result.success) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?google_auth=success`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?google_auth=error`);
    }
  }
}