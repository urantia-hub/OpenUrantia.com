// Node modules.
import { CuratedQuote, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type CuratedQuoteServiceDependencies = {
  model: PrismaClient["curatedQuote"];
};

export class CuratedQuoteService implements BaseService<CuratedQuote> {
  private model: PrismaClient["curatedQuote"];

  constructor(
    dependencies: CuratedQuoteServiceDependencies = {
      model: prisma.curatedQuote,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.CuratedQuoteCreateArgs): Promise<CuratedQuote> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.CuratedQuoteDeleteArgs): Promise<CuratedQuote> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.CuratedQuoteDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(
    args: Prisma.CuratedQuoteFindFirstArgs
  ): Promise<CuratedQuote | null> {
    return await this.model.findFirst(args);
  }

  async findMany(
    args: Prisma.CuratedQuoteFindManyArgs
  ): Promise<CuratedQuote[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<CuratedQuote | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.CuratedQuoteUpdateInput
  ): Promise<CuratedQuote> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.CuratedQuoteUpsertArgs): Promise<CuratedQuote> {
    return await this.model.upsert(args);
  }

  async getRandomUnsent(): Promise<CuratedQuote | null> {
    const unsentCuratedQuotes = await this.model.findMany({
      where: {
        sentAt: null,
      },
    });

    if (!unsentCuratedQuotes.length) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * unsentCuratedQuotes.length);

    return unsentCuratedQuotes[randomIndex];
  }
}

export default CuratedQuoteService;
