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

  // pay workers
  public function donePay() {
    self::setAjaxMode( );
    $gold = self::getArg( "gold", AT_posint, true);
    $this->game->playerPay($gold);
    self::ajaxResponse( );
  }

  public function doneTradingEvent() {
    self::setAjaxMode( );
    $this->game->playerDoneTradingEvent();
    self::ajaxResponse( );
  }

  public function cancelTurn() {
    self::setAjaxMode( );
    $this->game->Action->playerCancelPhase();
    self::ajaxResponse( );
  }

  public function confirmChoices() {
    self::setAjaxMode( );
    $this->game->Action->playerConfirmChoices();
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

  public function actionCancel() {
    self::setAjaxMode();
    $this->game->playerActionCancel();
    self::ajaxResponse();
  }

  // bid actions
  public function confirmBid (){
    self::setAjaxMode( );
    $bid_loc = self::getArg( "bid_loc", AT_posint, true);
    $this->game->Action->playerConfirmBid( $bid_loc );
    self::ajaxResponse( );
  }

  public function confirmDummyBid (){
    self::setAjaxMode( );
    $bid_loc = self::getArg( "bid_loc", AT_posint, true);
    $this->game->Action->playerConfirmDummyBid( $bid_loc );
    self::ajaxResponse( );
  }

  public function passBid (){
    self::setAjaxMode( );
    $this->game->Action->playerPassBid( );
    self::ajaxResponse( );
  }
  
  // DONE actions
  public function doNotBuild() {
    self::setAjaxMode( );
    $this->game->Action->playerDoNotBuild( );
    self::ajaxResponse( );
  }

  public function steelBuildBuilding(){
    self::setAjaxMode( );
    $this->game->Action->BuildSteel();
    self::ajaxResponse( );
  }

  public function buildBuilding(){
    self::setAjaxMode( );
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

    $this->game->Action->playerBuildBuilding( $building_key, $costReplaceArgs);
    self::ajaxResponse( );
  }

  public function buildBuildingDiscount(){
    self::setAjaxMode( );
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
    $this->game->Action->playerBuildBuildingDiscount( $building_key, $costReplaceArgs, $discount);
    self::ajaxResponse( );
  }
  
  public function selectRailBonus (){
    self::setAjaxMode();
    $bonus = self::getArg( "bonus", AT_posint, true);
    $this->game->Action->playerSelectRailBonus( $bonus );
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
    $this->game->Action->playerCancelBidPass( );
    self::ajaxResponse( );
  }

  public function passBonusBuilding() {
    self::setAjaxMode( );
    $this->game->Action->playerPassBuildingBonus( );
    self::ajaxResponse( );
  }

  public function freeHireWorkerAuction (){
    self::setAjaxMode( );
    $this->game->Action->playerFreeHireWorkerAuction();
    self::ajaxResponse( );
  }

  public function freeHireWorkerBuilding (){
    self::setAjaxMode( );
    $this->game->Action->playerFreeHireWorkerBuilding();
    self::ajaxResponse( );
  }

  public function freeHireWorkerEvent (){
    self::setAjaxMode( );
    $lot = self::getArg( "lot", AT_bool, true);
    if ($lot){//active player
      $this->game->Action->playerFreeHireWorkerEvent();
    } else {//current player
      $this->game->playerFreeHireWorkerEvent();
    }
    self::ajaxResponse( );
  }

  public function silver2forTrackEvent (){
    self::setAjaxMode( );
    $this->game->Action->playerSilver2forTrackEvent();
    self::ajaxResponse( );
  }

  public function bonusTypeForType (){
    self::setAjaxMode( );
    $tradeAway = self::getArg( "tradeAway", AT_int, true);
    $tradeFor = self::getArg( "tradeFor", AT_int, true);
    $this->game->Action->playerTypeForType($tradeAway, $tradeFor);
    self::ajaxResponse( );
  }

  public function passBonusAuction (){
    self::setAjaxMode( );
    $this->game->Action->playerPassBonusAuction( );
    self::ajaxResponse( );
  }

  public function passBonusEvent (){
    self::setAjaxMode( );
    $this->game->playerPassBonusEvent( );
    self::ajaxResponse( );
  }

  public function passBonusLotEvent(){
    self::setAjaxMode( );
    $this->game->Action->playerPassBonusLotEvent( );
    self::ajaxResponse( );
  }

  public function doneEndgameActions(){
    self::setAjaxMode( );
    $this->game->playerDoneEndgame();
    self::ajaxResponse( );
  }

}