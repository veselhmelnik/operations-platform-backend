-- CreateTable
CREATE TABLE "TaskLabel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskLabelOnTask" (
    "taskId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "TaskLabelOnTask_pkey" PRIMARY KEY ("taskId","labelId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskLabel_organizationId_name_key" ON "TaskLabel"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabelOnTask" ADD CONSTRAINT "TaskLabelOnTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLabelOnTask" ADD CONSTRAINT "TaskLabelOnTask_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "TaskLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
