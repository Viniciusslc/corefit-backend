// src/workouts/workouts.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Workout } from './workouts.schema';
import { Training, TrainingDocument } from '../trainings/schemas/training.schema';
import {
  TrainingCycle,
  TrainingCycleDocument,
} from '../trainings/schemas/training-cycle.schema';

function toObjectIdOrThrow(id: string, label = 'ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${label} inválido`);
  }
  return new Types.ObjectId(id);
}

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectModel(Workout.name)
    private readonly workoutModel: Model<Workout>,

    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,

    @InjectModel(TrainingCycle.name)
    private readonly cycleModel: Model<TrainingCycleDocument>,
  ) {}

  private async getOrCreateActiveCycle(userId: string) {
    let cycle = await this.cycleModel.findOne({ userId, status: 'active' }).lean();

    if (!cycle) {
      const created = await this.cycleModel.create({
        userId,
        status: 'active',
        startedAt: new Date(),
      });
      cycle = created.toObject();
    }

    return cycle;
  }

  async startWorkout(userId: string, trainingId: string) {
    const trainingObjectId = toObjectIdOrThrow(trainingId, 'trainingId');

    const active = await this.workoutModel.findOne({ userId, status: 'active' });
    if (active) throw new BadRequestException('Já existe um treino ativo');

    const training = await this.trainingModel.findOne({
      _id: trainingObjectId,
      userId,
    });
    if (!training) throw new NotFoundException('Training not found');

    const activeCycle = await this.getOrCreateActiveCycle(userId);
    if (!training.cycleId || String(training.cycleId) !== String(activeCycle._id)) {
      throw new BadRequestException(
        'Este treino pertence a um ciclo arquivado e é somente leitura.',
      );
    }

    const exercisesSnapshot =
      (training.exercises ?? []).map((ex, idx) => ({
        name: ex.name,
        sets: Number(ex.sets ?? 0),
        reps: ex.reps,
        order: typeof ex.order === 'number' ? ex.order : idx,
        technique: ex.technique,
        targetWeight: ex.targetWeight,
      })) ?? [];

    const created = await this.workoutModel.create({
      userId,
      trainingId: training._id,
      trainingName: training.name,
      startedAt: new Date(),
      status: 'active',
      exercisesSnapshot,
      performedExercises: [],
      cycleId: training.cycleId ?? activeCycle._id,
    });

    return {
      id: String(created._id),
      trainingId: String(created.trainingId),
      trainingName: created.trainingName,
      startedAt: created.startedAt,
      status: created.status,
      exercisesSnapshot: created.exercisesSnapshot,
      performedExercises: created.performedExercises,
    };
  }

  async getActiveWorkout(userId: string) {
    const w = await this.workoutModel.findOne({ userId, status: 'active' }).lean();
    if (!w) return null;

    return {
      id: String(w._id),
      trainingId: String(w.trainingId),
      trainingName: w.trainingName,
      startedAt: w.startedAt,
      status: w.status,
      exercisesSnapshot: w.exercisesSnapshot ?? [],
      performedExercises: w.performedExercises ?? [],
    };
  }

  async listWorkouts(userId: string) {
    const list = await this.workoutModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return list.map((w) => ({
      id: String(w._id),
      status: w.status,
      trainingId: String(w.trainingId),
      trainingName: w.trainingName,
      startedAt: w.startedAt,
      finishedAt: w.finishedAt,
      performedExercises: w.performedExercises ?? [],
    }));
  }

  async getWorkoutById(userId: string, id: string) {
    const _id = toObjectIdOrThrow(id, 'id');

    const w = await this.workoutModel.findOne({ _id, userId }).lean();
    if (!w) throw new NotFoundException('Workout not found');

    return {
      id: String(w._id),
      status: w.status,
      trainingId: String(w.trainingId),
      trainingName: w.trainingName,
      startedAt: w.startedAt,
      finishedAt: w.finishedAt,
      exercisesSnapshot: w.exercisesSnapshot ?? [],
      performedExercises: w.performedExercises ?? [],
    };
  }

  async updatePerformance(userId: string, id: string, body: any) {
    const _id = toObjectIdOrThrow(id, 'id');

    const w = await this.workoutModel.findOne({ _id, userId });
    if (!w) throw new NotFoundException('Workout not found');

    const performedExercises = Array.isArray(body?.performedExercises)
      ? body.performedExercises
      : [];

    const sanitized = performedExercises.map((ex: any) => ({
      exerciseName: String(ex.exerciseName ?? ''),
      order: Math.max(0, Number(ex.order ?? 0)),
      targetWeight: Math.max(0, Number(ex.targetWeight ?? 0)),
      setsPerformed: Array.isArray(ex.setsPerformed)
        ? ex.setsPerformed.map((s: any) => ({
            reps: Math.max(0, Number(s.reps ?? 0)),
            weight: Math.max(0, Number(s.weight ?? 0)),
          }))
        : [],
    }));

    w.performedExercises = sanitized;
    await w.save();

    return { ok: true };
  }

  async finishWorkout(userId: string, id: string) {
    const _id = toObjectIdOrThrow(id, 'id');

    const w = await this.workoutModel.findOne({ _id, userId });
    if (!w) throw new NotFoundException('Workout not found');

    if (w.status === 'finished') return { ok: true };

    w.status = 'finished';
    w.finishedAt = new Date();

    await w.save();
    return { ok: true };
  }

  // ✅ CORRIGIDO: “HOJE” agora pega o PRÓXIMO treino do ciclo, baseado no último finalizado
  async getTodayForDashboard(userId: string) {
    // 1) se tem ativo, retorna ele
    const activeWorkout = await this.workoutModel
      .findOne({ userId, status: 'active' })
      .lean();

    if (activeWorkout) {
      return {
        mode: 'active',
        workoutId: String(activeWorkout._id),
        trainingId: String(activeWorkout.trainingId),
        trainingName: activeWorkout.trainingName,
        exerciseCount: (activeWorkout.exercisesSnapshot ?? []).length,
        isActive: true,
      };
    }

    // 2) ciclo ativo
    const activeCycle = await this.getOrCreateActiveCycle(userId);

    // 3) treinos do ciclo (ordem por criação: A, B, C…)
    const trainings = await this.trainingModel
      .find({ userId, cycleId: activeCycle._id })
      .sort({ createdAt: 1 })
      .lean();

    if (!trainings.length) {
      return { mode: 'empty', isActive: false };
    }

    // 4) último treino finalizado no ciclo
    const lastFinished = await this.workoutModel
      .findOne({
        userId,
        status: 'finished',
        cycleId: activeCycle._id,
      })
      .sort({ finishedAt: -1 })
      .lean();

    // nunca finalizou -> primeiro treino
    if (!lastFinished) {
      const t0 = trainings[0];
      return {
        mode: 'next',
        trainingId: String(t0._id),
        trainingName: t0.name,
        exerciseCount: (t0.exercises ?? []).length,
        isActive: false,
      };
    }

    // 5) próximo treino (com wrap)
    const lastTrainingId = String(lastFinished.trainingId);
    const idx = trainings.findIndex((t) => String(t._id) === lastTrainingId);

    const nextIndex = idx >= 0 ? (idx + 1) % trainings.length : 0;
    const next = trainings[nextIndex];

    return {
      mode: 'next',
      trainingId: String(next._id),
      trainingName: next.name,
      exerciseCount: (next.exercises ?? []).length,
      isActive: false,
    };
  }

  async getLastForDashboard(userId: string) {
    const activeCycle = await this.getOrCreateActiveCycle(userId);

    const last = await this.workoutModel
      .findOne({
        userId,
        status: 'finished',
        cycleId: activeCycle._id,
      })
      .sort({ finishedAt: -1 })
      .lean();

    if (!last) return { lastWorkout: null };

    return {
      lastWorkout: {
        id: String(last._id),
        trainingName: last.trainingName,
        finishedAt: last.finishedAt,
        performedExercises: last.performedExercises ?? [],
      },
    };
  }
}
