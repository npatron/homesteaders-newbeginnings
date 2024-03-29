<?php

  // game options.
  define("SHOW_PLAYER_INFO", 100);
  define("RAIL_NO_BUILD", 101);
  define("NEW_BEGINNING_BLD", 110);
  define("NEW_BEGINNING_EVT", 111);
  // statuses
  define("DISABLED",      0);
  define("ENABLED",       1);
  // options in show info
  define("SHOW_ALL_RESOURCES", 0);
  define("HIDE_ALL_RESOURCES", 1);

  // states
  define("STATE_START_ROUND",        10);
  // income phase
  define("STATE_PLACE_WORKERS",      20);
  define("STATE_INCOME",             22);
  define("STATE_PAY_WORKERS",        23);

  // event phase
  define("STATE_EVT_PRE_AUCTION",    30);
  define("STATE_EVT_TRADE",          31);
  define("STATE_EVT_BONUS",          32);
  define("STATE_EVT_PAY",            33);
  define("STATE_EVT_POST_TRADE",     34);
  define("STATE_EVT_BONUS_RAIL",     35);
  
  // Bidding phase
  define("STATE_BEGIN_AUCTION",      40);
  define("STATE_2_PLAYER_DUMMY_BID", 41);
  define("STATE_PLAYER_BID",         42);
  define("STATE_PASS_RAIL_BONUS",    43);
  define("STATE_NEXT_BID",           44);
  define("STATE_EVT_PASS_BONUS",     45);

  // resolve Auction Lots
  define("STATE_NEXT_LOT", 50);
  define("STATE_PAY_LOT",  51);/* <- undoTurn goes here*/
  define("STATE_CHOOSE_LOT_ACTION",  52);
  // lot_build building_build 
  define("STATE_CHOOSE_BUILDING",    54);
  define("STATE_TRAIN_STATION_BUILD",55);
  // 1) resolve build bonuses
  define("STATE_RESOLVE_BUILD",      56);
  define("STATE_BUILD_BONUS",        57);
  define("STATE_BUILD_RAIL_BONUS",   58);
  
  // 2) event specific bonus or builds 
  define("STATE_EVT_SETUP_BONUS",   60);
  // 2a) event on build
  define("STATE_EVT_CHOICE",        62);
  define("STATE_EVT_BUILD_AGAIN",   63);//note: no additional builds from events in stage with train station.
  // 2b) resolve build bonuses
  define("STATE_EVT_RESOLVE_BUILD", 64);
  define("STATE_EVT_BUILD_BONUS",   65);
  define("STATE_EVT_RAIL_BONUS",    66);
  
  // 3) auction bonuses (not tied to build)
  define("STATE_AUC_SETUP_BONUS", 70);
  define("STATE_AUC_RAIL_BONUS",  71);
  define("STATE_AUC_CHOOSE_BONUS",72);

  define("STATE_CONFIRM_LOT",     78);
  define("STATE_END_CURRENT_LOT", 79);

  define("STATE_END_ROUND",          89);
  define("STATE_ENDGAME_ACTIONS",    90);
  define("STATE_UPDATE_SCORES",      91);

  define("STATE_END_GAME",           99);
  // END OF STATES

  // dummy (2 player) token
  define('DUMMY_BID', 0);
  define('DUMMY_OPT', -1);
  // auction Location states
  define("AUC_LOC_DISCARD", 0);
  define("AUC_LOC_1",   1);
  define("AUC_LOC_2",   2);
  define("AUC_LOC_3",   3);
  define("AUC_LOC_4",   4);
  
  // Building IDs
  define("BLD_HOMESTEAD_YELLOW", 1);
  define("BLD_HOMESTEAD_RED", 2);
  define("BLD_HOMESTEAD_GREEN", 3);
  define("BLD_HOMESTEAD_BLUE", 4);
  define("BLD_HOMESTEAD_PURPLE", 0);
  // Settlement
  define("BLD_GRAIN_MILL", 5);
  define("BLD_FARM" ,      6);
  define("BLD_MARKET" ,    7);
  define("BLD_FOUNDRY" ,   8);
  define("BLD_STEEL_MILL", 9);
  // Settlement or TOWN
  define("BLD_BOARDING_HOUSE" ,   10);
  define("BLD_RAILWORKERS_HOUSE", 11);
  define("BLD_RANCH",             12);
  define("BLD_TRADING_POST",      13);
  define("BLD_GENERAL_STORE",     14);
  define("BLD_GOLD_MINE",         15);
  define("BLD_COPPER_MINE",       16);
  define("BLD_RIVER_PORT",        17);
  // Town
  define("BLD_CHURCH",            18);
  define("BLD_WORKSHOP",          19);
  define("BLD_DEPOT",             20);
  define("BLD_BANK",              22);
  define("BLD_STABLES",           21);
  define("BLD_MEATPACKING_PLANT", 23);
  define("BLD_FORGE",             24);
  define("BLD_FACTORY",           25);
  define("BLD_RODEO",             26);
  define("BLD_LAWYER",            27);
  define("BLD_FAIRGROUNDS",       28);
  // City
  define("BLD_DUDE_RANCH",    29);
  define("BLD_TOWN_HALL",     30);
  define("BLD_TERMINAL",      31);
  define("BLD_RESTAURANT",    32);
  define("BLD_TRAIN_STATION", 33);
  define("BLD_CIRCUS",        34);
  define("BLD_RAIL_YARD",     35);  

  // expansion
  define("BLD_LUMBER_MILL",  36);
  define("BLD_SALOON",      37);
  define("BLD_SILVER_MINE", 38);
  define("BLD_HOTEL",       39);
  define("BLD_WAREHOUSE",   40);
  define("BLD_POST_OFFICE", 41);
  
  // building location mapping
  define("BLD_LOC_FUTURE",  0);
  define("BLD_LOC_OFFER",   1);
  define("BLD_LOC_PLAYER",  2);
  define("BLD_LOC_DISCARD", 3);
  // building available to build stages
  define("STAGE_SETTLEMENT", 1);
  define("STAGE_SETTLEMENT_TOWN", 2);
  define("STAGE_TOWN", 3);
  define("STAGE_CITY", 4);
  // Building Types
  define("TYPE_RESIDENTIAL", 0);
  define("TYPE_COMMERCIAL",  1);
  define("TYPE_INDUSTRIAL",  2);
  define("TYPE_SPECIAL",     3);

  //resources
  define("NONE",     0);
  define("WOOD",     1);
  define("STEEL",    2);
  define("GOLD",     3);
  define("COPPER",   4);
  define("FOOD",     5);
  define("COW",      6);
  define("TRADE",    7);
  define("TRACK",    8);
  define("WORKER",   9);
  define("VP",       10);
  define("SILVER",   11);
  define("LOAN",     12);
  define("VP2",      13);
  define("VP4",      14);
  define("VP6",      15);

  define("VP_B_RESIDENTIAL", 0);
  define("VP_B_COMMERCIAL",  1);
  define("VP_B_INDUSTRIAL",  2);
  define("VP_B_SPECIAL",     3);
  define("VP_B_WORKER",      4);
  define("VP_B_TRACK",       5);
  define("VP_B_BUILDING",    6);
  define("VP_B_WRK_TRK",     7);
  define("VP_B_PAID_LOAN",   8);

  define("BUILD_BONUS_NONE",            0);
  define("BUILD_BONUS_PAY_LOAN",        1);
  define("BUILD_BONUS_TRADE",           2);
  define("BUILD_BONUS_WORKER",          3);
  define("BUILD_BONUS_RAIL_ADVANCE",    4);
  define("BUILD_BONUS_TRACK_AND_BUILD", 5);
  define("BUILD_BONUS_TRADE_TRADE",     6);
  define("BUILD_BONUS_SILVER_WORKERS",  7);
  define("BUILD_BONUS_PLACE_RESOURCES", 8);

  define("AUC_BONUS_NONE",            0);
  define("AUC_BONUS_WORKER",          1);
  define("AUC_BONUS_WORKER_RAIL_ADV", 2);
  define("AUC_BONUS_WOOD_FOR_TRACK",  3);
  define("AUC_BONUS_COPPER_FOR_VP",   4);
  define("AUC_BONUS_COW_FOR_VP",      5);
  define("AUC_BONUS_6VP_AND_FOOD_VP", 6);
  define("AUC_BONUS_FOOD_FOR_VP",     7);
  // new beginnings auctions events.
  define("AUC_BONUS_NO_AUCTION",      8);
  define("AUC_BONUS_TRACK_RAIL_ADV",  9);
  define("AUC_BONUS_4DEPT_FREE",     10);
  define("AUC_BONUS_3VP_SELL_FREE",  11);

  // 'lot_state' bit flags
  define("LOT_STATE_BUILD",     1);// lot has build
  define("LOT_STATE_AUC_BONUS", 2);// lot has auction bonus
  define("LOT_STATE_EVT_BONUS", 4);// lot has event bonus

  //////////// Events ////////////
  /// BEGIN SQL `events`->`event_id` List ///
  // Settlement Events #1-10
  define("EVENT_ABANDONED_STOCKPILE",   1);
  define("EVENT_BUREAUCRATIC_ERROR",    2);
  define("EVENT_CENTRAL_PACIFIC_RR",    3);
  define("EVENT_EAGER_INVESTORS",       4);
  define("EVENT_EXTRA_LOT",             5);
  define("EVENT_MIGRANT_WORKERS",       6);
  define("EVENT_RAILROAD_CONTRACTS",    7);
  define("EVENT_RAPID_EXPANSION",       8);
  define("EVENT_TRAVELING_TRADERS",     9);
  define("EVENT_UNION_PACIFIC_RR",     10);
  // Town Events       #11-20
  define("EVENT_BANK_FAVORS",          11);
  define("EVENT_FORTUNE_SEEKER",       12);
  define("EVENT_INDUSTRIALIZATION",    13);
  define("EVENT_INTEREST",             14);
  define("EVENT_SHARECROPPING",        15);
  define("EVENT_STATE_FAIR",           16);
  define("EVENT_TRANSCONTINENTAL_RR",  17);
  define("EVENT_TIMBER_CULTURE_ACT",   18);
  define("EVENT_WARTIME_DEMAND",       19);
  define("EVENT_WESTERN_PACIFIC_RR",   20);
  // City Events       #21-25
  define("EVENT_COMMERCIAL_DOMINANCE", 21);
  define("EVENT_INDUSTRIAL_DOMINANCE", 22);
  define("EVENT_NELSON_ACT",           23);
  define("EVENT_PROPERTY_TAXES",       24);
  define("EVENT_RESIDENTIAL_DOMINANCE",25);
  /// END SQL `events`->`event_id` List ///
  
  // 'auc' flags (all auctions or 1st only)
  define("AUC_EVT_ONE", 1);
  define("AUC_EVT_ALL", 2);

  // Bid location mapping
  define("NO_BID",     0);
  define("BID_A1_B3",  1);
  define("BID_A1_B4",  2);
  define("BID_A1_B5",  3);
  define("BID_A1_B6",  4);
  define("BID_A1_B7",  5);
  define("BID_A1_B9",  6);
  define("BID_A1_B12", 7);
  define("BID_A1_B16", 8);
  define("BID_A1_B21", 9);
  // A1 bids are 1-9
  define("OUTBID",     10);
  define("BID_A2_B3",  11);
  define("BID_A2_B4",  12);
  define("BID_A2_B5",  13);
  define("BID_A2_B6",  14);
  define("BID_A2_B7",  15);
  define("BID_A2_B9",  16);
  define("BID_A2_B12", 17);
  define("BID_A2_B16", 18);
  define("BID_A2_B21", 19);
  // A2 bids are 11-19
  define("BID_PASS",   20);
  define("BID_A3_B3",  21);
  define("BID_A3_B4",  22);
  define("BID_A3_B5",  23);
  define("BID_A3_B6",  24);
  define("BID_A3_B7",  25);
  define("BID_A3_B9",  26);
  define("BID_A3_B12", 27);
  define("BID_A3_B16", 28);
  define("BID_A3_B21", 29);
  // A3 bids are 21-29 (4+ players)
  define("BID_A4_B3",  31);
  define("BID_A4_B4",  32);
  define("BID_A4_B5",  33);
  define("BID_A4_B6",  34);
  define("BID_A4_B7",  35);
  define("BID_A4_B9",  36);
  define("BID_A4_B12", 37);
  define("BID_A4_B16", 38);
  define("BID_A4_B21", 39);
  // A4 bids are 31-39 (5 players only)
