import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as randomString from 'randomstring';
import { config as dotenvConfig } from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user-dto.dto';
import { MailService } from '../mail/mail.service';
import { IUser } from './user.interface';
import { ErrorManager } from 'src/errors/error.manager';

dotenvConfig({ path: '.env.development' });

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async createUser(user: UserDto): Promise<User | undefined> {
    try {
      const userFound = await this.userRepository.find({
        where: {
          email: user.email,
        },
      });

      if (userFound.length > 0) {
        throw new ErrorManager({
          type: 'CONFLICT',
          message: 'User already exists',
        });
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
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }

  async loginUser(user: UserDto): Promise<object | undefined> {
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
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      if (!userFound.active) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'The user has not been activated',
        });
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
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
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
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (userFound.registrationCode !== user.registrationCode) {
        throw new ErrorManager({
          type: 'CONTENT_DIFFERENT',
          message: 'The registration code does not match',
        });
      }

      const userModified = await this.userRepository.update(
        { email: user.email },
        {
          active: true,
          registrationCode: '',
        },
      );

      if (userModified.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'An error occurred while trying to modify',
        });
      }

      return {
        message: 'The user has been successfully activated',
      };
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw ErrorManager.handleError(error.message);
      }
    }
  }

  async getUser(user: IUser) {
    const userFound = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });

    return userFound;
  }
}
