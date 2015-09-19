'use strict';

var assert = require('assert');

function Input() {}

Input.prototype.evaluate = function evaluate(player, game) {
    throw this.constructor.name + '.evaluate has not been implemented!';
};

module.exports = Input;