<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteadersnewbeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * homesteadersnewbeginnings game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in homesteadersnewbeginnings.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = array(

    100 => array(
        'name' => totranslate('show or hide resources'),
        'values' => array(
            0 => array(
                'name' => totranslate('show all player resources'),
            ),
            1 => array(
                'name' => totranslate('hide resources from other players'),
                'description' => totranslate('hide player resources from other players'),
                'tmdisplay' => totranslate('hide other player resources'),
                'nobeginner'=>true,
            ),
        ),
    ),

    101 => array(
        'name' => totranslate('Receive Rail Line if No Build'),
        'values' => array(
            0 => array(
                'name' => totranslate('Receive Nothing If Do Not Build'),
                'tmdisplay' => totranslate('Nothing on No-Build')),
            1 => array(
                'name' => totranslate('Receive a Rail Line When Do Not Build (Recommended for 5 player)'),
                'tmdisplay' => totranslate('Rail Line on No-Build'),
            ),
        ),
    ),

    110 => array(
        'name' => totranslate('New Beginnings Buildings'),
        'values' => array(
            0 => array(
                'name' => totranslate('Disable Expansion Buildings')),
            1 => array(//ENABLED
                'name' => totranslate('Enable Expansion Buildings (required for 5 players)'),
                'tmdisplay' => totranslate('New Beginnings Buildings'),
            ),
        ),
        'startcondition' => [
            0=>[
                [
                    'type' => 'maxplayers',
                    'value' => 4,
                    'message' => totranslate('New Beginnings Buildings are required for 5 player')
                ],
            ],
        ],
    ),
    
    111 => array(
        'name' => totranslate('Expansion Events'),
        'values' => array(
            0 => array(
                'name' => totranslate('Disable New Beginnings Events'),
                'tmdisplay' => totranslate('No Events')),
            1 => array(
                'name' => totranslate('Enable New Beginnings Events'),
                'tmdisplay' => totranslate('Use New Beginnings Events'),
            ),
        ),
    ),
    
);

$game_preferences = array(
    100 => array(
			'name' => totranslate('Show Tile Art'),
			'needReload' => true, // after user changes this preference game interface would auto-reload
			'values' => array(
					0 => array( 
                        'name' => totranslate( 'Show Art' ), 
                        'cssPref' => totranslate('Show Tile Art') ),
					1 => array( 
                        'name' => totranslate( 'Show Text instead' ), 
                        'cssPref' => totranslate('Show Text Instead') 
                    ),
			)
	)
);
