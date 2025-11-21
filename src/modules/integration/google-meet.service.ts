import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleMeetService {
  private calendar;

  constructor(private configService: ConfigService) {
    const auth = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async createMeeting(options: {
    summary: string;
    startTime: string;
    duration: number;
  }): Promise<string> {
    try {
      const startTime = new Date(options.startTime);
      const endTime = new Date(startTime.getTime() + options.duration * 60000);

      const event = {
        summary: options.summary,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      return response.data.conferenceData?.entryPoints?.[0]?.uri || 'https://meet.google.com/';
    } catch (error) {
      console.error('Google Meet creation failed:', error);
      return 'https://meet.google.com/'; // Fallback URL
    }
  }
}