import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ContentSync } from "./content-sync";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
afterEach(() => { cleanup(); refresh.mockClear(); });

it("refreshes public content after admin writes in this tab or another tab", () => {
  const { unmount } = render(<ContentSync />);
  window.dispatchEvent(new Event("site-content-changed"));
  window.dispatchEvent(new StorageEvent("storage", { key: "site-content-changed", newValue: "saved" }));
  window.dispatchEvent(new StorageEvent("storage", { key: "unrelated", newValue: "saved" }));
  expect(refresh).toHaveBeenCalledTimes(2);
  unmount();
  window.dispatchEvent(new Event("site-content-changed"));
  expect(refresh).toHaveBeenCalledTimes(2);
});
