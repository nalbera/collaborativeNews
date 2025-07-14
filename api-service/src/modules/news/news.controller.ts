import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { NewsService } from './news.service';
import { NewsDto } from './dto/news-dto.dto';
import { Request } from 'express';
import { IUser } from '../user/user.interface';
import { User } from 'src/entities/users.entity';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  addNews(@Body() news: NewsDto, @Req() request: Request & { user: IUser }) {
    const userId = request.user.id;
    return this.newsService.createNews(news, userId);
  }

  @Get()
  getAllNews() {
    return this.newsService.getNews();
  }

  @Get('user')
  @UseGuards(AuthGuard)
  getAllNewsByUser(@Req() request: Request & { user: User }) {
    return this.newsService.getNewsByUser(request.user);
  }

  @Get(':id')
  getNewById(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.getNewById(id);
  }

  @Put('update/:id')
  @UseGuards(AuthGuard)
  updateNews(@Param('id', ParseUUIDPipe) id: string, @Body() news: NewsDto) {
    return this.newsService.updateNews(id, news);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  deleteNews(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.deleteNews(id);
  }
}
