/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `trip_history` MODIFY `distance` DOUBLE NULL,
    MODIFY `duration` DOUBLE NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'DRIVER') NOT NULL;

-- CreateTable
CREATE TABLE `refresh_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jti` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_token_jti_key`(`jti`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
