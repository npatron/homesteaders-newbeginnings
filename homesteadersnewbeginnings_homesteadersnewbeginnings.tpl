{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteadersnewbeginnings implementation : © Nick Patron <nick.theboot@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

-->
<div class="anchor">
    <div id="breadcrumbs" class="breadcrumbs wlimit"><span id="breadcrumb_transactions"></span></div>
    <div id="eventsBar" class="biggerfont"></div>
</div>

<div id="main_container" class="container">
    <div id="currentPlayer" class="noshow"></div>
    <!-- BEGIN this_player_zone -->
    <div id="player_zone_{COLOR}" class="whiteblock border_{COLOR} current_player" style="margin-top:4px;">
    <div class="break" style="order:3;"></div>
        <div id="player_resources_{COLOR}" class="this_player_resources player_resources">
            <span id="player_name_{COLOR}" class="boardheader biggerFont" style="color: {COLOR};">{NAME}</span>
            <span id="silver_group" class="this_player_resource_group">
                <span id="silverNum_{COLOR}" class="player_numbers">0</span>
                <span id="silvericon_{COLOR}" class="score_token player_silver score" income="0"></span>
            </span>
            <span id="trade_group" class="this_player_resource_group">
                <span id="tradeNum_{COLOR}" class="player_numbers">0</span>
                <span id="tradeicon_{COLOR}" class="score_token player_trade score" income="0"></span>
            </span>
            <span id="vp_group" class="this_player_resource_group">
                <span id="vpNum_{COLOR}" class="player_numbers">0</span>
                <span id="vpicon_{COLOR}" class="score_token player_vp score" income="0"></span>
            </span>
            <span id="loan_group" class="this_player_resource_group">
                <span id="loanNum_{COLOR}" class="player_numbers" >0</span>
                <span id="loanicon_{COLOR}" class="score_token player_loan score" income="0"></span>
            </span>
            <span id="wood_group" class="this_player_resource_group">
                <span id="woodNum_{COLOR}" class="player_numbers">0</span>
                <span id="woodicon_{COLOR}" class="score_token player_wood score" income="0"></span>            
            </span>
            <span id="food_group" class="this_player_resource_group">
                <span id="foodNum_{COLOR}" class="player_numbers">0</span>
                <span id="foodicon_{COLOR}"   class="score_token player_food score" income="0"></span>
            </span>
            <span id="steel_group" class="this_player_resource_group">
                <span id="steelNum_{COLOR}" class="player_numbers">0</span>
                <span id="steelicon_{COLOR}"  class="score_token player_steel score" income="0"></span>
            </span>
            <span id="gold_group" class="this_player_resource_group">
                <span id="goldNum_{COLOR}" class="player_numbers">0</span>
                <span id="goldicon_{COLOR}"   class="score_token player_gold score" income="0"></span>
            </span>
            <span id="cow_group" class="this_player_resource_group">
                <span id="cowNum_{COLOR}" class="player_numbers">0</span>
                <span id="cowicon_{COLOR}"    class="score_token player_cow score" income="0"></span>
            </span>
            <span id="copper_group" class="this_player_resource_group">
                <span id="copperNum_{COLOR}" class="player_numbers">0</span>
                <span id="coppericon_{COLOR}" class="score_token player_copper score" income="0"></span>
            </span>
        </div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="building_zone_{COLOR}" class="building_zone"> </div>
    </div>
    <!-- END this_player_zone -->
    <div id ="top"> <!-- Round # and toggle show buttons area -->
        <span id="top_texts">
            <span id="round_text" class="font caps">{ROUND_STRING}<span id="round_number" class="biggerFont">{ROUND_NUMBER}  </span>  </span>      
        </span>
        <a href="#" id="undo_last_trade_btn" class="bgabutton bgabutton_red noshow"><span id='undoLastTrade' class="font">{UNDO_LAST_TRADE}</span></a>
        <a href="#" id="undo_trades_btn" class="bgabutton bgabutton_red noshow"><span id='undoTrade' class="font">{UNDO_TRADE}</span></a>
        <a href="#" id="tgl_main_bld" class="bgabutton bgabutton_gray">
            <span id="bld_main" class="font">{BUILDING_STOCK_TOGGLE}</span>
        </a>
        <a href="#" id="tgl_events" class="bgabutton bgabutton_gray">
            <span id="evt_main" class="font">{EVENT_STOCK_TOGGLE}</span>
        </a>
        <a href="#" id="tgl_future_auc" class="bgabutton bgabutton_gray">
            <span id='auc_future' class="font">{FUTURE_AUCTION_TOGGLE}</span>
        </a>
        <a href="#" id="tgl_future_bld" class="bgabutton bgabutton_gray">
            <span id="bld_future" class="font">{FUTURE_BUILDING_TOGGLE}</span>
        </a>
        <a href="#" id="tgl_past_bld" class="bgabutton bgabutton_gray">
            <span id="bld_discard" class="font">{BUILDING_DISCARD_TOGGLE}</span>
        </a>
        <a href="#" id="tgl_discard" class="bgabutton bgabutton_gray">
            <span id="gen_discard" class="font">{EVENT_DISCARD_TOGGLE}</span>
        </a>
        
    </div>

    <div id="main_board_area" class="full_size">
        <div id="trade_top" >
            <div id="buy_board" style="order:2;">
                <!-- BEGIN buy_trade_option -->
                <div id="trade_{OPTION}" class="trade_option"> </div>
                <!-- END buy_trade_option -->
            </div>
            <div id="sell_board" style="order:2;"> 
                <!-- BEGIN sell_trade_option -->
                <div id="trade_{OPTION}" class="trade_option"> </div>
                <!-- END sell_trade_option -->
            </div>
        </div>
        
        <!-- Auction Board -->
        <div id="board_area">
            <div id="board" class="shadow" style="order:2;">
                <div id="pending_bids" class="bid_token_zone"> </div>
                <!-- BEGIN bid_slot -->
                <div id="bid_slot_{A}_{B}" class="bid_slot"> </div>
                <!-- END bid_slot -->

                <!-- BEGIN auction_stacks -->
                <div id="auction_tile_zone_{A}" class="auction_tiles_zone"> </div>
                <!-- END auction_stacks -->

                <!-- BEGIN train_advancement -->
                <div id="train_advancement_{I}" class="train_advance"> </div>
                <!-- END train_advancement -->

                <div id="train_bonus_1_trade" class="train_bonus"> </div>
                <div id="train_bonus_2_track" class="train_bonus"> </div>
                <div id="train_bonus_3_worker" class="train_bonus"> </div>
                <div id="train_bonus_4_wood" class="train_bonus"> </div>
                <div id="train_bonus_4_food" class="train_bonus"> </div>
                <div id="train_bonus_4_steel" class="train_bonus"> </div>
                <div id="train_bonus_4_gold" class="train_bonus"> </div>
                <div id="train_bonus_4_copper" class="train_bonus"> </div>
                <div id="train_bonus_4_cow" class="train_bonus"> </div>
                <div id="train_bonus_5_vp" class="train_bonus"> </div>
                <div id="passed_bids" class="bid_token_zone"> </div>
            </div>
            <div id="board_2" class="shadow" style="order:2;"> 
                <!-- BEGIN bid_slot_auc_4 -->
                <div id="bid_slot_4_{B}" class="bid_slot"> </div>
                <!-- END bid_slot_auc_4 -->
                <div id="auction_tile_zone_4" class="auction_tiles_zone"> </div>
            </div>
        </div>
    </div>
    <div id="events_container" class="whiteblock event_container border_black">
        <span class="biggerFont">{EVENTS}</span>
        <div id="events_zone" class="main_event_zone"> </div>
    </div>
    <div id="discard_container" class="whiteblock event_container border_black noshow">
        <span class="biggerFont">{EVENTS_DISCARD}</span>
        <div id="discard_zone" class="main_event_zone"> </div>
    </div>
    <div id="main_building_container" class="whiteblock building_container border_black">
        <span class="biggerFont">{MAIN_BUILDING}</span>
        <div id="main_building_zone" class="main_building_zone"> </div>
    </div>
    <div id='future_auction_container' class='whiteblock border_a1 building_container noshow'>
        <!-- BEGIN future_auction_zones -->
        <span class="auction_column">
            <span class="auction_string biggerFont {COLOR}"> {AUCTION} {A}</span>
            <div id="future_auction_{A}" class="main_building_zone future_auction_zone"> </div>
        </span>
        <!-- END future_auction_zones -->
    </div>
    <div id='past_building_container' class="whiteblock building_container border_white noshow">
        <span class="biggerFont">{BUILDING_DISCARD}</span>
        <div id='past_building_zone' class="main_building_zone"> </div>
    </div>
    <div id='future_building_container' class="whiteblock building_container border_gray noshow">
        <span class="biggerFont">{FUTURE_BUILDING}</span> 
        <div id='future_building_zone' class="main_building_zone"> </div>
    </div>
    <div class="break" style="order:9;"></div>
    <div id ='First' class="noshow"> </div> <div id ='Second' class="noshow"> </div> <div id ='Third' class="noshow"> </div> <div id ='Fourth' class="noshow"> </div>
    <!-- BEGIN player_zone -->
    <div id="player_zone_{COLOR}" class="whiteblock border_{COLOR} player_zone" style="margin-top:4px;">
        <div id="player_resources_{COLOR}" class="player_resources">
            <div id="player_name_{COLOR}" class="boardheader biggerFont" style="color: {COLOR};">{NAME}</div>
            <span id="silver_group" class="player_resource_group">
                <span id="silverNum_{COLOR}" class="player_numbers">0</span>
                <span id="silvericon_{COLOR}" class="score_token player_silver score"></span>
            </span>
            <span id="trade_group" class="player_resource_group">
                <span id="tradeNum_{COLOR}" class="player_numbers">0</span>
                <span id="tradeicon_{COLOR}" class="score_token player_trade score"></span>
            </span>
            <span id="vp_group" class="player_resource_group">
                <span id="vpNum_{COLOR}" class="player_numbers">0</span>
                <span id="vpicon_{COLOR}" class="score_token player_vp score"></span>
            </span>
            <span id="loan_group" class="player_resource_group">
                <span id="loanNum_{COLOR}" class="player_numbers">0</span>
                <span id="loanicon_{COLOR}" class="score_token player_loan score"></span>
            </span>
            <span id="wood_group" class="player_resource_group">
                <span id="woodNum_{COLOR}" class="player_numbers">0</span>
                <span id="woodicon_{COLOR}" class="score_token player_wood score"></span>
            </span>
            <span id="food_group" class="player_resource_group">
                <span id="foodNum_{COLOR}" class="player_numbers">0</span>
                <span id="foodicon_{COLOR}" class="score_token player_food score"></span>
            </span>
            <span id="steel_group" class="player_resource_group">
                <span id="steelNum_{COLOR}" class="player_numbers">0</span>
                <span id="steelicon_{COLOR}" class="score_token player_steel score"></span>
            </span>
            <span id="gold_group" class="player_resource_group">
                <span id="goldNum_{COLOR}" class="player_numbers">0</span>
                <span id="goldicon_{COLOR}" class="score_token player_gold score"></span>
            </span>
            <span id="cow_group" class="player_resource_group">
                <span id="cowNum_{COLOR}" class="player_numbers">0</span>
                <span id="cowicon_{COLOR}" class="score_token player_cow score"></span>
            </span>
            <span id="copper_group" class="player_resource_group">
                <span id="copperNum_{COLOR}" class="player_numbers">0</span>
                <span id="coppericon_{COLOR}" class="score_token player_copper score"></span>
            </span>
        </div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="building_zone_{COLOR}" class="building_zone"> </div>
    </div>
    <!-- END player_zone -->
</div>

<!-- Token limbo -->
<div id="limbo"> 
    <div id='first_player_tile' class='building_tile fp_tile fp_icon'> </div>
</div>
<!-- Player Buildings section -->
<!-- bottom area for non-active sections. -->
<div id ="bottom"> 
    <div id="trade_bottom" class="noshow"></div>
</div>

<script type="text/javascript">

var jstpl_building_stack= '<div id="building_stack_${id}" class="building_zone_diag" style="order: ${order}"></div>';
var jstpl_buildings='<div id="building_tile_${key}" class="building_tile build_tile_${id}"></div>';
var jptpl_bld_text = '<div id="building_tile_${key}" class="building_tile build_tile_${id} building_text">${card}</div>';
var jstpl_building_slot='<div id="slot_${key}_${slot}" class="worker_slot slot_${id}_${slot} key_${key}"></div>'; 
var jstpl_tt_building_slot='<div id="slot_${key}_${slot}" class="worker_slot slot_${id}_${slot} key_${key}"></div>'; 
var jstpl_tt_building_slot_3 = '<div id="slot_${key}_${slot}" class="worker_slot slot_${id}_${slot}"></div>';

var jstpl_auction_tile ='<div id="auction_tile_${auc}" class="auction_tile border_${color}"></div>';
var jptpl_auction_card ='<div id="auction_tile_${auc}" class="auction_tile border_${color} auction_card">${card}</div>';

var jstpl_event_tile='<div id="event_tile_${KEY}" class="event_tile" style="order:${POS}"></div>';

var jptpl_worker='<div id="token_worker_${id}" class="token_worker"> </div>';
var jptpl_player_token='<div id="token_${type}_${color}" class="player_token_${color} player_token_${type}"> </div>';
var jptpl_dummy_player_token='<div id="token_${type}_${color}_dummy" class="player_token_${color} player_token_${type}"> </div>';
var jptpl_track='<div id="token_track_${id}" class="token_track border_${color}"> </div>';

var jstpl_player_board = '\<div class="cp_board">\
    <div class="score_group"><div class="score_flex">\
        <div id="silver_p${id}" class="score_flex_item score_top score_left"><div id="silvericon_p${id}" class="score_token score_silver score"></div><div id="silvercount_${id}" class="score_silver_text score_text">0</div></div>\
        <div id="wood_p${id}" class="score_flex_item score_top"><div id="woodicon_p${id}" class="score_token score_wood score"></div><div id="woodcount_${id}" class="score_wood_text score_text">0</div></div>\
        <div id="food_p${id}" class="score_flex_item score_top"><div id="foodicon_p${id}" class="score_token score_food score"></div><div id="foodcount_${id}" class="score_food_text score_text">0</div></div>\
        <div id="steel_p${id}" class="score_flex_item score_top score_right"><div id="steelicon_p${id}" class="score_token score_steel score"></div><div id="steelcount_${id}" class="score_steel_text score_text">0</div></div>\
        <div id="trade_p${id}" class="score_flex_item score_top"><div id="tradeicon_p${id}" class="score_token score_trade score"></div><div id="tradecount_${id}" class="score_trade_text score_text">0</div></div>\
        <div id="gold_p${id}" class="score_flex_item score_bot"><div id="goldicon_p${id}" class="score_token score_gold score"></div><div id="goldcount_${id}" class="score_gold_text score_text">0</div></div>\
        <div id="cow_p${id}" class="score_flex_item score_bot"><div id="cowicon_p${id}" class="score_token score_cow score"></div><div id="cowcount_${id}" class="score_cow_text score_text">0</div></div>\
        <div id="copper_p${id}" class="score_flex_item score_bot score_right"><div id="coppericon_p${id}" class="score_token score_copper score"></div><div id="coppercount_${id}" class="score_copper_text score_text">0</div></div>\
        <div id="vp_p${id}" class="score_flex_item score_bot score_left"><div id="vpicon_p${id}" class="score_token score_vp score"></div><div id="vpcount_${id}" class="score_vp_text score_text">0</div></div>\
        <div id="loan_p${id}" class="score_flex_item score_bot"><div id="loanicon_p${id}" class="score_loan score score"></div><div id="loancount_${id}" class="score_loan_text score_text">0</div></div>\
    </div></div>\
</div>';

var jstpl_pay_button = '<span id="pay_gold" class="font caps" style="display:none">0</span> \
 <span id="pay_gold_tkn" class="log_gold token_inline" style="display:none"></span> \
 <span id="pay_silver" class="font caps">0</span> \
 <span id="pay_silver_tkn" class="log_silver token_inline"></span>';
var jstpl_color_log = '<span title="${string}" class="font caps ${color}">${string}</span>';
var jstpl_color_number_log = '<span class="font ${color}" >${string}</span><span class="biggerFont bold ${color}">${number}</span>';
var jstpl_resource_inline = '<span title ="${title}" class="log_${type} token_inline"></span>';
var jstpl_resource_log = '<span title ="${type}" class="log_${type} log_token"></span>';
var jstpl_player_token_log = '<span title = "${type}_${color}" class="${type}_${color} log_${type}"></span>';
var jptpl_track_log = '<span title="${type}" class="log_inline_${type}"></span>';
var jptpl_x_loan= '<span title="pay dept" class="crossout log_inline_loan"></span>';
var jptpl_buy_sell_board='<div id="buy_board" class="buy_board"></div><div id="sell_board" class="sell_board"></div>';

var jptpl_breadcrumb_trade = '<span id="breadcrumb_${id}" class="breadcrumbs_element font">${text}</span><span id="breadcrumb_${id}_1" class="breadcrumbs_element"><button id="x_${id}" class="trade_x"></button>${away}<span title ="for" class="log_arrow token_inline" style="position: relative; top: 9px;"></span>${for}</span>'
var jptpl_breadcrumb_payment = '<span id="breadcrumb_payment" class="breadcrumbs_element font">${text}</span><span id="breadcrumb_payment_tokens" class="breadcrumbs_element">${cost}</span>'
var jptpl_breadcrumb_income = '<span id="breadcrumb_income_${id}" class="breadcrumbs_element font" style="${style}">${text}</span><span id="breadcrumb_income_tokens_${id}" class="breadcrumbs_element" style="${style}">${income}</span>'
var jptpl_breadcrumb_building = '<span id="breadcrumb_building" class="breadcrumbs_element font">${text}</span><span id="breadcrumb_bldCost" class="breadcrumbs_element">${cost}</span>'

var jptpl_tt_break = '<div class="tt_${type}"><span font>${text}</span></div>';
var jptpl_res_tt = '<div class="tt_container" style="text-align:center;">${value}</br>';
var jptpl_bld_tt = '${msg}<div class="tt_container building_card"><span class="font bold ${type} tt_left">${name}</span>\
    <p class="alignright"><span aria="${vp}" title="${vp}" class="log_${vp} bld_vp token_inline"></span></p><br>\
    <p class="font caps tt_left">${stage}</p>\
    <p class="font caps tt_left">${COST} ${cost_vals}</p>${hr}\
    <p class="font tt_center">${desc}</p>${hr}\
    <p class="income tt_center">${INCOME}</p>\
    <p class="font tt_center">${inc_vals}</p></div>';
var jptpl_evt_tt = '<div id="event_tile_${KEY}" class="tt_container event_card event_tile" style="order:${POS}">\
    <div class="font bold" style="text-align:center;">${TITLE}</div><hr>\
    <div style="text-align:center;"><span class="font" style="max-width:200px;display:inline-block;margin: 1px 3px 1px 3px">${DESC}</span></div></div></div>';
</script>  

{OVERALL_GAME_FOOTER}
