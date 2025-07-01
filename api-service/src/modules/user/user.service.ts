import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user-dto.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(user: UserDto): Promise<User> {
    try {
      const userFound = await this.userRepository.find({
        where: {
          email: user.email,
        },
      });

      if (userFound.length > 0) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      const encryptedPassword = await bcrypt.hash(user.password, 10);

      const newUser = new User();
      newUser.email = user.email;
      newUser.password = encryptedPassword;

      await this.userRepository.save(newUser);
      return newUser;
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

  async loginUser(user: UserDto): Promise<object> {
    try {
      const userFound = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });

      let validPassword: boolean = false;

      if (userFound) {
        validPassword = await bcrypt.compare(user.password, userFound.password);
      }

      if (!userFound || !validPassword) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const userPayload = {
        subscribe: userFound.id,
        id: userFound.id,
        email: userFound.email,
      };

      const token: string = this.jwtService.sign(userPayload);

      return {
        message: 'User logged in successfully',
        token,
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
  getUser() {
    return 'Get user';
  }
}
