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
        $sql = "INSERT INTO `event_id` (`event_id`, `position`, `location`) VALUES ";
        $values=array();
        
        $settlement = range(1, 10);
        shuffle($settlement);
        $this->game->setGameStateValue('current_event',$settlement[9]);
        for($i=1;$i <=4;$i++){
            $values[] = "(".array_pop($settlement).", $i, 1)";
        }
        $town = range(11, 20);
        shuffle($town);
        for($i=5;$i <=8;$i++){
            $values[] = "(".array_pop($town).", $i, 1)";
        }
        $city = range(21, 25);
        shuffle($city);
        for($i=9;$i <=10;$i++){
            $values[] = "(".array_pop($city).", $i, 1)";
        }

        $sql .= implode( ',', $values ); 

        $this->game->DbQuery( $sql );
    }
    
    // for setup of frontend...
    function getEvents(){
        $sql = "SELECT `event_id` e_id, `position` FROM `events` WHERE `location`=1"; 
        $events = $this->game->getCollectionFromDb( $sql );
        $offset_events = array();
        foreach ($events as $e_id => $event){
            $offset_events[$e_id] = array('e_id'=>($e_id), 'position'=>$event['position']);
        }
        return ($offset_events);
    }
    ///// END event setup method ////

    function getEvent($round_number){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return 0;
        $sql = "SELECT `auction_id` FROM `auctions` WHERE `location`=1, `position`=$round_number";
        $events = $this->game->getCollectionFromDb( $sql );

        foreach ($events as $id=>$value)
            if ($value['position'] == $round_number)
                return ($id);
    }

    function updateEvent($round_number){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return;
        $this->game->setGameStateValue('current_event', $this->getEvent($round_number));
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
     * Is the current event in event phase?
     * bool true on yes, false on no.
     * material event_info `all_b`
     */
    function eventAuction1(){
        if (!$this->auctionPhase()) return false;
        return (count($this->game->event_info[$this->game->getGameStateValue('current_event')]['auc'])==1);
    }

    /**
     * does the current event affect the auction phase?
     * bool true on yes, false on no.
     * material event_info `all_b`
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
        $event_id = $this->game->getGameStateValue('current_event');
        return array_key_exists($key, $this->game->event_info[$event_id]);
    }
    ///// END event phase helper methods ////

    ///// BEGIN pre auction Event Phase Handling methods ////
    function setupEventPreAuction(){
        $current_event = $this->game->getGameStateValue('current_event');
        $bonus_id = $this->game->events_info[$current_event]['all_b'];
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
                $players = $this->getPlayersWithMostBuildings(TYPE_INDUSTRIAL);
                foreach ($players as $p_id){
                    $vp = 6;//TODO: need special function to calculate amount of vp;
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', $vp, _('event'));
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

    // for after trade window of events that need to wait for players to trade before resolving.
    function resolveEventPreAuction(){
        $current_event = $this->game->getGameStateValue('current_event');
        $bonus_id = $this->game->events_info[$current_event]['all_b'];
        $next_state = "done";
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
        $this->game->gamestate->nextState( $next_state );
    }

    //// BEGIN private HELPER methods for determining effected players & values ////
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
        if ($type == null){
            return $this->game->getCollectionFromDB( "SELECT player_id, count(*) amt FROM `buildings` WHERE `player_id`!=0 Group by player_id" );
        } else {
            return $this->game->getCollectionFromDB( "SELECT player_id, count(*) amt FROM `buildings` WHERE `player_id`!=0 AND `building_type`=$type GROUP BY player_id" );
        }
    }
    
    /**
     * type should be integer for building_type 
     * or null for all building types.
     */
    private function getPlayersWithMostBuildings($type=null){
        return $this->getMost($this->getPlayersAmountOfBuildings($type), 'amt', 1);
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
            if ($key2 != null){
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