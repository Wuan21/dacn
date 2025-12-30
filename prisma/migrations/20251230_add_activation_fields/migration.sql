-- Add activation fields to users table
ALTER TABLE `users` 
ADD COLUMN `activationCode` VARCHAR(191) NULL,
ADD COLUMN `activationCodeExpiry` DATETIME(3) NULL;

-- Set existing users to active (they were already created)
UPDATE `users` SET `isActive` = TRUE WHERE `isActive` IS NULL;

-- Change default for new users to false
ALTER TABLE `users` 
MODIFY COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false;
