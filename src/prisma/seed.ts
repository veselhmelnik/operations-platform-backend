import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { OrganizationRole, TaskStatus } from '../generated/prisma/enums';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  // DEV ONLY: очищаем базу
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // ========================
  // USERS
  // ========================

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@test.com',
      passwordHash,
    },
  });

  const secondUser = await prisma.user.create({
    data: {
      name: 'John Smith',
      email: 'john@test.com',
      passwordHash,
    },
  });

  // ========================
  // ORGANIZATION 1
  // ========================

  const taskFlowOrg = await prisma.organization.create({
    data: {
      name: 'TaskFlow Team',
    },
  });

  await prisma.organizationMember.createMany({
    data: [
      {
        userId: user.id,
        organizationId: taskFlowOrg.id,
        role: OrganizationRole.OWNER,
      },
      {
        userId: secondUser.id,
        organizationId: taskFlowOrg.id,
        role: OrganizationRole.MEMBER,
      },
    ],
  });

  const websiteProject = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesign company website',
      organizationId: taskFlowOrg.id,
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile Application',
      description: 'Build the first mobile application',
      organizationId: taskFlowOrg.id,
    },
  });

  await prisma.task.createMany({
    data: [
      // Website Redesign
      {
        title: 'Research competitors',
        description: 'Analyze competitor websites',
        status: TaskStatus.TODO,
        position: 0,
        projectId: websiteProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Create wireframes',
        description: 'Prepare initial page wireframes',
        status: TaskStatus.TODO,
        position: 1,
        projectId: websiteProject.id,
        assigneeId: secondUser.id,
      },
      {
        title: 'Build landing page',
        description: 'Implement new landing page',
        status: TaskStatus.IN_PROGRESS,
        position: 0,
        projectId: websiteProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Review navigation',
        description: 'Review navigation structure',
        status: TaskStatus.REVIEW,
        position: 0,
        projectId: websiteProject.id,
        assigneeId: secondUser.id,
      },
      {
        title: 'Setup repository',
        description: 'Configure repository and CI',
        status: TaskStatus.DONE,
        position: 0,
        projectId: websiteProject.id,
        assigneeId: user.id,
      },

      // Mobile Application
      {
        title: 'Choose mobile stack',
        status: TaskStatus.TODO,
        position: 0,
        projectId: mobileProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Design login screen',
        status: TaskStatus.TODO,
        position: 1,
        projectId: mobileProject.id,
        assigneeId: secondUser.id,
      },
      {
        title: 'Implement authentication',
        status: TaskStatus.IN_PROGRESS,
        position: 0,
        projectId: mobileProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Review API integration',
        status: TaskStatus.REVIEW,
        position: 0,
        projectId: mobileProject.id,
      },
    ],
  });

  // ========================
  // ORGANIZATION 2
  // ========================

  const startupOrg = await prisma.organization.create({
    data: {
      name: 'Startup Lab',
    },
  });

  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: startupOrg.id,
      role: OrganizationRole.ADMIN,
    },
  });

  const crmProject = await prisma.project.create({
    data: {
      name: 'CRM Platform',
      description: 'Internal CRM system',
      organizationId: startupOrg.id,
    },
  });

  const analyticsProject = await prisma.project.create({
    data: {
      name: 'Analytics Dashboard',
      description: 'Business analytics dashboard',
      organizationId: startupOrg.id,
    },
  });

  await prisma.task.createMany({
    data: [
      // CRM
      {
        title: 'Design database schema',
        status: TaskStatus.DONE,
        position: 0,
        projectId: crmProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Create customers API',
        status: TaskStatus.IN_PROGRESS,
        position: 0,
        projectId: crmProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Implement customer table',
        status: TaskStatus.TODO,
        position: 0,
        projectId: crmProject.id,
      },

      // Analytics
      {
        title: 'Create dashboard layout',
        status: TaskStatus.TODO,
        position: 0,
        projectId: analyticsProject.id,
        assigneeId: user.id,
      },
      {
        title: 'Add sales chart',
        status: TaskStatus.TODO,
        position: 1,
        projectId: analyticsProject.id,
      },
      {
        title: 'Add date filters',
        status: TaskStatus.IN_PROGRESS,
        position: 0,
        projectId: analyticsProject.id,
      },
      {
        title: 'Review dashboard metrics',
        status: TaskStatus.REVIEW,
        position: 0,
        projectId: analyticsProject.id,
      },
    ],
  });

  console.log('Seed completed');
  console.log('Login:');
  console.log('email: test@test.com');
  console.log('password: password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
