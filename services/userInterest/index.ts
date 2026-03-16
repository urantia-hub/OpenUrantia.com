// Node modules.
import { UserInterest, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";

const prisma = getPrismaClient();

type UserInterestServiceDependencies = {
  model: PrismaClient["userInterest"];
};

export class UserInterestService implements BaseService<UserInterest> {
  private model: PrismaClient["userInterest"];

  constructor(
    dependencies: UserInterestServiceDependencies = {
      model: prisma.userInterest,
    }
  ) {
    this.model = dependencies.model;
  }
  get(
    id: string,
    options?: Record<string, unknown>
  ): Promise<{
    createdAt: Date;
    labelId: string;
    updatedAt: Date;
    userId: string;
  } | null> {
    throw new Error("Method not implemented.");
  }

  update(
    id: string,
    data: Record<string, unknown>
  ): Promise<{
    createdAt: Date;
    labelId: string;
    updatedAt: Date;
    userId: string;
  }> {
    throw new Error("Method not implemented.");
  }

  /* BaseService implementation */
  async create(args: Prisma.UserInterestCreateArgs): Promise<UserInterest> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.UserInterestDeleteArgs): Promise<UserInterest> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.UserInterestDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(
    args: Prisma.UserInterestFindFirstArgs
  ): Promise<UserInterest | null> {
    return await this.model.findFirst(args);
  }

  async findMany(
    args: Prisma.UserInterestFindManyArgs
  ): Promise<UserInterest[]> {
    return await this.model.findMany(args);
  }

  async upsert(args: Prisma.UserInterestUpsertArgs): Promise<UserInterest> {
    return await this.model.upsert(args);
  }
}

export default UserInterestService;
