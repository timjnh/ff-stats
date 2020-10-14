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
                if(game.week == 1 && game.year == GameDate.getMinYear()) {
                    // first week of our first year shouldn't have any info.  assume they're not injured
                    return 0;
                } else if(!game.hasBeenPlayed()) {
                    // if the game hasn't been played yet, assume they're not injured too
                    return 0;
                }

                throw new Error('No QB found for "' + player.team + '" week ' + game.week + ', ' + game.year);
            }

            return playerRepository.findOneByNameAndTeam(topQbName, player.team)
                .then(function isActivePlayer(qb) {
                    return qb.isActivePlayerInGame(game.week, game.year) ? 1 : 0;
                });
        });
};

module.exports = QbInjured;
