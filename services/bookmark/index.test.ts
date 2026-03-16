import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookmarkService } from "./index";

const mockModel = {
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
};

vi.mock("@/libs/prisma/client", () => ({
  getPrismaClient: () => ({ bookmark: {} }),
}));

vi.mock("@/utils/logger", () => ({
  default: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/libs/urantiaApi/client", () => ({
  fetchParagraphs: vi.fn(),
}));

describe("BookmarkService", () => {
  let service: BookmarkService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BookmarkService({ model: mockModel as any });
  });

  describe("create", () => {
    it("delegates to model.create with the provided args", async () => {
      const args = {
        data: {
          userId: "user-1",
          paperId: "1",
          paperSectionParagraphId: "1:0.1",
          globalId: "g-1",
        },
      };
      const expected = { id: "bk-1", ...args.data };
      mockModel.create.mockResolvedValue(expected);

      const result = await service.create(args as any);

      expect(mockModel.create).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("delete", () => {
    it("delegates to model.delete with the provided args", async () => {
      const args = { where: { id: "bk-1" } };
      const expected = { id: "bk-1" };
      mockModel.delete.mockResolvedValue(expected);

      const result = await service.delete(args as any);

      expect(mockModel.delete).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteMany", () => {
    it("delegates to model.deleteMany with the provided args", async () => {
      const args = { where: { userId: "user-1" } };
      const expected = { count: 2 };
      mockModel.deleteMany.mockResolvedValue(expected);

      const result = await service.deleteMany(args as any);

      expect(mockModel.deleteMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("find", () => {
    it("delegates to model.findFirst with the provided args", async () => {
      const args = { where: { id: "bk-1" } };
      const expected = { id: "bk-1", userId: "user-1" };
      mockModel.findFirst.mockResolvedValue(expected);

      const result = await service.find(args as any);

      expect(mockModel.findFirst).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });

    it("returns null when no bookmark is found", async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await service.find({ where: { id: "nonexistent" } } as any);

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    it("delegates to model.findMany with the provided args", async () => {
      const args = { where: { userId: "user-1" } };
      const expected = [
        { id: "bk-1", userId: "user-1" },
        { id: "bk-2", userId: "user-1" },
      ];
      mockModel.findMany.mockResolvedValue(expected);

      const result = await service.findMany(args as any);

      expect(mockModel.findMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("get", () => {
    it("calls model.findFirst with the id wrapped in a where clause", async () => {
      const expected = { id: "bk-1", userId: "user-1" };
      mockModel.findFirst.mockResolvedValue(expected);

      const result = await service.get("bk-1");

      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { id: "bk-1" },
      });
      expect(result).toEqual(expected);
    });

    it("returns null when bookmark does not exist", async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await service.get("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("calls model.update with id in where and provided data", async () => {
      const data = { category: "favorites" };
      const expected = { id: "bk-1", category: "favorites" };
      mockModel.update.mockResolvedValue(expected);

      const result = await service.update("bk-1", data as any);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: "bk-1" },
        data,
      });
      expect(result).toEqual(expected);
    });
  });

  describe("upsert", () => {
    it("delegates to model.upsert with the provided args", async () => {
      const args = {
        where: { id: "bk-1" },
        create: { userId: "user-1", paperId: "1", paperSectionParagraphId: "1:0.1", globalId: "g-1" },
        update: { category: "updated" },
      };
      const expected = { id: "bk-1", category: "updated" };
      mockModel.upsert.mockResolvedValue(expected);

      const result = await service.upsert(args as any);

      expect(mockModel.upsert).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("getUserBookmarksWithDetails", () => {
    it("returns bookmarks merged with node details and type bookmark", async () => {
      const bookmarks = [
        {
          id: "bk-1",
          userId: "user-1",
          paperId: "1",
          paperSectionParagraphId: "1:0.1",
          globalId: "g-1",
        },
        {
          id: "bk-2",
          userId: "user-1",
          paperId: "1",
          paperSectionParagraphId: "1:0.2",
          globalId: "g-2",
        },
      ];
      mockModel.findMany.mockResolvedValue(bookmarks);

      const nodeDetails = [
        { paperSectionParagraphId: "1:0.1", text: "First paragraph" },
        { paperSectionParagraphId: "1:0.2", text: "Second paragraph" },
      ];

      const { fetchParagraphs } = await import("@/libs/urantiaApi/client");
      vi.mocked(fetchParagraphs).mockResolvedValue(nodeDetails as any);

      const result = await service.getUserBookmarksWithDetails("user-1", {});

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
      expect(fetchParagraphs).toHaveBeenCalledWith(["1:0.1", "1:0.2"]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...bookmarks[0],
        ...nodeDetails[0],
        type: "bookmark",
      });
      expect(result[1]).toEqual({
        ...bookmarks[1],
        ...nodeDetails[1],
        type: "bookmark",
      });
    });

    it("filters by paperId when provided", async () => {
      mockModel.findMany.mockResolvedValue([]);

      await service.getUserBookmarksWithDetails("user-1", { paperId: 5 });

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1", paperId: "5" },
      });
    });

    it("returns empty array when no bookmarks found", async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result = await service.getUserBookmarksWithDetails("user-1", {});

      expect(result).toEqual([]);
    });

    it("handles errors from fetchParagraphs gracefully", async () => {
      const bookmarks = [
        {
          id: "bk-1",
          userId: "user-1",
          paperId: "1",
          paperSectionParagraphId: "1:0.1",
          globalId: "g-1",
        },
      ];
      mockModel.findMany.mockResolvedValue(bookmarks);

      const { fetchParagraphs } = await import("@/libs/urantiaApi/client");
      vi.mocked(fetchParagraphs).mockRejectedValue(new Error("API error"));

      const result = await service.getUserBookmarksWithDetails("user-1", {});

      // When fetchParagraphs fails, getNodesByPaperSectionParagraphIds returns []
      // So no node details are merged, but bookmarks still get type: "bookmark"
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...bookmarks[0],
        type: "bookmark",
      });
    });
  });
});
