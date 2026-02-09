import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { WorkoutsService } from './workouts.service';
import { WorkoutsDashboardService } from './workouts-dashboard.service';
import { DashboardStatsResponseDto } from './dto/dashboard-stats.response';

@Controller('workouts')
@UseGuards(AuthGuard('jwt'))
export class WorkoutsController {
  constructor(
    private readonly workoutsService: WorkoutsService,
    private readonly dashboardService: WorkoutsDashboardService,
  ) {}

  @Get('dashboard-stats')
  async dashboardStats(@Req() req): Promise<DashboardStatsResponseDto> {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.dashboardService.getDashboardStats(String(userId));
  }

  @Get('dashboard/today')
  async dashboardToday(@Req() req) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.getTodayForDashboard(String(userId));
  }

  @Get('dashboard/last')
  async dashboardLast(@Req() req) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.getLastForDashboard(String(userId));
  }

  @Post('start/:trainingId')
  async start(@Req() req, @Param('trainingId') trainingId: string) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.startWorkout(String(userId), trainingId);
  }

  @Get('active')
  async active(@Req() req) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.getActiveWorkout(String(userId));
  }

  @Get()
  async list(@Req() req) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.listWorkouts(String(userId));
  }

  @Get(':id')
  async getById(@Req() req, @Param('id') id: string) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.getWorkoutById(String(userId), id);
  }

  @Patch(':id/performance')
  async updatePerformance(@Req() req, @Param('id') id: string, @Body() body: any) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.updatePerformance(String(userId), id, body);
  }

  @Patch(':id/finish')
  async finishById(@Req() req, @Param('id') id: string) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.workoutsService.finishWorkout(String(userId), id);
  }

  @Post('finish')
  async finish(@Req() req, @Body() body: { workoutId: string }) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    const workoutId = body?.workoutId;
    return this.workoutsService.finishWorkout(String(userId), String(workoutId));
  }
}
