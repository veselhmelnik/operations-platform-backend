import { Test, TestingModule } from '@nestjs/testing';
import { TaskLabelsService } from './task-labels.service';

describe('TaskLabelsService', () => {
  let service: TaskLabelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskLabelsService],
    }).compile();

    service = module.get<TaskLabelsService>(TaskLabelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
