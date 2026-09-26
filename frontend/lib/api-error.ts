/** DRF errors may contain either a string, a list, or nested field errors. */
export function firstError(value: unknown): string | undefined {
  if (typeof value === "string") return value || undefined;
  if (Array.isArray(value)) return value.map(firstError).find(Boolean);
  if (value && typeof value === "object") return Object.values(value).map(firstError).find(Boolean);
  return undefined;
}

export function apiErrorMessage(data: any, fallback: string): string {
  return firstError(data?.error?.fields) || firstError(data?.message) ||
    firstError(data?.detail) || firstError(data?.error?.message) || fallback;
}
