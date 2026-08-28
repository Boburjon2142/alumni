import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendFeedback } from "@/lib/api";

describe("api - sendFeedback", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("sends feedback and returns response on success", async () => {
    const mockResponse = { success: true, message: "OK", data: { id: 1 } };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await sendFeedback({ type: "proposal", message: "Hello" });
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith("/api/feedback", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ type: "proposal", message: "Hello" }),
    }));
  });

  it("throws on 400 error", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
    });
    await expect(sendFeedback({ type: "proposal", message: "Hello" })).rejects.toThrow("Feedback request failed");
  });

  it("throws on 500 error", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });
    await expect(sendFeedback({ type: "proposal", message: "Hello" })).rejects.toThrow("Feedback request failed");
  });
});
