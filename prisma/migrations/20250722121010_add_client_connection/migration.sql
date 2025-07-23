-- AlterTable
ALTER TABLE "user" ADD COLUMN     "canConnect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "connections" JSONB;
