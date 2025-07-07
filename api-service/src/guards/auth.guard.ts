import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token not found');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const secret = process.env.JWT_SECRET;

      const payload: unknown = this.jwtService.verify(token, {
        secret,
      });

      request['user'] = payload;

      return true;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
