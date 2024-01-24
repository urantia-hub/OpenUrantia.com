// Node modules.
import { Label, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";
import axios from "axios";

type LabelServiceDependencies = {
  model: PrismaClient["label"];
};

export class LabelService implements BaseService<Label> {
  private model: PrismaClient["label"];

  constructor(
    dependencies: LabelServiceDependencies = {
      model: prisma.label,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.LabelCreateArgs): Promise<Label> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.LabelDeleteArgs): Promise<Label> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.LabelDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.LabelFindFirstArgs): Promise<Label | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.LabelFindManyArgs): Promise<Label[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Label | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.LabelUpdateInput): Promise<Label> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.LabelUpsertArgs): Promise<Label> {
    return await this.model.upsert(args);
  }
}

export default LabelService;
