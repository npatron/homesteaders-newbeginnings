<?php

/*
 * HSDBid: a class that allows handles bid related actions.
 */
class HSDBid extends APP_GameClass
{
    public $game;
    public $bid_cost_array = array(
        1 => 3, 2 => 4, 3 => 5,
        4 => 6, 5 => 7, 6 => 9,
        7 => 12,8 => 16,9 => 21, );
    public function __construct($game)
    {
        $this->game = $game;
    }

    function setupBidDB($players){
        $sql = "INSERT INTO `bids` (player_id, bid_loc) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player ) {
            $values[] = "( $player_id, '0' )";
        }
        if (count($players) == 2){
            $values[] = "( ".DUMMY_BID.", '0' )";
            $values[] = "( ".DUMMY_OPT.", '23' )";
        }
        $sql .= implode( ',', $values); 
        $this->game->DbQuery( $sql );
    }

    function clearBidForPlayer($p_id){
        if ($this->game->getPlayersNumber() == 2){
            $auc = $this->game->getGameStateValue('current_auction');
            $dummy_bid = $this->game->getUniqueValueFromDB("SELECT `bid_loc` FROM `bids` WHERE `player_id`= ".DUMMY_BID);
            if (ceil($dummy_bid /10) == $auc )
                $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`= '".BID_PASS."' WHERE `player_id`=".DUMMY_BID);
        }
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`= '".BID_PASS."' WHERE `player_id`=$p_id");
    }

    function notifyAllMoveBid($p_id, $bid_loc){
        $this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} moves ${token}'), array (
            'player_id' => $p_id,
            'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
            'bid_location'=> $bid_loc,
            'token' => array('token'=> 'bid', 'player_id'=>$p_id),) );
    }

    function clearBids(){
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`= '0', `outbid`='0' WHERE `player_id`!=".DUMMY_OPT );
        $this->game->setGameStateValue('last_bidder', 0);
        $this->game->setGameStateValue('players_passed', 0);
    }

    function getPlayerBidLoc($p_id){
        return ($this->game->getUniqueValueFromDB("SELECT `bid_loc` FROM `bids` WHERE `player_id`='$p_id' "));
    }

    function canPlayerBid($p_id) {
        $bid_loc = $this->getPlayerBidLoc($p_id);
        if ($bid_loc == NO_BID) return true;
        if ($this->isPlayerOutbid($p_id))return true;
        return false;
    }

    function getBidCost($p_id){
        $bid_loc = $this->game->getUniqueValueFromDB( "SELECT `bid_loc` FROM `bids` WHERE `player_id`='$p_id'");
        $bid_index = ($bid_loc % 10);
        return ($this->bid_cost_array[$bid_index]);
    }

    function getWinnerOfAuction() 
    {
        $current_auction = $this->game->getGameStateValue( 'current_auction' );
        $bids = $this->game->getCollectionFromDB("SELECT `player_id`, `bid_loc` from `bids` WHERE `player_id`!=0");
        foreach($bids as $player_id => $bid){ 
            if ($player_id == DUMMY_BID || $player_id == DUMMY_OPT) continue;
            if ($current_auction == 1 && $bid['bid_loc'] >= BID_A1_B3 && $bid['bid_loc'] <= BID_A1_B21 ){
                return $player_id;
            } if ($current_auction == 2 && $bid['bid_loc'] >= BID_A2_B3 && $bid['bid_loc'] <= BID_A2_B21 ){
                return $player_id;
            } if ($current_auction == 3  && $bid['bid_loc'] >= BID_A3_B3 && $bid['bid_loc'] <= BID_A3_B21 ){
                return $player_id;
            } if ($current_auction == 4  && $bid['bid_loc'] >= BID_A4_B3 && $bid['bid_loc'] <= BID_A4_B21 ){
                return $player_id;
            }
        }
        return 0;
    }

    function passBid(){
        $p_id = $this->game->getActivePlayerId();
        $last_bid = $this->game->getUniqueValueFromDB("SELECT `bid_loc` from `bids` WHERE `player_id`='$p_id'");
        $this->game->Log->passBid($p_id, $last_bid);
        $token_arr = array('token'=> 'bid', 'player_id'=>$p_id);
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} passes ${token}'), array (
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'bid_location'=> BID_PASS,
                'token' => $token_arr,));
        $this->game->DbQuery("UPDATE `bids` SET `bid_loc` ='".BID_PASS."', `outbid`='0' WHERE `player_id` = '$p_id'");
        if ($this->game->getPlayersNumber() == 2)
            $this->updateDummyBidWeight(true);
        $this->game->incGameStateValue('players_passed', 1);
        //phase is used for rail adv, so it knows where to go next.
        $this->game->setGameStateValue('phase', 2);
        $this->game->Resource->getRailAdv($p_id, $token_arr);
    }

    function cancelPass(){
        if ($this->game->getPlayersNumber() == 2)
            $this->updateDummyBidWeight(false);
        $this->game->incGameStateValue('players_passed', -1);
    }

    function confirmBid($bid_location){
        $active_player = $this->game->getActivePlayerId();
        $valid_bids = $this->getValidBids($active_player);
        if (in_array($bid_location, $valid_bids)){// valid bid
            $this->makeBid($bid_location, $active_player);
            $this->game->setGameStateValue('last_bidder', $active_player);
        } else {
            throw new BgaUserException( clienttranslate("Invalid Bid Selection") );
        }
    }

    function isPlayerOutbid ($p_id){
        $already_outbid = $this->game->getUniqueValueFromDB( 
            "SELECT `outbid` FROM `bids` WHERE `player_id` = '$p_id'" );
        if ($already_outbid == 1) return true;
        return false;
    }

    function outbidPlayer($p_id) {
        if (!$this->isPlayerOutbid($p_id)){
            $this->game->DbQuery( "UPDATE `bids` SET `outbid` = '1' WHERE `player_id` = '$p_id'");
            if ($p_id == DUMMY_BID){ // don't add logs for dummy player 
                $this->updateDummyBidWeight(false);
            } else { 
                $outbid_byId = $this->game->getActivePlayerId();
                $this->game->Log->outbidPlayer($p_id, $outbid_byId);
            }
        }
    }

    function makeBid($bid_loc, $p_id){
        // determine outbids (if any).
        $auction_bid_start = 0;
        if ($bid_loc > 0 && $bid_loc < 10){
            $auction_bid_start = 1;
        } else if ($bid_loc > 10 && $bid_loc < 20) {
            $auction_bid_start = 11;
        } else if ($bid_loc > 20 && $bid_loc < 30) {
            $auction_bid_start = 21;
        } else if ($bid_loc > 30 && $bid_loc < 40) {
            $auction_bid_start = 31;
        }
        $outbid = $this->game->getCollectionFromDb( 
            "SELECT `player_id` FROM `bids` WHERE `bid_loc` BETWEEN '$auction_bid_start' AND '$bid_loc'");
        foreach($outbid as $outbid_id =>$outbids){
            $this->outbidPlayer($outbid_id);
        }
        // then update bid for this 
        $auc = ceil($bid_loc/10);
        $amt = $this->bid_cost_array[$bid_loc%10];
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} Bids ${amount} for ${auction}'), array (
            'i18n' => array('auction'),
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'amount' => $amt,
                'auction' => array('str'=>'auction '.$auc, 'key'=> $auc),
                'bid_location'=> $bid_loc) );
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`='$bid_loc', `outbid`='0' WHERE `player_id`='$p_id'");
        $this->game->Log->makeBid($p_id);
    }

    function getValidBids($p_id) {
        $bid_start = 1;
        $bid_end = 19;
        if ($this->game->Event->getEvent()==2){
            $bid_start = 11;
        }
        $player_count = $this->game->getPlayersNumber();
        if ($player_count == 5){
            if ($this->game->Auction->isAuctionInCurrentAuctions(BID_A4_B6)){
                $bid_end = 29;// "no auction" auction.
            } else {
                $bid_end = 39;    
            }
        } else if ($player_count == 4){
            $bid_end = 29;
        }
        $valid_bids = range($bid_start, $bid_end);
        $valid_bids = \array_diff($valid_bids, [OUTBID, BID_PASS, 30]); // remove outbid & pass
        $bids = $this->game->getObjectListFromDB( "SELECT `bid_loc` FROM `bids`" );
        $offset = 0;
        if ($this->game->Building->doesPlayerOwnBuilding($p_id, BLD_LAWYER)){
            $offset = 1;
        }
        for($i=0; $i < count($bids); $i++){
            $bid = $bids[$i]['bid_loc'];
            if (($bid > 0) && ($bid < 10)){
                for ($j = ($bid - $offset); $j >0; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            } else if (($bid > 10) && ($bid < 20)) {
                for ($j = ($bid - $offset); $j >10; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            } else if (($bid > 20) && ($bid < 30)) {
                for ($j = ($bid - $offset); $j >20; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            } else if (($bid > 30) && ($bid < 40)) {
                for ($j = ($bid - $offset); $j >30; $j--){
                    $valid_bids = \array_diff($valid_bids, [$j]);
                }
            }
        }
        return ($valid_bids);
    }

    /***** ZOMBIE BID (player quit) ******/

    function zombieDummyPass(){
        $this->makeDummyBid(array_values($this->getDummyBidOptions())[0]);
    }

    function zombiePass($p_id){
        $token_arr = array('token'=> 'bid', 'player_id'=>$p_id);
		$this->game->notifyAllPlayers("moveBid", clienttranslate( '${player_name} passes ${token}'), array (
                'player_id' => $p_id,
                'player_name' => $this->game->loadPlayersBasicInfos()[$p_id]['player_name'],
                'bid_location'=> BID_PASS,
                'token' => $token_arr,));
        $this->game->DbQuery("UPDATE `bids` SET `bid_loc` ='".BID_PASS."', `outbid`='0' WHERE `player_id` = '$p_id'");
        if ($this->game->getPlayersNumber() == 2)
            $this->updateDummyBidWeight(true);
        $this->game->incGameStateValue('players_passed', 1);
    }

    /***** DUMMY ACTIONS (2-player only) *****/

    function confirmDummyBid($bid_location){
        $valid_bids = $this->getDummyBidOptions();
        if (in_array($bid_location, $valid_bids)){// valid bid
            $this->makeDummyBid($bid_location);
        } else {
            throw new BgaUserException( clienttranslate("Invalid Bid Selection") );
        }
    }

    function makeDummyBid($bid_loc){
        $auc = ceil($bid_loc/10);
        $amt = $this->bid_cost_array[$bid_loc%10];
		$this->game->notifyAllPlayers("moveBid", clienttranslate( 'Dummy ${token} Bids ${amount} for ${auction}'), array (
                'i18n' => array('auction'),    
                'player_id' => DUMMY_BID,
                'token' => array('token'=> 'bid', 'player_id'=>DUMMY_BID),
                'amount' => $amt,
                'auction' => array('str'=>'AUCTION '.$auc, 'key'=> $auc),
                'bid_location'=> $bid_loc) );
        $this->game->DbQuery( "UPDATE `bids` SET `bid_loc`='$bid_loc', `outbid`='0' WHERE `player_id`='".DUMMY_BID."'");
    }

    function updateDummyBidWeight($down){
        $val =$this->game->getUniqueValuefromDB("SELECT `bid_loc` FROM `bids` WHERE `player_id`=".DUMMY_OPT);
        if ($down){ // on outbid
            $new_val = max(21, $val -1); // 21 or -1; (21-> 3-silver)
        } else { // on pass
            $new_val = min(26, $val +1); // 26 or +1; (26-> 9-silver)
        }
        $cost = $this->bid_cost_array[$new_val%10];
        $token_arr = array('token'=> 'bid', 'player_id'=>DUMMY_OPT);
        if ($new_val == $val){
            $this->game->notifyAllPlayers("moveBid", clienttranslate( '${token} cannot be updated past ${cost}'), array (
                'player_id' => DUMMY_OPT,
                'token' => $token_arr,
                'bid_location'=> $val,
                'cost' =>$cost ));    
        } else {
            $this->game->DBQuery("UPDATE `bids` SET `bid_loc`=$new_val WHERE `player_id`=".DUMMY_OPT);
            $this->game->notifyAllPlayers("moveBid", '${token} ${arrow} ${cost}', array (
            'player_id' => DUMMY_OPT,
            'token' => $token_arr,
            'arrow' => 'arrow',
            'bid_location'=> $new_val,
            'cost' =>$cost ));
        }
    }

    function getDummyBidOptions(){
        $dummy_3 = $this->game->GetUniqueValueFromDB("SELECT `bid_loc` FROM `bids` WHERE `player_id`=".DUMMY_OPT);
        $dummy_1 = $dummy_3 - 20;
        $dummy_2 = $dummy_3 - 10;
        if ($this->game->Event->getEvent() == 2){
            return([$dummy_2]);
        }
        return ([$dummy_1, $dummy_2]);
    }
}