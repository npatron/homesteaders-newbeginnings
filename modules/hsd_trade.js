class Trade {

    addTransaction (action, type=''){
        var transactions;
        switch(action){
            case BUY:
                transactions = {name:_("Buy"), map:TRADE_MAP[`buy_${type}`],
                        away:this.getBuyAway(type), for:this.getBuyFor(type), change:this.getBuyChange(type)};
            break;
            case SELL:
                transactions = {name:_("Sell"), map:TRADE_MAP[`sell_${type}`],
                        away:this.getSellAway(type), for:this.getSellFor(type), change:this.getSellChange(type)};
            break;
            case MARKET:
                transactions = {name:_("Market"), map:TRADE_MAP[`market_${type}`],
                        away:this.getMarketAway(type), for:this.getMarketFor(type), change:this.getMarketChange(type)};
            break;
            case BANK:
                transactions = {name:_('Bank'), map:TRADE_MAP.bank,
                        away:{'trade':-1}, for:{'silver':1}, change:{'trade':-1,'silver':1}};
            break;
            case TAKE_LOAN:
                transactions = {name:_("Take Dept"), map:TRADE_MAP.loan,
                        away:{'loan':1}, for:{'silver':2}, change:{'silver':2,'loan':1}};
            break;
            case PAY_LOAN_GOLD:
                transactions = {name:_("Pay Dept"), map:TRADE_MAP.payLoan_gold,
                        away:{'gold':-1}, for:{'loan':-1}, change:{'gold':-1,'loan':-1}};
            break;
            case PAY_LOAN_SILVER:
                transactions = {name:_("Pay Dept"), map:TRADE_MAP.payLoan_silver,
                        away:{'silver':-5}, for:{'loan':-1}, change:{'silver':-5,'loan':-1}};
            break;
            case PAY_LOAN_SILVER_3:
                transactions = {name:_("Pay Dept"), map:TRADE_MAP.payLoan_3silver,
                        away:{'silver':-3}, for:{'loan':-1}, change:{'silver':-3,'loan':-1}};
            break;
        }
        if(this.canAddTrade(transactions.change)){
            GLOBAL.this.updateTrade(transactions.change);
            // add breadcrumb
            GLOBAL.this.createTradeBreadcrumb(TRANSACTION_LOG.length, transactions.name, transactions.away, transactions.for, true);

            TRANSACTION_COST.push(transactions.change);
            TRANSACTION_LOG.push(transactions.map);
            GLOBAL.this.updateBuildingAffordability();
            this.updateTradeAffordability();
            GLOBAL.this.setupUndoTransactionsButtons();
            GLOBAL.this.updateConfirmTradeButton(TRADE_BUTTON_SHOW);
        } else {
            GLOBAL.this.showMessage( _("You cannot afford this"), 'error' );
        }
    }

    /** helper will make sure player would not go to negative values making the intended change 
     * @param change [Object object] of {type:offsetAmount} of requested change
     */
    canAddTrade( change ){
        let can_afford = true;
        for (let type in change){
            let avail_res = BOARD_RESOURCE_COUNTERS[GLOBAL.player_id][type].getValue()+ GLOBAL.this.getOffsetValue(type);
            can_afford &= (change[type] >0 || (avail_res + change[type] )>=0);
        }
        return can_afford;
    }

    updateTradeAffordability(){

        if (GLOBAL.isSpectator) return;
        for (let trade_id = 0; trade_id < 6; trade_id++){
            let type =  GLOBAL.this.getKeyByValue(TRADE_MAP, trade_id).split('_')[1];
            
            // buy
            let node_loc = `#trade_buy_${type}`;
            let btn_id   = `#btn_buy_${type}`;
            if (this.canAddTrade(this.getBuyChange(type))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                this.updateButtonAffordability(btn_id,    AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                this.updateButtonAffordability(btn_id,    UNAFFORDABLE);
            }
            // sell
            node_loc = `#trade_sell_${type}`;
            btn_id   = `#btn_sell_${type}`;
            if (this.canAddTrade(this.getSellChange(type))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                this.updateButtonAffordability(btn_id,    AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                this.updateButtonAffordability(btn_id,    UNAFFORDABLE);
            }
        }
        // market
        if (HAS_BUILDING[GLOBAL.player_id][BLD_MARKET]){
            // food
            let node_loc = `#${PLAYER_BUILDING_ZONE_ID[GLOBAL.player_id]} .market_food`;
            let btn_id = `#btn_market_food`;
            if (this.canAddTrade(this.getMarketChange('food'))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                this.updateButtonAffordability(btn_id,    AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                this.updateButtonAffordability(btn_id,    UNAFFORDABLE);
            }
            // steel
            node_loc = `#${PLAYER_BUILDING_ZONE_ID[this.player_id]} .market_steel`;
            btn_id = `#btn_market_steel`;
            if (this.canAddTrade(this.getMarketChange('steel'))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                this.updateButtonAffordability(btn_id,    AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                this.updateButtonAffordability(btn_id,    UNAFFORDABLE);
            }   
        }
        // bank 
        if (HAS_BUILDING[GLOBAL.player_id][BLD_BANK]){
            let node_loc =  `#${BANK_DIVID}`;
            let btn_id   = `#btn_trade_bank`;
            if (this.canAddTrade(this.getBankChange)){ // can afford
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                this.updateButtonAffordability(btn_id,    AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                this.updateButtonAffordability(btn_id,    UNAFFORDABLE);
            }
        }
    }

    updateButtonAffordability(button_id, afford_val){
        switch(afford_val){
            case AFFORDABLE:
                dojo.query(button_id)
                       .addClass('bgabutton_blue')
                    .removeClass('bgabutton_gray');
                break;
            case UNAFFORDABLE:
                dojo.query(button_id)
                    .removeClass('bgabutton_blue')
                      .addClass('bgabutton_gray');
                break;
        }
    }

    /** 
     * Enable Trade
     */
     enableTradeIfPossible() {
        if (!GLOBAL.tradeEnabled){
            GLOBAL.tradeEnabled = true;

            dojo.place(dojo.create('br'),'generalactions','last');
            let trade_zone = dojo.create('div', {id:TRADE_ZONE_ID, style:'display: inline-flex;justify-content:center;'});
            dojo.place(trade_zone, 'generalactions', 'last');
            let zone_style = 'display: flex; justify-content: center; flex-wrap: wrap;';
            let buy_zone = dojo.create('div', {id:BUY_ZONE_ID, style:zone_style});
            dojo.place(buy_zone, TRADE_ZONE_ID, 'first');
            let buy_text = dojo.create('span', {class:"biggerfont", id:BUY_TEXT_ID});
            dojo.place(buy_text, BUY_ZONE_ID, 'first');
            var translatedString = _("Buy:");
            buy_text.innerText = translatedString;
            let sell_zone = dojo.create('div', {id:SELL_ZONE_ID, style:zone_style});
            dojo.place(sell_zone, TRADE_ZONE_ID, 'last');
            let sell_text = dojo.create('span', {class:"biggerfont", id:SELL_TEXT_ID});
            dojo.place(sell_text, SELL_ZONE_ID, 'first');
            var translatedString = _("Sell:");
            sell_text.innerText = translatedString;
                
            let types = ['wood','food','steel','gold','cow','copper'];
            types.forEach(type=> {
                let tradeAwayTokens = GLOBAL.this.getResourceArrayHtml(this.getBuyAway(type));
                let tradeForTokens = GLOBAL.this.getResourceArrayHtml(this.getBuyFor(type));
                GLOBAL.this.addActionButton( `btn_buy_${type}`, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, 'onBuyResource', null, false, 'blue');
                dojo.place(`btn_buy_${type}`, BUY_ZONE_ID, 'last');
                tradeAwayTokens = GLOBAL.this.getResourceArrayHtml(this.getSellAway(type));
                tradeForTokens = GLOBAL.this.getResourceArrayHtml(this.getSellFor(type));
                GLOBAL.this.addActionButton( `btn_sell_${type}`, `${tradeAwayTokens} ${TOKEN_HTML.arrow} ${tradeForTokens}`, 'onSellResource', null, false, 'blue');
                dojo.place(`btn_sell_${type}`, SELL_ZONE_ID, 'last');
            });
            if (HAS_BUILDING[this.player_id][BLD_MARKET] || HAS_BUILDING[this.player_id][BLD_BANK]){
                let special_zone = dojo.create('div', {id:SPECIAL_ZONE_ID, style:zone_style});
                dojo.place(special_zone, TRADE_ZONE_ID, 'first');
            }
            if (HAS_BUILDING[this.player_id][BLD_MARKET]){
                let mkt_text = dojo.create('span', {class:"biggerfont", id:MARKET_TEXT_ID, style:"width: 100px;"});
                dojo.place(mkt_text, SPECIAL_ZONE_ID, 'first');
                var translatedString = _("Market:");
                mkt_text.innerText = translatedString;
                let types = ['food','steel'];
                types.forEach((type) => {
                    tradeAwayTokens = this.getResourceArrayHtml(this.getMarketAway(type));
                    tradeForTokens = this.getResourceArrayHtml(this.getMarketFor(type));
                    let mkt_btn_id = `btn_market_${type}`;
                    this.addActionButton( mkt_btn_id, `${tradeAwayTokens} ${TOKEN_HTML.big_arrow} ${tradeForTokens}`, `onMarketTrade_${type}`, null, false, 'blue');
                    dojo.place(mkt_btn_id, SPECIAL_ZONE_ID, 'last');
                } );
            }
            if (HAS_BUILDING[this.player_id][BLD_BANK]){
                let bank_text = dojo.create('span', {class:"biggerfont", id:BANK_TEXT_ID, style:"width: 100px;"});
                dojo.place(bank_text, SPECIAL_ZONE_ID, 'last');
                var translatedString = _("Bank:"); 
                bank_text.innerText = translatedString;
                tradeAwayTokens = this.getResourceArrayHtml({'trade':-1});
                tradeForTokens = this.getResourceArrayHtml({'silver':1});
                this.addActionButton( BTN_ID_TRADE_BANK, `${tradeAwayTokens} ${TOKEN_HTML.big_arrow} ${tradeForTokens}`, `onClickOnBankTrade`, null, false, 'blue');
                dojo.place(BTN_ID_TRADE_BANK, SPECIAL_ZONE_ID, 'last');
            }
        }
        this.updateTradeAffordability();
    }

    disableTradeIfPossible() {
        if (GLOBAL.tradeEnabled){
            GLOBAL.tradeEnabled = false;
            dojo.query(`#${TRADE_ZONE_ID}`).forEach(dojo.destroy);
            dojo.query('#generalactions br:nth-last-of-type(1)').forEach(dojo.destroy);
        }
    }
    
    /** get function tradeAway for Buy transactions */
    getBuyAway (type){
        let buyAway = GLOBAL.this.invertArray(RESOURCE_INFO[type].trade_val);
        buyAway.trade = -1;
        return buyAway;
    }
    /** get function tradeFor for Buy transactions */
    getBuyFor (type){
        let buyFor = [];
        buyFor[type] = 1;
        return buyFor;
    }
    /** get function tradeChange(For & Away) for Buy transactions */
    getBuyChange (type) {
        let buyChange = this.getBuyAway(type);
        buyChange[type] = 1;
        return buyChange;
    }

    /** get function tradeAway for Sell transactions */
    getSellAway (type){
        let tradeAway = {trade:-1};
        tradeAway[type] = -1;
        return tradeAway;
    }
    /** get function tradeFor for Sell transactions */
    getSellFor (type){
        let tradeFor = GLOBAL.this.copyArray(RESOURCE_INFO[type].trade_val);
        tradeFor.vp = 1;
        if (HAS_BUILDING[GLOBAL.player_id][BLD_GENERAL_STORE]){
            tradeFor = GLOBAL.this.addOrSetArrayKey(tradeFor, 'silver', 1);
        }
        return tradeFor;
    }
    /** get function tradeChange for Sell transactions */
    getSellChange ( type ) {
        let tradeChange = this.getSellFor(type);
        tradeChange.trade = -1;
        tradeChange[type] = -1;
        return tradeChange;
    }

    /** get function tradeAway for Market transactions */
    getMarketAway (type){
        let tradeAway = GLOBAL.this.invertArray(RESOURCE_INFO[type].market);
        tradeAway.trade = -1;
        return tradeAway;
    }
    /** get function tradeFor for Market transactions */
    getMarketFor (type){
        let tradeFor = [];
        tradeFor[type] =1;
        return tradeFor;
    }
    /** get function tradeChange for Market transactions */
    getMarketChange (type) {
        let tradeChange = this.getMarketAway(type);
        tradeChange[type] = 1;
        return tradeChange;
    }
    
}
