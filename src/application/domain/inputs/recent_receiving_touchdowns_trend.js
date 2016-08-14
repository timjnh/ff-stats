'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentReceivingTouchdownsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentReceivingTouchdownsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentReceivingTouchdownsTrend });

RecentReceivingTouchdownsTrend.prototype.getTrendValueForGame = function getTrendValueForGame(game) {
    return game.stats.receivingTDs;
};

module.exports = RecentReceivingTouchdownsTrend;