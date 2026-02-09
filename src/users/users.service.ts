import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { UpdateMeDto } from './dto/update-me.dto';

function toObjectIdOrThrow(id: string, label = 'id') {
  if (!Types.ObjectId.isValid(id)) throw new BadRequestException(`${label} inválido`);
  return new Types.ObjectId(id);
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    const clean = String(email ?? '').trim().toLowerCase();
    if (!clean) return null;

    const u = await this.userModel.findOne({ email: clean }).lean();
    if (!u) return null;

    return {
      id: String(u._id),
      _id: String(u._id),
      name: u.name,
      email: u.email,
      passwordHash: (u as any).passwordHash,
      weeklyGoalDays: Number.isFinite(Number((u as any).weeklyGoalDays)) ? Number((u as any).weeklyGoalDays) : 4,

      gender: (u as any).gender ?? 'other',
      weightKg: (u as any).weightKg ?? null,
      heightCm: (u as any).heightCm ?? null,
      avatarUrl: (u as any).avatarUrl ?? '',
    };
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    weeklyGoalDays?: number;

    gender?: 'male' | 'female' | 'other';
    weightKg?: number | null;
    heightCm?: number | null;
    avatarUrl?: string;
  }) {
    const name = String(data.name ?? '').trim();
    const email = String(data.email ?? '').trim().toLowerCase();
    const weeklyGoalDays = data.weeklyGoalDays ?? 4;

    if (!name) throw new BadRequestException('Nome é obrigatório');
    if (!email) throw new BadRequestException('Email é obrigatório');

    const exists = await this.userModel.findOne({ email }).lean();
    if (exists) throw new BadRequestException('Email já cadastrado');

    const created = await this.userModel.create({
      name,
      email,
      passwordHash: data.passwordHash,
      weeklyGoalDays,

      gender: data.gender ?? 'other',
      weightKg: data.weightKg ?? null,
      heightCm: data.heightCm ?? null,
      avatarUrl: data.avatarUrl ?? '',
    });

    return {
      id: String(created._id),
      _id: String(created._id),
      name: created.name,
      email: created.email,
      passwordHash: created.passwordHash,
      weeklyGoalDays: created.weeklyGoalDays ?? 4,

      gender: (created as any).gender ?? 'other',
      weightKg: (created as any).weightKg ?? null,
      heightCm: (created as any).heightCm ?? null,
      avatarUrl: (created as any).avatarUrl ?? '',
    };
  }

  async getMe(userId: string) {
    const _id = toObjectIdOrThrow(userId, 'userId');
    const u = await this.userModel.findById(_id).lean();
    if (!u) throw new NotFoundException('User not found');

    return {
      id: String(u._id),
      name: u.name,
      email: u.email,
      weeklyGoalDays: Number.isFinite(Number((u as any).weeklyGoalDays)) ? Number((u as any).weeklyGoalDays) : 4,

      gender: (u as any).gender ?? 'other',
      weightKg: (u as any).weightKg ?? null,
      heightCm: (u as any).heightCm ?? null,
      avatarUrl: (u as any).avatarUrl ?? '',
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const _id = toObjectIdOrThrow(userId, 'userId');

    const patch: any = {};

    if (dto.weeklyGoalDays != null) {
      const v = Number(dto.weeklyGoalDays);
      if (!Number.isFinite(v) || v < 1 || v > 7) {
        throw new BadRequestException('weeklyGoalDays inválido');
      }
      patch.weeklyGoalDays = v;
    }

    if (dto.gender != null) patch.gender = dto.gender;

    if (dto.weightKg != null) {
      const v = Number(dto.weightKg);
      if (!Number.isFinite(v) || v < 0) throw new BadRequestException('weightKg inválido');
      patch.weightKg = v;
    }

    if (dto.heightCm != null) {
      const v = Number(dto.heightCm);
      if (!Number.isFinite(v) || v < 0) throw new BadRequestException('heightCm inválido');
      patch.heightCm = v;
    }

    if (dto.avatarUrl != null) patch.avatarUrl = String(dto.avatarUrl ?? '');

    const u = await this.userModel.findByIdAndUpdate(_id, patch, { new: true }).lean();
    if (!u) throw new NotFoundException('User not found');

    return {
      ok: true,
      weeklyGoalDays: (u as any).weeklyGoalDays ?? 4,
      gender: (u as any).gender ?? 'other',
      weightKg: (u as any).weightKg ?? null,
      heightCm: (u as any).heightCm ?? null,
      avatarUrl: (u as any).avatarUrl ?? '',
    };
  }

  // =========================
  // ✅ usados pelo change-password
  // =========================
  async getAuthUserById(userId: string) {
    const _id = toObjectIdOrThrow(userId, 'userId');
    const u = await this.userModel.findById(_id).lean();
    if (!u) throw new NotFoundException('User not found');

    return {
      id: String(u._id),
      passwordHash: (u as any).passwordHash as string,
    };
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    const _id = toObjectIdOrThrow(userId, 'userId');
    const u = await this.userModel.findByIdAndUpdate(_id, { passwordHash }, { new: true }).lean();
    if (!u) throw new NotFoundException('User not found');
    return { ok: true };
  }
}
