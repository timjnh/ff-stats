'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentReceivingTouchdowns(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentReceivingTouchdowns.prototype = _.create(Input.prototype, { constructor: RecentReceivingTouchdowns });

RecentReceivingTouchdowns.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentReceivingTouchdowns.prototype.evaluate = function evaluate(player, game) {
    var _this = this,
        precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        receivingTouchdowns = precedingGames.map(function getReceivingTouchdowns(game) {
            return Math.min(1, game.stats.receivingTDs / (_this.gamesToConsider * 3));
        });

    return this.padWithAverage(receivingTouchdowns, this.gamesToConsider);
};

module.exports = RecentReceivingTouchdowns;