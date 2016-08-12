'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    projectionsService = require('../../../domain/network/projections_service'),
    GameDate = require('../../../domain/season/game_date'),
    teamRepository = require('../../../../port/team/team_repository');

function ProjectionsResource() {}

ProjectionsResource.prototype.get = function get(player, inputs, networkStrategy, startYear, endYear) {
    var startDate,
        endDate;

    return teamRepository.findOneByName(player.team)
        .then(function setDateRange(team) {
            var endWeek = team.findLastPlayedGameInYear(endYear);
            if(!endWeek) {
                endWeek = 1;
            }

            startDate = new GameDate({ week: 1, year: startYear });
            endDate = new GameDate({ week: endWeek, year: endYear });
        })
        .then(function buildProjections() {
            return playerRepository.findOneByNameAndTeam(player.name, player.team);
        })
        .then(function buildProjectionsForPlayer(foundPlayer) {
            return projectionsService.buildProjectionsForDateRange(foundPlayer, inputs, networkStrategy, startDate, endDate);
        });
};

module.exports = new ProjectionsResource();