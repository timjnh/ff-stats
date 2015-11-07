'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    playerRepository = require('../../../port/player/player_repository');

function RecentPassingTouchdownsAllowedByOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentPassingTouchdownsAllowedByOpponent.prototype = _.create(Input.prototype, { constructor: RecentPassingTouchdownsAllowedByOpponent });

RecentPassingTouchdownsAllowedByOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentPassingTouchdownsAllowedByOpponent.prototype.evaluate = function evaluate(player, playerGame) {
    var _this = this;

    return playerRepository.findOneByNameAndTeam(playerGame.opponent, playerGame.opponent)
        .then(function calculatePrecedingTouchdownsAllowedForTeam(opposingTeam) {
            var precedingOpponentGames = opposingTeam.findPrecedingGames(playerGame, _this.gamesToConsider),
                precedingOpponentTouchdownsAllowed = precedingOpponentGames.map(function getPassingTouchdownsAllowed(game) {
                    return Math.min(1, game.stats.passingTDsAllowed / 6);
                });

            return _this.padWithAverage(precedingOpponentTouchdownsAllowed, _this.gamesToConsider);
        });
};

module.exports = RecentPassingTouchdownsAllowedByOpponent;