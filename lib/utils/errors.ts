/**
 * Custom error class for application-specific errors
 * Provides both internal error messages (for logging) and user-friendly messages
 */
export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * Predefined error types for common scenarios
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', userMessage = '認証が必要です。ログインしてください。') {
    super(message, userMessage, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', userMessage = 'この操作を実行する権限がありません。') {
    super(message, userMessage, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', userMessage = '要求されたリソースが見つかりません。') {
    super(message, userMessage, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage: string) {
    super(message, userMessage, 400)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', userMessage = 'データの競合が発生しました。もう一度お試しください。') {
    super(message, userMessage, 409)
    this.name = 'ConflictError'
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.userMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return '予期しないエラーが発生しました'
}

/**
 * Log error with context (for server-side use)
 * @param context - The context where the error occurred (e.g., function name, file path)
 * @param error - The error object
 * @param additionalInfo - Any additional information to log
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  console.error(`[${timestamp}] [${context}] Error:`, {
    message: errorMessage,
    stack,
    ...additionalInfo,
  })
}

/**
 * Handle errors in Server Actions
 * Logs the error server-side and throws a user-friendly error
 *
 * @example
 * ```ts
 * export async function myServerAction(id: string) {
 *   try {
 *     // ... action logic
 *   } catch (error) {
 *     handleServerActionError('myServerAction', error, { id })
 *   }
 * }
 * ```
 */
export function handleServerActionError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): never {
  // If it's already an AppError, just log and rethrow
  if (isAppError(error)) {
    logError(context, error, additionalInfo)
    throw error
  }

  // Log unexpected errors with full details
  logError(context, error, additionalInfo)

  // Throw a generic error to the client (don't expose internal details)
  throw new AppError(
    error instanceof Error ? error.message : 'Unknown error',
    '予期しないエラーが発生しました。しばらくしてから再度お試しください。',
    500
  )
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(error: unknown, context?: string) {
  if (context) {
    logError(context, error)
  }

  if (isAppError(error)) {
    return {
      error: {
        message: error.userMessage,
        statusCode: error.statusCode,
      },
    }
  }

  return {
    error: {
      message: '予期しないエラーが発生しました',
      statusCode: 500,
    },
  }
}
