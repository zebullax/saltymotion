CREATE DATABASE  IF NOT EXISTS `saltymotion` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `saltymotion`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `account_status_ref`
--

DROP TABLE IF EXISTS `account_status_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_status_ref` (
  `ID` int NOT NULL,
  `description` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_status_ref`
--

LOCK TABLES `account_status_ref` WRITE;
/*!40000 ALTER TABLE `account_status_ref` DISABLE KEYS */;
INSERT INTO `account_status_ref` VALUES (0,'Created'),(1,'Confirmed'),(10,'Disabled'),(11,'Deleted');
/*!40000 ALTER TABLE `account_status_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `active_game__view`
--

DROP TABLE IF EXISTS `active_game__view`;
/*!50001 DROP VIEW IF EXISTS `active_game__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `active_game__view` AS SELECT 
 1 AS `gameID`,
 1 AS `name`,
 1 AS `nbAtelier`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `activity`
--

DROP TABLE IF EXISTS `activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `sourceTypeID` int NOT NULL,
  `sourceUserID` char(36) DEFAULT NULL,
  `targetTypeID` int NOT NULL,
  `targetUserID` char(36) DEFAULT NULL,
  `activityRefID` int NOT NULL,
  `linkedID` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isActive` tinyint DEFAULT '1',
  PRIMARY KEY (`ID`),
  KEY `FK__user_type__targetID_idx` (`sourceTypeID`),
  KEY `FK__user_type__targetID_idx1` (`targetTypeID`),
  KEY `FK__activity_ref__ID_idx` (`activityRefID`),
  CONSTRAINT `FK__activity_ref__ID` FOREIGN KEY (`activityRefID`) REFERENCES `activity_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK__user_type__sourceID` FOREIGN KEY (`sourceTypeID`) REFERENCES `user_type_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK__user_type__targetID` FOREIGN KEY (`targetTypeID`) REFERENCES `user_type_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `activity_ref`
--

DROP TABLE IF EXISTS `activity_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_ref` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_ref`
--

LOCK TABLES `activity_ref` WRITE;
/*!40000 ALTER TABLE `activity_ref` DISABLE KEYS */;
INSERT INTO `activity_ref` VALUES (1,'createAtelier'),(2,'acceptReview'),(3,'declineReview'),(4,'addAuction'),(5,'removeAuction'),(6,'updateAuction'),(7,'postReview'),(8,'transferBounty'),(9,'commentAtelier'),(10,'assignReview'),(11,'cancelAtelier'),(12,'buyCash');
/*!40000 ALTER TABLE `activity_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atelier`
--

DROP TABLE IF EXISTS `atelier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atelier` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `gameID` int NOT NULL,
  `originalName` char(36) NOT NULL,
  `uploaderID` char(36) NOT NULL,
  `reviewerID` char(36) DEFAULT NULL,
  `creationTimestamp` timestamp NULL DEFAULT NULL,
  `currentStatus` int DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  `bounty` int DEFAULT NULL,
  `isPrivate` tinyint NOT NULL DEFAULT '0',
  `score` int DEFAULT '0',
  `nbViews` int DEFAULT '0',
  `title` varchar(45) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `ID_idx` (`gameID`),
  KEY `atelier_atelierStatusRef_FK_idx` (`currentStatus`),
  CONSTRAINT `atelier_atelierStatusRef_FK` FOREIGN KEY (`currentStatus`) REFERENCES `atelier_status_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `gameRefFK` FOREIGN KEY (`gameID`) REFERENCES `game_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=360 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `atelier_aggregated_info__view`
--

DROP TABLE IF EXISTS `atelier_aggregated_info__view`;
/*!50001 DROP VIEW IF EXISTS `atelier_aggregated_info__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `atelier_aggregated_info__view` AS SELECT 
 1 AS `atelierID`,
 1 AS `originalName`,
 1 AS `creationTimestamp`,
 1 AS `reviewerID`,
 1 AS `reviewerNickname`,
 1 AS `uploaderID`,
 1 AS `uploaderNickname`,
 1 AS `bounty`,
 1 AS `gameName`,
 1 AS `currentStatus`,
 1 AS `gameID`,
 1 AS `isPrivate`,
 1 AS `description`,
 1 AS `title`,
 1 AS `score`,
 1 AS `nbViews`,
 1 AS `candidateReviewerID`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `atelier_auction`
--

DROP TABLE IF EXISTS `atelier_auction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atelier_auction` (
  `atelierID` int NOT NULL,
  `bounty` int NOT NULL,
  `timestamp` timestamp NOT NULL,
  `reviewerID` char(36) NOT NULL,
  PRIMARY KEY (`atelierID`,`reviewerID`),
  CONSTRAINT `atelier_ID` FOREIGN KEY (`atelierID`) REFERENCES `atelier` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `atelier_history`
--

DROP TABLE IF EXISTS `atelier_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atelier_history` (
  `atelierID` int NOT NULL,
  `statusID` int NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `metadata` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`atelierID`,`statusID`,`timestamp`),
  KEY `sessionStatusFK_idx` (`statusID`),
  CONSTRAINT `atelierFK` FOREIGN KEY (`atelierID`) REFERENCES `atelier` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `atelierStatusFK` FOREIGN KEY (`statusID`) REFERENCES `atelier_status_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `atelier_message`
--

DROP TABLE IF EXISTS `atelier_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atelier_message` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `atelierID` int NOT NULL,
  `userID` char(36) NOT NULL,
  `timestamp` timestamp NOT NULL,
  `content` varchar(1024) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK__atelier_message__atelier_ID_idx` (`atelierID`),
  CONSTRAINT `FK__atelier_message__atelier_ID` FOREIGN KEY (`atelierID`) REFERENCES `atelier` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `atelier_message__view`
--

DROP TABLE IF EXISTS `atelier_message__view`;
/*!50001 DROP VIEW IF EXISTS `atelier_message__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `atelier_message__view` AS SELECT 
 1 AS `messageID`,
 1 AS `atelierID`,
 1 AS `userID`,
 1 AS `userNickname`,
 1 AS `timestamp`,
 1 AS `content`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `atelier_status_ref`
--

DROP TABLE IF EXISTS `atelier_status_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atelier_status_ref` (
  `ID` int NOT NULL,
  `description` varchar(45) DEFAULT NULL,
  `isError` tinyint DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atelier_status_ref`
--

LOCK TABLES `atelier_status_ref` WRITE;
/*!40000 ALTER TABLE `atelier_status_ref` DISABLE KEYS */;
INSERT INTO `atelier_status_ref` VALUES (0,'Created',0),(10,'Auction',0),(20,'Adjuged',0),(30,'In progress',0),(50,'Complete',0),(60,'Cancelled',0),(70,'Deleted',0),(700,'Error on create',1),(800,'Error on mux',1),(900,'Error on accept',1),(999,'Unknown',1);
/*!40000 ALTER TABLE `atelier_status_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atelier_tag`
--

DROP TABLE IF EXISTS `atelier_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atelier_tag` (
  `atelierID` int NOT NULL AUTO_INCREMENT,
  `tagID` int NOT NULL,
  PRIMARY KEY (`atelierID`,`tagID`),
  KEY `tagRefIDFK_idx` (`tagID`),
  CONSTRAINT `atelierITag_atelier_atelierID_FK` FOREIGN KEY (`atelierID`) REFERENCES `atelier` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `atelierTag_tagRef_tagID_FK` FOREIGN KEY (`tagID`) REFERENCES `tag_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=341 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth`
--

DROP TABLE IF EXISTS `auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth` (
  `userID` char(36) NOT NULL,
  `googleID` varchar(90) DEFAULT NULL,
  `twitchID` varchar(90) DEFAULT NULL,
  `twitterID` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_follower`
--

DROP TABLE IF EXISTS `game_follower`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_follower` (
  `userID` char(36) NOT NULL,
  `gameID` int NOT NULL,
  PRIMARY KEY (`userID`,`gameID`),
  KEY `FK__IDgame__IDgame_ref_idx` (`gameID`),
  CONSTRAINT `FK__IDgame__IDgame_ref` FOREIGN KEY (`gameID`) REFERENCES `game_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `game_ref`
--

DROP TABLE IF EXISTS `game_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_ref` (
  `ID` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `releaseYear` int unsigned DEFAULT NULL,
  `editor` varchar(45) DEFAULT NULL,
  `introduction` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_ref`
--

LOCK TABLES `game_ref` WRITE;
/*!40000 ALTER TABLE `game_ref` DISABLE KEYS */;
INSERT INTO `game_ref` VALUES (0,'Street Fighter V',2016,'Capcom','Street Fighter V is a fighting game developed by Capcom and Dimps and published by Capcom for the PlayStation 4 and Microsoft Windows in 2016.'),(1,'Tekken 7',2015,'Bandai Namco','Tekken 7 is a fighting game developed and published by Bandai Namco Entertainment. It is the ninth overall installment in the Tekken series. Tekken 7 had a limited arcade release in March 2015. '),(2,'League Of Legends',2009,'Riot Games','League of Legends is a 2009 multiplayer online battle arena video game developed and published by Riot Games for Microsoft Windows and macOS. Originally inspired by Defense of the Ancients, the game has followed a freemium model since its release on Octob'),(3,'Overwatch',2015,'Blizzard Entertainment','Overwatch is a team-based multiplayer first-person shooter developed and published by Blizzard Entertainment.'),(4,'Guilty Gear Xrd Rev2',2015,'Arc System Works','Guilty Gear Xrd is a fighting video game sub-series by Arc System Works and part of the Guilty Gear series. Guilty Gear Xrd was developed using Unreal Engine 3, with cel-shaded graphics in place of the series traditional hand drawn sprites.'),(5,'Poker',1900,'You Me Everybody','Texas hold \'em is one of the most popular variants of the card game of poker. Two cards, known as hole cards, are dealt face down to each player, and then five community cards are dealt face up in three stages. The stages consist of a series of three card'),(6,'Mario Kart 8',2014,'Nintendo','Mario Kart 8 is a 2014 kart racing game developed and published by Nintendo for its Wii U home video game console in May 2014. It retains Mario Kart series game mechanics, where players control Mario franchise characters in kart racing, collecting a varie'),(7,'Dragon Ball Fighter Z',2018,'Bandai Namco','Dragon Ball FighterZ is a 3D fighting game, simulating 2D, developed by Arc System Works and published by Bandai Namco Entertainment.'),(8,'Counter Strike GO',2012,'Valve','Counter-Strike: Global Offensive is a multiplayer first-person shooter video game developed by Valve and Hidden Path Entertainment. It is the fourth game in the Counter-Strike series and was released for Windows, macOS, Xbox 360, and PlayStation 3 in Augu'),(9,'DOTA2',2013,'Valve','Dota 2 is a multiplayer online battle arena video game developed and published by Valve. The game is a sequel to Defense of the Ancients, which was a community-created mod for Blizzard Entertainment\'s Warcraft III: Reign of Chaos and its expansion pack, T'),(10,'Magic The Gathering',1993,'Wizards of the Coast','Magic: The Gathering is a collectible and digital collectible card game created by Richard Garfield. '),(11,'Startcraft 2',2010,'Blizzard Entertainment','StarCraft II: Wings of Liberty is a science fiction real-time strategy video game developed and published by Blizzard Entertainment. It was released worldwide in July 2010 for Microsoft Windows and Mac OS X.'),(12,'Super Smash Bros Ultimate',2018,'Nintendo','Super Smash Bros. Ultimate is a 2018 crossover fighting game developed by Bandai Namco Studios and Sora Ltd. and published by Nintendo for the Nintendo Switch. It is the fifth installment in the Super Smash Bros. series, succeeding Super Smash Bros. for N'),(13,'Hearthstone',2014,'Blizzard Entertainment','Hearthstone is a free-to-play online digital collectible card game developed and published by Blizzard Entertainment. Originally subtitled Heroes of Warcraft, Hearthstone builds upon the existing lore of the Warcraft series by using the same elements, cha'),(14,'Fortnite',2017,'Epic Games','Fortnite is an online video game developed by Epic Games and released in 2017. It is available in three distinct game mode versions that otherwise share the same general gameplay and game engine...'),(15,'APEX Legends',2019,'Electronic Arts','Apex Legends is a free-to-play first-person hero shooter battle royale game developed by Respawn Entertainment and published by Electronic Arts. It was released for Microsoft Windows, PlayStation 4, and Xbox One on February 4, 2019, without any prior anno'),(16,'Dead By Daylight',2016,'Behaviour Interactive','Dead by Daylight is an asymmetric survival horror video game developed by Behaviour Interactive. Dead by Daylight was released for Microsoft Windows in June 2016, released on PlayStation 4 and Xbox One...'),(17,'Call Of Duty - Warzone',2020,'Activision','Call of Duty: Warzone is a free-to-play battle royale video game released on March 10, 2020, for PlayStation 4, Xbox One, and Microsoft Windows. The game is a part of the 2019 title Call of Duty: Modern Warfare and the 2020 title Call of Duty: Black Ops C'),(18,'Mortal Kombat 11',2019,'NetherRealm Studios','Mortal Kombat 11 is a fighting game developed by NetherRealm Studios and published by Warner Bros. Interactive Entertainment.'),(19,'PlayerUnknown\'s Battleground',2017,'PUBG Corporation','PlayerUnknown\'s Battlegrounds (PUBG) is an online multiplayer battle royale game developed and published by PUBG Corporation.'),(20,'Team Fight Tactics',2019,'Riot Games','Teamfight Tactics is an auto battler game developed and published by Riot Games. The game is a spinoff of League of Legends and is based on Dota Auto Chess, where players compete online against seven other opponents by building a team to be the last one standing.'),(21,'Legends Of Runeterra',2020,'Riot Games','Legends of Runeterra is a free-to-play digital collectible card game developed and published by Riot Games. It released on April 29, 2020 for Microsoft Windows, Android, and iOS. The game was released in open beta for Microsoft Windows on January 24, 2020'),(22,'Valorant',2020,'Riot Games','Valorant is a free-to-play multiplayer tactical first-person hero shooter developed and published by Riot Games, for Microsoft Windows. First teased under the codename Project A in October 2019, the game began a closed beta period with limited access on A'),(23,'FIFA 20',2019,'Electronic Arts','FIFA 20 is a football simulation video game published by Electronic Arts as part of the FIFA series. It is the 27th installment in the FIFA series, and was released on 27 September 2019 for Microsoft Windows, PlayStation 4, Xbox One, and Nintendo Switch. '),(24,'NHL 20',2019,'Electronic Arts','NHL 20 is an ice hockey simulation video game developed by EA Vancouver and published by EA Sports. It was released globally on Xbox One and PlayStation 4 on September 13, 2019.'),(25,'NBA 2K19',2018,'Visual Concepts','NBA 2K19 is a basketball simulation video game developed by Visual Concepts and published by 2K Sports. It is the 20th installment in the NBA 2K franchise and the successor to NBA 2K16. It was released worldwide on September 20, 2016, for Microsoft Window'),(26,'Madden NFL20',2019,'Electronic Arts','Madden NFL 20 is an American football video game based on the National Football League, developed by EA Tiburon and published by Electronic Arts. The latest installment in the long-running Madden NFL series, the game was released for PlayStation 4, Xbox O'),(27,'Ultra Street Fighter IV',2014,'Capcom','Ultra Street Fighter IV is a 2.5D fighting game, and is an update of Super Street Fighter IV: Arcade Edition and the fourth update to the Street Fighter IV series overall. It features five additional characters, six additional stages, and character tweaks'),(28,'Granblue Fantasy: Versus',2019,'Cygames','Granblue Fantasy Versus is a 2.5D fighting game developed by Arc System Works for the PlayStation 4.'),(29,'Killer Instinct',1994,'Rare','Killer Instinct is a fighting video game developed by Rare and published by Midway. It was released as an arcade game in the fall of 1994 and, the following year, ported to the Super Nintendo Entertainment System and the Game Boy.'),(30,'King Of Fighters XIV',2016,'SNK','The King of Fighters XIV is a 2016 Japanese fighting game. Part of SNK\'s franchise The King of Fighters series, with this installment being published by Atlus USA in North America and Deep Silver in Europe.'),(31,'King Of Fighters XIII',2010,'SNK','The King of Fighters XIII is a fighting game in The King of Fighters series, developed and published by SNK Playmore originally in 2010.'),(32,'Skullgirls',2012,'Autumn Games','Skullgirls is a 2D fighting game developed by Reverge Labs and published by Autumn Games. The game was released through the PlayStation Network and Xbox Live Arcade in North America, Europe, and Australia'),(33,'Splatoon 2',2017,'Nintendo','Splatoon 2 is a 2017 third-person shooter game developed and published by Nintendo for the Nintendo Switch. It was released on July 21, 2017 and is a direct sequel to Splatoon, which includes a new story-driven single-player mode and various online multip'),(34,'Soulcalibur VI',2018,'Bandai Namco','Soulcalibur VI is a fighting game developed by Bandai Namco Studios and published by Bandai Namco Entertainment for the PlayStation 4, Xbox One, and Microsoft Windows in 2018. It is seventh main installment in the Soulcalibur series.'),(35,'BlazBlue: Cross Tag Battle',2018,'Arc System Works','BlazBlue: Cross Tag Battle is a 2D crossover fighting game developed and published by Arc System Works, and released on PlayStation 4, Nintendo Switch and Microsoft Windows. It features characters from different franchises, including BlazBlue, Persona 4 A'),(36,'Super Smash Bros Melee',2001,'Nintendo','Super Smash Bros. Melee is a 2001 crossover fighting video game developed by HAL Laboratory and published by Nintendo for the GameCube. It is the second installment in the Super Smash Bros. series. It features characters from Nintendo video game franchise'),(37,'NBA 2K20',2019,'Visual Concepts','NBA 2K20 is a basketball simulation video game developed by Visual Concepts and published by 2K Sports, based on the National Basketball Association. It is the 21st installment in the NBA 2K franchise, the successor to NBA 2K19, and the predecessor to NBA'),(38,'Guilty Gear Strive',2021,'Arc System Works','Guilty Gear Strive is a fighting video game developed and published by Arc System Works. It is the seventh mainline installment of the Guilty Gear series, and the 25th overall');
/*!40000 ALTER TABLE `game_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `language_ref`
--

DROP TABLE IF EXISTS `language_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `language_ref` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` char(49) CHARACTER SET utf8mb3 DEFAULT NULL,
  `iso_639-1` char(2) CHARACTER SET utf8mb3 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `language_ref`
--

LOCK TABLES `language_ref` WRITE;
/*!40000 ALTER TABLE `language_ref` DISABLE KEYS */;
INSERT INTO `language_ref` VALUES (1,'English','en'),(2,'Afar','aa'),(3,'Abkhazian','ab'),(4,'Afrikaans','af'),(5,'Amharic','am'),(6,'Arabic','ar'),(7,'Assamese','as'),(8,'Aymara','ay'),(9,'Azerbaijani','az'),(10,'Bashkir','ba'),(11,'Belarusian','be'),(12,'Bulgarian','bg'),(13,'Bihari','bh'),(14,'Bislama','bi'),(15,'Bengali/Bangla','bn'),(16,'Tibetan','bo'),(17,'Breton','br'),(18,'Catalan','ca'),(19,'Corsican','co'),(20,'Czech','cs'),(21,'Welsh','cy'),(22,'Danish','da'),(23,'German','de'),(24,'Bhutani','dz'),(25,'Greek','el'),(26,'Esperanto','eo'),(27,'Spanish','es'),(28,'Estonian','et'),(29,'Basque','eu'),(30,'Persian','fa'),(31,'Finnish','fi'),(32,'Fiji','fj'),(33,'Faeroese','fo'),(34,'French','fr'),(35,'Frisian','fy'),(36,'Irish','ga'),(37,'Scots/Gaelic','gd'),(38,'Galician','gl'),(39,'Guarani','gn'),(40,'Gujarati','gu'),(41,'Hausa','ha'),(42,'Hindi','hi'),(43,'Croatian','hr'),(44,'Hungarian','hu'),(45,'Armenian','hy'),(46,'Interlingua','ia'),(47,'Interlingue','ie'),(48,'Inupiak','ik'),(49,'Indonesian','in'),(50,'Icelandic','is'),(51,'Italian','it'),(52,'Hebrew','iw'),(53,'Japanese','ja'),(54,'Yiddish','ji'),(55,'Javanese','jw'),(56,'Georgian','ka'),(57,'Kazakh','kk'),(58,'Greenlandic','kl'),(59,'Cambodian','km'),(60,'Kannada','kn'),(61,'Korean','ko'),(62,'Kashmiri','ks'),(63,'Kurdish','ku'),(64,'Kirghiz','ky'),(65,'Latin','la'),(66,'Lingala','ln'),(67,'Laothian','lo'),(68,'Lithuanian','lt'),(69,'Latvian/Lettish','lv'),(70,'Malagasy','mg'),(71,'Maori','mi'),(72,'Macedonian','mk'),(73,'Malayalam','ml'),(74,'Mongolian','mn'),(75,'Moldavian','mo'),(76,'Marathi','mr'),(77,'Malay','ms'),(78,'Maltese','mt'),(79,'Burmese','my'),(80,'Nauru','na'),(81,'Nepali','ne'),(82,'Dutch','nl'),(83,'Norwegian','no'),(84,'Occitan','oc'),(85,'(Afan)/Oromoor/Oriya','om'),(86,'Punjabi','pa'),(87,'Polish','pl'),(88,'Pashto/Pushto','ps'),(89,'Portuguese','pt'),(90,'Quechua','qu'),(91,'Rhaeto-Romance','rm'),(92,'Kirundi','rn'),(93,'Romanian','ro'),(94,'Russian','ru'),(95,'Kinyarwanda','rw'),(96,'Sanskrit','sa'),(97,'Sindhi','sd'),(98,'Sangro','sg'),(99,'Serbo-Croatian','sh'),(100,'Singhalese','si'),(101,'Slovak','sk'),(102,'Slovenian','sl'),(103,'Samoan','sm'),(104,'Shona','sn'),(105,'Somali','so'),(106,'Albanian','sq'),(107,'Serbian','sr'),(108,'Siswati','ss'),(109,'Sesotho','st'),(110,'Sundanese','su'),(111,'Swedish','sv'),(112,'Swahili','sw'),(113,'Tamil','ta'),(114,'Telugu','te'),(115,'Tajik','tg'),(116,'Thai','th'),(117,'Tigrinya','ti'),(118,'Turkmen','tk'),(119,'Tagalog','tl'),(120,'Setswana','tn'),(121,'Tonga','to'),(122,'Turkish','tr'),(123,'Tsonga','ts'),(124,'Tatar','tt'),(125,'Twi','tw'),(126,'Ukrainian','uk'),(127,'Urdu','ur'),(128,'Uzbek','uz'),(129,'Vietnamese','vi'),(130,'Volapuk','vo'),(131,'Wolof','wo'),(132,'Xhosa','xh'),(133,'Yoruba','yo'),(134,'Chinese','zh'),(135,'Zulu','zu');
/*!40000 ALTER TABLE `language_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `latest_auction__view`
--

DROP TABLE IF EXISTS `latest_auction__view`;
/*!50001 DROP VIEW IF EXISTS `latest_auction__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `latest_auction__view` AS SELECT 
 1 AS `timestamp`,
 1 AS `atelierID`,
 1 AS `bounty`,
 1 AS `reviewerID`,
 1 AS `nickname`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `nb_atelier_per_game__view`
--

DROP TABLE IF EXISTS `nb_atelier_per_game__view`;
/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_game__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `nb_atelier_per_game__view` AS SELECT 
 1 AS `ID`,
 1 AS `nbAtelier`,
 1 AS `name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `nb_atelier_per_game_per_status__view`
--

DROP TABLE IF EXISTS `nb_atelier_per_game_per_status__view`;
/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_game_per_status__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `nb_atelier_per_game_per_status__view` AS SELECT 
 1 AS `ID`,
 1 AS `nbAtelier`,
 1 AS `currentStatus`,
 1 AS `name`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `nb_atelier_per_game_per_tag__view`
--

DROP TABLE IF EXISTS `nb_atelier_per_game_per_tag__view`;
/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_game_per_tag__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `nb_atelier_per_game_per_tag__view` AS SELECT 
 1 AS `gameID`,
 1 AS `gameName`,
 1 AS `tagID`,
 1 AS `nbAtelier`,
 1 AS `tagDescription`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `nb_atelier_per_reviewer_per_game__view`
--

DROP TABLE IF EXISTS `nb_atelier_per_reviewer_per_game__view`;
/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_reviewer_per_game__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `nb_atelier_per_reviewer_per_game__view` AS SELECT 
 1 AS `reviewerID`,
 1 AS `gameID`,
 1 AS `gameName`,
 1 AS `nb_atelier`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `nb_atelier_per_reviewer_per_tag__view`
--

DROP TABLE IF EXISTS `nb_atelier_per_reviewer_per_tag__view`;
/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_reviewer_per_tag__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `nb_atelier_per_reviewer_per_tag__view` AS SELECT 
 1 AS `reviewerID`,
 1 AS `tagID`,
 1 AS `nb_atelier`,
 1 AS `tagDescription`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `activityID` int NOT NULL,
  `lastObserved` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activityID`),
  CONSTRAINT `FK__activity__ID` FOREIGN KEY (`activityID`) REFERENCES `activity` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registration_stash`
--

DROP TABLE IF EXISTS `registration_stash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration_stash` (
  `userID` char(36) NOT NULL,
  `uuid` char(36) NOT NULL,
  `expire` timestamp NOT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `reset_password_stash`
--

DROP TABLE IF EXISTS `reset_password_stash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reset_password_stash` (
  `userID` char(36) NOT NULL,
  `secret` char(36) NOT NULL,
  `expire` timestamp NOT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reviewer`
--

DROP TABLE IF EXISTS `reviewer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviewer` (
  `userID` char(36) NOT NULL,
  `gameID` int NOT NULL,
  `minimumBounty` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`userID`,`gameID`),
  KEY `reviewer_gameID__game_ID_idx` (`gameID`),
  CONSTRAINT `reviewer_gameID__game_ID` FOREIGN KEY (`gameID`) REFERENCES `game_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reviewer_follower`
--

DROP TABLE IF EXISTS `reviewer_follower`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviewer_follower` (
  `userID` char(36) NOT NULL,
  `reviewerID` char(36) NOT NULL,
  PRIMARY KEY (`userID`,`reviewerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `reviewer_game_pool__view`
--

DROP TABLE IF EXISTS `reviewer_game_pool__view`;
/*!50001 DROP VIEW IF EXISTS `reviewer_game_pool__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `reviewer_game_pool__view` AS SELECT 
 1 AS `userID`,
 1 AS `gamePool`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `reviewer_profile__view`
--

DROP TABLE IF EXISTS `reviewer_profile__view`;
/*!50001 DROP VIEW IF EXISTS `reviewer_profile__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `reviewer_profile__view` AS SELECT 
 1 AS `ID`,
 1 AS `countryCode`,
 1 AS `timezone`,
 1 AS `registrationDate`,
 1 AS `selfIntroduction`,
 1 AS `name`,
 1 AS `twitterName`,
 1 AS `twitchName`,
 1 AS `youtubeName`,
 1 AS `gameID`,
 1 AS `gameName`,
 1 AS `nb_atelier`,
 1 AS `avgScore`,
 1 AS `minimumBounty`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `reviewer_profile_aggregated_game_pool__view`
--

DROP TABLE IF EXISTS `reviewer_profile_aggregated_game_pool__view`;
/*!50001 DROP VIEW IF EXISTS `reviewer_profile_aggregated_game_pool__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `reviewer_profile_aggregated_game_pool__view` AS SELECT 
 1 AS `ID`,
 1 AS `name`,
 1 AS `selfIntroduction`,
 1 AS `twitterName`,
 1 AS `twitchName`,
 1 AS `youtubeName`,
 1 AS `countryCode`,
 1 AS `timezone`,
 1 AS `registrationDate`,
 1 AS `gamePool`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `sns_account`
--

DROP TABLE IF EXISTS `sns_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sns_account` (
  `userID` char(36) NOT NULL,
  `twitterName` varchar(45) DEFAULT NULL,
  `twitchName` varchar(45) DEFAULT NULL,
  `youtubeName` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tag_ref`
--

DROP TABLE IF EXISTS `tag_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag_ref` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `description` varchar(25) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag_ref`
--

LOCK TABLES `tag_ref` WRITE;
/*!40000 ALTER TABLE `tag_ref` DISABLE KEYS */;
INSERT INTO `tag_ref` VALUES (1,'Basic'),(2,'Game Theory'),(3,'Beginner'),(4,'Anti Air'),(5,'Execution'),(20,'Mind Game'),(22,'FPS'),(23,'Salt'),(26,'Fighting Games'),(27,'Strategy Games');
/*!40000 ALTER TABLE `tag_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `the_vault`
--

DROP TABLE IF EXISTS `the_vault`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `the_vault` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `atelierID` int NOT NULL,
  `senderTypeID` int NOT NULL,
  `senderID` char(36) NOT NULL,
  `receiverTypeID` int NOT NULL,
  `receiverID` char(36) NOT NULL,
  `amount` int NOT NULL,
  `timestamp` timestamp NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `theVaultAtelierFK_idx` (`atelierID`),
  KEY `theVault__user_type_ref__senderType_idx` (`senderTypeID`,`receiverTypeID`),
  CONSTRAINT `theVaultAtelierFK` FOREIGN KEY (`atelierID`) REFERENCES `atelier` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transfer_batch`
--

DROP TABLE IF EXISTS `transfer_batch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer_batch` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `userID` char(36) NOT NULL,
  `stripeAccountID` varchar(45) NOT NULL,
  `transferredCoin` int NOT NULL,
  `done` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `ID` char(36) NOT NULL,
  `password` char(60) DEFAULT NULL,
  `nickname` varchar(25) NOT NULL,
  `registrationDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(45) DEFAULT '',
  `selfIntroduction` text,
  `accountStatusID` int NOT NULL DEFAULT '0',
  `countryCode` varchar(5) NOT NULL DEFAULT 'JP',
  `timezone` varchar(45) DEFAULT 'Asia/Tokyo',
  `stripeAccountID` varchar(45) DEFAULT NULL COMMENT 'Use as destination when doing transfer to a Stripe connected account',
  `stripeCustomerID` varchar(45) DEFAULT NULL COMMENT 'Use as Stripe account ID when creating a charge',
  `frozenCoin` int unsigned NOT NULL DEFAULT '0',
  `freeCoin` int unsigned NOT NULL DEFAULT '0',
  `redeemableCoin` int unsigned NOT NULL DEFAULT '0' COMMENT 'Reviewer gets the bounty coin in the transferred coin field, used later for Stripe transfer',
  `facebookProfile` varchar(45) DEFAULT NULL,
  `twitterProfile` varchar(45) DEFAULT NULL,
  `isNotifyOnReviewOpportunity` tinyint DEFAULT '1',
  `isNotifyOnReviewComplete` tinyint DEFAULT '1',
  `isNotifyOnNewComment` tinyint DEFAULT '1',
  `isNotifyOnFavoriteActivity` tinyint DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `nickname_UNIQUE` (`nickname`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `stripeID_UNIQUE` (`stripeAccountID`),
  UNIQUE KEY `stripeCustomerID_UNIQUE` (`stripeCustomerID`),
  KEY `accountStatusFK_idx` (`accountStatusID`),
  CONSTRAINT `accountStatusFK` FOREIGN KEY (`accountStatusID`) REFERENCES `account_status_ref` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_language`
--

DROP TABLE IF EXISTS `user_language`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_language` (
  `languageID` int unsigned NOT NULL,
  `userID` char(36) NOT NULL,
  `languageIsoCode` char(2) DEFAULT NULL,
  PRIMARY KEY (`languageID`,`userID`),
  KEY `language_ID_idx` (`languageID`),
  CONSTRAINT `language_ref__language_id` FOREIGN KEY (`languageID`) REFERENCES `language_ref` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `user_notification__view`
--

DROP TABLE IF EXISTS `user_notification__view`;
/*!50001 DROP VIEW IF EXISTS `user_notification__view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_notification__view` AS SELECT 
 1 AS `activityID`,
 1 AS `isActive`,
 1 AS `sourceTypeID`,
 1 AS `sourceUserID`,
 1 AS `sourceUserNickname`,
 1 AS `targetTypeID`,
 1 AS `targetUserID`,
 1 AS `targetUserNickname`,
 1 AS `activityRefID`,
 1 AS `linkedID`,
 1 AS `activityRefName`,
 1 AS `createdAt`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `user_type_ref`
--

DROP TABLE IF EXISTS `user_type_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_type_ref` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_type_ref`
--

LOCK TABLES `user_type_ref` WRITE;
/*!40000 ALTER TABLE `user_type_ref` DISABLE KEYS */;
INSERT INTO `user_type_ref` VALUES (0,'application'),(1,'user');
/*!40000 ALTER TABLE `user_type_ref` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'saltymotion'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `clean_expired_secret` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb3 */ ;;
/*!50003 SET character_set_results = utf8mb3 */ ;;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'UTC' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`zebullon`@`%`*/ /*!50106 EVENT `clean_expired_secret` ON SCHEDULE EVERY 1 DAY STARTS '2019-07-27 11:00:00' ON COMPLETION PRESERVE ENABLE COMMENT 'Clean expired validation link from stash table' DO BEGIN

call saltymotion.clear_secret_stash();

END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `prepare_transfer_batch_table` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb3 */ ;;
/*!50003 SET character_set_results = utf8mb3 */ ;;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'UTC' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`zebullon`@`%`*/ /*!50106 EVENT `prepare_transfer_batch_table` ON SCHEDULE EVERY 1 MONTH STARTS '2020-07-24 03:43:57' ON COMPLETION PRESERVE ENABLE COMMENT 'Fill transfer table with applicable amounts' DO BEGIN
	DECLARE TRANSFER_THRESHOLD INT DEFAULT 500;

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	START TRANSACTION;

    # Fill the batch table with accounts with enough freeCoin to pass transfer
	INSERT INTO `transfer_batch`(`userID`, auth.`stripeAccountID`, `transferredCoin`)
		SELECT `ID`, auth.`stripeAccountID`, `transferredCoin`
		FROM user LEFT JOIN auth ON user.ID = auth.userID
		WHERE transferredCoin >= TRANSFER_THRESHOLD AND auth.stripeAccountID IS NOT NULL;

UPDATE user 
SET 
    transferredCoin = 0
WHERE
    ID > 0
        AND transferredCoin >= TRANSFER_THRESHOLD
        AND ID IN (SELECT `ID`, auth.`stripeAccountID`, `transferredCoin`
		FROM user LEFT JOIN auth ON user.ID = auth.userID
		WHERE transferredCoin >= TRANSFER_THRESHOLD AND auth.stripeAccountID IS NOT NULL);
    
    COMMIT;
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'saltymotion'
--
/*!50003 DROP FUNCTION IF EXISTS `SPLIT_STRING` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` FUNCTION `SPLIT_STRING`(
	str VARCHAR(255) ,
	delim VARCHAR(12) ,
	pos INT
) RETURNS varchar(255) CHARSET utf8mb3
    DETERMINISTIC
BEGIN 
 RETURN REPLACE(
	SUBSTRING(
		SUBSTRING_INDEX(str , delim , pos) ,
		CHAR_LENGTH(
			SUBSTRING_INDEX(str , delim , pos - 1)
		) + 1
	) ,
	delim ,
	''
);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `uuid_v4` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` FUNCTION `uuid_v4`() RETURNS char(36) CHARSET utf8mb3
    NO SQL
BEGIN
    -- Generate 8 2-byte strings that we will combine into a UUIDv4
    SET @h1 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h2 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h3 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h6 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h7 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');
    SET @h8 = LPAD(HEX(FLOOR(RAND() * 0xffff)), 4, '0');

    -- 4th section will start with a 4 indicating the version
    SET @h4 = CONCAT('4', LPAD(HEX(FLOOR(RAND() * 0x0fff)), 3, '0'));

    -- 5th section first half-byte can only be 8, 9 A or B
    SET @h5 = CONCAT(HEX(FLOOR(RAND() * 4 + 8)),
                LPAD(HEX(FLOOR(RAND() * 0x0fff)), 3, '0'));

    -- Build the complete UUID
    RETURN LOWER(CONCAT(
        @h1, @h2, '-', @h3, '-', @h4, '-', @h5, '-', @h6, @h7, @h8
    ));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `abort_atelier_creation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `abort_atelier_creation`(
	in atelierID_ INT(11),
	in errorStatusID_ INT(11)
)
BEGIN
	DECLARE cancellationTimestamp datetime;
    	
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
        
	START TRANSACTION;
    SELECT @maxBounty := max(bounty) from atelier_auction where atelierID = atelierID_;

    SET cancellationTimestamp = now();
	SELECT @uploaderID := uploaderID from atelier where ID = atelierID_;

	UPDATE atelier SET currentStatus = errorStatusID_  WHERE ID = atelierID_;
    INSERT INTO atelier_history (atelierID, statusID, timestamp) VALUES (atelierID_, errorStatusID_, cancellationTimestamp);
    
    # Unfreeze the coins corresponding to the max auction bounty
	IF @maxBounty > 0 THEN
		UPDATE user SET frozenCoin = frozenCoin - @maxBounty, freeCoin = freeCoin + @maxBounty where ID = @uploaderID;
	END IF;

	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `accept_atelier` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `accept_atelier`(
	IN atelierID_ INT(11),
    IN reviewerID_ CHAR(36)
)
BEGIN

	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
	START TRANSACTION;

    SET @acceptTimestamp = now();
	SET @ACCEPT_REVIEW_ID = 2;
    SET @ASSIGN_REVIEW_ID = 10;
    
    SELECT @uploaderID := uploaderID from atelier where ID = atelierID_;
	
    UPDATE atelier 
	SET 
		reviewerID = reviewerID_,
		currentStatus = 30,
		bounty = (SELECT 
				bounty
			FROM
				atelier_auction
			WHERE
				reviewerID = reviewerID_
					AND atelierID = atelierID_)
	WHERE
		ID = atelierID_;

    INSERT INTO atelier_history (atelierID, statusID, `timestamp`) 
		VALUES (atelierID_, 30, @acceptTimestamp);

    # Activity: [reviewer -> 'accept atelier' -> uploader]
    INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`, `targetUserID`, `activityRefID`,`linkedID`)
			VALUES (1, reviewerID_, 1, @uploaderID, @ACCEPT_REVIEW_ID, atelierID_);

	# Record the [uploader -> 'assign atelier' -> reviewer] activity
    INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`, `targetUserID`, `activityRefID`, `linkedID`)
			VALUES (1, @uploaderID, 1, reviewerID_, @ASSIGN_REVIEW_ID, atelierID_);

	
    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `cancel_atelier` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `cancel_atelier`(
	in atelierID_ INT(11)
)
BEGIN
	# Var
	DECLARE reviewerID CHAR(36);
    DECLARE reviewerBounty INT(11);
    DECLARE maxBounty INT(11) DEFAULT -1;
	DECLARE cursorFinished INTEGER DEFAULT 0;
    
    # Cursors
    DECLARE candidateReviewerIDCursor CURSOR FOR SELECT reviewerID, bounty from atelier_auction where atelierID = atelierID_;
	
    # Handler
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET cursorFinished = 1;
        
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
        
	START TRANSACTION;

	# Activity constants
    SET @CANCEL_ATELIER_ID = 11;
    SET @REMOVE_AUCTION_ID = 5;
    SET @CANCEL_ATELIER_STATUS_ID = 60;
    
	SELECT @uploaderID := uploaderID from atelier where ID = atelierID_;

	UPDATE atelier SET currentStatus = @CANCEL_ATELIER_STATUS_ID  WHERE ID = atelierID_;
    INSERT INTO atelier_history (atelierID, statusID) VALUES (atelierID_, @CANCEL_ATELIER_STATUS_ID);
    
	# Record the 'atelier canceled' activity
    INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`,`targetUserID`,`activityRefID`,`linkedID`)
			VALUES (1, @uploaderID, 0, @atelierObjectID, @CANCEL_ATELIER_ID, atelierID_);

    # Record notification to every candidate reviewers
	OPEN candidateReviewerIDCursor;
	updateAuctionLoop: WHILE cursorFinished = 0 DO
		FETCH candidateReviewerIDCursor INTO reviewerID, reviewerBounty;
        SELECT GREATEST(maxBounty, reviewerBounty) into maxBounty;
        # Record the 'uploader cancel auction' activity
		INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`,`targetUserID`,`activityRefID`,`linkedID`)
			VALUES (1, @uploaderID, 1, reviewerID, @REMOVE_AUCTION_ID, atelierID_);
		SET @activityID = LAST_INSERT_ID();
		IF cursorFinished = 1 THEN
			LEAVE updateAuctionLoop;
        END IF;
	END WHILE;
    
    # Unfreeze the coins corresponding to the max auction bounty
	IF maxBounty > -1 THEN
		UPDATE user SET frozenCoin = frozenCoin - maxBounty, freeCoin = freeCoin + maxBounty where ID = @uploaderID;
	END IF;

	COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `clear_secret_stash` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `clear_secret_stash`()
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;

	START TRANSACTION;

	DELETE FROM `user` where ID in (SELECT userID FROM `registration_stash` WHERE DATE_SUB(NOW(), INTERVAL 1 DAY) >  `expire` and userID > 0 and accountStatusID = 0);
	DELETE FROM `user` where ID in (SELECT userID FROM `reset_password_stash` WHERE DATE_SUB(NOW(), INTERVAL 1 DAY) >  `expire` and userID > 0 and accountStatusID = 0);

	DELETE FROM `registration_stash` WHERE DATE_SUB(NOW(), INTERVAL 1 DAY) >  `expire` and userID > 0;
	DELETE FROM `reset_password_stash` WHERE DATE_SUB(NOW(), INTERVAL 1 DAY) >  `expire` and userID > 0;

    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `create_atelier` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `create_atelier`(
	in gameID_ INT(11), 
	in bounty_ varchar(255),
    in uploaderID_ CHAR(36),
    in originalName_ varchar(36),
	in title_ varchar(45),
    in description_ varchar(255),
    in nbTag_ tinyint,
    in csTag_ varchar(255),
    in isPrivate_ bool,
	in nbReviewers_ tinyint,
    in reviewerID_ varchar(255),
    out createdAtelierID_ INT(11)
)
BEGIN
    DECLARE maxBounty INT(11) DEFAULT -1;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        SELECT null into createdAtelierID_;
		ROLLBACK;
        RESIGNAL;
    END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING 
    BEGIN
        SELECT null into createdAtelierID_;
		ROLLBACK;
        RESIGNAL;
    END;
    
	start transaction;
    # Activity constants
    SET @CREATE_ATELIER_ID = 1;
    SET @ADD_AUCTION_ID = 4;
    # Create atelier row
    SET @creationTimestamp = now();
	INSERT INTO atelier (uploaderID, gameID, originalName, creationTimestamp, title, description, currentStatus, isPrivate)
		VALUES (uploaderID_, gameID_, originalName_, @creationTimestamp, title_, description_, 10, isPrivate_);
	SET @atelierID = LAST_INSERT_ID();
    
    # Record Creation and InAuction status
    INSERT INTO atelier_history (atelierID, statusID) VALUES (@atelierID, 10);
	# Insert activity row
	## Uploader create the atelier
	INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`,`activityRefID`,`linkedID`)
		VALUES (1, uploaderID_, 0, @CREATE_ATELIER_ID, @atelierID);     

	# Loop over candidate reviewers
    SET @loopIdx = 1;
    WHILE @loopIdx <= nbReviewers_ DO
		SET @reviewerID = SPLIT_STRING(reviewerID_, ',', @loopIdx);
        SET @bounty = SPLIT_STRING(bounty_, ',', @loopIdx);
        SET maxBounty = GREATEST(maxBounty, CAST(@bounty AS SIGNED));

		INSERT INTO atelier_auction (atelierID, reviewerID, bounty, `timestamp`)
			VALUES (@atelierID, @reviewerID, @bounty, @creationTimestamp);
		INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`,`targetUserID`,`activityRefID`,`linkedID`)
			VALUES (1, uploaderID_, 1, @reviewerID, @ADD_AUCTION_ID, @atelierID);
        SET @loopIdx = @loopIdx + 1;
    END WHILE;
    
    UPDATE user SET frozenCoin = frozenCoin + maxBounty, freeCoin = freeCoin - maxBounty where ID = uploaderID_;
    IF nbTag_ > 1 THEN
		# Create atelier tag row
		SET @loopIdx = 1;
		WHILE @loopIdx <= nbTag_ DO
			SET @tagID = SPLIT_STRING(csTag_, ',', @loopIdx);
			INSERT INTO atelier_tag (atelierID, tagID) VALUES (@atelierID, @tagID);
			SET @loopIdx = @loopIdx + 1;
		END WHILE;
	END IF;
		
    SELECT @atelierID INTO createdAtelierID_;
    
    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `decline_atelier` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `decline_atelier`(
	IN atelierID_ INT(11),
    IN reviewerID_ CHAR(36)
)
BEGIN
	DECLARE declineTimestamp datetime;
    DECLARE maxBounty INT(11) DEFAULT -1;
    DECLARE declinedBounty INT(11) DEFAULT -1;
    
	DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
		ROLLBACK;
        RESIGNAL;
    END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING 
    BEGIN
		ROLLBACK;
        RESIGNAL;
    END;
    
	START TRANSACTION;
    SET @DECLINE_REVIEW_ID = 3;

    SELECT @uploaderID := uploaderID from atelier where ID = atelierID_;

    # Update free and frozen wallet coins if applicable
	SELECT bounty INTO declinedBounty FROM atelier_auction WHERE atelierID = atelierID_ AND reviewerID = reviewerID_ ;
	SELECT MAX(bounty) INTO maxBounty FROM atelier_auction WHERE atelierID = atelierID_ AND reviewerID != reviewerID_ ORDER BY timestamp DESC;
    IF maxBounty IS NULL THEN
    		UPDATE user SET frozenCoin = frozenCoin - declinedBounty, freeCoin = freeCoin + declinedBounty WHERE ID = @uploaderID;
	ELSEIF declinedBounty > maxBounty THEN
		UPDATE user SET frozenCoin = frozenCoin - (declinedBounty - maxBounty), freeCoin = freeCoin + (declinedBounty - maxBounty) WHERE ID = @uploaderID;
	END IF;
    
	SET declineTimestamp = now();
	DELETE FROM atelier_auction WHERE atelierID = atelierID_ AND reviewerID = reviewerID_;

	# Record the reviewer-> 'Reject Atelier' -> uploader activity and notification
    INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`, `targetUserID`, `activityRefID`,`linkedID`,`timestamp`)
			VALUES (1, reviewerID_, 1, @uploaderID, @DECLINE_REVIEW_ID, atelierID_, declineTimestamp);
	SET @activityID = LAST_INSERT_ID();
	INSERT INTO notification (`activityID`) values(@activityID);
    
    COMMIT;
    # Return nb candidates left
    SELECT count(*) as nbCandidatesLeft from atelier_auction where atelierID = atelierID_;
	
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `post_review` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `post_review`(
	IN atelierID_ INT(11),
    IN reviewerID_ CHAR(36)
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
    
	DECLARE EXIT HANDLER FOR SQLWARNING
    BEGIN
		ROLLBACK;
        RESIGNAL;
	END;
	START TRANSACTION;
    
    # Constants
    SET @POST_REVIEW_ID = 7;
    SET @TRANSFER_BOUNTY_ID = 8;
	SET @ATELIER_COMPLETION_STATUS = 50;
    SET @USER_TYPE = 1;    
    
	# Data
	SET @now = now();
	SELECT @uploaderID := uploaderID, @bounty := bounty FROM atelier WHERE ID = atelierID_;
	
    INSERT INTO atelier_history (atelierID, statusID, timestamp) VALUES (atelierID_, @ATELIER_COMPLETION_STATUS, @now);
    UPDATE atelier SET currentStatus = @ATELIER_COMPLETION_STATUS WHERE ID = atelierID_;
    
    # Record bounty transaction 
    # Reviewer freeCoin gets updated to + bounty
    # Uploader frozen bounty is cleared
    UPDATE user SET redeemableCoin = redeemableCoin + @bounty WHERE ID = reviewerID_;
	UPDATE user SET frozenCoin = frozenCoin - @bounty WHERE ID = @uploaderID;
    INSERT INTO the_vault (atelierID, senderTypeID, senderID, receiverTypeID, receiverID, amount, timestamp)
		VALUES (atelierID_, @USER_TYPE, @uploaderID, @USER_TYPE, reviewerID_, @bounty, @now);
    
    # Activity & notifications
	# Reviewer posted review
    INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`, `targetUserID`, `activityRefID`,`linkedID`,`createdAt`)
			VALUES (@USER_TYPE, reviewerID_, @USER_TYPE, @uploaderID, @POST_REVIEW_ID, atelierID_, @now);
	# Record the notification for uploader
	SET @activityID = LAST_INSERT_ID();
	INSERT INTO notification (`activityID`) VALUES (@activityID);
    # Uploader transfered bounty
    INSERT INTO activity (`sourceTypeID`,`sourceUserID`,`targetTypeID`, `targetUserID`, `activityRefID`, `linkedID`,`createdAt`)
		VALUES (@USER_TYPE, @uploaderID, @USER_TYPE, reviewerID_, @TRANSFER_BOUNTY_ID, atelierID_, @now);
	# Record the notification to the reviewer
	SET @activityID = LAST_INSERT_ID();
	INSERT INTO notification (`activityID`) VALUES (@activityID);

    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `remove_atelier` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`zebullon`@`%` PROCEDURE `remove_atelier`(IN idToClean INT(11))
BEGIN
	DELETE FROM atelier_history WHERE  atelierID = idToClean;
	DELETE FROM atelier_auction WHERE atelierID = idToClean;
    DELETE FROM atelier_tag WHERE atelierID = idToClean;
	DELETE FROM atelier WHERE ID = idToClean;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `active_game__view`
--

/*!50001 DROP VIEW IF EXISTS `active_game__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `active_game__view` AS select `atelier`.`gameID` AS `gameID`,`game_ref`.`name` AS `name`,count(`atelier`.`ID`) AS `nbAtelier` from (`atelier` join `game_ref`) where (`atelier`.`gameID` = `game_ref`.`ID`) group by `atelier`.`gameID`,`game_ref`.`name` order by `nbAtelier` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `atelier_aggregated_info__view`
--

/*!50001 DROP VIEW IF EXISTS `atelier_aggregated_info__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `atelier_aggregated_info__view` AS select `atelier`.`ID` AS `atelierID`,`atelier`.`originalName` AS `originalName`,`atelier`.`creationTimestamp` AS `creationTimestamp`,`atelier`.`reviewerID` AS `reviewerID`,`userReviewer`.`nickname` AS `reviewerNickname`,`atelier`.`uploaderID` AS `uploaderID`,`user`.`nickname` AS `uploaderNickname`,`atelier`.`bounty` AS `bounty`,`game_ref`.`name` AS `gameName`,`atelier`.`currentStatus` AS `currentStatus`,`atelier`.`gameID` AS `gameID`,`atelier`.`isPrivate` AS `isPrivate`,`atelier`.`description` AS `description`,`atelier`.`title` AS `title`,`atelier`.`score` AS `score`,`atelier`.`nbViews` AS `nbViews`,group_concat(distinct `atelier_auction`.`reviewerID` separator ',') AS `candidateReviewerID` from ((((`atelier` join `game_ref`) join `user`) join `atelier_auction`) join (`atelier` `revAtelier` left join `user` `userReviewer` on((`userReviewer`.`ID` = `revAtelier`.`reviewerID`)))) where ((`atelier`.`gameID` = `game_ref`.`ID`) and (`user`.`ID` = `atelier`.`uploaderID`) and (`atelier_auction`.`atelierID` = `atelier`.`ID`) and (`atelier`.`ID` = `revAtelier`.`ID`)) group by `atelier`.`ID` order by `game_ref`.`name`,`atelier`.`creationTimestamp` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `atelier_message__view`
--

/*!50001 DROP VIEW IF EXISTS `atelier_message__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `atelier_message__view` AS select `atelier_message`.`ID` AS `messageID`,`atelier_message`.`atelierID` AS `atelierID`,`atelier_message`.`userID` AS `userID`,`user`.`nickname` AS `userNickname`,`atelier_message`.`timestamp` AS `timestamp`,`atelier_message`.`content` AS `content` from (`user` join `atelier_message`) where (`atelier_message`.`userID` = `user`.`ID`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `latest_auction__view`
--

/*!50001 DROP VIEW IF EXISTS `latest_auction__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `latest_auction__view` AS select `A1`.`timestamp` AS `timestamp`,`A1`.`atelierID` AS `atelierID`,`A1`.`bounty` AS `bounty`,`A1`.`reviewerID` AS `reviewerID`,`user`.`nickname` AS `nickname` from (`atelier_auction` `A1` join `user`) where ((`A1`.`timestamp` = (select max(`A2`.`timestamp`) from `atelier_auction` `A2` where ((`A1`.`atelierID` = `A2`.`atelierID`) and (`A1`.`reviewerID` = `A2`.`reviewerID`)) group by `A2`.`atelierID`,`A2`.`reviewerID`)) and (`user`.`ID` = `A1`.`reviewerID`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `nb_atelier_per_game__view`
--

/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_game__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `nb_atelier_per_game__view` AS select `nb_atelier_per_game_per_status__view`.`ID` AS `ID`,sum(`nb_atelier_per_game_per_status__view`.`nbAtelier`) AS `nbAtelier`,`nb_atelier_per_game_per_status__view`.`name` AS `name` from `nb_atelier_per_game_per_status__view` group by `nb_atelier_per_game_per_status__view`.`ID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `nb_atelier_per_game_per_status__view`
--

/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_game_per_status__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `nb_atelier_per_game_per_status__view` AS select `game_ref`.`ID` AS `ID`,count(`atelier`.`ID`) AS `nbAtelier`,`atelier`.`currentStatus` AS `currentStatus`,`game_ref`.`name` AS `name` from (`game_ref` left join `atelier` on((`atelier`.`gameID` = `game_ref`.`ID`))) group by `game_ref`.`ID`,`atelier`.`currentStatus` having ((`atelier`.`currentStatus` <= 50) or (`atelier`.`currentStatus` is null)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `nb_atelier_per_game_per_tag__view`
--

/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_game_per_tag__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `nb_atelier_per_game_per_tag__view` AS select `atelier`.`gameID` AS `gameID`,`game_ref`.`name` AS `gameName`,`atelier_tag`.`tagID` AS `tagID`,count(`atelier_tag`.`atelierID`) AS `nbAtelier`,`tag_ref`.`description` AS `tagDescription` from (((`tag_ref` join `atelier_tag`) join `atelier`) join `game_ref`) where ((`tag_ref`.`ID` = `atelier_tag`.`tagID`) and (`atelier`.`ID` = `atelier_tag`.`atelierID`) and (`atelier`.`currentStatus` <= 50) and (`atelier`.`gameID` = `game_ref`.`ID`)) group by `atelier`.`gameID`,`atelier_tag`.`tagID`,`game_ref`.`name` order by `atelier`.`gameID`,`nbAtelier` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `nb_atelier_per_reviewer_per_game__view`
--

/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_reviewer_per_game__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `nb_atelier_per_reviewer_per_game__view` AS select `atelier`.`reviewerID` AS `reviewerID`,`atelier`.`gameID` AS `gameID`,`game_ref`.`name` AS `gameName`,count(`atelier`.`ID`) AS `nb_atelier` from (`atelier` join `game_ref`) where ((`atelier`.`currentStatus` = 50) and (`game_ref`.`ID` = `atelier`.`gameID`)) group by `atelier`.`reviewerID`,`atelier`.`gameID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `nb_atelier_per_reviewer_per_tag__view`
--

/*!50001 DROP VIEW IF EXISTS `nb_atelier_per_reviewer_per_tag__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `nb_atelier_per_reviewer_per_tag__view` AS select `atelier`.`reviewerID` AS `reviewerID`,`atelier_tag`.`tagID` AS `tagID`,count(`atelier_tag`.`atelierID`) AS `nb_atelier`,`tag_ref`.`description` AS `tagDescription` from ((`tag_ref` join `atelier_tag`) join `atelier`) where ((`tag_ref`.`ID` = `atelier_tag`.`tagID`) and (`atelier`.`ID` = `atelier_tag`.`atelierID`) and (`atelier`.`currentStatus` = 50)) group by `atelier`.`reviewerID`,`atelier_tag`.`tagID` order by `atelier`.`reviewerID`,`nb_atelier` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `reviewer_game_pool__view`
--

/*!50001 DROP VIEW IF EXISTS `reviewer_game_pool__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `reviewer_game_pool__view` AS with `reviewer_stat` as (select `reviewer`.`userID` AS `userID`,`game_ref`.`ID` AS `gameID`,`game_ref`.`name` AS `gameName`,count(distinct `atelier`.`ID`) AS `nb_atelier`,avg(`atelier`.`score`) AS `avgScore`,`reviewer`.`minimumBounty` AS `minimumBounty` from ((`reviewer` left join `atelier` on(((`reviewer`.`userID` = `atelier`.`reviewerID`) and (`reviewer`.`gameID` = `atelier`.`gameID`)))) join `game_ref` on((`game_ref`.`ID` = `reviewer`.`gameID`))) group by `reviewer`.`userID`,`gameID`) select `reviewer_stat`.`userID` AS `userID`,concat('[',group_concat('{','"ID": ',`reviewer_stat`.`gameID`,',','"name": "',`reviewer_stat`.`gameName`,'",','"nbWorkshops": ',`reviewer_stat`.`nb_atelier`,',','"score": ',convert(ifnull(`reviewer_stat`.`avgScore`,'null') using utf8mb3),',','"minimumBounty": ',`reviewer_stat`.`minimumBounty`,'}' separator ','),']') AS `gamePool` from `reviewer_stat` group by `reviewer_stat`.`userID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `reviewer_profile__view`
--

/*!50001 DROP VIEW IF EXISTS `reviewer_profile__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `reviewer_profile__view` AS select `reviewer`.`userID` AS `ID`,`user`.`countryCode` AS `countryCode`,`user`.`timezone` AS `timezone`,`user`.`registrationDate` AS `registrationDate`,`user`.`selfIntroduction` AS `selfIntroduction`,`user`.`nickname` AS `name`,`sns_account`.`twitterName` AS `twitterName`,`sns_account`.`twitchName` AS `twitchName`,`sns_account`.`youtubeName` AS `youtubeName`,`game_ref`.`ID` AS `gameID`,`game_ref`.`name` AS `gameName`,count(distinct `atelier`.`ID`) AS `nb_atelier`,avg(`atelier`.`score`) AS `avgScore`,`reviewer`.`minimumBounty` AS `minimumBounty` from ((((`reviewer` left join `atelier` on(((`reviewer`.`userID` = `atelier`.`reviewerID`) and (`reviewer`.`gameID` = `atelier`.`gameID`)))) join `user` on((`user`.`ID` = `reviewer`.`userID`))) left join `sns_account` on((`sns_account`.`userID` = `user`.`ID`))) join `game_ref` on((`game_ref`.`ID` = `reviewer`.`gameID`))) group by `reviewer`.`userID`,`gameID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `reviewer_profile_aggregated_game_pool__view`
--

/*!50001 DROP VIEW IF EXISTS `reviewer_profile_aggregated_game_pool__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `reviewer_profile_aggregated_game_pool__view` AS select `reviewer_profile__view`.`ID` AS `ID`,`reviewer_profile__view`.`name` AS `name`,`reviewer_profile__view`.`selfIntroduction` AS `selfIntroduction`,`reviewer_profile__view`.`twitterName` AS `twitterName`,`reviewer_profile__view`.`twitchName` AS `twitchName`,`reviewer_profile__view`.`youtubeName` AS `youtubeName`,`reviewer_profile__view`.`countryCode` AS `countryCode`,`reviewer_profile__view`.`timezone` AS `timezone`,`reviewer_profile__view`.`registrationDate` AS `registrationDate`,concat('[',group_concat('{','"gameID": ',`reviewer_profile__view`.`gameID`,',','"gameName": "',`reviewer_profile__view`.`gameName`,'",','"nbReview": ',`reviewer_profile__view`.`nb_atelier`,',','"avgScore": ',ifnull(`reviewer_profile__view`.`avgScore`,'"undefined"'),',','"minimumBounty": ',`reviewer_profile__view`.`minimumBounty`,'}' separator ','),']') AS `gamePool` from `reviewer_profile__view` group by `reviewer_profile__view`.`ID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_notification__view`
--

/*!50001 DROP VIEW IF EXISTS `user_notification__view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`zebullon`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `user_notification__view` AS select `activity`.`ID` AS `activityID`,`activity`.`isActive` AS `isActive`,`activity`.`sourceTypeID` AS `sourceTypeID`,`activity`.`sourceUserID` AS `sourceUserID`,(case `activity`.`sourceTypeID` when 1 then (select `user`.`nickname` from `user` where (`user`.`ID` = `activity`.`sourceUserID`)) else NULL end) AS `sourceUserNickname`,`activity`.`targetTypeID` AS `targetTypeID`,`activity`.`targetUserID` AS `targetUserID`,(case `activity`.`sourceTypeID` when 1 then (select `user`.`nickname` from `user` where (`user`.`ID` = `activity`.`targetUserID`)) else NULL end) AS `targetUserNickname`,`activity`.`activityRefID` AS `activityRefID`,`activity`.`linkedID` AS `linkedID`,`activity_ref`.`name` AS `activityRefName`,`activity`.`createdAt` AS `createdAt` from (`activity` join `activity_ref`) where (`activity_ref`.`ID` = `activity`.`activityRefID`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-31 16:09:55
