<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteaders implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * homesteaders game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in homesteaders.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = array(

    //SHOW_PLAYER_INFO
    100 => array(
        'name' => totranslate('show or hide resources'),
        'values' => array(
            0 => array(//SHOW_ALL_RESOURCES
                'name' => totranslate('show all player resources'),
            ),
            1 => array(//HIDE_ALL_RESOURCES
                'name' => totranslate('hide resources from other players'),
                'description' => totranslate('hide player resources'),
                'nobeginner'=>true,
            ),
        ),
    ),

    101  => array(
        'name' => totranslate('Recieve Rail Line if No Build'),
        'values' => array(
            0 => array('name' => totranslate('normal no-build rule')),
            1 => array(
                'name' => totranslate('Recieve a rail line when passing on build building (recommended for 5 player)'),
                'tmdisplay' => totranslate('Rail line on no-build'),
            ),
        ),
    ),

    110 => array(
        'name' => totranslate('New Beginnings Buildings'),
        'values' => array(
            0 => array('name' => totranslate('do not use expansion buildings')),
            1 => array(
                'name' => totranslate('use expansion buildings (recommended for 5 players)'),
                'tmdisplay' => totranslate('New Beginnings Buildings'),
                'nobeginner' => true,
            ),
        ),
    ),
    
    111 => array(
        'name' => totranslate('Expansion Events'),
        'values' => array(
            0 => array('name' => totranslate('do not use Events')),
            1 => array(
                'name' => totranslate('New Beginnings Events'),
                'tmdisplay' => totranslate('New Beginnings Events'),
                'nobeginner' => true,
            ),
        ),
    ),

);


