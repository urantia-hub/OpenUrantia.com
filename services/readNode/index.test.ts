import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReadNodeService } from "./index";

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
  getPrismaClient: () => ({ readNode: {} }),
}));

vi.mock("@/libs/urantiaApi/client", () => ({
  fetchParagraphs: vi.fn(),
}));

describe("ReadNodeService", () => {
  let service: ReadNodeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ReadNodeService({ model: mockModel as any });
  });

  describe("create", () => {
    it("delegates to model.create with the provided args", async () => {
      const args = {
        data: {
          userId: "user-1",
          paperId: "1",
          paperSectionId: "1:0",
          paperSectionParagraphId: "1:0.1",
          globalId: "g-1",
        },
      };
      const expected = { id: "rn-1", ...args.data };
      mockModel.create.mockResolvedValue(expected);

      const result = await service.create(args as any);

      expect(mockModel.create).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("delete", () => {
    it("delegates to model.delete with the provided args", async () => {
      const args = { where: { id: "rn-1" } };
      const expected = { id: "rn-1" };
      mockModel.delete.mockResolvedValue(expected);

      const result = await service.delete(args as any);

      expect(mockModel.delete).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteMany", () => {
    it("delegates to model.deleteMany with the provided args", async () => {
      const args = { where: { userId: "user-1" } };
      const expected = { count: 5 };
      mockModel.deleteMany.mockResolvedValue(expected);

      const result = await service.deleteMany(args as any);

      expect(mockModel.deleteMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("find", () => {
    it("delegates to model.findFirst with the provided args", async () => {
      const args = { where: { id: "rn-1" } };
      const expected = { id: "rn-1", userId: "user-1" };
      mockModel.findFirst.mockResolvedValue(expected);

      const result = await service.find(args as any);

      expect(mockModel.findFirst).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });

    it("returns null when no read node is found", async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await service.find({ where: { id: "nonexistent" } } as any);

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    it("delegates to model.findMany with the provided args", async () => {
      const args = { where: { userId: "user-1" } };
      const expected = [
        { id: "rn-1", paperId: "1" },
        { id: "rn-2", paperId: "2" },
      ];
      mockModel.findMany.mockResolvedValue(expected);

      const result = await service.findMany(args as any);

      expect(mockModel.findMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("get", () => {
    it("calls model.findFirst with the id wrapped in a where clause", async () => {
      const expected = { id: "rn-1", paperId: "1" };
      mockModel.findFirst.mockResolvedValue(expected);

      const result = await service.get("rn-1");

      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { id: "rn-1" },
      });
      expect(result).toEqual(expected);
    });

    it("returns null when read node does not exist", async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await service.get("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("calls model.update with id in where and provided data", async () => {
      const data = { paperId: "2" };
      const expected = { id: "rn-1", paperId: "2" };
      mockModel.update.mockResolvedValue(expected);

      const result = await service.update("rn-1", data as any);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: "rn-1" },
        data,
      });
      expect(result).toEqual(expected);
    });
  });

  describe("upsert", () => {
    it("delegates to model.upsert with the provided args", async () => {
      const args = {
        where: { id: "rn-1" },
        create: { userId: "user-1", paperId: "1", paperSectionId: "1:0", paperSectionParagraphId: "1:0.1", globalId: "g-1" },
        update: { paperId: "2" },
      };
      const expected = { id: "rn-1", paperId: "2" };
      mockModel.upsert.mockResolvedValue(expected);

      const result = await service.upsert(args as any);

      expect(mockModel.upsert).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("findReadsForPopularPapers", () => {
    it("calls model.findMany with date range and correct select fields", async () => {
      const startDate = new Date("2026-03-01T00:00:00Z");
      const endDate = new Date("2026-03-15T23:59:59Z");
      const expected = [
        { id: "rn-1", paperId: "1", createdAt: startDate },
        { id: "rn-2", paperId: "2", createdAt: endDate },
      ];
      mockModel.findMany.mockResolvedValue(expected);

      const result = await service.findReadsForPopularPapers(startDate, endDate);

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          createdAt: true,
          globalId: true,
          paperId: true,
          paperSectionId: true,
          paperSectionParagraphId: true,
          updatedAt: true,
          userId: true,
        },
      });
      expect(result).toEqual(expected);
    });

    it("returns empty array when no reads exist in the date range", async () => {
      const startDate = new Date("2026-01-01T00:00:00Z");
      const endDate = new Date("2026-01-02T00:00:00Z");
      mockModel.findMany.mockResolvedValue([]);

      const result = await service.findReadsForPopularPapers(startDate, endDate);

      expect(result).toEqual([]);
    });
  });
});
