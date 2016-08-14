'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentReceivingYardsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentReceivingYardsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentReceivingYardsTrend });

RecentReceivingYardsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.stats.rushingTDs;
};

module.exports = RecentReceivingYardsTrend;