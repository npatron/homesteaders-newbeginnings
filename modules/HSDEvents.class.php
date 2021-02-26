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
        $this->game->DbQuery("DELETE FROM `auctions`");
        $sql = "INSERT INTO `auctions` (`auction_id`, `position`, `location`) VALUES ";
        $values=array();
        
        $settlement = range(71, 80);
        shuffle($settlement);
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

    function updateEvent($round_number){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return;
        $this->game->setGameStateValue('current_event', $this->getEvent($round_number));
    }
    
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
     * material events_info `all_b`
     */
    function eventPhase(){
        return $this->eventHaskey('auc');
    }

    /**
     * Is the current event in event phase?
     * bool true on yes, false on no.
     * material events_info `all_b`
     */
    function eventAuction1(){
        if (!$this->auctionPhase()) return false;
        return (count($this->game->events_info[$this->game->getGameStateValue('current_event')]['auc'])==1);
    }

    /**
     * does the current event affect the auction phase?
     * bool true on yes, false on no.
     * material events_info `all_b`
     */
    function auctionPhase(){
        return $this->eventHaskey('auc');
    }

    /**
     * Does the current event affect auction pass action?
     * bool true on yes, false on no.
     * material events_info `all_b`
     */
    function passPhase(){
        return $this->eventHaskey('pass');
    }

    /**
     * Does the current event affect auction pass action?
     * bool true on yes, false on no.
     * material events_info `all_b`
     */
    function eventHaskey($key){
        $value = $this->game->getGameStateValue('new_beginning_evt');
        if ($value == DISABLED) return false;
        $event_id = $this->game->getGameStateValue('current_event');
        return array_key_exists($key, $this->game->events_info[$event_id]);
    }
}