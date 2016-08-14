'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentTouchesTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentTouchesTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentTouchesTrend });

RecentTouchesTrend.prototype.getTrendValueForGame = function getTrendValueForGame(game) {
    return game.stats.touches;
};

module.exports = RecentTouchesTrend;