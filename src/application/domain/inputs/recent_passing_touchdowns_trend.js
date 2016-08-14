'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentPassingTouchdownsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentPassingTouchdownsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentPassingTouchdownsTrend });

RecentPassingTouchdownsTrend.prototype.getTrendValueForGame = function getTrendValueForGame(game) {
    return game.stats.passingTDs;
};

module.exports = RecentPassingTouchdownsTrend;