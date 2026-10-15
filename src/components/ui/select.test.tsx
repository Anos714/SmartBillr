import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { CustomSelect } from "./select";

afterEach(() => cleanup());

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "pro", label: "Pro Thing — PRO", locked: true },
];

function setup(props?: Partial<Parameters<typeof CustomSelect>[0]>) {
  const onChange = vi.fn();
  const onLocked = vi.fn();
  render(
    <CustomSelect
      id="test-select"
      label="Test"
      value="a"
      onChange={onChange}
      options={OPTIONS}
      onLocked={onLocked}
      {...props}
    />,
  );
  return { onChange, onLocked };
}

describe("CustomSelect", () => {
  it("renders the selected option label and keeps the menu closed", () => {
    setup();
    expect(screen.getByRole("button", { name: "Test" })).toHaveTextContent("Alpha");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens on click and renders every option", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    const box = screen.getByRole("listbox");
    expect(box).toBeTruthy();
    expect(screen.getByRole("option", { name: /Alpha/ })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Beta/ })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Pro Thing/ })).toBeTruthy();
  });

  it("fires onChange with the value and closes when an unlocked option is picked", () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    fireEvent.click(screen.getByRole("option", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("does not select a locked option and calls onLocked instead", () => {
    const { onChange, onLocked } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    fireEvent.click(screen.getByRole("option", { name: /Pro Thing/ }));
    expect(onChange).not.toHaveBeenCalled();
    expect(onLocked).toHaveBeenCalledTimes(1);
    expect(onLocked.mock.calls[0][0]).toMatchObject({ value: "pro" });
    // menu stays open so the user can pick something else
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("closes on backdrop click", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("renders full option labels untruncated in a content-sized menu", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        id="status-filter"
        label="Status"
        value="all"
        onChange={onChange}
        options={[
          { value: "all", label: "All" },
          { value: "draft", label: "Draft" },
          { value: "pending", label: "Pending" },
          { value: "paid", label: "Paid" },
          { value: "overdue", label: "Overdue" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    const box = screen.getByRole("listbox");
    // Menu grows to content (never narrower than the button).
    expect(box.className).toMatch(/w-max/);
    expect(box.className).toMatch(/min-w-full/);
    // Every label renders in full, not truncated to "A…"/"D…".
    for (const label of ["All", "Draft", "Pending", "Paid", "Overdue"]) {
      const option = screen.getByRole("option", { name: label });
      expect(option).toHaveTextContent(label);
      expect(option.textContent).toBe(label);
    }
    // Labels must not truncate with ellipsis.
    const labels = box.querySelectorAll("span.whitespace-nowrap");
    expect(labels.length).toBe(5);
  });
});
