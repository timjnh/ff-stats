'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    playerRepository = require('../../../port/player/player_repository');

function RecentPassingYardsAllowedByOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentPassingYardsAllowedByOpponent.prototype = _.create(Input.prototype, { constructor: RecentPassingYardsAllowedByOpponent });

RecentPassingYardsAllowedByOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentPassingYardsAllowedByOpponent.prototype.evaluate = function evaluate(player, playerGame) {
    var _this = this;

    return playerRepository.findOneByNameAndTeam(playerGame.opponent, playerGame.opponent)
        .then(function calculatePrecedingYardsAllowedForTeam(opposingTeam) {
            var precedingOpponentGames = opposingTeam.findPrecedingGames(playerGame, _this.gamesToConsider),
                precedingOpponentYardsAllowed = precedingOpponentGames.map(function getPassingYardsAllowed(game) {
                    return Math.min(1, game.stats.passingYardsAllowed / 400);
                });

            return _this.padWithAverage(precedingOpponentYardsAllowed, _this.gamesToConsider);
        });
};

module.exports = RecentPassingYardsAllowedByOpponent;