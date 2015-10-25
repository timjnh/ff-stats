'use strict';

var _ = require('underscore'),
    Input = require('./Input'),
    gameRepository = require('../../port/game/game_repository');

function AveragePointsAgainstOpponent() {
    Input.call(this);
}
AveragePointsAgainstOpponent.prototype = _.create(Input.prototype, { constructor: AveragePointsAgainstOpponent });

AveragePointsAgainstOpponent.prototype.evaluate = function evaluate(player, game) {
    return gameRepository.findOneByEid(game.eid)
        .then(function determineOpponentAverageValue(game) {
            var opposingTeam = game.isHomeTeam(player.team) ? game.away : game.home,
                gamesAgainstCurrentOpponent = player.findGamesAgainst(opposingTeam),
                totalPoints = _.pluck(gamesAgainstCurrentOpponent, 'points').reduce(function(a, b) { return a + b; }, 0),
                averagePoints = totalPoints / gamesAgainstCurrentOpponent.length;

            return averagePoints / 100;
        });
};

module.exports = AveragePointsAgainstOpponent;