'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentPointsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentPointsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentPointsTrend });

RecentPointsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.points;
};

module.exports = RecentPointsTrend;