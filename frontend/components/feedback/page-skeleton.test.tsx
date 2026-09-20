import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageSkeleton } from "./page-skeleton";

describe("PageSkeleton", () => {
  it("renders default skeleton layout correctly", () => {
    const { container } = render(<PageSkeleton />);
    expect(screen.getByLabelText("Sahifa yuklanmoqda")).toBeInTheDocument();
    expect(container.querySelectorAll(".alumni-card-skeleton")).toHaveLength(6);
  });

  it("renders profile skeleton when type='profile'", () => {
    const { container } = render(<PageSkeleton type="profile" />);
    expect(screen.getByLabelText("Profil yuklanmoqda")).toBeInTheDocument();
    expect(container.querySelector(".profile-card-skeleton")).toBeInTheDocument();
  });
});

