'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    playerRepository = require('../../../port/player/player_repository');

function RecentRushingYardsAllowedByOpponent(gamesToConsider) {
    Input.call(this);

    this.gamesToConsider = gamesToConsider;
}
RecentRushingYardsAllowedByOpponent.prototype = _.create(Input.prototype, { constructor: RecentRushingYardsAllowedByOpponent });

RecentRushingYardsAllowedByOpponent.prototype.getName = function getName() {
    return this.constructor.name + this.gamesToConsider;
};

RecentRushingYardsAllowedByOpponent.prototype.evaluate = function evaluate(player, playerGame) {
    var _this = this;

    return playerRepository.findOneByNameAndTeam(playerGame.opponent, playerGame.opponent)
        .then(function calculatePrecedingYardsAllowedForTeam(opposingTeam) {
            var precedingOpponentGames = opposingTeam.findPrecedingGames(playerGame, _this.gamesToConsider),
                precedingOpponentYardsAllowed = precedingOpponentGames.map(function getRushingYardsAllowed(game) {
                    return Math.min(1, game.stats.rushingYardsAllowed / 400);
                });

            return _this.padWithAverage(precedingOpponentYardsAllowed, _this.gamesToConsider);
        });
};

module.exports = RecentRushingYardsAllowedByOpponent;