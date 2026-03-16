import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "./index";

const mockModel = {
  create: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  updateMany: vi.fn(),
  count: vi.fn(),
};

vi.mock("@/libs/prisma/client", () => ({
  getPrismaClient: () => ({ user: {} }),
}));

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService({ model: mockModel as any });
  });

  describe("create", () => {
    it("delegates to model.create with the provided args", async () => {
      const args = { data: { email: "test@example.com", name: "Test" } };
      const expected = { id: "1", ...args.data };
      mockModel.create.mockResolvedValue(expected);

      const result = await service.create(args as any);

      expect(mockModel.create).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("delete", () => {
    it("delegates to model.delete with the provided args", async () => {
      const args = { where: { id: "1" } };
      const expected = { id: "1", email: "test@example.com" };
      mockModel.delete.mockResolvedValue(expected);

      const result = await service.delete(args as any);

      expect(mockModel.delete).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("deleteMany", () => {
    it("delegates to model.deleteMany with the provided args", async () => {
      const args = { where: { email: { contains: "test" } } };
      const expected = { count: 3 };
      mockModel.deleteMany.mockResolvedValue(expected);

      const result = await service.deleteMany(args as any);

      expect(mockModel.deleteMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("find", () => {
    it("delegates to model.findFirst with the provided args", async () => {
      const args = { where: { email: "test@example.com" } };
      const expected = { id: "1", email: "test@example.com" };
      mockModel.findFirst.mockResolvedValue(expected);

      const result = await service.find(args as any);

      expect(mockModel.findFirst).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });

    it("returns null when no user is found", async () => {
      const args = { where: { email: "nonexistent@example.com" } };
      mockModel.findFirst.mockResolvedValue(null);

      const result = await service.find(args as any);

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    it("delegates to model.findMany with the provided args", async () => {
      const args = { where: { name: { contains: "Test" } } };
      const expected = [
        { id: "1", name: "Test User" },
        { id: "2", name: "Test Admin" },
      ];
      mockModel.findMany.mockResolvedValue(expected);

      const result = await service.findMany(args as any);

      expect(mockModel.findMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("get", () => {
    it("calls model.findFirst with the id wrapped in a where clause", async () => {
      const expected = { id: "abc-123", email: "test@example.com" };
      mockModel.findFirst.mockResolvedValue(expected);

      const result = await service.get("abc-123");

      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { id: "abc-123" },
      });
      expect(result).toEqual(expected);
    });

    it("returns null when user does not exist", async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await service.get("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("calls model.update with id in where and provided data", async () => {
      const data = { name: "Updated Name" };
      const expected = { id: "1", name: "Updated Name" };
      mockModel.update.mockResolvedValue(expected);

      const result = await service.update("1", data as any);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data,
      });
      expect(result).toEqual(expected);
    });
  });

  describe("upsert", () => {
    it("delegates to model.upsert with the provided args", async () => {
      const args = {
        where: { id: "1" },
        create: { email: "test@example.com", name: "Test" },
        update: { name: "Test Updated" },
      };
      const expected = { id: "1", email: "test@example.com", name: "Test Updated" };
      mockModel.upsert.mockResolvedValue(expected);

      const result = await service.upsert(args as any);

      expect(mockModel.upsert).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("updateMany", () => {
    it("delegates to model.updateMany with the provided args", async () => {
      const args = {
        where: { name: { contains: "Test" } },
        data: { name: "Bulk Updated" },
      };
      const expected = { count: 5 };
      mockModel.updateMany.mockResolvedValue(expected);

      const result = await service.updateMany(args as any);

      expect(mockModel.updateMany).toHaveBeenCalledWith(args);
      expect(result).toEqual(expected);
    });
  });

  describe("count", () => {
    it("delegates to model.count with the provided args", async () => {
      const args = { where: { email: { contains: "example.com" } } };
      mockModel.count.mockResolvedValue(10);

      const result = await service.count(args as any);

      expect(mockModel.count).toHaveBeenCalledWith(args);
      expect(result).toBe(10);
    });
  });
});
