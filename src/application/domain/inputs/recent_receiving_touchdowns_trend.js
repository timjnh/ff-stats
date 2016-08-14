'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentReceivingTouchdownsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentReceivingTouchdownsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentReceivingTouchdownsTrend });

RecentReceivingTouchdownsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.stats.receivingTDs;
};

module.exports = RecentReceivingTouchdownsTrend;