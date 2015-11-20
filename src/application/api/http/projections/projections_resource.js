'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    projectionsService = require('../../../domain/network/projections_service'),
    PerceptronStrategy = require('../../../domain/network/strategies/perceptron_strategy');

function ProjectionsResource() {}

ProjectionsResource.prototype.get = function get(player, inputs, networkStrategy, startYear, endYear) {
    return playerRepository.findOneByNameAndTeam(player.name, player.team)
        .then(function buildProjectionsForPlayer(foundPlayer) {
            return projectionsService.buildProjectionsForYearRange(foundPlayer, inputs, networkStrategy, startYear, endYear);
        });
};

module.exports = new ProjectionsResource();