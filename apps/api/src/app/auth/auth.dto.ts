// ─── DTOs ────────────────────────────────────────────────────────────────────
// NestJS requires concrete classes for @Body() parameters (decorator metadata
// reflection needs a constructor function, not an interface).

export class SignInDto {
  email!: string;
  password!: string;
}

export class RefreshDto {
  refreshToken!: string;
}
