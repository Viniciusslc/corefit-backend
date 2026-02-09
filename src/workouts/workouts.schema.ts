import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class WorkoutSetPerformed {
  @Prop({ type: Number, default: 0, min: 0 })
  reps: number;

  @Prop({ type: Number, default: 0, min: 0 })
  weight: number;
}

export const WorkoutSetPerformedSchema =
  SchemaFactory.createForClass(WorkoutSetPerformed);

@Schema({ _id: false })
export class WorkoutPerformedExercise {
  @Prop({ type: String, required: true })
  exerciseName: string;

  @Prop({ type: Number, required: true, min: 0 })
  order: number;

  @Prop({ type: Number, default: 0, min: 0 })
  targetWeight?: number;

  @Prop({ type: [WorkoutSetPerformedSchema], default: [] })
  setsPerformed: WorkoutSetPerformed[];
}

export const WorkoutPerformedExerciseSchema =
  SchemaFactory.createForClass(WorkoutPerformedExercise);

@Schema({ _id: false })
export class WorkoutExerciseSnapshot {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  sets: number;

  @Prop({ type: String, required: true })
  reps: string;

  @Prop({ type: Number, min: 0 })
  order?: number;

  @Prop({ type: String })
  technique?: string;

  @Prop({ type: Number, min: 0 })
  targetWeight?: number;
}

export const WorkoutExerciseSnapshotSchema =
  SchemaFactory.createForClass(WorkoutExerciseSnapshot);

@Schema({ timestamps: true })
export class Workout {
  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  trainingId: Types.ObjectId;

  // ✅ NOVO: ciclo do treino no momento que iniciou
  @Prop({ type: Types.ObjectId, index: true, default: null })
  cycleId?: Types.ObjectId | null;

  @Prop({ type: String, default: 'active', index: true })
  status: 'active' | 'finished';

  @Prop({ type: Date, default: null })
  startedAt?: Date;

  @Prop({ type: Date, default: null })
  finishedAt?: Date;

  @Prop({ type: String, required: true })
  trainingName: string;

  @Prop({ type: [WorkoutExerciseSnapshotSchema], default: [] })
  exercisesSnapshot: WorkoutExerciseSnapshot[];

  @Prop({ type: [WorkoutPerformedExerciseSchema], default: [] })
  performedExercises: WorkoutPerformedExercise[];
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);

// index útil p/ dashboard
WorkoutSchema.index({ userId: 1, cycleId: 1, status: 1, finishedAt: -1 });
