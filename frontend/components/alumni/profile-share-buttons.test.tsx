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

  it("renders share buttons and handles Telegram sharing", () => {
    render(
      <ProfileShareButtons
        fullName="Sherzod Nematov"
        position="Rektor"
        faculty="Fizika-texnika"
        graduationYear={2005}
        slug="nematov-sherzod"
        locale="uz"
      />
    );

    const telegramBtn = screen.getByRole("button", { name: /Telegramda ulashish/i });
    expect(telegramBtn).toBeInTheDocument();

    fireEvent.click(telegramBtn);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("https://t.me/share/url?url="),
      "_blank",
      "noopener,noreferrer"
    );
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
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
