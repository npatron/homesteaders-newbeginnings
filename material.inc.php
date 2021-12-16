<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteadersnewbeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * homesteadersnewbeginnings game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

$this->resource_map = array(
  WOOD=>  'wood', 
  STEEL=> 'steel',
  GOLD=>  'gold',
  COPPER=>'copper',
  FOOD=>  'food',
  COW=>   'cow',
  TRADE=> 'trade',
  VP=>    'vp',
  SILVER=>'silver',
  LOAN=>  'loan',
);

$this->special_resource_map = array(
  'vp2' => array('vp'=>2),
  'vp3' => array('vp'=>3),
  'vp4' => array('vp'=>4),
  'vp6' => array('vp'=>6),
  'vp8' => array('vp'=>8),
);

$this->warehouse_map = array(
  'wood'   => 1,
  'food'   => 2,
  'steel'  => 4,
  'gold'   => 8,
  'copper' => 16,
  'cow'    => 32,
);

$this->costReplace = array(
  'cow' => array('gold'=> 1),
  'copper' => array('gold'=> 1),
  'steel' => array('wood'=> 1, 'vp'=>1),
);

$this->playerColorNames = array(
  "ff0000"=> 'red', 
  "008000"=> 'green', 
  "0000ff"=> 'blue', 
  "ffff00"=> 'yellow', 
  "982fff"=> 'purple');    

$this->trade_map = array(
  0=>'buy_wood', 1=>'buy_food', 2=>'buy_steel', 3=>'buy_gold', 4=>'buy_copper', 5=>'buy_cow',
  6=>'sell_wood', 7=>'sell_food', 8=>'sell_steel', 9=>'sell_gold', 10=>'sell_copper',11=>'sell_cow', 
  12=>'market_food', 13=>'market_steel', 14=>'bank', 15=>'loan', 
  16=>'payLoan_silver', 17=>'payLoan_gold',18=>'payLoan_3silver', 19=>'payLoan_food',
  20=>'sellfree_wood', 21=>'sellfree_food', 22=>'sellfree_steel', 23=>'sellfree_gold', 24=>'sellfree_copper', 25=>'sellfree_cow',);

$this->translation_strings = array(
  TYPE_RESIDENTIAL=> clienttranslate('Residential'), 
  TYPE_COMMERCIAL=> clienttranslate('Commercial'), 
  TYPE_INDUSTRIAL=> clienttranslate('Industrial'), 
  TYPE_SPECIAL=> clienttranslate('Special'), 
  4=> clienttranslate('Any'), 
  6=> clienttranslate('Building'), 
  7=> clienttranslate('Advance on Railroad track'),
  9=> clienttranslate('You have already built this building'),
  10=> clienttranslate('You can not afford to build this building'),
  11=> clienttranslate('You can afford to build this building (trades required)'),
  12=> clienttranslate('You can afford to build this building'),
  15=> clienttranslate('Show Upcoming Buildings'), 
  16=> clienttranslate('Show Current Buildings'),
  17=> clienttranslate('Show Upcoming Auctions'), 
  18=> clienttranslate('Show Building Discard'),
  19=> clienttranslate('Show Events'),
  20=> clienttranslate('Show Events Discard'),
  25=> clienttranslate('Hide Upcoming Buildings'), 
  26=> clienttranslate('Hide Current Buildings'),
  27=> clienttranslate('Hide Upcoming Auctions'), 
  28=> clienttranslate('Hide Building Discard'),
  29=> clienttranslate('Hide Events'),
  30=> clienttranslate('Hide Events Discard'),

  50=> clienttranslate('Final Income and Scoring Round'),
  51=> clienttranslate('Cancel'),
  52=> clienttranslate('Confirm Trade(s) & ${worker} Placement'),
  53=> clienttranslate('Undo Pass'),
  54=> clienttranslate('Confirm Trade(s) and Done'),
  55=> clienttranslate('Confirm Bid'),
  56=> clienttranslate('Pass'),
  57=> clienttranslate('Confirm'),
  58=> clienttranslate('Hide Trade'),
  59=> clienttranslate('Show Trade'),
  60=> clienttranslate('Confirm Trade(s)'),
  61=> clienttranslate('Undo All Trade(s) & Debt'),
  62=> clienttranslate('Take Debt'),
  63=> clienttranslate('${resource1} ${arrow} ${resource2}'),
  64=> clienttranslate('Confirm Trade(s) & ${resource1} ${arrow} ${resource2}'),
  65=> clienttranslate('(FREE) Hire ${worker}'),
  66=> clienttranslate('Do Not Get Bonus'),
  67=> clienttranslate('Choose Bonus'),
  68=> clienttranslate('Pay ${steel} to build ${any}'),
  69=> clienttranslate('Pass on Event'),
  70=> clienttranslate('Start Sell Event'),
  71=> clienttranslate('Do Not Build'),
  72=> clienttranslate('Do Not Build (Get ${track} instead)'),
);

$this->resource_info = array(
  'silver' => array(
    'name'   => clienttranslate("Silver"),
    'db_int' => SILVER,
    'bank'   => array(),
    'tt'     => clienttranslate('${big_silver}<br>Silver:<br>Used to pay ${worker} and to pay for auctions'),
  ),
  'workers' => array(
    'name'   => clienttranslate("Worker"),
    'db_int' => WORKER,
    'tt'     => clienttranslate('${big_worker}<br>Worker:<br>Produces resources when assigned to buildings'),
  ),   
  'track' => array(
    'name'   => clienttranslate("Railroad Track"),
    'db_int' => TRACK,
    'tt'     => clienttranslate('${big_track}<br>Rail Track<br>Produces ${silver} each round'),
  ),
  'wood' => array(
    'name'   => clienttranslate("Wood"),
    'db_int' => WOOD,
    'trade_val' => array('silver'=> 1),
    'tt'     => clienttranslate('${big_wood}<br>Wood:<br>Required to build some buildings'),
  ),
  'food' => array(
    'name'   => clienttranslate("Food"),
    'db_int' => FOOD,
    'trade_val' => array('silver'=> 2),
    'market' => array('wood'=>1),
    'tt'     => clienttranslate('${big_food}<br>Food:<br>Required to build some buildings<br>Used to Hire new ${worker}'),
  ),
  'steel' => array(
    'name'   => clienttranslate("Steel"),
    'db_int' => STEEL,
    'trade_val' => array('silver'=> 3),
    'market' => array('food'=>1),
    'tt'     => clienttranslate('${big_steel}<br>Steel:<br>Required to build some buildings'),
  ),
  'gold' => array(
    'name'   => clienttranslate("Gold"),
    'db_int' => GOLD,
    'trade_val' => array('silver'=> 4),
    'tt'     => clienttranslate('${big_gold}<br>Gold:<br>Required to build some buildings<br>Can be used to pay Workers / Auction costs(as 5 ${silver})<br>End: Worth ${vp2}'),
  ),
  'copper' => array(
    'name'   => clienttranslate("Copper"),
    'db_int' => COPPER,
    'trade_val' => array('gold'=> 1),
    'tt'     => clienttranslate('${big_copper}<br>Copper:<br>Required to build some buildings<br>End: Worth ${vp2}'),
  ),
  'cow' => array(
    'name'   => clienttranslate("Livestock"),
    'db_int' => COW,
    'trade_val' => array('gold'=> 1),
    'tt'     => clienttranslate('${big_cow}<br>Livestock:<br>Required to build some buildings<br>End: Worth ${vp2}'),
  ),
  'loan' => array(
    'name'   => clienttranslate("Debt"),
    'db_int' => LOAN,
    'tt'     => clienttranslate('${big_loan}<br>Debt:<br>Costs 5 ${silver} (or 1 ${gold}) to pay off<br>End: Penalty for unpaid ${loan}:<br>${loan} ${arrow} lose ${vp}<br>${loan}${loan} ${arrow} lose ${vp3}<br>${loan}${loan}${loan} ${arrow} lose ${vp6}<br>${loan}${loan}${loan}${loan} ${arrow} lose ${vp10}<br> (etc...)'),
  ),
  'trade' => array(
    'name'   => clienttranslate("Trade Token"),
    'db_int' => TRADE,
    'tt'     => clienttranslate('${big_trade}<br>Trade Token:<br> Required for any trade<br>Used to Hire new ${worker}'),
  ),
  'vp' => array(
    'name'   => clienttranslate("VP Token"),
    'db_int' => VP,
    'tt'     => clienttranslate('${big_vp}<br>VP Token:<br>End: Worth 1 VP'),
  ),
);

// DEFINE THE BUILDING STATIC VALUES. (indexed by building_id)
$this->building_info = array_merge(
  array_fill_keys( 
    array(BLD_HOMESTEAD_YELLOW, BLD_HOMESTEAD_RED, BLD_HOMESTEAD_GREEN, BLD_HOMESTEAD_BLUE, BLD_HOMESTEAD_PURPLE), 
    array(
      'name' => clienttranslate("Homestead"),
      'type' => TYPE_RESIDENTIAL,
      'stage'=> 0,
      'inc'  => array('silver'=>2),
      'slot' => 2,
      's1'   => array('wood'=>1),
      's2'   => array('vp'=>1),
      'amt'  => 0,
  )),
  array(
   BLD_GRAIN_MILL => array(
    'name' => clienttranslate("Grain Mill"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('steel'=>1,'wood'=>1),
    'vp'   => 2,
    'inc'  => array('food'=>1),
    'amt'  => 1,
   ),
   BLD_FARM => array(
    'name' => clienttranslate("Farm"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'slot' => 2,
    's1'   => array('silver'=>2,'trade'=>1),
    's2'   => array('food'=>1),
    'amt'  => 3,
   ),
   BLD_MARKET => array(
    'name' => clienttranslate("Market"),
    'trade'=> 1,
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('wood'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'slot' => 1,
    's1'   => array('silver'=>2),
    'amt'  => 3,
   ),
   BLD_FOUNDRY => array(
    'name' => clienttranslate("Foundry"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array(),
    'slot' => 1,
    's1'   => array('steel'=>1),
    'amt'  => 3,
   ),
   BLD_STEEL_MILL => array(
    'name' => clienttranslate("Steel Mill"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT,
    'cost' => array('gold'=>1,'wood'=>2,),
    'inc'  => array('steel'=>1),
    'amt'  => 1,
   ),
   BLD_BOARDING_HOUSE => array(
    'name' => clienttranslate("Boarding House"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>2),
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('silver'=>2),
    'amt'  => 1,
    'on_b' => BUILD_BONUS_PAY_LOAN,
   ),
   BLD_RAILWORKERS_HOUSE => array(
    'name' => clienttranslate("Railworkers House"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>2),
    'vp_b' => VP_B_WRK_TRK,
    'inc'  => array('silver'=>1,'trade'=>1),
    'amt'  => 1,
   ),
   BLD_RANCH => array(
    'name' => clienttranslate("Ranch"),
    'type' => TYPE_RESIDENTIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1,'food'=>1,'wood'=>1,),
    'slot' => 1,
    's1'   => array('cow'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_TRADE,
   ),
   BLD_TRADING_POST => array(
    'name' => clienttranslate("Trading Post"),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('gold'=>1),
    'inc'  => array('trade'=>2),
    'amt'  => 1,
   ),
   BLD_GENERAL_STORE => array(
    'name' => clienttranslate("General Store"),
    'desc' => clienttranslate('Whenever you Sell, get an additional ${silver}'),
    'type' => TYPE_COMMERCIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('trade'=>1),
    'amt'  => 2,
   ),
   BLD_GOLD_MINE => array(
    'name' => clienttranslate("Gold Mine"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1,'wood'=>1,),
    'slot' => 1,
    's1'   => array('gold'=>1),
    'amt'  => 2,
   ),
   BLD_COPPER_MINE => array(
    'name' => clienttranslate("Copper Mine"),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('steel'=>1, 'wood'=>2),
    'slot' => 1,
    's1'   => array('copper'=>1),
    'amt'  => 2,
   ),
   BLD_RIVER_PORT => array(
    'name' => clienttranslate("River Port"),
    'desc' => clienttranslate('You may pay for ${copper} or ${cow} in building costs or auction costs using ${gold} instead'),
    'type' => TYPE_INDUSTRIAL,
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'cost' => array('wood'=>1),
    'slot' => 3,
    's3'   => array('gold'=>1),
    'amt'  => 2,
   ),
   BLD_CHURCH => array(
    'name' => clienttranslate("Church"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('copper'=>1,'gold'=>1,'steel'=>1,'wood'=>1),
    'vp'   => 10,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_WORKSHOP => array(
    'name' => clienttranslate("Workshop"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1),
    'vp'   => 2,
    'inc'  => array('vp'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_WORKER,
   ),
   BLD_DEPOT => array(
    'name' => clienttranslate("Depot"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>1,'wood'=>1,),
    'vp_b' => VP_B_TRACK,
    'inc'  => array('silver'=>2),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_STABLES => array(
    'name' => clienttranslate("Stables"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1),
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('trade'=>1, 'vp'=>1),
    'amt'  => 1,
   ),
   BLD_BANK => array(
    'name' => clienttranslate("Bank"),
    'trade'=> 2,
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('copper'=>1, 'steel'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_SPECIAL,
    'inc'  => array('loan'=>-1),
    'amt'  => 1,
   ),
   BLD_MEATPACKING_PLANT => array(
    'name' => clienttranslate("Meatpacking Plant"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('cow'=>1, 'wood'=>1,),
    'vp'   => 2,
    'slot' => 2,
    's1'   => array('vp2'=>1),
    's2'   => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FORGE => array(
    'name' => clienttranslate("Forge"),
    'desc' => clienttranslate('Get ${vp} whenever you build a building (after this one)'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('steel'=>2),
    'vp'   => 1,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    'amt'  => 2,
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
   ),
   BLD_FACTORY => array(
    'name' => clienttranslate("Factory"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('copper'=>1, 'steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_INDUSTRIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_RODEO => array(
    'name' => clienttranslate("Rodeo"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'food'=>1),
    'vp'   => 4,
    'inc'  => array('silver'=>'x'),
    'amt'  => 1,
   ),
   BLD_LAWYER => array(
    'name' => clienttranslate("Lawyer"),
    'desc' => clienttranslate('You may overbid others with the same bid value<br>'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'gold'=>1, 'wood'=>1),
    'vp'   => 4,
    'vp_b' => VP_B_COMMERCIAL,
    'inc'  => array('vp2'=>1),
    'amt'  => 1,
   ),
   BLD_FAIRGROUNDS => array(
    'name' => clienttranslate("Fairgrounds"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1, 'copper'=>1, 'wood'=>2,),
    'vp'   => 6,
    'vp_b' => VP_B_RESIDENTIAL,
    'inc'  => array('gold'=>1),
    'amt'  => 1,
   ),
   BLD_DUDE_RANCH => array(
    'name' => clienttranslate("Dude Ranch"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('food'=>1,'wood'=>1),
    'vp'   => 3,
    'vp_b' => VP_B_WORKER,
    'amt'  => 2,
   ),
   BLD_TOWN_HALL => array(
    'name' => clienttranslate("Town Hall"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('copper'=>1,'wood'=>2,),
    'vp'   => 10,
    'vp_b' => VP_B_COMMERCIAL,
    'amt'  => 1,
   ),
   BLD_TERMINAL => array(
    'name' => clienttranslate("Terminal"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('steel'=>2),
    'vp'   => 6,
    'vp_b' => VP_B_TRACK,
    'amt'  => 2,
   ),
   BLD_RESTAURANT => array(
    'name' => clienttranslate("Restaurant"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('cow'=>1,'wood'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_SPECIAL,
    'amt'  => 2,
   ),
   BLD_TRAIN_STATION => array(
    'name' => clienttranslate("Train Station"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('copper'=>1,'wood'=>1, ),
    'on_b' => BUILD_BONUS_TRACK_AND_BUILD,
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_CIRCUS => array(
    'name' => clienttranslate("Circus"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1,'food'=>2),
    'vp'   => 8,
    'vp_b' => VP_B_WORKER,
    'amt'  => 1,
   ),
   BLD_RAIL_YARD => array(
    'name' => clienttranslate("Rail Yard"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('copper'=>1,'gold'=>1,'steel'=>2),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 6,
    'vp_b' => VP_B_BUILDING,
    'amt'  => 1,
   ),
   BLD_LUMBER_MILL => array(
    'name' => clienttranslate("Lumbermill"),
    'desc' => clienttranslate('May use ${wood}${vp} in place of ${steel} in building costs'),
    'stage'=> STAGE_SETTLEMENT,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array(),
    'slot' => 1,
    's1'   => array('wood'=>1, 'silver'=>1),
    'vp'   => 3,
    'amt'  => 2,
   ),
   BLD_SALOON => array(
    'name' => clienttranslate("Saloon"),
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array(),
    'on_b' => BUILD_BONUS_TRADE_TRADE,
    'vp'   => 1,
    'inc'  => array('silver'=>1),
    'amt'  => 2,
   ),
   BLD_SILVER_MINE => array(
    'name' => clienttranslate("Silver Mine"),
    'stage'=> STAGE_SETTLEMENT_TOWN,
    'type' => TYPE_INDUSTRIAL,
    'cost' => array('wood'=>1),
    'on_b' => BUILD_BONUS_RAIL_ADVANCE,
    'vp'   => 2,
    'slot' => 1,
    's1'   => array('silver'=>3),
    'amt'  => 2,
   ),
   BLD_HOTEL => array(
    'name' => clienttranslate("Hotel"),
    'desc' => clienttranslate('When you gain ${worker} gain ${silver}'),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_RESIDENTIAL,
    'cost' => array('steel'=>1,'food'=>1),
    'on_b' => BUILD_BONUS_SILVER_WORKERS,
    'slot' => 1,
    's1'   => array('vp2'=>1),
    'vp'   => 3,
    'amt'  => 1,
   ),
   BLD_WAREHOUSE => array(
    'name' => clienttranslate("Warehouse"),
    'stage'=> STAGE_TOWN,
    'type' => TYPE_COMMERCIAL,
    'cost' => array('copper'=>1,'steel'=>1,'wood'=>1),
    'on_b' => BUILD_BONUS_PLACE_RESOURCES,
    'vp'   => 3,
    'inc'  => array('special'=> 1), // This will require special handling by the player, & probably a new state just for this.
    'amt'  => 1,
   ),
   BLD_POST_OFFICE => array(
    'name' => clienttranslate("Post Office"),
    'stage'=> STAGE_CITY,
    'type' => TYPE_SPECIAL,
    'cost' => array('cow'=>1,'steel'=>1,'wood'=>1),
    'vp'   => 8,
    'vp_b' => VP_B_PAID_LOAN,
    'amt'  => 1,
   ),
));

$this->auction_info = array( 
  1 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
  ),
  2 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  3 => array(
    'build' => array(TYPE_COMMERCIAL),
  ),
  4 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_INDUSTRIAL),
  ),
  5 => array(
    'build' => array(TYPE_COMMERCIAL),
    'bonus' => AUC_BONUS_WORKER,
  ),
  6 => array(
    'build' => array(TYPE_RESIDENTIAL),
    'bonus' => AUC_BONUS_WORKER,
  ),
  7 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'bonus' => AUC_BONUS_WORKER,
  ),
  8 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  9 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_COPPER_FOR_VP,
  ),
  10 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_COW_FOR_VP,
  ),
  11 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  12 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  13 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  14 => array(
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  15 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
  ),
  16 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_COMMERCIAL),
  ),
  17 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  18 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  19 => array(
    'build' => array(TYPE_COMMERCIAL, TYPE_INDUSTRIAL),
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  20 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_SPECIAL),
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  21 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  22 => array(
    'build' => array(TYPE_COMMERCIAL),
  ),
  23 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  24 => array(
    'bonus' => AUC_BONUS_WORKER_RAIL_ADV,
  ),
  25 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  26 => array(
    'build' => array(TYPE_COMMERCIAL),
  ),
  27 => array(
    'build' => array(TYPE_INDUSTRIAL),
    'bonus' => AUC_BONUS_WOOD_FOR_TRACK,
  ),
  28 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  29 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL),
    'bonus' => AUC_BONUS_FOOD_FOR_VP,
  ),
  30 => array(
    'bonus' => AUC_BONUS_6VP_AND_FOOD_VP,
  ),
  31 => array(
    'build' => array(TYPE_INDUSTRIAL, TYPE_COMMERCIAL),
  ),
  32 => array(
    'build' => array(TYPE_RESIDENTIAL),
  ),
  33 => array(
    'bonus' => AUC_BONUS_TRACK_RAIL_ADV,
  ),
  34 => array(
    'bonus'=> AUC_BONUS_NO_AUCTION,
  ),
  35 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_INDUSTRIAL),
  ),
  36 => array(
    'build' => array(TYPE_COMMERCIAL, TYPE_SPECIAL),
  ),
  37 => array(
    'build' => array(TYPE_INDUSTRIAL),
  ),
  38 => array(
    'bonus' => AUC_BONUS_4DEPT_FREE,
  ),
  39 => array(
    'bonus' => AUC_BONUS_3VP_SELL_FREE,
  ),
  40 => array(
    'build' => array(TYPE_RESIDENTIAL, TYPE_COMMERCIAL, TYPE_INDUSTRIAL, TYPE_SPECIAL),
  ),
  
);

  // Events
  // Settlement Events #1-10
  // Town Events       #11-20
  // City Events       #21-25
$this->event_info = array(
  EVENT_ABANDONED_STOCKPILE => array(
    'name'  => clienttranslate('Abandoned Stockpile'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('The winner of ${a1} builds for one resource less (their choice)'),
    'auc'   => AUC_EVT_ONE,
    'auc_d' => 1,
  ),
  EVENT_BUREAUCRATIC_ERROR => array(
    'name'  => clienttranslate('Bureaucratic Error'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('${a1} is unavailable this round'),
    'auc'   => AUC_EVT_ONE,
    'auc_b' => 1,
  ),
  EVENT_CENTRAL_PACIFIC_RR => array(
    'name'  => clienttranslate('Central Pacific RR'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('Players who pass, get a ${track}'),
    'pass'  => 1,
  ),
  EVENT_EAGER_INVESTORS => array(
    'name'  => clienttranslate('Eager Investors'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('All players who have a ${vp} get ${silver}${silver}${silver}${silver}'),
    'all_b' => 1,
  ),
  EVENT_EXTRA_LOT => array(
    'name'  => clienttranslate('Extra Lot'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('${a1} also give: build (${any} Type)'),
    'auc'   => AUC_EVT_ONE,
    'auc_b' => 1,
  ),
  EVENT_MIGRANT_WORKERS => array(
    'name'  => clienttranslate('Migrant Workers'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('${a1} also give: ${worker}'),
    'auc'   => AUC_EVT_ONE,
    'auc_b' => 1,
  ),
  EVENT_RAILROAD_CONTRACTS => array(
    'name'  => clienttranslate('Railroad Contracts'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('All auctions also give: ${silver}${silver} ${arrow} Advance the Railroad Track'),
    'auc'   => AUC_EVT_ALL,
    'auc_b' => 1,
  ),
  EVENT_RAPID_EXPANSION => array(
    'name'  => clienttranslate('Rapid Expansion'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('All auctions with bulding opportunities also give a second building opportunity of the same type'),
    'auc'   => AUC_EVT_ALL,
    'auc_b' => 1,
  ),
  EVENT_TRAVELING_TRADERS => array(
    'name'  => clienttranslate('Traveling Traders'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('All players get a ${trade}'),
    'all_b' => 1,
  ),
  EVENT_UNION_PACIFIC_RR => array(
    'name'  => clienttranslate('Union Pacific RR'),
    'stage' => STAGE_SETTLEMENT,
    'tt'    => clienttranslate('${a1} also give: ${track}'),
    'auc'   => AUC_EVT_ONE,
    'auc_b' => 1,
  ),
  EVENT_BANK_FAVORS => array(
    'name'  => clienttranslate('Bank Favors'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('The player(s) with the least ${loan} gets ${adv_track}'),
    'all_b' => 1,
  ),
  EVENT_FORTUNE_SEEKER => array(
    'name'  => clienttranslate('Fortune Seeker'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('The player(s) with the fewest ${worker} may hire a ${worker} (for free)'),
    'all_b' => 1,
  ),
  EVENT_INDUSTRIALIZATION => array(
    'name'  => clienttranslate('Industrialization'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('All auctions also give: ${steel} ${arrow} ${any}'),
    'auc'   => AUC_EVT_ALL,
    'auc_b' => 1,
  ),
  EVENT_INTEREST => array(
    'name' => clienttranslate('Interest'),
    'stage' => STAGE_TOWN,
    'tt' => clienttranslate('Players must pay ${silver} per ${loan} (${loan} taken to pay the interest does not also need to be paid for)'),
    'all_b' => 1,
  ),
  EVENT_SHARECROPPING => array(
    'name'  => clienttranslate('Sharecropping'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('players may pay off ${loan} for 1-${food} apiece'),
    'all_b' => 1,
  ),
  EVENT_STATE_FAIR => array(
    'name'  => clienttranslate('State Fair'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('The player(s) with the most ${copper} plus ${cow}, (at least one) gets a ${gold}'),
    'all_b' => 1,
  ),
  EVENT_TRANSCONTINENTAL_RR => array(
    'name'  => clienttranslate('Transcontinental Railroad'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('The player(s) who is farthest advanced on the Railroad Development Track gets ${vp3}'),
    'all_b' => 1,
  ),
  EVENT_TIMBER_CULTURE_ACT => array(
    'name'  => clienttranslate('Timber Culture Act'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('Players get ${vp} for every ${wood} held'),
    'pre_trd'=> AUC_EVT_ONE,
    'all_b' => 1,
  ),
  EVENT_WARTIME_DEMAND => array(
    'name'  => clienttranslate('Wartime Demand'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('Players may sell any number of resources without spending ${trade}'),
    'all_b' => 1,
  ),
  EVENT_WESTERN_PACIFIC_RR => array(
    'name'  => clienttranslate('Western Pacific RR'),
    'stage' => STAGE_TOWN,
    'tt'    => clienttranslate('The player(s) with the fewest Buildings get a ${track}'),
    'all_b' => 1,
  ),
  EVENT_COMMERCIAL_DOMINANCE => array(
    'name'  => clienttranslate('${com} Dominance'),
    'stage' => STAGE_CITY,
    'tt'    => clienttranslate('The player(s) with the most ${com} buildings only pays half their Auction bid (round down)'),
    'auc' => AUC_EVT_ALL,
  ),
  EVENT_INDUSTRIAL_DOMINANCE => array(
    'name'  => clienttranslate('${ind} Dominance'),
    'stage' => STAGE_CITY,
    'tt'    => clienttranslate('The player(s) with the most ${ind} buildings gets ${vp} for each resource they recieved in income (${wood}, ${food}, ${steel}, ${gold}, ${copper}, ${cow} produced by buildings and not from trade)'),
    'all_b' => 1,
  ),
  EVENT_NELSON_ACT => array(
    'name'  => clienttranslate('Nelson Act'),
    'stage' => STAGE_CITY,
    'tt'    => clienttranslate('Players who pass may pay off ${loan} for ${silver}${silver}${silver} apiece'),
    'pass' => 1,
  ),
  EVENT_PROPERTY_TAXES => array(
    'name'  => clienttranslate('Property Taxes'),
    'stage' => STAGE_CITY,
    'tt'    => clienttranslate('Players must pay ${silver} per Building they have'),
    'all_b' => 1,
  ),
  EVENT_RESIDENTIAL_DOMINANCE => array(
    'name'  => clienttranslate('${res} Dominance'),
    'stage' => STAGE_CITY,
    'tt'    => clienttranslate('The player(s) with the most ${res} buildings gets ${adv_track}'),
    'all_b' => 1,
  ),
);
