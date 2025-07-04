import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as randomString from 'randomstring';
import { config as dotenvConfig } from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user-dto.dto';
import { MailService } from '../mail/mail.service';

dotenvConfig({ path: '.env.development' });

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private mailService: MailService,
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
      newUser.registrationCode = randomString.generate(10);

      await this.userRepository.save(newUser);

      await this.mailService.sendMail(
        user.email,
        'Welcome to The Colavoravie News',
        newUser.registrationCode,
        process.env.URL_REGISTRATION_CONFIRM || '',
      );

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

      if (!userFound.active) {
        throw new HttpException(
          'The user has not been activated',
          HttpStatus.UNAUTHORIZED,
        );
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

  async confirmUser(user: UserDto) {
    try {
      const userFound = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });

      if (!userFound) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (userFound.registrationCode !== user.registrationCode) {
        throw new HttpException(
          'The registration code does not match',
          HttpStatus.CONTENT_DIFFERENT,
        );
      }

      const userModified = await this.userRepository.update(
        { email: user.email },
        {
          active: true,
          registrationCode: '',
        },
      );

      if (userModified.affected === 0) {
        throw new HttpException(
          'An error occurred while trying to modify',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        message: 'The user has been successfully activated',
      };
    } catch (error: unknown) {
      console.log(error);
      let errorMessage = 'An error ocurred';
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
