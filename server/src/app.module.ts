import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttentionsModule } from './modules/attentions/attention.module';
import { GoalsModule } from './modules/goals/goal.module';
import { UsersModule } from './modules/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    GoalsModule,
    AttentionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
