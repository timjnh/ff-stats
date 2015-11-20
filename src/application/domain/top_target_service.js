'use strict';

module.exports = (function() {

    var _ = require('underscore'),
        playerRepository = require('../../port/player/player_repository'),
        PlayerPosition = require('./player/player_position');

    function TopTargetService() {}

    TopTargetService.prototype.getTopFiveTargetsOfPlayerForPrecedingGames = function getTopFiveTargetsOfPlayerForPrecedingGames(player, playerGame, weeksToConsider) {
        var targets = [];

        return playerRepository.findAllByTeamAndPosition(player.team, PlayerPosition.WR)
            .then(function calculateTopTargets(potentialTargets) {

                potentialTargets.forEach(function countTargets(target) {
                    var precedingGames = target.findPrecedingGames(playerGame, weeksToConsider);

                    targets.push({
                        player: target,
                        targets: precedingGames.reduce(function (totalTargets, game) {
                            return totalTargets + game.getStat('targets');
                        }, 0)
                    });
                });

                targets = _.sortBy(targets, 'targets');

                return _.pluck(targets.slice(0, 5), 'player');
            });
    };

    return new TopTargetService();
})();