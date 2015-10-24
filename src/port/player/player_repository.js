'use strict';

var _ = require('underscore'),
    q = require('q'),
    assert = require('assert'),
    Player = require('../../domain/player'),
    PlayerGame = require('../../domain/player_game'),
    InputSet = require('../../domain/input_set'),
    PlayerStats = require('../../domain/player_stats'),
    PlayerModel = require('./model/player_model');

function PlayerRepository() {}

PlayerRepository.prototype.findAll = function findAll() {
    return this._findWithCriteria({});
};

PlayerRepository.prototype.findOneByNameAndTeam = function findByNameAndTeam(name, team) {
    return this._findWithCriteria({ name: name, team: team })
        .then(function buildIfNotFound(players) {
            assert(players.length <= 1, 'Found multiple players with name "' + name + '" and team "' + team + '"');
            if(players.length == 0) {
                return new Player({ name: name, team: team, games: [] });
            } else {
                return players[0];
            }
        });
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

    player.games = player.games.map(function buildPlayerGame(game) {
        game.inputs = InputSet.create(game.inputs);
        game.stats = PlayerStats.create(game.stats);
        return PlayerGame.create(game);
    });

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