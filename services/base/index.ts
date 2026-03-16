import { Prisma } from "@prisma/client";

abstract class BaseService<M> {
  abstract create(data: Record<string, unknown>): Promise<M>;

  abstract delete(args: Record<string, unknown>): Promise<M>;

  abstract deleteMany(args: Record<string, unknown>): Promise<Prisma.BatchPayload>;

  abstract find(args: Record<string, unknown>): Promise<M | null>;

  abstract findMany(args: Record<string, unknown>): Promise<M[]>;

  abstract get(id: string, options?: Record<string, unknown>): Promise<M | null>;

  abstract update(id: string, data: Record<string, unknown>): Promise<M>;

  abstract upsert(args: Record<string, unknown>): Promise<M>;
}

export default BaseService;
