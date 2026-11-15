import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PredictionsPage from "./page";

describe("Predictions page", () => {
  it("names every pick list and reads settled outcomes in words, not just colour", () => {
    render(<PredictionsPage />);
    expect(screen.getByRole("heading", { level: 1, name: "پیش‌بینی‌ها" })).toBeInTheDocument();
    const lists = screen.getAllByRole("list", { name: /^پیش‌بینی‌های / });
    expect(lists.length).toBeGreaterThan(0);
    const settled = lists.at(-1)!;
    expect(within(settled).getAllByText(/، (درست|غلط)/).length).toBeGreaterThan(0);
  });

  it("says what open picks win in words, with no bare arrow", () => {
    const { container } = render(<PredictionsPage />);
    expect(container.textContent).not.toContain("←");
    expect(screen.getAllByText("با").length).toBeGreaterThan(0);
  });
});
