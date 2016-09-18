'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    projectionsService = require('../../../domain/network/projections_service'),
    GameDate = require('../../../domain/season/game_date'),
    teamRepository = require('../../../../port/team/team_repository'),
    playerInputsService = require('../../../domain/inputs/player_inputs_service');

function ProjectionsResource() {}

ProjectionsResource.prototype.get = function get(player, inputs, networkStrategy, startYear, endYear) {
    var startDate,
        endDate;

    return teamRepository.findOneByName(player.team)
        .then(function setDateRange(team) {
            var endWeek = 1,
                lastGame = team.findLastPlayedGameInYear(endYear);
            if(lastGame) {
                endWeek = lastGame.week;
            }

            startDate = new GameDate({ week: 1, year: startYear });
            endDate = new GameDate({ week: endWeek, year: endYear });
        })
        .then(function buildProjections() {
            return playerRepository.findOneByNameAndTeam(player.name, player.team);
        })
        .then(function buildInputsForFinalGame(player) {
            var lastGame = player.findLastGameInDateRange(startDate, endDate);

            if(!lastGame.hasBeenPlayed() && !lastGame.hasAllInputs(inputs)) {
                player = playerInputsService.updateInputsForPlayerAndGame(player, lastGame);
            }

            return player;
        })
        .then(function buildProjectionsForPlayer(player) {
            return projectionsService.buildProjectionsForDateRange(player, inputs, networkStrategy, startDate, endDate);
        });
};

module.exports = new ProjectionsResource();