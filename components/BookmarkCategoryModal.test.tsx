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

vi.mock("@/components/Spinner", () => ({
  default: () => React.createElement("div", { "data-testid": "spinner" }),
}));

vi.mock("@/utils/renderNode", () => ({
  renderLeadingText: () => "Paper 1, Section 0, Paragraph 1",
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("lucide-react", () => ({
  BookmarkIcon: (props: any) => React.createElement("svg", { "data-testid": "bookmark-icon", ...props }),
  PlusIcon: (props: any) => React.createElement("svg", { "data-testid": "plus-icon", ...props }),
}));

import BookmarkCategoryModal from "@/components/BookmarkCategoryModal";

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

const mockBookmark = {
  id: "bookmark-1",
  userId: "user-1",
  globalId: "1-0-1",
  paperId: "1",
  paperSectionId: "1-0",
  paperSectionParagraphId: "1-0-1",
  category: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("BookmarkCategoryModal", () => {
  const onClose = vi.fn();
  const onCategorySelect = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.restoreAllMocks();
    onClose.mockClear();
    onCategorySelect.mockClear();
    onCategorySelect.mockResolvedValue(undefined);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ["Favorites", "Study", "Inspiration"],
    });
  });

  it("shows spinner while loading categories", () => {
    // Make fetch hang so loading persists
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    expect(screen.getAllByTestId("spinner").length).toBeGreaterThanOrEqual(1);
  });

  it("renders category list after loading", async () => {
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Favorites")).toBeInTheDocument();
      expect(screen.getByText("Study")).toBeInTheDocument();
      expect(screen.getByText("Inspiration")).toBeInTheDocument();
    });
  });

  it("calls onCategorySelect when a category is clicked", async () => {
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Favorites")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Favorites"));
    await waitFor(() => {
      expect(onCategorySelect).toHaveBeenCalledWith("bookmark-1", "Favorites");
    });
  });

  it("shows Create new category button", async () => {
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Create new category")).toBeInTheDocument();
    });
  });

  it("shows input when Create new category clicked", async () => {
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Create new category")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Create new category"));
    expect(screen.getByPlaceholderText("Category name")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("calls onCategorySelect with new category name", async () => {
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Create new category")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Create new category"));
    const input = screen.getByPlaceholderText("Category name");
    fireEvent.change(input, { target: { value: "New Category" } });
    fireEvent.click(screen.getByText("Create"));
    await waitFor(() => {
      expect(onCategorySelect).toHaveBeenCalledWith(
        "bookmark-1",
        "New Category"
      );
    });
  });

  it("Cancel button calls onClose", async () => {
    render(
      <BookmarkCategoryModal
        bookmark={mockBookmark as any}
        node={mockNode}
        onCategorySelect={onCategorySelect}
        onClose={onClose}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
