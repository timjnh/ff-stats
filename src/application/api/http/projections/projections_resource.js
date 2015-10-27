'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    projectionsService = require('../../../domain/projections_service');

function ProjectionsResource() {}

ProjectionsResource.prototype.get = function get(player, inputs) {
    return playerRepository.findOneByNameAndTeam(player.name, player.team)
        .then(function buildProjectionsForPlayer(foundPlayer) {
            return projectionsService.buildProjectionsForAllGames(foundPlayer, inputs);
        });
};

module.exports = new ProjectionsResource();