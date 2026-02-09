import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class PasswordService {
  constructor(private readonly usersService: UsersService) {}

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const current = String(dto.currentPassword ?? '');
    const next = String(dto.newPassword ?? '');

    if (!current || !next) throw new BadRequestException('Senha inválida');
    if (next.length < 6) throw new BadRequestException('A nova senha deve ter pelo menos 6 caracteres');

    // pega hash atual
    const authUser = await this.usersService.getAuthUserById(String(userId));

    const ok = await bcrypt.compare(current, authUser.passwordHash);
    if (!ok) throw new BadRequestException('Senha atual incorreta');

    // evita trocar pela mesma senha (premium)
    const same = await bcrypt.compare(next, authUser.passwordHash);
    if (same) throw new BadRequestException('A nova senha não pode ser igual à atual');

    const newHash = await bcrypt.hash(next, 10);
    await this.usersService.updatePasswordHash(String(userId), newHash);

    return { ok: true };
  }
}
