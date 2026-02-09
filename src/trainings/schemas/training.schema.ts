import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrainingDocument = Training & Document;

@Schema({ _id: true })
export class Exercise {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 1 })
  sets: number;

  @Prop({ required: true, trim: true })
  reps: string;

  @Prop({ type: Number, required: false, min: 0 })
  targetWeight?: number;

  @Prop({ required: false, trim: true })
  technique?: string;

  @Prop({ required: true, min: 0 })
  order: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema({ timestamps: true })
export class Training {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: true, index: true })
  userId: string;

  // ✅ AGORA EXISTE DE VERDADE NO BANCO
  @Prop({ type: Types.ObjectId, ref: 'TrainingCycle', index: true, required: true })
  cycleId: Types.ObjectId;

  @Prop({ type: [ExerciseSchema], default: [] })
  exercises: Types.DocumentArray<Exercise>;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);
