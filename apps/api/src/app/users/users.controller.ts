import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

// TODO: Implement users module
// - GET /users — list users (paginated, admin only)
// - GET /users/:id — get user profile
// - PATCH /users/:id — update user
// - DELETE /users/:id — deactivate user
// - Add UsersService backed by database

@Controller('users')
export class UsersController {
  @Get()
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  list() {
    return {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Users module is a placeholder — implement user management here',
      },
    };
  }
}
