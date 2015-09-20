'use strict';

var _ = require('underscore'),
    q = require('q'),
    Input = require('./Input'),
    gameRepository = require('../../port/game/GameRepository');

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
            return ((currentGame.date.getTime() - precedingGame.date.getTime()) / 86400000) / 365;
        });
};

module.exports = DaysOff;