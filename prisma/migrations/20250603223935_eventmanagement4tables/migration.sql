-- CreateTable
CREATE TABLE `eventos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `dataHora` DATETIME(3) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `local` VARCHAR(191) NOT NULL,
    `preco_base` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artistas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `genero` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artistas_eventos` (
    `artistaId` INTEGER NOT NULL,
    `eventoId` INTEGER NOT NULL,

    PRIMARY KEY (`artistaId`, `eventoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ingressos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventoId` INTEGER NOT NULL,
    `tipo` ENUM('VIP', 'COMUM', 'MEIA') NOT NULL,
    `preco` DOUBLE NOT NULL,
    `quantidade` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `artistas_eventos` ADD CONSTRAINT `artistas_eventos_artistaId_fkey` FOREIGN KEY (`artistaId`) REFERENCES `artistas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artistas_eventos` ADD CONSTRAINT `artistas_eventos_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ingressos` ADD CONSTRAINT `ingressos_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `eventos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
