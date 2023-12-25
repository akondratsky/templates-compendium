import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Database Prisma provider
 */
@Injectable()
export class DbClient extends PrismaClient implements OnModuleInit {
  public async onModuleInit() {
      await this.$connect();

      if (await this.missionState.findFirst() === null) {
        console.warn('No global mission state found. Creating...');
        await this.missionState.create({
          data: {
            apiVersion: '0.0.1',
            nextListTaskRepoId: 0,
          },
        });
      }
  }
}