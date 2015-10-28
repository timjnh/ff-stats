'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentRushingYards(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentRushingYards.prototype = _.create(Input.prototype, { constructor: RecentRushingYards });

RecentRushingYards.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentRushingYards.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        precedingYards = precedingGames.map(function get(game) {
            return Math.min(1, game.stats.rushingYards / 250);
        });

    return this.padWithAverage(precedingYards, this.gamesToConsider);
};

module.exports = RecentRushingYards;