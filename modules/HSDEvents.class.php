<?php

/*
 * HSDEvents: a class that allows handles Events Related Methods.
 */
class HSDEvents extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }
    
    ///// BEGIN event setup method ////
    // for setup of backend sql.
    function createEvents(){
        $sql = "INSERT INTO `events` (`event_id`, `position`, `location`) VALUES ";
        $values=array();
        
        $settlement = range(1, 10);
        shuffle($settlement);
        $town = range(11, 20);
        shuffle($town);
        for($i=0; $i <4;$i++){
            $evt_set_id = $settlement[$i];
            $pos_set = 1 + $i;
            $values[] = "($evt_set_id, $pos_set, 1)";
            $evt_town_id = $town[$i];
            $pos_town = 5 + $i;
            $values[] = "($evt_town_id, $pos_town, 2)";
        }
        $city = range(21, 25);
        shuffle($city);
        for($i=0;$i <2;$i++){
            $evt_city_id = $city[$i];
            $pos_city = 9+$i;
            $values[] = "($evt_city_id, $pos_city, 3)";
        }

        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }
    
    // for setup of frontend...
    function getEvents(){
        $sql = "SELECT `event_id` e_id, `position` FROM `events` WHERE `location`>0"; 
        $events = $this->game->getCollectionFromDb( $sql );
        $offset_events = array();
        foreach ($events as $e_id => $event){
            $offset_events[$e_id] = array('e_id'=>($e_id), 'position'=>$event['position']);
        }
        return ($offset_events);
    }
    ///// END event setup method ////

    function getEvent($round_number = null){
        if ($this->game->getGameStateValue('new_beginning_evt') == DISABLED) return 0;
        $round_number = (is_null($round_number)?$this->game->getGameStateValue( 'round_number' ):$round_number);
        $sql = "SELECT `event_id` e_id FROM `events` WHERE `position`=$round_number";
        return $this->game->getUniqueValueFromDB( $sql );
    }

    function updateEvent($round_number){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return;
        $this->game->setGameStateValue('current_event', $this->getEvent($round_number));
    }

    function getEventAucB($round_number = null){
        $event = $this->getEvent($round_number);
        if ($event == 0) return 0;
        return $this->game->event_info[$event]['auc_b']??0;
    }

    // get id for event phase id 'all_b'
    function getEventAllB($round_number = null){
        $event = $this->getEvent($round_number);
        if ($event == 0) return 0;
        return $this->game->event_info[$event]['all_b']??0;
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
     * does the current event affect auction?
     * bool true on yes, false on no.
     */
    function eventAuction($auc = AUC_EVT_ALL){
        if (!$this->auctionPhase()) return false;
        return ($this->game->event_info[$this->getEvent()]['auc']==$auc);
    }

    function isAuctionAffected($auction = null) {
        if (!$this->auctionPhase()) return false;
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
        return array_key_exists($key, $this->game->event_info[$event_id]);
    }
    ///// END event phase helper methods ////

    ///// BEGIN pre auction Event Phase Handling methods ////
    function setupEventPreAuction(){
        $bonus_id = $this->getEventAllB();
        $next_state = 'done';
        switch($bonus_id){
            //// next_state='evt_trade' states ////
            case EVT_SELL_NO_TRADE:
                //send to new multi-active,
                // where players can sell (existing) goods for no trade chips.
            case EVT_PAY_LOAN_FOOD: 
                // send to new multi-active, 
                // where players may trade and pay loans with food.
            case EVT_VP_4SILVER: 
                // offer trade before this. (normal trade)
                // (after) all players with vp token, get 4 silver
            case EVT_COPPER_COW_GET_GOLD:
                // players get trade opportunity (trades are hidden during this phase).
                // then reveal amount of Copper+Cow
                // the player(s) with the most (at least 1) get a gold.
            case EVT_VP_FOR_WOOD: 
                // players get ${vp} for every ${wood} held
                // so offer trade first.
                $this->game->gamestate->setAllPlayersMultiactive( );
                $next_state = 'evt_trade';
                break;
            //// next_state='done' states ////
            case EVT_TRADE: //everyone gets a trade token. (no trade req)
                $resources = $this->game->getCollectionFromDB( "SELECT `player_id` FROM `resources` " );
                foreach ($resources as $p_id=> $player){
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'trade', 1, _('event'));
                }
                break;
            case EVT_DEV_TRACK_VP3: 
                //The player(s) who is farthest advanced on the Railroad Development Track gets ${vp3}
                $players = $this->getPlayersFurthestOnDevelopmentTrack();
                foreach($players as $p_id){
                    $this->game->Resource->updateAndNotifyPayment($p_id, 'vp', 3, _('event'));
                }
                break;
            case EVT_LEAST_BLD_TRACK: // players with least buildings get track (not adv)
                $players = $this->getPlayersWithLeastBuildings();
                foreach($players as $p_id){
                    $this->game->Resource->addTrack($p_id, _("event"));
                }
                break;
            case EVT_IND_VP:
                // The player(s) with the most ${ind} buildings gets 
                //${vp} for each resource they recieved in income (${wood}, ${food}, ${steel}, ${gold}, ${copper}, ${cow} produced by buildings and not from trade)
                $res_types = array('wood', 'food', 'steel', 'gold', 'copper', 'cow');
                $players = $this->getPlayersWithMostBuildings(TYPE_INDUSTRIAL);
                foreach ($players as $p_id){
                    $bld_income = $this->game->Building->getBuildingIncomeForPlayer($p_id);
                    $res = 0;
                    foreach ($bld_income as $b_id =>$income) {
                        foreach($income as $type=>$amt){
                            if (in_array($type, $res_types)){
                                $res += $amt;
                            }
                        }
                    }
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', $res, _('event'));
                }
                break;

            //// next_state='bonus' states //// (multi-active version of choose bonus)
            case EVT_LOAN_TRACK: 
                //least loan gets track adv (no trade req)
                $players = $this->getPlayersWithLeastResource('loan');
                foreach ($players as $p_id){
                    $this->game->Resource->getRailAdv($p_id, _('event'));
                }
                $this->game->gamestate->setPlayersMultiactive($players);
                $next_state = 'bonus';
                break;
            case EVT_RES_ADV_TRACK:
                //The player(s) with the most ${res} buildings gets ${adv_track}
                $players= $this->getPlayersWithMostBuildings(TYPE_RESIDENTIAL);
                foreach ($players as $p_id){
                    $this->game->Resource->getRailAdv($p_id, _('event'));
                }
                $this->game->gamestate->setPlayersMultiactive($players);
                $next_state = 'bonus';
                break;
            case EVT_LEAST_WORKER:
                $players = $this->getPlayersWithLeastResource('worker');
                $this->game->gamestate->setPlayersMultiactive($players);
                // go to state to choose to get bonus (worker) or pass 
                $next_state = 'bonus';
                // go to new state (multi-active version of recieve bonus worker state).
                break;
            //// next_state='evt_pay' states //// (multi-active pay cost state)
            case EVT_INTEREST: //note: players can't pay off loans until end of game. (so no trade before pay)
                $players = $this->getPlayersWithAtLeastOneResource('loan');
                if (count($players) ==0){
                    $next_state = 'done';
                } else {
                    // send to new multi-active pay state, with cost based upon amount of loans
                    foreach($players as $p_id){
                        $loan_amt = $this->game->Resource->getPlayerResourceAmount($p_id, 'loan');
                        $this->game->Resource->setCost($p_id, $loan_amt);
                    }
                    $this->game->gamestate->setPlayersMultiactive($players);
                    $next_state = 'evt_pay';
                }
                break;
            case EVT_BLD_TAX_SILVER:
                $players= $this->getPlayersAmountOfBuildings();
                foreach($players as $p_id => $player){
                    $this->game->Resource->setCost($p_id, $player['amt']);
                }
                // Players must pay ${silver} per Building they have
                $this->game->gamestate->setAllPlayersMultiactive( );
                $next_state = 'evt_pay';
                break;
        }
        $this->game->gamestate->nextState( $next_state );
    }

    function getNextStatePreTrade(){
        $bonus_id = $this->getEventAllB();
        switch($bonus_id){
            case EVT_SELL_NO_TRADE:
            case EVT_PAY_LOAN_FOOD:
            case EVT_VP_4SILVER:
            case EVT_COPPER_COW_GET_GOLD:
            case EVT_VP_FOR_WOOD:
        }
    }

    // for after trade window of events that need to wait for players to trade before resolving.
    function resolveEventPostTrade(){
        $bonus_id = $this->getEventAllB();
        switch($bonus_id){
            case EVT_SELL_NO_TRADE:// no action required
            case EVT_PAY_LOAN_FOOD:// no action required
                break;
            case EVT_VP_4SILVER:
                // all players with vp token, get 4 silver
                $players = $this->getPlayersWithAtLeastOneResource('vp');
                foreach ($players as $p_id){
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'silver', 4, _('event'));
                }
                break;
            case EVT_COPPER_COW_GET_GOLD:
                // player(s) with most cow+copper get a gold
                $resources =  $this->game->getCollectionFromDB( "SELECT `player_id`, `copper`, `cow` FROM `resources` " );
                $players = $this->getMost($resources, 'copper', 1, 'cow');
                foreach($players as $p_id=>$p){
                    $this->game->Resource->updateAndNotifyPayment($p_id, 'gold', 1, _('event'));
                }
                break;
            case EVT_VP_FOR_WOOD:
                // player(s) get 1 vp per wood held.
                $players_wood = $this->getPlayersWithAtLeastOneResource('wood');
                foreach($players_wood as $p_id){
                    $wood_amt = $this->game->Resource->getPlayerResourceAmount($p_id,'wood');
                    $this->game->Resource->updateAndNotifyPayment($p_id, 'vp', $wood_amt, _('event'));
                }
                break;
        }
        $this->game->gamestate->nextState( 'done' );
    }

    function setupBuildEventBonus(){
        $next_state = "done";
        if ($this->isAuctionAffected()) {
            $event = $this->getEventAucB();
            switch($event){
                case EVT_AUC_DISCOUNT_1_RES:
                case EVT_AUC_NO_AUCTION:
                case EVT_AUC_COM_DISCOUNT:
                    break;
                case EVT_AUC_BUILD_AGAIN:// can build again (any).
                case EVT_AUC_SECOND_BUILD:// build again (same types)
                case EVT_AUC_STEEL_ANY:// player may pay a steel to build any building
                    $next_state = "evt_build";
                    break;
                case EVT_AUC_BONUS_WORKER:// can recieve worker
                case EVT_AUC_2SILVER_TRACK:// pay 2 silver for track advancement
                    $next_state = "bonus";
                break;
                case EVT_AUC_TRACK:
                    // gains a rail track
                    $this->game->Resource->addTrack($this->game->getActivePlayerId(), _("event"));
                    $next_state = "done";
                break;
            }
        }
        $this->game->gamestate->nextstate( $next_state );
    }

    function getAllowedBuildings(){
        $event = $this->getEventAucB();
        switch($event){
            case EVT_AUC_SECOND_BUILD: // build again (same types)
                $build_type_options = $this->game->Auction->getCurrentAuctionBuildTypeOptions();
                return ($this->Building->getAllowedBuildings($build_type_options));
            case EVT_AUC_BUILD_AGAIN: // can build again (any).
            case EVT_AUC_STEEL_ANY: // player may pay a steel to build any building
                $build_type_options = array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL);
                return ($this->Building->getAllowedBuildings($build_type_options));
            default:
                throw new BgaVisibleSystemException ( clienttranslate("State incorrectly entered.") );
        }
    }

    //// BEGIN pass Bid ////
    /**
     * does any bonuses for passing from events, returns next_state
     */
    function passBid(){
        if(!$this->passPhase()){ return "rail"; }
        $pass_evt = $this->game->event_info[$this->getEvent()]['pass'];
        switch($pass_evt){
            case EVT_PASS_TRACK: //Players who pass, get a ${track}
                $this->game->Resource->addTrack($this->game->getActivePlayerId(), _("event"));
                return "rail";
            case EVT_PASS_DEPT_SILVER: //Players who pass may pay off debt for 3-{silver} apiece
                return "event";
        }
    }

    function postEventBonusNav(){
        $next_state = 'done';
        if ($this->game->Auction->getCurrentAuctionBonus() != AUC_BONUS_NONE){
            $next_state = 'auction_bonus';
        }
        $this->game->gamestate->nextState($next_state);
    }

    //// END setup Auction ////


    //// BEGIN private HELPER methods for determining effected players & values ////
    function doesPlayerHaveMostBuildings($p_id, $type){
        $players = $this->getPlayersWithMostBuildings($type);
        return array_key_exists($p_id, $players);
    }

    private function getPlayersWithAtLeastOneResource($type){
        $players = array();
        $resources = $this->game->getCollectionFromDB( "SELECT `player_id` FROM `resources` WHERE `$type`>0 " );
        foreach ($resources as $p_id=> $player){
            $players[] = $p_id;
        }
        return $players;
    }

    private function getPlayersWithLeastBuildings(){
        return $this->getLeast($this->getPlayersAmountOfBuildings(), 'amt');
    }

    /**
     * returns array($p_id=>array('player_id'=>#, 'amt'=>#) ...) with all the players (0 omitted);
     */
    private function getPlayersAmountOfBuildings($type=null){
        if (is_null($type)){
            return $this->game->getCollectionFromDB( "SELECT player_id, count(*) amt FROM `buildings` WHERE `player_id`!=0 Group by player_id" );
        } else {
            return $this->game->getCollectionFromDB( "SELECT player_id, count(*) amt FROM `buildings` WHERE `player_id`!=0 AND `building_type`=$type GROUP BY player_id" );
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
        $resources = $this->game->getCollectionFromDB( "SELECT `player_id`, `$type` FROM `resources` " );
        return $this->getLeast($resources, $type);
    }

    private function getPlayersFurthestOnDevelopmentTrack(){
        return $this->game->getCollectionFromDB( "SELECT `player_id` FROM `player` WHERE `raid_adv` = (SELECT MAX(`rail_adv`) FROM `player`)");
        /* alternate solution...
        $values = $this->game->getCollectionFromDB( "SELECT player_id FROM player WHERE `raid_adv` = (SELECT MAX(rail_adv) FROM player)");
        return $this->getMost( $values, 'rail_adv');
        */
    }

    private function getLeast($values, $key){
        $leastPlayers = array();
        $leastValue = 0;
        foreach ($values as $p_id=> $player){
            if (empty($leastPlayers) || $player[$key]<$leastValue){
                $leastValue = $player[$key];
                $leastPlayers = array($p_id);
            } else if ($player[$key] == $leastValue){
                $leastPlayers[] = $p_id;
            }
        }
        return $leastPlayers();
    }

    private function getMost($values, $key, $minimum=0, $key2=null){
        $mostPlayers = array();
        $mostValue = $minimum -1;
        foreach ($values as $p_id=> $player){
            $p_value = $player[$key];
            if (!is_null($key2)){
                $p_value += $player[$key2];
            }
            if ($p_value > $mostValue){
                $mostValue = $p_value;
                $mostPlayers = array($p_id);
            } else if ($p_value == $mostValue){
                $mostPlayers[] = $p_id;
            }
        }
        return $mostPlayers;
    }

    //// END (private) HELPER methods for determining players & values ////
}