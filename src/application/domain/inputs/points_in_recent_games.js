'use strict';

var _ = require('underscore'),
    Input = require('./input');

function PointsInRecentGames(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
PointsInRecentGames.prototype = _.create(Input.prototype, { constructor: PointsInRecentGames });

PointsInRecentGames.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

PointsInRecentGames.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        precedingPoints = precedingGames.map(function getPoints(game) {
            return game.points / 100;
        });

    return this.padWithAverage(precedingPoints, this.gamesToConsider);
};

module.exports = PointsInRecentGames;