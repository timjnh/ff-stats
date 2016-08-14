'use strict';

var _ = require('underscore'),
    playerRepository = require('../../../port/player/player_repository'),
    DepthChart = require('./depth_chart');

function DepthChartService() {}

DepthChartService.prototype.calculateChartsForTeam = function calculateChartsForTeam(team) {
    var _this = this,
        updatedGames = [],
        orderedGames = team.getOrderedGames();

    return playerRepository.findAllByTeam(team.name)
        .then(function calculateChartsForAllGames(players) {
            for(var i = 1; i < orderedGames.length; ++i) {
                var previousGameChart = _this._calculateChartForGame(orderedGames[i - 1], players);
                updatedGames.push(orderedGames[i].setDepthChart(previousGameChart));
            }

            return team.addOrUpdateGames(updatedGames);
        });
};

DepthChartService.prototype._calculateChartForGame = function _calculateChartForGame(game, players) {
    var depthChart = DepthChart.create({}),
        playersByPosition = _.groupBy(game.players, 'position');

    _.each(playersByPosition, function buildChartForPosition(positionPlayers, position) {
        var playerUtility = {};

        positionPlayers.forEach(function calculateTargets(positionPlayer) {
            var player = _.findWhere(players, { name: positionPlayer.name }),
                playerGame = player.findGameByWeekAndYear(game.week, game.year),
                targets = playerGame.getStat('targets'),
                touches = playerGame.getStat('touches'),
                passingYards = playerGame.getStat('passingYards'),
                extraPointsMade = playerGame.getStat('extraPointsMade');

            playerUtility[positionPlayer.name] = targets + touches + passingYards + extraPointsMade;
        });

        depthChart = depthChart.setChartAtPosition(position, _.pluck(_.sortBy(_.pairs(playerUtility), '1').reverse(), '0'));
    });

    return depthChart;
};

module.exports = new DepthChartService();