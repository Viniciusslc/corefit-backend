import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GenerateTrainingAiDto {
  @IsString()
  @MaxLength(80)
  goal: string; // ex: "hipertrofia", "emagrecimento", "força"

  @IsInt()
  @Min(2)
  @Max(7)
  daysPerWeek: number;

  @IsString()
  @MaxLength(30)
  level: string; // "iniciante" | "intermediario" | "avancado"

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(120)
  sessionMinutes?: number; // 45, 60 etc

  @IsOptional()
  @IsString()
  @MaxLength(120)
  focus?: string; // ex: "peito", "gluteos", "costas"

  @IsOptional()
  @IsString()
  @MaxLength(200)
  restrictions?: string; // ex: "dor no ombro", "evitar agachamento livre"
}
