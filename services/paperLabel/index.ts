// Node modules.
import { PaperLabel, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";
import axios from "axios";

type PaperLabelServiceDependencies = {
  model: PrismaClient["paperLabel"];
};

export class PaperLabelService implements BaseService<PaperLabel> {
  private model: PrismaClient["paperLabel"];

  constructor(
    dependencies: PaperLabelServiceDependencies = {
      model: prisma.paperLabel,
    }
  ) {
    this.model = dependencies.model;
  }
  get(
    id: string,
    options: any
  ): Promise<{ paperId: string; labelId: string } | null> {
    throw new Error("Method not implemented.");
  }

  update(id: string, data: any): Promise<{ paperId: string; labelId: string }> {
    throw new Error("Method not implemented.");
  }

  /* BaseService implementation */
  async create(args: Prisma.PaperLabelCreateArgs): Promise<PaperLabel> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.PaperLabelDeleteArgs): Promise<PaperLabel> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.PaperLabelDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.PaperLabelFindFirstArgs): Promise<PaperLabel | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.PaperLabelFindManyArgs): Promise<PaperLabel[]> {
    return await this.model.findMany(args);
  }

  async upsert(args: Prisma.PaperLabelUpsertArgs): Promise<PaperLabel> {
    return await this.model.upsert(args);
  }
}

export default PaperLabelService;
