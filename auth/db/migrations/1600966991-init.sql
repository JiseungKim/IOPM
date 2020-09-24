-- Migration: init
-- Created at: 2020-09-24 16:43:37
-- ====  UP  ====

BEGIN;
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(100) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `host` varchar(45) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `firebase_uid` varchar(100) CHARACTER SET euckr COLLATE euckr_bin NOT NULL,
  `email` varchar(100) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `nickname` varchar(100) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `photo` varchar(500) CHARACTER SET euckr COLLATE euckr_bin DEFAULT NULL,
  `last_login` datetime NOT NULL,
  `created_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid_UNIQUE` (`uuid`),
  UNIQUE KEY `firebase_uid_UNIQUE` (`firebase_uid`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=euckr COLLATE=euckr_bin;
COMMIT;

-- ==== DOWN ====

BEGIN;
DELETE DATABASE `io_auth`;
COMMIT;