'use strict';

var _ = require('underscore'),
    q = require('q'),
    Input = require('./input'),
    gameRepository = require('../../../port/game/game_repository');

function DaysOff() {
    Input.call(this);
}
DaysOff.prototype = _.create(Input.prototype, { constructor: DaysOff });

DaysOff.prototype.evaluate = function evaluate(player, game) {
    var precedingGames = player.findPrecedingGames(game, 1);

    if(precedingGames.length == 0) {
        return 0;
    }

    return q.all([gameRepository.findOneByEid(precedingGames[0].eid), gameRepository.findOneByEid(game.eid)])
        .spread(function calculateDaysOff(precedingGame, currentGame) {
            // maximum value corresponds to two weeks off
            return Math.min(((currentGame.date.getTime() - precedingGame.date.getTime()) / 86400000) / 14, 1);
        });
};

module.exports = DaysOff;