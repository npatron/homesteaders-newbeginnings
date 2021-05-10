<?php

/*
 * HSDBuilding: a class that handles building related actions.
 */
class HSDBuilding extends APP_GameClass
{
    public $game;
    public function __construct($game)
    {
        $this->game = $game;
    }

    /** SETUP BUILDINGS on game start, IN DB */
    function createBuildings($players){
        $this->game->DbQuery("DELETE FROM `buildings`");
        $sql = "INSERT INTO `buildings` (building_id, building_type, stage, `location`, player_id, worker_slot) VALUES ";
        $values=array();
        foreach( $players as $p_id => $player ) // homestead (assigned to each player by player_id)
            $values[] = $this->getHomesteadAsValue($p_id);
        for($b_id = BLD_GRAIN_MILL; $b_id <= BLD_RAIL_YARD; $b_id++) 
            $values[] = $this->getBuildingAsValue($b_id);
        if($this->game->getGameStateValue('new_beginning_bld') == ENABLED){
            for($b_id = BLD_LUMBER_MILL; $b_id <= BLD_POST_OFFICE; $b_id++) 
                $values[] = $this->getBuildingAsValue($b_id);
        }
        $sql .= implode( ',', $values ); 
        $this->game->DbQuery( $sql );
    }

    function getHomesteadAsValue($p_id){
        $player_color = $this->game->getPlayerColorName($p_id);
        $b_id = BLD_HOMESTEAD_BLUE;
        if ($player_color === 'yellow') {
            $b_id = BLD_HOMESTEAD_YELLOW;
        } else if ($player_color === 'red') {
            $b_id = BLD_HOMESTEAD_RED;
        } else if ($player_color === 'green') {
            $b_id = BLD_HOMESTEAD_GREEN;
        } else if ($player_color === 'purple') {
            $b_id = BLD_HOMESTEAD_PURPLE;
        } 
        return "('$b_id', 0, 0, 2, '$p_id', 2)";
    }

    function getBuildingAsValue($b_id){
        $bld = $this->game->building_info[$b_id];
        $slot = (array_key_exists('slot',$bld)?$bld['slot']:0); // either 'slot', or 0 if 'slot' not defined.
        $stage = $bld['stage'];
        $type = $bld['type'];
        $value = "('$b_id', '$type', '$stage', 0, 0, '$slot')";
        $endValue = $value;
        $iStart = ($this->game->getPlayersNumber()==2? 2:1);
        for ($i = $iStart; $i< $bld['amt']; $i++){
            $endValue .= ", ". $value;
        }
        return $endValue;
    }

    /**  getAllDatas method */
    function getAllBuildings(){
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot, `b_order`, `state` FROM `buildings` ";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    function getAllPlayerBuildings($p_id){
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `stage`, `location`, `player_id` p_id, `worker_slot` w_slot, `b_order`, `state` FROM `buildings` WHERE `player_id` = '".$p_id."' ORDER BY `building_type`, `b_key` ASC";
        return ($this->game->getCollectionFromDB( $sql ));
    }

    /**** Utility ****/
    function getBuildingFromKey($b_key){ 
        $sql = "SELECT `building_key` b_key, `building_id` b_id, `building_type` b_type, `location`, `player_id` p_id, `worker_slot` w_slot, `b_order`, `state` FROM `buildings` WHERE `building_key`='$b_key'";
        return ($this->game->getObjectFromDB($sql));
    }

    function getBuildingIdFromKey($b_key){
        $sql = "SELECT `building_id` FROM `buildings` WHERE `building_key`='".$b_key."'";
        return ($this->game->getUniqueValueFromDB( $sql));
    }

    function getBuildingTypeFromId($b_id){
        $sql = "SELECT `building_type` FROM `buildings` WHERE `building_id`='".$b_id."'";
        $building_type = $this->game->getObjectListFromDB( $sql );
        return (reset($building_type));
    }

    function getBuildingTypeFromKey($b_key){
        $sql = "SELECT `building_type` FROM `buildings` WHERE `building_key`='".$b_key."'";
        return ($this->game->getUniqueValuefromDB( $sql ));
    }

    function getBuildingCostFromKey($b_key, $costReplaceArgs){
        $b_id = $this->getBuildingIdFromKey($b_key);
        $cost = $this->game->building_info[$b_id]['cost']??array();
        foreach ($costReplaceArgs as $type =>$amt){
            if ($amt >0 && $amt <= $cost[$type]??0){
                $cost = $this->game->Resource->costReplace($cost, $type, $amt);
            }
        }
        return $cost;
    }

    function getBuildingNameFromKey($b_key){
        return ($this->getBuildingNameFromId($this->getBuildingIdFromKey($b_key)));
    }

    function getBuildingNameFromId($b_id){
        return $this->game->building_info[$b_id]['name'];
    }

    function doesPlayerOwnBuilding($p_id, $b_id) {
        $sql = "SELECT * FROM `buildings` WHERE `player_id`='".$p_id."' AND `building_id`='$b_id'";
        $buildings = $this->game->getCollectionFromDB( $sql );
        if (count($buildings) == 1) {
            return true;
        }
        return false;
    }

    function updateBuildingsForRound($round_number){
        //rd 1 setup buildings
        if($round_number == 1){
            // add 'settlement' and 'settlement/town' buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_OFFER."' WHERE `stage` in ('".STAGE_SETTLEMENT."','".STAGE_SETTLEMENT_TOWN."');";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings( clienttranslate("Settlement"));
        }
        //rd 5 setup buildings
        if($round_number == 5){
            // add town buildings
            $sql = "UPDATE `buildings` SET `location` = '".BLD_LOC_OFFER."' WHERE `stage` = '".STAGE_TOWN."'";
            $this->game->DbQuery( $sql );
            // remove settlement buildings (not owned)
            $sql = "UPDATE `buildings` SET `location` = '".BLD_LOC_DISCARD."' WHERE `stage` = '".STAGE_SETTLEMENT."' AND `location` = '".BLD_LOC_OFFER."'";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings( clienttranslate('Town'));
        }
        //rd 9 setup buildings
        if($round_number == 9){
            // clear all buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_DISCARD."' WHERE `location` = '".BLD_LOC_OFFER."';";
            $this->game->DbQuery( $sql );
            // add city buildings
            $sql = "UPDATE buildings SET location = '".BLD_LOC_OFFER."' WHERE `stage` = '".STAGE_CITY."';";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings( clienttranslate('City'));
        }
        // Final round (just income).
        if($round_number == 11){
            $sql = "UPDATE buildings SET location = '".BLD_LOC_DISCARD."' WHERE `location` = '".BLD_LOC_OFFER."';";
            $this->game->DbQuery( $sql );
            $this->updateClientBuildings(clienttranslate('Final'));
            $this->game->Resource->updateClientResources();
        }
    }

    /** cause client to update building Stacks */
    function updateClientBuildings($era){
        $buildings = $this->getAllBuildings();
        $this->game->notifyAllPlayers( "updateBuildingStocks", clienttranslate( 'Setting up Buildings for ${era_translated} Era' ), array(
            'i18n' => array( 'era_translated' ),
            'buildings' => $buildings, 
            'era_translated'=>$era,
        ));
    }

    /***** BUYING Building *****/
    /**
     * Returns an array of buildings that can be built. (based upon auction allowed)
     */
    function getAllowedBuildings( $build_type_options) {// into an array of constants
        if (count($build_type_options) ==0){ return array(); }
            $sql = "SELECT * FROM `buildings` WHERE `location`=".BLD_LOC_OFFER." AND (";
            $values = array();
            foreach($build_type_options as $i=>$option){
                $values[] = "`building_type`='".$build_type_options[$i]."'";
            }
            $sql .= implode( ' OR ', $values ); 
            $sql .= ")";
            $buildings = $this->game->getCollectionFromDB( $sql );
        return $buildings;
    }

    function buildBuilding( $p_id, $b_key, $costReplaceArgs )
    {
        $b_cost = $this->getBuildingCostFromKey ($b_key, $costReplaceArgs);
        $this->buildBuildingHelper($p_id, $b_key, $b_cost);
    }

    function buildBuildingDiscount( $p_id, $b_key, $costReplaceArgs, $discount_type)
    {
        
        $b_cost = $this->getBuildingCostFromKey ($b_key, $costReplaceArgs);
        if (!array_key_exists($discount_type, $b_cost)){
            throw new BgaUserException( clienttranslate("You cannot discount it any further ").$discount_type);
        }
        if (($b_cost[$discount_type]--)<=1){
            unset($b_cost[$discount_type]);
        }
        $this->buildBuildingHelper($p_id, $b_key, $b_cost);
    }

    function buildBuildingHelper( $p_id, $b_key, $b_cost){
        $afford = $this->game->Resource->canPlayerAfford($p_id, $b_cost);
        $building = $this->getBuildingFromKey($b_key);
        $b_id = $building['b_id'];
        $b_name = $this->getBuildingNameFromId($b_id);
        $build_type_int = $this->game->getGameStateValue('build_type_int');
        $allowedBuildings = $this->getAllowedBuildings($this->buildTypeIntIntoArray($build_type_int));
        if (!array_key_exists($b_key, $allowedBuildings)){// check b_key is allowed.
            throw new BgaUserException( clienttranslate("You are not allowed to build this building at this time"));
        }
        if (!$afford){
            throw new BgaUserException( sprintf(clienttranslate("You cannot afford to build %s"),$b_name));
        }
        if ($this->doesPlayerOwnBuilding($p_id, $b_id)){
            throw new BgaUserException( sprintf(clienttranslate("You have already built a %s"),$b_name));
        }
        
        $this->payForBuilding($p_id, $b_cost);
        $b_order = $this->game->incGameStateValue('b_order', 1);
        $sql = "UPDATE `buildings` SET `location`=".BLD_LOC_PLAYER.", `player_id`='$p_id', `b_order`='$b_order' WHERE `building_key`='$b_key'";
        $message = clienttranslate('${player_name} builds ${building_name}');
        $building['p_id'] = $p_id;
        $building['b_order'] = $b_order;
        $values = array('player_id' => $p_id,
                        'player_name' => $this->game->getPlayerName($p_id),
                        'building' => $building,
                        'i18n' => array( 'building_name' ), 
                        'building_name' => array('str'=>$b_name, 'type'=>$this->getBuildingTypeFromKey($b_key)));
        if (count($b_cost)>0) {
            $message .= ' ${arrow} ${resources}';
            $values['resources'] = $b_cost;
            $values['arrow'] = "arrow";
        }
        $this->game->DbQuery( $sql );
        $this->game->notifyAllPlayers( "buildBuilding", $message, $values);
        $this->game->Log->buyBuilding($p_id, $b_key, $b_cost, $this->game->Score->dbGetScore($p_id));

        if ($this->game->Building->doesPlayerOwnBuilding($p_id, BLD_FORGE) && $b_id != BLD_FORGE){
            $this->game->Resource->updateAndNotifyIncome($p_id, 'vp', 1, array('type'=>TYPE_INDUSTRIAL, 'str'=>"Forge") );
        }

        $this->game->setGameStateValue('last_building', $b_key);
        $this->game->setGameStateValue('building_bonus', $this->game->Building->getOnBuildBonusForBuildingId($b_id));
    }

    function payForBuilding($p_id, $b_cost){
        foreach( $b_cost as $type => $amt ){
            if ($amt != 0){
                $this->game->Resource->updateResource($p_id, $type, -$amt);
            }
        }
    }

    function getOnBuildBonusForBuildingId($b_id){ 
        return ($this->game->building_info[$b_id]['on_b']??BUILD_BONUS_NONE);
    }

    function getBuildingScoreFromKey($b_key){
        return ($this->getBuildingScoreFromId($this->getBuildingIdFromKey($b_key)));
    }

    function getBuildingScoreFromId($b_id) {
        return ($this->game->building_info[$b_id]['vp']??0);
    }

    function canPlayerReceiveWarehouseIncome($p_id, $type){
        $sql = "SELECT `state` FROM `buildings` WHERE `player_id`=$p_id AND `building_id`=".BLD_WAREHOUSE;
        $warehouseState = $this->game->getUniqueValuefromDB($sql);
        if (is_null($warehouseState)) return false; // don't own warehouse
        // if the value in warehouseState includes
        // checking using bitwise and (see $this->game->warehouse_map for bit_locations)
        return ($warehouseState & $this->game->warehouse_map[$type] >0);
    }

    // INCOME
    function buildingIncomeForPlayer($p_id){
        $income_b_id = $this->getBuildingIncomeForPlayer($p_id);
        foreach ($income_b_id as $b_id =>$income) {
            $name = $income['name'];
            $b_key = $income['key'];
            $income = array_diff_key($income, array_flip(['name','key']));
            if ($b_id==BLD_BANK){
                $this->game->Resource->payLoanOrRecieveSilver($p_id, $name, 'building', $b_key);
            } else {
                $this->game->Resource->updateAndNotifyIncomeGroup($p_id, $income, $name, 'building', $b_key);
            }
        }
    }
    
    function getBuildingIncomeForPlayer($p_id, $warehouse_type =null){
        $p_bld = $this->getAllPlayerBuildings($p_id);
        $player_workers = $this->game->getCollectionFromDB( "SELECT * FROM `workers` WHERE `player_id` = '$p_id'");
        $income_b_id = array();
        foreach( $p_bld as $b_key => $building ) {
            $b_id = $building['b_id'];
            $b_info = $this->game->building_info[$b_id];
            $income_b_id[$b_id] = array ('name' => $b_info['name'], 'key' =>$b_key);
            if ($b_id == BLD_BANK){
                $loans = $this->game->Resource->getPlayerResourceAmount($p_id, 'loan');
                if ($loans ==0){
                    $income_b_id[$b_id]['silver'] = 2;
                } else {
                    $income_b_id[$b_id]['loan'] = 1;
                }
            } else if ($b_id == BLD_RODEO){
                $rodeoIncome = min(count($player_workers), 5);
                $income_b_id[$b_id]['silver'] = $rodeoIncome;
            } else if ($b_id == BLD_WAREHOUSE) {
                $income_b_id[$b_id][$warehouse_type]= 1;
            } else if (array_key_exists('inc', $b_info)) {
                foreach ($b_info['inc'] as $type => $amt){
                    $income_b_id[$b_id] = $this->game->Resource->updateKeyOrCreate($income_b_id[$b_id], $type, $amt);
                }
            }
        }
        $riverPortWorkers = 0;
        foreach($player_workers as $worker_key => $worker ) {
            if ($worker['building_key'] != 0){
                $b_key = $worker['building_key'];
                $b_id = $this->getBuildingIdFromKey($b_key);
                $b_info = $this->game->building_info[$b_id];
                $slot = "s".$worker['building_slot'];
                if ($slot == "s3"){ 
                    if ($b_id == BLD_RIVER_PORT){// only BLD_RIVER_PORT.
                        if ($riverPortWorkers++ ==1){// only triggers on 2nd worker assigned to this building
                            $income_b_id[$b_id] = $this->game->Resource->updateKeyOrCreate($income_b_id[$b_id],'gold', 1);
                        }
                    }
                } else {
                    if (array_key_exists($slot, $b_info)) {
                        foreach ($b_info[$slot] as $type => $amt){
                            $income_b_id[$b_id] = $this->game->Resource->updateKeyOrCreate($income_b_id[$b_id], $type, $amt);
                        }
                    }
                }
            }
        }
        return $income_b_id;
    }

    // for storing buildTypeOptions in global
    function buildTypeArrayIntoInt($b_type_options){
        $b_type_int = 0;
        foreach($b_type_options as $type){//using bitwise | (or)
            if ($type == TYPE_RESIDENTIAL){
                $b_type_int |= 1;
            } else if ($type == TYPE_COMMERCIAL){
                $b_type_int |= 2;
            } else if ($type == TYPE_INDUSTRIAL){
                $b_type_int |= 4;
            } else if ($type == TYPE_SPECIAL){
                $b_type_int |= 8;
            }
        }
        return $b_type_int;
    }
    
    // for restoring buildTypeOptions in global
    function buildTypeIntIntoArray($b_type_int){
        $b_type_options = array();
        if ($b_type_int & 1){//using bitwise & (and)
            $b_type_options[]=TYPE_RESIDENTIAL;
        }
        if ($b_type_int & 2){
            $b_type_options[]=TYPE_COMMERCIAL;
        }
        if ($b_type_int & 4){
            $b_type_options[]=TYPE_INDUSTRIAL;
        }
        if ($b_type_int & 8){
            $b_type_options[]=TYPE_SPECIAL;
        }
        return $b_type_options;
    }

    function getNextStatePostBuild() {
        $building_bonus = $this->game->getGameStateValue('building_bonus');
        $next_state = 'end_build';
        if ($building_bonus != BUILD_BONUS_NONE){
            $next_state = 'building_bonus';     
        } else if ($this->game->Event->isAuctionAffected()){
            $next_state = 'event_bonus';
        } else if ($this->game->Auction->getCurrentAuctionBonus() != AUC_BONUS_NONE){      
            $next_state = 'auction_bonus'; 
        }
        return $next_state;
    }

}