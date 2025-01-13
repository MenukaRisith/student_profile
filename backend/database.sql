-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 13, 2025 at 10:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_profile`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `achievementId` varchar(255) NOT NULL,
  `studentId` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`achievementId`, `studentId`, `date`, `description`) VALUES
('00c5f7ae-b942-4083-bc37-8eaf7e13f9c5', 'dcbd7770-266d-4111-949c-768dcd4082db', '2025-01-01', 'Test1234'),
('0fa30677-ee7d-47ae-b9b2-c8608cd73bf8', 'dcbd7770-266d-4111-949c-768dcd4082db', '2025-01-01', 'hello wolrd'),
('58f6f0e6-14c5-472f-8f79-906e039e3e75', 'dcbd7770-266d-4111-949c-768dcd4082db', '2025-01-01', 'test  12'),
('811f3346-760a-4b4a-a54d-70d8e6fcad47', 'dcbd7770-266d-4111-949c-768dcd4082db', '2025-01-07', 'sas');

-- --------------------------------------------------------

--
-- Table structure for table `behaviors`
--

CREATE TABLE `behaviors` (
  `behaviorId` varchar(36) NOT NULL,
  `studentId` varchar(36) NOT NULL,
  `type` enum('good','bad') NOT NULL,
  `description` text NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `behaviors`
--

INSERT INTO `behaviors` (`behaviorId`, `studentId`, `type`, `description`, `date`) VALUES
('2fbb1ddf-fdf0-4148-bec9-3d64e60c80cc', 'dcbd7770-266d-4111-949c-768dcd4082db', 'bad', 'tst1', '2025-01-01 22:07:55'),
('557b66a9-5061-4ba7-97ed-3f6f5b9e8336', 'dcbd7770-266d-4111-949c-768dcd4082db', 'bad', 'tst1', '2025-01-13 13:44:46'),
('a7bc7106-37df-440e-9c6b-0f445e0236a1', 'dcbd7770-266d-4111-949c-768dcd4082db', 'good', '123', '2025-01-01 22:07:52'),
('a8de6bdc-296c-4943-a69b-512612861c6d', 'dcbd7770-266d-4111-949c-768dcd4082db', 'good', 'test12', '2025-01-01 21:53:16');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `certId` varchar(255) NOT NULL,
  `studentId` varchar(255) NOT NULL,
  `issuedByUserId` varchar(255) NOT NULL,
  `issuedByName` varchar(255) NOT NULL,
  `dateIssued` date NOT NULL,
  `description` text NOT NULL,
  `behaviors` text DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `societyDetails` text DEFAULT NULL,
  `blockHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`certId`, `studentId`, `issuedByUserId`, `issuedByName`, `dateIssued`, `description`, `behaviors`, `achievements`, `societyDetails`, `blockHash`) VALUES
('39950e57-7598-4980-a5ef-fbca52f83128', 'dcbd7770-266d-4111-949c-768dcd4082db', 'a93303c2-c7f6-11ef-9e88-d843ae7b0098', 'admin@example.com', '2025-01-13', 'test1', '[{\"behaviorId\":\"2fbb1ddf-fdf0-4148-bec9-3d64e60c80cc\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"bad\",\"description\":\"tst1\",\"date\":\"2025-01-01T16:37:55.000Z\"},{\"behaviorId\":\"a7bc7106-37df-440e-9c6b-0f445e0236a1\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"good\",\"description\":\"123\",\"date\":\"2025-01-01T16:37:52.000Z\"},{\"behaviorId\":\"a8de6bdc-296c-4943-a69b-512612861c6d\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"good\",\"description\":\"test12\",\"date\":\"2025-01-01T16:23:16.000Z\"}]', '[{\"achievementId\":\"00c5f7ae-b942-4083-bc37-8eaf7e13f9c5\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"Test1234\"},{\"achievementId\":\"0fa30677-ee7d-47ae-b9b2-c8608cd73bf8\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"hello wolrd\"},{\"achievementId\":\"58f6f0e6-14c5-472f-8f79-906e039e3e75\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"test  12\"},{\"achievementId\":\"811f3346-760a-4b4a-a54d-70d8e6fcad47\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2025-01-06T18:30:00.000Z\",\"description\":\"sas\"}]', '[{\"roleId\":\"5acf9b9d-cb70-4673-91b0-22020d5e02f4\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"roleName\":\"President\",\"societyName\":\"ICT Society\",\"yearAppointed\":2023,\"yearEnded\":null},{\"roleId\":\"d3cb8ef1-18a6-4b99-90a2-ecf3c4240e98\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"roleName\":\"Member\",\"societyName\":\"Cadet Platoon\",\"yearAppointed\":2025,\"yearEnded\":null}]', '00097c0f323d1e61980f213c013e4328a31190c057f641c530ca778ee6f708ae'),
('c3a9ecf0-798c-4e6f-a419-ce14468dd4f1', 'dcbd7770-266d-4111-949c-768dcd4082db', 'a93303c2-c7f6-11ef-9e88-d843ae7b0098', 'admin@example.com', '2025-01-13', 'dss', '[{\"behaviorId\":\"2fbb1ddf-fdf0-4148-bec9-3d64e60c80cc\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"bad\",\"description\":\"tst1\",\"date\":\"2025-01-01T16:37:55.000Z\"},{\"behaviorId\":\"557b66a9-5061-4ba7-97ed-3f6f5b9e8336\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"bad\",\"description\":\"tst1\",\"date\":\"2025-01-13T08:14:46.000Z\"},{\"behaviorId\":\"a7bc7106-37df-440e-9c6b-0f445e0236a1\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"good\",\"description\":\"123\",\"date\":\"2025-01-01T16:37:52.000Z\"},{\"behaviorId\":\"a8de6bdc-296c-4943-a69b-512612861c6d\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"good\",\"description\":\"test12\",\"date\":\"2025-01-01T16:23:16.000Z\"}]', '[{\"achievementId\":\"00c5f7ae-b942-4083-bc37-8eaf7e13f9c5\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"Test1234\"},{\"achievementId\":\"0fa30677-ee7d-47ae-b9b2-c8608cd73bf8\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"hello wolrd\"},{\"achievementId\":\"58f6f0e6-14c5-472f-8f79-906e039e3e75\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"test  12\"},{\"achievementId\":\"811f3346-760a-4b4a-a54d-70d8e6fcad47\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2025-01-06T18:30:00.000Z\",\"description\":\"sas\"}]', '[{\"roleId\":\"5acf9b9d-cb70-4673-91b0-22020d5e02f4\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"roleName\":\"President\",\"societyName\":\"ICT Society\",\"yearAppointed\":2023,\"yearEnded\":null},{\"roleId\":\"d3cb8ef1-18a6-4b99-90a2-ecf3c4240e98\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"roleName\":\"Member\",\"societyName\":\"Cadet Platoon\",\"yearAppointed\":2025,\"yearEnded\":null}]', '00075fd9d26f541be30af04df4c60a9b2c47c6bfa68d4e75d5322a6981c36d97'),
('c61e4f21-8bc1-4cfe-822f-e1a0b5611388', 'dcbd7770-266d-4111-949c-768dcd4082db', 'a93303c2-c7f6-11ef-9e88-d843ae7b0098', 'admin@example.com', '2025-01-13', '112', '[{\"behaviorId\":\"2fbb1ddf-fdf0-4148-bec9-3d64e60c80cc\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"bad\",\"description\":\"tst1\",\"date\":\"2025-01-01T16:37:55.000Z\"},{\"behaviorId\":\"557b66a9-5061-4ba7-97ed-3f6f5b9e8336\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"bad\",\"description\":\"tst1\",\"date\":\"2025-01-13T08:14:46.000Z\"},{\"behaviorId\":\"a7bc7106-37df-440e-9c6b-0f445e0236a1\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"good\",\"description\":\"123\",\"date\":\"2025-01-01T16:37:52.000Z\"},{\"behaviorId\":\"a8de6bdc-296c-4943-a69b-512612861c6d\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"type\":\"good\",\"description\":\"test12\",\"date\":\"2025-01-01T16:23:16.000Z\"}]', '[{\"achievementId\":\"00c5f7ae-b942-4083-bc37-8eaf7e13f9c5\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"Test1234\"},{\"achievementId\":\"0fa30677-ee7d-47ae-b9b2-c8608cd73bf8\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"hello wolrd\"},{\"achievementId\":\"58f6f0e6-14c5-472f-8f79-906e039e3e75\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2024-12-31T18:30:00.000Z\",\"description\":\"test  12\"},{\"achievementId\":\"811f3346-760a-4b4a-a54d-70d8e6fcad47\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"date\":\"2025-01-06T18:30:00.000Z\",\"description\":\"sas\"}]', '[{\"roleId\":\"5acf9b9d-cb70-4673-91b0-22020d5e02f4\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"roleName\":\"President\",\"societyName\":\"ICT Society\",\"yearAppointed\":2023,\"yearEnded\":null},{\"roleId\":\"d3cb8ef1-18a6-4b99-90a2-ecf3c4240e98\",\"studentId\":\"dcbd7770-266d-4111-949c-768dcd4082db\",\"roleName\":\"Member\",\"societyName\":\"Cadet Platoon\",\"yearAppointed\":2025,\"yearEnded\":null}]', '0004d4c7562a65ece4cf4576151417785ff133e44b6983d278a08e1e856c5c90');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `requestId` varchar(255) NOT NULL,
  `type` enum('role','behavior','achievement') DEFAULT NULL,
  `studentId` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`requestId`, `type`, `studentId`, `details`, `status`, `createdAt`) VALUES
('0083398b-3253-4a30-a32f-38cacdabec93', 'role', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"roleName\":\"President\"}', 'approved', '2025-01-01 06:53:31'),
('3be2c29a-4d4b-4810-bac7-eb657fd68d70', 'achievement', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"description\":\"sas\"}', 'approved', '2025-01-07 03:28:38'),
('728f5e3e-2f98-4d8d-adbc-2d45251a4a84', 'role', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"roleName\":\"President\",\"societyName\":\"ICT Society\",\"yearAppointed\":2025,\"yearEnded\":null}', 'approved', '2025-01-01 07:34:58'),
('74d922d0-23e1-414f-80bb-688b4473b712', 'role', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"roleName\":\"Member\",\"societyName\":\"Cadet Platoon\",\"yearAppointed\":2025,\"yearEnded\":null}', 'approved', '2025-01-07 05:19:38'),
('8e845632-63bd-4c87-8846-59c7b2154967', 'behavior', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"type\":\"good\",\"description\":\"123\"}', 'approved', '2025-01-01 16:33:10'),
('b78d487b-c85f-4939-bf74-a5bc69b19e0f', 'behavior', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"type\":\"good\",\"description\":\"test12\"}', 'approved', '2025-01-01 16:23:08'),
('b89854b7-fbff-4c6b-bfc8-c73432c551fd', 'behavior', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"type\":\"good\",\"description\":\"test  12\"}', 'approved', '2025-01-01 15:40:22'),
('ce69adab-eb55-497c-8e84-69dff55667ed', 'behavior', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"type\":\"good\",\"description\":\"Test1234\"}', 'approved', '2025-01-01 16:21:16'),
('daf6ae62-8ce5-41b1-a5f8-c0d0aee257fa', 'achievement', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"description\":\"hello wolrd\"}', 'approved', '2025-01-01 16:33:24'),
('e8c0c26a-b7ba-4910-ae7f-b65010c5e8f2', 'behavior', 'dcbd7770-266d-4111-949c-768dcd4082db', '{\"type\":\"bad\",\"description\":\"tst1\"}', 'approved', '2025-01-01 16:33:35');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `roleId` varchar(255) NOT NULL,
  `studentId` varchar(255) NOT NULL,
  `roleName` varchar(255) NOT NULL,
  `societyName` varchar(255) NOT NULL,
  `yearAppointed` year(4) DEFAULT NULL,
  `yearEnded` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`roleId`, `studentId`, `roleName`, `societyName`, `yearAppointed`, `yearEnded`) VALUES
('5acf9b9d-cb70-4673-91b0-22020d5e02f4', 'dcbd7770-266d-4111-949c-768dcd4082db', 'President', 'ICT Society', '2023', NULL),
('d3cb8ef1-18a6-4b99-90a2-ecf3c4240e98', 'dcbd7770-266d-4111-949c-768dcd4082db', 'Member', 'Cadet Platoon', '2025', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `studentId` varchar(255) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `indexNumber` varchar(50) NOT NULL,
  `class` varchar(50) NOT NULL,
  `birthday` date DEFAULT NULL,
  `profilePicture` text DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `lastUpdated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`studentId`, `fullName`, `indexNumber`, `class`, `birthday`, `profilePicture`, `email`, `password`, `lastUpdated`) VALUES
('dcbd7770-266d-4111-949c-768dcd4082db', 'Menuka Risith Rupalal', '27293', '11B', '2008-10-10', '/uploads/4a79a1fd-54a1-48d2-8c05-1574ffcec949.jpg', 'menuka@example.com', '$2b$10$.YYONHr.1l2eyT5.j4Kayui1HrWMr1DiD6MY3egpoHFK.SRtPq64m', '2025-01-01 05:53:38');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `teacherId` varchar(255) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `class` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `userId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`teacherId`, `fullName`, `class`, `email`, `userId`) VALUES
('24345ce5-c7fa-11ef-9e88-d843ae7b0098', 'John Doe', '11B', 'teacher@example.com', 'a933eded-c7f6-11ef-9e88-d843ae7b0098');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','societyAdmin','admin') DEFAULT NULL,
  `profilePicture` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `email`, `password`, `role`, `profilePicture`, `createdAt`) VALUES
('a93303c2-c7f6-11ef-9e88-d843ae7b0098', 'admin@example.com', '$2b$10$4e4K9WxkVpq.QmYo508hmuBcMRvjso90nWgrqoewBlu.m3PyV65nW', 'admin', NULL, '2025-01-01 04:12:46'),
('a933eded-c7f6-11ef-9e88-d843ae7b0098', 'teacher@example.com', '$2b$10$4e4K9WxkVpq.QmYo508hmuBcMRvjso90nWgrqoewBlu.m3PyV65nW', 'teacher', NULL, '2025-01-01 04:12:46'),
('a9350f0c-c7f6-11ef-9e88-d843ae7b0098', 'societyadmin@example.com', '$2b$10$4e4K9WxkVpq.QmYo508hmuBcMRvjso90nWgrqoewBlu.m3PyV65nW', 'societyAdmin', NULL, '2025-01-01 04:12:46'),
('dcbd7770-266d-4111-949c-768dcd4082db', 'menuka@example.com', '$2b$10$.YYONHr.1l2eyT5.j4Kayui1HrWMr1DiD6MY3egpoHFK.SRtPq64m', 'student', NULL, '2025-01-01 06:34:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`achievementId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `behaviors`
--
ALTER TABLE `behaviors`
  ADD PRIMARY KEY (`behaviorId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certId`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`requestId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`roleId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentId`),
  ADD UNIQUE KEY `indexNumber` (`indexNumber`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`teacherId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`);

--
-- Constraints for table `behaviors`
--
ALTER TABLE `behaviors`
  ADD CONSTRAINT `behaviors_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`);

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`);

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `students` (`studentId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
