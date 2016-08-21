'use strict';

var simpleTeamRepository = require('../../../../port/team/simple_team_repository'),
    TeamModel = require('./team_model');

function TeamsResource() {}

TeamsResource.prototype.getAll = function getAll() {
    return simpleTeamRepository.findAll()
        .then(function convertToTeamModels(teams) {
            return teams.map(TeamModel.create);
        });
};

module.exports = new TeamsResource();