<?php

/*
 * HSDBuilding: a class that handles building related actions.
 */
class HSDResource extends APP_GameClass
{
    
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    ////// RESOURCE DB MANIPULATION //////

    function getPlayerResourceAmount($p_id, $type){
        return $this->game->getUniqueValueFromDB("SELECT `$type` FROM `resources` WHERE `player_id`='$p_id'");
    }

    function getResources(){
        if ($this->game->getShowPlayerInfo()){
            return $this->game->getCollectionFromDB( "SELECT `player_id` p_id, `workers`, `track`, `silver`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources`" );
        } else {
            return $this->game->getCollectionFromDB("SELECT `player_id` p_id, `workers`, `track` FROM `resources` " );
        }
    }
    
    /**
     * This will NOT notify the player only for use when notification has already happened (workers), track, loan, 
     * updating the trackers: bid_loc, rail_adv, 
     */
    function updateResource($p_id, $type, $amount){
        $this->game->DbQuery( "UPDATE `resources` SET `$type`=$type + $amount WHERE `player_id`= '$p_id'");
    }

    // Payment toggles, (for pay states).
    function getPaid($p_id){
        return $this->game->getUniqueValueFromDB( "SELECT `has_paid` FROM `player` WHERE `player_id`='$p_id'" ); 
    }

    function setPaid($p_id, $val=1){
        $this->game->DbQuery( "UPDATE `player` SET `has_paid`='$val' WHERE `player_id`='$p_id'");
    }

    function clearPaid(){
        $this->game->DbQuery( "UPDATE `player` SET `has_paid`='0' ");
    }

    // payment toggles, (for income)
    function getIncomePaid($p_id){
        return $this->game->getUniqueValueFromDB( "SELECT `recieve_inc` FROM `player` WHERE `player_id`='$p_id'" ); 
    }

    function setIncomePaid($p_id, $val=1){
        $this->game->DbQuery( "UPDATE `player` SET `recieve_inc`='$val' WHERE `player_id`='$p_id'");
    }

    function clearIncomePaid(){
        $this->game->DbQuery( "UPDATE `player` SET `recieve_inc`='0' ");
    }

    ///// COST related Functions /////
    /**
     * basic getter function
     */
    function getCost($p_id){
        return $this->game->getUniqueValueFromDB( "SELECT `cost` FROM `player` WHERE `player_id`='$p_id'" ); 
    }
    
    /**
     * basic setter function.
     * Sets the cost for player with p_id to cost (in silver).
     */
    function setCost($p_id, $cost){
        $this->game->DbQuery( "UPDATE `player` SET `cost`='$cost' WHERE `player_id`='$p_id'");
    }
    /** 
     * sets all costs to 0.
     */
    function clearCost(){
        $this->game->DbQuery( "UPDATE `player` SET `cost`='0' ");
    }

    ////// RESOURCE CLIENT & DB MANIPULATION //////
    /**
     * p_id - player id
     * $type - 'resource type' as string
     * $amount - amount of resource to recieve. 
     * $reason_string => reason_string value
     * $origin => 'building' for building, 'auction' for auction (these are used for moving tokens)
     * $key  => building_key or auction_no.
     */
    function updateAndNotifyIncome($p_id, $type, $amt =1, $reason_string = "", $origin="", $key = 0){
        $values = array('player_id' => $p_id,
            'type' => $type, 
            'amount'=>$amt,
            'player_name' => $this->game->getPlayerName($p_id),
            'reason_string' => $reason_string,
            'preserve' => [ 2 =>'amount' ],);
        $values = $this->updateArrForNotify($values, $origin, $key);
        $this->game->notifyAllPlayers( "playerIncome", clienttranslate( '${reason_string} earned ${player_name} ${type}' ), $values );
        if (in_array($type, $this->game->resource_map)){
            $this->updateResource($p_id, $type, $amt);
            $this->game->Log->updateResource($p_id, $type, $amt);
        } else { // handle 'vp2' 'vp4', 'vp8' and other special tokens I want to display in log.
            $actual_type = array_keys($this->game->special_resource_map[$type])[0];
            $amount = $amt * $this->game->special_resource_map[$type][$actual_type];
            $this->updateResource($p_id, $actual_type, $amount);
            $this->game->Log->updateResource($p_id, $actual_type, $amount);
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    /**
     * p_id - player id
     * $income_arr -> array with the following values {
     *  'key'  => building_key or auction_no.
     *  'reason_string' => reason_string value
     *  'origin' => 'building' for building, 'auction' for auction
     *  'resource_type' => value, example: 'silver' => 2, 'gold'=> 1
     * }
     */
    function updateAndNotifyIncomeGroup($p_id, $income_arr, $reason_string="", $origin="", $key =0){
        if(count($income_arr) >1){
            $values = array('player_id' => $p_id,
                'resource_arr' => $income_arr,
                'resources' =>clienttranslate('resources'),
                'player_name' => $this->game->getPlayerName($p_id),
                'reason_string' => $reason_string,
                'preserve' => [ 2 =>'resource_arr' ],);
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( 'playerIncomeGroup', clienttranslate( '${reason_string} earned ${player_name} ${resources}' ), $values);
            foreach( $income_arr as $type => $amt ){
                if (in_array($type, $this->game->resource_map)){
                    $this->updateResource($p_id, $type, $amt);
                    $this->game->Log->updateResource($p_id, $type, $amt);
                } else { // handle 'vp2' 'vp4', 'vp8' and other special tokens I want to display in log.
                    $actual_type = array_keys($this->game->special_resource_map[$type])[0];
                    $amount = $amt * $this->game->special_resource_map[$type][$actual_type];
                    $this->updateResource($p_id, $actual_type, $amount);
                    $this->game->Log->updateResource($p_id, $actual_type, $amount);
                }
            }
            $this->game->Score->updatePlayerScore($p_id);
        } else if (count($income_arr) == 1) {
            $type = array_keys($income_arr)[0];
            $this->updateAndNotifyIncome($p_id, $type, $income_arr[$type], $reason_string, $origin, $key);
        }
    }

    /**
     * p_id - player id
     * $type - 'resource type' as string
     * $amount - amount of resource to pay. 
     * $reason_string => reason_string value
     * $origin => 'building' for building, 'auction' for auction
     * $key  => building_key or auction_no.
     */
    function updateAndNotifyPayment($p_id, $type, $amount =1, $reason_string = "", $origin="", $key = 0){
        $values = array('player_id' => $p_id,
            'type' => $type, 
            'amount'=>$amount,
            'player_name' => $this->game->getPlayerName($p_id),
            'reason_string' => $reason_string,
            'preserve' => [2=>'amount'],);
        $values = $this->updateArrForNotify($values, $origin, $key);
        $this->game->notifyAllPlayers( "playerPayment", clienttranslate( '${reason_string} cost ${player_name} ${type}' ), $values );
        $this->updateResource($p_id, $type, -$amount);
        $this->game->Log->updateResource($p_id, $type, -$amount);
        $this->game->Score->updatePlayerScore($p_id);
    }

    /**
     * p_id - player id
     * $income_arr - array with keys of 'resource type' with value for amount.
     * $reason_string => reason_string value
     * $origin => 'building' for building, 'auction' for auction, etc
     * $key  => building_key or auction_no.
     */
    function updateAndNotifyPaymentGroup($p_id, $payment_arr, $reason_string = "", $origin="", $key = 0){
        if(count($payment_arr) >1){
            $values = array('player_id' => $p_id,
                        'resource_arr' => $payment_arr,
                        'resources' => clienttranslate('resources'),
                        'player_name' => $this->game->getPlayerName($p_id),
                        'reason_string' => $reason_string,
                        'preserve' => [ 2 =>'resource_arr' ]);
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( 'playerPaymentGroup', clienttranslate( '${reason_string} cost ${player_name} ${resources}' ), $values);
            foreach( $payment_arr as $type => $amt ){
                if ($amt != 0){
                    $this->updateResource($p_id, $type, -$amt);
                    $this->game->Log->updateResource($p_id, $type, -$amt);
                }
            }
            $this->game->Score->updatePlayerScore($p_id);
        } else if (count($payment_arr) == 1) {
            $type = array_keys($payment_arr)[0];
            $this->updateAndNotifyPayment($p_id, $type, $payment_arr[$type], $reason_string, $origin, $key);
        }
    }

    ////// RESOURCE CLIENT AND DB MANIPULATION (continued) //////
    /**
     * Add worker for player 
     *  - new row in TABLE `workers` 
     *  - increment TABLE `resource`  
     *  will also post the reason to log, 
     *  which will add it to clients  
     */
    function addWorkerAndNotify($p_id, $reason_string, $origin="", $key=0){
        $w_key = $this->addWorker($p_id);
        if($this->game->Building->doesPlayerOwnBuilding($p_id, BLD_HOTEL)){
            $this->updateAndNotifyIncome($p_id, 'silver', 1, 
                        $this->game->Building->getBuildingNameFromId(BLD_HOTEL), 'building', 
                        $this->game->Building->getKeyOfPlayersBuilding($p_id, BLD_HOTEL));
        }
        if ($reason_string == 'hire'){
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a ${worker}' ), array(
                'player_id' => $p_id,
                'player_name' => $this->game->getPlayerName($p_id),
                'worker' => clienttranslate('worker'),
                'worker_key'=>$w_key,
            ));
        } else {
            $values = array('player_id' => $p_id,
                    'player_name' => $this->game->getPlayerName($p_id),
                    'worker' => clienttranslate('worker'),
                    'reason_string' => $reason_string,
                    'worker_key'=> $w_key); 
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a ${worker} from ${reason_string}' ), $values);
        }
    }
    /**
     * Add worker for player 
     *  - new row in TABLE `workers` 
     *  - increment TABLE `resource`  
     */
    function addWorker($p_id){
        $this->game->DbQuery( "INSERT INTO `workers` (`player_id`) VALUES (".$p_id.")" );
        $player_workers = $this->game->getObjectListFromDB( "SELECT `worker_key` FROM `workers` WHERE `player_id`='".$p_id."'" );
        $w_key = $player_workers[count($player_workers)-1]['worker_key'];
        $this->updateResource($p_id, 'workers', 1);
        $this->game->Log->addWorker($p_id, $w_key);
        $this->game->Score->updatePlayerScore($p_id);
        return $w_key;
    }

    /**
     * Add track for player 
     *  - new row in TABLE `tracks` 
     *  - increment TABLE `resource`  
     *  will also post the reason to log, 
     *  which will add it to clients 
     */
    function addTrackAndNotify($p_id, $reason_string, $origin="", $key = 0){
        $track_key = $this->addTrack($p_id);
        $values = array('player_id' => $p_id,
                    'player_name' => $this->game->getPlayerName($p_id),
                    'track' => clienttranslate('track'),
                    'reason_string' => $reason_string,
                    'track_key'=> $track_key, );
        $values = $this->updateArrForNotify($values, $origin, $key);                
        $this->game->notifyAllPlayers( "gainTrack", clienttranslate( '${player_name} receives ${track} from ${reason_string}' ), $values);
    }
    /**
     * Add track for player 
     *  - new row in TABLE `tracks` 
     *  - increment TABLE `resource`
     * returns track_key (in table)
     */
    function addTrack($p_id){
        $this->game->DbQuery( "INSERT INTO `tracks` (`player_id`) VALUES ($p_id)" );
        $p_tracks = $this->game->getObjectListFromDB( "SELECT `rail_key` FROM `tracks` WHERE `player_id`='$p_id'" );
        $track_key = $p_tracks[count($p_tracks)-1]['rail_key'];
        $this->updateResource($p_id, 'track', 1);
        $this->game->Log->addTrack($p_id, $track_key);
        $this->game->Score->updatePlayerScore($p_id);
        return $track_key;
    }
    
    function updateArrForNotify($values, $origin, $key){
        if ($origin === 'building'){
            $values['origin'] = $origin;
            $values['key'] = $key;
            $values['b_type'] = $this->game->Building->getBuildingTypeFromKey($key);
            if (!array_key_exists('preserve', $values)){
                $values['preserve'] = [];
            }
            $values['preserve'][4] = 'origin'; 
            $values['preserve'][5] = 'b_type';
            $values['preserve'][6] = 'key';
            $values['reason_string'] = $values['reason_string'];
        } else if ($origin === 'auction'){
            $values['origin'] = $origin;
            $values['key'] = $key;
            if (!array_key_exists('preserve', $values)){
                $values['preserve'] = [];
            }
            $values['preserve'][4] = 'origin';
            $values['preserve'][5] = 'key';
        } else if ($origin === 'train'){
            $values['origin'] = $origin;
            if (!array_key_exists('preserve', $values)){
                $values['preserve'] = [];
            }
            $values['preserve'][3] = 'player_id';
        } else if ($origin === 'bid'){
            $values['origin'] = $origin;
            if (!array_key_exists('preserve', $values)){
                $values['preserve'] = [];
            }
            $values['preserve'][3] = 'player_id';
        } else if ($origin === 'event'){
            $values['origin'] = $origin;
            if (!array_key_exists('preserve', $values)){
                $values['preserve'] = [];
            }
            $values['preserve'][3] = 'player_id';
        }
        return $values;
    }

    /** updates the client for round 11, to show all player resources */
    function updateClientResources() {
        $this->game->notifyAllPlayers( "showResources", clienttranslate("Showing all player resources for final round"), 
        array( 'resources' => $this->getResources()));
    }

    function pay4Loans($p_id, $reason, $origin='', $key=0){
        $playerLoan = $this->game->getUniqueValueFromDb("SELECT `loan` FROM `resources` WHERE `player_id`='".$p_id."'");
        $amtPaidOff = min(4, $playerLoan);
        $amtSilverGain = (int) (4-$amtPaidOff) * 2;
        for ($i = 1; $i <= $amtPaidOff; $i++) {
            $this->game->Log->payOffLoan($p_id);
            $this->updateResource ($p_id, 'loan', -1);
        }
        if ($amtSilverGain>0){
            $this->updateResource ($p_id, 'silver', $amtSilverGain);
            $this->game->Log->updateResource($p_id, 'silver', $amtSilverGain);
        }
        $changeArr = array('silver'=>$amtSilverGain, 'loan'=>-$amtPaidOff);
        $values = array('player_id' => $p_id,
                        'player_name' => $this->game->getPlayerName($p_id),
                        'resources' =>clienttranslate('resources'),
                        'resource_arr' => $changeArr,
                        'reason_string' => $reason,
                        'preserve' => array( 2=> 'resource_arr' ),);
        $values = $this->updateArrForNotify($values, $origin, $key);
        $this->game->notifyAllPlayers( "auctionLoanPaid", clienttranslate( '${reason_string} paid ${player_name} ${resources}' ), $values);
        $this->game->Score->updatePlayerScore($p_id);
    }

    /** 
     * Helper method to allow automating income of payLoan
     * to force player to get 2 silver if have no loan to payoff
     * Bank income, and Build Bonus for Boarding House, but there are additional options from expansion.
     */
    function payLoanOrReceiveSilver($p_id, $reason_string, $origin='',$key=0){
        $playerLoan = $this->game->getUniqueValueFromDb("SELECT `loan` FROM `resources` WHERE `player_id`='".$p_id."'");
        if ($playerLoan== 0){
            $this->updateAndNotifyIncome($p_id, 'silver', 2, $reason_string, $origin, $key);
        } else {
            $this->freePayOffLoan($p_id, $reason_string, $origin, $key);
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    function takeLoan($p_id){
        $this->game->notifyAllPlayers( "loanTaken", clienttranslate( '${player_name} takes a ${loan}' ), array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'loan' => clienttranslate('debt'),
          ) );

        $this->updateResource($p_id, 'silver', 2);
        $this->updateResource($p_id, 'loan', 1);
        $this->game->Log->takeLoan($p_id);
        $this->game->Score->updatePlayerScore($p_id);
    }

    function payOffLoan($p_id, $gold){
        if ($gold) {
            $type = 'gold';
            $amt = 1;
        } else {
            $type = 'silver';
            $amt = 5;
        }
        if (!$this->canPlayerAfford($p_id, array($type=>$amt))){
            throw new BgaUserException( sprintf(clienttranslate("You do not have enough %s"), $this->game->resource_info[$type]['name']) );
        }
        if (!$this->canPlayerAfford($p_id, array('loan'=>1))){
            throw new BgaUserException( clienttranslate("You have no DEBT to pay" ) );
        }
        $this->game->notifyAllPlayers( "loanPaid", clienttranslate( '${player_name} pays ${loan} ${arrow} ${type}' ), array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'loan' => clienttranslate('debt'),
            'arrow' => '->',
            'type' => $type,
            'amount' => $amt,
            'preserve' => array( 2=> 'amount' ),
          ) );

        $this->updateResource ($p_id, $type, -$amt);
        $this->updateResource ($p_id, 'loan', -1);
        $this->game->Log->payOffLoan($p_id, $type, $amt); 
        $this->game->Score->updatePlayerScore($p_id);
    }

    function freePayOffLoan($p_id, $reason, $origin ="", $key =0)
    {
        $values = array(  'player_id' => $p_id,
                      'player_name' => $this->game->getPlayerName($p_id),                  
                      'reason_string' => $reason,
                      'loan' => clienttranslate('debt'),);
        $values = $this->updateArrForNotify($values, $origin, $key);
        $this->game->notifyAllPlayers( "loanPaid", clienttranslate( '${reason_string} pays off ${player_name}\'s ${loan}' ), $values);

        $this->updateResource ($p_id, 'loan', -1);
        $this->game->Log->payOffLoan($p_id);
        $this->game->Score->updatePlayerScore($p_id);
    }

    /////// RAIL ADVANCEMENT METHODS /////

    function getRailAdvBonusOptions($player_id){
        $sql = "SELECT `rail_adv` FROM `player` WHERE `player_id`='".$player_id."'";
        $rail_adv = $this->game->getUniqueValueFromDB( $sql );
        $options = array();
        $options[] = TRADE; 
        if($rail_adv > 1){
            $options[] = TRACK; 
        } 
        if($rail_adv > 2){
            $options[] = WORKER;
        }  
        if($rail_adv > 3){
            $options[] = WOOD;
            $options[] = FOOD;
            $options[] = STEEL;
            $options[] = GOLD;
            $options[] = COPPER;
            $options[] = COW;
        } 
        if($rail_adv > 4){
            $options[] = VP;
        }
        return $options; 
    }

    function receiveRailBonus($p_id, $selected_bonus){
        switch ($selected_bonus){
            case WORKER:
                $this->addWorkerAndNotify($p_id, 'train', 'train');
            break;
            case TRACK:
                $this->addTrackAndNotify($p_id, 'train', 'train');
            break;
            case TRADE:
                $this->updateAndNotifyIncome($p_id, 'trade', 1, 'train', 'train');
            break;
            case WOOD:
                $this->updateAndNotifyIncome($p_id, 'wood', 1, 'train', 'train');
            break;
            case FOOD:
                $this->updateAndNotifyIncome($p_id, 'food', 1, 'train', 'train');
            break;
            case STEEL:
                $this->updateAndNotifyIncome($p_id, 'steel', 1, 'train', 'train');
            break;
            case GOLD:
                $this->updateAndNotifyIncome($p_id, 'gold', 1, 'train', 'train');
            break;
            case COPPER:
                $this->updateAndNotifyIncome($p_id, 'copper', 1, 'train', 'train');
            break;
            case COW:
                $this->updateAndNotifyIncome($p_id, 'cow', 1, 'train', 'train');
            break;
            case VP:
                $this->updateAndNotifyIncome($p_id, 'vp3', 1, 'train', 'train');
            break;
        }
    }

    function canPlayerAfford($p_id, $r_arr){
        $sql = "SELECT `silver`, `wood`, `food`, `steel`, `gold`, `copper`, `cow`, `loan`, `trade`, `vp` FROM `resources` WHERE `player_id` ='".$p_id."'";
        $p_resources = $this->game->getObjectFromDB($sql);
        $enough = true;
        foreach( $r_arr as $key => $resource){
            $enough = $enough && ($p_resources[$key] >= $resource);  
        }
        return $enough;
    }
    
    function collectIncome($p_id, $warehouse) 
    {
        $has_been_paid = $this->getIncomePaid($p_id);
        if ($has_been_paid==0){
            $this->setIncomePaid($p_id);
            $p_tracks = $this->game->getUniqueValueFromDB( "SELECT COUNT(*) FROM `tracks` WHERE `player_id`='$p_id'" ); 
            $this->game->Building->buildingIncomeForPlayer( $p_id, $warehouse );
            if($p_tracks > 0) {
                $this->updateAndNotifyIncome($p_id, 'silver', $p_tracks, 'track');
            }
        }
    }

    function getRailAdv($p_id, $reason_string="", $origin="", $key=0) {
        $rail_adv = $this->game->getUniqueValueFromDB( "SELECT `rail_adv` FROM `player` WHERE `player_id`='$p_id'" );
        if ($rail_adv < 5){
            $rail_adv++;
            $this->game->DbQuery( "UPDATE `player` SET rail_adv='$rail_adv' WHERE `player_id`='$p_id'" );
            $values = array('player_id' => $p_id,
                            'player_name' => $this->game->getPlayerName($p_id),
                            'train' => 'train',
                            'rail_destination' => $rail_adv,
                            'reason_string' => $reason_string,
                            'preserve' => [2 =>'player_id'],);
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( "railAdv", clienttranslate( '${player_name} advances their ${train} from ${reason_string}' ), $values);
            $this->game->Log->railAdvance($p_id);
        }
    }

    function pay($p_id, $silver, $gold, $reason_string, $key=0){
        $cost = array('gold'=>$gold, 'silver'=>$silver);
        if (!$this->canPlayerAfford($p_id, $cost)){
            throw new BgaUserException( clienttranslate("Not enough resources. Take loan(s) or trade") );
        }
        if ($key != 0){
            $this->updateAndNotifyPaymentGroup($p_id, $cost, $reason_string, 'auction', $key);
        } else {
            $this->updateAndNotifyPaymentGroup($p_id, $cost, $reason_string);
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    // allows 1 notification for trades for auction trades, 
    // (for tracks or vp2, vp4, vp6 etc).
    function specialTrade($p_id, $cost_arr, $income_arr, $reason_string, $origin="", $key=0){
        $p_name = $this->game->getPlayerName($p_id);
        if (!$this->canPlayerAfford($p_id, $cost_arr)){
            throw new BgaUserException( clienttranslate("Not enough resources. Take loan(s) or trade") );
        }
        if (array_key_exists('track', $income_arr)){
            $track_key = $this->addTrack($p_id);
            $values = array('player_id' => $p_id,
                    'player_name' => $this->game->getPlayerName($p_id),
                    'track' => 'track',
                    'reason_string' => $reason_string,
                    'track_key'=> $track_key, 
                    'tradeAway' => clienttranslate('resources'),
                    'tradeAway_arr' =>$cost_arr,
                    'arrow' => '->',
                    'preserve' => [2 => 'tradeAway_arr']);
            $values = $this->updateArrForNotify($values, $origin, $key); 
            $this->game->notifyAllPlayers( "gainTrack", 
                    clienttranslate('${player_name} trades ${tradeAway} ${arrow} ${track} from ${reason_string}'), $values);
            foreach ($cost_arr as $type=>$amt){
                $this->updateResource($p_id, $type, -$amt);
                $this->game->Log->updateResource($p_id, $type, -$amt);
            }
        } else {
            $values = array('player_id' => $p_id,   'player_name' => $p_name,
                        'tradeAway' => clienttranslate('resources'), 'tradeAway_arr' => $cost_arr,   
                        'tradeFor' => clienttranslate('resources'), 'tradeFor_arr'  =>$income_arr,
                        'arrow' => '->',         'reason_string' => $reason_string,
                        'preserve' => [2=>'tradeAway_arr', 3=> 'tradeFor_arr']);
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( "trade", clienttranslate('${player_name} trades ${tradeAway} ${arrow} ${tradeFor} from ${reason_string}'), $values);
            foreach($cost_arr as $type=>$amt){
                $this->updateResource($p_id, $type, -$amt);
            }
            $log_inc_arr = array();
            foreach($income_arr as $type=>$amt){
                if ($type === 'vp4'){
                    $this->updateResource($p_id, 'vp', 4);
                    $log_inc_arr = $this->updateKeyOrCreate($log_inc_arr, 'vp', 4);
                } else if ($type === 'vp2'){
                    $this->updateResource($p_id, 'vp', 2);
                    $log_inc_arr = $this->updateKeyOrCreate($log_inc_arr, 'vp', 2);
                } else {
                    $this->updateResource($p_id, $type, $amt);
                    $log_inc_arr[$type] = $amt;
                }
            }
            $this->game->Log->tradeResource($p_id, $cost_arr, $log_inc_arr);
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    // updates will need to be applied by `$this->game->Log->triggerHiddenTransactions()` when all players done.
    function hiddenTrade($p_id, $tradeAction){
        $this->game->Log->hiddenTrade($p_id, $tradeAction);
        $tradeValues = $this->getTradeValues($p_id, $tradeAction, true);
        // only notify this player, but don't update resources until later.
        $this->game->notifyPlayer($p_id, 'hiddenTrade', $tradeValues['message'].clienttranslate(" (hidden)"), $tradeValues['args']);
    }

    function trade($p_id, $tradeAction) {
        //self::dump("tradeAction $p_id",$tradeAction);
        $tradeValues = $this->getTradeValues($p_id, $tradeAction);
        //self::dump('tradeValues',$tradeValues);
        if ($tradeValues['transaction']==='loanTaken'){
            $this->game->Log->takeLoan($p_id);
            $this->updateResource($p_id, 'silver', 2);
            $this->updateResource($p_id, 'loan', 1);
        } else if ($tradeValues['transaction']==='loanPaid'){
            $type = array_keys($tradeValues['tradeAway'])[0];
            $amt = $tradeValues['tradeAway'][$type];
            $this->game->Log->payOffLoan($p_id, $type, $amt); 
            $this->updateResource($p_id, $type, -($amt));
            $this->updateResource($p_id, 'loan', -1);
        } else {
            $this->game->Log->tradeResource($p_id, $tradeValues['tradeAway'], $tradeValues['tradeFor']);
            foreach($tradeValues['tradeAway'] as $type=>$amt){
                $this->updateResource($p_id, $type, -$amt);
            }
            foreach($tradeValues['tradeFor'] as $type=>$amt){
                $this->updateResource($p_id, $type, $amt);
            }
        }
        $this->game->notifyAllPlayers($tradeValues['transaction'], $tradeValues['message'], $tradeValues['args']);
        $this->game->Score->updatePlayerScore($p_id);
    }
    
    function getTradeValues($p_id, $tradeAction, $ignore_afford= false){
        $p_name = $this->game->getPlayerName($p_id);
        // default trade amounts
        $tradeAway = array('trade'=>1);
        $tradeFor = array ();
        $sell = false;
        $b_id = 0;
        $tradeAct_segs = explode('_',$tradeAction);
        switch($tradeAct_segs[0]){
            case 'buy':
                $type = $tradeAct_segs[1];
                $tradeAway = array_merge($tradeAway, 
                    $this->game->resource_info[$type]['trade_val']);
                $tradeFor[$type] = 1;
                $tradeType= $type;
            break;
            case 'sell':
                $type = $tradeAct_segs[1];
                $tradeAway[$type] = 1;
                $tradeFor = $this->game->resource_info[$type]['trade_val'];
                $tradeFor['vp'] = 1;
                $tradeType = $type;
                $sell = true;
            break;
            case 'sellfree':
                $type = $tradeAct_segs[1];
                $tradeAway = array($type=>1);
                $tradeFor = $this->game->resource_info[$type]['trade_val'];
                $tradeFor['vp'] = 1;
                $tradeType = $type;
                $sell = true;
            break;
            case 'market':
                $type = $tradeAct_segs[1];//food or steel
                $b_id = BLD_MARKET;
                $tradeAway = array_merge($tradeAway, $this->game->resource_info[$type]['market']);
                $tradeFor[$type] = 1;
                $tradeType = $type;
            break;
            case 'bank':
                $b_id = BLD_BANK;
                $tradeFor['silver'] = 1;
                $tradeType = 'silver';
            break;
            case 'loan':
                return (array(
                    'transaction'=>"loanTaken", 
                    'message'=> clienttranslate( '${player_name} takes a ${loan}' ),
                    'args'=>array('player_id' => $p_id,
                                'player_name' => $this->game->getPlayerName($p_id),
                                'loan' => 'debt'),
                    'tradeFor'=>array('silver'=>2,'loan'=>1),
                    'tradeAway'=>array()));
            case 'payLoan':
                switch($tradeAct_segs[1]){
                    case 'gold':
                        $type = 'gold';
                        $amt = 1;
                        break;
                    case 'silver':
                        $type = 'silver';
                        $amt = 5;
                        break;
                    case '3silver':
                        $type = 'silver';
                        $amt = 3;
                        break;
                    case 'food':
                        $type = 'food';
                        $amt = 1;
                        break;
                    default:
                        throw new BgaVisibleSystemException ( sprintf(clienttranslate('Invalid TradeAction: %s'),$tradeAction));
                }
                if (!$this->canPlayerAfford($p_id, array($type=>$amt)) && !$ignore_afford){
                    throw new BgaUserException( clienttranslate("You cannot afford to make this trade") );
                }
                if (!$this->canPlayerAfford($p_id, array('loan'=>1)) && !$ignore_afford){
                    throw new BgaUserException( clienttranslate("You have no DEBT to pay" ) );
                }    
                return (
                    array(  
                        'transaction'=>"loanPaid", 
                        'message'=> clienttranslate( '${player_name} pays ${loan} ${arrow} ${type}'),
                        'args'=>array('player_id' => $p_id, 
                                    'player_name' => $this->game->getPlayerName($p_id),
                                    'loan' => clienttranslate('debt'), 
                                    'arrow' => '->',
                                    'type' => $type, 
                                    'amount'=>$amt,
                                    'preserve' => [2=>'amount']),
                        'tradeFor'=>array('loan'=> -1), 
                        'tradeAway'=>array($type=> $amt)));
            default: 
            throw new BgaVisibleSystemException ( sprintf(clienttranslate('Invalid TradeAction: %s'),$tradeAction));
        }
        if (!$this->canPlayerAfford($p_id, $tradeAway) && !$ignore_afford){
            throw new BgaUserException( clienttranslate("You cannot afford to make this trade") );
        }
        if ($sell && $this->game->Building->doesPlayerOwnBuilding($p_id, BLD_GENERAL_STORE)){
            $tradeFor = $this->updateKeyOrCreate($tradeFor, 'silver', 1);
        }
        $buy_sell = ($sell? clienttranslate('sell'): clienttranslate("buy"));
        if ($b_id === 0){
            $message = clienttranslate('${player_name} ${buy_sell} ${resource}');
            $args = array(  'player_id' => $p_id,           'player_name' => $p_name,
                            'tradeAway_arr' => $tradeAway,  'tradeFor_arr' => $tradeFor,
                            'buy_sell'  => $buy_sell,       'resource' => $this->game->resource_info[$tradeType]['name'],
                            'preserve'=> [3=>'tradeAway_arr', 4=>'tradeFor_arr'], );
        } else {
            $message = clienttranslate('${player_name} trades with ${building_name} ${resource}');
            $args = array(  'player_id' => $p_id,            'player_name' => $p_name,
                            'tradeAway_arr' => $tradeAway,   'tradeFor_arr' => $tradeFor,
                            'building_name'=> $this->game->Building->getBuildingNameFromId($b_id),
                            'resource' => $this->game->resource_info[$tradeType]['name'],
                            'b_type'=> $this->game->Building->getBuildingTypeFromId($b_id),
                            'preserve'=> [2=>'b_type', 3=>'tradeAway_arr', 4=>'tradeFor_arr'], );
        }
        return array('transaction'=> 'trade', 
                    'message'=> $message, 
                    'args'=> $args, 
                    'tradeFor'=> $tradeFor,
                    'tradeAway'=> $tradeAway);
    }

    /**
     * returns an updated array $arr by adding $amt to existing $key, 
     * or creating $key (with value $amt) (if not exists)
     * @var arr array to update and return
     * @var key position in array to update
     * @var amt integer number to add or update value to
     */
    function updateKeyOrCreate($arr, $key, $amt = 1){
        if (array_key_exists($key, $arr)){
            $arr[$key] += $amt;
        } else {
            $arr[$key] =  $amt;
        }
        return $arr;
    }

    /**
     * replacing cost using building replacement abilities
     * River_Port -> gold as cow/copper.
     * Lumber_Mill -> lumber+vp as steel.
     * $type must be key in material.inc.php->costReplace or this will fail.
     */ 
    function costReplace($arr, $type, $amt){
        $cost_replace = $this->game->costReplace[$type];
        // remove $amt from $type
        $arr[$type] -= $amt;
        if ($arr[$type]==0){
            unset($arr[$type]);
        }
        // add in (amt * replacement) costs to arr
        foreach($cost_replace as $r_type=>$r_amt){
            $arr = $this->updateKeyOrCreate($arr, $r_type, ($r_amt * $amt));
        }
        return $arr;
    }

}