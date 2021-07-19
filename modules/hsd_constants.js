const DUMMY_BID= 0;
const DUMMY_OPT= -1;

//user preferences Values
const USE_ART_USER_PREF = 100;
const ENABLED_USER_PREF = 0;
const DISABLED_USER_PREF = 1;

const NO_BID   = 0;
const OUTBID   = 10;
const BID_PASS = 20;
//Resource maps
const NONE     = 0;
const WOOD     = 1;
const STEEL    = 2;
const GOLD     = 3;
const COPPER   = 4;
const FOOD     = 5;
const COW      = 6;
const TRADE    = 7;
const TRACK    = 8;
const WORKER   = 9;
const VP       = 10;
const SILVER   = 11;
const LOAN     = 12;
const RESOURCES = {'wood':1, 'steel':2, 'gold':3, 'copper':4, 'food':5, 'cow':6,
    'trade':7, 'track':8, 'worker':9, 'vp':10, 'silver':11, 'loan':12};
const RESOURCE_ORDER = ['vp0', 'vp', 'vp2', 'vp3', 'vp4', 'vp6', 'vp8','vp10', 
                        'loan','cow','copper','gold','steel','food','wood','silver','trade'];

const ZONE_PENDING = -1;
const ZONE_PASSED = -2;
const ZONE_PENDING_ID = 'pending_bids';
const ZONE_PASSED_ID = 'passed_bids';
const BID_ZONE_ID  = []; 

const VP_B_RESIDENTIAL = 0; 
const VP_B_COMMERCIAL = 1; 
const VP_B_INDUSTRIAL = 2; 
const VP_B_SPECIAL = 3; 
const VP_B_WORKER = 4; 
const VP_B_TRACK = 5; 
const VP_B_BUILDING = 6;
const VP_B_WRK_TRK = 7; //Workers & TRACK Bonus

const BLD_LOC_FUTURE  = 0;
const BLD_LOC_OFFER   = 1;
const BLD_LOC_PLAYER  = 2;
const BLD_LOC_DISCARD = 3;
const AUC_LOC_FUTURE  = 2;
const EVT_LOC_MAIN    = 4;

const TRADE_BUTTON_SHOW    = 0;
const TRADE_BUTTON_HIDE    = 1;
const TRADE_BUTTON_CONFIRM = 2;

// building ID's required for trade
const BLD_MARKET = 7;
const BLD_GENERAL_STORE = 14;
const BLD_RIVER_PORT = 17;
const BLD_BANK   = 22;
const BLD_RODEO  = 26;
const BLD_LUMBER_MILL = 36;
const BLD_WAREHOUSE = 40;
const BLD_POST_OFFICE = 41;


// string templates for dynamic assets
const TPL_BLD_TILE  = "building_tile";
const TPL_BLD_STACK = "building_stack_";
const TPL_BLD_ZONE  = "building_zone_";
const TPL_BLD_CLASS = "build_tile_";
const TPL_AUC_TILE  = "auction_tile";
const TPL_AUC_ZONE  = "auction_tile_zone_";

const FIRST_PLAYER_ID       = 'first_player_tile';
const CONFIRM_TRADE_BTN_ID  = 'confirm_trade_btn';
const UNDO_TRADE_BTN_ID     = 'undo_trades_btn';
const UNDO_LAST_TRADE_BTN_ID= 'undo_last_trade_btn';// remove this

const BTN_ID_DONE           = 'btn_done'; // endgame
const ENDGAME_DONE_METHOD   = 'doneEndgameActions';
    
const BTN_ID_CONFIRM_WORKERS = 'btn_confirm_workers'; // allocate workers
const DONE_WORKERS_METHOD    = 'donePlacingWorkers';

/*** can be trade + transition ***/
const BTN_ID_CONFIRM_BID = 'btn_confirm_bid';
const BTN_ID_CONFIRM_DUMMY_BID = 'btn_confirm_dummy_bid';
const BTN_ID_CONFIRM_ACTIONS = 'btn_confirm';

const BTN_ID_BUILD = 'btn_choose_building';
const BUILD_BUILDING_METHOD = 'chooseBuilding';
const BUILDING_NAME_ID = 'bld_name';

const BTN_ID_FOOD_VP = 'btn_food_vp';
const FOOD_VP_ARR    = {resource1:'${food}', resource2:'${vp2}', arrow:'${arrow}'};
const FOOD_VP_METHOD = 'foodFor2VP';

const BTN_ID_COW_VP  = 'btn_cow_vp';
const COW_VP_ARR     = {resource1:'${cow}', resource2:'${vp4}', arrow:'${arrow}'};
const COW_VP_METHOD  = 'cowFor4VP';

const BTN_ID_COPPER_VP = 'btn_copper_vp';
const COPPER_VP_ARR    = {resource1:'${copper}', resource2:'${vp4}', arrow:'${arrow}'};
const COPPER_VP_METHOD = 'copperFor4VP';

const BTN_ID_GOLD_VP = 'btn_gold_vp';
const GOLD_VP_ARR    = {resource1:'${gold}', resource2:'${vp4}', arrow:'${arrow}'};
const GOLD_VP_METHOD = 'goldFor4VP'; 

const BTN_ID_WOOD_TRACK = 'btn_wood_track';
const WOOD_TRACK_ARR    = {resource1:'${wood}', resource2:'${track}', arrow:'${arrow}'};
const WOOD_TRACK_METHOD = 'woodForTrack';

const BTN_ID_BONUS_WORKER = 'btn_bonus_worker'; // free worker bonus
const BTN_ID_PASS_BID     = 'btn_pass';  // pass bid
const BTN_ID_DO_NOT_BUILD = 'btn_do_not_build'; // pass build
const BTN_ID_PASS_BONUS   = 'btn_pass_bonus';   // pass on bonus
const BTN_ID_CHOOSE_BONUS = 'btn_choose_bonus'; //rail bonus

/*** transition back ***/
const BTN_ID_UNDO_PASS    = 'btn_undo_pass';
const BTN_ID_CANCEL       = 'btn_cancel_button';
const BTN_ID_REDO_AUCTION = 'btn_redo_build_phase';
/*** non-transition actions ***/
const BTN_ID_HIRE_WORKER = 'btn_hire_worker';
const BTN_ID_TAKE_LOAN   = 'btn_take_loan';
const BTN_ID_MORE_GOLD   = 'btn_more_gold';
const BTN_ID_LESS_GOLD   = 'btn_less_gold';
const BTN_ID_PAY_DONE    = 'btn_pay_done';
const DONE_PAY_METHOD    = 'donePay';

const BTN_ID_PAY_LOAN_SILVER   = 'btn_pay_loan_silver';
const BTN_ID_PAY_LOAN_GOLD     = 'btn_pay_loan_gold';
const BTN_ID_PAY_LOAN_3_SILVER = 'btn_loan_3_silver';

const BTN_ID_TRADE       = 'btn_trade';
const BTN_ID_TRADE_BANK  = 'btn_trade_bank';
const REPLACER_ZONE_ID   = 'replacers';
const BTN_ID_GOLD_COW    = 'btn_gold_cow';
const BTN_ID_GOLD_COPPER = 'btn_gold_copper';

const PAY_GOLD_TEXT         = 'pay_gold';
const PAY_GOLD_TOKEN        = 'pay_gold_tkn';
const PAY_SILVER_TEXT       = 'pay_silver';
const PAY_SILVER_TOKEN      = 'pay_silver_tkn';
const MORE_STEEL_BUTTON     = 'btn_more_steel';
const LESS_STEEL_BUTTON     = 'btn_less_steel';

// transaction constants
const BUY               = 1;
const SELL              = 2;
const MARKET            = 3;
const BANK              = 4;
const TAKE_LOAN         = 5;
const PAY_LOAN_GOLD     = 6;
const PAY_LOAN_SILVER   = 7;
const PAY_LOAN_SILVER_3 = 8;

// arrays for the map between toggle buttons and show/hide zones 
const TOGGLE_BTN_ID     = ['tgl_future_bld', 'tgl_main_bld', 'tgl_future_auc', 'tgl_past_bld', 'tgl_events'];
const TOGGLE_BTN_STR_ID = ['bld_future', 'bld_main', 'auc_future', 'bld_discard', 'evt_main'];
const TILE_CONTAINER_ID = ['future_building_container', 'main_building_container', 'future_auction_container', 'past_building_container', 'events_container'];
const TILE_ZONE_DIVID   = ['future_building_zone', 'main_building_zone', 'future_auction_1', 'past_building_zone', 'events_zone'];
const EVT_ZONE = "events_zone";

const TRADE_MAP = {'buy_wood':0,  'buy_food':1,  'buy_steel':2, 'buy_gold':3, 'buy_copper':4, 'buy_cow':5,
                    'sell_wood':6, 'sell_food':7, 'sell_steel':8, 'sell_gold':9, 'sell_copper':10, 'sell_cow':11, 
                    'market_food':12, 'market_steel':13, 'bank':14, 'loan':15, 
                    'payLoan_silver':16, 'payLoan_gold':17,'payLoan_3silver':18};

const MARKET_FOOD_ID  = 'trade_market_wood_food';
const MARKET_STEEL_ID = 'trade_market_food_steel';
const BANK_ID         = 'trade_bank_trade_silver';
const WAREHOUSE_RES_ID = 'warehouse_resources';
const BONUS_OPTIONS = { 7:'train_bonus_1_trade', 8:'train_bonus_2_track', 9:'train_bonus_3_worker',
    1:'train_bonus_4_wood', 5:'train_bonus_4_food', 2:'train_bonus_4_steel', 3:'train_bonus_4_gold',
    4:'train_bonus_4_copper', 6:'train_bonus_4_cow', 10:'train_bonus_5_vp'};

const COST_REPLACE_TYPE = {'steel':{'wood':1,'vp':1}, 'cow':{'gold':1}, 'copper':{'gold':1}, 'gold':{'silver':5}};

const TRADE_BOARD_ID = 'trade_top';
const BUY_ZONE_ID    = 'buy_zone';
const BUY_TEXT_ID    = 'buy_text';
const SELL_ZONE_ID   = 'sell_zone';
const SELL_TEXT_ID   = 'sell_text';
const SPECIAL_ZONE_ID= 'special_zone'; // market + bank
const MARKET_TEXT_ID = 'market_text';
const BANK_TEXT_ID   = 'bank_text';

const TRADE_BOARD_ACTION_SELECTOR = `#${TRADE_BOARD_ID} .trade_option`;
const TYPE_SELECTOR = {'bid':'.bid_slot', 'bonus':'.train_bonus', 'worker_slot':'.worker_slot',
'building':'.building_tile', 'worker':'.token_worker', 'trade':'.trade_option',
'track':'.token_track'};

// other Auction Locations are the auction number (1-3).
const AUC_LOC_DISCARD = 0;

const AUC_BONUS_NONE            = 0;
const AUC_BONUS_WORKER          = 1;
const AUC_BONUS_WORKER_RAIL_ADV = 2;
const AUC_BONUS_WOOD_FOR_TRACK  = 3;
const AUC_BONUS_COPPER_FOR_VP   = 4;
const AUC_BONUS_COW_FOR_VP      = 5;
const AUC_BONUS_6VP_AND_FOOD_VP = 6;
const AUC_BONUS_FOOD_FOR_VP     = 7;
// auc 4 events (expansion)
const AUC_BONUS_NO_AUCTION     = 8;
const AUC_BONUS_TRACK_RAIL_ADV = 9;
const AUC_BONUS_4DEPT_FREE     = 10;
const AUC_BONUS_3VP_SELL_FREE  = 11;

const EVT_VP_4SILVER          = 1;
const EVT_TRADE               = 2;
const EVT_LOAN_TRACK          = 3;
const EVT_LEAST_WORKER        = 4;
const EVT_INTEREST            = 5;
const EVT_PAY_LOAN_FOOD       = 6;
const EVT_COPPER_COW_GET_GOLD = 7;
const EVT_DEV_TRACK_VP3       = 8;
const EVT_VP_FOR_WOOD         = 9;
const EVT_SELL_NO_TRADE       = 10;
const EVT_LEAST_BLD_TRACK     = 11;
const EVT_IND_VP              = 12;
const EVT_BLD_TAX_SILVER      = 13;
const EVT_RES_ADV_TRACK       = 14;
// auc_b (auction bonus)
const EVT_AUC_DISCOUNT_1_RES  = 15;
const EVT_AUC_NO_AUCTION      = 16;
const EVT_AUC_BUILD_AGAIN     = 17;
const EVT_AUC_BONUS_WORKER    = 18;
const EVT_AUC_2SILVER_TRACK   = 19;
const EVT_AUC_SECOND_BUILD    = 20;
const EVT_AUC_TRACK           = 21;
const EVT_AUC_STEEL_ANY       = 22;
const EVT_AUC_COM_DISCOUNT    = 23;
// pass_b (bonus when passing)
const EVT_PASS_TRACK          = 24;
const EVT_PASS_DEPT_SILVER    = 25;

const ALREADY_BUILT = 9;
const UNAFFORDABLE = 10;
const TRADEABLE    = 11;
const AFFORDABLE   = 12;
const COLOR_MAP = {9:'black', 10:'black', 11:'blue', 12:'darkgreen'};
const AFFORDABILITY_CLASSES = {9:'unaffordable', 10:'unaffordable', 11:'tradeable', 12:'affordable'}

// only one with player action required
const BUILD_BONUS_WORKER = 3; 

const BID_VAL_ARR = [3,4,5,6,7,9,12,16,21];//note: starts at 0.
const ASSET_COLORS = {0:'res', 1:'com', 2:'ind', 3:'spe', 4:'any', 6:'any',
                      10:'a0',11:'a1',12:'a2',13:'a3', 14:'a4'};
const VP_TOKENS = ['vp0', 'vp2', 'vp3', 'vp4','vp6','vp8', 'vp10'];
const WAREHOUSE_MAP = {1:'wood',2:'food',4:'steel',8:'gold',16:'copper',32:'cow',}

// map of tpl id's  used to place the player_zones in turn order.
const PLAYER_ORDER = ['currentPlayer','First', 'Second', 'Third', 'Fourth',];

const TOKEN_HTML = [];
// global arrays
const GLOBAL = [];
// zone control
const TRACK_TOKEN_ZONE  = [];
const WORKER_TOKEN_ZONE = [];
const TRAIN_TOKEN_ID = [];//indexed by p_id
const BID_TOKEN_ID = [];

// player_info
const PLAYER_COLOR            = [];
const PLAYER_SCORE_ZONE_ID    = [];
const PLAYER_BUILDING_ZONE_ID = [];
// PLAYER resources and score counters
const BOARD_RESOURCE_COUNTERS = [];
const POSITIVE_RESOURCE_COUNTERS = [];
const NEGATIVE_RESOURCE_COUNTERS = [];
const NEW_RESOURCE_COUNTERS = [];
const INCOME_ARRAY = []; // current round income (for updating breadcrumbs/offset).

const SCORE_RESOURCE_COUNTERS = [];
const SCORE_LEFT_COUNTER = [];
const SCORE_RIGHT_COUNTER = [];
const BUILDING_CONNECT_HANDLER = [];

const LAST_SELECTED = [];

// queues for pending trades
const TRANSACTION_LOG  = [];
const TRANSACTION_COST = [];

// storage for buildings
const MAIN_BUILDING_COUNTS = []; // counts of each building_id in main zone. for use by update Buildings methods.
const BUILDING_WORKER_IDS  = [];
const HAS_BUILDING         = [];

// from backend (material.inc)
const RESOURCE_INFO = [];
const EVENT_INFO    = [];
const BUILDING_INFO = [];
const ASSET_STRINGS = [];