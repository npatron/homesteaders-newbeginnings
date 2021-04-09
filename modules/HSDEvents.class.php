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

    function createEvents(){
        // auctions DB is perfectly ok for handing Events. (location == 5) (and event id is offset 70)
        $sql = "INSERT INTO `auctions` (`auction_id`, `position`, `location`) VALUES ";
        $values=array();
        
        $settlement = range(71, 80);
        shuffle($settlement);
        $this->game->setGameStateValue('current_event',$settlement[9]);
        for($i=1;$i <5;$i++){
            $values[] = "(".array_pop($settlement).", $i, 5)";
        }
        $town = range(81, 90);
        shuffle($town);
        for($i=5;$i <9;$i++){
            $values[] = "(".array_pop($town).", $i, 5)";
        }
        $city = range(91, 95);
        shuffle($city);
        for($i=9;$i <11;$i++){
            $values[] = "(".array_pop($city).", $i, 5)";
        }

        $sql .= implode( ',', $values ); 

        $this->game->DbQuery( $sql );
    }

    function getEvents(){
        $sql = "SELECT `auction_id` e_id, `position` FROM `auctions` WHERE `location`=5"; 
        $events = $this->game->getCollectionFromDb( $sql );
        $offset_events = array();
        foreach ($events as $a_id => $event){
            $offset_events[$a_id - 70] = array('e_id'=>($a_id-70), 'position'=>$event['position']);
        }
        return ($offset_events);
    }

    function updateEvent($round_number){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return;
        $this->game->setGameStateValue('current_event', $this->getEvent($round_number));
    }
    
    // don't forget events use `auction_id` offset by 70 (to not conflict with auctions)
    function getEvent($round_number){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return 0;
        $sql = "SELECT `auction_id` FROM `auctions` WHERE `location`=5, `position`=$round_number";
        $events = $this->game->getCollectionFromDb( $sql );

        foreach ($events as $id=>$value)
            if ($value['position'] == $round_number)
                return ($id - 70);
    }

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

    function setupEventPreAuction(){
        $current_event = $this->game->getGameStateValue('current_event');
        $bonus_id = $this->game->events_info[$current_event]['all_b'];
        $next_state = "done";
        switch($bonus_id){
            case EVT_VP_4SILVER: // all players with vp token, get 4 silver
                $players = $this->getPlayersWithAtLeastOneResource('vp');
                foreach ($players as $p_id=> $p){
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'silver', 4, "event");
                }
                $this->game->gamestate->nextState( "done" );
                break;
            case EVT_TRADE: //everyone gets a trade token.
                $resources = $this->game->getCollectionFromDB( "SELECT `player_id` FROM `resources` " );
                foreach ($resources as $p_id=> $player){
                    $this->game->Resource->updateAndNotifyIncome($p_id, 'trade', 1, "event");
                }
                $this->game->gamestate->nextState( "done" );
                break;
            case EVT_LOAN_TRACK: //least loan gets track adv
                $players = $this->getPlayersWithLeastResource('loan');
                foreach ($players as $i=> $p_id){
                    // give them all track advancement,
                    $this->game->Resource->getRailAdv($p_id, "event");
                }
                // make them multi-active, 
                $this->game->gamestate->setPlayersMultiactive($players);
                // go to new state (multi-active version of choose bonus).
                $this->game->gamestate->nextState( "track" );
                break;
            case EVT_LEAST_WORKER:
                $players = $this->getPlayersWithLeastResource('worker');
                $this->game->gamestate->setPlayersMultiactive($players);
                // go to state to choose to get bonus (worker) or pass 
                $this->game->gamestate->nextState( "bonus" );
                // go to new state (multi-active version of recieve bonus worker state).
                break;
            case EVT_INTEREST: //note: players can't pay off loans until end of game.
                $players = $this->getPlayersWithAtLeastOneResource('loan');
                foreach ($players as $i=> $p_id){
                    // send to new multi-active pay state, 
                    // with cost based upon amount of loans
                }
                break;
            case EVT_PAY_LOAN_FOOD: 
                    // send to new multi-active, 
                    // where players may trade and pay loans with food.
                    // should this happen here? or after auction? 
                    // may need to look at the rules for this one.
                    $this->game->gamestate->nextState( "pay_food" );
                break;
            case EVT_COPPER_COW_GET_GOLD:
                $players = array();
                $players_cow = $this->getPlayersWithAtLeastOneResource('cow');
                foreach($players_cow as $i => $p_id){
                    $players[$p_id] = 1;
                }
                $players_copper = $this->getPlayersWithAtLeastOneResource('copper');
                // for each player with a cow or copper, they recieve a gold.
                foreach($players_copper as $i => $p_id){
                    $players[$p_id] = 1;
                }
                foreach($players as $p_id=>$p){
                    $this->game->Resource->updateAndNotifyPayment($p_id, 'gold', 1, 'event');
                }
            break;
            case EVT_DEV_TRACK_VP3:

                break;
            case EVT_VP_FOR_WOOD:

                break;
            case EVT_SELL_NO_TRADE:

                break;
            case EVT_LEAST_BLD_TRACK:

                break;
            case EVT_IND_VP:

                break;
            case EVT_BLD_TAX_SILVER:

                break;
            case EVT_RES_ADV_TRACK:

                break;
        }
    }

    function getPlayersWithAtLeastOneResource($type){
        $players = array();
        $resources = $this->game->getCollectionFromDB( "SELECT `player_id`, `$type` FROM `resources` " );
        foreach ($resources as $p_id=> $player){
            if ($player[$type] > 0){
                $players[] = $p_id;
            }
        }
        return $players;
    }

    function getPlayersWithLeastResource($type){
        $leastPlayers = array();
        $leastValue = 0;
        $resources = $this->game->getCollectionFromDB( "SELECT `player_id`, `$type` FROM `resources` " );
        foreach ($resources as $p_id=> $player){
            if (empty($leastPlayers) || $player[$type]<$leastValue){
                $leastValue = $player[$type];
                $leastPlayers = array($p_id);
            } else if ($player[$type] == $leastValue){
                $leastPlayers[] = $p_id;
            }
        }
        return $leastPlayers;
    }
}