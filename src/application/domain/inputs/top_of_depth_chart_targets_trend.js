'use strict';

var _ = require('underscore'),
    q = require('q'),
    RecentTrend = require('./recent_trend'),
    teamRepository = require('../../../port/team/team_repository'),
    playerRepository = require('../../../port/player/player_repository'),
    logger = require('../../../lib/logger');

function TopOfDepthChartTargetsTrend(gamesToConsider) {
    RecentTrend.call(this, gamesToConsider);
}
TopOfDepthChartTargetsTrend.prototype = _.create(RecentTrend.prototype, { constructor: TopOfDepthChartTargetsTrend });

TopOfDepthChartTargetsTrend.prototype.getTrendValueForPlayerAndGame = function getTrendValueForPlayerAndGame(player, game) {
    return teamRepository.findOneByName(player.team)
        .then(function calculateDepthChartTrend(team) {
            var playerDepth,
                lowerDepthPlayers,
                teamPlayerPromises,
                teamGame = team.findGameByWeekAndYear(game.week, game.year);

            if(!teamGame) {
                if(game.hasBeenPlayed()) {
                    throw 'Could not find TeamGame for week "' + game.week + '" and year "' + game.year + '"';
                }
                return 0; // we don't have any stats yet for this game so just assume nothing
            }

            playerDepth = teamGame.depthChart.getPlayerDepthAtPosition(player.name, player.position);
            lowerDepthPlayers = teamGame.depthChart.getPlayersBeforeDepth(player.position, playerDepth);

            teamPlayerPromises = lowerDepthPlayers.map(function getPlayer(teamPlayerName) {
                return playerRepository.findOneByNameAndTeam(teamPlayerName, player.team);
            });

            return q.all(teamPlayerPromises)
                .then(function sumTargets(teamPlayers) {
                    return teamPlayers.reduce(function sumLowerDepthTargets(total, teamPlayer) {
                        var teamPlayerGame = teamPlayer.findGameByWeekAndYear(game.week, game.year);

                        // TODO - figure out why we have a player in the depth chart that doesn't actually exist for the previous week
                        if(!teamPlayerGame) {
                            logger.warn('Missing game for player "' + teamPlayer.name + '" in week ' + game.week + ' of ' + game.year + ' when calculating TopOfDepthChartTargetsTrend');
                            return 0;
                        }

                        return total + teamPlayerGame.stats.targets;
                    }, 0);
                });
        });
};

module.exports = TopOfDepthChartTargetsTrend;
