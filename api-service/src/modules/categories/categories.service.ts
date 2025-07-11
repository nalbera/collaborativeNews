import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categories } from 'src/entities/categories.entity';
import { Repository } from 'typeorm';
import * as categoriesData from '../../data/categories.json';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private categoriesRepository: Repository<Categories>,
  ) {}

  async seederExecute() {
    try {
      if (Array.isArray(categoriesData)) {
        for (const category of categoriesData) {
          await this.categoriesRepository
            .createQueryBuilder()
            .insert()
            .into(Categories)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            .values({ description: category.description })
            .orIgnore()
            .execute();
        }
      }
      return {
        message: 'Categories generated correctly',
      };
    } catch (error: unknown) {
      let errorMessage = 'An error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: errorMessage,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
