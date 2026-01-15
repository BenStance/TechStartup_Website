import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    return {
      page: Math.max(parseInt(request.query.page) || 1, 1),
      limit: Math.min(Math.max(parseInt(request.query.limit) || 10, 1), 100),
    };
  },
);