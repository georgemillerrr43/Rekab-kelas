-- AlterTable: Add PKL to Kehadiran status ENUM
ALTER TABLE `Kehadiran` MODIFY `status` ENUM('HADIR', 'IZIN', 'SAKIT', 'ALPA', 'PKL') NOT NULL DEFAULT 'HADIR';
