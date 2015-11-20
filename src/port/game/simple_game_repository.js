'use strict';

var q = require('q'),
    SimpleGame = require('../../application/domain/game/simple_game'),
    GameModel = require('./model/game_model');

function SimpleGameRepository() {
    this.gameCache = {};
}

SimpleGameRepository.prototype.findOrderedGamesForTeam = function findOrderedGamesForTeam(team) {
    var _this = this;

    return q.Promise(function(resolve, reject) {
        if(_this.gameCache.hasOwnProperty(team)) {
            resolve(_this.gameCache[team]);
        } else {
            GameModel.find({$or: [{home: team}, {away: team}]}, SimpleGame.getAttributeNames().join(' '))
                .sort({year: 1, week: 1})
                .exec(function (err, games) {
                    if (err) {
                        reject(err);
                    } else {
                        _this.gameCache[team] = games.map(function convertDocsToModels(doc) {
                            return SimpleGame.create(doc.toObject());
                        });

                        resolve(_this.gameCache[team]);
                    }
                });
        }
    });
};

module.exports = new SimpleGameRepository();