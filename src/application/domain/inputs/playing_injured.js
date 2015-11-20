'use strict';

var _ = require('underscore'),
    Input = require('./input');

function PlayingInjured() {
    Input.call(this);
}
PlayingInjured.prototype = _.create(Input.prototype, { constructor: PlayingInjured });

PlayingInjured.prototype.evaluate = function evaluate(player, game) {
    var injury = player.injuries.findByWeekAndYear(game.week, game.year);
    return injury && injury.played ? 1 : 0;
};

module.exports = PlayingInjured;