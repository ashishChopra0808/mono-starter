import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

// TODO: Implement authentication
// - Add passport / JWT strategy
// - POST /auth/login — authenticate and return token
// - POST /auth/register — create account
// - POST /auth/refresh — refresh token
// - Add AuthGuard for protected routes

@Controller('auth')
export class AuthController {
  @Get('me')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  me() {
    return {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Auth module is a placeholder — implement authentication strategy here',
      },
    };
  }
}
