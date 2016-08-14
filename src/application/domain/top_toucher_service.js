'use strict';

var _ = require('underscore'),
    playerRepository = require('../../port/player/player_repository'),
    PlayerPosition = require('./player/player_position');

function TopToucherService() {}

TopToucherService.prototype.getTopFiveTouchersOfPlayerForPrecedingGames = function getTopFiveTouchersOfPlayerForPrecedingGames(player, playerGame, weeksToConsider) {
    return playerRepository.findAllByTeamAndPosition(player.team, PlayerPosition.RB)
        .then(function calculateTopTouchers(potentialTouchers) {
            var touches = [];

            potentialTouchers.forEach(function countTouches(toucher) {
                var precedingGames = toucher.findPrecedingGames(playerGame, weeksToConsider);

                touches.push({
                    player: toucher,
                    touches: precedingGames.reduce(function (totalTouches, game) {
                        return totalTouches + game.getStat('touches');
                    }, 0)
                });
            });

            touches = _.sortBy(touches, 'touches');

            return _.pluck(touches.slice(0, 5), 'player');
        });
};

module.exports = new TopToucherService();