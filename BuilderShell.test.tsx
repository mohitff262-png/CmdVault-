import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderShell } from "@/components/builders/BuilderShell";

afterEach(cleanup);

describe("BuilderShell", () => {
  it("shows a live preview and validation errors", () => {
    render(<BuilderShell slug="git-clone" />);
    const input = screen.getByLabelText(/Repository URL/);
    fireEvent.change(input, { target: { value: "not a url" } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "https://github.com/u/r.git" } });
    expect(screen.getByText("git clone https://github.com/u/r.git")).toBeInTheDocument();
  });
  it("resets the form", () => {
    render(<BuilderShell slug="git-clone" />);
    const input = screen.getByLabelText(/Repository URL/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "https://a.b/c" } });
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(input.value).toBe("");
  });
});
