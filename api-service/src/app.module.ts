import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { NewsModule } from './modules/news/news.module';
import { VotesModule } from './modules/votes/votes.module';

@Module({
  imports: [UserModule, NewsModule, VotesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
