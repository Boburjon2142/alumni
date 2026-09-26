import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GroupsFilter } from "./groups-filter";
import { getDictionary } from "@/lib/i18n";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("search=2025"),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("searches cities and districts and keeps the year when selecting a district", () => {
  render(<GroupsFilter t={getDictionary("uz")} locale="uz" />);
  fireEvent.click(screen.getByRole("combobox"));
  expect(screen.queryByRole("option", { name: /^Qashqadaryo viloyati/ })).toBeNull();
  fireEvent.change(screen.getByPlaceholderText("Shahar yoki tumanni qidiring..."), { target: { value: "Qarshi" } });
  expect(screen.getByRole("option", { name: /Qarshi shahri/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("option", { name: /Qarshi tumani/ }));
  const url = new URL(push.mock.calls[0][0], "http://localhost");
  expect(url.searchParams.get("search")).toBe("2025");
  expect(url.searchParams.get("region")).toBe("Qarshi tumani");
});
