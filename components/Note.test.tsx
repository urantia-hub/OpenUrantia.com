import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/components/Modal", () => ({
  default: ({ children, onClose }: any) =>
    React.createElement("div", { "data-testid": "modal" },
      children,
      React.createElement("button", { onClick: onClose }, "close")
    ),
}));

vi.mock("./Spinner", () => ({
  default: () => React.createElement("div", { "data-testid": "spinner" }),
}));

vi.mock("@/utils/renderNode", () => ({
  renderLeadingText: () => "Paper 1, Section 0, Paragraph 1",
}));

import Note from "@/components/Note";

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

describe("Note", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  it("shows spinner when no node provided", () => {
    render(<Note onClose={onClose} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders form with textarea when node provided", () => {
    render(<Note onClose={onClose} node={mockNode} />);
    expect(
      screen.getByPlaceholderText("Type your note here...")
    ).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("Create button has disabled styling when text is empty", () => {
    render(<Note onClose={onClose} node={mockNode} />);
    const createButton = screen.getByText("Create");
    expect(createButton.className).toContain("cursor-not-allowed");
  });

  it("shows error for text exceeding 1000 chars", async () => {
    const user = userEvent.setup();
    render(<Note onClose={onClose} node={mockNode} />);
    const textarea = screen.getByPlaceholderText("Type your note here...");
    const longText = "a".repeat(1001);
    fireEvent.change(textarea, { target: { value: longText } });
    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);
    await waitFor(() => {
      expect(
        screen.getByText(/Notes currently only support up to 1000 characters/)
      ).toBeInTheDocument();
    });
  });

  it("shows error for empty text (whitespace only)", async () => {
    render(<Note onClose={onClose} node={mockNode} />);
    const textarea = screen.getByPlaceholderText("Type your note here...");
    fireEvent.change(textarea, { target: { value: "   " } });
    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);
    await waitFor(() => {
      expect(screen.getByText("Note cannot be empty.")).toBeInTheDocument();
    });
  });

  it("calls fetch with correct payload on submit", async () => {
    render(<Note onClose={onClose} node={mockNode} />);
    const textarea = screen.getByPlaceholderText("Type your note here...");
    fireEvent.change(textarea, { target: { value: "My test note" } });
    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/user/nodes/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalId: "1-0-1",
          paperId: "1",
          paperSectionId: "1-0",
          paperSectionParagraphId: "1-0-1",
          text: "My test note",
        }),
      });
    });
  });

  it("shows Creating... while submitting", async () => {
    // Make fetch hang so we can observe the loading state
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<Note onClose={onClose} node={mockNode} />);
    const textarea = screen.getByPlaceholderText("Type your note here...");
    fireEvent.change(textarea, { target: { value: "My test note" } });
    fireEvent.click(screen.getByText("Create"));
    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });
  });

  it("calls onClose after successful creation", async () => {
    render(<Note onClose={onClose} node={mockNode} />);
    const textarea = screen.getByPlaceholderText("Type your note here...");
    fireEvent.change(textarea, { target: { value: "My test note" } });
    fireEvent.click(screen.getByText("Create"));
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("Cancel button calls onClose", () => {
    render(<Note onClose={onClose} node={mockNode} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
