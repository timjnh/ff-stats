'use strict';

var q = require('q'),
    SimpleTeam = require('../../application/domain/team/simple_team'),
    TeamModel = require('./model/team_model');

function SimpleTeamRepository() {}

SimpleTeamRepository.prototype.findAll = function findAll() {
    return this._findWithCriteria({});
};

SimpleTeamRepository.prototype._findWithCriteria = function _findWithCriteria(criteria) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        TeamModel.find(criteria, SimpleTeam.getAttributeNames().join(' '), function(err, teams) {
            if(err) {
                reject(err);
            } else {
                resolve(teams.map(_this._buildSimpleTeamFromModel.bind(_this)));
            }
        });
    });
};

SimpleTeamRepository.prototype._buildSimpleTeamFromModel = function _buildSimpleTeamFromModel(teamModel) {
    var team = teamModel.toObject();
    return SimpleTeam.create(team);
};

module.exports = new SimpleTeamRepository();