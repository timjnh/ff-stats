'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentPoints(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentPoints.prototype = _.create(Input.prototype, { constructor: RecentPoints });

RecentPoints.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentPoints.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        precedingPoints = precedingGames.map(function getPoints(game) {
            return game.points / 100;
        });

    return this.padWithAverage(precedingPoints, this.gamesToConsider);
};

module.exports = RecentPoints;