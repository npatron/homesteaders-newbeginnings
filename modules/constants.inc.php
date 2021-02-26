<?php

  // game options.
  define("SHOW_PLAYER_INFO", 100);
  define("RAIL_NO_BUILD", 101);
  define("NEW_BEGINNING_BLD", 110);
  define("NEW_BEGINNING_EVT", 111);
  define("DISABLED",      0);
  define("ENABLED",       1);
  // options in show info
  define("SHOW_ALL_RESOURCES", 0);
  define("HIDE_ALL_RESOURCES", 1);

  // states
  define("STATE_START_ROUND",        10);
  define("STATE_PLACE_WORKERS",      20);
  define("STATE_INCOME",             22);
  define("STATE_PAY_WORKERS",        23);
  define("STATE_BEGIN_AUCTION",      30);
  define("STATE_2_PLAYER_DUMMY_BID", 31);
  define("STATE_PLAYER_BID",         32);
  define("STATE_RAIL_BONUS",         33);
  define("STATE_NEXT_BID",           34);
  define("STATE_EVENT_PRE_AUCTION",  35);
  define("STATE_NEXT_BUILDING",      40);
  define("STATE_PAY_AUCTION",        41);
  define("STATE_CHOOSE_BUILDING",    42);
  define("STATE_RESOLVE_BUILDING",   43);
  define("STATE_TRAIN_STATION_BUILD",44);
  define("STATE_AUCTION_BONUS",      50);
  define("STATE_CHOOSE_BONUS",       51);
  define("STATE_CONFIRM_AUCTION",    52);
  define("STATE_END_BUILD",          53);
  define("STATE_END_ROUND",          59);
  define("STATE_ENDGAME_ACTIONS",    60);
  define("STATE_UPDATE_SCORES",      61);
  define("STATE_END_GAME",           99);

  define('DUMMY_BID', 0);
  define('DUMMY_OPT', -1);

  define("AUC_LOC_DISCARD", 0);
  define("AUC_LOC_1",   1);
  define("AUC_LOC_2",   2);
  define("AUC_LOC_3",   3);
  define("AUC_LOC_4",   4);
  define("EVT_LOC",     5);
  
  // Building IDs
  define("BLD_HOMESTEAD_YELLOW", 1);
  define("BLD_HOMESTEAD_RED", 2);
  define("BLD_HOMESTEAD_GREEN", 3);
  define("BLD_HOMESTEAD_BLUE", 4);
  define("BLD_HOMESTEAD_PURPLE", 36);
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
  define("BLD_RESTARAUNT",    32);
  define("BLD_TRAIN_STATION", 33);
  define("BLD_CIRCUS",        34);
  define("BLD_RAIL_YARD",     35);  

  // expansion
  define("BLD_LUMBERMILL",  37);
  define("BLD_SALOON",      38);
  define("BLD_SILVER_MINE", 39);
  define("BLD_HOTEL",       40);
  define("BLD_WAREHOUSE",   41);
  define("BLD_POST_OFFICE", 42);
  
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
  define("BUILD_BONUS_SILVER_SILVER",   6);
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
  define("AUC_BONUS_4DEPT_FREE",      8);
  define("AUC_BONUS_3VP_SELL_FREE",   9);

  // Events
  // Settlement Events #1-10
  // Town Events #11-20
  // City Events #21-25
  // all_b (bonus for all players) after income, before bids
  define("EVT_VP_4SILVER",         1);
  define("EVT_TRADE",              2);
  define("EVT_LOAN_TRACK",         3);
  define("EVT_LEAST_WORKER",       4);
  define("EVT_INTEREST",           5);
  define("EVT_PAY_LOAN_FOOD",      6);
  define("EVT_COPPER_COW_GET_GOLD",7);
  define("EVT_DEV_TRACK_VP3",      8);
  define("EVT_VP_FOR_WOOD",        9);
  define("EVT_SELL_NO_TRADE",     10);
  define("EVT_LEAST_BLD_TRACK",   11);
  define("EVT_IND_VP",            12);
  define("EVT_BLD_TAX_SILVER",    13);
  define("EVT_RES_ADV_TRACK",     14);
  // auc_b (auction bonus)
  define("EVT_AUC_DISCOUNT_1_RES",15);
  define("EVT_AUC_NO_AUCTION",    16);
  define("EVT_AUC_BUILD_AGAIN",   17);
  define("EVT_AUC_BONUS_WORKER",  18);
  define("EVT_AUC_2SILVER_TRACK", 19);
  define("EVT_AUC_SECOND_BUILD",  20);
  define("EVT_AUC_TRACK",         21);
  define("EVT_AUC_STEEL_ANY",     22);
  define("EVT_AUC_COM_DISCOUNT",  23);
  // pass_b (bonus when passing)
  define("EVT_PASS_TRACK",        24);
  define("EVT_PASS_DEPT_SILVER",  25);

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
  // A3 bids are 21-29 (4players only)
  define("BID_A4_B3",  31);
  define("BID_A4_B4",  32);
  define("BID_A4_B5",  33);
  define("BID_A4_B6",  34);
  define("BID_A4_B7",  35);
  define("BID_A4_B9",  36);
  define("BID_A4_B12", 37);
  define("BID_A4_B16", 38);
  define("BID_A4_B21", 39);
  // A4 bids are 31-39 (5players only)

  // phases that caused rail bonus.
  define ("PHASE_BID_PASS" ,  1);
  define ("PHASE_BLD_BONUS" , 2);
  define ("PHASE_AUC_BONUS" , 3);
