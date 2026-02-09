import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsNumber,
  IsInt,
} from 'class-validator';

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  sets?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  reps?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  technique?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  // ✅ Agora aceita decimal (ex: 12.5)
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  targetWeight?: number;
}
