declare global {
  namespace Express {
    interface Request {
      /** Authenticated user — set by JwtAuthGuard. */
      user?: import('@mono/auth').AuthUser;
      /** Correlation ID — set by CorrelationIdMiddleware. */
      correlationId?: string;
    }
  }
}

// Required to make this file a module (enables `declare global`)
export {};
