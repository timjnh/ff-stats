'use strict';

var _ = require('underscore'),
    RecentTrend = require('./recent_trend');

function RecentPassingTouchdownsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
RecentPassingTouchdownsTrend.prototype = _.create(RecentTrend.prototype, { constructor: RecentPassingTouchdownsTrend });

RecentPassingTouchdownsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return game.stats.passingTDs;
};

module.exports = RecentPassingTouchdownsTrend;