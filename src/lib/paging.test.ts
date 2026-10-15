import { describe, expect, it } from "vitest";

import { parsePaging } from "./paging";

describe("parsePaging", () => {
  it("returns defaults when params are absent", () => {
    expect(parsePaging(new URLSearchParams())).toEqual({
      limit: 50,
      offset: 0,
    });
  });

  it("parses limit/offset/status", () => {
    expect(
      parsePaging(new URLSearchParams("limit=10&offset=20&status=paid")),
    ).toEqual({ limit: 10, offset: 20, status: "paid" });
  });

  it("clamps limit to max 200 and floors at 1", () => {
    expect(parsePaging(new URLSearchParams("limit=999")).limit).toBe(200);
    expect(parsePaging(new URLSearchParams("limit=0")).limit).toBe(1);
    expect(parsePaging(new URLSearchParams("limit=-5")).limit).toBe(1);
    expect(parsePaging(new URLSearchParams("limit=abc")).limit).toBe(50);
  });

  it("floors offset at 0 and ignores garbage", () => {
    expect(parsePaging(new URLSearchParams("offset=-3")).offset).toBe(0);
    expect(parsePaging(new URLSearchParams("offset=abc")).offset).toBe(0);
  });

  it("drops unknown status values", () => {
    expect(parsePaging(new URLSearchParams("status=bogus"))).toEqual({
      limit: 50,
      offset: 0,
    });
    expect(parsePaging(new URLSearchParams("status=all"))).toEqual({
      limit: 50,
      offset: 0,
    });
  });
});
