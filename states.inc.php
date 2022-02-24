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
        "transitions" => array( "auction" => STATE_PAY_WORKERS, )
    ),

    // removing this and handling it in allocateWorkers.
    STATE_PAY_WORKERS => array(
        "name" => "payWorkers",
        "description" => clienttranslate('Some players must choose how to pay workers'),
        "descriptionmyturn" => clienttranslate('${you} must choose how to pay workers'),
        "type" => "multipleactiveplayer",
        "action" => "stPayWorkers",
        "args" => "argPayWorkers",
        "possibleactions" => array( "takeLoan", "trade", "done" ),
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
        "description" => clienttranslate('Some players may choose to trade for Event'),
        "descriptionmyturn" => clienttranslate('${you} may choose to trade for Event'),
        "descriptiontrade" => clienttranslate('Some players may choose to trade before Event'),
        "descriptionmyturntrade" => clienttranslate('${you} may choose to trade before Event'),
        "descriptionmyturnsellfree" => clienttranslate('${you} may sell resources'),
        "descriptionhidden" => clienttranslate('Some players may choose to trade before event (trades temporarily hidden)'),
        "descriptionmyturnhidden" => clienttranslate('${you} may choose to trade before event (trades temporarily hidden)'),
        "type" => "multipleactiveplayer",
        "action" => "stEventSetupTrade",
        "args" => "argsEventPreTrade",
        "possibleactions" => array( "trade", "takeLoan", "event", "actionCancel" ),
        "transitions" => array( "post" => STATE_EVT_POST_TRADE,
                                "done" => STATE_BEGIN_AUCTION,)
    ),

    STATE_EVT_BONUS => array(
        "name" => "bonusChoice_event",
        "description" => clienttranslate('Some players may choose to receive event bonus'),
        "descriptionmyturn" => clienttranslate('${you} may choose to receive event bonus'),
        "type" => "multipleactiveplayer",
        "action" => "stEventSetupBonus",
        "possibleactions" => array( "eventBonus" ),
        "transitions" => array( "rail_bonus"=> STATE_EVT_BONUS_RAIL,
                                "done" => STATE_BEGIN_AUCTION,)
    ),

    STATE_EVT_PAY => array(
        "name" => "eventPay",
        "description" => clienttranslate('some players must pay for event'),
        "descriptionmyturn" => clienttranslate('${you} must pay for event'),
        "action" => "stEventSetupPay",
        "type" => "multipleactiveplayer",
        "args" => "argEventPay",
        "possibleactions" => array( "trade", "takeLoan", "updateGold", "done" ),
        "transitions" => array( "done" => STATE_BEGIN_AUCTION,)
    ),
    
    STATE_EVT_POST_TRADE => array(
        "name" => "eventPhasePostTrade",
        "description" => '',
        "type" => "game",
        "action" => "stEvtPostTrade",
        "transitions" => array( "done" => STATE_BEGIN_AUCTION,)
    ),

    STATE_EVT_BONUS_RAIL => array(
        "name" => "bonusChoice_eventRail",
        "description" => clienttranslate('Some players must choose a railroad advance bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad advance bonus'),
        "type" => "multipleactiveplayer",
        "args" => "argEventBonus",
        "possibleactions" => array( "chooseBonus", "eventChooseBonus" ),
        "transitions" => array( "done" => STATE_BEGIN_AUCTION,)
    ),

    // bidding phase
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
                                "rail" => STATE_PASS_RAIL_BONUS,
                                "event" => STATE_EVT_PASS_BONUS,
                                "pass" => STATE_PASS_RAIL_BONUS, 
                                "zombiePass" => STATE_NEXT_BID,)
    ),

    STATE_EVT_PASS_BONUS => array(
        "name" => "pass_event",
        "description" => clienttranslate('${actplayer} may trade and pay dept'),
        "descriptionmyturn" => clienttranslate('${you} may trade and pay dept'),
        "type" => "activeplayer",
        "args" => "argEventTrade",
        "action"=> "stPassEvent",
        "possibleactions" => array( "payLoanEvent", "trade", "undoPass" ),
        "transitions" => array( "undoPass" => STATE_PLAYER_BID,
                                "rail" => STATE_PASS_RAIL_BONUS,
                                "zombiePass" => STATE_PLAYER_BID,)
    ),

    STATE_PASS_RAIL_BONUS => array(
        "name" => "getRailBonus",
        "description" => clienttranslate('${actplayer} must choose a railroad advance bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad advance bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undoPass"),
        "transitions" => array( "undoPass"=> STATE_PLAYER_BID,
                                "done" => STATE_NEXT_BID, 
                                "zombiePass"=> STATE_NEXT_BID,)
    ),

    //game state that determines next bidder/end of auction, and assigns next player.
    STATE_NEXT_BID => array(
        "name" => "nextBid",
        "description" => '',
        "type" => "game",
        "action" => "stNextBid",
        "transitions" => array( "skipPlayer" => STATE_NEXT_BID, 
                                "playerBid" => STATE_PLAYER_BID, 
                                "endAuction" => STATE_NEXT_LOT, )
    ),

    STATE_NEXT_LOT => array(
        "name" => "buildingPhase",
        "description" => '',
        "type" => "game",
        "action" => "stBuildingPhase",
        "updateGameProgression" => true,
        "transitions" => array( "auctionWon" => STATE_PAY_LOT, 
                                "auctionPassed" => STATE_END_CURRENT_LOT, )
    ),

    STATE_PAY_LOT => array(
        "name" => "payLot",
        "description" => clienttranslate('${actplayer} must pay for ${auction}'),
        "descriptionmyturn" => clienttranslate('${you} must pay for ${auction}'),
        "type" => "activeplayer",
        "args" => "argLotCost",
        "possibleactions" => array( "trade", "takeLoan", "updateGold", "done" ),
        "transitions" => array( "chooseLotAction" => STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"=> STATE_END_CURRENT_LOT,)
    ),

    STATE_CHOOSE_LOT_ACTION => array(
        "name" => "chooseLotAction",
        "description" => clienttranslate('${actplayer} must choose action to resolve'),
        "descriptionmyturn" => clienttranslate('${you} must choose action to resolve'),
        "type" => "activeplayer",
        "args" => "argLotChooseAction",
        "action" => "stLotChooseAction",
        "possibleactions" => array( "chooseLotAction", "done", "undoLot" ),
        "transitions" => array( "undoLot" => STATE_PAY_LOT,
                                "build" => STATE_CHOOSE_BUILDING,
                                "event" => STATE_EVT_SETUP_BONUS,
                                "auction_bonus" => STATE_AUC_SETUP_BONUS,
                                "pass" => STATE_CONFIRM_LOT,
                                "zombiePass"=> STATE_END_CURRENT_LOT,)
    ),

    STATE_CHOOSE_BUILDING => array(
        "name" => "chooseBuildingToBuild",
        "description" => clienttranslate('${actplayer} may choose a building to build'),
        "descriptionmyturn" => clienttranslate('${you} may choose a building to build'),
        "type" => "activeplayer",
        "args" => "argAllowedBuildings",
        "action" => "stChooseBuilding",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild", "undoLot" ),
        "transitions" => array( "undoLot"   => STATE_PAY_LOT,
                                "done"      => STATE_RESOLVE_BUILD, 
                                "zombiePass"=> STATE_END_CURRENT_LOT, )
    ),

    STATE_RESOLVE_BUILD => array(
        "name" => "resolveBuild",
        "description" => '',
        "type" => "game",
        "action" => "stResolveBuilding",
        "transitions" => array( "building_bonus" => STATE_BUILD_BONUS, 
                                "rail_bonus"    => STATE_BUILD_RAIL_BONUS,
                                "train_station_build"=> STATE_TRAIN_STATION_BUILD,
                                "done"   =>        STATE_CHOOSE_LOT_ACTION,)
    ),

    STATE_BUILD_BONUS =>  array(
        "name" => "bonusChoice_build",
        "description" => clienttranslate('${actplayer} may receive a build bonus'),
        "descriptionmyturn" => clienttranslate('${you} may receive a build bonus'),
        "type" => "activeplayer",
        "args" => "argBuildingBonus",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "takeLoan", "buildBonus", "undoLot" ),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "done"   => STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"    => STATE_END_CURRENT_LOT,)
    ),

    STATE_BUILD_RAIL_BONUS => array(
        "name" => "getRailBonus_build",
        "description" => clienttranslate('${actplayer} must choose a railroad advance bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad advance bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undoLot"),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "done"=> STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"=> STATE_END_CURRENT_LOT,)
                                
    ),

    STATE_TRAIN_STATION_BUILD => array(
        "name" => "trainStationBuild",
        "description" => clienttranslate('${actplayer} may build another building'),
        "descriptionmyturn" => clienttranslate('${you} may build another building'),
        "type" => "activeplayer",
        "args" => "argTrainStationBuildings",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild", "undoLot" ),
        "transitions" => array( "undoLot"   => STATE_PAY_LOT,
                                "done"       => STATE_RESOLVE_BUILD, 
                                "zombiePass" => STATE_END_CURRENT_LOT, )
    ),

    STATE_EVT_SETUP_BONUS  => array(
        "name" => "setup_lot_event",
        "description" => '',
        "type" => "game",
        "action" => "stSetupEventLotBonus",
        "transitions" => array( "evt_build" => STATE_EVT_BUILD_AGAIN, 
                                "evt_bonus" => STATE_EVT_CHOICE,
                                "done"      => STATE_CHOOSE_LOT_ACTION, )
    ),

    STATE_EVT_CHOICE => array(
        "name" => "bonusChoice_lotEvent",
        "description" => clienttranslate('${actplayer} may receive event bonus'),
        "descriptionmyturn" => clienttranslate('${you} may receive event bonus'),
        "descriptionalternate" => clienttranslate('${actplayer} may pay to build again'),
        "descriptionmyturnalternate" => clienttranslate('${you} may pay to build again'),
        "type" => "activeplayer",
        "args" => "argEventBuildBonus",
        "possibleactions" => array( "trade", "takeLoan", "eventLotBonus", "undoLot" ),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "evt_build" => STATE_EVT_BUILD_AGAIN, 
                                "done"      => STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"=> STATE_END_CURRENT_LOT, )
    ),

    STATE_EVT_BUILD_AGAIN  => array(
        "name" => "chooseBuildingToBuild_event",
        "description" => clienttranslate('${actplayer} may build a building'),
        "descriptionmyturn" => clienttranslate('${you} may build a building'),
        "type" => "activeplayer",
        "args" => "argEventBuildings",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "buildBuilding", "takeLoan", "doNotBuild", "undoLot" ),
        "transitions" => array( "undoLot"    => STATE_PAY_LOT,
                                "done"       => STATE_EVT_RESOLVE_BUILD, 
                                "zombiePass" => STATE_END_CURRENT_LOT, )
    ),

    STATE_EVT_RESOLVE_BUILD => array(
        "name" => "resolveBuild_event",
        "description" => '',
        "type" => "game",
        "action" => "stResolveBuilding",
        "transitions" => array( "building_bonus" => STATE_EVT_BUILD_BONUS, 
                                "rail_bonus"    =>  STATE_EVT_RAIL_BONUS,
                                "done"=>            STATE_CHOOSE_LOT_ACTION,)
    ),

    STATE_EVT_BUILD_BONUS => array(
        "name" => "bonusChoice_eventBuild",
        "description" => clienttranslate('${actplayer} may receive a build bonus'),
        "descriptionmyturn" => clienttranslate('${you} may receive a build bonus'),
        "type" => "activeplayer",
        "args" => "argBuildingBonus",
        "action" => "stSetupTrade",
        "possibleactions" => array( "trade", "takeLoan", "buildBonus", "undoLot" ),
        "transitions" => array( "undoLot"     => STATE_PAY_LOT,
                                "done"        => STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"  => STATE_END_CURRENT_LOT,)
    ),

    STATE_EVT_RAIL_BONUS => array(
        "name" => "getRailBonus_event",
        "description" => clienttranslate('${actplayer} must choose a railroad advance bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad advance bonus'),
        "type" => "activeplayer",
        "args" => "argRailBonus",
        "possibleactions" => array( "chooseBonus", "undoLot"),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "done"      => STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"=> STATE_END_CURRENT_LOT,)
    ),  
    
    STATE_AUC_SETUP_BONUS => array(
        "name" => "setupAuctionBonus",
        "description" => '',
        "type" => "game",
        "action" => "stSetupAuctionBonus",
        "transitions" => array( "bonusChoice" => STATE_AUC_CHOOSE_BONUS, 
                                "rail_bonus"  => STATE_AUC_RAIL_BONUS,
                                "done"    => STATE_CHOOSE_LOT_ACTION,)
    ),

    STATE_AUC_CHOOSE_BONUS => array(
        "name" => "bonusChoice_auction",
        "description" => clienttranslate('${actplayer} may receive a Bonus '),
        "descriptionmyturn" => clienttranslate('${you} may receive a Bonus '),
        "type" => "activeplayer",
        "args" => "argBonusOption",
        "action" => "stSetupTrade",
        "possibleactions" => array( "auctionBonus", 'trade', 'takeLoan', "undoLot" ),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "done"      => STATE_CHOOSE_LOT_ACTION,
                                "rail_bonus" => STATE_AUC_RAIL_BONUS,
                                "zombiePass"=> STATE_END_CURRENT_LOT, )
    ),

    STATE_AUC_RAIL_BONUS => array(
        "name" => "getRailBonus_auction",
        "description" => clienttranslate('${actplayer} must choose a railroad advance bonus'),
        "descriptionmyturn" => clienttranslate('${you} must choose a railroad advance bonus'),
        "type" => "activeplayer",
        "args" => "argPassRailBonus",
        "possibleactions" => array( "chooseBonus", "undoLot"),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "done"=>    STATE_CHOOSE_LOT_ACTION,
                                "zombiePass"=> STATE_END_CURRENT_LOT,)
    ),

    STATE_CONFIRM_LOT => array(
        "name" => "confirmActions",
        "description" => clienttranslate('${actplayer} may confirm actions '),
        "descriptionmyturn" => clienttranslate('${you} may confirm actions '),
        "type" => "activeplayer",
        "action" => "stSetupTrade",
        "possibleactions" => array( "done", "undoLot" ),
        "transitions" => array( "undoLot"  => STATE_PAY_LOT,
                                "done"      => STATE_END_CURRENT_LOT,
                                "zombiePass"=> STATE_END_CURRENT_LOT,)
    ), 

    STATE_END_CURRENT_LOT => array(
        "name" => "endBuildRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndBuildRound",
        "updateGameProgression" => true,
        "transitions" => array( "endRound"     => STATE_END_ROUND, 
                                "nextBuilding" => STATE_NEXT_LOT, )
    ),
    
    STATE_END_ROUND => array(
        "name" => "endRound",
        "description" => '',
        "type" => "game",
        "action" => "stEndRound",
        "transitions" => array( "nextAuction" => STATE_START_ROUND, )
    ),

    STATE_ENDGAME_ACTIONS => array(
        "name" => "endGameActions",
        "description" => clienttranslate('Some players may choose to take actions before scoring'),
        "descriptionmyturn" => clienttranslate('${you} may choose to take actions before scoring'),
        "type" => "multipleactiveplayer",
        "action" => "stEndGameActions",
        "possibleactions" => array( "payLoan", "takeLoan", "trade", 'hireWorker', "done", "actionCancel" ),
        "transitions" => array( "" => STATE_UPDATE_SCORES,)
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
