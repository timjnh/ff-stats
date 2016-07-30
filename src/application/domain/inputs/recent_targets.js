'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentTargets(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentTargets.prototype = _.create(Input.prototype, { constructor: RecentTargets });

RecentTargets.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentTargets.prototype.evaluate = function evaluate(player, game) {
    var _this = this,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        targets = precedingGames.map(function getTargets(game) {
            return Math.min(1, game.stats.targets / (_this.gamesToConsider * 20));
        });

    return this.padWithAverage(targets, this.gamesToConsider);
};

module.exports = RecentTargets;