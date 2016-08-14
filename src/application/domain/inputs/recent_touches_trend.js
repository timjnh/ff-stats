'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentTouchesTrend(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentTouchesTrend.prototype = _.create(Input.prototype, { constructor: RecentTouchesTrend });

RecentTouchesTrend.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentTouchesTrend.prototype.evaluate = function evaluate(player, game) {
    var trend = 0.5,
        increment = trend / this.gamesToConsider,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        touches = precedingGames.map(function getTouches(game) { return game.stats.touches });

    for(var i in touches) {
        if(i > 0) {
            if(touches[i] > touches[i - 1]) {
                trend += increment;
            } else if(touches[i] < touches[i - 1]) {
                trend -= increment;
            }
        }
    }

    return Math.min(1, Math.max(0, trend));
};

module.exports = RecentTouchesTrend;