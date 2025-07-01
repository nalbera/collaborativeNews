import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  registerUser(@Body() newUser: CreateUserDto) {
    return this.userService.createUser(newUser);
  }
  @Get()
  getUser() {
    return this.userService.getUser();
  }
}
