'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    teamRepository = require('../../../port/team/team_repository'),
    playerRepository = require('../../../port/player/player_repository'),
    PlayerPosition = require('../player/player_position'),
    GameDate = require('../season/game_date');

function QbInjured() {
    Input.call(this);
}
QbInjured.prototype = _.create(Input.prototype, { constructor: QbInjured });

QbInjured.prototype.evaluate = function evaluate(player, game) {
    return teamRepository.findOneByName(player.team)
        .then(function determineIfQbIsInjured(team) {
            var topQbName,
                teamGame = team.findGameByWeekAndYear(game.week, game.year);

            if(!teamGame) {
                if(game.hasBeenPlayed()) {
                    throw 'Could not find TeamGame for week "' + game.week + '" and year "' + game.year + '"';
                }
                return 0; // we don't have any stats yet for this game so just assume nothing
            }

            topQbName = teamGame.depthChart.getTopPlayerAtPosition(PlayerPosition.QB);

            if(topQbName === undefined) {
                // first week of our first year shouldn't have any info
                if(game.week == 1 && game.year == GameDate.getMinYear()) {
                    return 0; // assume they're not injured
                }
            }

            return playerRepository.findOneByNameAndTeam(topQbName, player.team)
                .then(function isActivePlayer(qb) {
                    return qb.isActivePlayerInGame(game.week, game.year) ? 1 : 0;
                });
        });
};

module.exports = QbInjured;
