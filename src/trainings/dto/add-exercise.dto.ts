import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsNumber,
  IsInt,
} from 'class-validator';

export class AddExerciseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  sets: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  reps: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  technique?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;

  // ✅ Agora aceita decimal (ex: 12.5)
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  targetWeight?: number;
}
