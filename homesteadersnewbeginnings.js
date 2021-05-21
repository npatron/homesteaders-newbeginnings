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
    g_gamethemeurl + "modules/hsd_constants.js",
    g_gamethemeurl + "modules/hsd_tooltips.js",
    g_gamethemeurl + "modules/hsd_trade.js",
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

    return declare("bgagame.homesteadersnewbeginnings", ebg.core.gamegui, {
        addMoveToLog: override_addMoveToLog,

        constructor: function(){
            GLOBAL.this = this;
            GLOBAL.goldCounter = new ebg.counter();
            GLOBAL.silverCounter = new ebg.counter();
            GLOBAL.roundCounter = new ebg.counter();

            GLOBAL.allowTrade = false;
            GLOBAL.tradeEnabled = false;
            GLOBAL.showPay = true;
            GLOBAL.can_cancel = false;

            this.worker_height = 35;
            this.worker_width = 33;
            GLOBAL.warehouse_state = 0;
            
            GLOBAL.player_count = 0;
            GLOBAL.goldAmount = 0;
            GLOBAL.silverCost = 0;
            GLOBAL.first_player = 0;
            // for tracking current auction (for title update)
            GLOBAL.current_auction = 1;
            GLOBAL.number_auctions = 0;

            GLOBAL.b_connect_handler = [];
            GLOBAL.show_player_info = false;
            GLOBAL.goldAsCopper = false;
            GLOBAL.goldAsCow = false;
            GLOBAL.undoPay = false;
            
            //new vars from expansion,
            GLOBAL.cost_replace = [];
            GLOBAL.building_discount = false;
            this.trade = new Trade();
            this.tooltip = new Tooltips();
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
            GLOBAL.isSpectator = true;
            GLOBAL.player_id = this.player_id;
            GLOBAL.show_player_info = gamedatas.show_player_info;
            this.use_events = gamedatas.use_events;
            this.events = gamedatas.events;
            this.current_round = gamedatas.round_number;
            this.fillArray(RESOURCE_INFO, gamedatas.resource_info);
            this.fillArray(EVENT_INFO, gamedatas.event_info);
            this.rail_no_build = gamedatas.rail_no_build;
            
            this.fillArray(BUILDING_INFO, gamedatas.building_info);
            this.fillArray(ASSET_STRINGS, gamedatas.translation_strings);
            this.setupResourceTokens();
            // Setting up player boards
            for( let p_id in gamedatas.players ) {
                GLOBAL.player_count++;
                const player = gamedatas.players[p_id];
                this.setupPlayerAssets(player);
            }
            this.setupPlayerResources(gamedatas.player_resources, gamedatas.resources);
            if (!GLOBAL.isSpectator){
                this.orientPlayerZones(gamedatas.player_order);
                this.setupTradeButtons();
            } else {
                this.spectatorFormatting();
            }
            if (GLOBAL.player_count == 2){
                PLAYER_COLOR[DUMMY_BID] = this.getAvailableColor();
                PLAYER_COLOR[DUMMY_OPT] = PLAYER_COLOR[0];
            }
            if (GLOBAL.player_count <5){
                this.hideBoard2();
            }

            // Auctions: 
            GLOBAL.number_auctions = gamedatas.number_auctions;
            this.setupAuctionTiles(gamedatas.auctions, gamedatas.auction_info);
            this.showCurrentAuctions(gamedatas.current_auctions);
            this.setupBuildings(gamedatas.buildings);
            this.setupTracks(gamedatas.tracks);
            if (this.use_events){
                this.createEventCards();
                this.updateEventBanner(gamedatas.round_number);
            }
            
            dojo.place(FIRST_PLAYER_ID, PLAYER_SCORE_ZONE_ID[gamedatas.first_player]);
            GLOBAL.first_player = Number(gamedatas.first_player);
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
                GLOBAL.roundCounter.create('round_number');
                GLOBAL.roundCounter.setValue(gamedatas.round_number);
            }
            this.tooltip.showScoreTooltips(gamedatas.players);
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications(gamedatas.cancel_move_ids);
            this.updateBuildingAffordability();
            
            GLOBAL.can_cancel = gamedatas.can_undo_trades;
        },

        ///////////////////////////////////////////////////
        //// Setup Methods
        ///////////////////////////////////////////////////

        setupPlayerAssets: function (player){
            const current_player_color = player.color_name;
            const p_id = player.p_id;            
            dojo.removeClass("player_zone_"+current_player_color, "noshow");
            if (this.player_id == p_id) {
                GLOBAL.isSpectator = false;
            }
            const player_board_div     = 'player_board_'+p_id;
            PLAYER_SCORE_ZONE_ID[p_id] = player_board_div;
            PLAYER_COLOR[p_id]         = current_player_color;
            if( this.player_id == p_id || GLOBAL.show_player_info){
                dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), player_board_div );
            } else {
                dojo.query(`#player_resources_${current_player_color} .player_resource_group`).addClass('noshow');
            }
            TRACK_TOKEN_ZONE[p_id]             = `token_zone_${current_player_color}`;
            WORKER_TOKEN_ZONE[p_id]       = `worker_zone_${current_player_color}`;
            PLAYER_BUILDING_ZONE_ID[p_id] = TPL_BLD_ZONE + PLAYER_COLOR[p_id];
        },
        

        /**
         * should only be called when not spectator, 
         * This will orient the player zones by player order (with this.player_id first)
         * @param {array} order_table 
         */
        orientPlayerZones: function (order_table){
            dojo.place(`player_zone_${PLAYER_COLOR[this.player_id]}`, PLAYER_ORDER[0] , 'replace');
            let next_pId = order_table[this.player_id];
            for (let i = 1; i < GLOBAL.player_count; i++){
                dojo.place(`player_zone_${PLAYER_COLOR[next_pId]}`, PLAYER_ORDER[i] , 'replace');
                next_pId = order_table[this.player_id];
            }
            for(let i = GLOBAL.player_count; i < PLAYER_ORDER.length; i++){
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
                if (!PLAYER_COLOR.includes(player_color_option[i]))
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
            if (GLOBAL.show_player_info){
                for (let player_res in resources){
                    this.setupOnePlayerResources(resources[player_res]);
                }
            } else if (!GLOBAL.isSpectator){
                this.setupOnePlayerResources(player_resources);
            }
        },

        incResCounter(p_id, type, value){
            BOARD_RESOURCE_COUNTERS[p_id][type].incValue(value);
            SCORE_RESOURCE_COUNTERS[p_id][type].incValue(value);
        },

        /**
         * Resource array for this person.
         * @param {array} resource 
         */
        setupOnePlayerResources: function (resource) {
            //console.log('setupOnePlayerResources');
            BOARD_RESOURCE_COUNTERS[resource.p_id] = [];
            SCORE_RESOURCE_COUNTERS[resource.p_id] = [];
            for (const [key, value] of Object.entries(resource)) {
                //console.log(resource, key, value);
                if (key == "p_id" || key == "workers" || key == "track") continue;
                let tooltip_html = this.format_block('jptpl_res_tt', {value:this.tooltip.replaceTooltipStrings(_(RESOURCE_INFO[key]['tt']))});
                
                let resourceId = `${key}count_${resource.p_id}`;
                this.addTooltipHtml( resourceId, tooltip_html);
                let iconId = `${key}icon_p${resource.p_id}`;
                this.addTooltipHtml( iconId, tooltip_html );

                SCORE_RESOURCE_COUNTERS[resource.p_id][key] = new ebg.counter();
                SCORE_RESOURCE_COUNTERS[resource.p_id][key].create(resourceId);
                SCORE_RESOURCE_COUNTERS[resource.p_id][key].setValue(value);

                let boardResourceId = `${key}count_${PLAYER_COLOR[resource.p_id]}`;
                this.addTooltipHtml( boardResourceId, tooltip_html );
                let boardIconId = `${key}icon_${PLAYER_COLOR[resource.p_id]}`;
                this.addTooltipHtml( boardIconId, tooltip_html );

                BOARD_RESOURCE_COUNTERS[resource.p_id][key] = new ebg.counter();
                BOARD_RESOURCE_COUNTERS[resource.p_id][key].create(boardResourceId);
                BOARD_RESOURCE_COUNTERS[resource.p_id][key].setValue(value);
            }

            let old_score_id = `player_score_${resource.p_id}`;
            dojo.query(`#${old_score_id}`).addClass('noshow');

            let new_score_id = `p_score_${resource.p_id}`;
            dojo.place(`<span id="${new_score_id}" class="player_score_value">0</span>`, old_score_id, 'after');
            SCORE_LEFT_COUNTER[resource.p_id] = new ebg.counter();
            SCORE_LEFT_COUNTER[resource.p_id].create(new_score_id);
            SCORE_LEFT_COUNTER[resource.p_id].setValue(0);

            let scoreLoanId = `player_total_score_${resource.p_id}`;
            dojo.place(`<span id="${scoreLoanId}" class="player_score_value_loan">0</span>`, new_score_id, 'after');
            SCORE_RIGHT_COUNTER[resource.p_id] = new ebg.counter();
            SCORE_RIGHT_COUNTER[resource.p_id].create(scoreLoanId);
            SCORE_RIGHT_COUNTER[resource.p_id].setValue(0);
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
                dojo.place(this.format_block( 'jptpl_track', {id: track.r_key, color: PLAYER_COLOR[track.p_id]}), TRACK_TOKEN_ZONE[track.p_id]);
            }
            this.addTooltipHtmlToClass("token_track", `<div style="text-align:center;">${this.tooltip.replaceTooltipStrings(RESOURCE_INFO['track']['tt'])}</div>`);
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
                dojo.place(`<div id="${BANK_ID}" class="bank trade_option"></div>`, b_divId,'last');
            } else if (b_id == BLD_MARKET){
                dojo.place(`<div id="${b_key}_${MARKET_FOOD_ID}" class="market_food trade_option"> </div><div id="${b_key}_${MARKET_STEEL_ID}" class="market_steel trade_option"> </div>`, b_divId,'last');
            } else if (b_id == BLD_WAREHOUSE){
                dojo.place(`<div id="${WAREHOUSE_RES_ID}"></div>`, b_divId, 'last');
            }
            if (!(BUILDING_INFO[b_id].hasOwnProperty('slot'))) return;
            let b_slot = BUILDING_INFO[b_id].slot;
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
                dojo.connect($(BANK_ID), 'onclick', this, 'onClickOnBankTrade');
            } else if (b_id == BLD_MARKET){
                dojo.connect($(`${b_key}_${MARKET_FOOD_ID}`), 'onclick', this, 'onClickOnMarketTrade');
                dojo.connect($(`${b_key}_${MARKET_STEEL_ID}`), 'onclick', this, 'onClickOnMarketTrade');
            }
            let b_info = BUILDING_INFO[b_id];
            if (!(b_info.hasOwnProperty('slot'))) return;
            let b_slot = b_info.slot;
            if (b_slot == 1){
                BUILDING_WORKER_IDS[b_key] = [];
                BUILDING_WORKER_IDS[b_key][1] = `slot_${b_key}_1`;
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][1], this.formatWorkerSlotTooltip(b_info ,1));
                dojo.connect($(BUILDING_WORKER_IDS[b_key][1]), 'onclick', this, 'onClickOnWorkerSlot');
            } else if (b_slot == 2){
                BUILDING_WORKER_IDS[b_key] = [];
                BUILDING_WORKER_IDS[b_key][1] = `slot_${b_key}_1`;
                BUILDING_WORKER_IDS[b_key][2] = `slot_${b_key}_2`;
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][1], this.formatWorkerSlotTooltip(b_info, 1));
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][2], this.formatWorkerSlotTooltip(b_info, 2));
                dojo.connect($(BUILDING_WORKER_IDS[b_key][1]), 'onclick', this, 'onClickOnWorkerSlot');
                dojo.connect($(BUILDING_WORKER_IDS[b_key][2]), 'onclick', this, 'onClickOnWorkerSlot');  
            } else if (b_slot == 3){
                BUILDING_WORKER_IDS[b_key] = {1:`slot_${b_key}_3`, 2:`slot_${b_key}_3`, 3:`slot_${b_key}_3`};
                this.addTooltipHtml( BUILDING_WORKER_IDS[b_key][3], this.formatWorkerSlotTooltip(b_info, 3));
                if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){
                    dojo.style(BUILDING_WORKER_IDS[b_key][3], 'max-width', `${(this.worker_width*1.5)}px`);
            }
            dojo.connect($(BUILDING_WORKER_IDS[b_key][3]), 'onclick', this, 'onClickOnWorkerSlot');
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
                        WORKER_TOKEN_ZONE[worker.p_id] );
                const worker_divId = `token_worker_${w_key}`;
                //console.log(worker.b_key, worker.b_slot, BUILDING_WORKER_IDS);
                if (worker.b_key != 0 ){ 
                    dojo.place(worker_divId, BUILDING_WORKER_IDS[worker.b_key][worker.b_slot]);
                } else {
                    dojo.place(worker_divId, WORKER_TOKEN_ZONE[worker.p_id]);
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
            BID_ZONE_ID[ZONE_PENDING] = ZONE_PENDING_ID;
            BID_ZONE_ID[ZONE_PASSED] = ZONE_PASSED_ID;
            let auc_end = (GLOBAL.player_count==5?4:3);
            for (let auc = 1; auc <= auc_end; auc++){
                BID_ZONE_ID[auc] = [];
                for (let bid =0; bid < BID_VAL_ARR.length; bid ++){
                    BID_ZONE_ID[auc][bid] = `bid_slot_${auc}_${BID_VAL_ARR[bid]}`;
                    dojo.connect($(BID_ZONE_ID[auc][bid]), 'onclick', this, 'onClickOnBidSlot');
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
                const token_color = PLAYER_COLOR[p_id];
                if( p_id == DUMMY_OPT) {
                    BID_TOKEN_ID[p_id] = `token_bid_${token_color}_dummy`;
                    dojo.place(this.format_block( 'jptpl_dummy_player_token', {color: token_color, type: "bid"}), BID_ZONE_ID[ZONE_PENDING]);
                } else {
                    BID_TOKEN_ID[p_id] = `token_bid_${token_color}`;
                    dojo.place(this.format_block( 'jptpl_player_token', {color: token_color, type: "bid"}), BID_ZONE_ID[ZONE_PENDING]);
                }
                //pending is default.
                if (token_bid_loc == BID_PASS) {
                    dojo.place(BID_TOKEN_ID[p_id], BID_ZONE_ID[ZONE_PASSED]);
                } else if (token_bid_loc != NO_BID){ 
                    dojo.place(BID_TOKEN_ID[p_id], this.getBidLocDivIdFromBidNo(token_bid_loc));
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
                TRAIN_TOKEN_ID[p_id] = `token_train_${PLAYER_COLOR[p_id]}`;
                dojo.place(this.format_block( 'jptpl_player_token', 
                    {color: PLAYER_COLOR[p_id].toString(), type: "train"}), `train_advancement_${player_rail_adv}`);
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
            for (const [key, value] of Object.entries(RESOURCE_INFO)) {
                if ( key == "workers" || key == "track") continue;
                POSITIVE_RESOURCE_COUNTERS[key] = new ebg.counter();
                POSITIVE_RESOURCE_COUNTERS[key].create(`${key}_pos`);
                POSITIVE_RESOURCE_COUNTERS[key].setValue(0);
                NEGATIVE_RESOURCE_COUNTERS[key] = new ebg.counter();
                NEGATIVE_RESOURCE_COUNTERS[key].create(`${key}_neg`);
                NEGATIVE_RESOURCE_COUNTERS[key].setValue(0);
                NEW_RESOURCE_COUNTERS[key] = new ebg.counter();
                NEW_RESOURCE_COUNTERS[key].create(`${key}_new`);
                NEW_RESOURCE_COUNTERS[key].setValue(0);
            }
            this.resetTradeValues();
        },

        setupWarehouseButtons: function(){
            let warehouseResources = this.getWarehouseResources();

            dojo.place(dojo.create('br',{}), 'generalactions', 'last');
            let buttonDiv = dojo.create('div', {id:"choose_warehouse_buttons", style:'display: inline-flex;justify-content: center;'});
            dojo.place(buttonDiv, 'generalactions', 'last');
            let warehouseText = dojo.create('span', {class:"font caps com", id:'warehouse_text'});
            dojo.place(warehouseText, "choose_warehouse_buttons", 'first');
            warehouseText.innerText = _(BUILDING_INFO[BLD_WAREHOUSE].name+": ");
            for (let type in warehouseResources){
                if (type == 'length') continue;
                this.addActionButton( `btn_warehouse_${type}`, TOKEN_HTML[type], `onClickWarehouseResource`, null, false, 'gray');
                dojo.place(`btn_warehouse_${type}`,'choose_warehouse_buttons', 'last');
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
            for(let type in RESOURCES){
                TOKEN_HTML[type] = this.format_block( 'jstpl_resource_inline', {type:type}, );
                TOKEN_HTML["big_"+type] = this.format_block( 'jstpl_resource_inline', {type:"big_"+type}, );
            }
            TOKEN_HTML.arrow = this.format_block( 'jstpl_resource_inline', {type:'arrow'}, );
            TOKEN_HTML.inc_arrow = this.format_block( 'jstpl_resource_inline', {type:'inc_arrow'}, );
            for (let i in VP_TOKENS){
                TOKEN_HTML[VP_TOKENS[i]] = this.format_block( 'jstpl_resource_inline', {type:VP_TOKENS[i]}, );
                TOKEN_HTML["bld_"+VP_TOKENS[i]] = this.format_block('jstpl_resource_log', {"type" : VP_TOKENS[i] + " bld_vp"});
            }
            TOKEN_HTML.bld_vp = this.format_block('jstpl_resource_log', {"type" : "vp bld_vp"});
            TOKEN_HTML.track = this.getOneResourceHtml('track', 1, true);
            TOKEN_HTML.loan = this.format_block( 'jptpl_track_log', {type:'loan'}, );
            
            let types = {'and':_("AND"), 'or':_("OR"), 'dot':"•"};
            for(let i in types){
                TOKEN_HTML[i] = this.format_block('jptpl_tt_break', {text:types[i], type:'dot'==i?'dot':'break'});
            }
            types = [0,1,2,3,4,11,12,13,14]; // from ASSET_COLORS
            for (let i=0; i< 5; i++){
                TOKEN_HTML[ASSET_COLORS[i]] = this.format_block('jstpl_color_log', 
                {'string':_(ASSET_STRINGS[i]), 'color':ASSET_COLORS[i]});
            }
            types = {10:'4', 11:'1', 12:'2', 13:'3'};
            for (let i in types){
                TOKEN_HTML['a'+types[i]] = this.format_block('jstpl_color_log', 
                {'string':dojo.string.substitute(_("Auction ${a}"),{a:types[i]}), 'color': 'auc'+types[i]} );
            }
            TOKEN_HTML.adv_track = _(ASSET_STRINGS[7]);
            //console.log(TOKEN_HTML);
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
            dojo.connect($(TOGGLE_BTN_ID[EVT_LOC_MAIN]),  'onclick', this, 'toggleShowEvents');
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
                    GLOBAL.allowTrade = false;
                    GLOBAL.can_cancel = false;
                    break;
                case 'payWorkers':
                    this.setupBidsForNewRound();
                    GLOBAL.goldAmount = 0;
                    break;
                case 'allocateWorkers':              
                    GLOBAL.showPay = true;
                break;
                case 'dummyPlayerBid':
                    const dummy_bid_id = BID_TOKEN_ID[DUMMY_BID];
                    dojo.addClass(dummy_bid_id, 'animated');
                    dojo.style('main_board_area', 'order', -2);
                break;
                case 'playerBid':
                    const active_bid_id = BID_TOKEN_ID[this.getActivePlayerId()];
                    dojo.addClass(active_bid_id, 'animated');
                    dojo.style('main_board_area', 'order', -2);
                    break;
                case 'getRailBonus':
                    dojo.style('main_board_area', 'order', -2);
                case 'getRailBonus_event':
                case 'getRailBonus_auction':
                case 'getRailBonus_build':
                    //rail bonus.
                    const active_train = TRAIN_TOKEN_ID[this.getActivePlayerId()];
                    dojo.addClass(active_train, 'animated');
                    break;
                case 'pass_event':
                case 'payLot':
                    dojo.style('main_board_area', 'order', 4);
                    //build building
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                case 'chooseBuildingToBuild_event':
                    // choose bonus
                case 'bonusChoice_build':
                case 'bonusChoice_event':
                case 'bonusChoice_auction':
                    if (!GLOBAL.isSpectator){
                        dojo.style(TRADE_BOARD_ID, 'order', -2);
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
                    const dummy_bid_id = BID_TOKEN_ID[DUMMY_BID];
                    dojo.removeClass(dummy_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                break;
                case 'playerBid':
                    const active_bid_id = BID_TOKEN_ID[this.getActivePlayerId()];
                    dojo.removeClass(active_bid_id, 'animated');
                    this.clearSelectable('bid', true);
                    GLOBAL.showPay = false;
                    break;
                case 'trainStationBuild':
                case 'chooseBuildingToBuild':
                case 'chooseBuildingToBuild_event':
                    this.resetTradeValues();    
                    this.trade.disableTradeIfPossible();
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
                    GLOBAL.can_cancel = false;
                    this.destroyIncomeBreadcrumb();
                    INCOME_ARRAY.length=0;
                    this.trade.disableTradeIfPossible();
                    if (dojo.query('#button_unpass').length ==1){
                        this.fadeOutAndDestroy('button_unpass');
                    }
                case 'payAuction':
                case 'bonusChoice':
                    this.trade.disableTradeIfPossible();
                    break;
                case 'payWorkers':
                    GLOBAL.showPay = false;
                    GLOBAL.silverCost = 0;
                    GLOBAL.goldAmount = 0;
                    this.destroyPaymentBreadcrumb();
                    this.trade.disableTradeIfPossible();
                    this.clearOffset();
                    break;
                case 'endBuildRound':
                    this.clearAuction();
                    break;
                case 'confirmActions':
                    GLOBAL.can_cancel = false;
                case 'getRailBonus':
                case 'getRailBonus_event':
                case 'getRailBonus_auction':
                case 'getRailBonus_build':
                    this.clearSelectable('bonus', true);
                    const active_train = TRAIN_TOKEN_ID[this.getActivePlayerId()];
                    dojo.removeClass(active_train, 'animated');
                    this.trade.disableTradeIfPossible();
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
            } else if (!GLOBAL.isSpectator) {
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
            LAST_SELECTED['worker'] ="";
            // show workers that are selectable
            dojo.query( `#player_zone_${PLAYER_COLOR[this.player_id]} .token_worker` ).addClass('selectable');
            // also make building_slots selectable.
            dojo.query( `#${TPL_BLD_ZONE}${PLAYER_COLOR[this.player_id]} .worker_slot` ).addClass( 'selectable' );
            
            this.addActionButton( 'btn_done',_('Confirm'), 'donePlacingWorkers' );
            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
            this.addActionButton( 'btn_cancel_button', _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
            GLOBAL.tradeEnabled = false;
            this.addTradeActionButton();
            if (HAS_BUILDING[this.player_id][BLD_WAREHOUSE]){
                this.setupWarehouseButtons();
            }
            this.resetTradeValues();
            this.setOffsetForIncome();
            this.destroyPaymentBreadcrumb();
            if (dojo.query('#button_unpass').length ==1){
                this.fadeOutAndDestroy('button_unpass');
            }
        },
        // -non-active-
        onUpdateActionButtons_allocateWorkers_notActive(args){
            if ((args.paid[this.player_id].has_paid==0 || GLOBAL.undoPay) && GLOBAL.showPay){
                GLOBAL.allowTrade = true;
                GLOBAL.silverCost = this.getPlayerWorkerCount(this.player_id);
                GLOBAL.goldAmount = 0;
                this.addPaymentButtons();
            } 
            if (dojo.query('#button_unpass').length !=1){
                this.addActionButton('button_unpass', _('undo'), 'onUnPass', null, false, 'red');
                dojo.place('button_unpass', 'generalactions', 'first');
            }
        },

        onUpdateActionButtons_payWorkers: function(){
            GLOBAL.silverCost = this.getPlayerWorkerCount(this.player_id);
            GLOBAL.goldAmount = 0;
            this.addPaymentButtons();
        },
        //2-player dummy bid phase
        onUpdateActionButtons_dummyPlayerBid: function(args){
            LAST_SELECTED['bid'] = '';
            for (let bid_key in args.valid_bids) {
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( 'btn_confirm', _('Confirm Dummy Bid'), 'confirmDummyBidButton' );
        },
        onUpdateActionButtons_playerBid: function(args){
            LAST_SELECTED['bid'] = '';
            for (let bid_key in args.valid_bids) {// mark bid_slots as selectable
                const bid_slot_id = this.getBidLocDivIdFromBidNo(args.valid_bids[bid_key]);
                dojo.addClass(bid_slot_id, "selectable" );
            }
            this.addActionButton( 'btn_confirm', _('Confirm Bid'), 'confirmBidButton' );
            this.addActionButton( 'btn_pass',    _('Pass'),    'passBidButton', null, false, 'red' );
        },
        onUpdateActionButtons_pass_event: function (args) {
            // state for pass bid event triggers.
            this.addActionButton( 'btn_undo_pass', _('Undo Pass Bid'), 'onUndoBidPass', null, false, 'red');
            if (args.event_pass == EVT_PASS_DEPT_SILVER){
                this.addActionButton( 'btn_loan_silver', this.tooltip.replaceTooltipStrings(_('pay off ${loan} for ${silver}${silver}${silver}')), 'payLoan3Silver', null, false, 'blue');
            }
            this.addActionButton( 'btn_done_pass_event', _('Done'), 'donePassEvent', null, false, 'blue');
            this.addTradeActionButton();
        },
        onUpdateActionButtons_getRailBonus: function(args){
            if (args.can_undo){
                this.addActionButton( 'btn_undo_pass', _('Undo Pass Bid'), 'onUndoBidPass', null, false, 'red');
            }
            this.setupButtonsForRailBonus(args);
        },
        onUpdateActionButtons_getRailBonus_auction: function(args){
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            GLOBAL.can_cancel = true;
            this.setupButtonsForRailBonus(args);
        },
        onUpdateActionButtons_getRailBonus_build: function(args){
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            GLOBAL.can_cancel = true;
            this.setupButtonsForRailBonus(args);
            
        },
        onUpdateActionButtons_getRailBonus_event: function(args){
            this.setupButtonsForRailBonus(args);
        },
        // does buttons for these
        setupButtonsForRailBonus: function (args){
            LAST_SELECTED.bonus  ="";
            for(let i in args.rail_options){
                let type = this.getKeyByValue(RESOURCES, args.rail_options[i]);
                const id = BONUS_OPTIONS[args.rail_options[i]];
                dojo.addClass(id, 'selectable');
                if (type == 'vp'){
                    this.addActionButton( `btn_bonus_${type}`, TOKEN_HTML.vp3, 'selectBonusButton', null, false, 'gray');
                } else {
                    this.addActionButton( `btn_bonus_${type}`, TOKEN_HTML[type], 'selectBonusButton', null, false, 'gray');
                }
            }
            this.addActionButton( 'btn_choose_bonus', _('Choose Bonus'), 'doneSelectingRailBonus');
            dojo.addClass('btn_choose_bonus', 'disabled');
        },
        onUpdateActionButtons_payLot: function(args){
            GLOBAL.silverCost = Number(args.lot_cost);
            GLOBAL.goldAmount = 0;
            this.addPaymentButtons(true);
        },
        onUpdateActionButtons_chooseBuildingToBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            if (Number(args.current_event)== 1){
                GLOBAL.building_discount = true;
            } else {
                GLOBAL.building_discount = false;
            }
            this.genericSetupBuildBuildings();
        },
        onUpdateActionButtons_trainStationBuild: function(args){
            this.allowed_buildings = args.allowed_buildings;
            GLOBAL.building_discount = false;
            this.genericSetupBuildBuildings();
        },
        // currently only bonus involving a choice is hire worker.
        onUpdateActionButtons_bonusChoice_build: function (args) {
            if (args.building_bonus == BUILD_BONUS_WORKER){
                this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:TOKEN_HTML.worker}), 'workerForFreeBuilding');
            } 
            this.addActionButton( 'btn_pass_bonus',   _('Do Not Get Bonus'), 'passBonusBuilding', null, false, 'red');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),  'cancelTurn', null, false, 'red');
            GLOBAL.can_cancel = true;
        },
        onUpdateActionButtons_bonusChoice_auction: function (args) {
            let option = Number(args.auction_bonus);
            switch (option){
                case AUC_BONUS_WORKER:
                case AUC_BONUS_WORKER_RAIL_ADV:
                    this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:TOKEN_HTML.worker}) , 'workerForFreeAuction');
                break;
                case AUC_BONUS_WOOD_FOR_TRACK:
                    this.addActionButton( 'btn_wood_track', `${TOKEN_HTML.wood} ${TOKEN_HTML.arrow} ${TOKEN_HTML.track}`, 'woodForTrack');
                break;
                case AUC_BONUS_COPPER_FOR_VP:
                    this.addActionButton( 'btn_copper_vp', `${TOKEN_HTML.copper} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'copperFor4VP');
                    if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                        this.addActionButton( GOLD_COPPER_BUTTON_ID, `${TOKEN_HTML.gold} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'goldFor4VP');
                    }
                    break;
                case AUC_BONUS_COW_FOR_VP:
                    this.addActionButton( 'btn_cow_vp', `${TOKEN_HTML.cow} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'cowFor4VP');
                    if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                        this.addActionButton( GOLD_COW_BUTTON_ID, `${TOKEN_HTML.gold} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp4}`, 'goldFor4VP');
                    }
                    break;
                case AUC_BONUS_6VP_AND_FOOD_VP:
                case AUC_BONUS_FOOD_FOR_VP:
                    this.addActionButton( 'btn_food_vp', `${TOKEN_HTML.food} ${TOKEN_HTML.arrow} ${TOKEN_HTML.vp2}`, 'foodFor2VP');
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
            GLOBAL.can_cancel = true;
        },
        onUpdateActionButtons_endGameActions: function () {
            this.addActionButton( 'btn_done',          _('Done'),                    'doneEndgameActions');    
            this.addActionButton( 'btn_pay_loan_silver', dojo.string.substitute(_('Pay Loan ${type}'), {type:TOKEN_HTML.silver}), 'payLoanSilver', null, false, 'gray');
            this.addActionButton( 'btn_pay_loan_gold',   dojo.string.substitute(_('Pay Loan ${type}'), {type:TOKEN_HTML.gold}),'payLoanGold',   null, false, 'gray');
            this.addActionButton( 'btn_hire_worker', _('Hire New Worker'), 'hireWorkerButton', null, false, 'gray' );
            this.addActionButton( 'btn_cancel_button', _('Cancel'), 'cancelUndoTransactions', null, false, 'red');
            this.addTradeActionButton();
        },
        ////////////////////
        //// EVENTS onUpdateActionButtons states 
        ////////////////////
        onUpdateActionButtons_chooseBuildingToBuild_event: function (args) {
            this.allowed_buildings = args.allowed_buildings;
            GLOBAL.building_discount = false;
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
                    this.addActionButton( 'pay_loan_food', this.tooltip.replaceTooltipStrings(_('pay ${loan} with ${food}')),'payLoanWithFood', null, false, 'blue' );
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneTradingEvent', null, false, 'blue');
                    this.addTradeActionButton();
                    break;
                case EVT_COPPER_COW_GET_GOLD:
                    this
                    this.addActionButton( 'btn_done_trading', _('Done'), 'doneHiddenTradingEvent', null, false, 'blue');
                    this.addActionButton( TAKE_LOAN_BUTTON_ID, _('Take Debt'), 'onMoreLoan', null, false, 'gray' );
                    this.addActionButton( TRADE_BUTTON_ID, _("Show Trade"),'tradeActionButton', null, false, 'gray' );
                    this.addActionButton( CONFIRM_TRADE_BTN_ID, _("Confirm Trade"),'confirmHiddenTradeButton', null, false, 'blue' );
                    dojo.style(CONFIRM_TRADE_BTN_ID, 'display', 'none');
                    dojo.style(TRADE_BOARD_ID, 'order', 2);
                    
                    this.trade.updateTradeAffordability();
                    this.resetTradeValues();
                    if (BOARD_RESOURCE_COUNTERS[this.player_id].trade.getValue() ==0) {
                        GLOBAL.tradeEnabled = false;
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
                    dojo.addClass('btn_choose_bonus', 'disabled');
                break;
                case EVT_LEAST_WORKER: //least workers can hire worker (free).
                    this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:TOKEN_HTML.worker}), 'workerForFreeEvent');
                    this.addActionButton( 'btn_pass_bonus', _('Do Not Get Bonus'), 'passBonusEvent', null, false, 'red');
                break;
            }
        },
        onUpdateActionButtons_eventPay: function (args){
            GLOBAL.silverCost= args.cost[this.player_id];
            GLOBAL.goldAmount = 0;
            this.addPaymentButtons(true);
        },
        onUpdateActionButtons_bonusChoice_lotEvent: function (args){
            let option = Number(args.event_bonus);
            switch (option){
                case EVT_AUC_2SILVER_TRACK: // auction winners can pay 2 silver for track
                    this.addActionButton( 'btn_silver_track', `${TOKEN_HTML.silver}${TOKEN_HTML.silver} ${TOKEN_HTML.arrow} ${TOKEN_HTML.track}`, 'silver2ForTrack');
                break;
                case EVT_AUC_BONUS_WORKER: // Auc 1 also gives worker
                    this.addActionButton( 'btn_bonus_worker', dojo.string.substitute(_('(FREE) Hire ${worker}'), {worker:TOKEN_HTML.worker}) , 'workerForFreeLotEvent');
                break;
                case EVT_AUC_STEEL_ANY:
                    this.addActionButton( 'btn_steel_build', this.tooltip.replaceTooltipStrings(_('Pay ${steel} to build ${any}')) , 'steelBuildBuilding');
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
                GLOBAL.roundCounter.setValue(round_number);
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
                this.addTooltipHtml(`${TPL_AUC_TILE}_${a_id}`, this.tooltip.formatTooltipAuction(info, a_id));
            } else {
                let text_auction_html = this.tooltip.formatTooltipAuction(info, a_id);
                dojo.place(this.format_block('jptpl_auction_text', {auc: a_id, color:color, 'card':text_auction_html}), `future_auction_${location}`);
            }
            dojo.style(`${TPL_AUC_TILE}_${a_id}`, 'order', a_id);
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
            GLOBAL.current_auction = 0;
            for (let i in auctions){
                const auction = auctions[i];
                this.moveObject(`${TPL_AUC_TILE}_${auction.a_id}`, `${TPL_AUC_ZONE}${auction.location}`)
                if (GLOBAL.current_auction == 0) 
                    GLOBAL.current_auction = auction.location;

            }
        },

        /**
         * The plan is for this to be called after each auction tile is resolved (building & bonuses)
         * it should remove the auction tile at auction_no, so that it is clear what state we are at. 
         */
        clearAuction: function(){
            const auc_id = dojo.query(`#${TPL_AUC_ZONE}${GLOBAL.current_auction} .auction_tile`)[0].id;
            if (auc_id){
                dojo.destroy(auc_id);
            }

            const bid_token = dojo.query(`[id^="bid_slot_${GLOBAL.current_auction}"] [id^="token_bid"]`);
            for(let i in bid_token){
                if (bid_token[i].id){
                    const bid_color = bid_token[i].id.split('_')[2];                        
                    for(let p_id in PLAYER_COLOR){
                        if (p_id == DUMMY_OPT) continue;
                        if (PLAYER_COLOR[p_id] == bid_color){
                            this.moveBid(p_id, BID_PASS);
                        }
                    }
                }
            }
            if (GLOBAL.current_auction < GLOBAL.number_auctions){ GLOBAL.current_auction++;}
            else { GLOBAL.current_auction = 1; }
        },

        /***** events utils ******/
        createEventCards: function(){
            for (let i in this.events){
                let event = EVENT_INFO[this.events[i].e_id];
                //do a thing for each event...
                dojo.place(this.format_block('jptpl_evt_tt', 
                    {'pos': this.events[i].position, 
                    TITLE: _("Round ") + this.events[i].position + ":<br>" + this.tooltip.replaceTooltipStrings(event.name), 
                    DESC: this.tooltip.replaceTooltipStrings(event.tt)}), TILE_ZONE_DIVID[EVT_LOC_MAIN],'last');
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
                let text = this.tooltip.replaceTooltipStrings(_(EVENT_INFO[this.events[i].e_id].tt))
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
            if ($(PLAYER_BUILDING_ZONE_ID[building.p_id]).parentElement.id.startsWith(TPL_BLD_ZONE) ){
                return;
            }
            if ($(b_divId)){ // if element already exists, just move it.
                const wasInMain = (dojo.query( `#${TILE_ZONE_DIVID[BLD_LOC_OFFER]} #${b_divId}`).length == 1);
                if (wasInMain){
                    this.moveObject(`${b_divId}`, PLAYER_BUILDING_ZONE_ID[building.p_id]);
                    dojo.disconnect(GLOBAL.b_connect_handler[b_key]);
                    if ((MAIN_BUILDING_COUNTS[building.b_id]--) == 1){
                        this.removeBuildingZone(b_id);
                    }
                } else {
                    this.moveObject(`${b_divId}`, PLAYER_BUILDING_ZONE_ID[building.p_id]);
                }
            } else { // create it as well;
                this.createBuildingTile(b_id, b_key, PLAYER_BUILDING_ZONE_ID[building.p_id]);
            }
            if (b_id == BLD_WAREHOUSE && building.state != 0){
                this.updateWarehouseState(building.state);
            }
            // remove any afford-ability flags
            this.updateAffordability(`#${b_divId}`, 0);
            dojo.query(`#${b_divId}`).style(`order`,`${building.b_order}`);
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){
                this.addTooltipHtml(b_divId, this.tooltip.formatTooltipBuilding(b_id, b_key));
            } else {
                this.removeTooltip( b_divId );
            }
            this.updateHasBuilding(building.p_id, b_id); 
        },

        genericSetupBuildBuildings: function( ){
            this.updateBuildingAffordability();
            this.showTileZone(BLD_LOC_OFFER);
            this.orderZone(BLD_LOC_OFFER, 0);
            LAST_SELECTED['building']="";
            this.createBuildingBreadcrumb();
            this.makeBuildingsSelectable(this.allowed_buildings);
            this.addActionButton( 'btn_choose_building', dojo.string.substitute(_('Build ${building_name}'), {building_name:'<span id="bld_name"></span>'}), 'chooseBuilding');
            this.addActionButton( 'btn_do_not_build', _('Do Not Build'), 'doNotBuild', null, false, 'red');
            this.addActionButton( 'btn_redo_build_phase', _('Cancel'),   'cancelTurn', null, false, 'red');
            GLOBAL.can_cancel = true;
            this.addTradeActionButton();
            dojo.addClass('btn_choose_building' ,'disabled');
            replacers = dojo.create('div', {id:'replacers', style:'display:inline-block;'});
            dojo.place(replacers, 'generalactions', 'last');
            if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                if (GLOBAL.goldAsCow){
                    this.addActionButton( GOLD_COW_BUTTON_ID, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='cow_as'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.cow, end:"</div>"}), 'toggleGoldAsCow', null, false, 'blue');
                } else {
                    this.addActionButton( GOLD_COW_BUTTON_ID, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='cow_as' class='no'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.cow, end:"</div>"}), 'toggleGoldAsCow', null, false, 'red');
                }
                if (GLOBAL.goldAsCopper){
                    this.addActionButton( GOLD_COPPER_BUTTON_ID, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='copper_as'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.copper, end:"</div>"}), 'toggleGoldAsCopper', null, false, 'blue');
                } else {
                    this.addActionButton( GOLD_COPPER_BUTTON_ID, dojo.string.substitute(_("${begin}${gold} As ${type}${end}"), {begin:"<div id='copper_as' class='no'>", gold:TOKEN_HTML.gold, type:TOKEN_HTML.copper, end:"</div>"}), 'toggleGoldAsCopper', null, false, 'red');
                }
                dojo.place(GOLD_COW_BUTTON_ID, 'replacers', 'last');
                dojo.style(GOLD_COW_BUTTON_ID, 'display', 'none');
                dojo.place(GOLD_COPPER_BUTTON_ID, 'replacers', 'last');
                dojo.style(GOLD_COPPER_BUTTON_ID, 'display', 'none');
            }
            if (HAS_BUILDING[this.player_id][BLD_LUMBER_MILL]){
                this.lumberMill_WoodVP_Steel=0;
                this.addActionButton( MORE_STEEL_BUTTON, dojo.string.substitute(_('More ${wood}${vp} As ${steel}'), {gold: TOKEN_HTML.gold}), 'raiseWoodSteel', null, false, 'gray');
                this.addActionButton( LESS_STEEL_BUTTON, dojo.string.substitute(_('Less ${wood}${vp} As ${steel}'), {gold: TOKEN_HTML.gold}), 'lowerWoodSteel', null, false, 'gray');
                dojo.place(MORE_STEEL_BUTTON, 'replacers', 'last');
                dojo.style( $(MORE_STEEL_BUTTON), 'display', 'none');
                dojo.place(LESS_STEEL_BUTTON, 'replacers', 'last');
                dojo.style( $(LESS_STEEL_BUTTON), 'display', 'none');
                
            }
            
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
                GLOBAL.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
                MAIN_BUILDING_COUNTS[building.b_id]++;
            }
        },

        createBuildingTile(b_id, b_key, destination){
            if (this.prefs[USE_ART_USER_PREF].value == ENABLED_USER_PREF){ // use art (default case)
                dojo.place(this.format_block( 'jstpl_buildings', {key: b_key, id: b_id}), destination);
                this.addTooltipHtml( `${TPL_BLD_TILE}_${b_key}`, this.tooltip.formatTooltipBuilding(b_id, b_key));
                this.addBuildingWorkerSlots(b_id, b_key);
                this.setupBuildingWorkerSlots(b_id, b_key);
            } else { // use text instead of art.
                let text_building_html = this.tooltip.formatTooltipBuilding(b_id, b_key);
                dojo.place(this.format_block('jptpl_bld_text', {key: b_key, id: b_id, 'card':text_building_html}), destination);
                this.setupBuildingWorkerSlots(b_id, b_key);
            }
        },

        createBuildingZoneIfMissing(building){
            const b_id = building.b_id;
            if (MAIN_BUILDING_COUNTS[b_id] == 0 || !(b_id in MAIN_BUILDING_COUNTS)){ // make the zone if missing
                const b_order = (30*Number(building.b_type)) + Number(b_id);
                dojo.place(this.format_block( 'jstpl_building_stack', 
                {id: b_id, order: b_order}), TILE_ZONE_DIVID[building.location]);
                MAIN_BUILDING_COUNTS[b_id] = 0;
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
            MAIN_BUILDING_COUNTS[building.b_id]++;
            //remove from hasBuilding
            delete HAS_BUILDING[building.p_id][building.b_id];
            GLOBAL.b_connect_handler[building.b_key] = dojo.connect($(b_divId), 'onclick', this, 'onClickOnBuilding' );
        },

        updateWarehouseState: function(state, p_id=null){
            let new_state = state;
            let old_state = GLOBAL.warehouse_state;
            let stateDiff = new_state ^ old_state;
            for(let bit = 1; bit <=stateDiff; bit <<= 1){
                if (stateDiff & old_state & bit){
                    this.updateWarehouseResource(WAREHOUSE_MAP[bit], false, p_id);
                } else if (stateDiff & new_state & bit){
                    this.updateWarehouseResource(WAREHOUSE_MAP[bit], true, p_id);
                }
            }
            GLOBAL.warehouse_state = state;
        },

        updateWarehouseResource: function(type, add, p_id){
            let origin = 'limbo';
            if (add){
                let tkn_id = `warehouse_${type}`;
                let resToken = dojo.create('span', {class: `log_${type} token_inline`, title:type, id:tkn_id});
                dojo.style(resToken,'order', this.getKeyByValue(WAREHOUSE_MAP, type));
                if (p_id){
                    origin = TRACK_TOKEN_ZONE[p_id];
                    this.incResCounter(p_id, type, -1);
                }
                dojo.place(resToken, origin, 'first');
                this.moveObject(tkn_id, WAREHOUSE_RES_ID);
            } else {
                if (p_id){
                    origin = TRACK_TOKEN_ZONE[p_id];
                    this.incResCounter(p_id, type, 1);
                }
                this.slideToObjectAndDestroy(`warehouse_${type}`, origin, 500, 0 );
            }
        },

        getWarehouseResources: function (){
            let state = GLOBAL.warehouse_state;
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
            if (!(p_id in HAS_BUILDING)){
                HAS_BUILDING[p_id] = [];
            }
            if (!(b_id in HAS_BUILDING[p_id])){
                HAS_BUILDING[p_id][b_id] = true;
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
            return BID_ZONE_ID[Math.ceil(bid_no/10)][Number(bid_no%10) -1];
        },

        moveBid: function(p_id, bid_loc){
            if (bid_loc == OUTBID || bid_loc == NO_BID) {
                this.moveObject(BID_TOKEN_ID[p_id], BID_ZONE_ID[ZONE_PENDING]);
            } else if (bid_loc == BID_PASS) {
                this.moveObject(BID_TOKEN_ID[p_id], BID_ZONE_ID[ZONE_PASSED]);
            } else { 
                this.moveObject(BID_TOKEN_ID[p_id], this.getBidLocDivIdFromBidNo(bid_loc));
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
            
            if (selected == true && LAST_SELECTED[type] != "" && LAST_SELECTED[type]){
                dojo.removeClass(LAST_SELECTED[type], 'selected');
                LAST_SELECTED[type] = "";
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
            if (! LAST_SELECTED[type] == ""){
                dojo.removeClass(LAST_SELECTED[type], 'selected');
                if (LAST_SELECTED[type] == selected_id){
                    LAST_SELECTED[type] = "";
                    return;
                }
            }
            // select newly selected
            dojo.addClass(selected_id, 'selected');
            LAST_SELECTED[type] = selected_id;
        },

        ///////////////////////////////////////////////////
        //// Player's action

        /***** COMMON ACTIONS (multiple states) *****/
        addPaymentButtons: function( bypass= false ){
            if (!bypass && !GLOBAL.showPay) return;
            this.addActionButton( 'btn_pay_done', dojo.string.substitute(_("Pay: ${amt}"), {amt:this.format_block("jstpl_pay_button", {})}), 'donePay');
            GLOBAL.silverCounter.create(PAY_SILVER_TEXT);
            GLOBAL.silverCounter.setValue(GLOBAL.silverCost);
            GLOBAL.goldCounter.create(PAY_GOLD_TEXT);
            GLOBAL.goldCounter.setValue(GLOBAL.goldAmount);
            this.addActionButton( MORE_GOLD_BUTTON_ID, dojo.string.substitute(_('Use More ${gold}'), {gold: TOKEN_HTML['gold']}), 'raiseGold', null, false, 'gray');
            this.addActionButton( LESS_GOLD_BUTTON_ID, dojo.string.substitute(_('Use Less ${gold}'), {gold: TOKEN_HTML['gold']}), 'lowerGold', null, false, 'gray');
            dojo.style( $(LESS_GOLD_BUTTON_ID), 'display', 'none');
            this.addTradeActionButton();
            this.setOffsetForPaymentButtons();
        },

        lowerGold: function(){
            if (GLOBAL.goldAmount <1){return;}
            GLOBAL.goldAmount --;
            GLOBAL.goldCounter.setValue(GLOBAL.goldAmount);
            GLOBAL.silverCost +=5;
            if (GLOBAL.silverCost >0){
                dojo.style( $(PAY_SILVER_TEXT), 'display', 'inline-block');
                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'inline-block');
                dojo.style( $(MORE_GOLD_BUTTON_ID), 'display', 'inline-block');
                GLOBAL.silverCounter.setValue(GLOBAL.silverCost);
            }
            if(GLOBAL.goldAmount == 0){
                dojo.style( $(PAY_GOLD_TEXT), 'display', 'none');
                dojo.style( $(PAY_GOLD_TOKEN), 'display', 'none');
                dojo.style( $(LESS_GOLD_BUTTON_ID), 'display', 'none');
            }
            this.setOffsetForPaymentButtons();
        },

        raiseGold: function(){
            if (GLOBAL.silverCost <0) return;
            dojo.style( $(PAY_GOLD_TEXT), 'display', 'inline-block');
            dojo.style( $(PAY_GOLD_TOKEN), 'display', 'inline-block');
            dojo.style( $(LESS_GOLD_BUTTON_ID), 'display', 'inline-block');

            GLOBAL.goldAmount++;
            GLOBAL.goldCounter.setValue(GLOBAL.goldAmount);
            GLOBAL.silverCost -= 5;
            GLOBAL.silverCounter.setValue(Math.max(0 , GLOBAL.silverCost));
            if (GLOBAL.silverCost <= 0){
                dojo.style( $(PAY_SILVER_TEXT), 'display', 'none');
                dojo.style( $(PAY_SILVER_TOKEN), 'display', 'none');
                dojo.style( $(MORE_GOLD_BUTTON_ID), 'display', 'none');
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
                GLOBAL.cost_replace[type] = 0;
            }
        },

        raiseCostReplace: function (type) {
            if (!(type in this.buildingCost) || GLOBAL.cost_replace[type] >= this.buildingCost[type] ) return;

            dojo.style( $(`btn_less_${type}`), 'display', 'inline-block');

            GLOBAL.cost_replace[type]++;
            if (this.buildingCost[type] == GLOBAL.cost_replace[type]){//can't replace any more.
                dojo.style( $(`btn_more_${type}`), 'display', 'none');
            }
            this.createBuildingBreadcrumb();
        },

        lowerCostReplace: function (type) {
            if (!(type in this.buildingCost) || GLOBAL.cost_replace[type]<=0 ) return;
            dojo.style( $(`btn_more_${type}`), 'display', 'inline-block');

            GLOBAL.cost_replace[type]--;
            if (GLOBAL.cost_replace[type] == 0){//can't replace any less.
                dojo.style( $(`btn_less_${type}`), 'display', 'none');
            }
            this.createBuildingBreadcrumb();
        },

        /**
         * Set offset & New values to include cost & transactions.
         */
        setOffsetForPaymentButtons: function( ) {
            // silver
            let silver_offset_neg = this.getOffsetNeg('silver');
            if (GLOBAL.silverCost >0){
                silver_offset_neg += GLOBAL.silverCost;
            } 
            this.setOffsetNeg('silver', silver_offset_neg);
            let silver_offset_pos = this.getOffsetPos('silver');
            let silver_new = BOARD_RESOURCE_COUNTERS[this.player_id].silver.getValue() - silver_offset_neg + silver_offset_pos;
            this.newPosNeg('silver', silver_new);

            // gold
            let gold_offset_neg = this.getOffsetNeg('gold');
            let gold_offset_pos = this.getOffsetPos('gold');
            if (GLOBAL.goldAmount >0){
                gold_offset_neg += GLOBAL.goldAmount;
            }
            this.setOffsetNeg('gold', gold_offset_neg);
            let gold_new = BOARD_RESOURCE_COUNTERS[this.player_id].gold.getValue() - gold_offset_neg + gold_offset_pos;
            this.newPosNeg('gold', gold_new);
            this.updateBuildingAffordability();
            this.trade.updateTradeAffordability();
            
            this.createPaymentBreadcrumb({'silver':Math.min(0,(-1 *GLOBAL.silverCost)), 'gold':Math.min(0,(-1 *GLOBAL.goldAmount))});
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
            if (!(id in INCOME_ARRAY)) return;
            let name = `<div title="Rail Tracks" class="bread_track"></div>`;
            let order = 1;
            if (id != -1){
                name = this.format_block('jstpl_color_log', {'string':_(BUILDING_INFO[id].name), 'color':ASSET_COLORS[BUILDING_INFO[id].type]});
                let bld = dojo.query(`#${TPL_BLD_ZONE}${PLAYER_COLOR[this.player_id]} .${TPL_BLD_CLASS}${id}`);
                if (bld[0].style){
                    order = Number(bld[0].style.order) + 2;
                }
            }
            let args = {text:name, 'id':id, style:`order:${order};`, income:this.getResourceArrayHtml(INCOME_ARRAY[id], true, "position: relative; top: 9px;")};
            if (dojo.query(`#breadcrumb_income_${id}`).length>=1){
                dojo.destroy(`breadcrumb_income_tokens_${id}`);
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumb_income_${id}`, 'replace');
            } else {
                dojo.place(this.format_block( 'jptpl_breadcrumb_income', args), `breadcrumbs`, 'first');
            }
        },

        destroyIncomeBreadcrumb: function(){
            for(let id in INCOME_ARRAY){
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
            if (LAST_SELECTED.building!=''){
                b_id = $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2];
                b_name = _(BUILDING_INFO[b_id].name);
                b_type = BUILDING_INFO[b_id].type;
                cost = this.getBuildingCost(b_id);
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
            INCOME_ARRAY.length = 0;
            const playerBuildingZone = PLAYER_BUILDING_ZONE_ID[this.player_id];
            for(let b_id in HAS_BUILDING[this.player_id]){
                INCOME_ARRAY[b_id] = [];
                // building base income
                if (BUILDING_INFO[b_id].inc){
                    // special income
                    if (b_id == BLD_RODEO){
                        INCOME_ARRAY[b_id].silver = Math.min(5, this.getPlayerWorkerCount(this.player_id));
                    } else if (b_id == BLD_BANK){
                        if (BOARD_RESOURCE_COUNTERS[this.player_id][loan].getValue() == 0){
                            INCOME_ARRAY[b_id].silver = 2;
                        } else {
                            INCOME_ARRAY[b_id].loan = -1;
                        }
                    } else if (b_id == BLD_WAREHOUSE){
                        if (this.warehouse != ''){
                            INCOME_ARRAY[b_id][this.warehouse] = 1;
                        }
                    } else {
                        for(let type in BUILDING_INFO[b_id].inc){
                            if (type == 'vp2'){
                                INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'vp',(2* BUILDING_INFO[b_id].inc.vp2));
                            } else {
                                INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type,BUILDING_INFO[b_id].inc[type]);
                            }
                        }
                    }
                }
                // building worker income
                if (BUILDING_INFO[b_id].slot){
                    if (BUILDING_INFO[b_id].slot == 3){
                        if (dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot .token_worker`).length == 2){
                            for (type in BUILDING_INFO[b_id].s3){
                                INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type, BUILDING_INFO[b_id].s3[type]);
                            }
                        }
                    } else {
                        let slots = dojo.query(`#${playerBuildingZone} .${TPL_BLD_CLASS}${b_id} .worker_slot:not(:empty)`);
                        for(let i in slots){
                            if (slots[i].id == null) continue;
                            if (slots[i].id.split('_')[2] == 1){
                                for (type in BUILDING_INFO[b_id].s1){
                                    if (type == 'vp2'){
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'vp', (2* BUILDING_INFO[b_id].s1.vp2));
                                    } else {
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type, BUILDING_INFO[b_id].s1[type]);
                                    }
                                }
                            }
                            if (slots[i].id.split('_')[2] == 2){
                                for (type in BUILDING_INFO[b_id].s2){
                                    if (type == 'vp2'){
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], 'vp', (2* BUILDING_INFO[b_id].s2.vp2));
                                    } else {
                                        INCOME_ARRAY[b_id] = this.addOrSetArrayKey(INCOME_ARRAY[b_id], type, BUILDING_INFO[b_id].s2[type]);
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
                INCOME_ARRAY[-1] = {'silver':tracks};
            }
        },
        
        getIncomeOffset: function(type){
            let amt = 0;
            for (let id in INCOME_ARRAY){
                if (INCOME_ARRAY[id][type]){
                    amt += INCOME_ARRAY[id][type];
                }
            }
            return amt;
        },

        setOffsetForIncome: function() {
            this.updateIncomeArr();
            //console.log('setOffsetForIncome', INCOME_ARRAY);
            for (let id in INCOME_ARRAY){
                for (let type in INCOME_ARRAY[id]){
                    if (INCOME_ARRAY[id][type]!= 0){
                        let income = INCOME_ARRAY[id][type];
                        this.offsetPosNeg(type, income, true);
                        this.newPosNeg(type, income, true);
                        this.updateBuildingAffordability();
                        this.trade.updateTradeAffordability();
                    }
                }
                this.createIncomeBreadcrumb(id);
            }
        },

        clearOffset: function() {
            //console.log("clearOffset");
            for(type in POSITIVE_RESOURCE_COUNTERS){
                POSITIVE_RESOURCE_COUNTERS[type].setValue(0);
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
                NEGATIVE_RESOURCE_COUNTERS[type].setValue(0);
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
            if (TRANSACTION_LOG.length == 0){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');   
            } else if (TRANSACTION_LOG.length == 1){
                dojo.query(`#${UNDO_TRADE_BTN_ID}:not(.noshow)`).addClass('noshow');
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.noshow`).removeClass('noshow');
            } else {
                dojo.query(`#${UNDO_LAST_TRADE_BTN_ID}.noshow`).removeClass('noshow');
                dojo.query(`#${UNDO_TRADE_BTN_ID}.noshow`).removeClass('noshow');
            }
        },

        addTradeActionButton: function( ){
            this.addActionButton( TAKE_LOAN_BUTTON_ID, _('Take Debt'), 'onMoreLoan', null, false, 'gray' );
            this.addActionButton( TRADE_BUTTON_ID, _("Show Trade"),'tradeActionButton', null, false, 'gray' );
            this.addActionButton( CONFIRM_TRADE_BTN_ID, _("Confirm Trade"),'confirmTradeButton', null, false, 'blue' );
            dojo.style(CONFIRM_TRADE_BTN_ID, 'display', 'none');
            dojo.style(TRADE_BOARD_ID, 'order', 2);
            this.trade.updateTradeAffordability();
            this.resetTradeValues();
            if (BOARD_RESOURCE_COUNTERS[this.player_id].trade.getValue() ==0) {
                GLOBAL.tradeEnabled = false;
                dojo.query(`#${TRADE_BUTTON_ID}`).addClass('disabled');
            } else {
                this.enableTradeBoardActions();
            }
        },

        enableTradeBoardActions: function(){
            dojo.query(`#building_zone_${PLAYER_COLOR[this.player_id]} .trade_option:not(.selectable)`).addClass('selectable');
            dojo.query(`${TRADE_BOARD_ACTION_SELECTOR}:not(.selectable)`).addClass('selectable');
        },

        disableTradeBoardActions: function(){
            dojo.query(`#building_zone_${PLAYER_COLOR[this.player_id]} .trade_option.selectable`).removeClass('selectable');
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
            if(  (this.currentState=='allocateWorkers' && GLOBAL.allowTrade) || this.checkAction( 'trade' ) ){
                if (dojo.query(`#${TRADE_BUTTON_ID}.bgabutton_red`).length > 0){// hide
                    this.trade.disableTradeIfPossible();
                    this.setTradeButtonTo( TRADE_BUTTON_SHOW );
                    return;
                }
                // show trade
                this.trade.enableTradeIfPossible();
                this.setTradeButtonTo( TRADE_BUTTON_HIDE );
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
                this.confirmTradesHidden( false );
                this.updateConfirmTradeButton( TRADE_BUTTON_HIDE );
                return;
            }
        },
        /** helper method. 
         * Will hide all offset and New text values that don't have pending changes.
         */
        hideResources: function(){
            // if no building selected, or income displayed, hide stuff
            let thisPlayer = `player_zone_${PLAYER_COLOR[this.player_id]}`;
            dojo.query(`#${thisPlayer} .new_text:not(.noshow)`).addClass('noshow');
            dojo.query(`#${thisPlayer} .player_text.noshow`).removeClass('noshow');
            
            let hasOffset = [];
            for(let type in this.getBuildingCost())   { hasOffset[type] = true; }
            for(let i in TRANSACTION_COST)
                for(let type in TRANSACTION_COST[i]) { hasOffset[type] = true; }
            for(let id in INCOME_ARRAY)
                for(let type in INCOME_ARRAY[id])
                if (INCOME_ARRAY[id][type]!= 0)   { hasOffset[type] = true; }
            if (GLOBAL.silverCost >0){ hasOffset.silver = true; }
            if (GLOBAL.goldAmount >0){ hasOffset.gold = true; }
            for(let type in hasOffset){
                dojo.query(`#${thisPlayer} .player_${type}_new.noshow`).removeClass('noshow');
            }
        },
        /** onButtonClick "Confirm Trades" */
        confirmTrades: function ( notActive ){
            if (TRANSACTION_LOG.length == 0) { return; }
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                lock: true, 
                trade_action: TRANSACTION_LOG.join(','),
                notActive: notActive,
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeValues();
                 GLOBAL.can_cancel = true;
                 if (this.currentState == 'allocateWorkers' && !notActive){
                    this.setOffsetForIncome();
                 }
                 this.tooltip.calculateAndUpdateScore(this.player_id);
             }, function( is_error) {});
        },
        /** onButtonClick "Confirm Trades" to call tradeHidden 
         * for the 1-of use case most cow/copper */
        confirmTradesHidden: function(){
            if (TRANSACTION_LOG.length == 0) { return; }
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/tradeHidden.html", { 
                lock: true, 
                trade_action: TRANSACTION_LOG.join(','),
                notActive: notActive,
             }, this, function( result ) {
                 this.clearTransactionLog();
                 this.resetTradeValues();
                 GLOBAL.can_cancel = true;
                 this.tooltip.calculateAndUpdateScore(this.player_id);
             }, function( is_error) {});
        },
        /** helper method that calculates total negative offset for resource of type */
        getOffsetNeg: function(type){
            let value = 0;
            for(let i in TRANSACTION_COST){
                if (type in TRANSACTION_COST[i] && TRANSACTION_COST[i][type] < 0){
                    value += TRANSACTION_COST[i][type];
                }
            }
            
            return Math.abs(value);
        },
        /** helper method that calculates total positive offset for resource of type */
        getOffsetPos: function(type){
            let value = 0;
            for(let i in TRANSACTION_COST){
                if (type in TRANSACTION_COST[i] && TRANSACTION_COST[i][type]>0){
                    value += TRANSACTION_COST[i][type];
                }
            }
            return Math.abs(value);
        },
        /** helper method that calculates total offset for resource of type */
        getOffsetValue: function(type) {
            let value = 0;
            for(let i in TRANSACTION_COST){
                value += TRANSACTION_COST[i][type]??0;
            }
            return value;
        },

        /**
         * update the offset & new values to be correct 
         * values are board_resourceCounters + offset from pending transactions.
         */
        resetTradeValues: function() {
            for(let type in BOARD_RESOURCE_COUNTERS[this.player_id]){
                let offset = 0;
                offset -= this.setOffsetNeg(type, this.getOffsetNeg(type));
                offset += this.setOffsetPos(type, this.getOffsetPos(type));

                this.newPosNeg(type, BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue() + offset);
            }
        },
        checkActionTrade: function( evt){
            dojo.stopEvent( evt );
            if ( !GLOBAL.allowTrade && !this.checkAction( 'trade' ) ) { return {valid:false}; }
            let parent = false;
            if ( !dojo.hasClass (evt.target.id, 'selectable')) { 
                if (!dojo.hasClass (evt.target.id, 'selectable')){
                    return {valid:false};
                }
                parent = true;
            }
            return {valid:true, parent:parent};
        },
        /** OnClick Handler 
         * mapped to trade_option will call associates buy or sell methods.
         */
        onSelectTradeAction: function( evt ){
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            let target_divId = evt.target.id;
            if (tradeable.parent){
                target_divId = evt.target.parentNode.id;
            }
            var tradeAction = target_divId.substring(6);
            if (TRADE_MAP[tradeAction] < 6){ //buy
                this.onBuyResource ( evt , target_divId.substring(10));
            } else { //sell
                this.onSellResource( evt , target_divId.substring(11));
            }
        },
        /** OnClick Handler (buy action buttons)
         * will add Buy transaction to transactionLog (and update offset/breadcrumbs)
         */
        onBuyResource: function ( evt , type = ""){
            //console.log('onBuyResource');
            
            if (type == ""){ // didn't come from onSelectTradeAction.
                if ( !GLOBAL.allowTrade && !this.checkAction( 'trade' ) ) { return; }
                dojo.stopEvent( evt );
                if (evt.target.classList.contains('bgabutton')){
                    type = evt.target.id.split('_')[2];
                } else { return; }
            }
            this.trade.addTransaction(BUY, type);
        },

        /** OnClick Handler (Sell action buttons)
         * will add Sell transaction to transactionLog (and update offset/breadcrumbs)
         */
        onSellResource: function ( evt , type = "" ){
            //console.log('onSellResource');
            if (type == ""){
                dojo.stopEvent( evt );
                if ( !GLOBAL.allowTrade && !this.checkAction( 'trade' ) ) { return; }
                if (evt.target.classList.contains('bgabutton')){
                    type = evt.target.id.split('_')[2];
                } else { return; }
            }
            this.trade.addTransaction(SELL, type);
        },
        /** OnClick Handler Take Loan/debt action buttons
         * will add takeLoan transaction to transactionLog (and update offset/breadcrumbs)
         */
        onMoreLoan: function ( evt ){
            if ( !GLOBAL.allowTrade && !this.checkAction( 'trade' ) ) { return; }
            this.trade.addTransaction(TAKE_LOAN);
        },
        /** OnClick Handler Market Trade Actions 
         * will add takeLoan transaction to transactionLog (and update offset/breadcrumbs)
         */
        onClickOnMarketTrade: function ( evt ){
            //console.log('onClickOnMarketTrade', evt);
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}
            let target = evt.target;
            if (tradeable.parent){
                target = evt.target.parentNode;
            }
            if (target.classList.contains('market_food')){
                var type = 'food';
            } else if (target.classList.contains('market_steel')){
                var type = 'steel';
            } else {return;}
            
            this.trade.addTransaction(MARKET, type);
        },
        
        /** OnClick Handler Bank Trade Action
         * will add BankTrade actions to transactionLog (trade -> silver)
         */
        onClickOnBankTrade: function ( evt ){
            //console.log('onClickOnBankTrade');
            let tradeable = this.checkActionTrade(evt);
            if (!tradeable.valid){return;}

            this.trade.addTransaction(BANK);
        },

        /** called when building is selected.
         * will show or hide goldAsCow/goldAsCopper toggles if selected building has those in cost.
         * same for steel with lumberMill
         */
        showHideBuildingOffsetButtons: function () {
            let b_id = 0;
            if (LAST_SELECTED.building!=''){
                b_id= $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2]??0;
            }
            let cost = this.invertArray(BUILDING_INFO[b_id].cost??{});
            //console.log("showHideBuildingOffsetButtons", cost);
            if (HAS_BUILDING[this.player_id][BLD_RIVER_PORT]){
                if (cost.cow<0){
                    dojo.style(GOLD_COW_BUTTON_ID, 'display', 'inline-block');
                } else {
                    dojo.style(GOLD_COW_BUTTON_ID, 'display', 'none');
                }
                if (cost.copper<0){
                    dojo.style(GOLD_COPPER_BUTTON_ID, 'display', 'inline-block');
                } else {
                    dojo.style(GOLD_COPPER_BUTTON_ID, 'display', 'none');
                }
            }
            if (HAS_BUILDING[this.player_id][BLD_LUMBER_MILL]){
                if (cost.steel<0){
                    dojo.style(MORE_STEEL_BUTTON, 'display', 'inline-block');
                    dojo.style(LESS_STEEL_BUTTON, 'display', 'inline-block');
                } else {
                    dojo.style(MORE_STEEL_BUTTON, 'display', 'none');
                    dojo.style(LESS_STEEL_BUTTON, 'display', 'none');
                }
            }
        },
        /** helper function 
         * get cost of building by Building_id.
         * this will take into account cost replacement flags
         * (GLOBAL.goldAsCow&GLOBAL.goldAsCopper&GLOBAL.cost_replace)
         * @param {int} b_id - building_id
         * @returns [Object object] of {type:amt,type2:amt2}
         */
        getBuildingCost: function( b_id =0) {
            if (b_id == 0){// if b_id not set use last_selected.building
                if (LAST_SELECTED.building!=''){
                    b_id = $(LAST_SELECTED.building).className.split(' ')[1].split('_')[2];
                }
            }
            cost = this.invertArray(BUILDING_INFO[b_id].cost);
            for(let type in GLOBAL.cost_replace){
                let max_loop = Math.max(GLOBAL.cost_replace[type], cost[type]);
                for(let i =0; i< max_loop;i++ ){
                    for(let replace_type in COST_REPLACE_TYPE[type]){
                        cost = this.addOrSetArrayKey(cost, replace_type, COST_REPLACE_TYPE[type][replace_type]);
                    }
                    cost[type]--;
                }
            }
            if (GLOBAL.goldAsCopper && ('copper' in cost)){
                this.addOrSetArrayKey(cost, 'gold', cost.copper);
                delete cost.copper;
            } 
            if (GLOBAL.goldAsCow && ('cow' in cost)){
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
                if (offset > 0){
                    this.setOffsetPos(type, (undo?(-1 * offset):offset), true);
                } else {
                    this.setOffsetNeg(type, (undo?offset:(-1 * offset)), true);
                }
                let offset_value = POSITIVE_RESOURCE_COUNTERS[type].getValue() - NEGATIVE_RESOURCE_COUNTERS[type].getValue();
                this.newPosNeg(type, BOARD_RESOURCE_COUNTERS[this.player_id][type].getValue() + offset_value);
            }
            return true;
        },

        newPosNeg: function(type, new_value, inc= false){   
            if (inc){
                old_value = NEW_RESOURCE_COUNTERS[type].getValue();
                new_value = NEW_RESOURCE_COUNTERS[type].setValue(old_value+ new_value);
            } else {
                NEW_RESOURCE_COUNTERS[type].setValue(new_value);
            }         
            
            if(new_value < 0){
                dojo.query(`#${type}_new`).addClass('negative');
            } else {
                dojo.query(`#${type}_new`).removeClass('negative');
            }
            this.showResource(type);
            return new_value;
        },

        showResource: function(type){
            let showNew = false;
            if (POSITIVE_RESOURCE_COUNTERS[type].getValue() != 0){
                dojo.query(`.${type}.pos.noshow`).removeClass('noshow');
                showNew = true;
            } else {
                dojo.query(`.${type}.pos:not(.noshow)`).addClass('noshow');
            }
            if (NEGATIVE_RESOURCE_COUNTERS[type].getValue() != 0){
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
            let counter = NEGATIVE_RESOURCE_COUNTERS[type];
            if (pos){
                counter = POSITIVE_RESOURCE_COUNTERS[type];
            } 
            if (inc) {
                old_value = counter.getValue();
                offset_value = counter.setValue(old_value + offset_value);
            } else {
                counter.setValue(offset_value);
            } 
            this.showResource(type);
            return offset_value;
        },
        
        // called after executing trades.
        clearTransactionLog: function() {
            for(let i in TRANSACTION_LOG){
                this.destroyTradeBreadcrumb(i);
            }
            TRANSACTION_COST.splice(0, TRANSACTION_COST.length);
            TRANSACTION_LOG.splice(0, TRANSACTION_LOG.length);
            this.setupUndoTransactionsButtons();
        },

        changeStateCleanup: function(){
            this.clearTransactionLog();
            this.trade.disableTradeIfPossible();
            this.resetTradeValues();
            this.disableTradeBoardActions();
            this.setupUndoTransactionsButtons();
            this.updateBuildingAffordability();
        },

        undoTransactionsButton: function( ){
            if (TRANSACTION_COST.length ==0) return;
            while (TRANSACTION_LOG.length>0){
                this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
                TRANSACTION_LOG.pop();
                this.updateTrade(TRANSACTION_COST.pop(), true);
                this.updateBuildingAffordability();
                this.trade.updateTradeAffordability();
            }
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
        },

        undoLastTransaction: function() {
            if (TRANSACTION_COST.length ==0) return;
            this.destroyTradeBreadcrumb(TRANSACTION_COST.length-1);
            TRANSACTION_LOG.pop();
            this.updateTrade(TRANSACTION_COST.pop(), true);
            this.updateBuildingAffordability();
            this.setupUndoTransactionsButtons();
            this.resetTradeButton();
            this.trade.updateTradeAffordability();
        },

        resetTradeButton: function(){
            if(TRANSACTION_LOG.length == 0){
                if (GLOBAL.tradeEnabled){
                    this.setTradeButtonTo(TRADE_BUTTON_HIDE);
                } else {
                    this.setTradeButtonTo(TRADE_BUTTON_SHOW);
                }
                if (TRANSACTION_LOG.length >0){
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
                document.getElementById(TILE_CONTAINER_ID[index]).scrollIntoView({behavior:'smooth'});
            } else {
                this.hideTileZone(index);
            }
        },
        
        hideTileZone: function(index){
            if (!dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                let translatedString = _(ASSET_STRINGS[index+15])
                $(TOGGLE_BTN_STR_ID[index]).innerText = translatedString;
                dojo.addClass(TILE_CONTAINER_ID[index], 'noshow');
            }
        },

        showTileZone: function(index){
            if(dojo.hasClass(TILE_CONTAINER_ID[index], 'noshow')){
                let translatedString = _(ASSET_STRINGS[index+20]);
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
        toggleShowEvents: function( evt ){
            evt.preventDefault();
            dojo.stopEvent( evt );
            this.toggleShowButton(EVT_LOC_MAIN);
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
                const tokenZone = WORKER_TOKEN_ZONE[this.player_id];
                const playerBuildingZone = PLAYER_BUILDING_ZONE_ID[this.player_id];
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
            //console.log(warehouse_num);
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/donePlacingWorkers.html", 
            {lock: true, warehouse:warehouse_num}, this, 
            function( result ) { 
                this.clearSelectable('worker', true); 
                this.clearSelectable('worker_slot', false);
                this.disableTradeBoardActions();
                this.destroyIncomeBreadcrumb();
                INCOME_ARRAY.length=0;
                this.trade.disableTradeIfPossible();
                this.clearOffset();
                GLOBAL.showPay = true;
            }, function( is_error) { } );
        },

        onUnPass: function () {
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/actionCancel.html", {}, this, function( result ) {
                GLOBAL.showPay = true;
                GLOBAL.undoPay = true;
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
            if(this.trade.canAddTrade(tradeChange)){
                this.updateTrade(tradeChange);
                // add breadcrumb
                this.createTradeBreadcrumb(TRANSACTION_LOG.length, _("Pay Dept"), {'silver':-3}, {'loan':-1});

                TRANSACTION_COST.push(tradeChange);
                TRANSACTION_LOG.push(TRADE_MAP.payLoan_3silver);
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

            if (LAST_SELECTED['worker'] == ""){
                const unassignedWorkers = dojo.query(`#worker_zone_${PLAYER_COLOR[this.player_id]} .token_worker`);// find unassigned workers.
                if (unassignedWorkers.length == 0){
                    this.showMessage( _("You must select a worker"), 'error' );
                    return;
                } else {
                    LAST_SELECTED['worker'] = unassignedWorkers[0].id;
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

            const w_key = LAST_SELECTED['worker'].split('_')[2];
            this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/selectWorkerDestination.html", { 
                lock: true, 
                worker_key: w_key,
                building_key: building_key,
                building_slot: building_slot
             }, this, function( result ) {
                dojo.removeClass(LAST_SELECTED['worker'], 'selected');
                LAST_SELECTED['worker'] = '';
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
            if (GLOBAL.allowTrade || this.checkAction( 'done')){
                if (!this.validPay()){
                    this.showMessage( _("You can't afford to pay, make trades or take loans"), 'error' );
                    return;
                }
                let args = {gold: GLOBAL.goldAmount, lock: true};
                if (TRANSACTION_LOG.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        allowTrade:GLOBAL.allowTrade,
                        trade_action: TRANSACTION_LOG.join(',')
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
            GLOBAL.showPay = false;
            GLOBAL.silverCost = 0;
            GLOBAL.goldAmount = 0;
            this.destroyPaymentBreadcrumb();
            this.changeStateCleanup();
        },

        validPay:function(){
            if (NEW_RESOURCE_COUNTERS.silver.getValue() < 0)
                return false;
            if (NEW_RESOURCE_COUNTERS.gold.getValue() < 0)
                return false;
            return true;
        },

        confirmDummyBidButton: function ( evt )
        {
            if( this.checkAction( 'dummy' )){
                if (LAST_SELECTED['bid'] == ""){
                    this.showMessage( _("You must select a bid"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(LAST_SELECTED['bid']);
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/confirmDummyBid.html", {lock: true, bid_loc: bid_loc}, this, 
                function( result ) { this.clearSelectable('bid', true); },
                 function( is_error) { } );
            }
        },

        setupBidsForNewRound: function ()
        {
            for(let p_id in PLAYER_COLOR){
                if (p_id == DUMMY_OPT) continue;
                this.moveBid(p_id, NO_BID);
            }
        },

        /***** EVENT PHASES *****/
        doneTradingEvent: function(){
            if (this.checkAction('event')){
                if (TRANSACTION_LOG.length > 0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
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
                if (LAST_SELECTED['bid'] == ""){
                    this.showMessage( _("You must select a bid"), 'error' );
                    return;
                }
                const bid_loc = this.getBidNoFromSlotId(LAST_SELECTED['bid']);
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
                    GLOBAL.showPay = true;
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
                if (LAST_SELECTED['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = LAST_SELECTED['bonus'].split('_')[3];
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
                if (LAST_SELECTED['bonus'] == ""){ 
                    this.showMessage( _("You must select a bonus"), 'error' );
                    return;
                 }
                const type = LAST_SELECTED['bonus'].split('_')[3];
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
            let target_id = (evt.target.id?evt.target.id:evt.target.parentNode.id);
            let type = target_id.split("_")[2];
            this.updateSelectedBonus(type);
        },
         
        updateSelectedBonus: function(type){
            //console.log(type);
            let btn_id = `btn_bonus_${type}`;
            let option_id = BONUS_OPTIONS[RESOURCES[type]];
            if (LAST_SELECTED.bonus =='' || LAST_SELECTED.bonus == option_id){
                dojo.toggleClass(btn_id, 'bgabutton_blue');
                dojo.toggleClass(btn_id, 'bgabutton_gray');
                dojo.toggleClass('btn_choose_bonus', 'disabled');
            } else { //other thing was selected.
                let lastSelected_id =  `btn_bonus_${LAST_SELECTED.bonus.split('_')[3]}`;
                dojo.toggleClass(lastSelected_id, 'bgabutton_blue');
                dojo.toggleClass(lastSelected_id, 'bgabutton_gray');
                dojo.toggleClass(btn_id, 'bgabutton_blue');
                dojo.toggleClass(btn_id, 'bgabutton_gray');
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
                let order = (30*Number(BUILDING_INFO[b_id].type)) + Number(b_id) - 100;
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
        },

        fixBuildingOrder: function(){
            for (let i in this.allowed_building_stack){
                let b_id = this.allowed_building_stack[i];
                let order = (30*Number(BUILDING_INFO[b_id].type)) + Number(b_id);
                dojo.query(`#${TPL_BLD_STACK}${b_id}`).style('order', order);
            }
            this.allowed_building_stack=[];
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
            if (GLOBAL.isSpectator) return;
            let buildings = dojo.query(`#${TILE_CONTAINER_ID[0]} .${TPL_BLD_TILE}, #${TILE_CONTAINER_ID[1]} .${TPL_BLD_TILE}`);
            for (let i in buildings){
                let bld_html= buildings[i];
                if (bld_html.id == null) continue;
                let b_key = Number(bld_html.id.split('_')[2]);
                let b_id = $(bld_html.id).className.split(' ')[1].split('_')[2];
                let b_loc = `#${bld_html.id}`;
                if (HAS_BUILDING[this.player_id][b_id]) { //can't buy it twice, mark it un-affordable.
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[ALREADY_BUILT]};">${_(ASSET_STRINGS[ALREADY_BUILT])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.tooltip.formatTooltipBuilding(b_id, b_key, ALREADY_BUILT));
                    }
                    continue;
                }
                let afford = this.isBuildingAffordable(b_id, showIncomeCost);

                if (afford==1){// affordable
                    this.updateAffordability(b_loc, AFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[AFFORDABLE]};">${_(ASSET_STRINGS[AFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.tooltip.formatTooltipBuilding(b_id, b_key, AFFORDABLE));
                    }
                } else if (afford ==0){//tradeable
                    this.updateAffordability(b_loc, TRADEABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[TRADEABLE]};">${_(ASSET_STRINGS[TRADEABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.tooltip.formatTooltipBuilding(b_id, b_key, TRADEABLE));
                    }
                } else {
                    this.updateAffordability(b_loc, UNAFFORDABLE);
                    if (this.prefs[USE_ART_USER_PREF].value == DISABLED_USER_PREF){
                        this.addTooltipHtml(bld_html.id, `<div style="max-width:200px;text-align:center;color:${COLOR_MAP[UNAFFORDABLE]};">${_(ASSET_STRINGS[UNAFFORDABLE])}</div>`);
                    } else {
                        this.addTooltipHtml(bld_html.id, this.tooltip.formatTooltipBuilding(b_id, b_key, UNAFFORDABLE));
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
            //console.log("isBuildingAffordable", BUILDING_INFO[b_id].name);
            if (BUILDING_INFO[b_id].cost == null) return 1;// no cost, can afford.
            if (BUILDING_INFO[b_id].cost.length == 0) return 1;// no cost, can afford.
            const p_id = this.player_id;
            let cost = BUILDING_INFO[b_id].cost;
            let off_gold = Number(this.getOffsetValue('gold'));
            let gold = Number(BOARD_RESOURCE_COUNTERS[p_id].gold.getValue()) + off_gold + Number(this.getIncomeOffset('gold')) - Number(GLOBAL.goldAmount);
            //console.log('gold', gold, BOARD_RESOURCE_COUNTERS[p_id].gold.getValue(),  off_gold, this.getIncomeOffset('gold'), -GLOBAL.goldAmount);
            let adv_cost = 0;
            let trade_cost = 0;
            for(let type in cost){
                let res_amt = Number(BOARD_RESOURCE_COUNTERS[p_id][type].getValue()) + Number(this.getOffsetValue(type)) + Number(this.getIncomeOffset(type));
                //console.log(type,'cost',cost[type] , 'amt',  res_amt);
                switch(type){
                    case 'wood':
                    case 'food':
                    case 'steel':
                        if (Number(cost[type]) > res_amt){
                            trade_cost += (cost[type] - res_amt);
                        }
                    break;
                    case 'gold':
                        if (Number(cost.gold) > gold){
                            trade_cost += (cost.gold - gold);
                            gold = 0;
                        } else {
                            gold -= cost.gold;
                        }
                    break;
                    case 'copper':
                    case 'cow':
                        if (Number(cost[type]) > res_amt){
                            adv_cost += (cost[type] - res_amt);
                        }
                    break;
                }
            }
            trade_cost += (adv_cost - Math.min(gold, adv_cost));
            if (!(HAS_BUILDING[p_id][BLD_RIVER_PORT])){
                trade_cost += adv_cost;
                if (adv_cost > gold && GLOBAL.building_discount){ // can save 2.
                    trade_cost -1;
                }
            }
            let trade_avail = BOARD_RESOURCE_COUNTERS[p_id].trade.getValue() + this.getOffsetValue('trade') + this.getIncomeOffset('trade');
            trade_cost -=  (GLOBAL.building_discount?1:0);
            //console.log('adv_cost', adv_cost);
            //console.log('trade_cost', trade_cost, 'trade_avail', trade_avail, trade_cost<= 0?'YES':trade_avail >= trade_cost?'REQ':'NO')
            if (trade_cost <= 0){// no trades required.
                return 1;
            } if (trade_avail >= trade_cost){
                return 0;
            } else {
                return -1;
            }
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
                    this.createBuildingBreadcrumb();
                    this.showHideBuildingOffsetButtons();
                } else {
                    dojo.removeClass('btn_choose_building', 'disabled');
                    if (BUILDING_INFO[b_id].cost == null) {
                        $('bld_name').innerText = _(BUILDING_INFO[b_id].name);  
                    } else {
                        $('bld_name').innerText = _(BUILDING_INFO[b_id].name);
                        this.createBuildingBreadcrumb();
                        this.showHideBuildingOffsetButtons();
                    }
                }
            }
        },

        chooseBuilding: function () {
            //console.log('chooseBuilding');
            if (this.checkAction( 'buildBuilding')){
                const building_divId = LAST_SELECTED['building'];
                if (building_divId == "") {
                    this.showMessage( _("You must select a building"), 'error' );
                    return;
                }
                //console.log('building_discount', GLOBAL.building_discount);
                if (GLOBAL.building_discount){
                    this.chooseBuildingWithDiscount();
                } else {
                    const building_key = Number(building_divId.split("_")[2]);
                    let args = {building_key: building_key, goldAsCow:GLOBAL.goldAsCow?1:0, goldAsCopper:GLOBAL.goldAsCopper?1:0, steelReplace:(GLOBAL.cost_replace.steel??0), lock: true};
                    //console.log(args);
                    if (TRANSACTION_LOG.length >0){ // makeTrades first.
                        //console.log('trades', TRANSACTION_LOG.join(','));
                        this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                            lock: true, 
                            trade_action: TRANSACTION_LOG.join(',')
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
            if (!GLOBAL.building_discount){
                console.error("chooseBuildingWithDiscount called incorrectly");
                return true;
            }
            let building_cost = this.getBuildingCost();
            //console.log('building_cost', building_cost);
            if (Object.keys(building_cost).length == 0){
                return false;// use normal build.
            }
            if (Object.keys(building_cost).length == 1){
                const building_key = Number(LAST_SELECTED.building.split("_")[2]);
                let args = {building_key: building_key, 
                            goldAsCow:GLOBAL.goldAsCow?1:0, 
                            goldAsCopper:GLOBAL.goldAsCopper?1:0, 
                            steelReplace:(GLOBAL.cost_replace.steel??0), 
                            discount:RESOURCES[Object.keys(building_cost)[0]], 
                            lock: true};
                if (TRANSACTION_LOG.length >0){ // makeTrades first.
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, trade_action: TRANSACTION_LOG.join(',')
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
                LAST_SELECTED.building_discount ="";
                for(let type in building_cost){
                    this.addActionButton( `btn_resource_${type}`, TOKEN_HTML[type], 'selectBuildingDiscountResource', null, false, 'gray');
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

            if (LAST_SELECTED.building_discount ==''){ //nothing was selected
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
                LAST_SELECTED.building_discount = type;
                dojo.place(TOKEN_HTML[type], 'build_discount_icon');
            } else if (LAST_SELECTED.building_discount == option_id) { //this was selected
                dojo.removeClass(btn_id, 'bgabutton_blue');
                dojo.addClass(btn_id, 'bgabutton_gray');
                dojo.place(TOKEN_HTML[type], 'build_discount_icon');
                LAST_SELECTED.building_discount = '';
            } else { //other thing was selected.
                let lastSelected_id =  `btn_resource_${LAST_SELECTED.building_discount}`;
                dojo.removeClass(lastSelected_id, 'bgabutton_blue');
                dojo.addClass(lastSelected_id, 'bgabutton_gray');
                dojo.addClass(btn_id, 'bgabutton_blue');
                dojo.removeClass(btn_id, 'bgabutton_gray');
                LAST_SELECTED.building_discount = type;
            }        
        },

        doneSelectingBuildingDiscount: function( evt ){
            if (LAST_SELECTED.building_discount === ''){
                console.error("doneSelectingBuildingDiscount");
            }
            const building_key = Number(LAST_SELECTED.building.split("_")[2]);
            let args = {building_key: building_key, 
                        goldAsCow:GLOBAL.goldAsCow?1:0, 
                        goldAsCopper:GLOBAL.goldAsCopper?1:0, 
                        steelReplace:(GLOBAL.cost_replace.steel??0), 
                        discount:RESOURCES[LAST_SELECTED.building_discount], 
                        lock: true};
            if (TRANSACTION_LOG.length >0){ // makeTrades first.
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                    lock: true, 
                    trade_action: TRANSACTION_LOG.join(',')
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
                LAST_SELECTED.building_discount="";
                GLOBAL.building_discount = false;
                this.changeStateCleanup();
                this.updateAffordability(`#${TPL_BLD_TILE}_${args.building_key}`, 0);
             }, function( is_error) { } );
        },

        toggleGoldAsCopper: function(){
            if (GLOBAL.goldAsCopper){
                GLOBAL.goldAsCopper = false;
                dojo.removeClass(GOLD_COPPER_BUTTON_ID, 'bgabutton_blue');
                dojo.addClass(GOLD_COPPER_BUTTON_ID, 'bgabutton_red');
                dojo.addClass('copper_as', 'no');
            } else {
                GLOBAL.goldAsCopper = true;
                dojo.removeClass(GOLD_COPPER_BUTTON_ID, 'bgabutton_red');
                dojo.addClass(GOLD_COPPER_BUTTON_ID, 'bgabutton_blue');
                dojo.removeClass('copper_as', 'no');
            }
            if (LAST_SELECTED.building != ""){
                this.createBuildingBreadcrumb();
            }
        },

        toggleGoldAsCow: function() { 
            if (GLOBAL.goldAsCow) {
                GLOBAL.goldAsCow = false;
                dojo.removeClass(GOLD_COW_BUTTON_ID, 'bgabutton_blue');
                dojo.addClass(GOLD_COW_BUTTON_ID, 'bgabutton_red');
                dojo.addClass('cow_as', 'no');
            } else {
                GLOBAL.goldAsCow = true;
                dojo.removeClass(GOLD_COW_BUTTON_ID, 'bgabutton_red');
                dojo.addClass(GOLD_COW_BUTTON_ID, 'bgabutton_blue');
                dojo.removeClass('cow_as', 'no');
            }
            if (LAST_SELECTED.building != ""){
                this.createBuildingBreadcrumb();
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

        getPlayerWorkerCount:function(p_id){
            const playerZone = `player_zone_${PLAYER_COLOR[p_id]}`;
            const workerSelector = TYPE_SELECTOR['worker'];
            return dojo.query(`#${playerZone} ${workerSelector}`).length;
        },
    
        getPlayerTrackCount:function(p_id){
            const playerZone = `player_zone_${PLAYER_COLOR[p_id]}`;
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
                if (TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
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
                if (TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/silver2forTrackEvent.html", {lock: true}, this, 
                        function( result) {this.changeStateCleanup();}, function( is_error) { } );
                     }, function( is_error) {});   
                } else{
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/silver2forTrackEvent.html", {lock: true}, this, 
                    function( result) {this.changeStateCleanup();}, function( is_error) { } );
                }
            }
        },

        steelBuildBuilding: function() {
            if (this.checkAction( 'eventLotBonus' )){
                if (TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/steelBuildBuilding.html", {lock: true}, this, 
                            function( result) {this.changeStateCleanup();}, function( is_error) { } );
                     }, function( is_error) {});   
                } else{
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/steelBuildBuilding.html", {lock: true}, this, 
                    function( result) {this.changeStateCleanup();}, function( is_error) { } );
                }
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

        donePassEvent: function(){
            if (this.checkAction( 'payLoanEvent' )){
                if (TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
                     }, this, function( result ) {
                        this.clearTransactionLog();
                        this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/donePassEvent.html", {lock: true}, this, 
                            function( result) {this.changeStateCleanup();}, function( is_error) { } );
                     }, function( is_error) {});   
                } else {
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/donePassEvent.html", {lock: true}, this, 
                    function( result) {this.changeStateCleanup();}, function( is_error) { } );
                }
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
            
            this.trade.addTransaction(PAY_LOAN_SILVER);
        },

        payLoanGold: function () {
            if (!this.checkAction( 'payLoan' )){return;}
            this.trade.addTransaction(PAY_LOAN_GOLD);
        },

        cancelUndoTransactions: function () {
            this.undoTransactionsButton();
            if (this.checkAction( 'done' )){
                this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/undoTransactions.html", {lock: true}, this, 
                function( result ) {
                this.resetTradeValues();
                this.trade.disableTradeIfPossible();
                if (this.currentState == 'allocateWorkers'){
                    this.setOffsetForIncome();
                 }
                }, function( is_error) { } );
            }
        },

        doneEndgameActions: function () {
            if (this.checkAction( 'done' )){
                if(TRANSACTION_LOG.length >0){
                    this.ajaxcall( "/" + this.game_name + "/" + this.game_name + "/trade.html", { 
                        lock: true, 
                        trade_action: TRANSACTION_LOG.join(',')
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
                this, function( result ) {this.changeStateCleanup()}, function( is_error) { } );
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
                ['updateWarehouseState', 20],
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
                    
                    if (!GLOBAL.isSpectator)
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
                        args.track = TOKEN_HTML.track;
                    }
                    if (args.loan && typeof args.loan == 'string'){
                        args.loan = TOKEN_HTML.loan;
                    }
                    if (args.worker && typeof args.worker == 'string'){
                        args.worker = this.getOneResourceHtml('worker', 1, false);
                    }
                    // handles player_tokens
                    if (args.token && typeof (args.null != "string")){
                        if (args.token.color) {
                            var color = args.token.color;
                        } else {
                            var color = PLAYER_COLOR[args.token.player_id];
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
                        let color = ASSET_COLORS[Number(GLOBAL.current_auction)+10];
                        args.auction = this.format_block('jstpl_color_number_log', {color:color, string:_("AUCTION "), number:GLOBAL.current_auction});
                    }
                    // end -> add font only args

                    // handles Building & Auctions, player_tokens, worker, or track
                    if (args.reason_string && typeof (args.reason_string) != "string"){
                        if (args.reason_string.type){ //Building & Auctions
                            let color = ASSET_COLORS[Number(args.reason_string.type)];
                            args.reason_string = this.format_block('jstpl_color_log', {string:args.reason_string.str, color:color});
                        } else if (args.reason_string.token) { // player_tokens (bid/train)
                            const color = PLAYER_COLOR[args.reason_string.player_id];
                            args.reason_string = this.format_block('jstpl_player_token_log', {"color" : color, "type" : args.reason_string.token});
                        } else if (args.reason_string.worker) { // worker token
                            args.reason_string = this.getOneResourceHtml('worker', 1, false);
                        } else if (args.reason_string.track) { // track 
                            args.reason_string = TOKEN_HTML.track;
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
                var tokenDiv = TOKEN_HTML[type];
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
                        var tokenDiv = TOKEN_HTML["bld_"+type_no];
                    } else {
                        var tokenDiv = TOKEN_HTML[type_no];
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
                    var tokenDiv = TOKEN_HTML[type];
                    for(let i=0; i < Math.abs(amt); i++){
                        aggregateString += `${tokenDiv}`;
                    }
                }
            }
            return aggregateString + `</${html_type}>`;
        },

        notif_updateBuildingStocks: function ( notif ){
            this.updateBuildingStocks(notif.args.buildings);
            this.showHideButtons();
        },

        notif_workerMoved: function( notif ){
            //console.log('notif_workerMoved');
            const worker_divId = 'token_worker_'+Number(notif.args.worker_key);
            if (this.player_id == notif.args.player_id){
                this.moveObjectAndUpdateValues(worker_divId, BUILDING_WORKER_IDS[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            } else {
                this.moveObject(worker_divId, BUILDING_WORKER_IDS[Number(notif.args.building_key)][Number(notif.args.building_slot)]);
            }
        },

        notif_railAdv: function( notif ){
            //console.log('notif_railAdv');
            const train_token = TRAIN_TOKEN_ID[notif.args.player_id];
            this.moveObject(train_token, `train_advancement_${notif.args.rail_destination}`);
        }, 

        notif_gainWorker: function( notif ){
            //console.log('notif_gainWorker');
            const worker_divId = `token_worker_${notif.args.worker_key}`;
            dojo.place(this.format_block( 'jptpl_worker', {id: notif.args.worker_key}), WORKER_TOKEN_ZONE[notif.args.player_id] );
            if (notif.args.player_id == this.player_id){
                dojo.connect($(worker_divId),'onclick', this, 'onClickOnWorker');
                if (this.currentState == "allocateWorkers"){
                    dojo.addClass(worker_divId, 'selectable');
                    this.resetTradeValues();
                    this.setOffsetForIncome();
                }                
            }
            this.tooltip.calculateAndUpdateScore(notif.args.player_id);
        },

        notif_workerPaid: function( notif ){
            GLOBAL.showPay = false;
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
                    {id: Number(notif.args.track_key), color: PLAYER_COLOR[Number(notif.args.player_id)]}),
                    TRACK_TOKEN_ZONE[p_id]);
                    this.addTooltipHtml(`token_track_${notif.args.track_key}`, `<div style="text-align:center;">${this.tooltip.replaceTooltipStrings(RESOURCE_INFO['track']['tt'])}</div>`);
            if (notif.args.tradeAway_arr){
                var destination = this.getTargetFromNotifArgs(notif);
                for(let type in notif.args.tradeAway_arr){
                    for(let i = 0; i < notif.args.tradeAway_arr[type]; i++){
                        this.slideTemporaryObject( TOKEN_HTML[type], 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 100*i );
                        if (p_id == this.player_id || GLOBAL.show_player_info){
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
            if (p_id != GLOBAL.first_player){
                this.moveObject(tile_id, PLAYER_SCORE_ZONE_ID[p_id]);
                GLOBAL.first_player = p_id;
            }
        },

        notif_clearAllBids: function( notif ){
            for (let i in PLAYER_COLOR){
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
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], destination , 500 , 100*(delay++) );
                    if (p_id == this.player_id || GLOBAL.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            if (p_id == this.player_id){
                this.hideResources();
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_playerIncome: function( notif ){
            //console.log('notif_playerIncome');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            for(let i = 0; i < notif.args.amount; i++){
            this.slideTemporaryObject( TOKEN_HTML[String(notif.args.typeStr)], 'limbo', start , PLAYER_SCORE_ZONE_ID[p_id] , 500 , 100*i );
            if (p_id == this.player_id || GLOBAL.show_player_info){
                    if (VP_TOKENS.includes(notif.args.typeStr)){
                        this.incResCounter(p_id, 'vp',Number(notif.args.typeStr.charAt(2)));
                    } else{ // normal case
                        this.incResCounter(p_id, notif.args.typeStr, 1);
                    }
                }
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_playerIncomeGroup: function( notif ){
            //console.log('notif_playerIncomeGroup');
            var start = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', start , PLAYER_SCORE_ZONE_ID[p_id] , 500 , 100*(delay++) );
                    if (p_id == this.player_id || GLOBAL.show_player_info){
                        if (VP_TOKENS.includes(notif.args.typeStr)){
                            this.incResCounter(p_id, 'vp', Number(notif.args.typeStr.charAt(2)));    
                        } else{ // normal case
                            this.incResCounter(p_id, type, 1);
                        }
                    }
                }   
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_updateWarehouseState: function (notif){
            //console.log('notif_updateWarehouseState', notif.args);
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
                this.slideTemporaryObject( TOKEN_HTML[notif.args.typeStr], 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 100*i );
                if (p_id == this.player_id || GLOBAL.show_player_info){
                    this.incResCounter(p_id, notif.args.typeStr, -1);
                }
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_playerPaymentGroup: function( notif ){
            //console.log('notif_playerPaymentGroup');
            var destination = this.getTargetFromNotifArgs(notif);
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.resource_arr){
                let amt = notif.args.resource_arr[type];
                    for(let i = 0; i < amt; i++){
                        this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], destination , 500 , 100*(delay++) );
                        if (p_id == this.player_id || GLOBAL.show_player_info){
                            this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_trade: function( notif ){
            //console.log('notif_trade');
            const p_id = notif.args.player_id;
            var delay = 0;
            for(let type in notif.args.tradeAway_arr){
                let amt = notif.args.tradeAway_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', PLAYER_SCORE_ZONE_ID[p_id], TRADE_BOARD_ID , 500 , 100*(delay++) );
                    if (p_id == this.player_id || GLOBAL.show_player_info){
                        this.incResCounter(p_id, type, -1);
                    }
                }   
            }
            for(let type in notif.args.tradeFor_arr){
                let amt = notif.args.tradeFor_arr[type];
                for(let i = 0; i < amt; i++){
                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', TRADE_BOARD_ID, PLAYER_SCORE_ZONE_ID[p_id], 500 , 100*(delay++) );
                }   
                if (p_id == this.player_id || GLOBAL.show_player_info){
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
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_loanPaid: function( notif ){
            //console.log('notif_loanPaid');
            const p_id = notif.args.player_id;
            var destination = this.getTargetFromNotifArgs(notif);
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , PLAYER_SCORE_ZONE_ID[p_id], destination,  500 , 0 );
            if (p_id == this.player_id || GLOBAL.show_player_info){
                this.incResCounter(p_id, 'loan', -1);
            }
            if (notif.args.type ){
                for (let i = 0; i < notif.args.amount; i++){
                    this.slideTemporaryObject( notif.args.type , 'limbo', PLAYER_SCORE_ZONE_ID[p_id], 'board', 500, 100 +(i*100));
                }
                if (p_id == this.player_id || GLOBAL.show_player_info){
                    this.incResCounter(p_id, notif.args.typeStr, -1*(notif.args.amount));
                }
            }
            if (p_id == this.player_id){
                this.resetTradeValues();
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_loanTaken: function( notif ){
            //console.log('notif_loanTaken');
            const p_id = notif.args.player_id;
            this.slideTemporaryObject( `<div class="loan token_loan"></div>`, 'limbo' , 'board', PLAYER_SCORE_ZONE_ID[p_id],  500 , 0 );
            this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', 'board', PLAYER_SCORE_ZONE_ID[p_id], 500 , 100);
            this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', 'board', PLAYER_SCORE_ZONE_ID[p_id], 500 , 200);
            if (p_id == this.player_id || GLOBAL.show_player_info){
                this.incResCounter(p_id, 'loan', 1);
                this.incResCounter(p_id, 'silver', 2);
            }
            this.tooltip.calculateAndUpdateScore(p_id);
        },

        notif_score: function( notif ){
            
        },

        notif_showResources: function( notif ){
            //console.log('notif_showResources', notif);
            if (GLOBAL.show_player_info) return;// already showing player resources.
            GLOBAL.show_player_info = true;
            for(let p_id in notif.args.resources){
                if (GLOBAL.isSpectator || (this.player_id != p_id)){
                    dojo.place( this.format_block('jstpl_player_board', {id: p_id} ), PLAYER_SCORE_ZONE_ID[p_id] );
                    dojo.query(`#player_resources_${PLAYER_COLOR[p_id]} .player_resource_group`).removeClass('noshow');
                    this.setupOnePlayerResources(notif.args.resources[p_id]);
                }
                this.tooltip.calculateAndUpdateScore(p_id);
            }
        },

        notif_cancel: function( notif ){
            //console.log('notif_cancel', notif);
            const p_id = notif.args.player_id;
            const updateResource = (p_id == this.player_id) || GLOBAL.show_player_info;
            const player_zone = PLAYER_SCORE_ZONE_ID[p_id];
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
                                    this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', player_zone, 'board' , 500 , 50*(delay++) );
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
                        this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', player_zone, 'board', 500 , 50 *(delay++));
                        this.slideTemporaryObject( TOKEN_HTML.silver, 'limbo', player_zone, 'board', 500 , 50 *(delay++));
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
                                this.slideTemporaryObject( TOKEN_HTML[log.type], 'limbo', player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'railAdv':
                        const train_token = TRAIN_TOKEN_ID[p_id];
                        const parent_no = $(train_token).parentNode.id.split("_")[2];
                        this.moveObject(train_token, `train_advancement_${(parent_no-1)}`);
                    break;
                    case 'trade':
                        for(let type in log.tradeAway_arr){
                            let amt = log.tradeAway_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', player_zone, TRADE_BOARD_ID , 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, 1);
                                }
                            }   
                        }
                        for(let type in log.tradeFor_arr){
                            let amt = log.tradeFor_arr[type];
                            for(let j = 0; j < amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[type], 'limbo', TRADE_BOARD_ID, player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, type, -1);
                                }
                            }   
                        }
                    break;
                    case 'updateResource':
                        if (log.amt < 0){
                            for(let j = 0; j < Math.abs(log.amt); j++){
                                this.slideTemporaryObject( TOKEN_HTML[log.type], 'limbo' , player_zone, 'board', 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, -1);
                                }
                            }
                        } else {
                            for(let j = 0; j < log.amt; j++){
                                this.slideTemporaryObject( TOKEN_HTML[log.type], 'limbo', 'board', player_zone, 500 , 50*(delay++) );
                                if (updateResource){
                                    this.incResCounter(p_id, log.type, 1);
                                }
                            }
                        }
                    break;
                    case 'buildingState':
                        let oldState = this.getWarehouseResources();
                        //console.log('oldState', oldState);
                        if (log.b_id == BLD_WAREHOUSE){ //currently only building using state
                            this.updateWarehouseState(log.state);
                        }
                        if (dojo.query('#choose_warehouse_buttons').length >0){    
                            let newState = this.getWarehouseResources();
                            //console.log('newState', newState);
                            for(let type in newState){
                                //console.log('checking', type);
                                if (!(type in oldState)){
                                    //console.log('found missing', type);
                                    this.addActionButton( `btn_warehouse_${type}`, TOKEN_HTML[type], `onClickWarehouseResource`, null, false, 'gray');
                                    dojo.place(`btn_warehouse_${type}`,'choose_warehouse_buttons', 'last');
                                    this.onClickWarehouseResource( {target:{id:`btn_warehouse_${type}`}});
                                }
                            }
                        }
                    break;
                    case 'passBid':
                        this.moveBid(p_id, log.last_bid);
                    break;
                }
            }

            this.resetTradeValues();
            this.cancelNotifications(notif.args.move_ids);
            this.clearTransactionLog();
            this.tooltip.calculateAndUpdateScore(p_id);
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

        fillArray: function (targetArray, fromArray){
            for (let i in fromArray){
                targetArray[i]=fromArray[i];
            }
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
