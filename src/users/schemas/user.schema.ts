import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export type Gender = 'male' | 'female' | 'other';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  // ✅ meta semanal
  @Prop({ type: Number, default: 4, min: 1, max: 7 })
  weeklyGoalDays: number;

  // ✅ PERFIL (novos campos)
  @Prop({ type: String, enum: ['male', 'female', 'other'], default: 'other' })
  gender: Gender;

  @Prop({ type: Number, min: 0, default: null })
  weightKg?: number | null;

  @Prop({ type: Number, min: 0, default: null })
  heightCm?: number | null;

  // ✅ por enquanto via URL (depois a gente faz upload real)
  @Prop({ type: String, default: '' })
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
