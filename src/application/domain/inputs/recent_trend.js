'use strict';

var _ = require('underscore'),
    q = require('q'),
    Input = require('./input');

function RecentTrend(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentTrend.prototype = _.create(Input.prototype, { constructor: RecentTrend });

RecentTrend.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentTrend.prototype.evaluate = function evaluate(player, game) {
    var _this = this,
        trend = 0.5,
        increment = trend / this.gamesToConsider,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        trendValuePromises = precedingGames.map(function getTrendValueForPlayerAndGame(game) {
            return q.when(_this.getTrendValueForPlayerAndGame(player, game));
        });

    return q.all(trendValuePromises)
        .then(function calculateTrend(trendValues) {
            for(var i in trendValues) {
                if(i > 0) {
                    if(trendValues[i] > trendValues[i - 1]) {
                        trend += increment;
                    } else if(trendValues[i] < trendValues[i - 1]) {
                        trend -= increment;
                    }
                }
            }

            return Math.min(1, Math.max(0, trend));        });
};

RecentTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    throw new Error(this.constructor.name + '.getTrendValueForPlayerAndGame not implemented!');
};

module.exports = RecentTrend;