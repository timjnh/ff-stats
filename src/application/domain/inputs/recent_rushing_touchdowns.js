'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentRushingTouchdowns(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentRushingTouchdowns.prototype = _.create(Input.prototype, { constructor: RecentRushingTouchdowns });

RecentRushingTouchdowns.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentRushingTouchdowns.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        rushingTDs = precedingGames.map(function getRushingTouchdowns(game) {
            return Math.min(1, game.stats.rushingTDs / 6);
        });

    return this.padWithAverage(rushingTDs, this.gamesToConsider);
};

module.exports = RecentRushingTouchdowns;