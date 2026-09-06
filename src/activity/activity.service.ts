import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateActivityInput } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateActivityInput) {
    return this.prisma.activity.create({
      data: input,
    });
  }
}
