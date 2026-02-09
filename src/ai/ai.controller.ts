import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateTrainingAiDto } from './dto/generate-training-ai.dto';
import { AiService } from './ai.service';

@Controller('ai/trainings')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  generate(@Body() dto: GenerateTrainingAiDto) {
    return this.aiService.generateTrainingDraft(dto);
  }
}
