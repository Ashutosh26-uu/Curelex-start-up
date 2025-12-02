import { Module } from '@nestjs/common';
import { GoogleMeetService } from './google-meet.service';
import { IntegrationController } from './integration.controller';

@Module({
  controllers: [IntegrationController],
  providers: [GoogleMeetService],
  exports: [GoogleMeetService],
})
export class IntegrationModule {}