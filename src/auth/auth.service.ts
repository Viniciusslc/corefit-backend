import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    return user;
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new BadRequestException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id ?? user._id,
      email: user.email,
      name: user.name,
    };

    return { token: this.jwtService.sign(payload) };
  }

  async register(data: { name: string; email: string; password: string; weeklyGoalDays?: number }) {
    const hash = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      passwordHash: hash,
      weeklyGoalDays: data.weeklyGoalDays ?? 4,
    });

    const payload = {
      sub: user.id ?? user._id,
      email: user.email,
      name: user.name,
    };

    return { token: this.jwtService.sign(payload) };
  }
}
