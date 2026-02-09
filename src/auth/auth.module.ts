import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

// ✅ novos
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';

function parseExpiresInToSeconds(value: string | undefined): number {
  if (!value) return 86400;

  // se já vier número em string ("86400")
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;

  // aceita formatos tipo 1d, 12h, 30m, 45s
  const m = /^(\d+)\s*([smhd])$/i.exec(value.trim());
  if (!m) return 86400;

  const n = Number(m[1]);
  const unit = m[2].toLowerCase();

  if (!Number.isFinite(n) || n <= 0) return 86400;

  switch (unit) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 60 * 60;
    case 'd':
      return n * 60 * 60 * 24;
    default:
      return 86400;
  }
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') || 'dev_secret';

        // ✅ converte "1d" -> 86400 (number), então o TS PARA de reclamar
        const expiresRaw = config.get<string>('JWT_EXPIRES_IN') || '1d';
        const expiresIn = parseExpiresInToSeconds(expiresRaw);

        return {
          secret,
          signOptions: {
            expiresIn, // ✅ number
          },
        };
      },
    }),
  ],
  controllers: [
    AuthController,
    PasswordController, // ✅ adiciona o endpoint PATCH /auth/change-password
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PasswordService, // ✅ service do change password
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
