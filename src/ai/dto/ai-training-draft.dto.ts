import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class AiDraftExerciseDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsInt()
  @Min(1)
  @Max(10)
  sets: number;

  @IsString()
  @MaxLength(50)
  reps: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  technique?: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  targetWeight?: number;
}

export class AiTrainingDraftDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiDraftExerciseDto)
  exercises: AiDraftExerciseDto[];
}
