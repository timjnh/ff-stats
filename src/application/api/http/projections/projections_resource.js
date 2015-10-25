'use strict';

var q = require('q'),
    playerRepository = require('../../../../port/player/player_repository'),
    projectionsService = require('../../../domain/projections_service');

function ProjectionsResource() {}

ProjectionsResource.prototype.get = function get(name, team) {
    return playerRepository.findOneByNameAndTeam(name, team)
        .then(projectionsService.buildProjectionsForAllGames.bind(projectionsService));
};

module.exports = new ProjectionsResource();