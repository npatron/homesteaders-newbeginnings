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
        $this->game->Event->passBid($this->game->getActivePlayerId());
        //$this->game->setGameStateValue('phase', PHASE_BID_PASS );
        $this->game->gamestate->nextState( 'pass' );
    }

    public function playerBuildBuilding($b_key, $costReplaceArgs){
        $this->game->checkAction( "buildBuilding" );
        $this->game->Building->buildBuilding($this->game->getActivePlayerId(), $b_key, $costReplaceArgs);
        $this->game->gamestate->nextState ('done');
    }

    public function playerBuildBuildingDiscount($b_key, $costReplaceArgs, $discount){
        $this->game->checkAction( "buildBuilding" );
        $discount_type = $this->game->resource_map[$discount];
        $this->game->Building->buildBuildingDiscount($this->game->getActivePlayerId(), $b_key, $costReplaceArgs, $discount_type);
        $this->game->gamestate->nextState ('done');
    }

    public function playerDoNotBuild () {
        $this->game->checkAction( "doNotBuild" );
        if ($this->game->getGameStateValue( 'rail_no_build') == ENABLED){
            $cur_auc = $this->game->getGameStateValue( 'current_auction' );
            $this->game->Resource->addTrackAndNotify($this->game->getActivePlayerId(), clienttranslate("Auction $cur_auc (In place of Build)"), 'auction', $cur_auc);
            $this->game->Score->updatePlayerScore($this->game->getActivePlayerId());
        }
        //goto next state;
        $this->game->setGameStateValue('last_building', 0);
        $this->game->setGameStateValue('building_bonus', BUILD_BONUS_NONE);
        $this->game->gamestate->nextState('done');
    }
    
    public function BuildSteel () {
        $this->game->checkAction( "eventLotBonus" );
        $p_id = $this->game->getActivePlayerId();
        if (!$this->game->Resource->canPlayerAfford($p_id, array('steel'=>1))){
            throw new BgaUserException( sprintf(clienttranslate("You need a %s to take this action"),"<div class='log_steel token_inline'></div>"));
        }
        $this->game->Resource->updateAndNotifyPayment($p_id, "steel", 1, $this->game->Event->getEventName());
        //goto next state;
        $this->game->gamestate->nextState('evt_build');
    }

    public function playerHireWorker($p_id){
        $worker_cost = array('trade'=>1,'food'=>1);
        if (!$this->game->Resource->canPlayerAfford($p_id, $worker_cost))
            throw new BgaUserException( clienttranslate("You cannot afford to hire a worker"));
        $this->game->Resource->updateAndNotifyPaymentGroup($p_id, $worker_cost, clienttranslate('Hire Worker'));
        $this->game->Log->updateResource($p_id, "trade", -1);
        $this->game->Log->updateResource($p_id, "food", -1);
        $this->game->Resource->addWorkerAndNotify($p_id, 'hire');
    }

    public function playerSelectRailBonus($selected_bonus) {
        $this->game->checkAction( "chooseBonus" );
        $act_p_id = $this->game->getActivePlayerId();
        $options = $this->game->Resource->getRailAdvBonusOptions($act_p_id);
        if (!in_array ($selected_bonus, $options)){
            throw new BgaUserException( clienttranslate("invalid bonus option selected") );
        } 
        $this->game->Resource->receiveRailBonus($act_p_id, $selected_bonus);
        $this->game->gamestate->nextState( 'done' );
    }

    public function playerCancelBidPass () {
        $this->game->checkAction('undoPass');
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
        $this->game->Resource->addWorkerAndNotify($act_p_id, $b_name, 'building', $b_key);
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
            $this->game->Resource->addWorkerAndNotify($act_p_id, clienttranslate('Auction Bonus'));
            $this->game->gamestate->nextState( 'done' );
        } else if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV){
            $auc_no = $this->game->getGameStateValue( 'current_auction');
            $this->game->Resource->addWorkerAndNotify($act_p_id, clienttranslate('Auction Bonus'), 'auction', $auc_no );
            //$this->game->setGameStateValue( 'phase', PHASE_AUC_BONUS);
            $this->game->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $this->game->gamestate->nextState( 'rail_bonus' );
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

    public function playerPassBonusAuction () {
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
            $next_state = 'rail_bonus';
        }
        $this->game->gamestate->nextState( $next_state );
    }

    /***** Event Bonus *****/
    public function playerFreeHireWorkerEvent ( ) 
    {
        $this->game->checkAction( "eventBonus" );
        $act_p_id = $this->game->getActivePlayerId();
        if (!$this->game->Event->isAuctionAffected()){
            throw new BgaVisibleSystemException ( clienttranslate("Free Hire Worker called, but there is no event bonus"));
        }
        if ($this->game->Event->getEventAucB() != EVT_AUC_BONUS_WORKER) {
            throw new BgaVisibleSystemException ( sprintf(clienttranslate("Free Hire Worker called, but event bonus is %s"),$this->game->Event->getEventAucB()));
        }
        
        $this->game->Resource->addWorkerAndNotify($act_p_id, clienttranslate('Event Bonus'));
        $this->game->Event->postEventBonusNav();
    }

    public function playerSilver2forTrackEvent ( ) 
    {
        $this->game->checkAction( "eventBonus" );
        if (!$this->game->Event->isAuctionAffected()){
            throw new BgaVisibleSystemException ( clienttranslate("trade 2 Silver for track called, but there is no event bonus"));
        }
        if ($this->game->Event->getEventAucB() != EVT_AUC_2SILVER_TRACK) {
            throw new BgaVisibleSystemException ( sprintf(clienttranslate("trade 2 Silver for track called, but event bonus is %s"),$this->game->Event->getEventAucB()));
        }
        $this->game->Resource->specialTrade($this->game->getActivePlayerId(), array('silver'=>2), array('track'=>1), clienttranslate('Event Reward'), 'event');
        $this->game->Event->postEventBonusNav();
    }

    public function playerPassBonusLotEvent() {
        $this->game->checkAction( "eventLotBonus" );
        $act_p_id = $this->game->getActivePlayerId();
        $this->game->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Event Bonus' ), array(
            'player_id' => $act_p_id,
            'player_name' => $this->game->getActivePlayerName()));
        $this->game->Event->postEventBonusNav();
    }

    /*
     * restartTurn: called when a player decide to go back at the beginning of the player build phase
     */
    public function playerCancelPhase () {
        $this->game->checkAction('undoLot');
        // undo all actions since beginning of STATE_PAY_AUCTION

        $this->game->Log->cancelPhase();
        $this->game->gamestate->nextState('undoLot');
    }

    /** endBuildRound */
    public function playerConfirmChoices (){
        $this->game->checkAction('done');
        $this->game->Bid->clearBidForPlayer($this->game->getActivePlayerId());
        $this->game->gamestate->nextState( 'done' );
    }

    // endGameActions Actions
    public function playerDoneEndgame($p_id) {
        $this->game->checkAction('done');
        $this->game->gamestate->setPlayerNonMultiactive($p_id, "" );
    }
}
