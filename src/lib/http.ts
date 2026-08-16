import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

import { getDictionary, resolveLocale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/fa";

export type ErrorCode = keyof Dictionary["errors"];

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    readonly details?: unknown,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

export const apiError = {
  unauthenticated: () => new ApiError(401, "UNAUTHENTICATED"),
  forbidden: (code: ErrorCode = "FORBIDDEN") => new ApiError(403, code),
  notFound: () => new ApiError(404, "NOT_FOUND"),
  conflict: (code: ErrorCode = "CONFLICT") => new ApiError(409, code),
  unprocessable: (code: ErrorCode, details?: unknown) => new ApiError(422, code, details),
  badRequest: (code: ErrorCode, details?: unknown) => new ApiError(400, code, details),
};

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function jsonCreated<T>(data: T): NextResponse {
  return jsonOk(data, 201);
}

/// Postgres/Prisma failures surface as `P####` codes on the thrown object.
function mapDatabaseError(error: unknown): ApiError | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;

  const code = (error as { code?: unknown }).code;
  if (typeof code !== "string") return null;

  if (code === "P2002") return apiError.conflict();
  if (code === "P2025") return apiError.notFound();
  if (code === "P2003") return apiError.unprocessable("VALIDATION_ERROR");

  return null;
}

export function toErrorResponse(error: unknown, request: Request): NextResponse {
  const messages = getDictionary(resolveLocale(request)).errors;

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: messages.VALIDATION_ERROR,
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 422 },
    );
  }

  const apiFailure = error instanceof ApiError ? error : mapDatabaseError(error);

  if (apiFailure) {
    return NextResponse.json(
      {
        error: {
          code: apiFailure.code,
          message: messages[apiFailure.code],
          details: apiFailure.details,
        },
      },
      { status: apiFailure.status },
    );
  }

  console.error("[bb-pms] unhandled route error", error);

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: messages.INTERNAL_ERROR } },
    { status: 500 },
  );
}

type RouteHandler<Ctx> = (request: Request, context: Ctx) => Promise<NextResponse> | NextResponse;

/// Wraps a route handler so every thrown error becomes a localized JSON envelope.
export function route<Ctx>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error, request);
    }
  };
}

export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw apiError.badRequest("VALIDATION_ERROR");
  }

  return schema.parse(payload);
}

export function readQuery<T>(request: Request, schema: ZodType<T>): T {
  const params = new URL(request.url).searchParams;
  return schema.parse(Object.fromEntries(params.entries()));
}
