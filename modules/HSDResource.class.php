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
     * This will NOT notify the player only for use when notification has already happened (workers), drack, loan, 
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

    function getCost($p_id){
        return $this->game->getUniqueValueFromDB( "SELECT `cost` FROM `player` WHERE `player_id`='$p_id'" ); 
    }
    
    /**
     * Sets the cost for player with p_id to cost (in silver).
     */
    function setCost($p_id, $cost){
        $this->game->DbQuery( "UPDATE `player` SET `cost`='$cost' WHERE `player_id`='$p_id'");
    }
    
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
            'type' => array('type'=>$type, 'amount'=>$amt),
            'player_name' => $this->game->getPlayerName($p_id),
            'reason_string' => $reason_string,);
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
                'resources' => $income_arr,
                'player_name' => $this->game->getPlayerName($p_id),
                'reason_string' => $reason_string);
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
            'type' => array('type'=>$type, 'amount'=>$amount),
            'player_name' => $this->game->getPlayerName($p_id),
            'reason_string' => $reason_string,);
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
                        'resources' => $payment_arr,
                        'player_name' => $this->game->getPlayerName($p_id),
                        'reason_string' => $reason_string);
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
    function addWorker($p_id, $reason_string, $origin="", $key=0){
        $sql = "INSERT INTO `workers` (`player_id`) VALUES (".$p_id.")";
        $this->game->DbQuery( $sql );
        $sql = "SELECT `worker_key` FROM `workers` WHERE `player_id`='".$p_id."'";
        $player_workers = $this->game->getObjectListFromDB( $sql );
        $w_key = $player_workers[count($player_workers)-1]['worker_key'];
        if ($reason_string == 'hire'){
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a ${type}' ), array(
                'player_id' => $p_id,
                'player_name' => $this->game->getPlayerName($p_id),
                'type' => 'worker',
                'worker_key'=>$w_key,
            ));
        } else {
            $values = array('player_id' => $p_id,
                    'player_name' => $this->game->getPlayerName($p_id),
                    'type' => 'worker',
                    'reason_string' => $reason_string,
                    'worker_key'=> $w_key); 
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( "gainWorker", clienttranslate( '${player_name} hires a ${type} as ${reason_string}' ), $values);
        }
        $this->game->Log->addWorker($p_id, $w_key);
        $this->updateResource($p_id, 'workers', 1);
        $this->game->Score->updatePlayerScore($p_id);
    }
    /**
     * Add worker for player 
     *  - new row in TABLE `tracks` 
     *  - increment TABLE `resource`  
     *  will also post the reason to log, 
     *  which will add it to clients 
     */
    function addTrack($p_id, $reason_string, $origin="", $key = 0){
        $this->game->DbQuery( "INSERT INTO `tracks` (`player_id`) VALUES ($p_id)" );
        $p_tracks = $this->game->getObjectListFromDB( "SELECT `rail_key` FROM `tracks` WHERE `player_id`='$p_id'" );
        $track_key = $p_tracks[count($p_tracks)-1]['rail_key'];
        $values = array('player_id' => $p_id,
                    'player_name' => $this->game->getPlayerName($p_id),
                    'track' => 'track',
                    'reason_string' => $reason_string,
                    'track_key'=> $track_key, );
        $values = $this->updateArrForNotify($values, $origin, $key);                
        $this->game->notifyAllPlayers( "gainTrack", clienttranslate( '${player_name} recieves ${track} from ${reason_string}' ), $values);
        $this->game->Log->addTrack($p_id, $track_key);
        $this->updateResource($p_id, 'track', 1);
        $this->game->Score->updatePlayerScore($p_id);
    }
    
    function updateArrForNotify($values, $origin, $key){
        if ($origin === 'building'){
            $values['origin'] = $origin;
            $values['key'] = $key;
            $values['reason_string'] = array('type'=>$this->game->Building->getBuildingTypeFromKey($key), 'str'=>$values['reason_string']);
        } else if ($origin === 'auction'){
            $values['origin'] = $origin;
            $values['key'] = $key;
            $values['reason_string'] = array('type'=>(10+$key),'str'=>$values['reason_string'] );
        }
        return $values;
    }

    /** updates the client for round 11, to show all player resources */
    function updateClientResources() {
        $this->game->notifyAllPlayers( "showResources", clienttranslate("Showing all player resources for final round"), array( 'resources' => $this->getResources()));
    }

    /** 
     * Helper method to allow automating income of payLoan
     * to force player to get 2 silver if have no loan to payoff
     * Bank income, and Build Bonus for Boarding House, but there are additional options from expansion.
     */
    function payLoanOrRecieveSilver($p_id, $reason_string, $origin='',$key=0){
        $playerLoan = $this->game->getUniqueValueFromDb("SELECT `loan` FROM `resources` WHERE `player_id`='".$p_id."'");
        if ($playerLoan== 0){
            $this->updateAndNotifyIncome($p_id, 'silver', 2, $reason_string, $origin, $key);
        } else {
            $this->freePayOffLoan($p_id, $reason_string, $origin, $key);
            $this->updateResource ($p_id, 'loan', -1);
            $this->game->Log->updateResource($p_id, 'loan', -1);
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    function takeLoan($p_id){
        $this->updateResource($p_id, 'silver', 2);
        $this->updateResource($p_id, 'loan', 1);
        $this->game->notifyAllPlayers( "loanTaken", clienttranslate( '${player_name} takes a ${loan}' ), array(
            'player_id' => $p_id,
            'player_name' => $this->game->getPlayerName($p_id),
            'loan' => 'loan',
          ) );
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
            'loan' => 'loan',
            'arrow' => 'arrow',
            'type' => array('type'=>$type, 'amount'=>$amt),
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
                      'loan' => 'loan',);
        $values = $this->updateArrForNotify($values, $origin, $key);
        $this->game->notifyAllPlayers( "loanPaid", clienttranslate( '${reason_string} buys ${player_name}\'s ${loan}' ), $values);
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

    function recieveRailBonus($p_id, $selected_bonus){
        $rail_bonus_arr = array('player_id'=>$p_id, 'token'=>'train');
        switch ($selected_bonus){
            case WORKER:
                $this->addWorker($p_id, $rail_bonus_arr, 'train');
            break;
            case TRACK:
                $this->addTrack($p_id, $rail_bonus_arr, 'train');
            break;
            case TRADE:
                $this->updateAndNotifyIncome($p_id, 'trade', 1, $rail_bonus_arr, 'train');
            break;
            case WOOD:
                $this->updateAndNotifyIncome($p_id, 'wood', 1, $rail_bonus_arr, 'train');
            break;
            case FOOD:
                $this->updateAndNotifyIncome($p_id, 'food', 1, $rail_bonus_arr, 'train');
            break;
            case STEEL:
                $this->updateAndNotifyIncome($p_id, 'steel', 1, $rail_bonus_arr, 'train');
            break;
            case GOLD:
                $this->updateAndNotifyIncome($p_id, 'gold', 1, $rail_bonus_arr, 'train');
            break;
            case COPPER:
                $this->updateAndNotifyIncome($p_id, 'copper', 1, $rail_bonus_arr, 'train');
            break;
            case COW:
                $this->updateAndNotifyIncome($p_id, 'cow', 1, $rail_bonus_arr, 'train');
            break;
            case VP:
                $this->updateAndNotifyIncome($p_id, 'vp3', 1, $rail_bonus_arr, 'train');
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
            $p_tracks = $this->game->getUniqueValueFromDB( "SELECT `track` FROM `resources` WHERE `player_id`='$p_id'" ); 
            $this->game->Building->buildingIncomeForPlayer( $p_id, $warehouse );
            if($p_tracks > 0) {
                $this->updateAndNotifyIncome($p_id, 'silver', $p_tracks, array('track'=>'track'));
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
                            'token' => array('token'=>'train', 'player_id'=>$p_id),
                            'rail_destination' => $rail_adv,
                            'reason_string' => $reason_string);
            $values = $this->updateArrForNotify($values, $origin, $key);
            $this->game->notifyAllPlayers( "railAdv", clienttranslate( '${player_name} advances their ${token} from ${reason_string}' ), $values);
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
            $this->updateAndNotifyPaymentGroup($p_id, $cost, array('worker'=>$reason_string));
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    // allows 1 notification for trades for auction trades, 
    // (for tracks or vp2, vp4, vp6 etc).
    function specialTrade($p_id, $cost_arr, $income_arr, $reason_string, $origin="", $key=0){
        $p_name = $this->game->getPlayerName($p_id);
        if (array_key_exists('track', $income_arr)){
            $this->game->DbQuery( "INSERT INTO `tracks` (`player_id`) VALUES ($p_id)" );
            $p_tracks = $this->game->getObjectListFromDB( "SELECT `rail_key` FROM `tracks` WHERE `player_id`='$p_id'" );
            $track_key = $p_tracks[count($p_tracks)-1]['rail_key'];
            $values = array('player_id' => $p_id,
                    'player_name' => $this->game->getPlayerName($p_id),
                    'track' => 'track',
                    'reason_string' => $reason_string,
                    'track_key'=> $track_key, 
                    'tradeAway' => $cost_arr,
                    'arrow' => 'arrow',);
            $values = $this->updateArrForNotify($values, $origin, $key); 
            $this->game->notifyAllPlayers( "gainTrack", 
                    clienttranslate('${player_name} trades ${tradeAway} ${arrow} ${track} from ${reason_string}'), $values);
            $this->updateResource($p_id, 'track', 1);
            $this->game->Log->addTrack($p_id, $track_key);
            foreach ($cost_arr as $type=>$amt){
                $this->updateResource($p_id, $type, -$amt);
                $this->game->Log->updateResource($p_id, $type, -$amt);
            }
        } else {
            $values = array('player_id' => $p_id,   'player_name' => $p_name,
                        'tradeAway' => $cost_arr,   'tradeFor' => $income_arr,
                        'arrow' => 'arrow',         'reason_string' => $reason_string,);
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

    function trade($p_id, $tradeAction) {
        $p_name = $this->game->getPlayerName($p_id);
        // default trade amounts
        $tradeAway = array('trade'=>1);
        $tradeFor = array ();
        $sell = false;
        $building_name = "";
        $tradeAct_segs = explode('_',$tradeAction);
        switch($tradeAct_segs[0]){
            case 'buy':
                $type = $tradeAct_segs[1];
                $tradeAway = array_merge($tradeAway, 
                    $this->game->resource_info[$type]['trade_val']);
                $tradeFor[$type] = 1;
            break;
            case 'sell':
                $type = $tradeAct_segs[1];
                $tradeAway[$type] = 1;
                $tradeFor = $this->game->resource_info[$type]['trade_val'];
                $tradeFor['vp'] = 1;
                $sell = true;
            break;
            case 'market':
                $type = $tradeAct_segs[1];//food or steel
                $building_name = array('str'=>'Market', 'type'=>TYPE_COMMERCIAL);
                $tradeAway = array_merge($tradeAway, $this->game->resource_info[$type]['market']);
                $tradeFor[$type] = 1;
            break;
            case 'bank':
                $building_name = array('str'=>'Bank', 'type'=>TYPE_COMMERCIAL);
                $tradeFor['silver'] = 1;
            break;
            case 'loan':
                $this->takeLoan($p_id);
                return;
            case 'payloan':
                return $this->payOffLoan($p_id, $tradeAct_segs[1] === 'gold');
            default: 
            throw new BgaVisibleSystemException ( sprintf(clienttranslate('Invalid TradeAction: %s'),$tradeAction));
        }
        if (!$this->canPlayerAfford($p_id, $tradeAway)){
            throw new BgaUserException( clienttranslate("You cannot afford to make this trade") );
        }
        if ($sell && $this->game->Building->doesPlayerOwnBuilding($p_id, BLD_GENERAL_STORE)){
            $tradeFor = $this->updateKeyOrCreate($tradeFor, 'silver', 1);
        }
        $buy_sell = ($sell? clienttranslate('sell'): clienttranslate("buy"));
        if ($building_name === ""){
            $this->game->notifyAllPlayers( "trade", '${player_name} ${buy_sell} ${tradeAway} ${arrow} ${tradeFor}', 
            array(  'player_id' => $p_id,               'player_name' => $p_name,
                    'tradeAway' => $tradeAway,          'tradeFor' => $tradeFor,
                    'buy_sell'  => $buy_sell,           'arrow' => 'arrow', ) );
        } else {
            $this->game->notifyAllPlayers( "trade", clienttranslate('${player_name} trades with ${building_name} ${tradeAway} ${arrow} ${tradeFor} '), 
            array(  'player_id' => $p_id,               'player_name' => $p_name,
                    'tradeAway' => $tradeAway,          'tradeFor' => $tradeFor,
                    'building_name'=> $building_name,   'arrow' => 'arrow', ) );
        }
        $this->game->Log->tradeResource($p_id, $tradeAway, $tradeFor);
        foreach($tradeAway as $type=>$amt){
            $this->updateResource($p_id, $type, -$amt);
        }
        foreach($tradeFor as $type=>$amt){
            $this->updateResource($p_id, $type, $amt);
        }
        $this->game->Score->updatePlayerScore($p_id);
    }

    /**updates an array by setting  */
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
     */ 
    function costReplace($arr, $type, $amt){
        $cost_replace = $this->game->costReplace[$type];
        foreach($cost_replace as $r_type=>$r_amt){
            $arr[$type] -= $amt;
            if ($arr[$type]==0){
                unset($arr[$type]);
            }
            $arr = $this->updateKeyOrCreate($arr, $r_type, ($r_amt * $amt));
        }
        return $arr;
    }

}