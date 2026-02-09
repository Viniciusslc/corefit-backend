import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { TrainingsModule } from './trainings/trainings.module';

@Module({
  imports: [
    // ✅ carrega .env global
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ cria a conexão do Mongo (DatabaseConnection)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI') || 'mongodb://localhost:27017/corefit',
      }),
    }),

    AuthModule,
    UsersModule,
    TrainingsModule,
    WorkoutsModule,
  ],
})
export class AppModule {}
