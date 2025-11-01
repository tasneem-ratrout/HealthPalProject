-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 01 نوفمبر 2025 الساعة 14:55
-- إصدار الخادم: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `healthpal_db`
--

-- --------------------------------------------------------

--
-- بنية الجدول `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `alert_type` enum('info','warning','urgent') DEFAULT 'info',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `anonymous_sessions`
--

CREATE TABLE `anonymous_sessions` (
  `id` int(11) NOT NULL,
  `session_code` varchar(20) NOT NULL,
  `therapist_id` int(11) DEFAULT NULL,
  `status` enum('open','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `mode` enum('video','audio','text') DEFAULT 'video',
  `translation_enabled` tinyint(1) DEFAULT 0,
  `low_bandwidth` tinyint(1) DEFAULT 0,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `donations`
--

CREATE TABLE `donations` (
  `id` int(11) NOT NULL,
  `donor_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `case_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `feedback` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `health_guides`
--

CREATE TABLE `health_guides` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `lang` enum('ar','en') DEFAULT 'ar',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `medical_aid`
--

CREATE TABLE `medical_aid` (
  `id` int(11) NOT NULL,
  `ngo_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `medical_history`
--

CREATE TABLE `medical_history` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `condition` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `diagnosed_at` date DEFAULT NULL,
  `verified_by` varchar(100) DEFAULT NULL,
  `consent_given` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `medical_items`
--

CREATE TABLE `medical_items` (
  `id` int(11) NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `item_type` enum('medicine','equipment') NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `donor_id` int(11) DEFAULT NULL,
  `ngo_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `medical_missions`
--

CREATE TABLE `medical_missions` (
  `id` int(11) NOT NULL,
  `ngo_id` int(11) NOT NULL,
  `mission_name` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `mission_doctors`
--

CREATE TABLE `mission_doctors` (
  `id` int(11) NOT NULL,
  `mission_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `available_from` date DEFAULT NULL,
  `available_to` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `ngos`
--

CREATE TABLE `ngos` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `patient_cases`
--

CREATE TABLE `patient_cases` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `diagnosis` text DEFAULT NULL,
  `treatment_type` enum('surgery','cancer','dialysis','rehabilitation','other') DEFAULT 'other',
  `goal_amount` decimal(10,2) DEFAULT NULL,
  `raised_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('open','funded','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `specialties`
--

CREATE TABLE `specialties` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `specialties`
--

INSERT INTO `specialties` (`id`, `name`) VALUES
(1, 'Cardiology'),
(2, 'Neurology'),
(3, 'Pediatrics'),
(4, 'Dermatology'),
(5, 'Orthopedics');

-- --------------------------------------------------------

--
-- بنية الجدول `support_groups`
--

CREATE TABLE `support_groups` (
  `id` int(11) NOT NULL,
  `topic` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `moderator_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role` enum('patient','doctor','donor','ngo','admin') NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `specialty_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `users`
--

INSERT INTO `users` (`id`, `role`, `name`, `email`, `password_hash`, `specialty_id`, `created_at`) VALUES
(1, 'patient', 'tasneem', 'tasneem@example.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', NULL, '2025-10-18 19:28:53'),
(2, 'patient', 'shahd', 'shahd@example.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', NULL, '2025-10-18 20:17:50'),
(3, 'doctor', 'Dr. Ahmad', 'ahmad@example.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', 1, '2025-10-24 13:43:11'),
(4, 'doctor', 'Dr. Lina', 'lina@example.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', 4, '2025-10-24 13:43:27'),
(5, 'doctor', 'Dr. Omar', 'omar@example.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', 3, '2025-10-24 14:56:19'),
(6, 'donor', 'ameed', 'ameed@example.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', NULL, '2025-10-25 18:45:16'),
(7, 'ngo', 'PalHealth Organization', 'ngo1@healthpal.org', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', NULL, '2025-10-25 19:54:22'),
(9, 'admin', 'Admin User', 'admin@healthpal.com', '$2b$10$n.CYHETWRrr2SMmQ9v1bhu6Gz87CPG7lpcK2NxmbCxVpISbcChlmC', NULL, '2025-10-30 14:33:55');

-- --------------------------------------------------------

--
-- بنية الجدول `workshops`
--

CREATE TABLE `workshops` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `host_ngo_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `anonymous_sessions`
--
ALTER TABLE `anonymous_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_code` (`session_code`),
  ADD KEY `therapist_id` (`therapist_id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_appt_patient` (`patient_id`),
  ADD KEY `idx_appt_doc` (`doctor_id`,`appointment_date`,`appointment_time`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donor_id` (`donor_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_id` (`group_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `health_guides`
--
ALTER TABLE `health_guides`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medical_aid`
--
ALTER TABLE `medical_aid`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ngo_id` (`ngo_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `medical_history`
--
ALTER TABLE `medical_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `medical_items`
--
ALTER TABLE `medical_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donor_id` (`donor_id`),
  ADD KEY `ngo_id` (`ngo_id`);

--
-- Indexes for table `medical_missions`
--
ALTER TABLE `medical_missions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ngo_id` (`ngo_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointment_id` (`appointment_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `mission_doctors`
--
ALTER TABLE `mission_doctors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `ngos`
--
ALTER TABLE `ngos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient_cases`
--
ALTER TABLE `patient_cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `specialties`
--
ALTER TABLE `specialties`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `support_groups`
--
ALTER TABLE `support_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `moderator_id` (`moderator_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_user_specialty` (`specialty_id`);

--
-- Indexes for table `workshops`
--
ALTER TABLE `workshops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `host_ngo_id` (`host_ngo_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `anonymous_sessions`
--
ALTER TABLE `anonymous_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `health_guides`
--
ALTER TABLE `health_guides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_aid`
--
ALTER TABLE `medical_aid`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_history`
--
ALTER TABLE `medical_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `medical_items`
--
ALTER TABLE `medical_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_missions`
--
ALTER TABLE `medical_missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `mission_doctors`
--
ALTER TABLE `mission_doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ngos`
--
ALTER TABLE `ngos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient_cases`
--
ALTER TABLE `patient_cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `specialties`
--
ALTER TABLE `specialties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `support_groups`
--
ALTER TABLE `support_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `workshops`
--
ALTER TABLE `workshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- قيود الجداول المُلقاة.
--

--
-- قيود الجداول `anonymous_sessions`
--
ALTER TABLE `anonymous_sessions`
  ADD CONSTRAINT `anonymous_sessions_ibfk_1` FOREIGN KEY (`therapist_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donations_ibfk_3` FOREIGN KEY (`case_id`) REFERENCES `patient_cases` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `patient_cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `support_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `medical_aid`
--
ALTER TABLE `medical_aid`
  ADD CONSTRAINT `medical_aid_ibfk_1` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_aid_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_aid_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `medical_items` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `medical_history`
--
ALTER TABLE `medical_history`
  ADD CONSTRAINT `medical_history_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `medical_items`
--
ALTER TABLE `medical_items`
  ADD CONSTRAINT `medical_items_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `medical_items_ibfk_2` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `medical_missions`
--
ALTER TABLE `medical_missions`
  ADD CONSTRAINT `medical_missions_ibfk_1` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `mission_doctors`
--
ALTER TABLE `mission_doctors`
  ADD CONSTRAINT `mission_doctors_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `medical_missions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mission_doctors_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `patient_cases`
--
ALTER TABLE `patient_cases`
  ADD CONSTRAINT `patient_cases_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `patient_cases` (`id`) ON DELETE CASCADE;

--
-- قيود الجداول `support_groups`
--
ALTER TABLE `support_groups`
  ADD CONSTRAINT `support_groups_ibfk_1` FOREIGN KEY (`moderator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- قيود الجداول `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_specialty` FOREIGN KEY (`specialty_id`) REFERENCES `specialties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- قيود الجداول `workshops`
--
ALTER TABLE `workshops`
  ADD CONSTRAINT `workshops_ibfk_1` FOREIGN KEY (`host_ngo_id`) REFERENCES `ngos` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
