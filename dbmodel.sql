
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteadersnewbeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- This color name is used to create css classes
ALTER TABLE `player` ADD `color_name` VARCHAR(16) NOT NULL DEFAULT ' ';
ALTER TABLE `player` ADD `rail_adv`   INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'rail_adv 0-5';
ALTER TABLE `player` ADD `recieve_inc`INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'has recieved Income 0-No, 1-Yes';
ALTER TABLE `player` ADD `has_paid`   INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'has paid pending cost 0-No, 1-Yes',
ALTER TABLE `player` ADD `cost`       INT(3) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'pending cost (in silver)',
 -- allows showing cancelled/undo actions as crossed out in log.
ALTER TABLE `gamelog` ADD `cancel` TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `bids` (
  `player_id` INT(8) NOT NULL,
  `bid_loc`   INT(2) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Auction slot: 1-9 A1, 11-19 A2, 21-29 A3',
  `outbid`    INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT '0 if not, 1 if outbid',
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB ;

CREATE TABLE IF NOT EXISTS `workers` (
  `worker_key`    INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id`     INT(8) UNSIGNED NOT NULL COMMENT 'Player controlling the worker',
  `building_key`  INT(3) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Building working at',
  `building_slot` INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Which slot in buiding',
  PRIMARY KEY (`worker_key`)
) ENGINE=InnoDB AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `tracks` (
  `rail_key`  INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `player_id` INT(8) UNSIGNED NOT NULL COMMENT 'Player owning the track',
  PRIMARY KEY (`rail_key`)
) ENGINE=InnoDB AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `buildings` (
  `building_key`  INT(3) UNSIGNED NOT NULL AUTO_INCREMENT,
  `building_id`   INT(2) UNSIGNED NOT NULL             COMMENT 'Identity of Building',
  `building_type` INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'type: 0-res, 1-com, 2-Ind, 3-Sp',
  `stage`         INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Stage: 0-home, 1-sett, 2-(sett or town), 3-town, 4-city',
  `location`      INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'location: 0-future, 1-building offer, 2-player, 3-discard',
  `player_id`     INT(8) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Player owning the building',
  `worker_slot`   INT(1) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'worker_slots, 0, 1, 2, 3-double slot',
  `state`         INT(3) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'state of building',
  `b_order`       INT(3) UNSIGNED NOT NULL DEFAULT '0' COMMENT 'order built by player',
  PRIMARY KEY (`building_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- Auction tiles 
CREATE TABLE IF NOT EXISTS `auctions` (
  `auction_id`       INT(2) UNSIGNED NOT NULL COMMENT 'Identity of Auction tile',
  `position`         INT(2) UNSIGNED NOT NULL COMMENT 'position of Auction in Deck (1-10)',
  `location`         INT(1) UNSIGNED NOT NULL COMMENT 'location: 0-discard, 1-Auction-1, 2-Auction-2, 3-Auction-3, 4-Auction-4',
  PRIMARY KEY (`auction_id`)
) ENGINE=InnoDB ;

CREATE TABLE IF NOT EXISTS `events` (
  `event_id` INT(2) UNSIGNED NOT NULL COMMENT 'Identity of Event',
  `position` INT(2) UNSIGNED NOT NULL COMMENT 'position of Event (1-10)',
  `location` INT(1) UNSIGNED NOT NULL COMMENT 'location: 0-discard 1-Events',
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB ;

CREATE TABLE IF NOT EXISTS `resources` (
  `player_id`  INT(8) UNSIGNED NOT NULL,
  `silver`     INT(3) UNSIGNED NOT NULL DEFAULT '6',
  `workers`    INT(3) UNSIGNED NOT NULL DEFAULT '1',
  `track`      INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `wood`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `food`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `steel`      INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `gold`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `copper`     INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `cow`        INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `loan`       INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `trade`      INT(2) UNSIGNED NOT NULL DEFAULT '0',
  `vp`         INT(3) UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `log` (
  `log_id`    INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `round`     INT(11) NOT NULL,
  `player_id` INT(11) NOT NULL,
  `move_id`   INT(11) NOT NULL,
  `action`    VARCHAR(16) NOT NULL,
  `piece_id`  INT(11),
  `action_arg` JSON,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;