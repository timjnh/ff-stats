'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentPointsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentPointsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentPointsTrend });

RecentPointsTrend.prototype.getTrendValueForGame = function getTrendValueForGame(game) {
    return game.points;
};

module.exports = RecentPointsTrend;