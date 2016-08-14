'use strict';

var _ = require('underscore'),
    q = require('q'),
    assert = require('assert'),
    Player = require('../../application/domain/player/player'),
    PlayerModel = require('./model/player_model');

function PlayerRepository() {}

PlayerRepository.prototype.findAll = function findAll() {
    return this._findWithCriteria({});
};

PlayerRepository.prototype.findOneByNameAndTeam = function findByNameAndTeam(name, team, createIfNotFound) {
    return this._findWithCriteria({ name: name, team: team })
        .then(function buildIfNotFound(players) {
            assert(players.length <= 1, 'Found multiple players with name "' + name + '" and team "' + team + '"');
            if(players.length == 0 && createIfNotFound) {
                return new Player({name: name, team: team, games: [], injuries: []});
            } else if(players.length == 0) {
                throw new Error('Player ' + name + ' of ' + team + ' not found');
            } else {
                return players[0];
            }
        });
};

PlayerRepository.prototype.findAllByNames = function findAllByNames(names) {
    return this._findWithCriteria({ name: { '$in': names } });
};

PlayerRepository.prototype.findAllByTeam = function findAllByTeam(team) {
    return this._findWithCriteria({ team: team });
};

PlayerRepository.prototype.findAllByTeams = function findAllByTeams(teams) {
    return this._findWithCriteria({ team: { '$in': teams } });
};

PlayerRepository.prototype.findAllByTeamAndPosition = function findAllByTeamAndPosition(team, position) {
    return this._findWithCriteria({ team: team, position: position });
};

PlayerRepository.prototype.findAllWithBuilder = function findAllWithBuilder(builder, options) {
    return this._findWithCriteria(builder.build(), options);
};

PlayerRepository.prototype._findWithCriteria = function _findWithCriteria(criteria, options) {
    var _this = this;

    options = options || {};

    return q.Promise(function(resolve, reject) {
        var stream,
            query = PlayerModel.find(criteria).batchSize(10);

        if(options.stream) {
            stream = query.stream({ transform: _this._buildPlayerFromModel.bind(_this) });
            resolve(stream);
        } else {
            query.exec(function(err, players) {
                if(err) {
                    reject(err);
                } else {
                    resolve(players.map(function createPlayer(player) {
                        return _this._buildPlayerFromModel(player);
                    }));
                }
            });
        }
    });
};

PlayerRepository.prototype._buildPlayerFromModel = function _buildPlayerFromModel(playerModel) {
    var player = playerModel.toObject();
    return Player.create(player);
};

PlayerRepository.prototype.save = function save(player) {
    return q.Promise(function(resolve, reject) {
        var cleanPlayer = JSON.parse(JSON.stringify(player)); // TODO - there must be a better way to do this

        if(!player._id) {
            var model = new PlayerModel(cleanPlayer);

            model.save(function(err) {
                return err ? reject(err) : resolve();
            });
        } else {
            PlayerModel.update({ _id: player._id }, cleanPlayer, function(err) {
                return err ? reject(err) : resolve();
            });
        }
    });
};

module.exports = new PlayerRepository();