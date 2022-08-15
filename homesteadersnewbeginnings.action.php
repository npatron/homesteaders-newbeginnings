<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteadersnewbeginningsNewBeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * homesteadersnewbeginnings.action.php
 *
 * HomesteadersNewBeginnings main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/homesteadersnewbeginnings/homesteadersnewbeginnings/myAction.html", ...)
 *
 */
  
  
class action_homesteadersnewbeginnings extends APP_GameAction
{ 
  // Constructor: please do not modify
  public function __default()
  {
      if( self::isArg( 'notifwindow') )
      {
          $this->view = "common_notifwindow";
          $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
      }
      else
      {
          $this->view = "homesteadersnewbeginnings_homesteadersnewbeginnings";
          self::trace( "Complete reinitialization of board game" );
    }
  } 

  // common actions
  public function trade(){
    self::setAjaxMode( );
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $notActive = self::getArg( "notActive", AT_bool, false);

    $this->game->playerTrade($trade_action, $notActive);
    self::ajaxResponse( );
  }

  public function tradeHidden(){
    self::setAjaxMode( );
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    
    $this->game->playerTradeHidden($trade_action);
    self::ajaxResponse( );
  }

  public function undoTransactions(){
    self::setAjaxMode( );
    $this->game->playerCancelTransactions();
    self::ajaxResponse( );
  }

  public function undoEventTransactions() {
    self::setAjaxMode( );
    $this->game->playerCancelEventTransactions();
    self::ajaxResponse( );
  }

  public function undoHiddenTransactions() {
    self::setAjaxMode( );
    $this->game->playerCancelHiddenTransactions();
    self::ajaxResponse( );
  }

  // pay workers
  public function donePay() {
    self::setAjaxMode( );
    
    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);

    $gold = self::getArg( "gold", AT_posint, true);
    $this->game->playerPay($gold);
    self::ajaxResponse( );
  }

  public function doneTradingAuction() {
    self::setAjaxMode( );

    self::debug("doneTradingAuction");
    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    self::dump("trade_action", $trade_action);
    $this->game->playerTrade($trade_action, false);
    
    self::debug("doneTradingAuction2");
    $this->game->playerDoneTradingAuction();
    self::ajaxResponse( );
  }

  public function doneHiddenTradeEvent(){
    self::setAjaxMode( );
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTradeHidden($trade_action, false);

    $this->game->playerDoneTradingEvent();
    self::ajaxResponse( );
  }

  public function doneTradingEvent() {
    self::setAjaxMode( );
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);

    $this->game->playerDoneTradingEvent();
    self::ajaxResponse( );
  }

  public function cancelTurn() {
    self::setAjaxMode( );
    $this->game->playerCancelPhase();
    self::ajaxResponse( );
  }

  public function confirmChoices() {
    self::setAjaxMode( );
    $this->game->playerConfirmChoices();
    self::ajaxResponse( );
  }

  // place worker actions
  public function donePlacingWorkers() {
    self::setAjaxMode( );
    $warehouse = self::getArg( "warehouse", AT_posint, false);
    $this->game->playerDonePlacingWorkers( $warehouse );
    self::ajaxResponse( );
  }

  public function hireWorker() {
    self::setAjaxMode( );
    $this->game->playerHireWorker();
    self::ajaxResponse( );
  }

  public function selectWorkerDestination() {
    self::setAjaxMode( );
    $worker_key = self::getArg( "worker_key", AT_posint, true);
    $building_key = self::getArg( "building_key", AT_posint, true); 
    $building_slot = self::getArg( "building_slot", AT_posint, true);
    $this->game->playerSelectWorkerDestination( $worker_key, $building_key, $building_slot );
    self::ajaxResponse( );
  }

  public function actionCancelAllocateWorkers() {
    self::setAjaxMode();
    $this->game->playerActionCancelAllocateWorkers();
    self::ajaxResponse();
  }

  public function actionCancelDone() {
    self::setAjaxMode();
    $this->game->playerActionCancelDone();
    self::ajaxResponse();
  }

  public function actionCancelEventDone() {
    self::setAjaxMode();
    $this->game->playerActionCancelEventDone();
    self::ajaxResponse();
  }

  // bid actions
  public function confirmBid (){
    self::setAjaxMode( );
    $bid_loc = self::getArg( "bid_loc", AT_posint, true);
    $this->game->playerConfirmBid( $bid_loc );
    self::ajaxResponse( );
  }

  public function confirmDummyBid (){
    self::setAjaxMode( );
    $bid_loc = self::getArg( "bid_loc", AT_posint, true);
    $this->game->playerConfirmDummyBid( $bid_loc );
    self::ajaxResponse( );
  }

  public function passBid (){
    self::setAjaxMode( );
    $this->game->playerPassBid( );
    self::ajaxResponse( );
  }

  public function donePassEvent(){
    self::setAjaxMode( );

    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $gold = self::getArg("gold", AT_int, true);
    $loans = self::getArg("loans", AT_int, true);
    $this->game->playerTrade($trade_action, false);

    $this->game->playerDonePassEvent($loans, $gold);
    self::ajaxResponse( );
  }
  
  // DONE actions
  public function doNotBuild() {
    self::setAjaxMode( );
    $this->game->playerDoNotBuild( );
    self::ajaxResponse( );
  }

  public function steelBuildBuilding(){
    self::setAjaxMode( );

    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);

    $this->game->playerBuildSteel();
    self::ajaxResponse( );
  }

  public function buildBuilding(){
    self::setAjaxMode( );
    
    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);

    $building_key = self::getArg( "building_key", AT_posint, true);
    $costReplaceArgs = array();
    $goldAsCow = self::getArg( "goldAsCow", AT_posint, false);
    if ($goldAsCow??0>0){
      $costReplaceArgs['cow']=$goldAsCow;
    }
    $goldAsCopper = self::getArg( "goldAsCopper", AT_posint, false);
    if ($goldAsCopper??0>0){
      $costReplaceArgs['copper']=$goldAsCopper;
    }
    $steelReplace = self::getArg( "steelReplace", AT_posint, false);
    if ($steelReplace??0>0){
      $costReplaceArgs['steel']=$steelReplace;
    }

    $this->game->playerBuildBuilding( $building_key, $costReplaceArgs);
    self::ajaxResponse( );
  }

  public function buildBuildingDiscount(){
    self::setAjaxMode( );

    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);
    
    $building_key = self::getArg( "building_key", AT_posint, true);
    $costReplaceArgs = array();
    $goldAsCow = self::getArg( "goldAsCow", AT_posint, false);
    if ($goldAsCow??0>0){
      $costReplaceArgs['cow']=$goldAsCow;
    }
    $goldAsCopper = self::getArg( "goldAsCopper", AT_posint, false);
    if ($goldAsCopper??0>0){
      $costReplaceArgs['copper']=$goldAsCopper;
    }
    $steelReplace = self::getArg( "steelReplace", AT_posint, false);
    if ($steelReplace??0>0){
      $costReplaceArgs['steel']=$steelReplace;
    }
    $discount = self::getArg( "discount", AT_posint, true);
    $this->game->playerBuildBuildingDiscount( $building_key, $costReplaceArgs, $discount);
    self::ajaxResponse( );
  }
  
  public function selectRailBonus (){
    self::setAjaxMode();
    $bonus = self::getArg( "bonus", AT_posint, true);
    $this->game->playerSelectRailBonus( $bonus );
    self::ajaxResponse( );
  }

  public function selectRailBonusEvent() {
    self::setAjaxMode();
    $bonus = self::getArg( "bonus", AT_posint, true);
    $this->game->playerSelectRailBonusEvent( $bonus );
    self::ajaxResponse( );
  }
  
  public function cancelBidPass() {
    self::setAjaxMode();
    $this->game->playerCancelBidPass( );
    self::ajaxResponse( );
  }

  public function lotGoToBuild() {
    self::setAjaxMode();
    $this->game->playerGoToBuild( );
    self::ajaxResponse( );
  }

  public function lotGoToEvent() {
    self::setAjaxMode();
    $this->game->playerGoToEvent( );
    self::ajaxResponse( );
  }

  public function lotGoToAuction() {
    self::setAjaxMode();
    $this->game->playerGoToAuction( );
    self::ajaxResponse( );
  }

  public function lotGoToConfirm() {
    self::setAjaxMode();
    $this->game->playerGoToConfirm( );
    self::ajaxResponse( );
  }

  public function passBonusBuilding() {
    self::setAjaxMode( );
    $this->game->playerPassBuildingBonus( );
    self::ajaxResponse( );
  }

  public function freeHireWorkerAuction (){
    self::setAjaxMode( );
    $this->game->playerFreeHireWorkerAuction();
    self::ajaxResponse( );
  }

  public function freeHireWorkerBuilding (){
    self::setAjaxMode( );
    $this->game->playerFreeHireWorkerBuilding();
    self::ajaxResponse( );
  }

  public function freeHireWorkerEvent (){
    self::setAjaxMode( );
    $this->game->playerFreeHireWorkerEvent();
    self::ajaxResponse( );
  }

  public function silver2forRailAdvanceEvent (){
    self::setAjaxMode( );
    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);
    
    $this->game->playerSilver2forRailAdvance();
    self::ajaxResponse( );
  }

  public function bonusTypeForType (){
    self::setAjaxMode( );
    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);
    
    $tradeAway = self::getArg( "tradeAway", AT_int, true);
    $tradeFor = self::getArg( "tradeFor", AT_int, true);
    $this->game->playerTypeForType($tradeAway, $tradeFor);
    self::ajaxResponse( );
  }

  public function passBonusAuction (){
    self::setAjaxMode( );
    $this->game->playerPassBonusAuction( );
    self::ajaxResponse( );
  }

  public function passBonusEvent (){
    self::setAjaxMode( );
    $this->game->playerPassBonusEvent( );
    self::ajaxResponse( );
  }

  public function passBonusLotEvent(){
    self::setAjaxMode( );
    $this->game->playerPassBonusLotEvent( );
    self::ajaxResponse( );
  }

  public function doneEndgameActions(){
    self::setAjaxMode( );
    
    // resolve pending trades
    $trade_action = self::getArg( "trade_action", AT_numberlist, true );
    $this->game->playerTrade($trade_action, false);

    $this->game->playerDoneEndgame();
    self::ajaxResponse( );
  }

  public function loadBugSQL() {
    self::setAjaxMode();
    $reportId = (int) self::getArg('report_id', AT_int, true);
    $this->game->loadBugSQL($reportId);
    self::ajaxResponse();
  }

}