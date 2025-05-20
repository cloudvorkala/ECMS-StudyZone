import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // Exporting MailService to be used in other modules
})
export class NotificationsModule {}
