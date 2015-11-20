'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    topTargetService = require('../top_target_service');

function TopTargetOut() {
    Input.call(this);

    this.weeksToConsider = 16;
}
TopTargetOut.prototype = _.create(Input.prototype, { constructor: TopTargetOut });

TopTargetOut.prototype.evaluate = function evaluate(player, game) {
    return topTargetService.getTopFiveTargetsOfPlayerForPrecedingGames(player, game, this.weeksToConsider)
        .then(function calculateTopTargetOutPercentage(topTargets) {
            var injuredTopTargetCount = topTargets.reduce(function incrementInjury(count, player) {
                var injury = player.injuries.findByWeekAndYear(game.week, game.year)
                return count + (injury && !injury.played ? 1 : 0);
            }, 0);

            return injuredTopTargetCount / 5;
        });
};

module.exports = TopTargetOut;