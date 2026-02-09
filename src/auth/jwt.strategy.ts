// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev_secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // ✅ LOG útil (vai aparecer no terminal do backend)
    // console.log("JWT PAYLOAD >>>", payload);

    if (!payload?.sub) {
      throw new UnauthorizedException('Token sem sub');
    }

    // isso vira req.user
    return {
      sub: String(payload.sub),
      email: payload.email,
      name: payload.name,
    };
  }
}
