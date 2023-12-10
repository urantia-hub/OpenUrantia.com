// Node modules.
import { NodeComment, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type NodeCommentServiceDependencies = {
  model: PrismaClient["nodeComment"];
};

export class NodeCommentService implements BaseService<NodeComment> {
  private model: PrismaClient["nodeComment"];

  constructor(
    dependencies: NodeCommentServiceDependencies = {
      model: prisma.nodeComment,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.NodeCommentCreateArgs): Promise<NodeComment> {
    return await this.model.create(args);
  }

  async delete(id: string): Promise<NodeComment> {
    return await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(
    args: Prisma.NodeCommentDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(
    args: Prisma.NodeCommentFindFirstArgs
  ): Promise<NodeComment | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.NodeCommentFindManyArgs): Promise<NodeComment[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<NodeComment | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.NodeCommentUpdateInput
  ): Promise<NodeComment> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.NodeCommentUpsertArgs): Promise<NodeComment> {
    return await this.model.upsert(args);
  }
}

export default NodeCommentService;
