'use strict';

var _ = require('underscore'),
    Input = require('./input');

function WeekOfYear() {
    Input.call(this);
}
WeekOfYear.prototype = _.create(Input.prototype, { constructor: WeekOfYear });

WeekOfYear.prototype.evaluate = function evaluate(player, game) {
    return game.week / 17;
};

module.exports = WeekOfYear;