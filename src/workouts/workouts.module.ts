import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { WorkoutsDashboardService } from './workouts-dashboard.service';

import { Workout, WorkoutSchema } from './workouts.schema';
import { Training, TrainingSchema } from '../trainings/schemas/training.schema';
import { TrainingCycle, TrainingCycleSchema } from '../trainings/schemas/training-cycle.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workout.name, schema: WorkoutSchema },
      { name: Training.name, schema: TrainingSchema },
      { name: TrainingCycle.name, schema: TrainingCycleSchema },
      { name: User.name, schema: UserSchema }, // ✅ para pegar weeklyGoalDays
    ]),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutsDashboardService],
  exports: [WorkoutsService, WorkoutsDashboardService],
})
export class WorkoutsModule {}
