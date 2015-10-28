'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentPassingTouchdowns(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentPassingTouchdowns.prototype = _.create(Input.prototype, { constructor: RecentPassingTouchdowns });

RecentPassingTouchdowns.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentPassingTouchdowns.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        passingTDs = precedingGames.map(function getPassingTouchdowns(game) {
            return Math.min(1, game.stats.passingTDs / 6);
        });

    return this.padWithAverage(passingTDs, this.gamesToConsider);
};

module.exports = RecentPassingTouchdowns;