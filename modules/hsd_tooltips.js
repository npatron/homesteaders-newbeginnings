class Tooltips {

    /**
         * This method will update inputString then return the updated version.
         * 
         * Any patterns of `${val}` will be replaced with a html token of type `val`
         * 
         * @param {String} inputString 
         * @returns {String} updatedString
         */
     replaceTooltipStrings(inputString){
        // required to allow js functions to access file wide globals (in this case `TOKEN_HTML`).
        let _this = TOKEN_HTML;
        try{ // this will detect ${var} and replace it with TOKEN_HTML[var];
            var updatedString = inputString.replaceAll(/\${(.*?)}/g, 
            function(f){ return _this[f.substr(2, f.length -3)];});
            return updatedString;
        } catch (error){
            console.error(error);
            console.log('unable to format tooltip string '+inputString);
            return inputString;
        }
    }

    // auction
    formatTooltipAuction(a_info, a_id){
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
                    build_html[i]= dojo.string.substitute(_(" Build: ${building_type}"), {building_type:TOKEN_HTML[ASSET_COLORS[b_type]]} );
                }
                build += build_html.join(TOKEN_HTML.or);
            }
            tt += build;
        }

        if (a_info[a_id].bonus) {// there is a bonus;
            var bonus_html = "";
            if (a_info[a_id].build){
                bonus_html = TOKEN_HTML.and;
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
    }

    formatTooltipBuilding(b_id, b_key, msg_id = null){
        let b_info = BUILDING_INFO[b_id];
        var vp = 'vp'+ ( b_info.vp == null?'0':(Number(b_info.vp)==1)?'':Number(b_info.vp));

        var msg = (msg_id == null? "": 
            `<div class="tt_flex"><span class="tt tt_top" style="color:${COLOR_MAP[msg_id]};">${_(ASSET_STRINGS[msg_id])}</span></div><hr>`);
        return GLOBAL.this.format_block('jptpl_bld_tt', {
            msg: msg,
            type:  ASSET_COLORS[b_info.type],
            name: _(b_info.name),
            vp:   vp,
            COST: _('cost:'),
            cost_vals: GLOBAL.this.getResourceArrayHtml(b_info.cost, true),
            desc: this.formatBuildingDescription(b_id, b_key),
            INCOME: _('income: '),
            inc_vals: this.formatBuildingIncome(b_id, b_key),
            hr: TOKEN_HTML.dot,
        });
    }

    formatBuildingDescription(b_id, b_key){
        let b_info = BUILDING_INFO[b_id];
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
                    {token:TOKEN_HTML.trade});
                    break;
                case 3: //BUILD_BONUS_WORKER
                    var on_build_desc = dojo.string.substitute(_("When built: Gain ${token}"),
                    {token:TOKEN_HTML.worker});
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
                    on_build_desc += `<div id="${WAREHOUSE_RES_ID}"></div>`;
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
                    var vp_b = dojo.string.substitute(END, {vp:TOKEN_HTML.vp, type:GLOBAL.this.format_block('jstpl_color_log', {string: ASSET_STRINGS[b_info.vp_b], color:ASSET_COLORS[b_info.vp_b]} )} );
                    break;
                case 4: //VP_B_WORKER
                    var vp_b = dojo.string.substitute(END, {vp:TOKEN_HTML.vp, type:TOKEN_HTML.worker} );
                    break;
                case 5: //VP_B_TRACK
                    var vp_b = dojo.string.substitute(END, {vp:TOKEN_HTML.vp, type:GLOBAL.this.getOneResourceHtml('track', 1, true)} );
                    break;
                case 7: //VP_B_WRK_TRK
                    var vp_b = dojo.string.substitute(END, {vp:TOKEN_HTML.vp, type:TOKEN_HTML.worker} ) + '<br>' 
                             + dojo.string.substitute(END, {vp:TOKEN_HTML.vp, type:GLOBAL.this.getOneResourceHtml('track', 1, true)} );
                             break;
                case 8: //VP_B_PAID_LOAN (expansion)
                    var vp_b = dojo.string.substitute(_("End: ${vp} per ${loan} paid off (during endgame actions, loans paid during game are ignored)"), {vp:TOKEN_HTML.vp, loan:TOKEN_HTML.loan} );
                    break;
            }
            full_desc += vp_b +'<br>';
        }
        if ('trade' in b_info){
            switch(b_info.trade){
                case 1: //MARKET
                    full_desc += _("Allows trades:") + dojo.string.substitute("${start}${trade}${wood} ${arrow}${food}${mid}${trade}${food} ${arrow} ${steel}${end}", 
                    {start: `<div id="${b_key}_${MARKET_FOOD_ID}" class="market_food trade_option">`,
                     mid:   `</div><div id="${b_key}_${MARKET_STEEL_ID}" class="market_steel trade_option">`,
                     end:   "</div>",
                     trade: TOKEN_HTML.trade, 
                     wood:  TOKEN_HTML.wood, 
                     arrow: TOKEN_HTML.arrow, 
                     food:  TOKEN_HTML.food,
                     steel: TOKEN_HTML.steel,});
                break;
                case 2: //BANK
                    full_desc += _("Allows trades:") + dojo.string.substitute("${start}${trade} ${arrow} ${silver}${end}", 
                    {start:  `<div id="${BANK_ID}" class="trade_option">`,
                     end:    "</div>",
                     trade:  TOKEN_HTML.trade,
                     arrow:  TOKEN_HTML.arrow, 
                     silver: TOKEN_HTML.silver,});
                break;
            }
        }
        return full_desc;
    }

    formatBuildingIncome(b_id, b_key){
        let b_info = BUILDING_INFO[b_id];
        var income_values = '';
        if (!('inc' in b_info) && !('slot' in b_info)){
            income_values = GLOBAL.format_block('jstpl_color_log', {string:_("none"), color:''});
        }
        if ('inc' in b_info){
            if (b_info.inc.silver =='x'){
                income_values = this.tooltip.replaceTooltipStrings(_('${silver} per ${worker} (max 5)'));
            } else if (b_info.inc.loan == '-1') {
                income_values = dojo.string.substitute(_('Pay off ${loan}'), {loan:TOKEN_HTML.loan}) + '<br>';
            } else {
                income_values = GLOBAL.this.getResourceArrayHtmlBigVp(b_info.inc, true);
            }
        }
        if ('slot' in b_info){
            if (b_info.slot ==1){
                income_values += dojo.string.substitute("${start}${worker} ${inc_arrow} ${income}${end}", 
                {   start:'<div class="w_slot">',
                    end:  '</div>',
                    worker:GLOBAL.this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:1}),
                    inc_arrow:TOKEN_HTML.inc_arrow, 
                    income:GLOBAL.this.getResourceArrayHtmlBigVp(b_info.s1, true)
                });
            }
            if (b_info.slot ==2){
                income_values += dojo.string.substitute("${start}${worker1} ${inc_arrow} ${income1}${mid}${worker2} ${inc_arrow} ${income2}${end}", 
                {   start:'<div class="w_slot">',
                    mid:  '</div><div class="w_slot">',
                    end:  '</div>',
                    worker1:GLOBAL.this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:1}), 
                    worker2:GLOBAL.this.format_block('jstpl_tt_building_slot', {key:b_key, id:b_id, slot:2}),
                    inc_arrow:TOKEN_HTML.inc_arrow, 
                    income1:GLOBAL.this.getResourceArrayHtmlBigVp(b_info.s1, true),
                    income2:GLOBAL.this.getResourceArrayHtmlBigVp(b_info.s2, true),
                });
            }
            if (b_info.slot ==3){
                income_values += dojo.string.substitute("${start}${worker1}${worker2}${mid} ${inc_arrow} ${income}${end}", 
                {   start:`<div class="w_slot"><span id="slot_${b_key}_3" class="worker_slot">`,
                    mid:  '</span>',
                    end:  '</div>',
                    worker1:GLOBAL.this.format_block('jstpl_tt_building_slot_3', {key:b_key, id:b_id, slot:1}),
                    worker2:GLOBAL.this.format_block('jstpl_tt_building_slot_3', {key:b_key, id:b_id, slot:2}),
                    inc_arrow:TOKEN_HTML.inc_arrow, 
                    income:GLOBAL.this.getResourceArrayHtmlBigVp(b_info.s3, true)
                });
            }
        }
        return income_values;
    }
}