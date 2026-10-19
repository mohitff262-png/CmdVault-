import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CopyButton } from "@/components/commands/CopyButton";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("CopyButton", () => {
  it("shows success only after the clipboard write resolves", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    render(<CopyButton text="git status" />);
    expect(screen.queryByText("Copied")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledWith("git status");
  });
  it("shows an error when copying fails", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });
    document.execCommand = vi.fn().mockReturnValue(false);
    render(<CopyButton text="x" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/blocked|not supported/i));
    expect(screen.queryByText("Copied")).toBeNull();
  });
});
