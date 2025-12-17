-- YourMedicare Database Export
-- Database: yourmedicare
-- Date: 2025-11-17

-- Create database
-- DROP DATABASE IF EXISTS `yourmedicare`;
-- CREATE DATABASE IF NOT EXISTS `yourmedicare` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `yourmedicare`;

-- Table: User
CREATE TABLE IF NOT EXISTS `User` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'patient',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `dateOfBirth` datetime(3) DEFAULT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `profileImage` longtext,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Specialty
CREATE TABLE IF NOT EXISTS `Specialty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Specialty_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: DoctorProfile
CREATE TABLE IF NOT EXISTS `DoctorProfile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `specialtyId` int NOT NULL,
  `bio` varchar(191) DEFAULT NULL,
  `degree` varchar(191) DEFAULT NULL,
  `experience` varchar(191) DEFAULT NULL,
  `fees` double DEFAULT NULL,
  `address1` varchar(191) DEFAULT NULL,
  `address2` varchar(191) DEFAULT NULL,
  `profileImage` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DoctorProfile_userId_key` (`userId`),
  KEY `DoctorProfile_specialtyId_fkey` (`specialtyId`),
  CONSTRAINT `DoctorProfile_specialtyId_fkey` FOREIGN KEY (`specialtyId`) REFERENCES `Specialty` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DoctorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Appointment
CREATE TABLE IF NOT EXISTS `Appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patientId` int NOT NULL,
  `doctorId` int NOT NULL,
  `datetime` datetime(3) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Appointment_patientId_fkey` (`patientId`),
  KEY `Appointment_doctorId_fkey` (`doctorId`),
  CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: MedicalRecord
CREATE TABLE IF NOT EXISTS `MedicalRecord` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointmentId` int NOT NULL,
  `diagnosis` varchar(191) NOT NULL,
  `symptoms` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `MedicalRecord_appointmentId_key` (`appointmentId`),
  CONSTRAINT `MedicalRecord_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Prescription
CREATE TABLE IF NOT EXISTS `Prescription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicalRecordId` int NOT NULL,
  `medication` varchar(191) NOT NULL,
  `dosage` varchar(191) NOT NULL,
  `duration` varchar(191) NOT NULL,
  `instructions` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Prescription_medicalRecordId_fkey` (`medicalRecordId`),
  CONSTRAINT `Prescription_medicalRecordId_fkey` FOREIGN KEY (`medicalRecordId`) REFERENCES `MedicalRecord` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data

-- Specialties
INSERT INTO `Specialty` (`id`, `name`) VALUES
(1, 'Khoa Tim Mạch'),
(2, 'Khoa Da Liễu'),
(3, 'Khoa Nhi'),
(4, 'Khoa Chấn Thương Chỉnh Hình'),
(5, 'Khoa Nội Tổng Hợp');

-- Users (Passwords: admin123, doctor123, patient123 - hashed with bcrypt)
INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `isActive`, `phone`, `address`, `dateOfBirth`, `gender`, `profileImage`, `createdAt`) VALUES
(1, 'admin@yourmedicare.vn', 'Admin', '$2a$10$YourHashedPasswordHere1', 'admin', 1, NULL, NULL, NULL, NULL, NULL, NOW()),
(2, 'doctor1@yourmedicare.vn', 'Dr. Alice', '$2a$10$YourHashedPasswordHere2', 'doctor', 1, '0901234567', NULL, NULL, NULL, NULL, NOW()),
(3, 'doctor2@yourmedicare.vn', 'Dr. Bob', '$2a$10$YourHashedPasswordHere3', 'doctor', 1, '0902345678', NULL, NULL, NULL, NULL, NOW()),
(4, 'doctor3@yourmedicare.vn', 'Dr. Carol', '$2a$10$YourHashedPasswordHere4', 'doctor', 1, '0903456789', NULL, NULL, NULL, NULL, NOW()),
(5, 'patient1@gmail.com', 'Nguyễn Văn A', '$2a$10$YourHashedPasswordHere5', 'patient', 1, '0911111111', '12 Nguyễn Trãi, Quận 1, TP.HCM', '1990-01-15 00:00:00.000', 'male', NULL, NOW()),
(6, 'patient2@gmail.com', 'Trần Thị B', '$2a$10$YourHashedPasswordHere6', 'patient', 1, '0922222222', '34 Lê Lợi, Quận 3, TP.HCM', '1995-05-20 00:00:00.000', 'female', NULL, NOW()),
(7, 'patient3@gmail.com', 'Lê Văn C', '$2a$10$YourHashedPasswordHere7', 'patient', 1, '0933333333', '56 Hai Bà Trưng, Quận 5, TP.HCM', '1988-12-10 00:00:00.000', 'male', NULL, NOW());

-- Doctor Profiles
INSERT INTO `DoctorProfile` (`id`, `userId`, `specialtyId`, `bio`, `degree`, `experience`, `fees`, `address1`, `address2`, `profileImage`) VALUES
(1, 2, 1, 'Cardiologist with 10 years experience', 'Bác sĩ Chuyên khoa II', '10 năm', 500000, 'Bệnh viện Đa khoa Trung ương', '123 Đường ABC, Quận 1, TP.HCM', NULL),
(2, 3, 2, 'Dermatologist specializing in skin care', 'Bác sĩ Chuyên khoa I', '7 năm', 400000, 'Phòng khám Da liễu', '456 Đường XYZ, Quận 3, TP.HCM', NULL),
(3, 4, 3, 'Pediatrician with expertise in child health', 'Bác sĩ Chuyên khoa II', '12 năm', 450000, 'Bệnh viện Nhi đồng', '789 Đường DEF, Quận 5, TP.HCM', NULL);

-- Sample Appointments
INSERT INTO `Appointment` (`id`, `patientId`, `doctorId`, `datetime`, `status`, `createdAt`) VALUES
(1, 5, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), 'confirmed', NOW()),
(2, 6, 3, DATE_ADD(NOW(), INTERVAL 7 DAY), 'pending', NOW()),
(3, 7, 4, NOW(), 'completed', NOW());

-- Note: Passwords need to be properly hashed. Use the seed script instead for proper password hashing.
-- Default credentials (after running seed script):
-- Admin: admin@example.com / adminpass
-- Doctor: doc1@example.com / doctorpass
-- Patient: patient@example.com / patientpass
