'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentReceivingYardsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentReceivingYardsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentReceivingYardsTrend });

RecentReceivingYardsTrend.prototype.getTrendValueForGame = function getTrendValueForGame(game) {
    return game.stats.receivingYards;
};

module.exports = RecentReceivingYardsTrend;