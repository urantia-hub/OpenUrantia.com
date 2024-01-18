// Node modules.
import axios from "axios";
import { Account, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type AccountServiceDependencies = {
  model: PrismaClient["account"];
};

export class AccountService implements BaseService<Account> {
  private model: PrismaClient["account"];

  constructor(
    dependencies: AccountServiceDependencies = {
      model: prisma.account,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.AccountCreateArgs): Promise<Account> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.AccountDeleteArgs): Promise<Account> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.AccountDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.AccountFindFirstArgs): Promise<Account | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.AccountFindManyArgs): Promise<Account[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Account | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.AccountUpdateInput): Promise<Account> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.AccountUpsertArgs): Promise<Account> {
    return await this.model.upsert(args);
  }
}

export default AccountService;
