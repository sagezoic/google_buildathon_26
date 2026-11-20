/**
 * Throw from routes and services to return a specific HTTP status.
 * The global onError in app.ts turns it into the standard { error, message, code } body.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const badRequest = (message: string) => new ApiError(400, 'Bad Request', message);
export const notFound = (message: string) => new ApiError(404, 'Not Found', message);
export const tooLarge = (message: string) => new ApiError(413, 'Payload Too Large', message);
export const unprocessable = (message: string) => new ApiError(422, 'Unprocessable Entity', message);
export const upstreamFailure = (message: string) => new ApiError(502, 'Bad Gateway', message);
