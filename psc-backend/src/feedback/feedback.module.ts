import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { ActivityNotificationsModule } from 'src/activity-notifications/activity-notifications.module';

@Module({
    imports: [PrismaModule, NotificationModule, MailerModule, ActivityNotificationsModule],
    controllers: [FeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule { }
