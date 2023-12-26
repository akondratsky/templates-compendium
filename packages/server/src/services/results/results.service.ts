import {
  MinimalRepository,
  Result,
} from '@compendium-temple/api';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { TaskType } from '@prisma/client';
import { TaskManagerService } from '../taskManager';
import { DetailRepoResultService } from '../detailsRepoResult';

export interface IResultsService {
  saveResult<T extends TaskType>(result: Result<T>): Promise<void>;
}

@Injectable()
export class ResultsService implements IResultsService {
  constructor(
    private readonly detailRepoResult: DetailRepoResultService,
    private readonly taskManager: TaskManagerService,
  ) {}

  public async saveResult<T extends TaskType>({ taskId, taskType, data }: Result<T>): Promise<void> {
    switch (taskType) {
      case TaskType.LIST_REPOS: {
        const repos = data as MinimalRepository[];
        await this.taskManager.createDetailRepoTasks(repos);
        break;
      }
      case TaskType.DETAIL_REPO: {
        const repo = data as MinimalRepository;
        await this.detailRepoResult.save(repo);
        if (repo.is_template && repo.visibility === 'public' && !repo.disabled) {
          await this.taskManager.createGetDepsTask(repo);
        }
        break;
      }
      case TaskType.GET_DEPS: {
        throw new NotImplementedException();
        break;
      }
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
    await this.taskManager.markAsDone(taskId);
  }
}