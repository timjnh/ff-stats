'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentReceivingYards(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentReceivingYards.prototype = _.create(Input.prototype, { constructor: RecentReceivingYards });

RecentReceivingYards.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentReceivingYards.prototype.evaluate = function evaluate(player, game) {
    var _this = this,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        receivingYards = precedingGames.map(function getReceivingYards(game) {
            return Math.min(1, game.stats.receivingYards / (_this.gamesToConsider * 150));
        });

    return this.padWithAverage(receivingYards, this.gamesToConsider);
};

module.exports = RecentReceivingYards;