'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentPassingYardsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentPassingYardsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentPassingYardsTrend });

RecentPassingYardsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.stats.passingYards;
};

module.exports = RecentPassingYardsTrend;