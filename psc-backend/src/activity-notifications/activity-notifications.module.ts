import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { ActivityNotificationsController } from './activity-notifications.controller';
import { ActivityNotificationsService } from './activity-notifications.service';

@Module({
  imports: [PrismaModule, RealtimeModule],
  controllers: [ActivityNotificationsController],
  providers: [ActivityNotificationsService],
  exports: [ActivityNotificationsService],
})
export class ActivityNotificationsModule {}
