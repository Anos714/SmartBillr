import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";

import { AnchoredMenu } from "./anchored-menu";

afterEach(() => cleanup());

function setup(open: boolean) {
  const onClose = vi.fn();
  render(
    <AnchoredMenuHarness open={open} onClose={onClose} />,
  );
  return { onClose };
}

function AnchoredMenuHarness({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={anchorRef} type="button">
        Trigger
      </button>
      <AnchoredMenu open={open} onClose={onClose} anchorRef={anchorRef}>
        <button type="button" role="menuitem">
          Mark Paid
        </button>
        <button type="button" role="menuitem">
          Delete Invoice
        </button>
      </AnchoredMenu>
    </div>
  );
}

describe("AnchoredMenu", () => {
  it("renders nothing when closed", () => {
    setup(false);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(
      screen.queryByRole("menuitem", { name: "Mark Paid" }),
    ).toBeNull();
  });

  it("renders children in a fixed-position menu when open", () => {
    setup(true);
    const menu = screen.getByRole("menu");
    expect(menu).toBeTruthy();
    expect(
      screen.getByRole("menuitem", { name: "Mark Paid" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("menuitem", { name: "Delete Invoice" }),
    ).toBeTruthy();
    // position:fixed keeps the menu out of overflow-clipped ancestors.
    expect(menu.style.position).toBe("fixed");
  });

  it("calls onClose on Escape", () => {
    const { onClose } = setup(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on backdrop click", () => {
    const { onClose } = setup(true);
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on window resize and scroll", () => {
    const { onClose } = setup(true);
    fireEvent(window, new Event("resize"));
    expect(onClose).toHaveBeenCalled();
    fireEvent.scroll(window);
    expect(onClose).toHaveBeenCalled();
  });
});
