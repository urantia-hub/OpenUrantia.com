import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/components/Modal", () => ({
  default: ({ children, onClose }: any) =>
    React.createElement("div", { "data-testid": "modal" },
      children,
      React.createElement("button", { onClick: onClose }, "close")
    ),
}));

vi.mock("@/components/Spinner", () => ({
  default: () => React.createElement("div", { "data-testid": "spinner" }),
}));

vi.mock("@/utils/renderNode", () => ({
  renderLeadingText: () => "Paper 1, Section 0, Paragraph 1",
}));

vi.mock("@/utils/paperFormatters", () => ({
  paperIdToUrl: (id: string) => id,
}));

import Share from "@/components/Share";

const mockNode: UBNode = {
  globalId: "1-0-1",
  htmlText: "<p>The Universal Father is the God of all creation.</p>",
  labels: [],
  language: "eng",
  objectID: "1-0-1",
  paperId: "1",
  paperSectionId: "1-0",
  paperSectionParagraphId: "1-0-1",
  paperTitle: "The Universal Father",
  partId: "1",
  text: "The Universal Father is the God of all creation.",
  type: "paragraph",
};

describe("Share", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("shows spinner when no node provided", () => {
    render(<Share />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders quote text when node provided", () => {
    render(<Share node={mockNode} />);
    expect(
      screen.getByText("The Universal Father is the God of all creation.")
    ).toBeInTheDocument();
  });

  it("shows Copy Link button that changes to Copied! after click", () => {
    render(<Share node={mockNode} />);
    const copyButton = screen.getByText("Copy Link");
    expect(copyButton).toBeInTheDocument();
    fireEvent.click(copyButton);
    expect(screen.getByText("Copied!")).toBeInTheDocument();
    expect(screen.queryByText("Copy Link")).not.toBeInTheDocument();
  });

  it("calls navigator.clipboard.writeText with the share URL", () => {
    render(<Share node={mockNode} />);
    fireEvent.click(screen.getByText("Copy Link"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("1#1-0-1")
    );
  });

  it("renders share links for X and Facebook", () => {
    render(<Share node={mockNode} />);
    expect(screen.getByText("Share on X")).toBeInTheDocument();
    expect(screen.getByText("Share on Facebook")).toBeInTheDocument();
  });
});
