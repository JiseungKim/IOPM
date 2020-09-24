-- Migration: init
-- Created at: 2020-09-24 16:43:37
-- ====  UP  ====

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(100) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `email` varchar(100) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `nickname` varchar(100) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `photo` varchar(500) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`uuid`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=euckr COLLATE=euckr_bin;


DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `desc` varchar(128) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `owner` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_idx` (`owner`),
  CONSTRAINT `owner` FOREIGN KEY (`owner`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=euckr COLLATE=euckr_bin;


DROP TABLE IF EXISTS `section`;
CREATE TABLE `section` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `name` varchar(100) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_section_project_idx` (`project_id`),
  CONSTRAINT `fk_section_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=euckr COLLATE=euckr_bin;


DROP TABLE IF EXISTS `team`;
CREATE TABLE `team` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `owner` varchar(50) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=euckr COLLATE=euckr_bin;


DROP TABLE IF EXISTS `todo`;
CREATE TABLE `todo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `description` varchar(3000) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `section_id` int(11) NOT NULL,
  `owner` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `importance` int(11) DEFAULT '1',
  `deadline` datetime DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_todo_section_idx` (`section_id`),
  KEY `fk_todo_member_idx` (`owner`),
  CONSTRAINT `fk_todo_member` FOREIGN KEY (`owner`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_todo_section` FOREIGN KEY (`section_id`) REFERENCES `section` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=euckr COLLATE=euckr_bin;

BEGIN;
DROP TABLE IF EXISTS `participation`;
CREATE TABLE `participation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id_idx` (`user_id`),
  KEY `fk_participation_project_idx` (`project_id`),
  CONSTRAINT `fk_participation_member` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_participation_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=euckr COLLATE=euckr_bin;
COMMIT;

-- ==== DOWN ====

BEGIN;
DELETE DATABASE `io_contents`;
COMMIT;