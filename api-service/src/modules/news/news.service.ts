import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from 'src/entities/news.entity';
import { Repository } from 'typeorm';
import { NewsDto } from './dto/news-dto.dto';
import { User } from 'src/entities/users.entity';
import { Categories } from 'src/entities/categories.entity';
import { ErrorManager } from 'src/errors/error.manager';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News) private newsRepository: Repository<News>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
  ) {}

  async createNews(news: NewsDto, userId: string | undefined) {
    try {
      const user = userId
        ? await this.userRepository.findOne({ where: { id: userId } })
        : undefined;

      const category = user
        ? await this.categoriesRepository.findOne({
            where: { id: news.category },
          })
        : undefined;

      const newNews = new News();
      if (user) {
        newNews.author = user;
      } else {
        throw new Error('User not found');
      }
      if (category) {
        newNews.category = category;
      } else {
        throw new Error('Category not found');
      }
      newNews.title = news.title;
      newNews.text = news.text;
      newNews.sumary = news.sumary;
      newNews.image = news.image;

      await this.newsRepository.save(newNews);

      return {
        message: 'News created correctly',
      };
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }
}
