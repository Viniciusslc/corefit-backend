// src/workouts/dto/dashboard-stats.response.ts

export class DashboardStatsResponseDto {
  monthLabel: string; // ex: "fev. de 2026"
  workoutsFinishedInMonth: number;

  // ✅ novo: acompanhamento semanal (seg..dom)
  week: {
    activeDays: number; // 0..7
    daysTotal: number; // 7
    map: number[]; // length 7 (seg..dom) com 0/1
  };
}
