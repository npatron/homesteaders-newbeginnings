<?php

/*
 * HSDEvents: a class that allows handles Events Related Methods.
 * event information is stored in `material.inc.php` -> `event_info`
 */
class HSDEvents extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }
    
    ///// BEGIN event setup method ////
    // setup of backend sql table
    function createEvents(){
        $values=array();
        // settlement `event_id` are 1-10
        $settlement = range(1, 10);
        shuffle($settlement);
        // town `event_id` are 11-20
        $town = range(11, 20);
        shuffle($town);
        // city `event_id` are 21-25
        $city = range(21, 25);
        shuffle($city);
        for($i=0; $i <4; $i++){
            // put 4 settlement events into events table (at positions 1-4)
            $evt_set_id = $settlement[$i];
            $pos_set = 1 + $i;
            $values[] = "($evt_set_id, $pos_set, 1)";
            // put 4 town events into events table (at positions 5-8)
            $evt_town_id = $town[$i];
            $pos_town = 5 + $i;
            $values[] = "($evt_town_id, $pos_town, 2)";
            // put 2 city events into events deck (at positions 9-10)
            if ($i < 2){
                $evt_city_id = $city[$i];
                $pos_city = 9+$i;
                $values[] = "($evt_city_id, $pos_city, 3)";
            }
        }
        $sql = "INSERT INTO `events` (`event_id`, `position`, `location`) VALUES ";
        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }
    
    // for setup of frontend...
    function getEvents(){
        $sql = "SELECT `event_id` e_id, `position` FROM `events`"; 
        $events = $this->game->getCollectionFromDb( $sql , true);
        $offset_events = array();
        foreach ($events as $e_id => $event){
            $offset_events[$e_id] = array('e_id'=>($e_id), 'position'=>$event);
        }
        return ($offset_events);
    }
    ///// END event setup method ////

    function showEventTable($table, $event_id){
        $message = $this->game->event_info[$event_id]['name'];
        if ($event_id == EVENT_INDUSTRIAL_DOMINANCE){
            $message = '<span title="Industrial" class="ind">Industrial</span> Dominance';
        }
        if ($event_id == EVENT_RESIDENTIAL_DOMINANCE){
            $message = '<span title="Residential" class="res">Residential</span> Dominance';
        }
        $this->game->notifyAllPlayers( "tableWindow", '', array(
            "id" => 'eventResolved',
            "title" => clienttranslate($message),
            "table" => $table,
            "closing" => clienttranslate( "Close" ),
        ));
    }

    function discardEventTile(){
        if ($this->game->getGameStateValue('new_beginning_evt') == DISABLED) return ;
        $round_number = $this->game->getGameStateValue( 'round_number' );
        $this->game->DBQuery("UPDATE `events` SET `location`=0 WHERE `position`=$round_number");
    }

    function getEvent($round_number = null){
        if ($this->game->getGameStateValue('new_beginning_evt') == DISABLED) return 0;
        $round_number = (is_null($round_number)?$this->game->getGameStateValue( 'round_number' ):$round_number);
        $sql = "SELECT `event_id` e_id FROM `events` WHERE `position`=$round_number";
        return $this->game->getUniqueValueFromDB( $sql );
    }

    function getEventName($round_number = null){
        return _($this->game->event_info[$this->getEvent($round_number)]['name']);
    }

    function getEventAttribute($attribute, $round_number= null){
        $event = $this->getEvent($round_number);
        if ($event == 0) return 0;
        return $this->game->event_info[$event][$attribute]??0;
    }

    /**
     * Is the current event in event phase?
     * bool true on yes, false on no.
     * material event_info `all_b`
     */
    function eventAucBonus(){
        return $this->eventHaskey('auc_b');
    }

    ///// BEGIN event phase helper methods ////
    /**
     * Is the current event in event phase?
     * bool true on yes, false on no.
     * material event_info `all_b`
     */
    function eventPhase(){
        return $this->eventHaskey('all_b');
    }

    /**
     * Is the current event build_discount?
     * bool true on yes, false on no.
     * material event_info `all_d`
     */
    function eventDiscount(){
        return $this->eventHaskey('auc_d');
    }

    /**
     * does the current event affect auction?
     * bool true on yes, false on no.
     */
    function eventAuction($auc = AUC_EVT_ALL){
        if (!$this->auctionPhase()) return false;
        return ($this->game->event_info[$this->getEvent()]['auc']==$auc);
    }

    function isAuctionAffected($auction = null) {
        if (!$this->eventAucBonus()) return false;
        $auction = (is_null($auction)?$this->game->getGameStateValue('current_auction'):$auction);
        if ($auction ==1) { 
            return true;
        }
        return ($this->eventAuction());
    }

    /**
     * does the current event affect the auction phase?
     * bool true on yes, false on no.
     * material event_info `auc`
     */
    function auctionPhase(){
        return $this->eventHaskey('auc');
    }

    /**
     * Does the current event affect auction pass action?
     * bool true on yes, false on no.
     * material event_info `all_b`
     */
    function passPhase(){
        return $this->eventHaskey('pass');
    }

    /**
     * Does the current event affect auction pass action?
     * bool true on yes, false on no.
     * material event_info `all_b`
     */
    function eventHaskey($key){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return false;
        
        $event_id = $this->getEvent();
        if ($event_id == 0) return false;
        return array_key_exists($key, $this->game->event_info[$event_id]);
    }
    ///// END event phase helper methods ////

    ///// BEGIN pre auction Event Phase Handling methods ////
    function setupEventPreAuction(){
        $this->game->Resource->clearPaid();
        $this->game->Resource->clearCost();
        $event_id = $this->getEvent();
        $next_state = 'done';
        switch($event_id){
            //// next_state='evt_trade' states ////
            case EVENT_WARTIME_DEMAND:
                //send to new multi-active,
                // where players can sell (existing) goods for no trade chips.
            case EVENT_SHARECROPPING: 
                // send to new multi-active, 
                // where players may trade and pay loans with food.
            case EVENT_EAGER_INVESTORS: 
                // offer trade before this. (normal trade)
                // (after) all players with vp token, get 4 silver
            case EVENT_STATE_FAIR:
                // players get trade opportunity (trades are hidden during this phase).
                // then reveal amount of Copper+Cow
                // the player(s) with the most (at least 1) get a gold.
            case EVENT_TIMBER_CULTURE_ACT: 
                // players get ${vp} for every ${wood} held
                // so offer trade first.
                $next_state = 'evt_trade';
                break;
            //// next_state='bonus' states //// (multi-active version of choose bonus)
            case EVENT_BANK_FAVORS: 
            case EVENT_RESIDENTIAL_DOMINANCE:
            case EVENT_FORTUNE_SEEKER:
                $next_state = 'bonus';
                break;
            //// next_state='evt_pay' states //// (multi-active pay cost state)
            case EVENT_INTEREST: //note: players can't pay off loans until end of game. (so no trade before pay)
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach($all_players as $p_id=> $p){
                    $p_loans = $this->game->Resource->getPlayerResourceAmount($p_id, 'loan');
                    $this->game->Resource->setCost($p_id, $p_loans);
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if ($p_loans == 0){
                        $row_2[] = '';
                    } else {
                        $row_2[] = '-'.$p_loans.' <span title = "silver" class="log_silver token_inline"></span>';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                $next_state = 'evt_pay';
                break;
            case EVENT_PROPERTY_TAXES:
                $all_players= $this->getPlayersAmountOfBuildings();
                $row_1 = array( );
                $row_2 = array( );
                foreach($all_players as $p_id => $player){
                    $this->game->Resource->setCost($p_id, $player['amt']);
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    $row_2[] = '-'.$player['amt'].' <span title = "silver" class="log_silver token_inline"></span>';
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                $next_state = 'evt_pay';
                break;
            //// next_state='done' states ////
            case EVENT_TRAVELING_TRADERS: 
                //everyone gets a trade token. (no trade req)
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach ($all_players as $p_id => $p){
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'trade', 1, $this->getEventName(), 'event');
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    $row_2[] = '<span title = "trade" class="log_trade token_inline"></span>';
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                break;
            case EVENT_TRANSCONTINENTAL_RR: 
                //The player(s) who is farthest advanced on the Railroad Development Track gets ${vp3}
                $winning_players = $this->getPlayersFurthestOnDevelopmentTrack();

                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach ($all_players as $p_id => $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $winning_players)){
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'vp3', 1, $this->getEventName(), 'event');
                        $row_2[] = '<span title = "vp3" class="log_vp3 token_inline"></span>';
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                break;
            case EVENT_WESTERN_PACIFIC_RR: // players with least buildings get track (not adv)
                $winning_players = $this->getPlayersWithLeastBuildings();
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach ($all_players as $p_id => $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $winning_players)){
                        $this->game->Resource->addTrackAndNotify($p_id, $this->getEventName(), 'event');
                        $row_2[] = '<span title = "track" class="log_track token_inline"></span>';
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                break;
            case EVENT_INDUSTRIAL_DOMINANCE:
                // The player(s) with the most ${ind} buildings gets 
                //${vp} for each resource they received in income (${wood}, ${food}, ${steel}, ${gold}, ${copper}, ${cow} produced by buildings and not from trade)
                $winning_players = $this->getPlayersWithMostBuildings(TYPE_INDUSTRIAL);
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach ($all_players as $p_id => $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (in_array($p_id, $winning_players)){
                        $res_amt = $this->game->Building->getBuildingResourceIncomeCountForPlayer($p_id);
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', $res_amt, $this->getEventName(), 'event');
                        $row_2[] = $res_amt.' <span title = "vp" class="log_vp token_inline"></span>';
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                break;
        }
        self::dump('event next_state', $next_state);
        $this->game->gamestate->nextState($next_state);
    }

    function setupEventBonus(){
        $event_id = $this->getEvent();
        $pending_players = array();
        $change_state = false;
        switch($event_id){
            case EVENT_BANK_FAVORS:
                $pending_players = $this->getPlayersWithLeastResource('loan');

                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach($all_players as $p_id=> $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $pending_players)){
                        $this->game->Resource->getRailAdv($p_id, $this->getEventName(), 'event');
                        $this->game->Log->allowTrades($p_id);
                        $row_2[] = clienttranslate('Rail Development');
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                $change_state = true;
            break;
            case EVENT_FORTUNE_SEEKER:
                $pending_players = $this->getPlayersWithLeastResource('workers');
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach($all_players as $p_id=> $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $pending_players)){
                        $this->game->Log->allowTrades($p_id);
                        $row_2[] = '<span title = "worker" class="log_worker token_inline"></span>';
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
            break;
            case EVENT_RESIDENTIAL_DOMINANCE:   
                $pending_players= $this->getPlayersWithMostBuildings(TYPE_RESIDENTIAL);
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach($all_players as $p_id=> $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $pending_players)){
                        $this->game->Resource->getRailAdv($p_id, clienttranslate('<span title="Residential" class="res">Residential</span> Dominance'), 'event');
                        $this->game->Log->allowTrades($p_id);
                        $row_2[] = clienttranslate('Rail Development');
                    } else {
                        $row_2[] = 'x';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $event_id);
                $change_state = true;
            break;
        }
        if (count($pending_players) == 0){
            $this->game->gamestate->nextState("done");
        } else {
            $this->game->gamestate->setPlayersMultiactive($pending_players, 'done');
            if ($change_state){
                $this->game->gamestate->nextState("rail_bonus");
            }
        }
    }

    function getEventPayCost() {
        $cost= array();
        $players = $this->game->loadPlayersBasicInfos();
        foreach($players as $p_id=> $player){
            $cost[$p_id] = $this->game->Resource->getCost($p_id);
        }
        return $cost;
    }

    function setupEventPay() {
        $event_id = $this->getEvent();
        switch($event_id){
            case EVENT_INTEREST:
                // send to new multi-active pay state, with cost based upon amount of loans
                $this->game->Log->allowTradesAllPlayers();
                $this->game->gamestate->setAllPlayersMultiactive();
                $players = $this->game->loadPlayersBasicInfos();
                foreach($players as $p_id=> $player){
                    if ($this->game->Resource->getCost($p_id) == 0) {
                        $this->game->gamestate->setPlayerNonMultiactive($p_id, 'done');
                    }
                }
            break;
            case EVENT_PROPERTY_TAXES:
                // Players must pay ${silver} per Building they have
                $this->game->Log->allowTradesAllPlayers();
                $this->game->gamestate->setAllPlayersMultiActive();    
            break;
        }
    }

    function doesPlayerHaveMostBuildings($p_id, $bld_type){
        $winning_players = $this->getPlayersWithMostBuildings($bld_type);
        return (array_key_exists($p_id, $winning_players));
    }

    function getNextStatePreTrade(){
        $bonus_id = $this->getEvent();
        switch($bonus_id){
            case EVENT_WARTIME_DEMAND:
            case EVENT_SHARECROPPING:
            case EVENT_EAGER_INVESTORS:
            case EVENT_STATE_FAIR:
            case EVENT_TIMBER_CULTURE_ACT:
                return 'post';
            default: 
                return 'done';
        }
    }

    // for after trade window of events that need to wait for players to trade before resolving.
    function resolveEventPostTrade(){
        $bonus_id = $this->getEvent();
        switch($bonus_id){
            case EVENT_WARTIME_DEMAND:// no action required
            case EVENT_SHARECROPPING:// no action required
                break;
            case EVENT_EAGER_INVESTORS:
                // all players with vp token, get 4 silver
                $winning_players = $this->getPlayersWithAtLeastOneResource('vp');

                // build event table (and notifyIncome for winners)
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                $silver_html = '<span title = "silver" class="log_silver token_inline"></span>';
                foreach ($all_players as $p_id => $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $winning_players)){
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'silver', 4, $this->getEventName(), 'event');
                        $row_2[] = $silver_html.$silver_html.$silver_html.$silver_html;
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $bonus_id);
                break;
            case EVENT_STATE_FAIR:
                // apply pending trades
                $this->game->Log->triggerHiddenTransactions();
                // player(s) with most cow+copper get a gold
                $resources =  $this->game->getCollectionFromDB( "SELECT `player_id`, `copper`, `cow` FROM `resources` WHERE `cow` >0 OR `copper`>0");
                $winning_players = $this->getMost($resources, 'copper', 1, 'cow');

                // build event table (and notifyIncome for winners)
                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach ($all_players as $p_id => $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $winning_players)){
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'gold', 1, $this->getEventName(), 'event');
                        $row_2[] = '<span title = "gold" class="log_gold token_inline"></span>';
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $bonus_id);
                break;
            case EVENT_TIMBER_CULTURE_ACT:
                // player(s) get 1 vp per wood held.
                $winning_players = $this->getPlayersWithAtLeastOneResource('wood');

                $all_players = $this->game->loadPlayersBasicInfos();
                $row_1 = array( );
                $row_2 = array( );
                foreach ($all_players as $p_id => $p){
                    $row_1[] = array('str' => '${player_name}',
                    'args' => array( 'player_name' => $this->game->getPlayerName($p_id) ),
                    'type' => 'header');
                    if (array_key_exists($p_id, $winning_players)){
                        $wood_amt = $this->game->Resource->getPlayerResourceAmount($p_id, 'wood');
                        $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', $wood_amt, $this->getEventName(), 'event');

                        $val = '<span class="log_container">';
                        for($i=0;$i <$wood_amt; $i++){
                            $val .= '<span title = "vp" class="log_vp token_inline"></span>';
                        }
                        $val .= '</span>';
                        $row_2[] = $val;
                    } else {
                        $row_2[] = '';
                    }
                }
                $this->showEventTable(array($row_1, $row_2), $bonus_id);
                break;
        }
        $this->game->gamestate->nextState( 'done' );
    }

    function setupEventLotBonus(){
        $next_state = "done";
        if ($this->isAuctionAffected()) {
            $event = $this->getEvent();
            switch($event){
                case EVENT_WESTERN_PACIFIC_RR:
                    break;
                case EVENT_RAPID_EXPANSION:// build again (same types)
                    $next_state = "evt_build";
                    $this->game->Auction->setCurrentAuctionBuildType();
                break;
                case EVENT_EXTRA_LOT:// can build again (any).
                    $next_state = "evt_build";
                    $this->game->setGameStateValue('build_type_int', 15 /*any*/);
                break;
                case EVENT_INDUSTRIALIZATION:// player may pay a steel to build any building
                    $next_state = "evt_bonus";
                    $this->game->setGameStateValue('build_type_int', 15 /*any*/);
                break;
                case EVENT_MIGRANT_WORKERS:// can receive worker
                case EVENT_RAILROAD_CONTRACTS:// pay 2 silver for track advancement
                    $next_state = "evt_bonus";
                break;
                case EVENT_UNION_PACIFIC_RR:// gains a rail track
                    $this->game->Resource->addTrackAndNotify($this->game->getActivePlayerId(), $this->getEventName(), 'event');
                    $next_state = "done";
                break;
            }
        }
        $this->game->gamestate->nextstate( $next_state );
    }

    //// BEGIN pass Bid ////
    /**
     * does any bonuses for passing from events & navigates to next_state
     * 'rail' for choose bonus
     * 'event' for pay dept on pass event.
     */
    function passBidNextState(){
        $next_state = 'rail';
        if($this->passPhase()){
            switch($this->getEvent()){
                case EVENT_CENTRAL_PACIFIC_RR: //Players who pass, get a ${track}
                    $this->game->Resource->addTrackAndNotify($this->game->getActivePlayerId(), _("event"));
                break;
                case EVENT_NELSON_ACT: //Players who pass may pay off debt for 3-{silver} apiece
                    $next_state = "event";
                break;
            }
        }
        $this->game->gamestate->nextState( $next_state );
    }

    //// END setup Auction ////


    //// BEGIN private HELPER methods for determining effected players & values ////

    private function getPlayersWithAtLeastOneResource($type){
        return $this->game->getCollectionFromDB( "SELECT `player_id`, `$type` amt FROM `resources` WHERE `$type`>0 Group by player_id");;
    }

    private function getPlayersWithLeastBuildings(){
        return $this->getLeast($this->getPlayersAmountOfBuildings(), 'amt');
    }

    /**
     * returns array($p_id=>array('player_id'=>#, 'amt'=>#) ...) with all the players (0 omitted);
     */
    private function getPlayersAmountOfBuildings($type=null){
        if (is_null($type)){
            return $this->game->getCollectionFromDB( "SELECT player_id, count(*) amt FROM `buildings` WHERE `player_id`!=0 Group by player_id");
        } else {
            return $this->game->getCollectionFromDB( "SELECT player_id, count(*) amt FROM `buildings` WHERE `player_id`!=0 AND `building_type`=$type GROUP BY player_id");
        }
    }
    
    /**
     * type should be integer for building_type 
     * or null for all building types.
     */
    private function getPlayersWithMostBuildings($type=null, $min = 1){
        return $this->getMost($this->getPlayersAmountOfBuildings($type), 'amt', $min);
    }

    // could also do in sql with: "SELECT player_id, $type FROM resources WHERE $type = (SELECT MIN($type) FROM resources)";
    private function getPlayersWithLeastResource($type){
        $resources = $this->game->getCollectionFromDB( "SELECT `player_id`, `$type` FROM `resources` WHERE `$type` = (SELECT MIN(`$type`) FROM `resources`) ");
        return $this->getLeast($resources, $type);
    }

    private function getPlayersFurthestOnDevelopmentTrack(){
        $values = $this->game->getCollectionFromDB( "SELECT `player_id`, `rail_adv` FROM `player` ");
        return $this->getMost( $values, 'rail_adv');
    }

    private function getLeast($values, $key){
        //self::debug("getLeast called with '$key' ");
        //self::dump("values", $values);
        $leastPlayers = array();
        $leastValue = 999;
        foreach ($values as $p_id => $player){
            if (empty($leastPlayers) || $player[$key] < $leastValue){
                $leastValue = $player[$key];
                $leastPlayers = array();
                $leastPlayers[$p_id] = $p_id;
            } else if ($player[$key] == $leastValue){
                $leastPlayers[$p_id] = $p_id;
            }
        }
        return $leastPlayers;
    }

    private function getMost($values, $key, $minimum=0, $key2=null){
        //self::debug("getMost called with '$key' & '$key2' ");
        //self::dump("values", $values);
        //self::dump("minimum", $minimum);
        $mostPlayers = array();
        $mostValue = $minimum -1;
        foreach ($values as $p_id => $player){
            $p_value = $player[$key];
            if (!is_null($key2)){
                $p_value += $player[$key2];
            }
            if ($p_value > $mostValue){
                $mostValue = $p_value;
                $mostPlayers = array();
                $mostPlayers[$p_id] = $p_id;
            } else if ($p_value == $mostValue){
                $mostPlayers[$p_id] = $p_id;
            }
        }
        //self::dump("most players", $mostPlayers);
        return $mostPlayers;
    }

    //// END (private) HELPER methods for determining players & values ////
}