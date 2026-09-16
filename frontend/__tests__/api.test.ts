vi.mock("@/lib/auth", () => ({ authenticatedFetch: (...args: Parameters<typeof fetch>) => fetch(...args), authChanged: vi.fn() }));
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAlumniGroup, getAlumniGroups, sendFeedback, submitAlumni } from "@/lib/api";

describe("api client tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("sendFeedback", () => {
    it("sends feedback and returns response on success", async () => {
      const mockResponse = { success: true, message: "OK", data: { id: 1 } };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sendFeedback({ type: "proposal", message: "Hello QarshiDU" });
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith("/api-proxy/feedback", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ type: "proposal", message: "Hello QarshiDU" }),
      }));
    });
  });

  describe("getAlumniGroups", () => {
    it("fetches groups from /alumni/groups/", async () => {
      const mockGroups = [
        { year: 2020, title: "2020-yil bitiruvchilari", subtitle: "QarshiDU", members_count: 12 },
      ];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockGroups }),
      });

      const res = await getAlumniGroups();
      expect(res.data).toEqual(mockGroups);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/alumni/groups/"),
        expect.any(Object)
      );
    });
  });

  describe("getAlumniGroup", () => {
    it("fetches single group by year", async () => {
      const mockData = {
        data: [{ id: 1, full_name: "Aziz Rahimov", graduation_year: 2020 }],
        group: { year: 2020, title: "2020-yil bitiruvchilari", members_count: 1 },
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const res = await getAlumniGroup(2020);
      expect(res).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/alumni/groups/2020/"),
        expect.any(Object)
      );
    });
  });

  describe("submitAlumni", () => {
    it("submits application form and returns response", async () => {
      const mockSuccess = {
        success: true,
        data: { id: 10, full_name: "Rustam Karimov", graduation_year: 2018 },
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccess,
      });

      const formData = new FormData();
      formData.append("full_name", "Rustam Karimov");
      formData.append("graduation_year", "2018");

      const res = await submitAlumni(formData);
      expect(res).toEqual(mockSuccess);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/alumni/submissions/"),
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );
    });

    it("throws extracted field error message on validation failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            fields: {
              consent_accepted: ["Shaxsiy ma’lumotlarni qayta ishlashga rozilik bildirish majburiy."],
            },
          },
        }),
      });

      const formData = new FormData();
      await expect(submitAlumni(formData)).rejects.toThrow(
        "Shaxsiy ma’lumotlarni qayta ishlashga rozilik bildirish majburiy."
      );
    });
  });
});
