// Node modules.
import axios from "axios";
import { Session, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type SessionServiceDependencies = {
  model: PrismaClient["session"];
};

export class SessionService implements BaseService<Session> {
  private model: PrismaClient["session"];

  constructor(
    dependencies: SessionServiceDependencies = {
      model: prisma.session,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.SessionCreateArgs): Promise<Session> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.SessionDeleteArgs): Promise<Session> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.SessionDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.SessionFindFirstArgs): Promise<Session | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.SessionFindManyArgs): Promise<Session[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Session | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.SessionUpsertArgs): Promise<Session> {
    return await this.model.upsert(args);
  }
}

export default SessionService;
