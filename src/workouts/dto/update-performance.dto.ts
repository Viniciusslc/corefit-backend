import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SetPerformedDto {
  @IsInt()
  @Min(0)
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;
}

class PerformedExerciseDto {
  @IsString()
  @MaxLength(80)
  exerciseName: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  targetWeight?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetPerformedDto)
  setsPerformed: SetPerformedDto[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rpe?: number;
}

export class UpdatePerformanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformedExerciseDto)
  performedExercises: PerformedExerciseDto[];
}
