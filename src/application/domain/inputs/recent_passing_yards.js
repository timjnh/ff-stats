'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentPassingYards(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentPassingYards.prototype = _.create(Input.prototype, { constructor: RecentPassingYards });

RecentPassingYards.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentPassingYards.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        precedingYards = precedingGames.map(function getPassingYards(game) {
            return Math.min(1, game.stats.passingYards / 400);
        });

    return this.padWithAverage(precedingYards, this.gamesToConsider);
};

module.exports = RecentPassingYards;