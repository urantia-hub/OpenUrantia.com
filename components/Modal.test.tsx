import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Modal from "@/components/Modal";

describe("Modal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("renders children content", () => {
    render(
      <Modal>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    // The backdrop is the div with backdrop-filter class
    const backdrop = document.querySelector(".backdrop-filter");
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sets body overflow to hidden on mount", () => {
    render(
      <Modal>
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow on unmount", () => {
    const { unmount } = render(
      <Modal>
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does not render close button when onClose is not provided", () => {
    render(
      <Modal>
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByLabelText("Close modal")).not.toBeInTheDocument();
  });
});
