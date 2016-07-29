'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    teamRepository = require('../../../port/team/team_repository');

function TopOfDepthChartInjured() {
    Input.call(this);
}
TopOfDepthChartInjured.prototype = _.create(Input.prototype, { constructor: TopOfDepthChartInjured });

TopOfDepthChartInjured.prototype.evaluate = function evaluate(player, game) {
    return teamRepository.findOneByName(player.team)
        .then(function calculateBumpInDepthChart(team) {
            var depthChartBump,
                teamGame = team.findGameByWeekAndYear(game.week, game.year),
                playerDepth = teamGame.depthChart.getPlayerDepthAtPosition(player.name, player.position),
                lowerDepthPlayers = teamGame.depthChart.getPlayersBeforeDepth(player.position, playerDepth);

            depthChartBump = lowerDepthPlayers.reduce(function sumLowerDepthInjuries(total, playerName) {
                var player = teamGame.findPlayerByName(playerName);

                // if we can't find the player then it means they played in the last game (so they show up in this
                // game's depth chart), however they're not playing in this one, which means they're as good as injured
                if(!player) {
                    return total + 1;
                } else {
                    return total + (player.injured ? 1 : 0);
                }
            }, 0);

            return Math.min(1, depthChartBump / 5);
        });
};

module.exports = TopOfDepthChartInjured;
