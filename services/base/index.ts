import { Prisma } from "@prisma/client";

abstract class BaseService<M> {
  abstract create(data: any): Promise<M>;

  abstract delete(args: any): Promise<M>;

  abstract deleteMany(args: any): Promise<Prisma.BatchPayload>;

  abstract find(args: any): Promise<M | null>;

  abstract findMany(args: any): Promise<M[]>;

  abstract get(id: string, options: any): Promise<M | null>;

  abstract update(id: string, data: any): Promise<M>;

  abstract upsert(args: any): Promise<M>;
}

export default BaseService;
