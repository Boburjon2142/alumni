import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GroupsGrid } from "./groups-grid";
import { getDictionary } from "@/lib/i18n";

describe("GroupsGrid component", () => {
  const t = getDictionary("uz");
  const mockGroups = [
    {
      year: 2015,
      description: "2015-yil bitiruvchilari",
      title: "2015-yil bitiruvchilari",
      subtitle: "Qarshi davlat universiteti",
      members_count: 14,
    },
    {
      year: 2016,
      description: "2016-yil bitiruvchilari",
      title: "2016-yil bitiruvchilari",
      subtitle: "Qarshi davlat universiteti",
      members_count: 8,
    },
  ];

  it("renders group cards with year, title and member count", () => {
    render(<GroupsGrid groups={mockGroups} locale="uz" t={t} />);

    expect(screen.getByText("2015-yil")).toBeInTheDocument();
    expect(screen.getByText("2015-yil bitiruvchilari")).toBeInTheDocument();
    expect(screen.getByText("14 nafar bitiruvchi")).toBeInTheDocument();

    expect(screen.getByText("2016-yil")).toBeInTheDocument();
    expect(screen.getByText("2016-yil bitiruvchilari")).toBeInTheDocument();
    expect(screen.getByText("8 nafar bitiruvchi")).toBeInTheDocument();
  });
});
