<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteadersnewbeginningsNewBeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * homesteadersnewbeginnings.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in homesteadersnewbeginnings_homesteadersnewbeginnings.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
  require_once( APP_BASE_PATH."view/common/game.view.php" );
  
  class view_homesteadersnewbeginnings_homesteadersnewbeginnings extends game_view
  {
    function getGameName() {
        return "homesteadersnewbeginnings";
    }    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );
        global $g_user;
        $current_player_id = $g_user->get_id();

        /*********** Place your code below:  ************/
        
        $this->tpl['ROUND_STRING'] = _("Round: ");
        $round_number = $this->game->getGameStateValue('round_number');
        $this->tpl['ROUND_NUMBER'] = $round_number;
        $this->tpl['SHOW']             = _("Show");
        $this->tpl['HIDE']             = _("Hide");
        $this->tpl['MAIN_BUILDING']    = _("Current Buildings");
        $this->tpl['FUTURE_AUCTION']   = _("Upcoming Auctions");
        $this->tpl['CONFIRM_TRADE']    = _("Confirm Trade");
        $this->tpl['UNDO_TRADE']       = _("Undo All Trade/Dept");
        $this->tpl['UNDO_LAST_TRADE']  = _("Undo Last Trade/Dept");
        $this->tpl['BUILDING_STOCK']   = _("Main Building Stock");
        $this->tpl['BUILDING_DISCARD'] = _("Building Discard");
        $this->tpl['FUTURE_BUILDING']  = _("Upcoming Buildings");
        $this->tpl['PAY']              = _("Auto-pay");
        $this->tpl['WITH']             = _("with");

        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "this_player_zone" );
        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "player_zone" );
        foreach($players as $p_id=>$player){
          $color = $this->game->playerColorNames[$player['player_color']];
          if ($current_player_id == $p_id){
            $this->page->insert_block( "this_player_zone", array(
              'COLOR' => $color,
              'NAME' => $player['player_name']) );
          } else {
            $this->page->insert_block( "player_zone", array(
              'COLOR' => $color,
              'NAME' => $player['player_name']) );
          }
        } 
        
        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "bid_slot" );
        
        for ($a=1; $a <= 3; $a++){
          for ($bid=1; $bid < 10; $bid++){          
            $this->page->insert_block( "bid_slot", array('A'=> $a, 'B'=> $this->game->Bid->bid_cost_array[$bid]) );
          }
        }

        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "auction_stacks" );
        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "future_auction_zones" );
        $auctions = $this->game->getGameStateValue('number_auctions');
        for ($a=1; $a <= $auctions; $a++){
          $this->page->insert_block( "auction_stacks", array('A'=> $a));
          $this->page->insert_block( "future_auction_zones", array('A'=> $a, 'AUCTION'=>_("Auction"), 'COLOR'=> 'a'.$a));
        }
        
        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "train_advancement");
        for ($i=0; $i<6; $i++){
          $this->page->insert_block( "train_advancement", array('I'=> $i) ); 
        }

        $this->page->begin_block( "homesteadersnewbeginnings_homesteadersnewbeginnings", "trade_option");
        for ($i=0; $i < 12; $i++){
          $this->page->insert_block( "trade_option", array('OPTION'=> $this->game->trade_map[$i])); 
        }
        
        /*********** Do not change anything below this line  ************/
  	}
  }
  

