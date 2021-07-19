<?php

/*
 * homesteadersnewbeginningsLog: a class that allows to log some actions
 *   and then fetch these actions later
 */
class HSDLog extends APP_GameClass
{
  public $game;
  public function __construct($game)
  {
    $this->game = $game;
  }

  /*
     * initStats: initialize statistics to 0 at start of game
     */
  public function initStats($players)
  {
    // Init game statistics
    $this->game->initStat('table', 'outbids_in_auctions', 0);
    $this->game->initStat('table', 'buildings', 0);
    $this->game->initStat('table', 'passed', 0); 

    foreach ($players as $player_id => $player) {
      $this->game->initStat('player', 'building_vp', 0, $player_id);
      $this->game->initStat('player', 'building_bonus_vp', 0, $player_id);
      $this->game->initStat('player', 'vp_chits',   0, $player_id);
      $this->game->initStat('player', 'vp_gold',    0, $player_id);
      $this->game->initStat('player', 'vp_cow',     0, $player_id);
      $this->game->initStat('player', 'vp_copper',  0, $player_id);
      $this->game->initStat('player', 'vp_loan',    0, $player_id);

      $this->game->initStat('player', 'bonus_vp_0', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_1', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_2', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_3', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_4', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_5', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_6', 0, $player_id);
      $this->game->initStat('player', 'bonus_vp_7', 0, $player_id);
      
      $this->game->initStat('player', 'buildings',   1, $player_id);
      $this->game->initStat('player', 'residential', 1, $player_id);
      $this->game->initStat('player', 'industrial',  0, $player_id);
      $this->game->initStat('player', 'commercial',  0, $player_id);
      $this->game->initStat('player', 'special',     0, $player_id);
      $this->game->initStat('player', 'bids',        0, $player_id);

      $this->game->initStat('player', 'auctions_won',     0, $player_id);
      $this->game->initStat('player', 'win_auction_1',    0, $player_id);
      $this->game->initStat('player', 'win_auction_2',    0, $player_id);
      $this->game->initStat('player', 'win_auction_3',    0, $player_id);
      $this->game->initStat('player', 'win_auction_4',    0, $player_id);
      $this->game->initStat('player', 'spent_on_auctions', 0, $player_id);
      $this->game->initStat('player', 'times_outbid',     0, $player_id);
      $this->game->initStat('player', 'outbids',          0, $player_id);
      
      $this->game->initStat('player', 'loans', 0, $player_id);
      $this->game->initStat('player', 'loans_paid_end', 0, $player_id);
    }
  }

  /*
   * incrementStats: adjust individual game statistics
   *   - array $stats: format is array of [ player_id, name, value ].
   *     example: [ ['table', 'move'], [23647584, 'move'], ... ]
   *       - player_id: the player ID for a player state, or 'table' for a table stat
   *       - name: the state name, such as 'move' or 'usePower'
   *       - value (optional): amount to add, defaults to 1
   *   - boolean $subtract: true if the values should be decremented
   */
  public function incrementStats($stats, $subtract = false)
  {
    foreach ($stats as $stat) {
      if (!is_array($stat)) {
        throw new BgaVisibleSystemException(clienttranslate("incrementStats: Not an array"));
      }

      $player_id = $stat[0];
      if ($player_id == 'table' || empty($player_id)) {
        $player_id = null;
      }

      $name = $stat[1];
      if (empty($name)) {
        throw new BgaVisibleSystemException(clienttranslate("incrementStats: Missing name"));
      }

      $value = 1;
      if (count($stat) > 2) {
        $value = $stat[2];
      }
      if ($subtract) {
        $value = $value * -1;
      }

      $this->game->incStat($value, $name, $player_id);
    }
  }

  /*
   * insert: add a new log entry
   * params:
   *   - int $player_id: the player who is making the action
   *   - int $piece_id : the token or auc_no the action pertains.
   *   - string $action : the name of the action
   *   - array $args : action arguments (eg space)
   */
  public function insert($player_id, $piece_id, $action, $args = [], $stats = [])
  {
    $player_id = $player_id == -1 ? $this->game->getActivePlayerId() : $player_id;
    $moveId = $this->game->getUniqueValueFromDB("SELECT `global_value` FROM `global` WHERE `global_id` = 3");
    $round = $this->game->getGameStateValue("round_number");
    if ($action === 'build') {
      $stats[] = ['table', 'buildings'];
      $stats[] = [$player_id, 'buildings'];
      $building_type = $this->game->Building->getBuildingTypeFromKey($piece_id);
      if ($building_type == TYPE_RESIDENTIAL)
        $stats[] = [$player_id, 'residential'];
      else if ($building_type == TYPE_COMMERCIAL)
        $stats[] = [$player_id, 'industrial'];
      else if ($building_type == TYPE_INDUSTRIAL)
        $stats[] = [$player_id, 'commercial'];
      else if ($building_type == TYPE_SPECIAL)
        $stats[] = [$player_id, 'special'];
    } else if ($action === 'bid') {
      $stats[] = [$player_id, 'bids'];
    } else if ($action === 'loan' || $action === 'hiddenLoan') {
      $stats[] = [$player_id, 'loans'];
    } else if ($action === 'outbid') {
      $stats[] = ['table', 'outbids_in_auctions'];
      $stats[] = [$player_id, 'times_outbid'];
      $stats[] = [$args['outbid_by'], 'outbids'];
    } else if ($action === 'winAuction') {
      $stats[] = [$player_id, 'auctions_won'];
      $stats[] = [$player_id, "win_auction_$piece_id"];
      $stats[] = [$player_id, 'spent_on_auctions', $args['cost']];
    } 
    if (!empty($stats)) {
      $this->incrementStats($stats);
      $args['stats'] = $stats;
    }

    $actionArgs = json_encode($args);

    $this->game->DbQuery("INSERT INTO log (`round`, `move_id`, `player_id`, `piece_id`, `action`, `action_arg`) VALUES ('$round', '$moveId', '$player_id', '$piece_id', '$action', '$actionArgs')");
  }

  

  /*
   * allowTrades: logged whenever a player start a turn in which trading is an option, 
   * it is required for undo trade/loans.
   */
  public function allowTrades($p_id = null)
  {
    $p_id = $p_id ?: $this->game->getActivePlayerId();
    $this->insert($p_id, 0, 'allowTrades');
  }

  /*
   * allowTrades: logged whenever a player start a turn in which trading is an option, 
   * it is required for undo trade/loans.
   */
  public function allowTradesAllPlayers()
  {
    $players = $this->game->loadPlayersBasicInfos();
    foreach ($players as $p_id => $player) {
      $this->game->giveExtraTime( $p_id );
      $this->insert($p_id, 0, 'allowTrades');
    }
  }

  /**
   * creates undo point for when player un-does income after placing workers
   */
  public function donePlacing($p_id){
    $this->insert($p_id, 0, 'donePlacing');
  }

  /*
   * addBuild: add a new build entry to log
   */
  public function buyBuilding($p_id, $building_key, $cost, $oldScore)
  {
    $cost['oldScore']= $oldScore;
    $this->insert($p_id, $building_key, 'build', $cost);
  }

  public function addTrack($p_id, $t_key)
  {
    $this->insert($p_id, $t_key, 'gainTrack');
  }

  public function railAdvance($p_id)
  {
    $this->insert($p_id, 0, 'railAdv');
  }

  /* for resource updates that need to be undone by undo,
   * but don't need other logging.
   */
  public function updateResource($p_id, $type, $amt)
  {
    $this->insert($p_id, 0, "updateResource", array('type'=>$type, 'amt'=>$amt));
  }

  // BEGIN Undo-able by cancelTransactions
  public function takeLoan($p_id)
  {
    $this->insert($p_id, 0, 'loan');
  }

  public function makeBid($p_id)
  {
    $this->insert($p_id, 0, 'bid');
  }

  public function addWorker($p_id, $w_key)
  {
    $this->insert($p_id, $w_key, 'gainWorker');
  }

  public function payOffLoan($p_id, $type="", $amt=0)
  {
    if ($type === ""){
      $this->insert($p_id, 0, 'loanPaid');
    } else {
      $this->insert($p_id, 0, 'loanPaid', array($type=>$amt));
    }
    
  }

  public function updateBuildingState($p_id, $b_key, $oldState, $newState)
  {
    $this->insert($p_id, $b_key, 'buildingState', array('old_state' => $oldState, 'new_state' => $newState));
  }

  public function tradeResource($p_id, $trade_away, $trade_for)
  {
    $this->insert($p_id, 0, 'trade', array('trade_away' => $trade_away, 'trade_for' => $trade_for));
  }

  // for logging trades that are not shown until everyone is done.
  public function hiddenTrade($p_id, $tradeAction)
  {
    $this->insert($p_id, 0, 'hiddenTrade', array('tradeAction'=>$tradeAction));
  }

  public function triggerHiddenTransactions()
  {
    $players = $this->game->loadPlayersBasicInfos();
    foreach ($players as $p_id => $player) {
      $actions =  $this->getLastActions($p_id, ['hiddenTrade'], 'allowTrades');
      foreach ($actions as $a_id=>$action) {
        $args = json_decode($action['action_arg'], true);
        $this->game->Resource->trade($p_id, $args['tradeAction']);
      }
    }
  }
  // END undo-able from cancelTransactions


  // BID Actions
  public function passBid($p_id, $last_bid)
  {
    $this->insert($p_id, $last_bid, 'passBid');
  }

  public function outbidPlayer($outbid_p_id, $outbidding_p_id)
  {
    $this->insert($outbid_p_id, 0, 'outbid', array('outbid_by' => $outbidding_p_id));
  }

  /*
   * winAuction: logged to track stats, and marks undo/save point
   * should only be called at beginning of payAuction 
   */
  public function winAuction($p_id, $auc_no, $bid_cost)
  {
    $this->insert($p_id, $auc_no, 'winAuction', array('cost' => $bid_cost));
    $this->game->giveExtraTime( $p_id );
    $this->insert($p_id, 0, 'allowTrades');
  }

  /************************* 
   * CANCEL and UNDO METHODS 
   *************************/

  /*
   * getLastActions : get works and actions of player (used to cancel previous action)
   *  default (no parameters) will get work for Build Phase undo.
   *   for undo transactions:        afterAction = 'allowTrades'
   *   for undo auctionBuild undo:   afterAction = 'winAuction' 
   *   for undo after worker income: afterAction = 'donePlacing'
   */
  public function getLastActions($p_id, $actions = ['build', 'trade', 'loan', 'gainTrack', 'gainWorker', 'railAdv', 'updateResource', 'loanPaid', 'buildingState'], $afterAction = 'winAuction')
  {
    $actionsNames = "'" . implode("','", $actions) . "'";
    $sql = "SELECT * FROM `log` WHERE `action` IN ($actionsNames) AND `player_id` = '$p_id' AND log_id >= (SELECT `log_id` FROM `log` WHERE `player_id` = '$p_id' AND `action` = '$afterAction' ORDER BY log_id DESC LIMIT 1) ORDER BY `log_id` DESC";
    return $this->game->getCollectionFromDB( $sql );
  }

  public function getLastTransactions($p_id = null)
  {
    $p_id = $p_id ?: $this->game->getActivePlayerId();
    $actions =  $this->getLastActions($p_id, ['trade', 'hiddenTrade', 'loan', 'gainWorker', 'updateResource', 'loanPaid', 'buildingState'], 'allowTrades');
    return $actions;
  }

  /*
   * cancelTurn: cancel the last actions of active player of current turn
   */
  public function cancelPhase()
  {
    $p_id = $this->game->getActivePlayerId();
    $logs = $this->getLastActions($p_id);
    $transactions =  $this->cancelLogs($p_id, $logs);
    $this->game->notifyAllPlayers('cancel', clienttranslate('${player_name} cancels actions'), array(
      'player_name' => $this->game->getActivePlayerName(),
      'actions' => $transactions['action'],
      'move_ids' => $transactions['move_ids'],
      'player_id' => $p_id));
    $this->insert($p_id, 0, "cancel");
  }

  /*
   * cancelTurn: cancel the last transactions of active player (or current if p_id supplied) within the current phase.
   */
  public function cancelTransactions($p_id = null)
  {
    $p_id = $p_id ?: $this->game->getActivePlayerId();
    $logs = $this->getLastTransactions($p_id);
    $transactions = $this->cancelLogs($p_id, $logs);
    $this->game->notifyAllPlayers('cancel', clienttranslate('${player_name} cancels Transactions'), array(
      'player_name' => $this->game->getPlayerName($p_id),
      'actions' => $transactions['action'],
      'move_ids' => $transactions['move_ids'],
      'player_id' => $p_id));
  }

  /** 
   * cancelTurn: cancel the last actions of p_id, usable to allow making them active in allocate worker phase.
   */
  public function cancelWorkerIncomePhase($p_id)
  {
    $logs = $this->getLastActions($p_id, ['updateResource', 'loan', 'buildingState', 'donePlacing'], 'donePlacing');
    $transactions = $this->cancelLogs($p_id, $logs);
    $this->game->notifyAllPlayers('cancel', clienttranslate('${player_name} un-does income'), array(
      'player_name' => $this->game->getPlayerName($p_id),
      'actions' => $transactions['action'],
      'move_ids' => $transactions['move_ids'],
      'player_id' => $p_id));
  }

  public function cancelPass()
  {
    $p_id = $this->game->getActivePlayerId();
    $logs = $this->getLastActions($p_id, ['railAdv', 'gainTrack', 'updateResource', 'loanPaid', 'buildingState', 'passBid'], 'passBid');
    $transactions = $this->cancelLogs($p_id, $logs);
    $this->game->notifyAllPlayers('cancel', '', array(
      'actions' => $transactions['action'],
      'move_ids' => $transactions['move_ids'],
      'player_id' => $p_id));
  }

  public function cancelLogs($p_id, $logs)
  {
    $ids = array();
    $js_update_arr = array();
    $move_arr = array();
    foreach ($logs as $log) {
      $args = json_decode($log['action_arg'], true);
      switch ($log['action']) {
        case 'build':
            $b_key = $log['piece_id'];
            $building = $this->game->Building->getBuildingFromKey($b_key);
            $this->game->DBQuery("UPDATE `buildings` SET `location`= '1', `player_id`='0' WHERE `building_key`='$b_key'");
            $cost = array();
            foreach ($args as $type => $amt) {
              if (in_array($type, $this->game->resource_map)) {
                $cost[$type] = $amt;
                $this->game->Resource->updateResource($p_id, $type, $amt);
              } else if ($type ==='oldScore'){
                $this->game->Score->dbSetScore($p_id, $amt);
                $oldScore = $amt;
              }
            }
            $this->game->setGameStateValue('last_building', 0);
            $this->game->setGameStateValue('building_bonus', 0);
            $this->game->incGameStateValue('b_order', -1);
            $js_update_arr[] = array('action'=>'build', 'building'=>$building, 'cost'=>$cost, 'score'=>$oldScore);
        break;
        case 'gainWorker':
            $w_key = $log['piece_id'];
            $this->game->DbQuery("DELETE FROM `workers` WHERE `worker_key`='$w_key'");
            $this->game->Resource->updateResource($p_id, 'workers', -1);
            $js_update_arr[] = array('action'=>'gainWorker', 'w_key'=>$w_key);
        break;
        case 'gainTrack':
            $r_key = $log['piece_id'];
            $this->game->DbQuery("DELETE FROM `tracks` WHERE `rail_key`='$r_key'");
            $this->game->Resource->updateResource($p_id, 'track', -1);
            $js_update_arr[] = array('action'=>'gainTrack', 't_key'=>$r_key);
        break;
        case 'loan':
            $this->game->Resource->updateResource($p_id, 'loan', -1);
            $this->game->Resource->updateResource($p_id, 'silver', -2);
            $js_update_arr[] = array('action'=>'loan', 'resource_arr'=> array('loan'=>'1', 'silver'=>2));
        break;
        case 'loanPaid':
          $this->game->Resource->updateResource($p_id, 'loan', 1);

          if (count($args) != 0){
            $type = array_keys($args)[0];
            $this->game->Resource->updateResource($p_id, $type, $args[$type]);
            $js_update_arr[] = array('action'=>'loanPaid','type'=>$type,'amt'=> $args[$type]);
          } else {
            $js_update_arr[] = array('action'=>'loanPaid');
          }
        break;
        case 'railAdv':
          $this->game->DbQuery("UPDATE `player` SET rail_adv=(rail_adv -1) WHERE `player_id`='$p_id'");
          $js_update_arr[] = array('action'=>'railAdv');
        break;
        case 'trade':
          foreach ($args['trade_for'] as $type => $amt)
            $this->game->Resource->updateResource($p_id, $type, -$amt);
          foreach ($args['trade_away'] as $type => $amt)
            $this->game->Resource->updateResource($p_id, $type, $amt);

          $js_update_arr[] = array('action'=>'trade', 
                            'tradeAway_arr'=> $args['trade_away'], 
                            'tradeFor_arr' => $args['trade_for']);
        break;
        case 'updateResource':
          $type = $args['type'];
          $amt = $args['amt'];
          $this->game->Resource->updateResource($p_id, $type, -$amt);
          $js_update_arr[] = array('action'=>'updateResource', 'type'=>$type,'amt'=> -$amt);
        break; 
        case 'buildingState':
          $b_key = $log['piece_id'];
          $oldState = $args['old_state'];
          $this->game->DbQuery("UPDATE `buildings` SET `state`='$oldState' WHERE `building_key`=$b_key;");
          $js_update_arr[] = array('action'=>$log['action'], 'state'=>$oldState, 'b_id'=>$this->game->Building->getBuildingIdFromKey($b_key));
        break;
        case 'passBid':
          $this->game->DbQuery("UPDATE `bids` SET `bid_loc` ='".$log['piece_id']."', `outbid`='1' WHERE `player_id` = '$p_id';");
          $js_update_arr[] = array('action'=>$log['action'], 'last_bid'=>$log['piece_id']);
      break;
      default:
          $js_update_arr[] = array('action'=>$log['action']);
      }

      // Undo statistics
      if (array_key_exists('stats', $args)) {
        $this->incrementStats($args['stats'], -1);
      }

      $ids[] = intval($log['log_id']);
      if ($log['action'] != 'startTurn' && $log['action'] != 'allowTrades') {
        $move_arr[] = intval($log['move_id']);
      }
    }
    // Remove the logs
    if (count($ids)>0){
      $ids_group = "'".implode("','", $ids)."'";
      $this->game->DbQuery("DELETE FROM log WHERE `player_id` = '$p_id' AND `log_id` IN ($ids_group)");
    }

    // Cancel the game notifications
    if (count($move_arr)>0){
      $move_id_group = "'".implode("','", array_unique($move_arr))."'";
      $this->game->DbQuery("UPDATE gamelog SET `cancel` = 1 WHERE `gamelog_move_id` IN ($move_id_group)");
    }
    return array('move_ids' => $move_arr, 'action' =>$js_update_arr);
  }

  /*
   * getCancelMoveIds : get all cancelled move IDs from BGA gamelog, used for styling the notifications on page reload
   */
  public function getCancelMoveIds()
  {
    $moveIds = self::getObjectListFromDb("SELECT `gamelog_move_id` FROM gamelog WHERE `cancel` = 1 ORDER BY 1", true);
    return array_map('intval', $moveIds);
  }
}
