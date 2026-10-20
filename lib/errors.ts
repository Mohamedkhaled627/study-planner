export class DomainError extends Error {
  constructor(public code: "NotFound" | "Forbidden" | "OverCapacity" | "Validation") {
    super(code);
  }
}

export function toStatus(e: unknown): number {
  if (e instanceof DomainError) {
    if (e.code === "NotFound") return 404;
    if (e.code === "Forbidden") return 403;
    if (e.code === "OverCapacity") return 422;
    return 422;
  }
  return 500;
}
