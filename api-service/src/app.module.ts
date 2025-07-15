import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { NewsModule } from './modules/news/news.module';
import { VotesModule } from './modules/votes/votes.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1d' },
      secret: process.env.JWT_SECRET,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static',
    }),
    UserModule,
    NewsModule,
    VotesModule,
    NewsModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
