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
                        away:this.getBankAway(), for:this.getBankFor(), change:this.getBankChange()};
            break;
            case TAKE_LOAN:
                transactions = {name:_("Take Dept"), map:TRADE_MAP.loan,
                        away:this.getLoanAway(), for:this.getLoanFor(), change:this.getLoanChange()};
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
            //let node2_loc= `#trbuy_buy_${type}`;
            if (this.canAddTrade(this.getBuyChange(type))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                // this.updateAffordability(node2_loc, AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                // this.updateAffordability(node2_loc, UNAFFORDABLE);
            }
            // sell
            node_loc = `#trade_sell_${type}`;
            // node2_loc= `#trsel_sell_${type}`;
            if (this.canAddTrade(this.getSellChange(type))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
                // this.updateAffordability(node2_loc, AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
                // this.updateAffordability(node2_loc, UNAFFORDABLE);
            }
        }
        // market
        if (HAS_BUILDING[GLOBAL.player_id][BLD_MARKET]){
            // food
            let node_loc = `#${PLAYER_BUILDING_ZONE_ID[GLOBAL.player_id]} .market_food`;
            if (this.canAddTrade(this.getMarketChange('food'))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
            }
            // steel
            node_loc = `#${this.player_building_zone_id[this.player_id]} .market_steel`;
            if (this.canAddTrade(this.getMarketChange('steel'))){
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
            }   
        }
        // bank 
        if (HAS_BUILDING[GLOBAL.player_id][BLD_BANK]){
            let node_loc =  `#${BANK_DIVID}`;
            if (this.canAddTrade(this.getBankChange)){ // can afford
                GLOBAL.this.updateAffordability(node_loc, AFFORDABLE);
            } else {// can not afford
                GLOBAL.this.updateAffordability(node_loc, UNAFFORDABLE);
            }
        }
    }

    /** 
         * Enable Trade
         */
     enableTradeIfPossible() {
        if (!GLOBAL.tradeEnabled){
            dojo.place(dojo.create('br'),'generalactions','last');
            let buy_zone = dojo.create('div', {id:BUY_ZONE_ID, style:'display: inline-flex;justify-content:center;'});
            dojo.place(buy_zone, 'generalactions', 'last');
            let buyText = dojo.create('span', {class:"biggerfont", id:'buy_text'});
            dojo.place(buyText, BUY_ZONE_ID, 'first');
            buyText.innerText = _("buy:");
            dojo.place(dojo.create('br'),'generalactions','last');
            let sell_zone = dojo.create('div', {id:SELL_ZONE_ID, style:'display: inline-flex;justify-content:center;'});
            dojo.place(sell_zone, 'generalactions', 'last');
            let sellText = dojo.create('span', {class:"biggerfont", id:'sell_text'});
            dojo.place(sellText, SELL_ZONE_ID, 'first');
            sellText.innerText =_("sell:");
                
            let types = ['wood','food','steel','gold','cow','copper'];
            for(let i =0; i <6;i++){
                let type = types[i];
                //buy
                let tradeAwayTokens = GLOBAL.this.getResourceArrayHtml(this.getBuyAway(type));
                let tradeForTokens = GLOBAL.this.getResourceArrayHtml(this.getBuyFor(type));
                GLOBAL.this.addActionButton( `btn_buy_${type}`, `${tradeAwayTokens} ${this.tkn_html.arrow} ${tradeForTokens}`, 'onBuyResource', null, false, 'blue');
                dojo.place(`btn_buy_${type}`, BUY_ZONE_ID, 'last');
                //sell
                tradeAwayTokens = GLOBAL.this.getResourceArrayHtml(this.getSellAway(type));
                tradeForTokens = GLOBAL.this.getResourceArrayHtml(this.getSellFor(type));
                GLOBAL.this.addActionButton( `btn_sell_${type}`, `${tradeAwayTokens} ${this.tkn_html.arrow} ${tradeForTokens}`, 'onSellResource', null, false, 'blue');
                dojo.place(`btn_sell_${type}`, SELL_ZONE_ID, 'last');
            }
            GLOBAL.tradeEnabled = true;
        }
    }

    disableTradeIfPossible() {
        if (GLOBAL.tradeEnabled){
            GLOBAL.tradeEnabled = false;
            dojo.query(`#${BUY_ZONE_ID}`).forEach(dojo.destroy);
            dojo.query('#generalactions br:nth-last-of-type(2)').forEach(dojo.destroy);
            dojo.query(`#${SELL_ZONE_ID}`).forEach(dojo.destroy);
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

    /** get function tradeAway for Loan transactions */
    getLoanAway(){
        return {};
    }
    /** get function tradeFor for Loan transactions */
    getLoanFor(){
        return {'loan':1, 'silver':2};
    }
    /** get function tradeChange for Loan transactions */
    getLoanChange() {
        return {'loan':1, 'silver':2};
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
    
    /** get function tradeAway for Sell transactions */
    getBankAway(){
        return {'trade':1};
    }
    /** get function tradeFor for Sell transactions */
    getBankFor(){
        return {'silver':1};
    }
    /** get function tradeChange for Sell transactions */
    getBankChange() {
        return {'trade':-1, 'silver':1};
    }

    /** get function tradeAway for Sell transactions */
    getLoanAway (){
        return {};
    }
    /** get function tradeFor for Sell transactions */
    getLoanFor (){
        return {'loan':1, 'silver':2};
    }
    /** get function tradeChange for Sell transactions */
    getLoanChange () {
        return {'loan':1, 'silver':2};
    }
 
}
