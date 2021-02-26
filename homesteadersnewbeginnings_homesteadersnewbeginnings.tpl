{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- homesteadersnewbeginningstb implementation : © Nick Patron <nick.theboot@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

-->
<div class="anchor">
    <div id="breadcrumbs" class="breadcrumbs wlimit"><span id="breadcrumb_transactions"></span></div>
</div>

<div id="main_container" class="container">
    <div id="currentPlayer" class="noshow"></div>
    <!-- BEGIN this_player_zone -->
    <div id="player_zone_{COLOR}" class="whiteblock border_{COLOR} current_player" style="margin-top:4px;">
    <div class="break" style="order:3;"></div>
        <div id="player_resources_{COLOR}" class="this_player_resources">
            <span id="player_name_{COLOR}" class="boardheader biggerFont" style="color: {COLOR};">{NAME}</span>
            <span id="silver_group" class="this_player_resource_group"><!-- horiz -->
                <span id="silvericon_{COLOR}" class="score_token player_silver score"></span>
                <span id="silver_num" class="player_numbers vert"><!-- vertical -->
                    <span id="silvercount_{COLOR}" class="player_silver_text player_text">0</span>
                    <span id="silver_offsets" class="vert"><!-- vertical -->
                        <span class="signed silver pos horiz">+<span id="silver_pos">0</span></span>
                        <span class="signed silver neg horiz">-<span id="silver_neg">0</span></span>
                    </span>
                    <span id="silver_new" class="player_silver_new new_text noshow">0</span>
                </span>
            </span>
            <span id="trade_group" class="this_player_resource_group">
                <span id="tradeicon_{COLOR}"  class="score_token player_trade score"></span>
                <span id="trade_num" class="player_numbers vert"><!-- vertical -->
                    <span id="tradecount_{COLOR}" class="player_trade_text player_text">0</span>
                    <span id="trade_offsets" class="vert"><!-- vertical -->
                        <span class="signed trade pos horiz">+<span id="trade_pos">0</span></span>
                        <span class="signed trade neg horiz">-<span id="trade_neg">0</span></span>
                    </span>
                    <span id="trade_new" class="player_trade_new new_text noshow">0</span>
                </span>
            </span>
            <span id="loan_group" class="this_player_resource_group">
                <span id="loanicon_{COLOR}"   class="player_loan score"></span>
                <span id="loan_num" class="player_numbers vert"><!-- vertical -->
                    <span id="loancount_{COLOR}" class="player_loan_text player_text">0</span>
                    <span id="loan_offsets" class="vert"><!-- vertical -->
                        <span class="signed loan pos horiz">+<span id="loan_pos">0</span></span>
                        <span class="signed loan neg horiz">-<span id="loan_neg">0</span></span>
                    </span>
                    <span id="loan_new" class="player_loan_new new_text noshow">0</span>
                </span>
            </span>
            <span id="vp_group" class="this_player_resource_group">
                <span id="vpicon_{COLOR}"   class="score_token player_vp score"></span>
                <span id="vp_num" class="player_numbers vert"><!-- vertical -->
                    <span id="vpcount_{COLOR}" class="player_vp_text player_text">0</span>
                    <span id="vp_offsets" class="vert"><!-- vertical -->
                        <span class="signed vp pos horiz">+<span id="vp_pos">0</span></span>
                        <span class="signed vp neg horiz">-<span id="vp_neg">0</span></span>
                    </span>
                    <span id="vp_new" class="player_vp_new new_text noshow">0</span>
                </span>
            </span>
            <span id="wood_group" class="this_player_resource_group">
                <span id="woodicon_{COLOR}"   class="score_token player_wood score"></span>
                <span id="wood_num" class="player_numbers vert"><!-- vertical -->
                    <span id="woodcount_{COLOR}" class="player_wood_text player_text">0</span>
                    <span id="wood_offsets" class="vert"><!-- vertical -->
                        <span class="signed wood pos horiz">+<span id="wood_pos">0</span></span>
                        <span class="signed wood neg horiz">-<span id="wood_neg">0</span></span>
                    </span>
                    <span id="wood_new" class="player_wood_new new_text noshow">0</span>
                </span>
            </span>
            <span id="food_group" class="this_player_resource_group">
                <span id="foodicon_{COLOR}"   class="score_token player_food score"></span>
                <span id="food_num" class="player_numbers vert"><!-- vertical -->
                    <span id="foodcount_{COLOR}" class="player_food_text player_text">0</span>
                    <span id="food_offsets" class="vert"><!-- vertical -->
                        <span class="signed food pos horiz">+<span id="food_pos">0</span></span>
                        <span class="signed food neg horiz">-<span id="food_neg">0</span></span>
                    </span>
                    <span id="food_new" class="player_food_new new_text noshow">0</span>
                </span>
            </span>
            <span id="steel_group" class="this_player_resource_group">
                <span id="steelicon_{COLOR}"  class="score_token player_steel score"></span>
                <span id="steel_num" class="player_numbers vert"><!-- vertical -->
                    <span id="steelcount_{COLOR}" class="player_steel_text player_text">0</span>
                    <span id="steel_offsets" class="vert"><!-- vertical -->
                        <span class="signed steel pos horiz">+<span id="steel_pos">0</span></span>
                        <span class="signed steel neg horiz">-<span id="steel_neg">0</span></span>
                    </span>
                    <span id="steel_new" class="player_steel_new new_text noshow">0</span>
                </span>
            </span>
            <span id="gold_group" class="this_player_resource_group">
                <span id="goldicon_{COLOR}"   class="score_token player_gold score"></span>
                <span id="gold_num" class="player_numbers vert"><!-- vertical -->
                    <span id="goldcount_{COLOR}" class="player_gold_text player_text">0</span>
                    <span id="gold_offsets" class="vert"><!-- vertical -->
                        <span class="signed gold pos horiz">+<span id="gold_pos">0</span></span>
                        <span class="signed gold neg horiz">-<span id="gold_neg">0</span></span>
                    </span>
                    <span id="gold_new" class="player_gold_new new_text noshow">0</span>
                </span>
            </span>
            <span id="cow_group" class="this_player_resource_group">
                <span id="cowicon_{COLOR}"    class="score_token player_cow score"></span>
                <span id="cow_num" class="player_numbers vert"><!-- vertical -->
                    <span id="cowcount_{COLOR}" class="player_cow_text player_text">0</span>
                    <span id="cow_offsets" class="vert"><!-- vertical -->
                        <span class="signed cow pos horiz">+<span id="cow_pos">0</span></span>
                        <span class="signed cow neg horiz">-<span id="cow_neg">0</span></span>
                    </span>
                    <span id="cow_new" class="player_cow_new new_text noshow">0</span>
                </span>
            </span>
            <span id="copper_group" class="this_player_resource_group">
                <span id="coppericon_{COLOR}" class="score_token player_copper score"></span>
                <span id="copper_num" class="player_numbers vert"><!-- vertical -->
                    <span id="coppercount_{COLOR}" class="player_copper_text player_text">0</span>
                    <span id="copper_offsets" class="vert"><!-- vertical -->
                        <span class="signed copper pos horiz">+<span id="copper_pos">0</span></span>
                        <span class="signed copper neg horiz">-<span id="copper_neg">0</span></span>
                    </span>
                    <span id="copper_new" class="player_copper_new new_text noshow">0</span>
                </span>
            </span>
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
            
        </div>
        <div id="building_zone_{COLOR}" class="building_zone"> </div>
    </div>
    <!-- END this_player_zone -->
    <div id ="top"> <!-- Round # and toggle show buttons area -->
        <span id="top_texts">
            <span id="round_text" class="font caps">{ROUND_STRING}<span id="round_number" class="biggerFont">{ROUND_NUMBER}  </span>  </span>
            <div id='useSilver_form'> 
                <tr>
                    <input type="checkbox" id="checkbox1"/>
                    <label for="checkbox1" name="checkbox1_lbl" class="font bold">
                        {PAY} <span aria="worker" title="worker" class="log_worker token_inline"></span>
                        {WITH} <span aria="silver" title="silver" class="log_silver token_inline"></span>
                    </label>
                </tr>
            </div>         
        </span>
        <a href="#" id="undo_last_trade_btn" class="bgabutton bgabutton_red noshow"><span id='undoLastTrade' class="font">{UNDO_LAST_TRADE}</span></a>
        <a href="#" id="undo_trades_btn" class="bgabutton bgabutton_red noshow"><span id='undoTrade' class="font">{UNDO_TRADE}</span></a>
        <a href="#" id="tgl_future_auc" class="bgabutton bgabutton_gray">
            <span id='auc_future' class="font">{SHOW} </span><span class="font"> {FUTURE_AUCTION}</span>
        </a>
        <a href="#" id="tgl_main_bld" class="bgabutton bgabutton_gray">
            <span id="bld_main" class="font">{HIDE} </span><span class="font"> {MAIN_BUILDING}</span>
        </a>
        <a href="#" id="tgl_past_bld" class="bgabutton bgabutton_gray">
            <span id="bld_discard" class="font">{SHOW} </span><span class="font"> {BUILDING_DISCARD}</span>
        </a>
        <a href="#" id="tgl_future_bld" class="bgabutton bgabutton_gray">
            <span id="bld_future" class="font">{SHOW} </span><span class="font"> {FUTURE_BUILDING}</span>
        </a>
        <a href="#" id="confirm_trade_btn" class="bgabutton bgabutton_blue noshow"><span id='confirmTrade' class="font">{CONFIRM_TRADE}</span></a>
    </div>

    <div id="board_area" class="full_size">
        <div id="trade_top" class="noshow"></div>
        <div id="trade_board" style="order:2;">
            <!-- BEGIN trade_option -->
            <div id="trade_{OPTION}" class="trade_option"> </div>
            <!-- END trade_option -->
        </div>
        <!-- Auction Board -->
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
    </div>
    <div id="main_building_container" class="whiteblock building_container border_black">
        <span class="biggerFont">{BUILDING_STOCK}</span>
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
            <span id="silver_group_{COLOR}" class="player_resource_group">
                <span id="silvericon_{COLOR}" class="score_token player_silver score"></span>
                <span id="silvercount_{COLOR}" class="player_silver_text player_text">0</span>
            </span>
                <span id="trade_group_{COLOR}" class="player_resource_group">
                <span id="tradeicon_{COLOR}"  class="score_token player_trade score"></span>
            <span id="tradecount_{COLOR}" class="player_trade_text player_text">0</span>
            </span>
                <span id="loan_group_{COLOR}" class="player_resource_group">
                <span id="loanicon_{COLOR}"   class="player_loan score"></span>
            <span id="loancount_{COLOR}" class="player_loan_text player_text">0</span>
            </span>
                <span id="vp_group_{COLOR}" class="player_resource_group">
                <span id="vpicon_{COLOR}"   class="score_token player_vp score"></span>
            <span id="vpcount_{COLOR}"  class="player_vp_text player_text">0</span>
            </span>
                <span id="wood_group_{COLOR}" class="player_resource_group">
                <span id="woodicon_{COLOR}"   class="score_token player_wood score"></span>
            <span id="woodcount_{COLOR}" class="player_wood_text player_text">0</span>
            </span>
            <span id="food_group_{COLOR}" class="player_resource_group">
                <span id="foodicon_{COLOR}"   class="score_token player_food score"></span>
                <span id="foodcount_{COLOR}" class="player_food_text player_text">0</span>
            </span>
            <span id="steel_group_{COLOR}" class="player_resource_group">
                <span id="steelicon_{COLOR}"  class="score_token player_steel score"></span>
                <span id="steelcount_{COLOR}" class="player_steel_text player_text">0</span>
            </span>
            <span id="gold_group_{COLOR}" class="player_resource_group">
                <span id="goldicon_{COLOR}"   class="score_token player_gold score"></span>
                <span id="goldcount_{COLOR}" class="player_gold_text player_text">0</span>
            </span>
            <span id="cow_group_{COLOR}" class="player_resource_group">
                <span id="cowicon_{COLOR}"    class="score_token player_cow score"></span>
                <span id="cowcount_{COLOR}" class="player_cow_text player_text">0</span>
            </span>
            <span id="copper_group_{COLOR}" class="player_resource_group">
                <span id="coppericon_{COLOR}" class="score_token player_copper score"></span>
                <span id="coppercount_{COLOR}" class="player_copper_text player_text">0</span>
            </span>
            <div id="worker_zone_{COLOR}" class="worker_zone" style='order:10;'></div> 
        </div>
        <div id="token_zone_{COLOR}" class="player_token_zone">
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
var jstpl_building_slot='<div id="slot_${key}_${slot}" class="worker_slot slot_${id}_${slot} key_${key}"></div>'; 

var jstpl_auction_tile='<div id="auction_tile_${auc}" class="auction_tile border_${color}"> </div>';

var jptpl_worker='<div id="token_worker_${id}" class="token_worker"> </div>';
var jptpl_player_token='<div id="token_${type}_${color}" class="player_token_${color} player_token_${type}"> </div>';
var jptpl_dummy_player_token='<div id="token_${type}_${color}_dummy" class="player_token_${color} player_token_${type}"> </div>';
var jptpl_track='<div id="token_track_${id}" class="token_track border_${color}"> </div>';

var jstpl_player_board = '\<div class="cp_board">\
    <div class="score_group"><div class="score_flex">\
    <div id="silvericon_p${id}" class="score_token score_silver score"></div><span id="silvercount_${id}" class="score_silver_text score_text">0</span>\
    <div id="tradeicon_p${id}"  class="score_token score_trade score"></div><span id="tradecount_${id}" class="score_trade_text score_text">0</span>\
    <div id="woodicon_p${id}"   class="score_token score_wood score"></div><span id="woodcount_${id}" class="score_wood_text score_text">0</span>\
    <div id="foodicon_p${id}"   class="score_token score_food score"></div><span id="foodcount_${id}" class="score_food_text score_text">0</span>\
    <div id="steelicon_p${id}"  class="score_token score_steel score"></div><span id="steelcount_${id}" class="score_steel_text score_text">0</span>\
    </div><div class="score_flex">\
    <div id="vpicon_p${id}"     class="score_token score_vp score"></div><span id="vpcount_${id}" class="score_vp_text score_text">0</span>\
    <div id="loanicon_p${id}"   class="score_loan score score"></div><span id="loancount_${id}" class="score_loan_text score_text">0</span>\
    <div id="goldicon_p${id}"   class="score_token score_gold score"></div><span id="goldcount_${id}" class="score_gold_text score_text">0</span>\
    <div id="cowicon_p${id}"    class="score_token score_cow score"></div><span id="cowcount_${id}" class="score_cow_text score_text">0</span>\
    <div id="coppericon_p${id}" class="score_token score_copper score"></div><span id="coppercount_${id}" class="score_copper_text score_text">0</span>\
</div></div></div>';

var jstpl_pay_button = '<span id="pay_gold" class="font caps" style="display:none">0</span> \
 <span id="pay_gold_tkn" class="log_gold token_inline" style="display:none"></span> \
 <span id="pay_silver" class="font caps">0</span> \
 <span id="pay_silver_tkn" class="log_silver token_inline"></span>';
var jstpl_color_log = '<span title="${string}" class="font caps ${color}">${string}</span>';
var jstpl_color_number_log = '<span class="font ${color}" >${string}</span><span class="biggerFont bold ${color}">${number}</span>';
var jstpl_resource_inline = '<span title = "${type}" class="log_${type} token_inline"></span>';
var jstpl_resource_log = '<span title = "${type}" class="log_${type} log_token"></span>';
var jstpl_player_token_log = '<span title = "${type}_${color}" class="${type}_${color} log_${type}"></span>';
var jptpl_track_log = '<span title="${type}" class="log_inline_${type}"></span>';
var jptpl_x_loan= '<span title="pay dept" class="crossout log_inline_loan"></span>';
var jptpl_buy_sell_board='<div id="buy_board" class="buy_board"></div><div id="sell_board" class="sell_board"></div>';

var jptpl_breadcrumb_trade = '<span id="breadcrumb_${id}" class="breadcrumbs_element font">${text}</span><span id="breadcrumb_${id}_1" class="breadcrumbs_element">${away}<span title ="for" class="log_arrow token_inline" style="position: relative; top: ${off};"></span>${for}</span>'
var jptpl_breadcrumb_payment = '<span id="breadcrumb_payment" class="breadcrumbs_element font">${text}</span><span id="breadcrumb_payment_tokens" class="breadcrumbs_element">${cost}</span>'
var jptpl_breadcrumb_income = '<span id="breadcrumb_income_${id}" class="breadcrumbs_element font" style="${style}">${text}</span><span id="breadcrumb_income_tokens_${id}" class="breadcrumbs_element" style="${style}">${income}</span>'
var jptpl_breadcrumb_building = '<span id="breadcrumb_building" class="breadcrumbs_element font">${text}</span><span id="breadcrumb_bldCost" class="breadcrumbs_element">${cost}</span>'

var jptpl_tt_break = '<div class="tt_break"><span font>${text}</span></div>';
var jptpl_res_tt = '<div class="tt_container" style="text-align:center;">${value}</br>';
var jptpl_bld_tt = '<div class="tt_container"><span class="font bold ${type}" style="text-align:left;">${name}</span>\
    <p class="alignright"><span aria="${vp}" title="${vp}" class="log_${vp} bld_vp token_inline" ></span></p><br>\
    <p class="font caps" style="text-align: left;">${COST} ${cost_vals}</p><hr>\
    <div style="text-align:center;"><span class="font" style="max-width:200px;display:inline-block;">${desc}</span><hr>\
    <span class="income">${INCOME}<br></span>\
    <div class="font">${inc_vals}</div></div></div>';
</script>  

{OVERALL_GAME_FOOTER}
