import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 10, max: 20)',
    }),
  );
}

export interface Pagination {
  page: number;
  limit: number;
}

export function parsePagination(query: {
  page?: string;
  limit?: string;
}): Pagination {
  return query.page || query.limit
    ? {
        page: query.page ? Number.parseInt(query.page, 10) : 1,
        limit: query.limit
          ? Math.min(Number.parseInt(query.limit, 10), 20)
          : 10,
      }
    : { page: 1, limit: 10 };
}
