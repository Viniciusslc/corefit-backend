import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

type AuthRequest = Request & {
  user: { sub: string; email?: string; name?: string };
};

@Controller('trainings')
@UseGuards(AuthGuard('jwt'))
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // ✅ Lista treinos do ciclo ativo por padrão.
  // Se passar ?cycleId=xxx, lista os treinos daquele ciclo (uso no histórico read-only).
  @Get()
  findAll(@Req() req: AuthRequest, @Query('cycleId') cycleId?: string) {
    const userId = req.user?.sub;
    return this.trainingsService.findAll(String(userId), cycleId);
  }

  // ✅ Lista ciclos do usuário (para histórico)
  @Get('cycles')
  listCycles(@Req() req: AuthRequest) {
    const userId = req.user?.sub;
    return this.trainingsService.listCycles(String(userId));
  }

  // ✅ Novo ciclo real (arquiva atual e cria outro)
  @Post('cycles/new')
  startNewCycle(@Req() req: AuthRequest) {
    const userId = req.user?.sub;
    return this.trainingsService.startNewCycle(String(userId));
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateTrainingDto) {
    const userId = req.user?.sub;
    return this.trainingsService.create(String(userId), dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingDto,
  ) {
    const userId = req.user?.sub;
    return this.trainingsService.update(String(userId), id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = req.user?.sub;
    return this.trainingsService.remove(String(userId), id);
  }

  @Post(':id/exercises')
  addExercise(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: AddExerciseDto,
  ) {
    const userId = req.user?.sub;
    return this.trainingsService.addExercise(String(userId), id, dto);
  }

  @Patch(':id/exercises/:exerciseId')
  updateExercise(
    @Req() req: AuthRequest,
    @Param('id') trainingId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateExerciseDto,
  ) {
    const userId = req.user?.sub;
    return this.trainingsService.updateExercise(
      String(userId),
      trainingId,
      exerciseId,
      dto,
    );
  }

  @Delete(':id/exercises/:exerciseId')
  removeExercise(
    @Req() req: AuthRequest,
    @Param('id') trainingId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    const userId = req.user?.sub;
    return this.trainingsService.removeExercise(String(userId), trainingId, exerciseId);
  }
}
