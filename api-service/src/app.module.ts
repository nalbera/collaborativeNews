import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';
import { UserModule } from './modules/user/user.module';
import { NewsModule } from './modules/news/news.module';
import { VotesModule } from './modules/votes/votes.module';

dotenvConfig({ path: '.env.development' });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: false,
    }),
    UserModule,
    NewsModule,
    VotesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
