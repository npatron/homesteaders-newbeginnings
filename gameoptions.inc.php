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

    SHOW_PLAYER_INFO => array(
        'name' => totranslate('show or hide resources'),
        'values' => array(
            SHOW_ALL_RESOURCES => array(
                'name' => totranslate('show all player resources'),
            ),
            HIDE_ALL_RESOURCES => array(
                'name' => totranslate('hide resources from other players'),
                'description' => totranslate('hide player resources from other players'),
                'tmdisplay' => totranslate('hide other player resources'),
                'nobeginner'=>true,
            ),
        ),
    ),

    RAIL_NO_BUILD => array(
        'name' => totranslate('Receive Rail Line if No Build'),
        'values' => array(
            DISABLED => array(
                'name' => totranslate('normal no-build rule')),
            ENABLED => array(
                'name' => totranslate('Recieve a rail line when passing on build building (recommended for 5 player)'),
                'tmdisplay' => totranslate('Rail line on no-build'),
            ),
        ),
    ),

    NEW_BEGINNING_BLD => array(
        'name' => totranslate('New Beginnings Buildings'),
        'values' => array(
            DISABLED => array(
                'name' => totranslate('do not use expansion buildings')),
            ENABLED => array(//ENABLED
                'name' => totranslate('use expansion buildings (required for 5 players)'),
                'tmdisplay' => totranslate('New Beginnings Buildings'),
            ),
        ),
        'startcondition' => [
            DISABLED=>[
                [
                    'type' => 'minplayers',
                    'value' => 5,
                    'message' => totranslate('New Beginnings Buildings are required for 5 player')
                ],
            ],
        ],
    ),
    
    NEW_BEGINNING_EVT => array(
        'name' => totranslate('Expansion Events'),
        'values' => array(
            DISABLED => array(
                'name' => totranslate('do not use Events')),
            ENABLED => array(
                'name' => totranslate('Use New Beginnings Events'),
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
					0 => array( 'name' => totranslate( 'Show Art' ), 'cssPref' => 'Show Tile Art' ),
					1 => array( 'name' => totranslate( 'Show Text instead' ), 'cssPref' => 'Show Text Instead' )
			)
	)
);
