import type { Request } from 'express';
export type QueryFilter<T> = Record<string, T[keyof T]>;

export function parseQueryOrParams<T extends Record<string, any>>(
  queryOrParams: Request['query'] | Request['params'],
): T {
  const parsedQueryOrParams = Object.entries(queryOrParams).reduce(
    (acc, [key, value]) => {
      if (typeof value === 'string') {
        if (!Number.isNaN(Number(value))) {
          acc[key] = Number(value); // Parse numbers
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          acc[key] = value.toLowerCase() === 'true'; // Parse booleans
        } else {
          acc[key] = value; // Keep as string
        }
      } else {
        acc[key] = value; // Handle other cases (e.g., arrays)
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  return parsedQueryOrParams as T;
}

export const queryParamsFilters = (queryParams: Record<string, any>) => {
  const filters: Record<string, any> = {};

  // Build filters dynamically based on queryParams
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      filters[key] = value;
    }
  });

  return filters;
};
