'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentTouches(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentTouches.prototype = _.create(Input.prototype, { constructor: RecentTouches });

RecentTouches.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentTouches.prototype.evaluate = function evaluate(player, game) {
    var _this = this,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        touches = precedingGames.map(function getTouches(game) {
            return Math.min(1, game.stats.touches / (_this.gamesToConsider * 20));
        });

    return this.padWithAverage(touches, this.gamesToConsider);
};

module.exports = RecentTouches;