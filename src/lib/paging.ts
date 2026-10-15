import type { InvoiceStatus } from "./library";

export const PAGING_DEFAULT_LIMIT = 50;
export const PAGING_MAX_LIMIT = 200;
export const PAGING_DEFAULT_OFFSET = 0;

export type PagingParams = {
  limit: number;
  offset: number;
  status?: InvoiceStatus;
};

function isStatus(value: unknown): value is InvoiceStatus {
  return (
    value === "draft" ||
    value === "paid" ||
    value === "pending" ||
    value === "overdue"
  );
}

/**
 * Pure query-param parser for `GET /api/invoices`.
 * - `limit`: default 50, clamped to [1, 200]; non-numeric falls back to 50.
 * - `offset`: default 0, floored at 0; non-numeric falls back to 0.
 * - `status`: only a known InvoiceStatus is kept, otherwise omitted.
 */
export function parsePaging(searchParams: URLSearchParams): PagingParams {
  const limitStr = searchParams.get("limit");
  const rawLimit = limitStr === null || limitStr.trim() === "" ? NaN : Number(limitStr);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(PAGING_MAX_LIMIT, Math.max(1, Math.floor(rawLimit)))
    : PAGING_DEFAULT_LIMIT;

  const offsetStr = searchParams.get("offset");
  const rawOffset =
    offsetStr === null || offsetStr.trim() === "" ? NaN : Number(offsetStr);
  const offset =
    Number.isFinite(rawOffset) && rawOffset > 0
      ? Math.floor(rawOffset)
      : PAGING_DEFAULT_OFFSET;

  const rawStatus = searchParams.get("status");
  const out: PagingParams = { limit, offset };
  if (isStatus(rawStatus)) out.status = rawStatus;
  return out;
}
