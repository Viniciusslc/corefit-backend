import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.usersService.getMe(String(userId));
  }

  @Patch('me')
  async updateMe(@Req() req, @Body() dto: UpdateMeDto) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.usersService.updateMe(String(userId), dto);
  }
}
