'use strict';

var _ = require('underscore'),
    Input = require('./input');

function RecentPointsAgainstOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentPointsAgainstOpponent.prototype = _.create(Input.prototype, { constructor: RecentPointsAgainstOpponent });

RecentPointsAgainstOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentPointsAgainstOpponent.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGamesAgainstOpponent(game, this.gamesToConsider),
        precedingPoints = precedingGames.map(function getPoints(game) {
            return game.points / 100;
        });

    return this.padWithAverage(precedingPoints, this.gamesToConsider);
};

module.exports = RecentPointsAgainstOpponent;