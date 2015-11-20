'use strict';

var assert = require('assert'),
    fs = require('fs'),
    q = require('q'),
    Game = require('../../application/domain/game/game'),
    GameModel = require('./model/game_model');

function GameRepository() {}

GameRepository.prototype.findGamesWithoutStats = function findGamesWithoutStats(options) {
    var criteria = { stats: { $exists: false } };
    return this._findWithCriteria(criteria, options);
};

GameRepository.prototype.findOneByEid = function findOneByEid(eid) {
    return this._findOneWithCriteria({ eid: eid });
};

GameRepository.prototype._findOneWithCriteria = function _findOneWithCriteria(criteria) {
    return this._findWithCriteria(criteria, {})
        .then(function reduceToOne(games) {
            assert(games.length <= 1, 'Found multiple Games with criteria "' + JSON.stringify(criteria) + '"');
            assert(games.length != 0, 'Could not find a Game matching "' + JSON.stringify(criteria) + '"');
            return games[0];
        });
};

GameRepository.prototype.findAllWithBuilder = function findAllWithBuilder(queryBuilder, options) {
    return this._findWithCriteria(queryBuilder.build(), options);
};

GameRepository.prototype.findAll = function findAll(options) {
    return this._findWithCriteria({}, options);
};

function createGameFromDoc(doc) {
    return Game.create(doc.toObject());
}

GameRepository.prototype._findWithCriteria = function _findWithCriteria(criteria, options) {
    return q.Promise(function(resolve, reject) {
        var stream,
            query = GameModel.find(criteria).batchSize(10);

        if(options.stream) {
            stream = query.stream({ transform: createGameFromDoc});
            resolve(stream);
        } else {
            query.exec(function (err, games) {
                if (err) {
                    reject(err);
                } else {
                    resolve(games.map(createGameFromDoc));
                }
            });
        }
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