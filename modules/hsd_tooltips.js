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
    }
}