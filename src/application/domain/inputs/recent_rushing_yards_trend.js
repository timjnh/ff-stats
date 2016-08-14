'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentRushingYardsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentRushingYardsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentRushingYardsTrend });

RecentRushingYardsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.stats.rushingYards;
};

module.exports = RecentRushingYardsTrend;