import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';

import { Training, TrainingSchema } from './schemas/training.schema';
import {
  TrainingCycle,
  TrainingCycleSchema,
} from './schemas/training-cycle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Training.name, schema: TrainingSchema },
      { name: TrainingCycle.name, schema: TrainingCycleSchema },
    ]),
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [MongooseModule],
})
export class TrainingsModule {}
