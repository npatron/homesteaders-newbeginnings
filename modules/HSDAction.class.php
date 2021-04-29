<?php

/*
 * HSDAction: a class that allows handles Player Action button clicks.
 */
class HSDAction extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    /*****  Common Methods (loan, trade) *****/
    public function playerTakeLoan($p_id)
    {
        $this->game->checkAction( "takeLoan" );
        $this->game->Resource->takeLoan($p_id);
    }

    public function playerTrade( $p_id, $tradeAction_csv, $notActive )
    {
        // allow out of turn trade, only when flag is passed during allocateWorkers State.
        if (!($notActive && $this->game->gamestate->state()['name'] === "allocateWorkers"))
            $this->game->checkAction( 'trade' );
        $tradeAction_arr = explode(',', $tradeAction_csv);
        foreach( $tradeAction_arr as $key=>$val ){
            $tradeAction = $this->game->trade_map[$val];
            $this->game->Resource->trade($p_id, $tradeAction);
        }
    }

    /***  place workers phase ***/

    public function playerSelectWorkerDestination($p_id, $w_key, $b_key, $building_slot) 
    {
        $this->game->checkAction( "placeWorker" );
        $w_owner = $this->game->getUniqueValueFromDB("SELECT `player_id` FROM `workers` WHERE `worker_key`='$w_key'");
        if ($w_owner != $p_id){ throw new BgaUserException(clienttranslate("The selected worker is not your worker"));}
        $this->game->notifyAllPlayers( "workerMoved", "", array(
            'i18n' => array( 'building_name' ),
            'player_id' => $p_id,
            'worker_key' => $w_key,
            'building_key' => $b_key,
            'building_name' => array('type'=> $this->game->Building->getBuildingTypeFromKey($b_key) ,'str'=>$this->game->Building->getBuildingNameFromKey($b_key)),
            'building_slot' => $building_slot, 
            'worker' => 'worker',
            'player_name' => $this->game->getPlayerName($p_id),
        ) );
        $sql = "UPDATE `workers` SET `building_key`= '".$b_key."', `building_slot`='".$building_slot."' WHERE `worker_key`='".$w_key."'";
        $this->game->DbQuery( $sql );
    }

    public function playerDonePlacingWorkers ($p_id, $warehouse = null){
        if ($this->game->Building->doesPlayerOwnBuilding($p_id, BLD_WAREHOUSE)){
            if (is_null($warehouse))
                throw new BgaUserException( clienttranslate("You must select a warehouse income"));
            if ($this->game->Building->canPlayerReceiveWarehouseIncome($p_id, $this->game->resource_map[$warehouse]))
                throw new BgaUserException( clienttranslate("You cannot select that warehouse income"));
        }
        $this->game->Resource->collectIncome($p_id, $warehouse);
        $this->game->gamestate->setPlayerNonMultiactive( $p_id , 'auction' );
    }

    /*** Player Bid Phase ***/
    public function playerConfirmDummyBid($bid_location){
        $this->game->checkAction('dummy');
        $this->game->Bid->confirmDummyBid($bid_location);
        $this->game->gamestate->nextState( "nextBid" );
    }

    public function playerConfirmBid($bid_location){
        $this->game->checkAction( "confirmBid" );
        $this->game->Bid->confirmBid($bid_location);
        $this->game->gamestate->nextState( "nextBid" );
    }

    public function playerPassBid(){
        $this->game->checkAction( "pass" );
        $this->game->Bid->passBid();
        $this->game->Log->passBid($this->game->getActivePlayerId());
        $next_state = $this->game->Event->passBid($this->game->getActivePlayerId());
        $this->game->setGameStateValue('phase', PHASE_BID_PASS );
        $this->game->gamestate->nextState( $next_state );
    }

    public function playerBuildBuilding($selected_building, $goldAsCow, $goldAsCopper){
        $this->game->checkAction( "buildBuilding" );
        $act_p_id = $this->game->getActivePlayerId();
        $this->game->Building->buildBuilding($act_p_id, $selected_building, $goldAsCow, $goldAsCopper);
        if ($this->game->Building->doesPlayerOwnBuilding($act_p_id, BLD_FORGE) && 
            $this->game->Building->getBuildingIdFromKey($selected_building) != BLD_FORGE){
            $this->game->Resource->updateAndNotifyIncome($act_p_id, 'vp', 1, array('type'=>TYPE_INDUSTRIAL, 'str'=>"Forge") );
            $this->game->Log->updateResource($act_p_id, 'vp', 1);
        }
        $building_bonus = $this->game->Building->getOnBuildBonusForBuildingKey($selected_building);
        $this->game->setGameStateValue('building_bonus', $building_bonus);
        $bonus = $this->game->Auction->getCurrentAuctionBonus();
        $next_state = 'end_build';
        if ($building_bonus != BUILD_BONUS_NONE){
            $next_state = 'building_bonus';     
        } else if ($this->game->Event->isAuctionAffected()){
            $next_state = 'event_bonus';
        } else if ($bonus != AUC_BONUS_NONE){      
            $next_state = 'auction_bonus'; 
        }
        $this->game->Score->updatePlayerScore($act_p_id);
        $this->game->gamestate->nextState ($next_state);
    }

    public function playerDoNotBuild () {
        $this->game->checkAction( "doNotBuild" );
        //goto next state;
        $this->game->gamestate->nextState( "auction_bonus" ); 
    }

    



    

    public function playerSelectRailBonus($selected_bonus) {
        $act_p_id = $this->game->getActivePlayerId();
        $options = $this->game->Resource->getRailAdvBonusOptions($act_p_id);
        if (!in_array ($selected_bonus, $options)){
            throw new BgaUserException( clienttranslate("invalid bonus option selected") );
        } 
        $this->game->Resource->recieveRailBonus($act_p_id, $selected_bonus);
        $phase = $this->game->getGameStateValue( 'phase' );
        $next_state = "";
        switch($phase){
            case PHASE_BID_PASS:
                $next_state = "nextBid";
            break;
            case PHASE_BLD_BONUS:
                $next_state = "auctionBonus";
            break;
            case PHASE_AUC_BONUS:
                $next_state = "endAuction";
            break;
        }
        $this->game->gamestate->nextState( $next_state );
    }

    public function playerCancelBidPass () {
        $this->game->checkAction('undo');
        $this->game->Bid->cancelPass();
        $this->game->Log->cancelPass();
        $this->game->gamestate->nextState('undoPass');
    }

    /**** Building Bonus Player actions *****/
    public function playerFreeHireWorkerBuilding()
    {
        $this->game->checkAction( "buildBonus" );
        $act_p_id = $this->game->getActivePlayerId();
        $b_key = $this->game->getGameStateValue('last_building');
        $b_name = $this->game->Building->getBuildingNameFromKey($b_key);
        $this->game->Resource->addWorker($act_p_id, $b_name, 'building', $b_key);
        $this->game->gamestate->nextState( 'auction_bonus' );
    }

    public function playerPassBuildingBonus () 
    {
        $this->game->checkAction( "buildBonus" );
        $this->game->gamestate->nextState( 'auction_bonus' );
    }

    /**** Auction Bonus actions ******/
    public function playerFreeHireWorkerAuction ( ) 
    {
        $this->game->checkAction( "auctionBonus" );
        $act_p_id = $this->game->getActivePlayerId();
        $auction_bonus = $this->game->getGameStateValue( 'auction_bonus');
        if ($auction_bonus == AUC_BONUS_WORKER) {
            $this->game->Resource->addWorker($act_p_id, clienttranslate('Auction Bonus'));
            $this->game->gamestate->nextState( 'done' );
        } else if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV){
            $this->game->Resource->addWorker($act_p_id, clienttranslate('Auction Bonus'));
            $this->game->setGameStateValue( 'phase', PHASE_AUC_BONUS);
            $auc_no = $this->game->getGameStateValue( 'current_auction');
            $this->game->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $this->game->gamestate->nextState( 'railBonus' );
        } else {
            throw new BgaVisibleSystemException ( sprintf(clienttranslate("Free Hire Worker called, but auction bonus is %s"),$auction_bonus) );
        }
    }

    public function playerTypeForType ($tradeAway, $tradeFor){
        $this->game->checkAction( "auctionBonus");
        $act_p_id = $this->game->getActivePlayerId();
        $tradeAwayType = $this->game->resource_map[$tradeAway];
        if (!$this->game->Resource->canPlayerAfford($act_p_id, array($tradeAwayType=> 1))) {
            throw new BgaUserException( sprintf(clienttranslate("You need a %s to take this action"),"<div class='log_${tradeAwayType} token_inline'></div>") );
        }
        $tradeForType = 'track'; // default is currently track.
        if ($tradeFor == VP){ // determine if vp2 or vp4.
            if ($tradeAway == FOOD) $tradeForType = 'vp2';
            else $tradeForType = 'vp4';
        }
        $auc_no = $this->game->getGameStateValue('current_auction');
        $this->game->Resource->specialTrade($act_p_id, array($tradeAwayType=>1), array($tradeForType=>1), sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no);
        
        $this->game->gamestate->nextState( 'done' );
    }

    public function playerPassAuctionBonus () {
        $this->game->checkAction( "auctionBonus" );
        $act_p_id = $this->game->getActivePlayerId();
        $this->game->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Auction Bonus' ), array(
            'player_id' => $act_p_id,
            'player_name' => $this->game->getActivePlayerName()));
        $next_state = 'done';
        $auction_bonus = $this->game->getGameStateValue('auction_bonus');
        if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV) {
            $this->game->setGameStateValue( 'phase', PHASE_AUC_BONUS);
            $auc_no = $this->game->getGameStateValue('current_auction');
            $this->game->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $next_state = 'railBonus';
        }
        $this->game->gamestate->nextState( $next_state );
    }

    /*
     * restartTurn: called when a player decide to go back at the beginning of the player build phase
     */
    public function playerCancelPhase () {
        $this->game->checkAction('undo');
        // undo all actions since beginning of STATE_PAY_AUCTION

        $this->game->Log->cancelPhase();
        $this->game->gamestate->nextState('undoTurn');
    }

    /** endBuildRound */
    public function playerConfirmChoices (){
        $this->game->checkAction('done');
        $this->game->Bid->clearBidForPlayer($this->game->getActivePlayerId());
        $this->game->gamestate->nextState( 'done' );
    }

    // endGameActions Actions
    public function playerPayLoan($p_id, $gold) {
        $this->game->checkAction('payLoan'); 
        $this->game->Resource->payOffLoan($p_id, $gold);
    }

    public function playerDoneEndgame($p_id) {
        $this->game->checkAction('done');
        $this->game->gamestate->setPlayerNonMultiactive($p_id, "" );
    }
}
