'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentTargetsTrend(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentTargetsTrend.prototype = _.create(Input.prototype, { constructor: RecentTargetsTrend });

RecentTargetsTrend.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentTargetsTrend.prototype.evaluate = function evaluate(player, game) {
    var trend = 0.5,
        increment = trend / this.gamesToConsider,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        targets = precedingGames.map(function getTouches(game) { return game.stats.targets });

    for(var i in targets) {
        if(i > 0) {
            if(targets[i] > targets[i - 1]) {
                trend += increment;
            } else if(targets[i] < targets[i - 1]) {
                trend -= increment;
            }
        }
    }

    return Math.min(1, Math.max(0, trend));
};

module.exports = RecentTargetsTrend;