import { Test, TestingModule } from '@nestjs/testing';
import { TaskLabelsController } from './task-labels.controller';

describe('TaskLabelsController', () => {
  let controller: TaskLabelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskLabelsController],
    }).compile();

    controller = module.get<TaskLabelsController>(TaskLabelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
