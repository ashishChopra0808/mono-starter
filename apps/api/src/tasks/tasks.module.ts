import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { SessionPruningService } from './session-pruning.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SessionPruningService],
})
export class TasksModule {}
