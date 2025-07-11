import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { NewsService } from './news.service';
import { NewsDto } from './dto/news-dto.dto';
import { Request } from 'express';
import { IUser } from '../user/user.interface';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  addNews(@Body() news: NewsDto, @Req() request: Request & { user: IUser }) {
    const userId = request.user.id;
    return this.newsService.createNews(news, userId);
  }
}
