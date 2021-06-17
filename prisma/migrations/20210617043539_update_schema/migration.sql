-- AlterTable
ALTER TABLE "Subtask" ALTER COLUMN "completedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "completedAt" DROP NOT NULL;
