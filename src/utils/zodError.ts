import type { ZodError } from 'zod';

export const zodErrorMessage = (err: ZodError) => {
  const errorMsg = err.issues
    .map((issue) => {
      return `${issue.path.join('.')}: ${issue.message}`;
    })
    .join(', ');
  return errorMsg;
};
