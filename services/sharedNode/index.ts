// Node modules.
import { SharedNode, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type SharedNodeServiceDependencies = {
  model: PrismaClient["sharedNode"];
};

export class SharedNodeService implements BaseService<SharedNode> {
  private model: PrismaClient["sharedNode"];

  constructor(
    dependencies: SharedNodeServiceDependencies = {
      model: prisma.sharedNode,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.SharedNodeCreateArgs): Promise<SharedNode> {
    return await this.model.create(args);
  }

  async delete(id: string): Promise<SharedNode> {
    return await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(
    args: Prisma.SharedNodeDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.SharedNodeFindFirstArgs): Promise<SharedNode | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.SharedNodeFindManyArgs): Promise<SharedNode[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<SharedNode | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.SharedNodeUpdateInput
  ): Promise<SharedNode> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.SharedNodeUpsertArgs): Promise<SharedNode> {
    return await this.model.upsert(args);
  }
}

export default SharedNodeService;
