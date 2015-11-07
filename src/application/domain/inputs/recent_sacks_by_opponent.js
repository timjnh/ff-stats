'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    playerRepository = require('../../../port/player/player_repository');

function RecentSacksByOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentSacksByOpponent.prototype = _.create(Input.prototype, { constructor: RecentSacksByOpponent });

RecentSacksByOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentSacksByOpponent.prototype.evaluate = function evaluate(player, playerGame) {
    var _this = this;

    return playerRepository.findOneByNameAndTeam(playerGame.opponent, playerGame.opponent)
        .then(function calculatePrecedingSacksByTeam(opposingTeam) {
            var precedingOpponentGames = opposingTeam.findPrecedingGames(playerGame, _this.gamesToConsider),
                precedingSacks = precedingOpponentGames.map(function getSacks(game) {
                    return Math.min(1, game.stats.sacks / 6);
                });

            return _this.padWithAverage(precedingSacks, _this.gamesToConsider);
        });
};

module.exports = RecentSacksByOpponent;