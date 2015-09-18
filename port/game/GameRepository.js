'use strict';

var fs = require('fs'),
    q = require('q'),
    Game = require('../../domain/Game'),
    GameModel = require('./model/GameModel');

function GameRepository() {}

GameRepository.prototype.findGamesWithoutStats = function findGamesWithoutStats() {
    var criteria = { stats: { $exists: false } };

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