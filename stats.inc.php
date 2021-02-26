<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaderstb implementation : © © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * stats.inc.php
 *
 * homesteaderstb game statistics description
 *
 */

/*
    In this file, you are describing game statistics, that will be displayed at the end of the
    game.
    
    !! After modifying this file, you must use "Reload  statistics configuration" in BGA Studio backoffice
    ("Control Panel" / "Manage Game" / "Your Game")
    
    There are 2 types of statistics:
    _ table statistics, that are not associated to a specific player (ie: 1 value for each game).
    _ player statistics, that are associated to each players (ie: 1 value for each player in the game).

    Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean
    
    Once you defined your statistics there, you can start using "initStat", "setStat" and "incStat" method
    in your game logic, using statistics names defined below.
    
    !! It is not a good idea to modify this file when a game is running !!

    If your game is already public on BGA, please read the following before any change:
    http://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress
    
    Notes:
    * Statistic index is the reference used in setStat/incStat/initStat PHP method
    * Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
    * Statistics IDs must be >=10
    * Two table statistics can't share the same ID, two player statistics can't share the same ID
    * A table statistic can have the same ID than a player statistics
    * Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic
    * Statistic name is the English description of the statistic as shown to players
    
*/

$stats_type = array(

    // Statistics global to table
    "table" => array(
        "outbids_in_auctions" => array("id"=> 10,
                    "name" => totranslate("# of outbids (Total)"),
                    "type" => "int" ),
        "buildings" => array("id"=> 11,
                    "name" => totranslate("# buildings built"),
                    "type" => "int" ),
        "passed" => array("id"=>12,
                    "name" => totranslate("# auctions with no bid"),
                    "type" => "int" ),
    ),
    
    // Statistics existing for each player
    "player" => array(
        "building_vp" => array("id"=> 10,
                    "name" => totranslate("Buildings Point Values"), "type" => "int" ),
        "building_bonus_vp" => array("id"=> 11,
                    "name" => totranslate("Building Bonus VPs"), "type" => "int" ),
        "vp_chits" => array("id"=> 12,
                    "name" => totranslate("VP Chits"), "type" => "int" ),
        "vp_gold" =>array("id"=> 13,
                    "name" => totranslate("Gold VPs"), "type" => "int" ),
        "vp_cow" => array("id"=> 14,
                    "name" => totranslate("Livestock VPs"), "type" => "int" ),
        "vp_copper" => array("id"=> 15,
                    "name" => totranslate("Copper VPs"), "type" => "int" ),
        "vp_loan" =>array("id"=> 16,
                    "name" => totranslate("Debt VP Penalty "), "type" => "int" ),
        "bonus_vp_0" => array("id"=> 17,
                    "name" => totranslate("Bonus VP for Residential"), "type" => "int" ),
        "bonus_vp_1" => array("id"=> 18,
                    "name" => totranslate("Bonus VP for Commercial"), "type" => "int" ),
        "bonus_vp_2" => array("id"=> 19,
                    "name" => totranslate("Bonus VP for Industrial"), "type" => "int" ),
        "bonus_vp_3" => array("id"=> 20,
                    "name" => totranslate("Bonus VP for Special"), "type" => "int" ),
        "bonus_vp_4" => array("id"=> 21,
                    "name" => totranslate("Bonus VP for # Workers"), "type" => "int" ),
        "bonus_vp_5" => array("id"=> 22,
                    "name" => totranslate("Bonus VP for # Tracks"), "type" => "int" ),
        "bonus_vp_6" => array("id"=> 23,
                    "name" => totranslate("Bonus VP for # Buildings"), "type" => "int" ),
        "buildings" => array("id"=> 24,
                    "name" => totranslate("# Buildings"),
                    "type" => "int" ),
        "residential" => array("id"=> 25,
                    "name" => totranslate("# Residential buildings"),
                    "type" => "int" ),
        "industrial" => array("id"=> 26,
                    "name" => totranslate("# Industrial buildings"),
                    "type" => "int" ),
        "commercial" => array("id"=> 27,
                    "name" => totranslate("# Commercial buildings"),
                    "type" => "int" ),
        "special" => array("id"=> 28,
                    "name" => totranslate("# Special buildings"),
                    "type" => "int" ),
        "bids" => array("id"=> 29,
                    "name" => totranslate("# bids made"),
                    "type" => "int" ),
        "auctions_won" => array("id"=> 30,
                    "name" => totranslate("# Auctions won"),
                    "type" => "int" ),
        "win_auction_1" => array("id"=> 31,
                    "name" => totranslate("# win Auction 1"),
                    "type" => "int" ),
        "win_auction_2" => array("id"=> 32,
                    "name" => totranslate("# win Auction 2"),
                    "type" => "int" ),
        "win_auction_3" => array("id"=> 33,
                    "name" => totranslate("# win Auction 3"),
                    "type" => "int" ),
        "spent_on_auctions" => array("id"=> 34,
                    "name" => totranslate("Amount spent on auctions"),
                    "type" => "int" ),
        "times_outbid" => array("id"=> 35,
                    "name" => totranslate("# Times outbid"),
                    "type" => "int" ),
        "outbids" => array("id"=> 36,
                    "name" => totranslate("# Times outbid others "),
                    "type" => "int" ),
        "loans" => array("id"=> 37,
                    "name" => totranslate("# Loans taken"),
                    "type" => "int" ),
    )

);
