import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user-dto.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { IUser } from './user.interface';

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

  @Get('profile')
  @UseGuards(AuthGuard)
  getUser(@Req() req: Request & { user: IUser }) {
    return this.userService.getUser(req.user);
  }
}
