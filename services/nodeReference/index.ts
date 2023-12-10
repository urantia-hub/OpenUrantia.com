// Node modules.
import { NodeReference, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type NodeReferenceServiceDependencies = {
  model: PrismaClient["nodeReference"];
};

export class NodeReferenceService implements BaseService<NodeReference> {
  private model: PrismaClient["nodeReference"];

  constructor(
    dependencies: NodeReferenceServiceDependencies = {
      model: prisma.nodeReference,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.NodeReferenceCreateArgs): Promise<NodeReference> {
    return await this.model.create(args);
  }

  async delete(id: string): Promise<NodeReference> {
    return await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(
    args: Prisma.NodeReferenceDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(
    args: Prisma.NodeReferenceFindFirstArgs
  ): Promise<NodeReference | null> {
    return await this.model.findFirst(args);
  }

  async findMany(
    args: Prisma.NodeReferenceFindManyArgs
  ): Promise<NodeReference[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<NodeReference | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.NodeReferenceUpdateInput
  ): Promise<NodeReference> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.NodeReferenceUpsertArgs): Promise<NodeReference> {
    return await this.model.upsert(args);
  }
}

export default NodeReferenceService;
