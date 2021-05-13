 /**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * homesteadersnewbeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * homesteadersnewbeginnings.js
 *
 * homesteadersnewbeginnings user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "dijit/form/CheckBox"
],
function (dojo, declare) {
    function override_addMoveToLog(logId, moveId) {
        // [Undocumented] Called by BGA framework on new log notification message
        // Handle cancelled notifications
        this.inherited(override_addMoveToLog, arguments);
        if (this.gamedatas.cancel_move_ids && this.gamedatas.cancel_move_ids.includes(+moveId)) {
          dojo.addClass('log_' + logId, 'cancel');
        }
      }
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

    const ZONE_PENDING = -1;
    const ZONE_PASSED = -2;

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
    const UNDO_LAST_TRADE_BTN_ID= 'undo_last_trade_btn';
    const TRADE_BUTTON_ID       = 'btn_trade';


    // arrays for the map between toggle buttons and show/hide zones 
    const TOGGLE_BTN_ID     = ['tgl_future_bld', 'tgl_main_bld', 'tgl_future_auc', 'tgl_past_bld'];
    const TOGGLE_BTN_STR_ID = ['bld_future', 'bld_main', 'auc_future', 'bld_discard'];
    const TOGGLE_SHOW_STRING= ['Show Upcoming Buildings', 'Show Current Buildings', 'Show Upcoming Auctions', 'Show Building Discard'];
    const TOGGLE_HIDE_STRING= ['Hide Upcoming Buildings', 'Hide Current Buildings', 'Hide Upcoming Auctions', 'Hide Building Discard'];
    const TILE_CONTAINER_ID = ['future_building_container', 'main_building_container', 'future_auction_container', 'past_building_container'];
    const TILE_ZONE_DIVID   = ['future_building_zone', 'main_building_zone', 'future_auction_1', 'past_building_zone'];
    const EVT_ZONE = "events_zone";
    
    const TRADE_MAP = {'buy_wood':0,  'buy_food':1,  'buy_steel':2, 'buy_gold':3, 'buy_copper':4, 'buy_cow':5,
                       'sell_wood':6, 'sell_food':7, 'sell_steel':8, 'sell_gold':9, 'sell_copper':10, 'sell_cow':11, 
                       'market_food':12, 'market_steel':13, 'bank':14, 'loan':15, 
                       'payLoan_silver':16, 'payLoan_gold':17,'payLoan_3silver':18};
    
    const MARKET_FOOD_DIVID  = 'trade_market_wood_food';
    const MARKET_STEEL_DIVID = 'trade_market_food_steel';
    const BANK_DIVID         = 'trade_bank_trade_silver';
    const WAREHOUSE_RES_DIVID = 'warehouse_resources';
    const BONUS_OPTIONS = { 7:'train_bonus_1_trade', 8:'train_bonus_2_track', 9:'train_bonus_3_worker',
        1:'train_bonus_4_wood', 5:'train_bonus_4_food', 2:'train_bonus_4_steel', 3:'train_bonus_4_gold',
        4:'train_bonus_4_copper', 6:'train_bonus_4_cow', 10:'train_bonus_5_vp'};


    const COST_REPLACE_TYPE = {'steel':{'wood':1,'vp':1}, 'cow':{'gold':1}, 'copper':{'gold':1}, 'gold':{'silver':5}};

    const TRADE_BOARD_ID = 'trade_top';
    const BUY_BOARD_ID = 'buy_board';
    const SELL_BOARD_ID = 'sell_board';
    const TRADE_BOARD_ACTION_SELECTOR = `#${TRADE_BOARD_ID} .trade_option`;
    const TYPE_SELECTOR = {'bid':'.bid_slot', 'bonus':'.train_bonus', 'worker_slot':'.worker_slot',
    'building':'.building_tile', 'worker':'.token_worker', 'trade':'.trade_option',
    'track':'.token_track'};

    // other Auction Locations are the auction number (1-3).
    const AUCLOC_DISCARD = 0;

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
                          11:'a1',12:'a2',13:'a3', 14:'a4'};
    const VP_TOKENS = ['vp0', 'vp2', 'vp3', 'vp4','vp6','vp8', 'vp10'];
    const WAREHOUSE_MAP = {1:'wood',2:'food',4:'steel',8:'gold',16:'copper',32:'cow',}

    // map of tpl id's  used to place the player_zones in turn order.
    const PLAYER_ORDER = ['currentPlayer','First', 'Second', 'Third', 'Fourth',];

    return declare("bgagame.homesteadersnewbeginnings", ebg.core.gamegui, {
        addMoveToLog: override_addMoveToLog,

        constructor: function(){
            // zone control
            this.token_zone = [];
            this.token_divId = [];
            
            // indexed by location [discard-0, Auctions-(1,2,3)]
            this.bid_token_divId =[];
            // auction bid zones
            this.bid_zone_divId= [];
            this.auction_zones = [];
            this.train_token_divId = []; // rail adv train token id.
            this.auction_ids = [];

            this.goldCounter = new ebg.counter();
            this.silverCounter = new ebg.counter();
            this.roundCounter = new ebg.counter();

            //player zones
            this.player_color = []; // indexed by player id
            this.player_score_zone_id = [];
            this.player_building_zone_id = [];
            this.player_building_zone = [];
                        
            // storage for buildings
            this.main_building_counts = []; // counts of each building_id in main zone. for use by update Buildings methods.
            
            this.building_worker_ids = [];
            this.score_resourceCounters = []; // player's resource counters
            
            // only this.player_id used for trade/loans/etc.
            this.board_resourceCounters = []; 
            this.pos_offset_resourceCounter = [];
            this.neg_offset_resourceCounter = [];
            this.new_resourceCounter = [];
            this.score_leftCounter = [];
            this.score_rightCounter = [];
            this.transactionCost = [];
            this.transactionLog = [];

            this.allowTrade = false;
            this.tradeEnabled = false;
            this.showPay = true;
            this.can_cancel = false;

            this.token_dimension = 50;
            this.bid_height = 52;
            this.bid_width = 46;
            this.worker_height = 35;
            this.worker_width = 33;
            this.warehouse_state = 0;
            
            this.player_count = 0;
            this.goldAmount = 0;
            this.silverCost = 0;
            this.first_player = 0;
            // for tracking current auction (for title update)
            this.current_auction = 1;
            this.number_auctions = 0;
            this.income_arr = [];

            this.b_connect_handler = [];
            this.hasBuilding = []; 
            this.last_selected = [];
            this.show_player_info = false;
            this.goldAsCopper = false;
            this.goldAsCow = false;
            this.undoPay = false;
            
            //new vars from expansion,
            this.cost_replace = [];
            this.building_discount = false;
        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            this.isSpectator = true;
            this.show_player_info = gamedatas.show_player_info;
            this.use_events = gamedatas.use_events;
            this.events = gamedatas.events;
            this.current_round = gamedatas.round_number;
            this.resource_info = gamedatas.resource_info;
            this.event_info = gamedatas.event_info;
            this.rail_no_build = gamedatas.rail_no_build;
            
            this.building_info = gamedatas.building_info;
            this.asset_strings = gamedatas.translation_strings;
            this.setupResourceTokens();
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                this.player_count++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            this.setupPlayerResources(gamedatas.player_resources, gamedatas.resources);
            if (!this.isSpectator){
                this.orientPlayerZones(gamedatas.player_order);
                this.setupTradeButtons();
            } else {
                this.spectatorFormatting();
            }
            if (this.player_count == 2){
                this.player_color[DUMMY_BID] = this.getAvailableColor();
                this.player_color[DUMMY_OPT] = this.player_color[0];
            }
            if (this.player_count <5){
                this.hideBoard2();
            }

            // Auctions: 
            this.number_auctions = gamedatas.number_auctions;
            this.setupAuctionTiles(gamedatas.auctions, gamedatas.auction_info);
            this.showCurrentAuctions(gamedatas.current_auctions);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);
            if (this.use_events){
                this.createEventCards();
                this.updateEventBanner(gamedatas.round_number);
            }
            
            dojo.place(FIRST_PLAYER_ID, this.player_score_zone_id[gamedatas.first_player]);
            this.first_player = Number(gamedatas.first_player);
            this.addTooltipHtml( FIRST_PLAYER_ID, `<span class="font caps">${_('First Bid in Next Auction')}</span><span class="fp_tile building_tile" style="display:block"></span>` ); 
            this.setupWorkers(gamedatas.workers);
            this.setupBidZones();
            this.setupBidTokens(gamedatas.bids);

            this.setupRailLines(gamedatas.players);
            this.setupRailAdvanceButtons(gamedatas.resource_info);
            this.setupShowButtons();
            if (gamedatas.round_number ==11){
                dojo.destroy('#round_number');
                $("round_text").innerHTML=_('Final Income and Scoring Round');
            } else {
                this.roundCounter.create('round_number');
                this.roundCounter.setValue(gamedatas.round_number);
            }
            this.showScoreTooltips(gamedatas.players);
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications(gamedatas.cancel_move_ids);
            this.updateBuildingAffordability();
            
            this.can_cancel = gamedatas.can_undo_trades;
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupPlayerAssets: function (player){
            const current_player_color = player.color_name;
            const p_id = player.p_id;            
            dojo.removeClass("player_zone_"+current_player_color, "noshow");
            if (this.player_id == p_id) {
                this.isSpectator = false;
            }
            const player_board_div = 'player_board_'+p_id;
            this.player_score_zone_id[p_id] = player_board_div;
            this.player_color[p_id] = current_player_color;
            if( this.player_id == p_id || this.show_player_info){
                dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
            } else {
                dojo.query(`#player_resources_${current_player_color} .player_resource_group`).addClass('noshow');
            }
            this.token_divId[p_id]  = `player_resources_${current_player_color}`;
            this.token_zone[p_id]   = 'worker_zone_'+ current_player_color;

            this.player_building_zone_id[p_id] = TPL_BLD_ZONE + this.player_color[p_id];
        },
        
        setupUseSilverCheckbox: function(checked){
            $('checkbox1').checked = (checked == 1);
            dojo.connect($('checkbox1'), 'change', this, 'toggleCheckbox');
        },

        /**
         * should only be called when not spectator, 
         * This will orient the player zones by player order (with this.player_id first)
         * @param {array} order_table 
         */
        orientPlayerZones: function (order_table){
            dojo.place(`player_zone_${this.player_color[this.player_id]}`, PLAYER_ORDER[0] , 'replace');
            let next_pId = order_table[this.player_id];
            for (let i = 1; i < this.player_count; i++){
                dojo.place(`player_zone_${this.player_color[next_pId]}`, PLAYER_ORDER[i] , 'replace');
                next_pId = order_table[this.player_id];
            }
            for(let i = this.player_count; i < PLAYER_ORDER.length; i++){
                dojo.destroy(PLAYER_ORDER[i]);
            }
        },

        spectatorFormatting: function (order_table){
            dojo.place(TRADE_BOARD_ID, "bottom", 'first');
            dojo.place(`top`, "board_area", 'first');
            dojo.style('top', 'flex-direction', 'row');
        },

        hideBoard2: function (){
            dojo.style("board_2", 'display', 'none');
        },

        /**
         * this is used to get color for dummy tokens 
         * Currently it should always be purple, but if purple is allowed as player color this will matter.
         */
        getAvailableColor: function(){
            let player_color_option = ['purple', 'blue', 'yellow', 'green', 'red'];
            for(let i in player_color_option){
                if (!this.player_color.includes(player_color_option[i]))
                {   
                    return player_color_option[i];
                }
            }
        },


        /**
         * should only be called when not spectator, 
         * It will put the player resources in the player Score area.
         * @param {*} player_resources - if hide player resources & not-spectator, fill resources with this
         * @param {*} resources        - otherwise use this to fill all resources.
         * @param {*} info 
         */
        setupPlayerResources: function (player_resources, resources){
            if (this.show_player_info){
                for (let player_res in resources){
                    this.setupOnePlayerResources(resources[player_res]);
                }
            } else if (!this.isSpectator){
                this.setupOnePlayerResources(player_resources);
            }
        },

        incResCounter(p_id, type, value){
            this.board_resourceCounters[p_id][type].incValue(value);
            this.score_resourceCounters[p_id][type].incValue(value);
        },

        /**
         * Resource array for this person.
         * @param {array} resource 
         */
        setupOnePlayerResources: function (resource) {
            //console.log('setupOnePlayerResources');
            this.board_resourceCounters[resource.p_id] = [];
            this.score_resourceCounters[resource.p_id] = [];
            for (const [key, value] of Object.entries(resource)) {
                //console.log(resource, key, value);
                if (key == "p_id" || key == "workers" || key == "track") continue;
                let tooltip_html = this.format_block('jptpl_res_tt', {value:this.replaceTooltipStrings(_(this.resource_info[key]['tt']))});
                
                let resourceId = `${key}count_${resource.p_id}`;
                this.addTooltipHtml( resourceId, tooltip_html);
                let iconId = `${key}icon_p${resource.p_id}`;
                this.addTooltipHtml( iconId, tooltip_html );

                this.score_resourceCounters[resource.p_id][key] = new ebg.counter();
                this.score_resourceCounters[resource.p_id][key].create(resourceId);
                this.score_resourceCounters[resource.p_id][key].setValue(value);

                let boardResourceId = `${key}count_${this.player_color[resource.p_id]}`;
                this.addTooltipHtml( boardResourceId, tooltip_html );
                let boardIconId = `${key}icon_${this.player_color[resource.p_id]}`;
                this.addTooltipHtml( boardIconId, tooltip_html );

                this.board_resourceCounters[resource.p_id][key] = new ebg.counter();
                this.board_resourceCounters[resource.p_id][key].create(boardResourceId);
                this.board_resourceCounters[resource.p_id][key].setValue(value);
            }

            let old_score_id = `player_score_${resource.p_id}`;
            dojo.query(`#${old_score_id}`).addClass('noshow');

            let new_score_id = `p_score_${resource.p_id}`;
            dojo.place(`<span id="${new_score_id}" class="player_score_value">0</span>`, old_score_id, 'after');
            this.score_leftCounter[resource.p_id] = new ebg.counter();
            this.score_leftCounter[resource.p_id].create(new_score_id);
            this.score_leftCounter[resource.p_id].setValue(0);

            let scoreLoanId = `player_total_score_${resource.p_id}`;
            dojo.place(`<span id="${scoreLoanId}" class="player_score_value_loan">0</span>`, new_score_id, 'after');
            this.score_rightCounter[resource.p_id] = new ebg.counter();
            this.score_rightCounter[resource.p_id].create(scoreLoanId);
            this.score_rightCounter[resource.p_id].setValue(0);
        },

        /**
         * Setup the Building Tiles, 
         * both in player areas as well as in the offer areas 
         * (main,discard,future)
         * @param {*} buildings 
         * @param {*} info 
         */
        setupBuildings: function(buildings) {
            for (let b_key in buildings){
                const building = buildings[b_key];  
                if (building.location == BLD_LOC_PLAYER){
                    this.addBuildingToPlayer(building);
                } else {
                    this.addBuildingToOffer(building);
                }
            }
        },

        /**
         * Setup the existing Tracks tokens (in player building section) built by players 
         * @param {*} tracks 
         */
        setupTracks: function(tracks){
            for(let i in tracks){
                const track = tracks[i];
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: this.player_color[track.p_id]}), this.token_divId[track.p_id]);
            }
            this.addTooltipHtmlToClass("token_track", `<div style="text-align:center;">${this.replaceTooltipStrings(this.resource_info['track']['tt'])}</div>`);
        },

        /**
         * Create Building worker slots 
         * that are used for assigning workers to buildings (when owned by players)
         * @param {*} building - information about the building to add slots to
         * @param {*} b_info - info from material.inc for building_id 
         */
         addBuildingWorkerSlots: function(b_id, b_key){
            const b_divId = `${TPL_BLD_TILE}_${b_key}`;
            if (b_id == BLD_BANK){
                dojo.place(`<div id="${BANK_DIVID}" class="bank trade_option"></div>`, b_divId,'last');
            } else if (b_id == BLD_MARKET){
                dojo.place(`<div id="${b_key}_${MARKET_FOOD_DIVID}" class="market_food trade_option"> </div><div id="${b_key}_${MARKET_STEEL_DIVID}" class="market_steel trade_option"> </div>`, b_divId,'last');
            } else if (b_id == BLD_WAREHOUSE){
                dojo.place(`<div id="${WAREHOUSE_RES_DIVID}"></div>`, b_divId, 'last');
            }
            if (!(this.building_info[b_id].hasOwnProperty('slot'))) return;
            let b_slot = this.building_info[b_id].slot;
            if (b_slot == 1){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: b_key, id: b_id}), b_divId);
            } else if (b_slot == 2){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 1, key: b_key, id: b_id}), b_divId);
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 2, key: b_key, id: b_id}), b_divId);
            } else if (b_slot == 3){
                dojo.place(this.format_block( 'jstpl_building_slot', {slot: 3, key: b_key, id: b_id}), b_divId);
            }
        },

        setupBuildingWorkerSlots: function(b_id, b_key){
            if (b_id == BLD_BANK){
                dojo.connect($(BANK_DIVID), 'onclick', this, 'onClickOnBankTrade');
            } else if (b_id == BLD_MARKET){
                dojo.connect($(`${b_key}_${MARKET_FOOD_DIVID}`), 'onclick', this, 'onClickOnMarketTrade');
                dojo.connect($(`${b_key}_${MARKET_STEEL_DIVID}`), 'onclick', this, 'onClickOnMarketTrade');
            }
            let b_info = this.building_info[b_id];
            if (!(b_info.hasOwnProperty('slot'))) return;
            let b_slot = b_info.slot;
            if (b_slot == 1){
                this.building_worker_ids[b_key] = [];
                this.building_worker_ids[b_key][1] = `slot_${b_key}_1`;
                this.addTooltipHtml( this.building_worker_ids[b_key][1], this.formatWorkerSlotTooltip(b_info ,1));
                dojo.connect($(this.building_worker_ids[b_key][1]), 'onclick', this, 'onClickOnWorkerSlot');
            } else if (b_slot == 2){
                this.building_worker_ids[b_key] = [];
                this.building_worker_ids[b_key][1] = `slot_${b_key}_1`;
                this.building_worker_ids[b_key][2] = `slot_${b_key}_2`;
                this.addTooltipHtml( this.building_worker_ids[b_key][1], this.formatWorkerSlotTooltip(b_info, 1));
                this.addTooltipHtml( this.building_worker_ids[b_key][2], this.formatWorkerSlotTooltip(b_info, 2));
                dojo.connect($(this.building_worker_ids[b_key][1]), 'onclick', this, 'onClickOnWorkerSlot');
                dojo.connect($(this.building_worker_ids[b_key][2]), 'onclick', this, 'onClickOnWorkerSlot');  
            } else if (b_slot == 3){
                this.building_worker_ids[b_key] = {1:`slot_${b_key}_3`, 2:`slot_${b_key}_3`, 3:`slot_${b_key}_3`};
                this.addTooltipHtml( this.building_worker_ids[b_key][3], this.formatWorkerSlotTooltip(b_info, 3));
                if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){
                    dojo.style(this.building_worker_ids[b_key][3], 'max-width', `${(this.worker_width*1.5)}px`);
            }
            dojo.connect($(this.building_worker_ids[b_key][3]), 'onclick', this, 'onClickOnWorkerSlot');
            }
        },
        
        formatWorkerSlotTooltip(b_info, slot_no){
            var tt = '<span class="worker_slot"></span>';
            if (slot_no == 3) { tt += '<span class="worker_slot"></span>'; }
            tt += " " + this.getOneResourceHtml('inc_arrow',1,true) + " " + this.getResourceArrayHtml(b_info['s'+slot_no], true);
            return tt;
        },

        /**
         * Create Workers that are hired by players, and place them in worker slots, if currently assigned.
         * @param {*} workers 
         */
        setupWorkers: function(workers) {
            for (let w_key in workers){
                const worker = workers[w_key];
                dojo.place(this.format_block( 'jptpl_worker', {id: w_key.toString()}), 
                        this.token_divId[worker.p_id] );
                const worker_divId = `token_worker_${w_key}`;
                //console.log(worker.b_key, worker.b_slot, this.building_worker_ids);
                if (worker.b_key != 0 ){ 
                    dojo.place(worker_divId, this.building_worker_ids[worker.b_key][worker.b_slot]);
                } else {
                    dojo.place(worker_divId, this.token_zone[worker.p_id]);
                }
                if (worker.p_id == this.player_id){
                    dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                }
            }
        },
        
        /**
         * connect actions to the Bid Slots, used for bids.
         */
        setupBidZones: function () {
            this.bid_zone_divId[ZONE_PENDING] = 'pending_bids';
            this.bid_zone_divId[ZONE_PASSED] = 'passed_bids';
            
            let auc_end = (this.player_count==5?4:3);
            for (let auc = 1; auc <= auc_end; auc++){
                this.bid_zone_divId[auc] = [];
                for (let bid =0; bid < BID_VAL_ARR.length; bid ++){
                    this.bid_zone_divId[auc][bid] = `bid_slot_${auc}_${BID_VAL_ARR[bid]}`;
                    dojo.connect($(this.bid_zone_divId[auc][bid]), 'onclick', this, 'onClickOnBidSlot');
                }
            }
        },

        /**
         * Creates the player Bid Tokens (Boot) and puts them in locations mapping to their position on auction board.
         * @param {*} bids 
         */
        setupBidTokens: function(bids) {
            for(let p_id in bids){
                const token_bid_loc = bids[p_id].bid_loc;
                const token_color = this.player_color[p_id];
                if( p_id == DUMMY_OPT) {
                    this.bid_token_divId[p_id] = `token_bid_${token_color}_dummy`;
                    dojo.place(this.format_block( 'jptpl_dummy_player_token', {color: token_color, type: "bid"}), this.bid_zone_divId[ZONE_PENDING]);
                } else {
                    this.bid_token_divId[p_id] = `token_bid_${token_color}`;
                    dojo.place(this.format_block( 'jptpl_player_token', {color: token_color, type: "bid"}), this.bid_zone_divId[ZONE_PENDING]);
                }
                //pending is default.
                if (token_bid_loc == BID_PASS) {
                    dojo.place(this.bid_token_divId[p_id], this.bid_zone_divId[ZONE_PASSED]);
                } else if (token_bid_loc != NO_BID){ 
                    dojo.place(this.bid_token_divId[p_id], this.getBidLocDivIdFromBidNo(token_bid_loc));
                }
            }
        },

        /**
         * Creates, and places the player train tokens on the auction board.
         * @param {*} players 
         */
        setupRailLines: function(players) {
            for(let p_id in players){
                const player_rail_adv = players[p_id].rail_adv;
                this.train_token_divId[p_id] = `token_train_${this.player_color[p_id]}`;
                dojo.place(this.format_block( 'jptpl_player_token', 
                    {color: this.player_color[p_id].toString(), type: "train"}), `train_advancement_${player_rail_adv}`);
            }
        },

        showScoreTooltips: function(players) {
            for(let p_id in players){
                this.calculateAndUpdateScore(p_id);
            }
        },

        /**
         * connects click actions to buttons for selecting Trade actions, 
         * should only be called if not spectator.
         * 
         * it also will assign click action to the button for approve trade/undo transactions.
         */
        setupTradeButtons: function(){
            dojo.connect($(UNDO_TRADE_BTN_ID), 'onclick', this, 'undoTransactionsButton');
            dojo.connect($(UNDO_LAST_TRADE_BTN_ID), 'onclick', this, 'undoLastTransaction');
            const options = dojo.query(`#${TRADE_BOARD_ID} .trade_option`);
            for(let i in options){
                if (options[i].id){
                    dojo.connect($(options[i]), 'onclick', this, 'onSelectTradeAction' );
            }   }
            // create new and offset counters
            for (const [key, value] of Object.entries(this.resource_info)) {
                if ( key == "workers" || key == "track") continue;
                this.pos_offset_resourceCounter[key] = new ebg.counter();
                this.pos_offset_resourceCounter[key].create(`${key}_pos`);
                this.pos_offset_resourceCounter[key].setValue(0);
                this.neg_offset_resourceCounter[key] = new ebg.counter();
                this.neg_offset_resourceCounter[key].create(`${key}_neg`);
                this.neg_offset_resourceCounter[key].setValue(0);
                this.new_resourceCounter[key] = new ebg.counter();
                this.new_resourceCounter[key].create(`${key}_new`);
                this.new_resourceCounter[key].setValue(0);
            }
            this.resetTradeValues();
        },

        setupWarehouseButtons: function(){
            let warehouseResources = this.getWarehouseResources();
            console.log('setupWarehouseButtons', );

            for (let type in warehouseResources){
                if (type == 'length') continue;
                this.addActionButton( `btn_warehouse_${type}`, this.tkn_html[type], `onClickWarehouseResource`, null, false, 'gray');
                this.warehouse = type;
            }
            
            dojo.addClass(`btn_warehouse_${this.warehouse}`, 'bgabutton_blue' );
            dojo.removeClass(`btn_warehouse_${this.warehouse}`, 'bgabutton_gray');
        },
        
        onClickWarehouseResource: function( evt ){
            let target_id = evt.target.id;
            let target_type = target_id.split('_')[2];
            dojo.removeClass(`btn_warehouse_${this.warehouse}`, 'bgabutton_blue');
            dojo.addClass(`btn_warehouse_${this.warehouse}`, 'bgabutton_gray');
            this.warehouse = target_type;
            dojo.addClass(`btn_warehouse_${target_type}`, 'bgabutton_blue');
            dojo.removeClass(`btn_warehouse_${target_type}`, 'bgabutton_gray');
            
            this.resetTradeValues();
            this.setOffsetForIncome();
        },

        /**
         * Connects click actions to the bonus actions for get Rail advancement action.
         * 
         * @param {*} resource_info 
         */
        setupRailAdvanceButtons: function(resource_info){
            const bonus_options = dojo.query('.train_bonus');
            for(let i in bonus_options){
                if (bonus_options[i].id){
                    dojo.connect($(bonus_options[i].id),'onclick', this, 'onSelectBonusOption');
                    let type = bonus_options[i].id.split('_')[3];
                    if (type in resource_info)
                        this.addTooltipHtml(resource_info[type].tt);
                } 
            }
        },

        setupResourceTokens(){
            this.tkn_html = [];
            for(let type in RESOURCES){
                this.tkn_html[type] = this.format_block( 'jstpl_resource_inline', {type:type}, );
                this.tkn_html["big_"+type] = this.format_block( 'jstpl_resource_inline', {type:"big_"+type}, );
            }
            this.tkn_html.arrow = this.format_block( 'jstpl_resource_inline', {type:'arrow'}, );
            this.tkn_html.inc_arrow = this.format_block( 'jstpl_resource_inline', {type:'inc_arrow'}, );
            for (let i in VP_TOKENS){
                this.tkn_html[VP_TOKENS[i]] = this.format_block( 'jstpl_resource_inline', {type:VP_TOKENS[i]}, );
                this.tkn_html["bld_"+VP_TOKENS[i]] = this.format_block('jstpl_resource_log', {"type" : VP_TOKENS[i] + " bld_vp"});
            }
            this.tkn_html.bld_vp = this.format_block('jstpl_resource_log', {"type" : "vp bld_vp"});
            this.tkn_html.track = this.getOneResourceHtml('track', 1, true);
            this.tkn_html.loan = this.format_block( 'jptpl_track_log', {type:'loan'}, );
            
            let types = {'and':_("AND"), 'or':_("OR"), 'dot':"•"};
            for(let i in types){
                this.tkn_html[i] = this.format_block('jptpl_tt_break', {text:types[i], type:'dot'==i?'dot':'break'});
            }
            types = [0,1,2,3,4,11,12,13,14]; // from ASSET_COLORS
            for (let i=0; i< 5; i++){
                this.tkn_html[ASSET_COLORS[i]] = this.format_block('jstpl_color_log', 
                {'string':_(this.asset_strings[i]), 'color':ASSET_COLORS[i]});
            }
            types = {10:'4', 11:'1', 12:'2', 13:'3'};
            for (let i in types){
                this.tkn_html['a'+types[i]] = this.format_block('jstpl_color_log', 
                {'string':dojo.string.substitute(_("Auction ${a}"),{a:types[i]}), 'color': 'auc'+types[i]} );
            }
            this.tkn_html.adv_track = _(this.asset_strings[7]);
            //console.log(this.tkn_html);
        },

        /**
         * Connect the actions for 
         *   the future auctions button
         *   the building discard button
         *   the future building button
         * and then call the method that will show/hide them based upon if those areas have buildings/auctions in them.
         */
        setupShowButtons: function(){
            dojo.connect($(TOGGLE_BTN_ID[AUC_LOC_FUTURE]), 'onclick', this, 'toggleShowAuctions');
            dojo.connect($(TOGGLE_BTN_ID[BLD_LOC_OFFER]), 'onclick', this, 'toggleShowBldMain');
            dojo.connect($(TOGGLE_BTN_ID[BLD_LOC_DISCARD]),  'onclick', this, 'toggleShowBldDiscard');
            dojo.connect($(TOGGLE_BTN_ID[BLD_LOC_FUTURE]),  'onclick', this, 'toggleShowBldFuture');
            this.showHideButtons();
        },

        showHideToggleButton: function(index, tileId = TPL_BLD_TILE){
            let tile_count = dojo.query(`#${TILE_ZONE_DIVID[index]} .${tileId}`).length;
            if (tile_count == 0){
                dojo.addClass(TOGGLE_BTN_ID[index], 'noshow');
                dojo.query(`#${TILE_CONTAINER_ID[index]}`).addClass('noshow');
            } else {
                dojo.removeClass(TOGGLE_BTN_ID[index], 'noshow');

            }
        },

        /**
         * show/hide the 
         *   the future auctions button
         *   the building discard button
         *   the future building button
         *   the Main building button
         * such that if the areas have building tiles or auction tiles in them, they will be shown.
         */
        showHideButtons: function(){
            this.showHideToggleButton(AUC_LOC_FUTURE, TPL_AUC_TILE);
            this.showHideToggleButton(BLD_LOC_DISCARD);
            this.showHideToggleButton(BLD_LOC_FUTURE);
            this.showHideToggleButton(BLD_LOC_OFFER);
        },

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            if (args && args.args && args.args.hidden) {
                this.gamedatas.gamestate.description = this.gamedatas.gamestate.descriptionhidden;
                this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturnhidden;
                this.updatePageTitle();
            }
            if (args && args.args && args.args.alternate) {
                this.gamedatas.gamestate.description = this.gamedatas.gamestate.descriptionalternate;
                this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate.descriptionmyturnalternate;
                this.updatePageTitle();
            }
            this.currentState = stateName;
            //console.log('onEnteringState', stateName);
            switch( stateName )
            {
                case 'startRound':
                    this.setupTiles (args.args.round_number, 
                        args.args.auctions);  
                    this.allowTrade = false;
                    this.can_cancel = false;
                    break;
                case 'payWorkers':
                    this.setupBidsForNewRound();
                    this.goldAmount = 0;
                    break;
                case 'allocateWorkers':              
                    this.showPay = true;
                break;

                case 'dummyPlayerBid':
                    const dummy_bid_id = this.bid_token_divId[DUMMY_BID];
                    dojo.addClass(dummy_bid_id, 'animated');
                break;
                case 'playerBid':
                    const active_bid_id = this.bid_token_divId[this.getActivePlayerId()];
                    dojo.addClass(active_bid_id, 'animated');
                    dojo.style(TRADE_BOARD_ID, 'order', 4);
                    break;
                case 'getRailBonus':
                case 'getRailBonus_event':
                case 'getRailBonus_auction':
                case 'getRailBonus_build':
                    //rail bonus.
                    const active_train = this.train_token_divId[this.getActivePlayerId()];
                    dojo.addClass(active_train, 'animated');
                    break;
                case 'payAuction':
                    //build building
                case 'chooseBuildingToBuild':
                case 'chooseBuildingToBuild_event':
                case 'trainStationBuild':
                    // choose bonus
                case 'bonusChoice_build':
                case 'bonusChoice_event':
                case 'bonusChoice_auction':
                    if (!this.isSpectator){
                        dojo.style(TRADE_BOARD_ID, 'order', 2);
                    }
                case 'endRound':
                    break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            //console.log('onLeavingState', stateName);
            switch( stateName )
            {
                case 'setupRound':
                case 'collectIncome':
                    break;
                case 'dummyPlayerBid':
                    const dummy_bid_id = this.bid_token_divId[DUMMY_BID];
                    dojo.removeClass(dummy_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                break;
                case 'playerBid':
                    const active_bid_id = this.bid_token_divId[this.getActivePlayerId()];
                    dojo.removeClass(active_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                    this.showPay = false;
                    break;
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                case 'chooseBuildingToBuild_event':
                    this.resetTradeValues();    
                    this.disableTradeIfPossible();
                    this.disableTradeBoardActions();
                    this.destroyBuildingBreadcrumb();
                    this.orderZone(BLD_LOC_OFFER, 8);

                    this.clearSelectable('building', true);
                    this.destroyBuildingBreadcrumb();
                    this.fixBuildingOrder();
                    break;
                case 'allocateWorkers':
                    this.clearSelectable('worker', true); 
                    this.clearSelectable('worker_slot', false);
                    this.can_cancel = false;
                    this.destroyIncomeBreadcrumb();
                    this.income_arr=[];
                    this.disableTradeIfPossible();
                case 'payAuction':
                case 'bonusChoice':
                    this.disableTradeIfPossible();
                    break;
                case 'payWorkers':
                    this.showPay = false;
                    this.silverCost = 0;
                    this.goldAmount = 0;
                    this.destroyPaymentBreadcrumb();
                    this.disableTradeIfPossible();
                    this.clearOffset();
                    break;
                case 'endBuildRound':
                    this.clearAuction();
                    break;
                case 'confirmActions':
                    this.can_cancel = false;
                case 'getRailBonus':
                case 'getRailBonus_event':
                case 'getRailBonus_auction':
                case 'getRailBonus_build':
                    this.clearSelectable('bonus', true);
                    const active_train = this.train_token_divId[this.getActivePlayerId()];
                    dojo.removeClass(active_train, 'animated');
                    this.disableTradeIfPossible();
                    break;
                case 'endRound':
                case 'dummy':
                    break;
                
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            if( this.isCurrentPlayerActive() )
            {           
                // Call appropriate method
                var methodName = "onUpdateActionButtons_" + stateName;
                if (this[methodName] !== undefined) {    
                    console.log('Calling ' + methodName, args);
                    this[methodName](args);
                }
            } else if (!this.isSpectator) {
                switch( stateName ) {
                    case 'allocateWorkers':
                        var methodName = "onUpdateActionButtons_" + stateName + "_notActive";
                        //console.log('Calling ' + methodName, args);
                        this[methodName](args);
                    break;
                }
            } 
        }, 

        ///////////////////////////////////////////////////
        //// onUpdateActionButtons

        onUpdateActionButtons_allocateWorkers: function(){
            this.last_selected['worker'] ="";
            // show workers that are selectable
            dojo.query( `#player_zone_${this.player_color[this.player_id]} .token_worker` ).addClass('selectable');
            // also make building_slots selectable.
            dojo.query( `#${TPL_BLD_ZONE}${this.player_color[this.player_id]} .worker_slot` ).addClass( 'selectable' );

            
            this.addActionButton( 'btn_done',_('Confirm'), 'donePlacingWorkers' );
            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
            this.addActionButton( 'btn_cancel_button', _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
            this.tradeEnabled = false;
            // warehouse
            if (this.hasBuilding[this.player_id][BLD_WAREHOUSE]){
                this.setupWarehouseButtons();
            }
            
            this.addTradeActionButton();
            this.setOffsetForIncome();
            this.destroyPaymentBreadcrumb();
        },
        // -non-active-
        onUpdateActionButtons_allocateWorkers_notActive(args){
            // --to handle showing correctly with undo and pay workers during this state--
            if ((args.paid[this.player_id].has_paid==0 || this.undoPay)){
                this.silverCost = this.getPlayerWorkerCount(this.player_id);
                this.goldAmount = 0;
                this.allowTrade = this.showPay;
                this.addPaymentButtons();
            } 
            if (dojo.query('#button_unpass').length !=1){
                this.addActionButton('button_unpass', _('undo'), 'onUnPass', null, false, 'red');
                dojo.place('button_unpass', 'generalactions', 'first');
            }
        },

        onUpdateActionButtons_payWorkers: function(){
            this.silverCost = this.getPlayerWorkerCount(this.player_id);
            this.goldAmount = 0;
            this.addPaymentButtons(true);
        },
        //2-player dummy bid phase
        onUpdateActionButtons_dummyPlayerBid: function(args){
            this.last_selected['bid'] = '';
            for (let bid_key in args.valid_bids) {
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( 'btn_confirm', _('Confirm Dummy Bid'), 'confirmDummyBidButton' );
        },
        onUpdateActionButtons_playerBid: function(args){
            this.last_selected['bid'] = '';
            for (let bid_key in args.valid_bids) {// mark bid_slots as selectable
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( 'btn_confirm', _('Confirm Bid'), 'confirmBidButton' );
            this.addActionButton( 'btn_pass',    _('Pass'),    'passBidButton', null, false, 'red' );
        },
        onUpdateActionButtons_pass_event: function (args) {
            // state for pass bid event triggers.
            this.addActionButton( 'btn_undo_pass', _('Undo'), 'onUndoBidPass', null, false, 'red');
            if (args.event_pass == EVT_PASS_DEPT_SILVER){
                this.addActionButton( 'btn_loan_silver', this.replaceTooltipStrings(_('pay off ${loan} for ${silver}${silver}${silver}')), 'payLoan3Silver', null, false, 'blue');
            }
            this.addActionButton( 'btn_done_pass_event', _('Done'), 'donePassEvent', null, false, 'blue');
            this.addTradeActionButton();
        },
        onUpdateActionButtons_getRailBonus: function(args){
            if (args.can_undo){
                this.addActionButton( 'btn_undo_pass', _('Undo'), 'onUndoBidPass', null, false, 'red');
            }
            this.setupButtonsForRailBonus(args);
        },
        onUpdateActionButtons_getRailBonus_auction: function(args){
            this.setupButtonsForRailBonus(args);
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            this.can_cancel = true;
        },
        onUpdateActionButtons_getRailBonus_build: function(args){
            this.setupButtonsForRailBonus(args);
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            this.can_cancel = true;
        },
        onUpdateActionButtons_getRailBonus_event: function(args){
            this.setupButtonsForRailBonus(args);
        },
        // does buttons for these
        setupButtonsForRailBonus: function (args){
            this.last_selected.bonus  ="";
            for(let i in args.rail_options){
                let type = this.getKeyByValue(RESOURCES, args.rail_options[i]);
                const id = BONUS_OPTIONS[args.rail_options[i]];
                dojo.addClass(id, 'selectable');
                if (type == 'vp'){
                    this.addActionButton( `btn_bonus_${type}`, this.tkn_html.vp3, 'selectBonusButton', null, false, 'gray');
                } else {
                    this.addActionButton( `btn_bonus_${type}`, this.tkn_html[type], 'selectBonusButton', null, false, 'gray');
                }
            }
            this.addActionButton( 'btn_choose_bonus', _('Choose Bonus'), 'doneSelectingRailBonus');
            dojo.style('btn_choose_bonus', 'display', 'none');
        },
        onUpdateActionButtons_payLot: function(args){
            this.silverCost = Number(args.lot_cost);
            this.goldAmount = 0;
            this.addPaymentButtons(true);
        },
        onUpdateActionButtons_chooseBuildingToBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            if (Number(args.current_event)== 1){
                this.building_discount = true;
            } else {
                this.building_discount = false;
            }
            this.genericSetupBuildBuildings();
        },
        onUpdateActionButtons_trainStationBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            this.building_discount = false;
            this.genericSetupBuildBuildings();
        },
        // currently only bonus involving a choice is hire worker.
        onUpdateActionButtons_bonusChoice_build: function (args) {
            if (args.building_bonus == BUILD_BONUS_WORKER){
                this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:this.tkn_html.worker}), 'workerForFreeBuilding');
            } 
            this.addActionButton( 'btn_pass_bonus',   _('Do Not Get Bonus'), 'passBonusBuilding', null, false, 'red');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
            this.can_cancel = true;
        },
        onUpdateActionButtons_bonusChoice_auction: function (args) {
            let option = Number(args.auction_bonus);
            switch (option){
                case AUC_BONUS_WORKER:
                case AUC_BONUS_WORKER_RAIL_ADV:
                    this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:this.tkn_html.worker}) , 'workerForFreeAuction');
                break;
                case AUC_BONUS_WOOD_FOR_TRACK:
                    this.addActionButton( 'btn_wood_track', `${this.tkn_html.wood} ${this.tkn_html.arrow} ${this.tkn_html.track}`, 'woodForTrack');
                break;
                case AUC_BONUS_COPPER_FOR_VP:
                    this.addActionButton( 'btn_copper_vp', `${this.tkn_html.copper} ${this.tkn_html.arrow} ${this.tkn_html.vp4}`, 'copperFor4VP');
                    if (args.riverPort){
                        this.addActionButton( 'btn_gold_copper', `${this.tkn_html.gold} ${this.tkn_html.arrow} ${this.tkn_html.vp4}`, 'goldFor4VP');
                    }
                    break;
                case AUC_BONUS_COW_FOR_VP:
                    this.addActionButton( 'btn_cow_vp', `${this.tkn_html.cow} ${this.tkn_html.arrow} ${this.tkn_html.vp4}`, 'cowFor4VP');
                    if (args.riverPort){
                        this.addActionButton( 'btn_gold_cow', `${this.tkn_html.gold} ${this.tkn_html.arrow} ${this.tkn_html.vp4}`, 'goldFor4VP');
                    }
                    break;
                case AUC_BONUS_6VP_AND_FOOD_VP:
                case AUC_BONUS_FOOD_FOR_VP:
                    this.addActionButton( 'btn_food_vp', `${this.tkn_html.food} ${this.tkn_html.arrow} ${this.tkn_html.vp2}`, 'foodFor2VP');
                    break;
                case AUC_BONUS_4DEPT_FREE:
                    break;
                case AUC_BONUS_3VP_SELL_FREE:
                    // sell for free (no trade)
                    break;
                case AUC_BONUS_TRACK_RAIL_ADV: // should not come here
                    break;
            }
            this.addActionButton( 'btn_pass_bonus',       _('Do Not Get Bonus'), 'passBonusAuction', null, false, 'red');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),           'cancelTurn', null, false, 'red');
            this.addTradeActionButton();
        },
        onUpdateActionButtons_confirmActions: function () {
            this.updateBuildingAffordability();
            this.addActionButton( 'btn_done',             _('Confirm'),  'confirmBuildPhase');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            this.can_cancel = true;
        },
        onUpdateActionButtons_endGameActions: function () {
            this.addActionButton( 'btn_done',          _('Done'),                    'doneEndgameActions');    
            this.addActionButton( 'btn_pay_loan_silver', dojo.string.substitute(_('Pay Loan ${type}'), {type:this.tkn_html.silver}), 'payLoanSilver', null, false, 'gray');
            this.addActionButton( 'btn_pay_loan_gold',   dojo.string.substitute(_('Pay Loan ${type}'), {type:this.tkn_html.gold}),'payLoanGold',   null, false, 'gray');
            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
            this.addActionButton( 'btn_cancel_button', _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
            this.addTradeActionButton();
        },
        ////////////////////
        //// EVENTS onUpdateActionButtons states 
        ////////////////////
        onUpdateActionButtons_chooseBuildingToBuild_event: function (args) {
            this.allowed_buildings = args.allowed_buildings;
            this.building_discount = false;
            this.genericSetupBuildBuildings();
        },

        onUpdateActionButtons_preEventTrade: function (args) {
            let bonus_id = args.bonus_id;
            switch(bonus_id){
                case EVT_SELL_NO_TRADE:
                    this.addActionButton( 'btn_start_sell', _('Sell Free'), 'startSellFree', null, false, 'blue');
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneTradingEvent', null, false, 'blue');
                    this.addTradeActionButton();
                    break;
                case EVT_PAY_LOAN_FOOD:
                    this.addActionButton( 'pay_loan_food', this.replaceTooltipStrings(_('pay ${loan} with ${food}')),'payLoanWithFood', null, false, 'blue' );
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneTradingEvent', null, false, 'blue');
                    this.addTradeActionButton();
                    break;
                case EVT_COPPER_COW_GET_GOLD:
                    this
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneHiddenTradingEvent', null, false, 'blue');
                    this.addActionButton( 'btn_take_loan', _('Take Debt'), 'onMoreLoan', null, false, 'gray' );
                    this.addActionButton( TRADE_BUTTON_ID, _("Show Trade"),'tradeActionButton', null, false, 'gray' );
                    this.addActionButton( CONFIRM_TRADE_BTN_ID, _("Confirm Trade"),'confirmHiddenTradeButton', null, false, 'blue' );
                    dojo.style(CONFIRM_TRADE_BTN_ID, 'display', 'none');
                    dojo.style(TRADE_BOARD_ID, 'order', 2);
                    
                    this.updateTradeAffordability();
                    this.resetTradeValues();
                    if (this.board_resourceCounters[this.player_id].trade.getValue() ==0) {
                        this.tradeEnabled = false;
                        dojo.query(`#${TRADE_BUTTON_ID}`).addClass('noshow');
                    } else {
                        this.enableTradeBoardActions();
                    }
                    // players get trade opportunity (trades are hidden during this phase).
                    // then reveal amount of Copper+Cow
                    // the player(s) with the most (at least 1) get a gold.
                    break;
                case EVT_VP_4SILVER:
                case EVT_VP_FOR_WOOD:
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneTradingEvent', null, false, 'blue');
                    this.addTradeActionButton();
                    break;
                default:
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneTradingEvent', null, false, 'blue');
                    this.addTradeActionButton();
            }
        },
        onUpdateActionButtons_bonusChoice_eventBuild: function (args){
            this.onUpdateActionButtons_bonusChoice_build(args);
        },

        onUpdateActionButtons_bonusChoice_event: function (args){
            let option = Number(args.event_bonus);
            switch (option){
                case EVT_LOAN_TRACK:    // least loans
                case EVT_RES_ADV_TRACK: // most residential buildings get track adv
                    this.setupButtonsForRailBonus(args.args[this.player_id]);
                    dojo.destroy('btn_choose_bonus');
                    this.addActionButton( 'btn_choose_bonus', _('Choose Bonus'), 'doneSelectingRailBonusEvent');
                case EVT_LEAST_WORKER: //least workers can hire worker (free).
                    this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:this.tkn_html.worker}), 'workerForFreeEvent');
                    this.addActionButton( 'btn_pass_bonus', _('Do Not Get Bonus'), 'passBonusEvent', null, false, 'red');
                break;
            }
        },
        onUpdateActionButtons_EventPay: function (args){
            this.silverCost= args.cost[this.player_id].cost;
            this.goldAmount = 0;
            this.addPaymentButtons(true);
        },
        onUpdateActionButtons_bonusChoice_lotEvent: function (args){
            let option = Number(args.event_bonus);
            switch (option){
                case EVT_AUC_2SILVER_TRACK: // auction winners can pay 2 silver for track
                    this.addActionButton( 'btn_silver_track', `${this.tkn_html.silver}${this.tkn_html.silver} ${this.tkn_html.arrow} ${this.tkn_html.track}`, 'silver2ForTrack');
                break;
                case EVT_AUC_BONUS_WORKER: // Auc 1 also gives worker
                    this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:this.tkn_html.worker}) , 'workerForFreeLotEvent');
                break;
                case EVT_AUC_STEEL_ANY:
                    this.addActionButton( 'btn_steel_build', this.replaceTooltipStrings(_('Pay ${steel} to build ${any}')) , 'steelBuildBuilding');
                break;
            }
            this.addActionButton( 'btn_pass_bonus',       _('Do Not Get Bonus'), 'passBonusLotEvent', null, false, 'red');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),           'cancelTurn', null, false, 'red');
            this.addTradeActionButton();
        },
        
        ////////////////////
        //// END updateActionButtons
        ///////////////////////////////////////////////////

        ///////////////////////////////////////////////////
        //// Utility methods

        /***** Animations helper methods. *****/
        toggleAnimations: function(){
            if (this.animations){
                this.animations = false;
            } else {
                this.animations = true;
            }
        },

        /*** setup new Round ***/
        setupTiles: function(round_number, auction_tiles) {
            if (round_number == 11){
                dojo.destroy('#round_number');
                $("round_text").innerHTML=_('Final Income and Scoring Round');
                dojo.query(`#${TILE_CONTAINER_ID[BLD_LOC_OFFER]}`).addClass('noshow');
            } else {
                this.roundCounter.setValue(round_number);
            }
            this.showCurrentAuctions(auction_tiles, round_number);
            if (this.use_events){
                this.updateEventBanner(round_number);
            }
        },

        /**
         * Update the main building stock to match the current state.  
         * It should only be called on round 5 & 8, but could be called more.
         * @param {Array} buildings 
         */
        updateBuildingStocks: function(buildings){
            for (let b_key in buildings){
                const building = buildings[b_key];
                if (building.location == BLD_LOC_OFFER || building.location == BLD_LOC_DISCARD) {
                    this.addBuildingToOffer(building);
                }
            }
        },

        /***** Auction utils ******/
        setupAuctionTiles: function (auctions, info){
            for (let a_id in auctions){
                const auction = auctions[a_id];
                if (auction.location !=AUCLOC_DISCARD) {
                    this.createAuctionTile(a_id, auction.location, info);
                }
            }
        },

        createAuctionTile: function (a_id, location, info){
            let color = ASSET_COLORS[10+Number(location)];
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_auction_tile', {auc: a_id, color:color}), `future_auction_${location}`);
                this.addTooltipHtml(`${TPL_AUC_TILE}_${a_id}`, this.formatTooltipAuction(info, a_id));
            } else {
                let text_auction_html = this.formatTooltipAuction(info, a_id);
                dojo.place(this.format_block('jptpl_auction_text', {auc: a_id, color:color, 'card':text_auction_html}), `future_auction_${location}`);
            }
            dojo.style(`${TPL_AUC_TILE}_${a_id}`, 'order', a_id);
        },

        formatTooltipAuction: function (a_info, a_id){
            var tt = '<div style="text-align: center;" class="font">';
            var auction_no = Math.ceil(a_id/10); // (1-10) = 1; (11-20) = 2; etc...
            if (auction_no== 1) {// order fixed in A-1
                let round_string = dojo.string.substitute(_('Round ${a_id}'),{a_id:a_id});
                var title = `<span class="font caps bold a1">${round_string} </span><hr>`;
            } else { //order by phase in other auctions
                if ((a_id-1)%10 <4){
                    var phase = _("Settlement");
                } else if ((a_id-1)%10 >7){
                    var phase = _("City");
                } else {
                    var phase = _("Town");
                }
                var title = `<span class="font caps bold a${auction_no}">${phase}</span><hr>`
            }
            tt += title ;
            if (a_info[a_id].build){// there is a build
                var build = "";
                let build_arr = a_info[a_id].build;
                if (build_arr.length == 4){//any
                    build += this.replaceTooltipStrings(_(" Build: ${any} type"));
                } else {
                    let build_html = [];
                    for(let i in build_arr){
                        let b_type = build_arr[i];
                        build_html[i]= dojo.string.substitute(_(" Build: ${building_type}"), {building_type:this.tkn_html[ASSET_COLORS[b_type]]} );
                    }
                    build += build_html.join(this.tkn_html.or);
                }
                tt += build;
            }

            if (a_info[a_id].bonus) {// there is a bonus;
                var bonus_html = "";
                if (a_info[a_id].build){
                    bonus_html = this.tkn_html.and;
                }
                switch (a_info[a_id].bonus){
                    case AUC_BONUS_WORKER:
                        bonus_html += this.replaceTooltipStrings(_("May hire a ${worker} (for free)"));
                    break;
                    case AUC_BONUS_WORKER_RAIL_ADV:
                        bonus_html += this.replaceTooltipStrings(_("May hire a ${worker} (for free) ${and} Advance the Railroad track"));
                    break;
                    case AUC_BONUS_WOOD_FOR_TRACK:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${wood} for ${track}(once)"));
                    break;
                    case AUC_BONUS_COPPER_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${copper} for ${vp4}(once)"));
                    break;
                    case AUC_BONUS_COW_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${cow} for ${vp4}(once)"));
                    break;
                    case AUC_BONUS_6VP_AND_FOOD_VP:
                        bonus_html += this.replaceTooltipStrings(_("Gain ${vp6} ${and} May trade ${food} for ${vp2}(once)"))
                    break;
                    case AUC_BONUS_FOOD_FOR_VP:
                        bonus_html += this.replaceTooltipStrings(_("May trade ${food} for ${vp2}(once)"));
                    break;
                    case AUC_BONUS_NO_AUCTION:
                        bonus_html += this.replaceTooltipStrings(_("No Auction"));
                    break;
                    case AUC_BONUS_TRACK_RAIL_ADV:
                        bonus_html += this.replaceTooltipStrings(_("${track} ${and} Advance the Railroad track"));
                    break;
                    case AUC_BONUS_4DEPT_FREE:
                        bonus_html += this.replaceTooltipStrings(_("may pay off up to 4 ${loan}"));
                    break;
                    case AUC_BONUS_3VP_SELL_FREE:
                        bonus_html += this.replaceTooltipStrings(_("${vp3} ${and} May sell any number of resources without spending ${trade}"));
                    break;
                }
                tt += bonus_html;
            }

            return tt + '</div>';
        },

        /**
         * setup auction cards for the current round in the Auction board.
         * The intent is that this will be called when a new round is started,
         * as well as on initial setup once the auction_zones have been configured.
         * 
         * @param {Array} auctions 
         * @param {Number} current_round 
         */
        showCurrentAuctions: function (auctions){
            this.current_auction = 0;
            for (let i in auctions){
                const auction = auctions[i];
                this.moveObject(`${TPL_AUC_TILE}_${auction.a_id}`, `${TPL_AUC_ZONE}${auction.location}`)
                if (this.current_auction == 0) 
                    this.current_auction = auction.location;

            }
        },

        /**
         * The plan is for this to be called after each auction tile is resolved (building & bonuses)
         * it should remove the auction tile at auction_no, so that it is clear what state we are at. 
         */
        clearAuction: function(){
            const auc_id = dojo.query(`#${TPL_AUC_ZONE}${this.current_auction} .auction_tile`)[0].id;
            if (auc_id){
                dojo.destroy(auc_id);
            }

            const bid_token = dojo.query(`[id^="bid_slot_${this.current_auction}"] [id^="token_bid"]`);
            for(let i in bid_token){
                if (bid_token[i].id){
                    const bid_color = bid_token[i].id.split('_')[2];                        
                    for(let p_id in this.player_color){
                        if (p_id == DUMMY_OPT) continue;
                        if (this.player_color[p_id] == bid_color){
                            this.moveBid(p_id, BID_PASS);
                        }
                    }
                }
            }
            if (this.current_auction < this.number_auctions){ this.current_auction++;}
            else { this.current_auction = 1; }
        },

        /***** events utils ******/
        createEventCards: function(){
            for (let i in this.events){
                let event = this.event_info[this.events[i].e_id];
                //do a thing for each event...
                dojo.place(this.format_block('jptpl_evt_tt', {'pos': this.events[i].position, TITLE: _("Round ") + this.events[i].position + ":<br>" + this.replaceTooltipStrings(event.name), DESC: this.replaceTooltipStrings(event.tt)}), EVT_ZONE,'last');
            }
        },

        updateEventBanner: function(current_round){
            for(var i in this.events){
                //console.log(this.events[i]);
                if (Number(this.events[i].position) == current_round){
                    break;  
                }
            }
            
            if (this.events[i] != null){
                let text = this.replaceTooltipStrings(_(this.event_info[this.events[i].e_id].tt))
                dojo.place(`<div id="eventsBar" class="font">${text}</div>`, 'eventsBar', 'replace');
            } else {
                dojo.style(`eventsBar`,'display', 'none');
            }
        },
        
        /***** building utils *****/
        addBuildingToPlayer: function(building){
            const b_id = building.b_id;
            const b_key = building.b_key;
            const b_divId = `${TPL_BLD_TILE}_${b_key}`;
            if ($(this.player_building_zone_id[building.p_id]).parentElement.id.startsWith(TPL_BLD_ZONE) ){
                return;
            }
            if ($(b_divId)){ // if element already exists, just move it.
                const wasInMain = (dojo.query( `#${TILE_ZONE_DIVID[BLD_LOC_OFFER]} #${b_divId}`).length == 1);
                if (wasInMain){
                    this.moveObject(`${b_divId}`, this.player_building_zone_id[building.p_id]);
                    dojo.disconnect(this.b_connect_handler[b_key]);
                    if ((this.main_building_counts[building.b_id]--) == 1){
                        this.removeBuildingZone(b_id);
                    }
                } else {
                    this.moveObject(`${b_divId}`, this.player_building_zone_id[building.p_id]);
                }
            } else { // create it as well;
                this.createBuildingTile(b_id, b_key, this.player_building_zone_id[building.p_id]);
            }
            if (b_id == BLD_WAREHOUSE && building.state != 0){
                this.updateWarehouseState(building.state);
            }
            // remove any afford-ability flags
            this.updateAffordability(`#${b_divId}`, 0);
            dojo.query(`#${b_divId}`).style(`order`,`${building.b_order}`);
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){
                this.addTooltipHtml(b_divId, this.formatTooltipBuilding(b_id, b_key));
            } else {
                this.removeTooltip( b_divId );
            }
            this.updateHasBuilding(building.p_id, b_id); 
        },

        genericSetupBuildBuildings: function( ){
            this.updateBuildingAffordability();
            this.showTileZone(BLD_LOC_OFFER);
            this.orderZone(BLD_LOC_OFFER, 0);
            this.last_selected['building']="";
            this.createBuildingBreadcrumb();
            this.makeBuildingsSelectable(this.allowed_buildings);
            this.addActionButton( 'btn_choose_building', dojo.string.substitute(_('Build ${building_name}'), {building_name:'<span id="bld_name"></span>'}), 'chooseBuilding');
            dojo.addClass('btn_choose_building' ,'disabled');
            if (this.hasBuilding[this.player_id][BLD_RIVER_PORT]){
                if (this.goldAsCow){
                    this.addActionButton( 'btn_gold_cow', dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='cow_as'>", gold:this.tkn_html.gold, type:this.tkn_html.cow, end:"</div>"}), 'toggleGoldAsCow', null, false, 'blue');
                } else {
                    this.addActionButton( 'btn_gold_cow', dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='cow_as' class='no'>", gold:this.tkn_html.gold, type:this.tkn_html.cow, end:"</div>"}), 'toggleGoldAsCow', null, false, 'red');
                }
                if (this.goldAsCopper){
                    this.addActionButton( 'btn_gold_copper', dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='copper_as'>", gold:this.tkn_html.gold, type:this.tkn_html.copper, end:"</div>"}), 'toggleGoldAsCopper', null, false, 'blue');
                } else {
                    this.addActionButton( 'btn_gold_copper', dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='copper_as' class='no'>", gold:this.tkn_html.gold, type:this.tkn_html.copper, end:"</div>"}), 'toggleGoldAsCopper', null, false, 'red');
                }
            }
            if (this.hasBuilding[this.player_id][BLD_LUMBER_MILL]){
                this.lumberMill_WoodVP_Steel=0;
                this.addActionButton( 'btn_more_steel', dojo.string.substitute(_('More ${wood}${vp} As ${steel}'), {gold: this.tkn_html.gold}), 'raiseWoodSteel', null, false, 'gray');
                this.addActionButton( 'btn_less_steel', dojo.string.substitute(_('Less ${wood}${vp} As ${steel}'), {gold: this.tkn_html.gold}), 'lowerWoodSteel', null, false, 'gray');
                //dojo.style( $('btn_more_steel'), 'display', 'none');
                dojo.style( $('btn_less_steel'), 'display', 'none');
            }
            this.addActionButton( 'btn_do_not_build', _('Do Not Build'), 'doNotBuild', null, false, 'red');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            this.can_cancel = true;
            this.addTradeActionButton();
        },

        formatTooltipBuilding:function (b_id, b_key, msg_id = null){
            let b_info = this.building_info[b_id];
            var vp = 'vp'+ ( b_info.vp == null?'0':(Number(b_info.vp)==1)?'':Number(b_info.vp));

            var msg = (msg_id == null? "": 
                `<div class="tt_flex"><span class="tt tt_top" style="color:${COLOR_MAP[msg_id]};">${_(this.asset_strings[msg_id])}</span></div><hr>`);
            return this.format_block('jptpl_bld_tt', {
                msg: msg,
                type:  ASSET_COLORS[b_info.type],
                name: _(b_info.name),
                vp:   vp,
                COST: _('cost:'),
                cost_vals: this.getResourceArrayHtml(b_info.cost, true),
                desc: this.formatBuildingDescription(b_id, b_key),
                INCOME: _('income: '),
                inc_vals: this.formatBuildingIncome(b_id, b_key),
                hr: this.tkn_html.dot,
            });
        },

        /**
         * This method will update inputString then return the updated version.
         * 
         * Any patterns of `${val}` will be replaced with a html token of type `val`
         * 
         * @param {String} inputString 
         * @returns {String} updatedString
         */
        replaceTooltipStrings(inputString){
            // required to allow js functions to access file wide globals (in this case `this.tkn_html`).
            let _this = this;
            try{ // this will detect ${var} and replace it with this.tkn_html[var];
                var updatedString = inputString.replaceAll(/\${(.*?)}/g, 
                function(f){ return _this.tkn_html[f.substr(2, f.length -3)];});
                return updatedString;
            } catch (error){
                console.error(error);
                console.log('unable to format tooltip string '+inputString);
                return inputString;
            }
        },

        formatBuildingDescription: function(b_id, b_key){
            let b_info = this.building_info[b_id];
            var full_desc = '';
            
            if ('desc' in b_info){
                full_desc += this.replaceTooltipStrings(_(b_info.desc));
            }

            if ('on_b' in b_info){
                switch(b_info.on_b){
                    case 1: //BUILD_BONUS_PAY_LOAN
                        var on_build_desc = this.replaceTooltipStrings(_("When built: Pay off ${loan}"));
                        break;
                    case 2: //BUILD_BONUS_TRADE
                        var on_build_desc = dojo.string.substitute(_("When built: Gain ${token}"),
                        {token:this.tkn_html.trade});
                        break;
                    case 3: //BUILD_BONUS_WORKER
                        var on_build_desc = dojo.string.substitute(_("When built: Gain ${token}"),
                        {token:this.tkn_html.worker});
                        break;
                    case 4: //BUILD_BONUS_RAIL_ADVANCE
                        var on_build_desc = _('When built: Advance the Railroad track');
                        break;
                    case 5: //BUILD_BONUS_TRACK_AND_BUILD
                        var on_build_desc = this.replaceTooltipStrings(_('When built: Recieve ${track}<br>You may also build another building of ${any} type'));
                        break;
                    case 6: //BUILD_BONUS_TRADE_TRADE
                        var on_build_desc = this.replaceTooltipStrings(_("When built: ${trade}${trade}"));
                        break;
                    case 7: //BUILD_BONUS_SILVER_WORKERS
                        var on_build_desc = this.replaceTooltipStrings(_('When built: Recieve ${silver} per ${worker}<br>When you gain a ${worker} gain a ${silver}'));
                        break;
                    case 8: //BUILD_BONUS_PLACE_RESOURCES
                        var on_build_desc = this.replaceTooltipStrings(_('When built: place ${wood}${food}${steel}${gold}${copper}${cow} on Warehouse'));
                        on_build_desc += `<div id="${WAREHOUSE_RES_DIVID}"></div>`;
                        break;
                    default:
                        var on_build_desc = "";
                }
                full_desc = on_build_desc +'<br>'+ full_desc;
            }
            if ('vp_b' in b_info){
                const END = _("End: ${vp} per ${type}");
                switch(b_info.vp_b){
                    case 0: //VP_B_RESIDENTIAL
                    case 1: //VP_B_COMMERCIAL
                    case 2: //VP_B_INDUSTRIAL
                    case 3: //VP_B_SPECIAL
                    case 6: //VP_B_BUILDING
                        var vp_b = dojo.string.substitute(END, {vp:this.tkn_html.vp, type:this.format_block('jstpl_color_log', {string: this.asset_strings[b_info.vp_b], color:ASSET_COLORS[b_info.vp_b]} )} );
                        break;
                    case 4: //VP_B_WORKER
                        var vp_b = dojo.string.substitute(END, {vp:this.tkn_html.vp, type:this.tkn_html.worker} );
                        break;
                    case 5: //VP_B_TRACK
                        var vp_b = dojo.string.substitute(END, {vp:this.tkn_html.vp, type:this.getOneResourceHtml('track', 1, true)} );
                        break;
                    case 7: //VP_B_WRK_TRK
                        var vp_b = dojo.string.substitute(END, {vp:this.tkn_html.vp, type:this.tkn_html.worker} ) + '<br>' 
                                 + dojo.string.substitute(END, {vp:this.tkn_html.vp, type:this.getOneResourceHtml('track', 1, true)} );
                                 break;
                    case 8: //VP_B_PAID_LOAN (expansion)
                        var vp_b = dojo.string.substitute(_("End: ${vp} per ${loan} paid off (during endgame actions, loans paid during game are ignored)"), {vp:this.tkn_html.vp, loan:this.tkn_html.loan} );
                        break;
                }
                full_desc += vp_b +'<br>';
            }
            if ('trade' in b_info){
                switch(b_info.trade){
                    case 1: //MARKET
                        full_desc += _("Allows trades:") + dojo.string.substitute("${start}${trade}${wood} ${arrow}${food}${mid}${trade}${food} ${arrow} ${steel}${end}", 
                        {start: `<div id="${b_key}_${MARKET_FOOD_DIVID}" class="market_food trade_option">`,
                         mid:   `</div><div id="${b_key}_${MARKET_STEEL_DIVID}" class="market_steel trade_option">`,
                         end:   "</div>",
                         trade: this.tkn_html.trade, 
                         wood:  this.tkn_html.wood, 
                         arrow: this.tkn_html.arrow, 
                         food:  this.tkn_html.food,
                         steel: this.tkn_html.steel,});
                    break;
                    case 2: //BANK
                        full_desc += _("Allows trades:") + dojo.string.substitute("${start}${trade} ${arrow} ${silver}${end}", 
                        {start:  `<div id="${BANK_DIVID}" class="trade_option">`,
                         end:    "</div>",
                         trade:  this.tkn_html.trade,
                         arrow:  this.tkn_html.arrow, 
                         silver: this.tkn_html.silver,});
                    break;
                }
            }
            return full_desc;
        },

        formatBuildingIncome: function(b_id, b_key){
            let b_info = this.building_info[b_id];
            var income_values = '';
            if (!('inc' in b_info) && !('slot' in b_info)){
                income_values = this.format_block('jstpl_color_log', {string:_("none"), color:''});
            }
            if ('inc' in b_info){
                if (b_info.inc.silver =='x'){
                    income_values = this.replaceTooltipStrings(_('${silver} per ${worker} (max 5)'));
                } else if (b_info.inc.loan == '-1') {
                    income_values = dojo.string.substitute(_('Pay off ${loan}'), {loan:this.tkn_html.loan}) + '<br>';
                } else {
                    income_values = this.getResourceArrayHtmlBigVp(b_info.inc, true);
                }
            }
            if ('slot' in b_info){
                if (b_info.slot ==1){
                    income_values += dojo.string.substitute("${start}${worker} ${inc_arrow} ${income}${end}", 
                    {   start:'<div class="w_slot">',
                        end:  '</div>',
                        worker:this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:1}),
                        inc_arrow:this.tkn_html.inc_arrow, 
                        income:this.getResourceArrayHtmlBigVp(b_info.s1, true)
                    });
                }
                if (b_info.slot ==2){
                    income_values += dojo.string.substitute("${start}${worker1} ${inc_arrow} ${income1}${mid}${worker2} ${inc_arrow} ${income2}${end}", 
                    {   start:'<div class="w_slot">',
                        mid:  '</div><div class="w_slot">',
                        end:  '</div>',
                        worker1:this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:1}), 
                        worker2:this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:2}),
                        inc_arrow:this.tkn_html.inc_arrow, 
                        income1:this.getResourceArrayHtmlBigVp(b_info.s1, true),
                        income2:this.getResourceArrayHtmlBigVp(b_info.s2, true),
                    });
                }
                if (b_info.slot ==3){
                    income_values += dojo.string.substitute("${start}${worker1}${worker2}${mid} ${inc_arrow} ${income}${end}", 
                    {   start:`<div class="w_slot"><span id="slot_${b_key}_3" class="worker_slot">`,
                        mid:  '</span>',
                        end:  '</div>',
                        worker1:this.format_block('jstpl_tt_building_slot_3', {key:b_key, id:b_id, slot:1}),
                        worker2:this.format_block('jstpl_tt_building_slot_3', {key:b_key, id:b_id, slot:2}),
                        inc_arrow:this.tkn_html.inc_arrow, 
                        income:this.getResourceArrayHtmlBigVp(b_info.s3, true)
                    });
                }
            }
            return income_values;
        },

        addBuildingToOffer: function(building){
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            const b_loc = TILE_ZONE_DIVID[building.location];
            if (document.querySelector(`#${b_loc} #${b_divId}`)){ 
                return; //if already correct, do nothing.
            }
            this.createBuildingZoneIfMissing(building);
            const zone_id = `${TPL_BLD_STACK}${building.b_id}`;
            if (document.querySelector(`#${b_loc} #${zone_id}`) == null){
                dojo.place(zone_id, b_loc);
            }
            if ($(b_divId) == null){ //if missing make the building 
                this.createBuildingTile(building.b_id, building.b_key, zone_id);
                this.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
                this.main_building_counts[building.b_id]++;
            }
        },

        createBuildingTile(b_id, b_key, destination){
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), destination);
                this.addTooltipHtml( `${TPL_BLD_TILE}_${b_key}`, this.formatTooltipBuilding(b_id, b_key));
                this.addBuildingWorkerSlots(b_id, b_key);
                this.setupBuildingWorkerSlots(b_id, b_key);
            } else { // use text instead of art.
                let text_building_html = this.formatTooltipBuilding(b_id, b_key);
                dojo.place(this.format_block('jptpl_bld_text', {key: b_key, id: b_id, 'card':text_building_html}), destination);
                this.setupBuildingWorkerSlots(b_id, b_key);
            }
        },

        createBuildingZoneIfMissing(building){
            const b_id = building.b_id;
            if (this.main_building_counts[b_id] == 0 || !(b_id in this.main_building_counts)){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                {id: b_id, order: b_order}), TILE_ZONE_DIVID[building.location]);
                this.main_building_counts[b_id] = 0;
            }
        },

        removeBuildingZone(b_id){
            this.fadeOutAndDestroy( `${TPL_BLD_STACK}${b_id}`);
        },

        cancelBuild: function(building){
            //console.log('cancelBuild', building.p_id);
            const b_divId = `${TPL_BLD_TILE}_${building.b_key}`;
            dojo.removeAttr( $(b_divId), 'style');
            building.location=BLD_LOC_OFFER;
            this.createBuildingZoneIfMissing(building);
            this.moveObject(b_divId, `${TPL_BLD_STACK}${building.b_id}`);
            this.main_building_counts[building.b_id]++;
            //remove from hasBuilding
            delete this.hasBuilding[building.p_id][building.b_id];
            this.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
        },

        updateWarehouseState: function(state, p_id=null){
            let new_state = state;
            let old_state = this.warehouse_state;
            let stateDiff = new_state ^ old_state;
            for(let bit = 1; bit <=stateDiff; bit <<= 1){
                if (stateDiff & old_state & bit){
                    this.updateWarehouseResource(WAREHOUSE_MAP[bit], false, p_id);
                } else if (stateDiff & new_state & bit){
                    this.updateWarehouseResource(WAREHOUSE_MAP[bit], true, p_id);
                }
            }
            this.warehouse_state = state;
        },

        updateWarehouseResource: function(type, add, p_id){
            let origin = 'limbo';
            if (add){
                let tkn_id = `warehouse_${type}`;
                let resToken = dojo.create('span', {class: `log_${type} token_inline`, title:type, id:tkn_id});
                dojo.style(resToken,'order', this.getKeyByValue(WAREHOUSE_MAP, type));
                if (p_id){
                    origin = this.token_divId[p_id];
                    this.incResCounter(p_id, type, -1);
                }
                dojo.place(resToken, origin, 'first');
                this.moveObject(tkn_id, WAREHOUSE_RES_DIVID);
            } else {
                if (p_id){
                    origin = this.token_divId[p_id];
                    this.incResCounter(p_id, type, 1);
                }
                this.slideToObjectAndDestroy(`warehouse_${type}`, origin, 500, 0 );
            }
        },

        getWarehouseResources: function (){
            let state = this.warehouse_state;
            let resources = [];
            for(let bit = 1; bit <=state; bit <<= 1){
                if (state & bit){
                    let type = WAREHOUSE_MAP[bit];
                    resources[type] = 1;
                } 
            }
            return resources;
        },
        
        updateHasBuilding(p_id, b_id) {
            if (!(p_id in this.hasBuilding)){
                this.hasBuilding[p_id] = [];
            }
            if (!(b_id in this.hasBuilding[p_id])){
                this.hasBuilding[p_id][b_id] = true;
            }
        },

        /***** Bid utils *****/
        /**(see constants.inc for BidlocationMapping)
         * but in general we want bid_slot_1_3 to map to 1 (BID_A1_B3 ==1 in constants...)
         * of note the bids from auction 1 are 1-9 (that's why I use this:(aucNo-1)*10)
         * and there are 9 bid slots, 
         * so we can get their mapping using BID_VAL_ARR.indexOf 
         * which lists the bid cost values in an array. 
         * @param {String} bidLoc_divId (id of bid location to get bidNo from)
         */
        getBidNoFromSlotId: function(bidLoc_divId){
            const split_bid = bidLoc_divId.split("_");
            const aucNo = Number(split_bid[2]);
            const bid_no = BID_VAL_ARR.indexOf(Number(split_bid[3])) + 1;
            // bids start at 1 
            return ((aucNo-1)*10 + bid_no);
        },

        /**
         * the goal of this is to allow getting div_id for moving bids to bid_zones
         * return the bid_loc_id for the zone defined by bid_no.
         * 
         * @param {Number} bid_no to get slot_divId from
         */
        getBidLocDivIdFromBidNo: function(bid_no){
            return this.bid_zone_divId[Math.ceil(bid_no/10)][Number(bid_no%10) -1];
        },

        moveBid: function(p_id, bid_loc){
            if (bid_loc == OUTBID || bid_loc == NO_BID) {
                this.moveObject(this.bid_token_divId[p_id], this.bid_zone_divId[ZONE_PENDING]);
            } else if (bid_loc == BID_PASS) {
                this.moveObject(this.bid_token_divId[p_id], this.bid_zone_divId[ZONE_PASSED]);
            } else { 
                this.moveObject(this.bid_token_divId[p_id], this.getBidLocDivIdFromBidNo(bid_loc));
            }
        },

        /**
         * This will clear the selectable and selected (if true) flags from assets by type.
         * type locators are set in global TYPE_SELECTOR.
         * if selected is true it will also clear the last_selected[] for this type
         */
        clearSelectable: function(type, selected = false){
            const selectables = dojo.query(TYPE_SELECTOR[type]);
            selectables.removeClass('selectable');
            
            if (selected == true && this.last_selected[type] != "" && this.last_selected[type]){
                dojo.removeClass(this.last_selected[type], 'selected');
                this.last_selected[type] = "";
            }
        },

        /**
         * this will toggle selection of element of type defined by type;
         * @param {*} type 
         * @param {*} selected_id 
         */
        updateSelected: function(type, selected_id) {
            // if not selectable, ignore the call.
            if (!( dojo.hasClass (selected_id, 'selectable')))
            { return; }
            // clear previously selected
            if (! this.last_selected[type] == ""){
                dojo.removeClass(this.last_selected[type], 'selected');
                if (this.last_selected[type] == selected_id){
                    this.last_selected[type] = "";
                    return;
                }
            }
            // select newly selected
            dojo.addClass(selected_id, 'selected');
            this.last_selected[type] = selected_id;
        },

        ///////////////////////////////////////////////////
        //// Player's action

        /***** COMMON ACTIONS (multiple states) *****/
        addPaymentButtons: function( ignoreShowPay = false){
            if (!(this.showPay || ignoreShowPay)) return;

            this.addActionButton( 'btn_pay_done', dojo.string.substitute(_("Pay: ${amt}"), {amt:this.format_block("jstpl_pay_button", {})}), 'donePay');
            this.silverCounter.create('pay_silver');
            this.silverCounter.setValue(this.silverCost);
            this.goldCounter.create('pay_gold');
            this.goldCounter.setValue(this.goldAmount);
            this.addActionButton( 'btn_more_gold', dojo.string.substitute(_('Use More ${gold}'), {gold: this.tkn_html['gold']}), 'raiseGold', null, false, 'gray');
            this.addActionButton( 'btn_less_gold', dojo.string.substitute(_('Use Less ${gold}'), {gold: this.tkn_html['gold']}), 'lowerGold', null, false, 'gray');
            dojo.style( $('btn_less_gold'), 'display', 'none');
            this.addTradeActionButton();
            this.setOffsetForPaymentButtons();
        },

        lowerGold: function(){
            if (this.goldAmount <1){return;}
            this.goldAmount --;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost +=5;
            if (this.silverCost >0){
                dojo.style( $('pay_silver'), 'display', 'inline-block');
                dojo.style( $('pay_silver_tkn'), 'display', 'inline-block');
                dojo.style( $('btn_more_gold'), 'display', 'inline-block');
                this.silverCounter.setValue(this.silverCost);
            }
            if(this.goldAmount == 0){
                dojo.style( $('pay_gold'), 'display', 'none');
                dojo.style( $('pay_gold_tkn'), 'display', 'none');
                dojo.style( $('btn_less_gold'), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        raiseGold: function(){
            if (this.silverCost <0) return;
            dojo.style( $('pay_gold'), 'display', 'inline-block');
            dojo.style( $('pay_gold_tkn'), 'display', 'inline-block');
            dojo.style( $('btn_less_gold'), 'display', 'inline-block');

            this.goldAmount++;
            this.goldCounter.setValue(this.goldAmount);
            this.silverCost -= 5;
            this.silverCounter.setValue(Math.max(0 , this.silverCost));
            if (this.silverCost <= 0){
                dojo.style( $('pay_silver'), 'display', 'none');
                dojo.style( $('pay_silver_tkn'), 'display', 'none');
                dojo.style( $('btn_more_gold'), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        raiseWoodSteel: function(){
            this.raiseCostReplace('steel');
        },

        lowerWoodSteel: function() {
            this.lowerCostReplace('steel');
        },

        resetCostReplace: function() {
            for (let type in COST_REPLACE_TYPE){
                this.cost_replace[type] = 0;
            }
        },

        raiseCostReplace: function (type) {
            /*if (!(type in this.buildingCost) || this.cost_replace[type] >= this.buildingCost[type] ) return;

            dojo.style( $(`btn_less_${type}`), 'display', 'inline-block');

            this.cost_replace[type]++;
            if (this.buildingCost[type] == this.cost_replace[type]){//can't replace any more.
                dojo.style( $(`btn_more_${type}`), 'display', 'none');
            }*/
            //TODO:  update UI in some fashion.
        },

        lowerCostReplace: function (type) {
            /*
            if (!(type in this.buildingCost) || this.cost_replace[type]<=0 ) return;
            dojo.style( $(`btn_more_${type}`), 'display', 'inline-block');

            this.cost_replace[type]--;
            if (this.cost_replace[type] == 0){//can't replace any less.
                dojo.style( $(`btn_less_${type}`), 'display', 'none');
            }*/
            //TODO:  update UI in some fashion.
        },

        /**
         * Set offset & New values to include cost & transactions.
         */
        setOffsetForPaymentButtons: function( ) {
            // silver
            let silver_offset_neg = this.getOffsetNeg('silver');
            if (this.silverCost >0){
                silver_offset_neg += this.silverCost;
            } 
            this.setOffsetNeg('silver', silver_offset_neg);
            let silver_offset_pos = this.getOffsetPos('silver');
            let silver_new = this.board_resourceCounters[this.player_id].silver.getValue() - silver_offset_neg + silver_offset_pos;
            this.newPosNeg('silver', silver_new);

            // gold
            let gold_offset_neg = this.getOffsetNeg('gold');
            let gold_offset_pos = this.getOffsetPos('gold');
            if (this.goldAmount >0){
                gold_offset_neg += this.goldAmount;
            }
            this.setOffsetNeg('gold', gold_offset_neg);
            let gold_new = this.board_resourceCounters[this.player_id].gold.getValue() - gold_offset_neg + gold_offset_pos;
            this.newPosNeg('gold', gold_new);
            this.updateBuildingAffordability();
            this.updateTradeAffordability();
            
            this.createPaymentBreadcrumb({'silver':Math.min(0,(-1 *this.silverCost)), 'gold':Math.min(0,(-1 *this.goldAmount))});
        },

        /***** BREADCRUMB METHODS *****/
        createTradeBreadcrumb: function(id, text, tradeAway, tradeFor, loan=false){
            dojo.place(this.format_block( 'jptpl_breadcrumb_trade', 
            {
                id: id, 
                text:text, 
                away:this.getResourceArrayHtml(tradeAway, true, "position: relative; top: 9px;"),
                off: '9px',
                for:this.getResourceArrayHtml(tradeFor, true, `position: relative; top: 9px;`)}
                ), `breadcrumb_transactions`, 'before');
        },

        destroyTradeBreadcrumb: function(id){
            if (dojo.query(`#breadcrumb_${id}`).length == 1){
                this.fadeOutAndDestroy(`breadcrumb_${id}`);
                this.fadeOutAndDestroy(`breadcrumb_${id}_1`);
            }
        },

        createIncomeBreadcrumb: function(id) {
            if (!(id in this.income_arr)) return;
            let name = `<div title="Rail Tracks" class="bread_track"></div>`;
            let order = 1;
            if (id != -1){
                name = this.format_block('jstpl_color_log', {'string':_(this.building_info[id].name), 'color':ASSET_COLORS[this.building_info[id].type]});
                let bld = dojo.query(`#${TPL_BLD_ZONE}${this.player_color[this.player_id]} .${TPL_BLD_CLASS}${id}`);
                if (bld[0].style){
                    order = Number(bld[0].style.order) + 2;
                }
            }
            let args = {text:name, 'id':id, style:`order:${order};`, income:this.getResourceArrayHtml(this.income_arr[id], true, "position: relative; top: 9px;")};
            if (dojo.query(`#breadcrumb_income_${id}`).length>=1){
                dojo.destroy(`breadcrumb_income_tokens_${id}`);
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumb_income_${id}`, 'replace');
            } else {
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumbs`, 'first');
            }
        },

        destroyIncomeBreadcrumb: function(){
            for(let id in this.income_arr){
                if (dojo.query(`#breadcrumb_income_${id}`).length == 1){
                    this.fadeOutAndDestroy(`breadcrumb_income_${id}`);
                    this.fadeOutAndDestroy(`breadcrumb_income_tokens_${id}`);
                }
            }
        },

        createPaymentBreadcrumb: function( cost ){
            if (dojo.query('#breadcrumb_payment').length==1){
                dojo.destroy(`breadcrumb_payment_tokens`);
                dojo.place(this.format_block( 'jptpl_breadcrumb_payment', 
                {text:_("Payment"), cost:this.getResourceArrayHtml(cost, true, "position: relative; top: 9px;")}), `breadcrumb_payment`, 'replace');
            } else {
                dojo.place(this.format_block( 'jptpl_breadcrumb_payment', 
                {text:_("Payment"), cost:this.getResourceArrayHtml(cost, true, "position: relative; top: 9px;")}), `breadcrumbs`, 'last');
            }
        },

        destroyPaymentBreadcrumb: function(){
            if (dojo.query(`#breadcrumb_payment`).length == 1){
                this.fadeOutAndDestroy('breadcrumb_payment');
                this.fadeOutAndDestroy('breadcrumb_payment_tokens');
            }
        },

        createBuildingBreadcrumb: function(){
            // defaults are ??? building with no cost. (when no building is selected)
            let b_id = 0;
            let b_name=_("???"); 
            let b_type=4; 
            let cost={};
            if (this.last_selected.building!=''){
                b_id = $(this.last_selected.building).className.split(' ')[1].split('_')[2];
                b_name = _(this.building_info[b_id].name);
                b_type = this.building_info[b_id].type;
                cost = this.invertArray(this.building_info[b_id].cost??[]);
            }
            let b_name_html = this.format_block('jstpl_color_log', {'string':_(b_name), 'color':ASSET_COLORS[b_type]});
            let b_html = this.format_block( 'jptpl_breadcrumb_building', {text:dojo.string.substitute(_("Build ${building_name}"),{building_name:b_name_html}), cost:this.getResourceArrayHtml(this.invertArray(cost), true, "position: relative; top: 9px;")})
            if (dojo.query('#breadcrumb_building').length==1){
                this.updateTrade(this.buildingCost, true);
                dojo.destroy('breadcrumb_bldCost');
                dojo.place(b_html, 'breadcrumb_building', 'replace');
            } else {
                dojo.place(b_html, `breadcrumbs`, 'last');
            }
            this.buildingCost = cost;
            this.updateTrade(cost);
        },
        
        destroyBuildingBreadcrumb: function(){
            this.updateTrade(this.buildingCost, true);
            this.buildingCost = [];
            if (dojo.query(`#breadcrumb_building`).length == 1){
                this.fadeOutAndDestroy(`breadcrumb_building`);
                this.fadeOutAndDestroy(`breadcrumb_bldCost`);
            }
        },

        updateIncomeArr: function(){
            this.income_arr = [];
            const playerBuildingZone = this.player_building_zone_id[this.player_id];
            for(let b_id in this.hasBuilding[this.player_id]){
                this.income_arr[b_id] = [];
                // building base income
                if (this.building_info[b_id].inc){
                    // special income
                    if (b_id == BLD_RODEO){
                        this.income_arr[b_id].silver = Math.min(5, this.getPlayerWorkerCount(this.player_id));
                    } else if (b_id == BLD_BANK){
                        if (this.board_resourceCounters[this.player_id][loan].getValue() == 0){
                            this.income_arr[b_id].silver = 2;
                        } else {
                            this.income_arr[b_id].loan = -1;
                        }
                    } else if (b_id == BLD_WAREHOUSE){
                        if (this.warehouse != ''){
                            this.income_arr[b_id][this.warehouse] = 1;
                        }
                    } else {
                        for(let type in this.building_info[b_id].inc){
                            if (type == 'vp2'){
                                this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], 'vp',(2* this.building_info[b_id].inc.vp2));
                            } else {
                                this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type,this.building_info[b_id].inc[type]);
                            }
                        }
                    }
                }
                // building worker income
                if (this.building_info[b_id].slot){
                    if (this.building_info[b_id].slot == 3){
                        if (dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot .token_worker`).length == 2){
                            for (type in this.building_info[b_id].s3){
                                this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type, this.building_info[b_id].s3[type]);
                            }
                        }
                    } else {
                        let slots = dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot:not(:empty)`);
                        for(let i in slots){
                            if (slots[i].id == null) continue;
                            if (slots[i].id.split('_')[2] == 1){
                                for (type in this.building_info[b_id].s1){
                                    if (type == 'vp2'){
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], 'vp', (2* this.building_info[b_id].s1.vp2));
                                    } else {
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type, this.building_info[b_id].s1[type]);
                                    }
                                }
                            }
                            if (slots[i].id.split('_')[2] == 2){
                                for (type in this.building_info[b_id].s2){
                                    if (type == 'vp2'){
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], 'vp', (2* this.building_info[b_id].s2.vp2));
                                    } else {
                                        this.income_arr[b_id] = this.addOrSetArrayKey(this.income_arr[b_id], type, this.building_info[b_id].s2[type]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // railroad track income
            let tracks = this.getPlayerTrackCount(this.player_id);
            if (tracks >0){
                this.income_arr[-1] = {'silver':tracks};
            }
        },
        
        getIncomeOffset: function(type){
            let amt = 0;
            for (let id in this.income_arr){
                if (this.income_arr[id][type]){
                    amt += this.income_arr[id][type];
                }
            }
            return amt;
        },

        setOffsetForIncome: function() {
            this.updateIncomeArr();
            //console.log('setOffsetForIncome', this.income_arr);
            for (let id in this.income_arr){
                for (let type in this.income_arr[id]){
                    if (this.income_arr[id][type]!= 0){
                        let income = this.income_arr[id][type];
                        this.offsetPosNeg(type, income, true);
                        this.newPosNeg(type, income, true);
                        this.updateBuildingAffordability();
                        this.updateTradeAffordability();
                    }
                }
                this.createIncomeBreadcrumb(id);
            }
        },

        clearOffset: function() {
            //console.log("clearOffset");
            for(type in this.pos_offset_resourceCounter){
                this.pos_offset_resourceCounter[type].setValue(0);
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
                this.neg_offset_resourceCounter[type].setValue(0);
                dojo.query(`.${type}.neg:not(.noshow)`).addClass('noshow');
                dojo.query(`#${type}_new:not(.noshow)`).addClass("noshow");
            }
        },

        /****** 
         * cancelNotifications: 
         * cancel past notification log messages with the given move IDs (from sharedcode)
        ********/
        cancelNotifications: function(moveIds) {
            for (var logId in this.log_to_move_id) {
                var moveId = +this.log_to_move_id[logId];
                if (moveIds.includes(moveId)) {
                    dojo.addClass('log_' + logId, 'cancel');
                }
            }
        },

        /***** TRADE *****/
        /**
         * if log has 0 hide all undo buttons.
         * if log has 1 show undo last.
         * if log has 2+ show both undo
         */
        setupUndoTransactionsButtons: function(){
            if (this.transactionLog.length == 0){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');   
            } else if (this.transactionLog.length == 1){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.noshow`).removeClass('noshow');
            } else {
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.noshow`).removeClass('noshow');
                dojo.query(`#${UNDO_TRADE_BTN_ID}.noshow`).removeClass('noshow');
            }
        },

        addTradeActionButton: function( ){
            this.addActionButton( 'btn_take_loan', _('Take Debt'), 'onMoreLoan', null, false, 'gray' );
            this.addActionButton( TRADE_BUTTON_ID, _("Show Trade"),'tradeActionButton', null, false, 'gray' );
            this.addActionButton( CONFIRM_TRADE_BTN_ID, _("Confirm Trade"),'confirmTradeButton', null, false, 'blue' );
            dojo.style(CONFIRM_TRADE_BTN_ID, 'display', 'none');
            dojo.style(TRADE_BOARD_ID, 'order', 2);
            this.updateTradeAffordability();
            this.resetTradeValues();
            if (this.board_resourceCounters[this.player_id].trade.getValue() ==0) {
                this.tradeEnabled = false;
                dojo.query(`#${TRADE_BUTTON_ID}`).addClass('noshow');
            } else {
                this.enableTradeBoardActions();
            }
        },

        enableTradeBoardActions: function(){
            dojo.query(`#building_zone_${this.player_color[this.player_id]} .trade_option:not(.selectable)`).addClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}:not(.selectable)`).addClass('selectable');
        },

        disableTradeBoardActions: function(){
            dojo.query(`#building_zone_${this.player_color[this.player_id]} .trade_option.selectable`).removeClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}.selectable`).removeClass('selectable');
        },

        /**
         *  primary trade button (can be in 3 states)
         * show trade 
         *  - if have at least 1 trade token, on trade enabled state
         *  - bgabutton_gray
         * hide trade 
         *  - if trade buttons already displayed, but no trades selected
         *  - bgabutton_red
         */
        tradeActionButton: function( evt){
            if(  (this.currentState=='allocateWorkers' && this.allowTrade) || this.checkAction( 'trade' ) ){
                if (dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_red`).length > 0){// hide
                    this.disableTradeIfPossible();
                    this.setTradeButtonTo( TRADE_BUTTON_SHOW );
                    return;
                }
                // show trade
                this.enableTradeIfPossible();
                this.setTradeButtonTo( TRADE_BUTTON_HIDE );
            }
        },
        
        /** Enable Trade
         * 
         */
        enableTradeIfPossible: function() {
            if (!this.tradeEnabled){
                let b_zone = `building_zone_${this.player_color[this.player_id]}`;
                dojo.place(BUY_BOARD_ID, b_zone, 'first');
                dojo.place(SELL_BOARD_ID, b_zone, 'first');
                this.tradeEnabled = true;
                dojo.query('#trade_top').style('display','none');
            }
        },

        disableTradeIfPossible: function() {
            if (this.tradeEnabled){
                this.tradeEnabled = false;
                dojo.place(BUY_BOARD_ID, `trade_top`, 'first');
                dojo.place(SELL_BOARD_ID, `trade_top`, 'first');
                dojo.query('#trade_top').style('display','grid');
            }
        },

        confirmTradeButton: function ( ){
            if((this.currentState=='allocateWorkers')){
                // confirm trade
                this.confirmTrades( true );
                this.updateConfirmTradeButton( TRADE_BUTTON_HIDE );
                return;
            } else if (this.checkAction( 'trade' )) {
                this.confirmTrades( false );
                this.updateConfirmTradeButton( TRADE_BUTTON_HIDE );
                return;
            }
        },

        confirmHiddenTradeButton: function(){
            if (this.checkAction( 'event' ) && this.checkAction( 'trade' )) {
                this.confirmTrades( false );
                this.updateConfirmTradeButton( TRADE_BUTTON_HIDE );
                return;
            }
        },

        hideResources: function(){
            // if no building selected, or income displayed, hide stuff
            let thisPlayer = `player_zone_${this.player_color[this.player_id]}`;
            dojo.query(`#${thisPlayer} .new_text:not(.noshow)`).addClass('noshow');
            dojo.query(`#${thisPlayer} .player_text.noshow`).removeClass('noshow');
            
            let hasOffset = [];
            for(let type in this.getBuildingCost())   { hasOffset[type] = true; }
            for(let i in this.transactionCost)
                for(let type in this.transactionCost[i]) { hasOffset[type] = true; }
            for(let id in this.income_arr)
                for(let type in this.income_arr[id])
                if (this.income_arr[id][type]!= 0)   { hasOffset[type] = true; }
            if (this.silverCost >0){ hasOffset.silver = true; }
            if (this.goldAmount >0){ hasOffset.gold = true; }
            for(let type in hasOffset){
                dojo.query(`#${thisPlayer} .player_${type}_new.noshow`).removeClass('noshow');
            }
        },

        confirmTrades: function ( notActive ){
            if (this.transactionLog.length == 0) { return; }
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                lock: true, 
                trade_action: this.transactionLog.join(','),
                notActive: notActive,
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeValues();
                 this.can_cancel = true;
                 if (this.currentState == 'allocateWorkers' && !notActive){
                    this.setOffsetForIncome();
                 }
                 this.calculateAndUpdateScore(this.player_id);
             }, function( is_error) {});
        },
        
        confirmTradesHidden: function(){
            if (this.transactionLog.length == 0) { return; }
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/tradeHidden.html", { 
                lock: true, 
                trade_action: this.transactionLog.join(','),
                notActive: notActive,
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeValues();
                 this.can_cancel = true;
                 this.calculateAndUpdateScore(this.player_id);
             }, function( is_error) {});
        },

        getOffsetNeg: function(type){
            let value = 0;
            for(let i in this.transactionCost){
                if (type in this.transactionCost[i] && this.transactionCost[i][type] < 0){
                    value += this.transactionCost[i][type];
                }
            }
            
            return Math.abs(value);
        },
        
        getOffsetPos: function(type){
            let value = 0;
            for(let i in this.transactionCost){
                if (type in this.transactionCost[i] && this.transactionCost[i][type]>0){
                    value += this.transactionCost[i][type];
                }
            }
            return Math.abs(value);
        },

        getOffsetValue: function(type) {
            let value = 0;
            for(let i in this.transactionCost){
                if (type in this.transactionCost[i]){
                    value += this.transactionCost[i][type];
                }
            }
            return value;
        },

        /**
         * update the offset & new values to be correct 
         * values are board_resourceCounters + offset from pending transactions.
         */
        resetTradeValues: function() {
            for(let type in this.board_resourceCounters[this.player_id]){
                let offset = 0;
                offset -= this.setOffsetNeg(type, this.getOffsetNeg(type));
                offset += this.setOffsetPos(type, this.getOffsetPos(type));

                this.newPosNeg(type, this.board_resourceCounters[this.player_id][type].getValue() + offset);
            }
        },

        onSelectTradeAction: function( evt ){
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            var tradeAction = evt.target.id.substring(6);
            if (TRADE_MAP[tradeAction] < 6){ //buy
                this.onBuyResource ( evt , evt.target.id.substring(10));
            } else { //sell
                this.onSellResource( evt , evt.target.id.substring(11));
            }
        },

        onBuyResource: function ( evt , type = ""){
            //console.log('onBuyResource');
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if (type == ""){
                type = evt.target.id.split('_')[0];
            }
            //console.log(type);
            // when buying, trade costs trade_val, so make it negative.
            let tradeChange = this.getBuyChange(type) 
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = this.invertArray(this.resource_info[type].trade_val);
                tradeAway.trade = -1;
                let tradeFor = [];
                tradeFor[type] = 1;
                this.createTradeBreadcrumb(this.transactionLog.length, _("Buy"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP[`buy_${type}`]);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        getBuyChange: function ( type ) {
            let tradeChange = [];
            tradeChange = this.invertArray(this.resource_info[type].trade_val);
            tradeChange[type] = 1;
            tradeChange.trade = -1;
            return tradeChange;
        },

        onSellResource: function ( evt , type = "" ){
            //console.log('onSellResource');
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if (type == ""){
                type = evt.target.id.split('_')[0];
            }
            //console.log(type);
            let tradeChange = this.getSellChange (type);
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {trade:-1};
                tradeAway[type] = -1;
                let tradeFor = this.copyArray(this.resource_info[type].trade_val);
                tradeFor.vp = 1;
                if (this.hasBuilding[this.player_id][BLD_GENERAL_STORE]){
                    tradeFor = this.addOrSetArrayKey(tradeFor, 'silver', 1);
                }
                this.createTradeBreadcrumb(this.transactionLog.length, _("Sell"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP[`sell_${type}`]);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        getSellChange: function ( type ) {
            let tradeChange = this.copyArray(this.resource_info[type].trade_val); 
            tradeChange[type] = -1;
            tradeChange.trade = -1;
            tradeChange.vp = 1;
            if (this.hasBuilding[this.player_id][BLD_GENERAL_STORE]){
                tradeChange = this.addOrSetArrayKey(tradeChange, 'silver', 1);
            }
            return tradeChange;
        },

        onMoreLoan: function ( evt ){
            dojo.stopEvent( evt );
            if ( !this.allowTrade && !this.checkAction( 'trade' )) { return; }
            if(this.canAddTrade({'loan':1, 'silver':2})){
                this.updateTrade({'loan':1, 'silver':2});
                // add breadcrumb
                this.createTradeBreadcrumb(this.transactionLog.length, "Take Dept", {loan:1}, {silver:2}, true);

                this.transactionCost.push({'loan':1, 'silver':2});
                this.transactionLog.push(TRADE_MAP.loan);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        onClickOnMarketTrade: function ( evt ){
            //console.log('onClickOnMarketTrade');
            //console.log(evt);
            dojo.stopEvent( evt );
            if (evt.target.classList.contains("selectable")) { 
                if (evt.target.classList.contains('market_food')){
                    var type = 'food';
                } else if (evt.target.classList.contains('market_steel')){
                    var type = 'steel';
                } else {return;}
            } else {// check parentNode (click on token in div)
                if (!evt.target.parentNode.classList.contains('selectable')) { return; } 
                if (evt.target.parentNode.classList.contains('market_food')){
                    var type = 'food';
                } else if (evt.target.parentNode.classList.contains('market_steel')){
                    var type = 'steel';
                } else {return;}
            }
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            
            let tradeChange = this.getMarketChange(type);
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = this.invertArray(this.resource_info[type].market);
                tradeAway.trade = -1;
                let tradeFor = [];
                tradeFor[type] =1;
                this.createTradeBreadcrumb(this.transactionLog.length, _("Market"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP[`market_${type}`]);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },
        
        getMarketChange: function (type) {
            let tradeChange = this.invertArray(this.resource_info[type].market);
            tradeChange.trade = -1;
            tradeChange[type] = 1;
            return tradeChange;
        },

        onClickOnBankTrade: function ( evt ){
            //console.log('onClickOnBankTrade');
            dojo.stopEvent( evt );
            if (!(evt.target.classList.contains("selectable")) && !(evt.target.parentNode.classList.contains('selectable')))
            {   return; }
            if (dojo.hasClass(evt.target.id, "selectable") && evt.target.parentNode.classList.contains('selectable')
                && evt.target.parentNode.classList.contains())
            if ( !this.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            if(this.canAddTrade({'silver':1, 'trade':-1})){
                this.updateTrade({'silver':1, 'trade':-1});              
                this.createTradeBreadcrumb(this.transactionLog.length, _('Bank'), {trade:1}, {silver:1});

                this.transactionCost.push({'silver':1, 'trade':-1});
                this.transactionLog.push(TRADE_MAP.bank);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        canAddTrade: function( change){
            let can_afford = true;
            for (let type in change){
                let avail_res = this.board_resourceCounters[this.player_id][type].getValue()+ this.getOffsetValue(type);
                can_afford &= (change[type] >0 || (avail_res + change[type] )>=0);
            }
            return can_afford;
        },

        /**
         * show building cost and breadcrumb for building with b_id.
         * if b_id = 0 it will instead remove any existing cost and breadcrumb
         * @param {int} b_id 
         */
        showBuildingCost: function( ) {
            let b_id = 0;
            if (this.last_selected.building!=''){
                b_id = $(this.last_selected.building).className.split(' ')[1].split('_')[2];
            }
            this.createBuildingBreadcrumb();
        },

        getBuildingCost: function() {
            let b_id = 0;
            if (this.last_selected.building!=''){
                b_id = $(this.last_selected.building).className.split(' ')[1].split('_')[2];
            }
            cost = this.invertArray(this.building_info[b_id].cost);
            for(let type in this.cost_replace){
                let max_loop = Math.max(this.cost_replace[type], cost[type]);
                for(let i =0; i< max_loop;i++ ){
                    for(let replace_type in COST_REPLACE_TYPE[type]){
                        cost = this.addOrSetArrayKey(cost, replace_type, COST_REPLACE_TYPE[type][replace_type]);
                    }
                    cost[type]--;
                }
            }
            if (this.goldAsCopper && ('copper' in cost)){
                this.addOrSetArrayKey(cost, 'gold', cost.copper);
                delete cost.copper;
            } 
            if (this.goldAsCow && ('cow' in cost)){
                this.addOrSetArrayKey(cost, 'gold', cost.cow);
                delete cost.cow;
            }
            return cost;
        },

        /**
         * change to apply to offsets. if undo is true will instead remove an offset of change.
         * @param {*} change 
         * @param {*} undo 
         */
        updateTrade: function( change , undo = false) {
            //console.log('updateTrade', change, undo);
            for (let type in change){
                let offset = change[type];
                //console.log(type, offset);
                if (offset > 0){
                    this.setOffsetPos(type, (undo?(-1 * offset):offset), true);
                } else {
                    this.setOffsetNeg(type, (undo?offset:(-1 * offset)), true);
                }
                let offset_value = this.pos_offset_resourceCounter[type].getValue() - this.neg_offset_resourceCounter[type].getValue();
                this.newPosNeg(type, this.board_resourceCounters[this.player_id][type].getValue() + offset_value);
            }
            return true;
        },

        showResource: function(type){
            let showNew = false;
            if (this.pos_offset_resourceCounter[type].getValue() != 0){
                dojo.query(`.${type}.pos.noshow`).removeClass('noshow');
                showNew = true;
            } else {
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
            }
            if (this.neg_offset_resourceCounter[type].getValue() != 0){
                dojo.query(`.${type}.neg.noshow`).removeClass('noshow');
                showNew = true;
            } else {
                dojo.query(`.${type}.neg:not(.noshow)`).addClass('noshow');
            }
            if (showNew){
                dojo.query(`#${type}_new.noshow`).removeClass("noshow");
            } else {
                dojo.query(`#${type}_new:not(.noshow)`).addClass("noshow");
            }         
        },

        newPosNeg: function(type, new_value, inc= false){   
            if (inc){
                new_value = this.new_resourceCounter[type].incValue(new_value);
            } else {
                this.new_resourceCounter[type].setValue(new_value);
            }         
            
            if(new_value < 0){
                dojo.query(`#${type}_new`).addClass('negative');
            } else {
                dojo.query(`#${type}_new`).removeClass('negative');
            }
            this.showResource(type);
            return new_value;
        },

        /**
         * update pos offset counter if offset_value is positive, or 
         * update neg offset counter if offset_value is negative.
         * if inc is true, it will increment instead of setting the offset.
         * @param {*} type 
         * @param {*} offset_value 
         * @param {*} inc 
         */
        offsetPosNeg: function(type, offset_value, inc= false){
            if (offset_value > 0){
                this.setOffset(true, type, offset_value, inc);
            } else {
                this.setOffset(false, type, (-1 * offset_value), inc);
            }
        },

        /**
         * update pos offset counter 
         * if inc is true, it will increment instead of setting the offset.
         * @param {String} type 
         * @param {int} offset_value 
         * @param {Boolean} inc 
         */
        setOffsetPos: function(type, offset_value, inc= false){
            return this.setOffset(true, type, offset_value, inc);
        },

        /**
         * update neg offset counter
         * if inc is true, it will increment instead of setting the offset.
         * @param {String} type 
         * @param {int} offset_value 
         * @param {Boolean} inc 
         */
        setOffsetNeg:function(type, offset_value, inc= false){
            return this.setOffset(false, type, offset_value, inc);
        },
        
        /**
         * update the offset counter of `type` with `offset_value`  
         * if inc is true, it will increment instead of setting the offset.
         * 
         * if the resulting value is not 0 it will display the counter.
         * if the resulting value is 0 it will hide the counter.
         * @param {Boolean} pos
         * @param {String} type 
         * @param {int} offset_value 
         * @param {Boolean} inc 
         * @returns the new offset value
         */
        setOffset:function(pos, type, offset_value, inc= false){
            let counter = this.neg_offset_resourceCounter[type];
            if (pos){
                counter = this.pos_offset_resourceCounter[type];
            } 
            if (inc) {
                offset_value = counter.incValue(offset_value);
            } else {
                counter.setValue(offset_value);
            } 
            this.showResource(type);
            return offset_value;
        },
        
        // called after executing trades.
        clearTransactionLog: function() {
            for(let i in this.transactionLog){
                this.destroyTradeBreadcrumb(i);
            }
            this.transactionCost = [];
            this.transactionLog = [];
            this.setupUndoTransactionsButtons();
        },

        changeStateCleanup: function(){
            this.clearTransactionLog();
            this.disableTradeIfPossible();
            this.resetTradeValues();
            this.disableTradeBoardActions();
            this.setupUndoTransactionsButtons();
            this.updateBuildingAffordability();
        },

        undoTransactionsButton: function( ){
            if (this.transactionCost.length ==0) return;
            while (this.transactionLog.length>0){
                this.destroyTradeBreadcrumb(this.transactionCost.length-1);
                this.transactionLog.pop();
                this.updateTrade(this.transactionCost.pop(), true);
                this.updateBuildingAffordability();
                this.updateTradeAffordability();
            }
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
        },

        undoLastTransaction: function() {
            if (this.transactionCost.length ==0) return;
            this.destroyTradeBreadcrumb(this.transactionCost.length-1);
            this.transactionLog.pop();
            this.updateTrade(this.transactionCost.pop(), true);
            this.updateBuildingAffordability();
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
            this.updateTradeAffordability();
        },

        resetTradeButton: function(){
            if(this.transactionLog.length == 0){
                if (this.tradeEnabled){
                    this.setTradeButtonTo(TRADE_BUTTON_HIDE);
                } else {
                    this.setTradeButtonTo(TRADE_BUTTON_SHOW);
                }
                if (this.transactionLog.length >0){
                    this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
                } else {
                    this.updateConfirmTradeButton(TRADE_BUTTON_HIDE);
                }
            }
        },

        setTradeButtonTo: function( toVal){
            switch(toVal){
                case TRADE_BUTTON_SHOW:
                    dojo.addClass(TRADE_BUTTON_ID,'bgabutton_gray');
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_red`).removeClass('bgabutton_red');
                    $(TRADE_BUTTON_ID).innerText= _('Show Trade');
                    break;
                case TRADE_BUTTON_HIDE:
                    dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_gray`).removeClass('bgabutton_gray');
                    dojo.addClass(TRADE_BUTTON_ID,'bgabutton_red');
                    $(TRADE_BUTTON_ID).innerText= _('Hide Trade');
                    break;
            }
        },
        updateConfirmTradeButton: function( show){
            switch(show){
                case TRADE_BUTTON_SHOW:
                    dojo.style(CONFIRM_TRADE_BTN_ID, 'display', 'inline-block');
                    break;
                case TRADE_BUTTON_HIDE:
                    dojo.style(CONFIRM_TRADE_BTN_ID, 'display', 'none');
                break;
            }
        },

        /** Show/Hide Tile Zones */
        toggleShowButton: function (index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                this.showTileZone(index);
            } else {
                this.hideTileZone(index);
            }
        },
        
        hideTileZone: function(index){
            if (!dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                let translatedString = _(this.asset_strings[index+15])
                $(TOGGLE_BTN_STR_ID[index]).innerText = translatedString;
                dojo.addClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        showTileZone: function(index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                let translatedString = _(this.asset_strings[index+20]);
                $(TOGGLE_BTN_STR_ID[index]).innerText = translatedString;
                dojo.removeClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        orderZone: function(index, order){
            dojo.style(TILE_CONTAINER_ID[index], 'order', order);
        },

        toggleShowAuctions: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(AUC_LOC_FUTURE);
        },

        toggleShowBldMain: function (evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(BLD_LOC_OFFER);
        },

        toggleShowBldDiscard: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(BLD_LOC_DISCARD);
        },

        toggleShowBldFuture: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(BLD_LOC_FUTURE);
        },

        /***** PLACE WORKERS PHASE *****/
        hireWorkerButton: function() {
            if( this.checkAction( 'hireWorker')){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/hireWorker.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } );                
            }
        },
        
        donePlacingWorkers: function( ){
            if( this.checkAction( 'done')){
                const tokenZone = this.token_divId[this.player_id];
                const playerBuildingZone = this.player_building_zone_id[this.player_id];
                if (dojo.query(`#${tokenZone} .token_worker`).length > 0 && dojo.query(`#${playerBuildingZone} .worker_slot:empty`).length > 0){
                    this.confirmationDialog( _('You still have workers to assign, Continue?'), 
                    dojo.hitch( this, function() {
                        this.ajaxDonePlacingWorkers();
                    } ) );
                    return;
                } else {
                    this.ajaxDonePlacingWorkers();
                }
            }
        },

        ajaxDonePlacingWorkers: function(){
            let warehouse_num = RESOURCES[this.warehouse];
            console.log(warehouse_num);
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/donePlacingWorkers.html", 
            {lock: true, warehouse:warehouse_num}, this, 
            function( result ) { 
                this.clearSelectable('worker', true); 
                this.clearSelectable('worker_slot', false);
                this.disableTradeBoardActions();
                this.destroyIncomeBreadcrumb();
                this.income_arr= [];
                this.disableTradeIfPossible();
                this.clearOffset();
                this.showPay = true;
            }, function( is_error) { } );
        },

        onUnPass: function () {
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/actionCancel.html", {}, this, function( result ) {
                this.showPay = true;
                this.undoPay = true;
            });
            // no checkAction! (because player is not active)
        },
        
        onUndoBidPass: function (evt) {
            this.undoTransactionsButton();
            if( this.checkAction( 'undo' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/cancelBidPass.html", {lock: true}, this, 
                function( result ) {}, function( is_error) { } ); 
            }
        },

        payLoan3Silver: function() {
            if (!this.checkAction( 'payLoanEvent' )){return;}
            
            let tradeChange = {'silver':-3,'loan':-1};
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                this.createTradeBreadcrumb(this.transactionLog.length, _("Pay Dept"), {'silver':-3}, {'loan':-1});

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP.payLoan_3silver);
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        onClickOnWorker: function( evt )
        {
            evt.preventDefault();
            dojo.stopEvent( evt );
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { return; }
            if ( !this.checkAction( 'placeWorker' ) ) { return; }

            this.updateSelected('worker', evt.target.id);
        },

        onClickOnWorkerSlot: function( evt )
        {
            //console.log('onClickOnWorkerSlot');
            dojo.stopEvent( evt );
            const target_divId = evt.target.id;
            if (target_divId.startsWith('token_worker')){// call click on worker
                return this.onClickOnWorker(evt);
            }
            if (!dojo.hasClass(target_divId, "selectable")) { 
                if (evt.target.parentNode.classList.contains('selectable')){
                    return this.onClickOnBuilding(evt, true);
                }
                return; }
            if( ! this.checkAction( 'placeWorker' ) )
            { return; }

            if (this.last_selected['worker'] == ""){
                const unassignedWorkers = dojo.query(`#worker_zone_${this.player_color[this.player_id]} .token_worker`);// find unassigned workers.
                if (unassignedWorkers.length == 0){
                    this.showMessage( _("You must select a worker"), 'error' );
                    return;
                } else {
                    this.last_selected['worker'] = unassignedWorkers[0].id;
                }
            }
            //console.log(target_divId);
            let target_workers = dojo.query(`#${target_divId} .token_worker`).length;
            if (target_workers ==1 && !target_divId.endsWith('_3') || target_workers ==2 && target_divId.endsWith('_3') ){
                this.showMessage(_("You cannot place additional workers there"), 'error');
                    return;
            }
            const building_key = Number(target_divId.split('_')[1]);
            const building_slot = Number(target_divId.split('_')[2]);

            const w_key = this.last_selected['worker'].split('_')[2];
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: w_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {
                dojo.removeClass(this.last_selected['worker'], 'selected');
                this.last_selected['worker'] = '';
             }, function( is_error) { });
        },


        /**remove all buttons... 
         * be careful...
         */
        removeButtons: function () {
            let buttons = dojo.query(`#generalactions .bgabutton`);
            for (let i in buttons){
                this.fadeOutAndDestroy(buttons[i].id);
            }
        },
        
        /***** PAY WORKERS or PAY AUCTION PHASE *****/
        donePay: function( ){
            if (this.allowTrade || this.checkAction( 'done')){
                if (!this.validPay()){
                    this.showMessage( _("You can't afford to pay, make trades or take loans"), 'error' );
                    return;
                }
                let args = {gold: this.goldAmount, lock: true};
                if (this.transactionLog.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        allowTrade:this.allowTrade,
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.ajaxCallDonePay(args);
                     }, function( is_error) {});    
                } else { // if no trades, just pay.
                    this.ajaxCallDonePay(args);
                }
            }
        },

        ajaxCallDonePay: function( args){
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/donePay.html", args , this, 
                function( result ) { 
                    this.donePayCleanup();
                    if (this.currentState == "allocateWorkers"){
                        this.addActionButton('button_unpass', _('undo'), 'onUnPass', null, false, 'red');
                        dojo.place('button_unpass', 'generalactions', 'first');
                    }
                }, function( is_error) { } );
        },

        donePayCleanup: function(){
            this.showPay = false;
            this.silverCost = 0;
            this.goldAmount = 0;
            this.destroyPaymentBreadcrumb();
            this.changeStateCleanup();
        },

        validPay:function(){
            if (this.new_resourceCounter.silver.getValue() < 0)
                return false;
            if (this.new_resourceCounter.gold.getValue() < 0)
                return false;
            return true;
        },

        confirmDummyBidButton: function ( evt )
        {
            if( this.checkAction( 'dummy' )){
                if (this.last_selected['bid'] == ""){
                    this.showMessage( _("You must select a bid"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(this.last_selected['bid']);
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmDummyBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        setupBidsForNewRound: function ()
        {
            for(let p_id in this.player_color){
                if (p_id == DUMMY_OPT) continue;
                this.moveBid(p_id, NO_BID);
            }
        },

        /***** EVENT PHASES *****/
        doneTradingEvent: function(){
            if (this.checkAction('event')){
                if (this.transactionLog.length > 0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxDoneTradingEvent();
                     }, function( is_error) {});   
                } else {
                    this.ajaxDoneTradingEvent();
                }
            }
        },

        ajaxDoneTradingEvent: function(){
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/doneTradingEvent.html", {lock: true}, this, 
            function( result ) {this.changeStateCleanup(); }, 
            function( is_error) { } );
        },

        /***** PLAYER BID PHASE *****/
        onClickOnBidSlot: function ( evt ) 
        {
            evt.preventDefault();
            dojo.stopEvent( evt );
            var target_divId = evt.target.id;
            if (target_divId.startsWith('token')) { // if clicked on token in bid_slot
                target_divId = evt.target.parentNode.id; 
            }
            if ( !dojo.hasClass(target_divId, "selectable")) { return; }
            if ( !this.checkAction( 'selectBid' )) { return; }
            this.updateSelected('bid', target_divId);
        },

        passBidButton: function() {
            if( this.checkAction( 'pass')){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBid.html", {lock: true}, this, 
                function( result ) { this.clearSelectable('bid', true); }, 
                function( is_error) { } );
            }
        },

        confirmBidButton: function () 
        {
            if( this.checkAction( 'confirmBid')){
                if (this.last_selected['bid'] == ""){
                    this.showMessage( _("You must select a bid"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(this.last_selected['bid']);
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        /***** cancel back to PAY AUCTION PHASE *****/
        cancelTurn: function() {
            this.undoTransactionsButton();
            if( this.checkAction( 'undoLot' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/cancelTurn.html", {lock: true}, this, 
                function( result ) {
                    this.showPay = true;
                    this.resetTradeValues();
                }, function( is_error) { } ); 
            }
        },

        /***** CHOOSE BONUS OPTION *****/
        onSelectBonusOption: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            if( !dojo.hasClass(evt.target.id,'selectable')){ return; }
            if( this.checkAction( 'chooseBonus' )) {
                let type = evt.target.id.split('_')[3];
                this.updateSelectedBonus(type);
            }
        },

        doneSelectingRailBonus: function(){
            if (this.checkAction( 'chooseBonus' )){
                if (this.last_selected['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = this.last_selected['bonus'].split('_')[3];
                const typeNum = RESOURCES[type];
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectRailBonus.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.changeStateCleanup();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
            }
        },

        doneSelectingRailBonusEvent: function (){
            if (this.checkAction( 'eventBonus' )){
                if (this.last_selected['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = this.last_selected['bonus'].split('_')[3];
                const typeNum = RESOURCES[type];
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectRailBonusEvent.html", {bonus: typeNum, lock: true}, this, 
                    function( result ) { 
                        this.changeStateCleanup();
                        this.clearSelectable('bonus', true);}, 
                    function( is_error) { } ); 
            }
        },

        selectBonusButton: function( evt ) {
            //console.log('selectBonusButton', evt);
            if (this.checkAction( 'chooseBonus' )){
                let target_id = (evt.target.id?evt.target.id:evt.target.parentNode.id);
                let type = target_id.split("_")[2];
                this.updateSelectedBonus(type);
            }
        },
         
        updateSelectedBonus: function(type){
            //console.log(type);
            let btn_id = `btn_bonus_${type}`;
            let option_id = BONUS_OPTIONS[RESOURCES[type]];
            if (this.last_selected.bonus ==''){
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
                dojo.style('btn_choose_bonus', 'display', 'inline-block');
            } else if (this.last_selected.bonus == option_id) { //this was selected
                dojo.removeClass(btn_id, 'bgabutton_blue');
                dojo.addClass(btn_id, 'bgabutton_gray');
                dojo.style('btn_choose_bonus', 'display','none');
            } else { //other thing was selected.
                let lastSelected_id =  `btn_bonus_${this.last_selected.bonus.split('_')[3]}`;
                dojo.removeClass(lastSelected_id, 'bgabutton_blue');
                dojo.addClass(lastSelected_id, 'bgabutton_gray');
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
            }
            this.updateSelected('bonus', option_id);
        },

        /***** BUILD BUILDING PHASE *****/
        makeBuildingsSelectable: function (allowed_buildings){
            this.allowed_building_stack = [];
            //console.log('makeBuildingsSelectable');
            for(let i in allowed_buildings){
                const building = allowed_buildings[i];
                const building_divId = `${TPL_BLD_TILE}_${building.building_key}`;
                dojo.addClass(building_divId, 'selectable');
                if (!this.allowed_building_stack.includes(building.building_id)){
                    this.allowed_building_stack.push(building.building_id);
                }
            }
            for (let i in this.allowed_building_stack){
                let b_id = this.allowed_building_stack[i];
                let order = (30*Number(this.building_info[b_id].type)) + Number(b_id) - 100;
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
        },

        fixBuildingOrder: function(){
            for (let i in this.allowed_building_stack){
                let b_id = this.allowed_building_stack[i];
                let order = (30*Number(this.building_info[b_id].type)) + Number(b_id);
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
            this.allowed_building_stack=[];
        },

        updateTradeAffordability: function(){
            //console.log('updateTradeAffordability');

            if (this.isSpectator) return;
            for (let trade_id = 0; trade_id < 6; trade_id++){
                let type =  this.getKeyByValue(TRADE_MAP, trade_id).split('_')[1];
                //console.log('type', type);
                // buy
                let node_loc = `#trade_buy_${type}`;
                let node2_loc= `#trbuy_buy_${type}`;
                if (this.canAddTrade(this.getBuyChange(type))){
                    this.updateAffordability(node_loc, AFFORDABLE);
                    this.updateAffordability(node2_loc, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc, UNAFFORDABLE);
                    this.updateAffordability(node2_loc, UNAFFORDABLE);
                }
                // sell
                node_loc = `#trade_sell_${type}`;
                node2_loc= `#trsel_sell_${type}`;
                if (this.canAddTrade(this.getSellChange(type))){
                    this.updateAffordability(node_loc, AFFORDABLE);
                    this.updateAffordability(node2_loc, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc, UNAFFORDABLE);
                    this.updateAffordability(node2_loc, UNAFFORDABLE);
                }
            }
            // market
            if (this.hasBuilding[this.player_id][BLD_MARKET]){
                // food
                let node_loc = `#${this.player_building_zone_id[this.player_id]} .market_food`;
                if (this.canAddTrade(this.getMarketChange('food'))){
                    this.updateAffordability(node_loc, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc, UNAFFORDABLE);
                }
                // steel
                node_loc = `#${this.player_building_zone_id[this.player_id]} .market_steel`;
                if (this.canAddTrade(this.getMarketChange('steel'))){
                    this.updateAffordability(node_loc, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc, UNAFFORDABLE);
                }   
            }
            // bank 
            if (this.hasBuilding[this.player_id][BLD_BANK]){
                let node_loc =  `#${BANK_DIVID}`;
                if (this.canAddTrade({'trade':-1})){ // can afford
                    this.updateAffordability(node_loc, AFFORDABLE);
                } else {// can not afford
                    this.updateAffordability(node_loc, UNAFFORDABLE);
                }
            }
        },
        
        /**
         * applies the class for affordable state to node at locator.
         * @param {*} node 
         * @param {*} afford_val 
         */
        updateAffordability: function(node_locator, afford_val){
            switch(afford_val){
                case AFFORDABLE:
                    dojo.query(node_locator)
                           .addClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[TRADEABLE]);
                    break;
                case UNAFFORDABLE:
                    dojo.query(node_locator)
                        .removeClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                          .addClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[TRADEABLE]);
                    break;
                case TRADEABLE:
                    dojo.query(node_locator)
                        .removeClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                           .addClass(AFFORDABILITY_CLASSES[TRADEABLE]);
                    break;
                default:
                    dojo.query(node_locator)
                        .removeClass(AFFORDABILITY_CLASSES[AFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[UNAFFORDABLE])
                        .removeClass(AFFORDABILITY_CLASSES[TRADEABLE]);
            }
        },

        updateBuildingAffordability: function(showIncomeCost = false){
            //console.log('updateBuildingAffordability');
            if (this.isSpectator) return;
            let buildings = dojo.query(`#${TILE_CONTAINER_ID[0]} .${TPL_BLD_TILE}, #${TILE_CONTAINER_ID[1]} .${TPL_BLD_TILE}`);
            for (let i in buildings){
                let bld_html= buildings[i];
                if (bld_html.id == null) continue;
                let b_key = Number(bld_html.id.split('_')[2]);
                let b_id = $(bld_html.id).className.split(' ')[1].split('_')[2];
                let b_loc = `#${bld_html.id}`;
                if (this.hasBuilding[this.player_id][b_id]) { //can't buy it twice, mark it un-affordable.
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[ALREADY_BUILT]};">${_(this.asset_strings[ALREADY_BUILT])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, ALREADY_BUILT));
                    }
                    continue;
                }
                let afford = this.isBuildingAffordable(b_id, showIncomeCost);

                if (afford==1){// affordable
                    this.updateAffordability(b_loc, AFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[AFFORDABLE]};">${_(this.asset_strings[AFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, AFFORDABLE));
                    }
                } else if (afford ==0){//tradeable
                    this.updateAffordability(b_loc, TRADEABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[TRADEABLE]};">${_(this.asset_strings[TRADEABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, TRADEABLE));
                    }
                } else {
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[UNAFFORDABLE]};">${_(this.asset_strings[UNAFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.formatTooltipBuilding(b_id, b_key, UNAFFORDABLE));
                    }
                }
            }
        },

        /**
         * Checks if building is affordable
         * @param {*} b_id building Id of building to check
         * @returns affordability
         *         -1 if un-affordable (even with trades + loans)
         *          0 if potentially affordable (via trades + loans)
         *          1 if can currently afford (no trades required)
         */
        isBuildingAffordable: function(b_id){
            //console.log("isBuildingAffordable", b_id);
            if (this.building_info[b_id].cost == null) return 1;// no cost, can afford.
            if (this.building_info[b_id].cost.length == 0) return 1;// no cost, can afford.
            const p_id = this.player_id;
            let cost = this.copyArray(this.building_info[b_id].cost);

            let off_gold = this.getOffsetValue('gold');
            let gold = this.board_resourceCounters[p_id].gold.getValue() + off_gold + this.getIncomeOffset('gold') - this.goldAmount;
            //console.log('gold', gold, this.board_resourceCounters[p_id].gold.getValue(),  off_gold, this.getIncomeOffset('gold'), -this.goldAmount);
            let adv_cost = 0;
            let trade_cost = 0;
            for(let type in cost){
                let res_amt = this.board_resourceCounters[p_id][type].getValue() + this.getOffsetValue(type) + this.getIncomeOffset(type);
                switch(type){
                    case 'wood':
                    case 'food':
                    case 'steel':
                        if (cost[type] > res_amt){
                            trade_cost += (cost[type] - res_amt);
                        }
                    break;
                    case 'gold':
                        if (cost.gold > gold){
                            trade_cost += (cost.gold - gold);
                            gold = 0;
                        } else {
                            gold -= cost.gold;
                        }
                    break;
                    case 'copper':
                    case 'cow':
                        if (cost[type] > res_amt){
                            adv_cost += (cost[type] - res_amt);
                        }
                    break;
                }
            }
            if (this.hasBuilding[p_id][BLD_RIVER_PORT] && gold > 0){
                if (adv_cost > gold){ //buy gold for each missing one.
                    trade_cost += (adv_cost - gold);
                }
            } else {
                trade_cost += adv_cost;
                if (adv_cost > gold){
                    trade_cost += (adv_cost - gold);
                }
            }
            let trade_avail = this.board_resourceCounters[p_id].trade.getValue() + this.getOffsetValue('trade') + this.getIncomeOffset('trade');
            
            if (trade_cost <= (this.building_discount?1:0))// no trades required.
                return 1;
            if ((this.hasBuilding[p_id][BLD_RIVER_PORT]?trade_avail-1:trade_avail) >= (this.building_discount?trade_cost-2:trade_cost)) 
                return 0;
            else
                return -1;
        },

        /**
         * Triggered when user clicks on building,
         * if this is called with the flag 'parent' == true, then the id in the evt is the child of this building.(clicked on worker slot or trade_option).  
         * If the building is marked as 'selectable' we will attempt to select it, and update the UI accordingly.
         */
        onClickOnBuilding: function( evt , parent= false){
            evt.preventDefault();
            dojo.stopEvent( evt );
            let target_id = evt.target.id;
            if (parent) {target_id = evt.target.parentNode.id;}
            else if (target_id.startsWith('token_worker')){ 
                return this.onClickOnWorker( evt ); 
            } else if (target_id.startsWith('slot_')){
                return this.onClickOnWorkerSlot( evt );
            } else if (target_id.endsWith('trade_market_food_steel') || target_id.endsWith('trade_market_wood_food')){
                return this.onClickOnMarketTrade( evt ); 
            } else if (target_id.startsWith('trade_')){
                return this.onClickOnMarketTrade( evt ); 
            }
            if( !evt.target.classList.contains( 'selectable')){ return; }
            if( this.checkAction( 'buildBuilding' )) {
                let b_id = $(target_id).className.split(' ')[1].split('_')[2];
                this.updateSelected('building', target_id);
                if (!dojo.hasClass(target_id, 'selected')){
                    dojo.addClass('btn_choose_building', 'disabled');
                    $('bld_name').innerText = '';
                    this.showBuildingCost();
                } else {
                    dojo.removeClass('btn_choose_building', 'disabled');
                    if (this.building_info[b_id].cost == null) {
                        $('bld_name').innerText = _(this.building_info[b_id].name);  
                    } else {
                        $('bld_name').innerText = _(this.building_info[b_id].name);
                        this.showBuildingCost();
                    }
                }
            }
        },

        chooseBuilding: function () {
            //console.log('chooseBuilding');
            if (this.checkAction( 'buildBuilding')){
                const building_divId = this.last_selected['building'];
                if (building_divId == "") {
                    this.showMessage( _("You must select a building"), 'error' );
                    return;
                }
                //console.log('building_discount', this.building_discount);
                if (this.building_discount){
                    this.chooseBuildingWithDiscount();
                } else {
                    const building_key = Number(building_divId.split("_")[2]);
                    let args = {building_key: building_key, goldAsCow:this.goldAsCow?1:0, goldAsCopper:this.goldAsCopper?1:0, steelReplace:(this.cost_replace.steel??0), lock: true};
                    if (this.transactionLog.length >0){ // makeTrades first.
                        this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                            lock: true, 
                            trade_action: this.transactionLog.join(',')
                         }, this, function( result ) {
                            this.clearTransactionLog();
                            this.ajaxCallBuildBuilding( args );
                         }, function( is_error) {});    
                    } else { // if no trades, just pay.
                        this.ajaxCallBuildBuilding( args );
                    }
                }
            }
        },

        ajaxCallBuildBuilding: function ( args ) {
            //console.log('ajaxCallBuildBuilding', args);
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/buildBuilding.html", args, this, 
            function( result ) {
                this.changeStateCleanup();
                this.destroyBuildingBreadcrumb();
                this.updateAffordability(`#${TPL_BLD_TILE}_${args.building_key}`, 0);
             }, function( is_error) { } );
        },

        chooseBuildingWithDiscount: function(){
            //console.log('chooseBuildingWithDiscount');
            if (!this.building_discount){
                console.error("chooseBuildingWithDiscount called incorrectly");
                return true;
            }
            let building_cost = this.getBuildingCost();
            //console.log('building_cost', building_cost);
            if (Object.keys(building_cost).length == 0){
                return false;// use normal build.
            }
            if (Object.keys(building_cost).length == 1){
                const building_key = Number(this.last_selected.building.split("_")[2]);
                let args = {building_key: building_key, 
                            goldAsCow:this.goldAsCow?1:0, 
                            goldAsCopper:this.goldAsCopper?1:0, 
                            steelReplace:(this.cost_replace.steel??0), 
                            discount:RESOURCES[Object.keys(building_cost)[0]], 
                            lock: true};
                if (this.transactionLog.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxCallBuildBuildingDiscount( args );
                     }, function( is_error) {});    
                } else { // if no trades, just pay.
                    this.ajaxCallBuildBuildingDiscount( args );
                }
            } else {
                this.removeButtons();
                this.updatePageTitle(_("You must choose a discount resource"));
                this.last_selected.building_discount ="";
                for(let type in building_cost){
                    this.addActionButton( `btn_resource_${type}`, this.tkn_html[type], 'selectBuildingDiscountResource', null, false, 'gray');
                }
                this.addActionButton( 'btn_choose_resource', dojo.string.substitute(_('Choose ${resource}'),{'resource':"<div id='build_discount_icon'></div>"}), 'doneSelectingBuildingDiscount');   
            }
            return true;
        },

        selectBuildingDiscountResource: function( evt ) {
            //console.log('selectBuildingDiscountResource', evt);
            let target_id = (evt.target.id?evt.target.id:evt.target.parentNode.id);
            let type = target_id.split("_")[2];
            let btn_id = `btn_resource_${type}`;

            if (this.last_selected.building_discount ==''){ //nothing was selected
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
                this.last_selected.building_discount = type;
                dojo.place(this.tkn_html[type], 'build_discount_icon');
            } else if (this.last_selected.building_discount == option_id) { //this was selected
                dojo.removeClass(btn_id, 'bgabutton_blue');
                dojo.addClass(btn_id, 'bgabutton_gray');
                dojo.place(this.tkn_html[type], 'build_discount_icon');
                this.last_selected.building_discount = '';
            } else { //other thing was selected.
                let lastSelected_id =  `btn_resource_${this.last_selected.building_discount}`;
                dojo.removeClass(lastSelected_id, 'bgabutton_blue');
                dojo.addClass(lastSelected_id, 'bgabutton_gray');
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
                this.last_selected.building_discount = type;
            }        
        },

        doneSelectingBuildingDiscount: function( evt ){
            if (this.last_selected.building_discount === ''){
                console.error("doneSelectingBuildingDiscount");
            }
            const building_key = Number(this.last_selected.building.split("_")[2]);
            let args = {building_key: building_key, 
                        goldAsCow:this.goldAsCow?1:0, 
                        goldAsCopper:this.goldAsCopper?1:0, 
                        steelReplace:(this.cost_replace.steel??0), 
                        discount:RESOURCES[this.last_selected.building_discount], 
                        lock: true};
            if (this.transactionLog.length >0){ // makeTrades first.
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                    lock: true, 
                    trade_action: this.transactionLog.join(',')
                    }, this, function( result ) {
                    this.clearTransactionLog();
                    this.ajaxCallBuildBuildingDiscount( args );
                    }, function( is_error) {});    
            } else { // if no trades, just pay.
                this.ajaxCallBuildBuildingDiscount( args );
            }
        },

        ajaxCallBuildBuildingDiscount: function(args){
            //console.log('ajaxCallBuildBuildingDiscount', args);
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/buildBuildingDiscount.html", args, this, 
            function( result ) {
                this.last_selected.building_discount="";
                this.building_discount = false;
                this.changeStateCleanup();
                this.updateAffordability(`#${TPL_BLD_TILE}_${args.building_key}`, 0);
             }, function( is_error) { } );
        },

        toggleGoldAsCopper: function(){
            if (this.goldAsCopper){
                this.goldAsCopper = false;
                dojo.removeClass('btn_gold_copper', 'bgabutton_blue');
                dojo.addClass('btn_gold_copper', 'bgabutton_red');
                dojo.addClass('copper_as', 'no');
            } else {
                this.goldAsCopper = true;
                dojo.removeClass('btn_gold_copper', 'bgabutton_red');
                dojo.addClass('btn_gold_copper', 'bgabutton_blue');
                dojo.removeClass('copper_as', 'no');
            }
            if (this.last_selected.building != ""){
                this.showBuildingCost();
            }
        },

        toggleGoldAsCow: function() { 
            if (this.goldAsCow) {
                this.goldAsCow = false;
                dojo.removeClass('btn_gold_cow', 'bgabutton_blue');
                dojo.addClass('btn_gold_cow', 'bgabutton_red');
                dojo.addClass('cow_as', 'no');
            } else {
                this.goldAsCow = true;
                dojo.removeClass('btn_gold_cow', 'bgabutton_red');
                dojo.addClass('btn_gold_cow', 'bgabutton_blue');
                dojo.removeClass('cow_as', 'no');
            }
            if (this.last_selected.building != ""){
                this.showBuildingCost();
            }
        },

        doNotBuild: function () {
            if (this.checkAction( 'doNotBuild' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doNotBuild.html", {lock: true}, this, 
                function( result ) { 
                    this.clearSelectable('building', true); 
                    this.changeStateCleanup();
                }, function( is_error) { } );
            }
        },

        updateScore: function (p_id, score_left, score_right = null) {
            if (p_id in this.score_leftCounter){    // when we have their resources.
                this.score_leftCounter[p_id].setValue(score_left);
            } else if (this.scoreCtrl[p_id] != undefined){ // non-active player in `dont-show resources`
                this.scoreCtrl[p_id].setValue(score_left);
            }
            if (score_right == null){   // hide this for end game or not included etc.
                dojo.query(`player_total_score_${p_id}`).addClass('noshow');
            } else if (score_right!=null){ //otherwise update it.
                dojo.query(`player_total_score_${p_id}`).removeClass('noshow');
                this.score_rightCounter[p_id].setValue(score_right);
            }
            
        },

        calculateAndUpdateScore: function(p_id) {
            var bld_arr = this.calculateBuildingScore(p_id);
            let bld_score = bld_arr.static + bld_arr.bonus
            let left_score = bld_score;
            var right_score = null;
            let row_Vp = this.replaceTooltipStrings(_("${vp} tokens:"));
            let row_BldSt = this.replaceTooltipStrings(_("${vp} from buildings (static)"));
            let row_BldBo = this.replaceTooltipStrings(_("${vp} from buildings (bonus)"));
            let row_GlCwCp = this.replaceTooltipStrings(_("${vp} from ${gold}${cow}${copper}")); 
            let row_loan = this.replaceTooltipStrings(_("${vp} from ${loan}"));
            let row_total = this.replaceTooltipStrings(_("${vp} Total"));
            let row_subTotal = this.replaceTooltipStrings(_("${vp} Subtotal"));

            if (this.show_player_info || p_id == this.player_id){
                let vp_pts     = this.board_resourceCounters[p_id]['vp'].getValue();
                let gold_pts   = this.board_resourceCounters[p_id]['gold'].getValue() * 2;
                let cow_pts    = this.board_resourceCounters[p_id]['cow'].getValue()  * 2;
                let copper_pts = this.board_resourceCounters[p_id]['copper'].getValue() * 2;
                let glCwCp_pts = gold_pts + cow_pts + copper_pts;
                let loan_count = this.board_resourceCounters[p_id]['loan'].getValue();
               
                let loan_pts = 0;
                for (let i =1; i <= loan_count; i++){
                    loan_pts -= (i);
                }
                let score_noLoan = bld_score + vp_pts + gold_pts + cow_pts + copper_pts;
                total_score = score_noLoan + loan_pts;
                if (this.show_player_info){
                    var tt_right = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><td>${row_3}</td><td>${val_3}</td></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+
                    '<tr><th>${row_6}</th><th>${val_6}</th></tr></table></div>',{   
                        row_1:row_Vp,     val_1:vp_pts,
                        row_2:row_BldSt,  val_2:bld_arr.static,
                        row_3:row_BldBo,  val_3:bld_arr.bonus,
                        row_4:row_GlCwCp, val_4:glCwCp_pts,
                        row_5:row_loan,   val_5:loan_pts,
                        row_6:row_total,  val_6:total_score,
                    });
                    var tt_left = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><td>${row_3}</td><td>${val_3}</td></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><th>${row_5}</th><th>${val_5}</th></tr>'+
                    '<tr><td>${row_6}</td><td>${val_6}</td></tr><tr><th>${row_7}</th><th>${val_7}</th></tr></table></div>',{
                        row_1:row_Vp,       val_1:vp_pts,
                        row_2:row_BldSt,    val_2:bld_arr.static,
                        row_3:row_BldBo,    val_3:bld_arr.bonus,
                        row_4:row_GlCwCp,   val_4:glCwCp_pts,
                        row_5:row_subTotal, val_5:score_noLoan,
                        row_6:row_loan,     val_6:loan_pts,
                        row_7:row_total,    val_7:total_score,
                    });
                    left_score = score_noLoan;
                    right_score = total_score;
                } else { //this player in don't show resources game.
                    var tt_left = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><th>${row_3}</th><th>${val_3}</th></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+
                    '<tr><th>${row_6}</th><th>${val_6}</th></tr></table></div>',{   
                        row_1:row_BldSt,    val_1:bld_arr.static,
                        row_2:row_BldBo,    val_2:bld_arr.bonus,
                        row_3:row_subTotal, val_3:bld_score,
                        row_4:row_Vp,       val_4:vp_pts,
                        row_4:row_GlCwCp,   val_4:glCwCp_pts,
                        row_5:row_loan,     val_5:loan_pts,
                        row_6:row_total,    val_6:total_score,
                    });
                    var tt_right = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                    '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><td>${row_3}</td><td>${val_3}</td></tr>'+
                    '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+
                    '<tr><th>${row_6}</th><th>${val_6}</th></tr></table></div>',{
                        row_1:row_BldSt,    val_1:bld_arr.static,
                        row_2:row_BldBo,    val_2:bld_arr.bonus,
                        row_3:row_Vp,       val_3:vp_pts,
                        row_4:row_GlCwCp,   val_4:glCwCp_pts,
                        row_5:row_loan,     val_5:loan_pts,
                        row_6:row_total,    val_6:total_score,
                    });
                    left_score = bld_score;
                    right_score = total_score;
                }
                this.addTooltipHtml(`p_score_${p_id}`, tt_left);
                this.addTooltipHtml(`player_total_score_${p_id}`, tt_right); 
            } else {
                let tt = dojo.string.substitute('<div class="tt_table"> <table><tr><td>${row_1}</td><td>${val_1}</td></tr>'+
                '<tr><td>${row_2}</td><td>${val_2}</td></tr><tr><th>${row_3}</th><th>${val_3}</th></tr>'+
                '<tr><td>${row_4}</td><td>${val_4}</td></tr><tr><td>${row_5}</td><td>${val_5}</td></tr>'+ 
                '<tr><td>${row_6}</td><td>${val_6}</td></tr></table></div>',{
                    row_1:row_BldSt,    val_1:bld_arr.static,
                    row_2:row_BldBo,    val_2:bld_arr.bonus,
                    row_3:row_subTotal, val_3:bld_score,
                    row_4:row_Vp,       val_4:_("???"),
                    row_5:row_GlCwCp,   val_5:_("???"),
                    row_6:row_loan,     val_6:_("???"),});
                this.addTooltipHtml(`player_score_${p_id}`, tt);
            }
            this.updateScore(p_id, left_score, right_score);
        },

        calculateBuildingScore: function(p_id) {
            let static = 0;
            let bld_type = [0,0,0,0,0,0,0];// count of bld of types: [res,com,ind,spe]
            let vp_b =     [0,0,0,0,0,0,0];//vp_b [Res, Com, Ind, Spe, Wrk, Trk, Bld]
            for(let b_id in this.hasBuilding[p_id]){
                if ('vp' in this.building_info[b_id]){
                    static += this.building_info[b_id].vp;
                }
                if ('vp_b' in this.building_info[b_id]){
                    if (this.building_info[b_id].vp_b == VP_B_WRK_TRK){
                        vp_b[VP_B_WORKER] ++;
                        vp_b[VP_B_TRACK] ++;
                    } else {
                        vp_b[this.building_info[b_id].vp_b]++;
                    }
                }
                bld_type[this.building_info[b_id].type] ++;
                bld_type[VP_B_BUILDING]++;
            }
            
            bld_type[VP_B_WORKER] = this.getPlayerWorkerCount(p_id);
            bld_type[VP_B_TRACK] = this.getPlayerTrackCount(p_id);
            let bonus = 0;
            for (let i in vp_b){
                bonus += (bld_type[i] * vp_b[i]);
            }
            return {static:static, bonus:bonus};
        },

        getPlayerWorkerCount:function(p_id){
            const playerZone = `player_zone_${this.player_color[p_id]}`;
            const workerSelector = TYPE_SELECTOR['worker'];
            return dojo.query(`#${playerZone} ${workerSelector}`).length;
        },

        getPlayerTrackCount:function(p_id){
            const playerZone = `player_zone_${this.player_color[p_id]}`;
            const trackSelector = TYPE_SELECTOR['track'];
            return dojo.query(`#${playerZone} ${trackSelector}`).length;
        },

        /***** Building Bonus *****/

        workerForFreeBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerBuilding.html", {lock: true}, this, 
            function( result) {this.changeStateCleanup();}, function( is_error) { } );}
        },
        
        passBonusBuilding: function (){
            if (this.checkAction( 'buildBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusBuilding.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            } 
        },
        
        moveObjectAndUpdateClass: function(mobile_obj, target_obj, addClass, update, className){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0);
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_hide', {target_obj:target_obj, mobile_obj:mobile_obj, addClass:addClass, update:update, className:className}));
            animation_id.play();
        },

        callback_hide: function (params) {
            dojo.place (params.mobile_obj, params.target_obj);
            $(params.mobile_obj).style.removeProperty('top');
            $(params.mobile_obj).style.removeProperty('left');
            $(params.mobile_obj).style.removeProperty('position');
            if (params.addClass){
                dojo.addClass(params.update, params.className);
            } else {
                dojo.removeClass(params.update, params.className);
            }
        },

        moveObjectAndUpdateValues: function(mobile_obj, target_obj){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0);
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_update', {target_obj:target_obj, mobile_obj:mobile_obj, position:"last"}));
            animation_id.play();
        },

        callback_update: function (params) {
            dojo.place (params.mobile_obj, params.target_obj, params.position);
            $(params.mobile_obj).style.removeProperty('top');
            $(params.mobile_obj).style.removeProperty('left');
            $(params.mobile_obj).style.removeProperty('position');
            this.resetTradeValues();
            this.setOffsetForIncome();
        },

        moveObject: function(mobile_obj, target_obj){
            var animation_id = this.slideToObject( mobile_obj, target_obj, 500, 0 );
            dojo.connect(animation_id, 'onEnd', dojo.hitch(this, 'callback_function', {target_obj:target_obj, mobile_obj:mobile_obj, position:"last"}));
            animation_id.play();
        },

        callback_function: function(params) {
            dojo.place (params.mobile_obj, params.target_obj, params.position);
            $(params.mobile_obj).style.removeProperty('top');
            $(params.mobile_obj).style.removeProperty('left');
            $(params.mobile_obj).style.removeProperty('position');
        },
         

        /***** Auction Bonus *****/
        /** called (directly) when auction bonus is only worker for Free */
        /** called when auction bonus is worker for free and rail advancement. */
        workerForFreeAuction: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerAuction.html", {lock: true }, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        bonusTypeForType: function(tradeAway, tradeFor) {
            if (this.checkAction( 'auctionBonus' )){
                let args = {lock: true, tradeAway: tradeAway, tradeFor: tradeFor};
                if (this.transactionLog.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.clearOffset();
                        this.ajaxBonusTypeForType( args );
                     }, function( is_error) {});   
                } else{
                    this.ajaxBonusTypeForType( args );
                }
            }
        },

        ajaxBonusTypeForType(args){
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/bonusTypeForType.html", args, this, 
            function( result) {this.changeStateCleanup();}, function( is_error) { } );
        },

        woodForTrack: function() {
            this.bonusTypeForType(WOOD, TRACK);
        },

        goldFor4VP: function() {
            this.bonusTypeForType(GOLD, VP);
        },

        copperFor4VP: function() {
            this.bonusTypeForType(COPPER, VP);
        },

        cowFor4VP: function() {
            this.bonusTypeForType(COW, VP);
        },

        foodFor2VP: function() {
            this.bonusTypeForType(FOOD, VP);
        },

        passBonusAuction: function() {
            if (this.checkAction( 'auctionBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusAuction.html", {lock: true}, this, 
                    function( result ) { this.changeStateCleanup();},function( is_error) { } );
            }
        },

        /***** eventBonus ******/

        workerForFreeEvent: function() {
            if (this.checkAction( 'eventBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerEvent.html", {lock: true, lot:false}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        workerForFreeLotEvent: function() {
            if (this.checkAction( 'eventLotBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/freeHireWorkerEvent.html", {lock: true, lot:true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        silver2ForTrack: function(){
            if (this.checkAction( 'eventLotBonus' )){
                let args = {lock: true, tradeAway: tradeAway, tradeFor: tradeFor};
                if (this.transactionLog.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxBonusTypeForType( args );
                     }, function( is_error) {});   
                } else{
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/silver2forTrackEvent.html", {lock: true }, this, 
                    function( result) {this.changeStateCleanup();}, function( is_error) { } );
                }
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/silver2forTrackEvent.html", {lock: true }, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        steelBuildBuilding: function() {
            if (this.checkAction( 'eventLotBonus' )){
                let args = {lock: true, tradeAway: tradeAway, tradeFor: tradeFor};
                if (this.transactionLog.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxBonusTypeForType( args );
                     }, function( is_error) {});   
                } else{
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/steelBuildBuilding.html", {lock: true }, this, 
                    function( result) {this.changeStateCleanup();}, function( is_error) { } );
                }
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/steelBuildBuilding.html", {lock: true }, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        passBonusLotEvent: function() {
            if (this.checkAction( 'eventLotBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusLotEvent.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        passBonusEvent: function() {
            if (this.checkAction( 'eventBonus' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/passBonusEvent.html", {lock: true}, this, 
                function( result) {this.changeStateCleanup();}, function( is_error) { } );
            }
        },

        /***** endBuildRound *****/
        confirmBuildPhase: function () {
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmChoices.html", {lock: true}, this, 
                    function( result ) { }, 
                    function( is_error) { } );
            }
        },

        /***** END game actions *****/
        payLoanSilver: function( evt ) {
            if (!this.checkAction( 'payLoan' )){return;}
            
            let tradeChange = {'silver':-5,'loan':-1};
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {'silver':-5};
                let tradeFor = {'loan':-1};
                this.createTradeBreadcrumb(this.transactionLog.length, _("Pay Dept"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP.payLoan_silver);
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        payLoanGold: function () {
            if (!this.checkAction( 'payLoan' )){return;}
            let tradeChange = {'gold':-1,'loan':-1};
            if(this.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                let tradeAway = {'gold':-1};
                let tradeFor = {'loan':-1};
                this.createTradeBreadcrumb(this.transactionLog.length, _("Pay Dept"), tradeAway, tradeFor);

                this.transactionCost.push(tradeChange);
                this.transactionLog.push(TRADE_MAP.payLoan_gold);
                this.setupUndoTransactionsButtons();
                this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
            } else {
                this.showMessage( _("You cannot afford this"), 'error' );
            }
        },

        cancelUndoTransactions: function () {
            this.undoTransactionsButton();
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/undoTransactions.html", {lock: true}, this, 
                function( result ) {
                this.resetTradeValues();
                this.disableTradeIfPossible();
                if (this.currentState == 'allocateWorkers'){
                    this.setOffsetForIncome();
                 }
                }, function( is_error) { } );
            }
        },

        doneEndgameActions: function () {
            if (this.checkAction( 'done' )){
                if(this.transactionLog.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: this.transactionLog.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.resetTradeValues();
                        this.ajaxDoneEndgame();
                     }, function( is_error) {}); 
                } else {
                    this.ajaxDoneEndgame();
                }
                
            }
        },

        ajaxDoneEndgame: function ( ){
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/doneEndgameActions.html", {lock: true}, this, 
                this.changeStateCleanup(), function( is_error) { } );
        },

        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your homesteadersnewbeginnings.game.php file.
        
        */
       
        setupNotifications: function(cancel_move_ids)
        {
            var notifs = [
                ['autoPay', 50],
                ['buildBuilding', 1000],
                ['cancel', 500],
                ['clearAllBids', 250],
                ['gainWorker', 20],
                ['gainTrack', 20],
                ['loanPaid', 500],
                ['loanTaken', 500],
                ['moveBid', 250],
                ['moveFirstPlayer', 100],
                ['playerIncome', 20],
                ['playerIncomeGroup', 50],
                ['playerPayment', 20],
                ['playerPaymentGroup', 50],
                ['railAdv', 25],
                ['score', 2000],
                ['showResources', 25],
                ['trade', 20],
                ['updateBuildingStocks', 100],
                ['workerMoved', 5],
                ['workerPaid', 20],
              ];

            notifs.forEach(notif => {
                dojo.subscribe(notif[0], this, "notif_" + notif[0]);
                this.notifqueue.setSynchronous(notif[0], notif[1]);
            });
            this.notifqueue.setSynchronous('displayScoring', 250);
        },  
        
        /** Override this function to inject html for log items  */

        /* @Override */
        format_string_recursive: function (log, args) {
            try {
                if (log && args && !args.processed) {
                    args.processed = true;
                    
                    if (!this.isSpectator)
                        args.You = this.divYou(); // will replace ${You} with colored version
                    
                    // begin -> resource args
                    // only one type of resource.
                    if (args.type){
                        if (typeof (args.type) == "string"){ // not an array just type as string
                            args.typeStr = args.type;
                            args.amount = 1;
                            args.type = this.getOneResourceHtml(args.type, 1, false);
                        } else { // array with {type,amount} values
                            args.typeStr = args.type.type;
                            args.amount = args.type.amount;
                            args.type = this.getOneResourceHtml(args.typeStr, args.amount, false);
                        }
                    }
                    // multiple types of resources
                    if (args.tradeAway){
                        args.tradeAway_arr = args.tradeAway;
                        args.tradeAway = this.getResourceArrayHtml(args.tradeAway_arr);
                    }
                    if (args.tradeFor){
                        args.tradeFor_arr = args.tradeFor;
                        args.tradeFor = this.getResourceArrayHtml(args.tradeFor_arr);
                    }
                    if (args.resources){
                        args.resource_arr = args.resources;
                        args.resources = this.getResourceArrayHtml(args.resources);
                    }
                    // end -> resource args

                    // begin -> specific token args 
                    if (args.arrow){
                        args.arrow = this.format_block('jstpl_resource_inline', {type: 'arrow'});
                    }
                    if (args.track && typeof args.track == 'string'){
                        args.track = this.tkn_html.track;
                    }
                    if (args.loan && typeof args.loan == 'string'){
                        args.loan = this.tkn_html.loan;
                    }
                    if (args.worker && typeof args.worker == 'string'){
                        args.worker = this.getOneResourceHtml('worker', 1, false);
                    }
                    // handles player_tokens
                    if (args.token && typeof (args.null != "string")){
                        if (args.token.color) {
                            var color = args.token.color;
                        } else {
                            var color = this.player_color[args.token.player_id];
                        }
                        if (args.token.type) {
                            var type = args.token.type;
                        } else {
                            var type = args.token.token;
                        }
                        args.token = this.format_block('jstpl_player_token_log', {"color" : color, "type" : type});
                    }
                    // end -> specific token args

                    // begin -> add font only args
                    // format onOff with font (no color)
                    if (args.onOff && typeof args.onOff == 'string'){
                        args.onOff_val = (args.onOff == 'on'?true:false);
                        args.onOff = this.format_block('jstpl_color_log', {color:'', string:args.onOff});
                    }
                    // format text with font (no color) this changes the chat log, so disabling it...
                    /*if (args.text && typeof args.text == 'string'){
                        args.text = this.format_block('jstpl_color_log', {color:'', string:args.text});
                    }*/
                    // formats args.building_name to have the building Color by type
                    if (args.building_name && typeof (args.building_name) != "string"){
                        let color = ASSET_COLORS[Number(args.building_name.type)];
                        args.building_name = this.format_block('jstpl_color_log', {string:args.building_name.str, color:color});
                    }
                    if (args.bidVal && typeof(args.bidVal) == 'string'){
                        let color = ASSET_COLORS[Number(args.auction.key)+10];
                        args.bidVal = this.format_block('jstpl_color_log', {string:args.bidVal, color:color});
                    }
                    // this will always set `args.auction` (allowing it to be used in the Title)
                    if (args.auction && typeof (args.auction) != 'string'){
                        let color = ASSET_COLORS[Number(args.auction.key)+10];
                        args.auction = this.format_block('jstpl_color_log', {string:args.auction.str, color:color});
                    } else {
                        let color = ASSET_COLORS[Number(this.current_auction)+10];
                        args.auction = this.format_block('jstpl_color_number_log', {color:color, string:_("AUCTION "), number:this.current_auction});
                    }
                    // end -> add font only args

                    // handles Building & Auctions, player_tokens, worker, or track
                    if (args.reason_string && typeof (args.reason_string) != "string"){
                        if (args.reason_string.type){ //Building & Auctions
                            let color = ASSET_COLORS[Number(args.reason_string.type)];
                            args.reason_string = this.format_block('jstpl_color_log', {string:args.reason_string.str, color:color});
                        } else if (args.reason_string.token) { // player_tokens (bid/train)
                            const color = this.player_color[args.reason_string.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string.token});
                        } else if (args.reason_string.worker) { // worker token
                            args.reason_string = this.getOneResourceHtml('worker', 1, false);
                        } else if (args.reason_string.track) { // track 
                            args.reason_string = this.tkn_html.track;
                        }
                    }                     
                }
            } catch (e) {
                console.error(log,args,"Exception thrown", e.stack);
            }
            return this.inherited(arguments);
        },

        divYou : function() {
            var color = this.gamedatas.players[this.player_id].color;
            var color_bg = "";
            if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
                color_bg = "background-color:#" + this.gamedatas.players[this.player_id].color_back + ";";
            }
            var you = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\">" + __("lang_mainsite", "You") + "</span>";
            return you;
        },

        getOneResourceHtml: function(type, amount=1, asSpan = false, style=""){
            let html_type = asSpan ? 'span': 'div';
            var resString = `<${html_type} class="log_container" style="${style}">`;
            if (amount > 0){ 
                var tokenDiv = this.tkn_html[type];
                for(let i=0; i < amount; i++){
                    resString += `${tokenDiv}`;
                }
            }
            return resString + `</${html_type}>`;
        },

        getResourceArrayHtmlBigVp: function (array, asSpan=false) {
            let html_type = asSpan ? 'span': 'div';
            var aggregateString = `<${html_type} class="log_container">`;
            for (let type in array){
                let amt = array[type];
                if (amt != 0){ 
                    let type_no = type;
                    if (amt < 0){
                        type_no = type + " crossout";
                    }
                    if (type == 'vp' || VP_TOKENS.includes(type)) {
                        var tokenDiv = this.tkn_html["bld_"+type_no];
                    } else {
                        var tokenDiv = this.tkn_html[type_no];
                    }
                    for(let i=0; i < Math.abs(amt); i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + `</${html_type}>`;
        },

        getResourceArrayHtml: function( array, asSpan=false, style=""){
            let html_type = asSpan ? 'span': 'div';
            var aggregateString = `<${html_type} class="log_container" style="${style}">`;
            for (let type in array){
                let amt = array[type];
                if (amt != 0){ 
                    let type_no = type;
                    if (amt < 0){
                        type_no = type + " crossout";
                    }
                    var tokenDiv = this.tkn_html[type];
                    for(let i=0; i < Math.abs(amt); i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + `</${html_type}>`;
        },

        notif_autoPay: function (notif){
            if (this.player_id == notif.args.player_id){
                $('checkbox1').checked = notif.args.onOff_val;
            }
        },

        notif_updateBuildingStocks: function ( notif ){
            this.updateBuildingStocks(notif.args.buildings);
            this.showHideButtons();
        },

        notif_workerMoved: function( notif ){
            //console.log('notif_workerMoved');
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            if (this.player_id == notif.args.player_id){
                this.moveObjectAndUpdateValues(worker_divId, this.building_worker_ids[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            } else {
                this.moveObject(worker_divId, this.building_worker_ids[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            }
        },

        notif_railAdv: function( notif ){
            //console.log('notif_railAdv');
            const train_token = this.train_token_divId[notif.args.player_id];
            this.moveObject(train_token, `train_advancement_${notif.args.rail_destination}`);
        }, 

        notif_gainWorker: function( notif ){
            //console.log('notif_gainWorker');
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_worker', {id: notif.args.worker_key}), this.token_zone[notif.args.player_id] );
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                if (this.currentState == "allocateWorkers"){
                    dojo.addClass(worker_divId, 'selectable');
                    this.resetTradeValues();
                    this.setOffsetForIncome();
                }                
            }
            this.calculateAndUpdateScore(notif.args.player_id);
        },

        notif_workerPaid: function( notif ){
            this.showPay = false;
            let buttons = dojo.query(`#generalactions a`);
            for (let btn in buttons){
                if (buttons[btn].id){
                    this.fadeOutAndDestroy(buttons[btn].id);
                }
            }
            this.resetTradeValues();
        },

        notif_gainTrack: function( notif ){
            //console.log('notif_gainTrack');
            const p_id = Number(notif.args.player_id);
            dojo.place(this.format_block( 'jptpl_track', 
                    {id: Number(notif.args.track_key), color: this.player_color[Number(notif.args.player_id)]}),
                    this.token_divId[p_id]);
                    this.addTooltipHtml(`token_track_${notif.args.track_key}`, `<div style="text-align:center;">${this.replaceTooltipStrings(this.resource_info['track']['tt'])}</div>`);
            if (notif.args.tradeAway_arr){
                var destination = this.getTargetFromNotifArgs(notif);
                for(let type in notif.args.tradeAway_arr){
                    for(let i = 0; i < notif.args.tradeAway_arr[type]; i++){
                        this.slideTemporaryObject( this.tkn_html[type], 'limbo' , this.player_score_zone_id[p_id], destination,  500 , 100*i );
                        if (p_id == this.player_id || this.show_player_info){
                            this.incResCounter(p_id, type, -1);
                        }
                    }
                }
            }
        },

        notif_moveBid: function( notif ){
            this.moveBid(notif.args.player_id, notif.args.bid_location);
        },

        notif_moveFirstPlayer: function (notif ){
            const p_id = Number(notif.args.player_id);
            const tile_id = FIRST_PLAYER_ID;
            if (p_id != this.first_player){
                this.moveObject(tile_id, this.player_score_zone_id[p_id]);
                this.first_player = p_id;
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in this.player_color){
                this.moveBid(i, BID_PASS);
            }
        },

        notif_buildBuilding: function( notif ){
            const p_id = notif.args.player_id;
            this.addBuildingToPlayer(notif.args.building);
            
            var destination = `${TPL_BLD_TILE}_${Number(notif.args.building.b_key)}`; 
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.tkn_html[type], 'limbo', this.player_score_zone_id[p_id], destination , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            if (p_id == this.player_id){
                this.hideResources();
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerIncome: function( notif ){
            //console.log('notif_playerIncome');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            for(let i = 0; i < notif.args.amount; i++){
            this.slideTemporaryObject( this.tkn_html[String(notif.args.typeStr)], 'limbo', start , this.player_score_zone_id[p_id] , 500 , 100*i );
            if (p_id == this.player_id || this.show_player_info){
                    if (VP_TOKENS.includes(notif.args.typeStr)){
                        this.incResCounter(p_id, 'vp',Number(notif.args.typeStr.charAt(2)));
                    } else{ // normal case
                        this.incResCounter(p_id, notif.args.typeStr, 1);
                    }
                }
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerIncomeGroup: function( notif ){
            //console.log('notif_playerIncomeGroup');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.tkn_html[type], 'limbo', start , this.player_score_zone_id[p_id] , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        if (VP_TOKENS.includes(notif.args.typeStr)){
                            this.incResCounter(p_id, 'vp', Number(notif.args.typeStr.charAt(2)));    
                        } else{ // normal case
                            this.incResCounter(p_id, type, 1);
                        }
                    }
                }   
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_updateWarehouseState: function (notif){
            console.log('notif_updateWarehouseState', notif.args);
            let origin = null;
            if (notif.args.income = true){
                origin = notif.args.p_id;
            }
            this.updateWarehouseState(notif.args.state, origin);
        },

        notif_playerPayment: function( notif ){         
            //console.log('notif_playerPayment');
            var destination = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            for(let i = 0; i < notif.args.amount; i++){
                this.slideTemporaryObject( this.tkn_html[notif.args.typeStr], 'limbo' , this.player_score_zone_id[p_id], destination,  500 , 100*i );
                if (p_id == this.player_id || this.show_player_info){
                    this.incResCounter(p_id, notif.args.typeStr, -1);
                }
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_playerPaymentGroup: function( notif ){
            //console.log('notif_playerPaymentGroup');
            var destination = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                    for(let i = 0; i < amt; i++){
                        this.slideTemporaryObject( this.tkn_html[type], 'limbo', this.player_score_zone_id[p_id], destination , 500 , 100*(delay++) );
                        if (p_id == this.player_id || this.show_player_info){
                            this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_trade: function( notif ){
            //console.log('notif_trade');
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.tradeAway_arr){
                let amt = notif.args.tradeAway_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.tkn_html[type], 'limbo', this.player_score_zone_id[p_id], TRADE_BOARD_ID , 500 , 100*(delay++) );
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( this.tkn_html[type], 'limbo', TRADE_BOARD_ID, this.player_score_zone_id[p_id], 500 , 100*(delay++) );
                }   
                if (p_id == this.player_id || this.show_player_info){
                    if (VP_TOKENS.includes(type)){
                        amt = amt * Number(type.charAt(2));
                        this.incResCounter(p_id, 'vp', amt);
                    } else {
                        this.incResCounter(p_id, type, amt);
                    }
                }
            }
            if (p_id == this.player_id)
                this.resetTradeValues();
            this.calculateAndUpdateScore(p_id);
        },

        notif_loanPaid: function( notif ){
            //console.log('notif_loanPaid');
            const p_id = notif.args.player_id;
            var destination = this.getTargetFromNotifArgs(notif);
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , this.player_score_zone_id[p_id], destination,  500 , 0 );
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', -1);
            }
            if (notif.args.type ){
                if (notif.args.typeStr == 'gold'){
                    this.slideTemporaryObject( notif.args.type , 'limbo', this.player_score_zone_id[p_id], 'board', 500, 100);
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, 'gold', -1);
                    }
                } else {
                    for (let i = 0; i < 5; i++){
                        this.slideTemporaryObject( notif.args.type, 'limbo', this.player_score_zone_id[p_id], 'board', 500, 100 +(i*100)); 
                    }
                    if (p_id == this.player_id || this.show_player_info){
                        this.incResCounter(p_id, 'silver', -5);
                    }
                }
            }
            if (p_id == this.player_id){
                this.resetTradeValues();
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_loanTaken: function( notif ){
            //console.log('notif_loanTaken');
            const p_id = notif.args.player_id;
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', this.player_score_zone_id[p_id],  500 , 0 );
            this.slideTemporaryObject( this.tkn_html.silver, 'limbo', 'board', this.player_score_zone_id[p_id], 500 , 100);
            this.slideTemporaryObject( this.tkn_html.silver, 'limbo', 'board', this.player_score_zone_id[p_id], 500 , 200);
            if (p_id == this.player_id || this.show_player_info){
                this.incResCounter(p_id, 'loan', 1);
                this.incResCounter(p_id, 'silver', 2);
            }
            this.calculateAndUpdateScore(p_id);
        },

        notif_score: function( notif ){
            //console.log('notif_score');
            const p_id = notif.args.player_id;
            this.scoreCtrl[p_id].setValue(0);
            for(let b_key in notif.args.building){
                const building = notif.args.building[b_key];
                var bld_score = 0;
                if (building.static && Number(building.static) >0){
                    bld_score += Number(building.static);
                } 
                if (building.bonus && Number(building.bonus) >0){
                    bld_score += Number(building.bonus);
                }
                this.displayScoring( `${TPL_BLD_TILE}_${b_key}`, this.player_color[notif.args.player_id], bld_score, 2000 );
                this.scoreCtrl[p_id].incValue(bld_score);
            } 
            dojo.place(`<div id="score_grid_${p_id}" class="score_grid"></div>`, this.player_score_zone_id[p_id]);
            for(let type in notif.args.resource){
                const amt = notif.args.resource[type];
                this.scoreCtrl[p_id].incValue(amt);
            }
            this.updateScore(p_id, score);
        },

        notif_showResources: function( notif ){
            //console.log('notif_showResources');
            //console.log(notif);
            if (this.show_player_info) return;// already showing player resources.
            this.show_player_info = true;
            for(let p_id in notif.args.resources){
                if (this.isSpectator || (this.player_id != p_id)){
                    dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), this.player_score_zone_id[p_id] );
                    dojo.query(`#player_resources_${this.player_color[p_id]} .player_resource_group`).removeClass('noshow');
                    this.setupOnePlayerResources(notif.args.resources[p_id]);
                }
                this.calculateAndUpdateScore(p_id);
            }
        },

        notif_cancel: function( notif ){
            //console.log('notif_cancel');
            const p_id = notif.args.player_id;
            const updateResource = (p_id == this.player_id) || this.show_player_info;
            const player_zone = this.player_score_zone_id[p_id];
            var delay = 0;
            // update values as undone
            for (let i in notif.args.actions){
                let log = notif.args.actions[i];
                switch (log.action){
                    case 'build':
                        this.cancelBuild(log.building);
                        if (updateResource){
                            for(let type in log.cost){
                                let amt = log.cost[type];
                                for(let j = 0; j < amt; j++){
                                    this.slideTemporaryObject( this.tkn_html[type], 'limbo', player_zone, 'board' , 500 , 50*(delay++) );
                                    this.incResCounter(p_id,type,1);
                                }   
                            }
                        }
                        this.updateBuildingAffordability();
                    break;
                    case 'gainWorker':
                        this.fadeOutAndDestroy(`token_worker_${log.w_key}`);
                    break;
                    case 'gainTrack':
                        this.fadeOutAndDestroy(`token_track_${log.t_key}`);
                    break;
                    case 'loan':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , player_zone, 'board', 500 , 50 * (delay++) );
                        this.slideTemporaryObject( this.tkn_html.silver, 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        this.slideTemporaryObject( this.tkn_html.silver, 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        if (updateResource){
                            this.incResCounter(p_id, 'loan', -1);
                            this.incResCounter(p_id, 'silver', -2);
                        }    
                    break;
                    case 'loanPaid':
                        this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', player_zone, 500 , 0 );
                        if (updateResource){
                            this.incResCounter(p_id, 'loan', 1);
                        }
                        if (log.type){
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( this.tkn_html[log.type], 'limbo', player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'railAdv':
                        const train_token = this.train_token_divId[p_id];
                        const parent_no = $(train_token).parentNode.id.split("_")[2];
                        this.moveObject(train_token, `train_advancement_${(parent_no-1)}`);
                    break;
                    case 'trade':
                        for(let type in log.tradeAway_arr){
                            let amt = log.tradeAway_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.tkn_html[type], 'limbo', player_zone, TRADE_BOARD_ID , 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, 1);
                                }
                            }   
                        }
                        for(let type in log.tradeFor_arr){
                            let amt = log.tradeFor_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( this.tkn_html[type], 'limbo', TRADE_BOARD_ID, player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, -1);
                                }
                            }   
                        }
                    break;
                    case 'updateResource':
                        if (log.amt < 0){
                            for(let j = 0; j < Math.abs(log.amt); j++){
                                this.slideTemporaryObject( this.tkn_html[log.type], 'limbo' , player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, -1);
                                }
                            }
                        } else {
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( this.tkn_html[log.type], 'limbo', 'board', player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'passBid':
                        this.moveBid(p_id, log.last_bid);
                    break;
                }
            }

            this.cancelNotifications(notif.args.move_ids);
            this.clearTransactionLog();
            this.calculateAndUpdateScore(p_id);
        },

        /**
         * gets the target for moving tokens in notifications based upon 
         * notif.args.origin 
         *  -- currently only accounts for `auction` and `building` otherwise it returns `board`.
         * @param {object} notif 
         */
        getTargetFromNotifArgs: function( notif ){
            var target = `board`;
            if (notif.args.origin == 'auction'){
                target = `${TPL_AUC_ZONE}${Number(notif.args.key)}`;
            } else if (notif.args.origin == 'building'){
                target = `${TPL_BLD_TILE}_${Number(notif.args.key)}`;
            } 
            return target;
        },

        /***** UTILITIES FOR USING ARRAYS *****/
        copyArray: function (array){
            let new_array = [];
            for (let i in array){
                new_array[i] = array[i];
            }
            return new_array;
        },
        /**
         * make all positive values in array negative, and all negative values positive.
         * @param {object} array 
         */
        invertArray: function( array){
            let new_array = [];
            for (let i in array){
                new_array[i] = array[i] * -1;
            }
            return new_array;
        },
        /**
         * allows adding to array by key, without having to have exisiting value.
         * @param {object} arr to edit
         * @param {string} key in array to add to or create (if not existing)
         * @param {int} inc value to increment by, or create at (if not previously existing)
         */
        addOrSetArrayKey: function (arr, key, inc){
            if (arr[key] == null){
                arr[key] = inc;
            } else {
                arr[key] += inc;
            }
            return arr;
        },

        getKeyByValue: function (object, value) {
            return Object.keys(object).find(key => object[key] === value);
        },

   });             
});
