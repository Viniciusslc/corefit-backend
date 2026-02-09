import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordService } from './password.service';

@Controller('auth')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.sub ?? req.user?.userId ?? req.user?.id;
    return this.passwordService.changePassword(String(userId), dto);
  }
}
