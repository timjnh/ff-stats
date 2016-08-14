'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentTargetsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentTargetsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentTargetsTrend });

RecentTargetsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.stats.targets;
};

module.exports = RecentTargetsTrend;