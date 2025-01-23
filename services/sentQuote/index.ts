// Node modules.
import { SentQuote, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";

const prisma = getPrismaClient();

type SentQuoteServiceDependencies = {
  model: PrismaClient["sentQuote"];
};

export class SentQuoteService implements BaseService<SentQuote> {
  private model: PrismaClient["sentQuote"];

  constructor(
    dependencies: SentQuoteServiceDependencies = {
      model: prisma.sentQuote,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.SentQuoteCreateArgs): Promise<SentQuote> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.SentQuoteDeleteArgs): Promise<SentQuote> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.SentQuoteDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.SentQuoteFindFirstArgs): Promise<SentQuote | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.SentQuoteFindManyArgs): Promise<SentQuote[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<SentQuote | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.SentQuoteUpdateInput
  ): Promise<SentQuote> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.SentQuoteUpsertArgs): Promise<SentQuote> {
    return await this.model.upsert(args);
  }

  async count(args: Prisma.SentQuoteCountArgs): Promise<number> {
    return await this.model.count(args);
  }
}

export default SentQuoteService;
