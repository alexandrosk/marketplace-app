-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(255) NOT NULL PRIMARY KEY,
    `shop` VARCHAR(255) NOT NULL,
    `state` VARCHAR(255) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(255),
    `expires` DATETIME,
    `accessToken` VARCHAR(255) NOT NULL,
    `userId` BIGINT
);
