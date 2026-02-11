import { ZodError } from "zod";

export class SchemaValidationError extends Error {
  readonly issues: ZodError["issues"];

  constructor(message: string, issues: ZodError["issues"]) {
    super(message);
    this.name = "SchemaValidationError";
    this.issues = issues;
  }
}

export function unwrapParsed<T>(
  result: { success: true; data: T } | { success: false; error: ZodError },
  context: string,
): T {
  if (result.success) {
    return result.data;
  }

  throw new SchemaValidationError(`${context} payload validation failed`, result.error.issues);
}
