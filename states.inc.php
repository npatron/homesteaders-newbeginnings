<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteadersnewbeginningstb implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 */

//    !! It is not a good idea to modify this file when a game is running !!
 
$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => STATE_START_ROUND )
    ),

    STATE_START_ROUND => array(
        "name" => "startRound", 
        "description" => clienttranslate('Setup round'),
        "type" => "game",
        "action" => "stStartRound",
        "args" => "argStartRound",
        "updateGameProgression" => true,   
        "transitions" => array( "" => STATE_PLACE_WORKERS )
    ),

    STATE_PLACE_WORKERS => array(
        "name" => "allocateWorkers",
        "description" => clienttranslate('Some players must allocate workers'),
        "descriptionmyturn" => clienttranslate('${you} must allocate workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPlaceWorkers",
        "args" => "argPayWorkers",
        "possibleactions" => array( "placeWorker", "hireWorker", "updateGold", "trade", "takeLoan", "done", "actionCancel" ),
        "transitions" => array( "auction" => STATE_PAY_WORKERS )
    ),

    // removing this and handling it in allocateWorkers.
    STATE_PAY_WORKERS => array(
        "name" => "payWorkers",
        "description" => clienttranslate('Some players must choose how to pay workers'),
        "descriptionmyturn" => clienttranslate('${you} must choose how to pay workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPayWorkers",
        "args" => "argPayWorkers",
        "possibleactions" => array( "takeLoan",  "trade", "done" ),
        "transitions" => array( "event" => STATE_EVT_PRE_AUCTION,
                                "auction" => STATE_BEGIN_AUCTION,)
    ),

    STATE_EVT_PRE_AUCTION => array(
        "name" => "setupPreAuctionEvent",
        "description" => '',
        "type" => "game",
        "action" => "stSetupEventPreAuction",
        "transitions" => array( "done"    => STATE_BEGIN_AUCTION,
                                "evt_trade"=>STATE_EVT_TRADE,                        
                                "bonus"   => STATE_EVT_BONUS,
                                "evt_pay" => STATE_EVT_PAY,)
    ),

    STATE_EVT_TRADE => array(
        "name" => "preEventTrade",
        "description" => clienttranslate('Some players must choose to trade before event'),
        "descriptionmyturn" => clienttranslate('${you} players must choose to trade before event'),
        "type" => "multipleactiveplayer",
        "action" => "stSetupTrade",
        "transitions" => array( "post" => STATE_EVT_POST_TRADE,
                                "done" => STATE_BEGIN_AUCTION,)
    ),

    STATE_EVT_BONUS => array(
        "name" => "EventChooseBonus",
        "description" => clienttranslate('Some players must choose bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose bonus'),
        "type" => "multipleactiveplayer",
        "args" => "argEventBonus",
        "updateGameProgression" => true,
        "transitions" => array( "" => STATE_BEGIN_AUCTION,)
    ),

    STATE_EVT_PAY => array(
        "name" => "EventPay",
        "description" => clienttranslate('some players must pay for event'),
        "descriptionmyturn" => clienttranslate('${you} must pay for event'),
        "type" => "multipleactiveplayer",
        "args" => "argEventPay",
        "possibleactions" => array( "trade", "takeLoan", "updateGold", "done" ),
        "transitions" => array( "" => STATE_BEGIN_AUCTION,)
    ),
    
    STATE_EVT_POST_TRADE => array(
        "name" => "eventPhaseAuction",
        "description" => '',
        "type" => "game",
        "action" => "stEvtPostTrade",
        "transitions" => array( "done" => STATE_BEGIN_AUCTION,)
    ),

    STATE_BEGIN_AUCTION  => array(
        "name" => "beginAuction",
        "description" => '',
        "type" => "game",
        "action" => "stBeginAuction",
        "updateGameProgression" => true,
        "transitions" => array( "auction" => STATE_PLAYER_BID, 
                                "2p_auction" => STATE_2_PLAYER_DUMMY_BID,
                                "endGame" => STATE_ENDGAME_ACTIONS,)
    ),

    STATE_2_PLAYER_DUMMY_BID => array(
        "name" => "dummyPlayerBid",
        "description" => clienttranslate('${actplayer} must place dummy bid on auction'),
        "descriptionmyturn" => clienttranslate('${you} must place dummy bid on auction'),
        "type" => "activeplayer",
        "args" => "argDummyValidBids",
        "possibleactions" => array( "selectBid", "confirmBid", "dummy"),
        "transitions" => array( "nextBid" => STATE_PLAYER_BID,),
    ),

    STATE_PLAYER_BID => array(
        "name" => "playerBid",
        "description" => clienttranslate('${actplayer} must bid on auction or pass'),
        "descriptionmyturn" => clienttranslate('${you} must bid on auction or pass'),
        "type" => "activeplayer",
        "args" => "argValidBids",
        "possibleactions" => array( "selectBid", "confirmBid", "pass" ),
        "transitions" => array( "nextBid" => STATE_NEXT_BID,
                                "trade" => STATE_EVT_DEBT_TRADE, 
                                "rail" => STATE_RAIL_BONUS )
    ),

    STATE_EVT_DEBT_TRADE => array(
        "name" => "eventDeptPayTrade",
        "description" => clienttranslate('${actplayer} may trade and pay dept'),
        "descriptionmyturn" => clienttranslate('${you} may trade and pay dept'),
        "type" => "activeplayer",
        "args" => "argEventTrade",
        "possibleactions" => array( "payLoan", "takeLoan", "trade", "done" ),
        "transitions" => array( "rail" => STATE_RAIL_BONUS)
    ),

    // choose bonus from rail advancement.
    STATE_RAIL_BONUS => array(
        "name" => "getRailBonus",
        "description" => clienttranslate('${actplayer} must choose a railroad bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undo"),
        "transitions" => array( "done" => STATE_NEXT_BID, 
                                "undoPass"=> STATE_PLAYER_BID,
                                "zombiePass"=> STATE_NEXT_BID)
    ),

    STATE_AUCTION_RAIL_BONUS => array(
        "name" => "getRailBonus_auction",
        "description" => clienttranslate('${actplayer} must choose a railroad bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undo"),
        "transitions" => array( "undoTurn"  => STATE_PAY_AUCTION,
                                "done"=> STATE_EVT_SETUP_BONUS,
                                "zombiePass"=> STATE_END_BUILD)
    ),
    STATE_BUILD_RAIL_BONUS => array(
        "name" => "getRailBonus_build",
        "description" => clienttranslate('${actplayer} must choose a railroad bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undo"),
        "transitions" => array( "undoTurn"  => STATE_PAY_AUCTION,
                                "done"=> STATE_EVT_SETUP_BONUS,
                                "zombiePass"=> STATE_END_BUILD)
                                
    ),
    STATE_EVT_RAIL_BONUS => array(
        "name" => "getRailBonus_event",
        "description" => clienttranslate('${actplayer} must choose a railroad bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undo"),
        "transitions" => array( "undoTurn"  => STATE_PAY_AUCTION,
                                "done" => STATE_AUCTION_BONUS,
                                "zombiePass"=> STATE_END_BUILD)
    ),

    //game state that determines next bidder/end of auction, and assigns next player.
    STATE_NEXT_BID => array(
        "name" => "nextBid",
        "description" => '',
        "type" => "game",
        "action" => "stNextBid",
        "transitions" => array( "skipPlayer" => STATE_NEXT_BID, 
                                "playerBid" => STATE_PLAYER_BID, 
                                "endAuction" => STATE_NEXT_BUILDING )
    ),

    STATE_NEXT_BUILDING => array(
        "name" => "buildingPhase",
        "description" => '',
        "type" => "game",
        "action" => "stBuildingPhase",
        "updateGameProgression" => true,
        "transitions" => array( "auctionWon" => STATE_PAY_AUCTION, 
                                "auctionPassed" => STATE_END_BUILD )
    ),

    STATE_PAY_AUCTION => array(
        "name" => "payAuction",
        "description" => clienttranslate('${actplayer} must pay for ${auction}'),
        "descriptionmyturn" => clienttranslate('${you} must pay for ${auction}'),
        "type" => "activeplayer",
        "args" => "argAuctionCost",
        "possibleactions" => array( "trade", "takeLoan", "updateGold", "done" ),
        "transitions" => array( "build" => STATE_CHOOSE_BUILDING, 
                                "auction_bonus" => STATE_AUCTION_BONUS,
                                "zombiePass"=> STATE_END_BUILD)
    ),

    STATE_CHOOSE_BUILDING => array(
        "name" => "chooseBuildingToBuild",
        "description" => clienttranslate('${actplayer} may choose a building to build'),
        "descriptionmyturn" => clienttranslate('${you} may choose a building to build'),
        "type" => "activeplayer",
        "args" => "argAllowedBuildings",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild", "undo" ),
        "transitions" => array( "undoTurn"  => STATE_PAY_AUCTION,
                                "done"      => STATE_RESOLVE_BUILDING, 
                                "zombiePass"=> STATE_END_BUILD )
    ),

    STATE_RESOLVE_BUILDING => array(
        "name" => "resolveBuilding",
        "description" => '',
        "type" => "game",
        "action" => "stSetupTrade",
        "transitions" => array( "building_bonus" => STATE_RESOLVE_BUILDING, 
                                "event_bonus"   => STATE_EVT_SETUP_BONUS,
                                "auction_bonus" => STATE_AUCTION_BONUS,
                                "end_build"      => STATE_CONFIRM_AUCTION,)
    ),

    STATE_BUILDING_BONUS =>  array(
        "name" => "buildingBonus",
        "description" => clienttranslate('${actplayer} may receive a build bonus'),
        "descriptionmyturn" => clienttranslate('${you} may receive a build bonus'),
        "type" => "activeplayer",
        "args" => "argBuildingBonus",
        "action" => "stResolveBuilding",
        "possibleactions" => array("buildBonus"),
        "transitions" => array( "done"   => STATE_EVT_SETUP_BONUS,
                                "rail_bonus"    => STATE_BUILD_RAIL_BONUS,
                                "train_station_build"=> STATE_TRAIN_STATION_BUILD,
                                "zombiePass"    => STATE_END_BUILD)
    ),

    STATE_EVT_SETUP_BONUS  => array(
        "name" => "setup_buildEvent",
        "description" => '',
        "type" => "game",
        "action" => "stSetupBuildEvent",
        "transitions" => array( "evt_build" => STATE_EVT_BUILD_AGAIN, 
                                "bonus"     => STATE_EVT_BUILD_BONUS,
                                "done"      => STATE_AUCTION_BONUS )
    ),

    STATE_EVT_BUILD_AGAIN  => array(
        "name" => "chooseBuildingToBuild_event",
        "description" => clienttranslate('${actplayer} may build another building'),
        "descriptionmyturn" => clienttranslate('${you} may build another building'),
        "type" => "activeplayer",
        "args" => "argEventBuildings",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild", "undo" ),
        "transitions" => array( "undoTurn"           => STATE_PAY_AUCTION,
                                "building_bonus"     => STATE_RESOLVE_BUILDING, 
                                "event_bonus"        => STATE_AUCTION_BONUS,
                                "auction_bonus"      => STATE_AUCTION_BONUS,
                                "end_build"          => STATE_CONFIRM_AUCTION,
                                "zombiePass"         => STATE_END_BUILD )
    ),

    STATE_EVT_BUILD_BONUS => array(
        "name" => "BuildBonus_event",
        "description" => clienttranslate('${actplayer} may receive a build bonus'),
        "descriptionmyturn" => clienttranslate('${you} may receive a build bonus'),
        "type" => "activeplayer",
        "args" => "argEventBuildBonus",
        "possibleactions" => array( "trade", "takeLoan", "eventBonus", "undo" ),
        "transitions" => array( "undoTurn"      => STATE_PAY_AUCTION,
                                "auction_bonus" => STATE_AUCTION_BONUS,
                                "done"          => STATE_CONFIRM_AUCTION,
                                "zombiePass"    => STATE_END_BUILD)
    ),

    STATE_TRAIN_STATION_BUILD => array(
        "name" => "trainStationBuild",
        "description" => clienttranslate('${actplayer} may build another building'),
        "descriptionmyturn" => clienttranslate('${you} may build another building'),
        "type" => "activeplayer",
        "args" => "argTrainStationBuildings",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild", "undo" ),
        "transitions" => array( "undoTurn"           => STATE_PAY_AUCTION,
                                "building_bonus" => STATE_RESOLVE_BUILDING, 
                                "auction_bonus"  => STATE_AUCTION_BONUS,
                                "end_build"      => STATE_CONFIRM_AUCTION,
                                "zombiePass"     => STATE_END_BUILD )
    ),

    STATE_AUCTION_BONUS => array(
        "name" => "setupAuctionBonus",
        "description" => '',
        "type" => "game",
        "action" => "stSetupAuctionBonus",
        "transitions" => array( "bonusChoice" => STATE_CHOOSE_BONUS, 
                                "endBuild"    => STATE_CONFIRM_AUCTION,
                                "rail_bonus" => STATE_RAIL_BONUS)
    ),

    STATE_CHOOSE_BONUS => array(
        "name" => "bonusChoice",
        "description" => clienttranslate('${actplayer} may receive a Bonus '),
        "descriptionmyturn" => clienttranslate('${you} may receive a Bonus '),
        "type" => "activeplayer",
        "args" => "argBonusOption",
        "action" => "stSetupTrade",
        "possibleactions" => array( "auctionBonus", 'trade', 'takeLoan', "undo" ),
        "transitions" => array( "undoTurn"  => STATE_PAY_AUCTION,
                                "done"      => STATE_CONFIRM_AUCTION,
                                "railBonus" => STATE_RAIL_BONUS,
                                "zombiePass"=> STATE_END_BUILD )
    ),

    STATE_CONFIRM_AUCTION => array(
        "name" => "confirmActions",
        "description" => clienttranslate('${actplayer} may confirm actions '),
        "descriptionmyturn" => clienttranslate('${you} may confirm actions '),
        "type" => "activeplayer",
        "action" => "stSetupTrade",
        "possibleactions" => array( "done", "undo" ),
        "transitions" => array( "undoTurn"  => STATE_PAY_AUCTION,
                                "done"      => STATE_END_BUILD,
                                "zombiePass"=> STATE_END_BUILD)
    ), 

    STATE_END_BUILD => array(
        "name" => "endBuildRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndBuildRound",
        "updateGameProgression" => true,
        "transitions" => array( "endRound"     => STATE_END_ROUND, 
                                "nextBuilding" => STATE_NEXT_BUILDING )
    ),
    
    STATE_END_ROUND => array(
        "name" => "endRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndRound",
        "transitions" => array( "nextAuction" => STATE_START_ROUND )
    ),

    STATE_ENDGAME_ACTIONS => array(
        "name" => "endGameActions",
        "description" => clienttranslate('Some players may choose to take actions before scoring'),
        "descriptionmyturn" => clienttranslate('${you} may choose to take actions before scoring'),
        "type" => "multipleactiveplayer",
        "action" => "stEndGameActions",
        "possibleactions" => array( "payLoan", "takeLoan", "trade", 'hireWorker', "done" ),
        "transitions" => array( "" => STATE_UPDATE_SCORES)
    ),

    STATE_UPDATE_SCORES => array(
        "name" => "UpdateScores",
        "description" => '',
        "type" => "game",
        "action" => "stUpdateScores",
        "transitions" => array( "nextAuction" => 99 )
    ),

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);
