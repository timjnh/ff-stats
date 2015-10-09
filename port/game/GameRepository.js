'use strict';

var assert = require('assert'),
    fs = require('fs'),
    q = require('q'),
    Game = require('../../domain/Game'),
    GameModel = require('./model/GameModel');

function GameRepository() {}

GameRepository.prototype.findGamesWithoutStats = function findGamesWithoutStats() {
    var criteria = { stats: { $exists: false } };
    return this._findWithCriteria(criteria);
};

GameRepository.prototype.findGamesWithTeam = function findGamesWithTeam(team) {
    var criteria = { $or: [{ home: team }, { away: team }]};
    return this._findWithCriteria(criteria);
};

GameRepository.prototype.findOneByEid = function findOneByEid(eid) {
    return this._findOneWithCriteria({ eid: eid });
};

GameRepository.prototype.findNextGameForTeam = function findNextGameForTeam(team) {
    var criteria = { $or: [{ home: team }, { away: team }], stats: { $exists: false }};
    return q.Promise(function(resolve, reject) {
        GameModel.find(criteria)
            .sort({ year: 1, week: 1 })
            .exec(function(err, games) {
                if(err) {
                    reject(err);
                } else {
                    resolve(Game.create(games[0].toObject()));
                }
            });
    });
};

GameRepository.prototype._findOneWithCriteria = function _findOneWithCriteria(criteria) {
    return this._findWithCriteria(criteria)
        .then(function reduceToOne(games) {
            assert(games.length <= 1, 'Found multiple Games with criteria "' + JSON.stringify(criteria) + '"');
            assert(games.length != 0, 'Could not find a Game matching "' + JSON.stringify(criteria) + '"');
            return games[0];
        });
};

GameRepository.prototype._findWithCriteria = function _findWithCriteria(criteria) {
    return q.Promise(function(resolve, reject) {
        GameModel.find(criteria, function(err, games) {
            if(err) {
                reject(err);
            } else {
                resolve(games.map(function createGame(game) {
                    return Game.create(game.toObject());
                }));
            }
        });
    });
};

GameRepository.prototype.save = function save(game) {
    return q.Promise(function(resolve, reject) {
        if(!game._id) {
            var model = new GameModel(game);
            model.save(function(err) {
                return err ? reject(err) : resolve();
            });
        } else {
            GameModel.update({ _id: game._id }, game, function(err) {
                return err ? reject(err) : resolve();
            });
        }
    });
};

module.exports = new GameRepository();