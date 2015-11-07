'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    playerRepository = require('../../../port/player/player_repository');

function RecentRushingTouchdownsAllowedByOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentRushingTouchdownsAllowedByOpponent.prototype = _.create(Input.prototype, { constructor: RecentRushingTouchdownsAllowedByOpponent });

RecentRushingTouchdownsAllowedByOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentRushingTouchdownsAllowedByOpponent.prototype.evaluate = function evaluate(player, playerGame) {
    var _this = this;

    return playerRepository.findOneByNameAndTeam(playerGame.opponent, playerGame.opponent)
        .then(function calculatePrecedingTouchdownsAllowedForTeam(opposingTeam) {
            var precedingOpponentGames = opposingTeam.findPrecedingGames(playerGame, _this.gamesToConsider),
                precedingOpponentTouchdownsAllowed = precedingOpponentGames.map(function getRushingTouchdownsAllowed(game) {
                    return Math.min(1, game.stats.rushingTDsAllowed / 6);
                });

            return _this.padWithAverage(precedingOpponentTouchdownsAllowed, _this.gamesToConsider);
        });
};

module.exports = RecentRushingTouchdownsAllowedByOpponent;