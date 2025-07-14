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

  async getNews(): Promise<News[] | undefined> {
    try {
      const currentNews: News[] = await this.newsRepository.find();
      /**
       * Incluir las relaciones de usuarios y votos
       */
      if (currentNews.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No news found to display',
        });
      }

      return currentNews;
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }

  async getNewById(id: string): Promise<News | undefined> {
    try {
      const currentNews = await this.newsRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!currentNews) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'That news is no longer available.',
        });
      }

      return currentNews;
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }

  async getNewsByUser(user: User): Promise<News[] | undefined> {
    try {
      const currentNews = await this.newsRepository
        .createQueryBuilder('news')
        .leftJoinAndSelect('news.author', 'author')
        .where('author.id = :id', { id: user.id })
        .orderBy('news.createdAt', 'DESC')
        .getMany();

      if (!currentNews.length) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Has no published news',
        });
      }

      return currentNews;
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }

  async updateNews(id: string, news: NewsDto): Promise<NewsDto | undefined> {
    try {
      const categoryEntity = await this.categoriesRepository.findOne({
        where: { id: news.category },
      });

      if (!categoryEntity) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Category not found',
        });
      }

      const newsModify = await this.newsRepository.update(
        { id: id },
        {
          title: news.title,
          sumary: news.sumary,
          text: news.text,
          image: news.image,
          category: categoryEntity,
        },
      );

      if (newsModify.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Error when modifying',
        });
      }

      const updatedNews = await this.newsRepository.findOne({
        where: { id: id },
        relations: ['category'],
      });

      if (!updatedNews) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Updated news not found',
        });
      }

      const newsDto: NewsDto = {
        title: updatedNews.title,
        image: updatedNews.image,
        sumary: updatedNews.sumary,
        text: updatedNews.text,
        category: updatedNews.category.id,
      };

      return newsDto;
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }

  async deleteNews(id: string) {
    try {
      await this.newsRepository
        .createQueryBuilder()
        .delete()
        .from(News)
        .where('id = :id', { id: id })
        .execute();

      return {
        message: 'News successfully deleted',
      };
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }
}
