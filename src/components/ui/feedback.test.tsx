import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { EmptyState, StatusPill, Toast, useToast } from "./feedback";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function ToastHarness() {
  const { toast, showToast } = useToast();
  return (
    <div>
      <button type="button" onClick={() => showToast("Saved")}>
        Save
      </button>
      <Toast message={toast} />
    </div>
  );
}

describe("feedback", () => {
  it("Toast renders nothing without a message, and role=status with one", () => {
    const { rerender } = render(<Toast message={null} />);
    expect(screen.queryByRole("status")).toBeNull();
    rerender(<Toast message="Saved" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("useToast shows and auto-dismisses after 2200ms", () => {
    vi.useFakeTimers();
    render(<ToastHarness />);
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    act(() => {
      vi.advanceTimersByTime(2199);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("StatusPill renders the status label", () => {
    render(<StatusPill status="paid" />);
    expect(screen.getByText("paid")).toBeInTheDocument();
  });

  it("EmptyState renders title, copy, and action", () => {
    render(
      <EmptyState
        title="No Data Found"
        copy="Nothing here yet."
        action={<button type="button">Retry</button>}
      />,
    );
    expect(screen.getByText("No Data Found")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});
