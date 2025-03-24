/*
  Warnings:

  - The primary key for the `Example` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Example` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Example` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Example" DROP CONSTRAINT "Example_pkey",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Example_pkey" PRIMARY KEY ("id");
