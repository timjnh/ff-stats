'use strict';

var _ = require('underscore'),
    Input = require('./input');

function OutDueToInjury() {
    Input.call(this);
}
OutDueToInjury.prototype = _.create(Input.prototype, { constructor: OutDueToInjury });

OutDueToInjury.prototype.evaluate = function evaluate(player, game) {
    var injury = player.injuries.findByWeekAndYear(game.week, game.year);
    return injury && !injury.played ? 1 : 0;
};

module.exports = OutDueToInjury;