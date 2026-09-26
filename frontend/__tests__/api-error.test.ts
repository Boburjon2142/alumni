import { expect, it } from "vitest";
import { apiErrorMessage } from "@/lib/api-error";
it("displays a complete Google error string instead of its first letter", () => {
  expect(apiErrorMessage({ error: { fields: { credential: "Google session expired" } } }, "Fallback")).toBe("Google session expired");
});
it("handles DRF lists and nested fields", () => {
  expect(apiErrorMessage({ error: { fields: { email: ["Invalid email"] } } }, "Fallback")).toBe("Invalid email");
  expect(apiErrorMessage(null, "Fallback")).toBe("Fallback");
});
