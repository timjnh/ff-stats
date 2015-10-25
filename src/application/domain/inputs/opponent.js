'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    gameRepository = require('../../../port/game/game_repository'),
    Team = require('../team');

function Opponent() {
    Input.call(this);
}
Opponent.prototype = _.create(Input.prototype, { constructor: Opponent });

Opponent.prototype.evaluate = function evaluate(player, game) {
    return gameRepository.findOneByEid(game.eid)
        .then(function determineOpponentScoreValue(game) {
            // TODO - i'm not sure this is a great way to identify the teams.  the order seems to have too much of an impact.
            // it seems to be easier for the network to calculate an appropriate value if the teams are in order of historical
            // success *per-player*
            var opposingTeamId = game.isHomeTeam(player.team) ? Team.getId(game.away) : Team.getId(game.home);
            return opposingTeamId / Team.TEAMS.length;
        });
};

module.exports = Opponent;