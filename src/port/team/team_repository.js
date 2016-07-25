'use strict';

var q = require('q'),
    Team = require('../../application/domain//team/team'),
    TeamModel = require('./model/team_model');

function TeamRepository() {}

TeamRepository.prototype.findOneByName = function findOneByName(name) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        TeamModel.find({ name: name }, function(err, teams) {
            if(err) {
                reject(err);
            } else if(teams.length == 0) {
                resolve(null);
            } else {
                resolve(_this._buildTeamFromModel(teams[0]));
            }
        });
    });
};

TeamRepository.prototype._buildTeamFromModel = function _buildTeamFromModel(teamModel) {
    var team = teamModel.toObject();
    return Team.create(team);
};

TeamRepository.prototype.save = function save(team) {
    return q.Promise(function(resolve, reject) {
        var cleanTeam = JSON.parse(JSON.stringify(team)); // TODO - there must be a better way to do this

        if(!team._id) {
            var model = new TeamModel(cleanTeam);

            model.save(function(err) {
                return err ? reject(err) : resolve();
            });
        } else {
            TeamModel.update({ _id: team._id }, cleanTeam, function(err) {
                return err ? reject(err) : resolve();
            });
        }
    });
};

module.exports = new TeamRepository();