'use strict';

var q = require('q'),
    Team = require('../../application/domain/team/team'),
    TeamModel = require('./model/team_model');

function TeamRepository() {
    this._cache = {};
}

TeamRepository.prototype.findAll = function findAll() {
    return this._findWithCriteria({});
};

TeamRepository.prototype.findOneByName = function findOneByName(name) {
    var _this = this;

    if(this._cache[name]) {
        return q.when(this._cache[name]);
    }

    return this._findWithCriteria({ name: name })
        .then(function extractFirstTeam(teams) {
            if(teams.length > 0) {
                _this._cache[name] = teams[0];
                return _this._cache[name];
            } else {
                return null;
            }
        });
};

TeamRepository.prototype.findAllByName = function findAllByName(names) {
    return this._findWithCriteria({ name: { $in: names } });
};

TeamRepository.prototype._findWithCriteria = function _findWithCriteria(criteria) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        TeamModel.find(criteria, function(err, teams) {
            if(err) {
                reject(err);
            } else {
                resolve(teams.map(_this._buildTeamFromModel.bind(_this)));
            }
        });
    });
};

TeamRepository.prototype._buildTeamFromModel = function _buildTeamFromModel(teamModel) {
    var team = teamModel.toObject();
    return Team.create(team);
};

TeamRepository.prototype.save = function save(team) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        var cleanTeam = JSON.parse(JSON.stringify(team)); // TODO - there must be a better way to do this

        if(!team._id) {
            var model = new TeamModel(cleanTeam);

            model.save(function(err) {
                if(!err) {
                    _this._cache[team.name] = _this._buildTeamFromModel(model);
                }
                return err ? reject(err) : resolve();
            });
        } else {
            TeamModel.update({ _id: team._id }, cleanTeam, function(err) {
                if(!err) {
                    _this._cache[team.name] = team;
                }
                return err ? reject(err) : resolve();
            });
        }
    });
};

module.exports = new TeamRepository();