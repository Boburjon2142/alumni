import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CustomSelect } from "./custom-select";
import { LOCATION_OPTIONS } from "@/lib/uzbekistan-locations";

describe("CustomSelect with Uzbekistan Locations", () => {
  afterEach(cleanup);
  it("renders placeholder and trigger", () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value=""
        onChange={handleChange}
        options={LOCATION_OPTIONS}
        placeholder="Hududni tanlang"
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Hududni tanlang")).toBeInTheDocument();
  });

  it("opens dropdown and shows search input and options with badges", () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value=""
        onChange={handleChange}
        options={LOCATION_OPTIONS}
        placeholder="Hududni tanlang"
        searchPlaceholder="Shahar yoki tumanni qidiring..."
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    // Search input should be present because options length > 10
    const searchInput = screen.getByPlaceholderText("Shahar yoki tumanni qidiring...");
    expect(searchInput).toBeInTheDocument();

    // Qashqadaryo locations should be listed
    expect(screen.getByText("Qarshi shahri")).toBeInTheDocument();
  });

  it("filters options when searching for Qarshi", () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value=""
        onChange={handleChange}
        options={LOCATION_OPTIONS}
        placeholder="Hududni tanlang"
        searchPlaceholder="Shahar yoki tumanni qidiring..."
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText("Shahar yoki tumanni qidiring...");
    fireEvent.change(searchInput, { target: { value: "Qarshi" } });

    expect(screen.getByText("Qarshi shahri")).toBeInTheDocument();
    expect(screen.getByText("Qarshi tumani")).toBeInTheDocument();
    // Non-matching options should not be shown
    expect(screen.queryByText("Chilonzor tumani")).not.toBeInTheDocument();
  });

  it("selects an option when clicked", () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value=""
        onChange={handleChange}
        options={LOCATION_OPTIONS}
        placeholder="Hududni tanlang"
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const qarshiOption = screen.getByText("Qarshi shahri");
    fireEvent.click(qarshiOption);

    expect(handleChange).toHaveBeenCalledWith("Qarshi shahri");
  });

  it("finds districts by regional badge search (e.g. Qashqadaryo)", () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value=""
        onChange={handleChange}
        options={LOCATION_OPTIONS}
        placeholder="Hududni tanlang"
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const searchInput = screen.getByPlaceholderText("Qidirish...");
    fireEvent.change(searchInput, { target: { value: "Qashqadaryo" } });

    // Should match both Qashqadaryo viloyati and all Qashqadaryo districts due to badge
    expect(screen.getByText("Kitob tumani")).toBeInTheDocument();
    expect(screen.getByText("Shahrisabz shahri")).toBeInTheDocument();
    expect(screen.getByText("Dehqonobod tumani")).toBeInTheDocument();
  });
});
