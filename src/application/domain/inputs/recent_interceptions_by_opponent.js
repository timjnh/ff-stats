'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    playerRepository = require('../../../port/player/player_repository');

function RecentInterceptionsByOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentInterceptionsByOpponent.prototype = _.create(Input.prototype, { constructor: RecentInterceptionsByOpponent });

RecentInterceptionsByOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentInterceptionsByOpponent.prototype.evaluate = function evaluate(player, playerGame) {
    var _this = this;

    return playerRepository.findOneByNameAndTeam(playerGame.opponent, playerGame.opponent)
        .then(function calculatePrecedingInterceptionsByTeam(opposingTeam) {
            var precedingOpponentGames = opposingTeam.findPrecedingGames(playerGame, _this.gamesToConsider),
                precedingInterceptions = precedingOpponentGames.map(function getInterceptions(game) {
                    return Math.min(1, game.stats.interceptions / 4);
                });

            return _this.padWithAverage(precedingInterceptions, _this.gamesToConsider);
        });
};

module.exports = RecentInterceptionsByOpponent;