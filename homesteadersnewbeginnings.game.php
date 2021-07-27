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
  * homesteadersnewbeginnings.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
require_once('modules/constants.inc.php');
require_once('modules/HSDAuction.class.php');
require_once('modules/HSDBid.class.php');
require_once('modules/HSDBuilding.class.php');
require_once('modules/HSDEvents.class.php');
require_once('modules/HSDLog.class.php');
require_once('modules/HSDResource.class.php');
require_once('modules/HSDScore.class.php');


class homesteadersnewbeginnings extends Table
{
    public $playerColorNames = array("ff0000" =>'red', "008000"=>'green', "0000ff"=>'blue', "ffff00"=> 'yellow', "982fff"=> 'purple');
    
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array(
            "round_number"      => 10,
            "first_player"      => 11,
            "number_auctions"   => 12,
            "current_auction"   => 13,
            "last_bidder"       => 14,
            "players_passed"    => 15,
            "building_bonus"    => 16,
            "last_building"     => 17,
            "b_order"           => 18,
            "build_type_int"    => 19,
            "show_player_info"  => SHOW_PLAYER_INFO,
            "rail_no_build"     => RAIL_NO_BUILD,
            "new_beginning_bld" => NEW_BEGINNING_BLD,
            "new_beginning_evt" => NEW_BEGINNING_EVT,
        ) );
        
        $this->Auction  = new HSDAuction($this);
        $this->Bid      = new HSDBid($this);
        $this->Building = new HSDBuilding($this);
        $this->Log      = new HSDLog($this);
        $this->Event    = new HSDEvents($this);
        $this->Resource = new HSDResource($this);
        $this->Score    = new HSDScore($this);
        
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "homesteadersnewbeginnings";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        $sql = "DELETE FROM player WHERE 1 ";
        self::DbQuery( $sql );

        // Set the colors of the players with HTML color code
        // values are red/green/blue/yellow
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        
        self::reloadPlayersBasicInfos();
        $gamePlayers = self::loadPlayersBasicInfos();

        /************ Start the game initialization *****/

        $this->Log->initStats($players);

        $number_auctions = 2;
        if (count($players) == 4){ 
            $number_auctions = 3;
        } else if (count($players) == 5){
            $number_auctions = 4;
        }
        // Init global values with their initial values
        $this->setGameStateInitialValue( 'round_number', 1 );
        $this->setGameStateInitialValue( 'first_player', 0 );
        $this->setGameStateInitialValue( 'number_auctions', $number_auctions );
        $this->setGameStateInitialValue( 'current_auction', 1 );
        $this->setGameStateInitialValue( 'last_bidder',    0 );
        $this->setGameStateInitialValue( 'players_passed', 0 );
        $this->setGameStateInitialValue( 'building_bonus', 0 );
        $this->setGameStateInitialValue( 'last_building',  0 );
        $this->setGameStateInitialValue( 'b_order' ,       0 );
          
        $values = array();
        // set colors
        foreach ($gamePlayers as $player_id => $p) {
            $color = $p['player_color'];
            $sql = "UPDATE `player` SET `color_name`='".$this->playerColorNames[$color]."' WHERE `player_id`='".$player_id."'";
            self::DbQuery( $sql );

            $values[] = "(".$player_id.")";
        }
        
        // create building Tiles (in sql)
        $this->Building->createBuildings($players);
        $this->Auction->createAuctionTiles(count($players));
        if ($this->getGameStateValue('new_beginning_evt') == ENABLED){
            $this->Event->createEvents();
        }
        $this->Bid->setupBidDB($players);

        // setup resources table
        $sql = "INSERT INTO `resources` (player_id) VALUES ";
        $sql .= implode( ',', $values ); 
        self::DbQuery( $sql );

        // create 1 worker for each player.
        $sql = "INSERT INTO `workers` (player_id) VALUES ";
        $sql .= implode( ',', $values );   
        self::DbQuery( $sql );

        $this->activeNextPlayer();
        $act_p_id = $this->getActivePlayerId();
        $this->setGameStateValue('first_player', $act_p_id);
        
        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $cur_p_id = $this->getCurrentPlayerId();    // !! We must only return informations visible by this player !!
        return array(
            'auctions' => $this->Auction->getAllAuctionsFromDB(),
            'auction_info' => $this->auction_info,
            'players' => $this->getCollectionFromDb( "SELECT `player_id` p_id, `player_score` score, `color_name`, `player_name`, `rail_adv` FROM `player` " ),
            'buildings' => $this->Building->getAllBuildings(),
            'building_info' => $this->building_info,
            'bids' => $this->getCollectionFromDB( "SELECT `player_id` p_id, `bid_loc` FROM `bids`" ),
            'can_undo_trades' => (count($this->Log->getLastTransactions($cur_p_id)) > 0 && $this->checkAction('trade', false)),
            'cancel_move_ids' => $this->Log->getCancelMoveIds(),
            'current_auctions' => $this->Auction->getCurrentRoundAuctions(), 
            'events' => $this->Event->getEvents(),
            'event_info' => $this->event_info,
            'first_player' => $this->getGameStateValue( 'first_player'),
            'number_auctions' => $this->getGameStateValue( 'number_auctions' ),
            'player_order' => $this->getNextPlayerTable(),
            'player_resources' => $this->getObjectFromDb( "SELECT `player_id` p_id, `silver`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE player_id = '$cur_p_id'" ),
            'rail_no_build' => $this->getGameStateValue( 'rail_no_build' ) == ENABLED,
            'resources' => $this->Resource->getResources(),
            'resource_info' => $this->resource_info,
            'round_number' => $this->getGameStateValue( 'round_number' ),
            'show_player_info' => $this->getShowPlayerInfo(),
            'translation_strings' => $this->translation_strings,
            'tracks' => $this->getCollectionFromDb("SELECT `rail_key` r_key, `player_id` p_id FROM `tracks` "),
            'use_events' => $this->getGameStateValue('new_beginning_evt') == ENABLED,
            'workers' => $this->getCollectionFromDb( "SELECT `worker_key` w_key, `player_id` p_id, `building_key` b_key, `building_slot` b_slot FROM `workers`" ),
        );
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer between 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        $game_progress =  ((int)$this->getGameStateValue('round_number') -1 ) * 9;
        $number_auctions = (int)$this->getGameStateValue('number_auctions');
        $current_auction = (int)$this->getGameStateValue('current_auction');
        $game_progress += floor(($current_auction * 10) / $number_auctions);
        return (int)$game_progress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function getPlayerName($p_id){
        return (string)($this->loadPlayersBasicInfos()[$p_id]['player_name']);
    }

    function getPlayerColorName($p_id){
        return (string)$this->getUniqueValueFromDB( "SELECT `color_name` FROM `player` WHERE `player_id`=$p_id" );
    }

    function getShowPlayerInfo(){
        if ($this->getGameStateValue('round_number') == 11){
            return true;
        }
        return ($this->getGameStateValue( 'show_player_info' ) == 0);
    }
    
    
//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in homesteaders.action.php)
    */

    /*****  Common Methods (loan, trade) *****/
    public function playerTakeLoan()
    {
        $this->checkAction( "takeLoan" );
        $this->Resource->takeLoan($this->getCurrentPlayerId());
    }

    public function playerTrade( $tradeAction_csv, $notActive =false )
    {
        // allow out of turn trade, only when flag is passed during allocateWorkers State.
        if (!($notActive && $this->gamestate->state()['name'] === "allocateWorkers")){
            $this->checkAction( 'trade' );
        }
        $p_id = $this->getCurrentPlayerId();
        $tradeAction_arr = explode(',', $tradeAction_csv);
        foreach( $tradeAction_arr as $key=>$val ){
            $tradeAction = $this->trade_map[$val];
            $this->Resource->trade($p_id, $tradeAction);
        }
    }

    /***  place workers phase ***/
    public function playerHireWorker(){
        $this->checkAction( 'hireWorker' );
        $cur_p_id = $this->getCurrentPlayerId();
        $worker_cost = array('trade'=>1,'food'=>1);
        if (!$this->Resource->canPlayerAfford($cur_p_id, $worker_cost))
            throw new BgaUserException( clienttranslate("You cannot afford to hire a worker"));
        $this->Resource->updateAndNotifyPaymentGroup($cur_p_id, $worker_cost, clienttranslate('Hire Worker'));
        $this->Resource->addWorkerAndNotify($cur_p_id, 'hire');
    }

    public function playerSelectWorkerDestination($w_key, $b_key, $building_slot)
    {
        $this->checkAction( "placeWorker" );
        $cur_p_id = $this->getCurrentPlayerId();
        $w_owner = $this->getUniqueValueFromDB("SELECT `player_id` FROM `workers` WHERE `worker_key`='$w_key'");
        if ($w_owner != $cur_p_id){ throw new BgaUserException(clienttranslate("The selected worker is not your worker"));}
        $this->notifyAllPlayers( "workerMoved", "", array(
            'i18n' => array( 'building_name' ),
            'player_id' => $cur_p_id,
            'worker_key' => $w_key,
            'building_key' => $b_key,
            'building_slot' => $building_slot,
        ) );
        $sql = "UPDATE `workers` SET `building_key`= '".$b_key."', `building_slot`='".$building_slot."' WHERE `worker_key`='".$w_key."'";
        $this->DbQuery( $sql );
    }

    public function playerDonePlacingWorkers ($warehouse){
        $this->checkAction('placeWorker');
        $p_id = $this->getCurrentPlayerId();
        if ($this->Building->doesPlayerOwnBuilding($p_id, BLD_WAREHOUSE)){
            if (is_null($warehouse)){
                throw new BgaUserException( clienttranslate("You must select a warehouse income"));
            }if (array_key_exists($warehouse, $this->warehouse_map)){
                throw new BgaUserException( clienttranslate("You must select a warehouse income"));
            }
        }
        $this->Log->donePlacing($p_id);
        $this->Resource->collectIncome($p_id, $warehouse);
        $this->gamestate->setPlayerNonMultiactive( $p_id , 'auction' );
    }

    /*** Player Bid Phase ***/
    public function playerConfirmDummyBid($bid_location){
        $this->checkAction('dummy');
        $this->Bid->confirmDummyBid($bid_location);
        $this->gamestate->nextState( "nextBid" );
    }

    public function playerConfirmBid($bid_location){
        $this->checkAction( "confirmBid" );
        $this->Bid->confirmBid($bid_location);
        $this->gamestate->nextState( "nextBid" );
    }

    public function playerPassBid(){
        $this->checkAction( "pass" );
        $this->Bid->passBid();
        $next_state = $this->Event->passBid();
        $this->gamestate->nextState( $next_state );
    }

    public function playerDonePassEvent(){
        $this->checkAction( "payLoanEvent" );
        $this->Resource->addTrack($this->getActivePlayerId(), $this->Event->getEventName());
        $this->gamestate->nextState( "rail" );
    }

    public function playerBuildBuilding($b_key, $costReplaceArgs){
        $this->checkAction( "buildBuilding" );
        $act_p_id = $this->getActivePlayerId();
        $this->Building->buildBuilding($act_p_id, $b_key, $costReplaceArgs);
        
        $this->Score->updatePlayerScore($act_p_id);
        $this->gamestate->nextState ('done');
    }

    public function playerBuildBuildingDiscount($b_key, $costReplaceArgs, $discount){
        $this->checkAction("buildBuilding");
        $act_p_id = $this->getActivePlayerId();
        $discount_type = $this->resource_map[$discount];
        $this->Building->buildBuildingDiscount($act_p_id, $b_key, $costReplaceArgs, $discount_type);
        
        $this->Score->updatePlayerScore($act_p_id);
        $this->gamestate->nextState ('done');
    }

    public function playerDoNotBuild () {
        $this->checkAction( "doNotBuild" );
        if ($this->getGameStateValue( 'rail_no_build') == ENABLED){
            $cur_auc = $this->getGameStateValue( 'current_auction' );
            $this->Resource->addTrackAndNotify($this->getActivePlayerId(), clienttranslate("Auction $cur_auc (In place of Build)"), 'auction', $cur_auc);
            $this->Score->updatePlayerScore($this->getActivePlayerId());
        }
        //goto next state;
        $this->setGameStateValue('last_building', 0);
        $this->setGameStateValue('building_bonus', BUILD_BONUS_NONE);
        $this->gamestate->nextState('done');
    }

    public function playerPay($gold) {
        $state_name = $this->gamestate->state()['name'];
        if ($state_name === 'payWorkers'){
            $this->payWorkers($gold);
        } else if ($state_name === 'allocateWorkers'){ 
            $this->payWorkers($gold, true);
        } else if ($state_name === 'payLot') {
            $this->payAuction($gold);
        } else if ($state_name === 'eventPay') {
            $this->payEvent($gold);
        } else {
            throw new BgaVisibleSystemException ( clienttranslate("player pay called from wrong state") );
        }
    }

    /**
     * used for playerPay to handle pay workers.
     * it will check if player has already paid, 
     * then if not it will deduct the cost from them, 
     * then it will either 
     * - set them nonMultiactive (pay_workers state)
     * - or update the client, so the pay button will be hidden.
     *  (setPaid will prevent it from being shown on refresh)
     * @var gold  represents amount of gold player wishes to use to pay (may be 0)
     * @var early represents if this is being called while still in allocate workers state (as flow is different)
     */
    public function payWorkers($gold, $early=false) {
        if (!$early){
            $this->checkAction( "done" );
        }
        if ($gold <0){ 
            throw new BgaUserException ( clienttranslate("cannot have negative gold value"));
        }
        $cur_p_id = $this->getCurrentPlayerId();
        if ($this->Resource->getPaid($cur_p_id) == 0){ // to prevent charging twice.
            $this->Resource->setPaid($cur_p_id);
            $workers = $this->Resource->getPlayerResourceAmount($cur_p_id,'workers');
            $cost = max($workers - (5*$gold), 0);
            $this->Resource->pay($cur_p_id, $cost, $gold, "worker");
        }
        $next_state = ($this->Event->eventPhase()?"event":"auction");
        if (!$early){
            $this->gamestate->setPlayerNonMultiactive($cur_p_id, $next_state );
        } else {
            $this->notifyPlayer($cur_p_id, 'workerPaid', "", array());
            //allows updating ui.
        }
    }

    public function payAuction($gold) {
        $this->checkAction( "done" );
        $act_p_id = $this->getActivePlayerId();
        if ($gold <0){ 
            throw new BgaUserException ( clienttranslate("cannot have negative gold value"));
        }
        
        $bid_cost = $this->Bid->getBidCost($act_p_id);
        $bid_cost = max($bid_cost - 5*$gold, 0);
        $auc_no = $this->getGameStateValue('current_auction');
        $this->Resource->pay($act_p_id, $bid_cost, $gold, sprintf(clienttranslate("Auction %s"), $auc_no), $auc_no);
        if ($this->Auction->doesCurrentAuctionHaveBuildPhase()){
            $this->Auction->setCurrentAuctionBuildType();
            $this->gamestate->nextstate( 'build' );
        } else if ($this->Event->isAuctionAffected()){
            $this->gamestate->nextstate( 'event' );
        } else {
            $this->gamestate->nextstate( 'auction_bonus');
        }
    }

    public function payEvent($gold){
        $this->checkAction('done');
        $cur_p_id = $this->getCurrentPlayerId();
        if ($this->Resource->getPaid($cur_p_id) == 0){ // to prevent charging twice.
            $this->Resource->setPaid($cur_p_id);
            $cost = $this->Resource->getCost($cur_p_id);
            $cost = max($cost - (5*$gold), 0);
            $this->Resource->pay($cur_p_id, $cost, $gold, $this->Event->getEventName());
        }
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, 'done' );
    }

    public function playerSelectRailBonus($selected_bonus) {
        $this->checkAction( "chooseBonus" );
        $act_p_id = $this->getActivePlayerId();
        $options = $this->Resource->getRailAdvBonusOptions($act_p_id);
        if (!in_array ($selected_bonus, $options)){
            throw new BgaUserException( clienttranslate("invalid bonus option selected") );
        } 
        $this->Resource->receiveRailBonus($act_p_id, $selected_bonus);
        $this->gamestate->nextState( 'done' );
    }

    /**** Building Bonus Player actions *****/
    public function playerFreeHireWorkerBuilding()
    {
        $this->checkAction( "buildBonus" );
        $act_p_id = $this->getActivePlayerId();
        $b_key = $this->getGameStateValue('last_building');
        $b_name = $this->Building->getBuildingNameFromKey($b_key);
        $this->Resource->addWorkerAndNotify($act_p_id, $b_name, 'building', $b_key);
        $this->gamestate->nextState( 'auction_bonus' );
    }

    public function playerPassBuildingBonus () 
    {
        $this->checkAction( "buildBonus" );
        $this->gamestate->nextState( 'auction_bonus' );
    }

    /**** Auction Bonus actions ******/
    public function playerFreeHireWorkerAuction ( ) 
    {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $auction_bonus = $this->Auction->getCurrentAuctionBonus();
        $auc_no = $this->getGameStateValue('current_auction');
        if ($auction_bonus == AUC_BONUS_WORKER) {
            $this->Resource->addWorkerAndNotify($act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no));
            $this->gamestate->nextState( 'done' );
        } else if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV){
            $auc_no = $this->getGameStateValue( 'current_auction');
            $this->Resource->addWorkerAndNotify($act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $this->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $this->gamestate->nextState( 'rail_bonus' );
        } else {
            throw new BgaVisibleSystemException ( sprintf(clienttranslate("Free Hire Worker called, but auction bonus is %s"),$auction_bonus) );
        }
    }

    public function playerTypeForType ($tradeAway, $tradeFor){
        $this->checkAction( "auctionBonus");
        $act_p_id = $this->getActivePlayerId();
        $tradeAwayType = $this->resource_map[$tradeAway];
        if (!$this->Resource->canPlayerAfford($act_p_id, array($tradeAwayType=> 1))) {
            throw new BgaUserException( sprintf(clienttranslate("You need a %s to take this action"),"<div class='log_${tradeAwayType} token_inline'></div>") );
        }
        $tradeForType = 'track'; // default is currently track.
        if ($tradeFor == VP){ // determine if vp2 or vp4.
            if ($tradeAway == FOOD) $tradeForType = 'vp2';
            else $tradeForType = 'vp4';
        }
        $auc_no = $this->getGameStateValue('current_auction');
        $this->Resource->specialTrade($act_p_id, array($tradeAwayType=>1), array($tradeForType=>1), sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no);
        
        $this->gamestate->nextState( 'done' );
    }

    public function playerPassBonusAuction () {
        $this->checkAction( "auctionBonus" );
        $act_p_id = $this->getActivePlayerId();
        $this->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Auction Bonus' ), array(
            'player_id' => $act_p_id,
            'player_name' => $this->getActivePlayerName()));
        $next_state = 'done';
        $auction_bonus = $this->Auction->getCurrentAuctionBonus();
        if ($auction_bonus == AUC_BONUS_WORKER_RAIL_ADV) {
            $auc_no = $this->getGameStateValue('current_auction');
            $this->Resource->getRailAdv( $act_p_id, sprintf(clienttranslate("Auction %s"),$auc_no), 'auction', $auc_no );
            $next_state = 'rail_bonus';
        }
        $this->gamestate->nextState( $next_state );
    }

    /***** Event Bonus *****/
    public function playerFreeHireWorkerEvent ( ) 
    {
        $this->checkAction( "eventBonus" );
        
        if (!$this->Event->isAuctionAffected()){
            throw new BgaVisibleSystemException ( clienttranslate("Free Hire Worker called, but there is no event bonus"));
        }
        $event = $this->Event->getEvent();
        switch ($event){
            case EVT_AUC_BONUS_WORKER:
                $act_p_id = $this->getActivePlayerId();
                $this->Resource->addWorkerAndNotify($act_p_id, $this->event_info[$event]['name']);
                $this->Event->postEventBonusNav();
            break;
            case EVT_LEAST_WORKER:
                $cur_p_id = $this->getCurrentPlayerId();
                $this->Resource->addWorkerAndNotify($cur_p_id, $this->event_info[$event]['name']);
                $this->gamestate->setPlayerNonMultiactive($cur_p_id, "");
            break;
            default:
                throw new BgaVisibleSystemException ( sprintf(clienttranslate("Free Hire Worker called, but event is %s"),$this->event_info[$event]['name']));
        }    
    }

    public function playerSilver2forTrackEvent ( ) 
    {
        $this->checkAction( "eventLotBonus" );
        if (!$this->Event->isAuctionAffected()){
            throw new BgaVisibleSystemException ( clienttranslate("trade 2 Silver for track called, but there is no event bonus"));
        }
        if ($this->Event->getEventAucB() != EVT_AUC_2SILVER_TRACK) {
            throw new BgaVisibleSystemException ( sprintf(clienttranslate("trade 2 Silver for track called, but event bonus is %s"), $this->Event->getEventAucB()));
        }
        $this->Resource->specialTrade($this->getActivePlayerId(), array('silver'=>2), array('track'=>1), clienttranslate('Event Reward'), 'event');
        $this->Event->postEventBonusNav();
    }

    public function playerPassBonusLotEvent() {
        $this->checkAction( "eventLotBonus" );
        $act_p_id = $this->getActivePlayerId();
        $this->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Event Bonus' ), array(
            'player_id' => $act_p_id,
            'player_name' => $this->getActivePlayerName()));
        $this->Event->postEventBonusNav();
    }

    public function playerTradeHidden($tradeAction_csv){
        $this->checkAction('event');
        $p_id = $this->getCurrentPlayerId();
        $tradeAction_arr = explode(',', $tradeAction_csv);
        foreach( $tradeAction_arr as $key=>$val ){
            $tradeAction = $this->trade_map[$val];
            $this->Resource->hiddenTrade($p_id, $tradeAction);
        }
    }

    public function playerBuildSteel () {
        $this->checkAction( "eventLotBonus" );
        $p_id = $this->getActivePlayerId();
        if (!$this->Resource->canPlayerAfford($p_id, array('steel'=>1))){
            throw new BgaUserException( sprintf(clienttranslate("You need a %s to take this action"),"<div class='log_steel token_inline'></div>"));
        }
        $this->Resource->updateAndNotifyPayment($p_id, "steel", 1, $this->Event->getEventName());
        //goto next state;
        $this->gamestate->nextState('evt_build');
    }

    public function playerSelectRailBonusEvent($selected_bonus) {
        $this->checkAction( "eventBonus" );
        if (!in_array($this->Event->getEventAllB(), array(EVT_LOAN_TRACK, EVT_RES_ADV_TRACK))){
            throw new BgaUserException( clienttranslate("invalid Bonus for this Event") );
        }
        $cur_p_id = $this->getCurrentPlayerId();
        $options = $this->Resource->getRailAdvBonusOptions($cur_p_id);
        if (!in_array ($selected_bonus, $options)){
            throw new BgaUserException( clienttranslate("invalid bonus option selected") );
        }
        
        $this->Resource->receiveRailBonus($cur_p_id, $selected_bonus);
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, "done" );
    }

    public function playerPassBonusEvent(){
        $this->checkAction( "eventBonus" );
        $cur_p_id = $this->getCurrentPlayerId();
        $this->notifyAllPlayers( "passBonus", clienttranslate( '${player_name} passes on Event Bonus' ), 
            array('player_id' => $cur_p_id, 'player_name' => $this->getPlayerName($cur_p_id)));
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, "done");
    }
    
    public function playerDoneTradingEvent(){
        $this->checkAction('event');
        $cur_p_id = $this->getCurrentPlayerId();
        $next_state = $this->Event->getNextStatePreTrade();
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, $next_state );
    }

    public function playerActionCancelAllocateWorkers() {
        $this->gamestate->checkPossibleAction('actionCancel');
        $p_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive(array ($p_id), 'error', false);
        $this->Log->cancelWorkerIncomePhase($p_id);
        $this->Resource->setIncomePaid($p_id, 0);
        $this->Resource->setPaid($p_id, 0);
    }

    public function playerActionCancelEndgame() {
        $this->gamestate->checkPossibleAction('actionCancel');
        $p_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayersMultiactive(array ($p_id), 'error', false);
    }

    public function playerCancelBidPass () {
        $this->checkAction('undoPass');
        $this->Bid->cancelPass();
        $this->Log->cancelPass();
        $this->gamestate->nextState('undoPass');
    }
 
    /*
     * restartTurn: called when a player decide to go back at the beginning of the player build phase
     */
    public function playerCancelPhase () {
        $this->checkAction('undoLot');
        // undo all actions since beginning of STATE_PAY_AUCTION
        $this->Log->cancelPhase();
        $this->gamestate->nextState('undoLot');
    }

    public function playerCancelTransactions()
    {
        $this->checkAction('trade');
        $cur_p_id = $this->getCurrentPlayerId();
        $transactions = $this->Log->getLastTransactions($cur_p_id);
        if (is_null($transactions)) {
            throw new BgaUserException(clienttranslate("You have nothing to cancel"));
        }
        // Undo the turn
        $this->Log->cancelTransactions($cur_p_id);
    }

    public function playerCancelHiddenTransactions()
    {
        $this->checkAction('event');
        $cur_p_id = $this->getCurrentPlayerId();
        $this->Log->cancelTransactions($cur_p_id);
    }

    /** endBuildRound */
    public function playerConfirmChoices (){
        $this->checkAction('done');
        $this->Bid->clearBidForPlayer($this->getActivePlayerId());
        $this->gamestate->nextState( 'done' );
    }

    // endGame Actions
    public function playerPayLoan($gold) {
        $this->checkAction('payLoan');
        $cur_p_id = $this->getCurrentPlayerId();    
        $this->Resource->payOffLoan($cur_p_id, $gold);
    }

    public function playerDoneEndgame() {
        $this->checkAction('done');
        $cur_p_id = $this->getCurrentPlayerId();
        $this->gamestate->setPlayerNonMultiactive($cur_p_id, "" );
    }
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argStartRound(){
        $round_number = $this->getGameStateValue('round_number');
        $auctions = $this->Auction->getCurrentRoundAuctions($round_number);
        return array('round_number'=>$round_number, 'auctions' => $auctions);
    }

    function argPayWorkers()
    {
        $args = $this->getCollectionFromDB("SELECT `player_id`, `workers` FROM `resources`");
        $paid = $this->getCollectionFromDB("SELECT `player_id`, `has_paid` FROM `player`");
        return array('args'=>$args, 'paid'=>$paid);
    }

    function argDummyValidBids() {
        $dummy_bids = $this->Bid->getDummyBidOptions();
        return array('valid_bids'=>$dummy_bids);
    }

    function argEventBonus() {
        $event_bonus = $this->Event->getEventAllB();
        $bonus_option = array();
        $players = $this->loadPlayersBasicInfos();
        if ($event_bonus == EVT_LEAST_WORKER){
            return array('event_bonus'=>$event_bonus, 'alternate' =>true);
        } else{
            foreach($players as $p_id=>$player){
                $bonus_option[$p_id]= array('rail_options'=> $this->Resource->getRailAdvBonusOptions($p_id));
            }
            return array('event_bonus'=>$event_bonus, 'args'=>$bonus_option);
        }
    }

    function argEventBuildBonus() {
        $bonus_option = $this->Event->getEventAucB();
        if ($bonus_option == EVT_AUC_STEEL_ANY){
            return array('event_bonus'=>$bonus_option, 'alternate'=>true);
        }
        return array('event_bonus'=>$bonus_option);
    }

    function argEventPay(){
        $cost = $this->Event->getEventPayCost();
        return array('cost'=>$cost);
    }

    function argEventTrade() {
        return array('event_pass'=>$this->Event->getEventPass());
    }

    function argValidBids() {
        $valid_bids = $this->Bid->getValidBids($this->getActivePlayerId());
        return array("valid_bids"=>$valid_bids );
    }

    function argPassRailBonus() {
        $rail_options= $this->Resource->getRailAdvBonusOptions($this->getActivePlayerId());
        return array("rail_options"=>$rail_options, "can_undo"=>false);
    }

    function argRailBonus() {
        $rail_options= $this->Resource->getRailAdvBonusOptions($this->getActivePlayerId());
        return array("rail_options"=>$rail_options);
    }

    function argLotCost() {
        $act_p_id = $this->getActivePlayerId();
        $bid_cost = $this->Bid->getBidCost($act_p_id);
        if ($this->Event->getEvent() == EVT_AUC_COM_DISCOUNT){
            if ($this->Event->doesPlayerHaveMostBuildings($act_p_id, TYPE_COMMERCIAL)){
                $bid_cost = floor($bid_cost/2);
            }
        }
        return array("lot_cost"=>$bid_cost);
    }

    function argAllowedBuildings() {
        $build_type_int = $this->getGameStateValue('build_type_int');
        $build_type_options = $this->Building->buildTypeIntIntoArray($build_type_int);      
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        return(array("allowed_buildings"=> $buildings,
                    "current_event" => $this->Event->getEvent()));
    }

    function argTrainStationBuildings() {
        $build_type_int = $this->getGameStateValue('build_type_int');
        $build_type_options = $this->Building->buildTypeIntIntoArray($build_type_int);      
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        return(array("allowed_buildings"=> $buildings));
    }

    function argEventBuildings() {
        $event_bonus = $this->Event->getEventAucB();
        $build_type_int = $this->getGameStateValue('build_type_int');
        $build_type_options = $this->Building->buildTypeIntIntoArray($build_type_int);      
        $buildings =  $this->Building->getAllowedBuildings($build_type_options);
        return (array("event_bonus"=> $event_bonus, 
                      "allowed_buildings" =>$buildings));
    }

    function argsEventPreTrade() {
        $bonus_id = $this->Event->getEventAllB();
        if ($bonus_id == EVT_COPPER_COW_GET_GOLD){
            $hidden = $this->Log->getHiddenTrades($this->getCurrentPlayerId());
        }
        return array('bonus_id' =>$bonus_id, '_private' => $hidden);
    }

    function argBuildingBonus() {
        $building_bonus =$this->getGameStateValue('building_bonus');
        return (array("building_bonus" => $building_bonus));
    }

    function argBonusOption() {
        $auction_bonus = $this->Auction->getCurrentAuctionBonus();
        return (array("auction_bonus"=> $auction_bonus));
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    function stStartRound() {
        $round_number = $this->getGameStateValue('round_number');
        $this->Resource->clearPaid();
        $this->Resource->clearIncomePaid();
        $this->Building->updateBuildingsForRound($round_number);
        $this->gamestate->nextState( );
    }

    function stPlaceWorkers() {
        $this->Log->allowTradesAllPlayers(); // this will also add extra player time.
        $this->gamestate->setAllPlayersMultiactive( );
    }

    function stPayWorkers() 
    {
        $resources = $this->getCollectionFromDB( "SELECT `player_id`, `workers`, `gold`, `silver`, `trade` FROM `resources` " );
        $pendingPlayers = array();
        foreach($resources as $p_id => $player){
            if ($this->Resource->getPaid($p_id)) continue;
            if ($player['silver'] >= $player['workers'] && $player['gold'] == 0 && $player['trade'] == 0){
                $this->Resource->updateAndNotifyPayment($p_id, 'silver', $player['workers'], 'worker');
            } else { // ask this player to choose payment.
                $pendingPlayers[] = $p_id;
                $this->giveExtraTime($p_id);
            }
        }
        $next_state = "auction";
        if ($this->Event->eventPhase()){
            $next_state = "event";
        }
        if (count($pendingPlayers) == 0){
            $this->gamestate->nextState($next_state);
        } else {
            $this->gamestate->setPlayersMultiactive($pendingPlayers, $next_state);
        }
    }

    function stSetupEventPreAuction() {
        $this->Event->setupEventPreAuction();
    }

    function stEvtPostTrade() {
        $this->Event->resolveEventPostTrade();
    }
    
    function stBeginAuction() {
        $round_number = $this->getGameStateValue('round_number');
        if ($round_number == 11){
            $this->gamestate->nextState( 'endGame');
        } else {
            $this->Bid->clearBids( );
            $first_player = $this->getGameStateValue('first_player');
            $this->gamestate->changeActivePlayer( $first_player );
            if ($this->getPlayersNumber() == 2){
                $this->gamestate->nextState( '2p_auction' );
            } else {
                $this->gamestate->nextState( 'auction' );
            }
        }
    }

    function argSetupAuction()
    {

    }

    function stNextBid()
    { 
        $this->activeNextPlayer( );
        // figure out if bid round is complete, 
        $act_p_id = $this->getActivePlayerId();
        $last_bidder = $this->getGameStateValue( 'last_bidder' );
        // if bidding is complete
        $players_passed = $this->getGameStateValue('players_passed');
        if ($act_p_id == $last_bidder || $players_passed >= $this->getPlayersNumber()) {
            $next_state = "endAuction";
        } else if ($this->Bid->canPlayerBid($act_p_id)) {// if this player can bid.
            $next_state = "playerBid";
            $this->giveExtraTime( $act_p_id );
        } else { // if not, let next player bid
            $next_state = "skipPlayer";
        }
        $this->gamestate->nextState( $next_state );
    }

    function stPassEvent()
    {
        $pass_evt = $this->Event->getEventPass();
        if ($pass_evt != EVT_PASS_DEPT_SILVER){// every other event should not be here.
            $this->gamestate->nextState( "rail" );
        }
    }

    /**
     * for states where no backend actions are req, but want to add savepoint to log for undo transactions.
     */
    function stSetupTrade()
    {
        $this->Log->allowTrades($this->getActivePlayerId());
    }

    function stWinAuction()
    {
        
    }

    function stBuildingPhase()
    {
        $next_state = "";
        $auction_winner_id = $this->Bid->getWinnerOfAuction();
        // determine winner of this auction
        $current_auction = $this->getGameStateValue( 'current_auction' );
        
        if ($auction_winner_id == 0) {
            $next_state = "auctionPassed";
            $this->incStat(1, 'passed');
            if ($current_auction == 1 && $this->getPlayersNumber() == 2){
                $first_p_id = $this->getPlayerAfter($this->getGameStateValue('first_player'));
                $this->setGameStateValue('first_player',$first_p_id);
                $this->notifyAllPlayers("moveFirstPlayer", clienttranslate('${player_name} recieves ${first}'),array(
                    'player_id'=>$first_p_id,
                    'player_name'=>$this->getPlayerName($first_p_id),
                    'first'=>clienttranslate('First Player')));
            }
            $this->Bid->clearBidForPlayer($auction_winner_id);// for dummy bid case.
        } else {
            if ($current_auction == 1){ // winner of auction 1 gets first player marker.
                $this->setGameStateValue('first_player', $auction_winner_id);
                $this->notifyAllPlayers("moveFirstPlayer", clienttranslate('${player_name} recieves ${first}'),array(
                    'player_id'=>$auction_winner_id,
                    'player_name'=>$this->getPlayerName($auction_winner_id),
                    'first'=>clienttranslate('First Player'),
                ));
            }
            $bid_cost = $this->Bid->getBidCost($auction_winner_id);
            $this->Log->winAuction($auction_winner_id, $current_auction, $bid_cost);
            $this->gamestate->changeActivePlayer( $auction_winner_id );
            $next_state = "auctionWon";
            
        }    
        $this->gamestate->nextState( $next_state );
    }

    function stResolveBuilding()
    { 
        $active_p_id = $this->getActivePlayerId();
        $this->Score->updatePlayerScore($active_p_id);
        $bonus = $this->getGameStateValue('building_bonus');
        $b_key = $this->getGameStateValue('last_building');
        $b_name = $this->Building->getBuildingNameFromKey($b_key);
        // set next_state if no building bonus.
        $next_state = "done";
        switch($bonus){
            case BUILD_BONUS_TRADE_TRADE:
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 2, $b_name, 'building', $b_key);
            break;
            case BUILD_BONUS_PAY_LOAN:
                $this->Resource->payLoanOrRecieveSilver($active_p_id, $b_name, 'building', $b_key);
            break;
            case BUILD_BONUS_TRADE:
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 1, $b_name, 'building', $b_key);
            break;
            case BUILD_BONUS_SILVER_WORKERS: // silver per worker.
                $amt = $this->Resource->getPlayerResourceAmount($active_p_id, 'workers');
                $this->Resource->updateAndNotifyIncome($active_p_id, 'silver', $amt, $b_name, 'building', $b_key);
            break;
            case BUILD_BONUS_PLACE_RESOURCES:
                $this->Building->setupWarehouse($b_key);
            break;
            case BUILD_BONUS_RAIL_ADVANCE:
                $this->Resource->getRailAdv($active_p_id, $b_name, 'building', $b_key);
                $next_state = 'rail_bonus';
            break;
            case BUILD_BONUS_TRACK_AND_BUILD:
                $this->Resource->addTrackAndNotify($active_p_id, $b_name, 'building', $b_key);
                $next_state = 'train_station_build';
            break;
            case BUILD_BONUS_WORKER:
                $next_state = 'building_bonus';
            break;
        }
        $this->gamestate->nextState($next_state);
    }

    function stEventSetupTrade() {
        $this->Log->allowTradesAllPlayers();
        $this->gamestate->setAllPlayersMultiactive();
    }

    function stEventSetupBonus() {
        $this->Event->setupEventBonus();
    }

    function stEventSetupPay() {
        $this->Event->setupEventPay();
    }

    function stSetupEventLotBonus(){
        $this->Event->setupEventLotBonus();
    }

    function stSetupAuctionBonus()
    {
        $this->Auction->setupCurrentAuctionBonus();
    }

    //
    function stEndBuildRound() {
        $this->Auction->discardAuctionTile();
        $auc_no = $this->incGameStateValue( 'current_auction', 1);
        $next_state = "nextBuilding";
        if ($auc_no > $this->getGameStateValue( 'number_auctions' )){
            $next_state = "endRound";
        } 
        $this->gamestate->nextState( $next_state );
    }

    function stEndRound(){
        $this->Event->discardEventTile();
        //clean up for new round.
        $this->incGameStateValue( 'round_number', 1 );
        $this->setGameStateValue( 'current_auction', 1);
        $this->Bid->clearBids();
        $this->gamestate->nextState( "nextAuction" );
    }

    function stEndGameActions(){
        $this->Log->allowTradesAllPlayers(); 
        // ^ gives all players reflection time.
        $this->gamestate->setAllPlayersMultiactive( );
    }

    function stUpdateScores(){
        $this->Score->updateEndgameScores();
        $this->gamestate->nextState('');
    }
    

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $act_p_id )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                case 'dummyPlayerBid':
                    $this->Bid->zombieDummyPass();
                    $this->gamestate->nextState("nextBid");
                break;
                case 'playerBid':
                    $this->Bid->zombiePass($act_p_id);
                    $this->gamestate->nextState("nextBid");
                break;
                case 'getRailBonus':
                    $phase = $this->getGameStateValue( 'phase' );
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
                    $this->gamestate->nextState( $next_state);
                break;
                case 'payAuction':
                case 'chooseBuildingToBuild':
                case 'resolveBuilding':
                case 'trainStationBuild':
                case 'bonusChoice':
                case 'confirmActions':
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }
            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $act_p_id , '');
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//
    } 

    
  /*
   * loadBug: in studio, type loadBug(20762) into the table chat to load a bug report from production
   * client side JavaScript will fetch each URL below in sequence, then refresh the page
   */
  public function loadBug($reportId)
  {
    $db = explode('_', self::getUniqueValueFromDB("SELECT SUBSTRING_INDEX(DATABASE(), '_', -2)"));
    $game = $db[0];
    $tableId = $db[1];
    self::notifyAllPlayers('loadBug', "Trying to load <a href='https://boardgamearena.com/bug?id=$reportId' target='_blank'>bug report $reportId</a>", [
      'urls' => [
        // Emulates "load bug report" in control panel
        "https://studio.boardgamearena.com/admin/studio/getSavedGameStateFromProduction.html?game=$game&report_id=$reportId&table_id=$tableId",
        
        // Emulates "load 1" at this table
        "https://studio.boardgamearena.com/table/table/loadSaveState.html?table=$tableId&state=1",
        
        // Calls the function below to update SQL
        "https://studio.boardgamearena.com/1/$game/$game/loadBugSQL.html?table=$tableId&report_id=$reportId",
        
        // Emulates "clear PHP cache" in control panel
        // Needed at the end because BGA is caching player info
        "https://studio.boardgamearena.com/admin/studio/clearGameserverPhpCache.html?game=$game",
      ]
    ]);
  }
  
  /*
   * loadBugSQL: in studio, this is one of the URLs triggered by loadBug() above
   */
  public function loadBugSQL($reportId)
  {
    $studioPlayer = self::getCurrentPlayerId();
    $players = self::getObjectListFromDb("SELECT player_id FROM player", true);
  
    // Change for your game
    // We are setting the current state to match the start of a player's turn if it's already game over
    $sql = [
      "UPDATE global SET global_value=20 WHERE global_id=1 AND global_value=99",
      "ALTER TABLE `gamelog` ADD `cancel` TINYINT(1) NOT NULL DEFAULT 0;"
    ];
    foreach ($players as $pId) {
      // All games can keep this SQL
      $sql[] = "UPDATE player SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE global SET global_value=$studioPlayer WHERE global_value=$pId";
      $sql[] = "UPDATE stats SET stats_player_id=$studioPlayer WHERE stats_player_id=$pId";
  
      // Add game-specific SQL update the tables for your game
      $sql[] = "UPDATE resources SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE buildings SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE tracks SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE workers SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE bids SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE log SET player_id=$studioPlayer WHERE player_id=$pId";
      $sql[] = "UPDATE log SET action_arg=REPLACE(action_arg, $pId, $studioPlayer)";
      $sql[] = "UPDATE gamelog SET gamelog_current_player=$studioPlayer WHERE gamelog_current_player = $pId";
  
      // This could be improved, it assumes you had sequential studio accounts before loading
      // e.g., quietmint0, quietmint1, quietmint2, etc. are at the table
      $studioPlayer++;
    }
    
    $msg = "<b>Loaded <a href='https://boardgamearena.com/bug?id=$reportId' target='_blank'>bug report $reportId</a></b><hr><ul><li>" . implode(';</li><li>', $sql) . ';</li></ul>';
    self::warn($msg);
    self::notifyAllPlayers('message', $msg, []);
  
    foreach ($sql as $q) {
      self::DbQuery($q);
    }
    self::reloadPlayersBasicInfos();
  }

}
