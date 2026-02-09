import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Training, TrainingDocument } from './schemas/training.schema';
import { TrainingCycle, TrainingCycleDocument } from './schemas/training-cycle.schema';

import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

function toObjectIdOrThrow(id: string, label = 'ID') {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`${label} inválido`);
  }
  return new Types.ObjectId(id);
}

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,

    @InjectModel(TrainingCycle.name)
    private readonly cycleModel: Model<TrainingCycleDocument>,
  ) {}

  // ==========================
  // Ciclo ativo (SEM MIGRAÇÃO AUTOMÁTICA)
  // ==========================
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

  async listCycles(userId: string) {
    return this.cycleModel.find({ userId }).sort({ status: 1, startedAt: -1 }).lean();
  }

  // ✅ AGORA: cria novo ciclo APAGANDO o ciclo atual do banco
  async startNewCycle(userId: string) {
    const current = await this.getOrCreateActiveCycle(userId);

    // 1) Apaga treinos do ciclo atual
    await this.trainingModel.deleteMany({ userId, cycleId: current._id });

    // 2) Apaga treinos antigos "soltos" (sem cycleId) pra nunca mais voltarem
    await this.trainingModel.deleteMany({
      userId,
      $or: [{ cycleId: { $exists: false } }, { cycleId: null }],
    });

    // 3) Arquiva ciclo atual (opcional, mas bom pra consistência)
    await this.cycleModel.updateOne(
      { _id: current._id, userId, status: 'active' },
      { $set: { status: 'archived', endedAt: new Date() } },
    );

    // 4) Cria novo ciclo ativo
    const created = await this.cycleModel.create({
      userId,
      status: 'active',
      startedAt: new Date(),
    });

    return created.toObject();
  }

  private async assertTrainingIsFromActiveCycle(userId: string, trainingId: string) {
    toObjectIdOrThrow(trainingId, 'trainingId');

    const active = await this.getOrCreateActiveCycle(userId);

    const training = await this.trainingModel.findOne({ _id: trainingId, userId });
    if (!training) throw new NotFoundException('Training not found');

    if (!training.cycleId || String(training.cycleId) !== String(active._id)) {
      throw new BadRequestException(
        'Este treino pertence a um ciclo arquivado e é somente leitura.',
      );
    }

    return { training, activeCycleId: active._id };
  }

  // ==========================
  // Trainings
  // ==========================
  async findAll(userId: string, cycleId?: string) {
    if (cycleId) {
      toObjectIdOrThrow(cycleId, 'cycleId');

      const cycle = await this.cycleModel.findOne({ _id: cycleId, userId }).lean();
      if (!cycle) throw new NotFoundException('Cycle not found');

      return this.trainingModel
        .find({ userId, cycleId: new Types.ObjectId(cycleId) })
        .sort({ createdAt: -1 })
        .lean();
    }

    const active = await this.getOrCreateActiveCycle(userId);

    return this.trainingModel
      .find({ userId, cycleId: active._id })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(userId: string, dto: CreateTrainingDto) {
    const active = await this.getOrCreateActiveCycle(userId);

    const created = await this.trainingModel.create({
      ...dto,
      userId,
      cycleId: active._id,
      exercises: [],
    });

    return created.toObject();
  }

  async update(userId: string, id: string, dto: UpdateTrainingDto) {
    const { activeCycleId } = await this.assertTrainingIsFromActiveCycle(userId, id);

    const updated = await this.trainingModel
      .findOneAndUpdate({ _id: id, userId, cycleId: activeCycleId }, { $set: dto }, { new: true })
      .lean();

    if (!updated) throw new NotFoundException('Training not found');
    return updated;
  }

  async remove(userId: string, id: string) {
    const { activeCycleId } = await this.assertTrainingIsFromActiveCycle(userId, id);

    const deleted = await this.trainingModel
      .findOneAndDelete({ _id: id, userId, cycleId: activeCycleId })
      .lean();

    if (!deleted) throw new NotFoundException('Training not found');
    return { ok: true };
  }

  async addExercise(userId: string, trainingId: string, dto: AddExerciseDto) {
    const { activeCycleId } = await this.assertTrainingIsFromActiveCycle(userId, trainingId);

    const exerciseToAdd: any = {
      name: dto.name,
      sets: dto.sets,
      reps: dto.reps,
      order: dto.order,
    };

    if (dto.technique !== undefined) exerciseToAdd.technique = dto.technique;
    if (dto.targetWeight !== undefined) exerciseToAdd.targetWeight = dto.targetWeight;

    const updated = await this.trainingModel
      .findOneAndUpdate(
        { _id: trainingId, userId, cycleId: activeCycleId },
        { $push: { exercises: exerciseToAdd } },
        { new: true },
      )
      .lean();

    if (!updated) throw new NotFoundException('Training not found');
    return updated;
  }

  async updateExercise(userId: string, trainingId: string, exerciseId: string, dto: UpdateExerciseDto) {
    toObjectIdOrThrow(exerciseId, 'exerciseId');

    const { training, activeCycleId } = await this.assertTrainingIsFromActiveCycle(userId, trainingId);

    if (!training.cycleId || String(training.cycleId) !== String(activeCycleId)) {
      throw new BadRequestException('Este treino pertence a um ciclo arquivado e é somente leitura.');
    }

    const exercise = training.exercises.id(exerciseId);
    if (!exercise) throw new NotFoundException('Exercise not found');

    if (dto.name !== undefined) exercise.name = dto.name;
    if (dto.sets !== undefined) exercise.sets = dto.sets;
    if (dto.reps !== undefined) exercise.reps = dto.reps;
    if (dto.technique !== undefined) exercise.technique = dto.technique;
    if (dto.order !== undefined) exercise.order = dto.order;
    if (dto.targetWeight !== undefined) exercise.targetWeight = dto.targetWeight;

    await training.save();
    return training.toObject();
  }

  async removeExercise(userId: string, trainingId: string, exerciseId: string) {
    toObjectIdOrThrow(exerciseId, 'exerciseId');

    const { training, activeCycleId } = await this.assertTrainingIsFromActiveCycle(userId, trainingId);

    if (!training.cycleId || String(training.cycleId) !== String(activeCycleId)) {
      throw new BadRequestException('Este treino pertence a um ciclo arquivado e é somente leitura.');
    }

    const exercise = training.exercises.id(exerciseId);
    if (!exercise) throw new NotFoundException('Exercise not found');

    exercise.deleteOne();
    await training.save();

    return training.toObject();
  }
}
