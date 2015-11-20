'use strict';

var _ = require('underscore'),
    q = require('q'),
    assert = require('assert'),
    Player = require('../../application/domain/player'),
    PlayerGame = require('../../application/domain/player_game'),
    InputSet = require('../../application/domain/input_set'),
    PlayerStats = require('../../application/domain/player_stats'),
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
                throw 'Player ' + name + ' of ' + team + ' not found';
            } else {
                return players[0];
            }
        });
};

PlayerRepository.prototype.findAll = function findAll() {
    return this._findWithCriteria({});
};

PlayerRepository.prototype.findAllByName = function findAllByName(name) {
    return this._findWithCriteria({ name: name });
};

PlayerRepository.prototype.findAllByTeam = function findAllByTeam(team) {
    return this._findWithCriteria({ team: team });
};

PlayerRepository.prototype._findWithCriteria = function _findWithCriteria(criteria) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        PlayerModel.find(criteria, function(err, players) {
            if(err) {
                reject(err);
            } else {
                resolve(players.map(function createPlayer(player) {
                    return _this._buildPlayerFromModel(player);
                }));
            }
        });
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