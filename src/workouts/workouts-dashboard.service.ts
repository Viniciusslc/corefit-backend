// src/workouts/workouts-dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Workout } from './workouts.schema';
import {
  TrainingCycle,
  TrainingCycleDocument,
} from '../trainings/schemas/training-cycle.schema';
import { DashboardStatsResponseDto } from './dto/dashboard-stats.response';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonthExclusive(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}

// semana começa na segunda
function startOfWeekMonday(d: Date) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const day = date.getDay(); // 0=dom,1=seg,...6=sab
  const diff = day === 0 ? -6 : 1 - day; // volta até segunda
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// seg..dom => 0..6
function weekdayIndexMon0(date: Date) {
  const day = date.getDay(); // 0=dom
  return (day + 6) % 7;
}

@Injectable()
export class WorkoutsDashboardService {
  constructor(
    @InjectModel(Workout.name)
    private readonly workoutModel: Model<Workout>,

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

  async getDashboardStats(userId: string): Promise<DashboardStatsResponseDto> {
    const now = new Date();

    const activeCycle = await this.getOrCreateActiveCycle(userId);

    // =========================
    // MÊS
    // =========================
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonthExclusive(now);

    const workoutsFinishedInMonth = await this.workoutModel.countDocuments({
      userId,
      cycleId: activeCycle._id,
      status: 'finished',
      finishedAt: { $gte: monthStart, $lt: monthEnd },
    });

    const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(now);
    const year = now.getFullYear();
    const monthLabel = `${month} de ${year}`;

    // =========================
    // SEMANA (SEG..DOM)
    // =========================
    const weekStart = startOfWeekMonday(now);
    const weekEnd = addDays(weekStart, 7);

    const weekWorkouts = await this.workoutModel
      .find({
        userId,
        cycleId: activeCycle._id,
        status: 'finished',
        finishedAt: { $gte: weekStart, $lt: weekEnd },
      })
      .select({ finishedAt: 1 })
      .lean();

    const map = [0, 0, 0, 0, 0, 0, 0]; // seg..dom

    for (const w of weekWorkouts) {
      if (!w.finishedAt) continue;
      const idx = weekdayIndexMon0(new Date(w.finishedAt));
      map[idx] = 1;
    }

    const activeDays = map.reduce((acc, v) => acc + (v ? 1 : 0), 0);

    return {
      monthLabel,
      workoutsFinishedInMonth,
      week: {
        activeDays,
        daysTotal: 7,
        map,
      },
    };
  }
}
