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
require_once('modules/HSDLog.class.php');
require_once('modules/HSDBid.class.php');
require_once('modules/HSDBuilding.class.php');
require_once('modules/HSDAuction.class.php');
require_once('modules/HSDEvents.class.php');
require_once('modules/HSDResource.class.php');
require_once('modules/HSDScore.class.php');
require_once('modules/HSDAction.class.php');

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
            "phase"             => 12,
            "number_auctions"   => 13,
            "current_auction"   => 14,
            "last_bidder"       => 15,
            "players_passed"    => 16,
            "auction_bonus"     => 17,
            "building_bonus"    => 18,
            "last_building"     => 19,
            "b_order"           => 20,
            "current_event"     => 21,
            "show_player_info"  => SHOW_PLAYER_INFO,
            "rail_no_build"     => RAIL_NO_BUILD,
            "new_beginning_bld" => NEW_BEGINNING_BLD,
            "new_beginning_evt" => NEW_BEGINNING_EVT,
        ) );
        
        $this->Log      = new HSDLog($this);
        $this->Bid      = new HSDBid($this);
        $this->Building = new HSDBuilding($this);
        $this->Auction  = new HSDAuction($this);
        $this->Event    = new HSDEvents($this);
        $this->Resource = new HSDResource($this);
        $this->Score    = new HSDScore($this);
        $this->Action   = new HSDAction($this);
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
        $this->setGameStateInitialValue( 'phase',        0 );
        $this->setGameStateInitialValue( 'number_auctions', $number_auctions );
        $this->setGameStateInitialValue( 'current_auction', 1 );
        $this->setGameStateInitialValue( 'last_bidder',    0 );
        $this->setGameStateInitialValue( 'players_passed', 0 );
        $this->setGameStateInitialValue( 'auction_bonus',  0 );
        $this->setGameStateInitialValue( 'building_bonus', 0 );
        $this->setGameStateInitialValue( 'last_building',  0 );
        $this->setGameStateInitialValue( 'b_order' ,       0 );
        $this->setGameStateInitialValue( 'current_event',  0 );
        
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
            'resources' => $this->Resource->getResources(),
            'resource_info' => $this->resource_info,
            'round_number' => $this->getGameStateValue( 'round_number' ),
            'show_player_info' => $this->getShowPlayerInfo(),
            'translation_strings' => $this->translation_strings,
            'tracks' => $this->getCollectionFromDb("SELECT `rail_key` r_key, `player_id` p_id FROM `tracks` "),
            'workers' => $this->getCollectionFromDb( "SELECT `worker_key` w_key, `player_id` p_id, `building_key` b_key, `building_slot` b_slot FROM `workers`" ),
        );
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        $game_progress =  ($this->getGameStateValue('round_number')  -1 ) * 9;
        $game_progress += ($this->getGameStateValue('current_auction')-1) * 3;
        return $game_progress;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    function getPlayerName($p_id){
        return($this->loadPlayersBasicInfos()[$p_id]['player_name']);
    }

    function getPlayerColorName($p_id){
        return $this->getUniqueValueFromDB( "SELECT `color_name` FROM `player` WHERE `player_id`=$p_id" );
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
        actions with no currentPlayerId() are in HSDAction 
        otherwise player actions are here.
    */

    public function playerTakeLoan(){
        $this->Action->playerTakeLoan($this->getCurrentPlayerId());
    }

    public function playerTrade($tradeAction_csv, $notActive =false){
        $this->Action->playerTrade($this->getCurrentPlayerId(), $tradeAction_csv, $notActive);
    }

    public function playerHireWorker(){
        $this->Action->playerHireWorker($this->getCurrentPlayerId());
    }
    
    public function playerSelectWorkerDestination( $w_key, $b_key, $building_slot){
        $this->Action->playerSelectWorkerDestination($this->getCurrentPlayerId(), $w_key, $b_key, $building_slot);
    }

    public function playerDonePlacingWorkers($warehouse){
        $this->Action->playerDonePlacingWorkers($this->getCurrentPlayerId(), $warehouse);
    }


    public function playerCancelTransactions(){
        $this->checkAction('trade');
        $cur_p_id = $this->getCurrentPlayerId();
        $transactions = $this->Log->getLastTransactions($cur_p_id);
        if (is_null($transactions)) {
            throw new BgaUserException(clienttranslate("You have nothing to cancel"));
        }

        // Undo the turn
        $this->Log->cancelTransactions($cur_p_id);
    }

    public function playerPay($gold){
        $state = $this->gamestate->state();
        if ($state['name'] === 'payWorkers'){
            $this->payWorkers($gold);
        } else if ($state['name'] === 'allocateWorkers'){ 
            $this->payWorkers($gold, true);
        } else if ($state['name'] === 'payAuction') {
            $this->payAuction($gold);
        } else {
            throw new BgaVisibleSystemException ( clienttranslate("player pay called from wrong state") );
        }
    }

    public function payWorkers($gold, $early=false) {
        if (!$early){
            $this->checkAction( "done" );
        }
        $cur_p_id = $this->getCurrentPlayerId();
        if ($this->Resource->getPaid($cur_p_id) == 0){ // to prevent charging twice.
            $this->Resource->setPaid($cur_p_id);
            $workers = $this->Resource->getPlayerResourceAmount($cur_p_id,'workers');
            $cost = max($workers - (5*$gold), 0);
            $this->Resource->pay($cur_p_id, $cost, $gold, "workers");
        }
        if (!$early){
            $this->gamestate->setPlayerNonMultiactive($cur_p_id, "auction" );
        } else {
            $this->notifyPlayer($cur_p_id, 'workerPaid', "", array());
        }
    }

    public function payAuction($gold) {
        $this->checkAction( "done" );
        $p_id = $this->getActivePlayerId();
        if ($gold <0){ 
            throw new BgaUserException ( clienttranslate("cannot have negative gold value"));
        }
    
        $bid_cost = $this->Bid->getBidCost($p_id);
        $bid_cost = max($bid_cost - 5*$gold, 0);
        $auc_no = $this->getGameStateValue('current_auction');
        $this->Resource->pay($p_id, $bid_cost, $gold, sprintf(clienttranslate("Auction %s"), $auc_no), $auc_no);
        if ($this->Auction->doesCurrentAuctionHaveBuildPhase()){
            $this->gamestate->nextstate( 'build' );
        } else {
            $this->gamestate->nextstate( 'auction_bonus');
        }
    }

    public function playerPayLoan( $gold){
        $this->Action->playerCancelTransactions($this->getCurrentPlayerId(), $gold);
    }

    public function playerDoneEndgame(){
        $this->Action->playerDoneEndgame($this->getCurrentPlayerId());
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
        $current_event = $this->getGameStateValue( 'current_event' );
        $players = $this->loadPlayersBasicInfos();
        $bonus_option = array();
        foreach($players as $p_id=>$player){
            $bonus_option[$p_id]= array();
            $bonus_option[$p_id]['p_id'] = $p_id;
            $bonus_option[$p_id]['event'] = $current_event;
            $bonus_option[$p_id]['option'] = $this->Resource->getRailAdvBonusOptions($this->getActivePlayerId());        
        }
        return array('bonus_option'=>$bonus_option);
    }

    function argEventBuildBonus() {
        $bonus_option = $this->Event->getEventAucB();
        return array('bonus_option'=>$bonus_option);
    }

    function argEventPay(){
        $cost = $this->getCollectionFromDB("SELECT `player_id`, `cost` FROM `player`");
        return array('cost'=>$cost);
    }

    function argEventTrade() {
        return array('event'=>$this->Event->getEvent());
    }

    function argValidBids() {
        $valid_bids = $this->Bid->getValidBids($this->getActivePlayerId());
        return array("valid_bids"=>$valid_bids );
    }

    function argRailBonus() {
        $rail_options= $this->Resource->getRailAdvBonusOptions($this->getActivePlayerId());
        return array("rail_options"=>$rail_options);
    }

    function argAuctionCost() {
        $act_p_id = $this->getActivePlayerId();
        $bid_cost = $this->Bid->getBidCost($act_p_id);
        if ($this->Event->getEvent() == EVT_AUC_COM_DISCOUNT){
            if ($this->Event->doesPlayerHaveMostBuildings($act_p_id, TYPE_COMMERCIAL)){
                $bid_cost = floor($bid_cost/2);
            }
        }
        return array("auction_cost"=>$bid_cost);
    }

    function argAllowedBuildings() {
        $act_p_id = $this->getActivePlayerId();
        $build_type_options = $this->Auction->getCurrentAuctionBuildTypeOptions();
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($act_p_id, BLD_RIVER_PORT);
        $ownsLumberMill = $this->Building->doesPlayerOwnBuilding($act_p_id, BLD_LUMBER_MILL);
        return(array("allowed_buildings"=> $buildings,
                    "current_event" => $this->Event->getEvent(),
                    "riverPort"=>$ownsRiverPort,
                    "lumberMill"=>$ownsLumberMill));
    }

    function argTrainStationBuildings() {
        $build_type_options = array(TYPE_RESIDENTIAL,TYPE_COMMERCIAL,TYPE_INDUSTRIAL,TYPE_SPECIAL);// all
        $buildings = $this->Building->getAllowedBuildings($build_type_options);
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($this->getActivePlayerId(), BLD_RIVER_PORT);    
        return(array("allowed_buildings"=> $buildings,
                    "riverPort"=>$ownsRiverPort,));
    }

    function argBuildingBonus() {
        $building_bonus =$this->getGameStateValue('building_bonus');
        return (array("building_bonus" => $building_bonus));
    }

    function argBonusOption() {
        $auction_bonus = $this->getGameStateValue( 'auction_bonus');
        $ownsRiverPort = $this->Building->doesPlayerOwnBuilding($this->getActivePlayerId(), BLD_RIVER_PORT);    
        return (array("auction_bonus"=> $auction_bonus, 
                      "riverPort" => $ownsRiverPort));
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
                $this->Resource->updateAndNotifyPayment($p_id, 'silver', $player['workers'], array('worker' => 'worker'));
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

    function argSetupAuction(){

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

    /**
     * for states where no backend actions are req, but want to add savepoint to log for undo transactions.
     */
    function stSetupTrade()
    {
        $this->Log->allowTrades($this->getActivePlayerId());
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
        $bonus = $this->getGameStateValue('building_bonus');
        $b_key = $this->getGameStateValue('last_building');
        $b_name = $this->Building->getBuildingNameFromKey($b_key);
        switch($bonus){
            case BUILD_BONUS_TRADE_TRADE:
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 2, $b_name, 'building', $b_key);
                $this->Log->updateResource($active_p_id, 'trade', 2);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_PAY_LOAN:
                $this->Resource->payLoanOrRecieveSilver($active_p_id, $b_name, 'building', $b_key);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_TRADE:
                $this->Resource->updateAndNotifyIncome($active_p_id, 'trade', 1, $b_name, 'building', $b_key);
                $this->Log->updateResource($active_p_id, 'trade', 1);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_SILVER_WORKERS: // silver per worker.
                $amt = $this->Resource->getPlayerResourceAmount($active_p_id, 'workers');
                $this->Resource->updateAndNotifyIncome($active_p_id, 'silver', $amt, $b_name, 'building', $b_key);
                $this->Log->updateResource($active_p_id, 'silver', $amt);
                $this->gamestate->nextState("auction_bonus");
            break;
            case BUILD_BONUS_RAIL_ADVANCE:
                $this->Resource->getRailAdv($active_p_id, $b_name, 'building', $b_key);
                $this->setGameStateValue('phase', PHASE_BLD_BONUS);
                $this->gamestate->nextState('rail_bonus');
            break;
            case BUILD_BONUS_TRACK_AND_BUILD:
                $this->Resource->addTrack($active_p_id, $b_name, 'building', $b_key);
                $this->gamestate->nextState('train_station_build');
            break;
            case BUILD_BONUS_WORKER:
                //the other case (BUILD_BONUS_WORKER) waits for player_choice so we don't want to go to next state
            break;
        }


    }

    function stSetupBuildEventBonus(){
        $this->Event->resolveBuildEventPhase();
    }

    function stGetAuctionBonus()
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
        
        /*if ( $from_version <= 2102040920 ){
            $result = self::getUniqueValueFromDB("SHOW COLUMNS FROM `buildings` LIKE 'b_order'");
            if(is_null($result)){
                self::DbQuery("ALTER TABLE buildings ADD b_order INT(3) UNSIGNED NOT NULL DEFAULT '0';");
            }
            $result = self::getUniqueValueFromDB("SHOW COLUMNS FROM `resources` LIKE 'paid'");
            if(is_null($result)){
                self::DbQuery("ALTER TABLE resources ADD paid INT(1) UNSIGNED NOT NULL DEFAULT '0';");
            }
            $result = self::getCollectionFromDB("SELECT global_id, global_value FROM `global` WHERE global_id='20'");
            if(count($result)==0){
                self::DbQuery( "INSERT INTO global (global_id, global_value) VALUES ('20','0');");
            }
        }*/
    }    
}
