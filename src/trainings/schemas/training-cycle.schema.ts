import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrainingCycleDocument = TrainingCycle & Document;

@Schema({ timestamps: true })
export class TrainingCycle {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['active', 'archived'], default: 'active' })
  status: 'active' | 'archived';

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: false })
  endedAt?: Date;
}

export const TrainingCycleSchema = SchemaFactory.createForClass(TrainingCycle);
