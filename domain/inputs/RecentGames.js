'use strict';

var _ = require('underscore'),
    Input = require('./Input');

function RecentGames(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentGames.prototype = _.create(Input.prototype, { constructor: RecentGames });

RecentGames.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, this.gamesToConsider),
        precedingPoints = precedingGames.map(function getPoints(game) {
            return game.points / 100;
        });

    if(precedingPoints.length < this.gamesToConsider) {
        var average = (precedingPoints.reduce(function(points, total) { return points + total; }, 0) / precedingPoints.length) || 0,
            filler = Array.apply(null, Array(this.gamesToConsider - precedingPoints.length)).map(Number.prototype.valueOf, average);
        precedingPoints.unshift.apply(precedingPoints, filler);
    }

    return precedingPoints;
};

module.exports = RecentGames;