import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user-dto.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  registerUser(@Body() newUser: UserDto) {
    return this.userService.createUser(newUser);
  }

  @Post('confirm')
  confirmUser(@Body() user: UserDto) {
    return this.userService.confirmUser(user);
  }

  @Post('login')
  loginUser(@Body() loginUser: UserDto) {
    return this.userService.loginUser(loginUser);
  }

  @Get()
  getUser() {
    return this.userService.getUser();
  }
}
