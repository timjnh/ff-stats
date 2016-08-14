'use strict';

var _ = require('underscore'),
    Input = require('./input'),
    topToucherService = require('../top_toucher_service');

function TopToucherOut() {
    Input.call(this);

    this.weeksToConsider = 16;
}
TopToucherOut.prototype = _.create(Input.prototype, { constructor: TopToucherOut });

TopToucherOut.prototype.evaluate = function evaluate(player, game) {
    return topToucherService.getTopFiveTouchersOfPlayerForPrecedingGames(player, game, this.weeksToConsider)
        .then(function calculateTopToucherOutPercentage(topTouchers) {
            var injuredTopToucherCount = topTouchers.reduce(function incrementInjury(count, player) {
                var injury = player.injuries.findByWeekAndYear(game.week, game.year)
                return count + (injury && !injury.played ? 1 : 0);
            }, 0);

            return injuredTopToucherCount / 5;
        });
};

module.exports = TopToucherOut;