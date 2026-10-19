import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ProfileShareButtons } from "./profile-share-buttons";

describe("ProfileShareButtons Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.open = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows only the copy control", () => {
    render(<ProfileShareButtons fullName="Sherzod Nematov" slug="nematov-sherzod" locale="uz" />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Telegram/i })).toBeNull();
  });

  it("handles copying link to clipboard", async () => {
    render(
      <ProfileShareButtons
        fullName="Sherzod Nematov"
        slug="nematov-sherzod"
        locale="uz"
      />
    );

    const copyBtn = screen.getByRole("button", { name: /Havolani nusxalash/i });
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${window.location.origin}/alumni/nematov-sherzod`);
  });
});
